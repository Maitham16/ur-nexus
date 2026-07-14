import {
  __esm,
  __export
} from "./index-8rxa073f.js";

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_listCacheClear.js
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear_default;
var init__listCacheClear = __esm(() => {
  _listCacheClear_default = listCacheClear;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/eq.js
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_default;
var init_eq = __esm(() => {
  eq_default = eq;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_assocIndexOf.js
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf_default;
var init__assocIndexOf = __esm(() => {
  init_eq();
  _assocIndexOf_default = assocIndexOf;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_listCacheDelete.js
function listCacheDelete(key) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var arrayProto, splice, _listCacheDelete_default;
var init__listCacheDelete = __esm(() => {
  init__assocIndexOf();
  arrayProto = Array.prototype;
  splice = arrayProto.splice;
  _listCacheDelete_default = listCacheDelete;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_listCacheGet.js
function listCacheGet(key) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  return index < 0 ? undefined : data[index][1];
}
var _listCacheGet_default;
var init__listCacheGet = __esm(() => {
  init__assocIndexOf();
  _listCacheGet_default = listCacheGet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_listCacheHas.js
function listCacheHas(key) {
  return _assocIndexOf_default(this.__data__, key) > -1;
}
var _listCacheHas_default;
var init__listCacheHas = __esm(() => {
  init__assocIndexOf();
  _listCacheHas_default = listCacheHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_listCacheSet.js
function listCacheSet(key, value) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var _listCacheSet_default;
var init__listCacheSet = __esm(() => {
  init__assocIndexOf();
  _listCacheSet_default = listCacheSet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_ListCache.js
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
var _ListCache_default;
var init__ListCache = __esm(() => {
  init__listCacheClear();
  init__listCacheDelete();
  init__listCacheGet();
  init__listCacheHas();
  init__listCacheSet();
  ListCache.prototype.clear = _listCacheClear_default;
  ListCache.prototype["delete"] = _listCacheDelete_default;
  ListCache.prototype.get = _listCacheGet_default;
  ListCache.prototype.has = _listCacheHas_default;
  ListCache.prototype.set = _listCacheSet_default;
  _ListCache_default = ListCache;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stackClear.js
function stackClear() {
  this.__data__ = new _ListCache_default;
  this.size = 0;
}
var _stackClear_default;
var init__stackClear = __esm(() => {
  init__ListCache();
  _stackClear_default = stackClear;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stackDelete.js
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var _stackDelete_default;
var init__stackDelete = __esm(() => {
  _stackDelete_default = stackDelete;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stackGet.js
function stackGet(key) {
  return this.__data__.get(key);
}
var _stackGet_default;
var init__stackGet = __esm(() => {
  _stackGet_default = stackGet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stackHas.js
function stackHas(key) {
  return this.__data__.has(key);
}
var _stackHas_default;
var init__stackHas = __esm(() => {
  _stackHas_default = stackHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_freeGlobal.js
var freeGlobal, _freeGlobal_default;
var init__freeGlobal = __esm(() => {
  freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  _freeGlobal_default = freeGlobal;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_root.js
var freeSelf, root, _root_default;
var init__root = __esm(() => {
  init__freeGlobal();
  freeSelf = typeof self == "object" && self && self.Object === Object && self;
  root = _freeGlobal_default || freeSelf || Function("return this")();
  _root_default = root;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Symbol.js
var Symbol, _Symbol_default;
var init__Symbol = __esm(() => {
  init__root();
  Symbol = _root_default.Symbol;
  _Symbol_default = Symbol;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getRawTag.js
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
var objectProto, hasOwnProperty, nativeObjectToString, symToStringTag, _getRawTag_default;
var init__getRawTag = __esm(() => {
  init__Symbol();
  objectProto = Object.prototype;
  hasOwnProperty = objectProto.hasOwnProperty;
  nativeObjectToString = objectProto.toString;
  symToStringTag = _Symbol_default ? _Symbol_default.toStringTag : undefined;
  _getRawTag_default = getRawTag;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_objectToString.js
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
var objectProto2, nativeObjectToString2, _objectToString_default;
var init__objectToString = __esm(() => {
  objectProto2 = Object.prototype;
  nativeObjectToString2 = objectProto2.toString;
  _objectToString_default = objectToString;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseGetTag.js
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? _getRawTag_default(value) : _objectToString_default(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]", symToStringTag2, _baseGetTag_default;
var init__baseGetTag = __esm(() => {
  init__Symbol();
  init__getRawTag();
  init__objectToString();
  symToStringTag2 = _Symbol_default ? _Symbol_default.toStringTag : undefined;
  _baseGetTag_default = baseGetTag;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isObject.js
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_default;
var init_isObject = __esm(() => {
  isObject_default = isObject;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isFunction.js
function isFunction(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = _baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]", isFunction_default;
var init_isFunction = __esm(() => {
  init__baseGetTag();
  init_isObject();
  isFunction_default = isFunction;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_coreJsData.js
var coreJsData, _coreJsData_default;
var init__coreJsData = __esm(() => {
  init__root();
  coreJsData = _root_default["__core-js_shared__"];
  _coreJsData_default = coreJsData;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isMasked.js
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var maskSrcKey, _isMasked_default;
var init__isMasked = __esm(() => {
  init__coreJsData();
  maskSrcKey = function() {
    var uid = /[^.]+$/.exec(_coreJsData_default && _coreJsData_default.keys && _coreJsData_default.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  _isMasked_default = isMasked;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_toSource.js
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return func + "";
    } catch (e) {}
  }
  return "";
}
var funcProto, funcToString, _toSource_default;
var init__toSource = __esm(() => {
  funcProto = Function.prototype;
  funcToString = funcProto.toString;
  _toSource_default = toSource;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsNative.js
function baseIsNative(value) {
  if (!isObject_default(value) || _isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource_default(value));
}
var reRegExpChar, reIsHostCtor, funcProto2, objectProto3, funcToString2, hasOwnProperty2, reIsNative, _baseIsNative_default;
var init__baseIsNative = __esm(() => {
  init_isFunction();
  init__isMasked();
  init_isObject();
  init__toSource();
  reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  reIsHostCtor = /^\[object .+?Constructor\]$/;
  funcProto2 = Function.prototype;
  objectProto3 = Object.prototype;
  funcToString2 = funcProto2.toString;
  hasOwnProperty2 = objectProto3.hasOwnProperty;
  reIsNative = RegExp("^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  _baseIsNative_default = baseIsNative;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getValue.js
function getValue(object, key) {
  return object == null ? undefined : object[key];
}
var _getValue_default;
var init__getValue = __esm(() => {
  _getValue_default = getValue;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getNative.js
function getNative(object, key) {
  var value = _getValue_default(object, key);
  return _baseIsNative_default(value) ? value : undefined;
}
var _getNative_default;
var init__getNative = __esm(() => {
  init__baseIsNative();
  init__getValue();
  _getNative_default = getNative;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Map.js
var Map2, _Map_default;
var init__Map = __esm(() => {
  init__getNative();
  init__root();
  Map2 = _getNative_default(_root_default, "Map");
  _Map_default = Map2;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_nativeCreate.js
var nativeCreate, _nativeCreate_default;
var init__nativeCreate = __esm(() => {
  init__getNative();
  nativeCreate = _getNative_default(Object, "create");
  _nativeCreate_default = nativeCreate;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hashClear.js
function hashClear() {
  this.__data__ = _nativeCreate_default ? _nativeCreate_default(null) : {};
  this.size = 0;
}
var _hashClear_default;
var init__hashClear = __esm(() => {
  init__nativeCreate();
  _hashClear_default = hashClear;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hashDelete.js
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete_default;
var init__hashDelete = __esm(() => {
  _hashDelete_default = hashDelete;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hashGet.js
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate_default) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty3.call(data, key) ? data[key] : undefined;
}
var HASH_UNDEFINED = "__lodash_hash_undefined__", objectProto4, hasOwnProperty3, _hashGet_default;
var init__hashGet = __esm(() => {
  init__nativeCreate();
  objectProto4 = Object.prototype;
  hasOwnProperty3 = objectProto4.hasOwnProperty;
  _hashGet_default = hashGet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hashHas.js
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate_default ? data[key] !== undefined : hasOwnProperty4.call(data, key);
}
var objectProto5, hasOwnProperty4, _hashHas_default;
var init__hashHas = __esm(() => {
  init__nativeCreate();
  objectProto5 = Object.prototype;
  hasOwnProperty4 = objectProto5.hasOwnProperty;
  _hashHas_default = hashHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hashSet.js
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = _nativeCreate_default && value === undefined ? HASH_UNDEFINED2 : value;
  return this;
}
var HASH_UNDEFINED2 = "__lodash_hash_undefined__", _hashSet_default;
var init__hashSet = __esm(() => {
  init__nativeCreate();
  _hashSet_default = hashSet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Hash.js
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
var _Hash_default;
var init__Hash = __esm(() => {
  init__hashClear();
  init__hashDelete();
  init__hashGet();
  init__hashHas();
  init__hashSet();
  Hash.prototype.clear = _hashClear_default;
  Hash.prototype["delete"] = _hashDelete_default;
  Hash.prototype.get = _hashGet_default;
  Hash.prototype.has = _hashHas_default;
  Hash.prototype.set = _hashSet_default;
  _Hash_default = Hash;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapCacheClear.js
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    hash: new _Hash_default,
    map: new (_Map_default || _ListCache_default),
    string: new _Hash_default
  };
}
var _mapCacheClear_default;
var init__mapCacheClear = __esm(() => {
  init__Hash();
  init__ListCache();
  init__Map();
  _mapCacheClear_default = mapCacheClear;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isKeyable.js
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable_default;
var init__isKeyable = __esm(() => {
  _isKeyable_default = isKeyable;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getMapData.js
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData_default;
var init__getMapData = __esm(() => {
  init__isKeyable();
  _getMapData_default = getMapData;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapCacheDelete.js
function mapCacheDelete(key) {
  var result = _getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete_default;
var init__mapCacheDelete = __esm(() => {
  init__getMapData();
  _mapCacheDelete_default = mapCacheDelete;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapCacheGet.js
function mapCacheGet(key) {
  return _getMapData_default(this, key).get(key);
}
var _mapCacheGet_default;
var init__mapCacheGet = __esm(() => {
  init__getMapData();
  _mapCacheGet_default = mapCacheGet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapCacheHas.js
function mapCacheHas(key) {
  return _getMapData_default(this, key).has(key);
}
var _mapCacheHas_default;
var init__mapCacheHas = __esm(() => {
  init__getMapData();
  _mapCacheHas_default = mapCacheHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapCacheSet.js
function mapCacheSet(key, value) {
  var data = _getMapData_default(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet_default;
var init__mapCacheSet = __esm(() => {
  init__getMapData();
  _mapCacheSet_default = mapCacheSet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_MapCache.js
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
var _MapCache_default;
var init__MapCache = __esm(() => {
  init__mapCacheClear();
  init__mapCacheDelete();
  init__mapCacheGet();
  init__mapCacheHas();
  init__mapCacheSet();
  MapCache.prototype.clear = _mapCacheClear_default;
  MapCache.prototype["delete"] = _mapCacheDelete_default;
  MapCache.prototype.get = _mapCacheGet_default;
  MapCache.prototype.has = _mapCacheHas_default;
  MapCache.prototype.set = _mapCacheSet_default;
  _MapCache_default = MapCache;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stackSet.js
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache_default) {
    var pairs = data.__data__;
    if (!_Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache_default(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var LARGE_ARRAY_SIZE = 200, _stackSet_default;
var init__stackSet = __esm(() => {
  init__ListCache();
  init__Map();
  init__MapCache();
  _stackSet_default = stackSet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Stack.js
function Stack(entries) {
  var data = this.__data__ = new _ListCache_default(entries);
  this.size = data.size;
}
var _Stack_default;
var init__Stack = __esm(() => {
  init__ListCache();
  init__stackClear();
  init__stackDelete();
  init__stackGet();
  init__stackHas();
  init__stackSet();
  Stack.prototype.clear = _stackClear_default;
  Stack.prototype["delete"] = _stackDelete_default;
  Stack.prototype.get = _stackGet_default;
  Stack.prototype.has = _stackHas_default;
  Stack.prototype.set = _stackSet_default;
  _Stack_default = Stack;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_setCacheAdd.js
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED3);
  return this;
}
var HASH_UNDEFINED3 = "__lodash_hash_undefined__", _setCacheAdd_default;
var init__setCacheAdd = __esm(() => {
  _setCacheAdd_default = setCacheAdd;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_setCacheHas.js
function setCacheHas(value) {
  return this.__data__.has(value);
}
var _setCacheHas_default;
var init__setCacheHas = __esm(() => {
  _setCacheHas_default = setCacheHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_SetCache.js
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new _MapCache_default;
  while (++index < length) {
    this.add(values[index]);
  }
}
var _SetCache_default;
var init__SetCache = __esm(() => {
  init__MapCache();
  init__setCacheAdd();
  init__setCacheHas();
  SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd_default;
  SetCache.prototype.has = _setCacheHas_default;
  _SetCache_default = SetCache;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_arraySome.js
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
var _arraySome_default;
var init__arraySome = __esm(() => {
  _arraySome_default = arraySome;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_cacheHas.js
function cacheHas(cache, key) {
  return cache.has(key);
}
var _cacheHas_default;
var init__cacheHas = __esm(() => {
  _cacheHas_default = cacheHas;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_equalArrays.js
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache_default : undefined;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!_arraySome_default(other, function(othValue2, othIndex) {
        if (!_cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2, _equalArrays_default;
var init__equalArrays = __esm(() => {
  init__SetCache();
  init__arraySome();
  init__cacheHas();
  _equalArrays_default = equalArrays;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Uint8Array.js
var Uint8Array, _Uint8Array_default;
var init__Uint8Array = __esm(() => {
  init__root();
  Uint8Array = _root_default.Uint8Array;
  _Uint8Array_default = Uint8Array;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_mapToArray.js
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var _mapToArray_default;
var init__mapToArray = __esm(() => {
  _mapToArray_default = mapToArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_setToArray.js
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var _setToArray_default;
var init__setToArray = __esm(() => {
  _setToArray_default = setToArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_equalByTag.js
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array_default(object), new _Uint8Array_default(other))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq_default(+object, +other);
    case errorTag:
      return object.name == other.name && object.message == other.message;
    case regexpTag:
    case stringTag:
      return object == other + "";
    case mapTag:
      var convert = _mapToArray_default;
    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
      convert || (convert = _setToArray_default);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG2;
      stack.set(object, other);
      var result = _equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG2 = 1, COMPARE_UNORDERED_FLAG2 = 2, boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", symbolProto, symbolValueOf, _equalByTag_default;
var init__equalByTag = __esm(() => {
  init__Symbol();
  init__Uint8Array();
  init_eq();
  init__equalArrays();
  init__mapToArray();
  init__setToArray();
  symbolProto = _Symbol_default ? _Symbol_default.prototype : undefined;
  symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  _equalByTag_default = equalByTag;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_arrayPush.js
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var _arrayPush_default;
var init__arrayPush = __esm(() => {
  _arrayPush_default = arrayPush;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isArray.js
var isArray, isArray_default;
var init_isArray = __esm(() => {
  isArray = Array.isArray;
  isArray_default = isArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseGetAllKeys.js
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_default(object) ? result : _arrayPush_default(result, symbolsFunc(object));
}
var _baseGetAllKeys_default;
var init__baseGetAllKeys = __esm(() => {
  init__arrayPush();
  init_isArray();
  _baseGetAllKeys_default = baseGetAllKeys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_arrayFilter.js
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter_default;
var init__arrayFilter = __esm(() => {
  _arrayFilter_default = arrayFilter;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/stubArray.js
function stubArray() {
  return [];
}
var stubArray_default;
var init_stubArray = __esm(() => {
  stubArray_default = stubArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getSymbols.js
var objectProto6, propertyIsEnumerable, nativeGetSymbols, getSymbols, _getSymbols_default;
var init__getSymbols = __esm(() => {
  init__arrayFilter();
  init_stubArray();
  objectProto6 = Object.prototype;
  propertyIsEnumerable = objectProto6.propertyIsEnumerable;
  nativeGetSymbols = Object.getOwnPropertySymbols;
  getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return _arrayFilter_default(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  _getSymbols_default = getSymbols;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseTimes.js
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var _baseTimes_default;
var init__baseTimes = __esm(() => {
  _baseTimes_default = baseTimes;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isObjectLike.js
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_default;
var init_isObjectLike = __esm(() => {
  isObjectLike_default = isObjectLike;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsArguments.js
function baseIsArguments(value) {
  return isObjectLike_default(value) && _baseGetTag_default(value) == argsTag;
}
var argsTag = "[object Arguments]", _baseIsArguments_default;
var init__baseIsArguments = __esm(() => {
  init__baseGetTag();
  init_isObjectLike();
  _baseIsArguments_default = baseIsArguments;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isArguments.js
var objectProto7, hasOwnProperty5, propertyIsEnumerable2, isArguments, isArguments_default;
var init_isArguments = __esm(() => {
  init__baseIsArguments();
  init_isObjectLike();
  objectProto7 = Object.prototype;
  hasOwnProperty5 = objectProto7.hasOwnProperty;
  propertyIsEnumerable2 = objectProto7.propertyIsEnumerable;
  isArguments = _baseIsArguments_default(function() {
    return arguments;
  }()) ? _baseIsArguments_default : function(value) {
    return isObjectLike_default(value) && hasOwnProperty5.call(value, "callee") && !propertyIsEnumerable2.call(value, "callee");
  };
  isArguments_default = isArguments;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/stubFalse.js
function stubFalse() {
  return false;
}
var stubFalse_default;
var init_stubFalse = __esm(() => {
  stubFalse_default = stubFalse;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isBuffer.js
var exports_isBuffer = {};
__export(exports_isBuffer, {
  default: () => isBuffer_default
});
var freeExports, freeModule, moduleExports, Buffer, nativeIsBuffer, isBuffer, isBuffer_default;
var init_isBuffer = __esm(() => {
  init__root();
  init_stubFalse();
  freeExports = typeof exports_isBuffer == "object" && exports_isBuffer && !exports_isBuffer.nodeType && exports_isBuffer;
  freeModule = freeExports && typeof module_isBuffer == "object" && module_isBuffer && !module_isBuffer.nodeType && module_isBuffer;
  moduleExports = freeModule && freeModule.exports === freeExports;
  Buffer = moduleExports ? _root_default.Buffer : undefined;
  nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
  isBuffer = nativeIsBuffer || stubFalse_default;
  isBuffer_default = isBuffer;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isIndex.js
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var MAX_SAFE_INTEGER = 9007199254740991, reIsUint, _isIndex_default;
var init__isIndex = __esm(() => {
  reIsUint = /^(?:0|[1-9]\d*)$/;
  _isIndex_default = isIndex;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isLength.js
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
}
var MAX_SAFE_INTEGER2 = 9007199254740991, isLength_default;
var init_isLength = __esm(() => {
  isLength_default = isLength;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsTypedArray.js
function baseIsTypedArray(value) {
  return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[_baseGetTag_default(value)];
}
var argsTag2 = "[object Arguments]", arrayTag = "[object Array]", boolTag2 = "[object Boolean]", dateTag2 = "[object Date]", errorTag2 = "[object Error]", funcTag2 = "[object Function]", mapTag2 = "[object Map]", numberTag2 = "[object Number]", objectTag = "[object Object]", regexpTag2 = "[object RegExp]", setTag2 = "[object Set]", stringTag2 = "[object String]", weakMapTag = "[object WeakMap]", arrayBufferTag2 = "[object ArrayBuffer]", dataViewTag2 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]", typedArrayTags, _baseIsTypedArray_default;
var init__baseIsTypedArray = __esm(() => {
  init__baseGetTag();
  init_isLength();
  init_isObjectLike();
  typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag2] = typedArrayTags[boolTag2] = typedArrayTags[dataViewTag2] = typedArrayTags[dateTag2] = typedArrayTags[errorTag2] = typedArrayTags[funcTag2] = typedArrayTags[mapTag2] = typedArrayTags[numberTag2] = typedArrayTags[objectTag] = typedArrayTags[regexpTag2] = typedArrayTags[setTag2] = typedArrayTags[stringTag2] = typedArrayTags[weakMapTag] = false;
  _baseIsTypedArray_default = baseIsTypedArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseUnary.js
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary_default;
var init__baseUnary = __esm(() => {
  _baseUnary_default = baseUnary;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_nodeUtil.js
var exports__nodeUtil = {};
__export(exports__nodeUtil, {
  default: () => _nodeUtil_default
});
var freeExports2, freeModule2, moduleExports2, freeProcess, nodeUtil, _nodeUtil_default;
var init__nodeUtil = __esm(() => {
  init__freeGlobal();
  freeExports2 = typeof exports__nodeUtil == "object" && exports__nodeUtil && !exports__nodeUtil.nodeType && exports__nodeUtil;
  freeModule2 = freeExports2 && typeof module__nodeUtil == "object" && module__nodeUtil && !module__nodeUtil.nodeType && module__nodeUtil;
  moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
  freeProcess = moduleExports2 && _freeGlobal_default.process;
  nodeUtil = function() {
    try {
      var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {}
  }();
  _nodeUtil_default = nodeUtil;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isTypedArray.js
var nodeIsTypedArray, isTypedArray, isTypedArray_default;
var init_isTypedArray = __esm(() => {
  init__baseIsTypedArray();
  init__baseUnary();
  init__nodeUtil();
  nodeIsTypedArray = _nodeUtil_default && _nodeUtil_default.isTypedArray;
  isTypedArray = nodeIsTypedArray ? _baseUnary_default(nodeIsTypedArray) : _baseIsTypedArray_default;
  isTypedArray_default = isTypedArray;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_arrayLikeKeys.js
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? _baseTimes_default(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty6.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || _isIndex_default(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var objectProto8, hasOwnProperty6, _arrayLikeKeys_default;
var init__arrayLikeKeys = __esm(() => {
  init__baseTimes();
  init_isArguments();
  init_isArray();
  init_isBuffer();
  init__isIndex();
  init_isTypedArray();
  objectProto8 = Object.prototype;
  hasOwnProperty6 = objectProto8.hasOwnProperty;
  _arrayLikeKeys_default = arrayLikeKeys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isPrototype.js
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto9;
  return value === proto;
}
var objectProto9, _isPrototype_default;
var init__isPrototype = __esm(() => {
  objectProto9 = Object.prototype;
  _isPrototype_default = isPrototype;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_overArg.js
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg_default;
var init__overArg = __esm(() => {
  _overArg_default = overArg;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_nativeKeys.js
var nativeKeys, _nativeKeys_default;
var init__nativeKeys = __esm(() => {
  init__overArg();
  nativeKeys = _overArg_default(Object.keys, Object);
  _nativeKeys_default = nativeKeys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseKeys.js
function baseKeys(object) {
  if (!_isPrototype_default(object)) {
    return _nativeKeys_default(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty7.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var objectProto10, hasOwnProperty7, _baseKeys_default;
var init__baseKeys = __esm(() => {
  init__isPrototype();
  init__nativeKeys();
  objectProto10 = Object.prototype;
  hasOwnProperty7 = objectProto10.hasOwnProperty;
  _baseKeys_default = baseKeys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isArrayLike.js
function isArrayLike(value) {
  return value != null && isLength_default(value.length) && !isFunction_default(value);
}
var isArrayLike_default;
var init_isArrayLike = __esm(() => {
  init_isFunction();
  init_isLength();
  isArrayLike_default = isArrayLike;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/keys.js
function keys(object) {
  return isArrayLike_default(object) ? _arrayLikeKeys_default(object) : _baseKeys_default(object);
}
var keys_default;
var init_keys = __esm(() => {
  init__arrayLikeKeys();
  init__baseKeys();
  init_isArrayLike();
  keys_default = keys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getAllKeys.js
function getAllKeys(object) {
  return _baseGetAllKeys_default(object, keys_default, _getSymbols_default);
}
var _getAllKeys_default;
var init__getAllKeys = __esm(() => {
  init__baseGetAllKeys();
  init__getSymbols();
  init_keys();
  _getAllKeys_default = getAllKeys;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_equalObjects.js
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = _getAllKeys_default(object), objLength = objProps.length, othProps = _getAllKeys_default(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty8.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && (("constructor" in object) && ("constructor" in other)) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG3 = 1, objectProto11, hasOwnProperty8, _equalObjects_default;
var init__equalObjects = __esm(() => {
  init__getAllKeys();
  objectProto11 = Object.prototype;
  hasOwnProperty8 = objectProto11.hasOwnProperty;
  _equalObjects_default = equalObjects;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_DataView.js
var DataView, _DataView_default;
var init__DataView = __esm(() => {
  init__getNative();
  init__root();
  DataView = _getNative_default(_root_default, "DataView");
  _DataView_default = DataView;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Promise.js
var Promise2, _Promise_default;
var init__Promise = __esm(() => {
  init__getNative();
  init__root();
  Promise2 = _getNative_default(_root_default, "Promise");
  _Promise_default = Promise2;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_Set.js
var Set2, _Set_default;
var init__Set = __esm(() => {
  init__getNative();
  init__root();
  Set2 = _getNative_default(_root_default, "Set");
  _Set_default = Set2;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_WeakMap.js
var WeakMap, _WeakMap_default;
var init__WeakMap = __esm(() => {
  init__getNative();
  init__root();
  WeakMap = _getNative_default(_root_default, "WeakMap");
  _WeakMap_default = WeakMap;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getTag.js
var mapTag3 = "[object Map]", objectTag2 = "[object Object]", promiseTag = "[object Promise]", setTag3 = "[object Set]", weakMapTag2 = "[object WeakMap]", dataViewTag3 = "[object DataView]", dataViewCtorString, mapCtorString, promiseCtorString, setCtorString, weakMapCtorString, getTag, _getTag_default;
var init__getTag = __esm(() => {
  init__DataView();
  init__Map();
  init__Promise();
  init__Set();
  init__WeakMap();
  init__baseGetTag();
  init__toSource();
  dataViewCtorString = _toSource_default(_DataView_default);
  mapCtorString = _toSource_default(_Map_default);
  promiseCtorString = _toSource_default(_Promise_default);
  setCtorString = _toSource_default(_Set_default);
  weakMapCtorString = _toSource_default(_WeakMap_default);
  getTag = _baseGetTag_default;
  if (_DataView_default && getTag(new _DataView_default(new ArrayBuffer(1))) != dataViewTag3 || _Map_default && getTag(new _Map_default) != mapTag3 || _Promise_default && getTag(_Promise_default.resolve()) != promiseTag || _Set_default && getTag(new _Set_default) != setTag3 || _WeakMap_default && getTag(new _WeakMap_default) != weakMapTag2) {
    getTag = function(value) {
      var result = _baseGetTag_default(value), Ctor = result == objectTag2 ? value.constructor : undefined, ctorString = Ctor ? _toSource_default(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag3;
          case mapCtorString:
            return mapTag3;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag3;
          case weakMapCtorString:
            return weakMapTag2;
        }
      }
      return result;
    };
  }
  _getTag_default = getTag;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsEqualDeep.js
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag2 : _getTag_default(object), othTag = othIsArr ? arrayTag2 : _getTag_default(other);
  objTag = objTag == argsTag3 ? objectTag3 : objTag;
  othTag = othTag == argsTag3 ? objectTag3 : othTag;
  var objIsObj = objTag == objectTag3, othIsObj = othTag == objectTag3, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_default(object)) {
    if (!isBuffer_default(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack_default);
    return objIsArr || isTypedArray_default(object) ? _equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
    var objIsWrapped = objIsObj && hasOwnProperty9.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty9.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new _Stack_default);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack_default);
  return _equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
}
var COMPARE_PARTIAL_FLAG4 = 1, argsTag3 = "[object Arguments]", arrayTag2 = "[object Array]", objectTag3 = "[object Object]", objectProto12, hasOwnProperty9, _baseIsEqualDeep_default;
var init__baseIsEqualDeep = __esm(() => {
  init__Stack();
  init__equalArrays();
  init__equalByTag();
  init__equalObjects();
  init__getTag();
  init_isArray();
  init_isBuffer();
  init_isTypedArray();
  objectProto12 = Object.prototype;
  hasOwnProperty9 = objectProto12.hasOwnProperty;
  _baseIsEqualDeep_default = baseIsEqualDeep;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsEqual.js
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
}
var _baseIsEqual_default;
var init__baseIsEqual = __esm(() => {
  init__baseIsEqualDeep();
  init_isObjectLike();
  _baseIsEqual_default = baseIsEqual;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIsMatch.js
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack_default;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined ? _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var COMPARE_PARTIAL_FLAG5 = 1, COMPARE_UNORDERED_FLAG3 = 2, _baseIsMatch_default;
var init__baseIsMatch = __esm(() => {
  init__Stack();
  init__baseIsEqual();
  _baseIsMatch_default = baseIsMatch;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isStrictComparable.js
function isStrictComparable(value) {
  return value === value && !isObject_default(value);
}
var _isStrictComparable_default;
var init__isStrictComparable = __esm(() => {
  init_isObject();
  _isStrictComparable_default = isStrictComparable;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getMatchData.js
function getMatchData(object) {
  var result = keys_default(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, _isStrictComparable_default(value)];
  }
  return result;
}
var _getMatchData_default;
var init__getMatchData = __esm(() => {
  init__isStrictComparable();
  init_keys();
  _getMatchData_default = getMatchData;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_matchesStrictComparable.js
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== undefined || (key in Object(object)));
  };
}
var _matchesStrictComparable_default;
var init__matchesStrictComparable = __esm(() => {
  _matchesStrictComparable_default = matchesStrictComparable;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseMatches.js
function baseMatches(source) {
  var matchData = _getMatchData_default(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch_default(object, source, matchData);
  };
}
var _baseMatches_default;
var init__baseMatches = __esm(() => {
  init__baseIsMatch();
  init__getMatchData();
  init__matchesStrictComparable();
  _baseMatches_default = baseMatches;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isSymbol.js
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && _baseGetTag_default(value) == symbolTag2;
}
var symbolTag2 = "[object Symbol]", isSymbol_default;
var init_isSymbol = __esm(() => {
  init__baseGetTag();
  init_isObjectLike();
  isSymbol_default = isSymbol;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isKey.js
function isKey(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var reIsDeepProp, reIsPlainProp, _isKey_default;
var init__isKey = __esm(() => {
  init_isArray();
  init_isSymbol();
  reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  reIsPlainProp = /^\w*$/;
  _isKey_default = isKey;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/memoize.js
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache_default);
  return memoized;
}
var FUNC_ERROR_TEXT = "Expected a function", memoize_default;
var init_memoize = __esm(() => {
  init__MapCache();
  memoize.Cache = _MapCache_default;
  memoize_default = memoize;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_memoizeCapped.js
function memoizeCapped(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var MAX_MEMOIZE_SIZE = 500, _memoizeCapped_default;
var init__memoizeCapped = __esm(() => {
  init_memoize();
  _memoizeCapped_default = memoizeCapped;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_stringToPath.js
var rePropName, reEscapeChar, stringToPath, _stringToPath_default;
var init__stringToPath = __esm(() => {
  init__memoizeCapped();
  rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  reEscapeChar = /\\(\\)?/g;
  stringToPath = _memoizeCapped_default(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  _stringToPath_default = stringToPath;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_arrayMap.js
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var _arrayMap_default;
var init__arrayMap = __esm(() => {
  _arrayMap_default = arrayMap;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseToString.js
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return _arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var INFINITY, symbolProto2, symbolToString, _baseToString_default;
var init__baseToString = __esm(() => {
  init__Symbol();
  init__arrayMap();
  init_isArray();
  init_isSymbol();
  INFINITY = 1 / 0;
  symbolProto2 = _Symbol_default ? _Symbol_default.prototype : undefined;
  symbolToString = symbolProto2 ? symbolProto2.toString : undefined;
  _baseToString_default = baseToString;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/toString.js
function toString(value) {
  return value == null ? "" : _baseToString_default(value);
}
var toString_default;
var init_toString = __esm(() => {
  init__baseToString();
  toString_default = toString;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_castPath.js
function castPath(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return _isKey_default(value, object) ? [value] : _stringToPath_default(toString_default(value));
}
var _castPath_default;
var init__castPath = __esm(() => {
  init_isArray();
  init__isKey();
  init__stringToPath();
  init_toString();
  _castPath_default = castPath;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_toKey.js
function toKey(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
}
var INFINITY2, _toKey_default;
var init__toKey = __esm(() => {
  init_isSymbol();
  INFINITY2 = 1 / 0;
  _toKey_default = toKey;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseGet.js
function baseGet(object, path) {
  path = _castPath_default(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[_toKey_default(path[index++])];
  }
  return index && index == length ? object : undefined;
}
var _baseGet_default;
var init__baseGet = __esm(() => {
  init__castPath();
  init__toKey();
  _baseGet_default = baseGet;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/get.js
function get(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet_default(object, path);
  return result === undefined ? defaultValue : result;
}
var get_default;
var init_get = __esm(() => {
  init__baseGet();
  get_default = get;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseHasIn.js
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
var _baseHasIn_default;
var init__baseHasIn = __esm(() => {
  _baseHasIn_default = baseHasIn;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_hasPath.js
function hasPath(object, path, hasFunc) {
  path = _castPath_default(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = _toKey_default(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_default(length) && _isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
}
var _hasPath_default;
var init__hasPath = __esm(() => {
  init__castPath();
  init_isArguments();
  init_isArray();
  init__isIndex();
  init_isLength();
  init__toKey();
  _hasPath_default = hasPath;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/hasIn.js
function hasIn(object, path) {
  return object != null && _hasPath_default(object, path, _baseHasIn_default);
}
var hasIn_default;
var init_hasIn = __esm(() => {
  init__baseHasIn();
  init__hasPath();
  hasIn_default = hasIn;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseMatchesProperty.js
function baseMatchesProperty(path, srcValue) {
  if (_isKey_default(path) && _isStrictComparable_default(srcValue)) {
    return _matchesStrictComparable_default(_toKey_default(path), srcValue);
  }
  return function(object) {
    var objValue = get_default(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn_default(object, path) : _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
  };
}
var COMPARE_PARTIAL_FLAG6 = 1, COMPARE_UNORDERED_FLAG4 = 2, _baseMatchesProperty_default;
var init__baseMatchesProperty = __esm(() => {
  init__baseIsEqual();
  init_get();
  init_hasIn();
  init__isKey();
  init__isStrictComparable();
  init__matchesStrictComparable();
  init__toKey();
  _baseMatchesProperty_default = baseMatchesProperty;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/identity.js
function identity(value) {
  return value;
}
var identity_default;
var init_identity = __esm(() => {
  identity_default = identity;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseProperty.js
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}
var _baseProperty_default;
var init__baseProperty = __esm(() => {
  _baseProperty_default = baseProperty;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_basePropertyDeep.js
function basePropertyDeep(path) {
  return function(object) {
    return _baseGet_default(object, path);
  };
}
var _basePropertyDeep_default;
var init__basePropertyDeep = __esm(() => {
  init__baseGet();
  _basePropertyDeep_default = basePropertyDeep;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/property.js
function property(path) {
  return _isKey_default(path) ? _baseProperty_default(_toKey_default(path)) : _basePropertyDeep_default(path);
}
var property_default;
var init_property = __esm(() => {
  init__baseProperty();
  init__basePropertyDeep();
  init__isKey();
  init__toKey();
  property_default = property;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseIteratee.js
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity_default;
  }
  if (typeof value == "object") {
    return isArray_default(value) ? _baseMatchesProperty_default(value[0], value[1]) : _baseMatches_default(value);
  }
  return property_default(value);
}
var _baseIteratee_default;
var init__baseIteratee = __esm(() => {
  init__baseMatches();
  init__baseMatchesProperty();
  init_identity();
  init_isArray();
  init_property();
  _baseIteratee_default = baseIteratee;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseSum.js
function baseSum(array, iteratee) {
  var result, index = -1, length = array.length;
  while (++index < length) {
    var current = iteratee(array[index]);
    if (current !== undefined) {
      result = result === undefined ? current : result + current;
    }
  }
  return result;
}
var _baseSum_default;
var init__baseSum = __esm(() => {
  _baseSum_default = baseSum;
});

// ../../node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/sumBy.js
function sumBy(array, iteratee) {
  return array && array.length ? _baseSum_default(array, _baseIteratee_default(iteratee, 2)) : 0;
}
var sumBy_default;
var init_sumBy = __esm(() => {
  init__baseIteratee();
  init__baseSum();
  sumBy_default = sumBy;
});

// ../../src/utils/crypto.ts
import { randomUUID } from "crypto";
var init_crypto = () => {};

// ../../src/utils/settings/settingsCache.ts
function getSessionSettingsCache() {
  return sessionSettingsCache;
}
function setSessionSettingsCache(value) {
  sessionSettingsCache = value;
}
function getCachedSettingsForSource(source) {
  return perSourceCache.has(source) ? perSourceCache.get(source) : undefined;
}
function setCachedSettingsForSource(source, value) {
  perSourceCache.set(source, value);
}
function getCachedParsedFile(path) {
  return parseFileCache.get(path);
}
function setCachedParsedFile(path, value) {
  parseFileCache.set(path, value);
}
function resetSettingsCache() {
  sessionSettingsCache = null;
  perSourceCache.clear();
  parseFileCache.clear();
}
function getPluginSettingsBase() {
  return pluginSettingsBase;
}
function setPluginSettingsBase(settings) {
  pluginSettingsBase = settings;
}
function clearPluginSettingsBase() {
  pluginSettingsBase = undefined;
}
var sessionSettingsCache = null, perSourceCache, parseFileCache, pluginSettingsBase;
var init_settingsCache = __esm(() => {
  perSourceCache = new Map;
  parseFileCache = new Map;
});

// ../../src/utils/signal.ts
function createSignal() {
  const listeners = new Set;
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(...args) {
      for (const listener of listeners)
        listener(...args);
    },
    clear() {
      listeners.clear();
    }
  };
}
var init_signal = () => {};

// ../../src/bootstrap/state.ts
import { realpathSync } from "fs";
import { cwd } from "process";
function getInitialState() {
  let resolvedCwd = "";
  if (typeof process !== "undefined" && typeof process.cwd === "function" && typeof realpathSync === "function") {
    const rawCwd = cwd();
    try {
      resolvedCwd = realpathSync(rawCwd).normalize("NFC");
    } catch {
      resolvedCwd = rawCwd.normalize("NFC");
    }
  }
  const state = {
    originalCwd: resolvedCwd,
    projectRoot: resolvedCwd,
    totalCostUSD: 0,
    totalAPIDuration: 0,
    totalAPIDurationWithoutRetries: 0,
    totalToolDuration: 0,
    turnHookDurationMs: 0,
    turnToolDurationMs: 0,
    turnClassifierDurationMs: 0,
    turnToolCount: 0,
    turnHookCount: 0,
    turnClassifierCount: 0,
    startTime: Date.now(),
    lastInteractionTime: Date.now(),
    totalLinesAdded: 0,
    totalLinesRemoved: 0,
    hasUnknownModelCost: false,
    cwd: resolvedCwd,
    modelUsage: {},
    mainLoopModelOverride: undefined,
    initialMainLoopModel: null,
    modelStrings: null,
    isInteractive: false,
    kairosActive: false,
    strictToolResultPairing: false,
    sdkAgentProgressSummariesEnabled: false,
    userMsgOptIn: false,
    clientType: "cli",
    sessionSource: undefined,
    questionPreviewFormat: undefined,
    sessionIngressToken: undefined,
    oauthTokenFromFd: undefined,
    apiKeyFromFd: undefined,
    flagSettingsPath: undefined,
    flagSettingsInline: null,
    allowedSettingSources: [
      "userSettings",
      "projectSettings",
      "localSettings",
      "flagSettings",
      "policySettings"
    ],
    meter: null,
    sessionCounter: null,
    locCounter: null,
    prCounter: null,
    commitCounter: null,
    costCounter: null,
    tokenCounter: null,
    codeEditToolDecisionCounter: null,
    activeTimeCounter: null,
    statsStore: null,
    sessionId: randomUUID(),
    parentSessionId: undefined,
    loggerProvider: null,
    eventLogger: null,
    meterProvider: null,
    tracerProvider: null,
    agentColorMap: new Map,
    agentColorIndex: 0,
    lastAPIRequest: null,
    lastAPIRequestMessages: null,
    lastClassifierRequests: null,
    cachedAgentMdContent: null,
    inMemoryErrorLog: [],
    inlinePlugins: [],
    chromeFlagOverride: undefined,
    useCoworkPlugins: false,
    sessionBypassPermissionsMode: false,
    scheduledTasksEnabled: false,
    sessionCronTasks: [],
    sessionCreatedTeams: new Set,
    sessionTrustAccepted: false,
    sessionPersistenceDisabled: false,
    hasExitedPlanMode: false,
    needsPlanModeExitAttachment: false,
    needsAutoModeExitAttachment: false,
    lspRecommendationShownThisSession: false,
    initJsonSchema: null,
    registeredHooks: null,
    planSlugCache: new Map,
    teleportedSessionInfo: null,
    invokedSkills: new Map,
    slowOperations: [],
    sdkBetas: undefined,
    mainThreadAgentType: undefined,
    isRemoteMode: false,
    offlineMode: false,
    ...process.env.USER_TYPE === "ant" ? {
      replBridgeActive: false
    } : {},
    directConnectServerUrl: undefined,
    systemPromptSectionCache: new Map,
    lastEmittedDate: null,
    additionalDirectoriesForAgentMd: [],
    allowedChannels: [],
    hasDevChannels: false,
    sessionProjectDir: null,
    promptCache1hAllowlist: null,
    promptCache1hEligible: null,
    afkModeHeaderLatched: null,
    fastModeHeaderLatched: null,
    cacheEditingHeaderLatched: null,
    thinkingClearLatched: null,
    promptId: null,
    lastMainRequestId: undefined,
    lastApiCompletionTimestamp: null,
    pendingPostCompaction: false
  };
  return state;
}
function getSessionId() {
  return STATE.sessionId;
}
function regenerateSessionId(options = {}) {
  if (options.setCurrentAsParent) {
    STATE.parentSessionId = STATE.sessionId;
  }
  STATE.planSlugCache.delete(STATE.sessionId);
  STATE.sessionId = randomUUID();
  STATE.sessionProjectDir = null;
  return STATE.sessionId;
}
function getParentSessionId() {
  return STATE.parentSessionId;
}
function switchSession(sessionId, projectDir = null) {
  STATE.planSlugCache.delete(STATE.sessionId);
  STATE.sessionId = sessionId;
  STATE.sessionProjectDir = projectDir;
  sessionSwitched.emit(sessionId);
}
function getSessionProjectDir() {
  return STATE.sessionProjectDir;
}
function getOriginalCwd() {
  return STATE.originalCwd;
}
function getProjectRoot() {
  return STATE.projectRoot;
}
function setOriginalCwd(cwd2) {
  STATE.originalCwd = cwd2.normalize("NFC");
}
function setProjectRoot(cwd2) {
  STATE.projectRoot = cwd2.normalize("NFC");
}
function getCwdState() {
  return STATE.cwd;
}
function setCwdState(cwd2) {
  STATE.cwd = cwd2.normalize("NFC");
}
function getDirectConnectServerUrl() {
  return STATE.directConnectServerUrl;
}
function setDirectConnectServerUrl(url) {
  STATE.directConnectServerUrl = url;
}
function addToTotalDurationState(duration, durationWithoutRetries) {
  STATE.totalAPIDuration += duration;
  STATE.totalAPIDurationWithoutRetries += durationWithoutRetries;
}
function resetTotalDurationStateAndCost_FOR_TESTS_ONLY() {
  STATE.totalAPIDuration = 0;
  STATE.totalAPIDurationWithoutRetries = 0;
  STATE.totalCostUSD = 0;
}
function addToTotalCostState(cost, modelUsage, model) {
  STATE.modelUsage[model] = modelUsage;
  STATE.totalCostUSD += cost;
}
function getTotalCostUSD() {
  return STATE.totalCostUSD;
}
function getTotalAPIDuration() {
  return STATE.totalAPIDuration;
}
function getTotalDuration() {
  return Date.now() - STATE.startTime;
}
function getTotalAPIDurationWithoutRetries() {
  return STATE.totalAPIDurationWithoutRetries;
}
function getTotalToolDuration() {
  return STATE.totalToolDuration;
}
function addToToolDuration(duration) {
  STATE.totalToolDuration += duration;
  STATE.turnToolDurationMs += duration;
  STATE.turnToolCount++;
}
function getTurnHookDurationMs() {
  return STATE.turnHookDurationMs;
}
function addToTurnHookDuration(duration) {
  STATE.turnHookDurationMs += duration;
  STATE.turnHookCount++;
}
function resetTurnHookDuration() {
  STATE.turnHookDurationMs = 0;
  STATE.turnHookCount = 0;
}
function getTurnHookCount() {
  return STATE.turnHookCount;
}
function getTurnToolDurationMs() {
  return STATE.turnToolDurationMs;
}
function resetTurnToolDuration() {
  STATE.turnToolDurationMs = 0;
  STATE.turnToolCount = 0;
}
function getTurnToolCount() {
  return STATE.turnToolCount;
}
function getTurnClassifierDurationMs() {
  return STATE.turnClassifierDurationMs;
}
function addToTurnClassifierDuration(duration) {
  STATE.turnClassifierDurationMs += duration;
  STATE.turnClassifierCount++;
}
function resetTurnClassifierDuration() {
  STATE.turnClassifierDurationMs = 0;
  STATE.turnClassifierCount = 0;
}
function getTurnClassifierCount() {
  return STATE.turnClassifierCount;
}
function getStatsStore() {
  return STATE.statsStore;
}
function setStatsStore(store) {
  STATE.statsStore = store;
}
function updateLastInteractionTime(immediate) {
  if (immediate) {
    flushInteractionTime_inner();
  } else {
    interactionTimeDirty = true;
  }
}
function flushInteractionTime() {
  if (interactionTimeDirty) {
    flushInteractionTime_inner();
  }
}
function flushInteractionTime_inner() {
  STATE.lastInteractionTime = Date.now();
  interactionTimeDirty = false;
}
function addToTotalLinesChanged(added, removed) {
  STATE.totalLinesAdded += added;
  STATE.totalLinesRemoved += removed;
}
function getTotalLinesAdded() {
  return STATE.totalLinesAdded;
}
function getTotalLinesRemoved() {
  return STATE.totalLinesRemoved;
}
function getTotalInputTokens() {
  return sumBy_default(Object.values(STATE.modelUsage), "inputTokens");
}
function getTotalOutputTokens() {
  return sumBy_default(Object.values(STATE.modelUsage), "outputTokens");
}
function getTotalCacheReadInputTokens() {
  return sumBy_default(Object.values(STATE.modelUsage), "cacheReadInputTokens");
}
function getTotalCacheCreationInputTokens() {
  return sumBy_default(Object.values(STATE.modelUsage), "cacheCreationInputTokens");
}
function getTotalWebSearchRequests() {
  return sumBy_default(Object.values(STATE.modelUsage), "webSearchRequests");
}
function getTurnOutputTokens() {
  return getTotalOutputTokens() - outputTokensAtTurnStart;
}
function getCurrentTurnTokenBudget() {
  return currentTurnTokenBudget;
}
function snapshotOutputTokensForTurn(budget) {
  outputTokensAtTurnStart = getTotalOutputTokens();
  currentTurnTokenBudget = budget;
  budgetContinuationCount = 0;
}
function getBudgetContinuationCount() {
  return budgetContinuationCount;
}
function incrementBudgetContinuationCount() {
  budgetContinuationCount++;
}
function setHasUnknownModelCost() {
  STATE.hasUnknownModelCost = true;
}
function hasUnknownModelCost() {
  return STATE.hasUnknownModelCost;
}
function getLastMainRequestId() {
  return STATE.lastMainRequestId;
}
function setLastMainRequestId(requestId) {
  STATE.lastMainRequestId = requestId;
}
function getLastApiCompletionTimestamp() {
  return STATE.lastApiCompletionTimestamp;
}
function setLastApiCompletionTimestamp(timestamp) {
  STATE.lastApiCompletionTimestamp = timestamp;
}
function markPostCompaction() {
  STATE.pendingPostCompaction = true;
}
function consumePostCompaction() {
  const was = STATE.pendingPostCompaction;
  STATE.pendingPostCompaction = false;
  return was;
}
function getLastInteractionTime() {
  return STATE.lastInteractionTime;
}
function markScrollActivity() {
  scrollDraining = true;
  if (scrollDrainTimer)
    clearTimeout(scrollDrainTimer);
  scrollDrainTimer = setTimeout(() => {
    scrollDraining = false;
    scrollDrainTimer = undefined;
  }, SCROLL_DRAIN_IDLE_MS);
  scrollDrainTimer.unref?.();
}
function getIsScrollDraining() {
  return scrollDraining;
}
async function waitForScrollIdle() {
  while (scrollDraining) {
    await new Promise((r) => setTimeout(r, SCROLL_DRAIN_IDLE_MS).unref?.());
  }
}
function getModelUsage() {
  return STATE.modelUsage;
}
function getUsageForModel(model) {
  return STATE.modelUsage[model];
}
function getMainLoopModelOverride() {
  return STATE.mainLoopModelOverride;
}
function getInitialMainLoopModel() {
  return STATE.initialMainLoopModel;
}
function setMainLoopModelOverride(model) {
  STATE.mainLoopModelOverride = model;
}
function setInitialMainLoopModel(model) {
  STATE.initialMainLoopModel = model;
}
function getSdkBetas() {
  return STATE.sdkBetas;
}
function setSdkBetas(betas) {
  STATE.sdkBetas = betas;
}
function resetCostState() {
  STATE.totalCostUSD = 0;
  STATE.totalAPIDuration = 0;
  STATE.totalAPIDurationWithoutRetries = 0;
  STATE.totalToolDuration = 0;
  STATE.startTime = Date.now();
  STATE.totalLinesAdded = 0;
  STATE.totalLinesRemoved = 0;
  STATE.hasUnknownModelCost = false;
  STATE.modelUsage = {};
  STATE.promptId = null;
}
function setCostStateForRestore({
  totalCostUSD,
  totalAPIDuration,
  totalAPIDurationWithoutRetries,
  totalToolDuration,
  totalLinesAdded,
  totalLinesRemoved,
  lastDuration,
  modelUsage
}) {
  STATE.totalCostUSD = totalCostUSD;
  STATE.totalAPIDuration = totalAPIDuration;
  STATE.totalAPIDurationWithoutRetries = totalAPIDurationWithoutRetries;
  STATE.totalToolDuration = totalToolDuration;
  STATE.totalLinesAdded = totalLinesAdded;
  STATE.totalLinesRemoved = totalLinesRemoved;
  if (modelUsage) {
    STATE.modelUsage = modelUsage;
  }
  if (lastDuration) {
    STATE.startTime = Date.now() - lastDuration;
  }
}
function resetStateForTests() {
  if (true) {
    throw new Error("resetStateForTests can only be called in tests");
  }
  Object.entries(getInitialState()).forEach(([key, value]) => {
    STATE[key] = value;
  });
  outputTokensAtTurnStart = 0;
  currentTurnTokenBudget = null;
  budgetContinuationCount = 0;
  sessionSwitched.clear();
}
function getModelStrings() {
  return STATE.modelStrings;
}
function setModelStrings(modelStrings) {
  STATE.modelStrings = modelStrings;
}
function resetModelStringsForTestingOnly() {
  STATE.modelStrings = null;
}
function setMeter(meter, createCounter) {
  STATE.meter = meter;
  STATE.sessionCounter = createCounter("ur.session.count", {
    description: "Count of CLI sessions started"
  });
  STATE.locCounter = createCounter("ur.lines_of_code.count", {
    description: "Count of lines of code modified, with the 'type' attribute indicating whether lines were added or removed"
  });
  STATE.prCounter = createCounter("ur.pull_request.count", {
    description: "Number of pull requests created"
  });
  STATE.commitCounter = createCounter("ur.commit.count", {
    description: "Number of git commits created"
  });
  STATE.costCounter = createCounter("ur.cost.usage", {
    description: "Cost of the UR session",
    unit: "USD"
  });
  STATE.tokenCounter = createCounter("ur.token.usage", {
    description: "Number of tokens used",
    unit: "tokens"
  });
  STATE.codeEditToolDecisionCounter = createCounter("ur.code_edit_tool.decision", {
    description: "Count of code editing tool permission decisions (accept/reject) for Edit, Write, and NotebookEdit tools"
  });
  STATE.activeTimeCounter = createCounter("ur.active_time.total", {
    description: "Total active time in seconds",
    unit: "s"
  });
}
function getMeter() {
  return STATE.meter;
}
function getSessionCounter() {
  return STATE.sessionCounter;
}
function getLocCounter() {
  return STATE.locCounter;
}
function getPrCounter() {
  return STATE.prCounter;
}
function getCommitCounter() {
  return STATE.commitCounter;
}
function getCostCounter() {
  return STATE.costCounter;
}
function getTokenCounter() {
  return STATE.tokenCounter;
}
function getCodeEditToolDecisionCounter() {
  return STATE.codeEditToolDecisionCounter;
}
function getActiveTimeCounter() {
  return STATE.activeTimeCounter;
}
function getLoggerProvider() {
  return STATE.loggerProvider;
}
function setLoggerProvider(provider) {
  STATE.loggerProvider = provider;
}
function getEventLogger() {
  return STATE.eventLogger;
}
function setEventLogger(logger) {
  STATE.eventLogger = logger;
}
function getMeterProvider() {
  return STATE.meterProvider;
}
function setMeterProvider(provider) {
  STATE.meterProvider = provider;
}
function getTracerProvider() {
  return STATE.tracerProvider;
}
function setTracerProvider(provider) {
  STATE.tracerProvider = provider;
}
function getIsNonInteractiveSession() {
  return !STATE.isInteractive;
}
function getIsInteractive() {
  return STATE.isInteractive;
}
function setIsInteractive(value) {
  STATE.isInteractive = value;
}
function getClientType() {
  return STATE.clientType;
}
function setClientType(type) {
  STATE.clientType = type;
}
function getSdkAgentProgressSummariesEnabled() {
  return STATE.sdkAgentProgressSummariesEnabled;
}
function setSdkAgentProgressSummariesEnabled(value) {
  STATE.sdkAgentProgressSummariesEnabled = value;
}
function getKairosActive() {
  return STATE.kairosActive;
}
function setKairosActive(value) {
  STATE.kairosActive = value;
}
function getStrictToolResultPairing() {
  return STATE.strictToolResultPairing;
}
function setStrictToolResultPairing(value) {
  STATE.strictToolResultPairing = value;
}
function getUserMsgOptIn() {
  return STATE.userMsgOptIn;
}
function setUserMsgOptIn(value) {
  STATE.userMsgOptIn = value;
}
function getSessionSource() {
  return STATE.sessionSource;
}
function setSessionSource(source) {
  STATE.sessionSource = source;
}
function getQuestionPreviewFormat() {
  return STATE.questionPreviewFormat;
}
function setQuestionPreviewFormat(format) {
  STATE.questionPreviewFormat = format;
}
function getAgentColorMap() {
  return STATE.agentColorMap;
}
function getFlagSettingsPath() {
  return STATE.flagSettingsPath;
}
function setFlagSettingsPath(path) {
  STATE.flagSettingsPath = path;
}
function getFlagSettingsInline() {
  return STATE.flagSettingsInline;
}
function setFlagSettingsInline(settings) {
  STATE.flagSettingsInline = settings;
}
function getSessionIngressToken() {
  return STATE.sessionIngressToken;
}
function setSessionIngressToken(token) {
  STATE.sessionIngressToken = token;
}
function getOauthTokenFromFd() {
  return STATE.oauthTokenFromFd;
}
function setOauthTokenFromFd(token) {
  STATE.oauthTokenFromFd = token;
}
function getApiKeyFromFd() {
  return STATE.apiKeyFromFd;
}
function setApiKeyFromFd(key) {
  STATE.apiKeyFromFd = key;
}
function setLastAPIRequest(params) {
  STATE.lastAPIRequest = params;
}
function getLastAPIRequest() {
  return STATE.lastAPIRequest;
}
function setLastAPIRequestMessages(messages) {
  STATE.lastAPIRequestMessages = messages;
}
function getLastAPIRequestMessages() {
  return STATE.lastAPIRequestMessages;
}
function setLastClassifierRequests(requests) {
  STATE.lastClassifierRequests = requests;
}
function getLastClassifierRequests() {
  return STATE.lastClassifierRequests;
}
function setCachedAgentMdContent(content) {
  STATE.cachedAgentMdContent = content;
}
function getCachedAgentMdContent() {
  return STATE.cachedAgentMdContent;
}
function addToInMemoryErrorLog(errorInfo) {
  const MAX_IN_MEMORY_ERRORS = 100;
  if (STATE.inMemoryErrorLog.length >= MAX_IN_MEMORY_ERRORS) {
    STATE.inMemoryErrorLog.shift();
  }
  STATE.inMemoryErrorLog.push(errorInfo);
}
function getAllowedSettingSources() {
  return STATE.allowedSettingSources;
}
function setAllowedSettingSources(sources) {
  STATE.allowedSettingSources = sources;
}
function preferThirdPartyAuthentication() {
  return getIsNonInteractiveSession() && STATE.clientType !== "ur-vscode";
}
function setInlinePlugins(plugins) {
  STATE.inlinePlugins = plugins;
}
function getInlinePlugins() {
  return STATE.inlinePlugins;
}
function setChromeFlagOverride(value) {
  STATE.chromeFlagOverride = value;
}
function getChromeFlagOverride() {
  return STATE.chromeFlagOverride;
}
function setUseCoworkPlugins(value) {
  STATE.useCoworkPlugins = value;
  resetSettingsCache();
}
function getUseCoworkPlugins() {
  return STATE.useCoworkPlugins;
}
function setSessionBypassPermissionsMode(enabled) {
  STATE.sessionBypassPermissionsMode = enabled;
}
function getSessionBypassPermissionsMode() {
  return STATE.sessionBypassPermissionsMode;
}
function setScheduledTasksEnabled(enabled) {
  STATE.scheduledTasksEnabled = enabled;
}
function getScheduledTasksEnabled() {
  return STATE.scheduledTasksEnabled;
}
function getSessionCronTasks() {
  return STATE.sessionCronTasks;
}
function addSessionCronTask(task) {
  STATE.sessionCronTasks.push(task);
}
function removeSessionCronTasks(ids) {
  if (ids.length === 0)
    return 0;
  const idSet = new Set(ids);
  const remaining = STATE.sessionCronTasks.filter((t) => !idSet.has(t.id));
  const removed = STATE.sessionCronTasks.length - remaining.length;
  if (removed === 0)
    return 0;
  STATE.sessionCronTasks = remaining;
  return removed;
}
function setSessionTrustAccepted(accepted) {
  STATE.sessionTrustAccepted = accepted;
}
function getSessionTrustAccepted() {
  return STATE.sessionTrustAccepted;
}
function setSessionPersistenceDisabled(disabled) {
  STATE.sessionPersistenceDisabled = disabled;
}
function isSessionPersistenceDisabled() {
  return STATE.sessionPersistenceDisabled;
}
function hasExitedPlanModeInSession() {
  return STATE.hasExitedPlanMode;
}
function setHasExitedPlanMode(value) {
  STATE.hasExitedPlanMode = value;
}
function needsPlanModeExitAttachment() {
  return STATE.needsPlanModeExitAttachment;
}
function setNeedsPlanModeExitAttachment(value) {
  STATE.needsPlanModeExitAttachment = value;
}
function handlePlanModeTransition(fromMode, toMode) {
  if (toMode === "plan" && fromMode !== "plan") {
    STATE.needsPlanModeExitAttachment = false;
  }
  if (fromMode === "plan" && toMode !== "plan") {
    STATE.needsPlanModeExitAttachment = true;
  }
}
function needsAutoModeExitAttachment() {
  return STATE.needsAutoModeExitAttachment;
}
function setNeedsAutoModeExitAttachment(value) {
  STATE.needsAutoModeExitAttachment = value;
}
function handleAutoModeTransition(fromMode, toMode) {
  if (fromMode === "auto" && toMode === "plan" || fromMode === "plan" && toMode === "auto") {
    return;
  }
  const fromIsAuto = fromMode === "auto";
  const toIsAuto = toMode === "auto";
  if (toIsAuto && !fromIsAuto) {
    STATE.needsAutoModeExitAttachment = false;
  }
  if (fromIsAuto && !toIsAuto) {
    STATE.needsAutoModeExitAttachment = true;
  }
}
function hasShownLspRecommendationThisSession() {
  return STATE.lspRecommendationShownThisSession;
}
function setLspRecommendationShownThisSession(value) {
  STATE.lspRecommendationShownThisSession = value;
}
function setInitJsonSchema(schema) {
  STATE.initJsonSchema = schema;
}
function getInitJsonSchema() {
  return STATE.initJsonSchema;
}
function registerHookCallbacks(hooks) {
  if (!STATE.registeredHooks) {
    STATE.registeredHooks = {};
  }
  for (const [event, matchers] of Object.entries(hooks)) {
    const eventKey = event;
    if (!STATE.registeredHooks[eventKey]) {
      STATE.registeredHooks[eventKey] = [];
    }
    STATE.registeredHooks[eventKey].push(...matchers);
  }
}
function getRegisteredHooks() {
  return STATE.registeredHooks;
}
function clearRegisteredHooks() {
  STATE.registeredHooks = null;
}
function clearRegisteredPluginHooks() {
  if (!STATE.registeredHooks) {
    return;
  }
  const filtered = {};
  for (const [event, matchers] of Object.entries(STATE.registeredHooks)) {
    const callbackHooks = matchers.filter((m) => !("pluginRoot" in m));
    if (callbackHooks.length > 0) {
      filtered[event] = callbackHooks;
    }
  }
  STATE.registeredHooks = Object.keys(filtered).length > 0 ? filtered : null;
}
function resetSdkInitState() {
  STATE.initJsonSchema = null;
  STATE.registeredHooks = null;
}
function getPlanSlugCache() {
  return STATE.planSlugCache;
}
function getSessionCreatedTeams() {
  return STATE.sessionCreatedTeams;
}
function setTeleportedSessionInfo(info) {
  STATE.teleportedSessionInfo = {
    isTeleported: true,
    hasLoggedFirstMessage: false,
    sessionId: info.sessionId
  };
}
function getTeleportedSessionInfo() {
  return STATE.teleportedSessionInfo;
}
function markFirstTeleportMessageLogged() {
  if (STATE.teleportedSessionInfo) {
    STATE.teleportedSessionInfo.hasLoggedFirstMessage = true;
  }
}
function addInvokedSkill(skillName, skillPath, content, agentId = null) {
  const key = `${agentId ?? ""}:${skillName}`;
  STATE.invokedSkills.set(key, {
    skillName,
    skillPath,
    content,
    invokedAt: Date.now(),
    agentId
  });
}
function getInvokedSkills() {
  return STATE.invokedSkills;
}
function getInvokedSkillsForAgent(agentId) {
  const normalizedId = agentId ?? null;
  const filtered = new Map;
  for (const [key, skill] of STATE.invokedSkills) {
    if (skill.agentId === normalizedId) {
      filtered.set(key, skill);
    }
  }
  return filtered;
}
function clearInvokedSkills(preservedAgentIds) {
  if (!preservedAgentIds || preservedAgentIds.size === 0) {
    STATE.invokedSkills.clear();
    return;
  }
  for (const [key, skill] of STATE.invokedSkills) {
    if (skill.agentId === null || !preservedAgentIds.has(skill.agentId)) {
      STATE.invokedSkills.delete(key);
    }
  }
}
function clearInvokedSkillsForAgent(agentId) {
  for (const [key, skill] of STATE.invokedSkills) {
    if (skill.agentId === agentId) {
      STATE.invokedSkills.delete(key);
    }
  }
}
function isReplBridgeActive() {
  return Boolean(STATE.replBridgeActive);
}
function addSlowOperation(operation, durationMs) {
  if (process.env.USER_TYPE !== "ant")
    return;
  if (operation.includes("exec") && operation.includes("ur-prompt-")) {
    return;
  }
  const now = Date.now();
  STATE.slowOperations = STATE.slowOperations.filter((op) => now - op.timestamp < SLOW_OPERATION_TTL_MS);
  STATE.slowOperations.push({ operation, durationMs, timestamp: now });
  if (STATE.slowOperations.length > MAX_SLOW_OPERATIONS) {
    STATE.slowOperations = STATE.slowOperations.slice(-MAX_SLOW_OPERATIONS);
  }
}
function getSlowOperations() {
  if (STATE.slowOperations.length === 0) {
    return EMPTY_SLOW_OPERATIONS;
  }
  const now = Date.now();
  if (STATE.slowOperations.some((op) => now - op.timestamp >= SLOW_OPERATION_TTL_MS)) {
    STATE.slowOperations = STATE.slowOperations.filter((op) => now - op.timestamp < SLOW_OPERATION_TTL_MS);
    if (STATE.slowOperations.length === 0) {
      return EMPTY_SLOW_OPERATIONS;
    }
  }
  return STATE.slowOperations;
}
function getMainThreadAgentType() {
  return STATE.mainThreadAgentType;
}
function setMainThreadAgentType(agentType) {
  STATE.mainThreadAgentType = agentType;
}
function getIsRemoteMode() {
  return STATE.isRemoteMode;
}
function setIsRemoteMode(value) {
  STATE.isRemoteMode = value;
}
function getOfflineMode() {
  return STATE.offlineMode;
}
function setOfflineMode(value) {
  STATE.offlineMode = value;
}
function getSystemPromptSectionCache() {
  return STATE.systemPromptSectionCache;
}
function setSystemPromptSectionCacheEntry(name, value) {
  STATE.systemPromptSectionCache.set(name, value);
}
function clearSystemPromptSectionState() {
  STATE.systemPromptSectionCache.clear();
}
function getLastEmittedDate() {
  return STATE.lastEmittedDate;
}
function setLastEmittedDate(date) {
  STATE.lastEmittedDate = date;
}
function getAdditionalDirectoriesForAgentMd() {
  return STATE.additionalDirectoriesForAgentMd;
}
function setAdditionalDirectoriesForAgentMd(directories) {
  STATE.additionalDirectoriesForAgentMd = directories;
}
function getAllowedChannels() {
  return STATE.allowedChannels;
}
function setAllowedChannels(entries) {
  STATE.allowedChannels = entries;
}
function getHasDevChannels() {
  return STATE.hasDevChannels;
}
function setHasDevChannels(value) {
  STATE.hasDevChannels = value;
}
function getPromptCache1hAllowlist() {
  return STATE.promptCache1hAllowlist;
}
function setPromptCache1hAllowlist(allowlist) {
  STATE.promptCache1hAllowlist = allowlist;
}
function getPromptCache1hEligible() {
  return STATE.promptCache1hEligible;
}
function setPromptCache1hEligible(eligible) {
  STATE.promptCache1hEligible = eligible;
}
function getAfkModeHeaderLatched() {
  return STATE.afkModeHeaderLatched;
}
function setAfkModeHeaderLatched(v) {
  STATE.afkModeHeaderLatched = v;
}
function getFastModeHeaderLatched() {
  return STATE.fastModeHeaderLatched;
}
function setFastModeHeaderLatched(v) {
  STATE.fastModeHeaderLatched = v;
}
function getCacheEditingHeaderLatched() {
  return STATE.cacheEditingHeaderLatched;
}
function setCacheEditingHeaderLatched(v) {
  STATE.cacheEditingHeaderLatched = v;
}
function getThinkingClearLatched() {
  return STATE.thinkingClearLatched;
}
function setThinkingClearLatched(v) {
  STATE.thinkingClearLatched = v;
}
function clearBetaHeaderLatches() {
  STATE.afkModeHeaderLatched = null;
  STATE.fastModeHeaderLatched = null;
  STATE.cacheEditingHeaderLatched = null;
  STATE.thinkingClearLatched = null;
}
function getPromptId() {
  return STATE.promptId;
}
function setPromptId(id) {
  STATE.promptId = id;
}
var STATE, sessionSwitched, onSessionSwitch, interactionTimeDirty = false, outputTokensAtTurnStart = 0, currentTurnTokenBudget = null, budgetContinuationCount = 0, scrollDraining = false, scrollDrainTimer, SCROLL_DRAIN_IDLE_MS = 150, MAX_SLOW_OPERATIONS = 10, SLOW_OPERATION_TTL_MS = 1e4, EMPTY_SLOW_OPERATIONS;
var init_state = __esm(() => {
  init_sumBy();
  init_crypto();
  init_settingsCache();
  init_signal();
  STATE = getInitialState();
  sessionSwitched = createSignal();
  onSessionSwitch = sessionSwitched.subscribe;
  EMPTY_SLOW_OPERATIONS = [];
});

export { eq_default, init_eq, _root_default, init__root, _baseGetTag_default, init__baseGetTag, isObject_default, init_isObject, isFunction_default, init_isFunction, _getNative_default, init__getNative, _Stack_default, init__Stack, _SetCache_default, init__SetCache, _cacheHas_default, init__cacheHas, _Uint8Array_default, init__Uint8Array, _setToArray_default, init__setToArray, _arrayPush_default, init__arrayPush, isArray_default, init_isArray, _baseGetAllKeys_default, init__baseGetAllKeys, stubArray_default, init_stubArray, _getSymbols_default, init__getSymbols, isObjectLike_default, init_isObjectLike, isArguments_default, init_isArguments, isBuffer_default, init_isBuffer, _isIndex_default, init__isIndex, isTypedArray_default, init_isTypedArray, _arrayLikeKeys_default, init__arrayLikeKeys, _isPrototype_default, init__isPrototype, _overArg_default, init__overArg, isArrayLike_default, init_isArrayLike, keys_default, init_keys, _Set_default, init__Set, _baseIsEqual_default, init__baseIsEqual, isSymbol_default, init_isSymbol, memoize_default, init_memoize, _arrayMap_default, init__arrayMap, toString_default, init_toString, _castPath_default, init__castPath, _toKey_default, init__toKey, _baseGet_default, init__baseGet, identity_default, init_identity, _baseIteratee_default, init__baseIteratee, getSessionSettingsCache, setSessionSettingsCache, getCachedSettingsForSource, setCachedSettingsForSource, getCachedParsedFile, setCachedParsedFile, resetSettingsCache, getPluginSettingsBase, setPluginSettingsBase, clearPluginSettingsBase, init_settingsCache, createSignal, init_signal, getSessionId, regenerateSessionId, getParentSessionId, switchSession, onSessionSwitch, getSessionProjectDir, getOriginalCwd, getProjectRoot, setOriginalCwd, setProjectRoot, getCwdState, setCwdState, getDirectConnectServerUrl, setDirectConnectServerUrl, addToTotalDurationState, resetTotalDurationStateAndCost_FOR_TESTS_ONLY, addToTotalCostState, getTotalCostUSD, getTotalAPIDuration, getTotalDuration, getTotalAPIDurationWithoutRetries, getTotalToolDuration, addToToolDuration, getTurnHookDurationMs, addToTurnHookDuration, resetTurnHookDuration, getTurnHookCount, getTurnToolDurationMs, resetTurnToolDuration, getTurnToolCount, getTurnClassifierDurationMs, addToTurnClassifierDuration, resetTurnClassifierDuration, getTurnClassifierCount, getStatsStore, setStatsStore, updateLastInteractionTime, flushInteractionTime, addToTotalLinesChanged, getTotalLinesAdded, getTotalLinesRemoved, getTotalInputTokens, getTotalOutputTokens, getTotalCacheReadInputTokens, getTotalCacheCreationInputTokens, getTotalWebSearchRequests, getTurnOutputTokens, getCurrentTurnTokenBudget, snapshotOutputTokensForTurn, getBudgetContinuationCount, incrementBudgetContinuationCount, setHasUnknownModelCost, hasUnknownModelCost, getLastMainRequestId, setLastMainRequestId, getLastApiCompletionTimestamp, setLastApiCompletionTimestamp, markPostCompaction, consumePostCompaction, getLastInteractionTime, markScrollActivity, getIsScrollDraining, waitForScrollIdle, getModelUsage, getUsageForModel, getMainLoopModelOverride, getInitialMainLoopModel, setMainLoopModelOverride, setInitialMainLoopModel, getSdkBetas, setSdkBetas, resetCostState, setCostStateForRestore, resetStateForTests, getModelStrings, setModelStrings, resetModelStringsForTestingOnly, setMeter, getMeter, getSessionCounter, getLocCounter, getPrCounter, getCommitCounter, getCostCounter, getTokenCounter, getCodeEditToolDecisionCounter, getActiveTimeCounter, getLoggerProvider, setLoggerProvider, getEventLogger, setEventLogger, getMeterProvider, setMeterProvider, getTracerProvider, setTracerProvider, getIsNonInteractiveSession, getIsInteractive, setIsInteractive, getClientType, setClientType, getSdkAgentProgressSummariesEnabled, setSdkAgentProgressSummariesEnabled, getKairosActive, setKairosActive, getStrictToolResultPairing, setStrictToolResultPairing, getUserMsgOptIn, setUserMsgOptIn, getSessionSource, setSessionSource, getQuestionPreviewFormat, setQuestionPreviewFormat, getAgentColorMap, getFlagSettingsPath, setFlagSettingsPath, getFlagSettingsInline, setFlagSettingsInline, getSessionIngressToken, setSessionIngressToken, getOauthTokenFromFd, setOauthTokenFromFd, getApiKeyFromFd, setApiKeyFromFd, setLastAPIRequest, getLastAPIRequest, setLastAPIRequestMessages, getLastAPIRequestMessages, setLastClassifierRequests, getLastClassifierRequests, setCachedAgentMdContent, getCachedAgentMdContent, addToInMemoryErrorLog, getAllowedSettingSources, setAllowedSettingSources, preferThirdPartyAuthentication, setInlinePlugins, getInlinePlugins, setChromeFlagOverride, getChromeFlagOverride, setUseCoworkPlugins, getUseCoworkPlugins, setSessionBypassPermissionsMode, getSessionBypassPermissionsMode, setScheduledTasksEnabled, getScheduledTasksEnabled, getSessionCronTasks, addSessionCronTask, removeSessionCronTasks, setSessionTrustAccepted, getSessionTrustAccepted, setSessionPersistenceDisabled, isSessionPersistenceDisabled, hasExitedPlanModeInSession, setHasExitedPlanMode, needsPlanModeExitAttachment, setNeedsPlanModeExitAttachment, handlePlanModeTransition, needsAutoModeExitAttachment, setNeedsAutoModeExitAttachment, handleAutoModeTransition, hasShownLspRecommendationThisSession, setLspRecommendationShownThisSession, setInitJsonSchema, getInitJsonSchema, registerHookCallbacks, getRegisteredHooks, clearRegisteredHooks, clearRegisteredPluginHooks, resetSdkInitState, getPlanSlugCache, getSessionCreatedTeams, setTeleportedSessionInfo, getTeleportedSessionInfo, markFirstTeleportMessageLogged, addInvokedSkill, getInvokedSkills, getInvokedSkillsForAgent, clearInvokedSkills, clearInvokedSkillsForAgent, isReplBridgeActive, addSlowOperation, getSlowOperations, getMainThreadAgentType, setMainThreadAgentType, getIsRemoteMode, setIsRemoteMode, getOfflineMode, setOfflineMode, getSystemPromptSectionCache, setSystemPromptSectionCacheEntry, clearSystemPromptSectionState, getLastEmittedDate, setLastEmittedDate, getAdditionalDirectoriesForAgentMd, setAdditionalDirectoriesForAgentMd, getAllowedChannels, setAllowedChannels, getHasDevChannels, setHasDevChannels, getPromptCache1hAllowlist, setPromptCache1hAllowlist, getPromptCache1hEligible, setPromptCache1hEligible, getAfkModeHeaderLatched, setAfkModeHeaderLatched, getFastModeHeaderLatched, setFastModeHeaderLatched, getCacheEditingHeaderLatched, setCacheEditingHeaderLatched, getThinkingClearLatched, setThinkingClearLatched, clearBetaHeaderLatches, getPromptId, setPromptId, init_state };
