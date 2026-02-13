import { UmbNavItemStyles } from './umbnav-item.styles.ts';
import { confirmDelete } from './umbnav-item.modals.ts';
import { dispatchToggleNode, dispatchAddImage, dispatchToggleItemSettings, dispatchToggleVisibility, dispatchEditNode, dispatchRemoveNode } from './umbnav-item.events.ts';
import { UmbNavExtensionRegistry } from '../../extensions/extension-registry.js';
import type { UmbNavToolbarAction, UmbNavActionContext, UmbNavItemSlot } from '../../extensions/extension-types.js';
import type { ModelEntryType, Guid } from '../../tokens/umbnav.token.js';

import { html, customElement, LitElement, property, state, TemplateResult } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbPropertyEditorConfigProperty } from '@umbraco-cms/backoffice/property-editor';

/**
 * Custom event for toolbar action execution.
 */
export class UmbNavToolbarActionEvent extends CustomEvent<{ action: UmbNavToolbarAction; item: ModelEntryType }> {
    static readonly TYPE = 'umbnav-toolbar-action';
    constructor(action: UmbNavToolbarAction, item: ModelEntryType) {
        super(UmbNavToolbarActionEvent.TYPE, {
            bubbles: true,
            composed: true,
            detail: { action, item }
        });
    }
}

@customElement('umbnav-item')
export class UmbNavItem extends UmbElementMixin(LitElement) {
    @property({ type: String, reflect: true })
    name: string = '';

    @property({ type: String, reflect: true })
    description: string = '';

    @property({ type: String, reflect: true })
    url: string = '';

    @property({ type: String, reflect: true })
    icon: string = '';

    @property({ type: String, reflect: true })
    key: string = '';

    @property({ type: Boolean, reflect: true })
    expanded: boolean = false;

    @property({ type: Boolean, reflect: true })
    unpublished: boolean = false;

    @property({ type: Boolean, reflect: true })
    hasImage: boolean = false;

    @property({ type: Boolean, reflect: true })
    enableMediaPicker: boolean = false;

    @property({ type: Boolean, reflect: true })
    hideLoggedIn: boolean = false;

    @property({ type: Boolean, reflect: true })
    hideLoggedOut: boolean = false;

    @property({ type: Boolean, reflect: true })
    enableVisibility: boolean = false;

    @property({ type: Boolean, reflect: true })
    enableDescription: boolean = false;

    @property({ type: Boolean, reflect: true })
    hideIncludesChildNodes: boolean = false;

    @property({ type: Boolean, reflect: true })
    allowChildren: boolean = true;

    @property({ type: Number, reflect: true })
    maxDepth: number = 0;

    @property({ type: Number, reflect: true })
    currentDepth: number = -1;

    @property({ type: Boolean, reflect: true })
    editable: boolean = true;

    /**
     * The full item data for extension access.
     */
    @property({ attribute: false })
    itemData: ModelEntryType | null = null;

    /**
     * Configuration properties for extension visibility checks.
     */
    @property({ attribute: false })
    config: UmbPropertyEditorConfigProperty[] = [];

    @property({ type: Boolean, reflect: true, attribute: 'drag-placeholder' })
    umbDragPlaceholder = false;

    @state()
    private _extensionActions: UmbNavToolbarAction[] = [];

    @state()
    private _extensionSlots: UmbNavItemSlot[] = [];

    private _unsubscribeRegistry?: () => void;

    override connectedCallback(): void {
        super.connectedCallback();
        this._loadExtensions();
        this._unsubscribeRegistry = UmbNavExtensionRegistry.onChange(() => {
            this._loadExtensions();
        });
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._unsubscribeRegistry?.();
    }

    private _loadExtensions(): void {
        this._extensionActions = UmbNavExtensionRegistry.getToolbarActions();
        this._extensionSlots = UmbNavExtensionRegistry.getItemSlots();
        this.requestUpdate();
    }

