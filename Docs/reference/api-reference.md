# API Reference

Complete API documentation for UmbNav.

## C# API

### Models

#### UmbNavItem

The core menu item model.

```csharp
namespace Umbraco.Community.UmbNav.Core.Models;

public class UmbNavItem
{
    // Identity
    public Guid Key { get; set; }
    public string Name { get; set; }

    // Item Type
    public UmbNavItemType ItemType { get; set; }

    // Link Properties
    public string? Url { get; set; }
    public Guid? ContentKey { get; set; }
    public IPublishedContent? Content { get; set; }
    public string? Target { get; set; }

    // Hierarchy
    public IEnumerable<UmbNavItem>? Children { get; set; }
    public int Level { get; set; }

    // Display Options
    public string? Description { get; set; }
    public string? CustomClasses { get; set; }
    public string? Icon { get; set; }

    // Media
    public IPublishedContent? Image { get; set; }
    public Guid[]? ImageArray { get; set; }

    // Link Attributes
    public string? Noopener { get; set; }
    public string? Noreferrer { get; set; }

    // Visibility
    public bool HideLoggedIn { get; set; }
    public bool HideLoggedOut { get; set; }
    public bool IncludeChildNodes { get; set; }

    // State
    public bool IsActive { get; set; }
}
```

#### UmbNavItemType

```csharp
namespace Umbraco.Community.UmbNav.Core.Enums;

public enum UmbNavItemType
{
    Link = 0,      // External URL
    Document = 1,  // Umbraco content node
    Title = 2      // Text-only label (non-link)
}
```

#### UmbNavBuildOptions

```csharp
namespace Umbraco.Community.UmbNav.Core.Models;

public class UmbNavBuildOptions
{
    /// <summary>
    /// When true, sets Noopener to null on all items.
    /// </summary>
    public bool RemoveNoopener { get; set; }

    /// <summary>
    /// When true, sets Noreferrer to null on all items.
    /// </summary>
    public bool RemoveNoreferrer { get; set; }

    /// <summary>
    /// When true, prevents auto-expansion of child nodes from content items.
    /// </summary>
    public bool HideIncludeChildren { get; set; }

    /// <summary>
    /// When true, sets Description to null on all items.
    /// </summary>
    public bool RemoveDescription { get; set; }

    /// <summary>
    /// When true, sets CustomClasses to null on all items.
    /// </summary>
    public bool RemoveCustomClasses { get; set; }

    /// <summary>
    /// When true, sets Image and ImageArray to null on all items.
    /// </summary>
    public bool RemoveImages { get; set; }

    /// <summary>
    /// Maximum depth of menu items to include. 0 means unlimited.
    /// </summary>
    public int MaxDepth { get; set; }

    /// <summary>
    /// Returns a new instance with default values (all options false, MaxDepth 0).
    /// </summary>
    public static UmbNavBuildOptions Default => new();
}
```

### Services

#### IUmbNavMenuBuilderService

```csharp
namespace Umbraco.Community.UmbNav.Core.Abstractions;

public interface IUmbNavMenuBuilderService
{
    /// <summary>
    /// Builds and processes a menu from raw UmbNavItem data.
    /// </summary>
    /// <param name="items">Raw menu items from property value.</param>
    /// <param name="options">Build options to control processing.</param>
    /// <returns>Processed menu items ready for rendering.</returns>
    IEnumerable<UmbNavItem> BuildMenu(
        IEnumerable<UmbNavItem>? items,
        UmbNavBuildOptions? options = null);
}
```

#### UmbNavMenuBuilderService

Default implementation with virtual methods for customization.

