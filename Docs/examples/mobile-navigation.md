# Mobile Navigation

This example demonstrates creating responsive mobile navigation menus including hamburger menus, slide-out panels, and accordion navigation.

## Overview

Mobile navigation typically features:
- Hamburger menu trigger
- Slide-out or overlay panel
- Accordion-style nested items
- Touch-friendly interactions
- Accessibility support

## Basic Mobile Menu

### HTML Structure

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<!-- Mobile Header -->
<header class="mobile-header">
    <a href="@home?.Url()" class="mobile-header__logo">
        <img src="/images/logo.svg" alt="Site Logo" />
    </a>

    <button class="mobile-header__toggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="mobile-nav">
        <span class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </span>
    </button>
</header>

<!-- Mobile Navigation Panel -->
<nav id="mobile-nav" class="mobile-nav" aria-label="Main navigation" hidden>
    <div class="mobile-nav__header">
        <span class="mobile-nav__title">Menu</span>
        <button class="mobile-nav__close" aria-label="Close menu">
            <span>&times;</span>
        </button>
    </div>

    <ul class="mobile-nav__list">
        @if (navigation != null)
        {
            foreach (var item in navigation)
            {
                @await Html.PartialAsync("_MobileNavItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Model } })
            }
        }
    </ul>
</nav>

<!-- Overlay -->
<div class="mobile-nav__overlay" hidden></div>
```

### _MobileNavItem.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var currentPage = ViewData["CurrentPage"] as Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent;
    var isActive = Model.IsActive(currentPage, includeDescendants: true);
    var itemId = Guid.NewGuid().ToString("N")[..8];
}

<li class="mobile-nav__item @(hasChildren ? "has-children" : "") @(isActive ? "active" : "")">
    <div class="mobile-nav__item-row">
        @if (Model.ItemType == UmbNavItemType.Title)
        {
            <span class="mobile-nav__link mobile-nav__link--label">@Model.Name</span>
        }
        else
        {
            <a href="@Model.Url()"
               class="mobile-nav__link @(isActive ? "active" : "")"
               target="@Model.Target">
                @if (Model.Image != null)
                {
                    <img src="@Model.Image.Url()?width=24&height=24" alt="" class="mobile-nav__icon" />
                }
                <span>@Model.Name</span>
            </a>
        }

        @if (hasChildren)
        {
            <button class="mobile-nav__expand"
                    aria-expanded="false"
                    aria-controls="submenu-@itemId"
                    aria-label="Expand @Model.Name submenu">
                <span class="mobile-nav__arrow"></span>
            </button>
        }
    </div>

    @if (hasChildren)
    {
        <ul id="submenu-@itemId" class="mobile-nav__submenu" hidden>
            @foreach (var child in Model.Children!)
            {
                @await Html.PartialAsync("_MobileNavItem", child, ViewData)
            }
        </ul>
    }
</li>
```

### CSS

```css
/* Mobile Header */
.mobile-header {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 0 1rem;
    align-items: center;
    justify-content: space-between;
}

@media (max-width: 768px) {
    .mobile-header {
        display: flex;
    }

    /* Hide desktop nav */
    .desktop-nav {
        display: none;
    }

    /* Add padding for fixed header */
    body {
        padding-top: 60px;
    }
}

.mobile-header__logo img {
    height: 40px;
    width: auto;
}

/* Hamburger Button */
.mobile-header__toggle {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
}

.hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 24px;
}

.hamburger span {
    display: block;
    height: 2px;
    background-color: #333;
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
}

/* Hamburger animation */
.mobile-header__toggle[aria-expanded="true"] .hamburger span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}

.mobile-header__toggle[aria-expanded="true"] .hamburger span:nth-child(2) {
    opacity: 0;
}

.mobile-header__toggle[aria-expanded="true"] .hamburger span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Navigation Panel */
.mobile-nav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    max-width: 85vw;
    background-color: #fff;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.mobile-nav:not([hidden]) {
    transform: translateX(0);
}

.mobile-nav__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.mobile-nav__title {
    font-weight: 600;
    font-size: 1.1rem;
}

.mobile-nav__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    color: #666;
}

/* Navigation List */
.mobile-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
}

.mobile-nav__item {
    border-bottom: 1px solid #f0f0f0;
}

.mobile-nav__item-row {
    display: flex;
    align-items: stretch;
}

.mobile-nav__link {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    color: #333;
    text-decoration: none;
    font-size: 1rem;
}

.mobile-nav__link--label {
    color: #666;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.mobile-nav__link.active {
    color: #007bff;
    font-weight: 500;
}

.mobile-nav__icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
}

/* Expand Button */
.mobile-nav__expand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    background: none;
    border: none;
    border-left: 1px solid #f0f0f0;
    cursor: pointer;
}

.mobile-nav__arrow {
    display: block;
    width: 10px;
    height: 10px;
    border: solid #666;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    transition: transform 0.2s;
}

.mobile-nav__expand[aria-expanded="true"] .mobile-nav__arrow {
    transform: rotate(-135deg);
}

/* Submenu */
.mobile-nav__submenu {
    list-style: none;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.mobile-nav__submenu:not([hidden]) {
    max-height: 500px; /* Adjust based on content */
}

.mobile-nav__submenu .mobile-nav__link {
    padding-left: 2rem;
    font-size: 0.9rem;
}

.mobile-nav__submenu .mobile-nav__submenu .mobile-nav__link {
    padding-left: 3rem;
}

/* Overlay */
.mobile-nav__overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
}

.mobile-nav__overlay:not([hidden]) {
    opacity: 1;
}

/* Active item styling */
.mobile-nav__item.active > .mobile-nav__item-row {
    background-color: #f0f7ff;
}
```

### JavaScript

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.mobile-header__toggle');
    const nav = document.getElementById('mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav__close');
    const overlay = document.querySelector('.mobile-nav__overlay');
    const expandBtns = document.querySelectorAll('.mobile-nav__expand');

    // Open menu
    function openMenu() {
        nav.hidden = false;
        overlay.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        // Focus first link
        setTimeout(() => {
            nav.querySelector('.mobile-nav__link')?.focus();
        }, 300);
    }

    // Close menu
    function closeMenu() {
        nav.hidden = true;
        overlay.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
    }

    // Toggle button
    toggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close button
    closeBtn.addEventListener('click', closeMenu);

    // Overlay click
    overlay.addEventListener('click', closeMenu);

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !nav.hidden) {
            closeMenu();
        }
    });

    // Submenu expand/collapse
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const submenu = document.getElementById(this.getAttribute('aria-controls'));

            // Close other submenus at the same level
            const siblings = this.closest('.mobile-nav__list')
                .querySelectorAll(':scope > .has-children > .mobile-nav__item-row > .mobile-nav__expand');

            siblings.forEach(sibling => {
                if (sibling !== this && sibling.getAttribute('aria-expanded') === 'true') {
                    sibling.setAttribute('aria-expanded', 'false');
                    document.getElementById(sibling.getAttribute('aria-controls')).hidden = true;
                }
            });

            // Toggle this submenu
            this.setAttribute('aria-expanded', !isExpanded);
            submenu.hidden = isExpanded;
        });
    });

    // Close menu when link is clicked
    nav.querySelectorAll('.mobile-nav__link:not(.mobile-nav__link--label)').forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
});
```

## Slide-Out Panel with Push Effect

```css
/* Push content when menu opens */
.site-wrapper {
    transition: transform 0.3s ease;
}

