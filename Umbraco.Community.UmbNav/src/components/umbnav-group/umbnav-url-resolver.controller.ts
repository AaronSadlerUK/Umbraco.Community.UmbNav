import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbObjectState } from '@umbraco-cms/backoffice/observable-api';
import { UmbDocumentUrlRepository, UmbDocumentUrlsDataResolver } from '@umbraco-cms/backoffice/document';
import { UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import type { ModelEntryType } from '../../tokens/umbnav.token.ts';

/**
 * Resolves display URLs for Document and Media nav items.
 *
 * Keeps the URL-resolution data access out of the UmbNavGroup element (AR-1): the
 * element observes {@link urls} and renders reactively, while this controller owns the
 * repositories and the resolved-URL state.
 */
export class UmbNavUrlResolverController extends UmbControllerBase {
    #documentUrlRepository = new UmbDocumentUrlRepository(this);
    #documentUrlsDataResolver = new UmbDocumentUrlsDataResolver(this);
    #mediaUrlRepository = new UmbMediaUrlRepository(this);

    #urls = new UmbObjectState<Record<string, string>>({});

    /** Observable map of nav item key -> resolved URL. */
    public readonly urls = this.#urls.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);
    }

    /** Returns the currently resolved URL for a nav item key, if any. */
    public getUrl(key: string): string | undefined {
        return this.#urls.getValue()[key];
    }

    /** Walks the item tree and resolves Document/Media URLs, updating {@link urls} as each resolves. */
    public async resolveUrls(items: ModelEntryType[] | undefined): Promise<void> {
        if (!items?.length) return;
        await this.#resolve(items);
    }

    async #resolve(items: ModelEntryType[]): Promise<void> {
        for (const item of items) {
            if (item.key && item.contentKey) {
                if (item.itemType === 'Document') {
                    const url = await this.#getUrlForDocument(item.contentKey as string);
                    if (url) this.#setUrl(item.key, url);
                } else if (item.itemType === 'Media') {
                    const url = await this.#getUrlForMedia(item.contentKey as string);
                    if (url) this.#setUrl(item.key, url);
                }
            }
            if (item.children?.length) {
                await this.#resolve(item.children);
            }
        }
    }

    #setUrl(key: string, url: string): void {
        this.#urls.setValue({ ...this.#urls.getValue(), [key]: url });
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
