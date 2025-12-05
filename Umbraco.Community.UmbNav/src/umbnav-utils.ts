import { ModelEntryType, Guid, ImageItem } from "./tokens/umbnav.token";
import { UmbLinkPickerLink } from '@umbraco-cms/backoffice/multi-url-picker';
import { v4 as uuidv4 } from 'uuid';
import { getDocument, getMedia } from "./components/umbnav-group/umbnav-group.data";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { DocumentVariantStateModel } from "@umbraco-cms/backoffice/external/backend-api";

// Recursively calculate the total depth of children
export function calculateTotalDepth(children: ModelEntryType[]): number {
    if (!children || children.length === 0) {
        return 0;
    }
    return children.reduce((total, child) => {
        return total + 1 + calculateTotalDepth(child.children);
    }, 0);
}

// Recursively find an item by key
export function findItemByKey(key: string, items: ModelEntryType[]): ModelEntryType | undefined {
    for (const item of items) {
        if (item.key === key) {
            return item;
        }
        if (item.children && item.children.length > 0) {
            const found = findItemByKey(key, item.children);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

// Convert ModelEntryType to UmbLinkPickerLink
export async function convertToUmbLinkPickerLink(context: UmbControllerHost, item: ModelEntryType): Promise<UmbLinkPickerLink> {
    try {
        
        let menuItemName = null;
        let isPublished = false;

        switch (item.itemType) {
            case 'document':
                const document = await getDocument(context, item.contentKey ?? item.key);
                let documentVariant = document?.variants?.[0];
                const documentName = documentVariant?.name ?? null;
                isPublished = documentVariant?.state != DocumentVariantStateModel.DRAFT
                if (documentName !== item.name) {
                    menuItemName = item.name;
                }else{
                    menuItemName = documentName;
                }
                break;
            case 'media':
                const media = await getMedia(context, item.contentKey ?? item.key);
                const mediaName = media?.variants?.[0]?.name ?? null;
                if (mediaName !== item.name) {
                    menuItemName = item.name;
                }else{
                    menuItemName = mediaName;
                }
                break;
        }

        return {
            name: menuItemName,
            url: item.url,
            icon: item.icon,
            // @ts-ignore
            type: item.itemType,
            target: item.target,
            published: isPublished,
            unique: item.contentKey ?? item.key,
            queryString: item.anchor
        };
    } catch (error) {
        console.error('Error in convertToUmbLinkPickerLink:', error);
        // Return a safe fallback
        return {
            name: '',
            url: '',
            icon: '',
            type: null,
            target: '',
            published: false,
            unique: '',
            queryString: ''
        };
    }
}

// Convert UmbLinkPickerLink to ModelEntryType
export async function convertToUmbNavLink(
    context: UmbControllerHost,
    item: UmbLinkPickerLink,
    key: Guid | null | undefined,
    value: ModelEntryType[]
): Promise<ModelEntryType> {
    try {
        let menuItem;
        if (value) {
            menuItem = value.find(i => i.key === key);
         }
        
        const linkId = item.unique != null && item.unique.length > 0 ? item.unique as Guid : null;

        let menuItemName = item.name;
        let isPublished = false;

        switch (item.type) {
            case 'document':
                const document = await getDocument(context, item.unique);
                let documentVariant = document?.variants?.[0];
                const documentName = documentVariant?.name ?? null;
                isPublished = documentVariant?.state != DocumentVariantStateModel.DRAFT
                if (documentName !== item.name) {
                    menuItemName = item.name;
                }
                break;
            case 'media':
                const media = await getMedia(context, item.unique);
                const mediaName = media?.variants?.[0]?.name ?? null;
                if (mediaName !== item.name) {
                    menuItemName = item.name;
                    isPublished = true
                }
                break;
        }

        key ??= uuidv4() as Guid;
        return {
            key: key,
            name: menuItemName,
            url: item.url,
            icon: item.icon,
            itemType: item.type,
            target: item.target,
            published: isPublished,
            // @ts-ignore
            udi: item.type === 'external' ? '' : `umb://${item.type}/${key.replace(/-/g, '')}`,
            contentKey: linkId,
            anchor: item.queryString,
            description: item.url,
            customClasses: menuItem?.customClasses ?? '',
            hideLoggedIn: menuItem?.hideLoggedIn ?? false,
            hideLoggedOut: menuItem?.hideLoggedOut ?? false,
            noreferrer: menuItem?.noreferrer ?? '',
            noopener: menuItem?.noopener ?? '',
            image: menuItem?.image?.map(image => convertToImageType(image.key)) ?? [],
            children: menuItem?.children ?? []
        };
    } catch (error) {
        console.error('Error in convertToUmbNavLink:', error);
        // Return a safe fallback
        return {
            key: key ?? (uuidv4() as Guid),
            name: '',
            url: '',
            icon: '',
            itemType: null,
            target: '',
            published: false,
            udi: '',
            contentKey: null,
            anchor: '',
            description: '',
            customClasses: '',
            hideLoggedIn: false,
            hideLoggedOut: false,
            noreferrer: '',
            noopener: '',
            image: [],
            children: []
        };
    }
}

// Convert a GUID to an ImageItem
export function convertToImageType(image: Guid): ImageItem {
    try {
        return {
            key: image,
            udi: `umb://media/${image.replace(/-/g, '')}`,
        };
    } catch (error) {
        console.error('Error in convertToImageType:', error);
        return {
            key: image,
            udi: '',
        };
    }
}

export function ensureNavItemKeys(value: ModelEntryType[]): ModelEntryType[] {
    return value.map(item => ({
        ...item,
        key: item.key ?? (uuidv4() as Guid),
        unique: item.udi != null && (item.udi.startsWith('umb://document/') || item.udi.startsWith('umb://media/')) ? item.key : undefined,
        itemType: item.udi != null && item.udi.startsWith('umb://document/') ? 'document' : item.itemType
    }));
}

export function setItemDepths(items: ModelEntryType[], currentDepth = 1): ModelEntryType[] {
    return items.map(item => ({
        ...item,
        depth: currentDepth,
        children: item.children ? setItemDepths(item.children, currentDepth + 1) : []
    }));
}