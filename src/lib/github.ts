import {
  scanContent,
  SENSITIVE_FILES,
  SKIP_EXTENSIONS,
  SKIP_PATHS,
  REQUIRED_GITIGNORE_ENTRIES,
  calculateScore,
  getGrade,
  type ScanReport,
  type ScanFinding,
  type GitignoreAnalysis,
  type HistoryLeak,
} from './scanner'

const GITHUB_API = 'https://api.github.com'
const MAX_FILES = 200
const MAX_FILE_SIZE = 200000 // 200KB

interface GithubTreeItem {
  path: string
  type: string
  size?: number
  sha: string
  url: string
}

interface GithubCommit {
  sha: string
  commit: { message: string }
  files?: Array<{ filename: string; patch?: string }>
}

export async function scanRepository(
  repoUrl: string,
  githubToken?: string
): Promise<ScanReport> {
  const { owner, repo } = parseGithubUrl(repoUrl)

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`
  }

  const fetchOpts = { headers }

  // 1. Get repo info
  const repoInfo = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}`, fetchOpts)
  if (repoInfo.message === 'Not Found') {
    throw new Error(`Repository ${owner}/${repo} not found or is private`)
  }

  // 2. Get full file tree
  const treeRes = await fetchJson(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    fetchOpts
  )

  const allFiles: GithubTreeItem[] = (treeRes.tree || []).filter(
    (f: GithubTreeItem) => f.type === 'blob'
  )

  // 3. Check for sensitive files in tree
  const sensitiveFilesFound: string[] = []
  for (const file of allFiles) {
    for (const sf of SENSITIVE_FILES) {
      const filename = file.path.split('/').pop() || ''
      if (sf.pattern.test(filename) || sf.pattern.test(file.path)) {
        sensitiveFilesFound.push(file.path)
      }
    }
  }

  // 4. Analyze .gitignore
  const gitignoreAnalysis = await analyzeGitignore(owner, repo, fetchOpts)

  // 5. Scan file contents (skip binary/large files)
  const filesToScan = allFiles
    .filter((f) => {
      const ext = '.' + f.path.split('.').pop()?.toLowerCase()
      const shouldSkipExt = SKIP_EXTENSIONS.includes(ext)
      const shouldSkipPath = SKIP_PATHS.some((p) => f.path.includes(p))
      const tooLarge = (f.size || 0) > MAX_FILE_SIZE
      return !shouldSkipExt && !shouldSkipPath && !tooLarge
    })
    .slice(0, MAX_FILES)

  const allFindings: ScanFinding[] = []

  // Process files in batches
  const BATCH_SIZE = 10
  for (let i = 0; i < filesToScan.length; i += BATCH_SIZE) {
    const batch = filesToScan.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path, fetchOpts)
        if (content) {
          return scanContent(content, file.path)
        }
        return []
      })
    )
    for (const r of results) {
      if (r.status === 'fulfilled') {
        allFindings.push(...r.value)
      }
    }
  }

  // 6. Scan recent commit history
  const commitLeaks = await scanCommitHistory(owner, repo, fetchOpts)

  // 7. Calculate score
  const score = calculateScore(allFindings, sensitiveFilesFound)
  const grade = getGrade(score)

  const summary = {
    critical: allFindings.filter((f) => f.severity === 'critical').length,
    high: allFindings.filter((f) => f.severity === 'high').length,
    medium: allFindings.filter((f) => f.severity === 'medium').length,
    low: allFindings.filter((f) => f.severity === 'low').length,
    total: allFindings.length,
  }

  return {
    repoUrl,
    owner,
    repo,
    scannedAt: new Date().toISOString(),
    totalFiles: filesToScan.length,
    findings: allFindings,
    sensitiveFiles: sensitiveFilesFound,
    missingGitignoreEntries: gitignoreAnalysis.missingEntries,
    score,
    grade,
    summary,
    gitignoreAnalysis,
    commitHistoryLeaks: commitLeaks,
  }
}

async function analyzeGitignore(
  owner: string,
  repo: string,
  fetchOpts: RequestInit
): Promise<GitignoreAnalysis> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/.gitignore`,
      fetchOpts
    )
    if (!res.ok) {
      return {
        exists: false,
        missingEntries: REQUIRED_GITIGNORE_ENTRIES,
        presentEntries: [],
      }
    }
    const data = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    const lines = content.split('\n').map((l: string) => l.trim())

    const presentEntries: string[] = []
    const missingEntries: string[] = []

    for (const required of REQUIRED_GITIGNORE_ENTRIES) {
      if (lines.some((l: string) => l === required || l.startsWith(required))) {
        presentEntries.push(required)
      } else {
        missingEntries.push(required)
      }
    }

    return { exists: true, missingEntries, presentEntries }
  } catch {
    return {
      exists: false,
      missingEntries: REQUIRED_GITIGNORE_ENTRIES,
      presentEntries: [],
    }
  }
}

async function scanCommitHistory(
  owner: string,
  repo: string,
  fetchOpts: RequestInit
): Promise<HistoryLeak[]> {
  const leaks: HistoryLeak[] = []
  try {
    const commits: GithubCommit[] = await fetchJson(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=20`,
      fetchOpts
    )
    if (!Array.isArray(commits)) return leaks

    // Check last 5 commits in detail
    for (const commit of commits.slice(0, 5)) {
      const detail: GithubCommit = await fetchJson(
        `${GITHUB_API}/repos/${owner}/${repo}/commits/${commit.sha}`,
        fetchOpts
      )
      if (!detail.files) continue

      for (const file of detail.files) {
        if (!file.patch) continue
        const findings = scanContent(file.patch, file.filename)
        for (const f of findings) {
          leaks.push({
            commitSha: commit.sha.substring(0, 7),
            commitMessage: commit.commit.message.split('\n')[0].substring(0, 60),
            file: file.filename,
            finding: f.name,
          })
        }
      }
    }
  } catch {
    // History scanning is best-effort
  }
  return leaks
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  fetchOpts: RequestInit
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`,
      { headers: (fetchOpts as any).headers }
    )
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchJson(url: string, opts: RequestInit) {
  const res = await fetch(url, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export function parseGithubUrl(url: string): { owner: string; repo: string } {
  const cleaned = url
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')

  const parts = cleaned.split('/')
  if (parts.length < 2) {
    throw new Error('Invalid GitHub URL. Format: https://github.com/owner/repo')
  }

  return { owner: parts[0], repo: parts[1] }
}
