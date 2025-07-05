import {customElement, html, ifDefined, state, when} from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import {type UUIBooleanInputEvent, UUIInputEvent} from "@umbraco-cms/backoffice/external/uui";
import type { UUIButtonState } from '@umbraco-cms/backoffice/external/uui';
import {UmbNavSettingsItem, UmbNavSettingsItemModalData} from "../tokens/settings-item-modal-token.ts";
import { UmbNavSettingsModalStyles } from './settings-item-modal-element.styles.ts';

@customElement('umbnav-settings-item-modal')
export class UmbNavModalElement extends
    UmbModalBaseElement<UmbNavSettingsItemModalData, UmbNavSettingsItem>
{
    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.updateValue({customCssClasses: this.data?.customCssClasses, noreferrer: this.data?.noreferrer, noopener: this.data?.noopener, includeChildNodes: this.data?.includeChildNodes});
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
    public get includeChildNodesToggle(): Boolean {
        return <Boolean>this.data?.config.find(item => item.alias === 'hideIncludeChildren')?.value ?? false;
    }

    customCssClasses: string = '';

    @state()
    noreferrer: string = '';

    @state()
    noopener: string = '';

    @state()
    includeChildNodes: boolean = false;

    @state()
    private _submitButtonState: UUIButtonState;

    #handleConfirm() {
        this._submitButtonState = 'waiting';

        this.value = {
            customCssClasses: this.value?.customCssClasses ?? '',
            noreferrer: this.value?.noreferrer ?? '',
            noopener: this.value?.noopener ?? '',
            includeChildNodes: this.value?.includeChildNodes ?? false}
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
            this.updateValue({noreferrer: 'noreferrer'});
            this.noreferrer = 'noreferrer';
        }else{
            this.updateValue({noreferrer: ''});
            this.noreferrer = '';
        }
    }

    #handleNoOpenerToggle(event: UUIBooleanInputEvent) {

        if (event.target.checked) {
            this.updateValue({noopener: 'noopener'});
            this.noopener = 'noopener';
        }else{
            this.updateValue({noopener: ''});
            this.noopener = '';
        }
    }

    #handleIncludeChildNodesToggle(event: UUIBooleanInputEvent) {

        if (event.target.checked) {
            this.updateValue({includeChildNodes: true});
            this.includeChildNodes =  true;
        }else{
            this.updateValue({includeChildNodes: false});
            this.includeChildNodes = false;
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

                    ${when(
                            !this.includeChildNodesToggle && this.data?.itemType === 'document',
                            () => html`${this.#renderIncludeChildNodesToggle()}`,
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
						label="#umbnav_settingsItemModalCustomCssClassesLabel"
						style="padding:0;">
						<uui-input
							slot="editor"
                            label=${this.localize.term('umbnav_settingsItemModalCustomCssClassesLabel')}
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
						label='#umbnav_settingsItemModalSeoGroupLabel'
						style="padding:0;"
                        class="seo-toggles">
                        ${when(
                                !this.hideNoReferrerToggle,
                                () => html`
                                    <uui-toggle label=${this.localize.term('umbnav_settingsItemModalNoReferrerLabel')}
                                                slot="editor"
                                                ?checked="${this.data?.noreferrer === 'noreferrer'}"
                                                @change=${this.#handleNoReferrerToggle}></uui-toggle>`,
                        )}

                        ${when(
                                !this.hideNoOpenerToggle,
                                () => html`
                                    <uui-toggle label=${this.localize.term('umbnav_settingsItemModalNoOpenerLabel')}
                                                slot="editor"
                                                ?checked="${this.data?.noopener === 'noopener'}"
                                                @change=${this.#handleNoOpenerToggle}></uui-toggle>`,
                        )}
					</umb-property-layout>
				</div>
			</umb-property-layout>
		`;
    }

        #renderIncludeChildNodesToggle() {
        return html`
			<umb-property-layout orientation="vertical">
				<div class="side-by-side" slot="editor">
					<umb-property-layout
						orientation="vertical"
						label='#umbnav_settingsItemModalIncludeChildNodesGroupLabel'
						style="padding:0;"
                        class="misc-toggles">
                        ${when(
                                !this.includeChildNodesToggle,
                                () => html`
                                    <uui-toggle label=${this.localize.term('umbnav_settingsItemModalIncludeChildNodesLabel')}
                                                slot="editor"
                                                ?checked="${this.data?.includeChildNodes === true}"
                                                @change=${this.#handleIncludeChildNodesToggle}></uui-toggle>`,
                        )}
					</umb-property-layout>
				</div>
			</umb-property-layout>
		`;
    }

    static override styles = UmbNavSettingsModalStyles

}

export default UmbNavModalElement;