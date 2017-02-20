/// <reference path="./index.ts" />
/// <reference path="./interface.ts" />

/*
 * CONTROLLER
 *
 * Connects the user interface widget (Interface) with the Ideal Postcodes
 * client to allow users to search for their address via an autocomplete box. 
 * The state and internal logic of the autocomplete widget goes here.
 */

namespace Autocomplete {
	export class Controller {
		public client: IdealPostcodes.Client;
		public outputFields: AddressFields;
		public inputField: string;
		public options: IdealPostcodes.BasicOptions;
		public interface: Autocomplete.Interface;
		public onLoaded: () => void;
		public onFailedCheck: () => void;
		public onSuggestionsRetrieved: (suggestion: Suggestion[], options: IdealPostcodes.LookupAutocompleteOptions) => void;
		public onAddressSelected: (suggestion: Suggestion) => void;
		public onAddressRetrieved: (address: AddressFields) => void;
		public onSearchError: (error: Error) => void;
		public onOpen: () => void;
		public onBlur: () => void;
		public onClose: () => void;
		public onFocus: () => void;
		public onInput: (event: Event) => void;
		public removeOrganisation: boolean;
		public titleizePostTown: boolean;
		public checkKey: boolean;
		public searchFilters: IdealPostcodes.SearchFilters;
		public requestIdCounter: number = 0;
		public lastRequestId: number = 0;

		constructor(options: ControllerOptions) {
			const configAttributes = [
				"inputField",
				"checkKey",
				"removeOrganisation",
				"titleizePostTown"
			];
			configAttributes.forEach(attr => this[attr] = options[attr]);
			this.configureApiRequests(options);
			this.initialiseClient(options);
			this.initialiseOutputFields(options.outputFields);
			this.initialiseCallbacks(options);
			this.initialiseInterface(options);
		}

		// Applies client configuration
		configureApiRequests(options: IdealPostcodes.BasicOptions): void {
			this.options = {};
			this.searchFilters = {};
			Autocomplete.validClientOptions.forEach(basicOption => {
				if (options[basicOption] !== undefined) {
					this.options[basicOption] = options[basicOption];
				}
			});
		}

		initialiseClient(options: IdealPostcodes.ClientOptions): void {
			this.client = new IdealPostcodes.Client(options);
		}

		setSearchFilter(options: IdealPostcodes.SearchFilters): void {
			this.searchFilters = options;
		}

		initialiseOutputFields(outputFields: AddressFields): void {
			const result = {};
			for (let attr in outputFields) {
				if (outputFields.hasOwnProperty(attr)) {
					result[attr] = Autocomplete.Utils.toArray(outputFields[attr]);
				}
			}
			this.outputFields = result;
		}

		initialiseCallbacks(options: CallbackOptions): void {
			const NOOP = () => {};
			this.onOpen = options.onOpen || NOOP;
			this.onBlur = options.onBlur || NOOP;
			this.onClose = options.onClose || NOOP;
			this.onFocus = options.onFocus || NOOP;
			this.onInput = options.onInput || NOOP;
			this.onLoaded = options.onLoaded || NOOP;
			this.onSearchError = options.onSearchError || NOOP;
			this.onFailedCheck = options.onFailedCheck || NOOP;
			this.onAddressSelected = options.onAddressSelected || NOOP;
			this.onAddressRetrieved = options.onAddressRetrieved || NOOP;
			this.onSuggestionsRetrieved = options.onSuggestionsRetrieved || NOOP;
		}

		// Checks if key is usable (if enabled). Otherwise attaches interface to DOM
		initialiseInterface(options: ControllerOptions): void {
			if (this.checkKey) {
				this.client.checkKeyUsability(this.options, (error, response) => {
					if (response.available) {
						this.attachInterface(options);
					} else {
						this.onFailedCheck.call(this);
					}
				});
			} else {
				this.attachInterface(options);
			}
		}

		// Executes suggestion search when address input is updated
		_onInterfaceInput(): any {
			const self = this;
			return function (event: Event): any {
				if (self.onInput) self.onInput(event);
				self.interface.setMessage(); // Clear any messages
				self.requestIdCounter += 1;
				const options: AutocompleteOptions = {
					query: this.input.value,
					_id: self.requestIdCounter
				};
				Autocomplete.validSearchFilters.forEach(filter => {
					if (self.searchFilters[filter]) {
						options[filter] = self.searchFilters[filter];
					}
				});
				self.client.autocompleteAddress(options);
			};
		}

		// Populates fields with correct address when suggestion selected
		_onInterfaceSelect(): any {
			const self = this;
			return function (suggestion: Suggestion): any {
				self.onAddressSelected.call(this, suggestion);
				self.interface.setMessage(); // Clear message

				const callback: IdealPostcodes.XhrCallback = (error, address) => {
					if (error) {
						self.interface.setMessage("Unable to retrieve your address. Please enter your address manually");
						return self.onSearchError(error);
					}
					self.onAddressRetrieved.call(this, address);
					if (self.removeOrganisation) {
						address = Autocomplete.Utils.removeOrganisation(address);
					}
					self.populateAddress(address);
				};

				const options: IdealPostcodes.LookupIdOptions = IdealPostcodes.Utils.extend({}, this.options);

				if (suggestion.umprn) {
					options["id"] = suggestion.umprn;
					self.client.lookupUmprn(options, callback);
				} else {
					options["id"] = suggestion.udprn;
					self.client.lookupUdprn(options, callback);
				}
			};
		}

		// Adds interface to DOM and applies necessary callbacks
		attachInterface(options: ControllerOptions): void {
			if (this.interface) return;
			const self = this;
			const interfaceConfig = {
				inputField: options.inputField,
				onInput: self._onInterfaceInput(),
				onSelect: self._onInterfaceSelect()
			};

			Autocomplete.interfaceCallbacks.forEach(callbackName => {
				if (interfaceConfig[callbackName]) return; // Skip if already defined
				if (options[callbackName]) interfaceConfig[callbackName] = options[callbackName];
			});

			self.interface = new Autocomplete.Interface(interfaceConfig);

			self.client.registerAutocompleteCallback((error, response, xhr, options) => {
				if (error) {
					self.interface.setMessage("Unable to retrieve address suggestions. Please enter your address manually");
					return self.onSearchError(error);
				}
				const suggestions = response.hits;
				this.onSuggestionsRetrieved.call(this, suggestions, options);
				if (!options || (options as AutocompleteOptions)._id === undefined) {
					return self.interface.setSuggestions(suggestions);
				}
				if ((options as AutocompleteOptions)._id > self.lastRequestId) {
					self.lastRequestId = options["_id"];
					self.interface.setSuggestions(suggestions);
				}
			});

			this.onLoaded.call(this);
		}

		detachInterface(): void {
			if (!this.interface) return;
			this.interface.detach();
			this.interface = null;
		}

		populateAddress(address: AddressFields): void {
			const outputFields = this.outputFields;

			const extractAddressAttr = (address: AddressFields, attr: string): string => {
				const result = address[attr];
				if (this.titleizePostTown && attr === "post_town") {
					return Autocomplete.Utils.titleizePostTown(result);
				}
				return result;
			};

			for (let attr in outputFields) {
				if (outputFields.hasOwnProperty(attr)) {
					outputFields[attr].forEach(selector => {
						const inputs = document.querySelectorAll(selector);
						for (let i = 0; i < inputs.length; i++) {
							const input = <HTMLInputElement>inputs[i];
							if (typeof input.value === "string") {
								input.value = extractAddressAttr(address, attr);
							}
						}
					});
				}
			}
		}
	}
}
