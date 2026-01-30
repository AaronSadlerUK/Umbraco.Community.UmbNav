# Extension Methods

UmbNav provides extension methods on `UmbNavItem` for programmatic rendering and URL generation. These are useful when you need more control than the TagHelper provides.

## Available Methods

### Url()

Gets the resolved URL for a menu item.

```csharp
string Url(string? culture = null, UrlMode mode = UrlMode.Default)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `culture` | `string?` | `null` | Culture code for multi-language sites |
| `mode` | `UrlMode` | `Default` | URL generation mode |

**Returns:** The URL string, or `"#"` if no URL is available.

**Example:**

```csharp
// Basic usage
var url = item.Url();
// Output: "/about-us/"

// With culture
var url = item.Url("da-DK");
// Output: "/da/om-os/"

// Absolute URL
var url = item.Url(mode: UrlMode.Absolute);
// Output: "https://example.com/about-us/"
```

### IsActive()

Checks if a menu item is active (matches or is an ancestor of the current page).

```csharp
bool IsActive(IPublishedContent currentPage, int? minLevel = null, bool includeDescendants = false)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `currentPage` | `IPublishedContent` | Required | The current page to check against |
| `minLevel` | `int?` | `null` | Minimum level to consider (skip top levels) |
| `includeDescendants` | `bool` | `false` | Also check if current page is a descendant in the content tree |

**Returns:** `true` if the item is active or an ancestor of the active item.

**Example:**

```csharp
// Basic check
var isActive = item.IsActive(Model);

// Skip root level
var isActive = item.IsActive(Model, minLevel: 1);

// Include content tree descendants
var isActive = item.IsActive(Model, includeDescendants: true);
```

### GetLinkHtml()

Generates the complete HTML for a menu item link.

```csharp
IHtmlContent GetLinkHtml(
    string? cssClass = null,
    string? id = null,
    string? culture = null,
    UrlMode mode = UrlMode.Default,
    string labelTagName = "span",
    object? htmlAttributes = null,
    string? activeClass = null)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cssClass` | `string?` | `null` | CSS class(es) to add |
| `id` | `string?` | `null` | HTML id attribute |
| `culture` | `string?` | `null` | Culture for URL generation |
| `mode` | `UrlMode` | `Default` | URL generation mode |
| `labelTagName` | `string` | `"span"` | Tag for text items |
| `htmlAttributes` | `object?` | `null` | Anonymous object of additional attributes |
| `activeClass` | `string?` | `null` | Class to add when `item.IsActive` is true |

**Returns:** `IHtmlContent` that can be rendered directly.

**Example:**

```csharp
// Basic
@item.GetLinkHtml()
// Output: <a href="/about/">About</a>

// With classes
@item.GetLinkHtml(cssClass: "nav-link", activeClass: "active")
// Output: <a href="/about/" class="nav-link active">About</a>

// With custom attributes
@item.GetLinkHtml(htmlAttributes: new { data_toggle = "dropdown", aria_expanded = "false" })
// Output: <a href="/about/" data-toggle="dropdown" aria-expanded="false">About</a>

// For label items with custom tag
@item.GetLinkHtml(labelTagName: "h3", cssClass: "menu-heading")
// Output: <h3 class="menu-heading">Section Title</h3>
```

### GetItemHtml()

Alias for `GetLinkHtml()` - provided for semantic clarity.

```csharp
IHtmlContent GetItemHtml(/* same parameters as GetLinkHtml */)
```

## Usage Examples

### Basic Navigation

```cshtml
@using Umbraco.Community.UmbNav.Core.Extensions

<ul class="nav">
    @foreach (var item in menuItems)
    {
        <li>@item.GetLinkHtml(cssClass: "nav-link")</li>
    }
</ul>
```

### With Active State

```cshtml
<ul class="nav">
    @foreach (var item in menuItems)
    {
        var isActive = item.IsActive(Model, includeDescendants: true);
        <li class="@(isActive ? "active" : "")">
            @item.GetLinkHtml(cssClass: "nav-link", activeClass: "current")
        </li>
    }
</ul>
```

### Bootstrap Dropdown

