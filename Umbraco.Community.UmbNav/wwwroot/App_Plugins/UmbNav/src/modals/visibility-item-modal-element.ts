import {css, customElement, html, state} from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import {UmbTextStyles} from '@umbraco-cms/backoffice/style';
import type { UUIButtonState } from '@umbraco-cms/backoffice/external/uui';
import {UmbNavItemVisibility, UmbNavVisibilityItemModalData} from "./visibility-item-modal-token.ts";
import type { UUIBooleanInputEvent } from '@umbraco-cms/backoffice/external/uui';

@customElement('umbnav-visibility-item-modal')
export class UmbNavModalElement extends
    UmbModalBaseElement<UmbNavVisibilityItemModalData, UmbNavItemVisibility>
{
    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.updateValue({hideLoggedIn: this.data?.hideLoggedIn, hideLoggedOut: this.data?.hideLoggedOut});
        this.hideLoggedIn = this.data?.hideLoggedIn ?? false;
        this.hideLoggedOut = this.data?.hideLoggedOut ?? false;
    }

    @state()
    hideLoggedIn: boolean = false;

    @state()
    hideLoggedOut: boolean = false;

    @state()
    private _submitButtonState: UUIButtonState;

    #handleConfirm() {
        this._submitButtonState = 'success';

        this.value = {
            hideLoggedIn: this.hideLoggedIn,
            hideLoggedOut: this.hideLoggedOut
        };
        this.modalContext?.submit();
    }

    #handleCancel() {
        this.modalContext?.reject();
    }

    #hideLoggedIn(event: UUIBooleanInputEvent) {
        this.updateValue({hideLoggedIn: event.target.checked});
        this.hideLoggedIn = event.target.checked;
    }

    #hideLoggedOut(event: UUIBooleanInputEvent) {
        this.updateValue({hideLoggedOut: event.target.checked});
        this.hideLoggedOut = event.target.checked;
    }

    render() {
        return html`
            <umb-body-layout .headline=${this.data?.headline ?? 'Custom dialog'}>
                <uui-box>
                    ${this.#renderVisibilityToggles()}
                </uui-box>
                <div slot="actions">
					<uui-button label=${this.localize.term('general_close')} @click=${this.#handleCancel}></uui-button>
					<uui-button
						color="positive"
						look="primary"
						label=${this.localize.term('general_submit')}
                        .state=${this._submitButtonState}
						@click=${this.#handleConfirm}></uui-button>
				</div>
            </umb-body-layout>
        `;
    }

    #renderVisibilityToggles() {
        return html`
			<umb-property-layout orientation="vertical">
				<div class="side-by-side" slot="editor">
					<umb-property-layout
						orientation="vertical"
						label='Toggle Visibility'
						style="padding:0;"
                        class="visibility-toggles">
                        <uui-toggle label="Hide Logged In"
                                    slot="editor"
                                    ?checked="${this.hideLoggedIn}"
                                    @change=${this.#hideLoggedIn}></uui-toggle>
                        
                        <uui-toggle label="Hide Logged Out"
                                    slot="editor"
                                    ?checked="${this.hideLoggedOut}"
                                    @change=${this.#hideLoggedOut}></uui-toggle>
					</umb-property-layout>
				</div>
			</umb-property-layout>
		`;
    }

    static override styles = [
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

}

export default UmbNavModalElement;