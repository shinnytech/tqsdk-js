import http from 'http';
import https from 'https';
import url from 'url';
import assert from 'assert';
import stream from 'stream';
import tty from 'tty';
import util from 'util';
import os from 'os';
import zlib from 'zlib';

var version = "1.1.9";
var db_version = "3";

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);

    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    return fn.apply(thisArg, args);
  };
};

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
};

function isBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
} // For Node v0.10 support. Remove this eventually.


function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
}

/*global toString:true*/
// utils is a library of generic helper functions non-specific to axios


var toString = Object.prototype.toString;
/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */

function isArray(val) {
  return toString.call(val) === '[object Array]';
}
/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */


function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}
/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */


function isFormData(val) {
  return typeof FormData !== 'undefined' && val instanceof FormData;
}
/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */


function isArrayBufferView(val) {
  var result;

  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && val.buffer instanceof ArrayBuffer;
  }

  return result;
}
/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */


function isString(val) {
  return typeof val === 'string';
}
/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */


function isNumber(val) {
  return typeof val === 'number';
}
/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */


function isUndefined(val) {
  return typeof val === 'undefined';
}
/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */


function isObject(val) {
  return val !== null && typeof val === 'object';
}
/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */


function isDate(val) {
  return toString.call(val) === '[object Date]';
}
/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */


function isFile(val) {
  return toString.call(val) === '[object File]';
}
/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */


function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}
/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */


function isFunction(val) {
  return toString.call(val) === '[object Function]';
}
/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */


function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}
/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */


function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}
/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */


function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}
/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */


function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }

  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */


function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  } // Force an array if not already something iterable


  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}
/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */


function merge()
/* obj1, obj2, obj3, ... */
{
  var result = {};

  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }

  return result;
}
/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */


function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer_1,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */

var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;

  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  return error;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */


var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */


var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus; // Note: status is not exposed by XDomainRequest

  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError('Request failed with status code ' + response.status, response.config, null, response.request, response));
  }
};

function encode(val) {
  return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
}
/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */


var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;

  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];
    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }

        parts.push(encode(key) + '=' + encode(v));
      });
    });
    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

// c.f. https://nodejs.org/api/http.html#http_message_headers


var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];
/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */

var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) {
    return parsed;
  }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }

      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });
  return parsed;
};

var isURLSameOrigin = utils.isStandardBrowserEnv() ? // Standard browser envs have full support of the APIs needed to test
// whether the request URL is of the same origin as current location.
function standardBrowserEnv() {
  var msie = /(msie|trident)/i.test(navigator.userAgent);
  var urlParsingNode = document.createElement('a');
  var originURL;
  /**
  * Parse a URL to discover it's components
  *
  * @param {String} url The URL to be parsed
  * @returns {Object}
  */

  function resolveURL(url) {
    var href = url;

    if (msie) {
      // IE needs attribute set twice to normalize properties
      urlParsingNode.setAttribute('href', href);
      href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href); // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils

    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
      hostname: urlParsingNode.hostname,
      port: urlParsingNode.port,
      pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
    };
  }

  originURL = resolveURL(window.location.href);
  /**
  * Determine if a URL shares the same origin as the current location
  *
  * @param {String} requestURL The URL to test
  * @returns {boolean} True if URL shares the same origin, otherwise false
  */

  return function isURLSameOrigin(requestURL) {
    var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
    return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
  };
}() : // Non standard browser envs (web workers, react-native) lack needed support.
function nonStandardBrowserEnv() {
  return function isURLSameOrigin() {
    return true;
  };
}();

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}

E.prototype = new Error();
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa$1(input) {
  var str = String(input);
  var output = '';

  for ( // initialize result and counter
  var block, charCode, idx = 0, map = chars; // if the next str index does not exist:
  //   change the mapping table to "="
  //   check if d has no fractional digits
  str.charAt(idx | 0) || (map = '=', idx % 1); // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
  output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);

    if (charCode > 0xFF) {
      throw new E();
    }

    block = block << 8 | charCode;
  }

  return output;
}

var btoa_1 = btoa$1;

var cookies = utils.isStandardBrowserEnv() ? // Standard browser envs support document.cookie
function standardBrowserEnv() {
  return {
    write: function write(name, value, expires, path, domain, secure) {
      var cookie = [];
      cookie.push(name + '=' + encodeURIComponent(value));

      if (utils.isNumber(expires)) {
        cookie.push('expires=' + new Date(expires).toGMTString());
      }

      if (utils.isString(path)) {
        cookie.push('path=' + path);
      }

      if (utils.isString(domain)) {
        cookie.push('domain=' + domain);
      }

      if (secure === true) {
        cookie.push('secure');
      }

      document.cookie = cookie.join('; ');
    },
    read: function read(name) {
      var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove: function remove(name) {
      this.write(name, '', Date.now() - 86400000);
    }
  };
}() : // Non standard browser env (web workers, react-native) lack needed support.
function nonStandardBrowserEnv() {
  return {
    write: function write() {},
    read: function read() {
      return null;
    },
    remove: function remove() {}
  };
}();

var btoa$2 = typeof window !== 'undefined' && window.btoa && window.btoa.bind(window) || btoa_1;

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false; // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.

    if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined' && window.XDomainRequest && !('withCredentials' in request) && !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;

      request.onprogress = function handleProgress() {};

      request.ontimeout = function handleTimeout() {};
    } // HTTP basic authentication


    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa$2(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true); // Set the request timeout in MS

    request.timeout = config.timeout; // Listen for ready state

    request[loadEvent] = function handleLoad() {
      if (!request || request.readyState !== 4 && !xDomain) {
        return;
      } // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request


      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      } // Prepare the response


      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };
      settle(resolve, reject, response); // Clean up request

      request = null;
    }; // Handle low level network errors


    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request)); // Clean up request

      request = null;
    }; // Handle timeout


    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', request)); // Clean up request

      request = null;
    }; // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.


    if (utils.isStandardBrowserEnv()) {
      var cookies$1 = cookies; // Add xsrf header

      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ? cookies$1.read(config.xsrfCookieName) : undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    } // Add headers to the request


    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    } // Add withCredentials to request if needed


    if (config.withCredentials) {
      request.withCredentials = true;
    } // Add responseType to request if needed


    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    } // Handle progress if needed


    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    } // Not all browsers support upload events


    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel); // Clean up request

        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    } // Send the request


    request.send(requestData);
  });
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

/**
 * Helpers.
 */
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function (val, options) {
  options = options || {};
  var type = typeof val;

  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }

  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */


function parse(str) {
  str = String(str);

  if (str.length > 100) {
    return;
  }

  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);

  if (!match) {
    return;
  }

  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;

    case 'weeks':
    case 'week':
    case 'w':
      return n * w;

    case 'days':
    case 'day':
    case 'd':
      return n * d;

    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;

    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;

    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;

    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;

    default:
      return undefined;
  }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtShort(ms) {
  var msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }

  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }

  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }

  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }

  return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */


function fmtLong(ms) {
  var msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }

  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }

  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }

  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }

  return ms + ' ms';
}
/**
 * Pluralization helper.
 */


function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */


function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = ms;
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      // Disabled?
      if (!debug.enabled) {
        return;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

var common = setup;

var browser = createCommonjsModule(function (module, exports) {

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }
  /* eslint-env browser */

  /**
   * This is the web browser implementation of `debug()`.
   */


  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  /**
   * Colors.
   */

  exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */
  // eslint-disable-next-line complexity

  function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
      return true;
    } // Internet Explorer and Edge do not support colors.


    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    } // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */


  function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

    if (!this.useColors) {
      return;
    }

    var c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into

    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, function (match) {
      if (match === '%%') {
        return;
      }

      index++;

      if (match === '%c') {
        // We only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */


  function log() {
    var _console; // This hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'


    return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */


  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem('debug', namespaces);
      } else {
        exports.storage.removeItem('debug');
      }
    } catch (error) {// Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }
  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */


  function load() {
    var r;

    try {
      r = exports.storage.getItem('debug');
    } catch (error) {} // Swallow
    // XXX (@Qix-) should we be logging these?
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  }
  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */


  function localstorage() {
    try {
      // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
      // The Browser also has localStorage in the global context.
      return localStorage;
    } catch (error) {// Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }

  module.exports = common(exports);
  var formatters = module.exports.formatters;
  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  formatters.j = function (v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return '[UnexpectedJSONParseError]: ' + error.message;
    }
  };
});
var browser_1 = browser.log;
var browser_2 = browser.formatArgs;
var browser_3 = browser.save;
var browser_4 = browser.load;
var browser_5 = browser.useColors;
var browser_6 = browser.storage;
var browser_7 = browser.colors;

var hasFlag = (flag, argv) => {
  argv = argv || process.argv;
  const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
  const pos = argv.indexOf(prefix + flag);
  const terminatorPos = argv.indexOf('--');
  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};

const env = process.env;
let forceColor;

if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
  forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
  forceColor = true;
}

if ('FORCE_COLOR' in env) {
  forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
  if (level === 0) {
    return false;
  }

  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}

function supportsColor(stream) {
  if (forceColor === false) {
    return 0;
  }

  if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
    return 3;
  }

  if (hasFlag('color=256')) {
    return 2;
  }

  if (stream && !stream.isTTY && forceColor !== true) {
    return 0;
  }

  const min = forceColor ? 1 : 0;

  if (process.platform === 'win32') {
    // Node.js 7.5.0 is the first version of Node.js to include a patch to
    // libuv that enables 256 color output on Windows. Anything earlier and it
    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
    // release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
    // release that supports 256 colors. Windows 10 build 14931 is the first release
    // that supports 16m/TrueColor.
    const osRelease = os.release().split('.');

    if (Number(process.versions.node.split('.')[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if ('CI' in env) {
    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
      return 1;
    }

    return min;
  }

  if ('TEAMCITY_VERSION' in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }

  if (env.COLORTERM === 'truecolor') {
    return 3;
  }

  if ('TERM_PROGRAM' in env) {
    const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

    switch (env.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;

      case 'Apple_Terminal':
        return 2;
      // No default
    }
  }

  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }

  if ('COLORTERM' in env) {
    return 1;
  }

  if (env.TERM === 'dumb') {
    return min;
  }

  return min;
}

function getSupportLevel(stream) {
  const level = supportsColor(stream);
  return translateLevel(level);
}

var supportsColor_1 = {
  supportsColor: getSupportLevel,
  stdout: getSupportLevel(process.stdout),
  stderr: getSupportLevel(process.stderr)
};

var node = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */

  /**
   * This is the Node.js implementation of `debug()`.
   */

  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  /**
   * Colors.
   */

  exports.colors = [6, 2, 3, 4, 5, 1];

  try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    var supportsColor = supportsColor_1;

    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
    }
  } catch (error) {} // Swallow - we only care if `supports-color` is available; it doesn't have to be.

  /**
   * Build up the default `inspectOpts` object from the environment variables.
   *
   *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
   */


  exports.inspectOpts = Object.keys(process.env).filter(function (key) {
    return /^debug_/i.test(key);
  }).reduce(function (obj, key) {
    // Camel-case
    var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
      return k.toUpperCase();
    }); // Coerce string value into JS value

    var val = process.env[key];

    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === 'null') {
      val = null;
    } else {
      val = Number(val);
    }

    obj[prop] = val;
    return obj;
  }, {});
  /**
   * Is stdout a TTY? Colored output is enabled when `true`.
   */

  function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  /**
   * Adds ANSI color escape codes if enabled.
   *
   * @api public
   */


  function formatArgs(args) {
    var name = this.namespace,
        useColors = this.useColors;

    if (useColors) {
      var c = this.color;
      var colorCode = "\x1B[3" + (c < 8 ? c : '8;5;' + c);
      var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
      args[0] = prefix + args[0].split('\n').join('\n' + prefix);
      args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + ' ' + args[0];
    }
  }

  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return '';
    }

    return new Date().toISOString() + ' ';
  }
  /**
   * Invokes `util.format()` with the specified arguments and writes to stderr.
   */


  function log() {
    return process.stderr.write(util.format.apply(util, arguments) + '\n');
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */


  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      // If you set a process.env field to null or undefined, it gets cast to the
      // string 'null' or 'undefined'. Just delete instead.
      delete process.env.DEBUG;
    }
  }
  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */


  function load() {
    return process.env.DEBUG;
  }
  /**
   * Init logic for `debug` instances.
   *
   * Create a new `inspectOpts` object in case `useColors` is set
   * differently for a particular `debug` instance.
   */


  function init(debug) {
    debug.inspectOpts = {};
    var keys = Object.keys(exports.inspectOpts);

    for (var i = 0; i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }

  module.exports = common(exports);
  var formatters = module.exports.formatters;
  /**
   * Map %o to `util.inspect()`, all on a single line.
   */

  formatters.o = function (v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, ' ');
  };
  /**
   * Map %O to `util.inspect()`, allowing multiple lines if needed.
   */


  formatters.O = function (v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});
var node_1 = node.init;
var node_2 = node.log;
var node_3 = node.formatArgs;
var node_4 = node.save;
var node_5 = node.load;
var node_6 = node.useColors;
var node_7 = node.colors;
var node_8 = node.inspectOpts;

var src = createCommonjsModule(function (module) {
  /**
   * Detect Electron renderer / nwjs process, which is node, but we should
   * treat as a browser.
   */

  if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
    module.exports = browser;
  } else {
    module.exports = node;
  }
});

var URL = url.URL;
var Writable = stream.Writable;
var debug = src("follow-redirects"); // RFC7231§4.2.1: Of the request methods defined by this specification,
// the GET, HEAD, OPTIONS, and TRACE methods are defined to be safe.

var SAFE_METHODS = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  TRACE: true
}; // Create handlers that pass events from native requests

var eventHandlers = Object.create(null);
["abort", "aborted", "error", "socket", "timeout"].forEach(function (event) {
  eventHandlers[event] = function (arg) {
    this._redirectable.emit(event, arg);
  };
}); // An HTTP(S) request that can be redirected

function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  options.headers = options.headers || {};
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = []; // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.

  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }

    delete options.host;
  } // Attach a callback if passed


  if (responseCallback) {
    this.on("response", responseCallback);
  } // React to responses of native requests


  var self = this;

  this._onNativeResponse = function (response) {
    self._processResponse(response);
  }; // Complete the URL object when necessary


  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");

    if (searchPos < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  } // Perform the first request


  this._performRequest();
}

RedirectableRequest.prototype = Object.create(Writable.prototype); // Writes buffered data to the current native request

RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new Error("write after end");
  } // Validate input and shift parameters if necessary


  if (!(typeof data === "string" || typeof data === "object" && "length" in data)) {
    throw new Error("data should be a string, Buffer or Uint8Array");
  }

  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  } // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066


  if (data.length === 0) {
    if (callback) {
      callback();
    }

    return;
  } // Only write when we don't exceed the maximum body length


  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;

    this._requestBodyBuffers.push({
      data: data,
      encoding: encoding
    });

    this._currentRequest.write(data, encoding, callback);
  } // Error when we exceed the maximum body length
  else {
      this.emit("error", new Error("Request body larger than maxBodyLength limit"));
      this.abort();
    }
}; // Ends the current native request


RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  } else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  } // Write data if needed and end


  if (!data) {
    this._ended = this._ending = true;

    this._currentRequest.end(null, null, callback);
  } else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
}; // Sets a header value on the current native request


RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;

  this._currentRequest.setHeader(name, value);
}; // Clears a header value on the current native request


RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];

  this._currentRequest.removeHeader(name);
}; // Global timeout for all underlying requests


RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  if (callback) {
    this.once("timeout", callback);
  }

  if (this.socket) {
    startTimer(this, msecs);
  } else {
    var self = this;

    this._currentRequest.once("socket", function () {
      startTimer(self, msecs);
    });
  }

  this.once("response", clearTimer);
  this.once("error", clearTimer);
  return this;
};

function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(function () {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
} // Proxy all other public ClientRequest methods


["abort", "flushHeaders", "getHeader", "setNoDelay", "setSocketKeepAlive"].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
}); // Proxy all public ClientRequest properties

["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () {
      return this._currentRequest[property];
    }
  });
}); // Executes the next native request (initial or redirect)

RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];

  if (!nativeProtocol) {
    this.emit("error", new Error("Unsupported protocol " + protocol));
    return;
  } // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)


  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  } // Create the native request


  var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url.format(this._options); // Set up event handlers

  request._redirectable = this;

  for (var event in eventHandlers) {
    /* istanbul ignore else */
    if (event) {
      request.on(event, eventHandlers[event]);
    }
  } // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)


  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;

    (function writeNext(error) {
      // Only write if this request has not been redirected yet

      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors

        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        } // Write the next buffer if there are still left
        else if (i < buffers.length) {
            var buffer = buffers[i++];
            /* istanbul ignore else */

            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } // End the request if `end` has been called on us
          else if (self._ended) {
              request.end();
            }
      }
    })();
  }
}; // Processes a response from the current native request


RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: response.statusCode
    });
  } // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.


  var location = response.headers.location;

  if (location && this._options.followRedirects !== false && response.statusCode >= 300 && response.statusCode < 400) {
    // Abort the current request
    this._currentRequest.removeAllListeners();

    this._currentRequest.on("error", noop);

    this._currentRequest.abort(); // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).


    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new Error("Max redirects exceeded."));
      return;
    } // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe […],
    // since the user might not wish to redirect an unsafe request.
    // RFC7231§6.4.7: The 307 (Temporary Redirect) status code indicates
    // that the target resource resides temporarily under a different URI
    // and the user agent MUST NOT change the request method
    // if it performs an automatic redirection to that URI.


    var header;
    var headers = this._options.headers;

    if (response.statusCode !== 307 && !(this._options.method in SAFE_METHODS)) {
      this._options.method = "GET"; // Drop a possible entity and headers related to it

      this._requestBodyBuffers = [];

      for (header in headers) {
        if (/^content-/i.test(header)) {
          delete headers[header];
        }
      }
    } // Drop the Host header, as the redirect might lead to a different host


    if (!this._isRedirect) {
      for (header in headers) {
        if (/^host$/i.test(header)) {
          delete headers[header];
        }
      }
    } // Perform the redirected request


    var redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    Object.assign(this._options, url.parse(redirectUrl));
    this._isRedirect = true;

    this._performRequest(); // Discard the remainder of the response to avoid waiting for data


    response.destroy();
  } else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response); // Clean up

    this._requestBodyBuffers = [];
  }
}; // Wraps the key/value object of protocols with redirect functionality


function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  }; // Wrap each protocol

  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol); // Executes a request, following redirects

    wrappedProtocol.request = function (input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;

        try {
          input = urlToOptions(new URL(urlStr));
        } catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      } else if (URL && input instanceof URL) {
        input = urlToOptions(input);
      } else {
        callback = options;
        options = input;
        input = {
          protocol: protocol
        };
      }

      if (typeof options === "function") {
        callback = options;
        options = null;
      } // Set defaults


      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }; // Executes a GET request, following redirects


    wrappedProtocol.get = function (input, options, callback) {
      var request = wrappedProtocol.request(input, options, callback);
      request.end();
      return request;
    };
  });
  return exports;
}
/* istanbul ignore next */


function noop() {}
/* empty */
// from https://github.com/nodejs/node/blob/master/lib/internal/url.js


function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
    /* istanbul ignore next */
    urlObject.hostname.slice(1, -1) : urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href
  };

  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }

  return options;
} // Exports


var followRedirects = wrap({
  http: http,
  https: https
});
var wrap_1 = wrap;
followRedirects.wrap = wrap_1;

var _args = [
	[
		"axios@0.18.0",
		"/Users/yanqiong/Documents/shinny/tqsdk-js"
	]
];
var _from = "axios@0.18.0";
var _id = "axios@0.18.0";
var _inBundle = false;
var _integrity = "sha1-MtU+SFHv3AoRmTts0AB4nXDAUQI=";
var _location = "/axios";
var _phantomChildren = {
};
var _requested = {
	type: "version",
	registry: true,
	raw: "axios@0.18.0",
	name: "axios",
	escapedName: "axios",
	rawSpec: "0.18.0",
	saveSpec: null,
	fetchSpec: "0.18.0"
};
var _requiredBy = [
	"/"
];
var _resolved = "https://registry.npmjs.org/axios/-/axios-0.18.0.tgz";
var _spec = "0.18.0";
var _where = "/Users/yanqiong/Documents/shinny/tqsdk-js";
var author = {
	name: "Matt Zabriskie"
};
var browser$1 = {
	"./lib/adapters/http.js": "./lib/adapters/xhr.js"
};
var bugs = {
	url: "https://github.com/axios/axios/issues"
};
var bundlesize = [
	{
		path: "./dist/axios.min.js",
		threshold: "5kB"
	}
];
var dependencies = {
	"follow-redirects": "^1.3.0",
	"is-buffer": "^1.1.5"
};
var description = "Promise based HTTP client for the browser and node.js";
var devDependencies = {
	bundlesize: "^0.5.7",
	coveralls: "^2.11.9",
	"es6-promise": "^4.0.5",
	grunt: "^1.0.1",
	"grunt-banner": "^0.6.0",
	"grunt-cli": "^1.2.0",
	"grunt-contrib-clean": "^1.0.0",
	"grunt-contrib-nodeunit": "^1.0.0",
	"grunt-contrib-watch": "^1.0.0",
	"grunt-eslint": "^19.0.0",
	"grunt-karma": "^2.0.0",
	"grunt-ts": "^6.0.0-beta.3",
	"grunt-webpack": "^1.0.18",
	"istanbul-instrumenter-loader": "^1.0.0",
	"jasmine-core": "^2.4.1",
	karma: "^1.3.0",
	"karma-chrome-launcher": "^2.0.0",
	"karma-coverage": "^1.0.0",
	"karma-firefox-launcher": "^1.0.0",
	"karma-jasmine": "^1.0.2",
	"karma-jasmine-ajax": "^0.1.13",
	"karma-opera-launcher": "^1.0.0",
	"karma-safari-launcher": "^1.0.0",
	"karma-sauce-launcher": "^1.1.0",
	"karma-sinon": "^1.0.5",
	"karma-sourcemap-loader": "^0.3.7",
	"karma-webpack": "^1.7.0",
	"load-grunt-tasks": "^3.5.2",
	minimist: "^1.2.0",
	sinon: "^1.17.4",
	typescript: "^2.0.3",
	"url-search-params": "^0.6.1",
	webpack: "^1.13.1",
	"webpack-dev-server": "^1.14.1"
};
var homepage = "https://github.com/axios/axios";
var keywords = [
	"xhr",
	"http",
	"ajax",
	"promise",
	"node"
];
var license = "MIT";
var main = "index.js";
var name = "axios";
var repository = {
	type: "git",
	url: "git+https://github.com/axios/axios.git"
};
var scripts = {
	build: "NODE_ENV=production grunt build",
	coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
	examples: "node ./examples/server.js",
	postversion: "git push && git push --tags",
	preversion: "npm test",
	start: "node ./sandbox/server.js",
	test: "grunt test && bundlesize",
	version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json"
};
var typings = "./index.d.ts";
var version$1 = "0.18.0";
var _package = {
	_args: _args,
	_from: _from,
	_id: _id,
	_inBundle: _inBundle,
	_integrity: _integrity,
	_location: _location,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_spec: _spec,
	_where: _where,
	author: author,
	browser: browser$1,
	bugs: bugs,
	bundlesize: bundlesize,
	dependencies: dependencies,
	description: description,
	devDependencies: devDependencies,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	name: name,
	repository: repository,
	scripts: scripts,
	typings: typings,
	version: version$1
};

var _package$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  _args: _args,
  _from: _from,
  _id: _id,
  _inBundle: _inBundle,
  _integrity: _integrity,
  _location: _location,
  _phantomChildren: _phantomChildren,
  _requested: _requested,
  _requiredBy: _requiredBy,
  _resolved: _resolved,
  _spec: _spec,
  _where: _where,
  author: author,
  browser: browser$1,
  bugs: bugs,
  bundlesize: bundlesize,
  dependencies: dependencies,
  description: description,
  devDependencies: devDependencies,
  homepage: homepage,
  keywords: keywords,
  license: license,
  main: main,
  name: name,
  repository: repository,
  scripts: scripts,
  typings: typings,
  version: version$1,
  'default': _package
});

var pkg = getCjsExportFromNamespace(_package$1);

var httpFollow = followRedirects.http;
var httpsFollow = followRedirects.https;
/*eslint consistent-return:0*/

var http_1 = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolve, reject) {
    var data = config.data;
    var headers = config.headers;
    var timer; // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69

    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) ; else if (utils.isArrayBuffer(data)) {
        data = new Buffer(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = new Buffer(data, 'utf-8');
      } else {
        return reject(createError('Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream', config));
      } // Add Content-Length header if data exists


      headers['Content-Length'] = data.length;
    } // HTTP basic authentication


    var auth = undefined;

    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    } // Parse url


    var parsed = url.parse(config.url);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttps = protocol === 'https:';
    var agent = isHttps ? config.httpsAgent : config.httpAgent;
    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method,
      headers: headers,
      agent: agent,
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;

    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];

      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        proxy = {
          host: parsedProxyUrl.hostname,
          port: parsedProxyUrl.port
        };

        if (parsedProxyUrl.auth) {
          var proxyUrlAuth = parsedProxyUrl.auth.split(':');
          proxy.auth = {
            username: proxyUrlAuth[0],
            password: proxyUrlAuth[1]
          };
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path; // Basic proxy authorization

      if (proxy.auth) {
        var base64 = new Buffer(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }

    var transport;

    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttps ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }

      transport = isHttps ? httpsFollow : httpFollow;
    }

    if (config.maxContentLength && config.maxContentLength > -1) {
      options.maxBodyLength = config.maxContentLength;
    } // Create the request


    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return; // Response has been received so kill timer that handles request timeout

      clearTimeout(timer);
      timer = null; // uncompress the response body transparently if required

      var stream = res;

      switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
          // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip()); // remove the content-encoding in order to not confuse downstream operations

          delete res.headers['content-encoding'];
          break;
      } // return the last request in case of redirects


      var lastRequest = res.req || req;
      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk); // make sure the content length is not over the maxContentLength if specified

          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded', config, null, lastRequest));
          }
        });
        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });
        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);

          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString('utf8');
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    }); // Handle errors

    req.on('error', function handleRequestError(err) {
      if (req.aborted) return;
      reject(enhanceError(err, config, null, req));
    }); // Handle request timeout

    if (config.timeout && !timer) {
      timer = setTimeout(function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      }, config.timeout);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;
        req.abort();
        reject(cancel);
      });
    } // Send the request


    if (utils.isStream(data)) {
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;

  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = http_1;
  }

  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),
  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
      return data;
    }

    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }

    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }

    return data;
  }],
  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        /* Ignore */
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  maxContentLength: -1,
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};
defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});
var defaults_1 = defaults;

function InterceptorManager() {
  this.handlers = [];
}
/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */


InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};
/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */


InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};
/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */


InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */


var transformData = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });
  return data;
};

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */

var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */

var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
};

/**
 * Throws a `Cancel` if cancellation has been requested.
 */


function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}
/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */


var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config); // Support baseURL config

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  } // Ensure headers exist


  config.headers = config.headers || {}; // Transform request data

  config.data = transformData(config.data, config.headers, config.transformRequest); // Flatten headers

  config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers || {});
  utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function cleanHeaderConfig(method) {
    delete config.headers[method];
  });
  var adapter = config.adapter || defaults_1.adapter;
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config); // Transform response data

    response.data = transformData(response.data, response.headers, config.transformResponse);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config); // Transform response data

      if (reason && reason.response) {
        reason.response.data = transformData(reason.response.data, reason.response.headers, config.transformResponse);
      }
    }

    return Promise.reject(reason);
  });
};

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */


function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}
/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */


Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults_1, {
    method: 'get'
  }, this.defaults, config);
  config.method = config.method.toLowerCase(); // Hook up interceptors middleware

  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
}; // Provide aliases for supported request methods


utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
var Axios_1 = Axios;

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */

function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;
var Cancel_1 = Cancel;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */


function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });
  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}
/**
 * Throws a `Cancel` if cancellation has been requested.
 */


CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};
/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */


CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */

var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */


function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context); // Copy axios.prototype to instance

  utils.extend(instance, Axios_1.prototype, context); // Copy context to instance

  utils.extend(instance, context);
  return instance;
} // Create the default instance to be exported


var axios = createInstance(defaults_1); // Expose Axios class to allow class inheritance

axios.Axios = Axios_1; // Factory for creating new instances

axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults_1, instanceConfig));
}; // Expose Cancel & CancelToken


axios.Cancel = Cancel_1;
axios.CancelToken = CancelToken_1;
axios.isCancel = isCancel; // Expose all/spread

axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = spread;
var axios_1 = axios; // Allow use of default import syntax in TypeScript

var default_1 = axios;
axios_1.default = default_1;

var axios$1 = axios_1;

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var check = function (it) {
  return it && it.Math == Math && it;
}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


var global_1 = // eslint-disable-next-line no-undef
check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var descriptors = !fails(function () {
  return Object.defineProperty({}, 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
  1: 2
}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;
var objectPropertyIsEnumerable = {
  f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString$1 = {}.toString;

var classofRaw = function (it) {
  return toString$1.call(it).slice(8, -1);
};

var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject$1 = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string

var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject$1(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject$1(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

var EXISTS = isObject$1(document$1) && isObject$1(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) {
    /* empty */
  }
  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};
var objectGetOwnPropertyDescriptor = {
  f: f$1
};

var anObject = function (it) {
  if (!isObject$1(it)) {
    throw TypeError(String(it) + ' is not an object');
  }

  return it;
};

var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty

var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var objectDefineProperty = {
  f: f$2
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  }

  return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});
var sharedStore = store;

var shared = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.4.4',
    mode:  'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
});

var functionToString = shared('native-function-to-string', Function.toString);

var WeakMap = global_1.WeakMap;
var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;

    if (!isObject$1(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    }

    return state;
  };
};

if (nativeWeakMap) {
  var store$1 = new WeakMap$1();
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;

  set = function (it, metadata) {
    wmset.call(store$1, it, metadata);
    return metadata;
  };

  get = function (it) {
    return wmget.call(store$1, it) || {};
  };

  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;

  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };

  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };

  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor
};

var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(functionToString).split('toString');
  shared('inspectSource', function (it) {
    return functionToString.call(it);
  });
  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;

    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }

    if (O === global_1) {
      if (simple) O[key] = value;else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }

    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
  });
});

var path = global_1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var ceil = Math.ceil;
var floor = Math.floor; // `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger

var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var min = Math.min; // `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength

var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min; // Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    }
    return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }

  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
  f: f$3
};

var f$4 = Object.getOwnPropertySymbols;
var objectGetOwnPropertySymbols = {
  f: f$4
};

var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';
var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/

var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }

  if (target) for (key in source) {
    sourceProperty = source[key];

    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];

    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    } // add a flag to not completely full polyfills


    if (options.sham || targetProperty && targetProperty.sham) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    } // extend global


    redefine(target, key, sourceProperty, options);
  }
};

var aFunction$1 = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  }

  return it;
};

var bindContext = function (fn, that, length) {
  aFunction$1(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 0:
      return function () {
        return fn.call(that);
      };

    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }

  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var html = getBuiltIn('document', 'documentElement');

var userAgent = getBuiltIn('navigator', 'userAgent') || '';

var isIos = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);

var location = global_1.location;
var set$1 = global_1.setImmediate;
var clear = global_1.clearImmediate;
var process$1 = global_1.process;
var MessageChannel = global_1.MessageChannel;
var Dispatch = global_1.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global_1.postMessage(id + '', location.protocol + '//' + location.host);
}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


if (!set$1 || !clear) {
  set$1 = function setImmediate(fn) {
    var args = [];
    var i = 1;

    while (arguments.length > i) args.push(arguments[i++]);

    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };

    defer(counter);
    return counter;
  };

  clear = function clearImmediate(id) {
    delete queue[id];
  }; // Node.js 0.8-


  if (classofRaw(process$1) == 'process') {
    defer = function (id) {
      process$1.nextTick(runner(id));
    }; // Sphere (JS game engine) Dispatch API

  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    }; // Browsers with MessageChannel, includes WebWorkers
    // except iOS - https://github.com/zloirock/core-js/issues/624

  } else if (MessageChannel && !isIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post)) {
    defer = post;
    global_1.addEventListener('message', listener, false); // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    }; // Rest old browsers

  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task = {
  set: set$1,
  clear: clear
};

var FORCED = !global_1.setImmediate || !global_1.clearImmediate; // http://w3c.github.io/setImmediate/

_export({
  global: true,
  bind: true,
  enumerable: true,
  forced: FORCED
}, {
  // `setImmediate` method
  // http://w3c.github.io/setImmediate/#si-setImmediate
  setImmediate: task.set,
  // `clearImmediate` method
  // http://w3c.github.io/setImmediate/#si-clearImmediate
  clearImmediate: task.clear
});

var setImmediate$1 = path.setImmediate;

var eventemitter3 = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty,
      prefix = '~';
  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */

  function Events() {} //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //


  if (Object.create) {
    Events.prototype = Object.create(null); //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //

    if (!new Events().__proto__) prefix = false;
  }
  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */


  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */


  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once),
        evt = prefix ? prefix + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */


  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
  }
  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */


  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */


  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;
    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };
  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */


  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
        handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };
  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */


  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
        listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };
  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */


  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;

        case 2:
          return listeners.fn.call(listeners.context, a1), true;

        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;

        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;

        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
          j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;

          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;

          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;

          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;

          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };
  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return this;

    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      } //
      // Reset the array, or remove it completely if we have no more listeners.
      //


      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
    }

    return this;
  };
  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  }; //
  // Alias methods names because people roll like that.
  //


  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
  // Expose the prefix.
  //

  EventEmitter.prefixed = prefix; //
  // Allow `EventEmitter` to be imported as module namespace.
  //

  EventEmitter.EventEmitter = EventEmitter; //
  // Expose the module.
  //

  {
    module.exports = EventEmitter;
  }
});

