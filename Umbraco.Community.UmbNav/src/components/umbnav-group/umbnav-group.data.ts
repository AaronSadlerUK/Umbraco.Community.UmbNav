import { UmbDocumentItemRepository, UmbDocumentItemDataResolver, UmbDocumentUrlRepository, UmbDocumentUrlsDataResolver } from '@umbraco-cms/backoffice/document';
import { UmbMediaItemRepository, UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import { DocumentService, MediaService } from '@umbraco-cms/backoffice/external/backend-api';
import { tryExecute } from '@umbraco-cms/backoffice/resources';
import { Guid, ModelEntryType } from '../../tokens/umbnav.token.ts';
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export async function getDocumentUrl(context: UmbControllerHost, unique: Guid, culture?: string | null) {
    try {
        const documentUrlRepository = new UmbDocumentUrlRepository(context);
        const { data: documentUrlData } = await documentUrlRepository.requestItems([unique]);
        const urls = documentUrlData?.[0]?.urls;

        if (!urls || urls.length === 0) {
            return '';
        }

        // If culture is provided, find the URL for that specific culture
        if (culture) {
            const cultureUrl = urls.find(u => u.culture === culture);
            if (cultureUrl?.url) {
                return cultureUrl.url;
            }
        }

        // Fallback: try to use the data resolver which gets culture from UMB_VARIANT_CONTEXT
        const dataResolver = new UmbDocumentUrlsDataResolver(context);
        dataResolver.setData(urls);
        const resolvedUrls = await dataResolver.getUrls();

        // If resolver returned filtered URLs, use the first one
        if (resolvedUrls && resolvedUrls.length > 0) {
            return resolvedUrls[0]?.url ?? '';
        }

        // Final fallback: return the first URL (invariant content case)
        return urls[0]?.url ?? '';
    } catch (error) {
        console.error('Error in getDocumentUrl:', error);
        return '';
    }
}

export async function getMediaUrl(context: UmbControllerHost, unique: Guid) {
    try {
        const mediaUrlRepository = new UmbMediaUrlRepository(context);
        const { data: mediaUrlData } = await mediaUrlRepository.requestItems([unique]);
        return mediaUrlData?.[0].url ?? '';
    } catch (error) {
        console.error('Error in getMediaUrl:', error);
        return '';
    }
}

export async function getDocument(context: UmbControllerHost, entityKey: string | undefined | null) {
    try {
        if (!entityKey) return;
        const { data, error } = await tryExecute(context, DocumentService.getDocumentById({ path: { id: entityKey } }));
        if (error) {
            console.error('Error fetching document:', error);
            return;
        }
        if (!data) return;
        return data;
    } catch (error) {
        console.error('Error in getDocument:', error);
        return;
    }
}

export async function getMedia(context: UmbControllerHost, entityKey: string | undefined | null) {
    try {
        if (!entityKey) return;
        const { data, error } = await tryExecute(context, MediaService.getMediaById({ path: { id: entityKey } }));
        if (error) {
            console.error('Error fetching media:', error);
            return;
        }
        if (!data) return;
        return data;
    } catch (error) {
        console.error('Error in getMedia:', error);
        return;
    }
}

export async function generateUmbNavLink(context: UmbControllerHost, item: ModelEntryType, culture?: string | null): Promise<ModelEntryType> {
    try {
        switch (item.itemType) {
            case 'Document': {
                const documentRepository = new UmbDocumentItemRepository(context);
                const { data: documentItems } = await documentRepository.requestItems(
                    item.contentKey ? [item.contentKey as string] : []
                );
                const documentItem = documentItems?.[0];
                if (documentItem) {
                    const itemDataResolver = new UmbDocumentItemDataResolver(context);
                    itemDataResolver.setData(documentItem);
                    return {
                        ...item,
                        icon: await itemDataResolver.getIcon(),
                        name: item.name ?? documentItem.variants[0].name,
                        description: await getDocumentUrl(context, item.contentKey as Guid, culture),
                    };
                }
                return item;
            }
            case 'Media': {
                const mediaRepository = new UmbMediaItemRepository(context);
                const { data: mediaData } = await mediaRepository.requestItems(
                    item.contentKey ? [item.contentKey as string] : []
                );
                const mediaItem = mediaData?.[0];
                if (mediaItem) {
                    return {
                        ...item,
                        icon: await mediaItem.mediaType.icon,
                        name: mediaItem.variants[0].name,
                        description: await getMediaUrl(context, item.contentKey as Guid),
                    };
                }
                return item;
            }
            default:
                return item;
        }
    } catch (error) {
        console.error('Error in generateUmbNavLink:', error);
        return item;
    }
}