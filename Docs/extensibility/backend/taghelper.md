# Extending the TagHelper

The `UmbnavitemTagHelper` can be extended to customize how menu items are rendered in Razor views.

## Basic Extension

```csharp
using Microsoft.AspNetCore.Razor.TagHelpers;
using Umbraco.Community.UmbNav.Core.TagHelpers;

[HtmlTargetElement("custom-umbnavitem")]
public class CustomUmbNavItemTagHelper : UmbnavitemTagHelper
{
    // Your customizations here
}
```

## Override Points

### GetTagName

Control which HTML tag is rendered:

```csharp
protected override string GetTagName()
{
    // Use <button> for certain items
    if (MenuItem.CustomClasses?.Contains("button") == true)
    {
        return "button";
    }

    return base.GetTagName();
}
```

### GetContent

Customize the text content:

```csharp
protected override string? GetContent()
{
    var name = base.GetContent();

    // Add icon prefix based on item type
    return MenuItem.ItemType switch
    {
        UmbNavItemType.Link => $"🔗 {name}",
        UmbNavItemType.Document => $"📄 {name}",
        UmbNavItemType.Title => $"📌 {name}",
        _ => name
    };
}
```

### GetUrl

Customize URL generation:

```csharp
protected override string? GetUrl()
{
    var url = base.GetUrl();

    if (url == null)
        return null;

    // Add tracking parameters
    var separator = url.Contains('?') ? '&' : '?';
    return $"{url}{separator}utm_source=nav&utm_medium=menu";
}
```

### IsItemActive

Customize active state detection:

```csharp
protected override bool IsItemActive()
{
    // Always mark "Home" as active on homepage
    if (MenuItem.Name == "Home" && CurrentPage?.Id == GetHomepageId())
    {
        return true;
    }

    // Check for custom active indicator
    if (MenuItem.CustomClasses?.Contains("force-active") == true)
    {
        return true;
    }

    return base.IsItemActive();
}
```

### ProcessLink

Customize the href attribute:

```csharp
protected override void ProcessLink(TagHelperOutput output)
{
    if (!IsLabel)
    {
        var url = GetUrl();

        // Add hash for single-page app routing
        if (MenuItem.CustomClasses?.Contains("spa-link") == true)
        {
            url = $"#{url?.TrimStart('/')}";
        }

        output.Attributes.SetAttribute("href", url);
    }
}
```

### ProcessClasses

Customize CSS class output:

```csharp
protected override void ProcessClasses(TagHelperOutput output)
{
    base.ProcessClasses(output);

    // Add item type class
    output.AddClass($"nav-item--{MenuItem.ItemType.ToString().ToLower()}", HtmlEncoder.Default);

    // Add depth class
    output.AddClass($"nav-item--level-{MenuItem.Level}", HtmlEncoder.Default);

    // Add special classes
    if (MenuItem.Children?.Any() == true)
    {
        output.AddClass("has-children", HtmlEncoder.Default);
    }
}
```

### ProcessActiveState

Customize active class application:

```csharp
protected override void ProcessActiveState(TagHelperOutput output)
{
    if (IsItemActive())
    {
        // Add multiple classes for active state
        output.AddClass(ActiveClass!, HtmlEncoder.Default);
        output.AddClass("current", HtmlEncoder.Default);

        // Add ARIA attribute
        output.Attributes.SetAttribute("aria-current", "page");
    }
}
```

### ProcessTarget

Customize target attribute:

```csharp
protected override void ProcessTarget(TagHelperOutput output)
{
    if (!string.IsNullOrEmpty(MenuItem.Target) && !IsLabel)
    {
        output.Attributes.SetAttribute("target", MenuItem.Target);

        // Add accessibility warning for new windows
        if (MenuItem.Target == "_blank")
        {
            output.Attributes.SetAttribute("aria-label",
                $"{MenuItem.Name} (opens in new window)");
        }
    }
}
```

### ProcessRel

Customize rel attribute:

```csharp
protected override void ProcessRel(TagHelperOutput output)
{
    base.ProcessRel(output);

    // Always add noopener for external links
    if (MenuItem.Target == "_blank" && !IsLabel)
    {
        var currentRel = output.Attributes["rel"]?.Value?.ToString() ?? "";
        if (!currentRel.Contains("noopener"))
        {
            var newRel = string.IsNullOrEmpty(currentRel)
                ? "noopener"
                : $"{currentRel} noopener";
            output.Attributes.SetAttribute("rel", newRel);
        }
    }
}
```

### ProcessCustomAttributes

Add any custom attributes:

```csharp
protected override void ProcessCustomAttributes(TagHelperContext context, TagHelperOutput output)
{
    // Add data attributes for JavaScript
    output.Attributes.SetAttribute("data-nav-id", MenuItem.Key);
    output.Attributes.SetAttribute("data-nav-type", MenuItem.ItemType.ToString());

    // Add content key for analytics
    if (MenuItem.ContentKey.HasValue)
    {
        output.Attributes.SetAttribute("data-content-key", MenuItem.ContentKey.Value);
    }

    // Add tracking attributes
    output.Attributes.SetAttribute("data-track-click", "navigation");
    output.Attributes.SetAttribute("data-track-label", MenuItem.Name);
}
```

## Complete Example: Bootstrap 5 TagHelper

