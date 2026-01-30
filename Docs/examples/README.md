# Examples

This section provides complete, real-world examples of using UmbNav in various scenarios.

## Example Categories

### Navigation Patterns

- [Basic Navigation](basic-navigation.md) - Simple top-level navigation
- [Multi-Level Dropdown](multi-level-dropdown.md) - Dropdown menus with nested items
- [Mega Menu](mega-menu.md) - Complex mega menu implementations
- [Breadcrumbs](breadcrumbs.md) - Breadcrumb navigation from menu structure
- [Footer Navigation](footer-navigation.md) - Footer link groups
- [Mobile Navigation](mobile-navigation.md) - Responsive mobile menus

### Framework Integration

- [Bootstrap 5](bootstrap-integration.md) - Bootstrap navbar integration
- [Tailwind CSS](tailwind-integration.md) - Tailwind CSS styling

## Quick Reference

### Minimal Implementation

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@{
    var menu = Model.Value<IEnumerable<UmbNavItem>>("navigation");
}

<nav>
    <ul>
        @foreach (var item in menu)
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

### With Service Processing

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Abstractions
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var rawItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");
    var options = new UmbNavBuildOptions { MaxDepth = 3 };
    var menu = MenuBuilder.BuildMenu(rawItems, options);
}

<nav>
    @await Html.PartialAsync("_NavigationPartial", menu)
</nav>
```

### Common Patterns

| Pattern | Best For |
|---------|----------|
| TagHelper | Simple, declarative markup |
| Extension Methods | Custom rendering logic |
| Menu Builder Service | Advanced processing, caching |
| Custom TagHelper | Reusable custom behavior |

## Next Steps

- [Basic Navigation](basic-navigation.md) - Start with a simple implementation
- [TagHelper Reference](../rendering/taghelper.md) - Full TagHelper documentation
- [Extensibility](../extensibility/overview.md) - Customization options
