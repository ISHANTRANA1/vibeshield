'use client'

import { useState, useRef, useEffect } from 'react'
import type { ScanReport, ScanFinding } from '@/lib/scanner'
import ResultsDashboard from '@/components/ResultsDashboard'

const EXAMPLE_REPOS = [
  'https://github.com/vercel/next.js',
  'https://github.com/facebook/react',
  'https://github.com/tailwindlabs/tailwindcss',
]

const SCAN_STEPS = [
  'Connecting to GitHub API...',
  'Fetching repository tree...',
  'Analyzing file structure...',
  'Scanning source files for secrets...',
  'Checking .gitignore configuration...',
  'Scanning commit history...',
  'Calculating security score...',
  'Generating report...',
]

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [report, setReport] = useState<ScanReport | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setScanStep(prev => Math.min(prev + 1, SCAN_STEPS.length - 1))
      }, 600)
      return () => clearInterval(interval)
    } else {
      setScanStep(0)
    }
  }, [scanning])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    setScanning(true)
    setReport(null)
    setError('')

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), githubToken: githubToken.trim() || undefined }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Scan failed')
      }

      setReport(data.report)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setScanning(false)
    }
  }

  const handleReset = () => {
    setReport(null)
    setError('')
    setRepoUrl('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  if (report) {
    return <ResultsDashboard report={report} onReset={handleReset} />
  }

  return (
    <main className="min-h-screen grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5C11.5 14.5 14 11.5 14 8V4L8 1z" 
                fill="#0a0a0f" stroke="#0a0a0f" strokeWidth="0.5"/>
              <path d="M6 8l1.5 1.5L10.5 6" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-[var(--text)]">VibeShield</span>
          <span className="text-xs bg-[var(--border)] text-[var(--dim)] px-2 py-0.5 rounded font-mono">v1.0</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--dim)]">
          <span className="hidden sm:block">GitHub Security Scanner</span>
          <a 
            href="https://github.com" 
            target="_blank"
            className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
          {/* Badge */}
          <div className="fade-up fade-up-delay-1 inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-1.5 text-sm text-[var(--dim)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse inline-block"/>
            Built for vibe coders — protect your repos
          </div>

          {/* Title */}
          <h1 className="fade-up fade-up-delay-2 font-display font-extrabold text-5xl sm:text-7xl leading-none mb-4 tracking-tight">
            Is your repo
            <br />
            <span className="text-[var(--accent)] glow-accent">actually safe?</span>
          </h1>

          <p className="fade-up fade-up-delay-3 text-[var(--dim)] text-lg max-w-lg mb-10 font-light leading-relaxed">
            Scan any public GitHub repo for exposed API keys, database credentials, 
            and sensitive files. Get a full security report in seconds.
          </p>

          {/* Scanner Form */}
          <div className="fade-up fade-up-delay-4 w-full">
            <form onSubmit={handleScan} className="space-y-3">
              {/* Main URL input */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#00aaff] opacity-0 group-focus-within:opacity-20 transition-opacity blur-sm -z-10"/>
                <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--accent)] transition-colors">
                  {/* GitHub icon */}
                  <div className="pl-4 pr-3 text-[var(--dim)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="url"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-transparent py-4 pr-4 text-[var(--text)] placeholder-[var(--muted)] outline-none font-mono text-sm"
                    disabled={scanning}
                    required
                  />
                  <button
                    type="submit"
                    disabled={scanning || !repoUrl.trim()}
                    className="mx-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg)] font-display font-bold text-sm rounded-lg disabled:opacity-40 hover:bg-[#00ee77] transition-colors whitespace-nowrap"
                  >
                    {scanning ? 'Scanning...' : 'Scan Repo →'}
                  </button>
                </div>
              </div>

              {/* Optional GitHub token */}
              <details className="text-left">
                <summary className="text-xs text-[var(--dim)] cursor-pointer hover:text-[var(--text)] transition-colors select-none">
                  + Add GitHub token (optional, for higher API limits)
                </summary>
                <div className="mt-2 relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={githubToken}
                    onChange={e => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--dim)] placeholder-[var(--muted)] outline-none focus:border-[var(--muted)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--dim)] text-xs"
                  >
                    {showToken ? 'hide' : 'show'}
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">Token stays in your browser. Never sent to any server except GitHub API.</p>
              </details>
            </form>

            {/* Example repos */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="text-xs text-[var(--muted)]">Try:</span>
              {EXAMPLE_REPOS.map(url => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  className="text-xs text-[var(--dim)] hover:text-[var(--accent)] transition-colors font-mono"
                >
                  {url.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 w-full bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-[var(--danger)] text-lg">⚠</span>
                <div>
                  <p className="text-[var(--danger)] font-medium text-sm">Scan Failed</p>
                  <p className="text-[var(--dim)] text-sm mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scanning state */}
          {scanning && (
            <div className="mt-6 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden">
              <div className="scan-overlay">
                <div className="scan-line" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="font-mono text-sm text-[var(--accent)]">Scanning in progress</span>
                </div>
                <div className="space-y-2">
                  {SCAN_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm font-mono transition-all duration-300 ${i <= scanStep ? 'opacity-100' : 'opacity-20'}`}>
                      {i < scanStep ? (
                        <span className="text-[var(--accent)] text-xs">✓</span>
                      ) : i === scanStep ? (
                        <span className="text-[var(--warn)] text-xs animate-pulse">▶</span>
                      ) : (
                        <span className="text-[var(--muted)] text-xs">○</span>
                      )}
                      <span className={i === scanStep ? 'text-[var(--warn)]' : i < scanStep ? 'text-[var(--dim)]' : 'text-[var(--muted)]'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: '🔑', label: 'API Key Detection', desc: '20+ secret patterns' },
            { icon: '🗄️', label: 'DB Credential Scan', desc: 'MongoDB, MySQL, PG' },
            { icon: '📜', label: 'History Scan', desc: 'Last 20 commits' },
            { icon: '📊', label: 'Security Score', desc: 'A–F grade report' },
          ].map(f => (
            <div key={f.label} className="text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-medium text-[var(--text)]">{f.label}</div>
              <div className="text-xs text-[var(--dim)] mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
        VibeShield — Open source GitHub security scanner for vibe coders.{' '}
        <span className="text-[var(--dim)]">Only scans public repositories.</span>
      </footer>
    </main>
  )
}
