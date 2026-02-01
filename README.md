# UmbNav

UmbNav adds a drag and drop menu builder to the Umbraco V17+ backoffice.

[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.UmbNav.svg)](https://www.nuget.org/packages/Umbraco.Community.UmbNav)
[![NuGet Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.UmbNav.svg)](https://www.nuget.org/packages/Umbraco.Community.UmbNav)

## Documentation

**Full documentation is available on [GitBook](https://umbnavdocs.aaronsadler.dev/)**.

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

### Versions

There are 3 versions of UmbNav, depending on the Umbraco version you are installing into you will need to use the version outlined below:

| Umbraco Version           | UmbNav Version                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Umbraco Version 17        | 4.0.0 - Latest - Active development                                                           |
| Umbraco Version 16        | 4.0.0-beta0030 - (Not all features available) - No further development planned                |
| Umbraco Version 15        | 4.0.0-beta0001 - 4.0.0-beta0021 (Not all features available) - No further development planned |
| Umbraco Version 14        | Not Supported                                                                                 |
| Umbraco Versions 11 -> 13 | 3.x                                                                                           |
| Umbraco Version 10        | 2.x - End-of-Life or 3.x                                                                      |
| Umbraco Version 9         | 1.x - End-of-Life                                                                             |
| Umbraco Version 8         | 1.x - End-of-Life                                                                             |

For Umbraco versions 13 and below, see the [legacy repository](https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav).

## Contributing

To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes.

See [Contributing Guide](https://umbnavdocs.aaronsadler.dev/umbnav-documentation/reference/contributing) for detailed instructions.

## Who do I talk to?

This project is maintained by [Aaron Sadler](https://aaronsadler.dev) and contributors.

## License

Copyright &copy; 2025 [Aaron Sadler](https://aaronsadler.dev), and other contributors

Licensed under the MIT License.

As per the spirit of the MIT Licence, feel free to fork and do what you wish with the source code, all I ask is that if you find a bug or add a feature please create a PR to this repository.
