import {css, customElement, html, ifDefined, state, when} from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import {type UUIBooleanInputEvent, UUIInputEvent} from "@umbraco-cms/backoffice/external/uui";
import {UmbTextStyles} from '@umbraco-cms/backoffice/style';
import type { UUIButtonState } from '@umbraco-cms/backoffice/external/uui';
import {UmbNavSettingsItem, UmbNavSettingsItemModalData} from "./settings-item-modal-token.ts";

@customElement('umbnav-settings-item-modal')
export class UmbNavModalElement extends
    UmbModalBaseElement<UmbNavSettingsItemModalData, UmbNavSettingsItem>
{
    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.updateValue({customCssClasses: this.data?.customCssClasses});
    }

    @state()
    public get enableCustomCssClasses(): Boolean {
        return <Boolean>this.data?.config.find(item => item.alias === 'allowCustomClasses')?.value ?? false;
    }

    @state()
    public get hideNoOpenerToggle(): Boolean {
        return <Boolean>this.data?.config.find(item => item.alias === 'hideNoopener')?.value ?? false;
    }

    @state()
    public get hideNoReferrerToggle(): Boolean {
        return <Boolean>this.data?.config.find(item => item.alias === 'hideNoreferrer')?.value ?? false;
    }

    @state()
    customCssClasses: string = '';

    @state()
    noReferrer: string = '';

    @state()
    noOpener: string = '';

    @state()
    private _submitButtonState: UUIButtonState;

    #handleConfirm() {
        this._submitButtonState = 'waiting';

        this.value = {
            customCssClasses: this.value?.customCssClasses ?? '',
            noReferrer: this.value?.noReferrer ?? '',
            noOpener: this.value?.noOpener ?? ''}
        ;
        this.modalContext?.submit();
    }

    #handleCancel() {
        this.modalContext?.reject();
    }

    #contentChange(event: UUIInputEvent) {
        this.updateValue({customCssClasses: event.target.value.toString()});
    }

    #handleNoReferrerToggle(event: UUIBooleanInputEvent) {

        if (event.target.checked) {
            this.updateValue({noReferrer: 'noreferrer'});
            this.noReferrer = 'noreferrer';
        }else{
            this.updateValue({noReferrer: ''});
            this.noReferrer = '';
        }
    }

    #handleNoOpenerToggle(event: UUIBooleanInputEvent) {

        if (event.target.checked) {
            this.updateValue({noOpener: 'noopener'});
            this.noOpener = 'noopener';
        }else{
            this.updateValue({noOpener: ''});
            this.noOpener = '';
        }
    }

    override render() {
        return html`
			<umb-body-layout headline=${ifDefined(this.data?.headline)}>
				<uui-box>
                    ${when(
                        this.enableCustomCssClasses,
                        () => html`${this.#renderCustomCssClassesInput()}`,
                    )}

                    ${when(
                            !this.hideNoOpenerToggle || !this.hideNoReferrerToggle,
                            () => html`${this.#renderSEOToggles()}`,
                    )}
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

    #renderCustomCssClassesInput() {
        return html`
			<umb-property-layout orientation="vertical">
				<div class="side-by-side" slot="editor">
					<umb-property-layout
						orientation="vertical"
						label="Custom CSS Classes"
						style="padding:0;">
						<uui-input
							slot="editor"
                            label="Custom CSS Classes"
                            .value=${this.data?.customCssClasses ?? ''}
                            @input=${this.#contentChange} />
						</uui-input>
					</umb-property-layout>
				</div>
			</umb-property-layout>
		`;
    }

    #renderSEOToggles() {
        return html`
			<umb-property-layout orientation="vertical">
				<div class="side-by-side" slot="editor">
					<umb-property-layout
						orientation="vertical"
						label='SEO'
						style="padding:0;"
                        class="seo-toggles">
                        ${when(
                                !this.hideNoReferrerToggle,
                                () => html`
                                    <uui-toggle label='Add "noreferrer" to link'
                                                slot="editor"
                                                ?checked="${this.data?.noReferrer === 'noreferrer'}"
                                                @change=${this.#handleNoReferrerToggle}></uui-toggle>`,
                        )}

                        ${when(
                                !this.hideNoOpenerToggle,
                                () => html`
                                    <uui-toggle label='Add "noopener" to link'
                                                slot="editor"
                                                ?checked="${this.data?.noOpener === 'noopener'}"
                                                @change=${this.#handleNoOpenerToggle}></uui-toggle>`,
                        )}
					</umb-property-layout>
				</div>
			</umb-property-layout>
		`;
    }

    static override styles = [
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
        `,
    ];

}

export default UmbNavModalElement;