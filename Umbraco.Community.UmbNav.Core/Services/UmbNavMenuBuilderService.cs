using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Extensions;

namespace Umbraco.Community.UmbNav.Core.Services;

/// <summary>
/// Service for building navigation menus from UmbNav data.
/// This class can be extended to customize menu building behavior.
/// </summary>
public class UmbNavMenuBuilderService : IUmbNavMenuBuilderService
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IPublishedContentCache _publishedContentCache;
    private readonly IPublishedMediaCache _publishedMediaCache;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UmbNavMenuBuilderService> _logger;

    /// <summary>
    /// Gets the Umbraco context accessor for accessing the current Umbraco context.
    /// </summary>
    protected IUmbracoContextAccessor UmbracoContextAccessor => _umbracoContextAccessor;

    /// <summary>
    /// Gets the published content cache for retrieving content items.
    /// </summary>
    protected IPublishedContentCache PublishedContentCache => _publishedContentCache;

    /// <summary>
    /// Gets the published media cache for retrieving media items.
    /// </summary>
    protected IPublishedMediaCache PublishedMediaCache => _publishedMediaCache;

    /// <summary>
    /// Gets the HTTP context accessor for accessing request information.
    /// </summary>
    protected IHttpContextAccessor HttpContextAccessor => _httpContextAccessor;

    /// <summary>
    /// Gets the logger for this service.
    /// </summary>
    protected ILogger<UmbNavMenuBuilderService> Logger => _logger;

    public UmbNavMenuBuilderService(
        IPublishedContentCache publishedContentCache,
        ILogger<UmbNavMenuBuilderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedMediaCache publishedMediaCache)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _publishedContentCache = publishedContentCache;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _publishedMediaCache = publishedMediaCache;
    }

    /// <inheritdoc />
    public virtual IEnumerable<UmbNavItem> BuildMenu(IEnumerable<UmbNavItem> items, UmbNavBuildOptions? options = null)
    {
        options ??= UmbNavBuildOptions.Default;

        try
        {
            return ProcessItems(items.ToList(), level: 0, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build UmbNav");
            return Enumerable.Empty<UmbNavItem>();
        }
    }

    /// <summary>
    /// Processes a list of navigation items at a specific level.
    /// Override this method to customize how items are processed.
    /// </summary>
    /// <param name="items">The items to process.</param>
    /// <param name="level">The current nesting level (0-based).</param>
    /// <param name="options">The build options.</param>
    /// <returns>The processed list of items.</returns>
    protected virtual List<UmbNavItem> ProcessItems(List<UmbNavItem> items, int level, UmbNavBuildOptions options)
    {
        var result = new List<UmbNavItem>();
        var currentContentKey = GetCurrentContentKey();
        var isLoggedIn = IsUserLoggedIn();

        foreach (var item in items)
        {
            if (!ShouldIncludeItem(item, isLoggedIn))
            {
                continue;
            }

            if (!ResolveContent(item, currentContentKey))
            {
                continue;
            }

            ResolveImage(item, options);
            ApplyOptions(item, options);
            ProcessChildren(item, level, options, currentContentKey);

            item.Level = level;
            result.Add(item);
        }

        return result;
    }

    /// <summary>
    /// Determines if the current user is authenticated.
    /// Override this method to customize authentication detection.
    /// </summary>
    /// <returns>True if the user is logged in, otherwise false.</returns>
    protected virtual bool IsUserLoggedIn()
    {
        return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }

    /// <summary>
    /// Determines if the item should be included based on authentication rules.
    /// Override this method to add custom visibility rules.
    /// </summary>
    /// <param name="item">The item to check.</param>
    /// <param name="isLoggedIn">Whether the current user is logged in.</param>
    /// <returns>True if the item should be included, otherwise false.</returns>
    protected virtual bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        if (item.HideLoggedIn && isLoggedIn)
        {
            return false;
        }

        if (item.HideLoggedOut && !isLoggedIn)
        {
            return false;
        }

        return true;
    }

    /// <summary>
    /// Resolves content from Umbraco for Document/Media items.
    /// Sets the Content, Url, Name, and IsActive properties.
    /// Override this method to customize content resolution.
    /// </summary>
    /// <param name="item">The item to resolve content for.</param>
    /// <param name="currentContentKey">The key of the currently viewed content.</param>
    /// <returns>False if content-based item cannot be resolved (should be excluded).</returns>
    protected virtual bool ResolveContent(UmbNavItem item, Guid currentContentKey)
    {
        if (!item.ContentKey.HasValue)
        {
            return true;
        }

        var contentKey = item.ContentKey.Value;
        var umbracoContent = string.Equals(item.ItemType, UmbNavItemType.Media, StringComparison.OrdinalIgnoreCase)
            ? _publishedMediaCache.GetById(contentKey)
            : _publishedContentCache.GetById(contentKey);

        if (umbracoContent == null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(item.Name))
        {
            item.Name = umbracoContent.Name;
        }

        item.Content = umbracoContent;
        item.Url = umbracoContent.Url();
        item.IsActive = umbracoContent.Key.Equals(currentContentKey);

        return true;
    }

    /// <summary>
    /// Resolves the image from the media cache.
    /// Override this method to customize image resolution.
    /// </summary>
    /// <param name="item">The item to resolve the image for.</param>
    /// <param name="options">The build options.</param>
    protected virtual void ResolveImage(UmbNavItem item, UmbNavBuildOptions options)
    {
        if (options.RemoveImages)
        {
            item.Image = null;
            item.ImageArray = null;
            return;
        }

        if (item.ImageArray != null && item.ImageArray.Length > 0)
        {
            var imageKey = item.ImageArray[0].Key;
            if (imageKey != Guid.Empty)
            {
                item.Image = _publishedMediaCache.GetById(imageKey);
            }
        }
    }

    /// <summary>
    /// Applies build options to sanitize/remove properties from the item.
    /// Override this method to customize option application or add custom options.
    /// </summary>
    /// <param name="item">The item to apply options to.</param>
    /// <param name="options">The build options.</param>
    protected virtual void ApplyOptions(UmbNavItem item, UmbNavBuildOptions options)
    {
        if (options.RemoveNoopener)
        {
            item.Noopener = null;
        }

        if (options.RemoveNoreferrer)
        {
            item.Noreferrer = null;
        }

        if (options.RemoveDescription)
        {
            item.Description = null;
        }

        if (options.RemoveCustomClasses)
        {
            item.CustomClasses = null;
        }
    }

    /// <summary>
    /// Processes child items, including auto-expanded children from content nodes.
    /// Respects MaxDepth option (0 = unlimited).
    /// Override this method to customize child processing.
    /// </summary>
    /// <param name="item">The parent item.</param>
    /// <param name="level">The current nesting level.</param>
    /// <param name="options">The build options.</param>
    /// <param name="currentContentKey">The key of the currently viewed content.</param>
    protected virtual void ProcessChildren(UmbNavItem item, int level, UmbNavBuildOptions options, Guid currentContentKey)
    {
        // If MaxDepth is set and we've reached the limit, don't process children
        if (options.MaxDepth > 0 && level >= options.MaxDepth - 1)
        {
            item.Children = null;
            return;
        }

        var children = item.Children?.ToList() ?? new List<UmbNavItem>();

        if (!options.HideIncludeChildren && item.IncludeChildNodes && item.Content != null)
        {
            var autoChildren = GetAutoExpandedChildren(item.Content, level + 1, currentContentKey);
            children.AddRange(autoChildren);
        }

        if (children.Count > 0)
        {
            item.Children = ProcessItems(children, level + 1, options);
        }
        else
        {
            item.Children = null;
        }
    }

    /// <summary>
    /// Gets auto-expanded children from a content node.
    /// Override this method to customize how child nodes are automatically included.
    /// </summary>
    /// <param name="content">The parent content node.</param>
    /// <param name="level">The level for the child items.</param>
    /// <param name="currentContentKey">The key of the currently viewed content.</param>
    /// <returns>A collection of auto-generated child items.</returns>
    protected virtual IEnumerable<UmbNavItem> GetAutoExpandedChildren(IPublishedContent content, int level, Guid currentContentKey)
    {
        return content.Children()
            .Where(x => x.IsVisible())
            .Select(child => new UmbNavItem
            {
                Name = child.Name,
                Key = child.Key,
                ContentKey = child.Key,
                ItemType = UmbNavItemType.Document,
                Level = level,
                Url = child.Url(),
                Content = child,
                IsActive = child.Key == currentContentKey
            });
    }

    /// <summary>
    /// Gets the current page's content key for active state detection.
    /// Override this method to customize active state detection.
    /// </summary>
    /// <returns>The key of the current content, or Guid.Empty if not available.</returns>
    protected virtual Guid GetCurrentContentKey()
    {
        if (_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            var currentContent = umbracoContext.PublishedRequest?.PublishedContent;
            if (currentContent != null)
            {
                return currentContent.Key;
            }
        }

        return Guid.Empty;
    }
}
