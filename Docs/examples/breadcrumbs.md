# Breadcrumbs

This example shows how to create breadcrumb navigation using UmbNav menu items and content relationships.

## Overview

While breadcrumbs typically follow the content tree hierarchy, you can also create breadcrumbs that follow your navigation structure, which may be organized differently.

## Method 1: Content-Based Breadcrumbs

The simplest approach uses Umbraco's content tree:

```cshtml
@{
    var ancestors = Model.Ancestors().Reverse();
}

<nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
        @foreach (var ancestor in ancestors)
        {
            <li class="breadcrumb__item">
                <a href="@ancestor.Url()">@ancestor.Name</a>
            </li>
        }
        <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">
            @Model.Name
        </li>
    </ol>
</nav>
```

## Method 2: Navigation-Based Breadcrumbs

For breadcrumbs that follow your menu structure rather than content hierarchy:

### Helper Extension Method

```csharp
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.UmbNav.Core.Models;

public static class UmbNavBreadcrumbExtensions
{
    /// <summary>
    /// Finds the path to a content item within the navigation structure.
    /// </summary>
    public static IEnumerable<UmbNavItem> GetBreadcrumbPath(
        this IEnumerable<UmbNavItem> items,
        IPublishedContent targetContent)
    {
        var path = new List<UmbNavItem>();
        FindPath(items, targetContent.Key, path);
        return path;
    }

    private static bool FindPath(
        IEnumerable<UmbNavItem> items,
        Guid targetKey,
        List<UmbNavItem> path)
    {
        foreach (var item in items)
        {
            path.Add(item);

            // Check if this item matches the target
            if (item.ContentKey == targetKey)
            {
                return true;
            }

            // Check children
            if (item.Children != null && item.Children.Any())
            {
                if (FindPath(item.Children, targetKey, path))
                {
                    return true;
                }
            }

            // Not found in this branch, remove from path
            path.RemoveAt(path.Count - 1);
        }

        return false;
    }

    /// <summary>
    /// Finds the path to a URL within the navigation structure.
    /// Useful for external links or when content key isn't available.
    /// </summary>
    public static IEnumerable<UmbNavItem> GetBreadcrumbPathByUrl(
        this IEnumerable<UmbNavItem> items,
        string targetUrl)
    {
        var path = new List<UmbNavItem>();
        var normalizedTarget = NormalizeUrl(targetUrl);
        FindPathByUrl(items, normalizedTarget, path);
        return path;
    }

    private static bool FindPathByUrl(
        IEnumerable<UmbNavItem> items,
        string targetUrl,
        List<UmbNavItem> path)
    {
        foreach (var item in items)
        {
            path.Add(item);

            var itemUrl = NormalizeUrl(item.Url());
            if (itemUrl == targetUrl)
            {
                return true;
            }

            if (item.Children != null && item.Children.Any())
            {
                if (FindPathByUrl(item.Children, targetUrl, path))
                {
                    return true;
                }
            }

            path.RemoveAt(path.Count - 1);
        }

        return false;
    }

    private static string NormalizeUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return string.Empty;
        return url.TrimEnd('/').ToLowerInvariant();
    }
}
```

### Razor Implementation

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Abstractions
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var home = Model.Root();
    var rawItems = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
    var navigation = MenuBuilder.BuildMenu(rawItems, UmbNavBuildOptions.Default);

    var breadcrumbPath = navigation.GetBreadcrumbPath(Model);
}

@if (breadcrumbPath.Any())
{
    <nav aria-label="Breadcrumb">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <a href="@home?.Url()" itemprop="item">
                    <span itemprop="name">Home</span>
                </a>
                <meta itemprop="position" content="1" />
            </li>

            @{
                var position = 2;
            }
            @foreach (var item in breadcrumbPath)
            {
                var isLast = item == breadcrumbPath.Last();

                <li class="breadcrumb__item @(isLast ? "breadcrumb__item--current" : "")"
                    itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"
                    @(isLast ? "aria-current=page" : "")>
                    @if (isLast)
                    {
                        <span itemprop="name">@item.Name</span>
                    }
                    else
                    {
                        <a href="@item.Url()" itemprop="item">
                            <span itemprop="name">@item.Name</span>
                        </a>
                    }
                    <meta itemprop="position" content="@position" />
                </li>
                position++;
            }
        </ol>
    </nav>
}
```

## Method 3: Hybrid Approach

Combine navigation structure with content ancestors:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");

    // Try to find path in navigation first
    var navPath = navigation?.GetBreadcrumbPath(Model).ToList() ?? new List<UmbNavItem>();

    // If not found in navigation, fall back to content ancestors
    var useContentPath = !navPath.Any();

    IEnumerable<IPublishedContent> contentPath = useContentPath
        ? Model.Ancestors().Reverse()
        : Enumerable.Empty<IPublishedContent>();
}

<nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
        <li class="breadcrumb__item">
            <a href="@home?.Url()">Home</a>
        </li>

        @if (useContentPath)
        {
            @foreach (var ancestor in contentPath)
            {
                <li class="breadcrumb__item">
                    <a href="@ancestor.Url()">@ancestor.Name</a>
                </li>
            }
        }
        else
        {
            @foreach (var item in navPath.Take(navPath.Count - 1))
            {
                <li class="breadcrumb__item">
                    <a href="@item.Url()">@item.Name</a>
                </li>
            }
        }

        <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">
            @Model.Name
        </li>
    </ol>
</nav>
```

## View Component Implementation

### BreadcrumbViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class BreadcrumbViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public BreadcrumbViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke(
        string propertyAlias = "mainNavigation",
        bool useNavigation = true,
        bool includeHome = true,
        bool includeCurrent = true)
    {
        var context = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = context.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (currentPage == null || home == null)
        {
            return Content(string.Empty);
        }

        var model = new BreadcrumbViewModel
        {
            Home = includeHome ? home : null,
            Current = includeCurrent ? currentPage : null,
            Path = new List<BreadcrumbItem>()
        };

        if (useNavigation)
        {
            var rawItems = home.Value<IEnumerable<UmbNavItem>>(propertyAlias);
            if (rawItems != null)
            {
                var navigation = _menuBuilder.BuildMenu(rawItems, UmbNavBuildOptions.Default);
                var navPath = navigation.GetBreadcrumbPath(currentPage);

                foreach (var item in navPath.Take(navPath.Count() - 1))
                {
                    model.Path.Add(new BreadcrumbItem
                    {
                        Name = item.Name,
                        Url = item.Url()
                    });
                }
            }
        }

        // Fall back to content ancestors if no nav path found
        if (!model.Path.Any())
        {
            foreach (var ancestor in currentPage.Ancestors().Reverse().Skip(1)) // Skip home
            {
                model.Path.Add(new BreadcrumbItem
                {
                    Name = ancestor.Name,
                    Url = ancestor.Url()
                });
            }
        }

        return View(model);
    }
}

public class BreadcrumbViewModel
{
    public IPublishedContent? Home { get; set; }
    public IPublishedContent? Current { get; set; }
    public List<BreadcrumbItem> Path { get; set; } = new();
}

public class BreadcrumbItem
{
    public string Name { get; set; } = string.Empty;
    public string? Url { get; set; }
}
```

### Views/Shared/Components/Breadcrumb/Default.cshtml

```cshtml
@model BreadcrumbViewModel

@if (Model.Path.Any() || Model.Home != null)
{
    <nav aria-label="Breadcrumb" class="breadcrumb-nav">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
            @{
                var position = 1;
            }

            @if (Model.Home != null)
            {
                <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <a href="@Model.Home.Url()" itemprop="item">
                        <span itemprop="name">Home</span>
                    </a>
                    <meta itemprop="position" content="@position" />
                </li>
                position++;
            }

            @foreach (var item in Model.Path)
            {
                <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <a href="@item.Url" itemprop="item">
                        <span itemprop="name">@item.Name</span>
                    </a>
                    <meta itemprop="position" content="@position" />
                </li>
                position++;
            }

            @if (Model.Current != null)
            {
                <li class="breadcrumb__item breadcrumb__item--current"
                    itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"
                    aria-current="page">
                    <span itemprop="name">@Model.Current.Name</span>
                    <meta itemprop="position" content="@position" />
                </li>
            }
        </ol>
    </nav>
}
```

### Usage

```cshtml
@await Component.InvokeAsync("Breadcrumb")

<!-- Or with options -->
@await Component.InvokeAsync("Breadcrumb", new {
    propertyAlias = "mainNavigation",
    useNavigation = true,
    includeHome = true,
    includeCurrent = true
})
```

## CSS Styles

```css
.breadcrumb-nav {
    padding: 1rem 0;
    background-color: #f8f9fa;
}

.breadcrumb {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.breadcrumb__item {
    display: flex;
    align-items: center;
}

.breadcrumb__item:not(:last-child)::after {
    content: '/';
    margin-left: 0.5rem;
    color: #999;
}

.breadcrumb__item a {
    color: #007bff;
    text-decoration: none;
}

.breadcrumb__item a:hover {
    text-decoration: underline;
}

.breadcrumb__item--current {
    color: #666;
}

/* With icons */
.breadcrumb__item--home a::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 0.25rem;
    background-image: url("data:image/svg+xml,...");
    background-size: contain;
}

/* Responsive */
@media (max-width: 768px) {
    .breadcrumb {
        font-size: 0.75rem;
    }

    /* Show only last 2-3 items on mobile */
    .breadcrumb__item:not(:nth-last-child(-n+3)) {
        display: none;
    }

    .breadcrumb__item:first-child {
        display: flex;
    }

    .breadcrumb__item:first-child::after {
        content: '...';
    }
}
```

## JSON-LD Structured Data

For better SEO, you can also output JSON-LD:

```cshtml
@using System.Text.Json

@{
    var breadcrumbItems = new List<object>();
    var position = 1;

    if (Model.Home != null)
    {
        breadcrumbItems.Add(new
        {
            @type = "ListItem",
            position = position++,
            name = "Home",
            item = Model.Home.Url(mode: UrlMode.Absolute)
        });
    }

    foreach (var item in Model.Path)
    {
        breadcrumbItems.Add(new
        {
            @type = "ListItem",
            position = position++,
            name = item.Name,
            item = item.Url
        });
    }

    if (Model.Current != null)
    {
        breadcrumbItems.Add(new
        {
            @type = "ListItem",
            position = position,
            name = Model.Current.Name
        });
    }

    var structuredData = new
    {
        @context = "https://schema.org",
        @type = "BreadcrumbList",
        itemListElement = breadcrumbItems
    };
}

<script type="application/ld+json">
@Html.Raw(JsonSerializer.Serialize(structuredData, new JsonSerializerOptions { WriteIndented = true }))
</script>
```

## Next Steps

- [Basic Navigation](basic-navigation.md) - Simple navigation setup
- [Extension Methods](../rendering/extension-methods.md) - URL and active state helpers
- [Multi-Level Dropdown](multi-level-dropdown.md) - Dropdown menus
