import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbLocalizationController } from '@umbraco-cms/backoffice/localization-api';
import { umbConfirmModal } from '@umbraco-cms/backoffice/modal';

export async function confirmDelete(host: UmbControllerHost, name: string) {
    try {
        let localize = new UmbLocalizationController(host);
        await umbConfirmModal(host, {
            headline: localize.term('umbnav_deleteItemModalHeadline', name),
            content: localize.term('umbnav_deleteItemModalContent', name),
            confirmLabel: localize.term('umbnav_deleteItemModalConfirmLabel'),
            color: 'danger',
        });
        return true;
    } catch (error) {
        console.error('Error in confirmDelete:', error);
        return false;
    }
}