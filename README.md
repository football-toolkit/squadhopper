# SquadHopper
All your football matches in one place.

## Documentation

See [docs/](docs/README.md) for the documentation, including the design decisions (ADRs).

## Setup

The app needs Node.js 24. With [nvm](https://github.com/nvm-sh/nvm), `nvm use` picks the version from `.nvmrc`. Install the dependencies, turn Next.js telemetry off, and start the app at http://localhost:3000:

```bash
nvm use
npm install
npx next telemetry disable  # or set NEXT_TELEMETRY_DISABLED=1
npm run dev
```

Run `npx next telemetry disable` in the project root. The other commands are listed in [AGENTS.md](AGENTS.md).

Features are specified with [OpenSpec](https://github.com/Fission-AI/OpenSpec), pinned to 1.14.2. It needs Node.js 20.19.0 or higher. Install it, check the version, and turn telemetry off. The `OPENSPEC_TELEMETRY=0` prefix keeps that command itself from sending an event on first run:

```bash
npm install -g @fission-ai/openspec@1.14.2
openspec --version  # prints 1.14.2
OPENSPEC_TELEMETRY=0 openspec config set telemetry.enabled false
```

Changes are implemented with [Superpowers](https://github.com/obra/superpowers), which needs no install: `.claude/settings.json` turns it on for Claude Code.

## Contributing

Every change starts from a GitHub issue, gets its own branch, and lands in `main` through a pull request. See [AGENTS.md](AGENTS.md) for the full workflow, branch naming, and commit conventions. Those rules apply to people and coding agents alike.
