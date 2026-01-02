# UmbNav - Claude Code Guide

This document provides context and guidance for working with the UmbNav codebase using Claude Code.

## Project Overview

UmbNav is an Umbraco Community package that adds a drag-and-drop menu builder to the Umbraco V17+ backoffice. It allows content creators to visually build and manage site navigation menus.

**Version**: 4.0.0+ (Umbraco 17+)
**License**: MIT
**Author**: Aaron Sadler
**Documentation**: https://umbnavdocs.aaronsadler.dev/

## Technology Stack

### Backend
- C# (.NET 10.0)
- ASP.NET Core
- Umbraco CMS 17.0.0

### Frontend
- TypeScript (ES2020)
- Lit 3.3.0 (web components)
- Vite 7.1.11 (bundler)
- Umbraco Backoffice ~17.0.0

### Build & Tooling
- .NET SDK
- Node.js 23.x
- GitVersion (semantic versioning)
- GitHub Actions (CI/CD)
- Playwright (E2E testing)

## Project Structure

### Umbraco.Community.UmbNav/ (Main UI Package)
The frontend package containing the backoffice property editor UI.

**Key Directories:**
- `src/components/` - Lit web components for the property editor
  - `umbnav-property-editor-ui/` - Main property editor component
  - `umbnav-item/` - Individual menu item component
  - `umbnav-group/` - Menu group/section component
- `src/modals/` - Modal dialogs for editing menu items
- `src/localization/` - Multi-language support files
- `src/tokens/` - Design tokens and theming
- `wwwroot/App_Plugins/UmbNav/` - Compiled static assets

**Key Files:**
- `src/manifest.ts` - Property editor schema and registration
- `src/index.ts` - Main entry point
- `src/umbnav-utils.ts` - Shared utility functions
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript compiler settings

### Umbraco.Community.UmbNav.Core/ (Core Logic Package)
The backend package containing data models, services, and business logic.

**Key Directories:**
- `PropertyEditors/` - Property editor definition and configuration
- `Models/` - Data models (UmbNavItem, ImageItem, etc.)
- `Services/` - Business logic (UmbNavMenuBuilderService)
- `Converters/` - Property value conversion
- `TagHelpers/` - Razor tag helpers for frontend rendering
- `Extensions/` - Helper extension methods
- `NotificationHandlers/` - Event handlers (telemetry)

**Key Files:**
- `UmbNavConstants.cs` - Constants and configuration values
- `Models/UmbNavItem.cs` - Core menu item data model
- `Services/UmbNavMenuBuilderService.cs` - Menu building logic
- `TagHelpers/UmbnavItemTagHelper.cs` - Razor tag helper

### TestSite.V17/
Test/demo Umbraco site for development and testing.

**Key Files:**
- `Program.cs` - Application startup and configuration
- `appsettings.json` - Umbraco configuration
- `Views/` - Razor view templates
- `uSync/` - Content export/import data

## Key Features

- Drag-and-drop menu builder in Umbraco backoffice
- Multiple menu item types:
  - Content nodes (from Umbraco content tree)
  - External links
  - Text labels
  - Groups/sections
- Advanced options:
  - Custom images
  - Custom CSS classes
  - Visibility based on member authentication status
  - Maximum child levels configuration
  - Hide items with `umbracoNaviHide` property
  - Auto-expand backoffice tree on hover
  - noopener/noreferrer attributes for external links
  - Auto-add child nodes for content items
- Razor tag helper for frontend rendering
- Multi-language localization support
- Telemetry for usage analytics

## Development Workflow

### Frontend Development
```bash
cd Umbraco.Community.UmbNav
npm install
npm run watch  # Watch mode for development
npm run build  # Production build
```

### Backend Development
```bash
dotnet restore
dotnet build
dotnet run --project TestSite.V17
```

### Building NuGet Packages
```bash
dotnet pack
```

## Git Workflow

**Main Branches:**
- `develop` - Active development branch (use for PRs)
- `main` - Stable releases
- Feature branches - Named branches for specific features

**Current Branch**: magical-feynman (feature branch)

## Architecture Patterns

