# Changelog

## 0.1.0 — 2026-09-17

Initial public SAI Guard SDK.

- `SaiGuard.protect()` client for `POST /v1/protect`
- Typed intents: transfer, swap, approval, contract call
- Verdicts: `PROTECTED`, `WARNING`, `BLOCKED`
- Runtime response validation with Zod
- `SaiGuard.capabilities()` against live `GET /v1/capabilities`
- Maps missing protect endpoint to `PROTECT_UNAVAILABLE` instead of fabricating verdicts
