/**
 * ideal-postcodes-autocomplete - Frontend UK Address Autocomplete Library for Ideal Postcodes API
 * @version v0.2.1
 * @link https://ideal-postcodes.co.uk
 * @license MIT
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * Utility Methods
 */
var Autocomplete;
/*
 * Utility Methods
 */
(function (Autocomplete) {
    var Utils;
    (function (Utils) {
        var joiner = /-/;
        var boness = /bo'ness/i;
        var containsAmpersand = /\w+&\w+/;
        var exclusion = /^(of|le|upon|on|the)$/;
        var joinerWord = /^(in|de|under|upon|y|on|over|the|by)$/;
        // capitalize word with exceptions on exclusion list
        var capitalizeWords = function (word) {
            word = word.toLowerCase();
            if (word.match(exclusion))
                return word;
            if (word.match(containsAmpersand))
                return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1);
        };
        // Check for names connected with hyphens
        var checkJoins = function (word) {
            if (word.match(joiner) === null)
                return word;
            return word
                .split("-")
                .map(function (word) {
                if (word.match(joinerWord))
                    return word.toLowerCase();
                return capitalizeWords(word);
            })
                .join("-");
        };
        // Single instance cases
        var checkExceptions = function (word) {
            if (word.match(boness))
                return "Bo'Ness";
            return word;
        };
        Utils.titleizePostTown = function (postTown) {
            return postTown
                .split(" ")
                .map(capitalizeWords)
                .map(checkJoins)
                .map(checkExceptions)
                .join(" ");
        };
        Utils.create = function (elemType, options) {
            var elem = document.createElement(elemType);
            for (var attr in options) {
                var val = options[attr];
                if (attr === "inside") {
                    var parent_1 = (typeof val === "string") ? document.querySelector(val) : val;
                    parent_1.appendChild(elem);
                }
                else if (attr === "around") {
                    var ref = (typeof val === "string") ? document.querySelector(val) : val;
                    ref.parentNode.insertBefore(elem, ref);
                    elem.appendChild(ref);
                }
                else if (elem[attr] !== undefined) {
                    elem[attr] = val;
                }
                else {
                    elem.setAttribute(attr, val);
                }
            }
            return elem;
        };
        Utils.addClass = function (elem, className) {
            var classes = elem.className.split(" ");
            if (classes.some(function (c) { return c === className; })) {
                return elem;
            }
            classes.push(className);
            elem.className = classes.join(" ").trim();
            return elem;
        };
        Utils.removeClass = function (elem, className) {
            var classes = elem.className.split(" ");
            elem.className = classes
                .filter(function (c) { return c !== className; })
                .join(" ")
                .trim();
            return elem;
        };
        Utils.toArray = function (elem) {
            if (typeof elem === "string")
                return elem.split(",");
            return elem;
        };
        Utils.removeOrganisation = function (address) {
            if (address.organisation_name.length === 0)
                return address;
            if (address.line_1 === address.organisation_name) {
                // Shift addresses up
                address.line_1 = address.line_2;
                address.line_2 = address.line_3;
                address.line_3 = "";
            }
            return address;
        };
    })(Utils = Autocomplete.Utils || (Autocomplete.Utils = {}));
})(Autocomplete || (Autocomplete = {}));
/// <reference path="./utils.ts" />
/// <reference path="./index.ts" />
/*
 * AUTOCOMPLETE INTERFACE (View)
 *
 * Represents the UI which is injected into the DOM
 *
 * The job of the interface limited to
 * - presenting suggestion supplied by the controller
 * - provides callbacks to the controller for various user interactions
 * - provide methods to manipulate the UI
 */
var Autocomplete;
/// <reference path="./utils.ts" />
/// <reference path="./index.ts" />
/*
 * AUTOCOMPLETE INTERFACE (View)
 *
 * Represents the UI which is injected into the DOM
 *
 * The job of the interface limited to
 * - presenting suggestion supplied by the controller
 * - provides callbacks to the controller for various user interactions
 * - provide methods to manipulate the UI
 */