### Backend
- **Composer Pattern**: `RegisterUmbNavServicesComposer` registers services at startup
- **Property Editor Pattern**: Integrates with Umbraco's property editor system
- **Value Converter Pattern**: Converts between JSON and C# models
- **Service Layer**: Business logic separated into services
- **Tag Helper Pattern**: Razor tag helpers for frontend rendering

### Frontend
- **Web Components**: Custom Lit elements for UI
- **Event-Driven**: Component communication via custom events
- **Configuration-Driven**: Manifest-based registration
- **Modular Design**: Separate components for different concerns

## Data Model

### UmbNavItem
The core menu item model with properties:
- **Link Information**: URL, content reference, or text
- **Hierarchy**: Children, level, depth
- **Metadata**: Images, custom CSS classes, target, rel attributes
- **Authentication**: Show/hide for logged in/out members
- **Display Options**: Visibility flags, noopener/noreferrer settings

### UmbNavItemType Enum
- `Link` - External URL
- `Content` - Umbraco content node
- `Text` - Text-only label
- `Group` - Menu group/section

## Configuration

### UmbNavConfiguration
Property editor configuration options:
- `MaxDepth` - Maximum menu depth
- `HideNaviHide` - Hide items with umbracoNaviHide
- `AutoExpand` - Auto-expand on hover
- `AutoExpandDelay` - Hover delay in ms
- `AddNoOpener` - Add noopener to external links
- `AddNoReferrer` - Add noreferrer to external links
- `AddImages` - Allow images on menu items
- `AddCustomClasses` - Allow custom CSS classes
- `HideLabel` - Display as full-width editor
- `AllowTextItems` - Allow text-only items

## Testing

### E2E Testing
Playwright is configured but currently disabled in CI:
```bash
cd Umbraco.Community.UmbNav
npx playwright test
```

### Manual Testing
Use the TestSite.V17 project to manually test changes:
```bash
dotnet run --project TestSite.V17
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `dotnet-build.stablerelease.yml` - Production releases
- `dotnet-build-prelease.yml` - Pre-release builds
- `codeql.yml` - Security scanning

Versioning is managed by GitVersion (`GitVersion.yml`).

## Important Notes

### When Making Changes
- Frontend changes require rebuilding TypeScript (`npm run build`)
- Backend changes require rebuilding .NET projects
- Test changes in TestSite.V17 before committing
- Follow existing code patterns and naming conventions
- Update localization files if adding new UI strings
- Maintain backwards compatibility where possible

### Code Style
- C#: Follow standard .NET conventions
- TypeScript: Use strict mode, ES2020 features
- Components: Use Lit decorators and reactive properties
- Comments: Add XML docs for public APIs

### Dependencies
- Keep Umbraco dependency at ~17.0.0 for compatibility
- Review package updates carefully for breaking changes
- Lock npm dependencies in package-lock.json

### Release Process
1. Commit changes to feature branch
2. Create PR to `develop`
3. After merge, GitVersion handles versioning
4. GitHub Actions builds and publishes packages
5. Packages published to nuget.org and GitHub Packages

## Common Tasks

### Adding a New Menu Item Property
1. Update `Models/UmbNavItem.cs` with new property
2. Update `src/components/umbnav-item/` to handle new property
3. Update `src/modals/` if property needs modal editing
4. Update `Services/UmbNavMenuBuilderService.cs` if needed for rendering
5. Add localization strings in `src/localization/`
6. Update documentation

### Adding a New Configuration Option
1. Add property to `UmbNavConfiguration.cs`
2. Update `UmbNavConfigurationEditor.cs` if needed
3. Update `src/manifest.ts` to expose in backoffice
4. Update logic that uses the configuration
5. Update documentation

### Updating Umbraco Version
1. Update package references in `.csproj` files
2. Update `package.json` dependencies
3. Test thoroughly with new version
4. Update README.md with version support info

## Resources

- **Documentation**: https://umbnavdocs.aaronsadler.dev/
- **NuGet Package**: https://www.nuget.org/packages/Umbraco.Community.UmbNav
- **GitHub Issues**: https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues
- **Legacy Version (V8-13)**: https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav

## Contact

**Maintainer**: Aaron Sadler (https://aaronsadler.uk)
**Contributors**: See GitHub contributors list
