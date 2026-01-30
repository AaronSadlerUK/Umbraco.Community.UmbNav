# Getting Started

This guide will walk you through setting up UmbNav in your Umbraco site, from installation to rendering your first navigation menu.

## Prerequisites

- Umbraco 17.0.0 or higher
- .NET 10.0 or higher
- Visual Studio 2022 or VS Code (recommended)

## Step 1: Install UmbNav

Install via NuGet Package Manager:

```bash
# Full package (UI + Core)
dotnet add package Umbraco.Community.UmbNav

# Or just the core (for headless/API scenarios)
dotnet add package Umbraco.Community.UmbNav.Core
```

Or via Package Manager Console in Visual Studio:

```powershell
Install-Package Umbraco.Community.UmbNav
```

## Step 2: Create a Data Type

1. Log into the Umbraco backoffice
2. Navigate to **Settings** → **Data Types**
3. Click **Create** → **New Data Type**
4. Enter a name (e.g., "Main Navigation")
5. Select **UmbNav** from the Property Editor dropdown
6. Configure the options as needed (see [Configuration](configuration.md))
7. Click **Save**

## Step 3: Add to a Document Type

1. Navigate to **Settings** → **Document Types**
2. Edit your "Home" or "Site Settings" document type
3. Add a new property using your UmbNav Data Type
4. Save the document type

## Step 4: Build Your Menu

1. Navigate to **Content** in the backoffice
2. Edit the node where you added the UmbNav property
3. Use the interface to build your menu:
   - Click **Add** to add new items
   - Choose between **Content**, **Link**, or **Text** items
   - Drag and drop to reorder
   - Nest items by dragging them under parent items
4. Save and publish

## Step 5: Render the Menu

Create or edit a Razor view (e.g., `Views/Partials/Navigation.cshtml`):

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.TagHelpers
@{
    // Get the home/settings node
    var home = Umbraco.ContentAtRoot().FirstOrDefault();
    var menuItems = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

@if (menuItems?.Any() == true)
{
    <nav class="main-navigation" aria-label="Main navigation">
        <ul class="nav-list">
            @foreach (var item in menuItems)
            {
                <li class="nav-item @(item.Children?.Any() == true ? "has-children" : "")">
                    <umbnavitem
                        menu-item="@item"
                        active-class="active"
                        current-page="@Model"
                        is-active-ancestor-check="true">
                    </umbnavitem>

                    @if (item.Children?.Any() == true)
                    {
                        <ul class="nav-submenu">
                            @foreach (var child in item.Children)
                            {
                                <li class="nav-item">
                                    <umbnavitem
                                        menu-item="@child"
                                        active-class="active"
                                        current-page="@Model"
                                        is-active-ancestor-check="true">
                                    </umbnavitem>
                                </li>
                            }
                        </ul>
                    }
                </li>
            }
        </ul>
    </nav>
}
```

Include the partial in your layout:

```cshtml
@await Html.PartialAsync("Navigation")
```

## Understanding Menu Item Types

UmbNav supports three types of menu items:

### Content Items (Document)

Links to Umbraco content nodes. The URL is automatically resolved from the content, supporting multi-language sites and URL changes.

**Best for:** Internal site pages, blog posts, product pages

### Link Items

External URLs or custom links. You have full control over the URL.

**Best for:** External websites, anchor links, mailto: links, tel: links

### Text Items (Labels)

Non-clickable text labels. Useful for grouping items or creating mega menu headings.

**Best for:** Menu section headings, category labels in mega menus

## What's Next?

- [Configuration](configuration.md) - Learn about all configuration options
- [TagHelper Reference](rendering/taghelper.md) - Detailed TagHelper documentation
- [Examples](examples/basic-navigation.md) - See complete implementation examples
- [Extensibility](extensibility/overview.md) - Customize UmbNav for your needs

## Troubleshooting

### Menu items not appearing

1. Ensure the content is published
2. Check that `umbracoNaviHide` is not set on the content
3. Verify the property alias matches your code

### Active state not working

Make sure you're passing `current-page="@Model"` and `is-active-ancestor-check="true"` to the TagHelper.

### Images not showing

1. Ensure "Allow Image/Icon" is enabled in the Data Type configuration
2. Verify the media item exists and is published

For more help, [create an issue on GitHub](https://github.com/AaronSadlerUK/Umbraco.Community.UmbNav/issues).
