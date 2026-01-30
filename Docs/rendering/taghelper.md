# TagHelper

The UmbNav TagHelper provides a clean, declarative syntax for rendering menu items in Razor views. It handles link generation, active states, and HTML attribute output automatically.

## Basic Usage

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.TagHelpers

@{
    var menuItems = Model.Value<IEnumerable<UmbNavItem>>("mainNavigation");
}

<ul>
    @foreach (var item in menuItems)
    {
        <li>
            <umbnavitem menu-item="@item"></umbnavitem>
        </li>
    }
</ul>
```

## Output

The TagHelper renders either an `<a>` tag for links or a configurable tag for labels:

**For link items:**
```html
<a href="/about-us/" class="custom-class" target="_blank" rel="noopener noreferrer">About Us</a>
```

**For text/label items:**
```html
<span>Section Heading</span>
```

## Attributes Reference

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `menu-item` | `UmbNavItem` | The menu item to render |

### URL Generation

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `UrlMode` | `Default` | URL generation mode: `Default`, `Absolute`, `Relative` |
| `culture` | `string` | `null` | Culture code for multi-language URL generation |

### Active State

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `active-class` | `string` | `null` | CSS class to add when item is active |
| `current-page` | `IPublishedContent` | `null` | The current page for active state detection |
| `is-active-ancestor-check` | `bool` | `false` | Also mark ancestors of active page as active |

### Label Items

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label-tag-name` | `string` | `"span"` | HTML tag to use for text/label items |

## Detailed Examples

### Basic Navigation

```cshtml
<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <umbnavitem menu-item="@item"></umbnavitem>
            </li>
        }
    </ul>
</nav>
```

### With Active State

Highlight the current page and its ancestors:

```cshtml
<nav>
    <ul>
        @foreach (var item in menuItems)
        {
            <li>
                <umbnavitem
                    menu-item="@item"
                    active-class="active"
                    current-page="@Model"
                    is-active-ancestor-check="true">
                </umbnavitem>
            </li>
        }
    </ul>
</nav>
```

### Multi-Level Navigation

Render nested menus with recursion:

```cshtml
@helper RenderMenuLevel(IEnumerable<UmbNavItem> items, IPublishedContent currentPage, int level = 0)
{
    <ul class="nav-level-@level">
        @foreach (var item in items)
        {
            var hasChildren = item.Children?.Any() == true;
            <li class="@(hasChildren ? "has-submenu" : "")">
                <umbnavitem
                    menu-item="@item"
                    active-class="active"
                    current-page="@currentPage"
                    is-active-ancestor-check="true">
                </umbnavitem>

                @if (hasChildren)
                {
                    @RenderMenuLevel(item.Children, currentPage, level + 1)
                }
            </li>
        }
    </ul>
}

<nav aria-label="Main navigation">
    @RenderMenuLevel(menuItems, Model)
</nav>
```

### Multilingual Sites

Specify culture for correct URL generation:

```cshtml
@{
    var culture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
}

<umbnavitem
    menu-item="@item"
    culture="@culture"
    mode="UrlMode.Absolute">
</umbnavitem>
```

### Custom Label Tags

Use a different tag for text items:

```cshtml
@* Render labels as <h3> tags *@
<umbnavitem
    menu-item="@item"
    label-tag-name="h3">
</umbnavitem>

@* Render labels as <button> tags for interactive menus *@
<umbnavitem
    menu-item="@item"
    label-tag-name="button">
</umbnavitem>
```

### Absolute URLs

For external sharing or emails:

```cshtml
<umbnavitem
    menu-item="@item"
    mode="UrlMode.Absolute">
</umbnavitem>

@* Output: <a href="https://example.com/about-us/">About Us</a> *@
```

## Understanding Active State

The TagHelper supports two methods for determining active state:

### 1. Pre-computed Active State

The `IUmbNavMenuBuilderService` automatically sets the `IsActive` property on items when building the menu:

```cshtml
@* Uses item.IsActive which is set by the service *@
<umbnavitem
    menu-item="@item"
    active-class="active">
</umbnavitem>
```

### 2. Runtime Active Check

For more control, pass the current page to check at render time:

