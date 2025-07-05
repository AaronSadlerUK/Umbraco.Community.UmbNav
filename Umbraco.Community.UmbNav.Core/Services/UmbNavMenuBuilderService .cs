using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;
using Umbraco.Extensions;

namespace Umbraco.Community.UmbNav.Core.Services;

public class UmbNavMenuBuilderService : IUmbNavMenuBuilderService
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IPublishedContentCache _publishedContentCache;
    private readonly IPublishedMediaCache _publishedMediaCache;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UmbNavMenuBuilderService> _logger;
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

    public IEnumerable<UmbNavItem> BuildMenu(IEnumerable<UmbNavItem> items, int level = 0,
        bool removeNoopener = false, bool removeNoreferrer = false, bool hideIncludeChildren = false)
    {
        var umbNavItems = items.ToList();
        var removeItems = new List<UmbNavItem>();
        try
        {
            var isLoggedIn = _httpContextAccessor.HttpContext?.User != null &&
                    (_httpContextAccessor.HttpContext.User.Identity?.IsAuthenticated ?? false);
            Guid currentPublishedContentKey = GetCurrentContentKey();
            foreach (var item in umbNavItems)
            {
                if (item.HideLoggedIn && isLoggedIn || item.HideLoggedOut && !isLoggedIn)
                {
                    removeItems.Add(item);
                    continue;
                }

                var children = new List<UmbNavItem>();
                if (item.Children != null && item.Children.Any())
                {
                    children = item.Children.ToList();
                }

                if (item.ContentKey.HasValue)
                {
                    var contentKey = item.ContentKey.Value;
                    IPublishedContent? umbracoContent = item.ItemType == UmbNavItemType.Media ?
                        _publishedMediaCache.GetById(contentKey)
                        : _publishedContentCache.GetById(contentKey);

                    if (umbracoContent != null)
                    {
                        item.Content = umbracoContent;
                        item.Url = umbracoContent.Url();
                        umbracoContent.Key.Equals(currentPublishedContentKey).IfTrue(() => item.IsActive = true);
                        removeNoopener.IfTrue(() => item.Noopener = null);
                        removeNoreferrer.IfTrue(() => item.Noreferrer = null);

                        if (!hideIncludeChildren && item.IncludeChildNodes)
                        {
                            children.AddRange(umbracoContent.Children()
                                .Where(x => x.IsVisible() ||
                                            x.HasProperty("umbracoNavihide") && x.Value<bool>("umbracoNavihide"))
                                .Select(child => new UmbNavItem
                                {
                                    Name = child.Name,
                                    Key = child.Key,
                                    ContentKey = child.Key,
                                    ItemType = UmbNavItemType.Document,
                                    Level = level + 1,
                                    Url = child.Url(),
                                    IsActive = child.Key == currentPublishedContentKey
                                }));
                        }

                        string.IsNullOrWhiteSpace(item.Name).IfTrue(() => umbracoContent.Name());
                    }
                    else
                    {
                        removeItems.Add(item);
                    }
                }
                if (item.ImageArray != null && item.ImageArray.Any())
                {
                    item.Image = GetImageUrl(item.ImageArray[0]);
                }

                if (children.Any())
                {
                    var childItems = BuildMenu(children, level + 1, removeNoopener, removeNoreferrer, hideIncludeChildren).ToList();
                    if (!children.Equals(childItems))
                    {
                        children = childItems;
                    }

                    item.Children = children;
                }

                item.Level = level;
            }

            foreach (var removeItem in removeItems)
            {
                umbNavItems.Remove(removeItem);
            }
            return umbNavItems;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build UmbNav");
            return Enumerable.Empty<UmbNavItem>();
        }
    }

    private Guid GetCurrentContentKey()
    {
        if (_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            var currentPublishedContent = umbracoContext.PublishedRequest?.PublishedContent;
            if (currentPublishedContent != null)
            {
                return currentPublishedContent.Key;
            }
        }

        return Guid.Empty;
    }

    private IPublishedContent? GetImageUrl(ImageItem image)
    {
        if (image.Key != Guid.Empty)
        {
            return _publishedMediaCache.GetById(image.Key);
        }
        return null;
    }
}
