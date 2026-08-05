import { describe, it, expect, vi } from 'vitest';
import type { ModelEntryType, Guid } from './tokens/umbnav.token.ts';

// The link picker conversions reach out to the document/media repositories for the display
// name and published state. Those need a live backoffice, so stub the data layer.
vi.mock('./components/umbnav-group/umbnav-group.data.ts', () => ({
    getDocument: vi.fn(async () => ({
        variants: [{ name: 'About us', state: 'Published' }],
    })),
    getMedia: vi.fn(async () => ({
        variants: [{ name: 'Brochure' }],
    })),
}));

const { ensureNavItemKeys, convertToUmbNavLink } = await import('./umbnav-utils.ts');

const ITEM_KEY = '11111111-1111-1111-1111-111111111111' as Guid;
const CONTENT_KEY = '22222222-2222-2222-2222-222222222222' as Guid;

function navItem(overrides: Partial<ModelEntryType>): ModelEntryType {
    return {
        key: ITEM_KEY,
        name: 'An item',
        icon: null,
        itemType: null,
        udi: null,
        anchor: null,
        published: null,
        contentKey: null,
        children: [],
        ...overrides,
    };
}

// Nothing reads a `unique` property off a stored item, and the picker link's own `unique`
// is a separate object — so anything written here just ends up as junk in the saved value.
const host = {} as never;

describe('ensureNavItemKeys', () => {
    it('keeps the stored item type when a stale udi disagrees with it', () => {
        const [result] = ensureNavItemKeys([
            navItem({
                itemType: 'External',
                url: 'https://example.com/',
                udi: 'umb://document/22222222222222222222222222222222',
            }),
        ]);

        expect(result.itemType).toBe('External');
    });

    it('falls back to the udi for legacy items that have no item type', () => {
        const [result] = ensureNavItemKeys([
            navItem({ itemType: null, udi: 'umb://document/22222222222222222222222222222222' }),
        ]);

        expect(result.itemType).toBe('Document');
    });

    it('normalises a lowercase stored item type', () => {
        const [result] = ensureNavItemKeys([navItem({ itemType: 'document' })]);

        expect(result.itemType).toBe('Document');
    });

    it('does not write a unique property into the item', () => {
        const [result] = ensureNavItemKeys([
            navItem({
                itemType: 'Document',
                contentKey: CONTENT_KEY,
                udi: 'umb://document/22222222222222222222222222222222',
            }),
        ]);

        expect(result).not.toHaveProperty('unique');
    });
});

describe('convertToUmbNavLink', () => {
    it('builds the udi from the content key, not the nav item key', async () => {
        const result = await convertToUmbNavLink(
            host,
            {
                name: 'About us',
                url: '/about-us/',
                icon: 'icon-document',
                type: 'document',
                target: '',
                published: true,
                unique: CONTENT_KEY,
                queryString: '',
            },
            ITEM_KEY,
            []
        );

        expect(result.contentKey).toBe(CONTENT_KEY);
        expect(result.udi).toBe('umb://document/22222222222222222222222222222222');
    });

    it('leaves the udi empty for an item with no content behind it', async () => {
        const result = await convertToUmbNavLink(
            host,
            {
                name: 'Just a label',
                url: '',
                icon: '',
                // The link picker clears the type when the picked node is removed.
                type: undefined as never,
                target: '',
                published: false,
                unique: '',
                queryString: '',
            },
            ITEM_KEY,
            []
        );

        expect(result.itemType).toBe('Title');
        expect(result.contentKey).toBeNull();
        expect(result.udi).toBeNull();
    });
});
