# Mega Menu

This example demonstrates implementing a complex mega menu with multiple columns, images, and featured content.

## Overview

Mega menus are large dropdown panels that display multiple levels of navigation in a structured layout. They're ideal for sites with extensive navigation requirements.

## Data Type Configuration

Configure your Data Type for mega menu support:

| Setting | Value |
|---------|-------|
| Maximum Depth | 3+ |
| Allow Text Items | Yes (for column headers) |
| Allow Images | Yes (for featured items) |
| Allow Custom Classes | Yes (for column layout) |
| Allow Description | Yes (for item descriptions) |

## Basic Mega Menu

### Structure Convention

Use custom classes to define layout:
- `mega-column` - Creates a new column
- `mega-featured` - Featured/highlighted item
- `mega-full-width` - Spans full width

### Razor Implementation

#### _MegaMenu.cshtml

```cshtml
@model IEnumerable<Umbraco.Community.UmbNav.Core.Models.UmbNavItem>
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@if (Model?.Any() == true)
{
    <nav class="mega-nav" aria-label="Main navigation">
        <ul class="mega-nav__list">
            @foreach (var item in Model)
            {
                var hasChildren = item.Children?.Any() == true;
                var isMegaMenu = hasChildren && item.Children!.Count() > 3;

                <li class="mega-nav__item @(isMegaMenu ? "mega-nav__item--mega" : hasChildren ? "mega-nav__item--dropdown" : "")">
                    <umbnavitem menu-item="@item"
                                active-class="active"
                                current-page="@Umbraco.AssignedContentItem"
                                is-active-ancestor-check="true">
                    </umbnavitem>

                    @if (hasChildren)
                    {
                        <span class="mega-nav__arrow" aria-hidden="true"></span>
                    }

                    @if (hasChildren)
                    {
                        if (isMegaMenu)
                        {
                            @await Html.PartialAsync("_MegaMenuPanel", item)
                        }
                        else
                        {
                            @await Html.PartialAsync("_DropdownMenu", item.Children)
                        }
                    }
                </li>
            }
        </ul>
    </nav>
}
```

#### _MegaMenuPanel.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

<div class="mega-panel" role="menu">
    <div class="mega-panel__container">
        <div class="mega-panel__columns">
            @{
                var groupedItems = GroupIntoColumns(Model.Children!);
            }

            @foreach (var column in groupedItems)
            {
                <div class="mega-panel__column">
                    @foreach (var item in column)
                    {
                        @if (item.ItemType == UmbNavItemType.Title)
                        {
                            <div class="mega-panel__header">
                                <span class="mega-panel__header-text">@item.Name</span>
                                @if (!string.IsNullOrEmpty(item.Description))
                                {
                                    <span class="mega-panel__header-desc">@item.Description</span>
                                }
                            </div>
                        }
                        else if (item.CustomClasses?.Contains("mega-featured") == true)
                        {
                            @await Html.PartialAsync("_MegaMenuFeatured", item)
                        }
                        else
                        {
                            <a href="@item.Url()"
                               class="mega-panel__link @item.CustomClasses"
                               target="@item.Target">
                                @if (item.Image != null)
                                {
                                    <img src="@item.Image.Url()?width=40&height=40"
                                         alt="" class="mega-panel__icon" />
                                }
                                <div class="mega-panel__link-content">
                                    <span class="mega-panel__link-name">@item.Name</span>
                                    @if (!string.IsNullOrEmpty(item.Description))
                                    {
                                        <span class="mega-panel__link-desc">@item.Description</span>
                                    }
                                </div>
                            </a>
                        }
                    }
                </div>
            }
        </div>

        @if (Model.Image != null || !string.IsNullOrEmpty(Model.Description))
        {
            <div class="mega-panel__promo">
                @if (Model.Image != null)
                {
                    <img src="@Model.Image.Url()?width=300&height=200"
                         alt="@Model.Name" class="mega-panel__promo-image" />
                }
                @if (!string.IsNullOrEmpty(Model.Description))
                {
                    <p class="mega-panel__promo-text">@Model.Description</p>
                }
                <a href="@Model.Url()" class="mega-panel__promo-link">
                    Learn more <span aria-hidden="true">&rarr;</span>
                </a>
            </div>
        }
    </div>
