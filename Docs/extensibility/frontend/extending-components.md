# Extending Components

For deep customization beyond what the Extension Registry provides, you can subclass UmbNav's Lit components directly.

## Available Components

| Component | Class | Description |
|-----------|-------|-------------|
| Menu Item | `UmbNavItem` | Individual menu item display |
| Item Group | `UmbNavGroup` | Container managing multiple items |
| Property Editor | `UmbNavSorterPropertyEditorUIElement` | The main property editor |

## Importing Components

```typescript
import {
    UmbNavItem,
    UmbNavGroup,
    UmbNavSorterPropertyEditorUIElement,
    UmbNavItemStyles,
    UmbNavGroupStyles,
    UmbNavPropertyEditorUIStyles
} from '/App_Plugins/UmbNav/dist/api.js';
```

## Extending UmbNavItem

### Basic Subclass

```typescript
import { UmbNavItem, UmbNavItemStyles } from '/App_Plugins/UmbNav/dist/api.js';
import { customElement, html, css } from '@umbraco-cms/backoffice/external/lit';

@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    // Your customizations here
}
```

### Override Points

UmbNavItem provides these protected methods for overriding:

| Method | Returns | Description |
|--------|---------|-------------|
| `renderExpandArrow()` | `TemplateResult` | The expand/collapse arrow |
| `renderIcon()` | `TemplateResult` | The item icon |
| `renderName()` | `TemplateResult` | The name and badges |
| `renderInfo()` | `TemplateResult` | The info section (name, description, URL) |
| `renderCoreToolbarButtons()` | `TemplateResult` | The built-in toolbar buttons |
| `renderToolbar()` | `TemplateResult` | The entire toolbar section |
| `getVisibleExtensionActions()` | `UmbNavToolbarAction[]` | Extension actions to show |
| `getExtensionSlots(position)` | `UmbNavItemSlot[]` | Slots for a position |
| `renderExtensionSlots(position)` | `TemplateResult` | Render slots at position |
| `renderExtensionActions()` | `TemplateResult` | Render extension buttons |
| `executeExtensionAction(action)` | `Promise<void>` | Execute an action |

### Example: Custom Icon Rendering

```typescript
@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    protected override renderIcon() {
        // Use item type to determine icon style
        const iconClass = this.itemData?.itemType === 'Document'
            ? 'icon-document'
            : this.itemData?.itemType === 'Link'
            ? 'icon-external-link'
            : 'icon-tag';

        return html`
            <div class="custom-icon ${this.itemData?.itemType?.toLowerCase()}">
                <umb-icon name="${iconClass}"></umb-icon>
            </div>
        `;
    }

    static override styles = [
        ...UmbNavItemStyles,
        css`
            .custom-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                margin-right: 8px;
            }

            .custom-icon.document {
                background: #dbeafe;
                color: #2563eb;
            }

            .custom-icon.link {
                background: #dcfce7;
                color: #16a34a;
            }

            .custom-icon.title {
                background: #fef3c7;
                color: #d97706;
            }
        `
    ];
}
```

### Example: Custom Name with Extra Info

