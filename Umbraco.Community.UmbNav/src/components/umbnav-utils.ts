import { ModelEntryType, Guid, ImageItem } from "../umbnav.token";
import { UmbLinkPickerLink } from '@umbraco-cms/backoffice/multi-url-picker';
import { v4 as uuidv4 } from 'uuid';

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
export function convertToUmbLinkPickerLink(item: ModelEntryType): UmbLinkPickerLink {
    try {
        return {
            name: item.name,
            url: item.url,
            icon: item.icon,
            // @ts-ignore
            type: item.itemType,
            target: item.target,
            published: item.itemType === 'document' ? item.published : true,
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
export function convertToUmbNavLink(
    item: UmbLinkPickerLink,
    key: Guid | null | undefined,
    value: ModelEntryType[]
): ModelEntryType {
    try {
        const menuItem = value.find(i => i.key === key);
        const linkId = item.unique != null && item.unique.length > 0 ? item.unique as Guid : null;
        key ??= uuidv4() as Guid;
        return {
            key: key,
            name: item.name,
            url: item.url,
            icon: item.icon,
            itemType: item.type,
            target: item.target,
            published: item.type === 'document' ? item.published : true,
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