</div>

@functions {
    private List<List<UmbNavItem>> GroupIntoColumns(IEnumerable<UmbNavItem> items)
    {
        var columns = new List<List<UmbNavItem>>();
        var currentColumn = new List<UmbNavItem>();

        foreach (var item in items)
        {
            if (item.CustomClasses?.Contains("mega-column") == true && currentColumn.Any())
            {
                columns.Add(currentColumn);
                currentColumn = new List<UmbNavItem>();
            }
            currentColumn.Add(item);
        }

        if (currentColumn.Any())
        {
            columns.Add(currentColumn);
        }

        return columns;
    }
}
```

#### _MegaMenuFeatured.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem

<a href="@Model.Url()" class="mega-featured" target="@Model.Target">
    @if (Model.Image != null)
    {
        <div class="mega-featured__image-wrapper">
            <img src="@Model.Image.Url()?width=280&height=160&mode=crop"
                 alt="@Model.Name"
                 class="mega-featured__image" />
        </div>
    }
    <div class="mega-featured__content">
        <span class="mega-featured__name">@Model.Name</span>
        @if (!string.IsNullOrEmpty(Model.Description))
        {
            <span class="mega-featured__desc">@Model.Description</span>
        }
    </div>
</a>
```

### CSS

```css
/* Main Navigation */
.mega-nav {
    background-color: #fff;
    border-bottom: 1px solid #e5e5e5;
    position: relative;
    z-index: 1000;
}

.mega-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
}

.mega-nav__item {
    position: static; /* Important for mega menu positioning */
}

.mega-nav__item > a {
    display: flex;
    align-items: center;
    padding: 1.25rem 1.5rem;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.mega-nav__item > a:hover,
.mega-nav__item > a.active {
    color: #007bff;
}

.mega-nav__arrow {
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    margin-left: 0.5rem;
    transform: rotate(45deg);
    transition: transform 0.2s;
}

/* Mega Panel */
.mega-panel {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-top: 3px solid #007bff;
}

.mega-nav__item--mega:hover .mega-panel,
.mega-nav__item--mega:focus-within .mega-panel {
    display: block;
}

.mega-nav__item--mega:hover .mega-nav__arrow {
    transform: rotate(-135deg);
}

.mega-panel__container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    gap: 2rem;
}

.mega-panel__columns {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.mega-panel__column {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

/* Column Headers */
.mega-panel__header {
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.mega-panel__header-text {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #333;
}

.mega-panel__header-desc {
    display: block;
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.25rem;
}

/* Links */
.mega-panel__link {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    color: #333;
    text-decoration: none;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.mega-panel__link:hover {
    background-color: #f5f5f5;
}

.mega-panel__icon {
    flex-shrink: 0;
    border-radius: 6px;
}

.mega-panel__link-content {
    display: flex;
    flex-direction: column;
}

.mega-panel__link-name {
    font-weight: 500;
    color: #333;
}

.mega-panel__link-desc {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
    line-height: 1.4;
}

/* Featured Items */
.mega-featured {
    display: block;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
}

.mega-featured:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mega-featured__image-wrapper {
    margin: -1rem -1rem 1rem -1rem;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
}

.mega-featured__image {
    width: 100%;
    height: auto;
    display: block;
}

.mega-featured__content {
    display: flex;
    flex-direction: column;
}

.mega-featured__name {
    font-weight: 600;
    color: #333;
}

.mega-featured__desc {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.5rem;
    line-height: 1.4;
}

/* Promo Section */
.mega-panel__promo {
    flex-shrink: 0;
    width: 300px;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;
    display: flex;
    flex-direction: column;
}

.mega-panel__promo-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.mega-panel__promo-text {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

.mega-panel__promo-link {
    margin-top: auto;
    color: #fff;
    font-weight: 500;
    text-decoration: none;
}

.mega-panel__promo-link:hover {
    text-decoration: underline;
}

/* Regular Dropdown (for items with fewer children) */
.mega-nav__item--dropdown {
    position: relative;
}

.mega-nav__item--dropdown .dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;
    border-radius: 4px;
}

.mega-nav__item--dropdown:hover .dropdown-menu {
    display: block;
}
```

