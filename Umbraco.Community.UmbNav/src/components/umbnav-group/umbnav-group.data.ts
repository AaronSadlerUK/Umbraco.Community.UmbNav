import { UmbDocumentItemRepository, UmbDocumentItemDataResolver, UmbDocumentUrlRepository, UmbDocumentUrlsDataResolver } from '@umbraco-cms/backoffice/document';
import { UmbMediaItemRepository, UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import { DocumentService, MediaService } from '@umbraco-cms/backoffice/external/backend-api';
import { tryExecute } from '@umbraco-cms/backoffice/resources';
import { Guid, ModelEntryType } from '../../tokens/umbnav.token.ts';
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export async function getDocumentUrl(context: UmbControllerHost, unique: Guid) {
    try {
        const documentUrlRepository = new UmbDocumentUrlRepository(context);
        const { data: documentUrlData } = await documentUrlRepository.requestItems([unique]);
        const urlsItem = documentUrlData?.[0];
        const dataResolver = new UmbDocumentUrlsDataResolver(context);
        dataResolver.setData(urlsItem?.urls);
        const resolvedUrls = await dataResolver.getUrls();
        return resolvedUrls?.[0]?.url ?? '';
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

export async function generateUmbNavLink(context: UmbControllerHost, item: ModelEntryType): Promise<ModelEntryType> {
    try {
        switch (item.itemType) {
            case 'document': {
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
                        name: documentItem.variants[0].name,
                        description: await getDocumentUrl(context, item.contentKey as Guid),
                    };
                }
                return item;
            }
            case 'media': {
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