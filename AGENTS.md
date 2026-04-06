# Project Instructions

This repository is a Next.js 16 + React 19 + TypeScript application that uses Tailwind CSS, Radix UI, TanStack Query, Zod, and Leaflet.

For this repository's current MCP workflow, use only the `context7` MCP server by default.

Use `context7` whenever a task depends on current third-party documentation, especially for:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- TanStack Query
- Zod
- Leaflet

Prefer `context7` over model memory for package APIs, migrations, version-specific behavior, and code examples.

When prompting, explicitly say `use context7` and, when helpful, name the target stack such as `use context7 for Next.js 16 and React 19`.

The `openaiDeveloperDocs` server may remain configured in workspace MCP settings, but it is out of operational scope for now and should not be used unless the user explicitly asks for it.

Preserve the existing App Router, TypeScript, and Tailwind patterns in this repo unless the user explicitly asks for a broader refactor.
