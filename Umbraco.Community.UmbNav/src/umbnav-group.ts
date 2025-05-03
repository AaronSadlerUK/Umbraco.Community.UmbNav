import {UmbTextStyles} from '@umbraco-cms/backoffice/style';
import {css, customElement, html, LitElement, property, repeat, state} from '@umbraco-cms/backoffice/external/lit';
import {UmbElementMixin} from '@umbraco-cms/backoffice/element-api';
import {UmbSorterController} from '@umbraco-cms/backoffice/sorter';
import {UMB_LINK_PICKER_MODAL, UmbLinkPickerLink} from '@umbraco-cms/backoffice/multi-url-picker';
import {UMB_MEDIA_PICKER_MODAL} from '@umbraco-cms/backoffice/media';
import './umbnav-item.ts';
import UmbNavItem from './umbnav-item.ts';
import {UMB_MODAL_MANAGER_CONTEXT, UmbModalManagerContext,} from '@umbraco-cms/backoffice/modal';
import {v4 as uuidv4} from 'uuid';
import {UmbPropertyEditorConfigProperty, UmbPropertyValueChangeEvent} from "@umbraco-cms/backoffice/property-editor";
import {DocumentService, MediaService} from '@umbraco-cms/backoffice/external/backend-api';
import {UMBNAV_TEXT_ITEM_MODAL} from "./modals/text-item-modal-token.ts";
import {UMBNAV_VISIBILITY_ITEM_MODAL} from "./modals/visibility-item-modal-token.ts";
import {UMBNAV_SETTINGS_ITEM_MODAL} from "./modals/settings-item-modal-token.ts";
import {Guid, ImageItem, ModelEntryType} from "./umbnav.token.ts";

@customElement('umbnav-group')
export class UmbNavGroup extends UmbElementMixin(LitElement) {
    #modalContext?: UmbModalManagerContext;

