using System.Text.Json;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
namespace Umbraco.Community.UmbNav.Core.Converters
{
    /// <summary>
    /// JSON converter for Umbraco UDI types used in UmbNav serialization.
    /// This class can be extended to customize UDI serialization behavior.
    /// </summary>
    public class UmbNavJsonUdiConverter : JsonConverter<Udi>
    {
        /// <inheritdoc />
        public override bool CanConvert(Type typeToConvert)
            => typeof(Udi).IsAssignableFrom(typeToConvert);

        /// <inheritdoc />
        public override Udi? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.GetString() is string value && !string.IsNullOrWhiteSpace(value))
            {
                return UdiParser.Parse(value);
            }

            return null;
        }

        /// <inheritdoc />
        public override void Write(Utf8JsonWriter writer, Udi value, JsonSerializerOptions options)
            => writer.WriteStringValue(value.ToString());
    }
}
