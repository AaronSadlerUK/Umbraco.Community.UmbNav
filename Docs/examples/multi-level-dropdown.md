# Multi-Level Dropdown Navigation

This example demonstrates implementing dropdown menus with nested child items.

## Data Type Configuration

For multi-level navigation, configure your Data Type:

| Setting | Value |
|---------|-------|
| Maximum Depth | 3 (or as needed) |
| Allow Text Items | Yes (for section headers) |
| Allow Images | Optional |
| Allow Custom Classes | Yes |

## Basic Dropdown Implementation

### Recursive Partial View

Create a partial view that renders items recursively.

#### _NavigationItem.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var currentPage = ViewData["CurrentPage"] as Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent;
    var isActive = Model.IsActive(currentPage, includeDescendants: true);
}

<li class="nav-item @(hasChildren ? "has-dropdown" : "") @(isActive ? "active" : "")">
    @if (Model.ItemType == UmbNavItemType.Title)
    {
        <span class="nav-label">@Model.Name</span>
    }
    else
    {
        <a href="@Model.Url()"
           class="nav-link @(isActive ? "active" : "") @Model.CustomClasses"
           target="@Model.Target"
           rel="@Model.Noopener @Model.Noreferrer"
           @(hasChildren ? "aria-haspopup=true aria-expanded=false" : "")>
            @Model.Name
            @if (hasChildren)
            {
                <span class="dropdown-arrow" aria-hidden="true"></span>
            }
        </a>
    }

    @if (hasChildren)
    {
        <ul class="dropdown-menu" role="menu">
            @foreach (var child in Model.Children!)
            {
                @await Html.PartialAsync("_NavigationItem", child, ViewData)
            }
        </ul>
    }
</li>
```

#### _Navigation.cshtml

```cshtml
@model IEnumerable<Umbraco.Community.UmbNav.Core.Models.UmbNavItem>

@if (Model?.Any() == true)
{
    <nav class="main-navigation" aria-label="Main navigation">
        <ul class="nav-list" role="menubar">
            @foreach (var item in Model)
            {
                @await Html.PartialAsync("_NavigationItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Umbraco.AssignedContentItem } })
            }
        </ul>
    </nav>
}
```

### CSS for Dropdowns

```css
/* Main navigation */
.main-navigation {
    background-color: #333;
    position: relative;
    z-index: 1000;
}

.nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
}

.nav-item {
    position: relative;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    color: #fff;
    text-decoration: none;
    transition: background-color 0.2s;
}

.nav-link:hover,
.nav-link:focus {
    background-color: #444;
}

.nav-link.active {
    background-color: #007bff;
}

.nav-label {
    display: block;
    padding: 1rem 1.5rem;
    color: #999;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Dropdown arrow */
.dropdown-arrow {
    border: solid #fff;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(45deg);
    transition: transform 0.2s;
}

/* Dropdown menu */
.dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    border-radius: 4px;
}

.dropdown-menu .nav-link {
    color: #333;
    padding: 0.75rem 1.25rem;
}

.dropdown-menu .nav-link:hover,
.dropdown-menu .nav-link:focus {
    background-color: #f5f5f5;
}

.dropdown-menu .nav-link.active {
    background-color: #e3f2fd;
    color: #007bff;
}

/* Show dropdown on hover */
.has-dropdown:hover > .dropdown-menu,
.has-dropdown:focus-within > .dropdown-menu {
    display: block;
}

.has-dropdown:hover > .nav-link .dropdown-arrow {
    transform: rotate(-135deg);
}

/* Nested dropdowns (third level) */
.dropdown-menu .has-dropdown > .dropdown-menu {
    top: 0;
    left: 100%;
    margin-left: 0;
}

.dropdown-menu .has-dropdown > .nav-link .dropdown-arrow {
    transform: rotate(-45deg);
    margin-left: auto;
}

.dropdown-menu .has-dropdown:hover > .nav-link .dropdown-arrow {
    transform: rotate(-45deg);
}

/* Active state for parent items */
.nav-item.active > .nav-link {
    background-color: #007bff;
}

