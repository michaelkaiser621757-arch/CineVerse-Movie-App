---
name: Clerk Facebook provider limit
description: Social-login constraint for CineVerse's Replit-managed Clerk setup.
---

Replit-managed Clerk currently exposes Google and selected social providers, but Facebook is not listed as a supported provider. Keep the Clerk flow truthful: show only enabled providers and do not add a fake Facebook OAuth strategy.

**Why:** The provider availability is controlled by the managed Auth pane, and an unsupported strategy would render a login button that cannot complete.

**How to apply:** If Facebook login becomes a hard requirement, choose and approve a separate auth architecture that supports Facebook OAuth before replacing Clerk.