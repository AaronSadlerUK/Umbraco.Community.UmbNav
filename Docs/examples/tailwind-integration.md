# Tailwind CSS Integration

This example demonstrates integrating UmbNav with Tailwind CSS for styling navigation menus.

## Prerequisites

- Tailwind CSS installed and configured
- UmbNav package configured

## Basic Tailwind Navigation

### Razor Implementation

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
                <a href="@home?.Url()">
                    <img class="h-8 w-auto" src="/images/logo.svg" alt="Logo" />
                </a>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex md:items-center md:space-x-4">
                @if (navigation != null)
                {
                    foreach (var item in navigation)
                    {
                        @await Html.PartialAsync("_TailwindNavItem", item, new ViewDataDictionary(ViewData) { { "CurrentPage", Model } })
                    }
                }
            </div>

            <!-- Mobile menu button -->
            <div class="flex items-center md:hidden">
                <button type="button"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        aria-controls="mobile-menu"
                        aria-expanded="false"
                        x-data="{ open: false }"
                        @@click="open = !open">
                    <span class="sr-only">Open main menu</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</nav>
```

### _TailwindNavItem.cshtml

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
    <div class="relative" x-data="{ open: false }">
        <button type="button"
                class="@(isActive ? "text-indigo-600" : "text-gray-700") group inline-flex items-center px-3 py-2 text-sm font-medium hover:text-indigo-600 focus:outline-none"
                @@click="open = !open"
                @@click.away="open = false">
            <span>@Model.Name</span>
            <svg class="ml-2 h-4 w-4 transition-transform duration-200"
                 :class="{ 'rotate-180': open }"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div x-show="open"
             x-transition:enter="transition ease-out duration-100"
             x-transition:enter-start="transform opacity-0 scale-95"
             x-transition:enter-end="transform opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-75"
             x-transition:leave-start="transform opacity-100 scale-100"
             x-transition:leave-end="transform opacity-0 scale-95"
             class="absolute z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
             role="menu">
            @foreach (var child in Model.Children!)
            {
                @if (child.ItemType == UmbNavItemType.Title)
                {
                    <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        @child.Name
                    </div>
                }
                else
                {
                    <a href="@child.Url()"
                       class="block px-4 py-2 text-sm @(child.IsActive(currentPage) ? "bg-gray-100 text-indigo-600" : "text-gray-700 hover:bg-gray-100")"
                       role="menuitem">
                        @child.Name
                    </a>
                }
            }
        </div>
    </div>
}
else if (Model.ItemType == UmbNavItemType.Title)
{
    <span class="px-3 py-2 text-sm font-medium text-gray-500">@Model.Name</span>
}
else
{
    <a href="@Model.Url()"
       class="px-3 py-2 text-sm font-medium @(isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600")"
       target="@Model.Target"
       @(isActive ? "aria-current=page" : "")>
        @Model.Name
    </a>
}
```

## Tailwind Mobile Menu with Alpine.js

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var navigation = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="bg-white shadow-sm" x-data="{ mobileMenuOpen: false }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
                <a href="@home?.Url()">
                    <img class="h-8 w-auto" src="/images/logo.svg" alt="Logo" />
                </a>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex md:items-center md:space-x-4">
                @if (navigation != null)
                {
                    foreach (var item in navigation)
                    {
                        @await Html.PartialAsync("_TailwindNavItem", item, ViewData)
                    }
                }
            </div>

            <!-- Mobile menu button -->
            <div class="flex items-center md:hidden">
                <button type="button"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        @@click="mobileMenuOpen = !mobileMenuOpen"
                        :aria-expanded="mobileMenuOpen">
                    <span class="sr-only">Open main menu</span>
                    <!-- Hamburger icon -->
                    <svg x-show="!mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <!-- Close icon -->
                    <svg x-show="mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile menu -->
    <div class="md:hidden"
         x-show="mobileMenuOpen"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-1"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-1">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            @if (navigation != null)
            {
                foreach (var item in navigation)
                {
                    @await Html.PartialAsync("_TailwindMobileNavItem", item, ViewData)
                }
            }
        </div>
    </div>
