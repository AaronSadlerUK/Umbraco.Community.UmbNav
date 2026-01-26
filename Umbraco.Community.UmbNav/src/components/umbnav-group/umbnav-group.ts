import { UmbNavGroupStyles } from './umbnav-group.styles.ts';
import { calculateTotalDepth, findItemByKey, convertToUmbLinkPickerLink, convertToUmbNavLink, convertToImageType, setItemDepths } from '../../umbnav-utils.ts';
import { openTextModal, openSettingsModal, openVisibilityModal } from './umbnav-group.modals.ts';
import { getDocument, getMedia, generateUmbNavLink } from './umbnav-group.data.ts';
import { customElement, html, LitElement, property, repeat, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';
import { UMB_LINK_PICKER_MODAL, UmbLinkPickerLink } from '@umbraco-cms/backoffice/multi-url-picker';
import { UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
import '../umbnav-item/umbnav-item.ts';
import UmbNavItem from '../umbnav-item/umbnav-item.ts';
import { UMB_MODAL_MANAGER_CONTEXT, UmbModalManagerContext, } from '@umbraco-cms/backoffice/modal';
import { UmbPropertyEditorConfigProperty } from "@umbraco-cms/backoffice/property-editor";
import { Guid, ModelEntryType } from "../../tokens/umbnav.token.ts";
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UMB_VARIANT_CONTEXT } from '@umbraco-cms/backoffice/variant';

@customElement('umbnav-group')
export class UmbNavGroup extends UmbElementMixin(LitElement) {
    #modalContext?: UmbModalManagerContext;
    #culture?: string | null;

    // Sorter setup:
    #sorter = new UmbSorterController<ModelEntryType, UmbNavItem>(this, {
        getUniqueOfElement: (element) => {
            return element.key;
        },
        getUniqueOfModel: (modelEntry) => {
            return modelEntry.key;
        },
        identifier: 'umbnav-identifier',
        itemSelector: 'umbnav-item',
        containerSelector: '.umbnav-container',
        onChange: ({ model }) => {
            const oldValue = this._value;
            this._value = setItemDepths(model);
            this.requestUpdate('value', oldValue);
            this.#dispatchChangeEvent();
        },
        onRequestMove: ({ item }) => {
            if (this.maxDepth === 0) {
                return true;
            }

            if (item.children) {
                return this.depth + calculateTotalDepth(item.children) <= this.maxDepth;
            }

            return this.depth <= this.maxDepth;
        }
    });

    @state()
    private _value?: ModelEntryType[];

    @state()
    private _items: ModelEntryType[] = [];

    @state()
    private expandedItems: string[] = [];

    private _expandAll: boolean = false;

    @property({ type: Array, attribute: false })
    config: UmbPropertyEditorConfigProperty[] = [];

    @property({ type: Boolean, reflect: true })
    nested: boolean = false;

    @property({ type: Number, reflect: true })
    depth: number = 0;

    @state()
    disallowed: boolean = false;

    @state()
    public get maxDepth(): number {
        const maxDepth = <number>this.config?.find(item => item.alias === 'maxDepth')?.value ?? 0;
        return maxDepth;
    }

    @property({ type: Boolean, reflect: true })
    public get expandAll(): boolean {
        return this._expandAll;
    }
    public set expandAll(value: boolean) {
        const oldValue = this._expandAll;
        this._expandAll = value;
        if (value) {
            this.expandedItems = [];
        }
        this.requestUpdate('expandAll', oldValue);
        const event = new CustomEvent<{ expandAll: boolean }>('toggle-expandall-event', {
            detail: {
                expandAll: this._expandAll
            },
        });
        this.dispatchEvent(event);
    }

    @property({ type: Array, attribute: false })
    public get value(): ModelEntryType[] {
        return this._value ?? [];
    }

    @state()
    public get enableTextItems(): boolean {
        return <boolean>this.config.find(item => item.alias === 'enableTextItems')?.value ?? false;
    }

    @state()
    public get enableMediaPicker(): boolean {
        return <boolean>this.config?.find(item => item.alias === 'allowImageIcon')?.value ?? false;
    }

    @state()
    public get enableVisibility(): boolean {
        return <boolean>this.config?.find(item => item.alias === 'allowDisplay')?.value ?? false;
    }

    public set value(value: ModelEntryType[]) {
        const oldValue = this._value;
        this._value = value;
        this.#sorter.setModel(this._value);
        this.requestUpdate('value', oldValue);
    }

    constructor() {
        super();
        this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (_instance) => {
            this.#modalContext = _instance;
        });
        this.consumeContext(UMB_VARIANT_CONTEXT, (context) => {
            this.observe(context?.variantId, (variantId) => {
                this.#culture = variantId?.culture ?? null;
            });
        });
    }

    async willUpdate(changed: Map<PropertyKey, unknown>) {
        if (changed.has('value')) {
            // fetch the latest data for every item before the next render
            this._items = await Promise.all(
                (Array.isArray(this.value) ? this.value : []).map(async (i) => {
                    return await this.#generateUmbNavLink(i);
                })
            );
        }
    }

    #removeItem = (event: CustomEvent<{ key: string }>) => {
        const { key } = event.detail;
        this.value = this.#removeItemRecursive(this.value, key);
        this.#dispatchChangeEvent();
    };

    #removeItemRecursive(list: any[], key: string): any[] {
        return list.filter((item) => {
            if (item.key === key) return false;
            if (item.children) item = { ...item, children: this.#removeItemRecursive(item.children, key) };
            return true;
        });
    }

    // toggleNode(event: CustomEvent<{ expanded: boolean; key: string }>) {
    //     const {expanded, key} = event.detail;
    //     this.value = this.updateExpandedInNested(this.value, key, expanded);
    // }

    #updateExpandedInNested(arr: ModelEntryType[], key: string, expanded: boolean) {
        return arr.map(item => {
            // If the current item's key matches, update its expanded property
            if (item.key === key) {
                return { ...item, expanded: expanded };
            }

            // If the item has children, recursively search within them
            if (item.children && item.children.length > 0) {
                const updatedChildren: ModelEntryType[] = this.#updateExpandedInNested(item.children, key, expanded);

                // Only return a new object if children were updated
                if (updatedChildren !== item.children) {
                    return { ...item, children: updatedChildren };
                }
            }

            // Return the original item if no changes were made
            return item;
        });
    }

    #toggleMediaPickerEvent(event: CustomEvent<{ key: string | null | undefined }>) {
        this.#toggleMediaPicker(event.detail.key);
    }

    async #toggleMediaPicker(key: string | null | undefined) {
        try {
            if (!key) return;
            const umbNavItem = findItemByKey(key, this.value);
            if (!umbNavItem) return;
            const selectedIds = umbNavItem?.image?.map(x => x.key).filter(x => x);

            const modalHandler = this.#modalContext?.open(this, UMB_MEDIA_PICKER_MODAL, {
                data: { multiple: false },
                value: { selection: selectedIds || [] },
            });

            const result = await modalHandler?.onSubmit().catch(() => undefined);
            if (!modalHandler || !result) return;

            const convertedImages = this.#convertSelectedImages(result.selection);
            const menuItem = this.#updateMenuItemImage(umbNavItem, convertedImages);

            this.#updateItem(menuItem);
        } catch (error) {
            console.error(error);
        }
    }

    #convertSelectedImages(selection: any[]): any[] {
        return selection?.map(id => convertToImageType(id as Guid));
    }

    #updateMenuItemImage(umbNavItem: ModelEntryType, images: any[]) {
        return { ...umbNavItem, image: images };
    }

    #toggleSettingsEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.#toggleSettingsModal(event.detail.key);
    }

    async #toggleSettingsModal(key: Guid | null | undefined) {
        try {
            const updatedItem = await openSettingsModal(this.#modalContext, key, this.value, this.config, this);
            if (updatedItem) {
                this.#updateItem(updatedItem);
            }
        } catch (error) {
            console.error('Error in #toggleSettingsModal:', error);
        }
    }

    #toggleVisibilityEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.#toggleVisibilityModal(event.detail.key);
    }

    async #toggleVisibilityModal(key: Guid | null | undefined) {
        try {
            const updatedItem = await openVisibilityModal(this.#modalContext, key, this.value, this);
            if (updatedItem) {
                this.#updateItem(updatedItem);
            }
        } catch (error) {
            console.error('Error in #toggleVisibilityModal:', error);
        }
    }

    #toggleLinkPickerEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        if (this.value.find(item => item.key === event.detail.key && (item.itemType === "title" || item.itemType === 'nolink'))) {
            this.#toggleTextModal(event.detail.key);
        } else {
            this.#toggleLinkPicker(event.detail.key);
        }
    }

    async #toggleTextModal(key: Guid | null | undefined) {
        try {
            const menuItem = await openTextModal(this.#modalContext, key, this.value, this);
            if (!menuItem) return;
            if (Array.isArray(this.value) && this.value.find(item => item.key === key)) {
                this.#updateItem(menuItem);
            } else {
                this.#addItem(menuItem);
            }
        } catch (error) {
            console.error('Error in #toggleTextModal:', error);
        }
    }

    async #toggleLinkPicker(key: Guid | null | undefined, siblingKey?: string | null | undefined) {
        try {
            let item: UmbLinkPickerLink = { name: '', url: '', icon: '', type: null, target: '', published: false, unique: '', queryString: '' };
            if (key != null) {
                const umbNavItem = findItemByKey(key, this.value);
                item = await convertToUmbLinkPickerLink(this, <ModelEntryType>umbNavItem);
            }

            const modalHandler = this.#modalContext?.open(this, UMB_LINK_PICKER_MODAL, {
                data: { config: {}, index: null, isNew: !item.unique },
                value: { link: item }
            });

            const result = await modalHandler?.onSubmit().catch(() => undefined);
            if (!modalHandler || !result?.link) return;

            let menuItem = result.link;

            if (menuItem.type === "external") menuItem = await this.#handleExternalLink(menuItem);
            if (menuItem.type === "media") menuItem = await this.#handleMediaLink(menuItem);
            if (menuItem.type === "document") menuItem = await this.#handleDocumentLink(menuItem);
            if (menuItem.type === null) menuItem = this.#handleNullLink(menuItem);

            if (this.value && this.value.find(item => item.key === key)) {
                this.#updateItem(await convertToUmbNavLink(this, menuItem, key, this.value));
            } else {
                this.#addItem(await convertToUmbNavLink(this, menuItem, null, this.value), siblingKey);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async #handleExternalLink(menuItem: UmbLinkPickerLink) {
        return { ...menuItem, icon: "icon-link" };
    }

    async #handleMediaLink(menuItem: UmbLinkPickerLink) {
        const media = await this.#getMedia(menuItem.unique);
        if (media) {
            return {
                ...menuItem,
                name: menuItem.name || media.variants[0].name,
                icon: media.mediaType.icon,
                url: media.values.length > 0 ? (media.values[0].value as { src: string }).src : null,
            };
        }
        return menuItem;
    }

    async #handleDocumentLink(menuItem: UmbLinkPickerLink) {
        const document = await this.#getDocument(menuItem.unique);
        if (document) {
            return {
                ...menuItem,
                name: menuItem.name || document.variants[0].name,
                icon: document.documentType.icon,
                url: menuItem.url,
                published: document.variants[0].state === "Published"
            };
        }
        return menuItem;
    }

    #handleNullLink(menuItem: UmbLinkPickerLink) {
        return { ...menuItem, icon: "icon-unlink" };
    }

    #addItem(newItem: ModelEntryType, siblingKey?: string | null | undefined): void {
        let newValue = [...this.value];

        if (siblingKey) {
            const siblingIndex = newValue.findIndex(item => item.key === siblingKey);
            if (siblingIndex !== -1) {
                newValue.splice(siblingIndex, 0, newItem);
            } else {
                newValue.push(newItem);
            }
        } else {
            newValue.push(newItem);
        }

        this.value = setItemDepths(newValue);
        this.#dispatchChangeEvent();
    }

    #updateItem(updatedItem: ModelEntryType): void {

        let updatedValue = [...this.value]

        const index = updatedValue.findIndex(item => item.key === updatedItem.key);
        if (index !== -1) {
            const children = updatedItem.children !== undefined ? updatedItem.children : updatedValue[index].children;
            updatedValue[index] = { ...updatedValue[index], ...updatedItem, children };
        }

        this.value = setItemDepths(updatedValue)
        this.#dispatchChangeEvent();
    }

    async #generateUmbNavLink(item: ModelEntryType): Promise<ModelEntryType> {
        try {
            return await generateUmbNavLink(this, item, this.#culture);
        } catch (error) {
            console.error('Error in #generateUmbNavLink:', error);
            return item;
        }
    }

    #dispatchChangeEvent() {
        this.dispatchEvent(new UmbChangeEvent());
    }

    #newNode(siblingKey?: string | null | undefined): void {
        this.#toggleLinkPicker(null, siblingKey);
        this.#dispatchChangeEvent();
    }


    async #getDocument(entityKey: string | undefined | null) {
        try {
            return await getDocument(this, entityKey);
        } catch (error) {
            console.error('Error in #getDocument:', error);
            return null;
        }
    }

    async #getMedia(entityKey: string | undefined | null) {
        try {
            return await getMedia(this, entityKey);
        } catch (error) {
            console.error('Error in #getMedia:', error);
            return null;
        }
    }

    firstUpdated() {
        this.style.setProperty('interpolate-size', 'allow-keywords');
        if (Array.isArray(this.value) && this.value.length > 0) {
            this.value = setItemDepths(this.value);
        }
    }

    #toggleNode(event: CustomEvent<{ key: string }>): void {
        if (this._expandAll) {
            this.expandAll = false;
        }

        if (!this.expandedItems.includes(event.detail.key)) {
            this.expandedItems.push(event.detail.key);
        } else {
            this.expandedItems = this.expandedItems.filter(key => key !== event.detail.key);
        }

        this.requestUpdate();
    }

    #getDescriptionText(description: string | null | undefined, url: string | null | undefined, anchor: string | null | undefined): string {
        var urlText = typeof url !== 'undefined' && url ? url : '';
        var anchorText = typeof anchor !== 'undefined' && anchor ? anchor : '';
        return typeof description !== 'undefined' && description ? description : `${urlText}${anchorText}`;
    }

    override render() {
        return html`
            <div class="umbnav-container ${this.nested ? 'margin-left' : ''}">
                ${repeat(
            this._items,
            (item) => item.key,
            (item) =>
                html`
                                    <uui-button-inline-create
                                            @click=${() => this.#newNode(item.key)}></uui-button-inline-create>
                                    <umbnav-item name=${item.name ?? item.title ?? ''} key="${item.key ?? ''}" class=""
                                                 description="${this.#getDescriptionText(item.description, item.url, item.anchor)}"
                                                 .expanded=${this._expandAll || item.key != null && this.expandedItems.includes(item.key)}
                                                 .hasImage=${Boolean(item.image?.length)}
                                                 .enableMediaPicker=${this.enableMediaPicker}
                                                 .enableVisibility=${this.enableVisibility}
                                                 .hideLoggedIn=${!!item.hideLoggedIn}
                                                 .hideLoggedOut=${!!item.hideLoggedOut}
                                                 .hideIncludesChildNodes=${!!item.includeChildNodes}
                                                 .currentDepth=${item.depth ?? 0}
                                                 .maxDepth=${this.maxDepth}
                                                 icon="${item.icon ?? ''}"
                                                 ?unpublished=${item.published === false && item.itemType === "Document"}
                                                 @toggle-children-event=${this.#toggleNode}
                                                 @edit-node-event=${this.#toggleLinkPickerEvent}
                                                 @add-image-event=${this.#toggleMediaPickerEvent}
                                                 @toggle-itemsettings-event=${this.#toggleSettingsEvent}
                                                 @add-togglevisibility-event=${this.#toggleVisibilityEvent}
                                                 @remove-node-event=${this.#removeItem}>
                                        <umbnav-group
                                                ?nested=${true}
                                                class="${this.expandAll || item.key != null && this.expandedItems.includes(item.key) ? 'expanded' : 'collapsed'} ${this.disallowed ? 'disallowed' : ''}"
                                                .config=${this.config}
                                                .value=${item.children}
                                                .depth=${this.depth + 1}
                                                @change=${(e: Event) => {
                        item = { ...item, children: (e.target as UmbNavGroup).value };
                        this.#updateItem(item);
                    }}></umbnav-group>
                                    </umbnav-item>
                                `,
        )}

                <uui-button-group>
                    ${this.enableTextItems ? html`
                        <uui-button label=${this.localize.term('umbnav_addTextItemToggleButton')} id="AddTextButton" look="placeholder" class="add-menuitem-button"
                                    @click=${() => this.#toggleTextModal(null)}></uui-button>
                    ` : ''}
                    <uui-button label=${this.localize.term('umbnav_addLinkItemToggleButton')} id="AddLinkButton"  look="placeholder" class="add-menuitem-button"
                                @click=${() => this.#newNode()}></uui-button>
                </uui-button-group>
            </div>
        `;
    }

    static override styles = UmbNavGroupStyles;
}

export default UmbNavGroup;

declare global {
    interface HTMLElementTagNameMap {
        'umbnav-group': UmbNavGroup;
    }
}