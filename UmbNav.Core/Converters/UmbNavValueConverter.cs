using Microsoft.Extensions.Logging;
using System.Text.Json;
using UmbNav.Core.Abstractions;
using UmbNav.Core.Models;
using UmbNav.Core.PropertyEditors;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace UmbNav.Core.Converters;

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

        var configuration = propertyType.DataType.ConfigurationAs<UmbNavConfiguration>() ?? new UmbNavConfiguration();
        try
        {
            var items = JsonSerializer.Deserialize<IEnumerable<UmbNavItem>>(inter.ToString()!) ?? [];

            return _umbNavMenuBuilderService.BuildMenu(items, 0, configuration.HideNoopener, configuration.HideNoreferrer);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to convert UmbNav {ex}", ex);
        }

        return Enumerable.Empty<UmbNavItem>();
    }
}