```cshtml
@* Checks against current page at render time *@
<umbnavitem
    menu-item="@item"
    active-class="active"
    current-page="@Model"
    is-active-ancestor-check="true">
</umbnavitem>
```

The `is-active-ancestor-check` option also marks parent items as active when a child page is the current page. This is essential for multi-level navigation where you want to show the path to the current page.

## Handling Item Types

The TagHelper automatically handles different item types:

### Link Items (`UmbNavItemType.Link`)

Renders as `<a>` with href, target, and rel attributes:

```html
<a href="https://external.com" target="_blank" rel="noopener noreferrer">External Link</a>
```

### Content Items (`UmbNavItemType.Document`)

Renders as `<a>` with URL resolved from the content node:

```html
<a href="/about-us/">About Us</a>
```

### Text Items (`UmbNavItemType.Title`)

Renders as the configured label tag (default: `<span>`):

```html
<span>Section Title</span>
```

## Complete Example

A fully-featured navigation component:

```cshtml
@using Umbraco.Community.UmbNav.Core.Models
@using Umbraco.Community.UmbNav.Core.TagHelpers
@using Umbraco.Cms.Core.Models.PublishedContent

@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage

@{
    var home = Umbraco.ContentAtRoot().FirstOrDefault();
    var menuItems = home?.Value<IEnumerable<UmbNavItem>>("mainNavigation");
    var culture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
}

@if (menuItems?.Any() == true)
{
    <nav class="main-nav" role="navigation" aria-label="Main navigation">
        <ul class="main-nav__list">
            @foreach (var item in menuItems)
            {
                var hasChildren = item.Children?.Any() == true;
                var itemClasses = new List<string> { "main-nav__item" };

                if (hasChildren) itemClasses.Add("main-nav__item--has-children");
                if (item.IsActive) itemClasses.Add("main-nav__item--active");

                <li class="@string.Join(" ", itemClasses)">
                    <umbnavitem
                        menu-item="@item"
                        active-class="main-nav__link--active"
                        current-page="@Model"
                        is-active-ancestor-check="true"
                        culture="@culture">
                    </umbnavitem>

                    @if (hasChildren)
                    {
                        <ul class="main-nav__submenu">
                            @foreach (var child in item.Children)
                            {
                                <li class="main-nav__submenu-item">
                                    <umbnavitem
                                        menu-item="@child"
                                        active-class="main-nav__link--active"
                                        current-page="@Model"
                                        is-active-ancestor-check="true"
                                        culture="@culture">
                                    </umbnavitem>
                                </li>
                            }
                        </ul>
                    }
                </li>
            }
        </ul>
    </nav>
}
```

## Accessibility Considerations

When building navigation, consider these accessibility best practices:

```cshtml
<nav aria-label="Main navigation">
    <ul role="menubar">
        @foreach (var item in menuItems)
        {
            var hasChildren = item.Children?.Any() == true;

            <li role="none">
                <umbnavitem
                    menu-item="@item"
                    active-class="active"
                    current-page="@Model">
                </umbnavitem>

                @if (hasChildren)
                {
                    <ul role="menu" aria-label="@item.Name submenu">
                        @foreach (var child in item.Children)
                        {
                            <li role="none">
                                <umbnavitem menu-item="@child"></umbnavitem>
                            </li>
                        }
                    </ul>
                }
            </li>
        }
    </ul>
</nav>
```

## CSS Output

The TagHelper preserves custom classes from menu items:

```cshtml
@* If item.CustomClasses = "featured primary-link" *@
<umbnavitem menu-item="@item" active-class="active"></umbnavitem>

@* Output (when active): *@
<a href="/page/" class="featured primary-link active">Page</a>
```

## Performance Tips

1. **Cache menu items** at the view level if your navigation doesn't change per-request
2. **Use the Menu Builder Service** to filter items before rendering rather than in the view
3. **Limit depth** in the Data Type to prevent deeply nested loops

## Next Steps

- [Extension Methods](extension-methods.md) - Alternative programmatic rendering
- [Menu Builder Service](menu-builder-service.md) - Process menus before rendering
- [Extending the TagHelper](../extensibility/backend/taghelper.md) - Create custom TagHelpers
