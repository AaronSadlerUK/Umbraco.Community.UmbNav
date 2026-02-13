import { UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';
import { UMBNAV_TEXT_ITEM_MODAL } from '../../tokens/text-item-modal-token.ts';
import { UMBNAV_VISIBILITY_ITEM_MODAL } from '../../tokens/visibility-item-modal-token.ts';
import { UMBNAV_SETTINGS_ITEM_MODAL } from '../../tokens/settings-item-modal-token.ts';
import { UMBNAV_TRANSLATIONS_MODAL } from '../../tokens/translations-item-modal-token.ts';
import { Guid, ModelEntryType } from '../../tokens/umbnav.token.ts';
import { v4 as uuidv4 } from 'uuid';
import { findItemByKey } from '../../umbnav-utils.ts';
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbLocalizationController } from '@umbraco-cms/backoffice/localization-api';

export async function openTextModal(
    modalContext: UmbModalManagerContext | undefined,
    key: Guid | null | undefined,
    value: ModelEntryType[],
    host: UmbControllerHost
): Promise<ModelEntryType | undefined> {
    try {
        let localize = new UmbLocalizationController(host);
        let item: ModelEntryType | undefined;
        if (key != null) {
            item = findItemByKey(key, value) as ModelEntryType;
        }

        const modalHandler = modalContext?.open(host, UMBNAV_TEXT_ITEM_MODAL, {
            data: {
                key: key,
                headline: localize.term('umbnav_addTextItemModalHeadline'),
                name: item?.name ?? item?.title ?? ''
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        // @ts-ignore
        let menuItem: ModelEntryType = { ...data };
        if (Array.isArray(value) && value && value.find(item => item.key === key)) {
            return menuItem;
        } else {
            menuItem.key = uuidv4() as Guid;
            return menuItem;
        }
    } catch (error) {
        console.error('Error in openTextModal:', error);
        return;
    }
}

export async function openSettingsModal(
    modalContext: UmbModalManagerContext | undefined,
    key: Guid | null | undefined,
    value: ModelEntryType[],
    config: any[],
    host: UmbControllerHost
): Promise<ModelEntryType | undefined> {
    try {
        let localize = new UmbLocalizationController(host);
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
        };

        if (key != null) {
            item = findItemByKey(key, value) as ModelEntryType;
        }

        const modalHandler = modalContext?.open(host, UMBNAV_SETTINGS_ITEM_MODAL, {
            data: {
                key: key,
                headline: localize.term('umbnav_editMenuItemModalHeadline'),
                config: config,
                customCssClasses: item.customClasses ?? '',
                noopener: item.noopener ?? '',
                noreferrer: item.noreferrer ?? '',
                includeChildNodes: item.includeChildNodes ?? false,
                itemType: item.itemType ?? '',
                description: item.description ?? null
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        return { ...item, customClasses: data.customCssClasses, description: data.description, noreferrer: data.noreferrer, noopener: data.noopener, includeChildNodes: data.includeChildNodes };
    } catch (error) {
        console.error('Error in openSettingsModal:', error);
        return;
    }
}

export async function openVisibilityModal(
    modalContext: UmbModalManagerContext | undefined,
    key: Guid | null | undefined,
    value: ModelEntryType[],
    host: UmbControllerHost
): Promise<ModelEntryType | undefined> {
    try {
        let localize = new UmbLocalizationController(host);
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
            hideLoggedOut: false,
            noopener: '',
            noreferrer: ''
        };

        if (key != null) {
            item = findItemByKey(key, value) as ModelEntryType;
        }

        const modalHandler = modalContext?.open(host, UMBNAV_VISIBILITY_ITEM_MODAL, {
            data: {
                headline: localize.term('umbnav_toggleItemModalVisibilityHeadline'),
                hideLoggedIn: item.hideLoggedIn ?? false,
                hideLoggedOut: item.hideLoggedOut ?? false
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        return { ...item, hideLoggedIn: data.hideLoggedIn, hideLoggedOut: data.hideLoggedOut };
    } catch (error) {
        console.error('Error in openVisibilityModal:', error);
        return;
    }
}

export async function openTranslationsModal(
    modalContext: UmbModalManagerContext | undefined,
    key: Guid | null | undefined,
    value: ModelEntryType[],
    host: UmbControllerHost
): Promise<ModelEntryType | undefined> {
    try {
        if (!key) return;

        let localize = new UmbLocalizationController(host);
        let item: ModelEntryType | undefined = findItemByKey(key, value);
        if (!item) return;

        const modalHandler = modalContext?.open(host, UMBNAV_TRANSLATIONS_MODAL, {
            data: {
                key: key,
                headline: localize.term('umbnav_translationsModalHeadline'),
                invariantName: item.name ?? '',
                invariantDescription: item.description ?? null,
                variants: item.variants ?? null
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        return { ...item, variants: data.variants };
    } catch (error) {
        console.error('Error in openTranslationsModal:', error);
        return;
    }
}