var IsEmptyObject = function IsEmptyObject(obj) {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0;
};

var RandomStr = function RandomStr() {
  var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
  var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var s = '';

  for (var i = 0; i < len; i++) {
    s += charts[Math.random() * 0x3e | 0];
  }

  return s;
};

function _genList(str) {
  // string 根据 | 分割为数组
  var list = [];
  var items = str.split('|');

  for (var i = 0; i < items.length; i++) {
    list.push(items[i].trim()); // NOTE: 有些竖线之间内容为空
  }

  return list;
}

function _genItem(keys, values) {
  // 根据 keys - values 返回 object
  var item = {};

  for (var j = 0; j < keys.length; j++) {
    item[keys[j]] = values[j];
  }

  return item;
}

function _genTableRow(state, stateDetail, colNames, line) {
  // 根据 参数 处理表格的一行
  var result = {
    state: state,
    state_detail: stateDetail,
    isRow: false,
    row: null
  };

  switch (stateDetail) {
    case 'T':
      // title
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'C';
      } else {
        colNames[state] = _genList(line);
      }

      break;

    case 'C':
      // content
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'S';
      } else {
        result.isRow = true;
        result.row = _genItem(colNames[state], _genList(line));
      }

      break;

    case 'S':
      if (line.replace(/-/g, '') === '') {
        result.state = '';
        result.state_detail = '';
      }

      break;
  }

  return result;
}

var ParseSettlementContent = function ParseSettlementContent() {
  var txt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  if (txt === '') return txt;
  var lines = txt.split('\n');
  var state = ''; // A = Account Summary; T = Transaction Record; PD = Positions Detail; P = Positions

  var stateDetail = ''; // T = title; C = content; S = summary

  var colNames = {}; // 需要处理的表格

  var tableStatesTitles = {
    positionClosed: '平仓明细 Position Closed',
    transactionRecords: '成交记录 Transaction Record',
    positions: '持仓汇总 Positions',
    positionsDetail: '持仓明细 Positions Detail',
    delivery: '交割明细  Delivery'
  };
  var states = [];
  var titles = [];
  var result = {
    account: {}
  };
  Object.entries(tableStatesTitles).forEach(function (item) {
    states.push(item[0]);
    titles.push(item[1]);
    result[item[0]] = [];
  });

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line === '资金状况  币种：人民币  Account Summary  Currency：CNY') {
      state = 'A-S';
      i++;
      continue;
    } else if (titles.includes(line)) {
      state = states[titles.indexOf(line)];
      stateDetail = 'T';
      i++;
      continue;
    }

    if (state === 'A-S') {
      if (line.length === 0 || line.replace('-', '') === '') {
        state = '';
        continue;
      } else {
        // eslint-disable-next-line no-unused-vars
        var chMatches = line.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]+[\u4e00-\u9fa5])+/g); // 中文
        // eslint-disable-next-line no-useless-escape

        var enMatches = line.match(/([A-Z][a-zA-Z\.\/\(\)\s]+)[:：]+/g); // 英文

        var numMatches = line.match(/(-?[\d]+\.\d\d)/g); // 数字

        for (var j = 0; j < enMatches.length; j++) {
          result.account[enMatches[j].split(/[:：]/)[0]] = numMatches[j];
        }
      }
    } else if (states.includes(state)) {
      if (line.length === 0) {
        state = '';
        continue;
      } else {
        var tableRow = _genTableRow(state, stateDetail, colNames, line);

        state = tableRow.state;
        stateDetail = tableRow.state_detail;

        if (tableRow.isRow) {
          result[state].push(tableRow.row);
        }
      }
    }
  }

  return result;
};

/**
 * let ws = new TqWebsocket(url, options)
 * PARAMS:
 *   url [string | array]
 *   options [object]
 *       { reconnectInterval, -- 重连时间间隔
 *        reconnectMaxTimes  -- 重连最大次数
 *       }
 *
 * METHODS:
 *   ws.init()
 *   ws.on(eventName, (data) => {......})
 *      eventName =
 *      ['message', -- 收到信息
 *       'open', -- 连接建立
 *       'reconnect', -- 重新开始建立连接
 *       'close', -- 某个连接关闭
 *       'error', -- 某个连接报错
 *       'death' -- 不再重连
 *      ]
 *   ws.send( [obj | string] )
 *   ws.close()
 */

var TqWebsocket =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(TqWebsocket, _EventEmitter);

  function TqWebsocket(url) {
    var _this2;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TqWebsocket);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TqWebsocket).call(this));
    _this2.urlList = url instanceof Array ? url : [url];
    _this2.ws = null;
    _this2.queue = []; // 自动重连开关

    _this2.reconnect = true;
    _this2.reconnectTask = null;
    _this2.reconnectInterval = options.reconnectInterval ? options.reconnectInterval : 3000;
    _this2.reconnectMaxTimes = options.reconnectMaxTimes ? options.reconnectMaxTimes : 2;
    _this2.reconnectTimes = 0;
    _this2.reconnectUrlIndex = 0;
    _this2.STATUS = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    _this2.__init();

    return _this2;
  } // string or object


  _createClass(TqWebsocket, [{
    key: "send",
    value: function send(obj) {
      var objToJson = JSON.stringify(obj);

      if (this.isReady()) {
        this.ws.send(objToJson);
      } else {
        this.queue.push(objToJson);
      }
    }
  }, {
    key: "isReady",
    value: function isReady() {
      return this.ws.readyState === WebSocket.OPEN;
    }
  }, {
    key: "__init",
    value: function __init() {
      this.ws = new WebSocket(this.urlList[this.reconnectUrlIndex]);

      if (this.reconnectUrlIndex === this.urlList.length - 1) {
        // urlList 循环尝试重连一轮, times += 1
        this.reconnectTimes += 1;
      }

      var _this = this;

      this.ws.onmessage = function (message) {
        // eslint-disable-next-line no-eval
        var data = eval('(' + message.data + ')');

        _this.emit('message', data);

        setImmediate(function () {
          _this.ws.send('{"aid":"peek_message"}');
        });
      };

      this.ws.onclose = function (event) {
        console.log('close', event);

        _this.emit('close'); // 清空 queue


        _this.queue = []; // 自动重连

        if (_this.reconnect) {
          if (_this.reconnectMaxTimes <= _this.reconnectTimes) {
            clearTimeout(_this.reconnectTask);

            _this.emit('death', {
              msg: '超过重连次数' + _this.reconnectMaxTimes
            });
          } else {
            _this.reconnectTask = setTimeout(function () {
              if (_this.ws.readyState === 3) {
                // 每次重连的时候设置 _this.reconnectUrlIndex
                _this.reconnectUrlIndex = _this.reconnectUrlIndex + 1 < _this.urlList.length ? _this.reconnectUrlIndex + 1 : 0;

                _this.__init();

                _this.emit('reconnect', {
                  msg: '发起重连第 ' + _this.reconnectTimes + ' 次'
                });
              }
            }, _this.reconnectInterval);
          }
        }
      };

      this.ws.onerror = function (error) {
        _this.emit('error', error);

        _this.ws.close();
      };

      this.ws.onopen = function () {
        _this.emit('open', {
          msg: '发起重连第 ' + _this.reconnectTimes + ' 次, 成功'
        });

        _this.reconnectTimes = 0;
        _this.reconnectUrlIndex = 0;

        if (this.reconnectTask) {
          clearTimeout(_this.reconnectTask);
        }

        while (_this.queue.length > 0) {
          if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift());else break;
        }
      };
    }
  }, {
    key: "close",
    value: function close() {
      this.ws.onclose = function () {};

      this.ws.close();
    }
  }]);

  return TqWebsocket;
}(eventemitter3);

var TqTradeWebsocket =
/*#__PURE__*/
function (_TqWebsocket) {
  _inherits(TqTradeWebsocket, _TqWebsocket);

  function TqTradeWebsocket(url, dm) {
    var _this3;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqTradeWebsocket);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(TqTradeWebsocket).call(this, url, options));
    _this3.dm = dm; // 记录重连时需要重发的数据

    _this3.req_login = null;

    _this3.init();

    return _this3;
  }

  _createClass(TqTradeWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          var notifies = self._separateNotifies(payload.data);

          for (var i = 0; i < notifies.length; i++) {
            self.emit('notify', notifies[i]);
          }

          self.dm.mergeData(payload.data);
        } else if (payload.aid === 'rtn_brokers') {
          self.emit('rtn_brokers', payload.brokers);
        } else if (payload.aid === 'qry_settlement_info') {
          // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
          var content = ParseSettlementContent(payload.settlement_info); // 1 写入 dm

          self.dm.mergeData({
            trade: _defineProperty({}, payload.user_name, {
              his_settlements: _defineProperty({}, payload.trading_day, content)
            })
          }); // 2 存入缓存

          if (TQSDK.store) TQSDK.store.setContent(payload.user_name, payload.trading_day, payload.settlement_info);
        }
      });
      this.on('reconnect', function () {
        if (self.req_login) self.send(self.req_login);
      });
    }
  }, {
    key: "_separateNotifies",
    value: function _separateNotifies(data) {
      var notifies = [];

      for (var i = 0; i < data.length; i++) {
        if (data[i].notify) {
          var notify = data.splice(i--, 1)[0].notify;

          for (var k in notify) {
            notifies.push(notify[k]);
          }
        }
      }

      return notifies;
    }
  }, {
    key: "send",
    value: function send(obj) {
      if (obj.aid === 'req_login') {
        this.req_login = obj;
      }

      _get(_getPrototypeOf(TqTradeWebsocket.prototype), "send", this).call(this, obj);
    }
  }]);

  return TqTradeWebsocket;
}(TqWebsocket);

var TqQuoteWebsocket =
/*#__PURE__*/
function (_TqWebsocket2) {
  _inherits(TqQuoteWebsocket, _TqWebsocket2);

  function TqQuoteWebsocket(url, dm) {
    var _this4;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqQuoteWebsocket);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(TqQuoteWebsocket).call(this, url, options));
    _this4.dm = dm; // 记录重连时需要重发的数据

    _this4.subscribe_quote = null;
    _this4.charts = {};

    _this4.init();

    return _this4;
  }

  _createClass(TqQuoteWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          self.dm.mergeData(payload.data);
        }
      });
      this.on('reconnect', function (e) {
        console.log(e);

        if (self.subscribe_quote) {
          self.send(self.subscribe_quote);
        }

        for (var chartId in self.charts) {
          if (self.charts[chartId].view_width > 0) {
            self.send(self.charts[chartId]);
          }
        }
      });
    }
  }, {
    key: "send",
    value: function send(obj) {
      if (obj.aid === 'subscribe_quote') {
        if (this.subscribe_quote === null || JSON.stringify(obj.ins_list) !== JSON.stringify(this.subscribe_quote.ins_list)) {
          this.subscribe_quote = obj;

          _get(_getPrototypeOf(TqQuoteWebsocket.prototype), "send", this).call(this, obj);
        }
      } else if (obj.aid === 'set_chart') {
        if (obj.view_width === 0) {
          if (this.charts[obj.chart_id]) delete this.charts[obj.chart_id];
        } else {
          this.charts[obj.chart_id] = obj;
        }

        _get(_getPrototypeOf(TqQuoteWebsocket.prototype), "send", this).call(this, obj);
      }
    }
  }]);

  return TqQuoteWebsocket;
}(TqWebsocket);

var TqRecvOnlyWebsocket =
/*#__PURE__*/
function (_TqWebsocket3) {
  _inherits(TqRecvOnlyWebsocket, _TqWebsocket3);

  function TqRecvOnlyWebsocket(url, dm) {
    var _this5;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqRecvOnlyWebsocket);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(TqRecvOnlyWebsocket).call(this, url, options));
    _this5.dm = dm;

    _this5.init();

    return _this5;
  }

  _createClass(TqRecvOnlyWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          self.dm.mergeData(payload.data);
        }
      });
      this.on('reconnect', function (e) {
        console.log(e);
      });
    }
  }]);

  return TqRecvOnlyWebsocket;
}(TqWebsocket);

/* eslint-disable camelcase */
var QUOTE =
/*#__PURE__*/
function () {
  function QUOTE() {
    _classCallCheck(this, QUOTE);

    this.instrument_id = ''; // 'SHFE.au1906'

    this.datetime = ''; // "2017-07-26 23:04:21.000001" (行情从交易所发出的时间(北京时间))

    this._last_price = '-'; // 最新价 NaN

    this.ask_price1 = '-'; // 卖一价 NaN

    this.ask_volume1 = '-'; // 卖一量 0

    this.bid_price1 = '-'; // 买一价 NaN

    this.bid_volume1 = '-'; // 买一量 0

    this.highest = '-'; // 当日最高价 NaN

    this.lowest = '-'; // 当日最低价 NaN

    this.open = '-'; // 开盘价 NaN

    this.close = '-'; // 收盘价 NaN

    this.average = '-'; // 当日均价 NaN

    this.volume = '-'; // 成交量 0

    this.amount = '-'; // 成交额 NaN

    this.open_interest = '-'; // 持仓量 0

    this.lower_limit = '-'; // 跌停 NaN

    this.upper_limit = '-'; // 涨停 NaN

    this.settlement = '-'; // 结算价 NaN

    this.change = '-'; // 涨跌

    this.change_percent = '-'; // 涨跌幅

    this.strike_price = NaN; // 行权价

    this.pre_open_interest = '-'; // 昨持仓量

    this.pre_close = '-'; // 昨收盘价

    this.pre_volume = '-'; // 昨成交量

    this._pre_settlement = '-'; // 昨结算价

    this.margin = '-'; // 每手保证金

    this.commission = '-'; // 每手手续费
    // 合约服务附带参数
    // class: '', // ['FUTURE' 'FUTURE_INDEX' 'FUTURE_CONT']
    // ins_id: '',
    // ins_name: '',
    // exchange_id: '',
    // sort_key: '',
    // expired: false,
    // py: '',
    // product_id: '',
    // product_short_name: '',
    // underlying_product: '',
    // underlying_symbol: '', // 标的合约
    // delivery_year: 0,
    // delivery_month: 0,
    // expire_datetime: 0,
    // trading_time: {},
    // volume_multiple: 0, // 合约乘数
    // price_tick: 0, // 合约价格单位
    // price_decs: 0, // 合约价格小数位数
    // max_market_order_volume: 1000, // 市价单最大下单手数
    // min_market_order_volume: 1, // 市价单最小下单手数
    // max_limit_order_volume: 1000, // 限价单最大下单手数
    // min_limit_order_volume: 1, // 限价单最小下单手数
  }

  _createClass(QUOTE, [{
    key: "setChange",
    value: function setChange() {
      if (Number.isFinite(this._last_price) && Number.isFinite(this._pre_settlement) && this._pre_settlement !== 0) {
        this.change = this._last_price - this._pre_settlement;
        this.change_percent = this.change / this._pre_settlement * 100;
      }
    }
  }, {
    key: "last_price",
    set: function set(p) {
      this._last_price = p;
      this.setChange();
    },
    get: function get() {
      return this._last_price;
    }
  }, {
    key: "pre_settlement",
    set: function set(p) {
      this._pre_settlement = p;
      this.setChange();
    },
    get: function get() {
      return this._pre_settlement;
    }
  }]);

  return QUOTE;
}();

