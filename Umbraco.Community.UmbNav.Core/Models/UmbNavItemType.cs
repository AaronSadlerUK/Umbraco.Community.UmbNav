namespace Umbraco.Community.UmbNav.Core.Models;

public static class UmbNavItemType
{
    public const string Document = "Document";
    public const string External = "External";
    public const string Media = "Media";
    public const string Title = "Title";

    public static bool Is(string? itemType, string umbNavItemType)
    {
        return string.Equals(itemType, umbNavItemType, StringComparison.OrdinalIgnoreCase);
    }
}