```csharp
namespace Umbraco.Community.UmbNav.Core.Services;

public class UmbNavMenuBuilderService : IUmbNavMenuBuilderService
{
    // Main entry point
    public virtual IEnumerable<UmbNavItem> BuildMenu(
        IEnumerable<UmbNavItem>? items,
        UmbNavBuildOptions? options = null);

    // Override points
    protected virtual IEnumerable<UmbNavItem> ProcessItems(
        IEnumerable<UmbNavItem> items,
        UmbNavBuildOptions options,
        int currentLevel,
        Guid currentContentKey);

    protected virtual bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn);

    protected virtual bool ResolveContent(UmbNavItem item, Guid currentContentKey);

    protected virtual void ResolveImage(UmbNavItem item);

    protected virtual void ApplyOptions(UmbNavItem item, UmbNavBuildOptions options);

    protected virtual IEnumerable<UmbNavItem> ProcessChildren(
        IEnumerable<UmbNavItem>? children,
        UmbNavBuildOptions options,
        int currentLevel,
        Guid currentContentKey);

    protected virtual IEnumerable<UmbNavItem> GetAutoExpandedChildren(
        UmbNavItem item,
        UmbNavBuildOptions options,
        int currentLevel);

    protected virtual bool IsUserLoggedIn();

    protected virtual Guid GetCurrentContentKey();
}
```

### TagHelpers

#### UmbnavitemTagHelper

```csharp
namespace Umbraco.Community.UmbNav.Core.TagHelpers;

[HtmlTargetElement("umbnavitem")]
public class UmbnavitemTagHelper : TagHelper
{
    // Required
    [HtmlAttributeName("menu-item")]
    public UmbNavItem MenuItem { get; set; }

    // Optional URL Generation
    [HtmlAttributeName("mode")]
    public UrlMode Mode { get; set; } = UrlMode.Default;

    [HtmlAttributeName("culture")]
    public string? Culture { get; set; }

    // Optional Display
    [HtmlAttributeName("label-tag-name")]
    public string LabelTagName { get; set; } = "span";

    // Optional Active State
    [HtmlAttributeName("active-class")]
    public string? ActiveClass { get; set; }

    [HtmlAttributeName("is-active-ancestor-check")]
    public bool IsActiveAncestorCheck { get; set; }

    [HtmlAttributeName("current-page")]
    public IPublishedContent? CurrentPage { get; set; }

    // Protected methods for overriding
    protected virtual string GetTagName();
    protected virtual string GetContent();
    protected virtual string? GetUrl();
    protected virtual bool IsItemActive();
    protected virtual void ProcessLink(TagHelperOutput output);
    protected virtual void ProcessClasses(TagHelperOutput output);
    protected virtual void ProcessActiveState(TagHelperOutput output);
    protected virtual void ProcessTarget(TagHelperOutput output);
    protected virtual void ProcessRel(TagHelperOutput output);
    protected virtual void ProcessCustomAttributes(
        TagHelperContext context,
        TagHelperOutput output);

    // Properties
    protected bool IsLabel { get; }
}
```

### Extension Methods

#### UmbNavItemExtensions

```csharp
namespace Umbraco.Community.UmbNav.Core.Extensions;

public static class UmbNavItemExtensions
{
    /// <summary>
    /// Gets the URL for this menu item.
    /// </summary>
    public static string? Url(
        this UmbNavItem item,
        string? culture = null,
        UrlMode mode = UrlMode.Default);

    /// <summary>
    /// Determines if this item is the current page or an ancestor.
    /// </summary>
    public static bool IsActive(
        this UmbNavItem item,
        IPublishedContent? currentPage,
        int? minLevel = null,
        bool includeDescendants = true);

    /// <summary>
    /// Generates HTML link or span for this menu item.
    /// </summary>
    public static IHtmlContent GetLinkHtml(
        this UmbNavItem item,
        string? cssClass = null,
        string? activeClass = null,
        string? culture = null,
        UrlMode mode = UrlMode.Default);
}
```

### Value Converter

#### UmbNavValueConverter

```csharp
namespace Umbraco.Community.UmbNav.Core.Converters;

public class UmbNavValueConverter : IPropertyValueConverter,
    IDeliveryApiPropertyValueConverter
{
    // Check if converter handles property type
    public bool IsConverter(IPublishedPropertyType propertyType);

    // Property type (elements or snapshot)
    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType);

    // Return type
    public Type GetPropertyValueType(IPublishedPropertyType propertyType);

    // Main conversion method
    public virtual object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview);

    // Delivery API conversion
    public virtual object? ConvertIntermediateToDeliveryApiObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview,
        bool expanding);
}
```

