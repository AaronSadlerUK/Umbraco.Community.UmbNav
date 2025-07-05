import { UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';
import { UMBNAV_TEXT_ITEM_MODAL } from '../../tokens/text-item-modal-token.ts';
import { UMBNAV_VISIBILITY_ITEM_MODAL } from '../../tokens/visibility-item-modal-token.ts';
import { UMBNAV_SETTINGS_ITEM_MODAL } from '../../tokens/settings-item-modal-token.ts';
import { Guid, ModelEntryType } from '../../tokens/umbnav.token.ts';
import { v4 as uuidv4 } from 'uuid';
import { findItemByKey } from '../../umbnav-utils.ts';
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export async function openTextModal(
    modalContext: UmbModalManagerContext | undefined,
    key: Guid | null | undefined,
    value: ModelEntryType[],
    host: UmbControllerHost
): Promise<ModelEntryType | undefined> {
    try {
        let item: ModelEntryType | undefined;
        if (key != null) {
            item = findItemByKey(key, value) as ModelEntryType;
        }

        const modalHandler = modalContext?.open(host, UMBNAV_TEXT_ITEM_MODAL, {
            data: {
                key: key,
                headline: 'Add text item',
                name: item?.name ?? item?.title ?? ''
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        // @ts-ignore
        let menuItem: ModelEntryType = { ...data };
        if (value.find(item => item.key === key)) {
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
                headline: 'Edit Menu Item',
                config: config,
                customCssClasses: item.customClasses ?? '',
                noopener: item.noopener ?? '',
                noreferrer: item.noreferrer ?? ''
            }
        });

        const data = await modalHandler?.onSubmit().catch(() => undefined);
        if (!modalHandler || !data) return;

        return { ...item, customClasses: data.customCssClasses, noreferrer: data.noReferrer, noopener: data.noOpener };
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
                headline: 'Toggle Item Visibility',
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