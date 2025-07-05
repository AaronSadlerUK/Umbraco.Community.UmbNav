using Microsoft.Extensions.Logging;
using System.Text.Json;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Community.UmbNav.Core.PropertyEditors;

namespace Umbraco.Community.UmbNav.Core.Converters;

public class UmbNavValueConverter : PropertyValueConverterBase
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
            return Enumerable.Empty<UmbNavItem>();
        }
        
        try
        {
            var items = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(inter.ToString()!) ?? [];
            
            var hideNoopener = HideNoopener(propertyType);
            var hideNoreferrer = HideNoreferrer(propertyType);
            var hideIncludeChildren = HideIncludeChildren(propertyType);

            return _umbNavMenuBuilderService.BuildMenu(items, 0, hideNoopener, hideNoreferrer, hideIncludeChildren);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to convert UmbNav {ex}", ex);
        }

        return Enumerable.Empty<UmbNavItem>();
    }
    
    private static bool HideNoopener(IPublishedPropertyType propertyType) =>
        propertyType.DataType.ConfigurationAs<UmbNavConfiguration>()?.HideNoopener ?? false;
    
    private static bool HideNoreferrer(IPublishedPropertyType propertyType) =>
        propertyType.DataType.ConfigurationAs<UmbNavConfiguration>()?.HideNoreferrer ?? false;

    private static bool HideIncludeChildren(IPublishedPropertyType propertyType) =>
        propertyType.DataType.ConfigurationAs<UmbNavConfiguration>()?.HideIncludeChildren ?? false;
}
