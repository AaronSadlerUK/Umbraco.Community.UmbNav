import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import { Guid, UmbNavItemVariants } from './umbnav.token.ts';

export interface UmbNavTranslationsModalData {
    headline: string;
    key: Guid | null | undefined;
    invariantName: string;
    invariantDescription?: string | null;
    variants?: UmbNavItemVariants | null;
}

export interface UmbNavTranslationsModalValue {
    variants: UmbNavItemVariants;
}

export const UMBNAV_TRANSLATIONS_MODAL = new UmbModalToken<UmbNavTranslationsModalData, UmbNavTranslationsModalValue>(
    "umbnav.translations.modal",
    {
        modal: {
            type: 'sidebar',
            size: 'medium'
        }
    }
);
