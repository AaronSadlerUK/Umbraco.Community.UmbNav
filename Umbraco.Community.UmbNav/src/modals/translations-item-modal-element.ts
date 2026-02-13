import { customElement, html, state, repeat, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UUIInputEvent } from "@umbraco-cms/backoffice/external/uui";
import type { UUIButtonState } from '@umbraco-cms/backoffice/external/uui';
import { UmbNavTranslationsModalData, UmbNavTranslationsModalValue } from '../tokens/translations-item-modal-token.ts';
import { UmbLanguageCollectionRepository } from '@umbraco-cms/backoffice/language';
import { UMB_LANGUAGE_COLLECTION_REPOSITORY_ALIAS } from '@umbraco-cms/backoffice/language';

interface LanguageModel {
    unique: string;
    name: string;
    isDefault: boolean;
    isoCode: string;
}

@customElement('umbnav-translations-modal')
export class UmbNavTranslationsModalElement extends
    UmbModalBaseElement<UmbNavTranslationsModalData, UmbNavTranslationsModalValue>
{
    #languageRepository = new UmbLanguageCollectionRepository(this);

    @state()
    private _languages: LanguageModel[] = [];

    @state()
    private _activeLanguage: string = '';

    @state()
    private _nameVariants: Record<string, string> = {};

    @state()
    private _descriptionVariants: Record<string, string> = {};

    @state()
    private _submitButtonState?: UUIButtonState;

    constructor() {
        super();
    }

    override async connectedCallback() {
        super.connectedCallback();
        await this.#loadLanguages();
        this.#initializeVariants();
    }

    async #loadLanguages() {
        const { data } = await this.#languageRepository.requestCollection({});
        if (data) {
            this._languages = data.items.map((lang: any) => ({
                unique: lang.unique,
                name: lang.name,
                isDefault: lang.isDefault,
                isoCode: lang.isoCode
            }));

            // Set active language to default or first language
            const defaultLang = this._languages.find(l => l.isDefault);
            this._activeLanguage = defaultLang?.isoCode || this._languages[0]?.isoCode || '';
        }
    }

    #initializeVariants() {
        // Load existing variants
        this._nameVariants = { ...(this.data?.variants?.name || {}) };
        this._descriptionVariants = { ...(this.data?.variants?.description || {}) };
    }

    #handleLanguageTabClick(isoCode: string) {
        this._activeLanguage = isoCode;
    }

    #handleNameChange(event: UUIInputEvent) {
        const value = event.target.value.toString();
        if (value.trim()) {
            this._nameVariants = { ...this._nameVariants, [this._activeLanguage]: value };
        } else {
            // Remove empty values
            const { [this._activeLanguage]: _, ...rest } = this._nameVariants;
            this._nameVariants = rest;
        }
    }

    #handleDescriptionChange(event: UUIInputEvent) {
        const value = event.target.value.toString();
        if (value.trim()) {
            this._descriptionVariants = { ...this._descriptionVariants, [this._activeLanguage]: value };
        } else {
            // Remove empty values
            const { [this._activeLanguage]: _, ...rest } = this._descriptionVariants;
            this._descriptionVariants = rest;
        }
    }

    #handleClearVariant(field: 'name' | 'description') {
        if (field === 'name') {
            const { [this._activeLanguage]: _, ...rest } = this._nameVariants;
            this._nameVariants = { ...rest };
        } else {
            const { [this._activeLanguage]: _, ...rest } = this._descriptionVariants;
            this._descriptionVariants = { ...rest };
        }
        this.requestUpdate();
    }

    #handleConfirm() {
        this._submitButtonState = 'waiting';

        this.value = {
            variants: {
                name: Object.keys(this._nameVariants).length > 0 ? this._nameVariants : undefined,
                description: Object.keys(this._descriptionVariants).length > 0 ? this._descriptionVariants : undefined
            }
        };

        this._submitButtonState = 'success';
        this.modalContext?.submit();
    }

    #handleCancel() {
        this.modalContext?.reject();
    }

    override render() {
        return html`
            <umb-body-layout .headline=${this.data?.headline ?? this.localize.term('umbnav_translationsModalHeadline')}>
                <uui-box>
                    ${when(
                        this._languages.length > 0,
                        () => this.#renderLanguageTabs(),
                        () => html`<p>${this.localize.term('umbnav_translationsModalNoLanguages')}</p>`
                    )}

                    ${when(
                        this._activeLanguage,
                        () => this.#renderTranslationInputs()
                    )}
                </uui-box>

                <div slot="actions">
                    <uui-button
                        label=${this.localize.term('general_close')}
                        @click=${this.#handleCancel}>
                    </uui-button>
                    <uui-button
                        color="positive"
                        look="primary"
                        label=${this.localize.term('general_submit')}
                        .state=${this._submitButtonState}
                        @click=${this.#handleConfirm}>
                    </uui-button>
                </div>
            </umb-body-layout>
        `;
    }

    #renderLanguageTabs() {
        return html`
            <uui-tab-group style="margin-bottom: var(--uui-size-space-4);">
                ${repeat(
                    this._languages,
                    (lang) => lang.isoCode,
                    (lang) => html`
                        <uui-tab
                            label="${lang.name} (${lang.isoCode})"
                            ?active=${this._activeLanguage === lang.isoCode}
                            @click=${() => this.#handleLanguageTabClick(lang.isoCode)}>
                            ${lang.name}
                            ${when(
                                this._nameVariants[lang.isoCode] || this._descriptionVariants[lang.isoCode],
                                () => html`<uui-badge color="positive" style="margin-left: 8px;">✓</uui-badge>`
                            )}
                        </uui-tab>
                    `
                )}
            </uui-tab-group>
        `;
    }

    #renderTranslationInputs() {
        const currentLang = this._languages.find(l => l.isoCode === this._activeLanguage);
        const nameValue = this._nameVariants[this._activeLanguage] || '';
        const descriptionValue = this._descriptionVariants[this._activeLanguage] || '';

        return html`
            <div style="padding: var(--uui-size-space-4) 0;">
                <p style="margin-bottom: var(--uui-size-space-4); color: var(--uui-color-text-alt);">
                    ${this.localize.term('umbnav_translationsModalEditingFor')}: <strong>${currentLang?.name} (${currentLang?.isoCode})</strong>
                </p>

                <!-- Invariant Reference -->
                <uui-box style="margin-bottom: var(--uui-size-space-5); background: var(--uui-color-surface-alt);">
                    <p style="margin: 0 0 var(--uui-size-space-2) 0; font-weight: bold; color: var(--uui-color-text-alt);">
                        ${this.localize.term('umbnav_translationsModalInvariant')}:
                    </p>
                    <p style="margin: 0 0 var(--uui-size-space-1) 0;">
                        <strong>${this.localize.term('umbnav_translationsModalName')}:</strong> ${this.data?.invariantName || '(empty)'}
                    </p>
                    ${when(
                        this.data?.invariantDescription,
                        () => html`
                            <p style="margin: 0;">
                                <strong>${this.localize.term('umbnav_translationsModalDescription')}:</strong> ${this.data?.invariantDescription}
                            </p>
                        `
                    )}
                </uui-box>

                <!-- Name Input -->
                <umb-property-layout
                    orientation="vertical"
                    label="${this.localize.term('umbnav_translationsModalName')} (${currentLang?.isoCode})"
                    style="margin-bottom: var(--uui-size-space-4);">
                    <div slot="editor" style="display: flex; gap: var(--uui-size-space-2);">
                        <uui-input
                            style="flex: 1;"
                            label="${this.localize.term('umbnav_translationsModalName')}"
                            .value=${nameValue}
                            @input=${this.#handleNameChange}
                            placeholder="${this.data?.invariantName}">
                        </uui-input>
                        ${when(
                            nameValue,
                            () => html`
                                <uui-button
                                    label="${this.localize.term('umbnav_translationsModalClear')}"
                                    look="outline"
                                    color="warning"
                                    @click=${() => this.#handleClearVariant('name')}>
                                    ${this.localize.term('umbnav_translationsModalClear')}
                                </uui-button>
                            `
                        )}
                    </div>
                    <small slot="description" style="color: var(--uui-color-text-alt);">
                        ${nameValue
                            ? this.localize.term('umbnav_translationsModalWillUseTranslation')
                            : this.localize.term('umbnav_translationsModalWillUseFallback')}
                    </small>
                </umb-property-layout>

                <!-- Description Input -->
                <umb-property-layout
                    orientation="vertical"
                    label="${this.localize.term('umbnav_translationsModalDescription')} (${currentLang?.isoCode})">
                    <div slot="editor" style="display: flex; gap: var(--uui-size-space-2);">
                        <uui-input
                            style="flex: 1;"
                            label="${this.localize.term('umbnav_translationsModalDescription')}"
                            .value=${descriptionValue}
                            @input=${this.#handleDescriptionChange}
                            placeholder="${this.data?.invariantDescription || ''}">
                        </uui-input>
                        ${when(
                            descriptionValue,
                            () => html`
                                <uui-button
                                    label="${this.localize.term('umbnav_translationsModalClear')}"
                                    look="outline"
                                    color="warning"
                                    @click=${() => this.#handleClearVariant('description')}>
                                    ${this.localize.term('umbnav_translationsModalClear')}
                                </uui-button>
                            `
                        )}
                    </div>
                    <small slot="description" style="color: var(--uui-color-text-alt);">
                        ${descriptionValue
                            ? this.localize.term('umbnav_translationsModalWillUseTranslation')
                            : this.localize.term('umbnav_translationsModalWillUseFallback')}
                    </small>
                </umb-property-layout>
            </div>
        `;
    }
}

export default UmbNavTranslationsModalElement;