.dropdown-menu .nav-item.active > .nav-link {
    background-color: #e3f2fd;
    color: #007bff;
}
```

## JavaScript-Enhanced Dropdown

For better accessibility and mobile support, add JavaScript:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.has-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');

        // Toggle on click for touch devices
        toggle.addEventListener('click', function(e) {
            // Only prevent default if has children and on touch device
            if (window.matchMedia('(hover: none)').matches) {
                e.preventDefault();
                const isOpen = menu.style.display === 'block';

                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(m => {
                    m.style.display = 'none';
                    m.closest('.has-dropdown')?.querySelector('.nav-link')
                        ?.setAttribute('aria-expanded', 'false');
                });

                // Toggle this dropdown
                menu.style.display = isOpen ? 'none' : 'block';
                toggle.setAttribute('aria-expanded', !isOpen);
            }
        });

        // Keyboard navigation
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isOpen);
                menu.style.display = isOpen ? 'none' : 'block';

                if (!isOpen) {
                    menu.querySelector('.nav-link')?.focus();
                }
            }

            if (e.key === 'Escape') {
                menu.style.display = 'none';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });

        // Arrow key navigation within menu
        menu.addEventListener('keydown', function(e) {
            const items = [...menu.querySelectorAll('.nav-link')];
            const currentIndex = items.indexOf(document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex]?.focus();
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                items[prevIndex]?.focus();
            }

            if (e.key === 'Escape') {
                menu.style.display = 'none';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
                menu.closest('.has-dropdown')?.querySelector('.nav-link')
                    ?.setAttribute('aria-expanded', 'false');
            });
        }
    });
});
</script>
```

## Using the Menu Builder Service

For more control over depth and processing:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Abstractions
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var rawItems = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
    var options = new UmbNavBuildOptions
    {
        MaxDepth = 3,
        RemoveDescription = true // Don't need descriptions in nav
    };
    var navigation = MenuBuilder.BuildMenu(rawItems, options);
}

<nav class="main-navigation" aria-label="Main navigation">
    <ul class="nav-list" role="menubar">
        @foreach (var item in navigation)
        {
            @await Html.PartialAsync("_NavigationItem", item)
        }
    </ul>
</nav>
```

## Animated Dropdowns

Add smooth animations with CSS:

```css
/* Animated dropdown */
.dropdown-menu {
    display: block;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    pointer-events: none;
}

.has-dropdown:hover > .dropdown-menu,
.has-dropdown:focus-within > .dropdown-menu {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

/* Nested dropdown animation */
.dropdown-menu .dropdown-menu {
    transform: translateX(-10px);
}

.dropdown-menu .has-dropdown:hover > .dropdown-menu {
    transform: translateX(0);
}
```

## Dropdown with Section Headers

Use text items as section headers within dropdowns:

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var isHeader = Model.ItemType == UmbNavItemType.Title;
}

<li class="nav-item @(hasChildren ? "has-dropdown" : "") @(isHeader ? "dropdown-header" : "")">
    @if (isHeader)
    {
        <span class="dropdown-header-text">@Model.Name</span>

        @if (!string.IsNullOrEmpty(Model.Description))
        {
            <span class="dropdown-header-desc">@Model.Description</span>
        }
    }
    else
    {
        <a href="@Model.Url()" class="nav-link">
            @if (Model.Image != null)
            {
                <img src="@Model.Image.Url()?width=20&height=20" alt="" class="nav-icon" />
            }
            <span class="nav-text">@Model.Name</span>
            @if (!string.IsNullOrEmpty(Model.Description))
            {
                <span class="nav-desc">@Model.Description</span>
            }
        </a>
    }

    @if (hasChildren)
    {
        <ul class="dropdown-menu">
            @foreach (var child in Model.Children!)
            {
                @await Html.PartialAsync("_DropdownItem", child)
            }
        </ul>
    }
</li>
```

```css
.dropdown-header {
    padding: 0.5rem 1.25rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 0.5rem;
}

.dropdown-header-text {
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
}

.dropdown-header-desc {
    display: block;
    font-size: 0.75rem;
    color: #999;
    margin-top: 0.25rem;
}

.nav-link {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.nav-text {
    font-weight: 500;
}

.nav-desc {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.125rem;
}

.nav-icon {
    margin-right: 0.5rem;
}
```

## Complete Example with View Component

### DropdownNavigationViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class DropdownNavigationViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public DropdownNavigationViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke(
        string propertyAlias = "mainNavigation",
        int maxDepth = 3)
    {
        var context = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = context.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (home == null)
            return Content(string.Empty);

        var rawItems = home.Value<IEnumerable<UmbNavItem>>(propertyAlias);

        if (rawItems == null)
            return Content(string.Empty);

        var options = new UmbNavBuildOptions { MaxDepth = maxDepth };
        var items = _menuBuilder.BuildMenu(rawItems, options);

        return View(new DropdownNavigationViewModel
        {
            Items = items,
            CurrentPage = currentPage
        });
    }
}

public class DropdownNavigationViewModel
{
    public IEnumerable<UmbNavItem> Items { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IPublishedContent? CurrentPage { get; set; }
}
```

### Usage

```cshtml
@await Component.InvokeAsync("DropdownNavigation", new { maxDepth = 2 })
```

## Next Steps

- [Mega Menu](mega-menu.md) - Complex mega menu layouts
- [Mobile Navigation](mobile-navigation.md) - Responsive mobile menus
- [Bootstrap Integration](bootstrap-integration.md) - Bootstrap navbar with dropdowns
