import { UmbNavGroupStyles } from './umbnav-group.styles.ts';
import { findItemByKey, convertToUmbLinkPickerLink, convertToUmbNavLink, convertToImageType, setItemDepths } from '../../umbnav-utils.ts';
import { openTextModal, openSettingsModal, openVisibilityModal } from './umbnav-group.modals.ts';
import { getDocument, getMedia } from './umbnav-group.data.ts';
import { customElement, html, LitElement, property, repeat, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_LINK_PICKER_MODAL, UmbLinkPickerLink } from '@umbraco-cms/backoffice/multi-url-picker';
import { UMB_MEDIA_PICKER_MODAL, UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import '../umbnav-item/umbnav-item.ts';
import UmbNavItem from '../umbnav-item/umbnav-item.ts';
import { UMB_MODAL_MANAGER_CONTEXT, UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';
import { UmbPropertyEditorConfigProperty } from "@umbraco-cms/backoffice/property-editor";
import { Guid, ModelEntryType } from "../../tokens/umbnav.token.ts";
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbSorterController } from "@umbraco-cms/backoffice/sorter";
import { UmbDocumentUrlRepository, UmbDocumentUrlsDataResolver } from '@umbraco-cms/backoffice/document';
import { UmbNavExtensionRegistry } from '../../extensions/extension-registry.js';
import type { UmbNavItemTypeRegistration } from '../../extensions/extension-types.js';
import { v4 as uuidv4 } from 'uuid';

@customElement('umbnav-group')
export class UmbNavGroup extends UmbElementMixin(LitElement) {
    #modalContext?: UmbModalManagerContext;

    #documentUrlRepository = new UmbDocumentUrlRepository(this);
    #documentUrlsDataResolver = new UmbDocumentUrlsDataResolver(this);
    #mediaUrlRepository = new UmbMediaUrlRepository(this);

    // Sorter setup - following Umbraco's example pattern
    #sorter = new UmbSorterController<ModelEntryType, UmbNavItem>(this, {
        getUniqueOfElement: (element) => element.key,
        getUniqueOfModel: (modelEntry) => modelEntry.key,
        identifier: 'umbnav-identifier',
        itemSelector: 'umbnav-item',
        containerSelector: '.umbnav-container',
        onChange: ({ model }) => {
            const oldValue = this._value;
            this._value = model;
            this.requestUpdate('value', oldValue);
            this.dispatchEvent(new CustomEvent('change'));
        },
    });

    @property({ type: Array, attribute: false })
    public get value(): ModelEntryType[] {
        return this._value ?? [];
    }
    public set value(value: ModelEntryType[]) {
        const oldValue = this._value;
        this._value = value;
        this.#sorter.setModel(this._value);
        this.requestUpdate('value', oldValue);
        if (!this.nested) {
            this.#resolveUrlsForDisplay(this._value);
        }
    }
    private _value?: ModelEntryType[];

    @state()
    private expandedItems: string[] = [];

    @state()
    private _resolvedUrls: Map<string, string> = new Map();

    @state()
    private _customItemTypes: UmbNavItemTypeRegistration[] = [];

    private _unsubscribeRegistry?: () => void;

    private _expandAll: boolean = false;

    @property({ type: Array, attribute: false })
    config: UmbPropertyEditorConfigProperty[] = [];

    @property({ type: Boolean, reflect: true })
    nested: boolean = false;

    @property({ type: Number, reflect: true })
    depth: number = 0;

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
        this.dispatchEvent(new CustomEvent<{ expandAll: boolean }>('toggle-expandall-event', {
            detail: { expandAll: this._expandAll },
        }));
    }

    public get maxDepth(): number {
        return <number>this.config?.find(item => item.alias === 'maxDepth')?.value ?? 0;
    }

    public get enableTextItems(): boolean {
        return <boolean>this.config.find(item => item.alias === 'enableTextItems')?.value ?? false;
    }

    public get enableMediaPicker(): boolean {
        return <boolean>this.config?.find(item => item.alias === 'allowImageIcon')?.value ?? false;
    }

    public get enableVisibility(): boolean {
        return <boolean>this.config?.find(item => item.alias === 'allowDisplay')?.value ?? false;
    }

    public get enableDescription(): boolean {
        return <boolean>this.config?.find(item => item.alias === 'allowDescription')?.value ?? false;
    }

    constructor() {
        super();
        this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (_instance) => {
            this.#modalContext = _instance;
        });
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._customItemTypes = UmbNavExtensionRegistry.getItemTypes();
        this._unsubscribeRegistry = UmbNavExtensionRegistry.onChange(() => {
            this._customItemTypes = UmbNavExtensionRegistry.getItemTypes();
        });
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._unsubscribeRegistry?.();
    }

    async #resolveUrlsForDisplay(items: ModelEntryType[]) {
        if (!items?.length) return;
        for (const item of items) {
            if (item.key && item.contentKey) {
                if (item.itemType === 'Document') {
                    const url = await this.#getUrlForDocument(item.contentKey as string);
                    if (url) {
                        this._resolvedUrls = new Map(this._resolvedUrls).set(item.key, url);
                    }
                } else if (item.itemType === 'Media') {
                    const url = await this.#getUrlForMedia(item.contentKey as string);
                    if (url) {
                        this._resolvedUrls = new Map(this._resolvedUrls).set(item.key, url);
                    }
                }
            }
            if (item.children?.length) {
                this.#resolveUrlsForDisplay(item.children);
            }
        }
    }

    async #getUrlForDocument(unique: string) {
        const { data } = await this.#documentUrlRepository.requestItems([unique]);
        const urlsItem = data?.[0];
        this.#documentUrlsDataResolver.setData(urlsItem?.urls);
        const resolvedUrls = await this.#documentUrlsDataResolver.getUrls();
        return resolvedUrls?.[0]?.url ?? '';
    }

    async #getUrlForMedia(unique: string) {
        const { data } = await this.#mediaUrlRepository.requestItems([unique]);
        return data?.[0]?.url ?? '';
    }

    removeItem = (event: CustomEvent<{ key: string }>) => {
        const { key } = event.detail;
        this.value = this.value.filter((item) => item.key !== key);
        this.#dispatchChangeEvent();
    };

    #toggleNode(event: CustomEvent<{ key: string }>): void {
        if (this._expandAll) {
            this.expandAll = false;
        }

        if (!this.expandedItems.includes(event.detail.key)) {
            this.expandedItems = [...this.expandedItems, event.detail.key];
        } else {
            this.expandedItems = this.expandedItems.filter(key => key !== event.detail.key);
        }
    }

    #getDescriptionText(item: ModelEntryType): string {
        return item.description ?? '';
    }

    #getUrlText(item: ModelEntryType): string {
        // For Document/Media items, use resolved URL from map (don't show until resolved)
        if (item.key && (item.itemType === 'Document' || item.itemType === 'Media')) {
            const resolvedUrl = this._resolvedUrls.get(item.key);
            return resolvedUrl ? `${resolvedUrl}${item.anchor ?? ''}` : '';
        }
        // For external links, use stored url
        const urlText = item.url ?? '';
        const anchorText = item.anchor ?? '';
        return `${urlText}${anchorText}`;
    }

    #dispatchChangeEvent() {
        this.dispatchEvent(new UmbChangeEvent());
    }

    #newNode(siblingKey?: string | null | undefined): void {
        this.#toggleLinkPicker(null, siblingKey);
    }

    // Modal/Picker Event Handlers
    #toggleLinkPickerEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        const item = this.value.find(i => i.key === event.detail.key);
        if (item && (item.itemType === "title" || item.itemType === 'nolink')) {
            this.#toggleTextModal(event.detail.key);
        } else {
            this.#toggleLinkPicker(event.detail.key);
        }
    }

    #toggleMediaPickerEvent(event: CustomEvent<{ key: string | null | undefined }>) {
        this.#toggleMediaPicker(event.detail.key);
    }

    #toggleSettingsEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.#toggleSettingsModal(event.detail.key);
    }

    #toggleVisibilityEvent(event: CustomEvent<{ key: Guid | null | undefined }>) {
        this.#toggleVisibilityModal(event.detail.key);
    }

    // Modal/Picker Methods
    async #toggleTextModal(key: Guid | null | undefined) {
        try {
            const menuItem = await openTextModal(this.#modalContext, key, this.value, this);
            if (!menuItem) return;

            const existing = this.value.find(item => item.key === key);
            if (existing) {
                const merged = { ...menuItem, children: existing.children ?? [] };
                this.#updateItem(merged);
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

            if (menuItem.type === "external") menuItem = { ...menuItem, icon: "icon-link" };
            if (menuItem.type === "media") menuItem = await this.#handleMediaLink(menuItem);
            if (menuItem.type === "document") menuItem = await this.#handleDocumentLink(menuItem);
            if (menuItem.type === null) menuItem = { ...menuItem, icon: "icon-unlink" };

            const existing = this.value.find(item => item.key === key);
            if (existing) {
                const updated = await convertToUmbNavLink(this, menuItem, key, this.value);
                const merged = { ...updated, children: existing.children ?? [] };
                this.#updateItem(merged);
            } else {
                this.#addItem(await convertToUmbNavLink(this, menuItem, null, this.value), siblingKey);
            }
        } catch (error) {
            console.error('Error in #toggleLinkPicker:', error);
        }
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

            const convertedImages = result.selection?.map(id => convertToImageType(id as Guid));
            const menuItem = { ...umbNavItem, image: convertedImages };
            this.#updateItem(menuItem);
        } catch (error) {
            console.error('Error in #toggleMediaPicker:', error);
        }
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

    async #handleMediaLink(menuItem: UmbLinkPickerLink) {
        const media = await getMedia(this, menuItem.unique);
        if (media) {
            return {
                ...menuItem,
                name: menuItem.name || media.variants[0].name,
                icon: media.mediaType.icon,
            };
        }
        return menuItem;
    }

    async #handleDocumentLink(menuItem: UmbLinkPickerLink) {
        const document = await getDocument(this, menuItem.unique);
        if (document && menuItem.unique) {
            return {
                ...menuItem,
                name: menuItem.name || document.variants[0].name,
                icon: document.documentType.icon,
                published: document.variants[0].state === "Published"
            };
        }
        return menuItem;
    }

    #addCustomTypeItem(registration: UmbNavItemTypeRegistration): void {
        const defaults = registration.defaultValues ?? {};
        const newItem: ModelEntryType = {
            key: uuidv4() as Guid,
            name: defaults.name ?? registration.label,
            icon: defaults.icon ?? registration.icon,
            itemType: defaults.itemType ?? 'Title',
            url: defaults.url ?? null,
            udi: defaults.udi ?? null,
            contentKey: defaults.contentKey ?? null,
            anchor: defaults.anchor ?? null,
            published: defaults.published ?? null,
            target: defaults.target ?? null,
            customClasses: defaults.customClasses ?? null,
            description: defaults.description ?? null,
            hideLoggedIn: defaults.hideLoggedIn ?? false,
            hideLoggedOut: defaults.hideLoggedOut ?? false,
            includeChildNodes: defaults.includeChildNodes ?? false,
            noopener: defaults.noopener ?? null,
            noreferrer: defaults.noreferrer ?? null,
            image: defaults.image ?? [],
            children: [],
            allowChildren: registration.allowChildren
        };
        this.#addItem(newItem);
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
        const updatedValue = this.value.map(item => {
            if (item.key === updatedItem.key) {
                const children = Object.prototype.hasOwnProperty.call(updatedItem, 'children')
                    ? updatedItem.children
                    : item.children;
                return { ...item, ...updatedItem, children };
            }
            return item;
        });
        this.value = setItemDepths(updatedValue);
        this.#dispatchChangeEvent();
    }

    /**
     * Handle item update events from extensions.
     */
    #handleItemUpdate(event: CustomEvent<{ item: ModelEntryType }>): void {
        this.#updateItem(event.detail.item);
    }

    /**
     * Handle modal open requests from extensions.
     */
    async #handleOpenModal(event: CustomEvent<{ token: unknown; data: unknown; resolve: (value: unknown) => void }>): Promise<void> {
        const { token, data, resolve } = event.detail;
        try {
            const modalHandler = this.#modalContext?.open(this, token as any, { data } as any);
            const result = await modalHandler?.onSubmit().catch(() => undefined);
            resolve(result);
        } catch (error) {
            console.error('Error opening modal:', error);
            resolve(undefined);
        }
    }

    override render() {
        return html`
            <div class="umbnav-container ${this.nested ? 'margin-left' : ''}">
                ${repeat(
                    this.value,
                    (item) => item.key,
                    (item) => html`
                        <uui-button-inline-create @click=${() => this.#newNode(item.key)}></uui-button-inline-create>
                        <umbnav-item
                            name=${item.name ?? item.title ?? ''}
                            key="${item.key ?? ''}"
                            description="${this.#getDescriptionText(item)}"
                            url="${this.#getUrlText(item)}"
                            .expanded=${item.allowChildren !== false && (this._expandAll || (item.key != null && this.expandedItems.includes(item.key)))}
                            .hasImage=${Boolean(item.image?.length)}
                            .enableMediaPicker=${this.enableMediaPicker}
                            .enableVisibility=${this.enableVisibility}
                            .enableDescription=${this.enableDescription}
                            .hideLoggedIn=${!!item.hideLoggedIn}
                            .hideLoggedOut=${!!item.hideLoggedOut}
                            .hideIncludesChildNodes=${!!item.includeChildNodes}
                            .currentDepth=${item.depth ?? 0}
                            .maxDepth=${this.maxDepth}
                            .allowChildren=${item.allowChildren !== false}
                            .itemData=${item}
                            .config=${this.config}
                            icon="${item.icon ?? ''}"
                            ?unpublished=${item.published === false && item.itemType === "Document"}
                            @toggle-children-event=${this.#toggleNode}
                            @edit-node-event=${this.#toggleLinkPickerEvent}
                            @add-image-event=${this.#toggleMediaPickerEvent}
                            @toggle-itemsettings-event=${this.#toggleSettingsEvent}
                            @add-togglevisibility-event=${this.#toggleVisibilityEvent}
                            @remove-node-event=${this.removeItem}
                            @umbnav-item-update=${this.#handleItemUpdate}
                            @umbnav-open-modal=${this.#handleOpenModal}
                        >
                            <umbnav-group
                                ?nested=${true}
                                class="${item.allowChildren !== false && (this.expandAll || (item.key != null && this.expandedItems.includes(item.key))) ? 'expanded' : 'collapsed'}"
                                .config=${this.config}
                                .value=${item.children ?? []}
                                .depth=${this.depth + 1}
                                @change=${(e: Event) => {
                                    const newChildren = (e.target as UmbNavGroup).value;
                                    this.#updateItem({ ...item, children: newChildren });
                                }}
                            ></umbnav-group>
                        </umbnav-item>
                    `
                )}
                <uui-button-group>
                    ${this.enableTextItems
                        ? html`<uui-button label=${this.localize.term('umbnav_addTextItemToggleButton')} id="AddTextButton" look="placeholder" class="add-menuitem-button" @click=${() => this.#toggleTextModal(null)}></uui-button>`
                        : ''}
                    <uui-button label=${this.localize.term('umbnav_addLinkItemToggleButton')} id="AddLinkButton" look="placeholder" class="add-menuitem-button" @click=${() => this.#newNode()}></uui-button>
                    ${this._customItemTypes.map(
                        (itemType) => html`<uui-button label=${itemType.label} look="placeholder" class="add-menuitem-button" @click=${() => this.#addCustomTypeItem(itemType)}></uui-button>`
                    )}
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
