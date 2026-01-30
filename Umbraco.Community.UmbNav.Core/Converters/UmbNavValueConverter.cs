using Microsoft.Extensions.Logging;
using System.Text.Json;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.DeliveryApi;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.Converters;

public class UmbNavValueConverter : PropertyValueConverterBase, IDeliveryApiPropertyValueConverter
{
    private readonly IUmbNavMenuBuilderService _umbNavMenuBuilderService;
    private readonly ILogger<UmbNavValueConverter> _logger;

    public UmbNavValueConverter(ILogger<UmbNavValueConverter> logger, IUmbNavMenuBuilderService umbNavMenuBuilderService)
    {
        _logger = logger;
        _umbNavMenuBuilderService = umbNavMenuBuilderService;
    }

    public override bool IsConverter(IPublishedPropertyType propertyType)
    {
        return propertyType.EditorUiAlias.Equals(UmbNavConstants.PropertyEditorAlias);
    }

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(IEnumerable<UmbNavItem>);

    public override object? ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object? inter, bool preview)
    {
        if (inter == null)
        {
            _logger.LogWarning("No intermediate value found on property {PropertyAlias}.", propertyType.Alias);
            return Enumerable.Empty<UmbNavItem>();
        }

        try
        {
            var items = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(inter.ToString()!)?.ToArray() ?? [];
            if (items.Length == 0)
            {
                _logger.LogWarning("Failed to deserialize UmbNav items on property {PropertyAlias}.", propertyType.Alias);
                return null;
            }

            var options = GetBuildOptions(propertyType);
            return _umbNavMenuBuilderService.BuildMenu(items, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting UmbNav intermediate value on property {PropertyAlias}.", propertyType.Alias);
        }

        return Enumerable.Empty<UmbNavItem>();
    }

    public PropertyCacheLevel GetDeliveryApiPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Elements;

    public Type GetDeliveryApiPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(IEnumerable<UmbNavItem>);

    public object? ConvertIntermediateToDeliveryApiObject(IPublishedElement owner, IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel, object? inter, bool preview, bool expanding)
    {
        if (inter == null)
        {
            _logger.LogWarning("No intermediate value found for Delivery API conversion on property {PropertyAlias}.", propertyType.Alias);
            return Enumerable.Empty<UmbNavItem>();
        }

        try
        {
            var items = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(inter.ToString()!)?.ToArray() ?? [];
            if (items.Length == 0)
            {
                _logger.LogWarning("Failed to deserialize UmbNav items for Delivery API on property {PropertyAlias}.", propertyType.Alias);
                return null;
            }

            var options = GetBuildOptions(propertyType);
            return _umbNavMenuBuilderService.BuildMenu(items, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting UmbNav intermediate value for Delivery API on property {PropertyAlias}.", propertyType.Alias);
        }

        return Enumerable.Empty<UmbNavItem>();
    }

    /// <summary>
    /// Creates build options from the property type configuration.
    /// </summary>
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
}
