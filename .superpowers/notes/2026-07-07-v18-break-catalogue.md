# V18 Break Catalogue (spike output)

Compiled by bumping `dev/v18` to Umbraco 18.0.x / `@umbraco-cms/backoffice` 18.0.2
/ package 5.0.0 and running `dotnet build` + `npx tsc --noEmit`.

**Headline:** UmbNav's own code is almost entirely V18-clean. The backend package
(Core + UI) compiles with **zero** errors against Umbraco 18. The frontend has a
**single** code change. Everything else is test-site scaffolding or dependency
version bumps.

## Frontend

- [ ] **`src/umbnav-utils.ts` — `DocumentVariantStateModel` renamed to `PublishableVariantStateModel`.**
  V18 renamed the enum (same members; `DRAFT = "Draft"`). Fix: update the import on
  line 6 and the two usages on lines 63 and 139 (`.DRAFT` unchanged).
  - Import: `import { PublishableVariantStateModel } from "@umbraco-cms/backoffice/external/backend-api";`
  - Usages: `documentVariant?.state != PublishableVariantStateModel.DRAFT`
- [x] **Peer dependency: `uuid` `^13` → `^14`.** backoffice 18.0.2 declares peer
  `uuid@^14`; install fails with ERESOLVE otherwise. Bumped in `package.json`
  during the spike. (A dependabot `uuid-14.0.1` branch already existed.)

## Backend

UmbNav Core and UI projects: **0 errors.** `content.Children()` already uses the
V18 extension-method form; no removed services are referenced.

All 8 backend errors are in **`TestSite.V18` razor views** (Umbraco StarterKit
templates, not UmbNav code):

- [ ] **`Views/Partials/Navigation/SubNavigation.cshtml:10`** and
  **`Views/Partials/Navigation/TopNavigation.cshtml:7`** — `IPublishedContent.Children`
  property removed in V18. It is now the extension method
  `Children(INavigationQueryService, IPublishedStatusFilteringService, string?)`.
  Fix: use the `.Children()` extension (inject/resolve the required services) or
  `IDocumentNavigationQueryService` for keys only.
- [ ] **`Views/Partials/blockgrid/items.cshtml:15`** and
  **`Views/Partials/blocklist/default.cshtml:8`** — `BlockGridItem.ContentUdi` /
  `BlockListItem.ContentUdi` removed in V18. Fix: use `ContentKey` (Guid).
- [ ] Check **`Views/Product.cshtml:9`** (`PublishedContentWrapped.Parent`) — warned
  in 17, may error in 18; not in the 8-error set but verify after the above fixes.

## Plan gaps discovered during the spike

- **`Umbraco.Community.UmbNav/Umbraco.Community.UmbNav.csproj`** had its own direct
  `Umbraco.Cms 17.0.0` reference and 4.0.0 version block — not listed in plan Task 6.
  Bumped to `[18.0.0, 18.999.999)` and 5.0.0 during the spike.
- **GitVersion `source-branches`** must reference branch **config keys** (`dev-v17`,
  `dev-v18`), not branch regex names (`dev/v17`). Caught by the GitVersion
  verification gate in Task 2.
- **npm `latest` dist-tag is 17.5.3**, so `npm install` would not pull 18 without an
  explicit `@~18.0.0` resolution + the uuid peer bump.

## V18 backoffice verification (Task 9)

Automated smoke test against a real Umbraco 18 boot of `TestSite.V18`
(SQLite dev DB carried from the V17 site, `UpgradeUnattended: true`):

- **Boot gotcha (fixed):** the `git mv` of the test site carried stale V17
  `bin`/`obj`, so the first boot crashed with
  `Could not load assembly 'Swashbuckle.AspNetCore.Swagger, Version=10.0.1.0'`
  (V18 bumped Swashbuckle to 10.0.1). Deleting all `bin`/`obj` and rebuilding
  resolved it. These folders are git-ignored, so nothing stale was committed.
- **Unattended upgrade V17 → V18 completed successfully.**
- `GET /umbraco` → **200** (backoffice served).
- `GET /App_Plugins/UmbNav/umbraco-package.json` → **200**; dist bundle
  (`api.js`, `client.js`, modal elements, localization) served.
- Observed, **non-blocking, not UmbNav**: a StarterKit
  `Umbraco.SampleSite.Migrations.ImportPackageXmlMigration` exception during the
  upgrade's template import. The upgrade still reported success and the app
  started; this is a StarterKit-vs-V18 issue in pre-existing sample data.

**Still to confirm interactively** (needs backoffice login + browser driving):
add content/text/external-link items, rename, drag-reorder/nest, save + reload
persistence, and the link/media pickers and settings/visibility modals opening.
The property editor bundle loads under V18; the runtime editor interactions have
not yet been exercised end-to-end.

## Net scope

- Frontend: 1 line-level code change + 1 dependency bump.
- Backend package: no changes required.
- Test site: 4 StarterKit razor templates to forward-port.