var DataManager =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(DataManager, _EventEmitter);

  function DataManager() {
    var _this;

    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DataManager);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DataManager).call(this));
    _this._epoch = 0; // 数据版本控制

    _this._data = data;
    _this._diffs = [];
    return _this;
  }

  _createClass(DataManager, [{
    key: "mergeData",
    value: function mergeData(source) {
      var epochIncrease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var deleteNullObj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var sourceArr = Array.isArray(source) ? source : [source];

      if (epochIncrease) {
        // 如果 _epoch 需要增加，就是需要记下来 diffs
        this._epoch += 1;
        this._diffs = sourceArr;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sourceArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          // 过滤掉空对象
          if (item === null || IsEmptyObject(item)) continue;
          DataManager.MergeObject(this._data, item, this._epoch, deleteNullObj);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (epochIncrease && this._data._epoch === this._epoch) {
        this.emit('data', null);
      }
    }
    /**
     * 判断 某个路径下 或者 某个数据对象 最近有没有更新
     * @param {Array | Object} pathArray | object
     */

  }, {
    key: "isChanging",
    value: function isChanging(pathArray) {
      // _data 中，只能找到对象类型中记录的 _epoch
      if (Array.isArray(pathArray)) {
        var d = this._data;

        for (var i = 0; i < pathArray.length; i++) {
          d = d[pathArray[i]];
          if (d._epoch && d._epoch === this._epoch) return true;
          if (d === undefined) return false;
        }

        return false;
      } else if (pathArray && pathArray._epoch) {
        return pathArray._epoch === this._epoch;
      }

      return false;
    }
  }, {
    key: "setDefault",
    value: function setDefault(pathArray) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._data;
      return DataManager.SetDefault(root, pathArray, defaultValue);
    }
  }, {
    key: "getByPath",
    value: function getByPath(pathArray) {
      var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._data;
      return DataManager.GetByPath(root, pathArray);
    }
  }]);

  return DataManager;
}(eventemitter3);

DataManager.SetDefault = function (root, pathArray, defaultValue) {
  var node = root;

  for (var i = 0; i < pathArray.length; i++) {
    if (typeof pathArray[i] !== 'string' && typeof pathArray[i] !== 'number') {
      console.error('SetDefault, pathArray 中的元素必須是 string or number, but pathArray = ', pathArray);
      break;
    }

    var _key = pathArray[i];

    if (!(_key in node)) {
      node[_key] = i === pathArray.length - 1 ? defaultValue : {};
    }

    if (i === pathArray.length - 1) {
      return node[_key];
    } else {
      node = node[_key];
    }
  }

  return node;
};

DataManager.GetByPath = function (root, pathArray) {
  var d = root;

  for (var i = 0; i < pathArray.length; i++) {
    d = d[pathArray[i]];
    if (d === undefined || d === null) return d;
  }

  return d;
};

DataManager.MergeObject = function (target, source) {
  var _epoch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var deleteNullObj = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  for (var property in source) {
    var value = source[property];

    var type = _typeof(value);
    /**
     * 1 'string', 'boolean', 'number'
     * 2 'object' 包括了 null , Array, {} 服务器不会发送 Array
     * 3 'undefined' 不处理
     */


    if (['string', 'boolean', 'number'].includes(type)) {
      target[property] = value === 'NaN' ? NaN : value;
    } else if (value === null && deleteNullObj) {
      delete target[property]; // 服务器 要求 删除对象
    } else if (Array.isArray(value)) {
      target[property] = value; // 如果是数组类型就直接替换，并且记录 _epoch

      if (!value._epoch) {
        Object.defineProperty(value, '_epoch', {
          configurable: false,
          enumerable: false,
          writable: true
        });
      }

      value._epoch = _epoch;
    } else if (type === 'object') {
      // @note: 这里做了一个特例, 使得 K 线序列数据被保存为一个 array, 而非 object
      target[property] = target[property] || (property === 'data' ? [] : {}); // quotes 对象单独处理

      if (property === 'quotes') {
        for (var symbol in value) {
          var quote = value[symbol]; // source[property]

          if (quote === null) {
            // 服务器 要求 删除对象
            if (deleteNullObj && symbol) delete target[property][symbol];
            continue;
          } else if (!target[property][symbol]) {
            target[property][symbol] = new QUOTE();
          }

          DataManager.MergeObject(target[property][symbol], quote, _epoch, deleteNullObj);
        }
      } else {
        DataManager.MergeObject(target[property], value, _epoch, deleteNullObj);
      }
    }
  } // _epoch 不应该被循环到的 key


  if (!target._epoch) {
    Object.defineProperty(target, '_epoch', {
      configurable: false,
      enumerable: false,
      writable: true
    });
  }

  target._epoch = _epoch;
};

/**
 * 事件类型
 + ready: 收到合约基础数据（全局只出发一次）
 + rtn_brokers: 收到期货公司列表（全局只出发一次）
 + notify: 收到通知对象
 + rtn_data: 数据更新（每一次数据更新触发）
 + error: 发生错误(目前只有一种：合约服务下载失败)
 */
// 支持多账户登录

var TQSDK =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(TQSDK, _EventEmitter);

  function TQSDK() {
    var _this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$symbolsServerUrl = _ref.symbolsServerUrl,
        symbolsServerUrl = _ref$symbolsServerUrl === void 0 ? 'https://openmd.shinnytech.com/t/md/symbols/latest.json' : _ref$symbolsServerUrl,
        _ref$wsQuoteUrl = _ref.wsQuoteUrl,
        wsQuoteUrl = _ref$wsQuoteUrl === void 0 ? 'wss://openmd.shinnytech.com/t/md/front/mobile' : _ref$wsQuoteUrl,
        _ref$wsTradeUrl = _ref.wsTradeUrl,
        wsTradeUrl = _ref$wsTradeUrl === void 0 ? 'wss://opentd.shinnytech.com/trade/user0' : _ref$wsTradeUrl,
        _ref$clientSystemInfo = _ref.clientSystemInfo,
        clientSystemInfo = _ref$clientSystemInfo === void 0 ? '' : _ref$clientSystemInfo,
        _ref$clientAppId = _ref.clientAppId,
        clientAppId = _ref$clientAppId === void 0 ? '' : _ref$clientAppId,
        _ref$autoInit = _ref.autoInit,
        autoInit = _ref$autoInit === void 0 ? true : _ref$autoInit,
        _ref$data = _ref.data,
        data = _ref$data === void 0 ? {
      klines: {},
      quotes: {},
      charts: {},
      ticks: {},
      trade: {}
    } : _ref$data;

    _classCallCheck(this, TQSDK);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TQSDK).call(this));
    _this._insUrl = symbolsServerUrl;
    _this._mdUrl = wsQuoteUrl;
    _this._tdUrl = wsTradeUrl;
    _this.clientSystemInfo = clientSystemInfo;
    _this.clientAppIds = clientAppId;
    _this._prefix = 'TQJS_';

    var self = _assertThisInitialized(_this);

    _this.dm = new DataManager(data);

    _this.dm.on('data', function () {
      self.emit('rtn_data', null);
    });

    _this.brokers = null;
    _this.trade_accounts = {}; // 添加账户

    _this.isReady = false;
    _this.quotesWs = null;
    _this.quotesInfo = {};

    if (autoInit) {
      _this.init(); // 自动执行初始化

    }

    return _this;
  }

  _createClass(TQSDK, [{
    key: "init",
    value: function init() {
      this.initMdWebsocket();
      this.initTdWebsocket();
    }
  }, {
    key: "initMdWebsocket",
    value: function initMdWebsocket() {
      var self = this;
      axios$1.get(this._insUrl, {
        headers: {
          Accept: 'application/json; charset=utf-8'
        }
      }).then(function (response) {
        self.quotesInfo = response.data; // 建立行情连接

        self.isReady = true;
        self.emit('ready');
        self.emit('rtn_data', null);
      })["catch"](function (error) {
        self.emit('error', error);
        console.error('Error: ' + error.message);
        return error;
      });
      this.quotesWs = new TqQuoteWebsocket(this._mdUrl, this.dm);
    }
  }, {
    key: "initTdWebsocket",
    value: function initTdWebsocket() {
      var self = this; // 支持分散部署的交易中继网关

      axios$1.get('https://files.shinnytech.com/broker-list.json', {
        headers: {
          Accept: 'application/json; charset=utf-8'
        }
      }).then(function (response) {
        self.brokers_list = response.data;
        self.brokers = Object.keys(response.data).filter(function (x) {
          return !x.endsWith(' ');
        }).sort();
        self.emit('rtn_brokers', self.brokers);
        console.log(self.brokers);
      })["catch"](function (error) {
        self.emit('error', error);
        console.error('Error: ' + error.message);
        return error;
      });
    }
  }, {
    key: "addWebSocket",
    value: function addWebSocket() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      if (url) return new TqRecvOnlyWebsocket(url, this.dm);
      return null;
    } // user_id 作为唯一 key

  }, {
    key: "addAccount",
    value: function addAccount(bid, userId, password) {
      if (bid && userId && password) {
        if (this.brokers.indexOf(bid) === -1) {
          console.error('不支持该期货公司');
          return;
        }

        if (!this.trade_accounts[userId]) {
          var ws = new TqTradeWebsocket(this.brokers_list[bid].url, this.dm);
          var self = this;
          ws.on('notify', function (n) {
            self.emit('notify', Object.assign(n, {
              bid: bid,
              user_id: userId
            }));
          });
          this.trade_accounts[userId] = {
            bid: bid,
            userId: userId,
            password: password,
            ws: ws
          };
        }

        return this.trade_accounts[userId];
      } else {
        return null;
      }
    }
  }, {
    key: "removeAccount",
    value: function removeAccount(bid, userId) {
      if (bid && userId) {
        if (this.trade_accounts[userId]) {
          // close 相应的 websocket
          this.trade_accounts[userId].ws.close();
          delete this.trade_accounts[userId]; // 删除用户相应的数据

          delete this.dm._data.trade[userId];
        }
      }
    }
  }, {
    key: "refreshAccount",
    value: function refreshAccount(bid, userId) {
      if (bid && userId) {
        if (this.trade_accounts[userId]) {
          this.trade_accounts[userId].ws.send({
            aid: 'qry_account_info'
          });
          this.trade_accounts[userId].ws.send({
            aid: 'qry_account_register'
          });
        }
      }
    }
  }, {
    key: "refreshAccounts",
    value: function refreshAccounts() {
      for (var userId in this.trade_accounts) {
        this.trade_accounts[userId].ws.send({
          aid: 'qry_account_info'
        });
        this.trade_accounts[userId].ws.send({
          aid: 'qry_account_register'
        });
      }
    }
  }, {
    key: "updateData",
    value: function updateData(data) {
      this.dm.mergeData(data, true, false);
    }
  }, {
    key: "getByPath",
    value: function getByPath(_path) {
      return this.dm.getByPath(_path);
    }
    /** ***************** 行情接口 get_quotes_by_input ********************/

  }, {
    key: "getQuotesByInput",
    value: function getQuotesByInput(_input) {
      if (typeof _input !== 'string' && !_input.input) return [];
      var option = {
        input: typeof _input === 'string' ? _input.toLowerCase() : _input.input.toLowerCase(),
        instrument_id: _input.instrument_id ? _input.instrument_id : true,
        // 是否根据合约ID匹配
        pinyin: _input.pinyin ? _input.pinyin : true,
        // 是否根据拼音匹配
        include_expired: _input.include_expired ? _input.include_expired : false,
        // 匹配结果是否包含已下市合约
        FUTURE: _input.future ? !!_input.future : true,
        // 匹配结果是否包含期货合约
        FUTURE_INDEX: _input.future_index ? !!_input.future_index : false,
        // 匹配结果是否包含期货指数
        FUTURE_CONT: _input.future_cont ? !!_input.future_cont : false,
        // 匹配结果是否包含期货主连
        OPTION: _input.option ? !!_input.option : false,
        // 匹配结果是否包含期权
        COMBINE: _input.combine ? !!_input.combine : false // 匹配结果是否包含组合

      };

      var filterSymbol = function filterSymbol(filterOption, quote, by) {
        if (filterOption[quote["class"]] && (filterOption.include_expired || !filterOption.include_expired && !quote.expired)) {
          if (by === 'instrument_id') {
            if (quote.product_id.toLowerCase() === filterOption.input) {
              return true;
            } else if (filterOption.input.length > 2 && quote.instrument_id.toLowerCase().indexOf(filterOption.input) > -1) {
              return true;
            } else {
              return false;
            }
          } else if (by === 'pinyin' && quote.py.split(',').indexOf(filterOption.input) > -1) {
            return true;
          } else {
            return false;
          }
        }

        return false;
      };

      var result = [];

      if (option.instrument_id) {
        for (var symbol in this.quotesInfo) {
          if (filterSymbol(option, this.quotesInfo[symbol], 'instrument_id')) {
            result.push(symbol);
          }
        }
      }

      if (option.pinyin) {
        for (var _symbol in this.quotesInfo) {
          if (filterSymbol(option, this.quotesInfo[_symbol], 'pinyin')) {
            result.push(_symbol);
          }
        }
      }

      return result;
    }
    /** ***************** 行情接口 get_quote ********************/

  }, {
    key: "getQuote",
    value: function getQuote(symbol) {
      if (symbol === '') return {};
      var symbolObj = this.dm.setDefault(['quotes', symbol], new QUOTE());

      if (!symbolObj["class"] && this.quotesInfo[symbol]) {
        // quotesInfo 中的 last_price
        // eslint-disable-next-line camelcase
        var last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price;
        Object.assign(symbolObj, this.quotesInfo[symbol], {
          last_price: last_price
        });
      }

      return symbolObj;
    }
    /** ***************** 行情接口 set_chart ********************/

  }, {
    key: "setChart",
    value: function setChart(payload) {
      var content = {};

      if (payload.trading_day_start || payload.trading_day_count) {
        // 指定交易日，返回对应的数据
        content.trading_day_start = payload.trading_day_start ? payload.trading_day_start : 0; // trading_day_count 请求交易日天数

        content.trading_day_count = payload.trading_day_count ? payload.trading_day_count : 3600 * 24 * 1e9;
      } else {
        content.view_width = payload.view_width ? payload.view_width : 500;

        if (payload.left_kline_id) {
          // 指定一个K线id，向右请求N个数据
          content.left_kline_id = payload.left_kline_id;
        } else if (payload.focus_datetime) {
          // 使得指定日期的K线位于屏幕第M个柱子的位置
          content.focus_datetime = payload.focus_datetime; // 日线及以上周期是交易日，其他周期是时间，UnixNano 北京时间

          content.focus_position = payload.focus_position ? payload.focus_position : 0;
        }
      }

      this.quotesWs.send(Object.assign({
        aid: 'set_chart',
        chart_id: payload.chart_id ? payload.chart_id : this._prefix + 'kline_chart',
        ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol,
        duration: payload.duration
      }, content));
    }
    /** ***************** 交易接口 get_user ********************/

  }, {
    key: "getUser",
    value: function getUser(payload) {
      var userId = typeof payload === 'string' ? payload : payload.user_id;
      return userId ? this.dm._data.trade[userId] : null;
    }
    /** ***************** 接口 get ********************/

  }, {
    key: "get",
    value: function get() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$name = _ref2.name,
          name = _ref2$name === void 0 ? 'users' : _ref2$name,
          _ref2$user_id = _ref2.user_id,
          user_id = _ref2$user_id === void 0 ? '' : _ref2$user_id,
          _ref2$currency = _ref2.currency,
          currency = _ref2$currency === void 0 ? 'CNY' : _ref2$currency,
          _ref2$symbol = _ref2.symbol,
          symbol = _ref2$symbol === void 0 ? '' : _ref2$symbol,
          _ref2$order_id = _ref2.order_id,
          order_id = _ref2$order_id === void 0 ? '' : _ref2$order_id,
          _ref2$trade_id = _ref2.trade_id,
          trade_id = _ref2$trade_id === void 0 ? '' : _ref2$trade_id,
          _ref2$trading_day = _ref2.trading_day,
          trading_day = _ref2$trading_day === void 0 ? '' : _ref2$trading_day,
          _ref2$chart_id = _ref2.chart_id,
          chart_id = _ref2$chart_id === void 0 ? '' : _ref2$chart_id,
          _ref2$input = _ref2.input,
          input = _ref2$input === void 0 ? '' : _ref2$input,
          _ref2$duration = _ref2.duration,
          duration = _ref2$duration === void 0 ? 0 : _ref2$duration;

      if (name === 'users') {
        return Object.keys(this.trade_accounts);
      }

      if (user_id) {
        // get 交易相关数据
        var user = this.get_user(user_id);

        if (name === 'user') {
          return user;
        }

        if (['session', 'accounts', 'positions', 'orders', 'trades', 'his_settlements'].indexOf(name) > -1) {
          return user && user[name] ? user[name] : null;
        } else if (user && user[name + 's']) {
          var k = name === 'account' ? currency : name === 'position' ? symbol : name === 'order' ? order_id : name === 'trade' ? trade_id : name === 'his_settlement' ? trading_day : '';
          return user[name + 's'][k];
        }

        return null;
      } else {
        // get 行情相关数据
        if (name === 'quotes') {
          return input ? this.get_quotes_by_input(input) : [];
        }

        if (name === 'quote') return this.getQuote(symbol);
        if (name === 'klines') return this.getKlines(symbol, duration);
        if (name === 'ticks') return this.getTicks(symbol);
        if (name === 'charts') return this.dm.getByPath(['charts']);
        if (name === 'chart') return this.dm.getByPath(['charts', chart_id]);
      }
    }
  }, {
    key: "getKlines",
    value: function getKlines(symbol, dur) {
      if (symbol === '') return null;
      var ks = this.dm.getByPath(['klines', symbol, dur]);

      if (!ks || !ks.data || ks.last_id === -1) {
        this.dm.mergeData({
          klines: _defineProperty({}, symbol, _defineProperty({}, dur, {
            last_id: -1,
            data: {}
          }))
        }, false, false);
        ks = this.dm.getByPath(['klines', symbol, dur]);
      }

      return ks;
    }
  }, {
    key: "getTicks",
    value: function getTicks(symbol) {
      if (symbol === '') return null;
      var ts = this.dm.getByPath(['ticks', symbol]);

      if (!ts || !ts.data) {
        this.dm.mergeData({
          ticks: _defineProperty({}, symbol, {
            last_id: -1,
            data: {}
          })
        }, false, false);
      }

      return this.dm.getByPath(['ticks', symbol]);
    }
  }, {
    key: "isLogined",
    value: function isLogined(payload) {
      var session = this.get({
        name: 'session',
        user_id: payload.user_id
      });
      return !!(session && session.trading_day);
    }
  }, {
    key: "isChanging",
    value: function isChanging(target, source) {
      if (target && target._epoch) return target._epoch === this.dm._epoch;
      if (typeof target === 'string') return this.dm.isChanging(target, source);
      return false;
    }
  }, {
    key: "insertOrder",
    value: function insertOrder(payload) {
      if (!this.is_logined(payload)) return null;
      var orderId = this._prefix + RandomStr(8);
      var _order_common = {
        user_id: payload.user_id,
        orderId: orderId,
        exchange_id: payload.exchange_id,
        instrument_id: payload.ins_id,
        direction: payload.direction,
        offset: payload.offset,
        price_type: payload.price_type ? payload.price_type : 'LIMIT',
        // "LIMIT" "ANY"
        limit_price: Number(payload.limit_price),
        volume_condition: 'ANY',
        // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
        time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD' // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)

      };

      var _orderInsert = Object.assign({
        aid: 'insert_order',
        volume: payload.volume
      }, _order_common);

      this.trade_accounts[payload.user_id].ws.send(_orderInsert);

      var _orderInit = Object.assign({
        volume_orign: payload.volume,
        // 总报单手数
        // 委托单当前状态
        status: 'ALIVE',
        // 委托单状态, (ALIVE=有效, FINISHED=已完)
        volume_left: payload.volume // 未成交手数

      }, _order_common);

      this.dm.mergeData({
        trade: _defineProperty({}, payload.user_id, {
          orders: _defineProperty({}, orderId, _orderInit)
        })
      }, false, false);
      return this.get({
        name: 'order',
        user_id: payload.user_id,
        orderId: orderId
      });
    }
  }, {
    key: "autoInsertOrder",
    value: function autoInsertOrder(payload) {
      if (!this.is_logined(payload)) return null;
      /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */

      var initOrder = {
        user_id: payload.user_id,
        price_type: payload.price_type ? payload.price_type : 'LIMIT',
        // "LIMIT" "ANY"
        volume_condition: 'ANY',
        time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
        exchange_id: payload.exchange_id,
        instrument_id: payload.ins_id,
        direction: payload.direction,
        limit_price: Number(payload.limit_price)
      };

      if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
        var position = this.dm.getPosition(payload.symbol, payload.user_id); // 拆单，先平今再平昨

        var closeTodayVolume = 0;

        if (payload.direction === 'BUY' && position.volume_short_today > 0) {
          closeTodayVolume = Math.min(position.volume_short_today, payload.volume);
        } else if (payload.direction === 'SELL' && position.volume_long_today > 0) {
          closeTodayVolume = Math.min(position.volume_long_today, payload.volume);
        }

        if (closeTodayVolume > 0) {
          this.insert_order(Object.assign({
            offset: 'CLOSETODAY',
            volume: closeTodayVolume
          }, initOrder));
        }

        if (payload.volume - closeTodayVolume > 0) {
          this.insert_order(Object.assign({
            offset: 'CLOSE',
            volume: payload.volume - closeTodayVolume
          }, initOrder));
        }
      } else {
        this.insert_order(Object.assign({
          offset: payload.offset,
          volume: payload.volume
        }, initOrder));
      }
    }
  }, {
    key: "cancelOrder",
    value: function cancelOrder(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'cancel_order',
        user_id: payload.user_id,
        order_id: payload.order_id ? payload.order_id : payload
      });
    } // 登录

  }, {
    key: "login",
    value: function login(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'req_login',
        bid: payload.bid,
        user_name: payload.user_id,
        password: payload.password,
        client_system_info: this.clientSystemInfo,
        client_app_id: this.clientAppId
      });
    } // 确认结算单

  }, {
    key: "confirmSettlement",
    value: function confirmSettlement(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'confirm_settlement'
      });
    } // 银期转账

  }, {
    key: "transfer",
    value: function transfer(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'req_transfer',
        bank_id: payload.bank_id,
        // 银行ID
        bank_password: payload.bank_password,
        // 银行账户密码
        future_account: payload.future_account,
        // 期货账户
        future_password: payload.future_password,
        // 期货账户密码
        currency: 'CNY',
        // 币种代码
        amount: payload.amount // 转账金额, >0 表示转入期货账户, <0 表示转出期货账户

      });
    } // 历史结算单

  }, {
    key: "hisSettlement",
    value: function hisSettlement(payload) {
      if (!TQSDK.store) return null; // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
      // 缓存策略 1 dm有历史结算单

      var content = this.dm.getByPath(['trade', payload.user_id, 'his_settlements', payload.trading_day]);
      if (content !== undefined) return; // 缓存策略 2 缓存中读取历史结算单

      var self = this;
      content = TQSDK.store.getContent(payload.user_id, payload.trading_day).then(function (value) {
        if (value === null) {
          // 缓存策略 2.1 未读取到发送请求
          self.trade_accounts[payload.user_id].ws.send({
            aid: 'qry_settlement_info',
            trading_day: Number(payload.trading_day)
          });
        } else {
          var _content = ParseSettlementContent(value); // 缓存策略 2.2 读取到存到dm


          self.dm.mergeData({
            trade: _defineProperty({}, payload.user_id, {
              his_settlements: _defineProperty({}, payload.trading_day, _content)
            })
          }, true, false);
        }
      })["catch"](function (err) {
        // 当出错时，此处代码运行
        console.error(err);
      });
    }
  }, {
    key: "subscribeQuote",
    value: function subscribeQuote(quotes) {
      this.quotesWs.send({
        aid: 'subscribe_quote',
        ins_list: Array.isArray(quotes) ? quotes.join(',') : quotes
      });
    }
  }]);

  return TQSDK;
}(eventemitter3); // 保留原先小寫加下划綫接口,新增接口都是駝峰標誌