---

## TypeScript API

### Models

#### ModelEntryType

```typescript
interface ModelEntryType {
    key: Guid;
    name: string;
    description?: string;
    url?: string;
    icon?: string;
    itemType: 'Link' | 'Document' | 'Title';
    udi?: string;
    anchor?: string;
    published?: boolean;
    naviHide?: boolean;
    culture?: string;
    segment?: string;
    children?: ModelEntryType[];
    expanded?: boolean;
    target?: string;
    noopener?: string;
    noreferrer?: string;
    customClasses?: string;
    imageUrl?: string;
    image?: MediaItem[];
    includeChildNodes?: boolean;
    hideLoggedIn?: boolean;
    hideLoggedOut?: boolean;
}

type Guid = string;
```

### Extension Registry

#### UmbNavExtensionRegistry

```typescript
class UmbNavExtensionRegistry {
    // Toolbar Actions
    static registerToolbarAction(action: UmbNavToolbarAction): void;
    static unregisterToolbarAction(alias: string): void;
    static getToolbarActions(): UmbNavToolbarAction[];
    static getToolbarAction(alias: string): UmbNavToolbarAction | undefined;

    // Item Slots
    static registerItemSlot(slot: UmbNavItemSlot): void;
    static unregisterItemSlot(alias: string): void;
    static getItemSlots(): UmbNavItemSlot[];

    // Item Types
    static registerItemType(itemType: UmbNavItemTypeConfig): void;
    static unregisterItemType(alias: string): void;
    static getItemTypes(): UmbNavItemTypeConfig[];
    static getItemType(alias: string): UmbNavItemTypeConfig | undefined;

    // Events
    static onChange(callback: () => void): () => void;

    // Utility
    static clear(): void;
}
```

#### UmbNavToolbarAction

```typescript
interface UmbNavToolbarAction {
    /** Unique identifier for this action */
    alias: string;

    /** Display label for the button */
    label: string;

    /** Icon name (Umbraco icon system) */
    icon: string;

    /** Button position: 'start', 'end', or numeric index */
    position?: 'start' | 'end' | number;

    /** Visibility check function */
    isVisible?: (
        item: ModelEntryType,
        config: UmbPropertyEditorConfigProperty[]
    ) => boolean;

    /** Execute function when clicked */
    onExecute: (
        item: ModelEntryType,
        context: UmbNavActionContext
    ) => void | Promise<void>;
}
```

#### UmbNavActionContext

```typescript
interface UmbNavActionContext {
    /** The UmbNavItem host element */
    host: HTMLElement;

    /** Editor configuration */
    config: UmbPropertyEditorConfigProperty[];

    /** Update the item data */
    updateItem: (item: ModelEntryType) => void;

    /** Remove the item */
    removeItem: (key: Guid) => void;

    /** Open a modal dialog */
    openModal: <T>(
        token: UmbModalToken<unknown, T>,
        data: unknown
    ) => Promise<T | undefined>;
}
```

#### UmbNavItemSlot

```typescript
interface UmbNavItemSlot {
    /** Unique identifier */
    alias: string;

    /** Render position */
    position: 'before-name' | 'after-name' | 'before-toolbar' | 'after-toolbar';

    /** Visibility check */
    isVisible?: (
        item: ModelEntryType,
        config: UmbPropertyEditorConfigProperty[]
    ) => boolean;

    /** Render function returning Lit template */
    render: (
        item: ModelEntryType,
        config: UmbPropertyEditorConfigProperty[]
    ) => TemplateResult;
}
```

#### UmbNavItemTypeConfig

