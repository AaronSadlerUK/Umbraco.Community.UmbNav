import { html, customElement, LitElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbPropertyEditorConfigCollection, UmbPropertyEditorConfigProperty, UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import '../umbnav-group/umbnav-group.js';
import type { UmbNavGroup } from '../umbnav-group/umbnav-group.js';
import { ModelEntryType } from "../../tokens/umbnav.token.ts";
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbNavPropertyEditorUIStyles } from './umbnav-property-editor-ui.styles.ts';
import { ensureNavItemKeys } from '../../umbnav-utils.ts';

@customElement('umbnav-property-editor-ui')
export default class UmbNavSorterPropertyEditorUIElement extends UmbElementMixin(LitElement) implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    value: ModelEntryType[] = [];

    @property({ attribute: false })
    config: UmbPropertyEditorConfigCollection | undefined;

    @property({ type: Number })
    depth: number = 0;

    @state()
    public get enableToggleAllButton(): Boolean {

        if (this.config?.find(item => item.alias === 'maxDepth')?.value === 1) {
            return false;
        }

        return <Boolean>this.config?.find(item => item.alias === 'enableToggleAllButton')?.value ?? false;
    }

    @state()
    expandAll: boolean = false;

    firstUpdated() {
        // Only assign keys if they're missing, once
        if (Array.isArray(this.value)) {
            this.value = ensureNavItemKeys(this.value);
        }
    }

    private onChange(e: Event) {
        this.value = (e.target as UmbNavGroup).value;
        this.dispatchEvent(new UmbChangeEvent());
    }

    toggleAllNodes() {
        this.expandAll = !this.expandAll;
        this.requestUpdate();
    }

    toggleAllNodesEvent(event: CustomEvent<{ expandAll: boolean }>) {
        this.expandAll = event.detail.expandAll;
    }

    render() {
        return html`
            <div class="outer-wrapper">
                ${this.enableToggleAllButton ? html`
                    <uui-button label=${this.localize.term('umbnav_toggleAllItemsToggleButton')} look="secondary"
                                @click=${() => this.toggleAllNodes()}
                    ></uui-button>
                ` : ''}
                <umbnav-group
                        .expandAll=${this.expandAll}
                        .config=${this.config ?? [] as Array<UmbPropertyEditorConfigProperty>}
                        .value=${this.value === undefined ? [] : this.value}
                        .depth=${this.depth}
                        @toggle-expandall-event=${this.toggleAllNodesEvent}
                        @change=${this.onChange}></umbnav-group>
            </div>
        `;
    }

    static override styles = UmbNavPropertyEditorUIStyles;
}

declare global {
    interface HTMLElementTagNameMap {
        'umbnav-property-editor-ui': UmbNavSorterPropertyEditorUIElement;
    }
}