TQSDK.prototype.subscribe_quote = TQSDK.prototype.subscribeQuote;
TQSDK.prototype.his_settlement = TQSDK.prototype.hisSettlement;
TQSDK.prototype.confirm_settlement = TQSDK.prototype.confirmSettlement;
TQSDK.prototype.add_account = TQSDK.prototype.addAccount;
TQSDK.prototype.remove_account = TQSDK.prototype.removeAccount;
TQSDK.prototype.update_data = TQSDK.prototype.updateData;
TQSDK.prototype.get_by_path = TQSDK.prototype.getByPath;
TQSDK.prototype.get_quotes_by_input = TQSDK.prototype.getQuotesByInput;
TQSDK.prototype.get_quote = TQSDK.prototype.getQuote;
TQSDK.prototype.set_chart = TQSDK.prototype.setChart;
TQSDK.prototype.get_user = TQSDK.prototype.getUser;
TQSDK.prototype.is_logined = TQSDK.prototype.isLogined;
TQSDK.prototype.is_changed = TQSDK.prototype.isChanging;
TQSDK.prototype.insert_order = TQSDK.prototype.insertOrder;
TQSDK.prototype.auto_insert_order = TQSDK.prototype.autoInsertOrder;
TQSDK.prototype.cancel_order = TQSDK.prototype.cancelOrder;