.menu-open .site-wrapper {
    transform: translateX(300px);
}

.menu-open .mobile-nav {
    transform: translateX(0);
}

/* Right-side menu alternative */
.mobile-nav--right {
    left: auto;
    right: 0;
    transform: translateX(100%);
}

.mobile-nav--right:not([hidden]) {
    transform: translateX(0);
}
```

## Full-Screen Overlay Menu

```css
.mobile-nav--fullscreen {
    width: 100%;
    max-width: 100%;
    background-color: #1a1a2e;
    color: #fff;
    transform: translateY(-100%);
}

.mobile-nav--fullscreen:not([hidden]) {
    transform: translateY(0);
}

.mobile-nav--fullscreen .mobile-nav__header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.mobile-nav--fullscreen .mobile-nav__title {
    color: #fff;
}

.mobile-nav--fullscreen .mobile-nav__close {
    color: #fff;
}

.mobile-nav--fullscreen .mobile-nav__link {
    color: #fff;
    font-size: 1.25rem;
    padding: 1.25rem 1.5rem;
    justify-content: center;
}

.mobile-nav--fullscreen .mobile-nav__item {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.mobile-nav--fullscreen .mobile-nav__submenu {
    background-color: rgba(0, 0, 0, 0.2);
}
```

## Bottom Sheet Navigation

For a bottom-sheet style mobile menu:

```cshtml
<nav id="mobile-nav" class="mobile-nav mobile-nav--bottom-sheet" hidden>
    <div class="mobile-nav__handle" aria-hidden="true"></div>

    <ul class="mobile-nav__list">
        @foreach (var item in navigation)
        {
            <li class="mobile-nav__item">
                <a href="@item.Url()" class="mobile-nav__link">
                    @if (item.Image != null)
                    {
                        <img src="@item.Image.Url()?width=24" alt="" class="mobile-nav__icon" />
                    }
                    <span>@item.Name</span>
                </a>
            </li>
        }
    </ul>
</nav>
```

```css
.mobile-nav--bottom-sheet {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    max-height: 70vh;
    border-radius: 16px 16px 0 0;
    transform: translateY(100%);
}

.mobile-nav--bottom-sheet:not([hidden]) {
    transform: translateY(0);
}

.mobile-nav__handle {
    width: 40px;
    height: 4px;
    background-color: #ddd;
    border-radius: 2px;
    margin: 12px auto;
}

.mobile-nav--bottom-sheet .mobile-nav__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    padding: 1rem;
}

