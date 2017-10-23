/// <reference path="./interface.ts" />
/// <reference path="./controller.ts" />
/// <reference path="./utils.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/index.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/client/client.ts" />

/**
 * @module Autocomplete
 */
namespace Autocomplete {
	/**
	 * List of valid options which can be passed to underlying API client
	 * @readonly
	 * @hidden
	 */
	export const validClientOptions = ["licensee", "filter", "tags"];

	/**
	 * List of valid search options for address and autocomplete search
	 * @readonly
	 * @hidden
	 */
	export const validSearchFilters = ["postcode_outward", "post_town"];

	/**
	 * Suggestion
	 *
	 * An object which represents a single address suggestion returned by the
	 * Ideal Postcodes autocomplete API
	 */
	export interface Suggestion {
		/**
		 * Address suggestion to be presented to the user
		 * @example `"9 Lerwick Court, 9 Village Road, Enfield, EN1"`
		 */
		suggestion: string;
		urls: {
			/** URL to resolve suggestion as Postcode Address File address */
			udprn: string;
			/** URL to resolve suggestion as multiple residence address */
			umprn?: string;
		};
		/** ID of the address found on PAF mainfile. Can be queried with `/udprn/:id` */
		udprn: number;
		/** ID of the address found on Multile Residence File. Can be queried with `/umprn/:id` */
		umprn?: number;
	}

	/**
	 * InterfaceCallbacks
	 *
	 * Callbacks supported by `Autocomplete.Interface`
	 */
	export interface InterfaceCallbacks {
		/** Invoked when autocomplete suggestion box is opened (i.e. presented to the user) */
		onOpen?: () => void;

		/** Invoked when the user unfocuses from the address input field */
		onBlur?: () => void;

		/** Invoked when autocomplete suggestion box is closed (i.e. hidden from user) */
		onClose?: () => void;

		/** Invoked when user selects or focuses address input field */
		onFocus?: () => void;

		/** Invoked when input is detected on address input field */
		onInput?: (event: Event) => void;

		/** Invoked when an address suggestion in suggestion box is selected */
		onSelect?: (suggestion: Suggestion) => void;
	}

	/**
	 * InterfaceOptions
	 *
	 * Options supported by `Autocomplete.Interface`
	 */
	export interface InterfaceOptions extends InterfaceCallbacks {
		/**
		 * CSS selector which specifies the input field which the autocomplete
		 * interface should bind
		 */
		inputField: string;
	}

	/** An internal data type used to query an address by ID */
	export interface AutocompleteOptions extends IdealPostcodes.LookupAutocompleteOptions {
		_id?: number;
	}

	/**
	 * AddressFields
	 *
	 * Identifies input fields (or any HTML entity with a `.value` attribute) using
	 * CSS selectors as a `string` (or `string[]`). These fields will receive
	 * address data when the user has selected an address suggestion
	 */
	export interface AddressFields {
		/**
		 * Postcode
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#postcode
		 */
		postcode?: string|string[];

		/**
		 * Inward Postcode
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#postcode_inward
		 */
		postcode_inward?: string|string[];

		/**
		 * Outward Postcode
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#postcode_outward
		 */
		postcode_outward?: string|string[];

		/**
		 * Post Town
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#post_town
		 */
		post_town?: string|string[];

		/**
		 * Dependant Locality
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#dependant_locality
		 */
		dependant_locality?: string|string[];

		/**
		 * Double Dependant Locality
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#double_dependant_locality
		 */
		double_dependant_locality?: string|string[];

		/**
		 * Thoroughfare
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#thoroughfare
		 */
		thoroughfare?: string|string[];

		/**
		 * Dependant Thoroughfare
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#dependant_thoroughfare
		 */
		dependant_thoroughfare?: string|string[];

		/**
		 * Building Number
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#building_number
		 */
		building_number?: string|string[];

		/**
		 * Building Name
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#building_name
		 */
		building_name?: string|string[];

		/**
		 * Sub Building Name
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#sub_building_name
		 */
		sub_building_name?: string|string[];

		/**
		 * PO Box
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#po_box
		 */
		po_box?: string|string[];

		/**
		 * Department Name
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#department_name
		 */
		department_name?: string|string[];

		/**
		 * Organisation Name
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#organisation_name
		 */
		organisation_name?: string|string[];

		/**
		 * UDPRN
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#udprn
		 */
		udprn?: string|string[];

		/**
		 * UMPRN
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#umprn
		 */
		umprn?: string|string[];

		/**
		 * Postcode Type
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#postcode_type
		 */
		postcode_type?: string|string[];

		/**
		 * SU Organisation Indicator
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#su_organisation_indicator
		 */
		su_organisation_indicator?: string|string[];

		/**
		 * Delivery Point Suffix
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#delivery_point_suffix
		 */
		delivery_point_suffix?: string|string[];

		/**
		 * Address Line 1
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#line_1
		 */
		line_1?: string|string[];

