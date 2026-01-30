# Basic Navigation

This example demonstrates a simple top-level navigation menu using UmbNav.

## Prerequisites

- UmbNav package installed
- A Data Type configured with UmbNav property editor
- A document type with the UmbNav property
- Content created with menu items

## Basic Implementation

### View (Razor)

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var navigation = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

@if (navigation?.Any() == true)
{
    <nav class="main-navigation" aria-label="Main navigation">
        <ul class="nav-list">
            @foreach (var item in navigation)
            {
                <li class="nav-item">
                    <umbnavitem menu-item="@item"
                                active-class="active"
                                current-page="@Model"
                                is-active-ancestor-check="true">
                    </umbnavitem>
                </li>
            }
        </ul>
    </nav>
}
```

### CSS

```css
.main-navigation {
    background-color: #333;
    padding: 0 1rem;
}

.nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 0;
}

.nav-item {
    position: relative;
}

.nav-item a,
.nav-item span {
    display: block;
    padding: 1rem 1.5rem;
    color: #fff;
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.nav-item a:hover,
.nav-item a:focus {
    background-color: #555;
}

.nav-item a.active {
    background-color: #007bff;
}

/* Label items (non-links) */
.nav-item span {
    cursor: default;
}
```

## With Descriptions

If you've enabled descriptions in your Data Type configuration:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var navigation = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="main-navigation" aria-label="Main navigation">
    <ul class="nav-list">
        @foreach (var item in navigation)
        {
            <li class="nav-item">
                <a href="@item.Url()"
                   class="@(item.IsActive(Model) ? "active" : "")"
                   target="@item.Target"
                   rel="@item.Noopener @item.Noreferrer">
                    <span class="nav-title">@item.Name</span>
                    @if (!string.IsNullOrEmpty(item.Description))
                    {
                        <span class="nav-description">@item.Description</span>
                    }
                </a>
            </li>
        }
    </ul>
</nav>
```

```css
.nav-item a {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 1.5rem;
}

.nav-title {
    font-weight: 600;
}

.nav-description {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-top: 0.25rem;
}
```

## With Images/Icons

If you've enabled images in your Data Type configuration:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var navigation = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="main-navigation" aria-label="Main navigation">
    <ul class="nav-list">
        @foreach (var item in navigation)
        {
            <li class="nav-item">
                <a href="@item.Url()"
                   class="nav-link @(item.IsActive(Model) ? "active" : "") @item.CustomClasses">
                    @if (item.Image != null)
                    {
                        <img src="@item.Image.Url()?width=24&height=24"
                             alt=""
                             class="nav-icon"
                             width="24"
                             height="24" />
                    }
                    <span>@item.Name</span>
                </a>
            </li>
        }
    </ul>
</nav>
```

```css
.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-icon {
    flex-shrink: 0;
}
```

## Using a Partial View

For reusability, create a partial view.

### _MainNavigation.cshtml

```cshtml
@model IEnumerable<Umbraco.Community.UmbNav.Core.Models.UmbNavItem>
@using Umbraco.Community.UmbNav.Core.Models

@if (Model?.Any() == true)
{
    <nav class="main-navigation" aria-label="Main navigation">
        <ul class="nav-list">
            @foreach (var item in Model)
            {
                <li class="nav-item">
                    <umbnavitem menu-item="@item"
                                active-class="active"
                                current-page="@Umbraco.AssignedContentItem"
                                is-active-ancestor-check="true">
                    </umbnavitem>
                </li>
            }
        </ul>
    </nav>
}
```

### Usage in Layout

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    // Get navigation from site settings or home node
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>@Model.Name - My Site</title>
</head>
<body>
    <header>
        @await Html.PartialAsync("_MainNavigation", navigation)
    </header>

    <main>
        @RenderBody()
    </main>
</body>
</html>
```

## Handling Different Item Types

UmbNav supports different item types that you may want to render differently:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var navigation = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="main-navigation">
    <ul class="nav-list">
        @foreach (var item in navigation)
        {
            <li class="nav-item nav-item--@item.ItemType.ToString().ToLower()">
                @switch (item.ItemType)
                {
                    case UmbNavItemType.Link:
                    case UmbNavItemType.Document:
                        <a href="@item.Url()"
                           class="@(item.IsActive(Model) ? "active" : "")"
                           target="@item.Target">
                            @item.Name
                        </a>
                        break;

                    case UmbNavItemType.Title:
                        <span class="nav-label">@item.Name</span>
                        break;
                }
            </li>
        }
    </ul>
</nav>
```

## With View Component

For more complex logic, use a View Component:

### NavigationViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class NavigationViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public NavigationViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke(string propertyAlias = "mainNavigation")
    {
        var umbracoContext = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = umbracoContext.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (home == null)
        {
            return Content(string.Empty);
        }

        var rawItems = home.Value<IEnumerable<UmbNavItem>>(propertyAlias);

        if (rawItems == null || !rawItems.Any())
        {
            return Content(string.Empty);
        }

        var options = new UmbNavBuildOptions { MaxDepth = 1 };
        var menuItems = _menuBuilder.BuildMenu(rawItems, options);

        var model = new NavigationViewModel
        {
            Items = menuItems,
            CurrentPage = currentPage
        };

        return View(model);
    }
}

public class NavigationViewModel
{
    public IEnumerable<UmbNavItem> Items { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IPublishedContent? CurrentPage { get; set; }
}
```

### Views/Shared/Components/Navigation/Default.cshtml

```cshtml
@model NavigationViewModel

<nav class="main-navigation" aria-label="Main navigation">
    <ul class="nav-list">
        @foreach (var item in Model.Items)
        {
            <li class="nav-item">
                <umbnavitem menu-item="@item"
                            active-class="active"
                            current-page="@Model.CurrentPage"
                            is-active-ancestor-check="true">
                </umbnavitem>
            </li>
        }
    </ul>
</nav>
```

### Usage

```cshtml
@await Component.InvokeAsync("Navigation")

<!-- Or with a different property alias -->
@await Component.InvokeAsync("Navigation", new { propertyAlias = "footerNavigation" })
```

## Accessibility Considerations

1. **Use semantic HTML**: `<nav>` element with `aria-label`
2. **Keyboard navigation**: Ensure links are focusable
3. **Visual focus indicators**: Style `:focus` states
4. **Screen reader support**: Meaningful link text

```css
.nav-item a:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #007bff;
    color: #fff;
    padding: 8px;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

## Next Steps

- [Multi-Level Dropdown](multi-level-dropdown.md) - Add nested menu items
- [Bootstrap Integration](bootstrap-integration.md) - Bootstrap navbar
- [Mobile Navigation](mobile-navigation.md) - Responsive menus
