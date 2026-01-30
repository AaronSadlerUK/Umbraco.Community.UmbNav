# UmbNav - Claude Code Guide

This document provides comprehensive context and guidance for working with the UmbNav codebase using Claude Code.

## Project Overview

UmbNav is an Umbraco Community package that adds a drag-and-drop menu builder to the Umbraco V17+ backoffice. It allows content creators to visually build and manage site navigation menus with nested hierarchies, custom styling, and advanced visibility options.

| Property | Value |
|----------|-------|
| **Version** | 4.0.0+ |
| **Umbraco** | 17.0.0+ |
| **License** | MIT |
| **Author** | Aaron Sadler |
| **Documentation** | https://umbnavdocs.aaronsadler.dev/ |
| **NuGet** | https://www.nuget.org/packages/Umbraco.Community.UmbNav |

---

## Technology Stack

### Backend (.NET)
- **Framework**: .NET 10.0
- **Platform**: ASP.NET Core
- **CMS**: Umbraco CMS 17.0.0
- **Testing**: xUnit, Moq

### Frontend (TypeScript/Web Components)
- **Language**: TypeScript (ES2020, strict mode)
- **UI Framework**: Lit 3.3.0
- **Bundler**: Vite 7.1.11
- **Backoffice**: Umbraco Backoffice ~17.0.0
- **Testing**: Playwright

### Build & Tooling
- **Package Manager**: NuGet (.NET), npm (Node.js)
- **Node Version**: 23.x
- **Versioning**: GitVersion (semantic versioning)
- **CI/CD**: GitHub Actions

---

## Project Structure

```
Umbraco.Community.UmbNav/
├── Umbraco.Community.UmbNav/           # Frontend UI Package
│   ├── src/
│   │   ├── components/                 # Lit web components
│   │   │   ├── umbnav-property-editor-ui/  # Main property editor
│   │   │   ├── umbnav-item/            # Individual menu item
│   │   │   └── umbnav-group/           # Menu group container
│   │   ├── modals/                     # Modal dialogs
│   │   │   ├── link-item-modal-element.ts
│   │   │   ├── text-item-modal-element.ts
│   │   │   ├── settings-modal-element.ts
│   │   │   └── visibility-modal-element.ts
│   │   ├── extensions/                 # Extension system
│   │   │   ├── extension-registry.ts   # Central registry
│   │   │   └── extension-types.ts      # Type definitions
│   │   ├── localization/               # i18n translations
│   │   │   ├── en.ts
│   │   │   ├── da.ts
│   │   │   └── ...
│   │   ├── tokens/                     # Shared types/tokens
│   │   │   └── umbnav.token.ts
│   │   ├── manifest.ts                 # Property editor registration
│   │   ├── index.ts                    # Main entry point
│   │   └── umbnav-utils.ts             # Utility functions
│   ├── tests/                          # Playwright E2E tests
│   ├── wwwroot/App_Plugins/UmbNav/     # Compiled output
│   ├── vite.config.ts                  # Build configuration
│   ├── tsconfig.json                   # TypeScript config
│   └── package.json                    # npm dependencies
│
├── Umbraco.Community.UmbNav.Core/      # Backend Core Package
│   ├── Models/
│   │   ├── UmbNavItem.cs               # Core menu item model
│   │   ├── UmbNavBuildOptions.cs       # Build options
│   │   └── ImageItem.cs                # Image reference
│   ├── Services/
│   │   └── UmbNavMenuBuilderService.cs # Menu processing
│   ├── Abstractions/
│   │   └── IUmbNavMenuBuilderService.cs
│   ├── Converters/
│   │   └── UmbNavValueConverter.cs     # Property value converter
│   ├── TagHelpers/
│   │   └── UmbnavitemTagHelper.cs      # Razor TagHelper
│   ├── Extensions/
│   │   └── UmbNavItemExtensions.cs     # Extension methods
│   ├── PropertyEditors/
│   │   ├── UmbNavConfiguration.cs      # Data Type config
│   │   └── UmbNavConfigurationEditor.cs
│   ├── Migrations/                     # Package migrations
│   │   ├── UmbNavPackageMigrationPlan.cs    # Migration plan
│   │   └── UmbNavLegacyModelMigration.cs    # v3.x to v4.x data migration
│   ├── Enums/
│   │   └── UmbNavItemType.cs           # Item type enum
│   ├── Composers/
│   │   └── RegisterUmbNavServicesComposer.cs
│   ├── NotificationHandlers/           # Telemetry
│   └── UmbNavConstants.cs              # Constants
│
├── Umbraco.Community.UmbNav.Core.Tests/ # Unit tests
│   └── Services/
│       └── UmbNavMenuBuilderServiceTests.cs
│
├── TestSite.V17/                       # Development test site
│   ├── Program.cs
│   ├── appsettings.json
│   ├── Views/
│   └── uSync/                          # Content sync data
│
├── Docs/                               # Documentation (GitBook)
│   ├── SUMMARY.md                      # Table of contents
│   ├── README.md                       # Introduction
│   ├── getting-started.md
│   ├── installation.md
│   ├── configuration.md
│   ├── rendering/                      # Rendering docs
│   ├── models/                         # Model docs
│   ├── extensibility/                  # Extension docs
│   │   ├── frontend/
│   │   └── backend/
│   ├── testing/                        # Testing docs
│   ├── examples/                       # Code examples
│   └── reference/                      # API reference
│
├── .github/workflows/                  # CI/CD
│   ├── dotnet-build.stablerelease.yml
│   ├── dotnet-build-prelease.yml
│   └── codeql.yml
│
├── GitVersion.yml                      # Version config
├── README.md                           # Project readme
└── CLAUDE.md                           # This file
```