## Advanced: Category-Based Mega Menu

For e-commerce or content-heavy sites with categories:

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models

<div class="mega-panel mega-panel--categories">
    <div class="mega-panel__sidebar">
        <ul class="category-list" role="tablist">
            @{
                var index = 0;
            }
            @foreach (var category in Model.Children!)
            {
                <li class="category-list__item @(index == 0 ? "active" : "")"
                    role="tab"
                    data-category="@category.Key">
                    <span class="category-list__name">@category.Name</span>
                    @if (category.Children?.Any() == true)
                    {
                        <span class="category-list__count">@category.Children.Count()</span>
                    }
                </li>
                index++;
            }
        </ul>
    </div>

    <div class="mega-panel__content">
        @{
            index = 0;
        }
        @foreach (var category in Model.Children!)
        {
            <div class="category-content @(index == 0 ? "active" : "")"
                 data-category="@category.Key"
                 role="tabpanel">
                <div class="category-content__header">
                    <h3 class="category-content__title">@category.Name</h3>
                    @if (!string.IsNullOrEmpty(category.Description))
                    {
                        <p class="category-content__desc">@category.Description</p>
                    }
                    <a href="@category.Url()" class="category-content__link">
                        View all @category.Name &rarr;
                    </a>
                </div>

                @if (category.Children?.Any() == true)
                {
                    <div class="category-content__grid">
                        @foreach (var item in category.Children)
                        {
                            <a href="@item.Url()" class="category-item">
                                @if (item.Image != null)
                                {
                                    <img src="@item.Image.Url()?width=80&height=80&mode=crop"
                                         alt="" class="category-item__image" />
                                }
                                <span class="category-item__name">@item.Name</span>
                            </a>
                        }
                    </div>
                }
            </div>
            index++;
        }
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.category-list__item');
    const panels = document.querySelectorAll('.category-content');

    tabs.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            const categoryId = this.dataset.category;

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update panels
            panels.forEach(p => {
                p.classList.toggle('active', p.dataset.category === categoryId);
            });
        });
    });
});
</script>
```

```css
.mega-panel--categories {
    display: flex;
}

.mega-panel__sidebar {
    width: 250px;
    background-color: #f8f9fa;
    border-right: 1px solid #e5e5e5;
}

.category-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.category-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.category-list__item:hover,
.category-list__item.active {
    background-color: #fff;
}

.category-list__item.active {
    border-right: 3px solid #007bff;
}

.category-list__count {
    background-color: #e5e5e5;
    color: #666;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
}

.mega-panel__content {
    flex: 1;
    padding: 1.5rem;
}

.category-content {
    display: none;
}

.category-content.active {
    display: block;
}

.category-content__header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
}

.category-content__title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
}

.category-content__desc {
    margin: 0 0 0.75rem 0;
    color: #666;
}

.category-content__link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
}

.category-content__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    text-decoration: none;
    color: #333;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.category-item:hover {
    background-color: #f5f5f5;
}

.category-item__image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.category-item__name {
    font-size: 0.875rem;
}
```

## Responsive Mega Menu

Add responsive behavior:

```css
@media (max-width: 1024px) {
    .mega-nav__list {
        display: none;
    }

    .mega-nav.is-open .mega-nav__list {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .mega-panel {
        position: static;
        box-shadow: none;
        border-top: none;
    }

    .mega-panel__container {
        flex-direction: column;
        padding: 1rem;
    }

    .mega-panel__columns {
        grid-template-columns: 1fr;
    }

    .mega-panel__promo {
        width: 100%;
    }

    .mega-panel--categories {
        flex-direction: column;
    }

    .mega-panel__sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e5e5e5;
    }

    .category-list {
        display: flex;
        overflow-x: auto;
    }

    .category-list__item {
        white-space: nowrap;
    }
}
```

## Next Steps

- [Mobile Navigation](mobile-navigation.md) - Full mobile menu implementation
- [Extending Components](../extensibility/frontend/extending-components.md) - Customize menu items
- [Menu Builder Service](../rendering/menu-builder-service.md) - Advanced processing