    /**
     * Gets the visible extension actions for the current item.
     */
    protected getVisibleExtensionActions(): UmbNavToolbarAction[] {
        if (!this.itemData) return [];
        return this._extensionActions.filter(action => {
            if (action.isVisible) {
                return action.isVisible(this.itemData!, this.config);
            }
            return true;
        });
    }

    /**
     * Gets extension slots for a specific position.
     */
    protected getExtensionSlots(position: UmbNavItemSlot['position']): UmbNavItemSlot[] {
        if (!this.itemData) return [];
        return this._extensionSlots
            .filter(slot => slot.position === position)
            .filter(slot => {
                if (slot.isVisible) {
                    return slot.isVisible(this.itemData!, this.config);
                }
                return true;
            });
    }

    /**
     * Renders extension slots for a position.
     */
    protected renderExtensionSlots(position: UmbNavItemSlot['position']): TemplateResult {
        const slots = this.getExtensionSlots(position);
        if (slots.length === 0) return html``;
        return html`${slots.map(slot => slot.render(this.itemData!, this.config))}`;
    }

    /**
     * Renders extension toolbar actions.
     */
    protected renderExtensionActions(): TemplateResult {
        const actions = this.getVisibleExtensionActions();
        if (actions.length === 0) return html``;

        return html`${actions.map(action => html`
            <uui-button
                look="secondary"
                label=${action.label}
                @click=${() => this.executeExtensionAction(action)}>
                <uui-icon name=${action.icon}></uui-icon>
            </uui-button>
        `)}`;
    }

    /**
     * Executes an extension action.
     */
    protected async executeExtensionAction(action: UmbNavToolbarAction): Promise<void> {
        if (!this.itemData) return;

        const context: UmbNavActionContext = {
            host: this,
            config: this.config,
            updateItem: (item: ModelEntryType) => {
                this.dispatchEvent(new CustomEvent('umbnav-item-update', {
                    bubbles: true,
                    composed: true,
                    detail: { item }
                }));
            },
            removeItem: (key: Guid) => {
                dispatchRemoveNode(this, key as string);
            },
            openModal: async <T>(token: unknown, data: unknown): Promise<T | undefined> => {
                // This will be handled by the parent group component
                return new Promise((resolve) => {
                    this.dispatchEvent(new CustomEvent('umbnav-open-modal', {
                        bubbles: true,
                        composed: true,
                        detail: { token, data, resolve }
                    }));
                });
            }
        };

        try {
            await action.onExecute(this.itemData, context);
        } catch (error) {
            console.error(`Error executing action ${action.alias}:`, error);
        }
    }

    toggleNode(): void {
        dispatchToggleNode(this, this.key);
    }

    addImage(key: string | null | undefined): void {
        dispatchAddImage(this, key);
    }

    toggleItemSettings(key: string | null | undefined): void {
        dispatchToggleItemSettings(this, key);
    }

    toggleVisibility(key: string | null | undefined): void {
        dispatchToggleVisibility(this, key);
    }

    editNode(key: string | null | undefined): void {
        dispatchEditNode(this, key);
    }

    removeNode(): void {
        dispatchRemoveNode(this, this.key);
    }

    async requestDelete() {
        try {
            if (await confirmDelete(this, this.name)) {
                this.removeNode();
            }
        } catch (error) {
            console.error('Error in requestDelete:', error);
        }
    }

