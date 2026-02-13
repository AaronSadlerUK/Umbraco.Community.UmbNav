using System.Text.Json.Serialization;

namespace Umbraco.Community.UmbNav.Core.Models;

/// <summary>
/// Culture-specific variants for UmbNav item properties.
/// Allows the same navigation structure to display different text per language.
/// </summary>
public class UmbNavItemVariants
{
    /// <summary>
    /// Culture-specific name translations.
    /// Key is culture code (e.g., "en-US", "fr-FR"), value is the translated name.
    /// </summary>
    [JsonPropertyName("name")]
    public Dictionary<string, string>? Name { get; set; }

    /// <summary>
    /// Culture-specific description translations.
    /// Key is culture code (e.g., "en-US", "fr-FR"), value is the translated description.
    /// </summary>
    [JsonPropertyName("description")]
    public Dictionary<string, string>? Description { get; set; }
}
