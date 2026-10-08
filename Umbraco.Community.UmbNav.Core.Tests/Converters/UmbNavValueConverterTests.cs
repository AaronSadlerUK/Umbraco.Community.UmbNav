using Microsoft.Extensions.Logging;
using Moq;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Converters;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Converters;

public class UmbNavValueConverterTests
{
    private readonly Mock<ILogger<UmbNavValueConverter>> _loggerMock;
    private readonly Mock<IUmbNavMenuBuilderService> _menuBuilderMock;
    private readonly UmbNavValueConverter _converter;

    public UmbNavValueConverterTests()
    {
        _loggerMock = new Mock<ILogger<UmbNavValueConverter>>();
        _menuBuilderMock = new Mock<IUmbNavMenuBuilderService>();
        _converter = new UmbNavValueConverter(_loggerMock.Object, _menuBuilderMock.Object);
    }

    [Fact]
    public void IsConverter_WithCorrectEditorAlias_ReturnsTrue()
    {
        var propertyTypeMock = new Mock<IPublishedPropertyType>();
        propertyTypeMock.Setup(x => x.EditorUiAlias).Returns(UmbNavConstants.PropertyEditorAlias);

        var result = _converter.IsConverter(propertyTypeMock.Object);

        Assert.True(result);
    }

    [Fact]
    public void IsConverter_WithIncorrectEditorAlias_ReturnsFalse()
    {
        var propertyTypeMock = new Mock<IPublishedPropertyType>();
        propertyTypeMock.Setup(x => x.EditorUiAlias).Returns("Some.Other.Alias");

        var result = _converter.IsConverter(propertyTypeMock.Object);

        Assert.False(result);
    }

    [Fact]
    public void GetPropertyValueType_ReturnsIEnumerableOfUmbNavItem()
    {
        var propertyTypeMock = new Mock<IPublishedPropertyType>();

        var result = _converter.GetPropertyValueType(propertyTypeMock.Object);

        Assert.Equal(typeof(IEnumerable<UmbNavItem>), result);
    }

    [Fact]
    public void GetDeliveryApiPropertyCacheLevel_ReturnsElements()
    {
        var propertyTypeMock = new Mock<IPublishedPropertyType>();

        var result = _converter.GetDeliveryApiPropertyCacheLevel(propertyTypeMock.Object);

        Assert.Equal(PropertyCacheLevel.Elements, result);
    }

    [Fact]
    public void GetDeliveryApiPropertyValueType_ReturnsIEnumerableOfUmbNavItem()
    {
        var propertyTypeMock = new Mock<IPublishedPropertyType>();

        var result = _converter.GetDeliveryApiPropertyValueType(propertyTypeMock.Object);

        Assert.Equal(typeof(IEnumerable<UmbNavItem>), result);
    }

    // Note: Full integration tests for ConvertIntermediateToObject and ConvertIntermediateToDeliveryApiObject
    // would require mocking the entire Umbraco published content infrastructure including IPublishedDataType.
    // These are better tested as integration tests or through the existing MenuBuilderService tests.

    [Fact]
    public void DeserializeItems_WithNewShapedJson_DeserializesDirectly()
    {
        var json = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Home",
                    "itemType": "External",
                    "url": "https://example.com"
                }
            ]
            """;

        var items = UmbNavValueConverter.DeserializeItems(_loggerMock.Object, json);

        Assert.Single(items);
        Assert.Equal("Home", items[0].Name);
    }

    [Fact]
    public void DeserializeItems_WithLegacyShapedJson_FallsBackToLegacyTransform()
    {
        // An unmigrated published value: legacy shape (title/udi/itemType, no "name"), including
        // the null boolean flags the v3.x editor wrote. Must still render rather than throw.
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "title": "Home",
                    "itemType": "Link",
                    "url": "https://example.com",
                    "noopener": null,
                    "noreferrer": null
                }
            ]
            """;

        var items = UmbNavValueConverter.DeserializeItems(_loggerMock.Object, legacyJson);

        Assert.Single(items);
        Assert.Equal("Home", items[0].Name);
        Assert.Equal(UmbNavItemType.External, items[0].ItemType);
    }
}
