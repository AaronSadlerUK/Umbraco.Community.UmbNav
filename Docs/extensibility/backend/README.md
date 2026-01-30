# Backend Extensions (C#)

UmbNav's backend can be customized by extending services, TagHelpers, and converters.

## Extension Points

| Component | Class | Purpose |
|-----------|-------|---------|
| Menu Builder | `UmbNavMenuBuilderService` | Process and filter menu items |
| TagHelper | `UmbnavitemTagHelper` | Custom HTML rendering |
| Value Converter | `UmbNavValueConverter` | Custom property conversion |

## Getting Started

Backend extensions use standard C# inheritance and Umbraco's dependency injection.

### Basic Pattern

1. Create a class that extends the base
2. Override the methods you want to customize
3. Register with Umbraco's DI container via a Composer

```csharp
// 1. Create the extension
public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    public CustomMenuBuilderService(/* dependencies */)
        : base(/* dependencies */)
    {
    }

    protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        // Custom logic
        return base.ShouldIncludeItem(item, isLoggedIn);
    }
}

// 2. Register via Composer
public class CustomUmbNavComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
    }
}
```

## Available Extensions

### Menu Builder Service

The most common extension point. Override methods to:

- Custom visibility/filtering rules
- Modify content resolution
- Add analytics/tracking
- Integrate with external systems

See [Menu Builder Service](menu-builder-service.md) for details.

### TagHelper

Customize HTML output. Override methods to:

- Add custom attributes
- Modify URL generation
- Change active state logic
- Add data attributes for JavaScript

See [TagHelper](taghelper.md) for details.

### Value Converter

Customize property value conversion. Override to:

- Custom deserialization
- Pre-processing before Menu Builder
- Integration with caching
- Custom API transformations

See [Value Converter](value-converter.md) for details.

## Dependencies

When extending, you'll need access to Umbraco services. Common dependencies:

```csharp
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

## Accessing Protected Members

The base service exposes dependencies via protected properties:

```csharp
public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    protected override bool ResolveContent(UmbNavItem item, Guid currentContentKey)
    {
        // Access the content cache via protected property
        var content = PublishedContentCache.GetById(item.ContentKey);

        // Access the logger
        Logger.LogInformation("Resolving content for {Name}", item.Name);

        return base.ResolveContent(item, currentContentKey);
    }
}
```

## Best Practices

### 1. Call Base Methods

Preserve core functionality by calling base implementations:

```csharp
protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
{
    // Add your custom logic
    if (item.CustomClasses?.Contains("hidden") == true)
        return false;

    // Always call base for standard behavior
    return base.ShouldIncludeItem(item, isLoggedIn);
}
```

### 2. Use Logging

Log important operations for debugging:

```csharp
protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
{
    Logger.LogDebug("Checking visibility for {Name}, LoggedIn: {IsLoggedIn}",
        item.Name, isLoggedIn);

    return base.ShouldIncludeItem(item, isLoggedIn);
}
```

### 3. Handle Nulls

Always check for null:

```csharp
protected override bool ResolveContent(UmbNavItem item, Guid currentContentKey)
{
    if (item?.ContentKey == null)
    {
        Logger.LogWarning("Item has no content key: {Name}", item?.Name);
        return false;
    }

    return base.ResolveContent(item, currentContentKey);
}
```

### 4. Register Correctly

Use `AddUnique` to replace the default implementation:

```csharp
// Replace the default service
builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();

// DON'T use AddSingleton - it won't replace the default
// builder.Services.AddSingleton<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
```

### 5. Test Your Extensions

Write unit tests for custom logic:

```csharp
[Fact]
public void ShouldIncludeItem_WithHiddenClass_ReturnsFalse()
{
    var item = new UmbNavItem
    {
        Name = "Test",
        CustomClasses = "hidden special"
    };

    var result = _service.BuildMenu(new[] { item });

    Assert.Empty(result);
}
```

## Composition Order

Umbraco composers run in a specific order. If you need to run after UmbNav's composer:

```csharp
[ComposeAfter(typeof(RegisterUmbNavServicesComposer))]
public class CustomUmbNavComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IUmbNavMenuBuilderService, CustomMenuBuilderService>();
    }
}
```

## Next Steps

- [Menu Builder Service](menu-builder-service.md) - Custom processing
- [TagHelper](taghelper.md) - Custom rendering
- [Value Converter](value-converter.md) - Custom conversion
