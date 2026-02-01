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
}
