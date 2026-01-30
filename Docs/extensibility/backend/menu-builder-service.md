# Extending the Menu Builder Service

The `UmbNavMenuBuilderService` is the core service that processes menu items. Extend it to customize filtering, content resolution, and item transformation.

## Basic Extension

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.Services;

public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    public CustomMenuBuilderService(
        IPublishedContentCache publishedContentCache,
        ILogger<UmbNavMenuBuilderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedMediaCache publishedMediaCache)
        : base(publishedContentCache, logger, httpContextAccessor,
               umbracoContextAccessor, publishedMediaCache)
    {
    }
}
```

## Registering Your Service

```csharp
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.UmbNav.Core.Abstractions;

public class CustomUmbNavComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
    }
}
```

## Override Points

### BuildMenu

The main entry point. Override for complete control:

```csharp
public override IEnumerable<UmbNavItem> BuildMenu(
    IEnumerable<UmbNavItem>? items,
    UmbNavBuildOptions? options = null)
{
    // Pre-processing
    Logger.LogInformation("Building menu with {Count} items", items?.Count() ?? 0);

    // Call base
    var result = base.BuildMenu(items, options);

    // Post-processing
    return result;
}
```

### ShouldIncludeItem

Control which items are included in the output:

```csharp
protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
{
    // Custom visibility based on custom classes
    if (item.CustomClasses?.Contains("admin-only") == true)
    {
        return IsCurrentUserAdmin();
    }

    // Hide specific URLs
    if (item.Url?.Contains("/internal/") == true)
    {
        return false;
    }

    // Time-based visibility
    if (item.CustomClasses?.Contains("weekend-only") == true)
    {
        var now = DateTime.Now;
        if (now.DayOfWeek != DayOfWeek.Saturday && now.DayOfWeek != DayOfWeek.Sunday)
        {
            return false;
        }
    }

    return base.ShouldIncludeItem(item, isLoggedIn);
}

private bool IsCurrentUserAdmin()
{
    var httpContext = HttpContextAccessor.HttpContext;
    return httpContext?.User?.IsInRole("admin") == true;
}
```

### ResolveContent

Customize how content is resolved from Umbraco:

```csharp
protected override bool ResolveContent(UmbNavItem item, Guid currentContentKey)
{
    var result = base.ResolveContent(item, currentContentKey);

    if (result && item.Content != null)
    {
        // Add custom property to name
        var subtitle = item.Content.Value<string>("subtitle");
        if (!string.IsNullOrEmpty(subtitle))
        {
            item.Name = $"{item.Name} - {subtitle}";
        }

        // Set active based on custom logic
        if (item.Content.Id.ToString() == GetHighlightedPageId())
        {
            item.IsActive = true;
        }
    }

    return result;
}
```

### ResolveImage

Customize image resolution:

```csharp
protected override void ResolveImage(UmbNavItem item)
{
    base.ResolveImage(item);

    // Fallback to content's image if no specific image set
    if (item.Image == null && item.Content != null)
    {
        var contentImage = item.Content.Value<IPublishedContent>("heroImage");
        if (contentImage != null)
        {
            item.Image = contentImage;
        }
    }
}
```

### ApplyOptions

Modify how build options are applied:

```csharp
protected override void ApplyOptions(UmbNavItem item, UmbNavBuildOptions options)
{
    base.ApplyOptions(item, options);

    // Additional transformations
    if (options.RemoveDescription)
    {
        // Also clear custom classes that reference descriptions
        item.CustomClasses = item.CustomClasses?
            .Replace("has-description", "")
            .Trim();
    }
}
```

### ProcessChildren

Customize child processing:

```csharp
protected override IEnumerable<UmbNavItem>? ProcessChildren(
    IEnumerable<UmbNavItem>? children,
    UmbNavBuildOptions options,
    int level,
    bool isLoggedIn,
    Guid currentContentKey)
{
    var processedChildren = base.ProcessChildren(
        children, options, level, isLoggedIn, currentContentKey);

    if (processedChildren == null)
        return null;

    // Sort children alphabetically
    return processedChildren.OrderBy(c => c.Name).ToList();
}
```

### GetAutoExpandedChildren

Customize how child nodes are auto-expanded:

```csharp
protected override IEnumerable<UmbNavItem> GetAutoExpandedChildren(
    UmbNavItem parent,
    UmbNavBuildOptions options,
    int level,
    bool isLoggedIn,
    Guid currentContentKey)
{
    var children = base.GetAutoExpandedChildren(
        parent, options, level, isLoggedIn, currentContentKey);

    // Filter out certain document types
    return children.Where(c =>
        c.Content?.ContentType.Alias != "landingPage");
}
```

### IsUserLoggedIn

Customize authentication detection:

```csharp
protected override bool IsUserLoggedIn()
{
    var httpContext = HttpContextAccessor.HttpContext;

    // Check for custom authentication
    if (httpContext?.Request.Headers.ContainsKey("X-Api-Key") == true)
    {
        return true; // API users count as logged in
    }

    return base.IsUserLoggedIn();
}
```

### GetCurrentContentKey

Customize current page detection for active states:

```csharp
protected override Guid GetCurrentContentKey()
{
    var httpContext = HttpContextAccessor.HttpContext;

    // Check for override in query string
    var overrideKey = httpContext?.Request.Query["activeNav"].FirstOrDefault();
    if (Guid.TryParse(overrideKey, out var guidKey))
    {
        return guidKey;
    }

    return base.GetCurrentContentKey();
}
```

## Complete Example: Analytics Integration

```csharp
public class AnalyticsMenuBuilderService : UmbNavMenuBuilderService
{
    private readonly IAnalyticsService _analytics;

