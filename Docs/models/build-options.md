# Build Options

The `UmbNavBuildOptions` class controls how the Menu Builder Service processes menu items. Use build options to filter, transform, and limit the menu data at render time.

## Class Definition

```csharp
namespace Umbraco.Community.UmbNav.Core.Models;

public class UmbNavBuildOptions
{
    public bool RemoveNoopener { get; set; }
    public bool RemoveNoreferrer { get; set; }
    public bool HideIncludeChildren { get; set; }
    public bool RemoveDescription { get; set; }
    public bool RemoveCustomClasses { get; set; }
    public bool RemoveImages { get; set; }
    public int MaxDepth { get; set; }

    public static UmbNavBuildOptions Default => new();
}
```

## Options Reference

### RemoveNoopener

**Type:** `bool`
**Default:** `false`

When `true`, sets the `Noopener` property to `null` on all items. Use this to strip `rel="noopener"` from rendered links.

```csharp
var options = new UmbNavBuildOptions { RemoveNoopener = true };
```

**Before:**
```html
<a href="..." rel="noopener">Link</a>
```

**After:**
```html
<a href="...">Link</a>
```

### RemoveNoreferrer

**Type:** `bool`
**Default:** `false`

When `true`, sets the `Noreferrer` property to `null` on all items. Use this to strip `rel="noreferrer"` from rendered links.

```csharp
var options = new UmbNavBuildOptions { RemoveNoreferrer = true };
```

### HideIncludeChildren

**Type:** `bool`
**Default:** `false`

When `true`, prevents the automatic inclusion of child content nodes even if the editor enabled "Include Child Nodes" on an item.

```csharp
// Don't auto-expand children from content tree
var options = new UmbNavBuildOptions { HideIncludeChildren = true };
```

### RemoveDescription

**Type:** `bool`
**Default:** `false`

When `true`, sets the `Description` property to `null` on all items. Use this when descriptions aren't needed in a particular view.

```csharp
var options = new UmbNavBuildOptions { RemoveDescription = true };
```

### RemoveCustomClasses

**Type:** `bool`
**Default:** `false`

When `true`, sets the `CustomClasses` property to `null` on all items. Use this when you don't want editor-defined classes in the output.

```csharp
var options = new UmbNavBuildOptions { RemoveCustomClasses = true };
```

### RemoveImages

**Type:** `bool`
**Default:** `false`

When `true`, sets both `Image` and `ImageArray` properties to `null` on all items. Use this when images aren't needed.

```csharp
var options = new UmbNavBuildOptions { RemoveImages = true };
```

### MaxDepth

**Type:** `int`
**Default:** `0`

Controls the maximum depth of menu items to include:

- `0` = Unlimited (include all levels)
- `1` = Root items only (no children)
- `2` = Root + one level of children
- `3` = Root + two levels of children
- etc.

```csharp
// Only root and first level children
var options = new UmbNavBuildOptions { MaxDepth = 2 };
```

## Usage Examples

### Basic Usage

```csharp
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var rawItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");
    var options = new UmbNavBuildOptions
    {
        MaxDepth = 2
    };
    var menuItems = MenuBuilder.BuildMenu(rawItems, options);
}
```

### Default Options

Use default options explicitly:

```csharp
var menuItems = MenuBuilder.BuildMenu(rawItems, UmbNavBuildOptions.Default);
// Same as:
var menuItems = MenuBuilder.BuildMenu(rawItems, null);
// Same as:
var menuItems = MenuBuilder.BuildMenu(rawItems);
```

### Header Navigation

Simplified navigation for the header:

```csharp
var headerOptions = new UmbNavBuildOptions
{
    MaxDepth = 2,              // 2 levels max
    RemoveDescription = true,  // Don't need descriptions
    RemoveImages = true        // Don't need images
};
```

### Footer Navigation

Simple footer links:

```csharp
var footerOptions = new UmbNavBuildOptions
{
    MaxDepth = 1,              // Single level only
    RemoveDescription = true,
    RemoveImages = true,
    RemoveCustomClasses = true // Use footer-specific styling
};
```

### Mega Menu

Full-featured mega menu:

```csharp
var megaMenuOptions = new UmbNavBuildOptions
{
    MaxDepth = 4,              // Deep nesting
    RemoveDescription = false, // Keep descriptions
    RemoveImages = false       // Keep images
};
```

### API Response

Minimal data for JSON API:

```csharp
var apiOptions = new UmbNavBuildOptions
{
    MaxDepth = 3,
    RemoveDescription = true,
    RemoveImages = true,
    RemoveCustomClasses = true,
    RemoveNoopener = true,
    RemoveNoreferrer = true
};
```

### Security-Enforced Links

Ensure external links always have security attributes:

```csharp
var secureOptions = new UmbNavBuildOptions
{
    RemoveNoopener = false,     // Keep noopener
    RemoveNoreferrer = false    // Keep noreferrer
};
```

## Configuration vs Build Options

Understanding when to use Data Type configuration vs Build Options:

| Scenario | Data Type Config | Build Options |
|----------|-----------------|---------------|
| Feature availability | ✓ | |
| Editor experience | ✓ | |
| Per-property settings | ✓ | |
| Per-view settings | | ✓ |
| Runtime overrides | | ✓ |
| API transformations | | ✓ |

### Example: Different Views, Same Data

```csharp
// Same source data
var items = Model.Value<IEnumerable<UmbNavItem>>("navigation");

// Desktop: full features
var desktopNav = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions
{
    MaxDepth = 3,
    RemoveImages = false
});

// Mobile: simplified
var mobileNav = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions
{
    MaxDepth = 2,
    RemoveImages = true,
    RemoveDescription = true
});
```

## Combining Options

All options can be combined:

```csharp
var options = new UmbNavBuildOptions
{
    MaxDepth = 2,
    RemoveNoopener = true,
    RemoveNoreferrer = true,
    RemoveDescription = true,
    RemoveCustomClasses = false,  // Keep this one
    RemoveImages = true,
    HideIncludeChildren = true
};
```

## Object Initializer Syntax

Create options inline:

```csharp
var menuItems = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions
{
    MaxDepth = 2,
    RemoveDescription = true
});
```

## Immutability Note

`UmbNavBuildOptions` is a mutable class. If you reuse options, be aware that changes affect all usages:

```csharp
// Shared options - be careful
var sharedOptions = new UmbNavBuildOptions { MaxDepth = 2 };

// This modifies the shared instance!
sharedOptions.MaxDepth = 3;

// Better: create new instances
var options1 = new UmbNavBuildOptions { MaxDepth = 2 };
var options2 = new UmbNavBuildOptions { MaxDepth = 3 };
```

## Testing with Options

Options are useful in unit tests for controlling input:

```csharp
[Fact]
public void BuildMenu_WithRemoveDescription_SetsDescriptionToNull()
{
    var items = new List<UmbNavItem>
    {
        new() { Name = "Test", Description = "Some description" }
    };
    var options = new UmbNavBuildOptions { RemoveDescription = true };

    var result = _service.BuildMenu(items, options).ToList();

    Assert.Single(result);
    Assert.Null(result[0].Description);
}
```

See [Unit Tests](../testing/unit-tests.md) for more examples.

## Related Documentation

- [Menu Builder Service](../rendering/menu-builder-service.md) - How options are applied
- [UmbNavItem Model](umbnav-item.md) - Properties affected by options
- [Configuration](../configuration.md) - Data Type configuration
