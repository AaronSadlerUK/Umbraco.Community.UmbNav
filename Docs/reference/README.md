# Reference

Complete API reference and technical documentation for UmbNav.

## Contents

- [API Reference](api-reference.md) - Complete API documentation
- [Changelog](changelog.md) - Version history and changes
- [Contributing](contributing.md) - How to contribute to UmbNav
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Quick Links

### C# Types

| Type | Description |
|------|-------------|
| `UmbNavItem` | Core menu item model |
| `UmbNavBuildOptions` | Menu processing options |
| `IUmbNavMenuBuilderService` | Menu building interface |
| `UmbnavitemTagHelper` | Razor TagHelper |

### TypeScript Types

| Type | Description |
|------|-------------|
| `ModelEntryType` | Menu item data model |
| `UmbNavToolbarAction` | Toolbar action definition |
| `UmbNavItemSlot` | Item slot definition |
| `UmbNavItemTypeConfig` | Item type configuration |

### Extension Points

| Extension | Location |
|-----------|----------|
| Toolbar Actions | Frontend (TypeScript) |
| Item Slots | Frontend (TypeScript) |
| Item Types | Frontend (TypeScript) |
| Menu Builder Service | Backend (C#) |
| TagHelper | Backend (C#) |
| Value Converter | Backend (C#) |

## Package Information

| Package | NuGet |
|---------|-------|
| `Umbraco.Community.UmbNav` | Full package (UI + Core) |
| `Umbraco.Community.UmbNav.Core` | Core only (headless) |

## Version Compatibility

| UmbNav Version | Umbraco Version |
|----------------|-----------------|
| 4.x | 17+ |
| 3.x | 14-16 |
| 2.x | 10-13 |
| 1.x | 8-9 |

## Support

- **Documentation**: https://umbnavdocs.aaronsadler.dev/
- **GitHub Issues**: https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues
- **NuGet**: https://www.nuget.org/packages/Umbraco.Community.UmbNav
