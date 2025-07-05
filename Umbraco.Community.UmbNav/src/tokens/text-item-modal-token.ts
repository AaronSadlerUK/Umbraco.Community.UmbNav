import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import '../modals/text-item-modal-element.ts'
import {Guid, ModelEntryType} from "../tokens/umbnav.token.ts";

export interface UmbNavTextItemModalData {
    headline: string;
    name: string | null | undefined;
    key: Guid | null | undefined;
}

export const UMBNAV_TEXT_ITEM_MODAL = new UmbModalToken<UmbNavTextItemModalData, ModelEntryType>(
    "umbnav.text.item.modal",
    {
        modal: {
            type: 'sidebar',
            size: 'small'
        }
    }
);