</nav>
```

### _TailwindMobileNavItem.cshtml

```cshtml
@model Umbraco.Community.UmbNav.Core.Models.UmbNavItem
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var hasChildren = Model.Children?.Any() == true;
    var currentPage = ViewData["CurrentPage"] as Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent;
    var isActive = Model.IsActive(currentPage, includeDescendants: true);
    var itemId = $"mobile-{Model.Key}";
}

@if (hasChildren)
{
    <div x-data="{ expanded: false }">
        <div class="flex items-center justify-between">
            <a href="@Model.Url()"
               class="flex-1 block px-3 py-2 rounded-md text-base font-medium @(isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50")">
                @Model.Name
            </a>
            <button type="button"
                    class="px-3 py-2 text-gray-500 hover:text-gray-700"
                    @@click="expanded = !expanded"
                    :aria-expanded="expanded">
                <svg class="h-5 w-5 transition-transform duration-200"
                     :class="{ 'rotate-180': expanded }"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>

        <div x-show="expanded"
             x-collapse
             class="pl-4 space-y-1">
            @foreach (var child in Model.Children!)
            {
                @if (child.ItemType == UmbNavItemType.Title)
                {
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        @child.Name
                    </div>
                }
                else
                {
                    <a href="@child.Url()"
                       class="block px-3 py-2 rounded-md text-sm @(child.IsActive(currentPage) ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50")">
                        @child.Name
                    </a>
                }
            }
        </div>
    </div>
}
else if (Model.ItemType == UmbNavItemType.Title)
{
    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        @Model.Name
    </div>
}
else
{
    <a href="@Model.Url()"
       class="block px-3 py-2 rounded-md text-base font-medium @(isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50")"
       target="@Model.Target">
        @Model.Name
    </a>
}
```

## Tailwind Mega Menu

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var navigation = Model.Root()?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<nav class="bg-gray-900">
    <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a href="/" class="text-white font-bold text-xl">Brand</a>

            <!-- Navigation -->
            <div class="hidden lg:flex lg:items-center lg:space-x-1">
                @foreach (var item in navigation!)
                {
                    var isMega = item.Children?.Count() > 4;

                    if (isMega)
                    {
                        <div class="relative group" x-data="{ open: false }" @@mouseenter="open = true" @@mouseleave="open = false">
                            <button class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                @item.Name
                                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <!-- Mega Menu Panel -->
                            <div x-show="open"
                                 x-transition:enter="transition ease-out duration-200"
                                 x-transition:enter-start="opacity-0 translate-y-1"
                                 x-transition:enter-end="opacity-100 translate-y-0"
                                 x-transition:leave="transition ease-in duration-150"
                                 class="absolute left-1/2 -translate-x-1/2 z-20 mt-0 w-screen max-w-7xl">
                                <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div class="relative grid gap-8 bg-white p-8 lg:grid-cols-4">
                                        @foreach (var child in item.Children!)
                                        {
                                            <div>
                                                @if (child.ItemType == UmbNavItemType.Title)
                                                {
                                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                                        @child.Name
                                                    </p>
                                                }
                                                else
                                                {
                                                    <a href="@child.Url()" class="flex items-start p-3 -m-3 rounded-lg hover:bg-gray-50">
                                                        @if (child.Image != null)
                                                        {
                                                            <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                                                                <img src="@child.Image.Url()?width=24" alt="" class="h-6 w-6" />
                                                            </div>
                                                        }
                                                        <div class="@(child.Image != null ? "ml-4" : "")">
                                                            <p class="text-sm font-medium text-gray-900">@child.Name</p>
                                                            @if (!string.IsNullOrEmpty(child.Description))
                                                            {
                                                                <p class="mt-1 text-sm text-gray-500">@child.Description</p>
                                                            }
                                                        </div>
                                                    </a>
                                                }
                                            </div>
                                        }
                                    </div>

                                    @if (!string.IsNullOrEmpty(item.Description))
                                    {
                                        <div class="bg-gray-50 px-8 py-4">
                                            <p class="text-sm text-gray-500">@item.Description</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    else if (item.Children?.Any() == true)
                    {
                        <!-- Regular Dropdown -->
                        <div class="relative" x-data="{ open: false }" @@mouseenter="open = true" @@mouseleave="open = false">
                            <button class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                @item.Name
                                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div x-show="open"
                                 x-transition
                                 class="absolute left-0 z-10 mt-0 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                @foreach (var child in item.Children!)
                                {
                                    <a href="@child.Url()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        @child.Name
                                    </a>
                                }
                            </div>
                        </div>
                    }
                    else
                    {
                        <a href="@item.Url()" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                            @item.Name
                        </a>
                    }
                }
            </div>
        </div>
    </div>
</nav>
```

