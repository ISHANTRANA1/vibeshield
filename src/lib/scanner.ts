export interface SecretPattern {
  id: string
  name: string
  description: string
  pattern: RegExp
  severity: 'critical' | 'high' | 'medium' | 'low'
  fix: string
  category: string
}

export interface ScanFinding {
  patternId: string
  name: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line?: number
  match: string
  fix: string
  category: string
}

export interface FileScanResult {
  path: string
  findings: ScanFinding[]
  isSensitiveFile: boolean
  shouldBeGitignored: boolean
}

export interface ScanReport {
  repoUrl: string
  owner: string
  repo: string
  scannedAt: string
  totalFiles: number
  findings: ScanFinding[]
  sensitiveFiles: string[]
  missingGitignoreEntries: string[]
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    total: number
  }
  gitignoreAnalysis: GitignoreAnalysis
  commitHistoryLeaks: HistoryLeak[]
}

export interface GitignoreAnalysis {
  exists: boolean
  missingEntries: string[]
  presentEntries: string[]
}

export interface HistoryLeak {
  commitSha: string
  commitMessage: string
  file: string
  finding: string
}

// ─── Secret Patterns ──────────────────────────────────────────────────────────
export const SECRET_PATTERNS: SecretPattern[] = [
  // Anthropic
  {
    id: 'anthropic_key',
    name: 'Anthropic API Key',
    description: 'Anthropic/Claude API key exposed',
    pattern: /sk-ant-[a-zA-Z0-9\-_]{20,}/g,
    severity: 'critical',
    fix: 'Remove from code, add to .env file, rotate key at console.anthropic.com',
    category: 'AI Keys',
  },
  // OpenAI
  {
    id: 'openai_key',
    name: 'OpenAI API Key',
    description: 'OpenAI API key exposed in code',
    pattern: /sk-[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    fix: 'Remove from code, add to .env file, rotate key at platform.openai.com',
    category: 'AI Keys',
  },
  // Google AI / Gemini
  {
    id: 'google_api_key',
    name: 'Google API Key',
    description: 'Google/Gemini API key exposed',
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
    severity: 'critical',
    fix: 'Remove from code, add to .env, rotate at console.cloud.google.com',
    category: 'AI Keys',
  },
  // MongoDB URI with credentials
  {
    id: 'mongodb_uri',
    name: 'MongoDB Connection String',
    description: 'MongoDB URI with username/password exposed',
    pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\s"'`]+/gi,
    severity: 'critical',
    fix: 'Move to .env as MONGODB_URI, rotate database password immediately',
    category: 'Database',
  },
  // MySQL / PostgreSQL connection strings
  {
    id: 'db_connection',
    name: 'Database Connection String',
    description: 'Database URL with credentials exposed',
    pattern: /(mysql|postgres|postgresql):\/\/[^:]+:[^@]+@[^\s"'`]+/gi,
    severity: 'critical',
    fix: 'Move to .env as DATABASE_URL, rotate credentials immediately',
    category: 'Database',
  },
  // AWS Access Key
  {
    id: 'aws_access_key',
    name: 'AWS Access Key ID',
    description: 'Amazon Web Services access key exposed',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical',
    fix: 'Rotate immediately at AWS IAM console, move to .env',
    category: 'Cloud',
  },
  // AWS Secret Key
  {
    id: 'aws_secret_key',
    name: 'AWS Secret Access Key',
    description: 'Amazon Web Services secret key exposed',
    pattern: /[a-zA-Z0-9/+=]{40}(?=.*[A-Z])(?=.*[0-9])/g,
    severity: 'critical',
    fix: 'Rotate immediately at AWS IAM console, move to .env',
    category: 'Cloud',
  },
  // GitHub Personal Access Token
  {
    id: 'github_token',
    name: 'GitHub Personal Access Token',
    description: 'GitHub PAT token exposed',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    fix: 'Revoke at github.com/settings/tokens, move to .env',
    category: 'Version Control',
  },
  // GitHub OAuth token
  {
    id: 'github_oauth',
    name: 'GitHub OAuth Token',
    description: 'GitHub OAuth token exposed',
    pattern: /gho_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    fix: 'Revoke at github.com/settings/tokens, move to .env',
    category: 'Version Control',
  },
  // Stripe Secret Key
  {
    id: 'stripe_secret',
    name: 'Stripe Secret Key',
    description: 'Stripe payment secret key exposed — financial risk!',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'critical',
    fix: 'Rotate immediately at dashboard.stripe.com, move to .env',
    category: 'Payments',
  },
  // Stripe Publishable Key (medium - public but still bad practice)
  {
    id: 'stripe_publishable',
    name: 'Stripe Publishable Key',
    description: 'Stripe publishable key in code (lower risk but bad practice)',
    pattern: /pk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'medium',
    fix: 'Move to environment variable NEXT_PUBLIC_STRIPE_KEY',
    category: 'Payments',
  },
  // Firebase Config
  {
    id: 'firebase_config',
    name: 'Firebase API Key',
    description: 'Firebase configuration key exposed',
    pattern: /["']apiKey["']\s*:\s*["'][A-Za-z0-9\-_]{20,}["']/g,
    severity: 'high',
    fix: 'Use Firebase Security Rules, move sensitive config to .env',
    category: 'Firebase',
  },
  // Supabase key
  {
    id: 'supabase_key',
    name: 'Supabase Service Role Key',
    description: 'Supabase service role key (full DB access) exposed',
    pattern: /eyJ[a-zA-Z0-9_-]{100,}/g,
    severity: 'critical',
    fix: 'Use anon key for frontend, move service key to server .env only',
    category: 'Database',
  },
  // JWT Secret
  {
    id: 'jwt_secret',
    name: 'JWT Secret',
    description: 'JWT signing secret hardcoded in code',
    pattern: /jwt[_-]?secret\s*[=:]\s*["'`][^"'`]{8,}["'`]/gi,
    severity: 'critical',
    fix: 'Move to .env as JWT_SECRET with a strong random value',
    category: 'Auth',
  },
  // Hardcoded password
  {
    id: 'hardcoded_password',
    name: 'Hardcoded Password',
    description: 'Password hardcoded directly in source code',
    pattern: /password\s*[=:]\s*["'`][^"'`\s]{6,}["'`]/gi,
    severity: 'high',
    fix: 'Move to .env as DB_PASSWORD or APP_PASSWORD',
    category: 'Credentials',
  },
  // Private Key / PEM
  {
    id: 'private_key',
    name: 'Private Key / Certificate',
    description: 'RSA/EC private key or certificate found in code',
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    fix: 'Never commit private keys. Remove, rotate, use key files outside repo',
    category: 'Cryptography',
  },
  // SendGrid API Key
  {
    id: 'sendgrid_key',
    name: 'SendGrid API Key',
    description: 'SendGrid email API key exposed',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: 'high',
    fix: 'Rotate at app.sendgrid.com, move to .env as SENDGRID_API_KEY',
    category: 'Email',
  },
  // Twilio
  {
    id: 'twilio_key',
    name: 'Twilio API Key',
    description: 'Twilio account SID or auth token exposed',
    pattern: /AC[a-z0-9]{32}/g,
    severity: 'high',
    fix: 'Rotate at console.twilio.com, move to .env',
    category: 'Communication',
  },
  // Vercel token
  {
    id: 'vercel_token',
    name: 'Vercel Token',
    description: 'Vercel deployment token exposed',
    pattern: /vercel[_-]?token\s*[=:]\s*["'`][a-zA-Z0-9]{20,}["'`]/gi,
    severity: 'high',
    fix: 'Rotate at vercel.com/account/tokens, move to .env',
    category: 'Deployment',
  },
  // Generic secret/key assignment
  {
    id: 'generic_secret',
    name: 'Potential Secret Assignment',
    description: 'Variable named "secret" or "api_key" with a value assigned',
    pattern: /(api_key|apikey|secret_key|secretkey|auth_token)\s*[=:]\s*["'`][^"'`\s]{10,}["'`]/gi,
    severity: 'medium',
    fix: 'Move sensitive values to .env file',
    category: 'Generic',
  },
]

// ─── Sensitive File Patterns ──────────────────────────────────────────────────
export const SENSITIVE_FILES = [
  { pattern: /^\.env$/, severity: 'critical' as const, description: 'Environment variables file with real secrets' },
  { pattern: /^\.env\.local$/, severity: 'critical' as const, description: 'Local environment file with real secrets' },
  { pattern: /^\.env\.production$/, severity: 'critical' as const, description: 'Production environment secrets' },
  { pattern: /^\.env\.development$/, severity: 'high' as const, description: 'Development environment secrets' },
  { pattern: /serviceAccountKey\.json$/, severity: 'critical' as const, description: 'Firebase service account credentials' },
  { pattern: /credentials\.json$/, severity: 'critical' as const, description: 'Google credentials file' },
  { pattern: /secrets\.json$/, severity: 'critical' as const, description: 'Secrets configuration file' },
  { pattern: /\.pem$/, severity: 'critical' as const, description: 'PEM certificate/key file' },
  { pattern: /\.key$/, severity: 'critical' as const, description: 'Private key file' },
  { pattern: /id_rsa$/, severity: 'critical' as const, description: 'SSH private key' },
  { pattern: /id_ed25519$/, severity: 'critical' as const, description: 'SSH private key' },
  { pattern: /\.p12$/, severity: 'critical' as const, description: 'PKCS12 certificate bundle' },
  { pattern: /config\.php$/, severity: 'medium' as const, description: 'PHP config (may contain DB creds)' },
  { pattern: /database\.yml$/, severity: 'medium' as const, description: 'Rails database config' },
  { pattern: /wp-config\.php$/, severity: 'critical' as const, description: 'WordPress config with DB credentials' },
]

// ─── Required .gitignore entries ─────────────────────────────────────────────
export const REQUIRED_GITIGNORE_ENTRIES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.env.*.local',
  'node_modules',
  '*.pem',
  '*.key',
  'serviceAccountKey.json',
  'credentials.json',
]

// ─── Files to skip during scanning ───────────────────────────────────────────
export const SKIP_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.mp3', '.wav',
  '.zip', '.tar', '.gz',
  '.lock', // package-lock, yarn.lock - too noisy
]

export const SKIP_PATHS = [
  'node_modules/',
  '.next/',
  'dist/',
  'build/',
  '.git/',
  'vendor/',
  '__pycache__/',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]

// ─── Scan content for secrets ─────────────────────────────────────────────────
export function scanContent(content: string, filePath: string): ScanFinding[] {
  const findings: ScanFinding[] = []
  const lines = content.split('\n')

  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags)
    let match

    while ((match = regex.exec(content)) !== null) {
      // Find line number
      const upToMatch = content.substring(0, match.index)
      const lineNumber = upToMatch.split('\n').length

      // Skip if it's a placeholder/example value
      const matchedValue = match[0]
      if (isPlaceholder(matchedValue)) continue

      // Mask the actual secret value
      const masked = maskSecret(matchedValue)

      findings.push({
        patternId: pattern.id,
        name: pattern.name,
        description: pattern.description,
        severity: pattern.severity,
        file: filePath,
        line: lineNumber,
        match: masked,
        fix: pattern.fix,
        category: pattern.category,
      })

      // Avoid duplicates in same file for same pattern
      break
    }
  }

  return findings
}

function isPlaceholder(value: string): boolean {
  const placeholders = [
    'your_api_key', 'your-api-key', 'YOUR_API_KEY',
    'xxxx', 'XXXX', '****', 'placeholder',
    'example', 'test', 'dummy', 'fake',
    'your_secret', 'YOUR_SECRET', 'changeme',
    'null', 'undefined', '""', "''",
    'localhost', '127.0.0.1',
  ]
  return placeholders.some(p => value.toLowerCase().includes(p.toLowerCase()))
}

function maskSecret(value: string): string {
  if (value.length <= 8) return '***'
  return value.substring(0, 6) + '...' + value.substring(value.length - 4)
}

// ─── Calculate security score ────────────────────────────────────────────────
export function calculateScore(findings: ScanFinding[], sensitiveFiles: string[]): number {
  let score = 100

  for (const f of findings) {
    if (f.severity === 'critical') score -= 25
    else if (f.severity === 'high') score -= 15
    else if (f.severity === 'medium') score -= 8
    else if (f.severity === 'low') score -= 3
  }

  score -= sensitiveFiles.length * 20

  return Math.max(0, score)
}

export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}
