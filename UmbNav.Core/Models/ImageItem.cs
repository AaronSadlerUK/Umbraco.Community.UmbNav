using System.Text.Json.Serialization;

namespace UmbNav.Core.Models;

public class ImageItem
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
}