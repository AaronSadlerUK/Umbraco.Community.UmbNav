# UmbNav Documentation

Welcome to the official documentation for **UmbNav** - a drag and drop menu builder for Umbraco V17+.

## What is UmbNav?

UmbNav is a powerful, flexible navigation package for Umbraco CMS that allows content editors to easily create and manage site navigation through an intuitive drag-and-drop interface in the Umbraco backoffice.

## Key Features

### For Content Editors

- **Drag and Drop Interface** - Easily reorder menu items and create nested hierarchies
- **Multiple Item Types** - Add content nodes, external links, or text labels
- **Visual Feedback** - See your menu structure as you build it
- **Nested Children** - Create multi-level navigation with unlimited depth (configurable)
- **Item Settings** - Configure images, CSS classes, descriptions, and visibility per item

### For Developers

- **TagHelper Rendering** - Simple, clean syntax for rendering menus in Razor views
- **Fully Extensible** - Extend both frontend (TypeScript/Lit) and backend (C#)
- **Build Options** - Control menu output with filtering and transformation options
- **Active State Detection** - Automatic highlighting of current page and ancestors
- **Member Authentication** - Show/hide items based on login status
- **Delivery API Support** - Full support for Umbraco's Content Delivery API

## Version Compatibility

| UmbNav Version | Umbraco Version |
|----------------|-----------------|
| 4.x            | 17+             |
| 3.x            | 14-16           |
| 2.x            | 10-13           |
| 1.x            | 8-9             |

For Umbraco versions 13 and below, see the [legacy repository](https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav).

## Quick Start

### 1. Install the Package

```bash
dotnet add package Umbraco.Community.UmbNav
```

### 2. Create a Data Type

In the Umbraco backoffice, create a new Data Type using the "UmbNav" property editor.

### 3. Add to Document Type

Add your new Data Type to a Document Type (e.g., "Site Settings" or "Home").

### 4. Render in Your View

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@{
    var menuItems = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <umbnavitem menu-item="@item" active-class="active"></umbnavitem>
            </li>
        }
    </ul>
</nav>
```

## Getting Help

- **Documentation** - You're reading it!
- **GitHub Issues** - [Report bugs or request features](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues)
- **NuGet** - [Umbraco.Community.UmbNav](https://www.nuget.org/packages/Umbraco.Community.UmbNav)

## License

UmbNav is open source software licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

**Maintained by** [Aaron Sadler](https://aaronsadler.uk) and contributors.
