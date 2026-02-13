import { customElement, html, state} from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbNavTextItemModalData } from "../tokens/text-item-modal-token.ts";
import { UUIInputEvent } from "@umbraco-cms/backoffice/external/uui";
import {umbBindToValidation, UmbValidationContext} from "@umbraco-cms/backoffice/validation";
import type { UUIButtonState } from '@umbraco-cms/backoffice/external/uui';
import {ModelEntryType} from "../tokens/umbnav.token.ts";
import { umbFocus } from '@umbraco-cms/backoffice/lit-element';
import { UmbNavTextItemStyles } from './text-item-modal-element.styles.ts';

@customElement('umbnav-text-item-modal')
export class UmbNavModalElement extends
    UmbModalBaseElement<UmbNavTextItemModalData, ModelEntryType>
{
    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.updateValue({name: this.data?.name});
    }

    @state()
    name: string = '';

    @state()
    private _submitButtonState: UUIButtonState;

    #handleConfirm() {
        this._submitButtonState = 'waiting';

        this.#validation.validate().then(() => {
            this._submitButtonState = 'success';

            this.value = {
                key: this.data?.key ?? '',
                name: this.value?.name ?? '',
                url: null,
                icon: 'icon-tag',
                itemType: 'Title',
                udi: null,
                contentKey: null,
                anchor: null,
                published: true,
                children: []};
            this.modalContext?.submit();
        }, () => {
            this._submitButtonState = 'failed';
        });
    }

    #handleCancel() {
        this.modalContext?.reject();
    }

    #contentChange(event: UUIInputEvent) {
        this.updateValue({name: event.target.value.toString()});
    }

    #validation = new UmbValidationContext(this);

    render() {
        return html`
            <umb-body-layout .headline=${this.data?.headline ?? this.localize.term('umbnav_textItemModalHeadline')}>
                <uui-box>
                    ${this.#renderTextItemInput()}
                </uui-box>
                <uui-button
                        slot="actions"
                        @click=${this.#handleCancel}
                        look="default"
                        color="default"
                        label=${this.localize.term('general_close')}></uui-button>
                <uui-button
                        slot="actions"
                        @click=${this.#handleConfirm}
                        color="positive"
                        look="primary"
                        .state=${this._submitButtonState}
                        label=${this.localize.term('general_submit')}></uui-button>
            </umb-body-layout>
        `;
    }

    #renderTextItemInput() {
        return html`
			<umb-property-layout
                orientation="vertical"
                label="#umbnav_textItemModalTitleLabel">
                <uui-input
                    slot="editor"
                    id="umbnav-text-item"
                    name="name"
                    label=${this.localize.term('umbnav_textItemModalTitleLabel')}
                    .value=${this.data?.name ?? ''}
                    @input=${this.#contentChange}
                    required
                    required-message=${this.localize.term('umbnav_textItemRequiredMessage')}
                    ${umbBindToValidation(this, '$.name', this.value?.name)}
                    ${umbFocus()}
                >
                </uui-input>
			</umb-property-layout>
		`;
    }

    static override styles = UmbNavTextItemStyles;

}

export default UmbNavModalElement;