import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { umbConfirmModal } from '@umbraco-cms/backoffice/modal';

export async function confirmDelete(host: UmbControllerHost, name: string) {
    try {
        await umbConfirmModal(host, {
            headline: `Delete ${name}`,
            content: `Are you sure you want to delete the "${name}" menu item?`,
            confirmLabel: 'Delete',
            color: 'danger',
        });
        return true;
    } catch (error) {
        console.error('Error in confirmDelete:', error);
        return false;
    }
}