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
        public static IHtmlContent GetLinkHtml(this UmbNavItem item, string? cssClass = null, string? id = null, string? culture = null, UrlMode mode = UrlMode.Default, string labelTagName = "span", object? htmlAttributes = null, string? activeClass = null)
        {
            var htmlAttributesConverted = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
            var tagBuilder = item.ItemType == UmbNavItemType.Title
                ? new TagBuilder(labelTagName)
                : new TagBuilder("a");

            tagBuilder.InnerHtml.Append(item.Name);

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

                if (!string.IsNullOrEmpty(item.Noopener))
                {
                    rel.Add(item.Noopener);
                }

                if (!string.IsNullOrEmpty(item.Noreferrer))
                {
                    rel.Add(item.Noreferrer);
                }

                if (htmlAttributesConverted.TryGetValue("rel", out object? value))
                {
                    var originalRelValue = value as string;
                    htmlAttributesConverted["rel"] = string.Format("{0} {1}", originalRelValue, string.Join(" ", rel));
                }
                else
                {
                    htmlAttributesConverted.Add("rel", string.Join(" ", rel));
                }
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

        public static bool IsActive(this UmbNavItem item, IPublishedContent? currentPage, bool checkAncestors = false, int? minLevel = null)
        {
            var contentKey = item.ContentKey ?? item.Content?.Key;
            
            if (contentKey is null || currentPage is null) return false;
            
            var key = currentPage.Key;
            
            if (contentKey == key)
            {
                return true;
            }
            
            if (minLevel.HasValue && currentPage.Level > minLevel)
            {
                return currentPage.Ancestors().Any(x => x.Level >= minLevel
                                                        && x.Key == contentKey.GetValueOrDefault());
            }

            if (checkAncestors)
            {
                if (item.Content != null && item.Content.IsAncestorOrSelf(currentPage) && item.Content != currentPage.Root())
                {
                    return true;
                }
            }

            return false;
        }
    }
}