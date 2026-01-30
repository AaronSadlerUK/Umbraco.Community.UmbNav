namespace Umbraco.Community.UmbNav.Core.Models;

/// <summary>
/// Configuration options for building UmbNav menus.
/// Controls which properties are included or excluded in the output.
/// </summary>
public class UmbNavBuildOptions
{
    /// <summary>
    /// When true, sets Noopener to null on all items.
    /// </summary>
    public bool RemoveNoopener { get; set; }

    /// <summary>
    /// When true, sets Noreferrer to null on all items.
    /// </summary>
    public bool RemoveNoreferrer { get; set; }

    /// <summary>
    /// When true, prevents auto-expansion of child nodes from content items.
    /// </summary>
    public bool HideIncludeChildren { get; set; }

    /// <summary>
    /// When true, sets Description to null on all items.
    /// </summary>
    public bool RemoveDescription { get; set; }

    /// <summary>
    /// When true, sets CustomClasses to null on all items.
    /// </summary>
    public bool RemoveCustomClasses { get; set; }

    /// <summary>
    /// When true, sets Image and ImageArray to null on all items.
    /// </summary>
    public bool RemoveImages { get; set; }

    /// <summary>
    /// Returns a new instance with default values (all options false).
    /// </summary>
    public static UmbNavBuildOptions Default => new();
}