```csharp
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.TagHelpers;

[HtmlTargetElement("bs-navitem")]
public class BootstrapNavItemTagHelper : UmbnavitemTagHelper
{
    /// <summary>
    /// Whether this is a dropdown item
    /// </summary>
    public bool IsDropdownItem { get; set; }

    /// <summary>
    /// Whether this item has a dropdown
    /// </summary>
    public bool HasDropdown { get; set; }

    protected override void ProcessClasses(TagHelperOutput output)
    {
        // Don't call base - we're replacing the logic

        if (IsDropdownItem)
        {
            output.AddClass("dropdown-item", HtmlEncoder.Default);
        }
        else
        {
            output.AddClass("nav-link", HtmlEncoder.Default);
        }

        if (HasDropdown)
        {
            output.AddClass("dropdown-toggle", HtmlEncoder.Default);
        }

        // Still apply custom classes
        if (!string.IsNullOrEmpty(MenuItem.CustomClasses))
        {
            foreach (var cls in MenuItem.CustomClasses.Split(' '))
            {
                output.AddClass(cls, HtmlEncoder.Default);
            }
        }
    }

    protected override void ProcessCustomAttributes(TagHelperContext context, TagHelperOutput output)
    {
        if (HasDropdown)
        {
            output.Attributes.SetAttribute("data-bs-toggle", "dropdown");
            output.Attributes.SetAttribute("aria-expanded", "false");
            output.Attributes.SetAttribute("role", "button");
        }
    }
}
```

Usage:

```cshtml
<ul class="navbar-nav">
    @foreach (var item in menuItems)
    {
        var hasChildren = item.Children?.Any() == true;
        <li class="nav-item @(hasChildren ? "dropdown" : "")">
            <bs-navitem
                menu-item="@item"
                has-dropdown="@hasChildren"
                active-class="active"
                current-page="@Model">
            </bs-navitem>

            @if (hasChildren)
            {
                <ul class="dropdown-menu">
                    @foreach (var child in item.Children)
                    {
                        <li>
                            <bs-navitem
                                menu-item="@child"
                                is-dropdown-item="true"
                                active-class="active"
                                current-page="@Model">
                            </bs-navitem>
                        </li>
                    }
                </ul>
            }
        </li>
    }
</ul>
```

## Complete Example: Accessible TagHelper

```csharp
[HtmlTargetElement("a11y-navitem")]
public class AccessibleNavItemTagHelper : UmbnavitemTagHelper
{
    protected override void ProcessCustomAttributes(TagHelperContext context, TagHelperOutput output)
    {
        // Add role
        output.Attributes.SetAttribute("role", "menuitem");

        // Add tabindex for keyboard navigation
        output.Attributes.SetAttribute("tabindex", "0");

        // Add aria-label for external links
        if (MenuItem.Target == "_blank")
        {
            output.Attributes.SetAttribute("aria-label",
                $"{MenuItem.Name}, opens in new tab");
        }

        // Add aria-haspopup for items with children
        if (MenuItem.Children?.Any() == true)
        {
            output.Attributes.SetAttribute("aria-haspopup", "true");
            output.Attributes.SetAttribute("aria-expanded", "false");
        }
    }

    protected override void ProcessActiveState(TagHelperOutput output)
    {
        base.ProcessActiveState(output);

        if (IsItemActive())
        {
            output.Attributes.SetAttribute("aria-current", "page");
        }
    }

    protected override string GetTagName()
    {
        // Use buttons for items that have dropdowns
        if (MenuItem.Children?.Any() == true)
        {
            return "button";
        }

        return base.GetTagName();
    }
}
```

## Complete Example: Analytics TagHelper

```csharp
[HtmlTargetElement("tracked-navitem")]
public class TrackedNavItemTagHelper : UmbnavitemTagHelper
{
    /// <summary>
    /// Analytics event category
    /// </summary>
    public string TrackCategory { get; set; } = "Navigation";

    /// <summary>
    /// Analytics event action
    /// </summary>
    public string TrackAction { get; set; } = "Click";

    protected override void ProcessCustomAttributes(TagHelperContext context, TagHelperOutput output)
    {
        // Google Analytics 4 attributes
        output.Attributes.SetAttribute("data-ga-category", TrackCategory);
        output.Attributes.SetAttribute("data-ga-action", TrackAction);
        output.Attributes.SetAttribute("data-ga-label", MenuItem.Name);

        // Content type for analytics segmentation
        output.Attributes.SetAttribute("data-content-type", MenuItem.ItemType.ToString());

        // Menu level for funnel analysis
        output.Attributes.SetAttribute("data-menu-level", MenuItem.Level);

        // Add click handler attribute
        output.Attributes.SetAttribute("onclick",
            $"trackNavClick('{MenuItem.Name}', '{TrackCategory}', {MenuItem.Level})");
    }
}
```

## Properties Reference

### Available Properties

| Property | Type | Description |
|----------|------|-------------|
| `MenuItem` | `UmbNavItem` | The menu item being rendered |
| `Mode` | `UrlMode` | URL generation mode |
| `Culture` | `string?` | Culture for URLs |
| `LabelTagName` | `string` | Tag for label items |
| `ActiveClass` | `string?` | Class for active state |
| `IsActiveAncestorCheck` | `bool` | Check ancestors |
| `CurrentPage` | `IPublishedContent?` | Current page |
| `IsLabel` | `bool` | Whether item is a label |

### Protected Members

| Member | Type | Description |
|--------|------|-------------|
| `IsLabel` | `bool` | Check if item is a label |

## Usage in Views

Register your custom TagHelper in `_ViewImports.cshtml`:

```cshtml
@addTagHelper *, YourAssemblyName
```

Then use it:

```cshtml
<custom-umbnavitem
    menu-item="@item"
    active-class="active"
    current-page="@Model">
</custom-umbnavitem>
```

## Next Steps

- [Menu Builder Service](menu-builder-service.md) - Custom processing
- [Value Converter](value-converter.md) - Custom conversion
- [Examples](../../examples/basic-navigation.md) - Real implementations
