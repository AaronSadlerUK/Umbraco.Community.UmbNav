# Item Slots

Item slots allow you to inject custom content at specific positions within UmbNav menu items in the backoffice.

## Basic Registration

```typescript
import { UmbNavExtensionRegistry } from '/App_Plugins/UmbNav/dist/api.js';
import { html } from '@umbraco-cms/backoffice/external/lit';

UmbNavExtensionRegistry.registerItemSlot({
    alias: 'my-badge',
    position: 'after-name',
    render: (item, config) => html`<span class="my-badge">New</span>`
});
```

## Interface Definition

```typescript
interface UmbNavItemSlot {
    /** Unique identifier for this slot */
    alias: string;

    /** Position within the item */
    position: 'before-name' | 'after-name' | 'before-toolbar' | 'after-toolbar';

    /** Render function returning Lit TemplateResult */
    render: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => TemplateResult;

    /** Optional visibility check */
    isVisible?: (item: ModelEntryType, config: UmbPropertyEditorConfigProperty[]) => boolean;
}
```

## Slot Positions

UmbNav items have four slot positions:

```
┌─────────────────────────────────────────────────────────────────┐
│ [▶] [icon] │ [before-name] Name [after-name]  │ [before-toolbar] [buttons] [after-toolbar] │
└─────────────────────────────────────────────────────────────────┘
```

| Position | Location | Common Uses |
|----------|----------|-------------|
| `before-name` | Before the item name | Status indicators, priority markers |
| `after-name` | After the item name | Badges, labels, counters |
| `before-toolbar` | Before toolbar buttons | Additional action areas |
| `after-toolbar` | After toolbar buttons | Status icons, info buttons |

## Examples

### Simple Badge

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'new-badge',
    position: 'after-name',
    isVisible: (item) => isNewItem(item),
    render: () => html`
        <span style="
            background: #0ea5e9;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            margin-left: 8px;
        ">NEW</span>
    `
});
```

### Featured Indicator

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'featured-star',
    position: 'before-name',
    isVisible: (item) => item.customClasses?.includes('featured'),
    render: () => html`
        <uui-icon name="icon-favorite" style="color: gold; margin-right: 4px;"></uui-icon>
    `
});
```

### Item Type Icon

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'type-indicator',
    position: 'after-name',
    render: (item) => {
        const typeIcons = {
            'Document': 'icon-document',
            'Link': 'icon-link',
            'Title': 'icon-font'
        };
        const icon = typeIcons[item.itemType] || 'icon-help';

        return html`
            <uui-icon
                name="${icon}"
                style="opacity: 0.5; margin-left: 8px; font-size: 12px;">
            </uui-icon>
        `;
    }
});
```

### Children Counter

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'children-count',
    position: 'after-name',
    isVisible: (item) => item.children && item.children.length > 0,
    render: (item) => html`
        <span style="
            background: #e5e7eb;
            color: #374151;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 11px;
            margin-left: 8px;
        ">${item.children?.length}</span>
    `
});
```

### Visibility Status

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'visibility-status',
    position: 'before-toolbar',
    isVisible: (item) => item.hideLoggedIn || item.hideLoggedOut,
    render: (item) => {
        if (item.hideLoggedIn) {
            return html`
                <uui-tag look="secondary" style="margin-right: 8px;">
                    <uui-icon name="icon-unlocked"></uui-icon>
                    Guests Only
                </uui-tag>
            `;
        }
        if (item.hideLoggedOut) {
            return html`
                <uui-tag look="secondary" style="margin-right: 8px;">
                    <uui-icon name="icon-lock"></uui-icon>
                    Members Only
                </uui-tag>
            `;
        }
        return html``;
    }
});
```

### External Link Indicator

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'external-link',
    position: 'after-name',
    isVisible: (item) => item.itemType === 'Link' && item.target === '_blank',
    render: () => html`
        <uui-icon
            name="icon-out"
            title="Opens in new window"
            style="opacity: 0.6; margin-left: 4px; font-size: 12px;">
        </uui-icon>
    `
});
```