---

## Key Files Reference

### Frontend (TypeScript/Lit)

| File | Purpose |
|------|---------|
| `src/manifest.ts` | Property editor registration with Umbraco |
| `src/index.ts` | Main entry point, exports API |
| `src/components/umbnav-item/umbnav-item.ts` | Menu item component with extension support |
| `src/components/umbnav-group/umbnav-group.ts` | Drag-drop container for items |
| `src/extensions/extension-registry.ts` | Extension registration system |
| `src/extensions/extension-types.ts` | TypeScript interfaces for extensions |
| `src/tokens/umbnav.token.ts` | `ModelEntryType` and shared types |
| `src/modals/link-item-modal-element.ts` | Link/content item editor modal |
| `src/modals/text-item-modal-element.ts` | Text item editor modal |
| `src/localization/en.ts` | English translations |

### Backend (C#)

| File | Purpose |
|------|---------|
| `Models/UmbNavItem.cs` | Core menu item data model |
| `Models/UmbNavBuildOptions.cs` | Menu processing options |
| `Services/UmbNavMenuBuilderService.cs` | Menu building with virtual methods |
| `Abstractions/IUmbNavMenuBuilderService.cs` | Service interface |
| `TagHelpers/UmbnavitemTagHelper.cs` | Razor TagHelper with override points |
| `Converters/UmbNavValueConverter.cs` | JSON to model conversion |
| `Extensions/UmbNavItemExtensions.cs` | `Url()`, `IsActive()`, `GetLinkHtml()` |
| `PropertyEditors/UmbNavConfiguration.cs` | Data Type configuration model |
| `Enums/UmbNavItemType.cs` | `Link`, `Document`, `Title` enum |
| `Migrations/UmbNavLegacyModelMigration.cs` | Migrates v3.x data to v4.x format |
| `Migrations/UmbNavPackageMigrationPlan.cs` | Defines migration plan |

---

## Architecture Patterns

### Backend Patterns

1. **Composer Pattern**: Services registered via `RegisterUmbNavServicesComposer`
2. **Value Converter Pattern**: `UmbNavValueConverter` converts JSON to `IEnumerable<UmbNavItem>`
3. **Service Layer**: `IUmbNavMenuBuilderService` for menu processing
4. **TagHelper Pattern**: `UmbnavitemTagHelper` for Razor rendering
5. **Virtual Methods**: Override points for customization
6. **Package Migration**: `UmbNavPackageMigrationPlan` for version upgrades

