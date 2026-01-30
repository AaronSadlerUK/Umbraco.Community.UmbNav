# Footer Navigation

This example demonstrates creating organized footer navigation with multiple sections and link groups.

## Overview

Footer navigation typically includes:
- Multiple link groups/columns
- Social media links
- Legal links (privacy, terms)
- Contact information

## Data Type Configuration

Create a separate Data Type for footer navigation:

| Setting | Value |
|---------|-------|
| Maximum Depth | 2 |
| Allow Text Items | Yes (for column headers) |
| Allow Images | Yes (for social icons) |
| Allow Custom Classes | Yes |
| Allow Description | Optional |

## Basic Footer Implementation

### Razor View

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var home = Model.Root();
    var footerNav = home?.Value<IEnumerable<UmbNavItem>>("footerNavigation");
}

@if (footerNav?.Any() == true)
{
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-columns">
                @foreach (var column in footerNav)
                {
                    <div class="footer-column">
                        @if (column.ItemType == UmbNavItemType.Title)
                        {
                            <h3 class="footer-column__title">@column.Name</h3>
                        }
                        else
                        {
                            <h3 class="footer-column__title">
                                <a href="@column.Url()">@column.Name</a>
                            </h3>
                        }

                        @if (column.Children?.Any() == true)
                        {
                            <ul class="footer-column__list">
                                @foreach (var item in column.Children)
                                {
                                    <li class="footer-column__item">
                                        <umbnavitem menu-item="@item"
                                                    active-class="active"
                                                    current-page="@Model">
                                        </umbnavitem>
                                    </li>
                                }
                            </ul>
                        }
                    </div>
                }
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; @DateTime.Now.Year Your Company. All rights reserved.</p>
        </div>
    </footer>
}
```

### CSS

```css
.site-footer {
    background-color: #1a1a2e;
    color: #fff;
    padding: 3rem 0 1rem;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.footer-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.footer-column__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #fff;
}

.footer-column__title a {
    color: #fff;
    text-decoration: none;
}

.footer-column__list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.footer-column__item {
    margin-bottom: 0.5rem;
}

.footer-column__item a {
    color: #b0b0b0;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
}

.footer-column__item a:hover {
    color: #fff;
}

.footer-bottom {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #333;
    text-align: center;
}

.footer-bottom p {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
}
```

## Advanced Footer with Multiple Sections

### Razor View

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.Enums

@{
    var home = Model.Root();
    var footerNav = home?.Value<IEnumerable<UmbNavItem>>("footerNavigation");
    var socialLinks = home?.Value<IEnumerable<UmbNavItem>>("socialLinks");
    var legalLinks = home?.Value<IEnumerable<UmbNavItem>>("legalLinks");
}

<footer class="site-footer">
    <!-- Main Footer -->
    <div class="footer-main">
        <div class="footer-container">
            <!-- Company Info -->
            <div class="footer-brand">
                <a href="@home?.Url()" class="footer-logo">
                    <img src="/images/logo-white.svg" alt="Company Logo" />
                </a>
                <p class="footer-tagline">
                    @(home?.Value<string>("tagline") ?? "Your company tagline here")
                </p>

                @if (socialLinks?.Any() == true)
                {
                    <div class="footer-social">
                        @foreach (var social in socialLinks)
                        {
                            <a href="@social.Url()"
                               class="footer-social__link @social.CustomClasses"
                               target="@social.Target"
                               rel="noopener noreferrer"
                               aria-label="@social.Name">
                                @if (social.Image != null)
                                {
                                    <img src="@social.Image.Url()?width=24&height=24" alt="" />
                                }
                                else
                                {
                                    <span class="footer-social__icon" data-icon="@social.CustomClasses"></span>
                                }
                            </a>
                        }
                    </div>
                }
            </div>

            <!-- Navigation Columns -->
            @if (footerNav?.Any() == true)
            {
                <div class="footer-nav">
                    @foreach (var column in footerNav)
                    {
                        <div class="footer-nav__column">
                            <h3 class="footer-nav__title">@column.Name</h3>

                            @if (column.Children?.Any() == true)
                            {
                                <ul class="footer-nav__list">
                                    @foreach (var item in column.Children)
                                    {
                                        <li>
                                            <a href="@item.Url()"
                                               target="@item.Target"
                                               class="@item.CustomClasses">
                                                @item.Name
                                                @if (!string.IsNullOrEmpty(item.Description))
                                                {
                                                    <span class="footer-nav__badge">@item.Description</span>
                                                }
                                            </a>
                                        </li>
                                    }
                                </ul>
                            }
                        </div>
                    }
                </div>
            }

            <!-- Contact Info -->
            <div class="footer-contact">
                <h3 class="footer-contact__title">Contact Us</h3>
                <address class="footer-contact__info">
                    <p>
                        <strong>Email:</strong>
                        <a href="mailto:@home?.Value<string>("email")">@home?.Value<string>("email")</a>
                    </p>
                    <p>
                        <strong>Phone:</strong>
                        <a href="tel:@home?.Value<string>("phone")">@home?.Value<string>("phone")</a>
                    </p>
                </address>
            </div>
        </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
        <div class="footer-container footer-bottom__container">
            <p class="footer-copyright">
                &copy; @DateTime.Now.Year Your Company. All rights reserved.
            </p>

            @if (legalLinks?.Any() == true)
            {
                <nav class="footer-legal" aria-label="Legal">
                    <ul class="footer-legal__list">
                        @foreach (var link in legalLinks)
                        {
                            <li>
                                <a href="@link.Url()" target="@link.Target">@link.Name</a>
                            </li>
                        }
                    </ul>
                </nav>
            }
        </div>
    </div>
</footer>
```

