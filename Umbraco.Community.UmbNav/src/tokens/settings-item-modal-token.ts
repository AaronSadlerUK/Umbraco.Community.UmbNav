import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import '../modals/text-item-modal-element'
import { UmbPropertyEditorConfigProperty } from "@umbraco-cms/backoffice/property-editor";

export interface UmbNavSettingsItemModalData {
    headline: string;
    config: Array<UmbPropertyEditorConfigProperty>;
    customCssClasses: string | null | undefined;
    noReferrer: string | null | undefined;
    noOpener: string | null | undefined;
    key: string | null | undefined;
}

export type UmbNavSettingsItem = {
    customCssClasses: string | null | undefined;
    noReferrer: string | null | undefined;
    noOpener: string | null | undefined;
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