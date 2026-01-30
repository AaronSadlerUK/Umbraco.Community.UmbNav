# UmbNavItem Model

The `UmbNavItem` class is the core data model representing a menu item in UmbNav. Understanding this model is essential for working with UmbNav in views and extensions.

## Class Definition

```csharp
namespace Umbraco.Community.UmbNav.Core.Models;

public class UmbNavItem
{
    public Guid Key { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public UmbNavItemType ItemType { get; set; }
    public Guid? ContentKey { get; set; }
    public string? Anchor { get; set; }
    public bool Published { get; set; }
    public IEnumerable<UmbNavItem>? Children { get; set; }
    public IPublishedContent? Content { get; set; }
    public int Level { get; set; }
    public string? Target { get; set; }
    public ImageItem[]? ImageArray { get; set; }
    public IPublishedContent? Image { get; set; }
    public string? CustomClasses { get; set; }
    public bool IsActive { get; set; }
    public bool HideLoggedIn { get; set; }
    public bool HideLoggedOut { get; set; }
    public string? Noopener { get; set; }
    public string? Noreferrer { get; set; }
    public bool IncludeChildNodes { get; set; }
}
```

## Properties Reference

### Identification

| Property | Type | Description |
|----------|------|-------------|
| `Key` | `Guid` | Unique identifier for this menu item |
| `Name` | `string` | Display name (required) |
| `Description` | `string?` | Optional description text |
| `Icon` | `string?` | Icon name (e.g., "icon-document") |

### Item Type

| Property | Type | Description |
|----------|------|-------------|
| `ItemType` | `UmbNavItemType` | The type of menu item |

```csharp
public enum UmbNavItemType
{
    Link,      // External URL
    Document,  // Umbraco content
    Title      // Text label (non-clickable)
}
```

### URL & Navigation

| Property | Type | Description |
|----------|------|-------------|
| `Url` | `string?` | The URL (for Link items) or resolved URL (for Document items) |
| `ContentKey` | `Guid?` | Umbraco content GUID (for Document items) |
| `Anchor` | `string?` | URL anchor/fragment (e.g., "#section") |
| `Target` | `string?` | Link target (e.g., "_blank") |

### Content Resolution

| Property | Type | Description |
|----------|------|-------------|
| `Content` | `IPublishedContent?` | Resolved content node (populated by Menu Builder Service) |
| `Published` | `bool` | Whether the linked content is published |

### Hierarchy

| Property | Type | Description |
|----------|------|-------------|
| `Children` | `IEnumerable<UmbNavItem>?` | Child menu items |
| `Level` | `int` | Nesting level (0 = root) |
| `IncludeChildNodes` | `bool` | Auto-include content children when rendering |

### Images

| Property | Type | Description |
|----------|------|-------------|
| `ImageArray` | `ImageItem[]?` | Raw image data from the editor |
| `Image` | `IPublishedContent?` | Resolved image media (populated by Menu Builder Service) |

### Styling

| Property | Type | Description |
|----------|------|-------------|
| `CustomClasses` | `string?` | Custom CSS classes |
| `IsActive` | `bool` | Whether this item is the current page |

### Visibility

| Property | Type | Description |
|----------|------|-------------|
| `HideLoggedIn` | `bool` | Hide when user is authenticated |
| `HideLoggedOut` | `bool` | Hide when user is not authenticated |

### Link Attributes

| Property | Type | Description |
|----------|------|-------------|
| `Noopener` | `string?` | Value for rel="noopener" |
| `Noreferrer` | `string?` | Value for rel="noreferrer" |

## JSON Serialization

The model is designed for JSON serialization with explicit property names:

```json
{
  "key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "About Us",
  "description": "Learn more about our company",
  "url": null,
  "icon": "icon-document",
  "itemType": "Document",
  "contentKey": "12345678-1234-1234-1234-123456789012",
  "anchor": null,
  "published": true,
  "children": [],
  "level": 0,
  "target": null,
  "image": null,
  "customClasses": "featured primary",
  "hideLoggedIn": false,
  "hideLoggedOut": false,
  "noopener": null,
  "noreferrer": null,
  "includeChildNodes": false
}
```

## Working with Different Item Types

### Document Items

Content-linked items with resolved URLs:

```csharp
@if (item.ItemType == UmbNavItemType.Document)
{
    // Content is resolved by the Menu Builder Service
    var content = item.Content;
    var url = item.Url(); // Extension method

    <a href="@url">
        @item.Name
        @if (content != null)
        {
            <small>(@content.ContentType.Alias)</small>
        }
    </a>
}
```

