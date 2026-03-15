# Career Navigator AI - NPM Workspace

This project has been migrated from `pnpm` to `npm` workspaces to align with standard Node.js package management conventions.

## Project Structure

A full-stack AI-powered career guidance website for students, organized as an npm workspace monorepo.

```text
.
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── career-ai/          # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/ # Gemini AI SDK wrapper
├── scripts/                # Utility scripts
├── package.json            # Root workspace config
└── package-lock.json       # Authoritative lockfile
```

## Migration Summary

The following changes were implemented to align with npm standards:

1.  **Workspace Configuration**:
    - Added `"workspaces"` to root `package.json`.
    - Removed `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
2.  **Dependency Management**:
    - Replaced `catalog:` placeholders with explicit version numbers.
    - Replaced `workspace:*` with `*` for internal workspace resolution.
3.  **Scripts**:
    - Replaced `pnpm -r` commands with `npm run <script> --workspaces`.
    - Removed `preinstall` enforcement for pnpm.
4.  **Cleanup**:
    - Consolidated all `node_modules` under a single workspace-aware structure managed by npm.
    - Removed `.npmrc` with pnpm-specific settings.

## Development Commands

- **Install dependencies**: `npm install`
- **Build all projects**: `npm run build`
- **Typecheck all projects**: `npm run typecheck`
- **Run API server**: `npm run dev --workspace=@workspace/api-server`
- **Run Frontend**: `npm run dev --workspace=@workspace/career-ai`

## Verification

The project has been validated to:
- Successfully install all dependencies using `npm install`.
- Generate a consistent `package-lock.json`.
- Execute workspace-wide scripts without module resolution errors.
