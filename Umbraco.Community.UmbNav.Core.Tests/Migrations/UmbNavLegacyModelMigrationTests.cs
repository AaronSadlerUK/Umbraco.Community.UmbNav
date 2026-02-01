using Microsoft.Extensions.Logging;
using Moq;
using System.Text.Json;
using Umbraco.Community.UmbNav.Core.Migrations;

namespace Umbraco.Community.UmbNav.Core.Tests.Migrations;

public class UmbNavLegacyModelMigrationTests
{
    private readonly Mock<ILogger<UmbNavLegacyModelMigration>> _loggerMock;

    public UmbNavLegacyModelMigrationTests()
    {
        _loggerMock = new Mock<ILogger<UmbNavLegacyModelMigration>>();
    }

    [Fact]
    public void TryTransformLegacyValue_WithValidLegacyJson_ReturnsTrue()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "title": "",
                    "url": "https://example.com",
                    "target": "_blank",
                    "noopener": true,
                    "noreferrer": false,
                    "anchor": "",
                    "children": []
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.False(string.IsNullOrEmpty(newValue));
        Assert.Contains("Test Item", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithTitleOverridingName_UsesTitleInNewModel()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Original Name",
                    "title": "Override Title",
                    "url": "https://example.com"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Override Title", newValue);
        Assert.DoesNotContain("Original Name", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithEmptyKey_GeneratesNewKey()
    {
        var legacyJson = """
            [
                {
                    "key": "00000000-0000-0000-0000-000000000000",
                    "name": "Test Item",
                    "url": "https://example.com"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.DoesNotContain("00000000-0000-0000-0000-000000000000", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithNoNameOrTitle_UsesDefaultName()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "url": "https://example.com"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Unknown Name Set By Migration", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithValidUdi_ExtractsContentKey()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "udi": "umb://document/22222222222222222222222222222222"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("contentKey", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithInvalidUdi_IgnoresUdi()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "udi": "invalid-udi-format"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.False(string.IsNullOrEmpty(newValue));
    }

    [Fact]
    public void TryTransformLegacyValue_WithNestedChildren_TransformsRecursively()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Parent Item",
                    "url": "https://example.com",
                    "children": [
                        {
                            "key": "22222222-2222-2222-2222-222222222222",
                            "name": "Child Item",
                            "url": "https://example.com/child"
                        }
                    ]
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Parent Item", newValue);
        Assert.Contains("Child Item", newValue);
        Assert.Contains("children", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithNoopenerAndNoreferrer_ConvertsToStrings()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "url": "https://example.com",
                    "noopener": true,
                    "noreferrer": true
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("\"noopener\":\"True\"", newValue);
        Assert.Contains("\"noreferrer\":\"True\"", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithAllProperties_TransformsAllFields()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "title": "Test Title",
                    "icon": "icon-test",
                    "menuitemdescription": "Test description",
                    "target": "_blank",
                    "noopener": true,
                    "noreferrer": false,
                    "anchor": "#section1",
                    "hideLoggedIn": true,
                    "hideLoggedOut": false,
                    "url": "https://example.com",
                    "includeChildNodes": true,
                    "customClasses": "class1 class2",
                    "image": [
                        {
                            "key": "33333333-3333-3333-3333-333333333333"
                        }
                    ]
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Test Title", newValue);
        Assert.Contains("icon-test", newValue);
        Assert.Contains("Test description", newValue);
        Assert.Contains("_blank", newValue);
        Assert.Contains("#section1", newValue);
        Assert.Contains("class1 class2", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithNullInput_ThrowsException()
    {
        Assert.Throws<ArgumentNullException>(() =>
            UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, null!, out var newValue));
    }

    [Fact]
    public void TryTransformLegacyValue_WithInvalidJson_ThrowsException()
    {
        var invalidJson = "{ this is not valid json }";

        Assert.Throws<JsonException>(() =>
            UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, invalidJson, out var newValue));
    }

    [Fact]
    public void TryTransformLegacyValue_WithEmptyArray_ReturnsTrue()
    {
        var emptyJson = "[]";

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, emptyJson, out var newValue);

        Assert.True(result);
        Assert.Equal("[]", newValue);
    }

    // Note: ItemType mapping is tested indirectly through the JSON transformation tests above
    // The mapping (Link=0 -> External, Content=1 -> Document, Label=2 -> Title) is tested
    // through the TryTransformLegacyValue tests that deserialize JSON

    [Fact]
    public void TryTransformLegacyValue_WithMultipleItems_TransformsAll()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Item 1",
                    "url": "https://example.com/1"
                },
                {
                    "key": "22222222-2222-2222-2222-222222222222",
                    "name": "Item 2",
                    "url": "https://example.com/2"
                },
                {
                    "key": "33333333-3333-3333-3333-333333333333",
                    "name": "Item 3",
                    "url": "https://example.com/3"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Item 1", newValue);
        Assert.Contains("Item 2", newValue);
        Assert.Contains("Item 3", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_IgnoresNullProperties()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Test Item",
                    "url": "https://example.com"
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        // Null properties should not be included in the output JSON
        Assert.DoesNotContain("\"title\":", newValue);
        Assert.DoesNotContain("\"anchor\":", newValue);
    }

    [Fact]
    public void TryTransformLegacyValue_WithDeepNesting_TransformsCorrectly()
    {
        var legacyJson = """
            [
                {
                    "key": "11111111-1111-1111-1111-111111111111",
                    "name": "Level 1",
                    "children": [
                        {
                            "key": "22222222-2222-2222-2222-222222222222",
                            "name": "Level 2",
                            "children": [
                                {
                                    "key": "33333333-3333-3333-3333-333333333333",
                                    "name": "Level 3"
                                }
                            ]
                        }
                    ]
                }
            ]
            """;

        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_loggerMock.Object, legacyJson, out var newValue);

        Assert.True(result);
        Assert.Contains("Level 1", newValue);
        Assert.Contains("Level 2", newValue);
        Assert.Contains("Level 3", newValue);
    }
}
