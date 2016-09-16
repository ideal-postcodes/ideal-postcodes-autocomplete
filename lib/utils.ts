/*
 * Utility Methods
 */

namespace Autocomplete {
	export namespace Utils {
		export const create = (elemType: string, options: any): HTMLElement => {
			const elem = document.createElement(elemType);
			for (let attr in options) {
				const val = options[attr];
				if (attr === "inside") {
					const parent = (typeof val === "string") ? document.querySelector(val) : val;
					parent.appendChild(elem);
				} else if (attr === "around") {
					const ref = (typeof val === "string") ? document.querySelector(val) : val;
					ref.parentNode.insertBefore(elem, ref);
					elem.appendChild(ref);
				} else if (elem[attr] !== undefined) {
					elem[attr] = val;
				}
				else {
					elem.setAttribute(attr, val);
				}
			}
			return elem;
		};

		export const addClass = (elem: HTMLElement, className: string): HTMLElement => {
			const classes = elem.className.split(" ");
			if (classes.some(c => c === className)) {
				return elem;
			}
			classes.push(className);
			elem.className = classes.join(" ").trim();
			return elem;
		};

		export const removeClass = (elem: HTMLElement, className: string): HTMLElement => {
			const classes = elem.className.split(" ");
			elem.className = classes
				.filter(c => c !== className)
				.join(" ")
				.trim();
			return elem;
		};

		export const toArray = (elem: string|[string]): any => {
			if (typeof elem === "string") return elem.split(",");
			return elem;
		};

		export const removeOrganisation = (address: AddressFields): AddressFields => {
			if (address.organisation_name.length === 0) return address;
			if (address.line_1 === address.organisation_name) {
					// Shift addresses up
					address.line_1 = address.line_2;
					address.line_2 = address.line_3;
					address.line_3 = "";
			}
			return address;
		};
	}
}
