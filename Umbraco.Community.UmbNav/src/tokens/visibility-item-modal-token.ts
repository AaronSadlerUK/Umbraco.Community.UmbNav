import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import '../modals/text-item-modal-element.ts'

export interface UmbNavVisibilityItemModalData {
    headline: string;
    hideLoggedIn: boolean;
    hideLoggedOut: boolean;
}

export type UmbNavItemVisibility = {
    hideLoggedIn: boolean;
    hideLoggedOut: boolean;
}

export const UMBNAV_VISIBILITY_ITEM_MODAL = new UmbModalToken<UmbNavVisibilityItemModalData, UmbNavItemVisibility>(
    "umbnav.visibility.item.modal",
    {
        modal: {
            type: 'sidebar',
            size: 'small'
        }
    }
);