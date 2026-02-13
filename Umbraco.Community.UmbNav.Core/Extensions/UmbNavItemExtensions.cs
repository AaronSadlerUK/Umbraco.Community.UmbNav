using Umbraco.Extensions;
using Umbraco.Cms.Core.Models.PublishedContent;
using HtmlHelper = Microsoft.AspNetCore.Mvc.ViewFeatures.HtmlHelper;
using TagBuilder = Microsoft.AspNetCore.Mvc.Rendering.TagBuilder;
using Microsoft.AspNetCore.Html;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.Extensions
{
    public static class UmbNavItemExtensions
    {
        /// <summary>
        /// Gets the name for the specified culture, falling back to the invariant name if no variant exists.
        /// </summary>
        /// <param name="item">The navigation item</param>
        /// <param name="culture">The culture code (e.g., "en-US", "fr-FR"). If null, returns invariant name.</param>
        /// <returns>The culture-specific name or invariant fallback</returns>
        public static string GetName(this UmbNavItem item, string? culture = null)
        {
            // If culture specified and variant exists, use it
            if (culture != null &&
                item.Variants?.Name?.TryGetValue(culture, out var variantName) == true &&
                !string.IsNullOrWhiteSpace(variantName))
            {
                return variantName;
            }

            // For Document items, optionally get name from content node
            // This allows using Umbraco's built-in content variants
            if (item.Content != null && culture != null)
            {
                var contentName = item.Content.Name(culture);
                if (!string.IsNullOrWhiteSpace(contentName))
                {
                    return contentName;
                }
            }

            // Fallback to invariant name
            return item.Name;
        }

        /// <summary>
        /// Gets the description for the specified culture, falling back to the invariant description if no variant exists.
        /// </summary>
        /// <param name="item">The navigation item</param>
        /// <param name="culture">The culture code (e.g., "en-US", "fr-FR"). If null, returns invariant description.</param>
        /// <returns>The culture-specific description or invariant fallback</returns>
        public static string? GetDescription(this UmbNavItem item, string? culture = null)
        {
            // If culture specified and variant exists, use it
            if (culture != null &&
                item.Variants?.Description?.TryGetValue(culture, out var variantDesc) == true &&
                !string.IsNullOrWhiteSpace(variantDesc))
            {
                return variantDesc;
            }

            // Fallback to invariant description
            return item.Description;
        }

        public static IHtmlContent GetLinkHtml(this UmbNavItem item, string? cssClass = null, string? id = null, string? culture = null, UrlMode mode = UrlMode.Default, string labelTagName = "span", object? htmlAttributes = null, string? activeClass = null)
        {
            var htmlAttributesConverted = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
            var tagBuilder = item.ItemType == UmbNavItemType.Title
                ? new TagBuilder(labelTagName)
                : new TagBuilder("a");

            // Use culture-aware name if culture is specified
            var displayName = culture != null ? item.GetName(culture) : item.Name;
            tagBuilder.InnerHtml.Append(displayName);

            if (!string.IsNullOrEmpty(cssClass))
            {
                tagBuilder.AddCssClass(cssClass);
            }

            if (!string.IsNullOrEmpty(item.CustomClasses))
            {
                tagBuilder.AddCssClass(item.CustomClasses);
            }

            if (!string.IsNullOrEmpty(activeClass) && item.IsActive)
            {
                tagBuilder.AddCssClass(activeClass);
            }

            if (!string.IsNullOrEmpty(id))
            {
                tagBuilder.Attributes.Add("id", id);
            }

            tagBuilder.MergeAttributes(htmlAttributesConverted);

            if (item.ItemType == UmbNavItemType.Title)
            {
                return tagBuilder;
            }

            tagBuilder.Attributes.Add("href", item.Url(culture, mode));

            if (!string.IsNullOrEmpty(item.Target))
            {
                tagBuilder.Attributes.Add("target", item.Target);
            }

            if (!string.IsNullOrEmpty(item.Noopener) || !string.IsNullOrEmpty(item.Noreferrer))
            {
                var rel = new List<string>();

                // Preserve any existing rel value from htmlAttributes
                if (htmlAttributesConverted.TryGetValue("rel", out object? value) && value is string existingRel)
                {
                    rel.Add(existingRel);
                }

                if (!string.IsNullOrEmpty(item.Noopener))
                {
                    rel.Add(item.Noopener);
                }

                if (!string.IsNullOrEmpty(item.Noreferrer))
                {
                    rel.Add(item.Noreferrer);
                }

                tagBuilder.Attributes["rel"] = string.Join(" ", rel);
            }

            return tagBuilder;
        }

        public static IHtmlContent GetItemHtml(this UmbNavItem item, string? cssClass = null, string? id = null, string? culture = null, UrlMode mode = UrlMode.Default, string labelTagName = "span", object? htmlAttributes = null, string? activeClass = null)
        {
            return GetLinkHtml(item, cssClass, id, culture, mode, labelTagName, htmlAttributes, activeClass);
        }

        public static string Url(this UmbNavItem item, string? culture = null, UrlMode mode = UrlMode.Default)
        {
            if (item.Content != null)
            {
                switch (item.Content.ContentType.ItemType)
                {
                    case PublishedItemType.Content:

                        string url;
                        if (!string.IsNullOrEmpty(item.Anchor))
                        {
                            url = item.Content.Url(culture, mode) + item.Anchor;
                        }
                        else
                        {
                            url = item.Content.Url(culture, mode);
                        }

                        return url;

                    case PublishedItemType.Media:
                        return item.Content.Url(culture, mode);

                    default:
                        throw new NotSupportedException();
                }
            }

            return item.Url ?? "#";
        }

        public static bool IsActive(this UmbNavItem item, IPublishedContent currentPage, int? minLevel = null, bool includeDescendants = false)
        {
            if (minLevel.HasValue && item.Level < minLevel.Value)
                return false;

            var contentKey = item.ContentKey ?? item.Content?.Key;
            var currentPageKey = currentPage.Key;

            // Direct match - this nav item IS the current page
            if (contentKey.HasValue && contentKey.Value == currentPageKey)
                return true;

            // Check if current page is a descendant of this nav item's content in the content tree
            if (includeDescendants && item.Content != null)
            {
                // Check if the current page's path contains this item's content ID
                var itemContentId = item.Content.Id.ToString();
                var currentPagePath = currentPage.Path;

                // Path is comma-separated IDs like "-1,1234,5678,9012"
                // Check if itemContentId appears in the path (but not as a substring of another ID)
                var pathIds = currentPagePath.Split(',');
                if (pathIds.Contains(itemContentId))
                    return true;
            }

            // Check if any child nav items match the current page (making this a parent of the active item)
            if (item.Children != null)
            {
                foreach (var child in item.Children)
                {
                    if (child.IsActive(currentPage, minLevel, includeDescendants))
                        return true;
                }
            }

            return false;
        }
    }
}