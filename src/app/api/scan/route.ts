import { NextRequest, NextResponse } from 'next/server'
import { scanRepository } from '@/lib/github'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { repoUrl, githubToken } = body

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // Validate it's a GitHub URL
    if (!repoUrl.includes('github.com')) {
      return NextResponse.json({ error: 'Only GitHub repositories are supported' }, { status: 400 })
    }

    const report = await scanRepository(repoUrl, githubToken || process.env.GITHUB_TOKEN)

    return NextResponse.json({ success: true, report })
  } catch (err: any) {
    console.error('Scan error:', err)
    return NextResponse.json(
      { error: err.message || 'Scan failed. Please try again.' },
      { status: 500 }
    )
  }
}
