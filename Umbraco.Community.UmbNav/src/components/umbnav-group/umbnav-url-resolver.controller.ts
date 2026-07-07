import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbObjectState } from '@umbraco-cms/backoffice/observable-api';
import { UmbDocumentUrlRepository, UmbDocumentUrlsDataResolver, UmbDocumentItemRepository } from '@umbraco-cms/backoffice/document';
import { UmbMediaUrlRepository, UmbMediaItemRepository } from '@umbraco-cms/backoffice/media';
import type { ModelEntryType } from '../../tokens/umbnav.token.ts';

/**
 * Resolves display URLs and names for Document and Media nav items.
 *
 * Keeps the data access out of the UmbNavGroup element (AR-1): the element observes
 * {@link urls}/{@link names} and renders reactively, while this controller owns the
 * repositories and the resolved state. Names are resolved so a Document/Media item whose
 * stored name is empty still shows its live content title in the tree.
 */
export class UmbNavUrlResolverController extends UmbControllerBase {
    #documentUrlRepository = new UmbDocumentUrlRepository(this);
    #documentUrlsDataResolver = new UmbDocumentUrlsDataResolver(this);
    #mediaUrlRepository = new UmbMediaUrlRepository(this);
    #documentItemRepository = new UmbDocumentItemRepository(this);
    #mediaItemRepository = new UmbMediaItemRepository(this);

    #urls = new UmbObjectState<Record<string, string>>({});
    #names = new UmbObjectState<Record<string, string>>({});

    /** Observable map of nav item key -> resolved URL. */
    public readonly urls = this.#urls.asObservable();

    /** Observable map of nav item key -> resolved content name. */
    public readonly names = this.#names.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);
    }

    /** Returns the currently resolved URL for a nav item key, if any. */
    public getUrl(key: string): string | undefined {
        return this.#urls.getValue()[key];
    }

    /** Returns the currently resolved content name for a nav item key, if any. */
    public getName(key: string): string | undefined {
        return this.#names.getValue()[key];
    }

    /**
     * Resolves Document/Media URLs and names for the given items, updating {@link urls} and
     * {@link names} as each resolves. Only the items passed in are resolved (their own level);
     * each UmbNavGroup owns a resolver and resolves its own items, so nested groups resolve
     * their children into their own state rather than relying on a single root-level pass.
     */
    public async resolveUrls(items: ModelEntryType[] | undefined): Promise<void> {
        if (!items?.length) return;
        for (const item of items) {
            if (!item.key || !item.contentKey) continue;
            if (item.itemType === 'Document') {
                const url = await this.#getUrlForDocument(item.contentKey as string);
                if (url) this.#setUrl(item.key, url);
                const name = await this.#getNameForDocument(item.contentKey as string);
                if (name) this.#setName(item.key, name);
            } else if (item.itemType === 'Media') {
                const url = await this.#getUrlForMedia(item.contentKey as string);
                if (url) this.#setUrl(item.key, url);
                const name = await this.#getNameForMedia(item.contentKey as string);
                if (name) this.#setName(item.key, name);
            }
        }
    }

    #setUrl(key: string, url: string): void {
        this.#urls.setValue({ ...this.#urls.getValue(), [key]: url });
    }

    #setName(key: string, name: string): void {
        this.#names.setValue({ ...this.#names.getValue(), [key]: name });
    }

    async #getNameForDocument(unique: string): Promise<string> {
        const { data } = await this.#documentItemRepository.requestItems([unique]);
        return data?.[0]?.variants?.[0]?.name ?? '';
    }

    async #getNameForMedia(unique: string): Promise<string> {
        const { data } = await this.#mediaItemRepository.requestItems([unique]);
        return data?.[0]?.variants?.[0]?.name ?? '';
    }

    async #getUrlForDocument(unique: string): Promise<string> {
        const { data } = await this.#documentUrlRepository.requestItems([unique]);
        const urlsItem = data?.[0];
        this.#documentUrlsDataResolver.setData(urlsItem?.urls);
        const resolvedUrls = await this.#documentUrlsDataResolver.getUrls();
        return resolvedUrls?.[0]?.url ?? '';
    }

    async #getUrlForMedia(unique: string): Promise<string> {
        const { data } = await this.#mediaUrlRepository.requestItems([unique]);
        return data?.[0]?.url ?? '';
    }
}
