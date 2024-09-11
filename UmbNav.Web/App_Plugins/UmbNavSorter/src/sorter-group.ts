import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, LitElement, repeat, property, TemplateResult } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';

import './sorter-item.ts';
import ExampleSorterItem from './sorter-item.ts';

export type ModelEntryType = {
	key: string;
	name: string;
	children?: ModelEntryType[];
	expanded: boolean;
};

@customElement('example-sorter-group')
export class ExampleSorterGroup extends UmbElementMixin(LitElement) {
	//
	// Sorter setup:
	#sorter = new UmbSorterController<ModelEntryType, ExampleSorterItem>(this, {
		getUniqueOfElement: (element) => {
			return element.name;
		},
		getUniqueOfModel: (modelEntry) => {
			return modelEntry.name;
		},
		identifier: 'string-that-identifies-all-example-sorters',
		itemSelector: 'example-sorter-item',
		containerSelector: '.sorter-container',
		onChange: ({ model }) => {
			const oldValue = this._value;
			this._value = model;
			this.requestUpdate('value', oldValue);
			// Fire an event for the parent to know that the model has changed.
			this.dispatchEvent(new CustomEvent('change'));
		},
	});
	
	@property({ type: Boolean, reflect: true })
	nested: boolean = false;

	@property({ type: Array, attribute: false })
	public get value(): ModelEntryType[] {
		return this._value ?? [];
	}
	public set value(value: ModelEntryType[]) {
		const oldValue = this._value;
		this._value = value;
		this.#sorter.setModel(this._value);
		this.requestUpdate('value', oldValue);
	}
	private _value?: ModelEntryType[];

	removeItem = (item: ModelEntryType) => {
		this.value = this.value.filter((r) => r.name !== item.name);
	};

	toggleNode(event: CustomEvent<{ expanded: boolean;  key: string }>) {
		const { expanded, key } = event.detail;
    	this.value = this.value.map((item) => 
      		item.key === key ? { ...item, expanded } : item
    );

	console.log(expanded, key)
	}

	override render() {
		return html`
			<div class="sorter-container">
				${repeat(
					this.value,
					// Note: ideally you have an unique identifier for each item, but for this example we use the `name` as identifier.
					(item) => item.key,
					(item) =>
						html`
						<example-sorter-item name=${item.name} key=${item.key} class="sorter-padding-bottom"
						@custom-event=${this.toggleNode}>
							<!-- <button slot="action" @click=${() => this.removeItem(item)}>Delete</button> -->
							<example-sorter-group
							?nested=${true}
							class="${item.expanded ? 'expanded' : 'collapsed'}"
								.value=${item.children ?? []}
								@change=${(e: Event) => {
									item.children = (e.target as ExampleSorterGroup).value;
								}}></example-sorter-group>
						</example-sorter-item>
						`,
				)}
				${this.nested ? this.renderPlaceholder() : ''}
			</div>
		`;
	}
	renderPlaceholder(): TemplateResult {
		return html`<div class="sorter-placeholder sorter-border">Drop items here to create children</div>`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				width: 100%;
				border-radius: calc(var(--uui-border-radius) * 2);
			}

			.sorter-padding {
				padding-left: var(--uui-size-space-5);
			}

			.sorter-padding-bottom {
				padding-top: var(--uui-size-space-2);
			}

			.sorter-left-padding {
				padding-left: var(--uui-size-space-1);
			}

			.sorter-border {
				border: 1px dashed rgba(122, 122, 122, 0.25);
			}

			.sorter-background:hover {
				background: #ccc;
			}

			.sorter-placeholder {
				opacity: 0.2;
				padding-left: var(--uui-size-space-3);
				padding-top: var(--uui-size-space-3);
				padding-bottom: var(--uui-size-space-3);
				margin-top: var(--uui-size-space-3);
				margin-bottom: var(--uui-size-space-3);
			}

			.sorter-placeholder-left-margin {
				margin-left: var(--uui-size-space-5);
			}
			.expanded {
      display: block;
	  padding-left: var(--uui-size-space-5)
    }

    .collapsed {
      display: none;
    }
		`,
	];
}

export default ExampleSorterGroup;

declare global {
	interface HTMLElementTagNameMap {
		'example-sorter-group-nested': ExampleSorterGroup;
	}
}