    override updated(changedProperties: Map<string, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('expanded')) {
            if (this.expanded) {
                this.setAttribute('draggable', 'false');
            } else {
                this.removeAttribute('draggable');
            }
        }
    }

    /**
     * Renders the expand/collapse arrow.
     * Override to customize expand behavior.
     */
    protected renderExpandArrow(): TemplateResult {
        if (this.allowChildren === false) {
            return html``;
        }
        if (this.maxDepth == 0 || (this.maxDepth !== 1 && this.currentDepth < this.maxDepth)) {
            return html`
                <div id="arrow">
                    <uui-symbol-expand ?open="${this.expanded}"
                        @click=${() => this.toggleNode()}></uui-symbol-expand>
                </div>
            `;
        }
        return html``;
    }

    /**
     * Renders the item icon.
     * Override to customize icon rendering.
     */
    protected renderIcon(): TemplateResult {
        return html`
            <div id="icon">
                <umb-icon name="${this.icon}"></umb-icon>
            </div>
        `;
    }

    /**
     * Renders the item name and badges.
     * Override to customize name display.
     */
    protected renderName(): TemplateResult {
        return html`
            <div id="name">
                ${this.renderExtensionSlots('before-name')}
                ${this.editable
                    ? html`<span class="name" @click=${() => this.editNode(this.key)}>${this.name}</span>`
                    : html`<span class="name-static">${this.name}</span>`}
                ${this.hideIncludesChildNodes && this.hideIncludesChildNodes ? html` <span class="umbnav-badge">Includes Child Nodes</span>` : ''}
                ${this.enableMediaPicker ? html`<span class="image" @click=${() => this.addImage(this.key)}>${this.hasImage ? html`<umb-icon name="picture"></umb-icon>` : ''}</span>` : ''}
                ${this.enableVisibility && this.hideLoggedOut ? html`<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedOut ? html`<umb-icon name="lock"></umb-icon>` : ''}</span>` : ''}
                ${this.enableVisibility && this.hideLoggedIn ? html`<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedIn ? html`<umb-icon name="icon-unlocked"></umb-icon>` : ''}</span>` : ''}
                ${this.renderExtensionSlots('after-name')}
            </div>
        `;
    }

    /**
     * Renders the item info section (name, description, URL).
     * Override to customize info display.
     */
    protected renderInfo(): TemplateResult {
        return html`
            <div id="info">
                <div class="column">
                    ${this.renderName()}
                    ${this.enableDescription && this.description ? html`<div id="description">${this.description}</div>` : ''}
                    ${this.url ? html`<div id="url">${this.url}</div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Renders the core toolbar buttons (image, settings, visibility, edit, delete).
     * Override to customize or replace core toolbar buttons.
     */
    protected renderCoreToolbarButtons(): TemplateResult {
        return html`
            ${this.enableMediaPicker ? html`
                <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsImage')}
                            @click=${() => this.addImage(this.key)}>
                    <uui-icon name="picture"></uui-icon>
                </uui-button>
            ` : ''}

            <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsSettings')}
                        @click=${() => this.toggleItemSettings(this.key)}>
                <uui-icon name="icon-settings"></uui-icon>
            </uui-button>

            ${this.enableVisibility ? html`
                <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsVisibility')}
                            @click=${() => this.toggleVisibility(this.key)}>
                    <uui-icon name="lock"></uui-icon>
                </uui-button>
            ` : ''}

            ${this.editable ? html`
                <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsEdit')}
                            @click=${() => this.editNode(this.key)}>
                    <uui-icon name="edit"></uui-icon>
                </uui-button>
            ` : ''}

            <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsDelete')}
                        @click=${() => this.requestDelete()}>
                <uui-icon name="delete"></uui-icon>
            </uui-button>
        `;
    }

    /**
     * Renders the toolbar section.
     * Override to completely customize the toolbar.
     */
    protected renderToolbar(): TemplateResult {
        return html`
            <div id="buttons">
                <uui-action-bar>
                    ${this.renderExtensionSlots('before-toolbar')}
                    ${this.renderExtensionActions()}
                    ${this.renderCoreToolbarButtons()}
                    ${this.renderExtensionSlots('after-toolbar')}
                </uui-action-bar>
            </div>
        `;
    }

    override render() {
        return html`
            <div class="tree-node ${this.unpublished ? 'unpublished' : ''} ${this.expanded ? 'expanded' : ''}" title="${this.expanded ? 'Collapse to drag' : ''}">
                ${this.renderExpandArrow()}
                ${this.renderIcon()}
                ${this.renderInfo()}
                ${this.renderToolbar()}
            </div>

            <slot></slot>
        `;
    }

    static override styles = UmbNavItemStyles;
}

export default UmbNavItem;

declare global {
    interface HTMLElementTagNameMap {
        'umbnav-item': UmbNavItem;
    }
}
