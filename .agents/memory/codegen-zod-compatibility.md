---
name: OpenAPI integer compatibility
description: Workspace-specific compatibility note for Orval-generated Zod schemas.
---

The workspace currently resolves Zod 3 while the installed Orval generator can emit the Zod 4-only `zod.int()` helper for OpenAPI `integer` fields. Prefer `number` in new OpenAPI response/query schemas when integer-only runtime validation is not essential; enforce stricter integer checks in route code only when needed.

**Why:** Codegen can succeed while the chained library typecheck fails, blocking every generated client update.

**How to apply:** When adding an integer field to `lib/api-spec/openapi.yaml`, first confirm the workspace Zod version and generated output. Keep IDs/pages numeric and validate integer semantics at the boundary if the domain requires it.