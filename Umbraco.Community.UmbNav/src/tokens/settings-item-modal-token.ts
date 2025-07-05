import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import '../modals/text-item-modal-element'
import { UmbPropertyEditorConfigProperty } from "@umbraco-cms/backoffice/property-editor";

export interface UmbNavSettingsItemModalData {
    headline: string;
    config: Array<UmbPropertyEditorConfigProperty>;
    customCssClasses: string | null | undefined;
    noreferrer: string | null | undefined;
    noopener: string | null | undefined;
    key: string | null | undefined;
    includeChildNodes: boolean | null | undefined;
    itemType: string | null | undefined;
}

export type UmbNavSettingsItem = {
    customCssClasses: string | null | undefined;
    noreferrer: string | null | undefined;
    noopener: string | null | undefined;
    includeChildNodes: boolean | null | undefined;
}

export const UMBNAV_SETTINGS_ITEM_MODAL = new UmbModalToken<UmbNavSettingsItemModalData, UmbNavSettingsItem>(
    "umbnav.settings.item.modal",
    {
        modal: {
            type: 'sidebar',
            size: 'small'
        }
    }
);