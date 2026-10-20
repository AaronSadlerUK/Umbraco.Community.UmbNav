using Microsoft.Extensions.Logging;
using Moq;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Community.UmbNav.Core.Converters;
using Umbraco.Community.UmbNav.Core.Migrations;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Tests.Migrations;

public class UmbNavMeganavAndNestedBlockMigrationTests
{
    private static readonly Guid SectionElementKey = Guid.Parse("6a974652-35e6-490c-89a5-fc42b228c289");
    private static readonly Guid MegaNavElementKey = Guid.Parse("59777aa4-87b8-409a-9974-3e43072482a6");
    private static readonly Guid PickedNodeKey = Guid.Parse("2ab8f9b7-c8c3-41cd-b854-7ea177de6b1d");

    private readonly ILogger _logger = new Mock<ILogger<UmbNavLegacyModelMigration>>().Object;

    private static LegacyContentInfo? ResolveByKey(Guid? key, int? id) =>
        key == PickedNodeKey ? new LegacyContentInfo(PickedNodeKey, "Battery Safety") : null;

    // The "links" property on the section element is the nav property; "sections" is a nested block list.
    private static string? EditorAliasLookup(Guid contentTypeKey, string propertyAlias) =>
        (contentTypeKey, propertyAlias) switch
        {
            var (k, a) when k == SectionElementKey && a == "links" => UmbNavConstants.PropertyEditorAlias,
            var (k, a) when k == SectionElementKey && a == "heading" => "Umbraco.TextBox",
            var (k, a) when k == MegaNavElementKey && a == "sections" => "Umbraco.BlockList",
            _ => null
        };

    private const string MeganavItem = """
        {
            "title": null,
            "url": null,
            "target": null,
            "visible": true,
            "udi": "umb://document/2ab8f9b7c8c341cdb8547ea177de6b1d",
            "itemTypeId": null,
            "settings": {},
            "children": []
        }
        """;

    private const string CurrentItem = """
        {
            "key": "fd3acc3b-ffbd-43c0-9b64-0950098019c4",
            "name": "Prime Fibres",
            "itemType": "Document",
            "contentKey": "fd3acc3b-ffbd-43c0-9b64-0950098019c4",
            "noopener": "",
            "noreferrer": ""
        }
        """;

    private static JsonObject SingleItem(string json) => JsonNode.Parse(json)!.AsArray()[0]!.AsObject();

    [Fact]
    public void TryTransformLegacyValue_WithMeganavContentItem_ResolvesNameAndContentKey()
    {
        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, $"[{MeganavItem}]", ResolveByKey, out var newValue);

