[![npm version](https://badge.fury.io/js/ideal-postcodes-autocomplete.svg)](https://badge.fury.io/js/ideal-postcodes-autocomplete) ![gzip file size](http://img.badgesize.io/ideal-postcodes/ideal-postcodes-autocomplete/master/dist/ideal-postcodes-autocomplete.min.js.svg?compression=gzip) ![file size](http://img.badgesize.io/ideal-postcodes/ideal-postcodes-autocomplete/master/dist/ideal-postcodes-autocomplete.min.js.svg)

# Ideal Postcodes Autocomplete - Frontend Address Autocomplete Library

## Introduction

This library will create an autocomplete box for any input field specified and pipe the details of a selected address to input fields you designate.

Usage requires an Ideal-Postcodes.co.uk API Key

![Ideal Postcodes Autocomplete Example](https://raw.github.com/ideal-postcodes/ideal-postcodes-autocomplete/master/example/example.png)

## Build Status & Browser Compatibility Information

This library is tested across modern desktop and mobile browers

Internet Explorer 9 and above is supported. Internet Explorer 6, 7 and 8 are not supported

## Methods

To get started, create and point an Autocomplete instance to the input box to add autocomplete to while specifying output fields. E.g.

```javascript
const controller = new IdealPostcodes.Autocomplete.Controller({
	api_key: "iddqd",
	inputField: "#input",
	outputFields: {
		line_1: "#line_1",
		line_2: "#line_2",
		line_3: "#line_3",
		post_town: "#post_town",
		postcode: "#postcode"
	}
});
```

Please see our [documentation](https://ideal-postcodes.co.uk/documentation/ideal-postcodes-autocomplete) for more information

## Installation

You may install it via npm with,

```bash
npm install ideal-postcodes-autocomplete --save
```

You may also use Bower with,

```bash
bower install ideal-postcodes-autocomplete --save
```

Finally you can install it manually by copying the minified build from `/dist/`

## Testing

Run the test suite with,

```bash
gulp test
```

You may test the library manually in a browser console with,

```bash
gulp webserver
```

## License

MIT
