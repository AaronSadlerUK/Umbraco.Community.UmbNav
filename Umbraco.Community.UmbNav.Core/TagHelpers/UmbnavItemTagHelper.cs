using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Umbraco.Community.UmbNav.Core.Extensions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.TagHelpers
{
    /// <summary>
    /// Tag helper for rendering UmbNav menu items as HTML elements.
    /// This class can be extended to customize rendering behavior.
    /// </summary>
    public class UmbnavitemTagHelper : TagHelper
    {
        /// <summary>
        /// The menu item to render.
        /// </summary>
        public required UmbNavItem MenuItem { get; set; }

        /// <summary>
        /// The URL mode for generating links.
        /// </summary>
        public UrlMode Mode { get; set; }

        /// <summary>
        /// The culture for URL generation.
        /// </summary>
        public string? Culture { get; set; }

        /// <summary>
        /// The tag name to use for label items. Default is "span".
        /// </summary>
        public string LabelTagName { get; set; } = "span";

        /// <summary>
        /// The CSS class to add when the item is active.
        /// </summary>
        public string? ActiveClass { get; set; }

        /// <summary>
        /// Whether to check ancestors for active state.
        /// </summary>
        public bool IsActiveAncestorCheck { get; set; } = false;

        /// <summary>
        /// The current page for active state detection.
        /// </summary>
        public IPublishedContent? CurrentPage { get; set; } = null;

        /// <summary>
        /// Determines if the current item is a label (non-link) item.
        /// </summary>
        protected virtual bool IsLabel => MenuItem?.ItemType == UmbNavItemType.Title;

        /// <summary>
        /// Gets the tag name to render for this item.
        /// Override to customize tag selection.
        /// </summary>
        protected virtual string GetTagName() => IsLabel ? LabelTagName : "a";

        /// <summary>
        /// Gets the content text for this item.
        /// Uses culture-aware variant if Culture is specified, otherwise uses invariant name.
        /// Override to customize content rendering.
        /// </summary>
        protected virtual string? GetContent() => MenuItem.GetName(Culture);

        /// <summary>
        /// Gets the URL for this item.
        /// Override to customize URL generation.
        /// </summary>
        protected virtual string? GetUrl() => MenuItem.Url(Culture, Mode);

        /// <summary>
        /// Determines if the item should be marked as active.
        /// Override to customize active state detection.
        /// </summary>
        protected virtual bool IsItemActive()
        {
            if (!string.IsNullOrEmpty(ActiveClass) && CurrentPage != null && IsActiveAncestorCheck)
            {
                return MenuItem.IsActive(CurrentPage);
            }

            return !string.IsNullOrEmpty(ActiveClass) && MenuItem.IsActive;
        }

        /// <summary>
        /// Processes the tag helper, rendering the menu item.
        /// Override to completely customize rendering.
        /// </summary>
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = GetTagName();
            output.Content.SetContent(GetContent());

            ProcessLink(output);
            ProcessClasses(output);
            ProcessActiveState(output);
            ProcessTarget(output);
            ProcessRel(output);
            ProcessCustomAttributes(context, output);
        }

        /// <summary>
        /// Processes the link href attribute.
        /// Override to customize link processing.
        /// </summary>
        protected virtual void ProcessLink(TagHelperOutput output)
        {
            if (!IsLabel)
            {
                output.Attributes.SetAttribute("href", GetUrl());
            }
        }

        /// <summary>
        /// Processes CSS classes from the menu item.
        /// Override to add custom class logic.
        /// </summary>
        protected virtual void ProcessClasses(TagHelperOutput output)
        {
            if (!string.IsNullOrEmpty(MenuItem.CustomClasses))
            {
                output.AddClass(MenuItem.CustomClasses, HtmlEncoder.Default);
            }
        }

        /// <summary>
        /// Processes the active state class.
        /// Override to customize active state styling.
        /// </summary>
        protected virtual void ProcessActiveState(TagHelperOutput output)
        {
            if (IsItemActive())
            {
                output.AddClass(ActiveClass!, HtmlEncoder.Default);
            }
        }

        /// <summary>
        /// Processes the target attribute for links.
        /// Override to customize target handling.
        /// </summary>
        protected virtual void ProcessTarget(TagHelperOutput output)
        {
            if (!string.IsNullOrEmpty(MenuItem.Target) && !IsLabel)
            {
                output.Attributes.SetAttribute("target", MenuItem.Target);
            }
        }

        /// <summary>
        /// Processes the rel attribute (noopener, noreferrer).
        /// Override to customize rel handling.
        /// </summary>
        protected virtual void ProcessRel(TagHelperOutput output)
        {
            if ((!string.IsNullOrEmpty(MenuItem.Noopener) || !string.IsNullOrEmpty(MenuItem.Noreferrer)) && !IsLabel)
            {
                var rel = new List<string>();

                if (!string.IsNullOrEmpty(MenuItem.Noopener))
                {
                    rel.Add(MenuItem.Noopener);
                }

                if (!string.IsNullOrEmpty(MenuItem.Noreferrer))
                {
                    rel.Add(MenuItem.Noreferrer);
                }

                if (output.Attributes["rel"] != null)
                {
                    var originalRelValue = output.Attributes["rel"].Value;
                    output.Attributes.SetAttribute("rel", string.Format("{0} {1}", originalRelValue, string.Join(" ", rel)));
                }
                else
                {
                    output.Attributes.SetAttribute("rel", string.Join(" ", rel));
                }
            }
        }

        /// <summary>
        /// Hook for adding custom attributes to the output.
        /// Override to add additional attributes.
        /// </summary>
        protected virtual void ProcessCustomAttributes(TagHelperContext context, TagHelperOutput output)
        {
            // Override in derived classes to add custom attributes
        }
    }
}
