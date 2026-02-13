using System.Text.Json.Serialization;
using Umbraco.Cms.Core.Models.PublishedContent;

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

    [JsonPropertyName("contentKey")]
    public Guid? ContentKey { get; set; }

    [JsonPropertyName("anchor")]
    public string? Anchor { get; set; }

    [JsonPropertyName("published")]
    public bool? Published { get; set; }

    [JsonPropertyName("children")]
    public IEnumerable<UmbNavItem>? Children { get; set; }

    [JsonIgnore]
    public IPublishedContent? Content { get; set; }

    [JsonPropertyName("level")]
    public int Level { get; set; }

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

    /// <summary>
    /// Optional culture-specific variants for multi-lingual sites.
    /// Allows the same navigation structure to display different names/descriptions per language.
    /// Falls back to <see cref="Name"/> and <see cref="Description"/> if variant not found.
    /// </summary>
    [JsonPropertyName("variants")]
    public UmbNavItemVariants? Variants { get; set; }
}
