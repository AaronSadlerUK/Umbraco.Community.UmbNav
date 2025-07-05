import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css } from '@umbraco-cms/backoffice/external/lit';

export const UmbNavVisibilityModalStyles = [
    UmbTextStyles,
    css`
        .invalid {
            color: var(--uui-color-danger);
        }
        uui-box {
            --uui-box-default-padding: 0 var(--uui-size-space-5);
        }

        uui-button-group {
            width: 100%;
        }

        uui-input {
            width: 100%;
        }
        .visibility-toggles uui-toggle:not(:last-child) {
            display: block;
            margin-bottom: var(--uui-size-space-5);
        }
    `,
];