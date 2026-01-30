# Frontend Extensions

UmbNav's backoffice UI is built with TypeScript and Lit web components. You can extend it by registering custom extensions or subclassing components.

## Getting Started

### Importing the API

All public APIs are available from the API bundle:

```typescript
import {
    UmbNavExtensionRegistry,
    UmbNavToolbarAction,
    UmbNavItemSlot,
    ModelEntryType,
    UmbNavActionContext
} from '/App_Plugins/UmbNav/dist/api.js';
```

### Creating an Extension Package

1. Create a new Umbraco extension package
2. Import the UmbNav API
3. Register your extensions at module load time

```typescript
// my-extension/src/index.ts
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';
import { html } from '@umbraco-cms/backoffice/external/lit';

// Register extensions when the module loads
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'my-extension-star',
    label: 'Star',
    icon: 'icon-favorite',
    onExecute: (item, context) => {
        console.log('Starred:', item.name);
    }
});
```

## Extension Types

### Toolbar Actions

Add buttons to the item toolbar that appears on hover:

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'my-action',
    label: 'My Action',
    icon: 'icon-settings',
    position: 'start',
    isVisible: (item, config) => item.itemType === 'Document',
    onExecute: async (item, context) => {
        // Your logic here
    }
});
```

See [Toolbar Actions](toolbar-actions.md) for complete documentation.

### Item Slots

Inject custom content at specific positions within menu items:

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'my-badge',
    position: 'after-name',
    isVisible: (item) => item.customClasses?.includes('featured'),
    render: (item) => html`<span class="featured-badge">★</span>`
});
```

See [Item Slots](item-slots.md) for complete documentation.

### Custom Item Types

Register entirely new item types:

```typescript
UmbNavExtensionRegistry.registerItemType({
    type: 'button',
    label: 'Button',
    icon: 'icon-button',
    allowChildren: false
});
```

See [Custom Item Types](item-types.md) for complete documentation.

## Component Subclassing

For deeper customization, subclass UmbNav's Lit components:

```typescript
import { UmbNavItem, UmbNavItemStyles } from '/App_Plugins/UmbNav/dist/api.js';
import { customElement, html, css } from '@umbraco-cms/backoffice/external/lit';

@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    protected override renderIcon() {
        return html`<div class="custom-icon">${this.icon}</div>`;
    }

    static override styles = [
        ...UmbNavItemStyles,
        css`
            .custom-icon {
                background: #f0f0f0;
                padding: 4px;
                border-radius: 4px;
            }
        `
    ];
}
```

See [Extending Components](extending-components.md) for complete documentation.

## Available Exports

### Extension Registry

```typescript
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';
```

The singleton registry for all extensions.

### Types

```typescript
import type {
    UmbNavToolbarAction,    // Toolbar action definition
    UmbNavItemSlot,         // Item slot definition
    UmbNavActionContext,    // Context passed to actions
    ModelEntryType,         // Menu item data type
    Guid,                   // GUID type alias
    ImageItem               // Image data type
} from '/App_Plugins/UmbNav/dist/api.js';
```

### Components

```typescript
import {
    UmbNavItem,                        // Menu item component
    UmbNavGroup,                       // Item container component
    UmbNavSorterPropertyEditorUIElement // Property editor component
} from '/App_Plugins/UmbNav/dist/api.js';
```

### Styles

```typescript
import {
    UmbNavItemStyles,           // Styles for UmbNavItem
    UmbNavGroupStyles,          // Styles for UmbNavGroup
    UmbNavPropertyEditorUIStyles // Styles for property editor
} from '/App_Plugins/UmbNav/dist/api.js';
```

### Modal Tokens

```typescript
import {
    UMBNAV_TEXT_ITEM_MODAL,      // Text item editing modal
    UMBNAV_SETTINGS_ITEM_MODAL,  // Settings modal
    UMBNAV_VISIBILITY_ITEM_MODAL // Visibility settings modal
} from '/App_Plugins/UmbNav/dist/api.js';
```

## The Action Context

When toolbar actions execute, they receive a context object:

```typescript
interface UmbNavActionContext {
    host: HTMLElement;                    // The UmbNavItem element
    config: UmbPropertyEditorConfigProperty[];  // Editor configuration
    updateItem: (item: ModelEntryType) => void; // Update the item
    removeItem: (key: Guid) => void;           // Remove the item
    openModal: <T>(token: unknown, data: unknown) => Promise<T | undefined>;
}
```

### Using the Context

```typescript
onExecute: async (item, context) => {
    // Update the item
    context.updateItem({
        ...item,
        customClasses: 'featured'
    });

    // Open a modal
    const result = await context.openModal(MY_MODAL_TOKEN, { item });

    // Remove the item
    context.removeItem(item.key);
}
```

## Best Practices

### 1. Use Unique Aliases

Prefix your aliases to avoid conflicts:

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'mycompany-myproject-action',  // Good
    // ...
});
```

### 2. Check Visibility

Use `isVisible` to show extensions only when relevant:

```typescript
isVisible: (item, config) => {
    // Only show for content items
    return item.itemType === 'Document';
}
```

### 3. Handle Async Operations

Actions can be async:

```typescript
onExecute: async (item, context) => {
    const data = await fetchSomething();
    context.updateItem({ ...item, ...data });
}
```

### 4. Error Handling

Don't let errors break the UI:

```typescript
onExecute: async (item, context) => {
    try {
        await riskyOperation();
    } catch (error) {
        console.error('Extension error:', error);
        // Show user feedback if appropriate
    }
}
```

### 5. Subscribe to Changes

If you need to react to registry changes:

```typescript
const unsubscribe = UmbNavExtensionRegistry.onChange(() => {
    // Extensions changed, update UI if needed
});

// Later, clean up
unsubscribe();
```

## Next Steps

- [Toolbar Actions](toolbar-actions.md) - Add action buttons
- [Item Slots](item-slots.md) - Add content to items
- [Custom Item Types](item-types.md) - Register new item types
- [Extending Components](extending-components.md) - Subclass components
