import { ModelEntryType, Guid, ImageItem, UmbNavLinkPickerLinkType } from "./tokens/umbnav.token";
import { UmbLinkPickerLink } from '@umbraco-cms/backoffice/multi-url-picker';
import { v4 as uuidv4 } from 'uuid';
import { getDocument, getMedia } from "./components/umbnav-group/umbnav-group.data";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { PublishableVariantStateModel } from "@umbraco-cms/backoffice/external/backend-api";

// Recursively calculate the total depth of children (sum of all levels)
export function calculateTotalDepth(children: ModelEntryType[]): number {
    if (!children || children.length === 0) {
        return 0;
    }
    return children.reduce((total, child) => {
        return total + 1 + calculateTotalDepth(child.children);
    }, 0);
}

// Calculate the maximum depth level that children reach (for depth validation)
export function calculateMaxChildDepth(children: ModelEntryType[]): number {
    if (!children || children.length === 0) {
        return 0;
    }
    let maxDepth = 0;
    for (const child of children) {
        const childDepth = 1 + calculateMaxChildDepth(child.children);
        if (childDepth > maxDepth) {
            maxDepth = childDepth;
        }
    }
    return maxDepth;
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
        let itemType = null;
        let unique = undefined;
        switch (item.itemType) {
            case 'Document':
                const document = await getDocument(context, item.contentKey);
                unique = item.contentKey;
                let documentVariant = document?.variants?.[0];
                const documentName = documentVariant?.name ?? null;
                isPublished = documentVariant?.state != PublishableVariantStateModel.DRAFT
                if (documentName !== item.name) {
                    menuItemName = item.name;
                }else{
                    menuItemName = documentName;
                }
                itemType = 'document';
                break;
            case 'Media':
                const media = await getMedia(context, item.contentKey);
                const mediaName = media?.variants?.[0]?.name ?? null;                
                unique = item.contentKey;
                if (mediaName !== item.name) {
                    menuItemName = item.name;
                }else{
                    menuItemName = mediaName;
                }
                itemType = 'media';
                break;
            case 'External':
                menuItemName = item.name;
                itemType = 'external';
                break;
        }

        return {
            name: menuItemName,
            url: item.url,
            icon: item.icon,
            // @ts-ignore
            type: itemType,
            target: item.target,
            published: isPublished,
            unique: unique,
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
        let itemType: UmbNavLinkPickerLinkType = 'Title';
        switch (item.type) {
            case 'document':
                const document = await getDocument(context, item.unique);
                itemType = 'Document';
                let documentVariant = document?.variants?.[0];
                const documentName = documentVariant?.name ?? null;
                isPublished = documentVariant?.state != PublishableVariantStateModel.DRAFT
                if (documentName !== item.name) {
                    menuItemName = item.name;
                }
                break;
            case 'media':
                const media = await getMedia(context, item.unique);
                const mediaName = media?.variants?.[0]?.name ?? null;
                itemType = 'Media';
                if (mediaName !== item.name) {
                    menuItemName = item.name;
                    isPublished = true
                }
                break;
            case 'external':
                menuItemName = item.name
                itemType = 'External';
                break;
        }

        key ??= uuidv4() as Guid;
        // Preserve children: if menuItem?.children is undefined, use the original item's children (from value array)
        // Always preserve the original item's children (from value array)
        let children: ModelEntryType[] = [];
        if (value) {
            const original = value.find(i => i.key === key);
            if (original && Array.isArray(original.children)) {
                children = original.children;
            }
        }
        return {
            key: key,
            name: menuItemName,
            url: item.url,
            icon: item.icon,
            itemType: itemType,
            target: item.target,
            published: isPublished,
            // The udi identifies the picked node, so it is built from the content key. Items with
            // nothing behind them (external links, titles) get no udi at all.
            // @ts-ignore
            udi: linkId ? `umb://${item.type}/${linkId.replace(/-/g, '')}` : null,
            contentKey: linkId,
            anchor: item.queryString,
            customClasses: menuItem?.customClasses ?? '',
            hideLoggedIn: menuItem?.hideLoggedIn ?? false,
            hideLoggedOut: menuItem?.hideLoggedOut ?? false,
            noreferrer: menuItem?.noreferrer ?? '',
            noopener: menuItem?.noopener ?? '',
            image: menuItem?.image?.map(image => convertToImageType(image.key)) ?? [],
            children
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

function normalizeItemType(value: UmbNavLinkPickerLinkType | null | undefined): UmbNavLinkPickerLinkType | null | undefined {
    if (!value) return value;
    switch (value.toLowerCase()) {
        case 'title': return 'Title';
        case 'document': return 'Document';
        case 'media': return 'Media';
        case 'external': return 'External';
        default: return value;
    }
}

function itemTypeFromUdi(udi: ModelEntryType['udi']): UmbNavLinkPickerLinkType | null | undefined {
    if (udi == null) return undefined;
    if (udi.startsWith('umb://document/')) return 'Document';
    if (udi.startsWith('umb://media/')) return 'Media';
    return undefined;
}

export function ensureNavItemKeys(value: ModelEntryType[]): ModelEntryType[] {
    return value.map(item => ({
        ...item,
        key: item.key ?? (uuidv4() as Guid),
        // The stored item type is what the item was last saved as, so it wins. The udi is only a
        // fallback for older data saved before the item type was persisted — reading it first would
        // send an item that has since been retyped straight back to Document.
        itemType: normalizeItemType(item.itemType || itemTypeFromUdi(item.udi)),
        // Always ensure children is an array so nested sorters can initialize
        children: Array.isArray(item.children) ? ensureNavItemKeys(item.children) : []
    }));
}

export function setItemDepths(items: ModelEntryType[], currentDepth = 1): ModelEntryType[] {
    return items.map(item => ({
        ...item,
        depth: currentDepth,
        // Always ensure children is an array (never null/undefined) so nested sorters work correctly
        children: Array.isArray(item.children) && item.children.length > 0
            ? setItemDepths(item.children, currentDepth + 1)
            : []
    }));
}