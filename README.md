# UmbNav

UmbNav adds a drag and drop menu builder to the Umbraco V17+ backoffice.

[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.UmbNav.svg)](https://www.nuget.org/packages/Umbraco.Community.UmbNav)
[![NuGet Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.UmbNav.svg)](https://www.nuget.org/packages/Umbraco.Community.UmbNav)

## Documentation

**Full documentation is available at [umbnavdocs.aaronsadler.dev](https://umbnavdocs.aaronsadler.dev/)** or in the [Docs folder](./Docs/README.md).

## Quick Start

### Installation

```bash
dotnet add package Umbraco.Community.UmbNav
```

For headless/API-only scenarios (Core package without UI):
```bash
dotnet add package Umbraco.Community.UmbNav.Core
```

### Basic Usage

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var menuItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");
}

<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <umbnavitem menu-item="@item"
                            active-class="active"
                            current-page="@Model">
                </umbnavitem>
            </li>
        }
    </ul>
</nav>
```

## Features

- **Drag and drop menu builder** with nested children support
- **Multiple item types**: Content nodes, external links, and text labels
- **TagHelper** for easy frontend rendering
- **Fully extensible** - add custom toolbar actions, item types, and more
- **Advanced options**:
  - Custom CSS classes
  - Menu item images
  - Description fields
  - Member visibility rules
  - Auto-include child nodes
  - noopener/noreferrer support

## Version Compatibility

| UmbNav Version | Umbraco Version |
|----------------|-----------------|
| 4.x | 17+ |
| 3.x | 14-16 |
| 2.x | 10-13 |
| 1.x | 8-9 |

For Umbraco versions 13 and below, see the [legacy repository](https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav).

## Documentation Topics

- [Getting Started](./Docs/getting-started.md)
- [Installation](./Docs/installation.md)
- [Configuration](./Docs/configuration.md)
- **Rendering**
  - [TagHelper](./Docs/rendering/taghelper.md)
  - [Extension Methods](./Docs/rendering/extension-methods.md)
  - [Menu Builder Service](./Docs/rendering/menu-builder-service.md)
- **Models**
  - [UmbNavItem](./Docs/models/umbnav-item.md)
  - [Build Options](./Docs/models/build-options.md)
- **Extensibility**
  - [Overview](./Docs/extensibility/overview.md)
  - [Frontend Extensions](./Docs/extensibility/frontend/README.md)
  - [Backend Extensions](./Docs/extensibility/backend/README.md)
- **Examples**
  - [Basic Navigation](./Docs/examples/basic-navigation.md)
  - [Multi-Level Dropdown](./Docs/examples/multi-level-dropdown.md)
  - [Mega Menu](./Docs/examples/mega-menu.md)
  - [Bootstrap Integration](./Docs/examples/bootstrap-integration.md)
  - [Tailwind Integration](./Docs/examples/tailwind-integration.md)
  - [Mobile Navigation](./Docs/examples/mobile-navigation.md)
- **Testing**
  - [Playwright E2E Tests](./Docs/testing/playwright.md)
  - [C# Unit Tests](./Docs/testing/unit-tests.md)
- **Reference**
  - [API Reference](./Docs/reference/api-reference.md)
  - [Changelog](./Docs/reference/changelog.md)
  - [Troubleshooting](./Docs/reference/troubleshooting.md)

## Contributing

To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes.

See [Contributing Guide](./Docs/reference/contributing.md) for detailed instructions.

## Who do I talk to?

This project is maintained by [Aaron Sadler](https://aaronsadler.uk) and contributors.

## License

Copyright &copy; 2025 [Aaron Sadler](https://aaronsadler.dev), and other contributors

Licensed under the MIT License.

As per the spirit of the MIT Licence, feel free to fork and do what you wish with the source code, all I ask is that if you find a bug or add a feature please create a PR to this repository.
