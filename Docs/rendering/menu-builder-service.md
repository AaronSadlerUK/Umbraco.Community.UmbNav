# Menu Builder Service

The `IUmbNavMenuBuilderService` processes raw menu data from the property editor, resolving content, filtering items, and applying build options. Understanding this service is key to advanced UmbNav usage.

## Overview

The Menu Builder Service is responsible for:

1. **Content Resolution** - Converting content keys to `IPublishedContent`
2. **Image Resolution** - Loading media items for menu images
3. **Visibility Filtering** - Hiding items based on authentication status
4. **Active State Detection** - Marking the current page and ancestors
5. **Option Application** - Applying `UmbNavBuildOptions` transformations
6. **Child Processing** - Auto-expanding children from content nodes
7. **Depth Limiting** - Enforcing maximum nesting depth

## Automatic Processing

When you call `Model.Value<IEnumerable<UmbNavItem>>()`, the built-in value converter automatically calls the Menu Builder Service. You typically don't need to call it manually.

However, for advanced scenarios, you can inject and use the service directly.

## Manual Usage

### Injecting the Service

```csharp
@inject IUmbNavMenuBuilderService MenuBuilder
```

Or in a controller/service:

```csharp
public class NavigationService
{
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public NavigationService(IUmbNavMenuBuilderService menuBuilder)
    {
        _menuBuilder = menuBuilder;
    }
}
```

### Basic Usage

```csharp
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    // Get raw items (bypassing the value converter)
    var rawJson = Model.Value<string>("navigation");
    var rawItems = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(rawJson);

    // Process with the service
    var menuItems = MenuBuilder.BuildMenu(rawItems);
}
```

### With Build Options

```csharp
var options = new UmbNavBuildOptions
{
    MaxDepth = 2,
    RemoveDescription = true,
    RemoveImages = true
};

var menuItems = MenuBuilder.BuildMenu(rawItems, options);
```

## Build Options Reference

The `UmbNavBuildOptions` class controls how the service processes items:

```csharp
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

| Option | Effect |
|--------|--------|
| `RemoveNoopener` | Sets `Noopener` to `null` on all items |
| `RemoveNoreferrer` | Sets `Noreferrer` to `null` on all items |
| `HideIncludeChildren` | Ignores the "Include Child Nodes" setting |
| `RemoveDescription` | Sets `Description` to `null` on all items |
| `RemoveCustomClasses` | Sets `CustomClasses` to `null` on all items |
| `RemoveImages` | Sets `Image` and `ImageArray` to `null` |
| `MaxDepth` | Limits nesting depth (0 = unlimited) |

## Processing Pipeline

The service processes items through these stages:

```
Raw Items
    ↓
[ProcessItems]
    ↓
[ShouldIncludeItem] ← Authentication check
    ↓
[ResolveContent] ← Content lookup
    ↓
[ResolveImage] ← Media lookup
    ↓
[ApplyOptions] ← Build options
    ↓
[ProcessChildren] ← Recursive processing
    ↓
[GetAutoExpandedChildren] ← Child node inclusion
    ↓
Processed Items
```

## Practical Examples

### Filtered Navigation

Create a navigation that only shows certain item types:

```csharp
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var rawItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");

    // Build with default processing
    var allItems = MenuBuilder.BuildMenu(rawItems);

    // Filter to only content items
    var contentOnly = allItems.Where(i => i.ItemType == UmbNavItemType.Document);
}
```

### Different Depths for Different Views

```csharp
// Header navigation - 2 levels
var headerNav = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions { MaxDepth = 2 });

// Sidebar navigation - unlimited
var sidebarNav = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions { MaxDepth = 0 });

// Footer navigation - 1 level only
var footerNav = MenuBuilder.BuildMenu(items, new UmbNavBuildOptions { MaxDepth = 1 });
```

### Stripping Data for JSON API

```csharp
public IActionResult GetNavigation()
{
    var items = _content.Value<IEnumerable<UmbNavItem>>("navigation");

    // Strip unnecessary data for API response
    var options = new UmbNavBuildOptions
    {
        RemoveDescription = true,
        RemoveImages = true,
        RemoveCustomClasses = true,
        MaxDepth = 3
    };

    var processed = _menuBuilder.BuildMenu(items, options);

    return Ok(processed);
}
```

### Caching Processed Menus

```csharp
public class CachedNavigationService
{
    private readonly IUmbNavMenuBuilderService _menuBuilder;
    private readonly IMemoryCache _cache;

    public CachedNavigationService(
        IUmbNavMenuBuilderService menuBuilder,
        IMemoryCache cache)
    {
        _menuBuilder = menuBuilder;
        _cache = cache;
    }

    public IEnumerable<UmbNavItem> GetMainNavigation(IPublishedContent root)
    {
        var cacheKey = $"nav_{root.Id}_{root.UpdateDate.Ticks}";

        return _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

            var items = root.Value<IEnumerable<UmbNavItem>>("mainNavigation");
            return _menuBuilder.BuildMenu(items, new UmbNavBuildOptions { MaxDepth = 3 });
        });
    }
}
```

## Service Interface

```csharp
public interface IUmbNavMenuBuilderService
{
    IEnumerable<UmbNavItem> BuildMenu(
        IEnumerable<UmbNavItem>? items,
        UmbNavBuildOptions? options = null);
}
```

## Extending the Service

You can replace the service with a custom implementation. See [Extending the Menu Builder Service](../extensibility/backend/menu-builder-service.md) for detailed guidance.

Quick example:

```csharp
public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    public CustomMenuBuilderService(/* dependencies */)
        : base(/* dependencies */)
    {
    }

    protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        // Custom visibility logic
        if (item.CustomClasses?.Contains("admin-only") == true)
        {
            return IsCurrentUserAdmin();
        }

        return base.ShouldIncludeItem(item, isLoggedIn);
    }
}
```

Register with:

```csharp
builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
```

## Delivery API Support

The service automatically supports Umbraco's Content Delivery API. When items are requested through the Delivery API, the `UmbNavValueConverter` uses the same Menu Builder Service with options derived from the Data Type configuration.

```csharp
// In the value converter
public object? ConvertIntermediateToDeliveryApiObject(...)
{
    var items = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(inter.ToString()!);
    var options = GetBuildOptions(propertyType);
    return _umbNavMenuBuilderService.BuildMenu(items, options);
}
```

## Performance Considerations

1. **Content Resolution** - The service looks up content by GUID, which is fast with Umbraco's caching
2. **Recursive Processing** - Deep nesting increases processing time; use `MaxDepth` to limit
3. **Authentication Check** - Uses `HttpContext.User`, which is lightweight
4. **Caching** - Consider caching processed results for high-traffic sites

## Error Handling

The service handles common error cases:

- **Missing Content** - Items with unresolvable content keys are excluded
- **Unpublished Content** - Unpublished content items are excluded
- **Null Items** - Empty or null collections return empty results
- **Invalid Options** - Null options default to `UmbNavBuildOptions.Default`

Errors are logged but don't throw exceptions, ensuring navigation degrades gracefully.

## Next Steps

- [Build Options](../models/build-options.md) - Detailed options documentation
- [Extending the Menu Builder Service](../extensibility/backend/menu-builder-service.md) - Custom implementations
- [UmbNavItem Model](../models/umbnav-item.md) - Understanding the data model
