# Extensibility Overview

UmbNav is designed to be fully extensible. You can customize both the frontend (TypeScript/Lit) and backend (C#) to match your specific requirements.

## Extension Architecture

UmbNav follows a layered architecture that allows customization at multiple levels:

```
┌─────────────────────────────────────────┐
│           Backoffice UI (Lit)           │
│  ┌─────────────────────────────────┐    │
│  │     Extension Registry          │    │  ← Register custom actions, slots, types
│  │  • Toolbar Actions              │    │
│  │  • Item Slots                   │    │
│  │  • Item Types                   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │     Component Classes           │    │  ← Subclass for deep customization
│  │  • UmbNavItem                   │    │
│  │  • UmbNavGroup                  │    │
│  │  • UmbNavPropertyEditorUI       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Backend (C#)                  │
│  ┌─────────────────────────────────┐    │
│  │     Services                    │    │  ← Override for custom processing
│  │  • UmbNavMenuBuilderService     │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │     TagHelpers                  │    │  ← Extend for custom rendering
│  │  • UmbnavitemTagHelper          │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │     Converters                  │    │  ← Override for custom conversion
│  │  • UmbNavValueConverter         │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Frontend Extensions

### Extension Registry

The easiest way to extend UmbNav in the backoffice is through the Extension Registry:

```typescript
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';

// Add a toolbar button
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'my-action',
    label: 'My Action',
    icon: 'icon-star',
    onExecute: (item, context) => {
        // Handle click
    }
});

// Add content to items
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'my-badge',
    position: 'after-name',
    render: (item) => html`<span class="badge">New</span>`
});
```

**Available Extensions:**

| Type | Purpose | Documentation |
|------|---------|---------------|
| Toolbar Actions | Add buttons to item toolbars | [Toolbar Actions](frontend/toolbar-actions.md) |
| Item Slots | Inject content into items | [Item Slots](frontend/item-slots.md) |
| Item Types | Register custom item types | [Custom Item Types](frontend/item-types.md) |

### Component Subclassing

For deeper customization, subclass UmbNav components:

```typescript
import { UmbNavItem, UmbNavItemStyles } from '/App_Plugins/UmbNav/dist/api.js';

@customElement('my-custom-item')
class MyCustomItem extends UmbNavItem {
    protected override renderIcon() {
        return html`<custom-icon></custom-icon>`;
    }
}
```

See [Extending Components](frontend/extending-components.md) for details.

## Backend Extensions

### Menu Builder Service

Customize how menus are built by extending the service:

```csharp
public class CustomMenuBuilderService : UmbNavMenuBuilderService
{
    protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
    {
        // Custom visibility logic
        return base.ShouldIncludeItem(item, isLoggedIn);
    }
}
```

See [Menu Builder Service](backend/menu-builder-service.md) for details.

### TagHelper

Customize how items render in views:

```csharp
[HtmlTargetElement("custom-umbnavitem")]
public class CustomTagHelper : UmbnavitemTagHelper
{
    protected override string? GetUrl()
    {
        // Add tracking parameters
        return $"{base.GetUrl()}?source=nav";
    }
}
```

See [TagHelper](backend/taghelper.md) for details.

## Extension Points Summary

### Frontend (TypeScript/Lit)

| Extension Point | Method | Use Case |
|----------------|--------|----------|
| Toolbar Actions | `registerToolbarAction()` | Add action buttons |
| Item Slots | `registerItemSlot()` | Add badges, icons, content |
| Item Types | `registerItemType()` | New item categories |
| Component Override | Subclass | Deep customization |

### Backend (C#)

| Extension Point | Method | Use Case |
|----------------|--------|----------|
| Item Visibility | `ShouldIncludeItem()` | Custom filtering |
| Content Resolution | `ResolveContent()` | Custom content lookup |
| Image Resolution | `ResolveImage()` | Custom media handling |
| Active State | `GetCurrentContentKey()` | Custom active detection |
| URL Generation | `GetUrl()` | Custom URLs |
| HTML Output | `ProcessCustomAttributes()` | Custom attributes |

## When to Use Each Approach

### Use Extension Registry When:

- Adding toolbar buttons
- Adding visual indicators/badges
- Non-invasive customizations
- Quick prototyping

### Use Component Subclassing When:

- Changing core rendering logic
- Replacing entire sections
- Building white-label solutions

### Use Service Override When:

- Custom visibility rules
- Integration with external systems
- Custom content resolution
- Analytics/tracking requirements

### Use TagHelper Override When:

- Custom HTML output
- Adding data attributes
- Integration with frontend frameworks
- Custom URL generation

## Importing the API

For frontend extensions, import from the API bundle:

```typescript
import {
    // Extension Registry
    UmbNavExtensionRegistry,

    // Types
    UmbNavToolbarAction,
    UmbNavItemSlot,
    UmbNavActionContext,
    ModelEntryType,

    // Components (for subclassing)
    UmbNavItem,
    UmbNavGroup,
    UmbNavSorterPropertyEditorUIElement,

    // Styles (for extending)
    UmbNavItemStyles,
    UmbNavGroupStyles,
    UmbNavPropertyEditorUIStyles,

    // Modal Tokens
    UMBNAV_TEXT_ITEM_MODAL,
    UMBNAV_SETTINGS_ITEM_MODAL,
    UMBNAV_VISIBILITY_ITEM_MODAL
} from '/App_Plugins/UmbNav/dist/api.js';
```

## Best Practices

### 1. Preserve Core Functionality

When overriding methods, call the base implementation unless you're intentionally replacing it:

```csharp
protected override bool ShouldIncludeItem(UmbNavItem item, bool isLoggedIn)
{
    // Add your logic
    if (item.CustomClasses?.Contains("hidden") == true)
        return false;

    // Preserve base functionality
    return base.ShouldIncludeItem(item, isLoggedIn);
}
```

### 2. Use Unique Aliases

Avoid conflicts by prefixing aliases with your package/project name:

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'mycompany-star-action',  // Prefixed
    // ...
});
```

### 3. Handle Errors Gracefully

Extensions shouldn't break the core functionality:

```typescript
onExecute: async (item, context) => {
    try {
        await myCustomLogic(item);
    } catch (error) {
        console.error('Extension error:', error);
        // Don't rethrow - let UmbNav continue working
    }
}
```

### 4. Register in Composers

For C# extensions, use the Umbraco Composer pattern:

```csharp
public class MyExtensionComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IUmbNavMenuBuilderService, MyCustomService>();
    }
}
```

### 5. Test Your Extensions

UmbNav includes testing infrastructure. See [Testing](../testing/overview.md) for guidance.

## Next Steps

- [Frontend Extensions](frontend/README.md) - TypeScript/Lit extensions
- [Backend Extensions](backend/README.md) - C# extensions
- [Examples](../examples/basic-navigation.md) - Real-world examples
