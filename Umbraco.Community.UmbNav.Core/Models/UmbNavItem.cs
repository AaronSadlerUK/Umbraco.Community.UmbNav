using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Infrastructure.Serialization;

namespace Umbraco.Community.UmbNav.Core.Models;

public class UmbNavItem
{

    [JsonPropertyName("key")]
    public Guid Key { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    [JsonPropertyName("itemType")]
    public UmbNavItemType ItemType { get; set; }

    [JsonPropertyName("udi")]
    [JsonConverter(typeof(JsonUdiConverter))]
    [Obsolete("Use Contentkey instead")]
    public GuidUdi? Udi { get; set; }

    [JsonPropertyName("contentKey")]
    public Guid? ContentKey { get; set; }

    [JsonPropertyName("anchor")]
    public string? Anchor { get; set; }

    [JsonPropertyName("published")]
    public bool Published { get; set; }

    [JsonPropertyName("naviHide")]
    public bool NaviHide { get; set; }

    [JsonPropertyName("culture")]
    public string? Culture { get; set; }

    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("children")]
    public IEnumerable<UmbNavItem>? Children { get; set; }

    [JsonIgnore]
    public UmbNavItem? Parent { get; set; }

    [JsonIgnore]
    public IPublishedContent? Content { get; set; }

    [JsonIgnore]
    public int Level { get; set; }

    [JsonPropertyName("expanded")]
    public bool Expanded { get; set; }

    [JsonPropertyName("target")]
    public string? Target { get; set; }

    [JsonPropertyName("image")]
    public ImageItem[]? ImageArray { get; set; }

    [JsonIgnore]
    public IPublishedContent? Image { get; set; }

    [JsonPropertyName("customClasses")]
    public string? CustomClasses { get; set; }

    [JsonIgnore]
    public bool IsActive { get; set; }

    [JsonPropertyName("hideLoggedIn")]
    public bool HideLoggedIn { get; set; }

    [JsonPropertyName("hideLoggedOut")]
    public bool HideLoggedOut { get; set; }


    [JsonPropertyName("noopener")]
    public string? Noopener { get; set; }

    [JsonPropertyName("noreferrer")]
    public string? Noreferrer { get; set; }

    [JsonPropertyName("includeChildNodes")]
    public bool IncludeChildNodes { get; set; }
}
