# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Gemini AI via Replit AI Integrations (`@workspace/integrations-gemini-ai`)

## Project: AI Career Path Navigator (PathAI)

A full-stack AI-powered career guidance website for students. Features:
- 3D Siri-like hero orb animation (Three.js / @react-three/fiber) with CSS fallback
- Deep dark space glassmorphism design (neon purple + cyan)
- Gemini AI chat assistant (SSE streaming)
- Multi-step onboarding form
- AI career path recommendations with match percentages
- Interactive roadmap timeline with YouTube video suggestions
- AI conversation memory via PostgreSQL

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── career-ai/          # React + Vite frontend (AI Career Navigator)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/  # Gemini AI SDK wrapper
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Frontend Pages (artifacts/career-ai)

- `/` - Home/Landing page with 3D hero orb
- `/onboarding` - Multi-step form (skills, interests, education, goals)
- `/recommendations` - AI career match cards with circular progress bars
- `/roadmap?career=X` - Interactive timeline + YouTube suggestions
- `/chat` - AI chat assistant with conversation history

## API Routes (artifacts/api-server)

- `GET /api/healthz` - Health check
- `GET|POST /api/gemini/conversations` - List/create conversations
- `GET|DELETE /api/gemini/conversations/:id` - Get/delete conversation
- `GET|POST /api/gemini/conversations/:id/messages` - Messages (SSE streaming)
- `POST /api/career/recommendations` - AI career recommendations
- `POST /api/career/roadmap` - AI learning roadmap
- `POST /api/career/youtube-suggestions` - YouTube video suggestions

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Database

Tables: `conversations`, `messages` (for AI chat history)

Run migrations: `pnpm --filter @workspace/db run push`

## AI Integration

Uses Replit AI Integrations for Gemini (no API key needed):
- `AI_INTEGRATIONS_GEMINI_BASE_URL` - Auto-set
- `AI_INTEGRATIONS_GEMINI_API_KEY` - Auto-set
