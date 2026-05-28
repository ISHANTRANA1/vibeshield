'use client'

import { useState } from 'react'
import type { ScanReport, ScanFinding } from '@/lib/scanner'

const SEVERITY_COLORS = {
  critical: { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/10', border: 'border-[var(--danger)]/30', dot: 'bg-[var(--danger)]' },
  high: { text: 'text-[var(--warn)]', bg: 'bg-[var(--warn)]/10', border: 'border-[var(--warn)]/30', dot: 'bg-[var(--warn)]' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  low: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', dot: 'bg-blue-400' },
}

const GRADE_CONFIG = {
  A: { color: 'text-[var(--accent)]', glow: 'var(--accent)', label: 'Excellent', desc: 'Your repo looks safe!' },
  B: { color: 'text-blue-400', glow: '#60a5fa', label: 'Good', desc: 'Minor issues found' },
  C: { color: 'text-yellow-400', glow: '#facc15', label: 'Fair', desc: 'Some issues to fix' },
  D: { color: 'text-[var(--warn)]', glow: 'var(--warn)', label: 'Poor', desc: 'Serious issues found' },
  F: { color: 'text-[var(--danger)]', glow: 'var(--danger)', label: 'Danger', desc: 'Critical leaks detected!' },
}

export default function ResultsDashboard({ report, onReset }: { report: ScanReport; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<'findings' | 'files' | 'gitignore' | 'history'>('findings')
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [copiedBadge, setCopiedBadge] = useState(false)

  const grade = GRADE_CONFIG[report.grade]
  const hasCritical = report.summary.critical > 0
  const isClean = report.summary.total === 0 && report.sensitiveFiles.length === 0

  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (report.score / 100) * circumference

  const badgeMarkdown = `![VibeSafe](https://img.shields.io/badge/VibeSafe-${report.grade}%20(${report.score}%2F100)-${report.grade === 'A' ? '00ff88' : report.grade === 'F' ? 'ff3366' : 'ffaa00'}?style=flat&logo=shield)`

  const copyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown)
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  return (
    <main className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between sticky top-0 bg-[var(--bg)]/90 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5C11.5 14.5 14 11.5 14 8V4L8 1z" fill="#0a0a0f"/>
              <path d="M6 8l1.5 1.5L10.5 6" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg">VibeSafe</span>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-[var(--dim)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--muted)] rounded-lg px-4 py-2 transition-all"
        >
          ← Scan another repo
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Repo info bar */}
        <div className="fade-up flex items-center gap-3 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--dim)">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <a href={report.repoUrl} target="_blank" className="text-[var(--dim)] hover:text-[var(--accent)] font-mono transition-colors">
            {report.owner}/{report.repo}
          </a>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">{report.totalFiles} files scanned</span>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">{new Date(report.scannedAt).toLocaleTimeString()}</span>
        </div>

        {/* Score card */}
        <div className={`fade-up fade-up-delay-1 bg-[var(--surface)] border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 ${hasCritical ? 'border-[var(--danger)]/40 box-glow-danger' : isClean ? 'border-[var(--accent)]/40 box-glow-accent' : 'border-[var(--border)]'}`}>
          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="var(--border)" strokeWidth="8"/>
              <circle
                cx="60" cy="60" r="45"
                fill="none"
                stroke={grade.glow}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${grade.glow})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display font-extrabold text-4xl ${grade.color}`}>{report.grade}</span>
              <span className="text-[var(--dim)] text-xs font-mono">{report.score}/100</span>
            </div>
          </div>

          {/* Score details */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className={`font-display font-bold text-2xl ${grade.color}`}>{grade.label}</h2>
            <p className="text-[var(--dim)] mt-1">{grade.desc}</p>

            <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
              {report.summary.critical > 0 && (
                <div className="flex items-center gap-1.5 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--danger)]"/>
                  <span className="text-[var(--danger)] text-sm font-mono font-semibold">{report.summary.critical} critical</span>
                </div>
              )}
              {report.summary.high > 0 && (
                <div className="flex items-center gap-1.5 bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--warn)]"/>
                  <span className="text-[var(--warn)] text-sm font-mono font-semibold">{report.summary.high} high</span>
                </div>
              )}
              {report.summary.medium > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"/>
                  <span className="text-yellow-400 text-sm font-mono font-semibold">{report.summary.medium} medium</span>
                </div>
              )}
              {isClean && (
                <div className="flex items-center gap-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg px-3 py-1.5">
                  <span className="text-[var(--accent)] text-sm font-mono font-semibold">✓ No issues found</span>
                </div>
              )}
            </div>
          </div>

          {/* Badge copy */}
          <div className="flex-shrink-0 text-center">
            <p className="text-xs text-[var(--muted)] mb-2">Copy README badge</p>
            <button
              onClick={copyBadge}
              className="flex items-center gap-2 bg-[var(--border)] hover:bg-[var(--muted)]/30 border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--dim)] hover:text-[var(--text)] transition-all"
            >
              {copiedBadge ? '✓ Copied!' : '📋 Copy Badge'}
            </button>
            <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${isClean ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : hasCritical ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--warn)]/20 text-[var(--warn)]'}`}>
              VibeSafe {report.grade} ({report.score}/100)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="fade-up fade-up-delay-2 flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
          {[
            { id: 'findings', label: `Findings (${report.summary.total})` },
            { id: 'files', label: `Sensitive Files (${report.sensitiveFiles.length})` },
            { id: 'gitignore', label: `.gitignore` },
            { id: 'history', label: `History (${report.commitHistoryLeaks.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--border)] text-[var(--text)]'
                  : 'text-[var(--dim)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="fade-up fade-up-delay-3">
          {/* FINDINGS TAB */}
          {activeTab === 'findings' && (
            <div className="space-y-3">
              {report.findings.length === 0 ? (
                <EmptyState
                  icon="🎉"
                  title="No secrets found in source code!"
                  desc="We scanned your files and found no exposed API keys or credentials."
                />
              ) : (
                report.findings.map((finding, i) => {
                  const colors = SEVERITY_COLORS[finding.severity]
                  const key = `${finding.file}-${finding.patternId}`
                  const isExpanded = expandedFinding === key
                  return (
                    <div
                      key={key}
                      className={`bg-[var(--surface)] border rounded-xl overflow-hidden transition-all ${colors.border} cursor-pointer`}
                      onClick={() => setExpandedFinding(isExpanded ? null : key)}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-mono font-bold uppercase ${colors.text}`}>{finding.severity}</span>
                            <span className="text-[var(--text)] font-medium text-sm">{finding.name}</span>
                            <span className="text-xs bg-[var(--border)] text-[var(--dim)] px-2 py-0.5 rounded font-mono">{finding.category}</span>
                          </div>
                          <div className="text-xs text-[var(--dim)] font-mono mt-1 truncate">
                            {finding.file}{finding.line ? `:${finding.line}` : ''}
                          </div>
                        </div>
                        <span className="text-[var(--muted)] text-sm flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
                      </div>

                      {isExpanded && (
                        <div className={`border-t ${colors.border} p-4 space-y-3`}>
                          <div>
                            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">What we found</p>
                            <p className="text-sm text-[var(--dim)]">{finding.description}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Detected pattern</p>
                            <code className={`text-xs font-mono ${colors.text} bg-[var(--border)] px-2 py-1 rounded`}>{finding.match}</code>
                          </div>
                          <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
                            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">🔧 How to fix</p>
                            <p className="text-sm text-[var(--text)]">{finding.fix}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* SENSITIVE FILES TAB */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              {report.sensitiveFiles.length === 0 ? (
                <EmptyState icon="✅" title="No sensitive files found!" desc="No .env files or credential files are publicly accessible." />
              ) : (
                <>
                  <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4">
                    <p className="text-[var(--danger)] font-medium text-sm">⚠️ These files should NOT be in a public repository</p>
                    <p className="text-[var(--dim)] text-sm mt-1">They may contain passwords, API keys, and credentials visible to anyone.</p>
                  </div>
                  {report.sensitiveFiles.map(file => (
                    <div key={file} className="bg-[var(--surface)] border border-[var(--danger)]/30 rounded-xl p-4 flex items-center gap-3">
                      <span className="text-[var(--danger)]">🔴</span>
                      <div>
                        <code className="text-sm font-mono text-[var(--danger)]">{file}</code>
                        <p className="text-xs text-[var(--dim)] mt-0.5">This file is publicly visible. Remove it immediately and rotate all credentials it contained.</p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-sm font-mono text-[var(--accent)] mb-2">Quick fix — add to .gitignore:</p>
                    <pre className="text-xs font-mono text-[var(--dim)] bg-[var(--bg)] rounded-lg p-3 overflow-x-auto">
{report.sensitiveFiles.join('\n')}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}

          {/* GITIGNORE TAB */}
          {activeTab === 'gitignore' && (
            <div className="space-y-4">
              <div className={`bg-[var(--surface)] border rounded-xl p-5 ${report.gitignoreAnalysis.exists ? 'border-[var(--accent)]/30' : 'border-[var(--danger)]/30'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{report.gitignoreAnalysis.exists ? '✅' : '❌'}</span>
                  <div>
                    <p className="font-medium">{report.gitignoreAnalysis.exists ? '.gitignore file found' : '.gitignore file MISSING'}</p>
                    <p className="text-sm text-[var(--dim)] mt-0.5">
                      {report.gitignoreAnalysis.exists
                        ? `${report.gitignoreAnalysis.presentEntries.length} of ${report.gitignoreAnalysis.presentEntries.length + report.gitignoreAnalysis.missingEntries.length} recommended entries present`
                        : 'You have no .gitignore! Create one immediately.'}
                    </p>
                  </div>
                </div>
              </div>

              {report.gitignoreAnalysis.missingEntries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--warn)] mb-3">⚠️ Missing entries ({report.gitignoreAnalysis.missingEntries.length})</h3>
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-xs text-[var(--dim)] mb-3">Add these lines to your <code className="font-mono">.gitignore</code>:</p>
                    <pre className="text-sm font-mono text-[var(--accent)] bg-[var(--bg)] rounded-lg p-4 overflow-x-auto">
{report.gitignoreAnalysis.missingEntries.join('\n')}
                    </pre>
                  </div>
                </div>
              )}

              {report.gitignoreAnalysis.presentEntries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--accent)] mb-3">✓ Already covered ({report.gitignoreAnalysis.presentEntries.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.gitignoreAnalysis.presentEntries.map(e => (
                      <span key={e} className="text-xs font-mono bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-1 rounded">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {report.commitHistoryLeaks.length === 0 ? (
                <EmptyState icon="📜" title="No leaks in recent commit history" desc="Scanned last 20 commits — no secrets found in diffs." />
              ) : (
                <>
                  <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4">
                    <p className="text-[var(--danger)] font-medium text-sm">🚨 Secrets found in git history!</p>
                    <p className="text-[var(--dim)] text-sm mt-1">Even if deleted later, these are still accessible via git history to anyone who cloned your repo.</p>
                  </div>
                  {report.commitHistoryLeaks.map((leak, i) => (
                    <div key={i} className="bg-[var(--surface)] border border-[var(--warn)]/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-[var(--warn)]">⚠</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <code className="text-xs font-mono text-[var(--warn)] bg-[var(--border)] px-2 py-0.5 rounded">{leak.commitSha}</code>
                            <span className="text-xs text-[var(--dim)] truncate">{leak.commitMessage}</span>
                          </div>
                          <p className="text-sm text-[var(--text)]">{leak.finding}</p>
                          <p className="text-xs font-mono text-[var(--dim)] mt-1 truncate">{leak.file}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">🔧 How to purge git history</p>
                    <pre className="text-xs font-mono text-[var(--dim)] bg-[var(--bg)] rounded-lg p-3 overflow-x-auto">{`# Install git-filter-repo
pip install git-filter-repo

# Remove file from all history
git filter-repo --path .env --invert-paths

# Force push (DESTRUCTIVE - coordinate with team)
git push origin --force --all`}</pre>
                    <p className="text-xs text-[var(--danger)] mt-2">⚠️ Always rotate/revoke the exposed credentials first, regardless.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="font-display font-semibold text-[var(--text)] text-lg">{title}</p>
      <p className="text-[var(--dim)] text-sm mt-2">{desc}</p>
    </div>
  )
}
