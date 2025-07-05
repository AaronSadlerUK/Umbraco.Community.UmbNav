import {UmbTextStyles} from '@umbraco-cms/backoffice/style';
import {css} from '@umbraco-cms/backoffice/external/lit';

export const UmbNavGroupStyles = [
    UmbTextStyles,
    css`
        :root {
            interpolate-size: allow-keywords;
        }

        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            border-radius: calc(var(--uui-border-radius) * 2);
        }

        .umbnav-container {
            display: grid;
            gap: 1px;
        }

        .collapsed {
            block-size: 0;
            overflow: clip;
            visibility: hidden;
            opacity: 0;
            transition: block-size 0.5s ease, visibility 0.5s ease, opacity 0.5s ease;
        }

        .expanded {
            display: flex;
            block-size: auto;
            visibility: visible;
            opacity: 1;
            transition: block-size 0.5s ease, visibility 0.5s ease, opacity 0.5s ease;
        }

        .margin-left {
            margin-left: var(--uui-size-space-5);
        }

        .add-menuitem-button {
            padding-top: 1px;
            padding-bottom: 3px;
        }

        .disallowed {
            cursor: not-allowed;
            background: red;
        }

        :host([disallow-drop])::before {
            content: '';
            position: absolute;
            z-index: 1;
            inset: 0;
            border: 2px solid var(--uui-color-danger);
            border-radius: calc(var(--uui-border-radius) * 2);
            pointer-events: none;
        }

        :host([disallow-drop])::after {
            content: '';
            position: absolute;
            z-index: 1;
            inset: 0;
            border-radius: calc(var(--uui-border-radius) * 2);
            background-color: var(--uui-color-danger);
            opacity: 0.2;
            pointer-events: none;
        }
    `,
];