(function (Autocomplete) {
    var create = Autocomplete.Utils.create;
    var Interface = (function () {
        function Interface(options) {
            this.initialiseInterface(options)
                .initialiseCallbacks(options)
                .initialiseEventListeners(options)
                .refresh();
        }
        // Hooks up interface instance to DOM
        Interface.prototype.initialiseInterface = function (options) {
            this.suggestions = [];
            this.highlightIndex = -1;
            this.input = document.querySelector(options.inputField);
            this.input.setAttribute("autocomplete", "off");
            this.input.setAttribute("aria-autocomplete", "list");
            this.container = create("div", {
                className: "idpc_autocomplete",
                around: this.input
            });
            this.suggestionList = create("ul", {
                className: "hidden idpc_ul",
                inside: this.container
            });
            return this;
        };
        // Hooks up callbacks to interface instance
        Interface.prototype.initialiseCallbacks = function (options) {
            var _this = this;
            var NOOP = function () { };
            Autocomplete.interfaceCallbacks.forEach(function (callback) {
                _this[callback] = options[callback] ? options[callback] : NOOP;
            });
            return this;
        };
        // Hooks up event listeners to interface
        Interface.prototype.initialiseEventListeners = function (options) {
            this.input.addEventListener("input", this._onInput.bind(this));
            this.input.addEventListener("blur", this._onBlur.bind(this, "blur"));
            this.input.addEventListener("focus", this._onFocus.bind(this));
            this.input.addEventListener("keydown", this._onKeyDown.bind(this));
            this.suggestionList.addEventListener("mousedown", this._onMousedown.bind(this));
            return this;
        };
        Interface.prototype._onBlur = function () {
            this.onBlur();
            this.close("blur");
        };
        Interface.prototype._onFocus = function () {
            this.onFocus();
            this.refresh();
        };
        Interface.prototype._onInput = function (event) {
            this.onInput(event);
        };
        Interface.prototype._onMousedown = function (event) {
            var ul = this.suggestionList;
            var li = event.target;
            if (li !== ul) {
                while (li && !/li/i.test(li.nodeName)) {
                    li = li.parentNode;
                }
                if (li && event.button === 0) {
                    event.preventDefault();
                    this.select(li);
                }
            }
        };
        Interface.prototype._onKeyDown = function (event) {
            var key = event.keyCode;
            if (!this.opened())
                return;
            if (key === 13 && this.selected()) {
                event.preventDefault();
                this.select();
            }
            else if (key === 8) {
                this.onInput(event);
            }
            else if (key === 27) {
                this.close("esc");
            }
            else if (key === 38 || key === 40) {
                event.preventDefault();
                this[key === 38 ? "previous" : "next"]();
            }
        };
        // Removes interface from DOM
        Interface.prototype.detach = function () {
            this.container.removeChild(this.suggestionList);
            this.container.parentElement.removeChild(this.container);
            this.container = null;
            this.suggestionList = null;
            return this;
        };
        // Sets message as a list item, no or empty string removes any message
        Interface.prototype.setMessage = function (message) {
            if (message === undefined || message.length === 0)
                return this.refresh();
            this.highlightIndex = -1;
            this.suggestionList.innerHTML = "";
            this.suggestionList.appendChild(create("li", {
                innerHTML: message,
                "class": "idpc_error"
            }));
            this.open();
            return this;
        };
        // Refreshes interface
        Interface.prototype.refresh = function () {
            var _this = this;
            var suggestions = this.suggestions;
            this.highlightIndex = -1;
            this.suggestionList.innerHTML = "";
            suggestions.forEach(function (suggestion) {
                _this.suggestionList.appendChild(create("li", {
                    innerHTML: suggestion.suggestion,
                    "aria-selected": "false"
                }));
            });
            if (this.suggestionList.children.length === 0) {
                this.close();
            }
            else {
                this.open();
            }
            return this;
        };
        Interface.prototype.setSuggestions = function (suggestions) {
            this.suggestions = suggestions;
            this.refresh();
            return this;
        };
        // Hides autocomplete box
        Interface.prototype.close = function (reason) {
            if (!this.opened())
                return this;
            this.onClose();
            Autocomplete.Utils.addClass(this.suggestionList, "hidden");
            return this;
        };
        // Unhides autocomplete box
        Interface.prototype.open = function () {
            this.onOpen();
            Autocomplete.Utils.removeClass(this.suggestionList, "hidden");
            return this;
        };
        Interface.prototype.opened = function () {
            return !this.suggestionList.className
                .split(" ")
                .some(function (c) { return c === "hidden"; });
        };
        // Highlight next suggestion
        Interface.prototype.next = function () {
            var count = this.suggestionList.children.length;
            return this.goto(this.highlightIndex < count - 1 ? this.highlightIndex + 1 : 0);
        };
        // Highlight previous suggestion
        Interface.prototype.previous = function () {
            var count = this.suggestionList.children.length;
            if (this.highlightIndex === 0 || !this.selected())
                return this.goto(count - 1);
            return this.goto(this.highlightIndex - 1);
        };
        Interface.prototype.scrollToView = function (li) {
            var liOffset = li.offsetTop;
            var ulScrollTop = this.suggestionList.scrollTop;
            if (liOffset < ulScrollTop) {
                this.suggestionList.scrollTop = liOffset;
            }
            var ulHeight = this.suggestionList.clientHeight;
            var liHeight = li.clientHeight;
            if (liOffset + liHeight > ulScrollTop + ulHeight) {
                this.suggestionList.scrollTop = liOffset - ulHeight + liHeight;
            }
            return this;
        };
        // Updated highlighted li
        Interface.prototype.goto = function (i) {
            var suggestions = this.suggestionList.children;
            if (suggestions.length === 0)
                return this;
            if (this.selected()) {
                suggestions[this.highlightIndex].setAttribute("aria-selected", "false");
            }
            this.highlightIndex = i;
            var suggestion = suggestions[i];
            if (i > -1 && suggestions.length > 0) {
                suggestion.setAttribute("aria-selected", "true");
                this.scrollToView(suggestion);
            }
            else {
                this.scrollToView(suggestions[0]);
            }
            return this;
        };
        // Fired when user selects a suggestion
        Interface.prototype.select = function (li) {
            if (li) {
                var i = void 0;
                for (i = 0; li = li.previousElementSibling; i++)
                    ;
                this.highlightIndex = i;
            }
            if (this.highlightIndex > -1 && this.highlightIndex < this.suggestions.length) {
                this.onSelect(this.suggestions[this.highlightIndex]);
                this.close("select");
            }
            return this;
        };
        Interface.prototype.selected = function () {
            return this.highlightIndex > -1;
        };
        return Interface;
    }());
    Autocomplete.Interface = Interface;
    Autocomplete.interfaceCallbacks = [
        "onOpen",
        "onBlur",
        "onClose",
        "onFocus",
        "onInput",
        "onSelect"
    ];
})(Autocomplete || (Autocomplete = {}));
var IdealPostcodes;
(function (IdealPostcodes) {
    IdealPostcodes.API_URL = "api.ideal-postcodes.co.uk";
    IdealPostcodes.TLS = true;
    IdealPostcodes.VERSION = "v1";
    IdealPostcodes.DEFAULT_TIMEOUT = 10000;
    /*
     * STRICT_AUTHORISATION forces authorization header usage on
     * autocomplete API which increases latency due to overhead
     * OPTIONS request
     */
    IdealPostcodes.STRICT_AUTHORISATION = false;
    ;
})(IdealPostcodes || (IdealPostcodes = {}));
window["IdealPostcodes"] = IdealPostcodes;
var IdealPostcodes;
(function (IdealPostcodes) {
    var Utils;
    (function (Utils) {
        // Credit to https://github.com/component/debounce
        Utils.now = function () { return Date.now(); };
        Utils.debounce = function (func, delay) {
            if (delay === void 0) { delay = 100; }
            var timeout, args, context, timeInvoked, result;
            function later() {
                var timeSinceInvocation = Utils.now() - timeInvoked;
                if (timeSinceInvocation > 0 && timeSinceInvocation < delay) {
                    timeout = setTimeout(later, delay - timeSinceInvocation);
                }
                else {
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                }
            }
            ;
            return function () {
                context = this;
                args = arguments;
                timeInvoked = Utils.now();
                if (!timeout)
                    timeout = setTimeout(later, delay);
                return result;
            };
        };
        Utils.extend = function (target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            var length = sources.length;
            for (var i = 0; i < length; i++) {
                var source = sources[i];
                for (var key in source) {
                    if (source[key] !== undefined) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
    })(Utils = IdealPostcodes.Utils || (IdealPostcodes.Utils = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="../index.ts" />
var IdealPostcodes;
/// <reference path="../index.ts" />
(function (IdealPostcodes) {
    var cacheArguments = [
        "id",
        "postcode",
        "query",
        "limit",
        "page",
        "post_town",
        "postcode_outward",
        "filter"
    ];
    var generateCacheId = function (qs) {
        return cacheArguments.map(function (arg) { return [arg, qs[arg]]; })
            .filter(function (elem) { return elem[1] !== undefined; })
            .map(function (elem) { return elem.join("="); })
            .join("|");
    };
    var Cache = (function () {
        function Cache() {
            this.initialiseStore();
            this.active = true;
        }
        Cache.prototype.disable = function () {
            this.active = false;
        };
        Cache.prototype.enable = function () {
            this.active = true;
        };
        Cache.prototype.initialiseStore = function () {
            this.store = {
                postcodeStore: {},
                addressStore: {},
                autocompleteStore: {},
                udprnStore: {},
                umprnStore: {}
            };
        };
        Cache.prototype.cacheAddressQuery = function (options, response) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            this.store.addressStore[id] = response;
        };
        Cache.prototype.getAddressQuery = function (options) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            return this.store.addressStore[id];
        };
        Cache.prototype.cachePostcodeQuery = function (options, response) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            this.store.postcodeStore[id] = response;
        };
        Cache.prototype.getPostcodeQuery = function (options) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            return this.store.postcodeStore[id];
        };
        Cache.prototype.cacheAutocompleteQuery = function (options, response) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            this.store.autocompleteStore[id] = response;
        };
        Cache.prototype.getAutocompleteQuery = function (options) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            return this.store.autocompleteStore[id];
        };
        Cache.prototype.cacheUdprnQuery = function (options, response) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            this.store.udprnStore[id] = response;
        };
        Cache.prototype.getUdprnQuery = function (options) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            return this.store.udprnStore[id];
        };
        Cache.prototype.cacheUmprnQuery = function (options, response) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            this.store.umprnStore[id] = response;
        };
        Cache.prototype.getUmprnQuery = function (options) {
            if (!this.active)
                return;
            var id = generateCacheId(options);
            return this.store.umprnStore[id];
        };
        return Cache;
    }());
    IdealPostcodes.Cache = Cache;
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="../index.ts" />
var IdealPostcodes;
/// <reference path="../index.ts" />
(function (IdealPostcodes) {
    var Transport;
    (function (Transport) {
        Transport.blankRe = /^\s*$/;
        Transport.AllowedAuthorizationParameters = ["api_key"];
        Transport.detectTls = function (window) {
            try {
                return window.location.protocol !== "http:";
            }
            catch (e) {
                return true;
            }
        };
        Transport.legacyBrowser = function (w) {
            var ieVersion = Transport.isIE(w);
            var operaVersion = Transport.isOpera(w);
            return !!(ieVersion && ieVersion <= 9) || !!(operaVersion && operaVersion <= 12);
        };
        Transport.isIE = function (w) {
            var nav = w ? w.navigator : window.navigator;
            try {
                var myNav = nav.userAgent.toLowerCase();
                return (myNav.indexOf("msie") !== -1) ? parseInt(myNav.split("msie")[1]) : false;
            }
            catch (e) {
                return false;
            }
        };
        Transport.isOpera = function (w) {
            var opera = w ? w.opera : window["opera"];
            if (!opera)
                return false;
            if (Object.prototype.toString.call(opera) !== "[object Opera]")
                return false;
            try {
                var version = parseInt(opera.version(), 10);
                if (isNaN(version))
                    return false;
                return version;
            }
            catch (e) {
                return false;
            }
        };
        Transport.generateQueryString = function (query) {
            var result = [];
            for (var key in query) {
                result.push(encodeURIComponent(key) + "=" + encodeURIComponent(query[key]));
            }
            return result.join("&");
        };
        Transport.constructHeaders = function (headerOptions) {
            var headers = {};
            headers["Authorization"] = Transport.constructAuthenticationHeader(headerOptions);
            return headers;
        };
        Transport.deconstructAuthenticationHeader = function (authorizationHeader) {
            var result = {};
            if (!authorizationHeader)
                return result;
            authorizationHeader
                .replace("IDEALPOSTCODES ", "")
                .trim()
                .split(" ")
                .forEach(function (elem) {
                var e = elem.split("=");
                if (typeof e[0] === "string" && typeof e[1] === "string") {
                    result[e[0]] = e[1].replace(/(^"|"$)/g, "");
                }
            });
            return result;
        };
        Transport.constructAuthenticationHeader = function (authOptions) {
            var authorizationHeader = [];
            for (var i = 0; i < Transport.AllowedAuthorizationParameters.length; i++) {
                var param = Transport.AllowedAuthorizationParameters[i];
                if (authOptions[param] !== undefined) {
                    authorizationHeader.push(param + "=\"" + authOptions[param] + "\"");
                }
            }
            if (authorizationHeader.length === 0)
                return "";
            return "IDEALPOSTCODES " + authorizationHeader.join(" ");
        };
        Transport.constructQueryString = function (options) {
            var queryString = {};
            if (options.filter)
                queryString["filter"] = options.filter.join(",");
            if (options.licensee)
                queryString["licensee"] = options.licensee;
            if (options.tags)
                queryString["tags"] = options.tags.join(",");
            return queryString;
        };
        Transport.constructAutocompleteQueryString = function (options) {
            var queryString = {};
            queryString["query"] = options.query;
            if (options.limit)
                queryString["limit"] = options.limit;
            if (options.postcode_outward) {
                queryString["postcode_outward"] = options.postcode_outward.join(",");
            }
            if (options.post_town) {
                queryString["post_town"] = options.post_town.join(",");
            }
            return queryString;
        };
        Transport.constructAddressQueryString = function (options) {
            var queryString = {};
            queryString["query"] = options.query;
            queryString["page"] = options.page || 0;
            queryString["limit"] = options.limit || 10;
            if (options.postcode_outward) {
                queryString["postcode_outward"] = options.postcode_outward.join(",");
            }
            if (options.post_town) {
                queryString["post_town"] = options.post_town.join(",");
            }
            return queryString;
        };
    })(Transport = IdealPostcodes.Transport || (IdealPostcodes.Transport = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="../index.ts" />
var IdealPostcodes;
/// <reference path="../index.ts" />
(function (IdealPostcodes) {
    var Errors;
    (function (Errors) {
        var IdealPostcodesError = (function (_super) {
            __extends(IdealPostcodesError, _super);
            function IdealPostcodesError(options) {
                var _this = _super.call(this) || this;
                _this.message = "Ideal Postcodes Error: " + options.message;
                return _this;
            }
            return IdealPostcodesError;
        }(Error));
        Errors.IdealPostcodesError = IdealPostcodesError;
        var JsonParseError = (function (_super) {
            __extends(JsonParseError, _super);
            function JsonParseError() {
                return _super.call(this, {
                    message: "Unable to parse JSON response"
                }) || this;
            }
            ;
            return JsonParseError;
        }(IdealPostcodesError));
        Errors.JsonParseError = JsonParseError;
    })(Errors = IdealPostcodes.Errors || (IdealPostcodes.Errors = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="../index.ts" />
/// <reference path="./standard.ts" />
var IdealPostcodes;
/// <reference path="../index.ts" />
/// <reference path="./standard.ts" />
(function (IdealPostcodes) {
    var Errors;
    (function (Errors) {
        Errors.parse = function (xhr) {
            var status = xhr.status;
            if (status === 200)
                return;
            switch (status) {
                case 503:
                    return new RateLimitError();
            }
            try {
                return Errors.parseErrorResponse(JSON.parse(xhr.responseText), status);
            }
            catch (e) {
                return new Errors.JsonParseError();
            }
        };
        Errors.parseErrorResponse = function (response, status) {
            var responseCode = response.code;
            var message = response.message;
            if (responseCode === undefined || message === undefined)
                return new GenericApiError();
            return new IdealPostcodesApiError({
                responseCode: responseCode,
                status: status,
                message: message
            });
        };
        var IdealPostcodesApiError = (function (_super) {
            __extends(IdealPostcodesApiError, _super);
            function IdealPostcodesApiError(options) {
                var _this = _super.call(this, options) || this;
                if (options.status)
                    _this.status = options.status;
                if (options.responseCode)
                    _this.responseCode = options.responseCode;
                return _this;
            }
            return IdealPostcodesApiError;
        }(Errors.IdealPostcodesError));
        Errors.IdealPostcodesApiError = IdealPostcodesApiError;
        var RateLimitError = (function (_super) {
            __extends(RateLimitError, _super);
            function RateLimitError() {
                return _super.call(this, {
                    status: 503,
                    message: "Rate Limit Reached. Please wait a while before you retry your request"
                }) || this;
            }
            return RateLimitError;
        }(IdealPostcodesApiError));
        Errors.RateLimitError = RateLimitError;
        var RequestTimeoutError = (function (_super) {
            __extends(RequestTimeoutError, _super);
            function RequestTimeoutError() {
                return _super.call(this, {
                    message: "Request timed out"
                }) || this;
            }
            return RequestTimeoutError;
        }(IdealPostcodesApiError));
        Errors.RequestTimeoutError = RequestTimeoutError;
        var GenericApiError = (function (_super) {
            __extends(GenericApiError, _super);
            function GenericApiError() {
                return _super.call(this, {
                    message: "Unknown AJAX error occurred when accessing API"
                }) || this;
            }
            return GenericApiError;
        }(IdealPostcodesApiError));
        Errors.GenericApiError = GenericApiError;
    })(Errors = IdealPostcodes.Errors || (IdealPostcodes.Errors = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="./utils.ts" />
/// <reference path="../index.ts" />
/// <reference path="../error/api.ts" />
/// <reference path="../utils/utils.ts" />
var IdealPostcodes;
/// <reference path="./utils.ts" />
/// <reference path="../index.ts" />
/// <reference path="../error/api.ts" />
/// <reference path="../utils/utils.ts" />
(function (IdealPostcodes) {
    var Transport;
    (function (Transport) {
        Transport.getXhr = function () {
            try {
                return new (XMLHttpRequest || ActiveXObject)("MSXML2.XMLHTTP.3.0");
            }
            catch (e) {
                return null;
            }
        };
        Transport.xhrRequest = function (options, callback) {
            var url = options.url;
            var queryString = Transport.generateQueryString(options.queryString);
            if (queryString.length > 0)
                url += "?" + queryString;
            var xhr = Transport.getXhr();
            xhr.open(options.method, url, true);
            try {
                for (var attr in options.headers) {
                    xhr.setRequestHeader(attr, options.headers[attr]);
                }
            }
            catch (e) { }
            var abortTimeout = setTimeout(function () {
                xhr.onreadystatechange = function () { };
                xhr.abort();
                callback(new Error("Request timeout"), null, xhr);
            }, options.timeout);
            xhr.onreadystatechange = function () {
                var result;
                if (xhr.readyState === 4) {
                    clearTimeout(abortTimeout);
                    if (xhr.status !== 200) {
                        return callback(IdealPostcodes.Errors.parse(xhr), {}, xhr);
                    }
                    try {
                        result = Transport.blankRe.test(xhr.responseText) ? {} : JSON.parse(xhr.responseText);
                    }
                    catch (e) {
                        return callback(new Error("parsererror"), null, xhr);
                    }
                    return callback(null, result, xhr);
                }
            };
            xhr.send(options.data);
            return xhr;
        };
    })(Transport = IdealPostcodes.Transport || (IdealPostcodes.Transport = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="./utils.ts" />
/// <reference path="../index.ts" />
/// <reference path="../error/api.ts" />
/// <reference path="../utils/utils.ts" />
var IdealPostcodes;
/// <reference path="./utils.ts" />
/// <reference path="../index.ts" />
/// <reference path="../error/api.ts" />
/// <reference path="../utils/utils.ts" />
(function (IdealPostcodes) {
    var Transport;
    (function (Transport) {
        var jsonpCounter = 0;
        var noop = function () { };
        // Include callback name, any header authorisation, other querystring options
        var jsonpQueryString = function (options, callbackName) {
            options.queryString["callback"] = callbackName;
            var headers = options.headers;
            var auth = Transport.deconstructAuthenticationHeader(headers["Authorization"]);
            IdealPostcodes.Utils.extend(options.queryString, auth);
            return Transport.generateQueryString(options.queryString);
        };
        var extractStatus = function (apiResponse) {
            var code = apiResponse.code;
            if (!code || typeof code !== "number")
                return 500;
            return parseInt(String(code).slice(0, 3));
        };
        Transport.jsonpRequest = function (options, callback) {
            jsonpCounter += 1;
            var url = options.url;
            // Reject non GET requests
            if (options.method && options.method.toLowerCase() !== "get") {
                callback(new Error("Browser is unable to perform non-GET requests"), null, null);
                return null;
            }
            // Generate callbackname
            var callbackName = "idpc_" + IdealPostcodes.Utils.now() + "_" + jsonpCounter;
            // Configure querystring
            var queryString = jsonpQueryString(options, callbackName);
            if (queryString.length > 0)
                url += "?" + queryString;
            var target = document.getElementsByTagName("script")[0] || document.head;
            var timer = setTimeout(function () {
                cleanup();
                callback(new Error("Request timeout"), null, null);
            }, options.timeout);
            var cleanup = function () {
                if (script.parentNode)
                    script.parentNode.removeChild(script);
                window[callbackName] = noop;
                if (timer)
                    clearTimeout(timer);
            };
            var cancel = function () {
                if (window[callbackName])
                    cleanup();
            };
            window[callbackName] = function (result) {
                cleanup();
                var status = extractStatus(result);
                var virtualXhr = {
                    responseText: result,
                    status: status
                };
                if (virtualXhr.status !== 200) {
                    return callback(IdealPostcodes.Errors.parseErrorResponse(result, status), null, virtualXhr);
                }
                return callback(null, result, virtualXhr);
            };
            var script = document.createElement("script");
            script.src = url;
            script.type = "text/javascript";
            target.parentNode.insertBefore(script, target);
            return null;
        };
    })(Transport = IdealPostcodes.Transport || (IdealPostcodes.Transport = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="./utils.ts" />
/// <reference path="./xhr.ts" />
/// <reference path="./jsonp.ts" />
/// <reference path="../index.ts" />
var IdealPostcodes;
/// <reference path="./utils.ts" />
/// <reference path="./xhr.ts" />
/// <reference path="./jsonp.ts" />
/// <reference path="../index.ts" />
(function (IdealPostcodes) {
    var Transport;
    (function (Transport) {
        Transport.defaultHeaders = {
            "Accept": "text/javascript, application/javascript"
        };
        Transport.request = function (options, callback) {
            var strictOptions = {
                url: options.url,
                method: options.method || "GET",
                headers: options.headers || {},
                queryString: options.queryString || {},
                timeout: options.timeout || IdealPostcodes.DEFAULT_TIMEOUT,
                data: options.data || null
            };
            IdealPostcodes.Utils.extend(strictOptions.headers, Transport.defaultHeaders);
            // If legacy (<IE9, <Opera12, fallback to jsonp)
            if (Transport.legacyBrowser())
                return Transport.jsonpRequest(strictOptions, callback);
            // Otherwise proceed with XMLHttpRequest
            return Transport.xhrRequest(strictOptions, callback);
        };
    })(Transport = IdealPostcodes.Transport || (IdealPostcodes.Transport = {}));
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="../index.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="../utils/cache.ts" />
/// <reference path="../transport/index.ts" />
/// <reference path="../transport/utils.ts" />
var IdealPostcodes;
/// <reference path="../index.ts" />
/// <reference path="../utils/utils.ts" />
/// <reference path="../utils/cache.ts" />
/// <reference path="../transport/index.ts" />
/// <reference path="../transport/utils.ts" />
(function (IdealPostcodes) {
    var extend = IdealPostcodes.Utils.extend;
    var XhrUtils = IdealPostcodes.Transport;
    var constructHeaders = XhrUtils.constructHeaders;
    var constructQuery = XhrUtils.constructQueryString;
    var constructAddressQuery = XhrUtils.constructAddressQueryString;
    var constructAutocompleteQuery = XhrUtils.constructAutocompleteQueryString;
    var Client = (function () {
        function Client(options) {
            if (options === void 0) { options = {}; }
            var _this = this;
            this.api_key = options.api_key;
            this.tls = options.tls === undefined ? IdealPostcodes.TLS : options.tls;
            this.version = options.version === undefined ? IdealPostcodes.VERSION : options.version;
            this.baseUrl = options.baseUrl === undefined ? IdealPostcodes.API_URL : options.baseUrl;
            this.strictAuthorisation = options.strictAuthorisation === undefined ? IdealPostcodes.STRICT_AUTHORISATION : options.strictAuthorisation;
            this.cache = new IdealPostcodes.Cache();
            var self = this;
            this.autocompleteCallback = function () { };
            // Need to consider caching as well! Can't store meta in cache store
            this.debouncedAutocomplete = IdealPostcodes.Utils.debounce(function (options) {
                _this.lookupAutocomplete(options, self.autocompleteCallback);
            });
        }
        Client.prototype.apiUrl = function () {
            return "http" + (this.tls ? "s" : "") + "://" + this.baseUrl + "/" + this.version;
        };
        Client.prototype.ping = function (callback) {
            IdealPostcodes.Transport.request({
                url: "http" + (this.tls ? "s" : "") + "://" + this.baseUrl
            }, callback);
        };
        Client.prototype.lookupPostcode = function (options, callback) {
            var _this = this;
            options.api_key = this.api_key;
            var headers = constructHeaders(options);
            var queryString = constructQuery(options);
            var cachedResponse = this.cache.getPostcodeQuery(options);
            if (cachedResponse)
                return callback(null, cachedResponse);
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/postcodes/" + encodeURIComponent(options.postcode),
                headers: headers,
                queryString: queryString
            }, function (error, data, xhr) {
                if (error && error.responseCode === 4040)
                    return callback(null, [], xhr);
                if (error)
                    return callback(error, null, xhr);
                _this.cache.cachePostcodeQuery(options, data.result);
                return callback(null, data.result, xhr);
            });
        };
        Client.prototype.lookupAddress = function (options, callback) {
            var _this = this;
            options.api_key = this.api_key;
            var headers = constructHeaders(options);
            var queryString = constructQuery(options);
            extend(queryString, constructAddressQuery(options));
            var cachedResponse = this.cache.getAddressQuery(options);
            if (cachedResponse)
                return callback(null, cachedResponse);
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/addresses",
                headers: headers,
                queryString: queryString
            }, function (error, data, xhr) {
                if (error)
                    return callback(error, null, xhr);
                _this.cache.cacheAddressQuery(options, data.result);
                return callback(null, data.result, xhr);
            });
        };
        Client.prototype.lookupAutocomplete = function (options, callback) {
            var _this = this;
            options.api_key = this.api_key;
            var headers = constructHeaders(options);
            var queryString = constructQuery(options);
            extend(queryString, constructAutocompleteQuery(options));
            var cachedResponse = this.cache.getAutocompleteQuery(options);
            if (cachedResponse)
                return callback(null, cachedResponse, null, options);
            if (!this.strictAuthorisation) {
                queryString["api_key"] = this.api_key;
                delete headers["Authorization"];
            }
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/autocomplete/addresses",
                headers: headers,
                queryString: queryString
            }, function (error, data, xhr) {
                if (error)
                    return callback(error, null, xhr, options);
                _this.cache.cacheAutocompleteQuery(options, data.result);
                return callback(null, data.result, xhr, options);
            });
        };
        Client.prototype.lookupUdprn = function (options, callback) {
            var _this = this;
            options.api_key = this.api_key;
            var headers = constructHeaders(options);
            var queryString = constructQuery(options);
            var cachedResponse = this.cache.getUdprnQuery(options);
            if (cachedResponse)
                return callback(null, cachedResponse);
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/udprn/" + options.id,
                headers: headers,
                queryString: queryString
            }, function (error, data, xhr) {
                if (error)
                    return callback(error, null, xhr);
                _this.cache.cacheUdprnQuery(options, data.result);
                return callback(null, data.result, xhr);
            });
        };
        Client.prototype.lookupUmprn = function (options, callback) {
            var _this = this;
            options.api_key = this.api_key;
            var headers = constructHeaders(options);
            var queryString = constructQuery(options);
            var cachedResponse = this.cache.getUmprnQuery(options);
            if (cachedResponse)
                return callback(null, cachedResponse);
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/umprn/" + options.id,
                headers: headers,
                queryString: queryString
            }, function (error, data, xhr) {
                if (error)
                    return callback(error, null, xhr);
                _this.cache.cacheUmprnQuery(options, data.result);
                return callback(null, data.result, xhr);
            });
        };
        Client.prototype.checkKeyUsability = function (options, callback) {
            IdealPostcodes.Transport.request({
                url: this.apiUrl() + "/keys/" + this.api_key,
                queryString: constructQuery(options)
            }, function (error, data, xhr) {
                if (error)
                    return callback(error, null, xhr);
                return callback(null, data.result, xhr);
            });
        };
        Client.prototype.autocompleteAddress = function (options) {
            this.debouncedAutocomplete(options);
        };
        Client.prototype.registerAutocompleteCallback = function (callback) {
            this.autocompleteCallback = callback;
        };
        return Client;
    }());
    IdealPostcodes.Client = Client;
})(IdealPostcodes || (IdealPostcodes = {}));
/// <reference path="./interface.ts" />
/// <reference path="./controller.ts" />
/// <reference path="./utils.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/index.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/client/client.ts" />
var Autocomplete;
/// <reference path="./interface.ts" />
/// <reference path="./controller.ts" />
/// <reference path="./utils.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/index.ts" />
/// <reference path="../node_modules/ideal-postcodes-core/lib/client/client.ts" />
(function (Autocomplete) {
    Autocomplete.validClientOptions = ["licensee", "filter", "tags"];
    Autocomplete.validSearchFilters = ["postcode_outward", "post_town"];
})(Autocomplete || (Autocomplete = {}));
if (window["IdealPostcodes"] !== undefined) {
    window["IdealPostcodes"]["Autocomplete"] = Autocomplete;
}
/// <reference path="./index.ts" />
/// <reference path="./interface.ts" />
/*
 * CONTROLLER
 *
 * Connects the user interface widget (Interface) with the Ideal Postcodes
 * client to allow users to search for their address via an autocomplete box.
 * The state and internal logic of the autocomplete widget goes here.
 */
var Autocomplete;
/// <reference path="./index.ts" />
/// <reference path="./interface.ts" />
/*
 * CONTROLLER
 *
 * Connects the user interface widget (Interface) with the Ideal Postcodes
 * client to allow users to search for their address via an autocomplete box.
 * The state and internal logic of the autocomplete widget goes here.
 */
(function (Autocomplete) {
    var Controller = (function () {
        function Controller(options) {
            var _this = this;
            this.requestIdCounter = 0;
            this.lastRequestId = 0;
            var configAttributes = [
                "inputField",
                "checkKey",
                "removeOrganisation",
                "titleizePostTown"
            ];
            configAttributes.forEach(function (attr) { return _this[attr] = options[attr]; });
            this.configureApiRequests(options);
            this.initialiseClient(options);
            this.initialiseOutputFields(options.outputFields);
            this.initialiseCallbacks(options);
            this.initialiseInterface(options);
        }
        // Applies client configuration
        Controller.prototype.configureApiRequests = function (options) {
            var _this = this;
            this.options = {};
            this.searchFilters = {};
            Autocomplete.validClientOptions.forEach(function (basicOption) {
                if (options[basicOption] !== undefined) {
                    _this.options[basicOption] = options[basicOption];
                }
            });
        };
        Controller.prototype.initialiseClient = function (options) {
            this.client = new IdealPostcodes.Client(options);
        };
        Controller.prototype.setSearchFilter = function (options) {
            this.searchFilters = options;
        };
        Controller.prototype.initialiseOutputFields = function (outputFields) {
            var result = {};
            for (var attr in outputFields) {
                if (outputFields.hasOwnProperty(attr)) {
                    result[attr] = Autocomplete.Utils.toArray(outputFields[attr]);
                }
            }
            this.outputFields = result;
        };
        Controller.prototype.initialiseCallbacks = function (options) {
            var NOOP = function () { };
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
        };
        // Checks if key is usable (if enabled). Otherwise attaches interface to DOM
        Controller.prototype.initialiseInterface = function (options) {
            var _this = this;
            if (this.checkKey) {
                this.client.checkKeyUsability(this.options, function (error, response) {
                    if (error)
                        return _this.onFailedCheck.call(_this);
                    if (response.available) {
                        _this.attachInterface(options);
                    }
                    else {
                        _this.onFailedCheck.call(_this);
                    }
                });
            }
            else {
                this.attachInterface(options);
            }
        };
        // Executes suggestion search when address input is updated
        Controller.prototype._onInterfaceInput = function () {
            var self = this;
            return function (event) {
                if (self.onInput)
                    self.onInput(event);
                self.interface.setMessage(); // Clear any messages
                self.requestIdCounter += 1;
                var options = {
                    query: this.input.value,
                    _id: self.requestIdCounter
                };
                if (self.options.licensee)
                    options.licensee = self.options.licensee;
                Autocomplete.validSearchFilters.forEach(function (filter) {
                    if (self.searchFilters[filter]) {
                        options[filter] = self.searchFilters[filter];
                    }
                });
                self.client.autocompleteAddress(options);
            };
        };
        // Populates fields with correct address when suggestion selected
        Controller.prototype._onInterfaceSelect = function () {
            var self = this;
            return function (suggestion) {
                var _this = this;
                self.onAddressSelected.call(this, suggestion);
                self.interface.setMessage(); // Clear message
                var callback = function (error, address) {
                    if (error) {
                        self.interface.setMessage("Unable to retrieve your address. Please enter your address manually");
                        return self.onSearchError(error);
                    }
                    self.onAddressRetrieved.call(_this, address);
                    if (self.removeOrganisation) {
                        address = Autocomplete.Utils.removeOrganisation(address);
                    }
                    self.populateAddress(address);
                };
                var options = IdealPostcodes.Utils.extend({}, self.options);
                if (suggestion.umprn) {
                    options["id"] = suggestion.umprn;
                    self.client.lookupUmprn(options, callback);
                }
                else {
                    options["id"] = suggestion.udprn;
                    self.client.lookupUdprn(options, callback);
                }
            };
        };
        // Adds interface to DOM and applies necessary callbacks
        Controller.prototype.attachInterface = function (options) {
            var _this = this;
            if (this.interface)
                return;
            var self = this;
            var interfaceConfig = {
                inputField: options.inputField,
                onInput: self._onInterfaceInput(),
                onSelect: self._onInterfaceSelect()
            };
            Autocomplete.interfaceCallbacks.forEach(function (callbackName) {
                if (interfaceConfig[callbackName])
                    return; // Skip if already defined
                if (options[callbackName])
                    interfaceConfig[callbackName] = options[callbackName];
            });
            self.interface = new Autocomplete.Interface(interfaceConfig);
            self.client.registerAutocompleteCallback(function (error, response, xhr, options) {
                if (error) {
                    self.interface.setMessage("Unable to retrieve address suggestions. Please enter your address manually");
                    return self.onSearchError(error);
                }
                var suggestions = response.hits;
                _this.onSuggestionsRetrieved.call(_this, suggestions, options);
                if (!options || options._id === undefined) {
                    return self.interface.setSuggestions(suggestions);
                }
                if (options._id > self.lastRequestId) {
                    self.lastRequestId = options["_id"];
                    self.interface.setSuggestions(suggestions);
                }
            });
            this.onLoaded.call(this);
        };
        Controller.prototype.detachInterface = function () {
            if (!this.interface)
                return;
            this.interface.detach();
            this.interface = null;
        };
        Controller.prototype.populateAddress = function (address) {
            var _this = this;
            var outputFields = this.outputFields;
            var extractAddressAttr = function (address, attr) {
                var result = address[attr];
                if (_this.titleizePostTown && attr === "post_town") {
                    return Autocomplete.Utils.titleizePostTown(result);
                }
                return result;
            };
            var _loop_1 = function (attr) {
                if (outputFields.hasOwnProperty(attr)) {
                    outputFields[attr].forEach(function (selector) {
                        var inputs = document.querySelectorAll(selector);
                        for (var i = 0; i < inputs.length; i++) {
                            var input = inputs[i];
                            if (typeof input.value === "string") {
                                input.value = extractAddressAttr(address, attr);
                            }
                        }
                    });
                }
            };
            for (var attr in outputFields) {
                _loop_1(attr);
            }
        };
        return Controller;
    }());
    Autocomplete.Controller = Controller;
})(Autocomplete || (Autocomplete = {}));
