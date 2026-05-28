# 🔐 VibeShield — GitHub Security Scanner

> **Is your repo actually safe?** VibeShield scans any public GitHub repository for exposed API keys, database credentials, hardcoded passwords, and sensitive files — built specifically for vibe coders.

---

## ✨ What it detects

| Category | Examples |
|----------|---------|
| **AI Keys** | Anthropic (`sk-ant-`), OpenAI (`sk-`), Google AI (`AIza`) |
| **Database** | MongoDB URIs with passwords, MySQL/PostgreSQL connection strings |
| **Cloud** | AWS Access Keys (`AKIA`), AWS Secret Keys |
| **Auth** | GitHub tokens (`ghp_`), JWT secrets, hardcoded passwords |
| **Payments** | Stripe live keys (`sk_live_`) |
| **Comms** | SendGrid, Twilio |
| **Files** | `.env`, `serviceAccountKey.json`, `.pem`, `id_rsa` |
| **History** | Scans last 20 commits for secret leaks in diffs |

---

## 🚀 Deploy to Vercel (1 minute)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this project to GitHub
2. Import to Vercel
3. Add environment variable (optional): `GITHUB_TOKEN` for higher rate limits
4. Deploy!

---

## 💻 Run locally

```bash
# Clone
git clone https://github.com/YOURUSERNAME/vibeshield
cd vibeshield

# Install
npm install

# Set up environment (optional)
cp .env.example .env.local
# Add your GITHUB_TOKEN if you have one

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
vibeshield/
├── src/
│   ├── app/
│   │   ├── api/scan/route.ts     # Scan API endpoint
│   │   ├── page.tsx              # Landing + scanner UI
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Styles
│   ├── components/
│   │   └── ResultsDashboard.tsx  # Full report UI
│   └── lib/
│       ├── scanner.ts            # Secret detection engine (20+ patterns)
│       └── github.ts             # GitHub API client
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Optional | GitHub PAT — raises rate limit from 60 to 5000 req/hr |

**Get a GitHub token:** github.com/settings/tokens → Generate new token (classic) → No scopes needed for public repos.

---

## 🛡️ How the scan works

1. **Fetch repo tree** — Gets all file paths via GitHub API
2. **Detect sensitive files** — Checks for `.env`, `.pem`, `credentials.json`, etc.
3. **Scan file contents** — Downloads and runs 20+ regex patterns on each file
4. **Analyze .gitignore** — Checks if required entries are present
5. **Scan commit history** — Looks for secrets in the last 20 commit diffs
6. **Generate report** — Calculates score (0–100) and grade (A–F)

---

## 📄 License

MIT — Build on it, improve it, share it.

---

Built with ❤️ for the vibe coding community
