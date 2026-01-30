# Toolbar Actions

Toolbar actions add buttons to the UmbNav item toolbar that appears when hovering over menu items in the backoffice.

## Basic Registration

```typescript
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';

UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'my-custom-action',
    label: 'Star Item',
    icon: 'icon-favorite',
    onExecute: (item, context) => {
        console.log('Action clicked on:', item.name);
    }
});
```

## Interface Definition

```typescript
interface UmbNavToolbarAction {
    /** Unique identifier for this action */
    alias: string;

    /** Display label (shown as tooltip) */
    label: string;

    /** Icon name (UUI icon) */
    icon: string;

    /** Position: 'start' | 'end' | number */
    position?: 'start' | 'end' | number;

    /** Visibility check function */
    isVisible?: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => boolean;

    /** Handler when clicked */
    onExecute: (item: ModelEntryType, context: UmbNavActionContext) => void | Promise<void>;
}
```

## Action Context

The context object provides methods to interact with UmbNav:

```typescript
interface UmbNavActionContext {
    /** The UmbNavItem element */
    host: HTMLElement;

    /** Property editor configuration */
    config: UmbPropertyEditorConfigProperty[];

    /** Update the item */
    updateItem: (item: ModelEntryType) => void;

    /** Remove the item */
    removeItem: (key: Guid) => void;

    /** Open a modal */
    openModal: <T>(token: unknown, data: unknown) => Promise<T | undefined>;
}
```

## Examples

### Simple Notification

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'notify-action',
    label: 'Notify',
    icon: 'icon-bell',
    onExecute: (item, context) => {
        alert(`You clicked on: ${item.name}`);
    }
});
```

### Toggle a Property

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'toggle-featured',
    label: 'Toggle Featured',
    icon: 'icon-star',
    onExecute: (item, context) => {
        const isFeatured = item.customClasses?.includes('featured');
        const newClasses = isFeatured
            ? item.customClasses?.replace('featured', '').trim()
            : `${item.customClasses || ''} featured`.trim();

        context.updateItem({
            ...item,
            customClasses: newClasses || undefined
        });
    }
});
```

### Conditional Visibility

Only show for specific item types:

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'content-only-action',
    label: 'Content Action',
    icon: 'icon-document',
    isVisible: (item, config) => item.itemType === 'Document',
    onExecute: (item, context) => {
        console.log('Content key:', item.contentKey);
    }
});
```

Only show when a specific configuration is enabled:

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'image-action',
    label: 'Manage Image',
    icon: 'icon-picture',
    isVisible: (item, config) => {
        const allowImages = config.find(c => c.alias === 'allowImageIcon');
        return allowImages?.value === true;
    },
    onExecute: (item, context) => {
        // Handle image management
    }
});
```

### Async Operations

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'fetch-data',
    label: 'Fetch Data',
    icon: 'icon-download',
    onExecute: async (item, context) => {
        try {
            const response = await fetch(`/api/items/${item.key}`);
            const data = await response.json();

            context.updateItem({
                ...item,
                description: data.description
            });
        } catch (error) {
            console.error('Failed to fetch:', error);
        }
    }
});
```

### Opening a Modal

Use existing UmbNav modals:

```typescript
import { UMBNAV_SETTINGS_ITEM_MODAL } from '/App_Plugins/UmbNav/dist/api.js';

UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'quick-settings',
    label: 'Quick Settings',
    icon: 'icon-settings',
    onExecute: async (item, context) => {
        const result = await context.openModal(UMBNAV_SETTINGS_ITEM_MODAL, {
            item: item,
            enableCustomClasses: true,
            enableDescription: true
        });

        if (result) {
            context.updateItem({
                ...item,
                customClasses: result.customClasses,
                description: result.description
            });
        }
    }
});
```

Use Umbraco's built-in modals:

```typescript
import { UMB_CONFIRM_MODAL } from '@umbraco-cms/backoffice/modal';

UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'confirm-action',
    label: 'Confirm Action',
    icon: 'icon-alert',
    onExecute: async (item, context) => {
        const confirmed = await context.openModal(UMB_CONFIRM_MODAL, {
            headline: 'Confirm',
            content: `Are you sure you want to modify "${item.name}"?`,
            confirmLabel: 'Yes',
            cancelLabel: 'No'
        });

        if (confirmed) {
            // Proceed with action
        }
    }
});
```

### Position Control

```typescript
// At the start of the toolbar (before core buttons)
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'start-action',
    label: 'First',
    icon: 'icon-arrow-left',
    position: 'start',
    onExecute: (item, context) => {}
});

// At the end of the toolbar (after core buttons)
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'end-action',
    label: 'Last',
    icon: 'icon-arrow-right',
    position: 'end',
    onExecute: (item, context) => {}
});

// At a specific index
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'positioned-action',
    label: 'Third',
    icon: 'icon-ordered-list',
    position: 2, // 0-indexed position
    onExecute: (item, context) => {}
});
```

### Removing Items

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'archive-item',
    label: 'Archive',
    icon: 'icon-box',
    onExecute: async (item, context) => {
        // Do something before removing (e.g., archive to external system)
        await archiveItem(item);

        // Remove from UmbNav
        context.removeItem(item.key);
    }
});
```

### Complex Business Logic

```typescript
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'smart-action',
    label: 'Smart Action',
    icon: 'icon-wand',
    isVisible: (item, config) => {
        // Only show for published content items with children
        return item.itemType === 'Document' &&
               item.published &&
               item.children?.length > 0;
    },
    onExecute: async (item, context) => {
        // Fetch additional data
        const analytics = await fetchAnalytics(item.contentKey);

        // Update based on analytics
        if (analytics.popular) {
            context.updateItem({
                ...item,
                customClasses: `${item.customClasses || ''} popular`.trim()
            });
        }

        // Show result
        console.log(`Updated ${item.name} with analytics data`);
    }
});
```

## Unregistering Actions

```typescript
// Register
UmbNavExtensionRegistry.registerToolbarAction({
    alias: 'temporary-action',
    // ...
});

// Later, unregister
UmbNavExtensionRegistry.unregisterToolbarAction('temporary-action');
```

## Getting Registered Actions

```typescript
// Get all actions
const allActions = UmbNavExtensionRegistry.getToolbarActions();

// Get specific action
const myAction = UmbNavExtensionRegistry.getToolbarAction('my-action');
```

## Available Icons

UmbNav uses Umbraco's UUI icon set. Common icons include:

- `icon-favorite` - Star
- `icon-settings` - Settings gear
- `icon-edit` - Pencil
- `icon-delete` - Trash
- `icon-add` - Plus
- `icon-remove` - Minus
- `icon-check` - Checkmark
- `icon-alert` - Warning
- `icon-info` - Information
- `icon-lock` - Lock
- `icon-unlocked` - Unlocked
- `icon-eye` - Visible
- `icon-eye-slash` - Hidden
- `icon-link` - Link
- `icon-unlink` - Unlink
- `icon-picture` - Image
- `icon-document` - Document
- `icon-folder` - Folder

## Best Practices

1. **Use unique aliases** - Prefix with your package name
2. **Provide meaningful labels** - Shown as tooltips
3. **Handle errors gracefully** - Don't break the UI
4. **Check visibility** - Only show when relevant
5. **Keep actions fast** - Show loading states for slow operations
6. **Preserve item data** - Use spread operator when updating

## Next Steps

- [Item Slots](item-slots.md) - Add content to items
- [Custom Item Types](item-types.md) - Register new item types
- [Extending Components](extending-components.md) - Deep customization