### Frontend Patterns

1. **Web Components**: Lit-based custom elements
2. **Extension Registry**: Central registry for toolbar actions, slots, item types
3. **Event Delegation**: Custom events bubble up for parent handling
4. **Reactive Properties**: Lit `@property()` decorators
5. **Modular Exports**: API bundle for external consumption

---

## Migration System

UmbNav includes an automatic migration system for upgrading from v3.x (and earlier) to v4.x.

### How It Works

```
UmbNavPackageMigrationPlan
└── UmbNavLegacyModelMigration (GUID: 786E9C82-8621-4B0E-8E3A-7A7AAD61B820)
```

The migration runs automatically on first startup after upgrading and:

1. **Detects legacy data types** using `AaronSadler.UmbNav` property editor alias
2. **Finds all content** using those data types
3. **Transforms JSON data** from old format to new format
4. **Updates data types** to use `Umbraco.Community.UmbNav` alias

### Key Transformations

| Old | New |
|-----|-----|
| `udi` (string) | `contentKey` (Guid) |
| `title`/`name` | `name` (title preferred) |
| `itemType: Link` | `itemType: External` |
| `itemType: Content` | `itemType: Document` |
| `itemType: Label` | `itemType: Title` |
| `noopener` (bool) | `noopener` (string) |
| `noreferrer` (bool) | `noreferrer` (string) |

### Constants

```csharp
// Current property editor alias
public const string PropertyEditorAlias = "Umbraco.Community.UmbNav";

// Legacy alias (used for migration detection)
internal const string LegacyEditorAlias = "AaronSadler.UmbNav";
```

### Testing Migration

The migration has a static helper method for testing:

```csharp
UmbNavLegacyModelMigration.TryTransformLegacyValue(logger, legacyJson, out string newJson)
```

---

## Data Models

### UmbNavItem (C#)

```csharp
public class UmbNavItem
{
    // Identity
    public Guid Key { get; set; }
    public string Name { get; set; }
    public UmbNavItemType ItemType { get; set; }  // Link, Document, Title

    // Content
    public string? Url { get; set; }
    public Guid? ContentKey { get; set; }
    public IPublishedContent? Content { get; set; }  // Resolved by service

    // Hierarchy
    public IEnumerable<UmbNavItem>? Children { get; set; }
    public int Level { get; set; }

    // Display
    public string? Description { get; set; }
    public string? CustomClasses { get; set; }
    public string? Icon { get; set; }
    public IPublishedContent? Image { get; set; }

    // Link attributes
    public string? Target { get; set; }
    public string? Noopener { get; set; }
    public string? Noreferrer { get; set; }

    // Visibility
    public bool HideLoggedIn { get; set; }
    public bool HideLoggedOut { get; set; }
    public bool IncludeChildNodes { get; set; }
    public bool IsActive { get; set; }
}
```

### ModelEntryType (TypeScript)

```typescript
interface ModelEntryType {
    key: Guid;
    name: string;
    description?: string;
    url?: string;
    icon?: string;
    itemType: 'Link' | 'Document' | 'Title';
    udi?: string;
    anchor?: string;
    published?: boolean;
    naviHide?: boolean;
    culture?: string;
    children?: ModelEntryType[];
    expanded?: boolean;
    target?: string;
    noopener?: string;
    noreferrer?: string;
    customClasses?: string;
    image?: MediaItem[];
    includeChildNodes?: boolean;
    hideLoggedIn?: boolean;
    hideLoggedOut?: boolean;
}
```

---

## Extension System

### Frontend Extensions (TypeScript)