    //
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
        onChange: ({model}) => {
            const oldValue = this._value;
            this._value = model;
            this.requestUpdate('value', oldValue);
            this.#dispatchChangeEvent();
        },
        onRequestMove: ({item}) => {
            if (this.maxDepth === 0) {
                return true;
            }

            if (item.children) {
                return this.depth + this.#calculateTotalDepth(item.children) <= this.maxDepth;
            }

            return this.depth <= this.maxDepth;  }
    });

    @state()
    private _value?: ModelEntryType[];

    @state()
    private expandedItems: string[] = [];

    private _expandAll: boolean = false;

    @property({type: Array})
    config: Array<UmbPropertyEditorConfigProperty> = [];

    @property({type: Boolean, reflect: true})
    nested: boolean = false;

    @property({type: Number, reflect: true})
    depth: number = 0;

    @state()
    disallowed: boolean = false;

    @state()
    public get maxDepth(): number {
        return <number>this.config?.find(item => item.alias === 'maxDepth')?.value ?? 0;
    }

    @property({type: Boolean, reflect: true})
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

    @property({type: Array, attribute: false})
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
    }

    #calculateTotalDepth(children: ModelEntryType[]): number {
        if (!children || children.length === 0) {
            return 0;
        }
        return children.reduce((total, child) => {
            return total + 1 + this.#calculateTotalDepth(child.children);
        }, 0);
    }

    removeItem = (event: CustomEvent<{ key: string }>) => {
        const {key} = event.detail;

        const removeItemRecursive = (list: any[], key: string): any[] => {
            return list.filter((item) => {
                if (item.key === key) {
                    return false;
                }
                if (item.children) {
                    item = {...item, children: removeItemRecursive(item.children, key)};
                }
                return true;
            });
        };

        this.value = removeItemRecursive(this.value, key);
        this.#dispatchChangeEvent();
    };

    // toggleNode(event: CustomEvent<{ expanded: boolean; key: string }>) {
    //     const {expanded, key} = event.detail;
    //     this.value = this.updateExpandedInNested(this.value, key, expanded);
    // }

    updateExpandedInNested(arr: ModelEntryType[], key: string, expanded: boolean) {
        return arr.map(item => {
            // If the current item's key matches, update its expanded property
            if (item.key === key) {
                return {...item, expanded: expanded};
            }

            // If the item has children, recursively search within them
            if (item.children && item.children.length > 0) {
                const updatedChildren: ModelEntryType[] = this.updateExpandedInNested(item.children, key, expanded);

                // Only return a new object if children were updated
                if (updatedChildren !== item.children) {
                    return {...item, children: updatedChildren};
                }
            }

            // Return the original item if no changes were made
            return item;
        });
    }

    toggleMediaPickerEvent(event: CustomEvent<{ key: string | null | undefined }>) {
        this.toggleMediaPicker(event.detail.key);
    }

    async toggleMediaPicker(key: string | null | undefined) {

        try {

            if (!key) return

            const umbNavItem = this.findItemByKey(key, this.value);

            if (!umbNavItem) return;

            const selectedIds = umbNavItem?.image?.map(x => x.key).filter(x => x);

            const modalHandler = this.#modalContext?.open(this, UMB_MEDIA_PICKER_MODAL, {
                data: {
                    multiple: false,
                },
                value: {
                    selection: selectedIds ? selectedIds : [],
                },
            });

            const result = await modalHandler?.onSubmit().catch(() => undefined);
            if (!modalHandler) return;
            if (!result) return;

            const convertedImages = result.selection?.map(id => this.convertToImageType(id as Guid));

            let menuItem = {
                ...umbNavItem,
                image: convertedImages
            };

            this.updateItem(menuItem);

        } catch (error) {
            console.error(error);
        }
    }

    toggleSettingsEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.toggleSettingsModal(event.detail.key);
    }

    async toggleSettingsModal(key: Guid | null | undefined) {
        let item: ModelEntryType = {
            key: key,
            name: '',
            itemType: 'title',
            icon: 'icon-tag',
            published: true,
            udi: null,
            contentKey: null,
            url: null,
            anchor: null,
            description: null,
            children: [],
            customClasses: ''
        }

        if (key != null) {
            item = this.findItemByKey(key, this.value) as ModelEntryType;
        }

        const modalHandler = this.#modalContext?.open(this, UMBNAV_SETTINGS_ITEM_MODAL, {
            data: {
                key: key,
                headline: 'Edit Menu Item',
                config: this.config,
                customCssClasses: item.customClasses ?? '',
                noOpener: item.noopener ?? '',
                noReferrer: item.noreferrer ?? ''
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler) return;
        if (!data) return;

        item = { ...item, customClasses: data.customCssClasses, noreferrer: data.noReferrer, noopener: data.noOpener };

        this.updateItem(item);
    }

    toggleVisibilityEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.toggleVisibilityModal(event.detail.key);
    }

    async toggleVisibilityModal(key: Guid | null | undefined) {
        let item: ModelEntryType = {
            key: key,
            name: '',
            itemType: 'title',
            icon: 'icon-tag',
            published: true,
            udi: null,
            contentKey: null,
            url: null,
            anchor: null,
            description: null,
            children: [],
            customClasses: '',
            hideLoggedIn: false,
            hideLoggedOut: false
        }

        if (key != null) {
            item = this.findItemByKey(key, this.value) as ModelEntryType;
        }

        const modalHandler = this.#modalContext?.open(this, UMBNAV_VISIBILITY_ITEM_MODAL, {
            data: {
                headline: 'Toggle Item Visibility',
                hideLoggedIn: item.hideLoggedIn ?? false,
                hideLoggedOut: item.hideLoggedOut ?? false
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler) return;
        if (!data) return;

        item = { ...item, hideLoggedIn: data.hideLoggedIn, hideLoggedOut: data.hideLoggedOut };

        this.updateItem(item);
    }

    toggleLinkPickerEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        if (this.value.find(item => item.key === event.detail.key && (item.itemType === "title" || item.itemType === 'nolink'))) {
            this.toggleTextModal(event.detail.key);
        } else {
            this.toggleLinkPicker(event.detail.key);
        }
    }

    async toggleTextModal(key: Guid | null | undefined) {
        let item: ModelEntryType | undefined ;
        if (key != null) {
            item = this.findItemByKey(key, this.value) as ModelEntryType;
        }

        const modalHandler = this.#modalContext?.open(this, UMBNAV_TEXT_ITEM_MODAL, {
            data: {
                key: key,
                headline: 'Add text item',
                name: item?.name ?? item?.title ?? ''
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler) return;
        if (!data) return;

        // @ts-ignore
        let menuItem: ModelEntryType = {
            ...data,
        };

        if (this.value.find(item => item.key === key)) {
            this.updateItem(menuItem);
        } else {
            menuItem.key = uuidv4() as Guid;
            this.addItem(menuItem);
        }
    }

    async toggleLinkPicker(key: Guid | null | undefined, siblingKey?: string | null | undefined) {

        try {
            let item: UmbLinkPickerLink = {
                name: '',
                url: '',
                icon: '',
                type: null,
                target: '',
                published: false,
                unique: '',
                queryString: ''
            };
            if (key != null) {
                const umbNavItem = this.findItemByKey(key, this.value);
                item = this.convertToUmbLinkPickerLink(<ModelEntryType>umbNavItem);
            }

            const modalHandler = this.#modalContext?.open(this, UMB_LINK_PICKER_MODAL, {
                data: {
                    config: {},
                    index: null,
                    isNew: item.unique == null || item.unique.length === 0,
                },
                value: {
                    link: item
                }
            });

            const result = await modalHandler?.onSubmit().catch(() => undefined);
            if (!modalHandler) return;
            if (!result?.link) return;

            let menuItem = result.link;

            if (result.link.type === "external") {
                menuItem = {
                    ...menuItem,
                    icon: "icon-link"
                };
            }

            if (result.link.type === "media") {
                let media = await this.#getMedia(result.link.unique);

                if (media != null) {
                    menuItem = {
                        ...menuItem,
                        name: menuItem.name ? menuItem.name : media.variants[0].name,
                        icon: media.mediaType.icon,
                        url: media.values.length > 0 ? (media.values[0].value as { src: string }).src : null,
                    };
                }
            }

            if (result.link.type === "document") {
                let document = await this.#getDocument(result.link.unique);

                if (document != null) {
                    menuItem = {
                        ...menuItem,
                        name: menuItem.name ? menuItem.name : document.variants[0].name,
                        icon: document.documentType.icon,
                        url: document.urls.length > 0 ? document.urls[0].url : null,
                        published: document.variants[0].state === "Published"
                    };
                }
            }

            if (result.link.type === null) {
                menuItem = {
                    ...menuItem,
                    icon: "icon-unlink"
                };
            }

            if (this.value.find(item => item.key === key)) {
                this.updateItem(this.convertToUmbNavLink(menuItem, key));
            } else {
                this.addItem(this.convertToUmbNavLink(menuItem, null), siblingKey);
            }
        } catch (error) {
            console.error(error);
        }
    }

    addItem(newItem: ModelEntryType, siblingKey?: string | null | undefined): void {
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

        this.value = newValue;
        this.#dispatchChangeEvent();
    }

    updateItem(updatedItem: ModelEntryType): void {

        let updatedValue = [...this.value]

        const index = updatedValue.findIndex(item => item.key === updatedItem.key);
        if (index !== -1) {
            updatedValue[index] = updatedItem;
        }

        this.value = updatedValue;

        this.#dispatchChangeEvent();
    }

    findItemByKey(key: string, items: ModelEntryType[]): ModelEntryType | undefined {
        for (const item of items) {
            if (item.key === key) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = this.findItemByKey(key, item.children);
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    }

    convertToUmbLinkPickerLink(item: ModelEntryType): UmbLinkPickerLink {
        return {
            name: item.name,
            url: item.url,
            icon: item.icon,
            // @ts-ignore
            type: item.itemType,
            target: item.target,
            published: item.published,
            unique: item.contentKey ?? item.key,
            queryString: item.anchor
        };
    }

    convertToUmbNavLink(item: UmbLinkPickerLink, key: Guid | null | undefined): ModelEntryType {
        const linkId = item.unique != null && item.unique.length > 0 ? item.unique as Guid : null;
        key ??= uuidv4() as Guid;
        return {
            key: key,
            name: item.name,
            url: item.url,
            icon: item.icon,
            itemType: item.type,
            target: item.target,
            published: item.published,
            udi: `umb://document/${key.replace(/-/g, '')}`,
            contentKey: linkId,
            anchor: item.queryString,
            description: item.url,
            children: []
        };
    }

    convertToImageType(image: Guid): ImageItem {
        return {
            key: image,
            udi: `umb://media/${image.replace(/-/g, '')}`,
        };
    }

    #dispatchChangeEvent() {
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    newNode(siblingKey?: string | null | undefined): void {
        this.toggleLinkPicker(null, siblingKey);
        this.requestUpdate();
    }

    async #getDocument(entityKey: string | undefined | null) {
        if (!entityKey) return;
        // Should this be done here or in the action file?
        const data = await DocumentService.getDocumentById({id: entityKey});
        if (!data) return;
        //TODO How do we ensure we get the correct variant?
        return data;

    }

    async #getMedia(entityKey: string | undefined | null) {
        if (!entityKey) return;
        // Should this be done here or in the action file?
        const data = await MediaService.getMediaById({id: entityKey});
        if (!data) return;
        //TODO How do we ensure we get the correct variant?
        return data;

    }

    firstUpdated() {
        this.style.setProperty('interpolate-size', 'allow-keywords');
    }

    toggleNode(event: CustomEvent<{ key: string }>): void {
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

    override render() {
        return html`
            <div class="umbnav-container ${this.nested ? 'margin-left' : ''}">
                ${repeat(
                        this.value,
                        // Note: ideally you have an unique identifier for each item, but for this example we use the `name` as identifier.
                        (item) => item.key,
                        (item) =>
                                html`
                                    <uui-button-inline-create
                                            @click=${() => this.newNode(item.key)}></uui-button-inline-create>
                                    <umbnav-item name=${item.name ?? item.title ?? '' } key="${item.key ?? '' }" class=""
                                                 description="${item.description ?? '' }"
                                                 .expanded=${ this._expandAll || item.key != null && this.expandedItems.includes(item.key)}
                                                 .hasImage=${Boolean(item.image?.length)}
                                                 .enableMediaPicker=${this.enableMediaPicker}
                                                 .enableVisibility=${this.enableVisibility}
                                                 .hideLoggedIn=${!!item.hideLoggedIn}
                                                 .hideLoggedOut=${!!item.hideLoggedOut}
                                                 icon="${item.icon ?? '' }"
                                                 ?unpublished=${!item.published && item.itemType === "document"}
                                                 @toggle-children-event=${this.toggleNode}
                                                 @edit-node-event=${this.toggleLinkPickerEvent}
                                                 @add-image-event=${this.toggleMediaPickerEvent}
                                                 @toggle-itemsettings-event=${this.toggleSettingsEvent}
                                                 @add-togglevisibility-event=${this.toggleVisibilityEvent}
                                                 @remove-node-event=${this.removeItem}>
                                        <umbnav-group
                                                ?nested=${true}
                                                class="${this.expandAll || item.key != null && this.expandedItems.includes(item.key) ? 'expanded' : 'collapsed'} ${this.disallowed ? 'disallowed' : ''}"
                                                .config=${this.config}
                                                .value=${item.children}
                                                .depth=${this.depth + 1}
                                                @change=${(e: Event) => {
                                                    item = {...item, children: (e.target as UmbNavGroup).value};
                                                    this.updateItem(item);
                                                }}></umbnav-group>
                                    </umbnav-item>
                                `,
                )}

                <uui-button-group>
                    ${this.enableTextItems ? html`
                        <uui-button label="Add Text Item" look="placeholder" class="add-menuitem-button"
                                    @click=${() => this.toggleTextModal(null)}></uui-button>
                    ` : ''}
                    <uui-button label="Add Link Item" look="placeholder" class="add-menuitem-button"
                                @click=${() => this.newNode()}></uui-button>
                </uui-button-group>
            </div>
        `;
    }

    static override styles = [
        UmbTextStyles,
        css`
            :root {
                interpolate-size: allow-keywords;
            }

            :host {
                display: flex;
                flex-direction: column;
                width: 100%;
                border-radius: calc(var(--uui-border-radius) * 2);
            }

            .umbnav-container {
                display: grid;
                gap: 1px;
            }

            //*********** */

            umbnav-group {
                outline: 1px solid red;
            }

            .collapsed {
                //display: none;
                block-size: 0;
                overflow: clip;
                visibility: hidden;
                opacity: 0;
                transition: block-size 0.5s ease, visibility 0.5s ease, opacity 0.5s ease;
            }

            .expanded {
                display: flex;
                block-size: auto;
                visibility: visible;
                opacity: 1;
                transition: block-size 0.5s ease, visibility 0.5s ease, opacity 0.5s ease;
            }

            .margin-left {
                margin-left: var(--uui-size-space-5);
            }

            .add-menuitem-button {
                padding-top: 1px;
                padding-bottom: 3px;
            }

            .disallowed {
                cursor: not-allowed;
                background: red;
            }

            :host([disallow-drop])::before {
                content: '';
                position: absolute;
                z-index: 1;
                inset: 0;
                border: 2px solid var(--uui-color-danger);
                border-radius: calc(var(--uui-border-radius) * 2);
                pointer-events: none;
            }

            :host([disallow-drop])::after {
                content: '';
                position: absolute;
                z-index: 1;
                inset: 0;
                border-radius: calc(var(--uui-border-radius) * 2);
                background-color: var(--uui-color-danger);
                opacity: 0.2;
                pointer-events: none;
            }
        `,
    ];
}

export default UmbNavGroup;

declare global {
    interface HTMLElementTagNameMap {
        'umbnav-group': UmbNavGroup;
    }
}