### Unpublished Warning

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'unpublished-warning',
    position: 'after-name',
    isVisible: (item) => item.itemType === 'Document' && !item.published,
    render: () => html`
        <uui-tag color="warning" look="secondary" style="margin-left: 8px;">
            <uui-icon name="icon-alert"></uui-icon>
            Unpublished
        </uui-tag>
    `
});
```

### SEO Score Indicator

```typescript
// Assuming you fetch SEO scores from an external service
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'seo-score',
    position: 'after-toolbar',
    isVisible: (item) => item.itemType === 'Document' && item.contentKey,
    render: (item) => {
        // Get score from your data source
        const score = getSeoScore(item.contentKey);
        const color = score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red';

        return html`
            <div style="
                display: flex;
                align-items: center;
                margin-left: 8px;
                padding: 2px 8px;
                background: ${color}20;
                border-radius: 4px;
            ">
                <span style="font-size: 11px; color: ${color};">
                    SEO: ${score}
                </span>
            </div>
        `;
    }
});
```

### Interactive Slot

Slots can include interactive elements:

```typescript
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'quick-toggle',
    position: 'before-toolbar',
    isVisible: (item, config) => {
        const allowDisplay = config.find(c => c.alias === 'allowDisplay');
        return allowDisplay?.value === true;
    },
    render: (item, config) => html`
        <uui-button
            look="secondary"
            compact
            @click=${(e: Event) => {
                e.stopPropagation();
                // Toggle visibility
                const event = new CustomEvent('umbnav-item-update', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        item: {
                            ...item,
                            hideLoggedOut: !item.hideLoggedOut
                        }
                    }
                });
                (e.target as HTMLElement).dispatchEvent(event);
            }}>
            <uui-icon name="${item.hideLoggedOut ? 'icon-lock' : 'icon-unlocked'}"></uui-icon>
        </uui-button>
    `
});
```

### Multiple Slots Combined

Register multiple slots for a cohesive extension:

```typescript
// Status icon before name
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'analytics-status-icon',
    position: 'before-name',
    isVisible: (item) => item.itemType === 'Document',
    render: (item) => {
        const views = getPageViews(item.contentKey);
        const icon = views > 1000 ? 'icon-fire' : views > 100 ? 'icon-trending-up' : 'icon-chart';
        return html`<uui-icon name="${icon}" style="margin-right: 4px;"></uui-icon>`;
    }
});

// View count after name
UmbNavExtensionRegistry.registerItemSlot({
    alias: 'analytics-views',
    position: 'after-name',
    isVisible: (item) => item.itemType === 'Document',
    render: (item) => {
        const views = getPageViews(item.contentKey);
        return html`<span style="opacity: 0.6; font-size: 11px; margin-left: 8px;">${views} views</span>`;
    }
});
```

## Styling Slots

### Using Inline Styles

```typescript
render: () => html`
    <span style="
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: var(--uui-color-surface-alt);
        border-radius: var(--uui-border-radius);
        font-size: var(--uui-type-small-size);
    ">Content</span>
`
```

### Using UUI Components

```typescript
render: () => html`
    <uui-tag color="positive" look="primary">
        <uui-icon name="icon-check"></uui-icon>
        Approved
    </uui-tag>
`
```

### Using CSS Custom Properties

Umbraco's UUI provides CSS custom properties:

```typescript
render: () => html`
    <span style="
        color: var(--uui-color-positive);
        background: var(--uui-color-positive-emphasis);
    ">Success</span>
`
```

## Unregistering Slots

```typescript
UmbNavExtensionRegistry.unregisterItemSlot('my-badge');
```

## Getting Registered Slots

```typescript
// Get all slots
const allSlots = UmbNavExtensionRegistry.getItemSlots();

// Get slots by position
const afterNameSlots = UmbNavExtensionRegistry.getItemSlotsByPosition('after-name');
```

## Best Practices

1. **Keep slots lightweight** - They render for every item
2. **Use visibility checks** - Don't render unnecessary content
3. **Match UmbNav styling** - Use UUI components and CSS variables
4. **Handle missing data** - Check for null/undefined
5. **Stop event propagation** - For interactive elements, prevent bubbling
6. **Use unique aliases** - Prefix with your package name

## Performance Considerations

Slots render for every visible item. For expensive operations:

```typescript
// Cache computed values
const scoreCache = new Map<string, number>();

UmbNavExtensionRegistry.registerItemSlot({
    alias: 'cached-slot',
    position: 'after-name',
    render: (item) => {
        let score = scoreCache.get(item.key);
        if (score === undefined) {
            score = computeExpensiveScore(item);
            scoreCache.set(item.key, score);
        }
        return html`<span>${score}</span>`;
    }
});
```

## Next Steps

- [Toolbar Actions](toolbar-actions.md) - Add action buttons
- [Custom Item Types](item-types.md) - Register new item types
- [Extending Components](extending-components.md) - Deep customization
