/// <reference path="./utils.ts" />
/// <reference path="./index.ts" />

namespace Autocomplete {
	/** @hidden */
	const create = Autocomplete.Utils.create;

	/**
	 * # Autocomplete.Interface
	 *
	 * Represents the user interface which binds to the DOM.
	 * 
	 * The Interface class is designed to be consumed by an 
	 * `Autocomplete.Controller` instance and should not be accessed directly
	 * unless absolutely necessary.
	 *
	 * The main function of the Interface is to:
	 * - Present suggestions supplied by the controller
	 * - Provide callbacks to the controller for various user interactions
	 * - Provide methods to manipulate the user interface if required
	 *
	 * @private
	 */
	export class Interface {
		private suggestions: Suggestion[];
		private input: HTMLInputElement;
		private container: HTMLDivElement;
		private suggestionList: HTMLUListElement;
		private highlightIndex: number;
		private onOpen: () => void;
		private onBlur: () => void;
		private onClose: () => void;
		private onFocus: () => void;
		private onInput: (event: Event) => void;
		private onSelect: (s: Suggestion) => void;

		/**
		 * Creates an Interface instance
		 * @param {InterfaceOptions} options
		 */
		constructor (options: InterfaceOptions) {
			this.initialiseInterface(options)
				.initialiseCallbacks(options)
				.initialiseEventListeners(options)
				.refresh();
		}

		/**
		 * Injects user interface into the DOM and initialises internal
		 * representation for address suggestions
		 * @private
		 */
		initialiseInterface(options: InterfaceOptions): Interface {
			this.suggestions = [];
			this.highlightIndex = -1;
			this.input = <HTMLInputElement>document.querySelector(options.inputField);
			this.input.setAttribute("autocomplete", "off");
			this.input.setAttribute("aria-autocomplete", "list");

			this.container = <HTMLDivElement>create("div", {
				className: "idpc_autocomplete",
				around: this.input
			});

			this.suggestionList = <HTMLUListElement>create("ul", {
				className: "hidden idpc_ul",
				inside: this.container
			});

			return this;
		}

		/**
		 * Loads callbacks supplied by interface options into private instance
		 * methods
		 * @private
		 */
		initialiseCallbacks(options: InterfaceCallbacks): Interface {
			const NOOP = function () {};
			interfaceCallbacks.forEach(callback => {
				this[callback] = options[callback] ? options[callback] : NOOP;
			});
			return this;
		}

		/**
		 * Binds events from input and suggestion (ul) entities to private
		 * event handlers
		 * @private
		 */
		initialiseEventListeners(options): Interface {
			this.input.addEventListener("input", this._onInput.bind(this));
			this.input.addEventListener("blur", this._onBlur.bind(this, "blur"));
			this.input.addEventListener("focus", this._onFocus.bind(this));
			this.input.addEventListener("keydown", this._onKeyDown.bind(this));
			this.suggestionList.addEventListener("mousedown", this._onMousedown.bind(this));
			return this;
		}

		/**
		 * Event handler: Fires when focus moves away from input field
		 * Triggers:
		 * - `onBlur` callback
		 * - Closes suggestion list
		 * @private
		 */
		_onBlur(): void {
			this.onBlur();
			this.close("blur");
		}

		/**
		 * Event handler: Fires when input field is focused
		 * Triggers:
		 * - `onFocus` callback
		 * - Refresh of suggestion list
		 * @private
		 */
		_onFocus(): void {
			this.onFocus();
			this.refresh();
		}

		/**
		 * Event handler: Fires when input is detected on input fiel
		 * Triggers:
		 * - `onInput` callback
		 * @private
		 */
		_onInput(event: Event): void {
			this.onInput(event);
		}

		/**
		 * Event handler: Fires when mousedown on `<li>` HTML Entity
		 * Triggers:
		 * - Selection of address suggestion
		 * @private
		 */
		_onMousedown(event: MouseEvent): void {
			const ul = this.suggestionList;
			let li = <HTMLUListElement> event.target;

			if (li !== ul) {
				while (li && !/li/i.test(li.nodeName)) {
					li = <HTMLUListElement> li.parentNode;
				}

				if (li && event.button === 0) {  // Only select on left click
					event.preventDefault();
					this.select(li);
				}
			}
		}

		/**
		 * Event handler: Fires on "keyDown" event of search field
		 * Triggers:
		 * - `select` selection of address if key is "Enter"
		 * - `onInput` callback if key is "Backspace"
		 * - `close` closing of suggestion list if key is "Esc"
		 * - `next` highlight next suggestion if key is "Down"
		 * - `previous` highlight next suggestion if key is "Up"
		 * @private
		 */
		_onKeyDown(event: KeyboardEvent): void {
			const key = event.keyCode;
			if (!this.opened()) return;
			if (key === 13 && this.selected()) { // Enter
				event.preventDefault();
				this.select();
			}
			else if (key === 8) { // Backspace
				this.onInput(event);
			}
			else if (key === 27) { // Esc
				this.close("esc");
			}
			else if (key === 38 || key === 40) { // Down/Up arrow
				event.preventDefault();
				this[key === 38 ? "previous" : "next"]();
			}
		}