```typescript
interface UmbNavItemTypeConfig {
    /** Unique identifier */
    alias: string;

    /** Display name */
    label: string;

    /** Icon name */
    icon: string;

    /** Modal token for creating items */
    createModalToken?: UmbModalToken<unknown, ModelEntryType>;

    /** Modal token for editing items */
    editModalToken?: UmbModalToken<unknown, ModelEntryType>;

    /** Default values for new items */
    defaultValues?: Partial<ModelEntryType>;

    /** Visibility in add menu */
    isVisible?: (config: UmbPropertyEditorConfigProperty[]) => boolean;
}
```

### Components

#### UmbNavItem

```typescript
@customElement('umbnav-item')
class UmbNavItem extends UmbElementMixin(LitElement) {
    // Properties
    @property() name: string;
    @property() description: string;
    @property() url: string;
    @property() icon: string;
    @property() key: string;
    @property() expanded: boolean;
    @property() unpublished: boolean;
    @property() hasImage: boolean;
    @property() enableMediaPicker: boolean;
    @property() hideLoggedIn: boolean;
    @property() hideLoggedOut: boolean;
    @property() enableVisibility: boolean;
    @property() enableDescription: boolean;
    @property() hideIncludesChildNodes: boolean;
    @property() maxDepth: number;
    @property() currentDepth: number;
    @property({ attribute: false }) itemData: ModelEntryType | null;
    @property({ attribute: false }) config: UmbPropertyEditorConfigProperty[];

    // Override points
    protected renderExpandArrow(): TemplateResult;
    protected renderIcon(): TemplateResult;
    protected renderName(): TemplateResult;
    protected renderInfo(): TemplateResult;
    protected renderCoreToolbarButtons(): TemplateResult;
    protected renderToolbar(): TemplateResult;

    // Extension methods
    protected getVisibleExtensionActions(): UmbNavToolbarAction[];
    protected getExtensionSlots(position: string): UmbNavItemSlot[];
    protected renderExtensionSlots(position: string): TemplateResult;
    protected renderExtensionActions(): TemplateResult;
    protected executeExtensionAction(action: UmbNavToolbarAction): Promise<void>;
}
```

### Events

```typescript
// Item update event
interface UmbNavItemUpdateEvent extends CustomEvent {
    type: 'umbnav-item-update';
    detail: { item: ModelEntryType };
}

// Toolbar action event
class UmbNavToolbarActionEvent extends CustomEvent {
    static readonly TYPE = 'umbnav-toolbar-action';
    detail: { action: UmbNavToolbarAction; item: ModelEntryType };
}
```

### Imports

```typescript
// Import from the UmbNav API bundle
import {
    UmbNavExtensionRegistry,
    UmbNavToolbarAction,
    UmbNavActionContext,
    UmbNavItemSlot,
    UmbNavItemTypeConfig,
    ModelEntryType,
    Guid,
    UmbNavItem,
    UmbNavItemStyles
} from '/App_Plugins/UmbNav/dist/api.js';
```

---

## Configuration

### UmbNavConfiguration

Data Type configuration options set in the backoffice.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `MaxDepth` | int | 0 | Maximum menu depth (0 = unlimited) |
| `HideNaviHide` | bool | false | Hide items where umbracoNaviHide is true |
| `AutoExpand` | bool | false | Auto-expand on hover in backoffice |
| `AutoExpandDelay` | int | 1000 | Hover delay in milliseconds |
| `HideNoopener` | bool | false | Hide noopener checkbox |
| `HideNoreferrer` | bool | false | Hide noreferrer checkbox |
| `AllowImageIcon` | bool | false | Allow images on menu items |
| `AllowCustomClasses` | bool | false | Allow custom CSS classes |
| `HideLabel` | bool | false | Display as full-width (hide label) |
| `AllowTextItems` | bool | true | Allow text-only items |
| `AllowDescription` | bool | false | Allow descriptions |
| `EnableVisibility` | bool | false | Enable member visibility options |
| `HideIncludeChildNodes` | bool | false | Hide "include children" option |

### Telemetry Configuration

```json
{
  "UmbNav": {
    "DisableTelemetry": true
  }
}
```

---

## Next Steps

- [Changelog](changelog.md) - Version history
- [Contributing](contributing.md) - How to contribute
- [Troubleshooting](troubleshooting.md) - Common issues
