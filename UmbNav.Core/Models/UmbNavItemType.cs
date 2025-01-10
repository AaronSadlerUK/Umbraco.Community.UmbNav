using System.Runtime.Serialization;

namespace UmbNav.Core.Models;

public enum UmbNavItemType
{
    [EnumMember(Value = "document")]
    Document,
    [EnumMember(Value = "external")]
    External,
    [EnumMember(Value = "media")]
    Media,
    [EnumMember(Value = "title")]
    Title
}
