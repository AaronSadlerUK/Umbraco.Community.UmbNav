import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, LitElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { umbConfirmModal } from '@umbraco-cms/backoffice/modal';

@customElement('umbnav-item')
export class UmbNavItem extends UmbElementMixin(LitElement) {
    @property({ type: String, reflect: true })
    name: string = '';
    @property({ type: String, reflect: true })
    description: string = '';
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

    // TODO: Does it make any different to have this as a property?
    @property({ type: Boolean, reflect: true, attribute: 'drag-placeholder' })
    umbDragPlaceholder = false;

    toggleNode(): void {
        const event = new CustomEvent<{ key: string }>('toggle-children-event', {
            detail: { key: this.key },
        });

        this.dispatchEvent(event);
    }

    addImage(key: string | null | undefined): void {
        const event = new CustomEvent<{ key: string | null | undefined }>('add-image-event', {
            detail: {
                key: key
            },
        });
        this.dispatchEvent(event);
    }

    toggleItemSettings(key: string | null | undefined): void {
        const event = new CustomEvent<{ key: string | null | undefined }>('toggle-itemsettings-event', {
            detail: {
                key: key
            },
        });
        this.dispatchEvent(event);
    }

    toggleVisibility(key: string | null | undefined): void {
        const event = new CustomEvent<{ key: string | null | undefined }>('add-togglevisibility-event', {
            detail: {
                key: key
            },
        });
        this.dispatchEvent(event);
    }

    editNode(key: string | null | undefined): void {
        const event = new CustomEvent<{ key: string | null | undefined }>('edit-node-event', {
            detail: {
                key: key
            },
        });
        this.dispatchEvent(event);
    }

    removeNode(): void {
        const event = new CustomEvent<{ key: string }>('remove-node-event', {
            detail: { key: this.key },
        });
        this.dispatchEvent(event);
    }

    async requestDelete() {
        await umbConfirmModal(this, {
            headline: `Delete ${this.name}`,
            content: `Are you sure you want to delete the "${this.name}" menu item?`,
            confirmLabel: 'Delete',
            color: 'danger',
        });
        this.removeNode();
    }

    override render() {
        return html`
            <div class="tree-node ${this.unpublished ? 'unpublished' : ''}">
                <div id="arrow">
                <uui-symbol-expand ?open="${this.expanded}"
                @click=${() => this.toggleNode()}></uui-symbol-expand>
                </div>
			    <div id="icon">
                    <umb-icon name="${this.icon}"></umb-icon>
                </div>
                <div id="info">
                    <div class="column">
                        <div id="name">
                            <span class="name" @click=${() => this.editNode(this.key)}>${this.name}</span>
                            
                            ${this.enableMediaPicker ? html `<span class="image" @click=${() => this.addImage(this.key)}>${this.hasImage ? html `<umb-icon name="picture"></umb-icon>` : ''}</span>` : ''}
                            ${this.enableVisibility && this.hideLoggedOut ? html `<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedOut ? html `<umb-icon name="lock"></umb-icon>` : ''}</span>` : ''}
                            ${this.enableVisibility && this.hideLoggedIn ? html `<span class="image" @click=${() => this.toggleVisibility(this.key)}>${this.hideLoggedIn ? html `<umb-icon name="icon-unlocked"></umb-icon>` : ''}</span>` : ''}
                        </div>
                        <div id="description">
                            ${this.description}
                        </div>
                    </div>
                    <!-- <span class="umbnav-badge">Includes Child Nodes</span> -->
                </div>
                <div id="buttons">
                    <uui-action-bar>
                        ${this.enableMediaPicker ? html `
                        <uui-button look="secondary" label="Image"
                                    @click=${() => this.addImage(this.key)}>
                            <uui-icon name="picture"></uui-icon>
                        </uui-button>
                        ` : ''}

                        <uui-button look="secondary" label="Item Settings"
                                    @click=${() => this.toggleItemSettings(this.key)}>
                            <uui-icon name="icon-settings"></uui-icon>
                        </uui-button>

                        ${this.enableVisibility ? html `
                            <uui-button look="secondary" label="Visibility"
                                        @click=${() => this.toggleVisibility(this.key)}>
                                <uui-icon name="lock"></uui-icon>
                            </uui-button>
                        ` : ''}
                        
                        <uui-button look="secondary" label="Edit"
                                    @click=${() => this.editNode(this.key)}>
                            <uui-icon name="edit"></uui-icon>
                        </uui-button>

                        <uui-button look="secondary" label="Delete"
                                    @click=${() => this.requestDelete()}>
                            <uui-icon name="delete"></uui-icon>
                        </uui-button>
                    </uui-action-bar>
                </div>
            </div>

            <slot></slot>
        `;
    }

    static override styles = [
        UmbTextStyles,
        css`
            :host {
                display: grid;
                gap: 3px;
                border-radius: var(--uui-border-radius);
                
            }

            :host([drag-placeholder]) {
                opacity: 0.2;
            }
            div {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            #arrow {
                cursor: pointer;
            }

            #icon {
                display: flex;
                font-size: 1.2em;
                margin-left: var(--uui-size-2, 6px);
                margin-right: var(--uui-size-1, 3px);
            }

            #info {
                display: flex;
                padding-left: var(--uui-size-2, 6px);
                flex-grow: 1;
                flex-shrink: 0;
                flex-basis: auto;
            }

            #info .column {
                flex-direction: column;
                align-items: normal;
            }

            #buttons uui-action-bar {
                opacity: 0;
            }
            #buttons:hover uui-action-bar{
                opacity: 1;
                transition: opacity 120ms;
            }

            #name {
                font-weight: 700;
                cursor: pointer;
            }
            
            #description {
                color: #515054;
                font-size: 12px;
                line-height: 1.5em;
            }

            .name:hover {
                font-weight: 700;
                text-decoration: underline;
                color: var(--uui-color-interactive-emphasis, #3544b1);
            }
            
            .image {
                margin-left: var(--uui-size-space-2);
            }
            
            .image uui-icon {
                vertical-align: middle;
            }

            .tree-node {
                display: flex;
                align-items: center;
                padding: 5px 10px;
                border: 1px solid var(--uui-color-border, #d8d7d9);
                border-radius: 4px;
                background-color: var(--uui-color-surface, #fff);
                cursor: all-scroll;
                transition: background-color 0.3s ease;
                min-height: var(--uui-size-14);

            }

            .tree-node:hover {
                border-color: var(--uui-color-border-emphasis, #a1a1a1);
            }

            .margin-left {
                margin-left: var(--uui-size-space-5)
            }

            .tree-node.dragging {
                opacity: 0.5;
            }

            .unpublished {
                border: 1px dashed red;
                opacity: 0.6;
            }

            .unpublished:hover {
                border: 1px dashed red;
                opacity: 0.8;
            }

            slot:not([key]) {
                // go on new line:
            }
        `,
    ];
}

export default UmbNavItem;

declare global {
    interface HTMLElementTagNameMap {
        'umbnav-item': UmbNavItem;
    }
}