        Assert.True(result);
        var item = SingleItem(newValue);
        Assert.Equal("Battery Safety", item["name"]!.GetValue<string>());
        Assert.Equal(UmbNavItemType.Document, item["itemType"]!.GetValue<string>());
        Assert.Equal(PickedNodeKey, item["contentKey"]!.GetValue<Guid>());
        Assert.False(item.ContainsKey("visible"));
        Assert.False(item.ContainsKey("itemTypeId"));
        Assert.False(item.ContainsKey("settings"));
    }

    [Fact]
    public void TryTransformLegacyValue_WithMeganavContentItemAndNoResolver_LeavesNameBlankForTheBuilder()
    {
        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, $"[{MeganavItem}]", out var newValue);

        Assert.True(result);
        var item = SingleItem(newValue);
        Assert.Equal(string.Empty, item["name"]!.GetValue<string>());
        Assert.Equal(PickedNodeKey, item["contentKey"]!.GetValue<Guid>());
    }

    [Fact]
    public void TryTransformLegacyValue_WithMeganavTitleOverride_KeepsTitle()
    {
        var json = """[{ "title": "Batteries", "udi": "umb://document/2ab8f9b7c8c341cdb8547ea177de6b1d", "visible": true }]""";

        UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, json, ResolveByKey, out var newValue);

        Assert.Equal("Batteries", SingleItem(newValue)["name"]!.GetValue<string>());
    }

    [Fact]
    public void TryTransformLegacyValue_WithHiddenMeganavItem_HidesItForEveryone()
    {
        var json = """[{ "title": "Hidden", "url": "https://example.com", "visible": false }]""";

        UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, json, ResolveByKey, out var newValue);

        var item = SingleItem(newValue);
        Assert.Equal(UmbNavItemType.External, item["itemType"]!.GetValue<string>());
        Assert.True(item["hideLoggedIn"]!.GetValue<bool>());
        Assert.True(item["hideLoggedOut"]!.GetValue<bool>());
    }

    [Fact]
    public void TryTransformLegacyValue_WithMeganavV8IdOnlyItem_ResolvesContentById()
    {
        var json = """[{ "id": 1234, "title": null, "target": "_blank", "url": "/old/", "anchor": "#top", "udi": null, "culture": "en-GB", "collapsed": false, "children": [] }]""";

        UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, json,
            (key, id) => id == 1234 ? new LegacyContentInfo(PickedNodeKey, "By Id") : null, out var newValue);

        var item = SingleItem(newValue);
        Assert.Equal(UmbNavItemType.Document, item["itemType"]!.GetValue<string>());
        Assert.Equal(PickedNodeKey, item["contentKey"]!.GetValue<Guid>());
        Assert.Equal("By Id", item["name"]!.GetValue<string>());
        Assert.Equal("#top", item["anchor"]!.GetValue<string>());
        Assert.Equal("_blank", item["target"]!.GetValue<string>());
    }

    [Fact]
    public void TryTransformLegacyValue_WithMixedCurrentAndMeganavItems_KeepsCurrentItemsUntouched()
    {
        var result = UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, $"[{CurrentItem},{MeganavItem}]", ResolveByKey, out var newValue);

        Assert.True(result);
        var items = JsonNode.Parse(newValue)!.AsArray();
        Assert.Equal(2, items.Count);
        Assert.True(JsonNode.DeepEquals(JsonNode.Parse(CurrentItem), items[0]));
        Assert.Equal("Battery Safety", items[1]!["name"]!.GetValue<string>());
    }

    [Theory]
    [InlineData("[]", false)]
    [InlineData("{}", false)]
    [InlineData("not json", false)]
    [InlineData($"[{CurrentItem}]", false)]
    [InlineData($"[{MeganavItem}]", true)]
    [InlineData($"[{CurrentItem},{MeganavItem}]", true)]
    [InlineData("""[{ "name": "Old", "itemType": "nolink" }]""", true)]
    [InlineData("""[{ "name": "Old", "url": "https://example.com" }]""", true)]
    public void IsLegacyValue_DetectsValuesThatStillNeedMigrating(string json, bool expected)
    {
        Assert.Equal(expected, UmbNavLegacyModelMigration.IsLegacyValue(json));
    }

    [Fact]
    public void IsLegacyValue_WithLegacyChildUnderCurrentParent_ReturnsTrue()
    {
        var json = $$"""[{ "key": "fd3acc3b-ffbd-43c0-9b64-0950098019c4", "name": "Parent", "itemType": "Title", "children": [{{MeganavItem}}] }]""";

        Assert.True(UmbNavLegacyModelMigration.IsLegacyValue(json));
    }

    [Fact]
    public void TryTransformLegacyValue_WithLegacyChildUnderCurrentParent_TransformsTheChild()
    {
        var json = $$"""[{ "key": "fd3acc3b-ffbd-43c0-9b64-0950098019c4", "name": "Parent", "itemType": "Title", "children": [{{MeganavItem}}] }]""";

        UmbNavLegacyModelMigration.TryTransformLegacyValue(_logger, json, ResolveByKey, out var newValue);

        var parent = SingleItem(newValue);
        Assert.Equal("Parent", parent["name"]!.GetValue<string>());
        Assert.Equal("Battery Safety", parent["children"]![0]!["name"]!.GetValue<string>());
    }

    [Fact]
    public void DeserializeItems_WithMeganavValue_FallsBackToTransformedItems()
    {
        var items = UmbNavValueConverter.DeserializeItems(_logger, $"[{MeganavItem}]");

        var item = Assert.Single(items);
        Assert.Equal(UmbNavItemType.Document, item.ItemType);
        Assert.Equal(PickedNodeKey, item.ContentKey);
    }

    // Nested block list in the v15+ "values" storage format: megaNav block -> sections block -> links.
    private static string NestedBlockValue(string linksValue) => $$"""
        {
            "layout": { "Umbraco.BlockList": [ { "contentKey": "112f0718-c1a0-495d-a518-41d0d01255b1" } ] },
            "contentData": [
                {
                    "contentTypeKey": "{{MegaNavElementKey}}",
                    "key": "112f0718-c1a0-495d-a518-41d0d01255b1",
                    "values": [
                        {
                            "alias": "sections",
                            "culture": null,
                            "segment": null,
                            "value": {
                                "layout": { "Umbraco.BlockList": [ { "contentKey": "e84deb05-a3e7-4824-b85b-2298ab26ddda" } ] },
                                "contentData": [
                                    {
                                        "contentTypeKey": "{{SectionElementKey}}",
                                        "key": "e84deb05-a3e7-4824-b85b-2298ab26ddda",
                                        "values": [
                                            { "alias": "heading", "culture": null, "segment": null, "value": "Energy Storage" },
                                            { "alias": "links", "culture": null, "segment": null, "value": {{linksValue}} }
                                        ]
                                    }
                                ],
                                "settingsData": []
                            }
                        }
                    ]
                }
            ],
            "settingsData": [],
            "expose": []
        }
        """;

    private static JsonObject LinksFromNested(string newValue)
    {
        var section = JsonNode.Parse(newValue)!["contentData"]![0]!["values"]![0]!["value"]!["contentData"]![0]!;
        return section["values"]![1]!.AsObject();
    }

    [Fact]
    public void TryTransformBlockValue_WithLegacyValueInNestedBlock_TransformsIt()
    {
        var result = UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, NestedBlockValue($"[{MeganavItem}]"), EditorAliasLookup, ResolveByKey, out var newValue);

        Assert.True(result);
        var links = LinksFromNested(newValue)["value"]!.AsArray();
        Assert.Equal("Battery Safety", links[0]!["name"]!.GetValue<string>());
        Assert.Equal(PickedNodeKey, links[0]!["contentKey"]!.GetValue<Guid>());
    }

    [Fact]
    public void TryTransformBlockValue_WithStringEncodedNavValue_KeepsItAString()
    {
        var encoded = JsonSerializer.Serialize($"[{MeganavItem}]");

        var result = UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, NestedBlockValue(encoded), EditorAliasLookup, ResolveByKey, out var newValue);

        Assert.True(result);
        var value = LinksFromNested(newValue)["value"]!;
        Assert.Equal(JsonValueKind.String, value.GetValueKind());
        Assert.Contains("Battery Safety", value.GetValue<string>());
    }

    [Fact]
    public void TryTransformBlockValue_WithCurrentValueOnly_ReturnsFalse()
    {
        var result = UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, NestedBlockValue($"[{CurrentItem}]"), EditorAliasLookup, ResolveByKey, out _);

        Assert.False(result);
    }

    [Fact]
    public void TryTransformBlockValue_DoesNotTouchOtherProperties()
    {
        UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, NestedBlockValue($"[{MeganavItem}]"), EditorAliasLookup, ResolveByKey, out var newValue);

        var section = JsonNode.Parse(newValue)!["contentData"]![0]!["values"]![0]!["value"]!["contentData"]![0]!;
        Assert.Equal("Energy Storage", section["values"]![0]!["value"]!.GetValue<string>());
    }

    [Fact]
    public void TryTransformBlockValue_WithPropertiesAsBlockKeys_TransformsThem()
    {
        // Pre-v15 block storage keeps each property as a key on the block item itself.
        var json = $$"""
            {
                "layout": { "Umbraco.BlockList": [ { "contentUdi": "umb://element/e84deb05a3e74824b85b2298ab26ddda" } ] },
                "contentData": [
                    {
                        "contentTypeKey": "{{SectionElementKey}}",
                        "udi": "umb://element/e84deb05a3e74824b85b2298ab26ddda",
                        "heading": "Energy Storage",
                        "links": [{{MeganavItem}}]
                    }
                ],
                "settingsData": []
            }
            """;

        var result = UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, json, EditorAliasLookup, ResolveByKey, out var newValue);

        Assert.True(result);
        var block = JsonNode.Parse(newValue)!["contentData"]![0]!;
        Assert.Equal("Battery Safety", block["links"]![0]!["name"]!.GetValue<string>());
        Assert.Equal("Energy Storage", block["heading"]!.GetValue<string>());
    }

    [Fact]
    public void TryTransformBlockValue_WithRichTextBlocks_TransformsThem()
    {
        var json = $$"""
            {
                "markup": "<p>hello</p>",
                "blocks": {
                    "layout": {},
                    "contentData": [
                        {
                            "contentTypeKey": "{{SectionElementKey}}",
                            "key": "e84deb05-a3e7-4824-b85b-2298ab26ddda",
                            "values": [ { "alias": "links", "value": [{{MeganavItem}}] } ]
                        }
                    ],
                    "settingsData": []
                }
            }
            """;

        var result = UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, json, EditorAliasLookup, ResolveByKey, out var newValue);

        Assert.True(result);
        Assert.Contains("Battery Safety", newValue);
        Assert.Contains("<p>hello</p>", JsonNode.Parse(newValue)!["markup"]!.GetValue<string>());
    }

    [Theory]
    [InlineData("not json")]
    [InlineData("[]")]
    [InlineData("\"text\"")]
    public void TryTransformBlockValue_WithNonBlockValue_ReturnsFalse(string json)
    {
        Assert.False(UmbNavLegacyModelMigration.TryTransformBlockValue(_logger, json, EditorAliasLookup, ResolveByKey, out _));
    }
}
