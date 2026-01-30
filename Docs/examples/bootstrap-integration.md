# Bootstrap 5 Integration

This example demonstrates integrating UmbNav with Bootstrap 5's navigation components including navbar, dropdowns, and offcanvas mobile menu.

## Prerequisites

- Bootstrap 5.x installed
- UmbNav package configured

## Basic Bootstrap Navbar

### Razor Implementation

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="@home?.Url()">
            <img src="/images/logo.svg" alt="Site Logo" height="40" />
        </a>

        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                @if (navigation != null)
                {
                    foreach (var item in navigation)
                    {
                        @await Html.PartialAsync("_BootstrapNavItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Model } })
                    }
                }
            </ul>
        </div>
    </div>
</nav>
```

### _BootstrapNavItem.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var currentPage = ViewData["CurrentPage"] as Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent;
    var isActive = Model.IsActive(currentPage, includeDescendants: true);
}

@if (hasChildren)
{
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle @(isActive ? "active" : "")"
           href="#"
           id="dropdown-@Model.Key"
           role="button"
           data-bs-toggle="dropdown"
           aria-expanded="false">
            @Model.Name
        </a>
        <ul class="dropdown-menu" aria-labelledby="dropdown-@Model.Key">
            @foreach (var child in Model.Children!)
            {
                @if (child.ItemType == UmbNavItemType.Title)
                {
                    <li><h6 class="dropdown-header">@child.Name</h6></li>
                }
                else
                {
                    <li>
                        <a class="dropdown-item @(child.IsActive(currentPage) ? "active" : "")"
                           href="@child.Url()"
                           target="@child.Target">
                            @child.Name
                        </a>
                    </li>
                }

                @if (child.Children?.Any() == true)
                {
                    foreach (var grandchild in child.Children)
                    {
                        <li>
                            <a class="dropdown-item ps-4 @(grandchild.IsActive(currentPage) ? "active" : "")"
                               href="@grandchild.Url()">
                                @grandchild.Name
                            </a>
                        </li>
                    }
                }
            }
        </ul>
    </li>
}
else
{
    <li class="nav-item">
        @if (Model.ItemType == UmbNavItemType.Title)
        {
            <span class="nav-link disabled">@Model.Name</span>
        }
        else
        {
            <a class="nav-link @(isActive ? "active" : "")"
               href="@Model.Url()"
               target="@Model.Target"
               @(isActive ? "aria-current=page" : "")>
                @Model.Name
            </a>
        }
    </li>
}
```

## Bootstrap Offcanvas Mobile Menu

### Implementation

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
    <div class="container">
        <a class="navbar-brand" href="@home?.Url()">
            <img src="/images/logo.svg" alt="Logo" height="40" />
        </a>

        <!-- Desktop Menu -->
        <div class="collapse navbar-collapse" id="desktopNav">
            <ul class="navbar-nav ms-auto">
                @if (navigation != null)
                {
                    foreach (var item in navigation)
                    {
                        @await Html.PartialAsync("_BootstrapNavItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Model } })
                    }
                }
            </ul>
        </div>

        <!-- Mobile Toggle - Opens Offcanvas -->
        <button class="navbar-toggler d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileOffcanvas"
                aria-controls="mobileOffcanvas"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </div>
</nav>

<!-- Offcanvas Mobile Menu -->
<div class="offcanvas offcanvas-end d-lg-none"
     tabindex="-1"
     id="mobileOffcanvas"
     aria-labelledby="mobileOffcanvasLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="mobileOffcanvasLabel">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <ul class="navbar-nav">
            @if (navigation != null)
            {
                foreach (var item in navigation)
                {
                    @await Html.PartialAsync("_BootstrapOffcanvasItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Model } })
                }
            }
        </ul>
    </div>
</div>
```

### _BootstrapOffcanvasItem.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var currentPage = ViewData["CurrentPage"] as Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent;
    var isActive = Model.IsActive(currentPage, includeDescendants: true);
    var collapseId = $"collapse-{Model.Key}";
}

<li class="nav-item @(hasChildren ? "mb-1" : "")">
    @if (hasChildren)
    {
        <div class="d-flex align-items-center">
            <a class="nav-link flex-grow-1 @(isActive ? "active fw-bold" : "")"
               href="@Model.Url()">
                @Model.Name
            </a>
            <button class="btn btn-link text-dark p-2"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#@collapseId"
                    aria-expanded="false"
                    aria-controls="@collapseId">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>

        <div class="collapse ps-3" id="@collapseId">
            <ul class="navbar-nav">
                @foreach (var child in Model.Children!)
                {
                    @await Html.PartialAsync("_BootstrapOffcanvasItem", child, ViewData)
                }
            </ul>
        </div>
    }
    else if (Model.ItemType == UmbNavItemType.Title)
    {
        <span class="nav-link text-muted small text-uppercase">@Model.Name</span>
    }
    else
    {
        <a class="nav-link @(isActive ? "active fw-bold" : "")"
           href="@Model.Url()"
           target="@Model.Target"
           data-bs-dismiss="offcanvas">
            @Model.Name
        </a>
    }
</li>
```

## Bootstrap Mega Menu

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="@home?.Url()">Brand</a>

        <button class="navbar-toggler" type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#megaMenuOffcanvas">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse">
            <ul class="navbar-nav">
                @foreach (var item in navigation!)
                {
                    var isMega = item.Children?.Count() > 4;

                    if (isMega)
                    {
                        <li class="nav-item dropdown position-static">
                            <a class="nav-link dropdown-toggle"
                               href="#"
                               data-bs-toggle="dropdown">
                                @item.Name
                            </a>
                            <div class="dropdown-menu w-100 mt-0 border-0 rounded-0 shadow-lg">
                                <div class="container py-4">
                                    <div class="row">
                                        @{
                                            var columns = item.Children!.Chunk(4);
                                        }
                                        @foreach (var column in columns)
                                        {
                                            <div class="col-md-3">
                                                @foreach (var child in column)
                                                {
                                                    @if (child.ItemType == UmbNavItemType.Title)
                                                    {
                                                        <h6 class="dropdown-header text-uppercase">@child.Name</h6>
                                                    }
                                                    else
                                                    {
                                                        <a class="dropdown-item" href="@child.Url()">
                                                            @if (child.Image != null)
                                                            {
                                                                <img src="@child.Image.Url()?width=24" alt="" class="me-2" />
                                                            }
                                                            @child.Name
                                                            @if (!string.IsNullOrEmpty(child.Description))
                                                            {
                                                                <small class="d-block text-muted">@child.Description</small>
                                                            }
                                                        </a>
                                                    }
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </li>
                    }
                    else if (item.Children?.Any() == true)
                    {
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                @item.Name
                            </a>
                            <ul class="dropdown-menu">
                                @foreach (var child in item.Children!)
                                {
                                    <li><a class="dropdown-item" href="@child.Url()">@child.Name</a></li>
                                }
                            </ul>
                        </li>
                    }
                    else
                    {
                        <li class="nav-item">
                            <a class="nav-link" href="@item.Url()">@item.Name</a>
                        </li>
                    }
                }
            </ul>
        </div>
    </div>
</nav>

<style>
    .dropdown-menu.w-100 {
        animation: fadeIn 0.2s ease;
    }

    @@keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
```

## Bootstrap Footer

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var footerNav = home?.Value<IEnumerable<UmbNavItem>>("footerNavigation");
}

<footer class="bg-dark text-light py-5">
    <div class="container">
        <div class="row g-4">
            <!-- Brand Column -->
            <div class="col-lg-4">
                <a class="navbar-brand" href="@home?.Url()">
                    <img src="/images/logo-white.svg" alt="Logo" height="40" />
                </a>
                <p class="mt-3 text-muted">
                    Your company description goes here.
                </p>
            </div>

            <!-- Navigation Columns -->
            @if (footerNav != null)
            {
                foreach (var column in footerNav)
                {
                    <div class="col-6 col-lg-2">
                        <h5 class="text-uppercase mb-3 fs-6">@column.Name</h5>
                        @if (column.Children?.Any() == true)
                        {
                            <ul class="list-unstyled">
                                @foreach (var link in column.Children)
                                {
                                    <li class="mb-2">
                                        <a href="@link.Url()"
                                           class="text-muted text-decoration-none hover-white"
                                           target="@link.Target">
                                            @link.Name
                                        </a>
                                    </li>
                                }
                            </ul>
                        }
                    </div>
                }
            }
        </div>

        <hr class="my-4 border-secondary" />

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p class="mb-0 text-muted small">
                &copy; @DateTime.Now.Year Your Company. All rights reserved.
            </p>
            <div class="d-flex gap-3 mt-3 mt-md-0">
                <a href="/privacy" class="text-muted text-decoration-none small">Privacy Policy</a>
                <a href="/terms" class="text-muted text-decoration-none small">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>

<style>
    .hover-white:hover {
        color: white !important;
    }
</style>
```

## Custom Bootstrap TagHelper

Create a custom TagHelper that outputs Bootstrap-compatible markup:

### BootstrapUmbNavItemTagHelper.cs

```csharp
using Microsoft.AspNetCore.Razor.TagHelpers;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.UmbNav.Core.Enums;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.TagHelpers;

[HtmlTargetElement("bootstrap-navitem")]
public class BootstrapUmbNavItemTagHelper : UmbnavitemTagHelper
{
    /// <summary>
    /// Whether this is inside a dropdown menu
    /// </summary>
    public bool IsDropdownItem { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = GetTagName();

        var cssClass = IsDropdownItem ? "dropdown-item" : "nav-link";

        if (IsItemActive())
        {
            cssClass += " active";
        }

        if (!string.IsNullOrEmpty(MenuItem.CustomClasses))
        {
            cssClass += " " + MenuItem.CustomClasses;
        }

        output.Attributes.SetAttribute("class", cssClass);

        ProcessLink(output);
        ProcessTarget(output);
        ProcessRel(output);

        if (IsItemActive() && !IsDropdownItem)
        {
            output.Attributes.SetAttribute("aria-current", "page");
        }

        output.Content.SetContent(GetContent());
    }

    protected override string GetTagName()
    {
        return IsLabel ? "span" : "a";
    }
}
```

### Usage

```cshtml
<li class="nav-item">
    <bootstrap-navitem menu-item="@item"
                       current-page="@Model">
    </bootstrap-navitem>
</li>
```

## Complete Bootstrap View Component

### BootstrapNavigationViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class BootstrapNavigationViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public BootstrapNavigationViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke(
        string propertyAlias = "mainNavigation",
        string variant = "light", // light, dark
        bool sticky = true,
        bool fluid = false)
    {
        var context = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = context.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (home == null)
            return Content(string.Empty);

        var rawItems = home.Value<IEnumerable<UmbNavItem>>(propertyAlias);
        var options = new UmbNavBuildOptions { MaxDepth = 3 };
        var items = _menuBuilder.BuildMenu(rawItems, options);

        return View(new BootstrapNavigationViewModel
        {
            Items = items,
            CurrentPage = currentPage,
            Home = home,
            Variant = variant,
            IsSticky = sticky,
            IsFluid = fluid
        });
    }
}

public class BootstrapNavigationViewModel
{
    public IEnumerable<UmbNavItem> Items { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IPublishedContent? CurrentPage { get; set; }
    public IPublishedContent? Home { get; set; }
    public string Variant { get; set; } = "light";
    public bool IsSticky { get; set; } = true;
    public bool IsFluid { get; set; }
}
```

### Usage

```cshtml
@await Component.InvokeAsync("BootstrapNavigation", new {
    variant = "dark",
    sticky = true,
    fluid = false
})
```

## Next Steps

- [Tailwind Integration](tailwind-integration.md) - Tailwind CSS styling
- [Mobile Navigation](mobile-navigation.md) - Custom mobile menus
- [Mega Menu](mega-menu.md) - Complex mega menu layouts
