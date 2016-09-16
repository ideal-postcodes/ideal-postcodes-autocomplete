/// <reference path="./interface.ts" />
/// <reference path="./controller.ts" />
/// <reference path="./utils.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/index.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/client/client.ts" />

namespace Autocomplete {
	export interface Suggestion {
		suggestion: string;
		urls: {
			udprn: string;
			umprn?: string;
		};
		udprn: number;
		umprn?: number;
	}

	export interface InterfaceCallbacks {
		onOpen?: () => void;
		onBlur?: () => void;
		onClose?: () => void;
		onFocus?: () => void;
		onInput?: (event: Event) => void;
		onSelect?: (suggestion: Suggestion) => void;
	}

	export interface InterfaceOptions extends InterfaceCallbacks {
		inputField: string;
	}

	export interface AddressFields {
		postcode?: string|[string];
		postcode_inward?: string|[string];
		postcode_outward?: string|[string];
		post_town?: string|[string];
		dependant_locality?: string|[string];
		double_dependant_locality?: string|[string];
		thoroughfare?: string|[string];
		dependant_thoroughfare?: string|[string];
		building_number?: string|[string];
		building_name?: string|[string];
		sub_building_name?: string|[string];
		po_box?: string|[string];
		department_name?: string|[string];
		organisation_name?: string|[string];
		udprn?: string|[string];
		umprn?: string|[string];
		postcode_type?: string|[string];
		su_organisation_indicator?: string|[string];
		delivery_point_suffix?: string|[string];
		line_1?: string|[string];
		line_2?: string|[string];
		line_3?: string|[string];
		premise?: string|[string];
		longitude?: string|[string];
		latitude?: string|[string];
		eastings?: string|[string];
		northings?: string|[string];
		country?: string|[string];
		traditional_county?: string|[string];
		administrative_county?: string|[string];
		postal_county?: string|[string];
		county?: string|[string];
		district?: string|[string];
		ward?: string|[string];
	}

	export interface CallbackOptions {
		onLoaded?: () => void;
		onFailedCheck?: () => void;
		onSuggestionsRetrieved?: (suggestions: Suggestion[]) => void;
		onAddressSelected?: (suggestion: Suggestion) => void;
		onAddressRetrieved?: (address: AddressFields) => void;
		onSearchError?: (error: Error) => void;
		onOpen?: () => void;
		onBlur?: () => void;
		onClose?: () => void;
		onFocus?: () => void;
		onInput?: (event: Event) => void;
	}

	export interface ControllerOptions extends IdealPostcodes.BasicOptions, IdealPostcodes.ClientOptions, CallbackOptions {
		inputField: string;
		outputFields: AddressFields;
		removeOrganisation?: boolean;
		checkKey?: boolean;
	}
}

if (window["IdealPostcodes"] !== undefined) {
	window["IdealPostcodes"]["Autocomplete"] = Autocomplete;
}