		/**
		 * Address Line 2
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#line_2
		 */
		line_2?: string|string[];

		/**
		 * Address Line 3
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#line_3
		 */
		line_3?: string|string[];

		/**
		 * Premise
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#premise
		 */
		premise?: string|string[];

		/**
		 * Longitude
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#longitude
		 */
		longitude?: string|string[];

		/**
		 * Latitude
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#latitude
		 */
		latitude?: string|string[];

		/**
		 * Eastings
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#eastings
		 */
		eastings?: string|string[];

		/**
		 * Northings
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#northings
		 */
		northings?: string|string[];

		/**
		 * Country
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#country
		 */
		country?: string|string[];

		/**
		 * Traditional County
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#traditional_county
		 */
		traditional_county?: string|string[];

		/**
		 * Administrative County
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#administrative_county
		 */
		administrative_county?: string|string[];

		/**
		 * Postal County
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#postal_county
		 */
		postal_county?: string|string[];

		/**
		 * County
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#county
		 */
		county?: string|string[];

		/**
		 * District
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#district
		 */
		district?: string|string[];

		/**
		 * Ward
		 * https://ideal-postcodes.co.uk/documentation/paf-data/#ward
		 */
		ward?: string|string[];
	}

	export interface CallbackOptions {
		/**
		 * Optional callback. This function is invoked when autocomplete has been
		 * successfully attached to the input element.
		 */
		onLoaded?: () => void;

		/**
		 * Optional callback. This function is invoked when `checkKey` is enabled
		 * and the key is discovered to be in an unusable state (e.g. daily limit
		 * reached, no balance, etc).
		 */
		onFailedCheck?: () => void;

		/**
		 * Optional callback. This function is invoked immediately after address
		 * suggestions are retrieved from the API. The first argument is an array
		 * of address suggestions.
		 */
		onSuggestionsRetrieved?: (suggestions: Suggestion[]) => void;

		/**
		 * Optional callback. This function is invoked immediately after the user
		 * has selected a suggestion (either by click or keypress). The first
		 * argument is an object which represents the suggestion selected.
		 */
		onAddressSelected?: (suggestion: Suggestion) => void;

		/**
		 * Optional callback. This function is invoked when the autocomplete client
		 * has retrieved a full address from the API following a user accepting a
		 * suggestion. The first argument is an object representing the address
		 * that has been retrieved.
		 */
		onAddressRetrieved?: (address: AddressFields) => void;

		/**
		 * Optional callback. This function is invoked when an error has occurred
		 * following an attempt to retrieve an address suggestion or full address.
		 * The first argument is an error instance (i.e. inherits from `Error`)
		 * representing the error which has occurred.
		 */
		onSearchError?: (error: Error) => void;

		/**
		 * Optional callback. This function is invoked when the suggestion list is
		 * opened.
		 */
		onOpen?: () => void;

		/**
		 * Optional callback. This function is invoked when focus is removed from
		 * the address suggestion input field.
		 */
		onBlur?: () => void;

		/**
		 * Optional callback. This function is invoked when the suggestion list is
		 * closed.
		 */
		onClose?: () => void;

		/**
		 * Optional callback. This function is invoked when the focus has been
		 * moved to the address suggestion input field.
		 */
		onFocus?: () => void;

		/**
		 * Optional callback. This function is invoked when the address input
		 * field has detected a keypress.
		 */
		onInput?: (event: Event) => void;
	}

	export interface ControllerOptions extends IdealPostcodes.BasicOptions,
		IdealPostcodes.ClientOptions, InterfaceOptions, CallbackOptions {
		/**
		 * An object specifying where address field data points should be piped.
		 * Please find a complete list of address fields in the documentation. The
		 * attribute of the document should be the same as the address attribute
		 * as found in the documentation. E.g. `line_1`, `post_town`, `postcode`. You
		 * may use a CSS selector (`string`) or array of CSS selector strings. E.g.
		 * `{ line_1: "#line_1"}` or `{ line_1: ["#line_1", "#premise"]`
		 */
		outputFields: AddressFields;
		/**
		 * Optional. An optional field to remove organisation name from address
		 * lines. Be aware that for some large organisation postcodes, the
		 * organisation name is the only identifying premise element of an address.
		 * This is `false` by default.
		 */
		removeOrganisation?: boolean;
		/**
		 * An optional field to check whether the key is usable against the Ideal
		 * Postcodes API. This should be used in conjunction with the
		 * `onFailedCheck` callback to specify the necessary behaviour when the API
		 * Key is not in a usable state. This is `false` by default.
		 */
		checkKey?: boolean;
		/**
		 * An optional field to convert the case of the Post Town from upper case
		 * into title case. E.g. `"LONDON"` becomes `"London".` Default is `false`
		 */
		titleizePostTown?: boolean;
	}
}

if (window["IdealPostcodes"] !== undefined) {
	window["IdealPostcodes"]["Autocomplete"] = Autocomplete;
}
