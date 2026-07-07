# UmbNav V18 Support — Design

**Date:** 2026-07-07
**Author:** Aaron Sadler (with Claude Code)
**Status:** Approved for planning

## Goal

Support Umbraco 18 while keeping ongoing maintenance low. Deliver a V18 test
site and a V18-compatible package, without turning UmbNav into a two-major
`#if` codebase.

## Key facts driving the design

- **Umbraco 18 targets `net10.0`** — same TFM as 17. No multi-TFM split needed;
  the only real differences are package versions and a handful of API breaks.
- **Backend exposure is near-trivial.** UmbNav's Core does not use the V18
  removals (`ILocalizationService`, `UmbracoApiController`, `IFileService`), does
  not touch NPoco/Swashbuckle directly, and already calls `content.Children()`
  in the extension-method form V18 moved to. Only `IPublishedContentCache` needs
  verifying.
- **Frontend exposure is bounded but real.** UmbNav *is* a property editor UI —
  the extension type V18 reworked (property editors split into server + client
  parts; manifest/type architecture and some export locations moved). Imports
  already use the modern sub-path style and `tsconfig` already declares
  `@umbraco-cms/backoffice/extension-types`, so older import-map churn is
  absorbed. Highest-risk spots: `UmbPropertyEditorUiElement` /
  `ManifestPropertyEditorUi` registration, and the `/document` + `/media`
  repositories and data resolvers.
- Exact frontend breakage count is unknowable until we compile against 18 —
  hence a **spike-first** workflow.

## Compatibility model — Model A (branch-per-major, LTS primary)

No single package spans both majors. Users pick by Umbraco major; this *is* the
backwards-compatibility story and it is the low-maintenance one.

The **LTS line is the active line**: Umbraco 17 is LTS (long support window,
where most production sites live), Umbraco 18 is STS (supported only until 19).
Active development therefore stays on `dev/v17`, and changes are forward-ported
to `dev/v18`.

| Umbraco major | Branch | Package major | Support | Role |
|---------------|--------|---------------|---------|------|
| 17 | `dev/v17` | 4.x | LTS | **Active development** — features and fixes land here first |
| 18 | `dev/v18` | 5.x | STS | Forward-port line — changes cherry-picked forward from `dev/v17` |

- `dev/v18` branches off `dev/v17`.
- **`develop` is retired.** Two lanes only. `main` continues to track stable
  releases.
- New work lands on `dev/v17` first, then forward-ports to `dev/v18`. Because
  the code delta between majors is small, the cherry-pick is cheap; the only
  friction is the few spots where the V18 API diverges (which the port catalogues
  in Phase 0).

## Dependency version ranges

Every Umbraco package reference is pinned to a single-major floor/ceiling range:

- `dev/v17` (package 4.x): `[17.0.0, 17.999.999)`
- `dev/v18` (package 5.x): `[18.0.0, 18.999.999)`

Applied to:

- `Umbraco.Community.UmbNav.Core.csproj` → `Umbraco.Cms.Web.Common`
- Test-site refs → `Umbraco.Cms`, `Umbraco.TheStarterKit`, `uSync`

Frontend (`package.json`): `@umbraco-cms/backoffice` moves `~17.0.0` →
`~18.0.0` on `dev/v18`; package `version` → `5.0.0`.

## Project structure

- Add **`TestSite.V18`** (net10.0, Umbraco.Cms 18 + StarterKit 18 + uSync 18),
  a copy of `TestSite.V17` with refs bumped to the 18 range.
- **One test site per branch:** `TestSite.V17` exists only on `dev/v17`;
  `TestSite.V18` exists only on `dev/v18`. Neither branch carries both.
- `Umbraco.Community.UmbNav.Core` and `Umbraco.Community.UmbNav` (frontend)
  exist on both branches with version-appropriate refs and package majors.

## Port workflow (spike-first, test-guarded)

**Phase 0 — Spike (on `dev/v18`).**
Create `TestSite.V18`, bump backend + frontend refs to the 18 range, run
`dotnet build` and `npm run typecheck`, and catalogue every break. Turns the
frontend unknown into a concrete checklist; confirms Model A still fits.

**Phase 1 — Backend.**
Fix `IPublishedContentCache` and any Core compile breaks. Existing 138 xUnit
tests must pass green.

**Phase 2 — Frontend.**
Fix moved imports, property-editor manifest/registration split, and repository /
data-resolver signature changes. `npm run build` clean; Vitest drag unit tests
green.

**Phase 3 — Verify.**
Run TestSite.V18 and exercise the editor in the V18 backoffice: add / rename /
drag / save for content, text, and external-link items; confirm the property
editor and modals load.

## CI/CD

- **Prerelease** builds are branch-driven: PR-close on `dev/v17` emits
  `4.x.y-beta.n`, on `dev/v18` emits `5.x.y-beta.n` (via the 5.0.0 seed tag).
  Retire `develop` triggers.
- **Stable** releases are **tag-driven**: pushing a stable semver tag runs the
  stable workflow, which builds the exact tag version (GitVersion returns no
  prerelease label on a tagged commit) and publishes. Tag `dev/v17` with `4.x.y`
  for an LTS release; tag `dev/v18` with `5.x.y` for an Umbraco 18 release.
  Prerelease tags (containing `-`) are excluded from the stable workflow. This
  supersedes the earlier "main tracks stable" idea — one workflow serves both
  majors with no `main` merge dance and no extra branches. `main` remains a
  mirror and is no longer a release trigger.
- GitVersion carries per-line branch configs (`dev-v17`, `dev-v18`) so each
  major versions independently.

## Support policy (README)

Document the pick-by-major matrix: **Umbraco 17.x → UmbNav 4.x, Umbraco 18.x →
UmbNav 5.x.** State that 4.x is the active LTS line and 5.x is the STS
forward-port line kept in step with it.

## Out of scope

- Multi-targeting a single package across both majors (Model B) — rejected as
  higher release/CI cost and frontend-bundle compat risk.
- Any feature work beyond what the V18 port requires.
- Retiring or changing the V16-and-earlier legacy migration path.

## Open questions

None outstanding — resolved during brainstorming (retire `develop`, one test
site per branch, single-major dependency ranges).
