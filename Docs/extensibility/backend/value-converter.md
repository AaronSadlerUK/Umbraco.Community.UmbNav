# Extending the Value Converter

The `UmbNavValueConverter` handles converting raw JSON property data into `IEnumerable<UmbNavItem>`. Extend it for custom conversion logic.

## Overview

The value converter is automatically invoked when you call:

```csharp
Model.Value<IEnumerable<UmbNavItem>>("propertyAlias")
```

It handles:
1. Deserializing JSON from the database
2. Calling the Menu Builder Service to process items
3. Converting configuration to build options

## Basic Extension

```csharp
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Converters;

public class CustomUmbNavValueConverter : UmbNavValueConverter
{
    public CustomUmbNavValueConverter(
        ILogger<UmbNavValueConverter> logger,
        IUmbNavMenuBuilderService umbNavMenuBuilderService)
        : base(logger, umbNavMenuBuilderService)
    {
    }
}
```

## Registering Your Converter

Value converters are registered automatically by Umbraco. To override, use a composer:

```csharp
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

[ComposeAfter(typeof(RegisterUmbNavServicesComposer))]
public class CustomConverterComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Remove the default converter
        builder.PropertyValueConverters()
            .Remove<UmbNavValueConverter>();

        // Add custom converter
        builder.PropertyValueConverters()
            .Append<CustomUmbNavValueConverter>();
    }
}
```

## Override Points

### ConvertIntermediateToObject

The main conversion method for standard property access:

```csharp
public override object? ConvertIntermediateToObject(
    IPublishedElement owner,
    IPublishedPropertyType propertyType,
    PropertyCacheLevel referenceCacheLevel,
    object? inter,
    bool preview)
{
    // Pre-processing
    _logger.LogDebug("Converting UmbNav property: {Alias}", propertyType.Alias);

    // Call base conversion
    var result = base.ConvertIntermediateToObject(
        owner, propertyType, referenceCacheLevel, inter, preview);

    // Post-processing
    if (result is IEnumerable<UmbNavItem> items)
    {
        // Add custom processing
        foreach (var item in items)
        {
            // e.g., Add analytics tracking
            item.CustomClasses = $"{item.CustomClasses} tracked".Trim();
        }
    }

    return result;
}
```

### ConvertIntermediateToDeliveryApiObject

Conversion for the Delivery API:

```csharp
public object? ConvertIntermediateToDeliveryApiObject(
    IPublishedElement owner,
    IPublishedPropertyType propertyType,
    PropertyCacheLevel referenceCacheLevel,
    object? inter,
    bool preview,
    bool expanding)
{
    // Custom Delivery API conversion
    var result = base.ConvertIntermediateToDeliveryApiObject(
        owner, propertyType, referenceCacheLevel, inter, preview, expanding);

    if (result is IEnumerable<UmbNavItem> items)
    {
        // Strip sensitive data for API
        return items.Select(StripSensitiveData).ToList();
    }

    return result;
}

private UmbNavItem StripSensitiveData(UmbNavItem item)
{
    // Create a copy without internal data
    return new UmbNavItem
    {
        Key = item.Key,
        Name = item.Name,
        Url = item.Url,
        ItemType = item.ItemType,
        Children = item.Children?.Select(StripSensitiveData).ToList(),
        // Omit: ContentKey, Content, Image, etc.
    };
}
```

## Complete Example: Caching Converter

```csharp
public class CachedUmbNavValueConverter : UmbNavValueConverter
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachedUmbNavValueConverter> _logger;

    public CachedUmbNavValueConverter(
        ILogger<CachedUmbNavValueConverter> logger,
        IUmbNavMenuBuilderService umbNavMenuBuilderService,
        IMemoryCache cache)
        : base(logger, umbNavMenuBuilderService)
    {
        _cache = cache;
        _logger = logger;
    }

    public override object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview)
    {
        if (preview || inter == null)
        {
            // Don't cache preview content
            return base.ConvertIntermediateToObject(
                owner, propertyType, referenceCacheLevel, inter, preview);
        }

        var cacheKey = $"umbnav_{owner.Key}_{propertyType.Alias}_{inter.GetHashCode()}";

        return _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            entry.Priority = CacheItemPriority.Normal;

            _logger.LogDebug("Cache miss for UmbNav: {Key}", cacheKey);

            return base.ConvertIntermediateToObject(
                owner, propertyType, referenceCacheLevel, inter, preview);
        });
    }
}
```

## Complete Example: Analytics Tracking

```csharp
public class AnalyticsUmbNavValueConverter : UmbNavValueConverter
{
    private readonly IAnalyticsService _analytics;

    public AnalyticsUmbNavValueConverter(
        ILogger<UmbNavValueConverter> logger,
        IUmbNavMenuBuilderService umbNavMenuBuilderService,
        IAnalyticsService analytics)
        : base(logger, umbNavMenuBuilderService)
    {
        _analytics = analytics;
    }

    public override object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview)
    {
        var result = base.ConvertIntermediateToObject(
            owner, propertyType, referenceCacheLevel, inter, preview);

        if (result is IEnumerable<UmbNavItem> items)
        {
            // Track navigation access
            _analytics.TrackEvent("Navigation", "Rendered", new
            {
                PropertyAlias = propertyType.Alias,
                ItemCount = items.Count(),
                ContentId = owner.Key
            });

            // Enrich with analytics data
            EnrichWithAnalytics(items);
        }

        return result;
    }

    private void EnrichWithAnalytics(IEnumerable<UmbNavItem> items)
    {
        foreach (var item in items)
        {
            if (item.ContentKey.HasValue)
            {
                var views = _analytics.GetPageViews(item.ContentKey.Value);
                item.Description = item.Description != null
                    ? $"{item.Description} ({views:N0} views)"
                    : $"{views:N0} views";
            }

            if (item.Children != null)
            {
                EnrichWithAnalytics(item.Children);
            }
        }
    }
}
```