var localforage = createCommonjsModule(function (module, exports) {
  /*!
      localForage -- Offline Storage, Improved
      Version 1.7.3
      https://localforage.github.io/localForage
      (c) 2013-2017 Mozilla, Apache License 2.0
  */
  (function (f) {
    {
      module.exports = f();
    }
  })(function () {
    return function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof commonjsRequire == "function" && commonjsRequire;
            if (!u && a) return a(o, !0);
            if (i) return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }

          var l = n[o] = {
            exports: {}
          };
          t[o][0].call(l.exports, function (e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }

        return n[o].exports;
      }

      var i = typeof commonjsRequire == "function" && commonjsRequire;

      for (var o = 0; o < r.length; o++) s(r[o]);

      return s;
    }({
      1: [function (_dereq_, module, exports) {
        (function (global) {

          var Mutation = global.MutationObserver || global.WebKitMutationObserver;
          var scheduleDrain;
          {
            if (Mutation) {
              var called = 0;
              var observer = new Mutation(nextTick);
              var element = global.document.createTextNode('');
              observer.observe(element, {
                characterData: true
              });

              scheduleDrain = function () {
                element.data = called = ++called % 2;
              };
            } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
              var channel = new global.MessageChannel();
              channel.port1.onmessage = nextTick;

              scheduleDrain = function () {
                channel.port2.postMessage(0);
              };
            } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
              scheduleDrain = function () {
                // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                var scriptEl = global.document.createElement('script');

                scriptEl.onreadystatechange = function () {
                  nextTick();
                  scriptEl.onreadystatechange = null;
                  scriptEl.parentNode.removeChild(scriptEl);
                  scriptEl = null;
                };

                global.document.documentElement.appendChild(scriptEl);
              };
            } else {
              scheduleDrain = function () {
                setTimeout(nextTick, 0);
              };
            }
          }
          var draining;
          var queue = []; //named nextTick for less confusing stack traces

          function nextTick() {
            draining = true;
            var i, oldQueue;
            var len = queue.length;

            while (len) {
              oldQueue = queue;
              queue = [];
              i = -1;

              while (++i < len) {
                oldQueue[i]();
              }

              len = queue.length;
            }

            draining = false;
          }

          module.exports = immediate;

          function immediate(task) {
            if (queue.push(task) === 1 && !draining) {
              scheduleDrain();
            }
          }
        }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {}],
      2: [function (_dereq_, module, exports) {

        var immediate = _dereq_(1);
        /* istanbul ignore next */


        function INTERNAL() {}

        var handlers = {};
        var REJECTED = ['REJECTED'];
        var FULFILLED = ['FULFILLED'];
        var PENDING = ['PENDING'];
        module.exports = Promise;

        function Promise(resolver) {
          if (typeof resolver !== 'function') {
            throw new TypeError('resolver must be a function');
          }

          this.state = PENDING;
          this.queue = [];
          this.outcome = void 0;

          if (resolver !== INTERNAL) {
            safelyResolveThenable(this, resolver);
          }
        }

        Promise.prototype["catch"] = function (onRejected) {
          return this.then(null, onRejected);
        };

        Promise.prototype.then = function (onFulfilled, onRejected) {
          if (typeof onFulfilled !== 'function' && this.state === FULFILLED || typeof onRejected !== 'function' && this.state === REJECTED) {
            return this;
          }

          var promise = new this.constructor(INTERNAL);

          if (this.state !== PENDING) {
            var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
            unwrap(promise, resolver, this.outcome);
          } else {
            this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
          }

          return promise;
        };

        function QueueItem(promise, onFulfilled, onRejected) {
          this.promise = promise;

          if (typeof onFulfilled === 'function') {
            this.onFulfilled = onFulfilled;
            this.callFulfilled = this.otherCallFulfilled;
          }

          if (typeof onRejected === 'function') {
            this.onRejected = onRejected;
            this.callRejected = this.otherCallRejected;
          }
        }

        QueueItem.prototype.callFulfilled = function (value) {
          handlers.resolve(this.promise, value);
        };

        QueueItem.prototype.otherCallFulfilled = function (value) {
          unwrap(this.promise, this.onFulfilled, value);
        };

        QueueItem.prototype.callRejected = function (value) {
          handlers.reject(this.promise, value);
        };

        QueueItem.prototype.otherCallRejected = function (value) {
          unwrap(this.promise, this.onRejected, value);
        };

        function unwrap(promise, func, value) {
          immediate(function () {
            var returnValue;

            try {
              returnValue = func(value);
            } catch (e) {
              return handlers.reject(promise, e);
            }

            if (returnValue === promise) {
              handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
            } else {
              handlers.resolve(promise, returnValue);
            }
          });
        }

        handlers.resolve = function (self, value) {
          var result = tryCatch(getThen, value);

          if (result.status === 'error') {
            return handlers.reject(self, result.value);
          }

          var thenable = result.value;

          if (thenable) {
            safelyResolveThenable(self, thenable);
          } else {
            self.state = FULFILLED;
            self.outcome = value;
            var i = -1;
            var len = self.queue.length;

            while (++i < len) {
              self.queue[i].callFulfilled(value);
            }
          }

          return self;
        };

        handlers.reject = function (self, error) {
          self.state = REJECTED;
          self.outcome = error;
          var i = -1;
          var len = self.queue.length;

          while (++i < len) {
            self.queue[i].callRejected(error);
          }

          return self;
        };

        function getThen(obj) {
          // Make sure we only access the accessor once as required by the spec
          var then = obj && obj.then;

          if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
            return function appyThen() {
              then.apply(obj, arguments);
            };
          }
        }

        function safelyResolveThenable(self, thenable) {
          // Either fulfill, reject or reject with error
          var called = false;

          function onError(value) {
            if (called) {
              return;
            }

            called = true;
            handlers.reject(self, value);
          }

          function onSuccess(value) {
            if (called) {
              return;
            }

            called = true;
            handlers.resolve(self, value);
          }

          function tryToUnwrap() {
            thenable(onSuccess, onError);
          }

          var result = tryCatch(tryToUnwrap);

          if (result.status === 'error') {
            onError(result.value);
          }
        }

        function tryCatch(func, value) {
          var out = {};

          try {
            out.value = func(value);
            out.status = 'success';
          } catch (e) {
            out.status = 'error';
            out.value = e;
          }

          return out;
        }

        Promise.resolve = resolve;

        function resolve(value) {
          if (value instanceof this) {
            return value;
          }

          return handlers.resolve(new this(INTERNAL), value);
        }

        Promise.reject = reject;

        function reject(reason) {
          var promise = new this(INTERNAL);
          return handlers.reject(promise, reason);
        }

        Promise.all = all;

        function all(iterable) {
          var self = this;

          if (Object.prototype.toString.call(iterable) !== '[object Array]') {
            return this.reject(new TypeError('must be an array'));
          }

          var len = iterable.length;
          var called = false;

          if (!len) {
            return this.resolve([]);
          }

          var values = new Array(len);
          var resolved = 0;
          var i = -1;
          var promise = new this(INTERNAL);

          while (++i < len) {
            allResolver(iterable[i], i);
          }

          return promise;

          function allResolver(value, i) {
            self.resolve(value).then(resolveFromAll, function (error) {
              if (!called) {
                called = true;
                handlers.reject(promise, error);
              }
            });

            function resolveFromAll(outValue) {
              values[i] = outValue;

              if (++resolved === len && !called) {
                called = true;
                handlers.resolve(promise, values);
              }
            }
          }
        }

        Promise.race = race;

        function race(iterable) {
          var self = this;

          if (Object.prototype.toString.call(iterable) !== '[object Array]') {
            return this.reject(new TypeError('must be an array'));
          }

          var len = iterable.length;
          var called = false;

          if (!len) {
            return this.resolve([]);
          }

          var i = -1;
          var promise = new this(INTERNAL);

          while (++i < len) {
            resolver(iterable[i]);
          }

          return promise;

          function resolver(value) {
            self.resolve(value).then(function (response) {
              if (!called) {
                called = true;
                handlers.resolve(promise, response);
              }
            }, function (error) {
              if (!called) {
                called = true;
                handlers.reject(promise, error);
              }
            });
          }
        }
      }, {
        "1": 1
      }],
      3: [function (_dereq_, module, exports) {
        (function (global) {

          if (typeof global.Promise !== 'function') {
            global.Promise = _dereq_(2);
          }
        }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {
        "2": 2
      }],
      4: [function (_dereq_, module, exports) {

        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
          return typeof obj;
        } : function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };

        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }

        function getIDB() {
          /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
          try {
            if (typeof indexedDB !== 'undefined') {
              return indexedDB;
            }

            if (typeof webkitIndexedDB !== 'undefined') {
              return webkitIndexedDB;
            }

            if (typeof mozIndexedDB !== 'undefined') {
              return mozIndexedDB;
            }

            if (typeof OIndexedDB !== 'undefined') {
              return OIndexedDB;
            }

            if (typeof msIndexedDB !== 'undefined') {
              return msIndexedDB;
            }
          } catch (e) {
            return;
          }
        }

        var idb = getIDB();

        function isIndexedDBValid() {
          try {
            // Initialize IndexedDB; fall back to vendor-prefixed versions
            // if needed.
            if (!idb) {
              return false;
            } // We mimic PouchDB here;
            //
            // We test for openDatabase because IE Mobile identifies itself
            // as Safari. Oh the lulz...


            var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
            var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1; // Safari <10.1 does not meet our requirements for IDB support (#5572)
            // since Safari 10.1 shipped with fetch, we can use that to detect it

            return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' && // some outdated implementations of IDB that appear on Samsung
            // and HTC Android devices <4.4 are missing IDBKeyRange
            // See: https://github.com/mozilla/localForage/issues/128
            // See: https://github.com/mozilla/localForage/issues/272
            typeof IDBKeyRange !== 'undefined';
          } catch (e) {
            return false;
          }
        } // Abstracts constructing a Blob object, so it also works in older
        // browsers that don't support the native Blob constructor. (i.e.
        // old QtWebKit versions, at least).
        // Abstracts constructing a Blob object, so it also works in older
        // browsers that don't support the native Blob constructor. (i.e.
        // old QtWebKit versions, at least).


        function createBlob(parts, properties) {
          /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
          parts = parts || [];
          properties = properties || {};

          try {
            return new Blob(parts, properties);
          } catch (e) {
            if (e.name !== 'TypeError') {
              throw e;
            }

            var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
            var builder = new Builder();

            for (var i = 0; i < parts.length; i += 1) {
              builder.append(parts[i]);
            }

            return builder.getBlob(properties.type);
          }
        } // This is CommonJS because lie is an external dependency, so Rollup
        // can just ignore it.


        if (typeof Promise === 'undefined') {
          // In the "nopromises" build this will just throw if you don't have
          // a global promise object, but it would throw anyway later.
          _dereq_(3);
        }

        var Promise$1 = Promise;

        function executeCallback(promise, callback) {
          if (callback) {
            promise.then(function (result) {
              callback(null, result);
            }, function (error) {
              callback(error);
            });
          }
        }

        function executeTwoCallbacks(promise, callback, errorCallback) {
          if (typeof callback === 'function') {
            promise.then(callback);
          }

          if (typeof errorCallback === 'function') {
            promise["catch"](errorCallback);
          }
        }

        function normalizeKey(key) {
          // Cast the key to a string, as that's all we can set as a key.
          if (typeof key !== 'string') {
            console.warn(key + ' used as a key, but it is not a string.');
            key = String(key);
          }

          return key;
        }

        function getCallback() {
          if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
            return arguments[arguments.length - 1];
          }
        } // Some code originally from async_storage.js in
        // [Gaia](https://github.com/mozilla-b2g/gaia).


        var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
        var supportsBlobs = void 0;
        var dbContexts = {};
        var toString = Object.prototype.toString; // Transaction Modes

        var READ_ONLY = 'readonly';
        var READ_WRITE = 'readwrite'; // Transform a binary string to an array buffer, because otherwise
        // weird stuff happens when you try to work with the binary string directly.
        // It is known.
        // From http://stackoverflow.com/questions/14967647/ (continues on next line)
        // encode-decode-image-with-base64-breaks-image (2013-04-21)

        function _binStringToArrayBuffer(bin) {
          var length = bin.length;
          var buf = new ArrayBuffer(length);
          var arr = new Uint8Array(buf);

          for (var i = 0; i < length; i++) {
            arr[i] = bin.charCodeAt(i);
          }

          return buf;
        } //
        // Blobs are not supported in all versions of IndexedDB, notably
        // Chrome <37 and Android <5. In those versions, storing a blob will throw.
        //
        // Various other blob bugs exist in Chrome v37-42 (inclusive).
        // Detecting them is expensive and confusing to users, and Chrome 37-42
        // is at very low usage worldwide, so we do a hacky userAgent check instead.
        //
        // content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
        // 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
        // FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
        //
        // Code borrowed from PouchDB. See:
        // https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
        //


        function _checkBlobSupportWithoutCaching(idb) {
          return new Promise$1(function (resolve) {
            var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
            var blob = createBlob(['']);
            txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

            txn.onabort = function (e) {
              // If the transaction aborts now its due to not being able to
              // write to the database, likely due to the disk being full
              e.preventDefault();
              e.stopPropagation();
              resolve(false);
            };

            txn.oncomplete = function () {
              var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
              var matchedEdge = navigator.userAgent.match(/Edge\//); // MS Edge pretends to be Chrome 42:
              // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx

              resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
            };
          })["catch"](function () {
            return false; // error, so assume unsupported
          });
        }

        function _checkBlobSupport(idb) {
          if (typeof supportsBlobs === 'boolean') {
            return Promise$1.resolve(supportsBlobs);
          }

          return _checkBlobSupportWithoutCaching(idb).then(function (value) {
            supportsBlobs = value;
            return supportsBlobs;
          });
        }

        function _deferReadiness(dbInfo) {
          var dbContext = dbContexts[dbInfo.name]; // Create a deferred object representing the current database operation.

          var deferredOperation = {};
          deferredOperation.promise = new Promise$1(function (resolve, reject) {
            deferredOperation.resolve = resolve;
            deferredOperation.reject = reject;
          }); // Enqueue the deferred operation.

          dbContext.deferredOperations.push(deferredOperation); // Chain its promise to the database readiness.

          if (!dbContext.dbReady) {
            dbContext.dbReady = deferredOperation.promise;
          } else {
            dbContext.dbReady = dbContext.dbReady.then(function () {
              return deferredOperation.promise;
            });
          }
        }

        function _advanceReadiness(dbInfo) {
          var dbContext = dbContexts[dbInfo.name]; // Dequeue a deferred operation.

          var deferredOperation = dbContext.deferredOperations.pop(); // Resolve its promise (which is part of the database readiness
          // chain of promises).

          if (deferredOperation) {
            deferredOperation.resolve();
            return deferredOperation.promise;
          }
        }

        function _rejectReadiness(dbInfo, err) {
          var dbContext = dbContexts[dbInfo.name]; // Dequeue a deferred operation.

          var deferredOperation = dbContext.deferredOperations.pop(); // Reject its promise (which is part of the database readiness
          // chain of promises).

          if (deferredOperation) {
            deferredOperation.reject(err);
            return deferredOperation.promise;
          }
        }

        function _getConnection(dbInfo, upgradeNeeded) {
          return new Promise$1(function (resolve, reject) {
            dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

            if (dbInfo.db) {
              if (upgradeNeeded) {
                _deferReadiness(dbInfo);

                dbInfo.db.close();
              } else {
                return resolve(dbInfo.db);
              }
            }

            var dbArgs = [dbInfo.name];

            if (upgradeNeeded) {
              dbArgs.push(dbInfo.version);
            }

            var openreq = idb.open.apply(idb, dbArgs);

            if (upgradeNeeded) {
              openreq.onupgradeneeded = function (e) {
                var db = openreq.result;

                try {
                  db.createObjectStore(dbInfo.storeName);

                  if (e.oldVersion <= 1) {
                    // Added when support for blob shims was added
                    db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                  }
                } catch (ex) {
                  if (ex.name === 'ConstraintError') {
                    console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                  } else {
                    throw ex;
                  }
                }
              };
            }

            openreq.onerror = function (e) {
              e.preventDefault();
              reject(openreq.error);
            };

            openreq.onsuccess = function () {
              resolve(openreq.result);

              _advanceReadiness(dbInfo);
            };
          });
        }

        function _getOriginalConnection(dbInfo) {
          return _getConnection(dbInfo, false);
        }

        function _getUpgradedConnection(dbInfo) {
          return _getConnection(dbInfo, true);
        }

        function _isUpgradeNeeded(dbInfo, defaultVersion) {
          if (!dbInfo.db) {
            return true;
          }

          var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
          var isDowngrade = dbInfo.version < dbInfo.db.version;
          var isUpgrade = dbInfo.version > dbInfo.db.version;

          if (isDowngrade) {
            // If the version is not the default one
            // then warn for impossible downgrade.
            if (dbInfo.version !== defaultVersion) {
              console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
            } // Align the versions to prevent errors.


            dbInfo.version = dbInfo.db.version;
          }

          if (isUpgrade || isNewStore) {
            // If the store is new then increment the version (if needed).
            // This will trigger an "upgradeneeded" event which is required
            // for creating a store.
            if (isNewStore) {
              var incVersion = dbInfo.db.version + 1;

              if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
              }
            }

            return true;
          }

          return false;
        } // encode a blob for indexeddb engines that don't support blobs


        function _encodeBlob(blob) {
          return new Promise$1(function (resolve, reject) {
            var reader = new FileReader();
            reader.onerror = reject;

            reader.onloadend = function (e) {
              var base64 = btoa(e.target.result || '');
              resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
              });
            };

            reader.readAsBinaryString(blob);
          });
        } // decode an encoded blob


        function _decodeBlob(encodedBlob) {
          var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));

          return createBlob([arrayBuff], {
            type: encodedBlob.type
          });
        } // is this one of our fancy encoded blobs?


        function _isEncodedBlob(value) {
          return value && value.__local_forage_encoded_blob;
        } // Specialize the default `ready()` function by making it dependent
        // on the current database operations. Thus, the driver will be actually
        // ready when it's been initialized (default) *and* there are no pending
        // operations on the database (initiated by some other instances).


        function _fullyReady(callback) {
          var self = this;

          var promise = self._initReady().then(function () {
            var dbContext = dbContexts[self._dbInfo.name];

            if (dbContext && dbContext.dbReady) {
              return dbContext.dbReady;
            }
          });

          executeTwoCallbacks(promise, callback, callback);
          return promise;
        } // Try to establish a new db connection to replace the
        // current one which is broken (i.e. experiencing
        // InvalidStateError while creating a transaction).


        function _tryReconnect(dbInfo) {
          _deferReadiness(dbInfo);

          var dbContext = dbContexts[dbInfo.name];
          var forages = dbContext.forages;

          for (var i = 0; i < forages.length; i++) {
            var forage = forages[i];

            if (forage._dbInfo.db) {
              forage._dbInfo.db.close();

              forage._dbInfo.db = null;
            }
          }

          dbInfo.db = null;
          return _getOriginalConnection(dbInfo).then(function (db) {
            dbInfo.db = db;

            if (_isUpgradeNeeded(dbInfo)) {
              // Reopen the database for upgrading.
              return _getUpgradedConnection(dbInfo);
            }

            return db;
          }).then(function (db) {
            // store the latest db reference
            // in case the db was upgraded
            dbInfo.db = dbContext.db = db;

            for (var i = 0; i < forages.length; i++) {
              forages[i]._dbInfo.db = db;
            }
          })["catch"](function (err) {
            _rejectReadiness(dbInfo, err);

            throw err;
          });
        } // FF doesn't like Promises (micro-tasks) and IDDB store operations,
        // so we have to do it with callbacks


        function createTransaction(dbInfo, mode, callback, retries) {
          if (retries === undefined) {
            retries = 1;
          }

          try {
            var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
            callback(null, tx);
          } catch (err) {
            if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
              return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                  // increase the db version, to create the new ObjectStore
                  if (dbInfo.db) {
                    dbInfo.version = dbInfo.db.version + 1;
                  } // Reopen the database for upgrading.


                  return _getUpgradedConnection(dbInfo);
                }
              }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                  createTransaction(dbInfo, mode, callback, retries - 1);
                });
              })["catch"](callback);
            }

            callback(err);
          }
        }

        function createDbContext() {
          return {
            // Running localForages sharing a database.
            forages: [],
            // Shared database.
            db: null,
            // Database readiness (promise).
            dbReady: null,
            // Deferred operations on the database.
            deferredOperations: []
          };
        } // Open the IndexedDB database (automatically creates one if one didn't
        // previously exist), using any options set in the config.


        function _initStorage(options) {
          var self = this;
          var dbInfo = {
            db: null
          };

          if (options) {
            for (var i in options) {
              dbInfo[i] = options[i];
            }
          } // Get the current context of the database;


          var dbContext = dbContexts[dbInfo.name]; // ...or create a new context.

          if (!dbContext) {
            dbContext = createDbContext(); // Register the new context in the global container.

            dbContexts[dbInfo.name] = dbContext;
          } // Register itself as a running localForage in the current context.


          dbContext.forages.push(self); // Replace the default `ready()` function with the specialized one.

          if (!self._initReady) {
            self._initReady = self.ready;
            self.ready = _fullyReady;
          } // Create an array of initialization states of the related localForages.


          var initPromises = [];

          function ignoreErrors() {
            // Don't handle errors here,
            // just makes sure related localForages aren't pending.
            return Promise$1.resolve();
          }

          for (var j = 0; j < dbContext.forages.length; j++) {
            var forage = dbContext.forages[j];

            if (forage !== self) {
              // Don't wait for itself...
              initPromises.push(forage._initReady()["catch"](ignoreErrors));
            }
          } // Take a snapshot of the related localForages.


          var forages = dbContext.forages.slice(0); // Initialize the connection process only when
          // all the related localForages aren't pending.

          return Promise$1.all(initPromises).then(function () {
            dbInfo.db = dbContext.db; // Get the connection or open a new one without upgrade.

            return _getOriginalConnection(dbInfo);
          }).then(function (db) {
            dbInfo.db = db;

            if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
              // Reopen the database for upgrading.
              return _getUpgradedConnection(dbInfo);
            }

            return db;
          }).then(function (db) {
            dbInfo.db = dbContext.db = db;
            self._dbInfo = dbInfo; // Share the final connection amongst related localForages.

            for (var k = 0; k < forages.length; k++) {
              var forage = forages[k];

              if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
              }
            }
          });
        }

        function getItem(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var req = store.get(key);

                  req.onsuccess = function () {
                    var value = req.result;

                    if (value === undefined) {
                      value = null;
                    }

                    if (_isEncodedBlob(value)) {
                      value = _decodeBlob(value);
                    }

                    resolve(value);
                  };

                  req.onerror = function () {
                    reject(req.error);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        } // Iterate over all items stored in database.


        function iterate(iterator, callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var req = store.openCursor();
                  var iterationNumber = 1;

                  req.onsuccess = function () {
                    var cursor = req.result;

                    if (cursor) {
                      var value = cursor.value;

                      if (_isEncodedBlob(value)) {
                        value = _decodeBlob(value);
                      }

                      var result = iterator(value, cursor.key, iterationNumber++); // when the iterator callback retuns any
                      // (non-`undefined`) value, then we stop
                      // the iteration immediately

                      if (result !== void 0) {
                        resolve(result);
                      } else {
                        cursor["continue"]();
                      }
                    } else {
                      resolve();
                    }
                  };

                  req.onerror = function () {
                    reject(req.error);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function setItem(key, value, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            var dbInfo;
            self.ready().then(function () {
              dbInfo = self._dbInfo;

              if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                  if (blobSupport) {
                    return value;
                  }

                  return _encodeBlob(value);
                });
              }

              return value;
            }).then(function (value) {
              createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName); // The reason we don't _save_ null is because IE 10 does
                  // not support saving the `null` type in IndexedDB. How
                  // ironic, given the bug below!
                  // See: https://github.com/mozilla/localForage/issues/161

                  if (value === null) {
                    value = undefined;
                  }

                  var req = store.put(value, key);

                  transaction.oncomplete = function () {
                    // Cast to undefined so the value passed to
                    // callback/promise is the same as what one would get out
                    // of `getItem()` later. This leads to some weirdness
                    // (setItem('foo', undefined) will return `null`), but
                    // it's not my fault localStorage is our baseline and that
                    // it's weird.
                    if (value === undefined) {
                      value = null;
                    }

                    resolve(value);
                  };

                  transaction.onabort = transaction.onerror = function () {
                    var err = req.error ? req.error : req.transaction.error;
                    reject(err);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function removeItem(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName); // We use a Grunt task to make this safe for IE and some
                  // versions of Android (including those used by Cordova).
                  // Normally IE won't like `.delete()` and will insist on
                  // using `['delete']()`, but we have a build step that
                  // fixes this for us now.

                  var req = store["delete"](key);

                  transaction.oncomplete = function () {
                    resolve();
                  };

                  transaction.onerror = function () {
                    reject(req.error);
                  }; // The request will be also be aborted if we've exceeded our storage
                  // space.


                  transaction.onabort = function () {
                    var err = req.error ? req.error : req.transaction.error;
                    reject(err);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function clear(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var req = store.clear();

                  transaction.oncomplete = function () {
                    resolve();
                  };

                  transaction.onabort = transaction.onerror = function () {
                    var err = req.error ? req.error : req.transaction.error;
                    reject(err);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function length(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var req = store.count();

                  req.onsuccess = function () {
                    resolve(req.result);
                  };

                  req.onerror = function () {
                    reject(req.error);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function key(n, callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            if (n < 0) {
              resolve(null);
              return;
            }

            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var advanced = false;
                  var req = store.openCursor();

                  req.onsuccess = function () {
                    var cursor = req.result;

                    if (!cursor) {
                      // this means there weren't enough keys
                      resolve(null);
                      return;
                    }

                    if (n === 0) {
                      // We have the first key, return it if that's what they
                      // wanted.
                      resolve(cursor.key);
                    } else {
                      if (!advanced) {
                        // Otherwise, ask the cursor to skip ahead n
                        // records.
                        advanced = true;
                        cursor.advance(n);
                      } else {
                        // When we get here, we've got the nth key.
                        resolve(cursor.key);
                      }
                    }
                  };

                  req.onerror = function () {
                    reject(req.error);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function keys(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                  return reject(err);
                }

                try {
                  var store = transaction.objectStore(self._dbInfo.storeName);
                  var req = store.openCursor();
                  var keys = [];

                  req.onsuccess = function () {
                    var cursor = req.result;

                    if (!cursor) {
                      resolve(keys);
                      return;
                    }

                    keys.push(cursor.key);
                    cursor["continue"]();
                  };

                  req.onerror = function () {
                    reject(req.error);
                  };
                } catch (e) {
                  reject(e);
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function dropInstance(options, callback) {
          callback = getCallback.apply(this, arguments);
          var currentConfig = this.config();
          options = typeof options !== 'function' && options || {};

          if (!options.name) {
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }

          var self = this;
          var promise;

          if (!options.name) {
            promise = Promise$1.reject('Invalid arguments');
          } else {
            var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;
            var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
              var dbContext = dbContexts[options.name];
              var forages = dbContext.forages;
              dbContext.db = db;

              for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
              }

              return db;
            });

            if (!options.storeName) {
              promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;
                db.close();

                for (var i = 0; i < forages.length; i++) {
                  var forage = forages[i];
                  forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                  var req = idb.deleteDatabase(options.name);

                  req.onerror = req.onblocked = function (err) {
                    var db = req.result;

                    if (db) {
                      db.close();
                    }

                    reject(err);
                  };

                  req.onsuccess = function () {
                    var db = req.result;

                    if (db) {
                      db.close();
                    }

                    resolve(db);
                  };
                });
                return dropDBPromise.then(function (db) {
                  dbContext.db = db;

                  for (var i = 0; i < forages.length; i++) {
                    var _forage = forages[i];

                    _advanceReadiness(_forage._dbInfo);
                  }
                })["catch"](function (err) {
                  (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                  throw err;
                });
              });
            } else {
              promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                  return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;
                db.close();

                for (var i = 0; i < forages.length; i++) {
                  var forage = forages[i];
                  forage._dbInfo.db = null;
                  forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                  var req = idb.open(options.name, newVersion);

                  req.onerror = function (err) {
                    var db = req.result;
                    db.close();
                    reject(err);
                  };

                  req.onupgradeneeded = function () {
                    var db = req.result;
                    db.deleteObjectStore(options.storeName);
                  };

                  req.onsuccess = function () {
                    var db = req.result;
                    db.close();
                    resolve(db);
                  };
                });
                return dropObjectPromise.then(function (db) {
                  dbContext.db = db;

                  for (var j = 0; j < forages.length; j++) {
                    var _forage2 = forages[j];
                    _forage2._dbInfo.db = db;

                    _advanceReadiness(_forage2._dbInfo);
                  }
                })["catch"](function (err) {
                  (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                  throw err;
                });
              });
            }
          }

          executeCallback(promise, callback);
          return promise;
        }

        var asyncStorage = {
          _driver: 'asyncStorage',
          _initStorage: _initStorage,
          _support: isIndexedDBValid(),
          iterate: iterate,
          getItem: getItem,
          setItem: setItem,
          removeItem: removeItem,
          clear: clear,
          length: length,
          key: key,
          keys: keys,
          dropInstance: dropInstance
        };

        function isWebSQLValid() {
          return typeof openDatabase === 'function';
        } // Sadly, the best way to save binary data in WebSQL/localStorage is serializing
        // it to Base64, so this is how we store it to prevent very strange errors with less
        // verbose ways of binary <-> string data storage.


        var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var BLOB_TYPE_PREFIX = '~~local_forage_type~';
        var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
        var SERIALIZED_MARKER = '__lfsc__:';
        var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length; // OMG the serializations!

        var TYPE_ARRAYBUFFER = 'arbf';
        var TYPE_BLOB = 'blob';
        var TYPE_INT8ARRAY = 'si08';
        var TYPE_UINT8ARRAY = 'ui08';
        var TYPE_UINT8CLAMPEDARRAY = 'uic8';
        var TYPE_INT16ARRAY = 'si16';
        var TYPE_INT32ARRAY = 'si32';
        var TYPE_UINT16ARRAY = 'ur16';
        var TYPE_UINT32ARRAY = 'ui32';
        var TYPE_FLOAT32ARRAY = 'fl32';
        var TYPE_FLOAT64ARRAY = 'fl64';
        var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
        var toString$1 = Object.prototype.toString;

        function stringToBuffer(serializedString) {
          // Fill the string into a ArrayBuffer.
          var bufferLength = serializedString.length * 0.75;
          var len = serializedString.length;
          var i;
          var p = 0;
          var encoded1, encoded2, encoded3, encoded4;

          if (serializedString[serializedString.length - 1] === '=') {
            bufferLength--;

            if (serializedString[serializedString.length - 2] === '=') {
              bufferLength--;
            }
          }

          var buffer = new ArrayBuffer(bufferLength);
          var bytes = new Uint8Array(buffer);

          for (i = 0; i < len; i += 4) {
            encoded1 = BASE_CHARS.indexOf(serializedString[i]);
            encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
            encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
            encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
            /*jslint bitwise: true */

            bytes[p++] = encoded1 << 2 | encoded2 >> 4;
            bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
            bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
          }

          return buffer;
        } // Converts a buffer to a string to store, serialized, in the backend
        // storage library.


        function bufferToString(buffer) {
          // base64-arraybuffer
          var bytes = new Uint8Array(buffer);
          var base64String = '';
          var i;

          for (i = 0; i < bytes.length; i += 3) {
            /*jslint bitwise: true */
            base64String += BASE_CHARS[bytes[i] >> 2];
            base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
            base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
            base64String += BASE_CHARS[bytes[i + 2] & 63];
          }

          if (bytes.length % 3 === 2) {
            base64String = base64String.substring(0, base64String.length - 1) + '=';
          } else if (bytes.length % 3 === 1) {
            base64String = base64String.substring(0, base64String.length - 2) + '==';
          }

          return base64String;
        } // Serialize a value, afterwards executing a callback (which usually
        // instructs the `setItem()` callback/promise to be executed). This is how
        // we store binary data with localStorage.


        function serialize(value, callback) {
          var valueType = '';

          if (value) {
            valueType = toString$1.call(value);
          } // Cannot use `value instanceof ArrayBuffer` or such here, as these
          // checks fail when running the tests using casper.js...
          //
          // TODO: See why those tests fail and use a better solution.


          if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
            // Convert binary arrays to a string and prefix the string with
            // a special marker.
            var buffer;
            var marker = SERIALIZED_MARKER;

            if (value instanceof ArrayBuffer) {
              buffer = value;
              marker += TYPE_ARRAYBUFFER;
            } else {
              buffer = value.buffer;

              if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
              } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
              } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
              } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
              } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
              } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
              } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
              } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
              } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
              } else {
                callback(new Error('Failed to get type for BinaryArray'));
              }
            }

            callback(marker + bufferToString(buffer));
          } else if (valueType === '[object Blob]') {
            // Conver the blob to a binaryArray and then to a string.
            var fileReader = new FileReader();

            fileReader.onload = function () {
              // Backwards-compatible prefix for the blob type.
              var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);
              callback(SERIALIZED_MARKER + TYPE_BLOB + str);
            };

            fileReader.readAsArrayBuffer(value);
          } else {
            try {
              callback(JSON.stringify(value));
            } catch (e) {
              console.error("Couldn't convert value into a JSON string: ", value);
              callback(null, e);
            }
          }
        } // Deserialize data we've inserted into a value column/field. We place
        // special markers into our strings to mark them as encoded; this isn't
        // as nice as a meta field, but it's the only sane thing we can do whilst
        // keeping localStorage support intact.
        //
        // Oftentimes this will just deserialize JSON content, but if we have a
        // special marker (SERIALIZED_MARKER, defined above), we will extract
        // some kind of arraybuffer/binary data/typed array out of the string.


        function deserialize(value) {
          // If we haven't marked this string as being specially serialized (i.e.
          // something other than serialized JSON), we can just return it and be
          // done with it.
          if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
            return JSON.parse(value);
          } // The following code deals with deserializing some kind of Blob or
          // TypedArray. First we separate out the type of data we're dealing
          // with from the data itself.


          var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
          var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
          var blobType; // Backwards-compatible blob type serialization strategy.
          // DBs created with older versions of localForage will simply not have the blob type.

          if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
            var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
            blobType = matcher[1];
            serializedString = serializedString.substring(matcher[0].length);
          }

          var buffer = stringToBuffer(serializedString); // Return the right type based on the code/type set during
          // serialization.

          switch (type) {
            case TYPE_ARRAYBUFFER:
              return buffer;

            case TYPE_BLOB:
              return createBlob([buffer], {
                type: blobType
              });

            case TYPE_INT8ARRAY:
              return new Int8Array(buffer);

            case TYPE_UINT8ARRAY:
              return new Uint8Array(buffer);

            case TYPE_UINT8CLAMPEDARRAY:
              return new Uint8ClampedArray(buffer);

            case TYPE_INT16ARRAY:
              return new Int16Array(buffer);

            case TYPE_UINT16ARRAY:
              return new Uint16Array(buffer);

            case TYPE_INT32ARRAY:
              return new Int32Array(buffer);

            case TYPE_UINT32ARRAY:
              return new Uint32Array(buffer);

            case TYPE_FLOAT32ARRAY:
              return new Float32Array(buffer);

            case TYPE_FLOAT64ARRAY:
              return new Float64Array(buffer);

            default:
              throw new Error('Unkown type: ' + type);
          }
        }

        var localforageSerializer = {
          serialize: serialize,
          deserialize: deserialize,
          stringToBuffer: stringToBuffer,
          bufferToString: bufferToString
        };
        /*
         * Includes code from:
         *
         * base64-arraybuffer
         * https://github.com/niklasvh/base64-arraybuffer
         *
         * Copyright (c) 2012 Niklas von Hertzen
         * Licensed under the MIT license.
         */

        function createDbTable(t, dbInfo, callback, errorCallback) {
          t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
        } // Open the WebSQL database (automatically creates one if one didn't
        // previously exist), using any options set in the config.


        function _initStorage$1(options) {
          var self = this;
          var dbInfo = {
            db: null
          };

          if (options) {
            for (var i in options) {
              dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
            }
          }

          var dbInfoPromise = new Promise$1(function (resolve, reject) {
            // Open the database; the openDatabase API will automatically
            // create it for us if it doesn't exist.
            try {
              dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
            } catch (e) {
              return reject(e);
            } // Create our key/value table if it doesn't exist.


            dbInfo.db.transaction(function (t) {
              createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
              }, function (t, error) {
                reject(error);
              });
            }, reject);
          });
          dbInfo.serializer = localforageSerializer;
          return dbInfoPromise;
        }

        function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
          t.executeSql(sqlStatement, args, callback, function (t, error) {
            if (error.code === error.SYNTAX_ERR) {
              t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
                if (!results.rows.length) {
                  // if the table is missing (was deleted)
                  // re-create it table and retry
                  createDbTable(t, dbInfo, function () {
                    t.executeSql(sqlStatement, args, callback, errorCallback);
                  }, errorCallback);
                } else {
                  errorCallback(t, error);
                }
              }, errorCallback);
            } else {
              errorCallback(t, error);
            }
          }, errorCallback);
        }

        function getItem$1(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                  var result = results.rows.length ? results.rows.item(0).value : null; // Check to see if this is serialized content we need to
                  // unpack.

                  if (result) {
                    result = dbInfo.serializer.deserialize(result);
                  }

                  resolve(result);
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function iterate$1(iterator, callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                  var rows = results.rows;
                  var length = rows.length;

                  for (var i = 0; i < length; i++) {
                    var item = rows.item(i);
                    var result = item.value; // Check to see if this is serialized content
                    // we need to unpack.

                    if (result) {
                      result = dbInfo.serializer.deserialize(result);
                    }

                    result = iterator(result, item.key, i + 1); // void(0) prevents problems with redefinition
                    // of `undefined`.

                    if (result !== void 0) {
                      resolve(result);
                      return;
                    }
                  }

                  resolve();
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function _setItem(key, value, callback, retriesLeft) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              // The localStorage API doesn't return undefined values in an
              // "expected" way, so undefined is always cast to null in all
              // drivers. See: https://github.com/mozilla/localForage/pull/42
              if (value === undefined) {
                value = null;
              } // Save the original value to pass to the callback.


              var originalValue = value;
              var dbInfo = self._dbInfo;
              dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                  reject(error);
                } else {
                  dbInfo.db.transaction(function (t) {
                    tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                      resolve(originalValue);
                    }, function (t, error) {
                      reject(error);
                    });
                  }, function (sqlError) {
                    // The transaction failed; check
                    // to see if it's a quota error.
                    if (sqlError.code === sqlError.QUOTA_ERR) {
                      // We reject the callback outright for now, but
                      // it's worth trying to re-run the transaction.
                      // Even if the user accepts the prompt to use
                      // more storage on Safari, this error will
                      // be called.
                      //
                      // Try to re-run the transaction.
                      if (retriesLeft > 0) {
                        resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                        return;
                      }

                      reject(sqlError);
                    }
                  });
                }
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function setItem$1(key, value, callback) {
          return _setItem.apply(this, [key, value, callback, 1]);
        }

        function removeItem$1(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                  resolve();
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        } // Deletes every item in the table.
        // TODO: Find out if this resets the AUTO_INCREMENT number.


        function clear$1(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                  resolve();
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        } // Does a simple `COUNT(key)` to get the number of items stored in
        // localForage.


        function length$1(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                  var result = results.rows.item(0).c;
                  resolve(result);
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        } // Return the key located at key index X; essentially gets the key from a
        // `WHERE id = ?`. This is the most efficient way I can think to implement
        // this rarely-used (in my experience) part of the API, but it can seem
        // inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
        // the ID of each key will change every time it's updated. Perhaps a stored
        // procedure for the `setItem()` SQL would solve this problem?
        // TODO: Don't change ID on `setItem()`.


        function key$1(n, callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                  var result = results.rows.length ? results.rows.item(0).key : null;
                  resolve(result);
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        }

        function keys$1(callback) {
          var self = this;
          var promise = new Promise$1(function (resolve, reject) {
            self.ready().then(function () {
              var dbInfo = self._dbInfo;
              dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                  var keys = [];

                  for (var i = 0; i < results.rows.length; i++) {
                    keys.push(results.rows.item(i).key);
                  }

                  resolve(keys);
                }, function (t, error) {
                  reject(error);
                });
              });
            })["catch"](reject);
          });
          executeCallback(promise, callback);
          return promise;
        } // https://www.w3.org/TR/webdatabase/#databases
        // > There is no way to enumerate or delete the databases available for an origin from this API.


        function getAllStoreNames(db) {
          return new Promise$1(function (resolve, reject) {
            db.transaction(function (t) {
              t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                  storeNames.push(results.rows.item(i).name);
                }

                resolve({
                  db: db,
                  storeNames: storeNames
                });
              }, function (t, error) {
                reject(error);
              });
            }, function (sqlError) {
              reject(sqlError);
            });
          });
        }

        function dropInstance$1(options, callback) {
          callback = getCallback.apply(this, arguments);
          var currentConfig = this.config();
          options = typeof options !== 'function' && options || {};

          if (!options.name) {
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }

          var self = this;
          var promise;

          if (!options.name) {
            promise = Promise$1.reject('Invalid arguments');
          } else {
            promise = new Promise$1(function (resolve) {
              var db;

              if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
              } else {
                db = openDatabase(options.name, '', '', 0);
              }

              if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
              } else {
                resolve({
                  db: db,
                  storeNames: [options.storeName]
                });
              }
            }).then(function (operationInfo) {
              return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                  function dropTable(storeName) {
                    return new Promise$1(function (resolve, reject) {
                      t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                        resolve();
                      }, function (t, error) {
                        reject(error);
                      });
                    });
                  }

                  var operations = [];

                  for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                    operations.push(dropTable(operationInfo.storeNames[i]));
                  }

                  Promise$1.all(operations).then(function () {
                    resolve();
                  })["catch"](function (e) {
                    reject(e);
                  });
                }, function (sqlError) {
                  reject(sqlError);
                });
              });
            });
          }

          executeCallback(promise, callback);
          return promise;
        }

        var webSQLStorage = {
          _driver: 'webSQLStorage',
          _initStorage: _initStorage$1,
          _support: isWebSQLValid(),
          iterate: iterate$1,
          getItem: getItem$1,
          setItem: setItem$1,
          removeItem: removeItem$1,
          clear: clear$1,
          length: length$1,
          key: key$1,
          keys: keys$1,
          dropInstance: dropInstance$1
        };

        function isLocalStorageValid() {
          try {
            return typeof localStorage !== 'undefined' && 'setItem' in localStorage && // in IE8 typeof localStorage.setItem === 'object'
            !!localStorage.setItem;
          } catch (e) {
            return false;
          }
        }

        function _getKeyPrefix(options, defaultConfig) {
          var keyPrefix = options.name + '/';

          if (options.storeName !== defaultConfig.storeName) {
            keyPrefix += options.storeName + '/';
          }

          return keyPrefix;
        } // Check if localStorage throws when saving an item


        function checkIfLocalStorageThrows() {
          var localStorageTestKey = '_localforage_support_test';

          try {
            localStorage.setItem(localStorageTestKey, true);
            localStorage.removeItem(localStorageTestKey);
            return false;
          } catch (e) {
            return true;
          }
        } // Check if localStorage is usable and allows to save an item
        // This method checks if localStorage is usable in Safari Private Browsing
        // mode, or in any other case where the available quota for localStorage
        // is 0 and there wasn't any saved items yet.


        function _isLocalStorageUsable() {
          return !checkIfLocalStorageThrows() || localStorage.length > 0;
        } // Config the localStorage backend, using options set in the config.


        function _initStorage$2(options) {
          var self = this;
          var dbInfo = {};

          if (options) {
            for (var i in options) {
              dbInfo[i] = options[i];
            }
          }

          dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

          if (!_isLocalStorageUsable()) {
            return Promise$1.reject();
          }

          self._dbInfo = dbInfo;
          dbInfo.serializer = localforageSerializer;
          return Promise$1.resolve();
        } // Remove all keys from the datastore, effectively destroying all data in
        // the app's key/value store!


        function clear$2(callback) {
          var self = this;
          var promise = self.ready().then(function () {
            var keyPrefix = self._dbInfo.keyPrefix;

            for (var i = localStorage.length - 1; i >= 0; i--) {
              var key = localStorage.key(i);

              if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
              }
            }
          });
          executeCallback(promise, callback);
          return promise;
        } // Retrieve an item from the store. Unlike the original async_storage
        // library in Gaia, we don't modify return values at all. If a key's value
        // is `undefined`, we pass that value to the callback function.


        function getItem$2(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var result = localStorage.getItem(dbInfo.keyPrefix + key); // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the key
            // is likely undefined and we'll pass it straight to the
            // callback.

            if (result) {
              result = dbInfo.serializer.deserialize(result);
            }

            return result;
          });
          executeCallback(promise, callback);
          return promise;
        } // Iterate over all items in the store.


        function iterate$2(iterator, callback) {
          var self = this;
          var promise = self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var keyPrefix = dbInfo.keyPrefix;
            var keyPrefixLength = keyPrefix.length;
            var length = localStorage.length; // We use a dedicated iterator instead of the `i` variable below
            // so other keys we fetch in localStorage aren't counted in
            // the `iterationNumber` argument passed to the `iterate()`
            // callback.
            //
            // See: github.com/mozilla/localForage/pull/435#discussion_r38061530

            var iterationNumber = 1;

            for (var i = 0; i < length; i++) {
              var key = localStorage.key(i);

              if (key.indexOf(keyPrefix) !== 0) {
                continue;
              }

              var value = localStorage.getItem(key); // If a result was found, parse it from the serialized
              // string into a JS object. If result isn't truthy, the
              // key is likely undefined and we'll pass it straight
              // to the iterator.

              if (value) {
                value = dbInfo.serializer.deserialize(value);
              }

              value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

              if (value !== void 0) {
                return value;
              }
            }
          });
          executeCallback(promise, callback);
          return promise;
        } // Same as localStorage's key() method, except takes a callback.


        function key$2(n, callback) {
          var self = this;
          var promise = self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var result;

            try {
              result = localStorage.key(n);
            } catch (error) {
              result = null;
            } // Remove the prefix from the key, if a key is found.


            if (result) {
              result = result.substring(dbInfo.keyPrefix.length);
            }

            return result;
          });
          executeCallback(promise, callback);
          return promise;
        }

        function keys$2(callback) {
          var self = this;
          var promise = self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var length = localStorage.length;
            var keys = [];

            for (var i = 0; i < length; i++) {
              var itemKey = localStorage.key(i);

              if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
              }
            }

            return keys;
          });
          executeCallback(promise, callback);
          return promise;
        } // Supply the number of keys in the datastore to the callback function.


        function length$2(callback) {
          var self = this;
          var promise = self.keys().then(function (keys) {
            return keys.length;
          });
          executeCallback(promise, callback);
          return promise;
        } // Remove an item from the store, nice and simple.


        function removeItem$2(key, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = self.ready().then(function () {
            var dbInfo = self._dbInfo;
            localStorage.removeItem(dbInfo.keyPrefix + key);
          });
          executeCallback(promise, callback);
          return promise;
        } // Set a key's value and run an optional callback once the value is set.
        // Unlike Gaia's implementation, the callback function is passed the value,
        // in case you want to operate on that value only after you're sure it
        // saved, or something like that.


        function setItem$2(key, value, callback) {
          var self = this;
          key = normalizeKey(key);
          var promise = self.ready().then(function () {
            // Convert undefined values to null.
            // https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
              value = null;
            } // Save the original value to pass to the callback.


            var originalValue = value;
            return new Promise$1(function (resolve, reject) {
              var dbInfo = self._dbInfo;
              dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                  reject(error);
                } else {
                  try {
                    localStorage.setItem(dbInfo.keyPrefix + key, value);
                    resolve(originalValue);
                  } catch (e) {
                    // localStorage capacity exceeded.
                    // TODO: Make this a specific error/event.
                    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                      reject(e);
                    }

                    reject(e);
                  }
                }
              });
            });
          });
          executeCallback(promise, callback);
          return promise;
        }

        function dropInstance$2(options, callback) {
          callback = getCallback.apply(this, arguments);
          options = typeof options !== 'function' && options || {};

          if (!options.name) {
            var currentConfig = this.config();
            options.name = options.name || currentConfig.name;
            options.storeName = options.storeName || currentConfig.storeName;
          }

          var self = this;
          var promise;

          if (!options.name) {
            promise = Promise$1.reject('Invalid arguments');
          } else {
            promise = new Promise$1(function (resolve) {
              if (!options.storeName) {
                resolve(options.name + '/');
              } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
              }
            }).then(function (keyPrefix) {
              for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                  localStorage.removeItem(key);
                }
              }
            });
          }

          executeCallback(promise, callback);
          return promise;
        }

        var localStorageWrapper = {
          _driver: 'localStorageWrapper',
          _initStorage: _initStorage$2,
          _support: isLocalStorageValid(),
          iterate: iterate$2,
          getItem: getItem$2,
          setItem: setItem$2,
          removeItem: removeItem$2,
          clear: clear$2,
          length: length$2,
          key: key$2,
          keys: keys$2,
          dropInstance: dropInstance$2
        };

        var sameValue = function sameValue(x, y) {
          return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
        };

        var includes = function includes(array, searchElement) {
          var len = array.length;
          var i = 0;

          while (i < len) {
            if (sameValue(array[i], searchElement)) {
              return true;
            }

            i++;
          }

          return false;
        };

        var isArray = Array.isArray || function (arg) {
          return Object.prototype.toString.call(arg) === '[object Array]';
        }; // Drivers are stored here when `defineDriver()` is called.
        // They are shared across all instances of localForage.


        var DefinedDrivers = {};
        var DriverSupport = {};
        var DefaultDrivers = {
          INDEXEDDB: asyncStorage,
          WEBSQL: webSQLStorage,
          LOCALSTORAGE: localStorageWrapper
        };
        var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
        var OptionalDriverMethods = ['dropInstance'];
        var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);
        var DefaultConfig = {
          description: '',
          driver: DefaultDriverOrder.slice(),
          name: 'localforage',
          // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
          // we can use without a prompt.
          size: 4980736,
          storeName: 'keyvaluepairs',
          version: 1.0
        };

        function callWhenReady(localForageInstance, libraryMethod) {
          localForageInstance[libraryMethod] = function () {
            var _args = arguments;
            return localForageInstance.ready().then(function () {
              return localForageInstance[libraryMethod].apply(localForageInstance, _args);
            });
          };
        }

        function extend() {
          for (var i = 1; i < arguments.length; i++) {
            var arg = arguments[i];

            if (arg) {
              for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                  if (isArray(arg[_key])) {
                    arguments[0][_key] = arg[_key].slice();
                  } else {
                    arguments[0][_key] = arg[_key];
                  }
                }
              }
            }
          }

          return arguments[0];
        }

        var LocalForage = function () {
          function LocalForage(options) {
            _classCallCheck(this, LocalForage);

            for (var driverTypeKey in DefaultDrivers) {
              if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                  // we don't need to wait for the promise,
                  // since the default drivers can be defined
                  // in a blocking manner
                  this.defineDriver(driver);
                }
              }
            }

            this._defaultConfig = extend({}, DefaultConfig);
            this._config = extend({}, this._defaultConfig, options);
            this._driverSet = null;
            this._initDriver = null;
            this._ready = false;
            this._dbInfo = null;

            this._wrapLibraryMethodsWithReady();

            this.setDriver(this._config.driver)["catch"](function () {});
          } // Set any config values for localForage; can be called anytime before
          // the first API call (e.g. `getItem`, `setItem`).
          // We loop through options so we don't overwrite existing config
          // values.


          LocalForage.prototype.config = function config(options) {
            // If the options argument is an object, we use it to set values.
            // Otherwise, we return either a specified config value or all
            // config values.
            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
              // If localforage is ready and fully initialized, we can't set
              // any new configuration values. Instead, we return an error.
              if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
              }

              for (var i in options) {
                if (i === 'storeName') {
                  options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                  return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
              } // after all config options are set and
              // the driver option is used, try setting it


              if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
              }

              return true;
            } else if (typeof options === 'string') {
              return this._config[options];
            } else {
              return this._config;
            }
          }; // Used to define a custom driver, shared across all instances of
          // localForage.


          LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
            var promise = new Promise$1(function (resolve, reject) {
              try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver'); // A driver name should be defined and not overlap with the
                // library-defined, default drivers.

                if (!driverObject._driver) {
                  reject(complianceError);
                  return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');

                for (var i = 0, len = driverMethods.length; i < len; i++) {
                  var driverMethodName = driverMethods[i]; // when the property is there,
                  // it should be a method even when optional

                  var isRequired = !includes(OptionalDriverMethods, driverMethodName);

                  if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                    reject(complianceError);
                    return;
                  }
                }

                var configureMissingMethods = function configureMissingMethods() {
                  var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                    return function () {
                      var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                      var promise = Promise$1.reject(error);
                      executeCallback(promise, arguments[arguments.length - 1]);
                      return promise;
                    };
                  };

                  for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                    var optionalDriverMethod = OptionalDriverMethods[_i];

                    if (!driverObject[optionalDriverMethod]) {
                      driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                    }
                  }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                  if (DefinedDrivers[driverName]) {
                    console.info('Redefining LocalForage driver: ' + driverName);
                  }

                  DefinedDrivers[driverName] = driverObject;
                  DriverSupport[driverName] = support; // don't use a then, so that we can define
                  // drivers that have simple _support methods
                  // in a blocking manner

                  resolve();
                };

                if ('_support' in driverObject) {
                  if (driverObject._support && typeof driverObject._support === 'function') {
                    driverObject._support().then(setDriverSupport, reject);
                  } else {
                    setDriverSupport(!!driverObject._support);
                  }
                } else {
                  setDriverSupport(true);
                }
              } catch (e) {
                reject(e);
              }
            });
            executeTwoCallbacks(promise, callback, errorCallback);
            return promise;
          };

          LocalForage.prototype.driver = function driver() {
            return this._driver || null;
          };

          LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
            var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));
            executeTwoCallbacks(getDriverPromise, callback, errorCallback);
            return getDriverPromise;
          };

          LocalForage.prototype.getSerializer = function getSerializer(callback) {
            var serializerPromise = Promise$1.resolve(localforageSerializer);
            executeTwoCallbacks(serializerPromise, callback);
            return serializerPromise;
          };

          LocalForage.prototype.ready = function ready(callback) {
            var self = this;

            var promise = self._driverSet.then(function () {
              if (self._ready === null) {
                self._ready = self._initDriver();
              }

              return self._ready;
            });

            executeTwoCallbacks(promise, callback, callback);
            return promise;
          };

          LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
            var self = this;

            if (!isArray(drivers)) {
              drivers = [drivers];
            }

            var supportedDrivers = this._getSupportedDrivers(drivers);

            function setDriverToConfig() {
              self._config.driver = self.driver();
            }

            function extendSelfWithDriver(driver) {
              self._extend(driver);

              setDriverToConfig();
              self._ready = self._initStorage(self._config);
              return self._ready;
            }

            function initDriver(supportedDrivers) {
              return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                  while (currentDriverIndex < supportedDrivers.length) {
                    var driverName = supportedDrivers[currentDriverIndex];
                    currentDriverIndex++;
                    self._dbInfo = null;
                    self._ready = null;
                    return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                  }

                  setDriverToConfig();
                  var error = new Error('No available storage method found.');
                  self._driverSet = Promise$1.reject(error);
                  return self._driverSet;
                }

                return driverPromiseLoop();
              };
            } // There might be a driver initialization in progress
            // so wait for it to finish in order to avoid a possible
            // race condition to set _dbInfo


            var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
              return Promise$1.resolve();
            }) : Promise$1.resolve();
            this._driverSet = oldDriverSetDone.then(function () {
              var driverName = supportedDrivers[0];
              self._dbInfo = null;
              self._ready = null;
              return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();

                self._wrapLibraryMethodsWithReady();

                self._initDriver = initDriver(supportedDrivers);
              });
            })["catch"](function () {
              setDriverToConfig();
              var error = new Error('No available storage method found.');
              self._driverSet = Promise$1.reject(error);
              return self._driverSet;
            });
            executeTwoCallbacks(this._driverSet, callback, errorCallback);
            return this._driverSet;
          };

          LocalForage.prototype.supports = function supports(driverName) {
            return !!DriverSupport[driverName];
          };

          LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
            extend(this, libraryMethodsAndProperties);
          };

          LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
            var supportedDrivers = [];

            for (var i = 0, len = drivers.length; i < len; i++) {
              var driverName = drivers[i];

              if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
              }
            }

            return supportedDrivers;
          };

          LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
            // Add a stub for each driver API method that delays the call to the
            // corresponding driver method until localForage is ready. These stubs
            // will be replaced by the driver methods as soon as the driver is
            // loaded, so there is no performance impact.
            for (var i = 0, len = LibraryMethods.length; i < len; i++) {
              callWhenReady(this, LibraryMethods[i]);
            }
          };

          LocalForage.prototype.createInstance = function createInstance(options) {
            return new LocalForage(options);
          };

          return LocalForage;
        }(); // The actual localForage object that we expose as a module or via a
        // global. It's extended by pulling in one of our other libraries.


        var localforage_js = new LocalForage();
        module.exports = localforage_js;
      }, {
        "3": 3
      }]
    }, {}, [4])(4);
  });
});

// import "core-js/stable";
TQSDK.axios = axios$1;
TQSDK.TqWebsocket = TqWebsocket;
TQSDK.TQData = DataManager;
TQSDK.version = version; // store with db

var DB_NAME = 'his_settlements';
var stores = {};
var oldVersion = localStorage.getItem('cc_db_ver');

if (oldVersion !== db_version) {
  // 数据库版本升级，整个数据库重置
  var DBDeleteRequest = indexedDB.deleteDatabase(DB_NAME);

  DBDeleteRequest.onerror = function (event) {
    console.log('Error deleting database.');
  };

  DBDeleteRequest.onsuccess = function (event) {
    localStorage.setItem('cc_db_ver', db_version);
  };
}

TQSDK.store = {
  getContent: function getContent(userId, tradingDay) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      });
    }

    return stores[userId].getItem(String(tradingDay));
  },
  setContent: function setContent(userId, tradingDay, content) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      });
    }

    return stores[userId].setItem(String(tradingDay), content);
  }
};

export default TQSDK;