### CSS

```css
.site-footer {
    background-color: #1a1a2e;
    color: #fff;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* Main Footer */
.footer-main {
    padding: 4rem 0;
}

.footer-main .footer-container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 3rem;
}

/* Brand Section */
.footer-brand {
    display: flex;
    flex-direction: column;
}

.footer-logo img {
    max-width: 150px;
    height: auto;
}

.footer-tagline {
    margin: 1rem 0;
    color: #b0b0b0;
    font-size: 0.9rem;
    line-height: 1.6;
}

/* Social Links */
.footer-social {
    display: flex;
    gap: 0.75rem;
    margin-top: auto;
}

.footer-social__link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: background-color 0.2s, transform 0.2s;
}

.footer-social__link:hover {
    background-color: #007bff;
    transform: translateY(-2px);
}

.footer-social__link img {
    width: 20px;
    height: 20px;
}

/* Navigation Columns */
.footer-nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
}

.footer-nav__title {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 1.25rem 0;
    color: #fff;
}

.footer-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.footer-nav__list li {
    margin-bottom: 0.75rem;
}

.footer-nav__list a {
    color: #b0b0b0;
    text-decoration: none;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
}

.footer-nav__list a:hover {
    color: #fff;
}

.footer-nav__badge {
    background-color: #007bff;
    color: #fff;
    font-size: 0.65rem;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    text-transform: uppercase;
}

/* Contact Section */
.footer-contact__title {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 1.25rem 0;
}

.footer-contact__info {
    font-style: normal;
}

.footer-contact__info p {
    margin: 0 0 0.75rem 0;
    color: #b0b0b0;
    font-size: 0.9rem;
}

.footer-contact__info a {
    color: #fff;
    text-decoration: none;
}

.footer-contact__info a:hover {
    text-decoration: underline;
}

/* Footer Bottom */
.footer-bottom {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1.5rem 0;
}

.footer-bottom__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.footer-copyright {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
}

.footer-legal__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1.5rem;
}

.footer-legal__list a {
    color: #666;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;
}

.footer-legal__list a:hover {
    color: #fff;
}

/* Responsive */
@media (max-width: 1024px) {
    .footer-main .footer-container {
        grid-template-columns: 1fr 1fr;
    }

    .footer-brand {
        grid-column: 1 / -1;
        text-align: center;
        align-items: center;
    }

    .footer-social {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .footer-main .footer-container {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .footer-nav {
        grid-template-columns: repeat(2, 1fr);
    }

    .footer-contact {
        text-align: center;
    }

    .footer-bottom__container {
        flex-direction: column;
        text-align: center;
    }

    .footer-legal__list {
        flex-wrap: wrap;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .footer-nav {
        grid-template-columns: 1fr;
    }
}
```