```typescript
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';

// Toolbar Action
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'my-action',
    label: 'My Action',
    icon: 'icon-star',
    position: 'start',  // 'start' | 'end' | number
    isVisible: (item, config) => true,
    onExecute: async (item, context) => {
        context.updateItem({ ...item, customClasses: 'modified' });
    }
});

// Item Slot
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'my-slot',
    position: 'after-name',  // 'before-name' | 'after-name' | 'before-toolbar' | 'after-toolbar'
    isVisible: (item) => item.customClasses?.includes('featured'),
    render: (item) => html`<span class="badge">Featured</span>`
});

// Item Type
UmbNavExtensionRegistry.registerItemType({
    alias: 'divider',
    label: 'Divider',
    icon: 'icon-navigation-horizontal',
    defaultValues: { itemType: 'Title', name: '---' }
});
```

### Backend Extensions (C#)

```csharp
// Custom Menu Builder Service
public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        // Custom visibility logic
        return base.ShouldIncludeItem(item, isLoggedIn);
    }
}

// Register with composer
public class CustomComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
    }
}
```

---

## Development Workflow

### Setup

```bash
# Clone repository
git clone https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav.git
cd Umbraco.Community.UmbNav

# Restore .NET packages
dotnet restore

# Install npm packages
cd Umbraco.Community.UmbNav
npm install
```

### Frontend Development

```bash
cd Umbraco.Community.UmbNav

# Development with watch
npm run watch

# Production build
npm run build

# Type checking
npm run typecheck
```

### Backend Development

```bash
# Build all projects
dotnet build

# Run test site
dotnet run --project TestSite.V17

# Run unit tests
dotnet test

# Build NuGet packages
dotnet pack
```

### E2E Testing

```bash
cd Umbraco.Community.UmbNav

# Install Playwright browsers
npx playwright install

# Run all tests
npx playwright test

# Run with UI
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

---

## Git Workflow

### Branches
- `main` - Stable releases
- `develop` - Active development (PR target)
- Feature branches - For specific features/fixes

### Commit Messages
```
feat: Add custom toolbar action support
fix: Resolve drag-drop issue with expanded items
docs: Update extensibility documentation
refactor: Simplify menu builder service
test: Add unit tests for value converter
chore: Update npm dependencies
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with tests
3. Run `npm run build` and `dotnet build`
4. Create PR to `develop`
5. Address review feedback
6. Merge after approval

---

## Common Tasks

### Adding a New Menu Item Property

1. **Update C# Model** (`Models/UmbNavItem.cs`):
   ```csharp
   public string? MyNewProperty { get; set; }
   ```

2. **Update TypeScript Type** (`src/tokens/umbnav.token.ts`):
   ```typescript
   myNewProperty?: string;
   ```

3. **Update Modal** (`src/modals/link-item-modal-element.ts` or similar):
   - Add form field
   - Handle in submit

4. **Update Service** (`Services/UmbNavMenuBuilderService.cs`) if processing needed

5. **Update Localization** (`src/localization/en.ts`):
   ```typescript
   myNewPropertyLabel: 'My New Property'
   ```

6. **Update Documentation** (`Docs/`)

### Adding a New Configuration Option

1. **Add to Configuration** (`PropertyEditors/UmbNavConfiguration.cs`):
   ```csharp
   public bool MyNewOption { get; set; }
   ```

2. **Update Manifest** (`src/manifest.ts`):
   ```typescript
   {
       alias: 'myNewOption',
       label: 'My New Option',
       propertyEditorUiAlias: 'Umb.PropertyEditorUi.Toggle'
   }
   ```

3. **Use in Components** - Access via `config` property

### Extending the TagHelper

```csharp
[HtmlTargetElement("custom-navitem")]
public class CustomNavItemTagHelper : UmbnavitemTagHelper
{
    protected override string? GetUrl()
    {
        var url = base.GetUrl();
        return url != null ? $"{url}?tracking=nav" : null;
    }

    protected override void ProcessCustomAttributes(
        TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("data-analytics", "nav-click");
    }
}
```

---

## Testing

### Unit Tests (C#)

Location: `Umbraco.Community.UmbNav.Core.Tests/`

