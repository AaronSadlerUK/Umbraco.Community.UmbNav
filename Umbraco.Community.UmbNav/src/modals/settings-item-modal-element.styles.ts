import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css } from '@umbraco-cms/backoffice/external/lit';

export const UmbNavSettingsModalStyles = [
    UmbTextStyles,
    css`
        uui-box {
            --uui-box-default-padding: 0 var(--uui-size-space-5);
        }

        uui-button-group {
            width: 100%;
        }

        uui-input {
            width: 100%;
        }

        .side-by-side {
            display: flex;
            flex-wrap: wrap;
            gap: var(--uui-size-space-5);

            umb-property-layout {
                flex: 1 1 0px;
            }
        }
        
        .invalid {
            color: var(--uui-color-danger);
        }
        
        .seo-toggles uui-toggle:not(:last-child) {
            display: block;
            margin-bottom: var(--uui-size-space-5);
        }

        .misc-toggles uui-toggle:not(:last-child) {
            display: block;
            margin-bottom: var(--uui-size-space-5);
        }
    `,
];