using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Abstractions;

public interface IUmbNavMenuBuilderService
{
    /// <summary>
    /// Builds a navigation menu from the provided items.
    /// </summary>
    /// <param name="items">The menu items to process.</param>
    /// <param name="options">Optional build options to control property inclusion/exclusion.</param>
    /// <returns>Processed menu items with resolved content, URLs, and applied options.</returns>
    IEnumerable<UmbNavItem> BuildMenu(IEnumerable<UmbNavItem> items, UmbNavBuildOptions? options = null);
}
