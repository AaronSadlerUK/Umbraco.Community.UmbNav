# Changelog

All notable changes to UmbNav are documented here.

## Version 4.x (Umbraco 17+)

### 4.0.0

**Breaking Changes**
- Minimum Umbraco version is now 17.0.0
- Updated to .NET 10
- Updated Lit dependency to 3.3.0
- Updated Vite to 7.1.11

**New Features**
- Full extensibility system for frontend (TypeScript/Lit)
  - Toolbar actions API
  - Item slots API
  - Custom item types API
  - Extension registry with change notifications
- Backend extensibility improvements
  - Virtual methods on `UmbNavMenuBuilderService`
  - Virtual methods on `UmbnavitemTagHelper`
  - Extensible value converter
- `UmbNavBuildOptions` class for controlling menu processing
- Improved drag and drop experience
- Description support for menu items (optional)
- Better localization support

**Improvements**
- Refactored codebase for better maintainability
- Improved TypeScript types and exports
- Better error handling throughout
- Performance optimizations for large menus
- Enhanced accessibility in backoffice UI

**Bug Fixes**
- Fixed drag and drop issues with expanded items
- Fixed validation on text items
- Fixed issue with unpublished content display
- Various UI polish fixes

---

## Version 3.x (Umbraco 14-16)

### 3.2.0
- Added member visibility options (show/hide for logged in/out users)
- Added "Include Child Nodes" option for automatic child expansion
- Performance improvements

### 3.1.0
- Added custom CSS classes support
- Added image/icon support for menu items
- Improved backoffice tree display

### 3.0.0
- Initial release for Umbraco 14+
- Complete rewrite using Lit components
- Modern property editor architecture
- Drag and drop with nested children support

---

## Version 2.x (Umbraco 10-13)

### 2.4.0
- Added TagHelper for easier frontend rendering
- Added extension methods for URL and active state

### 2.3.0
- Added noopener/noreferrer support
- Added target attribute support

### 2.2.0
- Performance improvements
- Bug fixes for nested menus

### 2.1.0
- Added custom image support
- Improved drag and drop stability

### 2.0.0
- Initial release for Umbraco 10+
- Migration to .NET 6+
- Updated AngularJS controllers

---

## Version 1.x (Umbraco 8-9)

### 1.5.0
- Final release for Umbraco 8/9
- Various bug fixes and improvements

### 1.0.0
- Initial public release
- Basic menu builder functionality
- Drag and drop support
- External links and content nodes

---

## Upgrade Guides

### Upgrading from 3.x to 4.x

1. **Update Umbraco** to version 17 or higher
2. **Update packages**:
   ```bash
   dotnet add package Umbraco.Community.UmbNav
   ```
3. **Review breaking changes**:
   - If you extended any UmbNav classes, review the new virtual methods
   - Update any custom frontend code to use the new extension registry
4. **Test thoroughly** before deploying to production

### Upgrading from 2.x to 3.x

1. **Update Umbraco** to version 14 or higher
2. **Update packages** and rebuild
3. **Update frontend code**:
   - Replace AngularJS directives with Lit components
   - Update any custom property editor extensions
4. **Existing data** should migrate automatically

### Upgrading from 1.x to 2.x

1. **Update Umbraco** to version 10 or higher
2. **Migrate to .NET 6+**
3. **Update package references**
4. **Review Razor views** for any deprecated APIs

---

## Roadmap

### Planned Features

- [ ] Multi-select content picker improvements
- [ ] Keyboard navigation enhancements in backoffice
- [ ] Additional item types (e.g., dividers, mega menu sections)
- [ ] Preview mode in backoffice
- [ ] Import/export functionality

### Under Consideration

- GraphQL support for headless scenarios
- Block-based menu items
- Template/preset support
- A/B testing integration

---

## Contributing

See [Contributing](contributing.md) for information on how to contribute to UmbNav development.

## Reporting Issues

Report bugs and request features on [GitHub Issues](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues).

When reporting bugs, please include:
- UmbNav version
- Umbraco version
- .NET version
- Steps to reproduce
- Expected vs actual behavior
- Any relevant error messages or screenshots
