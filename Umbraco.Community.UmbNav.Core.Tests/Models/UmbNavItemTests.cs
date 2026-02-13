using System.Text.Json;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Models;

public class UmbNavItemTests
{
    [Fact]
    public void Serialize_WithAllProperties_SerializesCorrectly()
    {
        var item = new UmbNavItem
        {
            Key = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Item",
            Description = "Test description",
            Url = "https://example.com",
            Icon = "icon-test",
            ItemType = UmbNavItemType.External,
            ContentKey = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Anchor = "#section1",
            Published = true,
            Level = 0,
            Target = "_blank",
            CustomClasses = "nav-link",
            HideLoggedIn = false,
            HideLoggedOut = false,
            Noopener = "noopener",
            Noreferrer = "noreferrer",
            IncludeChildNodes = false
        };

        var json = JsonSerializer.Serialize(item);

        Assert.Contains("\"key\":", json);
        Assert.Contains("\"name\":\"Test Item\"", json);
        Assert.Contains("\"description\":\"Test description\"", json);
        Assert.Contains("\"url\":\"https://example.com\"", json);
        Assert.Contains("\"itemType\":\"External\"", json);
    }

    [Fact]
    public void Deserialize_WithValidJson_DeserializesCorrectly()
    {
        var json = """
            {
                "key": "11111111-1111-1111-1111-111111111111",
                "name": "Test Item",
                "url": "https://example.com",
                "itemType": "External"
            }
            """;

        var item = JsonSerializer.Deserialize<UmbNavItem>(json);

        Assert.NotNull(item);
        Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), item.Key);
        Assert.Equal("Test Item", item.Name);
        Assert.Equal("https://example.com", item.Url);
        Assert.Equal(UmbNavItemType.External, item.ItemType);
    }

    [Fact]
    public void Deserialize_WithChildren_DeserializesRecursively()
    {
        var json = """
            {
                "key": "11111111-1111-1111-1111-111111111111",
                "name": "Parent",
                "itemType": "Document",
                "children": [
                    {
                        "key": "22222222-2222-2222-2222-222222222222",
                        "name": "Child 1",
                        "itemType": "Document"
                    },
                    {
                        "key": "33333333-3333-3333-3333-333333333333",
                        "name": "Child 2",
                        "itemType": "Document"
                    }
                ]
            }
            """;

        var item = JsonSerializer.Deserialize<UmbNavItem>(json);

        Assert.NotNull(item);
        Assert.NotNull(item.Children);
        Assert.Equal(2, item.Children.Count());
        Assert.Equal("Child 1", item.Children.First().Name);
        Assert.Equal("Child 2", item.Children.Last().Name);
    }

    [Fact]
    public void Serialize_WithNullProperties_OmitsNullValues()
    {
        var item = new UmbNavItem
        {
            Key = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Item",
            ItemType = UmbNavItemType.External
        };

        var options = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        var json = JsonSerializer.Serialize(item, options);

        Assert.DoesNotContain("\"description\":", json);
        Assert.DoesNotContain("\"url\":", json);
        Assert.DoesNotContain("\"children\":", json);
    }

    [Theory]
    [InlineData("Document")]
    [InlineData("External")]
    [InlineData("Media")]
    [InlineData("Title")]
    public void Deserialize_WithDifferentItemTypes_DeserializesCorrectly(string itemTypeString)
    {
        var json = $@"{{
            ""key"": ""11111111-1111-1111-1111-111111111111"",
            ""name"": ""Test"",
            ""itemType"": ""{itemTypeString}""
        }}";

        var item = JsonSerializer.Deserialize<UmbNavItem>(json);

        Assert.NotNull(item);
        Assert.Equal(itemTypeString, item.ItemType);
    }

    [Fact]
    public void RoundTrip_PreservesAllProperties()
    {
        var original = new UmbNavItem
        {
            Key = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Item",
            Description = "Test description",
            Url = "https://example.com",
            Icon = "icon-test",
            ItemType = UmbNavItemType.External,
            ContentKey = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Anchor = "#section1",
            Published = true,
            Level = 2,
            Target = "_blank",
            CustomClasses = "nav-link active",
            HideLoggedIn = true,
            HideLoggedOut = false,
            Noopener = "noopener",
            Noreferrer = "noreferrer",
            IncludeChildNodes = true
        };

        var json = JsonSerializer.Serialize(original);
        var deserialized = JsonSerializer.Deserialize<UmbNavItem>(json);

        Assert.NotNull(deserialized);
        Assert.Equal(original.Key, deserialized.Key);
        Assert.Equal(original.Name, deserialized.Name);
        Assert.Equal(original.Description, deserialized.Description);
        Assert.Equal(original.Url, deserialized.Url);
        Assert.Equal(original.Icon, deserialized.Icon);
        Assert.Equal(original.ItemType, deserialized.ItemType);
        Assert.Equal(original.ContentKey, deserialized.ContentKey);
        Assert.Equal(original.Anchor, deserialized.Anchor);
        Assert.Equal(original.Published, deserialized.Published);
        Assert.Equal(original.Level, deserialized.Level);
        Assert.Equal(original.Target, deserialized.Target);
        Assert.Equal(original.CustomClasses, deserialized.CustomClasses);
        Assert.Equal(original.HideLoggedIn, deserialized.HideLoggedIn);
        Assert.Equal(original.HideLoggedOut, deserialized.HideLoggedOut);
        Assert.Equal(original.Noopener, deserialized.Noopener);
        Assert.Equal(original.Noreferrer, deserialized.Noreferrer);
        Assert.Equal(original.IncludeChildNodes, deserialized.IncludeChildNodes);
    }

    [Fact]
    public void Content_IsNotSerialized()
    {
        var item = new UmbNavItem
        {
            Key = Guid.NewGuid(),
            Name = "Test",
            ItemType = UmbNavItemType.Document
        };

        var json = JsonSerializer.Serialize(item);

        Assert.DoesNotContain("\"content\":", json.ToLower());
    }

    [Fact]
    public void Image_IsNotSerialized()
    {
        var item = new UmbNavItem
        {
            Key = Guid.NewGuid(),
            Name = "Test",
            ItemType = UmbNavItemType.Document
        };

        var json = JsonSerializer.Serialize(item);

        // Should not serialize the Image property (IPublishedContent)
        // But should serialize ImageArray
        Assert.DoesNotContain("\"image\":{", json.ToLower());
    }

    [Fact]
    public void IsActive_IsNotSerialized()
    {
        var item = new UmbNavItem
        {
            Key = Guid.NewGuid(),
            Name = "Test",
            ItemType = UmbNavItemType.Document,
            IsActive = true
        };

        var json = JsonSerializer.Serialize(item);

        Assert.DoesNotContain("\"isactive\":", json.ToLower());
    }

    [Fact]
    public void ImageArray_IsSerialized()
    {
        var item = new UmbNavItem
        {
            Key = Guid.NewGuid(),
            Name = "Test",
            ItemType = UmbNavItemType.Document,
            ImageArray = new[]
            {
                new ImageItem { Key = Guid.Parse("11111111-1111-1111-1111-111111111111") }
            }
        };

        var json = JsonSerializer.Serialize(item);

        Assert.Contains("\"image\":", json);
        Assert.Contains("11111111-1111-1111-1111-111111111111", json);
    }

    [Fact]
    public void Deserialize_WithMissingName_ThrowsException()
    {
        var json = """
            {
                "key": "11111111-1111-1111-1111-111111111111",
                "itemType": "External"
            }
            """;

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<UmbNavItem>(json));
    }

    [Fact]
    public void Level_DefaultsToZero()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.Equal(0, item.Level);
    }

    [Fact]
    public void Published_DefaultsToNull()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.Null(item.Published);
    }

    [Fact]
    public void IsActive_DefaultsToFalse()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.False(item.IsActive);
    }

    [Fact]
    public void IncludeChildNodes_DefaultsToFalse()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.False(item.IncludeChildNodes);
    }

    [Fact]
    public void HideLoggedIn_DefaultsToFalse()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.False(item.HideLoggedIn);
    }

    [Fact]
    public void HideLoggedOut_DefaultsToFalse()
    {
        var item = new UmbNavItem
        {
            Name = "Test",
            ItemType = UmbNavItemType.External
        };

        Assert.False(item.HideLoggedOut);
    }

    [Fact]
    public void Deserialize_WithCustomItemType_DeserializesCorrectly()
    {
        var json = """
            {
                "key": "11111111-1111-1111-1111-111111111111",
                "name": "Divider",
                "itemType": "divider"
            }
            """;

        var item = JsonSerializer.Deserialize<UmbNavItem>(json);

        Assert.NotNull(item);
        Assert.Equal("divider", item.ItemType);
        Assert.Equal("Divider", item.Name);
    }

    [Fact]
    public void Serialize_WithCustomItemType_SerializesCorrectly()
    {
        var item = new UmbNavItem
        {
            Key = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Divider",
            ItemType = "divider"
        };

        var json = JsonSerializer.Serialize(item);

        Assert.Contains("\"itemType\":\"divider\"", json);
    }
}
