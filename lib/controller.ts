/// <reference path="./index.ts" />
/// <reference path="./interface.ts" />

namespace Autocomplete {

	/**
	 * # Autocompete.Controller
	 *
	 * The Autocomplete Controller class acts as the public class which you may
	 * wield to enable address autocomplete on your HTML address forms
	 *
	 * When instantiated, the controller will serve as a bridge beteen the
	 * address suggestion interface presented on the DOM and the Ideal
	 * Postcodes Address resolution HTTP APIs
	 *
	 * More concretely, the instantiation of a controller instance creates:
	 * - A user interface instance `Autocomplete.Interface`
	 * - An instance of the [Ideal Postcodes browser client](https://github.com/ideal-postcodes/ideal-postcodes-core)
	 *
	 * The role of the controller is to bind to events produced by the user
	 * interface and take appropriate action including querying the API,
	 * modifying other aspects of the DOM.
	 */
	export class Controller {
		private client: IdealPostcodes.Client;
		private outputFields: AddressFields;
		private inputField: string;
		private options: IdealPostcodes.BasicOptions;
		private interface: Autocomplete.Interface;
		private onLoaded: () => void;
		private onFailedCheck: () => void;
		private onSuggestionsRetrieved: (suggestion: Suggestion[], options: IdealPostcodes.LookupAutocompleteOptions) => void;
		private onAddressSelected: (suggestion: Suggestion) => void;
		private onAddressRetrieved: (address: AddressFields) => void;
		private onSearchError: (error: Error) => void;
		private onOpen: () => void;
		private onBlur: () => void;
		private onClose: () => void;
		private onFocus: () => void;
		private onInput: (event: Event) => void;
		private removeOrganisation: boolean;
		private titleizePostTown: boolean;
		private checkKey: boolean;
		private searchFilters: IdealPostcodes.SearchFilters;
		private requestIdCounter: number = 0;
		private lastRequestId: number = 0;

		/**
		 * Instantiates autocomplete controller
		 * @param {ControllerOptions} options
		 */
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

		/**
		 * Configures HTTP client options prior to instantiation
		 * @private
		 * @param {IdealPostcodes.BasicOptions} options
		 */
		configureApiRequests(options: IdealPostcodes.BasicOptions): void {
			this.options = {};
			this.searchFilters = {};
			Autocomplete.validClientOptions.forEach(basicOption => {
				if (options[basicOption] !== undefined) {
					this.options[basicOption] = options[basicOption];
				}
			});
		}

		/**
		 * Produces an instance of `IdealPostcodes.Client`
		 * @private
		 * @param {IdealPostcodes.ClientOptions} options
		 */
		initialiseClient(options: IdealPostcodes.ClientOptions): void {
			this.client = new IdealPostcodes.Client(options);
		}

		/**
		 * Restrict autocomplete suggestions to certain features (e.g. post town,
		 * outward postcode)
		 * @param {IdealPostcodes.SearchFilters} options
		 * @public
		 * @example `controller.setSearchFilter({postcode_outward: ["SW1A"]})`
		 */
		setSearchFilter(options: IdealPostcodes.SearchFilters): void {
			this.searchFilters = options;
		}

		/**
		 * Updates an internal list of CSS selectors which will direct the flow of
		 * addressing information when user selects an address
		 * @private
		 * @param {AddressFields} outputFields
		 */
		initialiseOutputFields(outputFields: AddressFields): void {
			const result = {};
			for (let attr in outputFields) {
				if (outputFields.hasOwnProperty(attr)) {
					result[attr] = Autocomplete.Utils.toArray(outputFields[attr]);
				}
			}
			this.outputFields = result;
		}

		/**
		 * Binds any optional callbacks supplied in configuration to controller or
		 * writes a NOOP if callback not provided
		 * @private
		 * @param {CallbackOptions} options
		 */
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

		/**
		 * This creates a new instance of `Autocomplete.Interface` and attaches it to the DOM.
		 *
		 * Furthermore, Checks if key is usable (if enabled)
		 *
		 * This method is invoked upon the instantiation of `Autocomplete.Controller`,
		 * however it may be used to detach/re-attach new instances of the interface
		 * @public
		 * @param {ControllerOptions} options
		 */
		initialiseInterface(options: ControllerOptions): void {
			if (this.checkKey) {
				this.client.checkKeyUsability(this.options, (error, response) => {
					if (error) return this.onFailedCheck.call(this);
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

		/**
		 * Produces a function to be bound to an instance of `Autocomplete.Interface`.
		 * It executes suggestion search when address input is updated
		 * @private
		 * @return {any}
		 */
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
				if (self.options.licensee) options.licensee = self.options.licensee;
				Autocomplete.validSearchFilters.forEach(filter => {
					if (self.searchFilters[filter]) {
						options[filter] = self.searchFilters[filter];
					}
				});
				self.client.autocompleteAddress(options);
			};
		}

		/**
		 * Produces a function to be bound to an instance of `Autocomplete.Interface`.
		 * Populates fields with correct address when suggestion selected
		 * @private
		 * @return {any}
		 */
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

				const options: IdealPostcodes.LookupIdOptions = IdealPostcodes.Utils.extend({}, self.options);

				if (suggestion.umprn) {
					options["id"] = suggestion.umprn;
					self.client.lookupUmprn(options, callback);
				} else {
					options["id"] = suggestion.udprn;
					self.client.lookupUdprn(options, callback);
				}
			};
		}

		/**
		 * Binds internal instanec of `Autocomplete.Interface` to DOM and applies
		 * necessary callbacks
		 * @private
		 * @param {ControllerOptions} options [description]
		 */
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

		/**
		 * Detaches the autocomplete interaface from the DOM
		 * @public
		 */
		detachInterface(): void {
			if (!this.interface) return;
			this.interface.detach();
			this.interface = null;
		}

		/**
		 * Writes a selected to the input fields specified in the controller config
		 * @public
		 * @param {AddressFields} address
		 */
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