```typescript
@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    protected override renderName() {
        return html`
            <div id="name" class="custom-name">
                ${this.renderExtensionSlots('before-name')}

                <div class="name-wrapper">
                    <span class="name" @click=${() => this.editNode(this.key)}>
                        ${this.name}
                    </span>

                    ${this.itemData?.itemType === 'Document' ? html`
                        <span class="content-type">
                            Content
                        </span>
                    ` : ''}
                </div>

                ${this.hideIncludesChildNodes ? html`
                    <uui-tag look="secondary" compact>
                        Includes Children
                    </uui-tag>
                ` : ''}

                ${this.renderExtensionSlots('after-name')}
            </div>
        `;
    }

    static override styles = [
        ...UmbNavItemStyles,
        css`
            .custom-name {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .name-wrapper {
                display: flex;
                flex-direction: column;
            }

            .content-type {
                font-size: 10px;
                color: var(--uui-color-text-alt);
                text-transform: uppercase;
            }
        `
    ];
}
```

### Example: Custom Toolbar

```typescript
@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    protected override renderToolbar() {
        return html`
            <div id="buttons" class="custom-toolbar">
                <uui-action-bar>
                    ${this.renderExtensionSlots('before-toolbar')}
                    ${this.renderExtensionActions()}

                    <!-- Custom button -->
                    <uui-button
                        look="primary"
                        label="Quick Edit"
                        @click=${() => this.editNode(this.key)}>
                        <uui-icon name="icon-edit"></uui-icon>
                        Edit
                    </uui-button>

                    <!-- Simplified core buttons -->
                    <uui-button
                        look="secondary"
                        label="Delete"
                        @click=${() => this.requestDelete()}>
                        <uui-icon name="icon-delete"></uui-icon>
                    </uui-button>

                    ${this.renderExtensionSlots('after-toolbar')}
                </uui-action-bar>
            </div>
        `;
    }

    static override styles = [
        ...UmbNavItemStyles,
        css`
            .custom-toolbar uui-button[look="primary"] {
                --uui-button-background-color: var(--uui-color-positive);
            }
        `
    ];
}
```

### Example: Completely Custom Render

```typescript
@customElement('my-custom-umbnav-item')
export class MyCustomUmbNavItem extends UmbNavItem {
    override render() {
        return html`
            <div class="card-item ${this.unpublished ? 'unpublished' : ''}">
                <div class="card-header">
                    ${this.renderIcon()}
                    <h4>${this.name}</h4>
                    ${this.renderExpandArrow()}
                </div>

                <div class="card-body">
                    ${this.description ? html`<p>${this.description}</p>` : ''}
                    ${this.url ? html`<small>${this.url}</small>` : ''}
                </div>

                <div class="card-footer">
                    ${this.renderToolbar()}
                </div>

                <slot></slot>
            </div>
        `;
    }

    static override styles = [
        css`
            :host {
                display: block;
            }

            .card-item {
                border: 1px solid var(--uui-color-border);
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .card-header {
                display: flex;
                align-items: center;
                padding: 12px;
                background: var(--uui-color-surface-alt);
                gap: 8px;
            }

            .card-header h4 {
                margin: 0;
                flex-grow: 1;
            }

            .card-body {
                padding: 12px;
            }

            .card-footer {
                padding: 8px 12px;
                border-top: 1px solid var(--uui-color-border);
                background: var(--uui-color-surface);
            }

            .unpublished {
                opacity: 0.6;
                border-style: dashed;
            }
        `
    ];
}
```

## Available Properties

Properties available on `UmbNavItem`:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Item display name |
| `description` | `string` | Item description |
| `url` | `string` | Item URL |
| `icon` | `string` | Icon name |
| `key` | `string` | Unique item key |
| `expanded` | `boolean` | Whether children are visible |
| `unpublished` | `boolean` | Whether item is unpublished |
| `hasImage` | `boolean` | Whether item has an image |
| `enableMediaPicker` | `boolean` | Whether images are enabled |
| `hideLoggedIn` | `boolean` | Hide for logged in users |
| `hideLoggedOut` | `boolean` | Hide for logged out users |
| `enableVisibility` | `boolean` | Whether visibility settings enabled |
| `enableDescription` | `boolean` | Whether descriptions enabled |
| `hideIncludesChildNodes` | `boolean` | Whether includes children |
| `maxDepth` | `number` | Maximum nesting depth |
| `currentDepth` | `number` | Current nesting depth |
| `itemData` | `ModelEntryType` | Full item data |
| `config` | `UmbPropertyEditorConfigProperty[]` | Editor configuration |

## Extending Styles

### Extending Base Styles

```typescript
static override styles = [
    ...UmbNavItemStyles,  // Include base styles
    css`
        /* Your additions */
    `
];
```

### Replacing Styles Completely

```typescript
static override styles = [
    css`
        /* All custom styles, no base */
    `
];
```

### Using CSS Custom Properties

```typescript
static override styles = [
    ...UmbNavItemStyles,
    css`
        :host {
            --item-background: var(--uui-color-surface);
            --item-border: var(--uui-color-border);
        }

        .tree-node {
            background: var(--item-background);
            border-color: var(--item-border);
        }
    `
];
```

## Registering Custom Components

After creating your component, you need to use it. Options include:

### 1. Replace via Manifest

Create an Umbraco extension manifest:

```typescript
// manifest.ts
export const manifests = [
    {
        type: 'propertyEditorUi',
        alias: 'My.UmbNav',
        name: 'My Custom UmbNav',
        element: () => import('./my-custom-property-editor.js'),
        meta: {
            // ... configuration
        }
    }
];
```

### 2. Use in Custom Property Editor

Create a custom property editor that uses your component:

```typescript
@customElement('my-umbnav-property-editor')
export class MyUmbNavPropertyEditor extends UmbNavSorterPropertyEditorUIElement {
    override render() {
        return html`
            <my-custom-umbnav-group
                .value=${this.value}
                .config=${this.config}
                @change=${this.handleChange}>
            </my-custom-umbnav-group>
        `;
    }
}
```

## Best Practices

### 1. Call Parent Methods

When overriding, call the parent if you want to preserve functionality:

```typescript
protected override renderName() {
    // Add before
    const prefix = html`<span class="prefix">→</span>`;

    // Get parent rendering
    const parentRender = super.renderName();

    // Combine
    return html`${prefix}${parentRender}`;
}
```

### 2. Preserve Extension Points

Keep extension slots and actions working:

```typescript
protected override renderName() {
    return html`
        ${this.renderExtensionSlots('before-name')}
        <!-- Your custom content -->
        ${this.renderExtensionSlots('after-name')}
    `;
}
```

### 3. Handle Undefined Data

Check for null/undefined:

```typescript
protected override renderIcon() {
    if (!this.itemData) {
        return html`<umb-icon name="icon-help"></umb-icon>`;
    }
    return super.renderIcon();
}
```

### 4. Use Type Guards

For type-safe access:

```typescript
if (this.itemData && 'customClasses' in this.itemData) {
    // Safe access
}
```

## Next Steps

- [Toolbar Actions](toolbar-actions.md) - Simpler customization
- [Item Slots](item-slots.md) - Add content without subclassing
- [Backend Extensions](../backend/README.md) - C# customization