		/**
		 * Removes interface from DOM
		 * @private
		 */
		detach(): Interface {
			this.container.removeChild(this.suggestionList);
			this.container.parentElement.removeChild(this.container);
			this.container = null;
			this.suggestionList = null;
			return this;
		}

		/**
		 * Sets message as a list item, no or empty string removes any message
		 */
		setMessage(message?: string): Interface {
			if (message === undefined || message.length === 0) return this.refresh();
			this.highlightIndex = -1;
			this.suggestionList.innerHTML = "";
			this.suggestionList.appendChild(create("li", {
				innerHTML: message,
				class: "idpc_error"
			}));
			this.open();
			return this;
		}

		/**
		 * Refreshes address suggestion interface
		 */
		refresh(): Interface {
			const suggestions = this.suggestions;
			this.highlightIndex = -1;
			this.suggestionList.innerHTML = "";
			suggestions.forEach(suggestion => {
				this.suggestionList.appendChild(create("li", {
					innerHTML: suggestion.suggestion,
					"aria-selected": "false"
				}));
			});
			if (this.suggestionList.children.length === 0) {
				this.close();
			} else {
				this.open();
			}
			return this;
		}

		/**
		 * Setter for interface suggestions, which also triggers interface refresh
		 * @param  {Suggestion[]} suggestions [description]
		 * @return {Interface}                [description]
		 */
		setSuggestions(suggestions: Suggestion[]): Interface {
			this.suggestions = suggestions;
			this.refresh();
			return this;
		}

		// Hides autocomplete box
		close(reason?: string): Interface {
			if (!this.opened()) return this;
			this.onClose();
			Autocomplete.Utils.addClass(this.suggestionList, "hidden");
			return this;
		}

		// Unhides autocomplete box
		open(): Interface {
			this.onOpen();
			Autocomplete.Utils.removeClass(this.suggestionList, "hidden");
			return this;
		}

		opened(): boolean {
			return !this.suggestionList.className
				.split(" ")
				.some(c => c === "hidden");
		}

		// Highlight next suggestion
		next(): Interface {
			const count = this.suggestionList.children.length;
			return this.goto(this.highlightIndex < count - 1 ? this.highlightIndex + 1 : 0);
		}

		// Highlight previous suggestion
		previous(): Interface {
			const count = this.suggestionList.children.length;
			if (this.highlightIndex === 0 || !this.selected()) return this.goto(count - 1);
			return this.goto(this.highlightIndex - 1);
		}

		scrollToView(li: HTMLElement): Interface {
			const liOffset = li.offsetTop;
			const ulScrollTop = this.suggestionList.scrollTop;

			if (liOffset < ulScrollTop) {
				this.suggestionList.scrollTop = liOffset;
			}

			const ulHeight = this.suggestionList.clientHeight;
			const liHeight = li.clientHeight;

			if (liOffset + liHeight > ulScrollTop + ulHeight) {
				this.suggestionList.scrollTop = liOffset - ulHeight + liHeight;
			}

			return this;
		}

		// Updated highlighted li
		goto(i: number): Interface {
			const suggestions = this.suggestionList.children;

			if (suggestions.length === 0) return this;

			if (this.selected()) {
				suggestions[this.highlightIndex].setAttribute("aria-selected", "false");
			}

			this.highlightIndex = i;

			const suggestion = suggestions[i];

			if (i > -1 && suggestions.length > 0) {
				suggestion.setAttribute("aria-selected", "true");
				this.scrollToView(<HTMLElement>suggestion);
			} else {
				this.scrollToView(<HTMLElement>suggestions[0]);
			}

			return this;
		}

		// Fired when user selects a suggestion
		select(li?: Element): Interface {
			if (li) {
				let i;
				for (i = 0; li = li.previousElementSibling; i++);
				this.highlightIndex = i;
			}

			if (this.highlightIndex > -1 && this.highlightIndex < this.suggestions.length) {
				this.onSelect(this.suggestions[this.highlightIndex]);
				this.close("select");
			}

			return this;
		}

		selected(): boolean {
			return this.highlightIndex > -1;
		}
	}

	/**
	 * List of callbacks implemented by interface
	 * @readonly
	 * @hidden
	 */
	export const interfaceCallbacks = [
		"onOpen",
		"onBlur",
		"onClose",
		"onFocus",
		"onInput",
		"onSelect"
	];
}
