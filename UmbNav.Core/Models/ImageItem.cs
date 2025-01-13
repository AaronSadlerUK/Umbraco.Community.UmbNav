using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
using Umbraco.Cms.Infrastructure.Serialization;

namespace UmbNav.Core.Models;

public class ImageItem
{
    [JsonPropertyName("key")]
    public Guid Key { get; set; }

    [JsonPropertyName("udi")]
    [JsonConverter(typeof(JsonUdiConverter))]
    [Obsolete("Use Key instead")]
    public GuidUdi? Udi { get; set; }
}