    public AnalyticsMenuBuilderService(
        IPublishedContentCache publishedContentCache,
        ILogger<UmbNavMenuBuilderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedMediaCache publishedMediaCache,
        IAnalyticsService analytics)
        : base(publishedContentCache, logger, httpContextAccessor,
               umbracoContextAccessor, publishedMediaCache)
    {
        _analytics = analytics;
    }

    protected override bool ResolveContent(UmbNavItem item, Guid currentContentKey)
    {
        var result = base.ResolveContent(item, currentContentKey);

        if (result && item.Content != null)
        {
            // Add popularity class based on analytics
            var views = _analytics.GetPageViews(item.Content.Id);

            if (views > 10000)
            {
                item.CustomClasses = $"{item.CustomClasses} popular-high".Trim();
            }
            else if (views > 1000)
            {
                item.CustomClasses = $"{item.CustomClasses} popular-medium".Trim();
            }

            // Add view count to description
            if (string.IsNullOrEmpty(item.Description))
            {
                item.Description = $"{views:N0} views";
            }
        }

        return result;
    }
}
```

## Complete Example: Multi-Site Support

```csharp
public class MultiSiteMenuBuilderService : UmbNavMenuBuilderService
{
    private readonly ISiteService _siteService;

    public MultiSiteMenuBuilderService(
        IPublishedContentCache publishedContentCache,
        ILogger<UmbNavMenuBuilderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedMediaCache publishedMediaCache,
        ISiteService siteService)
        : base(publishedContentCache, logger, httpContextAccessor,
               umbracoContextAccessor, publishedMediaCache)
    {
        _siteService = siteService;
    }

    protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        // Filter items by current site
        if (item.ItemType == UmbNavItemType.Document && item.Content != null)
        {
            var currentSiteId = _siteService.GetCurrentSiteId();
            var itemSiteId = _siteService.GetSiteIdForContent(item.Content);

            if (itemSiteId != currentSiteId)
            {
                return false;
            }
        }

        return base.ShouldIncludeItem(item, isLoggedIn);
    }
}
```

## Complete Example: Caching Layer

```csharp
public class CachedMenuBuilderService : UmbNavMenuBuilderService
{
    private readonly IMemoryCache _cache;

    public CachedMenuBuilderService(
        IPublishedContentCache publishedContentCache,
        ILogger<UmbNavMenuBuilderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedMediaCache publishedMediaCache,
        IMemoryCache cache)
        : base(publishedContentCache, logger, httpContextAccessor,
               umbracoContextAccessor, publishedMediaCache)
    {
        _cache = cache;
    }

    public override IEnumerable<UmbNavItem> BuildMenu(
        IEnumerable<UmbNavItem>? items,
        UmbNavBuildOptions? options = null)
    {
        if (items == null)
            return Enumerable.Empty<UmbNavItem>();

        var cacheKey = GenerateCacheKey(items, options);

        return _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            entry.Priority = CacheItemPriority.Normal;

            Logger.LogDebug("Cache miss for menu: {CacheKey}", cacheKey);

            return base.BuildMenu(items, options).ToList();
        }) ?? Enumerable.Empty<UmbNavItem>();
    }

    private string GenerateCacheKey(IEnumerable<UmbNavItem> items, UmbNavBuildOptions? options)
    {
        var itemsHash = string.Join(",", items.Select(i => i.Key));
        var optionsHash = options?.GetHashCode() ?? 0;
        var isLoggedIn = IsUserLoggedIn();

        return $"umbnav_{itemsHash.GetHashCode()}_{optionsHash}_{isLoggedIn}";
    }
}
```

## Protected Properties

Access these in your overrides:

| Property | Type | Description |
|----------|------|-------------|
| `PublishedContentCache` | `IPublishedContentCache` | Content cache |
| `PublishedMediaCache` | `IPublishedMediaCache` | Media cache |
| `Logger` | `ILogger` | Logging |
| `HttpContextAccessor` | `IHttpContextAccessor` | HTTP context |
| `UmbracoContextAccessor` | `IUmbracoContextAccessor` | Umbraco context |

## Testing Your Extension

```csharp
public class CustomMenuBuilderServiceTests
{
    private readonly Mock<IPublishedContentCache> _contentCacheMock;
    private readonly Mock<IPublishedMediaCache> _mediaCacheMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IUmbracoContextAccessor> _umbracoContextAccessorMock;
    private readonly Mock<ILogger<UmbNavMenuBuilderService>> _loggerMock;
    private readonly CustomMenuBuilderService _service;

    public CustomMenuBuilderServiceTests()
    {
        _contentCacheMock = new Mock<IPublishedContentCache>();
        _mediaCacheMock = new Mock<IPublishedMediaCache>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _umbracoContextAccessorMock = new Mock<IUmbracoContextAccessor>();
        _loggerMock = new Mock<ILogger<UmbNavMenuBuilderService>>();

        _service = new CustomMenuBuilderService(
            _contentCacheMock.Object,
            _loggerMock.Object,
            _httpContextAccessorMock.Object,
            _umbracoContextAccessorMock.Object,
            _mediaCacheMock.Object);
    }

    [Fact]
    public void ShouldIncludeItem_WithAdminOnlyClass_WhenNotAdmin_ReturnsFalse()
    {
        var items = new List<UmbNavItem>
        {
            new() { Name = "Admin Page", CustomClasses = "admin-only" }
        };

        var result = _service.BuildMenu(items).ToList();

        Assert.Empty(result);
    }
}
```

## Next Steps

- [TagHelper Extension](taghelper.md) - Customize rendering
- [Value Converter Extension](value-converter.md) - Customize conversion
- [Testing](../../testing/unit-tests.md) - Writing tests