## Tailwind Footer

```cshtml
@using Umbraco.Community.UmbNav.Core.Models

@{
    var home = Model.Root();
    var footerNav = home?.Value<IEnumerable<UmbNavItem>>("footerNavigation");
}

<footer class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div class="xl:grid xl:grid-cols-3 xl:gap-8">
            <!-- Brand -->
            <div class="space-y-8 xl:col-span-1">
                <a href="@home?.Url()">
                    <img class="h-10" src="/images/logo-white.svg" alt="Logo" />
                </a>
                <p class="text-gray-400 text-base">
                    Making the world a better place through constructing elegant hierarchies.
                </p>
                <div class="flex space-x-6">
                    <a href="#" class="text-gray-400 hover:text-gray-300">
                        <span class="sr-only">Facebook</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">...</svg>
                    </a>
                    <!-- More social icons -->
                </div>
            </div>

            <!-- Navigation Columns -->
            @if (footerNav?.Any() == true)
            {
                <div class="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                    <div class="md:grid md:grid-cols-2 md:gap-8">
                        @foreach (var column in footerNav.Take(2))
                        {
                            <div class="@(column != footerNav.First() ? "mt-12 md:mt-0" : "")">
                                <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                    @column.Name
                                </h3>
                                @if (column.Children?.Any() == true)
                                {
                                    <ul role="list" class="mt-4 space-y-4">
                                        @foreach (var link in column.Children)
                                        {
                                            <li>
                                                <a href="@link.Url()"
                                                   class="text-base text-gray-300 hover:text-white"
                                                   target="@link.Target">
                                                    @link.Name
                                                </a>
                                            </li>
                                        }
                                    </ul>
                                }
                            </div>
                        }
                    </div>
                    <div class="md:grid md:grid-cols-2 md:gap-8">
                        @foreach (var column in footerNav.Skip(2).Take(2))
                        {
                            <div class="@(column != footerNav.Skip(2).First() ? "mt-12 md:mt-0" : "")">
                                <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                    @column.Name
                                </h3>
                                @if (column.Children?.Any() == true)
                                {
                                    <ul role="list" class="mt-4 space-y-4">
                                        @foreach (var link in column.Children)
                                        {
                                            <li>
                                                <a href="@link.Url()"
                                                   class="text-base text-gray-300 hover:text-white">
                                                    @link.Name
                                                </a>
                                            </li>
                                        }
                                    </ul>
                                }
                            </div>
                        }
                    </div>
                </div>
            }
        </div>

        <div class="mt-12 border-t border-gray-700 pt-8">
            <p class="text-base text-gray-400 xl:text-center">
                &copy; @DateTime.Now.Year Your Company, Inc. All rights reserved.
            </p>
        </div>
    </div>
</footer>
```

## Tailwind Component Classes

Add these custom utilities to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      // Custom animations for menus
      animation: {
        'fade-in-down': 'fadeInDown 0.2s ease-out',
        'fade-out-up': 'fadeOutUp 0.15s ease-in',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOutUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    // Plugin for x-collapse (Alpine.js integration)
    require('@tailwindcss/forms'),
  ],
}
```

## Next Steps

- [Bootstrap Integration](bootstrap-integration.md) - Bootstrap styling
- [Mobile Navigation](mobile-navigation.md) - Mobile menu patterns
- [Mega Menu](mega-menu.md) - Complex navigation layouts
