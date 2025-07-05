import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css } from '@umbraco-cms/backoffice/external/lit';

export const UmbNavItemStyles = [
    UmbTextStyles,
    css`
        :host {
                display: grid;
                gap: 3px;
                border-radius: var(--uui-border-radius);
                
            }

            :host([drag-placeholder]) {
                opacity: 0.2;
            }
            div {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            #arrow {
                cursor: pointer;
            }

            #icon {
                display: flex;
                font-size: 1.2em;
                margin-left: var(--uui-size-2, 6px);
                margin-right: var(--uui-size-1, 3px);
            }

            #info {
                display: flex;
                padding-left: var(--uui-size-2, 6px);
                flex-grow: 1;
                flex-shrink: 0;
                flex-basis: auto;
            }

            #info .column {
                flex-direction: column;
                align-items: normal;
            }

            #buttons uui-action-bar {
                opacity: 0;
            }
            #buttons:hover uui-action-bar{
                opacity: 1;
                transition: opacity 120ms;
            }

            #name {
                font-weight: 700;
                cursor: pointer;
            }
            
            #description {
                color: #515054;
                font-size: 12px;
                line-height: 1.5em;
            }

            .name:hover {
                font-weight: 700;
                text-decoration: underline;
                color: var(--uui-color-interactive-emphasis, #3544b1);
            }
            
            .image {
                margin-left: var(--uui-size-space-2);
            }
            
            .image uui-icon {
                vertical-align: middle;
            }

            .tree-node {
                display: flex;
                align-items: center;
                padding: 5px 10px;
                border: 1px solid var(--uui-color-border, #d8d7d9);
                border-radius: 4px;
                background-color: var(--uui-color-surface, #fff);
                cursor: all-scroll;
                transition: background-color 0.3s ease;
                min-height: var(--uui-size-14);

            }

            .tree-node:hover {
                border-color: var(--uui-color-border-emphasis, #a1a1a1);
            }

            .margin-left {
                margin-left: var(--uui-size-space-5)
            }

            .tree-node.dragging {
                opacity: 0.5;
            }

            .unpublished {
                border: 1px dashed red;
                opacity: 0.6;
            }

            .unpublished:hover {
                border: 1px dashed red;
                opacity: 0.8;
            }
            .umbnav-badge {
                background-color: #337ab7;
                display: inline;
                padding: .3em .6em;
                font-size: 75%;
                font-weight: 700;
                line-height: 1;
                color: #fff;
                text-align: center;
                white-space: nowrap;
                vertical-align: baseline;
                border-radius: .25em;
                margin-left: var(--uui-size-space-3)
            }

            slot:not([key]) {
                // go on new line:
            }
    `,
];