```cshtml
@foreach (var item in menuItems)
{
    var hasChildren = item.Children?.Any() == true;

    @if (hasChildren)
    {
        <li class="nav-item dropdown">
            @item.GetLinkHtml(
                cssClass: "nav-link dropdown-toggle",
                htmlAttributes: new {
                    data_bs_toggle = "dropdown",
                    aria_expanded = "false",
                    role = "button"
                })
            <ul class="dropdown-menu">
                @foreach (var child in item.Children)
                {
                    <li>@child.GetLinkHtml(cssClass: "dropdown-item")</li>
                }
            </ul>
        </li>
    }
    else
    {
        <li class="nav-item">
            @item.GetLinkHtml(cssClass: "nav-link")
        </li>
    }
}
```

### Building URLs Programmatically

```csharp
@foreach (var item in menuItems)
{
    var url = item.Url();
    var absoluteUrl = item.Url(mode: UrlMode.Absolute);

    <a href="@url">
        @item.Name
        <small class="text-muted">@absoluteUrl</small>
    </a>
}
```

### Conditional Rendering

```cshtml
@foreach (var item in menuItems)
{
    @if (item.ItemType == UmbNavItemType.Title)
    {
        @* Render as heading *@
        <h4 class="menu-heading">@item.Name</h4>
    }
    else if (!string.IsNullOrEmpty(item.Description))
    {
        @* Render with description *@
        <a href="@item.Url()" class="menu-item-detailed">
            <strong>@item.Name</strong>
            <span class="description">@item.Description</span>
        </a>
    }
    else
    {
        @* Standard link *@
        @item.GetLinkHtml(cssClass: "menu-item")
    }
}
```

### With Images

```cshtml
@foreach (var item in menuItems)
{
    <a href="@item.Url()" class="menu-item">
        @if (item.Image != null)
        {
            <img src="@item.Image.Url()" alt="@item.Name" class="menu-icon" />
        }
        <span>@item.Name</span>
    </a>
}
```

### Multi-Language Support

```cshtml
@{
    var cultures = new[] { "en-US", "da-DK", "de-DE" };
}

@foreach (var culture in cultures)
{
    var url = item.Url(culture: culture, mode: UrlMode.Absolute);
    <a href="@url" hreflang="@culture">@culture</a>
}
```

## Combining with Menu Builder Service

For complex scenarios, combine extension methods with the Menu Builder Service:

```cshtml
@inject IUmbNavMenuBuilderService MenuBuilder

@{
    var rawItems = Model.Value<IEnumerable<UmbNavItem>>("navigation");
    var options = new UmbNavBuildOptions
    {
        MaxDepth = 2,
        RemoveDescription = false
    };
    var menuItems = MenuBuilder.BuildMenu(rawItems, options);
}

<nav>
    @foreach (var item in menuItems)
    {
        var isActive = item.IsActive(Model, includeDescendants: true);

        <div class="nav-item @(isActive ? "nav-item--active" : "")">
            @item.GetLinkHtml(cssClass: "nav-link", activeClass: "nav-link--active")

            @if (!string.IsNullOrEmpty(item.Description))
            {
                <p class="nav-description">@item.Description</p>
            }
        </div>
    }
</nav>
```

## Extension Methods vs TagHelper

| Feature | Extension Methods | TagHelper |
|---------|------------------|-----------|
| Syntax | `@item.GetLinkHtml()` | `<umbnavitem>` |
| Flexibility | High | Medium |
| Code reuse | Moderate | High |
| Readability | Good for simple cases | Better for complex markup |
| Custom attributes | Via anonymous object | Not directly supported |
| Performance | Similar | Similar |

**Use Extension Methods when:**
- You need custom HTML attributes
- You're building complex, conditional markup
- You need the URL without the full element
- You're working in C# code (controllers, services)

**Use TagHelper when:**
- You want clean, declarative Razor syntax
- You're building straightforward navigation
- You want consistency across views

## Namespace

Remember to include the namespace:

```csharp
@using Umbraco.Community.UmbNav.Core.Extensions
```

Or add to `_ViewImports.cshtml`:

```cshtml
@using Umbraco.Community.UmbNav.Core.Extensions
@using Umbraco.Community.UmbNav.Core.Models
```
