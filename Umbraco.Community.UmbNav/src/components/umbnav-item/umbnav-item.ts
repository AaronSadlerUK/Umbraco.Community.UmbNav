import { UmbNavItemStyles } from './umbnav-item.styles.ts';
import { confirmDelete } from './umbnav-item.modals.ts';
import { dispatchToggleNode, dispatchAddImage, dispatchToggleItemSettings, dispatchToggleVisibility, dispatchEditNode, dispatchRemoveNode } from './umbnav-item.events.ts';

import { html, customElement, LitElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

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
    @property({ type: Number, reflect: true })
    maxDepth: number = 0;
    @property({ type: Number, reflect: true })
    currentDepth: number = -1;

    // TODO: Does it make any different to have this as a property?
    @property({ type: Boolean, reflect: true, attribute: 'drag-placeholder' })
    umbDragPlaceholder = false;

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
        // Set draggable="false" on host when expanded to prevent sorter from dragging
        if (changedProperties.has('expanded')) {
            if (this.expanded) {
                this.setAttribute('draggable', 'false');
            } else {
                this.removeAttribute('draggable');
            }
        }
    }

    override render() {
        return html`
            <div class="tree-node ${this.unpublished ? 'unpublished' : ''} ${this.expanded ? 'expanded' : ''}" title="${this.expanded ? 'Collapse to drag' : ''}">
                ${this.maxDepth == 0 || (this.maxDepth !== 1 && this.currentDepth < this.maxDepth) ? html`
                    <div id="arrow">
                    <uui-symbol-expand ?open="${this.expanded}"
                    @click=${() => this.toggleNode()}></uui-symbol-expand>
                    </div>
                ` : ''}
			    <div id="icon">
                    <umb-icon name="${this.icon}"></umb-icon>
                </div>
                <div id="info">
                    <div class="column">
                        <div id="name">
                            <span class="name" @click=${() => this.editNode(this.key)}>${this.name}</span>
                            ${this.hideIncludesChildNodes && this.hideIncludesChildNodes ? html` <span class="umbnav-badge">Includes Child Nodes</span>` : ''}
                            ${this.enableMediaPicker ? html`<span class="image" @click=${() => this.addImage(this.key)}>${this.hasImage ? html`<umb-icon name="picture"></umb-icon>` : ''}</span>` : ''}
                            ${this.enableVisibility && this.hideLoggedOut ? html`<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedOut ? html`<umb-icon name="lock"></umb-icon>` : ''}</span>` : ''}
                            ${this.enableVisibility && this.hideLoggedIn ? html`<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedIn ? html`<umb-icon name="icon-unlocked"></umb-icon>` : ''}</span>` : ''}
                        </div>
                        ${this.enableDescription && this.description ? html`<div id="description">${this.description}</div>` : ''}
                        ${this.url ? html`<div id="url">${this.url}</div>` : ''}
                    </div>
                </div>
                <div id="buttons">
                    <uui-action-bar>
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

                        <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsEdit')}
                                    @click=${() => this.editNode(this.key)}>
                            <uui-icon name="edit"></uui-icon>
                        </uui-button>

                        <uui-button look="secondary" label=${this.localize.term('umbnav_buttonsDelete')}
                                    @click=${() => this.requestDelete()}>
                            <uui-icon name="delete"></uui-icon>
                        </uui-button>
                    </uui-action-bar>
                </div>
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