```csharp
public class UmbNavMenuBuilderServiceTests
{
    [Fact]
    public void BuildMenu_WithValidItems_ReturnsProcessedItems()
    {
        // Arrange
        var service = CreateService();
        var items = CreateTestItems();

        // Act
        var result = service.BuildMenu(items, UmbNavBuildOptions.Default);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }
}
```

### E2E Tests (Playwright)

Location: `Umbraco.Community.UmbNav/tests/`

```typescript
import { test, expect } from '@playwright/test';
import { ConstantHelper } from "@umbraco/playwright-testhelpers";

test.describe("UmbNav", () => {
    test('can add content item', async ({ umbracoUi }) => {
        await umbracoUi.goToBackOffice();
        await umbracoUi.login.enterEmail(ConstantHelper.testUserCredentials.email);
        // ... test implementation
    });
});
```

---

## Configuration Reference

### Data Type Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `MaxDepth` | int | 0 | Maximum nesting depth (0 = unlimited) |
| `HideNaviHide` | bool | false | Hide items with umbracoNaviHide |
| `AutoExpand` | bool | false | Auto-expand on hover |
| `AutoExpandDelay` | int | 1000 | Hover delay (ms) |
| `HideNoopener` | bool | false | Hide noopener option |
| `HideNoreferrer` | bool | false | Hide noreferrer option |
| `AllowImageIcon` | bool | false | Allow images |
| `AllowCustomClasses` | bool | false | Allow CSS classes |
| `HideLabel` | bool | false | Full-width display |
| `AllowTextItems` | bool | true | Allow text items |
| `AllowDescription` | bool | false | Allow descriptions |
| `EnableVisibility` | bool | false | Member visibility options |
| `HideIncludeChildNodes` | bool | false | Hide child nodes option |

### appsettings.json

```json
{
  "UmbNav": {
    "DisableTelemetry": true
  }
}
```

---

## Troubleshooting

### Frontend Issues

1. **Property editor not loading**: Clear browser cache, check console for errors
2. **Drag-drop not working**: Collapse expanded items first
3. **Extensions not appearing**: Verify registration timing, check `isVisible`

### Backend Issues

1. **Menu items null**: Use `MenuBuilder.BuildMenu()` to process raw items
2. **URLs incorrect**: Ensure content is published, check culture
3. **Active state wrong**: Pass `current-page` to TagHelper

### Build Issues

1. **TypeScript errors**: Run `npm run typecheck`
2. **Missing assets**: Run `npm run build`
3. **NuGet restore fails**: Clear cache with `dotnet nuget locals all --clear`

---

## Important Conventions

### Code Style

**C#:**
- Follow Microsoft C# conventions
- XML documentation on public APIs
- Use nullable reference types

**TypeScript:**
- Strict mode enabled
- Use Lit decorators (`@property`, `@state`, `@customElement`)
- Export types from API bundle

### Naming

- **Files**: kebab-case (`umbnav-item.ts`)
- **Classes**: PascalCase (`UmbNavItem`)
- **Methods**: PascalCase (C#), camelCase (TS)
- **Properties**: PascalCase (C#), camelCase (TS)
- **CSS Classes**: kebab-case (`umbnav-item`)

### Documentation

- Update `Docs/` for user-facing changes
- Update `CLAUDE.md` for developer-facing changes
- Add XML docs for public C# APIs
- Add JSDoc for exported TypeScript functions

---

## Resources

| Resource | URL |
|----------|-----|
| Documentation | https://umbnavdocs.aaronsadler.dev/ |
| NuGet Package | https://www.nuget.org/packages/Umbraco.Community.UmbNav |
| GitHub Repository | https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav |
| Issues | https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues |
| Legacy (V8-13) | https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav |
| Umbraco Docs | https://docs.umbraco.com/ |

---

## Contact

**Maintainer**: Aaron Sadler
**Website**: https://aaronsadler.uk
**GitHub**: [@AaronSadlerUK](https://github.com/AaronSadlerUK)