.mobile-nav--bottom-sheet .mobile-nav__item {
    border: none;
}

.mobile-nav--bottom-sheet .mobile-nav__link {
    flex-direction: column;
    text-align: center;
    padding: 1rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 8px;
}

.mobile-nav--bottom-sheet .mobile-nav__link:hover {
    background-color: #f5f5f5;
}

.mobile-nav--bottom-sheet .mobile-nav__icon {
    width: 32px;
    height: 32px;
    margin-bottom: 0.5rem;
}
```

## View Component Implementation

### MobileNavigationViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class MobileNavigationViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public MobileNavigationViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke(
        string propertyAlias = "mainNavigation",
        string style = "slide-out") // slide-out, fullscreen, bottom-sheet
    {
        var context = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = context.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (home == null)
        {
            return Content(string.Empty);
        }

        var rawItems = home.Value<IEnumerable<UmbNavItem>>(propertyAlias);
        var options = new UmbNavBuildOptions { MaxDepth = 3 };
        var items = _menuBuilder.BuildMenu(rawItems, options);

        var model = new MobileNavigationViewModel
        {
            Items = items,
            CurrentPage = currentPage,
            Home = home,
            Style = style
        };

        return View(model);
    }
}

public class MobileNavigationViewModel
{
    public IEnumerable<UmbNavItem> Items { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IPublishedContent? CurrentPage { get; set; }
    public IPublishedContent? Home { get; set; }
    public string Style { get; set; } = "slide-out";
}
```

### Usage

```cshtml
@await Component.InvokeAsync("MobileNavigation", new { style = "slide-out" })
```

## Accessibility Best Practices

1. **Use proper ARIA attributes**
   - `aria-expanded` for toggle buttons
   - `aria-controls` linking to menu IDs
   - `aria-label` for icon-only buttons
   - `hidden` attribute for hidden menus

2. **Keyboard navigation**
   - Escape key closes menu
   - Tab moves through links
   - Enter/Space activates buttons

3. **Focus management**
   - Focus first item when menu opens
   - Return focus to trigger when closed
   - Trap focus within open menu

4. **Screen reader support**
   - Clear menu/close button labels
   - Meaningful link text
   - Status announcements

```javascript
// Focus trap for accessibility
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}
```

## Next Steps

- [Multi-Level Dropdown](multi-level-dropdown.md) - Desktop dropdown menus
- [Mega Menu](mega-menu.md) - Complex desktop navigation
- [Bootstrap Integration](bootstrap-integration.md) - Bootstrap offcanvas
