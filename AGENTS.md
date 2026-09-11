<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository layout

This is an npm-workspaces monorepo. `npm install` at the root installs everything.

- `apps/web` — public website (`npm run dev`, port 3000)
- `apps/admin` — identity and access console (`npm run dev:admin`, port 3001)
- `packages/identity` — EP-01 domain contracts and policy engine
- `packages/ui` — shared theme tokens and component primitives

Workspace packages ship TypeScript source, so each app lists them in
`transpilePackages`. Tailwind cannot see outside an app's own tree: any new
shared package needs an `@source` line in each app's `globals.css`.

Access rules belong in `packages/identity/src/policy` and are enforced in the
service layer, never only in a form. Add tests there alongside them.