## Complete Example: Multi-Language Enrichment

```csharp
public class MultiLanguageUmbNavValueConverter : UmbNavValueConverter
{
    private readonly ILocalizationService _localization;
    private readonly IVariationContextAccessor _variationContextAccessor;

    public MultiLanguageUmbNavValueConverter(
        ILogger<UmbNavValueConverter> logger,
        IUmbNavMenuBuilderService umbNavMenuBuilderService,
        ILocalizationService localization,
        IVariationContextAccessor variationContextAccessor)
        : base(logger, umbNavMenuBuilderService)
    {
        _localization = localization;
        _variationContextAccessor = variationContextAccessor;
    }

    public override object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview)
    {
        var result = base.ConvertIntermediateToObject(
            owner, propertyType, referenceCacheLevel, inter, preview);

        if (result is IEnumerable<UmbNavItem> items)
        {
            var culture = _variationContextAccessor.VariationContext?.Culture;
            EnrichWithTranslations(items, culture);
        }

        return result;
    }

    private void EnrichWithTranslations(IEnumerable<UmbNavItem> items, string? culture)
    {
        if (string.IsNullOrEmpty(culture))
            return;

        foreach (var item in items)
        {
            // Add language indicator
            if (item.Content != null && item.Content.Cultures.ContainsKey(culture))
            {
                // Content exists in this language
            }
            else if (item.Content != null)
            {
                // Mark as fallback language
                item.CustomClasses = $"{item.CustomClasses} lang-fallback".Trim();
            }

            if (item.Children != null)
            {
                EnrichWithTranslations(item.Children, culture);
            }
        }
    }
}
```

## Delivery API Considerations

When customizing for the Delivery API:

```csharp
public object? ConvertIntermediateToDeliveryApiObject(
    IPublishedElement owner,
    IPublishedPropertyType propertyType,
    PropertyCacheLevel referenceCacheLevel,
    object? inter,
    bool preview,
    bool expanding)
{
    // The 'expanding' parameter indicates whether to include referenced content
    if (!expanding)
    {
        // Return minimal data
        return ConvertMinimal(inter);
    }

    // Return full data with expanded references
    return base.ConvertIntermediateToDeliveryApiObject(
        owner, propertyType, referenceCacheLevel, inter, preview, expanding);
}
```

## Build Options from Configuration

The base converter creates build options from the Data Type configuration:

```csharp
// This is done automatically in the base class
private static UmbNavBuildOptions GetBuildOptions(IPublishedPropertyType propertyType)
{
    var config = propertyType.DataType.ConfigurationAs<UmbNavConfiguration>();

    return new UmbNavBuildOptions
    {
        RemoveNoopener = config?.HideNoopener ?? false,
        RemoveNoreferrer = config?.HideNoreferrer ?? false,
        HideIncludeChildren = config?.HideIncludeChildren ?? false,
        RemoveDescription = !(config?.AllowDescription ?? false),
        RemoveCustomClasses = !(config?.AllowCustomClasses ?? false),
        RemoveImages = !(config?.AllowImageIcon ?? false),
        MaxDepth = config?.MaxDepth ?? 0
    };
}
```

You can override this by creating custom build options in your converter.

## Testing

```csharp
public class CustomValueConverterTests
{
    private readonly Mock<ILogger<UmbNavValueConverter>> _loggerMock;
    private readonly Mock<IUmbNavMenuBuilderService> _menuBuilderMock;
    private readonly CustomUmbNavValueConverter _converter;

    public CustomValueConverterTests()
    {
        _loggerMock = new Mock<ILogger<UmbNavValueConverter>>();
        _menuBuilderMock = new Mock<IUmbNavMenuBuilderService>();

        _converter = new CustomUmbNavValueConverter(
            _loggerMock.Object,
            _menuBuilderMock.Object);
    }

    [Fact]
    public void ConvertIntermediateToObject_WithValidJson_ReturnsItems()
    {
        var json = "[{\"key\":\"...\",\"name\":\"Test\"}]";

        _menuBuilderMock
            .Setup(x => x.BuildMenu(It.IsAny<IEnumerable<UmbNavItem>>(), It.IsAny<UmbNavBuildOptions>()))
            .Returns((IEnumerable<UmbNavItem> items, UmbNavBuildOptions _) => items);

        var result = _converter.ConvertIntermediateToObject(
            Mock.Of<IPublishedElement>(),
            CreateMockPropertyType(),
            PropertyCacheLevel.Elements,
            json,
            false);

        Assert.NotNull(result);
        Assert.IsAssignableFrom<IEnumerable<UmbNavItem>>(result);
    }
}
```

## Next Steps

- [Menu Builder Service](menu-builder-service.md) - Custom processing
- [TagHelper](taghelper.md) - Custom rendering
- [Testing](../../testing/unit-tests.md) - Writing tests