## Footer with Newsletter Signup

```cshtml
<div class="footer-newsletter">
    <h3 class="footer-newsletter__title">Subscribe to our newsletter</h3>
    <p class="footer-newsletter__desc">Get the latest updates delivered to your inbox.</p>

    <form class="footer-newsletter__form" action="/api/newsletter/subscribe" method="post">
        @Html.AntiForgeryToken()
        <div class="footer-newsletter__input-group">
            <input type="email"
                   name="email"
                   placeholder="Enter your email"
                   required
                   class="footer-newsletter__input" />
            <button type="submit" class="footer-newsletter__button">
                Subscribe
            </button>
        </div>
    </form>
</div>
```

```css
.footer-newsletter {
    background-color: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
}

.footer-newsletter__title {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
}

.footer-newsletter__desc {
    margin: 0 0 1rem 0;
    color: #b0b0b0;
    font-size: 0.9rem;
}

.footer-newsletter__input-group {
    display: flex;
    max-width: 400px;
    margin: 0 auto;
}

.footer-newsletter__input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 0.9rem;
}

.footer-newsletter__button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 0 4px 4px 0;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.footer-newsletter__button:hover {
    background-color: #0056b3;
}
```

## View Component Implementation

### FooterViewComponent.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.UmbNav.Core.Abstractions;
using Umbraco.Community.UmbNav.Core.Models;

public class FooterViewComponent : ViewComponent
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbNavMenuBuilderService _menuBuilder;

    public FooterViewComponent(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbNavMenuBuilderService menuBuilder)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _menuBuilder = menuBuilder;
    }

    public IViewComponentResult Invoke()
    {
        var context = _umbracoContextAccessor.GetRequiredUmbracoContext();
        var currentPage = context.PublishedRequest?.PublishedContent;
        var home = currentPage?.Root();

        if (home == null)
        {
            return Content(string.Empty);
        }

        var model = new FooterViewModel
        {
            Home = home,
            CurrentPage = currentPage,
            FooterNavigation = GetProcessedMenu(home, "footerNavigation"),
            SocialLinks = GetProcessedMenu(home, "socialLinks"),
            LegalLinks = GetProcessedMenu(home, "legalLinks"),
            CompanyName = home.Value<string>("companyName") ?? "Company",
            Email = home.Value<string>("email"),
            Phone = home.Value<string>("phone"),
            Address = home.Value<string>("address")
        };

        return View(model);
    }

    private IEnumerable<UmbNavItem> GetProcessedMenu(IPublishedContent home, string alias)
    {
        var rawItems = home.Value<IEnumerable<UmbNavItem>>(alias);
        if (rawItems == null)
        {
            return Enumerable.Empty<UmbNavItem>();
        }

        var options = new UmbNavBuildOptions { MaxDepth = 2 };
        return _menuBuilder.BuildMenu(rawItems, options);
    }
}

public class FooterViewModel
{
    public IPublishedContent Home { get; set; } = null!;
    public IPublishedContent? CurrentPage { get; set; }
    public IEnumerable<UmbNavItem> FooterNavigation { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IEnumerable<UmbNavItem> SocialLinks { get; set; } = Enumerable.Empty<UmbNavItem>();
    public IEnumerable<UmbNavItem> LegalLinks { get; set; } = Enumerable.Empty<UmbNavItem>();
    public string CompanyName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}
```

### Usage

```cshtml
@await Component.InvokeAsync("Footer")
```

## Next Steps

- [Basic Navigation](basic-navigation.md) - Header navigation
- [Social Media Links](#) - Social link patterns
- [Bootstrap Integration](bootstrap-integration.md) - Bootstrap footer
