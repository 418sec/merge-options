'use strict';

var isOptionObject = require('is-plain-obj');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var propertyIsEnumerable = Object.propertyIsEnumerable;

var defineProperty = function defineProperty(obj, name, value) {
  return Object.defineProperty(obj, name, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true
  });
};

var globalThis = void 0;
var defaultMergeOpts = {
  concatArrays: false
};

var getEnumerableOwnPropertyKeys = function getEnumerableOwnPropertyKeys(value) {
  var keys = [];

  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      keys.push(key);
    }
  }
  /* istanbul ignore else  */


  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(value);

    for (var i = 0; i < symbols.length; i++) {
      if (propertyIsEnumerable.call(value, symbols[i])) {
        keys.push(symbols[i]);
      }
    }
  }

  return keys;
};

function clone(value) {
  if (Array.isArray(value)) {
    return cloneArray(value);
  }

  if (isOptionObject(value)) {
    return cloneOptionObject(value);
  }

  return value;
}

function cloneArray(array) {
  var result = array.slice(0, 0);
  getEnumerableOwnPropertyKeys(array).forEach(function (key) {
    defineProperty(result, key, clone(array[key]));
  });
  return result;
}

function cloneOptionObject(obj) {
  var result = Object.getPrototypeOf(obj) === null ? Object.create(null) : {};
  getEnumerableOwnPropertyKeys(obj).forEach(function (key) {
    defineProperty(result, key, clone(obj[key]));
  });
  return result;
}
/**
 * @param merged already cloned
 * @return cloned Object
 */


var mergeKeys = function mergeKeys(merged, source, keys, mergeOpts) {
  keys.forEach(function (key) {
    // Do not recurse into prototype chain of merged
    if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
      defineProperty(merged, key, merge(merged[key], source[key], mergeOpts));
    } else {
      defineProperty(merged, key, clone(source[key]));
    }
  });
  return merged;
};
/**
 * @param merged already cloned
 * @return cloned Object
 *
 * see [Array.prototype.concat ( ...arguments )](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat)
 */


var concatArrays = function concatArrays(merged, source, mergeOpts) {
  var result = merged.slice(0, 0);
  var resultIndex = 0;
  [merged, source].forEach(function (array) {
    var indices = []; // `result.concat(array)` with cloning

    for (var k = 0; k < array.length; k++) {
      if (!hasOwnProperty.call(array, k)) {
        continue;
      }

      indices.push(String(k));

      if (array === merged) {
        // Already cloned
        defineProperty(result, resultIndex++, array[k]);
      } else {
        defineProperty(result, resultIndex++, clone(array[k]));
      }
    } // Merge non-index keys


    result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(function (key) {
      return indices.indexOf(key) === -1;
    }), mergeOpts);
  });
  return result;
};
/**
 * @param merged already cloned
 * @return cloned Object
 */


function merge(merged, source, mergeOpts) {
  if (mergeOpts.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
    return concatArrays(merged, source, mergeOpts);
  }

  if (!isOptionObject(source) || !isOptionObject(merged)) {
    return clone(source);
  }

  return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), mergeOpts);
}

module.exports = function () {
  var mergeOpts = merge(clone(defaultMergeOpts), this !== globalThis && this || {}, defaultMergeOpts);
  var merged = {
    foobar: {}
  };

  for (var _len = arguments.length, options = new Array(_len), _key = 0; _key < _len; _key++) {
    options[_key] = arguments[_key];
  }

  var _arr = options;

  for (var _i = 0; _i < _arr.length; _i++) {
    var option = _arr[_i];

    if (option === undefined) {
      continue;
    }

    if (!isOptionObject(option)) {
      throw new TypeError('`' + option + '` is not an Option Object');
    }

    merged = merge(merged, {
      foobar: option
    }, mergeOpts);
  }

  return merged.foobar;
};
