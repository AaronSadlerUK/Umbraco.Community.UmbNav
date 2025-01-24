using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Umbraco.Community.UmbNav.Core.Extensions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.UmbNav.Core.Models;

namespace Umbraco.Community.UmbNav.Core.TagHelpers
{
    public class UmbnavitemTagHelper : TagHelper
    {
        public required UmbNavItem MenuItem { get; set; }
        public UrlMode Mode { get; set; }
        public string? Culture { get; set; }
        public string LabelTagName { get; set; } = "span";
        public string? ActiveClass { get; set; }
        public bool IsActiveAncestorCheck { get; set; } = false;
        public IPublishedContent? CurrentPage { get; set; } = null;
        private bool IsLabel => MenuItem?.ItemType == UmbNavItemType.Title;

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = IsLabel ? LabelTagName : "a";
            output.Content.SetContent(MenuItem.Name);

            if (!IsLabel)
            {
                output.Attributes.SetAttribute("href", MenuItem.Url(Culture, Mode));
            }
            
            if (!string.IsNullOrEmpty(MenuItem.CustomClasses))
            {
                output.AddClass(MenuItem.CustomClasses, HtmlEncoder.Default);
            }

            if (!string.IsNullOrEmpty(ActiveClass) && CurrentPage != null && IsActiveAncestorCheck)
            {
                if (MenuItem.IsActive(CurrentPage, true))
                {
                    output.AddClass(ActiveClass, HtmlEncoder.Default);
                }
            }
            else if (!string.IsNullOrEmpty(ActiveClass) && MenuItem.IsActive)
            {
                output.AddClass(ActiveClass, HtmlEncoder.Default);
            }

            if (!string.IsNullOrEmpty(MenuItem.Target) && !IsLabel)
            {
                output.Attributes.SetAttribute("target", MenuItem.Target);
            }

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
    }
}