### Link Items

External or custom URLs:

```csharp
@if (item.ItemType == UmbNavItemType.Link)
{
    var relParts = new List<string>();
    if (!string.IsNullOrEmpty(item.Noopener)) relParts.Add(item.Noopener);
    if (!string.IsNullOrEmpty(item.Noreferrer)) relParts.Add(item.Noreferrer);

    <a href="@item.Url"
       target="@item.Target"
       rel="@string.Join(" ", relParts)">
        @item.Name
    </a>
}
```

### Title/Label Items

Non-clickable text:

```csharp
@if (item.ItemType == UmbNavItemType.Title)
{
    <span class="menu-heading @item.CustomClasses">@item.Name</span>

    @if (!string.IsNullOrEmpty(item.Description))
    {
        <p class="menu-description">@item.Description</p>
    }
}
```

## Checking Item Properties

### Has Children

```csharp
var hasChildren = item.Children?.Any() == true;
```

### Has Image

```csharp
var hasImage = item.Image != null;
// or
var hasImage = item.ImageArray?.Any() == true;
```

### Is Published Content

```csharp
var isPublished = item.Published && item.Content != null;
```

### Has Custom Classes

```csharp
var hasCustomClasses = !string.IsNullOrEmpty(item.CustomClasses);
var isFeatured = item.CustomClasses?.Contains("featured") == true;
```

## Hierarchy Navigation

### Recursive Rendering

```csharp
@helper RenderItem(UmbNavItem item, int maxDepth)
{
    <li class="level-@item.Level">
        <umbnavitem menu-item="@item"></umbnavitem>

        @if (item.Children?.Any() == true && (maxDepth == 0 || item.Level < maxDepth - 1))
        {
            <ul>
                @foreach (var child in item.Children)
                {
                    @RenderItem(child, maxDepth)
                }
            </ul>
        }
    </li>
}
```

### Flattening the Tree

```csharp
public static IEnumerable<UmbNavItem> Flatten(IEnumerable<UmbNavItem> items)
{
    foreach (var item in items)
    {
        yield return item;

        if (item.Children != null)
        {
            foreach (var child in Flatten(item.Children))
            {
                yield return child;
            }
        }
    }
}

// Usage
var allItems = Flatten(menuItems);
var contentItems = allItems.Where(i => i.ItemType == UmbNavItemType.Document);
```

## ImageItem Model

The `ImageItem` class represents image data before resolution:

```csharp
public class ImageItem
{
    public Guid Key { get; set; }
    public string? MediaTypeAlias { get; set; }
}
```

## TypeScript Equivalent

In the frontend, the model is represented as `ModelEntryType`:

```typescript
interface ModelEntryType {
    key: string;
    name: string;
    description?: string;
    url?: string;
    icon?: string;
    itemType: 'Link' | 'Document' | 'Title';
    contentKey?: string;
    anchor?: string;
    published: boolean;
    children?: ModelEntryType[];
    level: number;
    depth?: number;
    target?: string;
    image?: ImageItem[];
    customClasses?: string;
    hideLoggedIn?: boolean;
    hideLoggedOut?: boolean;
    noopener?: string;
    noreferrer?: string;
    includeChildNodes?: boolean;
}
```

## Best Practices

### 1. Always Null-Check Optional Properties

```csharp
// Good
var description = item.Description ?? string.Empty;

// Good
@if (!string.IsNullOrEmpty(item.Description))
{
    <p>@item.Description</p>
}
```

### 2. Use Extension Methods for URLs

```csharp
// Good - handles content resolution
var url = item.Url();

// Avoid - might be null for Document items
var url = item.Url;
```

### 3. Check ItemType Before Accessing Type-Specific Properties

```csharp
// Good
if (item.ItemType == UmbNavItemType.Document && item.Content != null)
{
    var template = item.Content.TemplateId;
}
```

### 4. Consider Unpublished Items

```csharp
// Items with unpublished content are filtered by default
// But if you access raw data, check the Published property
if (item.ItemType == UmbNavItemType.Document && !item.Published)
{
    // Handle unpublished content
}
```

## Related Documentation

- [Extension Methods](../rendering/extension-methods.md) - Methods available on UmbNavItem
- [Build Options](build-options.md) - Controlling which properties are included
- [Menu Builder Service](../rendering/menu-builder-service.md) - How items are processed
