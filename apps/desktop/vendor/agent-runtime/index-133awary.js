import {
  init_ollamaRouter,
  isOllamaAutoRouteEnabled,
  pickBestCoderModel,
  pickSmallFastModel
} from "./index-pnhq4694.js";
import {
  count,
  exports_external,
  getAgentId,
  getParentSessionId as getParentSessionId2,
  getTeamName,
  init_array,
  init_lazySchema,
  init_lockfile,
  init_teammate,
  init_v4,
  isTeammate,
  lazySchema,
  lock,
  lockSync,
  toJSONSchema,
  uniq,
  v4_default
} from "./index-4mfpjpj0.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
import {
  init_json,
  init_jsonRead,
  safeParseJSON,
  stripBOM
} from "./index-s5dp14ed.js";
import {
  dirIsInGitRepo,
  findCanonicalGitRoot,
  getRepoRemoteHash,
  init_diagLogs,
  init_git,
  logForDiagnosticsNoPII
} from "./index-6dy59xbm.js";
import {
  execFileNoThrow,
  execFileNoThrowWithCwd,
  execSyncWithDefaults_DEPRECATED,
  init_execFileNoThrow,
  init_execFileNoThrowPortable
} from "./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import {
  init_memoize as init_memoize2,
  memoizeWithLRU,
  memoizeWithTTLAsync
} from "./index-h7h0j06f.js";
import {
  djb2Hash,
  getEssentialTrafficOnlyReason,
  init_hash,
  init_log,
  init_privacyLevel,
  isEssentialTrafficOnly,
  logError
} from "./index-f80dj2bz.js";
import {
  axios_default,
  init_axios
} from "./index-q00jv0fc.js";
import {
  execSync_DEPRECATED,
  init_execSyncWrapper,
  init_which,
  which,
  whichSync
} from "./index-ycnb0yeb.js";
import {
  execa,
  execaSync,
  init_execa
} from "./index-vpczjthp.js";
import {
  ConfigParseError,
  clone,
  errorMessage,
  getErrnoCode,
  getFsImplementation,
  getURConfigHomeDir,
  init_cleanupRegistry,
  init_debug,
  init_envUtils,
  init_errors,
  init_fsOperations,
  init_slowOperations,
  isBareMode,
  isENOENT,
  isEnvDefinedFalsy,
  isEnvTruthy,
  isFsInaccessible,
  jsonParse,
  jsonStringify,
  logAntError,
  logForDebugging,
  registerCleanup,
  safeResolvePath,
  toError,
  writeFileSync_DEPRECATED
} from "./index-t784n9jz.js";
import {
  _Stack_default,
  _Uint8Array_default,
  _arrayLikeKeys_default,
  _arrayMap_default,
  _arrayPush_default,
  _baseGetAllKeys_default,
  _baseGetTag_default,
  _baseGet_default,
  _baseIsEqual_default,
  _baseIteratee_default,
  _castPath_default,
  _getNative_default,
  _getSymbols_default,
  _isIndex_default,
  _isPrototype_default,
  _overArg_default,
  _root_default,
  _toKey_default,
  createSignal,
  eq_default,
  getAllowedSettingSources,
  getApiKeyFromFd,
  getCachedParsedFile,
  getCachedSettingsForSource,
  getClientType,
  getFlagSettingsInline,
  getFlagSettingsPath,
  getIsInteractive,
  getIsNonInteractiveSession,
  getKairosActive,
  getMainLoopModelOverride,
  getModelStrings,
  getOauthTokenFromFd,
  getOriginalCwd,
  getParentSessionId,
  getPluginSettingsBase,
  getProjectRoot,
  getSdkBetas,
  getSessionId,
  getSessionSettingsCache,
  getSessionTrustAccepted,
  getUseCoworkPlugins,
  identity_default,
  init__Stack,
  init__Uint8Array,
  init__arrayLikeKeys,
  init__arrayMap,
  init__arrayPush,
  init__baseGet,
  init__baseGetAllKeys,
  init__baseGetTag,
  init__baseIsEqual,
  init__baseIteratee,
  init__castPath,
  init__getNative,
  init__getSymbols,
  init__isIndex,
  init__isPrototype,
  init__overArg,
  init__root,
  init__toKey,
  init_eq,
  init_identity,
  init_isArguments,
  init_isArray,
  init_isArrayLike,
  init_isBuffer,
  init_isFunction,
  init_isObject,
  init_isObjectLike,
  init_isTypedArray,
  init_memoize,
  init_settingsCache,
  init_signal,
  init_state,
  init_stubArray,
  isArguments_default,
  isArrayLike_default,
  isArray_default,
  isBuffer_default,
  isFunction_default,
  isObjectLike_default,
  isObject_default,
  isTypedArray_default,
  memoize_default,
  preferThirdPartyAuthentication,
  resetSettingsCache,
  setApiKeyFromFd,
  setCachedParsedFile,
  setCachedSettingsForSource,
  setHasUnknownModelCost,
  setModelStrings,
  setOauthTokenFromFd,
  setSessionSettingsCache,
  stubArray_default
} from "./index-93rq225h.js";
import {
  __commonJS,
  __esm,
  __export,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_defineProperty.js
var defineProperty, _defineProperty_default;
var init__defineProperty = __esm(() => {
  init__getNative();
  defineProperty = function() {
    try {
      var func = _getNative_default(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {}
  }();
  _defineProperty_default = defineProperty;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseAssignValue.js
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && _defineProperty_default) {
    _defineProperty_default(object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue_default;
var init__baseAssignValue = __esm(() => {
  init__defineProperty();
  _baseAssignValue_default = baseAssignValue;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_assignMergeValue.js
function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq_default(object[key], value) || value === undefined && !(key in object)) {
    _baseAssignValue_default(object, key, value);
  }
}
var _assignMergeValue_default;
var init__assignMergeValue = __esm(() => {
  init__baseAssignValue();
  init_eq();
  _assignMergeValue_default = assignMergeValue;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_createBaseFor.js
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var _createBaseFor_default;
var init__createBaseFor = __esm(() => {
  _createBaseFor_default = createBaseFor;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseFor.js
var baseFor, _baseFor_default;
var init__baseFor = __esm(() => {
  init__createBaseFor();
  baseFor = _createBaseFor_default();
  _baseFor_default = baseFor;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_cloneBuffer.js
var exports__cloneBuffer = {};
__export(exports__cloneBuffer, {
  default: () => _cloneBuffer_default
});
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
var freeExports, freeModule, moduleExports, Buffer2, allocUnsafe, _cloneBuffer_default;
var init__cloneBuffer = __esm(() => {
  init__root();
  freeExports = typeof exports__cloneBuffer == "object" && exports__cloneBuffer && !exports__cloneBuffer.nodeType && exports__cloneBuffer;
  freeModule = freeExports && typeof module__cloneBuffer == "object" && module__cloneBuffer && !module__cloneBuffer.nodeType && module__cloneBuffer;
  moduleExports = freeModule && freeModule.exports === freeExports;
  Buffer2 = moduleExports ? _root_default.Buffer : undefined;
  allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : undefined;
  _cloneBuffer_default = cloneBuffer;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_cloneArrayBuffer.js
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array_default(result).set(new _Uint8Array_default(arrayBuffer));
  return result;
}
var _cloneArrayBuffer_default;
var init__cloneArrayBuffer = __esm(() => {
  init__Uint8Array();
  _cloneArrayBuffer_default = cloneArrayBuffer;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_cloneTypedArray.js
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var _cloneTypedArray_default;
var init__cloneTypedArray = __esm(() => {
  init__cloneArrayBuffer();
  _cloneTypedArray_default = cloneTypedArray;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_copyArray.js
function copyArray(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var _copyArray_default;
var init__copyArray = __esm(() => {
  _copyArray_default = copyArray;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseCreate.js
var objectCreate, baseCreate, _baseCreate_default;
var init__baseCreate = __esm(() => {
  init_isObject();
  objectCreate = Object.create;
  baseCreate = function() {
    function object() {}
    return function(proto) {
      if (!isObject_default(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }();
  _baseCreate_default = baseCreate;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getPrototype.js
var getPrototype, _getPrototype_default;
var init__getPrototype = __esm(() => {
  init__overArg();
  getPrototype = _overArg_default(Object.getPrototypeOf, Object);
  _getPrototype_default = getPrototype;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_initCloneObject.js
function initCloneObject(object) {
  return typeof object.constructor == "function" && !_isPrototype_default(object) ? _baseCreate_default(_getPrototype_default(object)) : {};
}
var _initCloneObject_default;
var init__initCloneObject = __esm(() => {
  init__baseCreate();
  init__getPrototype();
  init__isPrototype();
  _initCloneObject_default = initCloneObject;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isArrayLikeObject.js
function isArrayLikeObject(value) {
  return isObjectLike_default(value) && isArrayLike_default(value);
}
var isArrayLikeObject_default;
var init_isArrayLikeObject = __esm(() => {
  init_isArrayLike();
  init_isObjectLike();
  isArrayLikeObject_default = isArrayLikeObject;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isPlainObject.js
function isPlainObject(value) {
  if (!isObjectLike_default(value) || _baseGetTag_default(value) != objectTag) {
    return false;
  }
  var proto = _getPrototype_default(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var objectTag = "[object Object]", funcProto, objectProto, funcToString, hasOwnProperty, objectCtorString, isPlainObject_default;
var init_isPlainObject = __esm(() => {
  init__baseGetTag();
  init__getPrototype();
  init_isObjectLike();
  funcProto = Function.prototype;
  objectProto = Object.prototype;
  funcToString = funcProto.toString;
  hasOwnProperty = objectProto.hasOwnProperty;
  objectCtorString = funcToString.call(Object);
  isPlainObject_default = isPlainObject;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_safeGet.js
function safeGet(object, key) {
  if (key === "constructor" && typeof object[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object[key];
}
var _safeGet_default;
var init__safeGet = __esm(() => {
  _safeGet_default = safeGet;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_assignValue.js
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty2.call(object, key) && eq_default(objValue, value)) || value === undefined && !(key in object)) {
    _baseAssignValue_default(object, key, value);
  }
}
var objectProto2, hasOwnProperty2, _assignValue_default;
var init__assignValue = __esm(() => {
  init__baseAssignValue();
  init_eq();
  objectProto2 = Object.prototype;
  hasOwnProperty2 = objectProto2.hasOwnProperty;
  _assignValue_default = assignValue;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_copyObject.js
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue_default(object, key, newValue);
    } else {
      _assignValue_default(object, key, newValue);
    }
  }
  return object;
}
var _copyObject_default;
var init__copyObject = __esm(() => {
  init__assignValue();
  init__baseAssignValue();
  _copyObject_default = copyObject;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_nativeKeysIn.js
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var _nativeKeysIn_default;
var init__nativeKeysIn = __esm(() => {
  _nativeKeysIn_default = nativeKeysIn;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseKeysIn.js
function baseKeysIn(object) {
  if (!isObject_default(object)) {
    return _nativeKeysIn_default(object);
  }
  var isProto = _isPrototype_default(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty3.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var objectProto3, hasOwnProperty3, _baseKeysIn_default;
var init__baseKeysIn = __esm(() => {
  init_isObject();
  init__isPrototype();
  init__nativeKeysIn();
  objectProto3 = Object.prototype;
  hasOwnProperty3 = objectProto3.hasOwnProperty;
  _baseKeysIn_default = baseKeysIn;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/keysIn.js
function keysIn(object) {
  return isArrayLike_default(object) ? _arrayLikeKeys_default(object, true) : _baseKeysIn_default(object);
}
var keysIn_default;
var init_keysIn = __esm(() => {
  init__arrayLikeKeys();
  init__baseKeysIn();
  init_isArrayLike();
  keysIn_default = keysIn;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/toPlainObject.js
function toPlainObject(value) {
  return _copyObject_default(value, keysIn_default(value));
}
var toPlainObject_default;
var init_toPlainObject = __esm(() => {
  init__copyObject();
  init_keysIn();
  toPlainObject_default = toPlainObject;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseMergeDeep.js
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = _safeGet_default(object, key), srcValue = _safeGet_default(source, key), stacked = stack.get(srcValue);
  if (stacked) {
    _assignMergeValue_default(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined;
  var isCommon = newValue === undefined;
  if (isCommon) {
    var isArr = isArray_default(srcValue), isBuff = !isArr && isBuffer_default(srcValue), isTyped = !isArr && !isBuff && isTypedArray_default(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray_default(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject_default(objValue)) {
        newValue = _copyArray_default(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = _cloneBuffer_default(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = _cloneTypedArray_default(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject_default(srcValue) || isArguments_default(srcValue)) {
      newValue = objValue;
      if (isArguments_default(objValue)) {
        newValue = toPlainObject_default(objValue);
      } else if (!isObject_default(objValue) || isFunction_default(objValue)) {
        newValue = _initCloneObject_default(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack["delete"](srcValue);
  }
  _assignMergeValue_default(object, key, newValue);
}
var _baseMergeDeep_default;
var init__baseMergeDeep = __esm(() => {
  init__assignMergeValue();
  init__cloneBuffer();
  init__cloneTypedArray();
  init__copyArray();
  init__initCloneObject();
  init_isArguments();
  init_isArray();
  init_isArrayLikeObject();
  init_isBuffer();
  init_isFunction();
  init_isObject();
  init_isPlainObject();
  init_isTypedArray();
  init__safeGet();
  init_toPlainObject();
  _baseMergeDeep_default = baseMergeDeep;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseMerge.js
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  _baseFor_default(source, function(srcValue, key) {
    stack || (stack = new _Stack_default);
    if (isObject_default(srcValue)) {
      _baseMergeDeep_default(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(_safeGet_default(object, key), srcValue, key + "", object, source, stack) : undefined;
      if (newValue === undefined) {
        newValue = srcValue;
      }
      _assignMergeValue_default(object, key, newValue);
    }
  }, keysIn_default);
}
var _baseMerge_default;
var init__baseMerge = __esm(() => {
  init__Stack();
  init__assignMergeValue();
  init__baseFor();
  init__baseMergeDeep();
  init_isObject();
  init_keysIn();
  init__safeGet();
  _baseMerge_default = baseMerge;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_apply.js
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var _apply_default;
var init__apply = __esm(() => {
  _apply_default = apply;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_overRest.js
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply_default(func, this, otherArgs);
  };
}
var nativeMax, _overRest_default;
var init__overRest = __esm(() => {
  init__apply();
  nativeMax = Math.max;
  _overRest_default = overRest;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/constant.js
function constant(value) {
  return function() {
    return value;
  };
}
var constant_default;
var init_constant = __esm(() => {
  constant_default = constant;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseSetToString.js
var baseSetToString, _baseSetToString_default;
var init__baseSetToString = __esm(() => {
  init_constant();
  init__defineProperty();
  init_identity();
  baseSetToString = !_defineProperty_default ? identity_default : function(func, string) {
    return _defineProperty_default(func, "toString", {
      configurable: true,
      enumerable: false,
      value: constant_default(string),
      writable: true
    });
  };
  _baseSetToString_default = baseSetToString;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_shortOut.js
function shortOut(func) {
  var count2 = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count2 >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count2 = 0;
    }
    return func.apply(undefined, arguments);
  };
}
var HOT_COUNT = 800, HOT_SPAN = 16, nativeNow, _shortOut_default;
var init__shortOut = __esm(() => {
  nativeNow = Date.now;
  _shortOut_default = shortOut;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_setToString.js
var setToString, _setToString_default;
var init__setToString = __esm(() => {
  init__baseSetToString();
  init__shortOut();
  setToString = _shortOut_default(_baseSetToString_default);
  _setToString_default = setToString;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseRest.js
function baseRest(func, start) {
  return _setToString_default(_overRest_default(func, start, identity_default), func + "");
}
var _baseRest_default;
var init__baseRest = __esm(() => {
  init_identity();
  init__overRest();
  init__setToString();
  _baseRest_default = baseRest;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_isIterateeCall.js
function isIterateeCall(value, index, object) {
  if (!isObject_default(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike_default(object) && _isIndex_default(index, object.length) : type == "string" && (index in object)) {
    return eq_default(object[index], value);
  }
  return false;
}
var _isIterateeCall_default;
var init__isIterateeCall = __esm(() => {
  init_eq();
  init_isArrayLike();
  init__isIndex();
  init_isObject();
  _isIterateeCall_default = isIterateeCall;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_createAssigner.js
function createAssigner(assigner) {
  return _baseRest_default(function(object, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined;
    if (guard && _isIterateeCall_default(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}
var _createAssigner_default;
var init__createAssigner = __esm(() => {
  init__baseRest();
  init__isIterateeCall();
  _createAssigner_default = createAssigner;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/mergeWith.js
var mergeWith, mergeWith_default;
var init_mergeWith = __esm(() => {
  init__baseMerge();
  init__createAssigner();
  mergeWith = _createAssigner_default(function(object, source, srcIndex, customizer) {
    _baseMerge_default(object, source, srcIndex, customizer);
  });
  mergeWith_default = mergeWith;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getSymbolsIn.js
var nativeGetSymbols, getSymbolsIn, _getSymbolsIn_default;
var init__getSymbolsIn = __esm(() => {
  init__arrayPush();
  init__getPrototype();
  init__getSymbols();
  init_stubArray();
  nativeGetSymbols = Object.getOwnPropertySymbols;
  getSymbolsIn = !nativeGetSymbols ? stubArray_default : function(object) {
    var result = [];
    while (object) {
      _arrayPush_default(result, _getSymbols_default(object));
      object = _getPrototype_default(object);
    }
    return result;
  };
  _getSymbolsIn_default = getSymbolsIn;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_getAllKeysIn.js
function getAllKeysIn(object) {
  return _baseGetAllKeys_default(object, keysIn_default, _getSymbolsIn_default);
}
var _getAllKeysIn_default;
var init__getAllKeysIn = __esm(() => {
  init__baseGetAllKeys();
  init__getSymbolsIn();
  init_keysIn();
  _getAllKeysIn_default = getAllKeysIn;
});

// src/utils/fileRead.ts
function detectEncodingForResolvedPath(resolvedPath) {
  const { buffer, bytesRead } = getFsImplementation().readSync(resolvedPath, {
    length: 4096
  });
  if (bytesRead === 0) {
    return "utf8";
  }
  if (bytesRead >= 2) {
    if (buffer[0] === 255 && buffer[1] === 254)
      return "utf16le";
  }
  if (bytesRead >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) {
    return "utf8";
  }
  return "utf8";
}
function detectLineEndingsForString(content) {
  let crlfCount = 0;
  let lfCount = 0;
  for (let i = 0;i < content.length; i++) {
    if (content[i] === `
`) {
      if (i > 0 && content[i - 1] === "\r") {
        crlfCount++;
      } else {
        lfCount++;
      }
    }
  }
  return crlfCount > lfCount ? "CRLF" : "LF";
}
function readFileSyncWithMetadata(filePath) {
  const fs = getFsImplementation();
  const { resolvedPath, isSymlink } = safeResolvePath(fs, filePath);
  if (isSymlink) {
    logForDebugging(`Reading through symlink: ${filePath} -> ${resolvedPath}`);
  }
  const encoding = detectEncodingForResolvedPath(resolvedPath);
  const raw = fs.readFileSync(resolvedPath, { encoding });
  const lineEndings = detectLineEndingsForString(raw.slice(0, 4096));
  return {
    content: raw.replaceAll(`\r
`, `
`),
    encoding,
    lineEndings
  };
}
function readFileSync(filePath) {
  return readFileSyncWithMetadata(filePath).content;
}
var init_fileRead = __esm(() => {
  init_debug();
  init_fsOperations();
});

// src/services/remoteManagedSettings/syncCacheState.ts
import { join } from "path";
function setSessionCache(value) {
  sessionCache = value;
}
function resetSyncCache() {
  sessionCache = null;
  eligible = undefined;
}
function setEligibility(v) {
  eligible = v;
  return v;
}
function getSettingsPath() {
  return join(getURConfigHomeDir(), SETTINGS_FILENAME);
}
function loadSettings() {
  try {
    const content = readFileSync(getSettingsPath());
    const data = jsonParse(stripBOM(content));
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function getRemoteManagedSettingsSyncFromCache() {
  if (eligible !== true)
    return null;
  if (sessionCache)
    return sessionCache;
  const cachedSettings = loadSettings();
  if (cachedSettings) {
    sessionCache = cachedSettings;
    resetSettingsCache();
    return cachedSettings;
  }
  return null;
}
var SETTINGS_FILENAME = "remote-settings.json", sessionCache = null, eligible;
var init_syncCacheState = __esm(() => {
  init_envUtils();
  init_fileRead();
  init_jsonRead();
  init_settingsCache();
  init_slowOperations();
});

// node_modules/.bun/dom-mutator@0.6.0/node_modules/dom-mutator/dist/dom-mutator.cjs.development.js
var require_dom_mutator_cjs_development = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var validAttributeName = /^[a-zA-Z:_][a-zA-Z0-9:_.-]*$/;
  var nullController = {
    revert: function revert() {}
  };
  var elements = /* @__PURE__ */ new Map;
  var mutations = /* @__PURE__ */ new Set;
  function getObserverInit(attr) {
    return attr === "html" ? {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    } : {
      childList: false,
      subtree: false,
      attributes: true,
      attributeFilter: [attr]
    };
  }
  function getElementRecord(element) {
    var record = elements.get(element);
    if (!record) {
      record = {
        element,
        attributes: {}
      };
      elements.set(element, record);
    }
    return record;
  }
  function createElementPropertyRecord(el, attr, getCurrentValue, setValue2, mutationRunner) {
    var currentValue = getCurrentValue(el);
    var record = {
      isDirty: false,
      originalValue: currentValue,
      virtualValue: currentValue,
      mutations: [],
      el,
      _positionTimeout: null,
      observer: new MutationObserver(function() {
        if (attr === "position" && record._positionTimeout)
          return;
        else if (attr === "position")
          record._positionTimeout = setTimeout(function() {
            record._positionTimeout = null;
          }, 1000);
        var currentValue2 = getCurrentValue(el);
        if (attr === "position" && currentValue2.parentNode === record.virtualValue.parentNode && currentValue2.insertBeforeNode === record.virtualValue.insertBeforeNode)
          return;
        if (currentValue2 === record.virtualValue)
          return;
        record.originalValue = currentValue2;
        mutationRunner(record);
      }),
      mutationRunner,
      setValue: setValue2,
      getCurrentValue
    };
    if (attr === "position" && el.parentNode) {
      record.observer.observe(el.parentNode, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });
    } else {
      record.observer.observe(el, getObserverInit(attr));
    }
    return record;
  }
  function queueIfNeeded(val, record) {
    var currentVal = record.getCurrentValue(record.el);
    record.virtualValue = val;
    if (val && typeof val !== "string") {
      if (!currentVal || val.parentNode !== currentVal.parentNode || val.insertBeforeNode !== currentVal.insertBeforeNode) {
        record.isDirty = true;
        runDOMUpdates();
      }
    } else if (val !== currentVal) {
      record.isDirty = true;
      runDOMUpdates();
    }
  }
  function htmlMutationRunner(record) {
    var val = record.originalValue;
    record.mutations.forEach(function(m) {
      return val = m.mutate(val);
    });
    queueIfNeeded(getTransformedHTML(val), record);
  }
  function classMutationRunner(record) {
    var val = new Set(record.originalValue.split(/\s+/).filter(Boolean));
    record.mutations.forEach(function(m) {
      return m.mutate(val);
    });
    queueIfNeeded(Array.from(val).filter(Boolean).join(" "), record);
  }
  function attrMutationRunner(record) {
    var val = record.originalValue;
    record.mutations.forEach(function(m) {
      return val = m.mutate(val);
    });
    queueIfNeeded(val, record);
  }
  function _loadDOMNodes(_ref) {
    var { parentSelector, insertBeforeSelector } = _ref;
    var parentNode = document.querySelector(parentSelector);
    if (!parentNode)
      return null;
    var insertBeforeNode = insertBeforeSelector ? document.querySelector(insertBeforeSelector) : null;
    if (insertBeforeSelector && !insertBeforeNode)
      return null;
    return {
      parentNode,
      insertBeforeNode
    };
  }
  function positionMutationRunner(record) {
    var val = record.originalValue;
    record.mutations.forEach(function(m) {
      var selectors = m.mutate();
      var newNodes = _loadDOMNodes(selectors);
      val = newNodes || val;
    });
    queueIfNeeded(val, record);
  }
  var getHTMLValue = function getHTMLValue2(el) {
    return el.innerHTML;
  };
  var setHTMLValue = function setHTMLValue2(el, value) {
    return el.innerHTML = value;
  };
  function getElementHTMLRecord(element) {
    var elementRecord = getElementRecord(element);
    if (!elementRecord.html) {
      elementRecord.html = createElementPropertyRecord(element, "html", getHTMLValue, setHTMLValue, htmlMutationRunner);
    }
    return elementRecord.html;
  }
  var getElementPosition = function getElementPosition2(el) {
    return {
      parentNode: el.parentElement,
      insertBeforeNode: el.nextElementSibling
    };
  };
  var setElementPosition = function setElementPosition2(el, value) {
    if (value.insertBeforeNode && !value.parentNode.contains(value.insertBeforeNode)) {
      return;
    }
    value.parentNode.insertBefore(el, value.insertBeforeNode);
  };
  function getElementPositionRecord(element) {
    var elementRecord = getElementRecord(element);
    if (!elementRecord.position) {
      elementRecord.position = createElementPropertyRecord(element, "position", getElementPosition, setElementPosition, positionMutationRunner);
    }
    return elementRecord.position;
  }
  var setClassValue = function setClassValue2(el, val) {
    return val ? el.className = val : el.removeAttribute("class");
  };
  var getClassValue = function getClassValue2(el) {
    return el.className;
  };
  function getElementClassRecord(el) {
    var elementRecord = getElementRecord(el);
    if (!elementRecord.classes) {
      elementRecord.classes = createElementPropertyRecord(el, "class", getClassValue, setClassValue, classMutationRunner);
    }
    return elementRecord.classes;
  }
  var getAttrValue = function getAttrValue2(attrName) {
    return function(el) {
      var _el$getAttribute;
      return (_el$getAttribute = el.getAttribute(attrName)) != null ? _el$getAttribute : null;
    };
  };
  var setAttrValue = function setAttrValue2(attrName) {
    return function(el, val) {
      return val !== null ? el.setAttribute(attrName, val) : el.removeAttribute(attrName);
    };
  };
  function getElementAttributeRecord(el, attr) {
    var elementRecord = getElementRecord(el);
    if (!elementRecord.attributes[attr]) {
      elementRecord.attributes[attr] = createElementPropertyRecord(el, attr, getAttrValue(attr), setAttrValue(attr), attrMutationRunner);
    }
    return elementRecord.attributes[attr];
  }
  function deleteElementPropertyRecord(el, attr) {
    var element = elements.get(el);
    if (!element)
      return;
    if (attr === "html") {
      var _element$html, _element$html$observe;
      (_element$html = element.html) == null || (_element$html$observe = _element$html.observer) == null || _element$html$observe.disconnect();
      delete element.html;
    } else if (attr === "class") {
      var _element$classes, _element$classes$obse;
      (_element$classes = element.classes) == null || (_element$classes$obse = _element$classes.observer) == null || _element$classes$obse.disconnect();
      delete element.classes;
    } else if (attr === "position") {
      var _element$position, _element$position$obs;
      (_element$position = element.position) == null || (_element$position$obs = _element$position.observer) == null || _element$position$obs.disconnect();
      delete element.position;
    } else {
      var _element$attributes, _element$attributes$a, _element$attributes$a2;
      (_element$attributes = element.attributes) == null || (_element$attributes$a = _element$attributes[attr]) == null || (_element$attributes$a2 = _element$attributes$a.observer) == null || _element$attributes$a2.disconnect();
      delete element.attributes[attr];
    }
  }
  var transformContainer;
  function getTransformedHTML(html2) {
    if (!transformContainer) {
      transformContainer = document.createElement("div");
    }
    transformContainer.innerHTML = html2;
    return transformContainer.innerHTML;
  }
  function setPropertyValue(el, attr, m) {
    if (!m.isDirty)
      return;
    m.isDirty = false;
    var val = m.virtualValue;
    if (!m.mutations.length) {
      deleteElementPropertyRecord(el, attr);
    }
    m.setValue(el, val);
  }
  function setValue(m, el) {
    m.html && setPropertyValue(el, "html", m.html);
    m.classes && setPropertyValue(el, "class", m.classes);
    m.position && setPropertyValue(el, "position", m.position);
    Object.keys(m.attributes).forEach(function(attr) {
      setPropertyValue(el, attr, m.attributes[attr]);
    });
  }
  function runDOMUpdates() {
    elements.forEach(setValue);
  }
  function startMutating(mutation, element) {
    var record = null;
    if (mutation.kind === "html") {
      record = getElementHTMLRecord(element);
    } else if (mutation.kind === "class") {
      record = getElementClassRecord(element);
    } else if (mutation.kind === "attribute") {
      record = getElementAttributeRecord(element, mutation.attribute);
    } else if (mutation.kind === "position") {
      record = getElementPositionRecord(element);
    }
    if (!record)
      return;
    record.mutations.push(mutation);
    record.mutationRunner(record);
  }
  function stopMutating(mutation, el) {
    var record = null;
    if (mutation.kind === "html") {
      record = getElementHTMLRecord(el);
    } else if (mutation.kind === "class") {
      record = getElementClassRecord(el);
    } else if (mutation.kind === "attribute") {
      record = getElementAttributeRecord(el, mutation.attribute);
    } else if (mutation.kind === "position") {
      record = getElementPositionRecord(el);
    }
    if (!record)
      return;
    var index2 = record.mutations.indexOf(mutation);
    if (index2 !== -1)
      record.mutations.splice(index2, 1);
    record.mutationRunner(record);
  }
  function refreshElementsSet(mutation) {
    if (mutation.kind === "position" && mutation.elements.size === 1)
      return;
    var existingElements = new Set(mutation.elements);
    var matchingElements = document.querySelectorAll(mutation.selector);
    matchingElements.forEach(function(el) {
      if (!existingElements.has(el)) {
        mutation.elements.add(el);
        startMutating(mutation, el);
      }
    });
  }
  function revertMutation(mutation) {
    mutation.elements.forEach(function(el) {
      return stopMutating(mutation, el);
    });
    mutation.elements.clear();
    mutations["delete"](mutation);
  }
  function refreshAllElementSets() {
    mutations.forEach(refreshElementsSet);
  }
  var observer;
  function disconnectGlobalObserver() {
    observer && observer.disconnect();
  }
  function connectGlobalObserver() {
    if (typeof document === "undefined")
      return;
    if (!observer) {
      observer = new MutationObserver(function() {
        refreshAllElementSets();
      });
    }
    refreshAllElementSets();
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }
  connectGlobalObserver();
  function newMutation(m) {
    if (typeof document === "undefined")
      return nullController;
    mutations.add(m);
    refreshElementsSet(m);
    return {
      revert: function revert() {
        revertMutation(m);
      }
    };
  }
  function html(selector, mutate) {
    return newMutation({
      kind: "html",
      elements: new Set,
      mutate,
      selector
    });
  }
  function position(selector, mutate) {
    return newMutation({
      kind: "position",
      elements: new Set,
      mutate,
      selector
    });
  }
  function classes(selector, mutate) {
    return newMutation({
      kind: "class",
      elements: new Set,
      mutate,
      selector
    });
  }
  function attribute(selector, attribute2, mutate) {
    if (!validAttributeName.test(attribute2))
      return nullController;
    if (attribute2 === "class" || attribute2 === "className") {
      return classes(selector, function(classnames) {
        var mutatedClassnames = mutate(Array.from(classnames).join(" "));
        classnames.clear();
        if (!mutatedClassnames)
          return;
        mutatedClassnames.split(/\s+/g).filter(Boolean).forEach(function(c) {
          return classnames.add(c);
        });
      });
    }
    return newMutation({
      kind: "attribute",
      attribute: attribute2,
      elements: new Set,
      mutate,
      selector
    });
  }
  function declarative(_ref2) {
    var { selector, action, value, attribute: attr, parentSelector, insertBeforeSelector } = _ref2;
    if (attr === "html") {
      if (action === "append") {
        return html(selector, function(val) {
          return val + (value != null ? value : "");
        });
      } else if (action === "set") {
        return html(selector, function() {
          return value != null ? value : "";
        });
      }
    } else if (attr === "class") {
      if (action === "append") {
        return classes(selector, function(val) {
          if (value)
            val.add(value);
        });
      } else if (action === "remove") {
        return classes(selector, function(val) {
          if (value)
            val["delete"](value);
        });
      } else if (action === "set") {
        return classes(selector, function(val) {
          val.clear();
          if (value)
            val.add(value);
        });
      }
    } else if (attr === "position") {
      if (action === "set" && parentSelector) {
        return position(selector, function() {
          return {
            insertBeforeSelector,
            parentSelector
          };
        });
      }
    } else {
      if (action === "append") {
        return attribute(selector, attr, function(val) {
          return val !== null ? val + (value != null ? value : "") : value != null ? value : "";
        });
      } else if (action === "set") {
        return attribute(selector, attr, function() {
          return value != null ? value : "";
        });
      } else if (action === "remove") {
        return attribute(selector, attr, function() {
          return null;
        });
      }
    }
    return nullController;
  }
  var index = {
    html,
    classes,
    attribute,
    position,
    declarative
  };
  exports.connectGlobalObserver = connectGlobalObserver;
  exports.default = index;
  exports.disconnectGlobalObserver = disconnectGlobalObserver;
  exports.validAttributeName = validAttributeName;
});

// node_modules/.bun/dom-mutator@0.6.0/node_modules/dom-mutator/dist/index.js
var require_dist = __commonJS((exports, module) => {
  if (false) {} else {
    module.exports = require_dom_mutator_cjs_development();
  }
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/util.mjs
function getPolyfills() {
  return polyfills;
}
function hashFnv32a(str) {
  let hval = 2166136261;
  const l = str.length;
  for (let i = 0;i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}
function hash(seed, value, version) {
  if (version === 2) {
    return hashFnv32a(hashFnv32a(seed + value) + "") % 1e4 / 1e4;
  }
  if (version === 1) {
    return hashFnv32a(value + seed) % 1000 / 1000;
  }
  return null;
}
function getEqualWeights(n) {
  if (n <= 0)
    return [];
  return new Array(n).fill(1 / n);
}
function inRange(n, range) {
  return n >= range[0] && n < range[1];
}
function inNamespace(hashValue, namespace) {
  const n = hash("__" + namespace[0], hashValue, 1);
  if (n === null)
    return false;
  return n >= namespace[1] && n < namespace[2];
}
function chooseVariation(n, ranges) {
  for (let i = 0;i < ranges.length; i++) {
    if (inRange(n, ranges[i])) {
      return i;
    }
  }
  return -1;
}
function getUrlRegExp(regexString) {
  try {
    const escaped = regexString.replace(/([^\\])\//g, "$1\\/");
    return new RegExp(escaped);
  } catch (e) {
    console.error(e);
    return;
  }
}
function isURLTargeted(url, targets) {
  if (!targets.length)
    return false;
  let hasIncludeRules = false;
  let isIncluded = false;
  for (let i = 0;i < targets.length; i++) {
    const match = _evalURLTarget(url, targets[i].type, targets[i].pattern);
    if (targets[i].include === false) {
      if (match)
        return false;
    } else {
      hasIncludeRules = true;
      if (match)
        isIncluded = true;
    }
  }
  return isIncluded || !hasIncludeRules;
}
function _evalSimpleUrlPart(actual, pattern, isPath) {
  try {
    let escaped = pattern.replace(/[*.+?^${}()|[\]\\]/g, "\\$&").replace(/_____/g, ".*");
    if (isPath) {
      escaped = "\\/?" + escaped.replace(/(^\/|\/$)/g, "") + "\\/?";
    }
    const regex = new RegExp("^" + escaped + "$", "i");
    return regex.test(actual);
  } catch (e) {
    return false;
  }
}
function _evalSimpleUrlTarget(actual, pattern) {
  try {
    const expected = new URL(pattern.replace(/^([^:/?]*)\./i, "https://$1.").replace(/\*/g, "_____"), "https://_____");
    const comps = [[actual.host, expected.host, false], [actual.pathname, expected.pathname, true]];
    if (expected.hash) {
      comps.push([actual.hash, expected.hash, false]);
    }
    expected.searchParams.forEach((v, k) => {
      comps.push([actual.searchParams.get(k) || "", v, false]);
    });
    return !comps.some((data) => !_evalSimpleUrlPart(data[0], data[1], data[2]));
  } catch (e) {
    return false;
  }
}
function _evalURLTarget(url, type, pattern) {
  try {
    const parsed = new URL(url, "https://_");
    if (type === "regex") {
      const regex = getUrlRegExp(pattern);
      if (!regex)
        return false;
      return regex.test(parsed.href) || regex.test(parsed.href.substring(parsed.origin.length));
    } else if (type === "simple") {
      return _evalSimpleUrlTarget(parsed, pattern);
    }
    return false;
  } catch (e) {
    return false;
  }
}
function getBucketRanges(numVariations, coverage, weights) {
  coverage = coverage === undefined ? 1 : coverage;
  if (coverage < 0) {
    if (true) {
      console.error("Experiment.coverage must be greater than or equal to 0");
    }
    coverage = 0;
  } else if (coverage > 1) {
    if (true) {
      console.error("Experiment.coverage must be less than or equal to 1");
    }
    coverage = 1;
  }
  const equal = getEqualWeights(numVariations);
  weights = weights || equal;
  if (weights.length !== numVariations) {
    if (true) {
      console.error("Experiment.weights array must be the same length as Experiment.variations");
    }
    weights = equal;
  }
  const totalWeight = weights.reduce((w, sum) => sum + w, 0);
  if (totalWeight < 0.99 || totalWeight > 1.01) {
    if (true) {
      console.error("Experiment.weights must add up to 1");
    }
    weights = equal;
  }
  let cumulative = 0;
  return weights.map((w) => {
    const start = cumulative;
    cumulative += w;
    return [start, start + coverage * w];
  });
}
function getQueryStringOverride(id, url, numVariations) {
  if (!url) {
    return null;
  }
  const search = url.split("?")[1];
  if (!search) {
    return null;
  }
  const match = search.replace(/#.*/, "").split("&").map((kv) => kv.split("=", 2)).filter(([k]) => k === id).map(([, v]) => parseInt(v));
  if (match.length > 0 && match[0] >= 0 && match[0] < numVariations)
    return match[0];
  return null;
}
function isIncluded(include) {
  try {
    return include();
  } catch (e) {
    console.error(e);
    return false;
  }
}
async function decrypt(encryptedString, decryptionKey, subtle) {
  decryptionKey = decryptionKey || "";
  subtle = subtle || globalThis.crypto && globalThis.crypto.subtle || polyfills.SubtleCrypto;
  if (!subtle) {
    throw new Error("No SubtleCrypto implementation found");
  }
  try {
    const key = await subtle.importKey("raw", base64ToBuf(decryptionKey), {
      name: "AES-CBC",
      length: 128
    }, true, ["encrypt", "decrypt"]);
    const [iv, cipherText] = encryptedString.split(".");
    const plainTextBuffer = await subtle.decrypt({
      name: "AES-CBC",
      iv: base64ToBuf(iv)
    }, key, base64ToBuf(cipherText));
    return new TextDecoder().decode(plainTextBuffer);
  } catch (e) {
    throw new Error("Failed to decrypt");
  }
}
function toString(input) {
  if (typeof input === "string")
    return input;
  return JSON.stringify(input);
}
function paddedVersionString(input) {
  if (typeof input === "number") {
    input = input + "";
  }
  if (!input || typeof input !== "string") {
    input = "0";
  }
  const parts = input.replace(/(^v|\+.*$)/g, "").split(/[-.]/);
  if (parts.length === 3) {
    parts.push("~");
  }
  return parts.map((v) => v.match(/^[0-9]+$/) ? v.padStart(5, " ") : v).join("-");
}
function loadSDKVersion() {
  let version;
  try {
    version = "1.6.5";
  } catch (e) {
    version = "";
  }
  return version;
}
function mergeQueryStrings(oldUrl, newUrl) {
  let currUrl;
  let redirectUrl;
  try {
    currUrl = new URL(oldUrl);
    redirectUrl = new URL(newUrl);
  } catch (e) {
    console.error(`Unable to merge query strings: ${e}`);
    return newUrl;
  }
  currUrl.searchParams.forEach((value, key) => {
    if (redirectUrl.searchParams.has(key)) {
      return;
    }
    redirectUrl.searchParams.set(key, value);
  });
  return redirectUrl.toString();
}
function isObj(x) {
  return typeof x === "object" && x !== null;
}
function getAutoExperimentChangeType(exp) {
  if (exp.urlPatterns && exp.variations.some((variation) => isObj(variation) && ("urlRedirect" in variation))) {
    return "redirect";
  } else if (exp.variations.some((variation) => isObj(variation) && (variation.domMutations || ("js" in variation) || ("css" in variation)))) {
    return "visual";
  }
  return "unknown";
}
async function promiseTimeout(promise, timeout) {
  return new Promise((resolve) => {
    let resolved = false;
    let timer;
    const finish = (data) => {
      if (resolved)
        return;
      resolved = true;
      timer && clearTimeout(timer);
      resolve(data || null);
    };
    if (timeout) {
      timer = setTimeout(() => finish(), timeout);
    }
    promise.then((data) => finish(data)).catch(() => finish());
  });
}
var polyfills, base64ToBuf = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
var init_util = __esm(() => {
  polyfills = {
    fetch: globalThis.fetch ? globalThis.fetch.bind(globalThis) : undefined,
    SubtleCrypto: globalThis.crypto ? globalThis.crypto.subtle : undefined,
    EventSource: globalThis.EventSource
  };
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/feature-repository.mjs
function configureCache(overrides) {
  Object.assign(cacheSettings, overrides);
  if (!cacheSettings.backgroundSync) {
    clearAutoRefresh();
  }
}
async function refreshFeatures({
  instance,
  timeout,
  skipCache,
  allowStale,
  backgroundSync
}) {
  if (!backgroundSync) {
    cacheSettings.backgroundSync = false;
  }
  return fetchFeaturesWithCache({
    instance,
    allowStale,
    timeout,
    skipCache
  });
}
function subscribe(instance) {
  const key = getKey(instance);
  const subs = subscribedInstances.get(key) || new Set;
  subs.add(instance);
  subscribedInstances.set(key, subs);
}
function unsubscribe(instance) {
  subscribedInstances.forEach((s) => s.delete(instance));
}
function onHidden() {
  streams.forEach((channel) => {
    if (!channel)
      return;
    channel.state = "idle";
    disableChannel(channel);
  });
}
function onVisible() {
  streams.forEach((channel) => {
    if (!channel)
      return;
    if (channel.state !== "idle")
      return;
    enableChannel(channel);
  });
}
async function updatePersistentCache() {
  try {
    if (!polyfills2.localStorage)
      return;
    await polyfills2.localStorage.setItem(cacheSettings.cacheKey, JSON.stringify(Array.from(cache.entries())));
  } catch (e) {}
}
async function fetchFeaturesWithCache({
  instance,
  allowStale,
  timeout,
  skipCache
}) {
  const key = getKey(instance);
  const cacheKey = getCacheKey(instance);
  const now = new Date;
  const minStaleAt = new Date(now.getTime() - cacheSettings.maxAge + cacheSettings.staleTTL);
  await initializeCache();
  const existing = !cacheSettings.disableCache && !skipCache ? cache.get(cacheKey) : undefined;
  if (existing && (allowStale || existing.staleAt > now) && existing.staleAt > minStaleAt) {
    if (existing.sse)
      supportsSSE.add(key);
    if (existing.staleAt < now) {
      fetchFeatures(instance);
    } else {
      startAutoRefresh(instance);
    }
    return {
      data: existing.data,
      success: true,
      source: "cache"
    };
  } else {
    const res = await promiseTimeout(fetchFeatures(instance), timeout);
    return res || {
      data: null,
      success: false,
      source: "timeout",
      error: new Error("Timeout")
    };
  }
}
function getKey(instance) {
  const [apiHost, clientKey] = instance.getApiInfo();
  return `${apiHost}||${clientKey}`;
}
function getCacheKey(instance) {
  const baseKey = getKey(instance);
  if (!("isRemoteEval" in instance) || !instance.isRemoteEval())
    return baseKey;
  const attributes = instance.getAttributes();
  const cacheKeyAttributes = instance.getCacheKeyAttributes() || Object.keys(instance.getAttributes());
  const ca = {};
  cacheKeyAttributes.forEach((key) => {
    ca[key] = attributes[key];
  });
  const fv = instance.getForcedVariations();
  const url = instance.getUrl();
  return `${baseKey}||${JSON.stringify({
    ca,
    fv,
    url
  })}`;
}
async function initializeCache() {
  if (cacheInitialized)
    return;
  cacheInitialized = true;
  try {
    if (polyfills2.localStorage) {
      const value = await polyfills2.localStorage.getItem(cacheSettings.cacheKey);
      if (!cacheSettings.disableCache && value) {
        const parsed = JSON.parse(value);
        if (parsed && Array.isArray(parsed)) {
          parsed.forEach(([key, data]) => {
            cache.set(key, {
              ...data,
              staleAt: new Date(data.staleAt)
            });
          });
        }
        cleanupCache();
      }
    }
  } catch (e) {}
  if (!cacheSettings.disableIdleStreams) {
    const cleanupFn = helpers.startIdleListener();
    if (cleanupFn) {
      helpers.stopIdleListener = cleanupFn;
    }
  }
}
function cleanupCache() {
  const entriesWithTimestamps = Array.from(cache.entries()).map(([key, value]) => ({
    key,
    staleAt: value.staleAt.getTime()
  })).sort((a, b) => a.staleAt - b.staleAt);
  const entriesToRemoveCount = Math.min(Math.max(0, cache.size - cacheSettings.maxEntries), cache.size);
  for (let i = 0;i < entriesToRemoveCount; i++) {
    cache.delete(entriesWithTimestamps[i].key);
  }
}
function onNewFeatureData(key, cacheKey, data) {
  const version = data.dateUpdated || "";
  const staleAt = new Date(Date.now() + cacheSettings.staleTTL);
  const existing = !cacheSettings.disableCache ? cache.get(cacheKey) : undefined;
  if (existing && version && existing.version === version) {
    existing.staleAt = staleAt;
    updatePersistentCache();
    return;
  }
  if (!cacheSettings.disableCache) {
    cache.set(cacheKey, {
      data,
      version,
      staleAt,
      sse: supportsSSE.has(key)
    });
    cleanupCache();
  }
  updatePersistentCache();
  const instances = subscribedInstances.get(key);
  instances && instances.forEach((instance) => refreshInstance(instance, data));
}
async function refreshInstance(instance, data) {
  await instance.setPayload(data || instance.getPayload());
}
async function fetchFeatures(instance) {
  const {
    apiHost,
    apiRequestHeaders
  } = instance.getApiHosts();
  const clientKey = instance.getClientKey();
  const remoteEval = "isRemoteEval" in instance && instance.isRemoteEval();
  const key = getKey(instance);
  const cacheKey = getCacheKey(instance);
  let promise = activeFetches.get(cacheKey);
  if (!promise) {
    const fetcher = remoteEval ? helpers.fetchRemoteEvalCall({
      host: apiHost,
      clientKey,
      payload: {
        attributes: instance.getAttributes(),
        forcedVariations: instance.getForcedVariations(),
        forcedFeatures: Array.from(instance.getForcedFeatures().entries()),
        url: instance.getUrl()
      },
      headers: apiRequestHeaders
    }) : helpers.fetchFeaturesCall({
      host: apiHost,
      clientKey,
      headers: apiRequestHeaders
    });
    promise = fetcher.then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      if (res.headers.get("x-sse-support") === "enabled") {
        supportsSSE.add(key);
      }
      return res.json();
    }).then((data) => {
      onNewFeatureData(key, cacheKey, data);
      startAutoRefresh(instance);
      activeFetches.delete(cacheKey);
      return {
        data,
        success: true,
        source: "network"
      };
    }).catch((e) => {
      instance.log("Error fetching features", {
        apiHost,
        clientKey,
        error: e ? e.message : null
      });
      activeFetches.delete(cacheKey);
      return {
        data: null,
        source: "error",
        success: false,
        error: e
      };
    });
    activeFetches.set(cacheKey, promise);
  }
  return promise;
}
function startAutoRefresh(instance, forceSSE = false) {
  const key = getKey(instance);
  const cacheKey = getCacheKey(instance);
  const {
    streamingHost,
    streamingHostRequestHeaders
  } = instance.getApiHosts();
  const clientKey = instance.getClientKey();
  if (forceSSE) {
    supportsSSE.add(key);
  }
  if (cacheSettings.backgroundSync && supportsSSE.has(key) && polyfills2.EventSource) {
    if (streams.has(key))
      return;
    const channel = {
      src: null,
      host: streamingHost,
      clientKey,
      headers: streamingHostRequestHeaders,
      cb: (event) => {
        try {
          if (event.type === "features-updated") {
            const instances = subscribedInstances.get(key);
            instances && instances.forEach((instance2) => {
              fetchFeatures(instance2);
            });
          } else if (event.type === "features") {
            const json = JSON.parse(event.data);
            onNewFeatureData(key, cacheKey, json);
          }
          channel.errors = 0;
        } catch (e) {
          instance.log("SSE Error", {
            streamingHost,
            clientKey,
            error: e ? e.message : null
          });
          onSSEError(channel);
        }
      },
      errors: 0,
      state: "active"
    };
    streams.set(key, channel);
    enableChannel(channel);
  }
}
function onSSEError(channel) {
  if (channel.state === "idle")
    return;
  channel.errors++;
  if (channel.errors > 3 || channel.src && channel.src.readyState === 2) {
    const delay = Math.pow(3, channel.errors - 3) * (1000 + Math.random() * 1000);
    disableChannel(channel);
    setTimeout(() => {
      if (["idle", "active"].includes(channel.state))
        return;
      enableChannel(channel);
    }, Math.min(delay, 300000));
  }
}
function disableChannel(channel) {
  if (!channel.src)
    return;
  channel.src.onopen = null;
  channel.src.onerror = null;
  channel.src.close();
  channel.src = null;
  if (channel.state === "active") {
    channel.state = "disabled";
  }
}
function enableChannel(channel) {
  channel.src = helpers.eventSourceCall({
    host: channel.host,
    clientKey: channel.clientKey,
    headers: channel.headers
  });
  channel.state = "active";
  channel.src.addEventListener("features", channel.cb);
  channel.src.addEventListener("features-updated", channel.cb);
  channel.src.onerror = () => onSSEError(channel);
  channel.src.onopen = () => {
    channel.errors = 0;
  };
}
function destroyChannel(channel, key) {
  disableChannel(channel);
  streams.delete(key);
}
function clearAutoRefresh() {
  supportsSSE.clear();
  streams.forEach(destroyChannel);
  subscribedInstances.clear();
  helpers.stopIdleListener();
}
function startStreaming(instance, options) {
  if (options.streaming) {
    if (!instance.getClientKey()) {
      throw new Error("Must specify clientKey to enable streaming");
    }
    if (options.payload) {
      startAutoRefresh(instance, true);
    }
    subscribe(instance);
  }
}
var cacheSettings, polyfills2, helpers, subscribedInstances, cacheInitialized = false, cache, activeFetches, streams, supportsSSE;
var init_feature_repository = __esm(() => {
  init_util();
  cacheSettings = {
    staleTTL: 1000 * 60,
    maxAge: 1000 * 60 * 60 * 4,
    cacheKey: "gbFeaturesCache",
    backgroundSync: true,
    maxEntries: 10,
    disableIdleStreams: false,
    idleStreamInterval: 20000,
    disableCache: false
  };
  polyfills2 = getPolyfills();
  helpers = {
    fetchFeaturesCall: ({
      host,
      clientKey,
      headers
    }) => {
      return polyfills2.fetch(`${host}/api/features/${clientKey}`, {
        headers
      });
    },
    fetchRemoteEvalCall: ({
      host,
      clientKey,
      payload,
      headers
    }) => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify(payload)
      };
      return polyfills2.fetch(`${host}/api/eval/${clientKey}`, options);
    },
    eventSourceCall: ({
      host,
      clientKey,
      headers
    }) => {
      if (headers) {
        return new polyfills2.EventSource(`${host}/sub/${clientKey}`, {
          headers
        });
      }
      return new polyfills2.EventSource(`${host}/sub/${clientKey}`);
    },
    startIdleListener: () => {
      let idleTimeout;
      const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
      if (!isBrowser)
        return;
      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          window.clearTimeout(idleTimeout);
          onVisible();
        } else if (document.visibilityState === "hidden") {
          idleTimeout = window.setTimeout(onHidden, cacheSettings.idleStreamInterval);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    },
    stopIdleListener: () => {}
  };
  try {
    if (globalThis.localStorage) {
      polyfills2.localStorage = globalThis.localStorage;
    }
  } catch (e) {}
  subscribedInstances = new Map;
  cache = new Map;
  activeFetches = new Map;
  streams = new Map;
  supportsSSE = new Set;
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/mongrule.mjs
function evalCondition(obj, condition, savedGroups) {
  savedGroups = savedGroups || {};
  for (const [k, v] of Object.entries(condition)) {
    switch (k) {
      case "$or":
        if (!evalOr(obj, v, savedGroups))
          return false;
        break;
      case "$nor":
        if (evalOr(obj, v, savedGroups))
          return false;
        break;
      case "$and":
        if (!evalAnd(obj, v, savedGroups))
          return false;
        break;
      case "$not":
        if (evalCondition(obj, v, savedGroups))
          return false;
        break;
      default:
        if (!evalConditionValue(v, getPath(obj, k), savedGroups))
          return false;
    }
  }
  return true;
}
function getPath(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0;i < parts.length; i++) {
    if (current && typeof current === "object" && parts[i] in current) {
      current = current[parts[i]];
    } else {
      return null;
    }
  }
  return current;
}
function getRegex(regex, insensitive = false) {
  const cacheKey = `${regex}${insensitive ? "/i" : ""}`;
  if (!_regexCache[cacheKey]) {
    _regexCache[cacheKey] = new RegExp(regex.replace(/([^\\])\//g, "$1\\/"), insensitive ? "i" : undefined);
  }
  return _regexCache[cacheKey];
}
function evalConditionValue(condition, value, savedGroups, insensitive = false) {
  if (typeof condition === "string") {
    if (insensitive) {
      return String(value).toLowerCase() === condition.toLowerCase();
    }
    return value + "" === condition;
  }
  if (typeof condition === "number") {
    return value * 1 === condition;
  }
  if (typeof condition === "boolean") {
    return value !== null && !!value === condition;
  }
  if (condition === null) {
    return value === null;
  }
  if (Array.isArray(condition) || !isOperatorObject(condition)) {
    return JSON.stringify(value) === JSON.stringify(condition);
  }
  for (const op in condition) {
    if (!evalOperatorCondition(op, value, condition[op], savedGroups)) {
      return false;
    }
  }
  return true;
}
function isOperatorObject(obj) {
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.filter((k) => k[0] === "$").length === keys.length;
}
function getType(v) {
  if (v === null)
    return "null";
  if (Array.isArray(v))
    return "array";
  const t = typeof v;
  if (["string", "number", "boolean", "object", "undefined"].includes(t)) {
    return t;
  }
  return "unknown";
}
function elemMatch(actual, expected, savedGroups) {
  if (!Array.isArray(actual))
    return false;
  const check = isOperatorObject(expected) ? (v) => evalConditionValue(expected, v, savedGroups) : (v) => evalCondition(v, expected, savedGroups);
  for (let i = 0;i < actual.length; i++) {
    if (actual[i] && check(actual[i])) {
      return true;
    }
  }
  return false;
}
function isIn(actual, expected, insensitive = false) {
  if (insensitive) {
    const caseFold = (val) => typeof val === "string" ? val.toLowerCase() : val;
    if (Array.isArray(actual)) {
      return actual.some((el) => expected.some((exp) => caseFold(el) === caseFold(exp)));
    }
    return expected.some((exp) => caseFold(actual) === caseFold(exp));
  }
  if (Array.isArray(actual)) {
    return actual.some((el) => expected.includes(el));
  }
  return expected.includes(actual);
}
function isInAll(actual, expected, savedGroups, insensitive = false) {
  if (!Array.isArray(actual))
    return false;
  for (let i = 0;i < expected.length; i++) {
    let passed = false;
    for (let j = 0;j < actual.length; j++) {
      if (evalConditionValue(expected[i], actual[j], savedGroups, insensitive)) {
        passed = true;
        break;
      }
    }
    if (!passed)
      return false;
  }
  return true;
}
function evalOperatorCondition(operator, actual, expected, savedGroups) {
  switch (operator) {
    case "$veq":
      return paddedVersionString(actual) === paddedVersionString(expected);
    case "$vne":
      return paddedVersionString(actual) !== paddedVersionString(expected);
    case "$vgt":
      return paddedVersionString(actual) > paddedVersionString(expected);
    case "$vgte":
      return paddedVersionString(actual) >= paddedVersionString(expected);
    case "$vlt":
      return paddedVersionString(actual) < paddedVersionString(expected);
    case "$vlte":
      return paddedVersionString(actual) <= paddedVersionString(expected);
    case "$eq":
      return actual === expected;
    case "$ne":
      return actual !== expected;
    case "$lt":
      return actual < expected;
    case "$lte":
      return actual <= expected;
    case "$gt":
      return actual > expected;
    case "$gte":
      return actual >= expected;
    case "$exists":
      return expected ? actual != null : actual == null;
    case "$in":
      if (!Array.isArray(expected))
        return false;
      return isIn(actual, expected);
    case "$ini":
      if (!Array.isArray(expected))
        return false;
      return isIn(actual, expected, true);
    case "$inGroup":
      return isIn(actual, savedGroups[expected] || []);
    case "$notInGroup":
      return !isIn(actual, savedGroups[expected] || []);
    case "$nin":
      if (!Array.isArray(expected))
        return false;
      return !isIn(actual, expected);
    case "$nini":
      if (!Array.isArray(expected))
        return false;
      return !isIn(actual, expected, true);
    case "$not":
      return !evalConditionValue(expected, actual, savedGroups);
    case "$size":
      if (!Array.isArray(actual))
        return false;
      return evalConditionValue(expected, actual.length, savedGroups);
    case "$elemMatch":
      return elemMatch(actual, expected, savedGroups);
    case "$all":
      if (!Array.isArray(expected))
        return false;
      return isInAll(actual, expected, savedGroups);
    case "$alli":
      if (!Array.isArray(expected))
        return false;
      return isInAll(actual, expected, savedGroups, true);
    case "$regex":
      try {
        return getRegex(expected).test(actual);
      } catch (e) {
        return false;
      }
    case "$regexi":
      try {
        return getRegex(expected, true).test(actual);
      } catch (e) {
        return false;
      }
    case "$type":
      return getType(actual) === expected;
    default:
      console.error("Unknown operator: " + operator);
      return false;
  }
}
function evalOr(obj, conditions, savedGroups) {
  if (!conditions.length)
    return true;
  for (let i = 0;i < conditions.length; i++) {
    if (evalCondition(obj, conditions[i], savedGroups)) {
      return true;
    }
  }
  return false;
}
function evalAnd(obj, conditions, savedGroups) {
  for (let i = 0;i < conditions.length; i++) {
    if (!evalCondition(obj, conditions[i], savedGroups)) {
      return false;
    }
  }
  return true;
}
var _regexCache;
var init_mongrule = __esm(() => {
  init_util();
  _regexCache = {};
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/core.mjs
function getForcedFeatureValues(ctx) {
  const ret = new Map;
  if (ctx.global.forcedFeatureValues) {
    ctx.global.forcedFeatureValues.forEach((v, k) => ret.set(k, v));
  }
  if (ctx.user.forcedFeatureValues) {
    ctx.user.forcedFeatureValues.forEach((v, k) => ret.set(k, v));
  }
  return ret;
}
function getForcedVariations(ctx) {
  if (ctx.global.forcedVariations && ctx.user.forcedVariations) {
    return {
      ...ctx.global.forcedVariations,
      ...ctx.user.forcedVariations
    };
  } else if (ctx.global.forcedVariations) {
    return ctx.global.forcedVariations;
  } else if (ctx.user.forcedVariations) {
    return ctx.user.forcedVariations;
  } else {
    return {};
  }
}
async function safeCall(fn) {
  try {
    await fn();
  } catch (e) {}
}
function onExperimentViewed(ctx, experiment, result) {
  if (ctx.user.trackedExperiments) {
    const k = getExperimentDedupeKey(experiment, result);
    if (ctx.user.trackedExperiments.has(k)) {
      return [];
    }
    ctx.user.trackedExperiments.add(k);
  }
  if (ctx.user.enableDevMode && ctx.user.devLogs) {
    ctx.user.devLogs.push({
      experiment,
      result,
      timestamp: Date.now().toString(),
      logType: "experiment"
    });
  }
  const calls = [];
  if (ctx.global.trackingCallback) {
    const cb = ctx.global.trackingCallback;
    calls.push(safeCall(() => cb(experiment, result, ctx.user)));
  }
  if (ctx.user.trackingCallback) {
    const cb = ctx.user.trackingCallback;
    calls.push(safeCall(() => cb(experiment, result)));
  }
  if (ctx.global.eventLogger) {
    const cb = ctx.global.eventLogger;
    calls.push(safeCall(() => cb(EVENT_EXPERIMENT_VIEWED, {
      experimentId: experiment.key,
      variationId: result.key,
      hashAttribute: result.hashAttribute,
      hashValue: result.hashValue
    }, ctx.user)));
  }
  return calls;
}
function onFeatureUsage(ctx, key, ret) {
  if (ctx.user.trackedFeatureUsage) {
    const stringifiedValue = JSON.stringify(ret.value);
    if (ctx.user.trackedFeatureUsage[key] === stringifiedValue)
      return;
    ctx.user.trackedFeatureUsage[key] = stringifiedValue;
    if (ctx.user.enableDevMode && ctx.user.devLogs) {
      ctx.user.devLogs.push({
        featureKey: key,
        result: ret,
        timestamp: Date.now().toString(),
        logType: "feature"
      });
    }
  }
  if (ctx.global.onFeatureUsage) {
    const cb = ctx.global.onFeatureUsage;
    safeCall(() => cb(key, ret, ctx.user));
  }
  if (ctx.user.onFeatureUsage) {
    const cb = ctx.user.onFeatureUsage;
    safeCall(() => cb(key, ret));
  }
  if (ctx.global.eventLogger) {
    const cb = ctx.global.eventLogger;
    safeCall(() => cb(EVENT_FEATURE_EVALUATED, {
      feature: key,
      source: ret.source,
      value: ret.value,
      ruleId: ret.source === "defaultValue" ? "$default" : ret.ruleId || "",
      variationId: ret.experimentResult ? ret.experimentResult.key : ""
    }, ctx.user));
  }
}
function evalFeature(id, ctx) {
  if (ctx.stack.evaluatedFeatures.has(id)) {
    ctx.global.log(`evalFeature: circular dependency detected: ${ctx.stack.id} -> ${id}`, {
      from: ctx.stack.id,
      to: id
    });
    return getFeatureResult(ctx, id, null, "cyclicPrerequisite");
  }
  ctx.stack.evaluatedFeatures.add(id);
  ctx.stack.id = id;
  const forcedValues = getForcedFeatureValues(ctx);
  if (forcedValues.has(id)) {
    ctx.global.log("Global override", {
      id,
      value: forcedValues.get(id)
    });
    return getFeatureResult(ctx, id, forcedValues.get(id), "override");
  }
  if (!ctx.global.features || !ctx.global.features[id]) {
    ctx.global.log("Unknown feature", {
      id
    });
    return getFeatureResult(ctx, id, null, "unknownFeature");
  }
  const feature = ctx.global.features[id];
  if (feature.rules) {
    const evaluatedFeatures = new Set(ctx.stack.evaluatedFeatures);
    rules:
      for (const rule of feature.rules) {
        if (rule.parentConditions) {
          for (const parentCondition of rule.parentConditions) {
            ctx.stack.evaluatedFeatures = new Set(evaluatedFeatures);
            const parentResult = evalFeature(parentCondition.id, ctx);
            if (parentResult.source === "cyclicPrerequisite") {
              return getFeatureResult(ctx, id, null, "cyclicPrerequisite");
            }
            const evalObj = {
              value: parentResult.value
            };
            const evaled = evalCondition(evalObj, parentCondition.condition || {});
            if (!evaled) {
              if (parentCondition.gate) {
                ctx.global.log("Feature blocked by prerequisite", {
                  id,
                  rule
                });
                return getFeatureResult(ctx, id, null, "prerequisite");
              }
              ctx.global.log("Skip rule because prerequisite evaluation fails", {
                id,
                rule
              });
              continue rules;
            }
          }
        }
        if (rule.filters && isFilteredOut(rule.filters, ctx)) {
          ctx.global.log("Skip rule because of filters", {
            id,
            rule
          });
          continue;
        }
        if ("force" in rule) {
          if (rule.condition && !conditionPasses(rule.condition, ctx)) {
            ctx.global.log("Skip rule because of condition ff", {
              id,
              rule
            });
            continue;
          }
          if (!isIncludedInRollout(ctx, rule.seed || id, rule.hashAttribute, ctx.user.saveStickyBucketAssignmentDoc && !rule.disableStickyBucketing ? rule.fallbackAttribute : undefined, rule.range, rule.coverage, rule.hashVersion)) {
            ctx.global.log("Skip rule because user not included in rollout", {
              id,
              rule
            });
            continue;
          }
          ctx.global.log("Force value from rule", {
            id,
            rule
          });
          if (rule.tracks) {
            rule.tracks.forEach((t) => {
              const calls = onExperimentViewed(ctx, t.experiment, t.result);
              if (!calls.length && ctx.global.saveDeferredTrack) {
                ctx.global.saveDeferredTrack({
                  experiment: t.experiment,
                  result: t.result
                });
              }
            });
          }
          return getFeatureResult(ctx, id, rule.force, "force", rule.id);
        }
        if (!rule.variations) {
          ctx.global.log("Skip invalid rule", {
            id,
            rule
          });
          continue;
        }
        const exp = {
          variations: rule.variations,
          key: rule.key || id
        };
        if ("coverage" in rule)
          exp.coverage = rule.coverage;
        if (rule.weights)
          exp.weights = rule.weights;
        if (rule.hashAttribute)
          exp.hashAttribute = rule.hashAttribute;
        if (rule.fallbackAttribute)
          exp.fallbackAttribute = rule.fallbackAttribute;
        if (rule.disableStickyBucketing)
          exp.disableStickyBucketing = rule.disableStickyBucketing;
        if (rule.bucketVersion !== undefined)
          exp.bucketVersion = rule.bucketVersion;
        if (rule.minBucketVersion !== undefined)
          exp.minBucketVersion = rule.minBucketVersion;
        if (rule.namespace)
          exp.namespace = rule.namespace;
        if (rule.meta)
          exp.meta = rule.meta;
        if (rule.ranges)
          exp.ranges = rule.ranges;
        if (rule.name)
          exp.name = rule.name;
        if (rule.phase)
          exp.phase = rule.phase;
        if (rule.seed)
          exp.seed = rule.seed;
        if (rule.hashVersion)
          exp.hashVersion = rule.hashVersion;
        if (rule.filters)
          exp.filters = rule.filters;
        if (rule.condition)
          exp.condition = rule.condition;
        const {
          result
        } = runExperiment(exp, id, ctx);
        ctx.global.onExperimentEval && ctx.global.onExperimentEval(exp, result);
        if (result.inExperiment && !result.passthrough) {
          return getFeatureResult(ctx, id, result.value, "experiment", rule.id, exp, result);
        }
      }
  }
  ctx.global.log("Use default value", {
    id,
    value: feature.defaultValue
  });
  return getFeatureResult(ctx, id, feature.defaultValue === undefined ? null : feature.defaultValue, "defaultValue");
}
function runExperiment(experiment, featureId, ctx) {
  const key = experiment.key;
  const numVariations = experiment.variations.length;
  if (numVariations < 2) {
    ctx.global.log("Invalid experiment", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  if (ctx.global.enabled === false || ctx.user.enabled === false) {
    ctx.global.log("Context disabled", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  experiment = mergeOverrides(experiment, ctx);
  if (experiment.urlPatterns && !isURLTargeted(ctx.user.url || "", experiment.urlPatterns)) {
    ctx.global.log("Skip because of url targeting", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  const qsOverride = getQueryStringOverride(key, ctx.user.url || "", numVariations);
  if (qsOverride !== null) {
    ctx.global.log("Force via querystring", {
      id: key,
      variation: qsOverride
    });
    return {
      result: getExperimentResult(ctx, experiment, qsOverride, false, featureId)
    };
  }
  const forcedVariations = getForcedVariations(ctx);
  if (key in forcedVariations) {
    const variation = forcedVariations[key];
    ctx.global.log("Force via dev tools", {
      id: key,
      variation
    });
    return {
      result: getExperimentResult(ctx, experiment, variation, false, featureId)
    };
  }
  if (experiment.status === "draft" || experiment.active === false) {
    ctx.global.log("Skip because inactive", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  const {
    hashAttribute,
    hashValue
  } = getHashAttribute(ctx, experiment.hashAttribute, ctx.user.saveStickyBucketAssignmentDoc && !experiment.disableStickyBucketing ? experiment.fallbackAttribute : undefined);
  if (!hashValue) {
    ctx.global.log("Skip because missing hashAttribute", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  let assigned = -1;
  let foundStickyBucket = false;
  let stickyBucketVersionIsBlocked = false;
  if (ctx.user.saveStickyBucketAssignmentDoc && !experiment.disableStickyBucketing) {
    const {
      variation,
      versionIsBlocked
    } = getStickyBucketVariation({
      ctx,
      expKey: experiment.key,
      expBucketVersion: experiment.bucketVersion,
      expHashAttribute: experiment.hashAttribute,
      expFallbackAttribute: experiment.fallbackAttribute,
      expMinBucketVersion: experiment.minBucketVersion,
      expMeta: experiment.meta
    });
    foundStickyBucket = variation >= 0;
    assigned = variation;
    stickyBucketVersionIsBlocked = !!versionIsBlocked;
  }
  if (!foundStickyBucket) {
    if (experiment.filters) {
      if (isFilteredOut(experiment.filters, ctx)) {
        ctx.global.log("Skip because of filters", {
          id: key
        });
        return {
          result: getExperimentResult(ctx, experiment, -1, false, featureId)
        };
      }
    } else if (experiment.namespace && !inNamespace(hashValue, experiment.namespace)) {
      ctx.global.log("Skip because of namespace", {
        id: key
      });
      return {
        result: getExperimentResult(ctx, experiment, -1, false, featureId)
      };
    }
    if (experiment.include && !isIncluded(experiment.include)) {
      ctx.global.log("Skip because of include function", {
        id: key
      });
      return {
        result: getExperimentResult(ctx, experiment, -1, false, featureId)
      };
    }
    if (experiment.condition && !conditionPasses(experiment.condition, ctx)) {
      ctx.global.log("Skip because of condition exp", {
        id: key
      });
      return {
        result: getExperimentResult(ctx, experiment, -1, false, featureId)
      };
    }
    if (experiment.parentConditions) {
      const evaluatedFeatures = new Set(ctx.stack.evaluatedFeatures);
      for (const parentCondition of experiment.parentConditions) {
        ctx.stack.evaluatedFeatures = new Set(evaluatedFeatures);
        const parentResult = evalFeature(parentCondition.id, ctx);
        if (parentResult.source === "cyclicPrerequisite") {
          return {
            result: getExperimentResult(ctx, experiment, -1, false, featureId)
          };
        }
        const evalObj = {
          value: parentResult.value
        };
        if (!evalCondition(evalObj, parentCondition.condition || {})) {
          ctx.global.log("Skip because prerequisite evaluation fails", {
            id: key
          });
          return {
            result: getExperimentResult(ctx, experiment, -1, false, featureId)
          };
        }
      }
    }
    if (experiment.groups && !hasGroupOverlap(experiment.groups, ctx)) {
      ctx.global.log("Skip because of groups", {
        id: key
      });
      return {
        result: getExperimentResult(ctx, experiment, -1, false, featureId)
      };
    }
  }
  if (experiment.url && !urlIsValid(experiment.url, ctx)) {
    ctx.global.log("Skip because of url", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  const n = hash(experiment.seed || key, hashValue, experiment.hashVersion || 1);
  if (n === null) {
    ctx.global.log("Skip because of invalid hash version", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  if (!foundStickyBucket) {
    const ranges = experiment.ranges || getBucketRanges(numVariations, experiment.coverage === undefined ? 1 : experiment.coverage, experiment.weights);
    assigned = chooseVariation(n, ranges);
  }
  if (stickyBucketVersionIsBlocked) {
    ctx.global.log("Skip because sticky bucket version is blocked", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId, undefined, true)
    };
  }
  if (assigned < 0) {
    ctx.global.log("Skip because of coverage", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  if ("force" in experiment) {
    ctx.global.log("Force variation", {
      id: key,
      variation: experiment.force
    });
    return {
      result: getExperimentResult(ctx, experiment, experiment.force === undefined ? -1 : experiment.force, false, featureId)
    };
  }
  if (ctx.global.qaMode || ctx.user.qaMode) {
    ctx.global.log("Skip because QA mode", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  if (experiment.status === "stopped") {
    ctx.global.log("Skip because stopped", {
      id: key
    });
    return {
      result: getExperimentResult(ctx, experiment, -1, false, featureId)
    };
  }
  const result = getExperimentResult(ctx, experiment, assigned, true, featureId, n, foundStickyBucket);
  if (ctx.user.saveStickyBucketAssignmentDoc && !experiment.disableStickyBucketing) {
    const {
      changed,
      key: attrKey,
      doc
    } = generateStickyBucketAssignmentDoc(ctx, hashAttribute, toString(hashValue), {
      [getStickyBucketExperimentKey(experiment.key, experiment.bucketVersion)]: result.key
    });
    if (changed) {
      ctx.user.stickyBucketAssignmentDocs = ctx.user.stickyBucketAssignmentDocs || {};
      ctx.user.stickyBucketAssignmentDocs[attrKey] = doc;
      ctx.user.saveStickyBucketAssignmentDoc(doc);
    }
  }
  const trackingCalls = onExperimentViewed(ctx, experiment, result);
  if (trackingCalls.length === 0 && ctx.global.saveDeferredTrack) {
    ctx.global.saveDeferredTrack({
      experiment,
      result
    });
  }
  const trackingCall = !trackingCalls.length ? undefined : trackingCalls.length === 1 ? trackingCalls[0] : Promise.all(trackingCalls).then(() => {});
  "changeId" in experiment && experiment.changeId && ctx.global.recordChangeId && ctx.global.recordChangeId(experiment.changeId);
  ctx.global.log("In experiment", {
    id: key,
    variation: result.variationId
  });
  return {
    result,
    trackingCall
  };
}
function getFeatureResult(ctx, key, value, source, ruleId, experiment, result) {
  const ret = {
    value,
    on: !!value,
    off: !value,
    source,
    ruleId: ruleId || ""
  };
  if (experiment)
    ret.experiment = experiment;
  if (result)
    ret.experimentResult = result;
  if (source !== "override") {
    onFeatureUsage(ctx, key, ret);
  }
  return ret;
}
function getAttributes(ctx) {
  return {
    ...ctx.user.attributes,
    ...ctx.user.attributeOverrides
  };
}
function conditionPasses(condition, ctx) {
  return evalCondition(getAttributes(ctx), condition, ctx.global.savedGroups || {});
}
function isFilteredOut(filters, ctx) {
  return filters.some((filter) => {
    const {
      hashValue
    } = getHashAttribute(ctx, filter.attribute);
    if (!hashValue)
      return true;
    const n = hash(filter.seed, hashValue, filter.hashVersion || 2);
    if (n === null)
      return true;
    return !filter.ranges.some((r) => inRange(n, r));
  });
}
function isIncludedInRollout(ctx, seed, hashAttribute, fallbackAttribute, range, coverage, hashVersion) {
  if (!range && coverage === undefined)
    return true;
  if (!range && coverage === 0)
    return false;
  const {
    hashValue
  } = getHashAttribute(ctx, hashAttribute, fallbackAttribute);
  if (!hashValue) {
    return false;
  }
  const n = hash(seed, hashValue, hashVersion || 1);
  if (n === null)
    return false;
  return range ? inRange(n, range) : coverage !== undefined ? n <= coverage : true;
}
function getExperimentResult(ctx, experiment, variationIndex, hashUsed, featureId, bucket, stickyBucketUsed) {
  let inExperiment = true;
  if (variationIndex < 0 || variationIndex >= experiment.variations.length) {
    variationIndex = 0;
    inExperiment = false;
  }
  const {
    hashAttribute,
    hashValue
  } = getHashAttribute(ctx, experiment.hashAttribute, ctx.user.saveStickyBucketAssignmentDoc && !experiment.disableStickyBucketing ? experiment.fallbackAttribute : undefined);
  const meta = experiment.meta ? experiment.meta[variationIndex] : {};
  const res = {
    key: meta.key || "" + variationIndex,
    featureId,
    inExperiment,
    hashUsed,
    variationId: variationIndex,
    value: experiment.variations[variationIndex],
    hashAttribute,
    hashValue,
    stickyBucketUsed: !!stickyBucketUsed
  };
  if (meta.name)
    res.name = meta.name;
  if (bucket !== undefined)
    res.bucket = bucket;
  if (meta.passthrough)
    res.passthrough = meta.passthrough;
  return res;
}
function mergeOverrides(experiment, ctx) {
  const key = experiment.key;
  const o = ctx.global.overrides;
  if (o && o[key]) {
    experiment = Object.assign({}, experiment, o[key]);
    if (typeof experiment.url === "string") {
      experiment.url = getUrlRegExp(experiment.url);
    }
  }
  return experiment;
}
function getHashAttribute(ctx, attr, fallback) {
  let hashAttribute = attr || "id";
  let hashValue = "";
  const attributes = getAttributes(ctx);
  if (attributes[hashAttribute]) {
    hashValue = attributes[hashAttribute];
  }
  if (!hashValue && fallback) {
    if (attributes[fallback]) {
      hashValue = attributes[fallback];
    }
    if (hashValue) {
      hashAttribute = fallback;
    }
  }
  return {
    hashAttribute,
    hashValue
  };
}
function urlIsValid(urlRegex, ctx) {
  const url = ctx.user.url;
  if (!url)
    return false;
  const pathOnly = url.replace(/^https?:\/\//, "").replace(/^[^/]*\//, "/");
  if (urlRegex.test(url))
    return true;
  if (urlRegex.test(pathOnly))
    return true;
  return false;
}
function hasGroupOverlap(expGroups, ctx) {
  const groups = ctx.global.groups || {};
  for (let i = 0;i < expGroups.length; i++) {
    if (groups[expGroups[i]])
      return true;
  }
  return false;
}
function getStickyBucketVariation({
  ctx,
  expKey,
  expBucketVersion,
  expHashAttribute,
  expFallbackAttribute,
  expMinBucketVersion,
  expMeta
}) {
  expBucketVersion = expBucketVersion || 0;
  expMinBucketVersion = expMinBucketVersion || 0;
  expHashAttribute = expHashAttribute || "id";
  expMeta = expMeta || [];
  const id = getStickyBucketExperimentKey(expKey, expBucketVersion);
  const assignments = getStickyBucketAssignments(ctx, expHashAttribute, expFallbackAttribute);
  if (expMinBucketVersion > 0) {
    for (let i = 0;i < expMinBucketVersion; i++) {
      const blockedKey = getStickyBucketExperimentKey(expKey, i);
      if (assignments[blockedKey] !== undefined) {
        return {
          variation: -1,
          versionIsBlocked: true
        };
      }
    }
  }
  const variationKey = assignments[id];
  if (variationKey === undefined)
    return {
      variation: -1
    };
  const variation = expMeta.findIndex((m) => m.key === variationKey);
  if (variation < 0)
    return {
      variation: -1
    };
  return {
    variation
  };
}
function getStickyBucketExperimentKey(experimentKey, experimentBucketVersion) {
  experimentBucketVersion = experimentBucketVersion || 0;
  return `${experimentKey}__${experimentBucketVersion}`;
}
function getStickyBucketAttributeKey(attributeName, attributeValue) {
  return `${attributeName}||${attributeValue}`;
}
function getStickyBucketAssignments(ctx, expHashAttribute, expFallbackAttribute) {
  if (!ctx.user.stickyBucketAssignmentDocs)
    return {};
  const {
    hashAttribute,
    hashValue
  } = getHashAttribute(ctx, expHashAttribute);
  const hashKey = getStickyBucketAttributeKey(hashAttribute, toString(hashValue));
  const {
    hashAttribute: fallbackAttribute,
    hashValue: fallbackValue
  } = getHashAttribute(ctx, expFallbackAttribute);
  const fallbackKey = fallbackValue ? getStickyBucketAttributeKey(fallbackAttribute, toString(fallbackValue)) : null;
  const assignments = {};
  if (fallbackKey && ctx.user.stickyBucketAssignmentDocs[fallbackKey]) {
    Object.assign(assignments, ctx.user.stickyBucketAssignmentDocs[fallbackKey].assignments || {});
  }
  if (ctx.user.stickyBucketAssignmentDocs[hashKey]) {
    Object.assign(assignments, ctx.user.stickyBucketAssignmentDocs[hashKey].assignments || {});
  }
  return assignments;
}
function generateStickyBucketAssignmentDoc(ctx, attributeName, attributeValue, assignments) {
  const key = getStickyBucketAttributeKey(attributeName, attributeValue);
  const existingAssignments = ctx.user.stickyBucketAssignmentDocs && ctx.user.stickyBucketAssignmentDocs[key] ? ctx.user.stickyBucketAssignmentDocs[key].assignments || {} : {};
  const newAssignments = {
    ...existingAssignments,
    ...assignments
  };
  const changed = JSON.stringify(existingAssignments) !== JSON.stringify(newAssignments);
  return {
    key,
    doc: {
      attributeName,
      attributeValue,
      assignments: newAssignments
    },
    changed
  };
}
function deriveStickyBucketIdentifierAttributes(ctx, data) {
  const attributes = new Set;
  const features = data && data.features ? data.features : ctx.global.features || {};
  const experiments = data && data.experiments ? data.experiments : ctx.global.experiments || [];
  Object.keys(features).forEach((id) => {
    const feature = features[id];
    if (feature.rules) {
      for (const rule of feature.rules) {
        if (rule.variations) {
          attributes.add(rule.hashAttribute || "id");
          if (rule.fallbackAttribute) {
            attributes.add(rule.fallbackAttribute);
          }
        }
      }
    }
  });
  experiments.map((experiment) => {
    attributes.add(experiment.hashAttribute || "id");
    if (experiment.fallbackAttribute) {
      attributes.add(experiment.fallbackAttribute);
    }
  });
  return Array.from(attributes);
}
async function getAllStickyBucketAssignmentDocs(ctx, stickyBucketService, data) {
  const attributes = getStickyBucketAttributes(ctx, data);
  return stickyBucketService.getAllAssignments(attributes);
}
function getStickyBucketAttributes(ctx, data) {
  const attributes = {};
  const stickyBucketIdentifierAttributes = deriveStickyBucketIdentifierAttributes(ctx, data);
  stickyBucketIdentifierAttributes.forEach((attr) => {
    const {
      hashValue
    } = getHashAttribute(ctx, attr);
    attributes[attr] = toString(hashValue);
  });
  return attributes;
}
async function decryptPayload(data, decryptionKey, subtle) {
  data = {
    ...data
  };
  if (data.encryptedFeatures) {
    try {
      data.features = JSON.parse(await decrypt(data.encryptedFeatures, decryptionKey, subtle));
    } catch (e) {
      console.error(e);
    }
    delete data.encryptedFeatures;
  }
  if (data.encryptedExperiments) {
    try {
      data.experiments = JSON.parse(await decrypt(data.encryptedExperiments, decryptionKey, subtle));
    } catch (e) {
      console.error(e);
    }
    delete data.encryptedExperiments;
  }
  if (data.encryptedSavedGroups) {
    try {
      data.savedGroups = JSON.parse(await decrypt(data.encryptedSavedGroups, decryptionKey, subtle));
    } catch (e) {
      console.error(e);
    }
    delete data.encryptedSavedGroups;
  }
  return data;
}
function getApiHosts(options) {
  const defaultHost = options.apiHost || "https://cdn.growthbook.io";
  return {
    apiHost: defaultHost.replace(/\/*$/, ""),
    streamingHost: (options.streamingHost || defaultHost).replace(/\/*$/, ""),
    apiRequestHeaders: options.apiHostRequestHeaders,
    streamingHostRequestHeaders: options.streamingHostRequestHeaders
  };
}
function getExperimentDedupeKey(experiment, result) {
  return result.hashAttribute + result.hashValue + experiment.key + result.variationId;
}
var EVENT_FEATURE_EVALUATED = "Feature Evaluated", EVENT_EXPERIMENT_VIEWED = "Experiment Viewed";
var init_core = __esm(() => {
  init_mongrule();
  init_util();
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/GrowthBook.mjs
class GrowthBook {
  constructor(options) {
    options = options || {};
    this.version = SDK_VERSION;
    this._options = this.context = options;
    this._renderer = options.renderer || null;
    this._trackedExperiments = new Set;
    this._completedChangeIds = new Set;
    this._trackedFeatures = {};
    this.debug = !!options.debug;
    this._subscriptions = new Set;
    this.ready = false;
    this._assigned = new Map;
    this._activeAutoExperiments = new Map;
    this._triggeredExpKeys = new Set;
    this._initialized = false;
    this._redirectedUrl = "";
    this._deferredTrackingCalls = new Map;
    this._autoExperimentsAllowed = !options.disableExperimentsOnLoad;
    this._destroyCallbacks = [];
    this.logs = [];
    this.log = this.log.bind(this);
    this._saveDeferredTrack = this._saveDeferredTrack.bind(this);
    this._onExperimentEval = this._onExperimentEval.bind(this);
    this._fireSubscriptions = this._fireSubscriptions.bind(this);
    this._recordChangedId = this._recordChangedId.bind(this);
    if (options.remoteEval) {
      if (options.decryptionKey) {
        throw new Error("Encryption is not available for remoteEval");
      }
      if (!options.clientKey) {
        throw new Error("Missing clientKey");
      }
      let isGbHost = false;
      try {
        isGbHost = !!new URL(options.apiHost || "").hostname.match(/growthbook\.io$/i);
      } catch (e) {}
      if (isGbHost) {
        throw new Error("Cannot use remoteEval on GrowthBook Cloud");
      }
    } else {
      if (options.cacheKeyAttributes) {
        throw new Error("cacheKeyAttributes are only used for remoteEval");
      }
    }
    if (options.stickyBucketService) {
      const s = options.stickyBucketService;
      this._saveStickyBucketAssignmentDoc = (doc) => {
        return s.saveAssignments(doc);
      };
    }
    if (options.plugins) {
      for (const plugin of options.plugins) {
        plugin(this);
      }
    }
    if (options.features) {
      this.ready = true;
    }
    if (isBrowser && options.enableDevMode) {
      window._growthbook = this;
      document.dispatchEvent(new Event("gbloaded"));
    }
    if (options.experiments) {
      this.ready = true;
      this._updateAllAutoExperiments();
    }
    if (this._options.stickyBucketService && this._options.stickyBucketAssignmentDocs) {
      for (const key in this._options.stickyBucketAssignmentDocs) {
        const doc = this._options.stickyBucketAssignmentDocs[key];
        if (doc) {
          this._options.stickyBucketService.saveAssignments(doc).catch(() => {});
        }
      }
    }
    if (this.ready) {
      this.refreshStickyBuckets(this.getPayload());
    }
  }
  async setPayload(payload) {
    this._payload = payload;
    const data = await decryptPayload(payload, this._options.decryptionKey);
    this._decryptedPayload = data;
    await this.refreshStickyBuckets(data);
    if (data.features) {
      this._options.features = data.features;
    }
    if (data.savedGroups) {
      this._options.savedGroups = data.savedGroups;
    }
    if (data.experiments) {
      this._options.experiments = data.experiments;
      this._updateAllAutoExperiments();
    }
    this.ready = true;
    this._render();
  }
  initSync(options) {
    this._initialized = true;
    const payload = options.payload;
    if (payload.encryptedExperiments || payload.encryptedFeatures) {
      throw new Error("initSync does not support encrypted payloads");
    }
    if (this._options.stickyBucketService && !this._options.stickyBucketAssignmentDocs) {
      this._options.stickyBucketAssignmentDocs = this.generateStickyBucketAssignmentDocsSync(this._options.stickyBucketService, payload);
    }
    this._payload = payload;
    this._decryptedPayload = payload;
    if (payload.features) {
      this._options.features = payload.features;
    }
    if (payload.experiments) {
      this._options.experiments = payload.experiments;
      this._updateAllAutoExperiments();
    }
    this.ready = true;
    startStreaming(this, options);
    return this;
  }
  async init(options) {
    this._initialized = true;
    options = options || {};
    if (options.cacheSettings) {
      configureCache(options.cacheSettings);
    }
    if (options.payload) {
      await this.setPayload(options.payload);
      startStreaming(this, options);
      return {
        success: true,
        source: "init"
      };
    } else {
      const {
        data,
        ...res
      } = await this._refresh({
        ...options,
        allowStale: true
      });
      startStreaming(this, options);
      await this.setPayload(data || {});
      return res;
    }
  }
  async loadFeatures(options) {
    options = options || {};
    await this.init({
      skipCache: options.skipCache,
      timeout: options.timeout,
      streaming: (this._options.backgroundSync ?? true) && (options.autoRefresh || this._options.subscribeToChanges)
    });
  }
  async refreshFeatures(options) {
    const res = await this._refresh({
      ...options || {},
      allowStale: false
    });
    if (res.data) {
      await this.setPayload(res.data);
    }
  }
  getApiInfo() {
    return [this.getApiHosts().apiHost, this.getClientKey()];
  }
  getApiHosts() {
    return getApiHosts(this._options);
  }
  getClientKey() {
    return this._options.clientKey || "";
  }
  getPayload() {
    return this._payload || {
      features: this.getFeatures(),
      experiments: this.getExperiments()
    };
  }
  getDecryptedPayload() {
    return this._decryptedPayload || this.getPayload();
  }
  isRemoteEval() {
    return this._options.remoteEval || false;
  }
  getCacheKeyAttributes() {
    return this._options.cacheKeyAttributes;
  }
  async _refresh({
    timeout,
    skipCache,
    allowStale,
    streaming
  }) {
    if (!this._options.clientKey) {
      throw new Error("Missing clientKey");
    }
    return refreshFeatures({
      instance: this,
      timeout,
      skipCache: skipCache || this._options.disableCache,
      allowStale,
      backgroundSync: streaming ?? this._options.backgroundSync ?? true
    });
  }
  _render() {
    if (this._renderer) {
      try {
        this._renderer();
      } catch (e) {
        console.error("Failed to render", e);
      }
    }
  }
  setFeatures(features) {
    this._options.features = features;
    this.ready = true;
    this._render();
  }
  async setEncryptedFeatures(encryptedString, decryptionKey, subtle) {
    const featuresJSON = await decrypt(encryptedString, decryptionKey || this._options.decryptionKey, subtle);
    this.setFeatures(JSON.parse(featuresJSON));
  }
  setExperiments(experiments) {
    this._options.experiments = experiments;
    this.ready = true;
    this._updateAllAutoExperiments();
  }
  async setEncryptedExperiments(encryptedString, decryptionKey, subtle) {
    const experimentsJSON = await decrypt(encryptedString, decryptionKey || this._options.decryptionKey, subtle);
    this.setExperiments(JSON.parse(experimentsJSON));
  }
  async setAttributes(attributes) {
    this._options.attributes = attributes;
    if (this._options.stickyBucketService) {
      await this.refreshStickyBuckets();
    }
    if (this._options.remoteEval) {
      await this._refreshForRemoteEval();
      return;
    }
    this._render();
    this._updateAllAutoExperiments();
  }
  async updateAttributes(attributes) {
    return this.setAttributes({
      ...this._options.attributes,
      ...attributes
    });
  }
  async setAttributeOverrides(overrides) {
    this._options.attributeOverrides = overrides;
    if (this._options.stickyBucketService) {
      await this.refreshStickyBuckets();
    }
    if (this._options.remoteEval) {
      await this._refreshForRemoteEval();
      return;
    }
    this._render();
    this._updateAllAutoExperiments();
  }
  async setForcedVariations(vars) {
    this._options.forcedVariations = vars || {};
    if (this._options.remoteEval) {
      await this._refreshForRemoteEval();
      return;
    }
    this._render();
    this._updateAllAutoExperiments();
  }
  setForcedFeatures(map) {
    this._options.forcedFeatureValues = map;
    this._render();
  }
  async setURL(url) {
    if (url === this._options.url)
      return;
    this._options.url = url;
    this._redirectedUrl = "";
    if (this._options.remoteEval) {
      await this._refreshForRemoteEval();
      this._updateAllAutoExperiments(true);
      return;
    }
    this._updateAllAutoExperiments(true);
  }
  getAttributes() {
    return {
      ...this._options.attributes,
      ...this._options.attributeOverrides
    };
  }
  getForcedVariations() {
    return this._options.forcedVariations || {};
  }
  getForcedFeatures() {
    return this._options.forcedFeatureValues || new Map;
  }
  getStickyBucketAssignmentDocs() {
    return this._options.stickyBucketAssignmentDocs || {};
  }
  getUrl() {
    return this._options.url || "";
  }
  getFeatures() {
    return this._options.features || {};
  }
  getExperiments() {
    return this._options.experiments || [];
  }
  getCompletedChangeIds() {
    return Array.from(this._completedChangeIds);
  }
  subscribe(cb) {
    this._subscriptions.add(cb);
    return () => {
      this._subscriptions.delete(cb);
    };
  }
  async _refreshForRemoteEval() {
    if (!this._options.remoteEval)
      return;
    if (!this._initialized)
      return;
    const res = await this._refresh({
      allowStale: false
    });
    if (res.data) {
      await this.setPayload(res.data);
    }
  }
  getAllResults() {
    return new Map(this._assigned);
  }
  onDestroy(cb) {
    this._destroyCallbacks.push(cb);
  }
  isDestroyed() {
    return !!this._destroyed;
  }
  destroy(options) {
    options = options || {};
    this._destroyed = true;
    this._destroyCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
    this._subscriptions.clear();
    this._assigned.clear();
    this._trackedExperiments.clear();
    this._completedChangeIds.clear();
    this._deferredTrackingCalls.clear();
    this._trackedFeatures = {};
    this._destroyCallbacks = [];
    this._payload = undefined;
    this._saveStickyBucketAssignmentDoc = undefined;
    unsubscribe(this);
    if (options.destroyAllStreams) {
      clearAutoRefresh();
    }
    this.logs = [];
    if (isBrowser && window._growthbook === this) {
      delete window._growthbook;
    }
    this._activeAutoExperiments.forEach((exp) => {
      exp.undo();
    });
    this._activeAutoExperiments.clear();
    this._triggeredExpKeys.clear();
  }
  setRenderer(renderer) {
    this._renderer = renderer;
  }
  forceVariation(key, variation) {
    this._options.forcedVariations = this._options.forcedVariations || {};
    this._options.forcedVariations[key] = variation;
    if (this._options.remoteEval) {
      this._refreshForRemoteEval();
      return;
    }
    this._updateAllAutoExperiments();
    this._render();
  }
  run(experiment) {
    const {
      result
    } = runExperiment(experiment, null, this._getEvalContext());
    this._onExperimentEval(experiment, result);
    return result;
  }
  triggerExperiment(key) {
    this._triggeredExpKeys.add(key);
    if (!this._options.experiments)
      return null;
    const experiments = this._options.experiments.filter((exp) => exp.key === key);
    return experiments.map((exp) => {
      return this._runAutoExperiment(exp);
    }).filter((res) => res !== null);
  }
  triggerAutoExperiments() {
    this._autoExperimentsAllowed = true;
    this._updateAllAutoExperiments(true);
  }
  _getEvalContext() {
    return {
      user: this._getUserContext(),
      global: this._getGlobalContext(),
      stack: {
        evaluatedFeatures: new Set
      }
    };
  }
  _getUserContext() {
    return {
      attributes: this._options.user ? {
        ...this._options.user,
        ...this._options.attributes
      } : this._options.attributes,
      enableDevMode: this._options.enableDevMode,
      blockedChangeIds: this._options.blockedChangeIds,
      stickyBucketAssignmentDocs: this._options.stickyBucketAssignmentDocs,
      url: this._getContextUrl(),
      forcedVariations: this._options.forcedVariations,
      forcedFeatureValues: this._options.forcedFeatureValues,
      attributeOverrides: this._options.attributeOverrides,
      saveStickyBucketAssignmentDoc: this._saveStickyBucketAssignmentDoc,
      trackingCallback: this._options.trackingCallback,
      onFeatureUsage: this._options.onFeatureUsage,
      devLogs: this.logs,
      trackedExperiments: this._trackedExperiments,
      trackedFeatureUsage: this._trackedFeatures
    };
  }
  _getGlobalContext() {
    return {
      features: this._options.features,
      experiments: this._options.experiments,
      log: this.log,
      enabled: this._options.enabled,
      qaMode: this._options.qaMode,
      savedGroups: this._options.savedGroups,
      groups: this._options.groups,
      overrides: this._options.overrides,
      onExperimentEval: this._onExperimentEval,
      recordChangeId: this._recordChangedId,
      saveDeferredTrack: this._saveDeferredTrack,
      eventLogger: this._options.eventLogger
    };
  }
  _runAutoExperiment(experiment, forceRerun) {
    const existing = this._activeAutoExperiments.get(experiment);
    if (experiment.manual && !this._triggeredExpKeys.has(experiment.key) && !existing)
      return null;
    const isBlocked = this._isAutoExperimentBlockedByContext(experiment);
    if (isBlocked) {
      this.log("Auto experiment blocked", {
        id: experiment.key
      });
    }
    let result;
    let trackingCall;
    if (isBlocked) {
      result = getExperimentResult(this._getEvalContext(), experiment, -1, false, "");
    } else {
      ({
        result,
        trackingCall
      } = runExperiment(experiment, null, this._getEvalContext()));
      this._onExperimentEval(experiment, result);
    }
    const valueHash = JSON.stringify(result.value);
    if (!forceRerun && result.inExperiment && existing && existing.valueHash === valueHash) {
      return result;
    }
    if (existing)
      this._undoActiveAutoExperiment(experiment);
    if (result.inExperiment) {
      const changeType = getAutoExperimentChangeType(experiment);
      if (changeType === "redirect" && result.value.urlRedirect && experiment.urlPatterns) {
        const url = experiment.persistQueryString ? mergeQueryStrings(this._getContextUrl(), result.value.urlRedirect) : result.value.urlRedirect;
        if (isURLTargeted(url, experiment.urlPatterns)) {
          this.log("Skipping redirect because original URL matches redirect URL", {
            id: experiment.key
          });
          return result;
        }
        this._redirectedUrl = url;
        const {
          navigate,
          delay
        } = this._getNavigateFunction();
        if (navigate) {
          if (isBrowser) {
            Promise.all([...trackingCall ? [promiseTimeout(trackingCall, this._options.maxNavigateDelay ?? 1000)] : [], new Promise((resolve) => window.setTimeout(resolve, this._options.navigateDelay ?? delay))]).then(() => {
              try {
                navigate(url);
              } catch (e) {
                console.error(e);
              }
            });
          } else {
            try {
              navigate(url);
            } catch (e) {
              console.error(e);
            }
          }
        }
      } else if (changeType === "visual") {
        const undo = this._options.applyDomChangesCallback ? this._options.applyDomChangesCallback(result.value) : this._applyDOMChanges(result.value);
        if (undo) {
          this._activeAutoExperiments.set(experiment, {
            undo,
            valueHash
          });
        }
      }
    }
    return result;
  }
  _undoActiveAutoExperiment(exp) {
    const data = this._activeAutoExperiments.get(exp);
    if (data) {
      data.undo();
      this._activeAutoExperiments.delete(exp);
    }
  }
  _updateAllAutoExperiments(forceRerun) {
    if (!this._autoExperimentsAllowed)
      return;
    const experiments = this._options.experiments || [];
    const keys = new Set(experiments);
    this._activeAutoExperiments.forEach((v, k) => {
      if (!keys.has(k)) {
        v.undo();
        this._activeAutoExperiments.delete(k);
      }
    });
    for (const exp of experiments) {
      const result = this._runAutoExperiment(exp, forceRerun);
      if (result && result.inExperiment && getAutoExperimentChangeType(exp) === "redirect") {
        break;
      }
    }
  }
  _onExperimentEval(experiment, result) {
    const prev = this._assigned.get(experiment.key);
    this._assigned.set(experiment.key, {
      experiment,
      result
    });
    if (this._subscriptions.size > 0) {
      this._fireSubscriptions(experiment, result, prev);
    }
  }
  _fireSubscriptions(experiment, result, prev) {
    if (!prev || prev.result.inExperiment !== result.inExperiment || prev.result.variationId !== result.variationId) {
      this._subscriptions.forEach((cb) => {
        try {
          cb(experiment, result);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
  _recordChangedId(id) {
    this._completedChangeIds.add(id);
  }
  isOn(key) {
    return this.evalFeature(key).on;
  }
  isOff(key) {
    return this.evalFeature(key).off;
  }
  getFeatureValue(key, defaultValue) {
    const value = this.evalFeature(key).value;
    return value === null ? defaultValue : value;
  }
  feature(id) {
    return this.evalFeature(id);
  }
  evalFeature(id) {
    return evalFeature(id, this._getEvalContext());
  }
  log(msg, ctx) {
    if (!this.debug)
      return;
    if (this._options.log)
      this._options.log(msg, ctx);
    else
      console.log(msg, ctx);
  }
  getDeferredTrackingCalls() {
    return Array.from(this._deferredTrackingCalls.values());
  }
  setDeferredTrackingCalls(calls) {
    this._deferredTrackingCalls = new Map(calls.filter((c) => c && c.experiment && c.result).map((c) => {
      return [getExperimentDedupeKey(c.experiment, c.result), c];
    }));
  }
  async fireDeferredTrackingCalls() {
    if (!this._options.trackingCallback)
      return;
    const promises = [];
    this._deferredTrackingCalls.forEach((call) => {
      if (!call || !call.experiment || !call.result) {
        console.error("Invalid deferred tracking call", {
          call
        });
      } else {
        promises.push(this._options.trackingCallback(call.experiment, call.result));
      }
    });
    this._deferredTrackingCalls.clear();
    await Promise.all(promises);
  }
  setTrackingCallback(callback) {
    this._options.trackingCallback = callback;
    this.fireDeferredTrackingCalls();
  }
  setFeatureUsageCallback(callback) {
    this._options.onFeatureUsage = callback;
  }
  setEventLogger(logger) {
    this._options.eventLogger = logger;
  }
  async logEvent(eventName, properties) {
    if (this._destroyed) {
      console.error("Cannot log event to destroyed GrowthBook instance");
      return;
    }
    if (this._options.enableDevMode) {
      this.logs.push({
        eventName,
        properties,
        timestamp: Date.now().toString(),
        logType: "event"
      });
    }
    if (this._options.eventLogger) {
      try {
        await this._options.eventLogger(eventName, properties || {}, this._getUserContext());
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error("No event logger configured");
    }
  }
  _saveDeferredTrack(data) {
    this._deferredTrackingCalls.set(getExperimentDedupeKey(data.experiment, data.result), data);
  }
  _getContextUrl() {
    return this._options.url || (isBrowser ? window.location.href : "");
  }
  _isAutoExperimentBlockedByContext(experiment) {
    const changeType = getAutoExperimentChangeType(experiment);
    if (changeType === "visual") {
      if (this._options.disableVisualExperiments)
        return true;
      if (this._options.disableJsInjection) {
        if (experiment.variations.some((v) => v.js)) {
          return true;
        }
      }
    } else if (changeType === "redirect") {
      if (this._options.disableUrlRedirectExperiments)
        return true;
      try {
        const current = new URL(this._getContextUrl());
        for (const v of experiment.variations) {
          if (!v || !v.urlRedirect)
            continue;
          const url = new URL(v.urlRedirect);
          if (this._options.disableCrossOriginUrlRedirectExperiments) {
            if (url.protocol !== current.protocol)
              return true;
            if (url.host !== current.host)
              return true;
          }
        }
      } catch (e) {
        this.log("Error parsing current or redirect URL", {
          id: experiment.key,
          error: e
        });
        return true;
      }
    } else {
      return true;
    }
    if (experiment.changeId && (this._options.blockedChangeIds || []).includes(experiment.changeId)) {
      return true;
    }
    return false;
  }
  getRedirectUrl() {
    return this._redirectedUrl;
  }
  _getNavigateFunction() {
    if (this._options.navigate) {
      return {
        navigate: this._options.navigate,
        delay: 0
      };
    } else if (isBrowser) {
      return {
        navigate: (url) => {
          window.location.replace(url);
        },
        delay: 100
      };
    }
    return {
      navigate: null,
      delay: 0
    };
  }
  _applyDOMChanges(changes) {
    if (!isBrowser)
      return;
    const undo = [];
    if (changes.css) {
      const s = document.createElement("style");
      s.innerHTML = changes.css;
      document.head.appendChild(s);
      undo.push(() => s.remove());
    }
    if (changes.js) {
      const script = document.createElement("script");
      script.innerHTML = changes.js;
      if (this._options.jsInjectionNonce) {
        script.nonce = this._options.jsInjectionNonce;
      }
      document.head.appendChild(script);
      undo.push(() => script.remove());
    }
    if (changes.domMutations) {
      changes.domMutations.forEach((mutation) => {
        undo.push(import_dom_mutator.default.declarative(mutation).revert);
      });
    }
    return () => {
      undo.forEach((fn) => fn());
    };
  }
  async refreshStickyBuckets(data) {
    if (this._options.stickyBucketService) {
      const ctx = this._getEvalContext();
      const docs = await getAllStickyBucketAssignmentDocs(ctx, this._options.stickyBucketService, data);
      this._options.stickyBucketAssignmentDocs = docs;
    }
  }
  generateStickyBucketAssignmentDocsSync(stickyBucketService, payload) {
    if (!("getAllAssignmentsSync" in stickyBucketService)) {
      console.error("generating StickyBucketAssignmentDocs docs requires StickyBucketServiceSync");
      return;
    }
    const ctx = this._getEvalContext();
    const attributes = getStickyBucketAttributes(ctx, payload);
    return stickyBucketService.getAllAssignmentsSync(attributes);
  }
  inDevMode() {
    return !!this._options.enableDevMode;
  }
}
var import_dom_mutator, isBrowser, SDK_VERSION;
var init_GrowthBook = __esm(() => {
  init_util();
  init_feature_repository();
  init_core();
  import_dom_mutator = __toESM(require_dist(), 1);
  isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  SDK_VERSION = loadSDKVersion();
});

// node_modules/.bun/@growthbook+growthbook@1.6.5/node_modules/@growthbook/growthbook/dist/esm/index.mjs
var init_esm = __esm(() => {
  init_GrowthBook();
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/isEqual.js
function isEqual(value, other) {
  return _baseIsEqual_default(value, other);
}
var isEqual_default;
var init_isEqual = __esm(() => {
  init__baseIsEqual();
  isEqual_default = isEqual;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/lodash.js
var init_lodash = __esm(() => {
  init_isEqual();
  init_memoize();
});

// src/constants/keys.ts
function getGrowthBookClientKey() {
  return process.env.USER_TYPE === "ant" ? isEnvTruthy(process.env.ENABLE_GROWTHBOOK_DEV) ? "sdk-yZQvlplybuXjYh6L" : "sdk-xRVcrliHIlrg4og4" : "sdk-zAZezfDKGoZuXXKe";
}
var init_keys = __esm(() => {
  init_envUtils();
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_baseSet.js
function baseSet(object, path, value, customizer) {
  if (!isObject_default(object)) {
    return object;
  }
  path = _castPath_default(path, object);
  var index = -1, length = path.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index < length) {
    var key = _toKey_default(path[index]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object;
    }
    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject_default(objValue) ? objValue : _isIndex_default(path[index + 1]) ? [] : {};
      }
    }
    _assignValue_default(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}
var _baseSet_default;
var init__baseSet = __esm(() => {
  init__assignValue();
  init__castPath();
  init__isIndex();
  init_isObject();
  init__toKey();
  _baseSet_default = baseSet;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/_basePickBy.js
function basePickBy(object, paths, predicate) {
  var index = -1, length = paths.length, result = {};
  while (++index < length) {
    var path = paths[index], value = _baseGet_default(object, path);
    if (predicate(value, path)) {
      _baseSet_default(result, _castPath_default(path, object), value);
    }
  }
  return result;
}
var _basePickBy_default;
var init__basePickBy = __esm(() => {
  init__baseGet();
  init__baseSet();
  init__castPath();
  _basePickBy_default = basePickBy;
});

// node_modules/.bun/lodash-es@4.18.1/node_modules/lodash-es/pickBy.js
function pickBy(object, predicate) {
  if (object == null) {
    return {};
  }
  var props = _arrayMap_default(_getAllKeysIn_default(object), function(prop) {
    return [prop];
  });
  predicate = _baseIteratee_default(predicate);
  return _basePickBy_default(object, props, function(value, path) {
    return predicate(value, path[0]);
  });
}
var pickBy_default;
var init_pickBy = __esm(() => {
  init__arrayMap();
  init__baseIteratee();
  init__basePickBy();
  init__getAllKeysIn();
  pickBy_default = pickBy;
});

// src/utils/platform.ts
import { readdir, readFile } from "fs/promises";
import { release as osRelease } from "os";
async function detectVcs(dir) {
  const detected = new Set;
  if (process.env.P4PORT) {
    detected.add("perforce");
  }
  try {
    const targetDir = dir ?? getFsImplementation().cwd();
    const entries = new Set(await readdir(targetDir));
    for (const [marker, vcs] of VCS_MARKERS) {
      if (entries.has(marker)) {
        detected.add(vcs);
      }
    }
  } catch {}
  return [...detected];
}
var getPlatform, getWslVersion, getLinuxDistroInfo, VCS_MARKERS;
var init_platform = __esm(() => {
  init_memoize();
  init_fsOperations();
  init_log();
  getPlatform = memoize_default(() => {
    try {
      if (process.platform === "darwin") {
        return "macos";
      }
      if (process.platform === "win32") {
        return "windows";
      }
      if (process.platform === "linux") {
        try {
          const procVersion = getFsImplementation().readFileSync("/proc/version", { encoding: "utf8" });
          if (procVersion.toLowerCase().includes("microsoft") || procVersion.toLowerCase().includes("wsl")) {
            return "wsl";
          }
        } catch (error) {
          logError(error);
        }
        return "linux";
      }
      return "unknown";
    } catch (error) {
      logError(error);
      return "unknown";
    }
  });
  getWslVersion = memoize_default(() => {
    if (process.platform !== "linux") {
      return;
    }
    try {
      const procVersion = getFsImplementation().readFileSync("/proc/version", {
        encoding: "utf8"
      });
      const wslVersionMatch = procVersion.match(/WSL(\d+)/i);
      if (wslVersionMatch && wslVersionMatch[1]) {
        return wslVersionMatch[1];
      }
      if (procVersion.toLowerCase().includes("microsoft")) {
        return "1";
      }
      return;
    } catch (error) {
      logError(error);
      return;
    }
  });
  getLinuxDistroInfo = memoize_default(async () => {
    if (process.platform !== "linux") {
      return;
    }
    const result = {
      linuxKernel: osRelease()
    };
    try {
      const content = await readFile("/etc/os-release", "utf8");
      for (const line of content.split(`
`)) {
        const match = line.match(/^(ID|VERSION_ID)=(.*)$/);
        if (match && match[1] && match[2]) {
          const value = match[2].replace(/^"|"$/g, "");
          if (match[1] === "ID") {
            result.linuxDistroId = value;
          } else {
            result.linuxDistroVersion = value;
          }
        }
      }
    } catch {}
    return result;
  });
  VCS_MARKERS = [
    [".git", "git"],
    [".hg", "mercurial"],
    [".svn", "svn"],
    [".p4config", "perforce"],
    ["$tf", "tfs"],
    [".tfvc", "tfs"],
    [".jj", "jujutsu"],
    [".sl", "sapling"]
  ];
});

// src/utils/windowsPaths.ts
import * as path from "path";
import * as pathWin32 from "path/win32";
function checkPathExists(path2) {
  try {
    execSync_DEPRECATED(`dir "${path2}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function findExecutable(executable) {
  if (executable === "git") {
    const defaultLocations = [
      "C:\\Program Files\\Git\\cmd\\git.exe",
      "C:\\Program Files (x86)\\Git\\cmd\\git.exe"
    ];
    for (const location of defaultLocations) {
      if (checkPathExists(location)) {
        return location;
      }
    }
  }
  try {
    const result = execSync_DEPRECATED(`where.exe ${executable}`, {
      stdio: "pipe",
      encoding: "utf8"
    }).trim();
    const paths = result.split(`\r
`).filter(Boolean);
    const cwd = getCwd().toLowerCase();
    for (const candidatePath of paths) {
      const normalizedPath = path.resolve(candidatePath).toLowerCase();
      const pathDir = path.dirname(normalizedPath).toLowerCase();
      if (pathDir === cwd || normalizedPath.startsWith(cwd + path.sep)) {
        logForDebugging(`Skipping potentially malicious executable in current directory: ${candidatePath}`);
        continue;
      }
      return candidatePath;
    }
    return null;
  } catch {
    return null;
  }
}
var findGitBashPath, windowsPathToPosixPath, posixPathToWindowsPath;
var init_windowsPaths = __esm(() => {
  init_memoize();
  init_cwd();
  init_debug();
  init_execSyncWrapper();
  init_memoize2();
  init_platform();
  findGitBashPath = memoize_default(() => {
    if (process.env.UR_CODE_GIT_BASH_PATH) {
      if (checkPathExists(process.env.UR_CODE_GIT_BASH_PATH)) {
        return process.env.UR_CODE_GIT_BASH_PATH;
      }
      console.error(`UR was unable to find UR_CODE_GIT_BASH_PATH path "${process.env.UR_CODE_GIT_BASH_PATH}"`);
      process.exit(1);
    }
    const gitPath = findExecutable("git");
    if (gitPath) {
      const bashPath = pathWin32.join(gitPath, "..", "..", "bin", "bash.exe");
      if (checkPathExists(bashPath)) {
        return bashPath;
      }
    }
    console.error("UR on Windows requires git-bash (https://git-scm.com/downloads/win). If installed but not in PATH, set environment variable pointing to your bash.exe, similar to: UR_CODE_GIT_BASH_PATH=C:\\Program Files\\Git\\bin\\bash.exe");
    process.exit(1);
  });
  windowsPathToPosixPath = memoizeWithLRU((windowsPath) => {
    if (windowsPath.startsWith("\\\\")) {
      return windowsPath.replace(/\\/g, "/");
    }
    const match = windowsPath.match(/^([A-Za-z]):[/\\]/);
    if (match) {
      const driveLetter = match[1].toLowerCase();
      return "/" + driveLetter + windowsPath.slice(2).replace(/\\/g, "/");
    }
    return windowsPath.replace(/\\/g, "/");
  }, (p) => p, 500);
  posixPathToWindowsPath = memoizeWithLRU((posixPath) => {
    if (posixPath.startsWith("//")) {
      return posixPath.replace(/\//g, "\\");
    }
    const cygdriveMatch = posixPath.match(/^\/cygdrive\/([A-Za-z])(\/|$)/);
    if (cygdriveMatch) {
      const driveLetter = cygdriveMatch[1].toUpperCase();
      const rest = posixPath.slice(("/cygdrive/" + cygdriveMatch[1]).length);
      return driveLetter + ":" + (rest || "\\").replace(/\//g, "\\");
    }
    const driveMatch = posixPath.match(/^\/([A-Za-z])(\/|$)/);
    if (driveMatch) {
      const driveLetter = driveMatch[1].toUpperCase();
      const rest = posixPath.slice(2);
      return driveLetter + ":" + (rest || "\\").replace(/\//g, "\\");
    }
    return posixPath.replace(/\//g, "\\");
  }, (p) => p, 500);
});

// src/utils/getWorktreePathsPortable.ts
import { execFile as execFileCb } from "child_process";
import { promisify } from "util";
var execFileAsync;
var init_getWorktreePathsPortable = __esm(() => {
  execFileAsync = promisify(execFileCb);
});

// src/utils/sessionStoragePortable.ts
import { open as fsOpen, readdir as readdir2, realpath, stat } from "fs/promises";
function unescapeJsonString(raw) {
  if (!raw.includes("\\"))
    return raw;
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw;
  }
}
function extractJsonStringField(text, key) {
  const patterns = [`"${key}":"`, `"${key}": "`];
  for (const pattern of patterns) {
    const idx = text.indexOf(pattern);
    if (idx < 0)
      continue;
    const valueStart = idx + pattern.length;
    let i = valueStart;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i] === '"') {
        return unescapeJsonString(text.slice(valueStart, i));
      }
      i++;
    }
  }
  return;
}
function extractLastJsonStringField(text, key) {
  const patterns = [`"${key}":"`, `"${key}": "`];
  let lastValue;
  for (const pattern of patterns) {
    let searchFrom = 0;
    while (true) {
      const idx = text.indexOf(pattern, searchFrom);
      if (idx < 0)
        break;
      const valueStart = idx + pattern.length;
      let i = valueStart;
      while (i < text.length) {
        if (text[i] === "\\") {
          i += 2;
          continue;
        }
        if (text[i] === '"') {
          lastValue = unescapeJsonString(text.slice(valueStart, i));
          break;
        }
        i++;
      }
      searchFrom = i + 1;
    }
  }
  return lastValue;
}
async function readHeadAndTail(filePath, fileSize, buf) {
  try {
    const fh = await fsOpen(filePath, "r");
    try {
      const headResult = await fh.read(buf, 0, LITE_READ_BUF_SIZE, 0);
      if (headResult.bytesRead === 0)
        return { head: "", tail: "" };
      const head = buf.toString("utf8", 0, headResult.bytesRead);
      const tailOffset = Math.max(0, fileSize - LITE_READ_BUF_SIZE);
      let tail = head;
      if (tailOffset > 0) {
        const tailResult = await fh.read(buf, 0, LITE_READ_BUF_SIZE, tailOffset);
        tail = buf.toString("utf8", 0, tailResult.bytesRead);
      }
      return { head, tail };
    } finally {
      await fh.close();
    }
  } catch {
    return { head: "", tail: "" };
  }
}
function simpleHash(str) {
  return Math.abs(djb2Hash(str)).toString(36);
}
function sanitizePath(name) {
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, "-");
  if (sanitized.length <= MAX_SANITIZED_LENGTH) {
    return sanitized;
  }
  const hash2 = typeof Bun !== "undefined" ? Bun.hash(name).toString(36) : simpleHash(name);
  return `${sanitized.slice(0, MAX_SANITIZED_LENGTH)}-${hash2}`;
}
function compactBoundaryMarker() {
  return _compactBoundaryMarker ??= Buffer.from('"compact_boundary"');
}
function parseBoundaryLine(line) {
  try {
    const parsed = JSON.parse(line);
    if (parsed.type !== "system" || parsed.subtype !== "compact_boundary") {
      return null;
    }
    return {
      hasPreservedSegment: Boolean(parsed.compactMetadata?.preservedSegment)
    };
  } catch {
    return null;
  }
}
function sinkWrite(s, src, start, end) {
  const n = end - start;
  if (n <= 0)
    return;
  if (s.len + n > s.buf.length) {
    const grown = Buffer.allocUnsafe(Math.min(Math.max(s.buf.length * 2, s.len + n), s.cap));
    s.buf.copy(grown, 0, 0, s.len);
    s.buf = grown;
  }
  src.copy(s.buf, s.len, start, end);
  s.len += n;
}
function hasPrefix(src, prefix, at, end) {
  return end - at >= prefix.length && src.compare(prefix, 0, prefix.length, at, at + prefix.length) === 0;
}
function processStraddle(s, chunk, bytesRead) {
  s.straddleSnapCarryLen = 0;
  s.straddleSnapTailEnd = 0;
  if (s.carryLen === 0)
    return 0;
  const cb = s.carryBuf;
  const firstNl = chunk.indexOf(LF);
  if (firstNl === -1 || firstNl >= bytesRead)
    return 0;
  const tailEnd = firstNl + 1;
  if (hasPrefix(cb, ATTR_SNAP_PREFIX, 0, s.carryLen)) {
    s.straddleSnapCarryLen = s.carryLen;
    s.straddleSnapTailEnd = tailEnd;
    s.lastSnapSrc = null;
  } else if (s.carryLen < ATTR_SNAP_PREFIX.length) {
    return 0;
  } else {
    if (hasPrefix(cb, SYSTEM_PREFIX, 0, s.carryLen)) {
      const hit = parseBoundaryLine(cb.toString("utf-8", 0, s.carryLen) + chunk.toString("utf-8", 0, firstNl));
      if (hit?.hasPreservedSegment) {
        s.hasPreservedSegment = true;
      } else if (hit) {
        s.out.len = 0;
        s.boundaryStartOffset = s.bufFileOff;
        s.hasPreservedSegment = false;
        s.lastSnapSrc = null;
      }
    }
    sinkWrite(s.out, cb, 0, s.carryLen);
    sinkWrite(s.out, chunk, 0, tailEnd);
  }
  s.bufFileOff += s.carryLen + tailEnd;
  s.carryLen = 0;
  return tailEnd;
}
function scanChunkLines(s, buf, boundaryMarker) {
  let boundaryAt = buf.indexOf(boundaryMarker);
  let runStart = 0;
  let lineStart = 0;
  let lastSnapStart = -1;
  let lastSnapEnd = -1;
  let nl = buf.indexOf(LF);
  while (nl !== -1) {
    const lineEnd = nl + 1;
    if (boundaryAt !== -1 && boundaryAt < lineStart) {
      boundaryAt = buf.indexOf(boundaryMarker, lineStart);
    }
    if (hasPrefix(buf, ATTR_SNAP_PREFIX, lineStart, lineEnd)) {
      sinkWrite(s.out, buf, runStart, lineStart);
      lastSnapStart = lineStart;
      lastSnapEnd = lineEnd;
      runStart = lineEnd;
    } else if (boundaryAt >= lineStart && boundaryAt < Math.min(lineStart + BOUNDARY_SEARCH_BOUND, lineEnd)) {
      const hit = parseBoundaryLine(buf.toString("utf-8", lineStart, nl));
      if (hit?.hasPreservedSegment) {
        s.hasPreservedSegment = true;
      } else if (hit) {
        s.out.len = 0;
        s.boundaryStartOffset = s.bufFileOff + lineStart;
        s.hasPreservedSegment = false;
        s.lastSnapSrc = null;
        lastSnapStart = -1;
        s.straddleSnapCarryLen = 0;
        runStart = lineStart;
      }
      boundaryAt = buf.indexOf(boundaryMarker, boundaryAt + boundaryMarker.length);
    }
    lineStart = lineEnd;
    nl = buf.indexOf(LF, lineStart);
  }
  sinkWrite(s.out, buf, runStart, lineStart);
  return { lastSnapStart, lastSnapEnd, trailStart: lineStart };
}
function captureSnap(s, buf, chunk, lastSnapStart, lastSnapEnd) {
  if (lastSnapStart !== -1) {
    s.lastSnapLen = lastSnapEnd - lastSnapStart;
    if (s.lastSnapBuf === undefined || s.lastSnapLen > s.lastSnapBuf.length) {
      s.lastSnapBuf = Buffer.allocUnsafe(s.lastSnapLen);
    }
    buf.copy(s.lastSnapBuf, 0, lastSnapStart, lastSnapEnd);
    s.lastSnapSrc = s.lastSnapBuf;
  } else if (s.straddleSnapCarryLen > 0) {
    s.lastSnapLen = s.straddleSnapCarryLen + s.straddleSnapTailEnd;
    if (s.lastSnapBuf === undefined || s.lastSnapLen > s.lastSnapBuf.length) {
      s.lastSnapBuf = Buffer.allocUnsafe(s.lastSnapLen);
    }
    s.carryBuf.copy(s.lastSnapBuf, 0, 0, s.straddleSnapCarryLen);
    chunk.copy(s.lastSnapBuf, s.straddleSnapCarryLen, 0, s.straddleSnapTailEnd);
    s.lastSnapSrc = s.lastSnapBuf;
  }
}
function captureCarry(s, buf, trailStart) {
  s.carryLen = buf.length - trailStart;
  if (s.carryLen > 0) {
    if (s.carryBuf === undefined || s.carryLen > s.carryBuf.length) {
      s.carryBuf = Buffer.allocUnsafe(s.carryLen);
    }
    buf.copy(s.carryBuf, 0, trailStart, buf.length);
  }
}
function finalizeOutput(s) {
  if (s.carryLen > 0) {
    const cb = s.carryBuf;
    if (hasPrefix(cb, ATTR_SNAP_PREFIX, 0, s.carryLen)) {
      s.lastSnapSrc = cb;
      s.lastSnapLen = s.carryLen;
    } else {
      sinkWrite(s.out, cb, 0, s.carryLen);
    }
  }
  if (s.lastSnapSrc) {
    if (s.out.len > 0 && s.out.buf[s.out.len - 1] !== LF) {
      sinkWrite(s.out, LF_BYTE, 0, 1);
    }
    sinkWrite(s.out, s.lastSnapSrc, 0, s.lastSnapLen);
  }
}
async function readTranscriptForLoad(filePath, fileSize) {
  const boundaryMarker = compactBoundaryMarker();
  const CHUNK_SIZE = TRANSCRIPT_READ_CHUNK_SIZE;
  const s = {
    out: {
      buf: Buffer.allocUnsafe(Math.min(fileSize, 8 * 1024 * 1024)),
      len: 0,
      cap: fileSize + 1
    },
    boundaryStartOffset: 0,
    hasPreservedSegment: false,
    lastSnapSrc: null,
    lastSnapLen: 0,
    lastSnapBuf: undefined,
    bufFileOff: 0,
    carryLen: 0,
    carryBuf: undefined,
    straddleSnapCarryLen: 0,
    straddleSnapTailEnd: 0
  };
  const chunk = Buffer.allocUnsafe(CHUNK_SIZE);
  const fd = await fsOpen(filePath, "r");
  try {
    let filePos = 0;
    while (filePos < fileSize) {
      const { bytesRead } = await fd.read(chunk, 0, Math.min(CHUNK_SIZE, fileSize - filePos), filePos);
      if (bytesRead === 0)
        break;
      filePos += bytesRead;
      const chunkOff = processStraddle(s, chunk, bytesRead);
      let buf;
      if (s.carryLen > 0) {
        const bufLen = s.carryLen + (bytesRead - chunkOff);
        buf = Buffer.allocUnsafe(bufLen);
        s.carryBuf.copy(buf, 0, 0, s.carryLen);
        chunk.copy(buf, s.carryLen, chunkOff, bytesRead);
      } else {
        buf = chunk.subarray(chunkOff, bytesRead);
      }
      const r = scanChunkLines(s, buf, boundaryMarker);
      captureSnap(s, buf, chunk, r.lastSnapStart, r.lastSnapEnd);
      captureCarry(s, buf, r.trailStart);
      s.bufFileOff += r.trailStart;
    }
    finalizeOutput(s);
  } finally {
    await fd.close();
  }
  return {
    boundaryStartOffset: s.boundaryStartOffset,
    postBoundaryBuf: s.out.buf.subarray(0, s.out.len),
    hasPreservedSegment: s.hasPreservedSegment
  };
}
var LITE_READ_BUF_SIZE = 65536, MAX_SANITIZED_LENGTH = 200, TRANSCRIPT_READ_CHUNK_SIZE, SKIP_PRECOMPACT_THRESHOLD, _compactBoundaryMarker, ATTR_SNAP_PREFIX, SYSTEM_PREFIX, LF = 10, LF_BYTE, BOUNDARY_SEARCH_BOUND = 256;
var init_sessionStoragePortable = __esm(() => {
  init_envUtils();
  init_getWorktreePathsPortable();
  init_hash();
  TRANSCRIPT_READ_CHUNK_SIZE = 1024 * 1024;
  SKIP_PRECOMPACT_THRESHOLD = 5 * 1024 * 1024;
  ATTR_SNAP_PREFIX = Buffer.from('{"type":"attribution-snapshot"');
  SYSTEM_PREFIX = Buffer.from('{"type":"system"');
  LF_BYTE = Buffer.from([LF]);
});

// src/utils/path.ts
import { homedir } from "os";
import { dirname as dirname2, isAbsolute, join as join3, normalize, relative, resolve as resolve2 } from "path";
function expandPath(path2, baseDir) {
  const actualBaseDir = baseDir ?? getCwd() ?? getFsImplementation().cwd();
  if (typeof path2 !== "string") {
    throw new TypeError(`Path must be a string, received ${typeof path2}`);
  }
  if (typeof actualBaseDir !== "string") {
    throw new TypeError(`Base directory must be a string, received ${typeof actualBaseDir}`);
  }
  if (path2.includes("\x00") || actualBaseDir.includes("\x00")) {
    throw new Error("Path contains null bytes");
  }
  const trimmedPath = path2.trim();
  if (!trimmedPath) {
    return normalize(actualBaseDir).normalize("NFC");
  }
  if (trimmedPath === "~") {
    return homedir().normalize("NFC");
  }
  if (trimmedPath.startsWith("~/")) {
    return join3(homedir(), trimmedPath.slice(2)).normalize("NFC");
  }
  let processedPath = trimmedPath;
  if (getPlatform() === "windows" && trimmedPath.match(/^\/[a-z]\//i)) {
    try {
      processedPath = posixPathToWindowsPath(trimmedPath);
    } catch {
      processedPath = trimmedPath;
    }
  }
  if (isAbsolute(processedPath)) {
    return normalize(processedPath).normalize("NFC");
  }
  return resolve2(actualBaseDir, processedPath).normalize("NFC");
}
function toRelativePath(absolutePath) {
  const relativePath = relative(getCwd(), absolutePath);
  return relativePath.startsWith("..") ? absolutePath : relativePath;
}
function getDirectoryForPath(path2) {
  const absolutePath = expandPath(path2);
  if (absolutePath.startsWith("\\\\") || absolutePath.startsWith("//")) {
    return dirname2(absolutePath);
  }
  try {
    const stats = getFsImplementation().statSync(absolutePath);
    if (stats.isDirectory()) {
      return absolutePath;
    }
  } catch {}
  return dirname2(absolutePath);
}
function containsPathTraversal(path2) {
  return /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(path2);
}
function normalizePathForConfigKey(path2) {
  const normalized = normalize(path2);
  return normalized.replace(/\\/g, "/");
}
var init_path = __esm(() => {
  init_cwd();
  init_fsOperations();
  init_platform();
  init_windowsPaths();
  init_sessionStoragePortable();
});

// src/memdir/paths.ts
import { homedir as homedir2 } from "os";
import { isAbsolute as isAbsolute2, join as join4, normalize as normalize2, sep as sep2 } from "path";
function isAutoMemoryEnabled() {
  const envVal = process.env.UR_CODE_DISABLE_AUTO_MEMORY;
  if (isEnvTruthy(envVal)) {
    return false;
  }
  if (isEnvDefinedFalsy(envVal)) {
    return true;
  }
  if (isEnvTruthy(process.env.UR_CODE_SIMPLE)) {
    return false;
  }
  if (isEnvTruthy(process.env.UR_CODE_REMOTE) && !process.env.UR_CODE_REMOTE_MEMORY_DIR) {
    return false;
  }
  const settings = getInitialSettings();
  if (settings.autoMemoryEnabled !== undefined) {
    return settings.autoMemoryEnabled;
  }
  return true;
}
function getMemoryBaseDir() {
  if (process.env.UR_CODE_REMOTE_MEMORY_DIR) {
    return process.env.UR_CODE_REMOTE_MEMORY_DIR;
  }
  return getURConfigHomeDir();
}
function validateMemoryPath(raw, expandTilde) {
  if (!raw) {
    return;
  }
  let candidate = raw;
  if (expandTilde && (candidate.startsWith("~/") || candidate.startsWith("~\\"))) {
    const rest = candidate.slice(2);
    const restNorm = normalize2(rest || ".");
    if (restNorm === "." || restNorm === "..") {
      return;
    }
    candidate = join4(homedir2(), rest);
  }
  const normalized = normalize2(candidate).replace(/[/\\]+$/, "");
  if (!isAbsolute2(normalized) || normalized.length < 3 || /^[A-Za-z]:$/.test(normalized) || normalized.startsWith("\\\\") || normalized.startsWith("//") || normalized.includes("\x00")) {
    return;
  }
  return (normalized + sep2).normalize("NFC");
}
function getAutoMemPathOverride() {
  return validateMemoryPath(process.env.UR_COWORK_MEMORY_PATH_OVERRIDE, false);
}
function getAutoMemPathSetting() {
  const dir = getSettingsForSource("policySettings")?.autoMemoryDirectory ?? getSettingsForSource("flagSettings")?.autoMemoryDirectory ?? getSettingsForSource("localSettings")?.autoMemoryDirectory ?? getSettingsForSource("userSettings")?.autoMemoryDirectory;
  return validateMemoryPath(dir, true);
}
function hasAutoMemPathOverride() {
  return getAutoMemPathOverride() !== undefined;
}
function getAutoMemBase() {
  return findCanonicalGitRoot(getProjectRoot()) ?? getProjectRoot();
}
function getAutoMemEntrypoint() {
  return join4(getAutoMemPath(), AUTO_MEM_ENTRYPOINT_NAME);
}
function isAutoMemPath(absolutePath) {
  const normalizedPath = normalize2(absolutePath);
  return normalizedPath.startsWith(getAutoMemPath());
}
var AUTO_MEM_DIRNAME = "memory", AUTO_MEM_ENTRYPOINT_NAME = "MEMORY.md", getAutoMemPath;
var init_paths = __esm(() => {
  init_memoize();
  init_state();
  init_growthbook();
  init_envUtils();
  init_git();
  init_path();
  init_settings2();
  getAutoMemPath = memoize_default(() => {
    const override = getAutoMemPathOverride() ?? getAutoMemPathSetting();
    if (override) {
      return override;
    }
    const projectsDir = join4(getMemoryBaseDir(), "projects");
    return (join4(projectsDir, sanitizePath(getAutoMemBase()), AUTO_MEM_DIRNAME) + sep2).normalize("NFC");
  }, () => getProjectRoot());
});

// src/utils/bundledMode.ts
function isRunningWithBun() {
  return process.versions.bun !== undefined;
}
function isInBundledMode() {
  return typeof Bun !== "undefined" && Array.isArray(Bun.embeddedFiles) && Bun.embeddedFiles.length > 0;
}
var init_bundledMode = () => {};

// src/utils/findExecutable.ts
function findExecutable2(exe, args) {
  const resolved = whichSync(exe);
  return { cmd: resolved ?? exe, args };
}
var init_findExecutable = __esm(() => {
  init_which();
});

// src/utils/env.ts
import { homedir as homedir3 } from "os";
import { join as join5 } from "path";
async function isCommandAvailable(command) {
  try {
    return !!await which(command);
  } catch {
    return false;
  }
}
function isConductor() {
  return process.env.__CFBundleIdentifier === "com.conductor.app";
}
function detectTerminal() {
  if (process.env.CURSOR_TRACE_ID)
    return "cursor";
  if (process.env.VSCODE_GIT_ASKPASS_MAIN?.includes("cursor")) {
    return "cursor";
  }
  if (process.env.VSCODE_GIT_ASKPASS_MAIN?.includes("windsurf")) {
    return "windsurf";
  }
  if (process.env.VSCODE_GIT_ASKPASS_MAIN?.includes("antigravity")) {
    return "antigravity";
  }
  const bundleId = process.env.__CFBundleIdentifier?.toLowerCase();
  if (bundleId?.includes("vscodium"))
    return "codium";
  if (bundleId?.includes("windsurf"))
    return "windsurf";
  if (bundleId?.includes("com.google.android.studio"))
    return "androidstudio";
  if (bundleId) {
    for (const ide of JETBRAINS_IDES) {
      if (bundleId.includes(ide))
        return ide;
    }
  }
  if (process.env.VisualStudioVersion) {
    return "visualstudio";
  }
  if (process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm") {
    if (process.platform === "darwin")
      return "pycharm";
    return "pycharm";
  }
  if (process.env.TERM === "xterm-ghostty") {
    return "ghostty";
  }
  if (process.env.TERM?.includes("kitty")) {
    return "kitty";
  }
  if (process.env.TERM_PROGRAM) {
    return process.env.TERM_PROGRAM;
  }
  if (process.env.TMUX)
    return "tmux";
  if (process.env.STY)
    return "screen";
  if (process.env.KONSOLE_VERSION)
    return "konsole";
  if (process.env.GNOME_TERMINAL_SERVICE)
    return "gnome-terminal";
  if (process.env.XTERM_VERSION)
    return "xterm";
  if (process.env.VTE_VERSION)
    return "vte-based";
  if (process.env.TERMINATOR_UUID)
    return "terminator";
  if (process.env.KITTY_WINDOW_ID) {
    return "kitty";
  }
  if (process.env.ALACRITTY_LOG)
    return "alacritty";
  if (process.env.TILIX_ID)
    return "tilix";
  if (process.env.WT_SESSION)
    return "windows-terminal";
  if (process.env.SESSIONNAME && process.env.TERM === "cygwin")
    return "cygwin";
  if (process.env.MSYSTEM)
    return process.env.MSYSTEM.toLowerCase();
  if (process.env.ConEmuANSI || process.env.ConEmuPID || process.env.ConEmuTask) {
    return "conemu";
  }
  if (process.env.WSL_DISTRO_NAME)
    return `wsl-${process.env.WSL_DISTRO_NAME}`;
  if (isSSHSession()) {
    return "ssh-session";
  }
  if (process.env.TERM) {
    const term = process.env.TERM;
    if (term.includes("alacritty"))
      return "alacritty";
    if (term.includes("rxvt"))
      return "rxvt";
    if (term.includes("termite"))
      return "termite";
    return process.env.TERM;
  }
  if (!process.stdout.isTTY)
    return "non-interactive";
  return null;
}
function isSSHSession() {
  return !!(process.env.SSH_CONNECTION || process.env.SSH_CLIENT || process.env.SSH_TTY);
}
function getHostPlatformForAnalytics() {
  const override = process.env.UR_CODE_HOST_PLATFORM;
  if (override === "win32" || override === "darwin" || override === "linux") {
    return override;
  }
  return env.platform;
}
var getGlobalURFile, hasInternetAccess, detectPackageManagers, detectRuntimes, isWslEnvironment, isNpmFromWindowsPath, JETBRAINS_IDES, detectDeploymentEnvironment, env;
var init_env = __esm(() => {
  init_memoize();
  init_oauth();
  init_bundledMode();
  init_envUtils();
  init_findExecutable();
  init_fsOperations();
  init_which();
  getGlobalURFile = memoize_default(() => {
    if (getFsImplementation().existsSync(join5(getURConfigHomeDir(), ".config.json"))) {
      return join5(getURConfigHomeDir(), ".config.json");
    }
    const filename = `.ur${fileSuffixForOauthConfig()}.json`;
    return join5(process.env.UR_CONFIG_DIR || homedir3(), filename);
  });
  hasInternetAccess = memoize_default(async () => {
    try {
      const { default: axiosClient } = await import("./index-ks0fhmg8.js");
      await axiosClient.head("http://1.1.1.1", {
        signal: AbortSignal.timeout(1000)
      });
      return true;
    } catch {
      return false;
    }
  });
  detectPackageManagers = memoize_default(async () => {
    const packageManagers = [];
    if (await isCommandAvailable("npm"))
      packageManagers.push("npm");
    if (await isCommandAvailable("yarn"))
      packageManagers.push("yarn");
    if (await isCommandAvailable("pnpm"))
      packageManagers.push("pnpm");
    return packageManagers;
  });
  detectRuntimes = memoize_default(async () => {
    const runtimes = [];
    if (await isCommandAvailable("bun"))
      runtimes.push("bun");
    if (await isCommandAvailable("deno"))
      runtimes.push("deno");
    if (await isCommandAvailable("node"))
      runtimes.push("node");
    return runtimes;
  });
  isWslEnvironment = memoize_default(() => {
    try {
      return getFsImplementation().existsSync("/proc/sys/fs/binfmt_misc/WSLInterop");
    } catch (_error) {
      return false;
    }
  });
  isNpmFromWindowsPath = memoize_default(() => {
    try {
      if (!isWslEnvironment()) {
        return false;
      }
      const { cmd } = findExecutable2("npm", []);
      return cmd.startsWith("/mnt/c/");
    } catch (_error) {
      return false;
    }
  });
  JETBRAINS_IDES = [
    "pycharm",
    "intellij",
    "webstorm",
    "phpstorm",
    "rubymine",
    "clion",
    "goland",
    "rider",
    "datagrip",
    "appcode",
    "dataspell",
    "aqua",
    "gateway",
    "fleet",
    "jetbrains",
    "androidstudio"
  ];
  detectDeploymentEnvironment = memoize_default(() => {
    if (isEnvTruthy(process.env.CODESPACES))
      return "codespaces";
    if (process.env.GITPOD_WORKSPACE_ID)
      return "gitpod";
    if (process.env.REPL_ID || process.env.REPL_SLUG)
      return "replit";
    if (process.env.PROJECT_DOMAIN)
      return "glitch";
    if (isEnvTruthy(process.env.VERCEL))
      return "vercel";
    if (process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_SERVICE_NAME) {
      return "railway";
    }
    if (isEnvTruthy(process.env.RENDER))
      return "render";
    if (isEnvTruthy(process.env.NETLIFY))
      return "netlify";
    if (process.env.DYNO)
      return "heroku";
    if (process.env.FLY_APP_NAME || process.env.FLY_MACHINE_ID)
      return "fly.io";
    if (isEnvTruthy(process.env.CF_PAGES))
      return "cloudflare-pages";
    if (process.env.DENO_DEPLOYMENT_ID)
      return "deno-deploy";
    if (process.env.AWS_LAMBDA_FUNCTION_NAME)
      return "aws-lambda";
    if (process.env.AWS_EXECUTION_ENV === "AWS_ECS_FARGATE")
      return "aws-fargate";
    if (process.env.AWS_EXECUTION_ENV === "AWS_ECS_EC2")
      return "aws-ecs";
    try {
      const uuid = getFsImplementation().readFileSync("/sys/hypervisor/uuid", { encoding: "utf8" }).trim().toLowerCase();
      if (uuid.startsWith("ec2"))
        return "aws-ec2";
    } catch {}
    if (process.env.K_SERVICE)
      return "gcp-cloud-run";
    if (process.env.GOOGLE_CLOUD_PROJECT)
      return "gcp";
    if (process.env.WEBSITE_SITE_NAME || process.env.WEBSITE_SKU)
      return "azure-app-service";
    if (process.env.AZURE_FUNCTIONS_ENVIRONMENT)
      return "azure-functions";
    if (process.env.APP_URL?.includes("ondigitalocean.app")) {
      return "digitalocean-app-platform";
    }
    if (process.env.SPACE_CREATOR_USER_ID)
      return "huggingface-spaces";
    if (isEnvTruthy(process.env.GITHUB_ACTIONS))
      return "github-actions";
    if (isEnvTruthy(process.env.GITLAB_CI))
      return "gitlab-ci";
    if (process.env.CIRCLECI)
      return "circleci";
    if (process.env.BUILDKITE)
      return "buildkite";
    if (isEnvTruthy(process.env.CI))
      return "ci";
    if (process.env.KUBERNETES_SERVICE_HOST)
      return "kubernetes";
    try {
      if (getFsImplementation().existsSync("/.dockerenv"))
        return "docker";
    } catch {}
    if (env.platform === "darwin")
      return "unknown-darwin";
    if (env.platform === "linux")
      return "unknown-linux";
    if (env.platform === "win32")
      return "unknown-win32";
    return "unknown";
  });
  env = {
    hasInternetAccess,
    isCI: isEnvTruthy(process.env.CI),
    platform: ["win32", "darwin"].includes(process.platform) ? process.platform : "linux",
    arch: process.arch,
    nodeVersion: process.version,
    terminal: detectTerminal(),
    isSSH: isSSHSession,
    getPackageManagers: detectPackageManagers,
    getRuntimes: detectRuntimes,
    isRunningWithBun: memoize_default(isRunningWithBun),
    isWslEnvironment,
    isNpmFromWindowsPath,
    isConductor,
    detectDeploymentEnvironment
  };
});

// src/utils/settings/managedPath.ts
import { join as join6 } from "path";
var getManagedFilePath, getManagedSettingsDropInDir;
var init_managedPath = __esm(() => {
  init_memoize();
  init_platform();
  getManagedFilePath = memoize_default(function() {
    if (process.env.USER_TYPE === "ant" && process.env.UR_CODE_MANAGED_SETTINGS_PATH) {
      return process.env.UR_CODE_MANAGED_SETTINGS_PATH;
    }
    switch (getPlatform()) {
      case "macos":
        return "/Library/Application Support/URCode";
      case "windows":
        return "C:\\Program Files\\URCode";
      default:
        return "/etc/ur";
    }
  });
  getManagedSettingsDropInDir = memoize_default(function() {
    return join6(getManagedFilePath(), "managed-settings.d");
  });
});

// src/utils/configConstants.ts
var NOTIFICATION_CHANNELS, EDITOR_MODES, TEAMMATE_MODES;
var init_configConstants = __esm(() => {
  NOTIFICATION_CHANNELS = [
    "auto",
    "iterm2",
    "iterm2_with_bell",
    "terminal_bell",
    "kitty",
    "ghostty",
    "notifications_disabled"
  ];
  EDITOR_MODES = ["normal", "vim"];
  TEAMMATE_MODES = ["auto", "tmux", "in-process"];
});

// src/utils/config.ts
import { randomBytes } from "crypto";
import { unwatchFile, watchFile } from "fs";
import { basename, dirname as dirname3, join as join7, resolve as resolve3 } from "path";
function createDefaultGlobalConfig() {
  return {
    numStartups: 0,
    installMethod: undefined,
    autoUpdates: undefined,
    theme: "dark",
    preferredNotifChannel: "auto",
    verbose: false,
    editorMode: "normal",
    autoCompactEnabled: true,
    compactionAutoThreshold: undefined,
    codeIndexAutoReindex: false,
    showTurnDuration: true,
    hasSeenTasksHint: false,
    hasUsedStash: false,
    hasUsedBackgroundTask: false,
    queuedCommandUpHintCount: 0,
    diffTool: "auto",
    customApiKeyResponses: {
      approved: [],
      rejected: []
    },
    env: {},
    tipsHistory: {},
    memoryUsageCount: 0,
    promptQueueUseCount: 0,
    btwUseCount: 0,
    todoFeatureEnabled: true,
    showExpandedTodos: true,
    messageIdleNotifThresholdMs: 60000,
    autoConnectIde: false,
    autoInstallIdeExtension: true,
    fileCheckpointingEnabled: true,
    terminalProgressBarEnabled: true,
    cachedStatsigGates: {},
    cachedDynamicConfigs: {},
    cachedGrowthBookFeatures: {},
    respectGitignore: true,
    copyFullResponse: false
  };
}
function checkHasTrustDialogAccepted() {
  return _trustAccepted ||= computeTrustDialogAccepted();
}
function computeTrustDialogAccepted() {
  if (getSessionTrustAccepted()) {
    return true;
  }
  const config = getGlobalConfig();
  const projectPath = getProjectPathForConfig();
  const projectConfig = config.projects?.[projectPath];
  if (projectConfig?.hasTrustDialogAccepted) {
    return true;
  }
  let currentPath = normalizePathForConfigKey(getCwd());
  while (true) {
    const pathConfig = config.projects?.[currentPath];
    if (pathConfig?.hasTrustDialogAccepted) {
      return true;
    }
    const parentPath = normalizePathForConfigKey(resolve3(currentPath, ".."));
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }
  return false;
}
function wouldLoseAuthState(fresh) {
  const cached = globalConfigCache.config;
  if (!cached)
    return false;
  const lostOauth = cached.oauthAccount !== undefined && fresh.oauthAccount === undefined;
  const lostOnboarding = cached.hasCompletedOnboarding === true && fresh.hasCompletedOnboarding !== true;
  return lostOauth || lostOnboarding;
}
function saveGlobalConfig(updater) {
  if (false) {}
  let written = null;
  try {
    const didWrite = saveConfigWithLock(getGlobalURFile(), createDefaultGlobalConfig, (current) => {
      const config = updater(current);
      if (config === current) {
        return current;
      }
      written = {
        ...config,
        projects: removeProjectHistory(current.projects)
      };
      return written;
    });
    if (didWrite && written) {
      writeThroughGlobalConfigCache(written);
    }
  } catch (error) {
    logForDebugging(`Failed to save config with lock: ${error}`, {
      level: "error"
    });
    const currentConfig = getConfig(getGlobalURFile(), createDefaultGlobalConfig);
    if (wouldLoseAuthState(currentConfig)) {
      logForDebugging("saveGlobalConfig fallback: re-read config is missing auth that cache has; refusing to write. See GH #3117.", { level: "error" });
      logEvent("tengu_config_auth_loss_prevented", {});
      return;
    }
    const config = updater(currentConfig);
    if (config === currentConfig) {
      return;
    }
    written = {
      ...config,
      projects: removeProjectHistory(currentConfig.projects)
    };
    saveConfig(getGlobalURFile(), written, DEFAULT_GLOBAL_CONFIG);
    writeThroughGlobalConfigCache(written);
  }
}
function reportConfigCacheStats() {
  const total = configCacheHits + configCacheMisses;
  if (total > 0) {
    logEvent("tengu_config_cache_stats", {
      cache_hits: configCacheHits,
      cache_misses: configCacheMisses,
      hit_rate: configCacheHits / total
    });
  }
  configCacheHits = 0;
  configCacheMisses = 0;
}
function migrateConfigFields(config) {
  if (config.installMethod !== undefined) {
    return config;
  }
  const legacy = config;
  let installMethod = "unknown";
  let autoUpdates = config.autoUpdates ?? true;
  switch (legacy.autoUpdaterStatus) {
    case "migrated":
      installMethod = "local";
      break;
    case "installed":
      installMethod = "native";
      break;
    case "disabled":
      autoUpdates = false;
      break;
    case "enabled":
    case "no_permissions":
    case "not_configured":
      installMethod = "global";
      break;
    case undefined:
      break;
  }
  return {
    ...config,
    installMethod,
    autoUpdates
  };
}
function removeProjectHistory(projects) {
  if (!projects) {
    return projects;
  }
  const cleanedProjects = {};
  let needsCleaning = false;
  for (const [path2, projectConfig] of Object.entries(projects)) {
    const legacy = projectConfig;
    if (legacy.history !== undefined) {
      needsCleaning = true;
      const { history, ...cleanedConfig } = legacy;
      cleanedProjects[path2] = cleanedConfig;
    } else {
      cleanedProjects[path2] = projectConfig;
    }
  }
  return needsCleaning ? cleanedProjects : projects;
}
function startGlobalConfigFreshnessWatcher() {
  if (freshnessWatcherStarted || false)
    return;
  freshnessWatcherStarted = true;
  const file = getGlobalURFile();
  watchFile(file, { interval: CONFIG_FRESHNESS_POLL_MS, persistent: false }, (curr) => {
    if (curr.mtimeMs <= globalConfigCache.mtime)
      return;
    getFsImplementation().readFile(file, { encoding: "utf-8" }).then((content) => {
      if (curr.mtimeMs <= globalConfigCache.mtime)
        return;
      const parsed = safeParseJSON(stripBOM(content));
      if (parsed === null || typeof parsed !== "object")
        return;
      globalConfigCache = {
        config: migrateConfigFields({
          ...createDefaultGlobalConfig(),
          ...parsed
        }),
        mtime: curr.mtimeMs
      };
      lastReadFileStats = { mtime: curr.mtimeMs, size: curr.size };
    }).catch(() => {});
  });
  registerCleanup(async () => {
    unwatchFile(file);
    freshnessWatcherStarted = false;
  });
}
function writeThroughGlobalConfigCache(config) {
  globalConfigCache = { config, mtime: Date.now() };
  lastReadFileStats = null;
}
function getGlobalConfig() {
  if (false) {}
  if (globalConfigCache.config) {
    configCacheHits++;
    return globalConfigCache.config;
  }
  configCacheMisses++;
  try {
    let stats = null;
    try {
      stats = getFsImplementation().statSync(getGlobalURFile());
    } catch {}
    const config = migrateConfigFields(getConfig(getGlobalURFile(), createDefaultGlobalConfig));
    globalConfigCache = {
      config,
      mtime: stats?.mtimeMs ?? Date.now()
    };
    lastReadFileStats = stats ? { mtime: stats.mtimeMs, size: stats.size } : null;
    startGlobalConfigFreshnessWatcher();
    return config;
  } catch {
    return migrateConfigFields(getConfig(getGlobalURFile(), createDefaultGlobalConfig));
  }
}
function getRemoteControlAtStartup() {
  const explicit = getGlobalConfig().remoteControlAtStartup;
  if (explicit !== undefined)
    return explicit;
  if (false) {}
  return false;
}
function saveConfig(file, config, defaultConfig) {
  const dir = dirname3(file);
  const fs = getFsImplementation();
  fs.mkdirSync(dir);
  const filteredConfig = pickBy_default(config, (value, key) => jsonStringify(value) !== jsonStringify(defaultConfig[key]));
  writeFileSyncAndFlush_DEPRECATED(file, jsonStringify(filteredConfig, null, 2), {
    encoding: "utf-8",
    mode: 384
  });
  if (file === getGlobalURFile()) {
    globalConfigWriteCount++;
  }
}
function saveConfigWithLock(file, createDefault, mergeFn) {
  const defaultConfig = createDefault();
  const dir = dirname3(file);
  const fs = getFsImplementation();
  fs.mkdirSync(dir);
  let release;
  try {
    const lockFilePath = `${file}.lock`;
    const startTime = Date.now();
    release = lockSync(file, {
      lockfilePath: lockFilePath,
      onCompromised: (err) => {
        logForDebugging(`Config lock compromised: ${err}`, { level: "error" });
      }
    });
    const lockTime = Date.now() - startTime;
    if (lockTime > 100) {
      logForDebugging("Lock acquisition took longer than expected - another UR instance may be running");
      logEvent("tengu_config_lock_contention", {
        lock_time_ms: lockTime
      });
    }
    if (lastReadFileStats && file === getGlobalURFile()) {
      try {
        const currentStats = fs.statSync(file);
        if (currentStats.mtimeMs !== lastReadFileStats.mtime || currentStats.size !== lastReadFileStats.size) {
          logEvent("tengu_config_stale_write", {
            read_mtime: lastReadFileStats.mtime,
            write_mtime: currentStats.mtimeMs,
            read_size: lastReadFileStats.size,
            write_size: currentStats.size
          });
        }
      } catch (e) {
        const code = getErrnoCode(e);
        if (code !== "ENOENT") {
          throw e;
        }
      }
    }
    const currentConfig = getConfig(file, createDefault);
    if (file === getGlobalURFile() && wouldLoseAuthState(currentConfig)) {
      logForDebugging("saveConfigWithLock: re-read config is missing auth that cache has; refusing to write to avoid wiping ~/.ur.json. See GH #3117.", { level: "error" });
      logEvent("tengu_config_auth_loss_prevented", {});
      return false;
    }
    const mergedConfig = mergeFn(currentConfig);
    if (mergedConfig === currentConfig) {
      return false;
    }
    const filteredConfig = pickBy_default(mergedConfig, (value, key) => jsonStringify(value) !== jsonStringify(defaultConfig[key]));
    try {
      const fileBase = basename(file);
      const backupDir = getConfigBackupDir();
      try {
        fs.mkdirSync(backupDir);
      } catch (mkdirErr) {
        const mkdirCode = getErrnoCode(mkdirErr);
        if (mkdirCode !== "EEXIST") {
          throw mkdirErr;
        }
      }
      const MIN_BACKUP_INTERVAL_MS = 60000;
      const existingBackups = fs.readdirStringSync(backupDir).filter((f) => f.startsWith(`${fileBase}.backup.`)).sort().reverse();
      const mostRecentBackup = existingBackups[0];
      const mostRecentTimestamp = mostRecentBackup ? Number(mostRecentBackup.split(".backup.").pop()) : 0;
      const shouldCreateBackup = Number.isNaN(mostRecentTimestamp) || Date.now() - mostRecentTimestamp >= MIN_BACKUP_INTERVAL_MS;
      if (shouldCreateBackup) {
        const backupPath = join7(backupDir, `${fileBase}.backup.${Date.now()}`);
        fs.copyFileSync(file, backupPath);
      }
      const MAX_BACKUPS = 5;
      const backupsForCleanup = shouldCreateBackup ? fs.readdirStringSync(backupDir).filter((f) => f.startsWith(`${fileBase}.backup.`)).sort().reverse() : existingBackups;
      for (const oldBackup of backupsForCleanup.slice(MAX_BACKUPS)) {
        try {
          fs.unlinkSync(join7(backupDir, oldBackup));
        } catch {}
      }
    } catch (e) {
      const code = getErrnoCode(e);
      if (code !== "ENOENT") {
        logForDebugging(`Failed to backup config: ${e}`, {
          level: "error"
        });
      }
    }
    writeFileSyncAndFlush_DEPRECATED(file, jsonStringify(filteredConfig, null, 2), {
      encoding: "utf-8",
      mode: 384
    });
    if (file === getGlobalURFile()) {
      globalConfigWriteCount++;
    }
    return true;
  } finally {
    if (release) {
      release();
    }
  }
}
function enableConfigs() {
  if (configReadingAllowed) {
    return;
  }
  const startTime = Date.now();
  logForDiagnosticsNoPII("info", "enable_configs_started");
  configReadingAllowed = true;
  getConfig(getGlobalURFile(), createDefaultGlobalConfig, true);
  logForDiagnosticsNoPII("info", "enable_configs_completed", {
    duration_ms: Date.now() - startTime
  });
}
function getConfigBackupDir() {
  return join7(getURConfigHomeDir(), "backups");
}
function findMostRecentBackup(file) {
  const fs = getFsImplementation();
  const fileBase = basename(file);
  const backupDir = getConfigBackupDir();
  try {
    const backups = fs.readdirStringSync(backupDir).filter((f) => f.startsWith(`${fileBase}.backup.`)).sort();
    const mostRecent = backups.at(-1);
    if (mostRecent) {
      return join7(backupDir, mostRecent);
    }
  } catch {}
  const fileDir = dirname3(file);
  try {
    const backups = fs.readdirStringSync(fileDir).filter((f) => f.startsWith(`${fileBase}.backup.`)).sort();
    const mostRecent = backups.at(-1);
    if (mostRecent) {
      return join7(fileDir, mostRecent);
    }
    const legacyBackup = `${file}.backup`;
    try {
      fs.statSync(legacyBackup);
      return legacyBackup;
    } catch {}
  } catch {}
  return null;
}
function getConfig(file, createDefault, throwOnInvalid) {
  if (!configReadingAllowed && true) {
    throw new Error("Config accessed before allowed.");
  }
  const fs = getFsImplementation();
  try {
    const fileContent = fs.readFileSync(file, {
      encoding: "utf-8"
    });
    try {
      const parsedConfig = jsonParse(stripBOM(fileContent));
      return {
        ...createDefault(),
        ...parsedConfig
      };
    } catch (error) {
      const errorMessage2 = error instanceof Error ? error.message : String(error);
      throw new ConfigParseError(errorMessage2, file, createDefault());
    }
  } catch (error) {
    const errCode = getErrnoCode(error);
    if (errCode === "ENOENT") {
      const backupPath = findMostRecentBackup(file);
      if (backupPath) {
        process.stderr.write(`
UR configuration file not found at: ${file}
` + `A backup file exists at: ${backupPath}
` + `You can manually restore it by running: cp "${backupPath}" "${file}"

`);
      }
      return createDefault();
    }
    if (error instanceof ConfigParseError && throwOnInvalid) {
      throw error;
    }
    if (error instanceof ConfigParseError) {
      logForDebugging(`Config file corrupted, resetting to defaults: ${error.message}`, { level: "error" });
      if (!insideGetConfig) {
        insideGetConfig = true;
        try {
          logError(error);
          let hasBackup = false;
          try {
            fs.statSync(`${file}.backup`);
            hasBackup = true;
          } catch {}
          logEvent("tengu_config_parse_error", {
            has_backup: hasBackup
          });
        } finally {
          insideGetConfig = false;
        }
      }
      process.stderr.write(`
UR configuration file at ${file} is corrupted: ${error.message}
`);
      const fileBase = basename(file);
      const corruptedBackupDir = getConfigBackupDir();
      try {
        fs.mkdirSync(corruptedBackupDir);
      } catch (mkdirErr) {
        const mkdirCode = getErrnoCode(mkdirErr);
        if (mkdirCode !== "EEXIST") {
          throw mkdirErr;
        }
      }
      const existingCorruptedBackups = fs.readdirStringSync(corruptedBackupDir).filter((f) => f.startsWith(`${fileBase}.corrupted.`));
      let corruptedBackupPath;
      let alreadyBackedUp = false;
      const currentContent = fs.readFileSync(file, { encoding: "utf-8" });
      for (const backup of existingCorruptedBackups) {
        try {
          const backupContent = fs.readFileSync(join7(corruptedBackupDir, backup), { encoding: "utf-8" });
          if (currentContent === backupContent) {
            alreadyBackedUp = true;
            break;
          }
        } catch {}
      }
      if (!alreadyBackedUp) {
        corruptedBackupPath = join7(corruptedBackupDir, `${fileBase}.corrupted.${Date.now()}`);
        try {
          fs.copyFileSync(file, corruptedBackupPath);
          logForDebugging(`Corrupted config backed up to: ${corruptedBackupPath}`, {
            level: "error"
          });
        } catch {}
      }
      const backupPath = findMostRecentBackup(file);
      if (corruptedBackupPath) {
        process.stderr.write(`The corrupted file has been backed up to: ${corruptedBackupPath}
`);
      } else if (alreadyBackedUp) {
        process.stderr.write(`The corrupted file has already been backed up.
`);
      }
      if (backupPath) {
        process.stderr.write(`A backup file exists at: ${backupPath}
` + `You can manually restore it by running: cp "${backupPath}" "${file}"

`);
      } else {
        process.stderr.write(`
`);
      }
    }
    return createDefault();
  }
}
function getCurrentProjectConfig() {
  if (false) {}
  const absolutePath = getProjectPathForConfig();
  const config = getGlobalConfig();
  if (!config.projects) {
    return DEFAULT_PROJECT_CONFIG;
  }
  const projectConfig = config.projects[absolutePath] ?? DEFAULT_PROJECT_CONFIG;
  if (typeof projectConfig.allowedTools === "string") {
    projectConfig.allowedTools = safeParseJSON(projectConfig.allowedTools) ?? [];
  }
  return projectConfig;
}
function saveCurrentProjectConfig(updater) {
  if (false) {}
  const absolutePath = getProjectPathForConfig();
  let written = null;
  try {
    const didWrite = saveConfigWithLock(getGlobalURFile(), createDefaultGlobalConfig, (current) => {
      const currentProjectConfig = current.projects?.[absolutePath] ?? DEFAULT_PROJECT_CONFIG;
      const newProjectConfig = updater(currentProjectConfig);
      if (newProjectConfig === currentProjectConfig) {
        return current;
      }
      written = {
        ...current,
        projects: {
          ...current.projects,
          [absolutePath]: newProjectConfig
        }
      };
      return written;
    });
    if (didWrite && written) {
      writeThroughGlobalConfigCache(written);
    }
  } catch (error) {
    logForDebugging(`Failed to save config with lock: ${error}`, {
      level: "error"
    });
    const config = getConfig(getGlobalURFile(), createDefaultGlobalConfig);
    if (wouldLoseAuthState(config)) {
      logForDebugging("saveCurrentProjectConfig fallback: re-read config is missing auth that cache has; refusing to write. See GH #3117.", { level: "error" });
      logEvent("tengu_config_auth_loss_prevented", {});
      return;
    }
    const currentProjectConfig = config.projects?.[absolutePath] ?? DEFAULT_PROJECT_CONFIG;
    const newProjectConfig = updater(currentProjectConfig);
    if (newProjectConfig === currentProjectConfig) {
      return;
    }
    written = {
      ...config,
      projects: {
        ...config.projects,
        [absolutePath]: newProjectConfig
      }
    };
    saveConfig(getGlobalURFile(), written, DEFAULT_GLOBAL_CONFIG);
    writeThroughGlobalConfigCache(written);
  }
}
function isAutoUpdaterDisabled() {
  return getAutoUpdaterDisabledReason() !== null;
}
function shouldSkipPluginAutoupdate() {
  return isAutoUpdaterDisabled() && !isEnvTruthy(process.env.FORCE_AUTOUPDATE_PLUGINS);
}
function formatAutoUpdaterDisabledReason(reason) {
  switch (reason.type) {
    case "development":
      return "development build";
    case "env":
      return `${reason.envVar} set`;
    case "config":
      return "config";
  }
}
function getAutoUpdaterDisabledReason() {
  if (true) {
    return { type: "development" };
  }
  if (isEnvTruthy(process.env.DISABLE_AUTOUPDATER)) {
    return { type: "env", envVar: "DISABLE_AUTOUPDATER" };
  }
  const essentialTrafficEnvVar = getEssentialTrafficOnlyReason();
  if (essentialTrafficEnvVar) {
    return { type: "env", envVar: essentialTrafficEnvVar };
  }
  const config = getGlobalConfig();
  if (config.autoUpdates === false && (config.installMethod !== "native" || config.autoUpdatesProtectedForNative !== true)) {
    return { type: "config" };
  }
  return null;
}
function getOrCreateUserID() {
  const config = getGlobalConfig();
  if (config.userID) {
    return config.userID;
  }
  const userID = randomBytes(32).toString("hex");
  saveGlobalConfig((current) => ({ ...current, userID }));
  return userID;
}
function getMemoryPath(memoryType) {
  const cwd = getOriginalCwd();
  switch (memoryType) {
    case "User":
      return join7(getURConfigHomeDir(), "UR.md");
    case "Local":
      return join7(cwd, "UR.local.md");
    case "Project":
      return join7(cwd, "UR.md");
    case "Managed":
      return join7(getManagedFilePath(), "UR.md");
    case "AutoMem":
      return getAutoMemEntrypoint();
  }
  if (false) {}
  return "";
}
function getManagedURRulesDir() {
  return join7(getManagedFilePath(), ".ur", "rules");
}
function getUserURRulesDir() {
  return join7(getURConfigHomeDir(), "rules");
}
var insideGetConfig = false, DEFAULT_PROJECT_CONFIG, DEFAULT_GLOBAL_CONFIG, _trustAccepted = false, TEST_GLOBAL_CONFIG_FOR_TESTING, TEST_PROJECT_CONFIG_FOR_TESTING, globalConfigCache, lastReadFileStats = null, configCacheHits = 0, configCacheMisses = 0, globalConfigWriteCount = 0, CONFIG_FRESHNESS_POLL_MS = 1000, freshnessWatcherStarted = false, configReadingAllowed = false, getProjectPathForConfig;
var init_config = __esm(() => {
  init_memoize();
  init_pickBy();
  init_state();
  init_paths();
  init_analytics();
  init_cwd();
  init_cleanupRegistry();
  init_debug();
  init_diagLogs();
  init_env();
  init_envUtils();
  init_errors();
  init_file();
  init_fsOperations();
  init_git();
  init_json();
  init_jsonRead();
  init_lockfile();
  init_log();
  init_path();
  init_privacyLevel();
  init_managedPath();
  init_slowOperations();
  init_configConstants();
  DEFAULT_PROJECT_CONFIG = {
    allowedTools: [],
    mcpContextUris: [],
    mcpServers: {},
    enabledMcpjsonServers: [],
    disabledMcpjsonServers: [],
    hasTrustDialogAccepted: false,
    projectOnboardingSeenCount: 0,
    hasAgentMdExternalIncludesApproved: false,
    hasAgentMdExternalIncludesWarningShown: false
  };
  DEFAULT_GLOBAL_CONFIG = createDefaultGlobalConfig();
  TEST_GLOBAL_CONFIG_FOR_TESTING = {
    ...DEFAULT_GLOBAL_CONFIG,
    autoUpdates: false
  };
  TEST_PROJECT_CONFIG_FOR_TESTING = {
    ...DEFAULT_PROJECT_CONFIG
  };
  globalConfigCache = {
    config: null,
    mtime: 0
  };
  registerCleanup(async () => {
    reportConfigCacheStats();
  });
  getProjectPathForConfig = memoize_default(() => {
    const originalCwd = getOriginalCwd();
    const gitRoot = findCanonicalGitRoot(originalCwd);
    if (gitRoot) {
      return normalizePathForConfigKey(gitRoot);
    }
    return normalizePathForConfigKey(resolve3(originalCwd));
  });
});

// node_modules/.bun/chalk@5.6.2/node_modules/chalk/source/vendor/ansi-styles/index.js
function assembleStyles() {
  const codes = new Map;
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ANSI_BACKGROUND_OFFSET = 10, wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`, wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`, wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`, styles, modifierNames, foregroundColorNames, backgroundColorNames, colorNames, ansiStyles, ansi_styles_default;
var init_ansi_styles = __esm(() => {
  styles = {
    modifier: {
      reset: [0, 0],
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      overline: [53, 55],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29]
    },
    color: {
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],
      blackBright: [90, 39],
      gray: [90, 39],
      grey: [90, 39],
      redBright: [91, 39],
      greenBright: [92, 39],
      yellowBright: [93, 39],
      blueBright: [94, 39],
      magentaBright: [95, 39],
      cyanBright: [96, 39],
      whiteBright: [97, 39]
    },
    bgColor: {
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],
      bgBlackBright: [100, 49],
      bgGray: [100, 49],
      bgGrey: [100, 49],
      bgRedBright: [101, 49],
      bgGreenBright: [102, 49],
      bgYellowBright: [103, 49],
      bgBlueBright: [104, 49],
      bgMagentaBright: [105, 49],
      bgCyanBright: [106, 49],
      bgWhiteBright: [107, 49]
    }
  };
  modifierNames = Object.keys(styles.modifier);
  foregroundColorNames = Object.keys(styles.color);
  backgroundColorNames = Object.keys(styles.bgColor);
  colorNames = [...foregroundColorNames, ...backgroundColorNames];
  ansiStyles = assembleStyles();
  ansi_styles_default = ansiStyles;
});

// node_modules/.bun/chalk@5.6.2/node_modules/chalk/source/vendor/supports-color/index.js
import process2 from "node:process";
import os from "node:os";
import tty from "node:tty";
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : process2.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
function envForceColor() {
  if ("FORCE_COLOR" in env2) {
    if (env2.FORCE_COLOR === "true") {
      return 1;
    }
    if (env2.FORCE_COLOR === "false") {
      return 0;
    }
    return env2.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env2.FORCE_COLOR, 10), 3);
  }
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
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== undefined) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env2 && "AGENT_NAME" in env2) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === undefined) {
    return 0;
  }
  const min = forceColor || 0;
  if (env2.TERM === "dumb") {
    return min;
  }
  if (process2.platform === "win32") {
    const osRelease2 = os.release().split(".");
    if (Number(osRelease2[0]) >= 10 && Number(osRelease2[2]) >= 10586) {
      return Number(osRelease2[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env2) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => (key in env2))) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => (sign in env2)) || env2.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env2) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env2.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env2.COLORTERM === "truecolor") {
    return 3;
  }
  if (env2.TERM === "xterm-kitty") {
    return 3;
  }
  if (env2.TERM === "xterm-ghostty") {
    return 3;
  }
  if (env2.TERM === "wezterm") {
    return 3;
  }
  if ("TERM_PROGRAM" in env2) {
    const version = Number.parseInt((env2.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env2.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env2.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env2.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env2) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var env2, flagForceColor, supportsColor, supports_color_default;
var init_supports_color = __esm(() => {
  ({ env: env2 } = process2);
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    flagForceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    flagForceColor = 1;
  }
  supportsColor = {
    stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
    stderr: createSupportsColor({ isTTY: tty.isatty(2) })
  };
  supports_color_default = supportsColor;
});

// node_modules/.bun/chalk@5.6.2/node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? `\r
` : `
`) + postfix;
    endIndex = index + 1;
    index = string.indexOf(`
`, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
var init_utilities = () => {};

// node_modules/.bun/chalk@5.6.2/node_modules/chalk/source/index.js
class Chalk {
  constructor(options) {
    return chalkFactory(options);
  }
}
function createChalk(options) {
  return chalkFactory(options);
}
var stdoutColor, stderrColor, GENERATOR, STYLER, IS_EMPTY, levelMapping, styles2, applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === undefined ? colorLevel : options.level;
}, chalkFactory = (options) => {
  const chalk = (...strings) => strings.join(" ");
  applyOptions(chalk, options);
  Object.setPrototypeOf(chalk, createChalk.prototype);
  return chalk;
}, getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
}, usedModels, proto, createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === undefined) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
}, createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
}, applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === undefined) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== undefined) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf(`
`);
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
}, chalk, chalkStderr, source_default;
var init_source = __esm(() => {
  init_ansi_styles();
  init_supports_color();
  init_utilities();
  ({ stdout: stdoutColor, stderr: stderrColor } = supports_color_default);
  GENERATOR = Symbol("GENERATOR");
  STYLER = Symbol("STYLER");
  IS_EMPTY = Symbol("IS_EMPTY");
  levelMapping = [
    "ansi",
    "ansi",
    "ansi256",
    "ansi16m"
  ];
  styles2 = Object.create(null);
  Object.setPrototypeOf(createChalk.prototype, Function.prototype);
  for (const [styleName, style] of Object.entries(ansi_styles_default)) {
    styles2[styleName] = {
      get() {
        const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
        Object.defineProperty(this, styleName, { value: builder });
        return builder;
      }
    };
  }
  styles2.visible = {
    get() {
      const builder = createBuilder(this, this[STYLER], true);
      Object.defineProperty(this, "visible", { value: builder });
      return builder;
    }
  };
  usedModels = ["rgb", "hex", "ansi256"];
  for (const model of usedModels) {
    styles2[model] = {
      get() {
        const { level } = this;
        return function(...arguments_) {
          const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
          return createBuilder(this, styler, this[IS_EMPTY]);
        };
      }
    };
    const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
    styles2[bgModel] = {
      get() {
        const { level } = this;
        return function(...arguments_) {
          const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
          return createBuilder(this, styler, this[IS_EMPTY]);
        };
      }
    };
  }
  proto = Object.defineProperties(() => {}, {
    ...styles2,
    level: {
      enumerable: true,
      get() {
        return this[GENERATOR].level;
      },
      set(level) {
        this[GENERATOR].level = level;
      }
    }
  });
  Object.defineProperties(createChalk.prototype, styles2);
  chalk = createChalk();
  chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
  source_default = chalk;
});

// src/utils/sequential.ts
function sequential(fn) {
  const queue = [];
  let processing = false;
  async function processQueue() {
    if (processing)
      return;
    if (queue.length === 0)
      return;
    processing = true;
    while (queue.length > 0) {
      const { args, resolve: resolve4, reject, context } = queue.shift();
      try {
        const result = await fn.apply(context, args);
        resolve4(result);
      } catch (error) {
        reject(error);
      }
    }
    processing = false;
    if (queue.length > 0) {
      processQueue();
    }
  }
  return function(...args) {
    return new Promise((resolve4, reject) => {
      queue.push({ args, resolve: resolve4, reject, context: this });
      processQueue();
    });
  };
}
var init_sequential = () => {};

// src/utils/model/bedrock.ts
function findFirstMatch(profiles, substring) {
  return profiles.find((p) => p.includes(substring)) ?? null;
}
function isFoundationModel(modelId) {
  return modelId.startsWith("urhq.");
}
function extractModelIdFromArn(modelId) {
  if (!modelId.startsWith("arn:")) {
    return modelId;
  }
  const lastSlashIndex = modelId.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return modelId;
  }
  return modelId.substring(lastSlashIndex + 1);
}
function getBedrockRegionPrefix(modelId) {
  const effectiveModelId = extractModelIdFromArn(modelId);
  for (const prefix of BEDROCK_REGION_PREFIXES) {
    if (effectiveModelId.startsWith(`${prefix}.urhq.`)) {
      return prefix;
    }
  }
  return;
}
function applyBedrockRegionPrefix(modelId, prefix) {
  const existingPrefix = getBedrockRegionPrefix(modelId);
  if (existingPrefix) {
    return modelId.replace(`${existingPrefix}.`, `${prefix}.`);
  }
  if (isFoundationModel(modelId)) {
    return `${prefix}.${modelId}`;
  }
  return modelId;
}
var getBedrockInferenceProfiles, getInferenceProfileBackingModel, BEDROCK_REGION_PREFIXES;
var init_bedrock = __esm(() => {
  init_memoize();
  getBedrockInferenceProfiles = memoize_default(async function() {
    return [];
  });
  getInferenceProfileBackingModel = memoize_default(async function(_profileId) {
    return null;
  });
  BEDROCK_REGION_PREFIXES = ["us", "eu", "apac", "global"];
});

// src/utils/model/configs.ts
var DEFAULT_OLLAMA_MODEL = "qwen3-coder:480b-cloud", UR_3_7_MODELS_CONFIG, UR_3_5_V2_MODELS_CONFIG, UR_3_5_MODELH_CONFIG, UR_MODELH_4_5_CONFIG, UR_MODELS_4_CONFIG, UR_MODELS_4_5_CONFIG, UR_MODELO_4_CONFIG, UR_MODELO_4_1_CONFIG, UR_MODELO_4_5_CONFIG, UR_MODELO_4_6_CONFIG, UR_MODELS_4_6_CONFIG, ALL_MODEL_CONFIGS, CANONICAL_MODEL_IDS, CANONICAL_ID_TO_KEY;
var init_configs = __esm(() => {
  UR_3_7_MODELS_CONFIG = {
    firstParty: "ur-3-7-modelS-20250219",
    bedrock: "us.urhq.ur-3-7-modelS-20250219-v1:0",
    vertex: "ur-3-7-modelS@20250219",
    foundry: "ur-3-7-modelS",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_3_5_V2_MODELS_CONFIG = {
    firstParty: "ur-3-5-modelS-20241022",
    bedrock: "urhq.ur-3-5-modelS-20241022-v2:0",
    vertex: "ur-3-5-modelS-v2@20241022",
    foundry: "ur-3-5-modelS",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_3_5_MODELH_CONFIG = {
    firstParty: "ur-3-5-modelH-20241022",
    bedrock: "us.urhq.ur-3-5-modelH-20241022-v1:0",
    vertex: "ur-3-5-modelH@20241022",
    foundry: "ur-3-5-modelH",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELH_4_5_CONFIG = {
    firstParty: "modelH",
    bedrock: "modelH",
    vertex: "modelH",
    foundry: "modelH",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELS_4_CONFIG = {
    firstParty: "modelS",
    bedrock: "modelS",
    vertex: "modelS",
    foundry: "modelS",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELS_4_5_CONFIG = {
    firstParty: "modelS",
    bedrock: "modelS",
    vertex: "modelS",
    foundry: "modelS",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELO_4_CONFIG = {
    firstParty: "modelO",
    bedrock: "modelO",
    vertex: "modelO",
    foundry: "modelO",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELO_4_1_CONFIG = {
    firstParty: "modelO",
    bedrock: "modelO",
    vertex: "modelO",
    foundry: "modelO",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELO_4_5_CONFIG = {
    firstParty: "modelO",
    bedrock: "modelO",
    vertex: "modelO",
    foundry: "modelO",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELO_4_6_CONFIG = {
    firstParty: "modelO",
    bedrock: "modelO",
    vertex: "modelO",
    foundry: "modelO",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  UR_MODELS_4_6_CONFIG = {
    firstParty: "modelS",
    bedrock: "modelS",
    vertex: "modelS",
    foundry: "modelS",
    ollama: DEFAULT_OLLAMA_MODEL
  };
  ALL_MODEL_CONFIGS = {
    modelH35: UR_3_5_MODELH_CONFIG,
    modelH45: UR_MODELH_4_5_CONFIG,
    modelS35: UR_3_5_V2_MODELS_CONFIG,
    modelS37: UR_3_7_MODELS_CONFIG,
    modelS40: UR_MODELS_4_CONFIG,
    modelS45: UR_MODELS_4_5_CONFIG,
    modelS46: UR_MODELS_4_6_CONFIG,
    modelO40: UR_MODELO_4_CONFIG,
    modelO41: UR_MODELO_4_1_CONFIG,
    modelO45: UR_MODELO_4_5_CONFIG,
    modelO46: UR_MODELO_4_6_CONFIG
  };
  CANONICAL_MODEL_IDS = Object.values(ALL_MODEL_CONFIGS).map((c) => c.firstParty);
  CANONICAL_ID_TO_KEY = Object.fromEntries(Object.entries(ALL_MODEL_CONFIGS).map(([key, cfg]) => [cfg.firstParty, key]));
});

// src/services/providers/providerRegistry.ts
import { spawn } from "node:child_process";
function normalizeProviderInput(value) {
  return value.trim().toLowerCase().replace(/[_\s]+/g, "-");
}
function isProviderId(value) {
  return PROVIDER_IDS.includes(value);
}
function resolveProviderId(value) {
  const normalized = normalizeProviderInput(value);
  if (isProviderId(normalized)) {
    return normalized;
  }
  return PROVIDER_ALIASES[normalized] ?? null;
}
function providerAliasesFor(id) {
  return PROVIDER_ALIAS_ENTRIES.find((entry) => entry.canonical === id)?.aliases ?? [];
}
function getProviderDefinition(id) {
  return PROVIDERS[id];
}
function getActiveProviderSettings(settings = getInitialSettings()) {
  const effectiveSettings = settings ?? {};
  const configured = effectiveSettings.provider ?? {};
  const active = configured.active ? resolveProviderId(configured.active) ?? DEFAULT_PROVIDER_ID : DEFAULT_PROVIDER_ID;
  const fallback = configured.fallback === "disabled" ? "disabled" : configured.fallback ? resolveProviderId(configured.fallback) ?? undefined : undefined;
  return {
    active,
    model: configured.model ?? (configured.active ? undefined : effectiveSettings.model),
    baseUrl: configured.baseUrl,
    commandPath: configured.commandPath,
    fallback
  };
}
function getProviderRuntimeInfo(settings = getInitialSettings()) {
  const providerSettings = getActiveProviderSettings(settings);
  const provider = providerSettings.active ?? DEFAULT_PROVIDER_ID;
  const definition = getProviderDefinition(provider);
  return {
    provider,
    providerLabel: definition.statusBarName,
    accessType: definition.accessType,
    accessTypeLabel: getProviderAccessTypeLabel(definition),
    credentialType: definition.credentialType,
    providerKind: definition.providerKind,
    usesExternalCli: definition.usesExternalCli,
    supportsNativeToolCalls: definition.supportsNativeToolCalls,
    supportsNativeStreaming: definition.supportsNativeStreaming,
    safetyBoundary: definition.safetyBoundary,
    safetyBoundaryLabel: definition.safetyBoundaryLabel,
    runtimeBackend: getProviderRuntimeBackend(provider),
    authMode: definition.authMode,
    authLabel: authModeLabel(definition.authMode),
    model: providerSettings.model,
    baseUrl: providerSettings.baseUrl ?? definition.defaultBaseUrl,
    fallback: providerSettings.fallback
  };
}
function getProviderRuntimeBackend(providerId) {
  const provider = resolveProviderId(providerId);
  switch (provider) {
    case "subscription":
      return "subscription:unconfigured";
    case "ollama":
      return "ollama";
    case "lmstudio":
      return "openai-compatible:lmstudio";
    case "llama.cpp":
      return "openai-compatible:llama.cpp";
    case "vllm":
      return "openai-compatible:vllm";
    case "openai-compatible":
      return "openai-compatible";
    case "codex-cli":
      return "subscription-cli:codex";
    case "claude-code-cli":
      return "subscription-cli:claude-code";
    case "gemini-cli":
      return "subscription-cli:gemini";
    case "antigravity-cli":
      return "subscription-cli:antigravity";
    case "openai-api":
      return "api:openai";
    case "anthropic-api":
      return "api:anthropic";
    case "gemini-api":
      return "api:gemini";
    case "openrouter":
      return "api:openrouter";
    default:
      return `unknown:${providerId}`;
  }
}
function getProviderFamily(providerId) {
  const provider = resolveProviderId(providerId);
  return provider ? PROVIDER_FAMILIES[provider] : "openai-compatible";
}
function getRuntimeProviderId(settings = getInitialSettings()) {
  return getActiveProviderSettings(settings).active ?? DEFAULT_PROVIDER_ID;
}
function authModeLabel(mode) {
  switch (mode) {
    case "subscription":
      return "subscription";
    case "enterprise-login":
      return "enterprise-login";
    case "personal-login":
      return "personal-login";
    case "api":
      return "API";
    case "local":
      return "local";
  }
}
function getProviderAccessTypeLabel(provider) {
  return provider.accessTypeLabel ?? provider.accessType;
}
function credentialTypeLabel(type) {
  switch (type) {
    case "subscription-login":
      return "subscription login";
    case "cli-login":
      return "subscription login";
    case "api-key":
      return "API key";
    case "local-runtime":
      return "local runtime";
    case "openai-compatible-endpoint":
      return "OpenAI-compatible endpoint";
  }
}
function getProviderRuntimeKind(providerId) {
  const provider = resolveProviderId(providerId);
  return provider ? getProviderDefinition(provider).runtimeKind : "unknown";
}
function getProviderRuntimeBlockReason(providerId, env3 = process.env, settings = getInitialSettings()) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return `Unknown provider "${providerId}". Run: ur provider list`;
  }
  if (provider === "subscription") {
    return `Provider "subscription" is an internal placeholder. Choose a specific subscription (codex-cli, claude-code-cli, gemini-cli, antigravity-cli) or an API/local/server provider with /model.`;
  }
  return null;
}
function isProviderRuntimeSelectable(providerId, env3 = process.env) {
  return getProviderRuntimeBlockReason(providerId, env3) === null;
}
function listProviders(_options = {}) {
  return PROVIDER_IDS.map((id) => PROVIDERS[id]).filter((provider) => provider.id !== "subscription" && !provider.disabled);
}
function hasSecretLikeValue(value) {
  const trimmed = value.trim();
  if (/^(sk-|sk_|sk-proj-|sk-ant-|xox[baprs]-|gh[pousr]_|AIza)/i.test(trimmed)) {
    return true;
  }
  if (/token|refresh|oauth|secret|api[_-]?key/i.test(trimmed)) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    return Boolean(url.username || url.password);
  } catch {
    return false;
  }
}
function normalizeBaseUrl(value) {
  const trimmed = value.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  const url = new URL(withScheme);
  if (url.username || url.password) {
    throw new Error("base_url must not contain embedded credentials");
  }
  return withScheme.replace(/\/$/, "");
}
function setSafeProviderConfig(key, value, options = {}) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, message: `Missing value for ${key}.` };
  }
  if (hasSecretLikeValue(trimmed)) {
    return {
      ok: false,
      message: "Refusing to store credential-like data. Put API keys in environment variables and select API mode explicitly."
    };
  }
  let settings;
  let providerModelInvalidated = false;
  try {
    if (key === "provider") {
      const provider = resolveProviderId(trimmed);
      if (!provider) {
        return {
          ok: false,
          message: `Unknown provider "${trimmed}". Run: ur provider list`
        };
      }
      const runtimeBlock = getProviderRuntimeBlockReason(provider);
      if (runtimeBlock) {
        return {
          ok: false,
          message: runtimeBlock
        };
      }
      const currentSettings = getInitialSettings();
      const currentModel = getActiveProviderSettings(currentSettings).model;
      const nextProviderSettings = { active: provider };
      let invalidated = false;
      if (currentModel) {
        const validation = validateProviderModelPair(provider, currentModel);
        if (validation.valid === false) {
          nextProviderSettings.model = undefined;
          invalidated = true;
          providerModelInvalidated = true;
        }
      }
      settings = {
        provider: nextProviderSettings,
        ...invalidated ? { model: undefined } : {}
      };
    } else if (key === "provider.fallback") {
      const fallback = trimmed === "disabled" ? "disabled" : resolveProviderId(trimmed);
      if (!fallback) {
        return {
          ok: false,
          message: `Unknown fallback provider "${trimmed}". Run: ur provider list`
        };
      }
      if (fallback !== "disabled") {
        const runtimeBlock = getProviderRuntimeBlockReason(fallback);
        if (runtimeBlock) {
          return {
            ok: false,
            message: runtimeBlock
          };
        }
      }
      settings = { provider: { fallback } };
    } else if (key === "provider.command_path") {
      settings = { provider: { commandPath: trimmed } };
    } else if (key === "model") {
      const currentSettings = getInitialSettings();
      const currentProvider = getActiveProviderSettings(currentSettings).active ?? "ollama";
      const runtimeBlock = getProviderRuntimeBlockReason(currentProvider);
      if (runtimeBlock) {
        return {
          ok: false,
          message: runtimeBlock
        };
      }
      const validation = validateProviderModelPair(currentProvider, trimmed);
      if (validation.valid === false) {
        return {
          ok: false,
          message: validation.error
        };
      }
      settings = { provider: { model: trimmed }, model: trimmed };
    } else {
      settings = { provider: { baseUrl: normalizeBaseUrl(trimmed) } };
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
  const source = options.source ?? "localSettings";
  const result = updateSettingsForSource(source, settings);
  if (result.error) {
    return {
      ok: false,
      message: `Failed to write UR-Nexus settings: ${result.error.message}`
    };
  }
  const savedValue = key === "provider" || key === "provider.fallback" ? key === "provider.fallback" && trimmed === "disabled" ? "disabled" : resolveProviderId(trimmed) ?? trimmed : trimmed;
  return {
    ok: true,
    message: `Set ${key} to ${savedValue}.${providerModelInvalidated ? " Cleared incompatible model for the new provider; run /model to choose a scoped model." : ""}`
  };
}
function outputText(result) {
  return `${result.stdout}
${result.stderr}
${result.error ?? ""}`.trim();
}
function classifiesAsLoggedIn(text) {
  return /logged in|authenticated|signed in|active account|using chatgpt/i.test(text);
}
function classifiesAsNotLoggedIn(text) {
  return /not logged in|not authenticated|not signed in|login required|unauthenticated/i.test(text);
}
function classifyGeminiAccountSupport(text) {
  if (/personal.*unsupported|unsupported.*personal|consumer.*unsupported/i.test(text)) {
    return "personal-unsupported";
  }
  if (/enterprise|standard|code assist|workspace/i.test(text)) {
    return "enterprise-supported";
  }
  return "unknown";
}
async function resolveCommand(definition, settings, adapters) {
  if (settings.commandPath) {
    return settings.commandPath;
  }
  for (const candidate of definition.commandCandidates ?? []) {
    const found = await (adapters.which ?? which)(candidate);
    if (found)
      return found;
  }
  return null;
}
async function runCommand(file, args, adapters) {
  if (adapters.run) {
    return adapters.run(file, args);
  }
  return execFileNoThrow(file, args, {
    timeout: 15000,
    preserveOutputOnError: true,
    audit: false
  });
}
function addFailure(result, reason, fix) {
  result.ok = false;
  result.failureReason ??= reason;
  result.suggestedFix ??= fix;
}
function endpointUrl(baseUrl, kind) {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (kind === "ollama") {
    return `${trimmed}/api/tags`;
  }
  return `${trimmed}/models`;
}
function openAiCompatibleModelUrls(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  const urls = [`${trimmed}/models`];
  if (!/\/(v\d+|api)(\/|$)/i.test(trimmed)) {
    urls.push(`${trimmed}/v1/models`);
  }
  return urls;
}
function isLocalBaseUrl(value) {
  return LOCALHOST_RE.test(value);
}
async function checkEndpoint(definition, settings, adapters, result) {
  if (!definition.endpointKind)
    return;
  const baseUrl = settings.baseUrl ?? (definition.id === "ollama" ? getOllamaBaseUrl() : definition.defaultBaseUrl);
  if (!baseUrl) {
    result.checks.push({
      name: "base_url",
      status: "fail",
      message: "No base_url configured."
    });
    addFailure(result, "missing base_url", "Run: ur config set base_url <url>");
    return;
  }
  const candidates = definition.endpointKind === "ollama" ? [endpointUrl(baseUrl, "ollama")] : openAiCompatibleModelUrls(baseUrl);
  const headers = definition.accessType === "api" && (adapters.env ?? process.env)[definition.envKey ?? ""] ? { Authorization: `Bearer ${(adapters.env ?? process.env)[definition.envKey ?? ""]}` } : undefined;
  const fetchImpl = adapters.fetch ?? fetch;
  let reachableUrl;
  let modelsUrl;
  let modelsBody = "";
  let lastStatus;
  let lastError;
  for (const candidate of candidates) {
    let response;
    try {
      response = await fetchImpl(candidate, { method: "GET", headers });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
    if (!response.ok) {
      lastStatus = response.status;
      continue;
    }
    reachableUrl ??= candidate;
    const body = await response.text().catch(() => "");
    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = null;
    }
    const names = definition.endpointKind === "ollama" ? parseOllamaModelNamesFromTags(parsed) : parseOpenAICompatibleModelNames(parsed);
    if (names.length > 0) {
      modelsUrl = candidate;
      modelsBody = body;
      break;
    }
  }
  if (!reachableUrl) {
    if (lastStatus !== undefined) {
      result.checks.push({
        name: "endpoint",
        status: "fail",
        message: `${candidates[0]} returned HTTP ${lastStatus}.`
      });
      addFailure(result, `endpoint returned HTTP ${lastStatus}`, `Start the provider server or update base_url: ur config set base_url ${baseUrl}`);
    } else {
      result.checks.push({
        name: "endpoint",
        status: "fail",
        message: `${candidates[0]} is not reachable.`
      });
      addFailure(result, lastError?.message ?? "endpoint unavailable", `Start the provider server or update base_url: ur config set base_url ${baseUrl}`);
    }
    return;
  }
  const chosenUrl = modelsUrl ?? reachableUrl;
  result.checks.push({
    name: "endpoint",
    status: "pass",
    message: `${chosenUrl} is reachable.`
  });
  if (!modelsUrl) {
    result.checks.push({
      name: "models",
      status: "warn",
      message: `${reachableUrl} is reachable but returned no models. Load a model in the server, or check that base_url includes the API path (e.g. /v1).`
    });
  }
  if (settings.model) {
    if (modelsBody && !modelsBody.includes(settings.model)) {
      result.checks.push({
        name: "model",
        status: "warn",
        message: `Model "${settings.model}" was not found in the detectable model list.`
      });
    } else if (modelsBody) {
      result.checks.push({
        name: "model",
        status: "pass",
        message: `Model "${settings.model}" is detectable.`
      });
    }
  }
}
async function checkSubscriptionProvider(definition, settings, adapters, result) {
  if (definition.credentialType === "subscription-login") {
    result.checks.push({
      name: "subscription_runtime",
      status: "fail",
      message: "No independent subscription runtime is configured."
    });
    addFailure(result, "subscription runtime unavailable", "Run /model and choose a connected local, server, or API provider.");
    return;
  }
  const commandPath = await resolveCommand(definition, settings, adapters);
  if (!commandPath) {
    const commands = definition.commandCandidates?.join(", ") ?? definition.id;
    result.checks.push({
      name: "cli",
      status: "fail",
      message: `No official CLI command found on PATH. Tried: ${commands}.`
    });
    addFailure(result, "CLI missing", `Install the official ${definition.displayName} CLI, then run ur auth ${authAliasForProvider(definition.id)}.`);
    return;
  }
  result.checks.push({
    name: "cli",
    status: "pass",
    message: `${commandPath} found.`
  });
  if (definition.versionArgs) {
    const version = await runCommand(commandPath, definition.versionArgs, adapters);
    result.checks.push({
      name: "version",
      status: version.code === 0 ? "pass" : "warn",
      message: outputText(version) || `${definition.displayName} version check exited ${version.code}.`
    });
  }
  if (definition.id === "claude-code-cli" && (adapters.env ?? process.env).ANTHROPIC_API_KEY) {
    result.checks.push({
      name: "api_key_override",
      status: "warn",
      message: "ANTHROPIC_API_KEY is set and may override Claude Code subscription login. Unset it to test subscription auth."
    });
  }
  if (definition.id === "gemini-cli") {
    const versionText = result.checks.find((check) => check.name === "version")?.message ?? "";
    const support = classifyGeminiAccountSupport(versionText);
    if (support === "personal-unsupported") {
      result.checks.push({
        name: "account_type",
        status: "fail",
        message: definition.unsupportedPersonalAccountMessage ?? "Unsupported account type."
      });
      addFailure(result, "unsupported account type", "Use an official Gemini Code Assist Standard/Enterprise login path.");
    } else if (support === "enterprise-supported") {
      result.checks.push({
        name: "account_type",
        status: "pass",
        message: "Gemini Code Assist Standard/Enterprise path is supported by the detected CLI output."
      });
    } else {
      result.checks.push({
        name: "account_type",
        status: "warn",
        message: "Gemini CLI status is not exposed by this CLI. UR-Nexus will only use the official Gemini CLI flow and will not support personal-account bypasses."
      });
    }
  }
  if (!definition.statusArgs) {
    result.checks.push({
      name: "login_status",
      status: "skip",
      message: "No stable official status command is configured for this provider."
    });
    return;
  }
  const status = await runCommand(commandPath, definition.statusArgs, adapters);
  const text = outputText(status);
  if (status.code === 0 && !classifiesAsNotLoggedIn(text)) {
    result.checks.push({
      name: "login_status",
      status: classifiesAsLoggedIn(text) ? "pass" : "warn",
      message: text || "Status command succeeded."
    });
    return;
  }
  result.checks.push({
    name: "login_status",
    status: "fail",
    message: text || `${definition.displayName} is not logged in.`
  });
  addFailure(result, "not logged in", `Run: ur auth ${authAliasForProvider(definition.id)}`);
}
async function checkApiProvider(definition, settings, adapters, result) {
  const env3 = adapters.env ?? process.env;
  const baseUrl = settings.baseUrl ?? definition.defaultBaseUrl;
  const requiresKey = definition.id !== "openai-compatible" || !baseUrl || !isLocalBaseUrl(baseUrl);
  if (definition.envKey && requiresKey) {
    let hasKey = Boolean(env3[definition.envKey]);
    let source = "env";
    if (!hasKey && !adapters.env) {
      try {
        const { getStoredProviderApiKey } = await import("./providerCredentials-9pzg3gy7.js");
        if (getStoredProviderApiKey(definition.id)) {
          hasKey = true;
          source = "stored";
        }
      } catch {}
    }
    if (hasKey) {
      result.checks.push({
        name: "api_key",
        status: "pass",
        message: source === "stored" ? "Stored API key present (connected)." : `${definition.envKey} is present.`
      });
    } else {
      result.checks.push({
        name: "api_key",
        status: "fail",
        message: `${definition.envKey} is not set and no stored key.`
      });
      addFailure(result, "API key missing", `Connect once: ur connect ${definition.id} (or set ${definition.envKey}).`);
    }
  }
  await checkEndpoint(definition, settings, adapters, result);
}
function fallbackResult(settings, active, ok) {
  if (ok)
    return;
  if (!settings.fallback || settings.fallback === "disabled") {
    return {
      enabled: false,
      message: "Fallback is disabled. UR-Nexus will not silently switch providers. Optional: ur config set provider.fallback ollama"
    };
  }
  if (settings.fallback === active) {
    return {
      enabled: false,
      message: "Fallback points at the selected provider and will not be used."
    };
  }
  return {
    enabled: true,
    provider: settings.fallback,
    message: `Fallback is configured as ${settings.fallback}, but UR-Nexus will ask before using it.`
  };
}
async function doctorProvider(provider, options = {}) {
  const allSettings = options.settings ?? getInitialSettings();
  const providerSettings = getActiveProviderSettings(allSettings);
  const active = provider ?? providerSettings.active ?? DEFAULT_PROVIDER_ID;
  const definition = getProviderDefinition(active);
  const settingsForProvider = {
    ...providerSettings,
    active
  };
  const result = {
    provider: active,
    displayName: definition.displayName,
    accessType: definition.accessType,
    authMode: definition.authMode,
    providerKind: definition.providerKind,
    usesExternalCli: definition.usesExternalCli,
    supportsNativeToolCalls: definition.supportsNativeToolCalls,
    supportsNativeStreaming: definition.supportsNativeStreaming,
    safetyBoundary: definition.safetyBoundary,
    safetyBoundaryLabel: definition.safetyBoundaryLabel,
    selected: active === providerSettings.active,
    ok: true,
    checks: [
      {
        name: "legal_path",
        status: "pass",
        message: definition.legalPath
      },
      {
        name: "runtime_boundary",
        status: "pass",
        message: definition.safetyBoundaryLabel
      }
    ]
  };
  if (definition.accessType === "subscription") {
    await checkSubscriptionProvider(definition, settingsForProvider, options.adapters ?? {}, result);
  } else if (definition.accessType === "api") {
    await checkApiProvider(definition, settingsForProvider, options.adapters ?? {}, result);
  } else if (definition.accessType === "local" || definition.accessType === "server") {
    await checkEndpoint(definition, settingsForProvider, options.adapters ?? {}, result);
  }
  result.fallback = fallbackResult(providerSettings, active, result.ok);
  return result;
}
async function doctorActiveProvider(options = {}) {
  const settings = options.settings ?? getInitialSettings();
  const active = getActiveProviderSettings(settings).active ?? DEFAULT_PROVIDER_ID;
  return doctorProvider(active, options);
}
function getConnectionStatusFromDoctorResult(result) {
  if (result.ok) {
    return "connected";
  }
  if (result.failureReason?.includes("CLI missing") || result.failureReason?.includes("not found")) {
    return "missing";
  }
  if (result.failureReason?.includes("not logged in") || result.failureReason?.includes("not authenticated") || result.failureReason?.includes("subscription runtime unavailable") || result.failureReason?.includes("API key missing") || result.failureReason?.includes("endpoint") || result.failureReason?.includes("HTTP")) {
    return "unavailable";
  }
  return "unknown";
}
function formatProviderStatusLabel(status, provider, checks) {
  switch (status) {
    case "connected":
      if (provider.credentialType === "api-key" && provider.envKey) {
        return `${provider.envKey} found`;
      }
      if (provider.id === "ollama") {
        return "localhost reachable";
      }
      if (provider.credentialType === "openai-compatible-endpoint") {
        return "OpenAI-compatible endpoint reachable";
      }
      if (provider.credentialType === "cli-login") {
        return "subscription login connected";
      }
      if (provider.credentialType === "subscription-login") {
        return "subscription connected";
      }
      return "connected";
    case "missing":
      if (provider.commandCandidates) {
        return `CLI not found (tried: ${provider.commandCandidates.join(", ")})`;
      }
      return "missing";
    case "unavailable": {
      const failCheck = checks.find((check) => check.status === "fail" || check.status === "warn");
      return failCheck?.message ?? "unavailable";
    }
    case "unknown":
      return "status unknown";
  }
}
async function getProviderStatus(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    throw new Error(`Unknown provider "${providerId}". Run: ur provider list`);
  }
  const definition = getProviderDefinition(provider);
  const doctor = await doctorProvider(provider, options);
  const status = getConnectionStatusFromDoctorResult(doctor);
  return {
    provider,
    displayName: definition.displayName,
    accessType: definition.accessType,
    accessTypeLabel: getProviderAccessTypeLabel(definition),
    credentialType: definition.credentialType,
    providerKind: definition.providerKind,
    usesExternalCli: definition.usesExternalCli,
    supportsNativeToolCalls: definition.supportsNativeToolCalls,
    supportsNativeStreaming: definition.supportsNativeStreaming,
    safetyBoundary: definition.safetyBoundary,
    safetyBoundaryLabel: definition.safetyBoundaryLabel,
    status,
    label: formatProviderStatusLabel(status, definition, doctor.checks),
    checks: doctor.checks,
    doctor
  };
}
function authAliasForProvider(provider) {
  switch (provider) {
    case "codex-cli":
      return "chatgpt";
    case "claude-code-cli":
      return "claude";
    case "gemini-cli":
      return "gemini";
    case "antigravity-cli":
      return "antigravity";
    default:
      return "provider";
  }
}
function providerForAuthAlias(alias) {
  switch (alias) {
    case "chatgpt":
      return "codex-cli";
    case "claude":
      return "claude-code-cli";
    case "gemini":
      return "gemini-cli";
    case "antigravity":
      return "antigravity-cli";
    default:
      return null;
  }
}
function buildProviderAuthCommand(provider, options = {}) {
  const definition = getProviderDefinition(provider);
  const command = definition.commandCandidates?.[0];
  if (!command)
    return null;
  const args = options.deviceAuth && definition.deviceLoginArgs ? definition.deviceLoginArgs : definition.loginArgs;
  if (!args)
    return null;
  if (provider === "gemini-cli") {
    return {
      command,
      args,
      instructions: "The detected Gemini CLI does not expose a stable non-interactive login subcommand. Launching the official Gemini CLI is the only supported path; complete the Gemini Code Assist login flow if prompted."
    };
  }
  if (provider === "antigravity-cli") {
    return {
      command,
      args,
      instructions: "UR-Nexus will only launch the official Antigravity CLI. Use its documented login flow where supported; UR-Nexus will not invent flags or reuse browser sessions."
    };
  }
  return {
    command,
    args,
    instructions: `Launching ${definition.legalPath}.`
  };
}
async function launchProviderAuth(alias, options = {}) {
  const provider = providerForAuthAlias(alias);
  if (!provider) {
    return { ok: false, message: `Unknown auth provider "${alias}".` };
  }
  const authCommand = buildProviderAuthCommand(provider, options);
  if (!authCommand) {
    return {
      ok: false,
      message: `No official login command is configured for ${provider}.`
    };
  }
  const commandPath = await resolveCommand(getProviderDefinition(provider), {}, {});
  if (!commandPath) {
    const commands = getProviderDefinition(provider).commandCandidates?.join(", ") ?? provider;
    return {
      ok: false,
      message: `No official ${getProviderDefinition(provider).displayName} CLI command found. Tried: ${commands}. Install the official CLI first.`
    };
  }
  const printableCommand = commandPath.split(/[\\/]/).pop() ?? authCommand.command;
  const printable = [printableCommand, ...authCommand.args].join(" ");
  if (options.dryRun || !process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      ok: true,
      message: `${authCommand.instructions}
Run: ${printable}`,
      command: printable
    };
  }
  await new Promise((resolve4, reject) => {
    const child = spawn(commandPath, authCommand.args, {
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0)
        resolve4();
      else
        reject(new Error(`${printable} exited with code ${code ?? 1}`));
    });
  });
  return { ok: true, message: `Completed: ${printable}`, command: printable };
}
function formatProviderList(json = false) {
  const providers = listProviders().map((provider) => ({
    id: provider.id,
    name: provider.displayName,
    aliases: providerAliasesFor(provider.id),
    accessType: provider.accessType,
    accessTypeLabel: getProviderAccessTypeLabel(provider),
    credentialType: provider.credentialType,
    modelDiscoveryType: provider.modelDiscoveryType,
    runtimeKind: provider.runtimeKind,
    providerKind: provider.providerKind,
    usesExternalCli: provider.usesExternalCli,
    supportsNativeToolCalls: provider.supportsNativeToolCalls,
    supportsNativeStreaming: provider.supportsNativeStreaming,
    runtimeBackend: getProviderRuntimeBackend(provider.id),
    safetyBoundary: provider.safetyBoundary,
    safetyBoundaryLabel: provider.safetyBoundaryLabel,
    authMode: provider.authMode,
    accessPath: provider.accessPathLabel,
    legalPath: provider.legalPath
  }));
  if (json) {
    return JSON.stringify(providers, null, 2);
  }
  return [
    "Provider | ID | Aliases | Access type | Credential | Model discovery | Provider kind | External CLI | Native tools | Native streaming | Runtime backend | Boundary | Access path",
    "--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---",
    ...providers.map((provider) => `${provider.name} | ${provider.id} | ${provider.aliases.slice(0, 3).join(", ") || "-"} | ${provider.accessTypeLabel} | ${provider.credentialType} | ${provider.modelDiscoveryType} | ${provider.providerKind} | ${provider.usesExternalCli ? "yes" : "no"} | ${provider.supportsNativeToolCalls ? "yes" : "no"} | ${provider.supportsNativeStreaming ? "yes" : "no"} | ${provider.runtimeBackend} | ${provider.safetyBoundary} | ${provider.accessPath}`)
  ].join(`
`);
}
function formatProviderDoctor(result, json = false) {
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  const runtimeBlock = getProviderRuntimeBlockReason(result.provider);
  const lines = [
    `Provider: ${result.displayName} (${result.provider})`,
    `Access: ${getProviderAccessTypeLabel(getProviderDefinition(result.provider))}`,
    `Credential: ${getProviderDefinition(result.provider).credentialType}`,
    `Runtime kind: ${getProviderDefinition(result.provider).runtimeKind}`,
    `Provider kind: ${result.providerKind}`,
    `Uses external CLI: ${result.usesExternalCli ? "yes" : "no"}`,
    `UR-native tool calls: ${result.supportsNativeToolCalls ? "yes" : "no"}`,
    `UR-native streaming: ${result.supportsNativeStreaming ? "yes" : "no"}`,
    `Runtime backend: ${getProviderRuntimeBackend(result.provider)}`,
    `Safety boundary: ${result.safetyBoundaryLabel}`,
    `Runtime available: ${runtimeBlock ? "no" : "yes"}`,
    `Auth: ${authModeLabel(result.authMode)}`,
    `Status: ${result.ok ? "ready" : "not ready"}`
  ];
  if (runtimeBlock) {
    lines.push(`Runtime note: ${runtimeBlock}`);
  }
  for (const check of result.checks) {
    lines.push(`- ${check.status.toUpperCase()} ${check.name}: ${check.message}`);
  }
  if (result.failureReason) {
    lines.push(`Failure reason: ${result.failureReason}`);
  }
  if (result.suggestedFix) {
    lines.push(`Suggested fix: ${result.suggestedFix}`);
  }
  if (result.fallback) {
    lines.push(`Fallback: ${result.fallback.message}`);
  }
  return lines.join(`
`);
}
function formatProviderStatus(result, json = false) {
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  const failure = result.failureReason ? `
Failure reason: ${result.failureReason}` : "";
  const fix = result.suggestedFix ? `
Suggested fix: ${result.suggestedFix}` : "";
  const definition = getProviderDefinition(result.provider);
  const settings = getActiveProviderSettings(getInitialSettings());
  const model = settings.model ? `
Active model: ${settings.model}` : "";
  const runtimeBlock = getProviderRuntimeBlockReason(result.provider);
  const runtime = `
Runtime available: ${runtimeBlock ? "no" : "yes"}${runtimeBlock ? `
Runtime note: ${runtimeBlock}` : ""}`;
  return `Selected provider: ${result.displayName} (${result.provider})
Access type: ${getProviderAccessTypeLabel(definition)}
Credential: ${definition.credentialType}
Runtime kind: ${definition.runtimeKind}
Provider kind: ${result.providerKind}
Uses external CLI: ${result.usesExternalCli ? "yes" : "no"}
UR-native tool calls: ${result.supportsNativeToolCalls ? "yes" : "no"}
UR-native streaming: ${result.supportsNativeStreaming ? "yes" : "no"}
Runtime backend: ${getProviderRuntimeBackend(result.provider)}
Safety boundary: ${result.safetyBoundaryLabel}${model}${runtime}
Auth mode: ${authModeLabel(result.authMode)}
Ready: ${result.ok ? "yes" : "no"}${failure}${fix}`;
}
function clearProviderModelCacheForTests() {
  cachedModelsByProvider.clear();
}
function providerBaseUrl(provider, definition, settings) {
  const providerSettings = getActiveProviderSettings(settings);
  if (providerSettings.baseUrl) {
    return providerSettings.baseUrl;
  }
  if (provider === "ollama") {
    return getOllamaBaseUrl(process.env, settings);
  }
  return definition.defaultBaseUrl;
}
function parseOpenAICompatibleModelNames(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const data = value.data ?? value.models;
  if (!Array.isArray(data)) {
    return [];
  }
  const names = data.flatMap((model) => {
    if (typeof model === "string") {
      const trimmed2 = model.trim();
      return trimmed2 ? [trimmed2] : [];
    }
    if (!model || typeof model !== "object") {
      return [];
    }
    const entry = model;
    const name = entry.id ?? entry.name ?? entry.model;
    if (typeof name !== "string") {
      return [];
    }
    const trimmed = name.trim();
    return trimmed ? [trimmed] : [];
  });
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
function parseOllamaModelNamesFromTags(value) {
  if (!value || typeof value !== "object" || !("models" in value)) {
    return [];
  }
  const models = value.models;
  if (!Array.isArray(models)) {
    return [];
  }
  const names = models.flatMap((model) => {
    if (!model || typeof model !== "object") {
      return [];
    }
    const entry = model;
    const name = entry.name ?? entry.model;
    if (typeof name !== "string") {
      return [];
    }
    const trimmed = name.trim();
    return trimmed ? [trimmed] : [];
  });
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
function modelDefinitionsFromNames(provider, names, source) {
  const providerName = getProviderDefinition(provider).displayName;
  return names.map((name) => ({
    id: name,
    displayName: name,
    description: source === "cache" ? `Cached ${providerName} model` : `Discovered from ${providerName}`
  }));
}
function getCachedProviderModels(provider) {
  return cachedModelsByProvider.get(provider) ?? [];
}
function cacheProviderModelsForProvider(providerId, models) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return;
  }
  const definitions = typeof models[0] === "string" ? modelDefinitionsFromNames(provider, models, "cache") : models;
  if (definitions.length > 0) {
    cachedModelsByProvider.set(provider, definitions);
  }
}
function staticModelsForProvider(provider) {
  return (PROVIDER_MODELS[provider] ?? []).filter((model) => !model.isDynamic);
}
async function discoverLiveModelsForProvider(provider, options = {}) {
  const definition = getProviderDefinition(provider);
  if (!definition.endpointKind) {
    if (definition.accessType === "api" && definition.modelDiscoveryType === "live") {
      return discoverApiProviderModels(provider, definition, options);
    }
    return [];
  }
  const settings = options.settings ?? getInitialSettings();
  const baseUrl = providerBaseUrl(provider, definition, settings);
  if (!baseUrl) {
    throw new Error(`No base_url configured for provider "${provider}".`);
  }
  const env3 = options.adapters?.env ?? process.env;
  const fetchImpl = options.adapters?.fetch ?? fetch;
  const headers = definition.accessType === "api" && definition.envKey && env3[definition.envKey] ? { Authorization: `Bearer ${env3[definition.envKey]}` } : undefined;
  if (definition.endpointKind === "ollama") {
    const url = endpointUrl(baseUrl, "ollama");
    const response = await fetchImpl(url, { method: "GET", signal: options.signal, headers });
    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}.`);
    }
    const names = parseOllamaModelNamesFromTags(await response.json());
    return modelDefinitionsFromNames(provider, names, "live");
  }
  let reachedOk = false;
  let lastError;
  for (const url of openAiCompatibleModelUrls(baseUrl)) {
    let response;
    try {
      response = await fetchImpl(url, { method: "GET", signal: options.signal, headers });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
    if (!response.ok) {
      lastError = new Error(`${url} returned HTTP ${response.status}.`);
      continue;
    }
    reachedOk = true;
    const body = await response.json().catch(() => null);
    const names = parseOpenAICompatibleModelNames(body);
    if (names.length > 0) {
      return modelDefinitionsFromNames(provider, names, "live");
    }
  }
  if (!reachedOk && lastError) {
    throw lastError;
  }
  return [];
}
function apiModelsRequest(provider, apiKey) {
  switch (provider) {
    case "anthropic-api":
      return {
        url: "https://api.anthropic.com/v1/models",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      };
    case "gemini-api":
      return {
        url: "https://generativelanguage.googleapis.com/v1beta/models",
        headers: { "x-goog-api-key": apiKey }
      };
    case "openrouter":
      return {
        url: "https://openrouter.ai/api/v1/models",
        headers: { Authorization: `Bearer ${apiKey}` }
      };
    default:
      return {
        url: "https://api.openai.com/v1/models",
        headers: { Authorization: `Bearer ${apiKey}` }
      };
  }
}
function parseApiModelIds(provider, body) {
  const root = body ?? {};
  if (provider === "gemini-api") {
    const models = Array.isArray(root.models) ? root.models : [];
    const names2 = models.filter((m) => {
      const methods = m.supportedGenerationMethods;
      return !Array.isArray(methods) || methods.includes("generateContent");
    }).map((m) => typeof m.name === "string" ? m.name.replace(/^models\//, "") : "").filter(Boolean);
    return [...new Set(names2)].sort((a, b) => a.localeCompare(b));
  }
  const data = Array.isArray(root.data) ? root.data : [];
  const names = data.map((m) => typeof m.id === "string" ? m.id : "").filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
async function discoverApiProviderModels(provider, definition, options) {
  const env3 = options.adapters?.env ?? process.env;
  let apiKey = definition.envKey ? env3[definition.envKey] : undefined;
  if (!apiKey) {
    try {
      const { getProviderApiKey } = await import("./providerCredentials-9pzg3gy7.js");
      apiKey = getProviderApiKey(provider, { env: env3 });
    } catch {}
  }
  if (!apiKey) {
    throw new Error(`Not connected: run \`ur connect ${provider}\` to add an API key.`);
  }
  const { url, headers } = apiModelsRequest(provider, apiKey);
  const response = await (options.adapters?.fetch ?? fetch)(url, {
    method: "GET",
    signal: options.signal,
    headers
  });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}.`);
  }
  const body = await response.json();
  return modelDefinitionsFromNames(provider, parseApiModelIds(provider, body), "live");
}
async function listModelsForProviderWithSource(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return {
      provider: "ollama",
      models: [],
      source: "static",
      warning: `Unknown provider "${providerId}". Run: ur provider list`
    };
  }
  const definition = getProviderDefinition(provider);
  if (definition.modelDiscoveryType === "static") {
    return {
      provider,
      models: staticModelsForProvider(provider),
      source: "static"
    };
  }
  try {
    const liveModels = await discoverLiveModelsForProvider(provider, options);
    if (liveModels.length > 0) {
      cachedModelsByProvider.set(provider, liveModels);
      return {
        provider,
        models: liveModels,
        source: "live"
      };
    }
    const cachedModels = getCachedProviderModels(provider);
    if (cachedModels.length > 0) {
      return {
        provider,
        models: cachedModels,
        source: "cache",
        warning: `Live model discovery for "${provider}" returned no models. Showing cached ${provider} models only.`
      };
    }
    const staticModels = staticModelsForProvider(provider);
    return {
      provider,
      models: staticModels,
      source: staticModels.length > 0 ? "static" : "live",
      warning: `Live model discovery for "${provider}" returned no models.`
    };
  } catch (error) {
    const cachedModels = getCachedProviderModels(provider);
    if (cachedModels.length > 0) {
      return {
        provider,
        models: cachedModels,
        source: "cache",
        warning: `Live model discovery for "${provider}" failed: ${error instanceof Error ? error.message : String(error)}. Showing cached ${provider} models only.`
      };
    }
    const staticModels = staticModelsForProvider(provider);
    return {
      provider,
      models: staticModels,
      source: staticModels.length > 0 ? "static" : "live",
      warning: `Live model discovery for "${provider}" failed: ${error instanceof Error ? error.message : String(error)}.`
    };
  }
}
function listModelsForProvider(providerId) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return [];
  }
  return PROVIDER_MODELS[provider] ?? [];
}
function isModelSupportedByProvider(providerId, modelId) {
  return validateProviderModelPair(providerId, modelId).valid;
}
function getDefaultModelForProvider(providerId) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return;
  }
  const models = PROVIDER_MODELS[provider];
  if (!models) {
    return;
  }
  const defaultModel = models.find((m) => m.isDefault && !m.isDynamic) ?? models.find((m) => !m.isDynamic);
  return defaultModel?.id;
}
function getValidModelIdsForProvider(providerId) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return [];
  }
  const cached = getCachedProviderModels(provider);
  if (cached.length > 0) {
    return cached.map((model) => model.id);
  }
  return staticModelsForProvider(provider).map((model) => model.id);
}
function formatInvalidProviderModelMessage(providerId, modelId, validModels, suggestedModel) {
  const provider = resolveProviderId(providerId) ?? String(providerId);
  const validList = validModels.length > 0 ? validModels.join(", ") : "(no models discovered)";
  const suggested = suggestedModel ?? validModels[0] ?? "<valid-model>";
  return `Model "${modelId}" is not available for provider "${provider}". Valid models for ${provider}: ${validList}. Run /model and choose a model from ${provider}, or run: ur config set model ${suggested}`;
}
function validateProviderModelPair(providerId, modelId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return {
      valid: false,
      error: `Unknown provider "${providerId}". Run: ur provider list`,
      validModels: []
    };
  }
  const models = PROVIDER_MODELS[provider];
  if (!models) {
    return {
      valid: false,
      error: `No models defined for provider "${provider}".`,
      validModels: []
    };
  }
  const suppliedModels = (options.availableModels ?? []).map((model) => typeof model === "string" ? model : model.id);
  const cachedModels = getCachedProviderModels(provider).map((model) => model.id);
  const staticModelIds = staticModelsForProvider(provider).map((model) => model.id);
  const hasDynamicModels = models.some((model) => model.isDynamic) || getProviderDefinition(provider).modelDiscoveryType === "live";
  const validModelIds = suppliedModels.length > 0 ? suppliedModels : hasDynamicModels ? cachedModels.length > 0 ? cachedModels : staticModelIds : Array.from(new Set([...staticModelIds, ...cachedModels]));
  if (validModelIds.includes(modelId)) {
    return { valid: true };
  }
  const noAuthoritativeList = cachedModels.length === 0 && suppliedModels.length === 0;
  if (hasDynamicModels && options.allowUncachedDynamic && noAuthoritativeList) {
    return { valid: true };
  }
  const defaultModel = getDefaultModelForProvider(provider);
  return {
    valid: false,
    error: formatInvalidProviderModelMessage(provider, modelId, validModelIds, defaultModel),
    validModels: validModelIds,
    suggestedModel: defaultModel
  };
}
function setProviderModel(providerId, modelId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return {
      ok: false,
      message: `Unknown provider "${providerId}". Run: ur provider list`
    };
  }
  const runtimeBlock = getProviderRuntimeBlockReason(provider);
  if (runtimeBlock) {
    return {
      ok: false,
      message: runtimeBlock
    };
  }
  const validation = validateProviderModelPair(provider, modelId, {
    availableModels: options.availableModels
  });
  if (validation.valid === false) {
    return {
      ok: false,
      message: validation.error
    };
  }
  const source = options.source ?? "localSettings";
  const result = updateSettingsForSource(source, {
    provider: {
      active: provider,
      model: modelId
    },
    model: modelId
  });
  if (result.error) {
    return {
      ok: false,
      message: `Failed to write UR-Nexus settings: ${result.error.message}`
    };
  }
  return {
    ok: true,
    message: `Selected provider ${provider} (${getProviderAccessTypeLabel(getProviderDefinition(provider))}) with model ${modelId} (${options.modelSource ?? "static"}).`,
    provider,
    model: modelId,
    modelSource: options.modelSource ?? "static"
  };
}
var PROVIDER_IDS, DEFAULT_PROVIDER_ID = "ollama", LOCALHOST_RE, UR_NATIVE_PROVIDER_BOUNDARY = "UR-native runtime: UR owns provider request shaping, native tool-call parsing, native streaming, and UR-run tool permission/sandbox/verifier flow.", SUBSCRIPTION_CLI_PROVIDER_BOUNDARY = "External vendor CLI boundary: UR passes prompt text to the official CLI and receives final text output. UR-native tool calling, UR Bash/File tool execution, UR-native streaming, local command permissions, sandbox guarantees, and verifier/done-gate checks apply to UR-run tools/final UR output, not to actions the external CLI performs internally.", UNCONFIGURED_SUBSCRIPTION_PROVIDER_BOUNDARY = "Unconfigured subscription placeholder: no runtime is attached. Choose a specific subscription CLI, API, local, or server provider.", UR_NATIVE_CAPABILITIES, SUBSCRIPTION_CLI_CAPABILITIES, SUBSCRIPTION_PLACEHOLDER_CAPABILITIES, PROVIDERS, PROVIDER_ALIAS_ENTRIES, PROVIDER_ALIASES, PROVIDER_FAMILIES, PROVIDER_MODELS, cachedModelsByProvider, validateProviderModelCompatibility;
var init_providerRegistry = __esm(() => {
  init_execFileNoThrow();
  init_ollamaConfig();
  init_settings2();
  init_which();
  PROVIDER_IDS = [
    "ollama",
    "subscription",
    "lmstudio",
    "llama.cpp",
    "vllm",
    "openai-compatible",
    "openai-api",
    "anthropic-api",
    "gemini-api",
    "openrouter",
    "codex-cli",
    "claude-code-cli",
    "gemini-cli",
    "antigravity-cli"
  ];
  LOCALHOST_RE = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?(\/|$)/i;
  UR_NATIVE_CAPABILITIES = {
    providerKind: "ur-native",
    usesExternalCli: false,
    supportsNativeToolCalls: true,
    supportsNativeStreaming: true,
    safetyBoundary: "ur-native-runtime",
    safetyBoundaryLabel: UR_NATIVE_PROVIDER_BOUNDARY
  };
  SUBSCRIPTION_CLI_CAPABILITIES = {
    providerKind: "subscription-cli",
    usesExternalCli: true,
    supportsNativeToolCalls: false,
    supportsNativeStreaming: false,
    safetyBoundary: "external-subscription-cli",
    safetyBoundaryLabel: SUBSCRIPTION_CLI_PROVIDER_BOUNDARY
  };
  SUBSCRIPTION_PLACEHOLDER_CAPABILITIES = {
    providerKind: "subscription-placeholder",
    usesExternalCli: false,
    supportsNativeToolCalls: false,
    supportsNativeStreaming: false,
    safetyBoundary: "unconfigured-subscription",
    safetyBoundaryLabel: UNCONFIGURED_SUBSCRIPTION_PROVIDER_BOUNDARY
  };
  PROVIDERS = {
    subscription: {
      id: "subscription",
      displayName: "Subscription",
      statusBarName: "Subscription",
      accessType: "subscription",
      credentialType: "subscription-login",
      modelDiscoveryType: "static",
      statusCheck: "subscription-login",
      listModels: "static",
      validateModel: "static-list",
      runtimeKind: "ur-native",
      ...SUBSCRIPTION_PLACEHOLDER_CAPABILITIES,
      authMode: "subscription",
      legalPath: "independent subscription runtime only",
      accessPathLabel: "subscription login; no external provider app bridge"
    },
    "codex-cli": {
      id: "codex-cli",
      displayName: "Codex CLI",
      statusBarName: "Codex CLI",
      accessType: "subscription",
      credentialType: "cli-login",
      modelDiscoveryType: "static",
      statusCheck: "cli-login",
      listModels: "static",
      validateModel: "static-list",
      runtimeKind: "external-app",
      ...SUBSCRIPTION_CLI_CAPABILITIES,
      authMode: "subscription",
      legalPath: "official Codex CLI login",
      accessPathLabel: "subscription login via official Codex CLI",
      commandCandidates: ["codex"],
      versionArgs: ["--version"],
      statusArgs: ["login", "status"],
      loginArgs: ["login"],
      deviceLoginArgs: ["login", "--device-auth"],
      disabled: true
    },
    "claude-code-cli": {
      id: "claude-code-cli",
      displayName: "Claude Code",
      statusBarName: "Claude Code",
      accessType: "subscription",
      credentialType: "cli-login",
      modelDiscoveryType: "static",
      statusCheck: "cli-login",
      listModels: "static",
      validateModel: "static-list",
      runtimeKind: "external-app",
      ...SUBSCRIPTION_CLI_CAPABILITIES,
      authMode: "subscription",
      legalPath: "official Claude Code CLI login",
      accessPathLabel: "subscription login via official Claude Code CLI",
      commandCandidates: ["claude"],
      versionArgs: ["--version"],
      statusArgs: ["auth", "status"],
      loginArgs: ["auth", "login"],
      disabled: true
    },
    "gemini-cli": {
      id: "gemini-cli",
      displayName: "Gemini CLI",
      statusBarName: "Gemini CLI",
      accessType: "subscription",
      credentialType: "cli-login",
      modelDiscoveryType: "static",
      statusCheck: "cli-login",
      listModels: "static",
      validateModel: "static-list",
      runtimeKind: "external-app",
      ...SUBSCRIPTION_CLI_CAPABILITIES,
      authMode: "enterprise-login",
      legalPath: "official Gemini Code Assist login",
      accessPathLabel: "subscription login via official Gemini CLI",
      commandCandidates: ["gemini"],
      versionArgs: ["--version"],
      loginArgs: [],
      unsupportedPersonalAccountMessage: "Personal Google account login is not enabled by UR-Nexus. Use an official Gemini Code Assist Standard/Enterprise path if your Gemini CLI supports it.",
      disabled: true
    },
    "antigravity-cli": {
      id: "antigravity-cli",
      displayName: "Antigravity",
      statusBarName: "Antigravity",
      accessType: "subscription",
      credentialType: "cli-login",
      modelDiscoveryType: "static",
      statusCheck: "cli-login",
      listModels: "static",
      validateModel: "static-list",
      runtimeKind: "external-app",
      ...SUBSCRIPTION_CLI_CAPABILITIES,
      authMode: "personal-login",
      legalPath: "official Antigravity CLI login, where supported",
      accessPathLabel: "subscription login via official Antigravity CLI",
      commandCandidates: ["agy", "antigravity", "google-antigravity", "ag"],
      versionArgs: ["--version"],
      loginArgs: [],
      disabled: true
    },
    "openai-api": {
      id: "openai-api",
      displayName: "OpenAI API",
      statusBarName: "OpenAI",
      accessType: "api",
      credentialType: "api-key",
      modelDiscoveryType: "live",
      statusCheck: "api-key",
      listModels: "static",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "api",
      legalPath: "OPENAI_API_KEY",
      accessPathLabel: "API key from OPENAI_API_KEY",
      envKey: "OPENAI_API_KEY"
    },
    "anthropic-api": {
      id: "anthropic-api",
      displayName: "Claude API",
      statusBarName: "Claude API",
      accessType: "api",
      credentialType: "api-key",
      modelDiscoveryType: "live",
      statusCheck: "api-key",
      listModels: "static",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "api",
      legalPath: "ANTHROPIC_API_KEY",
      accessPathLabel: "API key from ANTHROPIC_API_KEY",
      envKey: "ANTHROPIC_API_KEY"
    },
    "gemini-api": {
      id: "gemini-api",
      displayName: "Gemini API",
      statusBarName: "Gemini API",
      accessType: "api",
      credentialType: "api-key",
      modelDiscoveryType: "live",
      statusCheck: "api-key",
      listModels: "static",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "api",
      legalPath: "GEMINI_API_KEY",
      accessPathLabel: "API key from GEMINI_API_KEY",
      envKey: "GEMINI_API_KEY"
    },
    openrouter: {
      id: "openrouter",
      displayName: "OpenRouter",
      statusBarName: "OpenRouter",
      accessType: "api",
      credentialType: "api-key",
      modelDiscoveryType: "live",
      statusCheck: "api-key",
      listModels: "static",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "api",
      legalPath: "OPENROUTER_API_KEY",
      accessPathLabel: "API key from OPENROUTER_API_KEY",
      envKey: "OPENROUTER_API_KEY"
    },
    "openai-compatible": {
      id: "openai-compatible",
      displayName: "OpenAI-compatible",
      statusBarName: "OpenAI-compatible",
      accessType: "api",
      accessTypeLabel: "server/api",
      credentialType: "openai-compatible-endpoint",
      modelDiscoveryType: "live",
      statusCheck: "endpoint",
      listModels: "openai-compatible-models",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "api",
      legalPath: "user-selected OpenAI-compatible base URL with API key only when required by that endpoint",
      accessPathLabel: "OpenAI-compatible endpoint",
      envKey: "OPENAI_API_KEY",
      endpointKind: "openai-compatible"
    },
    ollama: {
      id: "ollama",
      displayName: "Ollama",
      statusBarName: "Ollama",
      accessType: "local",
      credentialType: "local-runtime",
      modelDiscoveryType: "live",
      statusCheck: "endpoint",
      listModels: "ollama-tags",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "local",
      legalPath: "localhost Ollama runtime",
      accessPathLabel: "local Ollama runtime",
      defaultBaseUrl: "http://localhost:11434",
      endpointKind: "ollama"
    },
    lmstudio: {
      id: "lmstudio",
      displayName: "LM Studio",
      statusBarName: "LM Studio",
      accessType: "server",
      accessTypeLabel: "local/server",
      credentialType: "openai-compatible-endpoint",
      modelDiscoveryType: "live",
      statusCheck: "endpoint",
      listModels: "openai-compatible-models",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...SUBSCRIPTION_CLI_CAPABILITIES,
      authMode: "local",
      legalPath: "local OpenAI-compatible server",
      accessPathLabel: "local OpenAI-compatible endpoint",
      defaultBaseUrl: "http://localhost:1234/v1",
      disabled: true,
      endpointKind: "openai-compatible"
    },
    "llama.cpp": {
      id: "llama.cpp",
      displayName: "llama.cpp",
      statusBarName: "llama.cpp",
      accessType: "server",
      accessTypeLabel: "local/server",
      credentialType: "openai-compatible-endpoint",
      modelDiscoveryType: "live",
      statusCheck: "endpoint",
      listModels: "openai-compatible-models",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "local",
      legalPath: "local OpenAI-compatible server",
      accessPathLabel: "local OpenAI-compatible endpoint",
      defaultBaseUrl: "http://localhost:8080/v1",
      endpointKind: "openai-compatible"
    },
    vllm: {
      id: "vllm",
      displayName: "vLLM",
      statusBarName: "vLLM",
      accessType: "server",
      accessTypeLabel: "local/server",
      credentialType: "openai-compatible-endpoint",
      modelDiscoveryType: "live",
      statusCheck: "endpoint",
      listModels: "openai-compatible-models",
      validateModel: "discovered-list",
      runtimeKind: "ur-native",
      ...UR_NATIVE_CAPABILITIES,
      authMode: "local",
      legalPath: "OpenAI-compatible server",
      accessPathLabel: "OpenAI-compatible endpoint runtime",
      defaultBaseUrl: "http://localhost:8000/v1",
      endpointKind: "openai-compatible"
    }
  };
  PROVIDER_ALIAS_ENTRIES = [
    {
      canonical: "subscription",
      aliases: ["subscriptions", "subscription login"]
    },
    {
      canonical: "codex-cli",
      aliases: ["chatgpt", "codex", "codex cli", "openai codex", "chatgpt codex"]
    },
    {
      canonical: "claude-code-cli",
      aliases: ["claude", "claude code", "claude cli", "anthropic claude"]
    },
    {
      canonical: "gemini-cli",
      aliases: ["gemini", "gemini cli", "gemini code assist", "google gemini cli"]
    },
    {
      canonical: "antigravity-cli",
      aliases: ["antigravity", "antigravity cli", "agy", "ag", "google antigravity"]
    },
    {
      canonical: "openai-api",
      aliases: ["openai", "openai api"]
    },
    {
      canonical: "anthropic-api",
      aliases: ["anthropic", "anthropic claude api", "claude api"]
    },
    {
      canonical: "gemini-api",
      aliases: ["gemini api", "google gemini api"]
    },
    {
      canonical: "openrouter",
      aliases: ["openrouter api"]
    },
    {
      canonical: "openai-compatible",
      aliases: ["compatible", "openai compatible", "openai compatible api"]
    },
    {
      canonical: "ollama",
      aliases: ["ollama local"]
    },
    {
      canonical: "lmstudio",
      aliases: ["lm studio", "lm-studio"]
    },
    {
      canonical: "llama.cpp",
      aliases: ["llama cpp", "llamacpp", "llama-cpp"]
    },
    {
      canonical: "vllm",
      aliases: ["vllm server"]
    }
  ];
  PROVIDER_ALIASES = Object.fromEntries(PROVIDER_ALIAS_ENTRIES.flatMap((entry) => [
    [normalizeProviderInput(entry.canonical), entry.canonical],
    [entry.canonical, entry.canonical],
    ...entry.aliases.map((alias) => [normalizeProviderInput(alias), entry.canonical])
  ]));
  PROVIDER_FAMILIES = {
    subscription: "subscription",
    "anthropic-api": "anthropic",
    "claude-code-cli": "anthropic",
    "openai-api": "openai",
    "codex-cli": "openai",
    "gemini-api": "google",
    "gemini-cli": "google",
    "antigravity-cli": "google",
    openrouter: "openai-compatible",
    "openai-compatible": "openai-compatible",
    lmstudio: "openai-compatible",
    "llama.cpp": "openai-compatible",
    vllm: "openai-compatible",
    ollama: "ollama"
  };
  PROVIDER_MODELS = {
    subscription: [],
    "codex-cli": [
      { id: "codex/gpt-5.5", displayName: "GPT-5.5 (Codex CLI)", description: "Subscription model through official Codex CLI login", isDefault: true },
      { id: "codex/gpt-5.4", displayName: "GPT-5.4 (Codex CLI)", description: "Subscription model through official Codex CLI login" },
      { id: "codex/gpt-5.4-mini", displayName: "GPT-5.4 Mini (Codex CLI)", description: "Fast subscription model through official Codex CLI login" },
      { id: "codex/gpt-4o", displayName: "GPT-4o (Codex CLI)", description: "Subscription model through official Codex CLI login" },
      { id: "codex/gpt-4o-mini", displayName: "GPT-4o Mini (Codex CLI)", description: "Fast subscription model through official Codex CLI login" },
      { id: "codex/o1", displayName: "o1 (Codex CLI)", description: "Reasoning model through official Codex CLI login" },
      { id: "codex/o3-mini", displayName: "o3-mini (Codex CLI)", description: "Fast reasoning model through official Codex CLI login" }
    ],
    "claude-code-cli": [
      { id: "claude-code/sonnet", displayName: "Claude Sonnet (Claude Code)", description: "Claude Code CLI alias resolved by the official CLI", isDefault: true },
      { id: "claude-code/opus", displayName: "Claude Opus (Claude Code)", description: "Claude Code CLI alias; requires Opus access on the signed-in account" },
      { id: "claude-code/fable", displayName: "Claude Fable (Claude Code)", description: "Claude Code CLI alias resolved by the official CLI where available" }
    ],
    "gemini-cli": [
      { id: "gemini-cli/gemini-2.5-pro", displayName: "Gemini 2.5 Pro (Gemini CLI)", description: "Subscription model through official Gemini CLI login", isDefault: true },
      { id: "gemini-cli/gemini-2.5-flash", displayName: "Gemini 2.5 Flash (Gemini CLI)", description: "Subscription model through official Gemini CLI login" },
      { id: "gemini-cli/gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash Lite (Gemini CLI)", description: "Subscription model through official Gemini CLI login" }
    ],
    "antigravity-cli": [
      { id: "antigravity/gemini-3.5-flash", displayName: "Gemini 3.5 Flash (Antigravity)", description: "Subscription model through official Antigravity login", isDefault: true },
      { id: "antigravity/gemini-2.5-pro", displayName: "Gemini 2.5 Pro (Antigravity)", description: "Subscription model through official Antigravity login" },
      { id: "antigravity/gemini-2.5-flash", displayName: "Gemini 2.5 Flash (Antigravity)", description: "Subscription model through official Antigravity login" }
    ],
    "openai-api": [
      { id: "gpt-5.5", displayName: "GPT-5.5", description: "Latest OpenAI model", isDefault: true },
      { id: "gpt-5.4", displayName: "GPT-5.4", description: "Advanced reasoning and coding" },
      { id: "gpt-5.4-mini", displayName: "GPT-5.4 Mini", description: "Fast, efficient variant" },
      { id: "gpt-4o", displayName: "GPT-4o", description: "Previous generation flagship" },
      { id: "gpt-4o-mini", displayName: "GPT-4o Mini", description: "Fast GPT-4o variant" },
      { id: "o1", displayName: "o1", description: "Deep reasoning model" },
      { id: "o3-mini", displayName: "o3-mini", description: "Fast reasoning model" }
    ],
    "anthropic-api": [
      { id: "claude-sonnet-5", displayName: "Claude Sonnet 5", description: "Balanced performance and speed", isDefault: true },
      { id: "claude-opus-4-8", displayName: "Claude Opus 4.8", description: "Most powerful Claude model" },
      { id: "claude-opus-4-7", displayName: "Claude Opus 4.7", description: "High-end reasoning" },
      { id: "claude-opus-4-6", displayName: "Claude Opus 4.6", description: "Advanced problem solving" },
      { id: "claude-opus-4-5", displayName: "Claude Opus 4.5", description: "Previous Opus generation" },
      { id: "claude-sonnet-4-6", displayName: "Claude Sonnet 4.6", description: "Fast Sonnet variant" },
      { id: "claude-sonnet-4-5", displayName: "Claude Sonnet 4.5", description: "Previous Sonnet generation" },
      { id: "claude-haiku-4-5", displayName: "Claude Haiku 4.5", description: "Fastest Claude model" }
    ],
    "gemini-api": [
      { id: "gemini-3.5-flash", displayName: "Gemini 3.5 Flash", description: "Most intelligent for agentic tasks", isDefault: true },
      { id: "gemini-3.1-pro", displayName: "Gemini 3.1 Pro", description: "Advanced problem solving (preview)" },
      { id: "gemini-3.1-flash-lite", displayName: "Gemini 3.1 Flash Lite", description: "Budget-friendly performance" },
      { id: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", description: "Complex reasoning and coding" },
      { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", description: "Low-latency tasks" },
      { id: "gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash Lite", description: "Fastest Gemini model" }
    ],
    openrouter: [
      { id: "openai/gpt-5.5", displayName: "GPT-5.5", description: "OpenAI GPT-5.5 via OpenRouter", isDefault: true },
      { id: "openai/gpt-5.4", displayName: "GPT-5.4", description: "OpenAI GPT-5.4 via OpenRouter" },
      { id: "openai/gpt-4o", displayName: "GPT-4o", description: "OpenAI GPT-4o via OpenRouter" },
      { id: "anthropic/claude-sonnet-5", displayName: "Claude Sonnet 5", description: "Anthropic Claude via OpenRouter" },
      { id: "anthropic/claude-opus-4-8", displayName: "Claude Opus 4.8", description: "Anthropic Claude via OpenRouter" },
      { id: "google/gemini-3.5-flash", displayName: "Gemini 3.5 Flash", description: "Google Gemini via OpenRouter" },
      { id: "google/gemini-2.5-pro", displayName: "Gemini 2.5 Pro", description: "Google Gemini via OpenRouter" }
    ],
    "openai-compatible": [
      { id: "custom", displayName: "Custom Model", description: "Model name from provider endpoint", isDynamic: true }
    ],
    ollama: [
      { id: "dynamic", displayName: "Discovered Models", description: "Models discovered from Ollama server", isDynamic: true, isDefault: true }
    ],
    lmstudio: [
      { id: "dynamic", displayName: "Discovered Models", description: "Models discovered from LM Studio server", isDynamic: true, isDefault: true }
    ],
    "llama.cpp": [
      { id: "dynamic", displayName: "Discovered Models", description: "Models discovered from llama.cpp server", isDynamic: true, isDefault: true }
    ],
    vllm: [
      { id: "dynamic", displayName: "Discovered Models", description: "Models discovered from vLLM server", isDynamic: true, isDefault: true }
    ]
  };
  cachedModelsByProvider = new Map;
  validateProviderModelCompatibility = validateProviderModelPair;
});

// src/utils/model/providers.ts
function getAPIProvider() {
  return getRuntimeProviderId() === "ollama" ? "ollama" : "foundry";
}
function getAPIProviderForStatsig() {
  return getAPIProvider();
}
function isFirstPartyURHQBaseUrl() {
  return true;
}
var init_providers = __esm(() => {
  init_providerRegistry();
});

// src/utils/model/modelStrings.ts
function getBuiltinModelStrings(provider) {
  const out = {};
  for (const key of MODEL_KEYS) {
    out[key] = ALL_MODEL_CONFIGS[key][provider];
  }
  return out;
}
async function getBedrockModelStrings() {
  const fallback = getBuiltinModelStrings("bedrock");
  let profiles;
  try {
    profiles = await getBedrockInferenceProfiles();
  } catch (error) {
    logError(error);
    return fallback;
  }
  if (!profiles?.length) {
    return fallback;
  }
  const out = {};
  for (const key of MODEL_KEYS) {
    const needle = ALL_MODEL_CONFIGS[key].firstParty;
    out[key] = findFirstMatch(profiles, needle) || fallback[key];
  }
  return out;
}
function applyModelOverrides(ms) {
  const overrides = getInitialSettings().modelOverrides;
  if (!overrides) {
    return ms;
  }
  const out = { ...ms };
  for (const [canonicalId, override] of Object.entries(overrides)) {
    const key = CANONICAL_ID_TO_KEY[canonicalId];
    if (key && override) {
      out[key] = override;
    }
  }
  return out;
}
function resolveOverriddenModel(modelId) {
  let overrides;
  try {
    overrides = getInitialSettings().modelOverrides;
  } catch {
    return modelId;
  }
  if (!overrides) {
    return modelId;
  }
  for (const [canonicalId, override] of Object.entries(overrides)) {
    if (override === modelId) {
      return canonicalId;
    }
  }
  return modelId;
}
function initModelStrings() {
  const ms = getModelStrings();
  if (ms !== null) {
    return;
  }
  if (getAPIProvider() !== "bedrock") {
    setModelStrings(getBuiltinModelStrings(getAPIProvider()));
    return;
  }
  updateBedrockModelStrings();
}
function getModelStrings2() {
  const ms = getModelStrings();
  if (ms === null) {
    initModelStrings();
    return applyModelOverrides(getBuiltinModelStrings(getAPIProvider()));
  }
  return applyModelOverrides(ms);
}
var MODEL_KEYS, updateBedrockModelStrings;
var init_modelStrings = __esm(() => {
  init_state();
  init_log();
  init_sequential();
  init_settings2();
  init_bedrock();
  init_configs();
  init_providers();
  MODEL_KEYS = Object.keys(ALL_MODEL_CONFIGS);
  updateBedrockModelStrings = sequential(async () => {
    if (getModelStrings() !== null) {
      return;
    }
    try {
      const ms = await getBedrockModelStrings();
      setModelStrings(ms);
    } catch (error) {
      logError(error);
    }
  });
});

// src/utils/billing.ts
function setMockBillingAccessOverride(value) {
  mockBillingAccessOverride = value;
}
function hasURAiBillingAccess() {
  if (mockBillingAccessOverride !== null) {
    return mockBillingAccessOverride;
  }
  if (!isURAISubscriber()) {
    return false;
  }
  const subscriptionType = getSubscriptionType();
  if (subscriptionType === "max" || subscriptionType === "pro") {
    return true;
  }
  const config = getGlobalConfig();
  const orgRole = config.oauthAccount?.organizationRole;
  return !!orgRole && ["admin", "billing", "owner", "primary_owner"].includes(orgRole);
}
var mockBillingAccessOverride = null;
var init_billing = __esm(() => {
  init_auth();
  init_config();
  init_envUtils();
});

// src/services/mockRateLimits.ts
function getMockHeaderless429Message() {
  if (process.env.USER_TYPE !== "ant") {
    return null;
  }
  if (process.env.UR_MOCK_HEADERLESS_429) {
    return process.env.UR_MOCK_HEADERLESS_429;
  }
  if (!mockEnabled) {
    return null;
  }
  return mockHeaderless429Message;
}
function getMockHeaders() {
  if (!mockEnabled || process.env.USER_TYPE !== "ant" || Object.keys(mockHeaders).length === 0) {
    return null;
  }
  return mockHeaders;
}
function clearMockHeaders() {
  mockHeaders = {};
  exceededLimits = [];
  mockSubscriptionType = null;
  mockFastModeRateLimitDurationMs = null;
  mockFastModeRateLimitExpiresAt = null;
  mockHeaderless429Message = null;
  setMockBillingAccessOverride(null);
  mockEnabled = false;
}
function applyMockHeaders(headers) {
  const mock = getMockHeaders();
  if (!mock) {
    return headers;
  }
  const newHeaders = new globalThis.Headers(headers);
  Object.entries(mock).forEach(([key, value]) => {
    if (value !== undefined) {
      newHeaders.set(key, value);
    }
  });
  return newHeaders;
}
function shouldProcessMockLimits() {
  if (process.env.USER_TYPE !== "ant") {
    return false;
  }
  return mockEnabled || Boolean(process.env.UR_MOCK_HEADERLESS_429);
}
function getMockSubscriptionType() {
  if (!mockEnabled || process.env.USER_TYPE !== "ant") {
    return null;
  }
  return mockSubscriptionType || DEFAULT_MOCK_SUBSCRIPTION;
}
function shouldUseMockSubscription() {
  return mockEnabled && mockSubscriptionType !== null && process.env.USER_TYPE === "ant";
}
function isMockFastModeRateLimitScenario() {
  return mockFastModeRateLimitDurationMs !== null;
}
function checkMockFastModeRateLimit(isFastModeActive) {
  if (mockFastModeRateLimitDurationMs === null) {
    return null;
  }
  if (!isFastModeActive) {
    return null;
  }
  if (mockFastModeRateLimitExpiresAt !== null && Date.now() >= mockFastModeRateLimitExpiresAt) {
    clearMockHeaders();
    return null;
  }
  if (mockFastModeRateLimitExpiresAt === null) {
    mockFastModeRateLimitExpiresAt = Date.now() + mockFastModeRateLimitDurationMs;
  }
  const remainingMs = mockFastModeRateLimitExpiresAt - Date.now();
  const headersToSend = { ...mockHeaders };
  headersToSend["retry-after"] = String(Math.max(1, Math.ceil(remainingMs / 1000)));
  return headersToSend;
}
var mockHeaders, mockEnabled = false, mockHeaderless429Message = null, mockSubscriptionType = null, mockFastModeRateLimitDurationMs = null, mockFastModeRateLimitExpiresAt = null, DEFAULT_MOCK_SUBSCRIPTION = "max", exceededLimits;
var init_mockRateLimits = __esm(() => {
  init_billing();
  mockHeaders = {};
  exceededLimits = [];
});

// src/services/oauth/getOauthProfile.ts
async function getOauthProfileFromOauthToken(accessToken) {
  const endpoint = `${getOauthConfig().BASE_API_URL}/api/oauth/profile`;
  try {
    const response = await axios_default.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      timeout: 1e4
    });
    return response.data;
  } catch (error) {
    logError(error);
  }
}
var init_getOauthProfile = __esm(() => {
  init_axios();
  init_oauth();
  init_auth();
  init_config();
  init_log();
});

// src/services/oauth/client.ts
function shouldUseURAIAuth(scopes) {
  return Boolean(scopes?.includes(UR_AI_INFERENCE_SCOPE));
}
function parseScopes(scopeString) {
  return scopeString?.split(" ").filter(Boolean) ?? [];
}
function buildAuthUrl({
  codeChallenge,
  state,
  port,
  isManual,
  loginWithURAi,
  inferenceOnly,
  orgUUID,
  loginHint,
  loginMethod
}) {
  const authUrlBase = loginWithURAi ? getOauthConfig().UR_AI_AUTHORIZE_URL : getOauthConfig().CONSOLE_AUTHORIZE_URL;
  const authUrl = new URL(authUrlBase);
  authUrl.searchParams.append("code", "true");
  authUrl.searchParams.append("client_id", getOauthConfig().CLIENT_ID);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", isManual ? getOauthConfig().MANUAL_REDIRECT_URL : `http://localhost:${port}/callback`);
  const scopesToUse = inferenceOnly ? [UR_AI_INFERENCE_SCOPE] : ALL_OAUTH_SCOPES;
  authUrl.searchParams.append("scope", scopesToUse.join(" "));
  authUrl.searchParams.append("code_challenge", codeChallenge);
  authUrl.searchParams.append("code_challenge_method", "S256");
  authUrl.searchParams.append("state", state);
  if (orgUUID) {
    authUrl.searchParams.append("orgUUID", orgUUID);
  }
  if (loginHint) {
    authUrl.searchParams.append("login_hint", loginHint);
  }
  if (loginMethod) {
    authUrl.searchParams.append("login_method", loginMethod);
  }
  return authUrl.toString();
}
async function exchangeCodeForTokens(authorizationCode, state, codeVerifier, port, useManualRedirect = false, expiresIn) {
  const requestBody = {
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: useManualRedirect ? getOauthConfig().MANUAL_REDIRECT_URL : `http://localhost:${port}/callback`,
    client_id: getOauthConfig().CLIENT_ID,
    code_verifier: codeVerifier,
    state
  };
  if (expiresIn !== undefined) {
    requestBody.expires_in = expiresIn;
  }
  const response = await axios_default.post(getOauthConfig().TOKEN_URL, requestBody, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000
  });
  if (response.status !== 200) {
    throw new Error(response.status === 401 ? "Authentication failed: Invalid authorization code" : `Token exchange failed (${response.status}): ${response.statusText}`);
  }
  logEvent("tengu_oauth_token_exchange_success", {});
  return response.data;
}
async function refreshOAuthToken(refreshToken, { scopes: requestedScopes } = {}) {
  const requestBody = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: getOauthConfig().CLIENT_ID,
    scope: ((requestedScopes?.length) ? requestedScopes : UR_AI_OAUTH_SCOPES).join(" ")
  };
  try {
    const response = await axios_default.post(getOauthConfig().TOKEN_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });
    if (response.status !== 200) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    const data = response.data;
    const {
      access_token: accessToken,
      refresh_token: newRefreshToken = refreshToken,
      expires_in: expiresIn
    } = data;
    const expiresAt = Date.now() + expiresIn * 1000;
    const scopes = parseScopes(data.scope);
    logEvent("tengu_oauth_token_refresh_success", {});
    const config = getGlobalConfig();
    const existing = getURAIOAuthTokens();
    const haveProfileAlready = config.oauthAccount?.billingType !== undefined && config.oauthAccount?.accountCreatedAt !== undefined && config.oauthAccount?.subscriptionCreatedAt !== undefined && existing?.subscriptionType != null && existing?.rateLimitTier != null;
    const profileInfo = haveProfileAlready ? null : await fetchProfileInfo(accessToken);
    if (profileInfo && config.oauthAccount) {
      const updates = {};
      if (profileInfo.displayName !== undefined) {
        updates.displayName = profileInfo.displayName;
      }
      if (typeof profileInfo.hasExtraUsageEnabled === "boolean") {
        updates.hasExtraUsageEnabled = profileInfo.hasExtraUsageEnabled;
      }
      if (profileInfo.billingType !== null) {
        updates.billingType = profileInfo.billingType;
      }
      if (profileInfo.accountCreatedAt !== undefined) {
        updates.accountCreatedAt = profileInfo.accountCreatedAt;
      }
      if (profileInfo.subscriptionCreatedAt !== undefined) {
        updates.subscriptionCreatedAt = profileInfo.subscriptionCreatedAt;
      }
      if (Object.keys(updates).length > 0) {
        saveGlobalConfig((current) => ({
          ...current,
          oauthAccount: current.oauthAccount ? { ...current.oauthAccount, ...updates } : current.oauthAccount
        }));
      }
    }
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
      scopes,
      subscriptionType: profileInfo?.subscriptionType ?? existing?.subscriptionType ?? null,
      rateLimitTier: profileInfo?.rateLimitTier ?? existing?.rateLimitTier ?? null,
      profile: profileInfo?.rawProfile,
      tokenAccount: data.account ? {
        uuid: data.account.uuid,
        emailAddress: data.account.email_address,
        organizationUuid: data.organization?.uuid
      } : undefined
    };
  } catch (error) {
    const responseBody = axios_default.isAxiosError(error) && error.response?.data ? JSON.stringify(error.response.data) : undefined;
    logEvent("tengu_oauth_token_refresh_failure", {
      error: error.message,
      ...responseBody && {
        responseBody
      }
    });
    throw error;
  }
}
async function fetchAndStoreUserRoles(accessToken) {
  const response = await axios_default.get(getOauthConfig().ROLES_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (response.status !== 200) {
    throw new Error(`Failed to fetch user roles: ${response.statusText}`);
  }
  const data = response.data;
  const config = getGlobalConfig();
  if (!config.oauthAccount) {
    throw new Error("OAuth account information not found in config");
  }
  saveGlobalConfig((current) => ({
    ...current,
    oauthAccount: current.oauthAccount ? {
      ...current.oauthAccount,
      organizationRole: data.organization_role,
      workspaceRole: data.workspace_role,
      organizationName: data.organization_name
    } : current.oauthAccount
  }));
  logEvent("tengu_oauth_roles_stored", {
    org_role: data.organization_role
  });
}
async function createAndStoreApiKey(accessToken) {
  try {
    const response = await axios_default.post(getOauthConfig().API_KEY_URL, null, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const apiKey = response.data?.raw_key;
    if (apiKey) {
      await saveApiKey(apiKey);
      logEvent("tengu_oauth_api_key", {
        status: "success",
        statusCode: response.status
      });
      return apiKey;
    }
    return null;
  } catch (error) {
    logEvent("tengu_oauth_api_key", {
      status: "failure",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
function isOAuthTokenExpired(expiresAt) {
  if (expiresAt === null) {
    return false;
  }
  const bufferTime = 5 * 60 * 1000;
  const now = Date.now();
  const expiresWithBuffer = now + bufferTime;
  return expiresWithBuffer >= expiresAt;
}
async function fetchProfileInfo(accessToken) {
  const profile = await getOauthProfileFromOauthToken(accessToken);
  const orgType = profile?.organization?.organization_type;
  let subscriptionType = null;
  switch (orgType) {
    case "ur_max":
      subscriptionType = "max";
      break;
    case "ur_pro":
      subscriptionType = "pro";
      break;
    case "ur_enterprise":
      subscriptionType = "enterprise";
      break;
    case "ur_team":
      subscriptionType = "team";
      break;
    default:
      subscriptionType = null;
      break;
  }
  const result = {
    subscriptionType,
    rateLimitTier: profile?.organization?.rate_limit_tier ?? null,
    hasExtraUsageEnabled: profile?.organization?.has_extra_usage_enabled ?? null,
    billingType: profile?.organization?.billing_type ?? null
  };
  if (profile?.account?.display_name) {
    result.displayName = profile.account.display_name;
  }
  if (profile?.account?.created_at) {
    result.accountCreatedAt = profile.account.created_at;
  }
  if (profile?.organization?.subscription_created_at) {
    result.subscriptionCreatedAt = profile.organization.subscription_created_at;
  }
  logEvent("tengu_oauth_profile_fetch_success", {});
  return { ...result, rawProfile: profile };
}
async function getOrganizationUUID() {
  const globalConfig = getGlobalConfig();
  const orgUUID = globalConfig.oauthAccount?.organizationUuid;
  if (orgUUID) {
    return orgUUID;
  }
  const accessToken = getURAIOAuthTokens()?.accessToken;
  if (accessToken === undefined || !hasProfileScope()) {
    return null;
  }
  const profile = await getOauthProfileFromOauthToken(accessToken);
  const profileOrgUUID = profile?.organization?.uuid;
  if (!profileOrgUUID) {
    return null;
  }
  return profileOrgUUID;
}
async function populateOAuthAccountInfoIfNeeded() {
  const envAccountUuid = process.env.UR_CODE_ACCOUNT_UUID;
  const envUserEmail = process.env.UR_CODE_USER_EMAIL;
  const envOrganizationUuid = process.env.UR_CODE_ORGANIZATION_UUID;
  const hasEnvVars = Boolean(envAccountUuid && envUserEmail && envOrganizationUuid);
  if (envAccountUuid && envUserEmail && envOrganizationUuid) {
    if (!getGlobalConfig().oauthAccount) {
      storeOAuthAccountInfo({
        accountUuid: envAccountUuid,
        emailAddress: envUserEmail,
        organizationUuid: envOrganizationUuid
      });
    }
  }
  await checkAndRefreshOAuthTokenIfNeeded();
  const config = getGlobalConfig();
  if (config.oauthAccount && config.oauthAccount.billingType !== undefined && config.oauthAccount.accountCreatedAt !== undefined && config.oauthAccount.subscriptionCreatedAt !== undefined || !isURAISubscriber() || !hasProfileScope()) {
    return false;
  }
  const tokens = getURAIOAuthTokens();
  if (tokens?.accessToken) {
    const profile = await getOauthProfileFromOauthToken(tokens.accessToken);
    if (profile) {
      if (hasEnvVars) {
        logForDebugging("OAuth profile fetch succeeded, overriding env var account info", { level: "info" });
      }
      storeOAuthAccountInfo({
        accountUuid: profile.account.uuid,
        emailAddress: profile.account.email,
        organizationUuid: profile.organization.uuid,
        displayName: profile.account.display_name || undefined,
        hasExtraUsageEnabled: profile.organization.has_extra_usage_enabled ?? false,
        billingType: profile.organization.billing_type ?? undefined,
        accountCreatedAt: profile.account.created_at,
        subscriptionCreatedAt: profile.organization.subscription_created_at ?? undefined
      });
      return true;
    }
  }
  return false;
}
function storeOAuthAccountInfo({
  accountUuid,
  emailAddress,
  organizationUuid,
  displayName,
  hasExtraUsageEnabled,
  billingType,
  accountCreatedAt,
  subscriptionCreatedAt
}) {
  const accountInfo = {
    accountUuid,
    emailAddress,
    organizationUuid,
    hasExtraUsageEnabled,
    billingType,
    accountCreatedAt,
    subscriptionCreatedAt
  };
  if (displayName) {
    accountInfo.displayName = displayName;
  }
  saveGlobalConfig((current) => {
    if (current.oauthAccount?.accountUuid === accountInfo.accountUuid && current.oauthAccount?.emailAddress === accountInfo.emailAddress && current.oauthAccount?.organizationUuid === accountInfo.organizationUuid && current.oauthAccount?.displayName === accountInfo.displayName && current.oauthAccount?.hasExtraUsageEnabled === accountInfo.hasExtraUsageEnabled && current.oauthAccount?.billingType === accountInfo.billingType && current.oauthAccount?.accountCreatedAt === accountInfo.accountCreatedAt && current.oauthAccount?.subscriptionCreatedAt === accountInfo.subscriptionCreatedAt) {
      return current;
    }
    return { ...current, oauthAccount: accountInfo };
  });
}
var init_client = __esm(() => {
  init_axios();
  init_analytics();
  init_oauth();
  init_auth();
  init_config();
  init_debug();
  init_getOauthProfile();
});

// src/utils/authFileDescriptor.ts
import { mkdirSync, writeFileSync } from "fs";
function maybePersistTokenForSubprocesses(path2, token, tokenName) {
  if (!isEnvTruthy(process.env.UR_CODE_REMOTE)) {
    return;
  }
  try {
    mkdirSync(CCR_TOKEN_DIR, { recursive: true, mode: 448 });
    writeFileSync(path2, token, { encoding: "utf8", mode: 384 });
    logForDebugging(`Persisted ${tokenName} to ${path2} for subprocess access`);
  } catch (error) {
    logForDebugging(`Failed to persist ${tokenName} to disk (non-fatal): ${errorMessage(error)}`, { level: "error" });
  }
}
function readTokenFromWellKnownFile(path2, tokenName) {
  try {
    const fsOps = getFsImplementation();
    const token = fsOps.readFileSync(path2, { encoding: "utf8" }).trim();
    if (!token) {
      return null;
    }
    logForDebugging(`Read ${tokenName} from well-known file ${path2}`);
    return token;
  } catch (error) {
    if (!isENOENT(error)) {
      logForDebugging(`Failed to read ${tokenName} from ${path2}: ${errorMessage(error)}`, { level: "debug" });
    }
    return null;
  }
}
function getCredentialFromFd({
  envVar,
  wellKnownPath,
  label,
  getCached,
  setCached
}) {
  const cached = getCached();
  if (cached !== undefined) {
    return cached;
  }
  const fdEnv = process.env[envVar];
  if (!fdEnv) {
    const fromFile = readTokenFromWellKnownFile(wellKnownPath, label);
    setCached(fromFile);
    return fromFile;
  }
  const fd = parseInt(fdEnv, 10);
  if (Number.isNaN(fd)) {
    logForDebugging(`${envVar} must be a valid file descriptor number, got: ${fdEnv}`, { level: "error" });
    setCached(null);
    return null;
  }
  try {
    const fsOps = getFsImplementation();
    const fdPath = process.platform === "darwin" || process.platform === "freebsd" ? `/dev/fd/${fd}` : `/proc/self/fd/${fd}`;
    const token = fsOps.readFileSync(fdPath, { encoding: "utf8" }).trim();
    if (!token) {
      logForDebugging(`File descriptor contained empty ${label}`, {
        level: "error"
      });
      setCached(null);
      return null;
    }
    logForDebugging(`Successfully read ${label} from file descriptor ${fd}`);
    setCached(token);
    maybePersistTokenForSubprocesses(wellKnownPath, token, label);
    return token;
  } catch (error) {
    logForDebugging(`Failed to read ${label} from file descriptor ${fd}: ${errorMessage(error)}`, { level: "error" });
    const fromFile = readTokenFromWellKnownFile(wellKnownPath, label);
    setCached(fromFile);
    return fromFile;
  }
}
function getOAuthTokenFromFileDescriptor() {
  return getCredentialFromFd({
    envVar: "UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR",
    wellKnownPath: CCR_OAUTH_TOKEN_PATH,
    label: "OAuth token",
    getCached: getOauthTokenFromFd,
    setCached: setOauthTokenFromFd
  });
}
function getApiKeyFromFileDescriptor() {
  return getCredentialFromFd({
    envVar: "UR_CODE_API_KEY_FILE_DESCRIPTOR",
    wellKnownPath: CCR_API_KEY_PATH,
    label: "API key",
    getCached: getApiKeyFromFd,
    setCached: setApiKeyFromFd
  });
}
var CCR_TOKEN_DIR = "/home/ur/.ur/remote", CCR_OAUTH_TOKEN_PATH, CCR_API_KEY_PATH, CCR_SESSION_INGRESS_TOKEN_PATH;
var init_authFileDescriptor = __esm(() => {
  init_state();
  init_debug();
  init_envUtils();
  init_errors();
  init_fsOperations();
  CCR_OAUTH_TOKEN_PATH = `${CCR_TOKEN_DIR}/.oauth_token`;
  CCR_API_KEY_PATH = `${CCR_TOKEN_DIR}/.api_key`;
  CCR_SESSION_INGRESS_TOKEN_PATH = `${CCR_TOKEN_DIR}/.session_ingress_token`;
});

// src/utils/secureStorage/macOsKeychainHelpers.ts
import { createHash } from "crypto";
import { userInfo } from "os";
function getMacOsKeychainStorageServiceName(serviceSuffix = "") {
  const configDir = getURConfigHomeDir();
  const isDefaultDir = !process.env.UR_CONFIG_DIR;
  const dirHash = isDefaultDir ? "" : `-${createHash("sha256").update(configDir).digest("hex").substring(0, 8)}`;
  return `UR${getOauthConfig().OAUTH_FILE_SUFFIX}${serviceSuffix}${dirHash}`;
}
function getUsername() {
  try {
    return process.env.USER || userInfo().username;
  } catch {
    return "ur-user";
  }
}
function clearKeychainCache() {
  keychainCacheState.cache = { data: null, cachedAt: 0 };
  keychainCacheState.generation++;
  keychainCacheState.readInFlight = null;
}
var CREDENTIALS_SERVICE_SUFFIX = "-credentials", KEYCHAIN_CACHE_TTL_MS = 30000, keychainCacheState;
var init_macOsKeychainHelpers = __esm(() => {
  init_oauth();
  init_envUtils();
  keychainCacheState = {
    cache: { data: null, cachedAt: 0 },
    generation: 0,
    readInFlight: null
  };
});

// src/utils/authPortable.ts
async function maybeRemoveApiKeyFromMacOSKeychainThrows() {
  if (process.platform === "darwin") {
    const storageServiceName = getMacOsKeychainStorageServiceName();
    const result = await execa(`security delete-generic-password -a $USER -s "${storageServiceName}"`, { shell: true, reject: false });
    if (result.exitCode !== 0) {
      throw new Error("Failed to delete keychain entry");
    }
  }
}
function normalizeApiKeyForConfig(apiKey) {
  return apiKey.slice(-20);
}
var init_authPortable = __esm(() => {
  init_execa();
  init_macOsKeychainHelpers();
});

// src/utils/aws.ts
function isAwsCredentialsProviderError(err) {
  return err?.name === "CredentialsProviderError";
}
function isValidAwsStsOutput(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const output = obj;
  if (!output.Credentials || typeof output.Credentials !== "object") {
    return false;
  }
  const credentials = output.Credentials;
  return typeof credentials.AccessKeyId === "string" && typeof credentials.SecretAccessKey === "string" && typeof credentials.SessionToken === "string" && credentials.AccessKeyId.length > 0 && credentials.SecretAccessKey.length > 0 && credentials.SessionToken.length > 0;
}
async function checkStsCallerIdentity() {}
async function clearAwsIniCache() {}
var init_aws = () => {};

// src/utils/awsAuthStatusManager.ts
class AwsAuthStatusManager {
  static instance = null;
  status = {
    isAuthenticating: false,
    output: []
  };
  changed = createSignal();
  static getInstance() {
    if (!AwsAuthStatusManager.instance) {
      AwsAuthStatusManager.instance = new AwsAuthStatusManager;
    }
    return AwsAuthStatusManager.instance;
  }
  getStatus() {
    return {
      ...this.status,
      output: [...this.status.output]
    };
  }
  startAuthentication() {
    this.status = {
      isAuthenticating: true,
      output: []
    };
    this.changed.emit(this.getStatus());
  }
  addOutput(line) {
    this.status.output.push(line);
    this.changed.emit(this.getStatus());
  }
  setError(error) {
    this.status.error = error;
    this.changed.emit(this.getStatus());
  }
  endAuthentication(success) {
    if (success) {
      this.status = {
        isAuthenticating: false,
        output: []
      };
    } else {
      this.status.isAuthenticating = false;
    }
    this.changed.emit(this.getStatus());
  }
  subscribe = this.changed.subscribe;
  static reset() {
    if (AwsAuthStatusManager.instance) {
      AwsAuthStatusManager.instance.changed.clear();
      AwsAuthStatusManager.instance = null;
    }
  }
}
var init_awsAuthStatusManager = __esm(() => {
  init_signal();
});

// src/constants/betas.ts
var UR_CODE_20250219_BETA_HEADER = "ur-20250219", INTERLEAVED_THINKING_BETA_HEADER = "interleaved-thinking-2025-05-14", CONTEXT_1M_BETA_HEADER = "context-1m-2025-08-07", CONTEXT_MANAGEMENT_BETA_HEADER = "context-management-2025-06-27", STRUCTURED_OUTPUTS_BETA_HEADER = "structured-outputs-2025-12-15", WEB_SEARCH_BETA_HEADER = "web-search-2025-03-05", TOOL_SEARCH_BETA_HEADER_1P = "advanced-tool-use-2025-11-20", TOOL_SEARCH_BETA_HEADER_3P = "tool-search-tool-2025-10-19", EFFORT_BETA_HEADER = "effort-2025-11-24", TASK_BUDGETS_BETA_HEADER = "task-budgets-2026-03-13", PROMPT_CACHING_SCOPE_BETA_HEADER = "prompt-caching-scope-2026-01-05", FAST_MODE_BETA_HEADER = "fast-mode-2026-02-01", REDACT_THINKING_BETA_HEADER = "redact-thinking-2026-02-12", TOKEN_EFFICIENT_TOOLS_BETA_HEADER = "token-efficient-tools-2026-03-28", SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER = "", AFK_MODE_BETA_HEADER = "", CLI_INTERNAL_BETA_HEADER, ADVISOR_BETA_HEADER = "advisor-tool-2026-03-01", BEDROCK_EXTRA_PARAMS_HEADERS, VERTEX_COUNT_TOKENS_ALLOWED_BETAS;
var init_betas = __esm(() => {
  CLI_INTERNAL_BETA_HEADER = process.env.USER_TYPE === "ant" ? "cli-internal-2026-02-09" : "";
  BEDROCK_EXTRA_PARAMS_HEADERS = new Set([
    INTERLEAVED_THINKING_BETA_HEADER,
    CONTEXT_1M_BETA_HEADER,
    TOOL_SEARCH_BETA_HEADER_3P
  ]);
  VERTEX_COUNT_TOKENS_ALLOWED_BETAS = new Set([
    UR_CODE_20250219_BETA_HEADER,
    INTERLEAVED_THINKING_BETA_HEADER,
    CONTEXT_MANAGEMENT_BETA_HEADER
  ]);
});

// src/utils/model/antModels.ts
function getAntModelOverrideConfig() {
  if (process.env.USER_TYPE !== "ant") {
    return null;
  }
  return getFeatureValue_CACHED_MAY_BE_STALE("tengu_ant_model_override", null);
}
function getAntModels() {
  if (process.env.USER_TYPE !== "ant") {
    return [];
  }
  return getAntModelOverrideConfig()?.antModels ?? [];
}
function resolveAntModel(model) {
  if (process.env.USER_TYPE !== "ant") {
    return;
  }
  if (model === undefined) {
    return;
  }
  const lower = model.toLowerCase();
  return getAntModels().find((m) => m.alias === model || lower.includes(m.model.toLowerCase()));
}
var init_antModels = __esm(() => {
  init_growthbook();
});

// src/utils/secureStorage/fallbackStorage.ts
function createFallbackStorage(primary, secondary) {
  return {
    name: `${primary.name}-with-${secondary.name}-fallback`,
    read() {
      const result = primary.read();
      if (result !== null && result !== undefined) {
        return result;
      }
      return secondary.read() || {};
    },
    async readAsync() {
      const result = await primary.readAsync();
      if (result !== null && result !== undefined) {
        return result;
      }
      return await secondary.readAsync() || {};
    },
    update(data) {
      const primaryDataBefore = primary.read();
      const result = primary.update(data);
      if (result.success) {
        if (primaryDataBefore === null) {
          secondary.delete();
        }
        return result;
      }
      const fallbackResult2 = secondary.update(data);
      if (fallbackResult2.success) {
        if (primaryDataBefore !== null) {
          primary.delete();
        }
        return {
          success: true,
          warning: fallbackResult2.warning
        };
      }
      return { success: false };
    },
    delete() {
      const primarySuccess = primary.delete();
      const secondarySuccess = secondary.delete();
      return primarySuccess || secondarySuccess;
    }
  };
}
var init_fallbackStorage = () => {};

// src/utils/secureStorage/macOsKeychainStorage.ts
async function doReadAsync() {
  try {
    const storageServiceName = getMacOsKeychainStorageServiceName(CREDENTIALS_SERVICE_SUFFIX);
    const username = getUsername();
    const { stdout, code } = await execFileNoThrow("security", ["find-generic-password", "-a", username, "-w", "-s", storageServiceName], { useCwd: false, preserveOutputOnError: false });
    if (code === 0 && stdout) {
      return jsonParse(stdout.trim());
    }
  } catch (_e) {}
  return null;
}
function isMacOsKeychainLocked() {
  if (keychainLockedCache !== undefined)
    return keychainLockedCache;
  if (process.platform !== "darwin") {
    keychainLockedCache = false;
    return false;
  }
  try {
    const result = execaSync("security", ["show-keychain-info"], {
      reject: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    keychainLockedCache = result.exitCode === 36;
  } catch {
    keychainLockedCache = false;
  }
  return keychainLockedCache;
}
var SECURITY_STDIN_LINE_LIMIT, macOsKeychainStorage, keychainLockedCache;
var init_macOsKeychainStorage = __esm(() => {
  init_execa();
  init_debug();
  init_execFileNoThrow();
  init_execFileNoThrowPortable();
  init_slowOperations();
  init_macOsKeychainHelpers();
  SECURITY_STDIN_LINE_LIMIT = 4096 - 64;
  macOsKeychainStorage = {
    name: "keychain",
    read() {
      const prev = keychainCacheState.cache;
      if (Date.now() - prev.cachedAt < KEYCHAIN_CACHE_TTL_MS) {
        return prev.data;
      }
      try {
        const storageServiceName = getMacOsKeychainStorageServiceName(CREDENTIALS_SERVICE_SUFFIX);
        const username = getUsername();
        const result = execSyncWithDefaults_DEPRECATED(`security find-generic-password -a "${username}" -w -s "${storageServiceName}"`);
        if (result) {
          const data = jsonParse(result);
          keychainCacheState.cache = { data, cachedAt: Date.now() };
          return data;
        }
      } catch (_e) {}
      if (prev.data !== null) {
        logForDebugging("[keychain] read failed; serving stale cache", {
          level: "warn"
        });
        keychainCacheState.cache = { data: prev.data, cachedAt: Date.now() };
        return prev.data;
      }
      keychainCacheState.cache = { data: null, cachedAt: Date.now() };
      return null;
    },
    async readAsync() {
      const prev = keychainCacheState.cache;
      if (Date.now() - prev.cachedAt < KEYCHAIN_CACHE_TTL_MS) {
        return prev.data;
      }
      if (keychainCacheState.readInFlight) {
        return keychainCacheState.readInFlight;
      }
      const gen = keychainCacheState.generation;
      const promise = doReadAsync().then((data) => {
        if (gen === keychainCacheState.generation) {
          if (data === null && prev.data !== null) {
            logForDebugging("[keychain] readAsync failed; serving stale cache", {
              level: "warn"
            });
          }
          const next = data ?? prev.data;
          keychainCacheState.cache = { data: next, cachedAt: Date.now() };
          keychainCacheState.readInFlight = null;
          return next;
        }
        return data;
      });
      keychainCacheState.readInFlight = promise;
      return promise;
    },
    update(data) {
      clearKeychainCache();
      try {
        const storageServiceName = getMacOsKeychainStorageServiceName(CREDENTIALS_SERVICE_SUFFIX);
        const username = getUsername();
        const jsonString = jsonStringify(data);
        const hexValue = Buffer.from(jsonString, "utf-8").toString("hex");
        const command = `add-generic-password -U -a "${username}" -s "${storageServiceName}" -X "${hexValue}"
`;
        let result;
        if (command.length <= SECURITY_STDIN_LINE_LIMIT) {
          result = execaSync("security", ["-i"], {
            input: command,
            stdio: ["pipe", "pipe", "pipe"],
            reject: false
          });
        } else {
          logForDebugging(`Keychain payload (${jsonString.length}B JSON) exceeds security -i stdin limit; using argv`, { level: "warn" });
          result = execaSync("security", [
            "add-generic-password",
            "-U",
            "-a",
            username,
            "-s",
            storageServiceName,
            "-X",
            hexValue
          ], { stdio: ["ignore", "pipe", "pipe"], reject: false });
        }
        if (result.exitCode !== 0) {
          return { success: false };
        }
        keychainCacheState.cache = { data, cachedAt: Date.now() };
        return { success: true };
      } catch (_e) {
        return { success: false };
      }
    },
    delete() {
      clearKeychainCache();
      try {
        const storageServiceName = getMacOsKeychainStorageServiceName(CREDENTIALS_SERVICE_SUFFIX);
        const username = getUsername();
        execSyncWithDefaults_DEPRECATED(`security delete-generic-password -a "${username}" -s "${storageServiceName}"`);
        return true;
      } catch (_e) {
        return false;
      }
    }
  };
});

// src/utils/secureStorage/plainTextStorage.ts
import { chmodSync } from "fs";
import { join as join8 } from "path";
function getStoragePath() {
  const storageDir = getURConfigHomeDir();
  const storageFileName = ".credentials.json";
  return { storageDir, storagePath: join8(storageDir, storageFileName) };
}
var plainTextStorage;
var init_plainTextStorage = __esm(() => {
  init_envUtils();
  init_errors();
  init_fsOperations();
  init_slowOperations();
  plainTextStorage = {
    name: "plaintext",
    read() {
      const { storagePath } = getStoragePath();
      try {
        const data = getFsImplementation().readFileSync(storagePath, {
          encoding: "utf8"
        });
        return jsonParse(data);
      } catch {
        return null;
      }
    },
    async readAsync() {
      const { storagePath } = getStoragePath();
      try {
        const data = await getFsImplementation().readFile(storagePath, {
          encoding: "utf8"
        });
        return jsonParse(data);
      } catch {
        return null;
      }
    },
    update(data) {
      try {
        const { storageDir, storagePath } = getStoragePath();
        try {
          getFsImplementation().mkdirSync(storageDir);
        } catch (e) {
          const code = getErrnoCode(e);
          if (code !== "EEXIST") {
            throw e;
          }
        }
        writeFileSync_DEPRECATED(storagePath, jsonStringify(data), {
          encoding: "utf8",
          flush: false
        });
        chmodSync(storagePath, 384);
        return {
          success: true,
          warning: "Warning: Storing credentials in plaintext."
        };
      } catch {
        return { success: false };
      }
    },
    delete() {
      const { storagePath } = getStoragePath();
      try {
        getFsImplementation().unlinkSync(storagePath);
        return true;
      } catch (e) {
        const code = getErrnoCode(e);
        if (code === "ENOENT") {
          return true;
        }
        return false;
      }
    }
  };
});

// src/utils/secureStorage/index.ts
function getSecureStorage() {
  if (process.platform === "darwin") {
    return createFallbackStorage(macOsKeychainStorage, plainTextStorage);
  }
  return plainTextStorage;
}
var init_secureStorage = __esm(() => {
  init_fallbackStorage();
  init_macOsKeychainStorage();
  init_plainTextStorage();
});

// src/services/providers/providerCredentials.ts
function store(options) {
  return options.storage ?? getSecureStorage();
}
function readCredentials(storage) {
  const data = storage.read() ?? {};
  const creds = data[STORE_KEY];
  return creds && typeof creds === "object" ? { ...creds } : {};
}
function writeCredentials(storage, creds) {
  const data = storage.read() ?? {};
  return storage.update({ ...data, [STORE_KEY]: creds });
}
function setProviderApiKey(providerId, apiKey, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return { ok: false, message: `Unknown provider "${providerId}". Run: ur provider list` };
  }
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, message: "API key is empty." };
  }
  const storage = store(options);
  const creds = readCredentials(storage);
  creds[provider] = { apiKey: key, updatedAt: new Date().toISOString() };
  const result = writeCredentials(storage, creds);
  if (!result.success) {
    return { ok: false, message: result.warning ?? "Failed to store API key." };
  }
  return { ok: true, message: `Stored API key for ${provider} in ${storage.name}.` };
}
function getStoredProviderApiKey(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider)
    return;
  return readCredentials(store(options))[provider]?.apiKey;
}
function getProviderApiKey(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider)
    return;
  const stored = getStoredProviderApiKey(provider, options);
  if (stored)
    return stored;
  const env3 = options.env ?? process.env;
  const envKey = getProviderDefinition(provider).envKey;
  return envKey ? env3[envKey] : undefined;
}
function hasStoredProviderApiKey(providerId, options = {}) {
  return Boolean(getStoredProviderApiKey(providerId, options));
}
function clearProviderApiKey(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    return { ok: false, message: `Unknown provider "${providerId}". Run: ur provider list` };
  }
  const storage = store(options);
  const creds = readCredentials(storage);
  if (!creds[provider]?.apiKey) {
    return { ok: true, message: `No stored API key for ${provider}.` };
  }
  delete creds[provider];
  const result = writeCredentials(storage, creds);
  if (!result.success) {
    return { ok: false, message: result.warning ?? "Failed to clear API key." };
  }
  return { ok: true, message: `Cleared stored API key for ${provider}.` };
}
function getProviderApiKeySource(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider)
    return "none";
  if (getStoredProviderApiKey(provider, options))
    return "stored";
  const env3 = options.env ?? process.env;
  const envKey = getProviderDefinition(provider).envKey;
  if (envKey && env3[envKey])
    return "env";
  return "none";
}
var STORE_KEY = "providerCredentials";
var init_providerCredentials = __esm(() => {
  init_secureStorage();
  init_providerRegistry();
});

// src/services/api/providerClient.ts
function resolveActiveProviderModel(options = {}) {
  const settings = options.settings ?? getInitialSettings();
  const providerSettings = getActiveProviderSettings(settings);
  const providerId = providerSettings.active ?? DEFAULT_PROVIDER_ID;
  const provider = getProviderDefinition(providerId);
  if (!provider) {
    throw new Error(`Provider "${providerId}" is selected, but no runtime provider is registered. Run: ur provider list`);
  }
  const runtimeBlock = getProviderRuntimeBlockReason(providerId);
  if (runtimeBlock) {
    throw new Error(runtimeBlock);
  }
  const configuredModel = providerSettings.model;
  const defaultModel = getDefaultModelForProvider(providerId);
  const model = options.model ?? configuredModel ?? defaultModel;
  const modelSelectionSource = options.model ? "requested" : configuredModel ? "configured" : "default";
  if (!model) {
    throw new Error(`Provider "${providerId}" is selected, but no model is selected or discoverable. Run /model and choose a model from ${providerId}.`);
  }
  const validation = validateProviderModelPair(providerId, model, {
    allowUncachedDynamic: provider.modelDiscoveryType === "live"
  });
  if (validation.valid === false) {
    throw new Error(formatRuntimeDispatchError({
      providerId,
      model,
      why: validation.error,
      validModels: validation.validModels,
      suggestedModel: validation.suggestedModel
    }));
  }
  return {
    providerId,
    providerName: provider.displayName,
    accessType: provider.accessType,
    accessTypeLabel: getProviderAccessTypeLabel(provider),
    credentialType: provider.credentialType,
    model,
    modelSelectionSource,
    runtimeBackend: getProviderRuntimeBackend(providerId)
  };
}
function formatRuntimeDispatchError({
  providerId,
  model,
  why,
  validModels,
  suggestedModel
}) {
  const provider = resolveProviderId(providerId) ?? String(providerId);
  const valid = validModels?.length ? validModels.join(", ") : getValidModelIdsForProvider(provider).join(", ") || "(no models discovered)";
  const suggestion = suggestedModel ?? getDefaultModelForProvider(provider) ?? "<valid-model>";
  return `Provider "${provider}" is selected with model "${model}", but runtime dispatch cannot use that provider/model pair. Reason: ${why}. Valid models for ${provider}: ${valid}. Run /model and choose a model from ${provider}, or run: ur config set model ${suggestion}`;
}
async function createProviderClient(providerId, options = {}) {
  const resolved = resolveProviderId(providerId);
  if (!resolved) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  const provider = getProviderDefinition(resolved);
  const runtimeBlock = getProviderRuntimeBlockReason(resolved);
  if (runtimeBlock) {
    throw new Error(runtimeBlock);
  }
  let client;
  switch (provider.accessType) {
    case "local":
      client = await createLocalProviderClient(resolved, options);
      break;
    case "server":
      client = await createOpenAICompatibleProviderClient(resolved, options);
      break;
    case "subscription":
      client = await createSubscriptionClient(resolved, options);
      break;
    case "api":
      if (provider.endpointKind === "openai-compatible") {
        client = await createOpenAICompatibleProviderClient(resolved, options);
      } else {
        client = await createAPIClient(resolved, options);
      }
      break;
    default:
      throw new Error(`Unsupported provider access type: ${provider.accessType}`);
  }
  return tagClient(client, resolved);
}
function tagClient(client, providerId) {
  Object.defineProperties(client, {
    __urProviderId: { value: providerId, enumerable: false },
    __urRuntimeBackend: {
      value: getProviderRuntimeBackend(providerId),
      enumerable: false
    }
  });
  return client;
}
async function createLocalProviderClient(providerId, options = {}) {
  if (providerId !== "ollama") {
    throw new Error(`Provider "${providerId}" is not an Ollama runtime. Runtime backend is ${getProviderRuntimeBackend(providerId)}.`);
  }
  const { createOllamaURHQClient } = await import("./ollama-7b6q48at.js");
  return createOllamaURHQClient();
}
async function createOpenAICompatibleProviderClient(providerId, options = {}) {
  const settings = getInitialSettings();
  const providerSettings = getActiveProviderSettings(settings);
  const provider = getProviderDefinition(providerId);
  const baseUrl = providerSettings.active === providerId ? providerSettings.baseUrl ?? provider.defaultBaseUrl : provider.defaultBaseUrl;
  if (!baseUrl) {
    throw new Error(`Provider "${providerId}" requires a base URL. Run: ur config set base_url <url>`);
  }
  const apiKey = options.apiKey ?? (provider.envKey ? getProviderApiKey(providerId) : undefined);
  const { createOpenAICompatibleClient } = await import("./openaiCompatible-xcq3st16.js");
  return await createOpenAICompatibleClient({
    baseUrl,
    apiKey,
    maxRetries: options.maxRetries ?? 3
  });
}
async function createSubscriptionClient(providerId, options = {}) {
  const provider = getProviderDefinition(providerId);
  const runtimeBlock = getProviderRuntimeBlockReason(providerId);
  if (runtimeBlock) {
    throw new Error(runtimeBlock);
  }
  const settings = getInitialSettings();
  const providerSettings = getActiveProviderSettings(settings);
  const { which: which2 } = await import("./which-1amqwew1.js");
  let commandPath = providerSettings.commandPath ?? null;
  if (!commandPath) {
    for (const candidate of provider.commandCandidates ?? []) {
      commandPath = await which2(candidate);
      if (commandPath)
        break;
    }
  }
  if (!commandPath) {
    throw new Error(`Provider "${providerId}" is selected with model "${options.model ?? providerSettings.model ?? "unknown"}", but runtime backend "${getProviderRuntimeBackend(providerId)}" is unavailable. Official CLI not found. Tried: ${provider.commandCandidates?.join(", ") || providerId}. Run: ur provider doctor ${providerId}`);
  }
  const { createURHQSubscriptionClient } = await import("./urhqSubscription-j4r0e2dp.js");
  return createURHQSubscriptionClient(providerId, {
    commandPath,
    maxRetries: options.maxRetries ?? 3,
    model: options.model
  });
}
async function createAPIClient(providerId, options = {}) {
  const provider = getProviderDefinition(providerId);
  const settings = getInitialSettings();
  const providerSettings = getActiveProviderSettings(settings);
  const apiKey = options.apiKey ?? getProviderApiKey(providerId);
  if (provider.envKey && !apiKey) {
    throw new Error(`Provider "${providerId}" is selected with model "${options.model ?? providerSettings.model ?? "unknown"}", but it is not connected: no stored API key and ${provider.envKey} is not set. Connect once with: ur connect ${providerId} (or /connect inside UR), or set ${provider.envKey}. Run: ur provider doctor ${providerId}`);
  }
  if (providerId === "openrouter") {
    const { createOpenRouterClient } = await import("./openrouter-yw19s8mw.js");
    return await createOpenRouterClient({
      apiKey,
      maxRetries: options.maxRetries ?? 3,
      model: options.model
    });
  }
  const { createStandardAPIClient } = await import("./standardAPI-6wzz4w59.js");
  return await createStandardAPIClient({
    providerId,
    apiKey,
    baseUrl: providerSettings.active === providerId ? providerSettings.baseUrl ?? provider.defaultBaseUrl : provider.defaultBaseUrl,
    maxRetries: options.maxRetries ?? 3,
    model: options.model
  });
}
var ProviderResponseParseError, ProviderCapabilityError;
var init_providerClient = __esm(() => {
  init_providerRegistry();
  init_settings2();
  init_providerCredentials();
  ProviderResponseParseError = class ProviderResponseParseError extends Error {
    details;
    constructor(message, details) {
      super(message);
      this.name = "ProviderResponseParseError";
      this.details = details;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  };
  ProviderCapabilityError = class ProviderCapabilityError extends Error {
    details;
    constructor(message, details) {
      super(message);
      this.name = "ProviderCapabilityError";
      this.details = details;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  };
});

// src/services/api/client.ts
async function getURHQClient({
  apiKey,
  maxRetries,
  model,
  fetchOverride,
  source
}) {
  const runtime = resolveActiveProviderModel({ model, source });
  return createProviderClient(runtime.providerId, {
    apiKey,
    maxRetries,
    model: runtime.model,
    fetchOverride,
    source
  });
}
var CLIENT_REQUEST_ID_HEADER = "x-client-request-id";
var init_client2 = __esm(() => {
  init_providerClient();
});

// src/utils/model/modelCapabilities.ts
import { readFileSync as readFileSync2 } from "fs";
import { join as join9 } from "path";
function getCacheDir() {
  return join9(getURConfigHomeDir(), "cache");
}
function getCachePath() {
  return join9(getCacheDir(), "model-capabilities.json");
}
function isModelCapabilitiesEligible() {
  if (process.env.USER_TYPE !== "ant")
    return false;
  if (getAPIProvider() !== "firstParty")
    return false;
  if (!isFirstPartyURHQBaseUrl())
    return false;
  return true;
}
function getModelCapability(model) {
  if (!isModelCapabilitiesEligible())
    return;
  const cached = loadCache(getCachePath());
  if (!cached || cached.length === 0)
    return;
  const m = model.toLowerCase();
  const exact = cached.find((c) => c.id.toLowerCase() === m);
  if (exact)
    return exact;
  return cached.find((c) => m.includes(c.id.toLowerCase()));
}
var ModelCapabilitySchema, CacheFileSchema, loadCache;
var init_modelCapabilities = __esm(() => {
  init_memoize();
  init_v4();
  init_oauth();
  init_client2();
  init_auth();
  init_debug();
  init_envUtils();
  init_json();
  init_lazySchema();
  init_privacyLevel();
  init_slowOperations();
  init_providers();
  ModelCapabilitySchema = lazySchema(() => exports_external.object({
    id: exports_external.string(),
    max_input_tokens: exports_external.number().optional(),
    max_tokens: exports_external.number().optional()
  }).strip());
  CacheFileSchema = lazySchema(() => exports_external.object({
    models: exports_external.array(ModelCapabilitySchema()),
    timestamp: exports_external.number()
  }));
  loadCache = memoize_default((path2) => {
    try {
      const raw = readFileSync2(path2, "utf-8");
      const parsed = CacheFileSchema().safeParse(safeParseJSON(raw, false));
      return parsed.success ? parsed.data.models : null;
    } catch {
      return null;
    }
  }, (path2) => path2);
});

// src/utils/model/ollamaModels.ts
function getCachedOllamaModelNames() {
  return cachedOllamaModelNames;
}
function parseOllamaModelNames(value) {
  if (!value || typeof value !== "object" || !("models" in value)) {
    return [];
  }
  const models = value.models;
  if (!Array.isArray(models)) {
    return [];
  }
  const names = models.flatMap((model) => {
    if (!model || typeof model !== "object") {
      return [];
    }
    const entry = model;
    const name = typeof entry.name === "string" ? entry.name : entry.model;
    if (typeof name !== "string") {
      return [];
    }
    const trimmed = name.trim();
    return trimmed ? [trimmed] : [];
  });
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
function cacheOllamaModelMetadata(model, value, aliases = getOllamaModelNameCandidates(value)) {
  const names = [model, ...aliases].map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) {
    return;
  }
  const contextLength = parseOllamaContextLength(value);
  if (contextLength === undefined) {
    return;
  }
  for (const name of names) {
    const key = normalizeOllamaModelName(name);
    const current = ollamaModelMetadataByName.get(key) ?? {};
    ollamaModelMetadataByName.set(key, {
      ...current,
      contextLength
    });
  }
}
function isOllamaCloudModel(model) {
  return /[-:]cloud$/i.test(model.trim());
}
function getOllamaContextLengthForModel(model) {
  const cached = ollamaModelMetadataByName.get(normalizeOllamaModelName(model))?.contextLength;
  if (isOllamaCloudModel(model)) {
    return Math.max(cached ?? 0, OLLAMA_CLOUD_MIN_CONTEXT);
  }
  return cached;
}
function getOllamaModelNameCandidates(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const entry = value;
  const names = [entry.name, entry.model, entry.remote_model].flatMap((name) => typeof name === "string" && name.trim() ? [name.trim()] : []);
  return [...new Set(names)];
}
function parseOllamaContextLength(value) {
  if (!value || typeof value !== "object") {
    return;
  }
  const entry = value;
  const direct = toPositiveInteger(entry.context_length);
  if (direct !== undefined) {
    return direct;
  }
  const details = toPositiveInteger(entry.details?.context_length);
  if (details !== undefined) {
    return details;
  }
  for (const [key, raw] of Object.entries(entry.model_info ?? {})) {
    if (key.endsWith(".context_length") || key === "context_length") {
      const parsed = toPositiveInteger(raw);
      if (parsed !== undefined) {
        return parsed;
      }
    }
  }
  return;
}
function toPositiveInteger(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return;
  }
  return Math.floor(value);
}
function normalizeOllamaModelName(model) {
  return model.trim().toLowerCase();
}
var ollamaModelMetadataByName, cachedOllamaModelNames, OLLAMA_CLOUD_MIN_CONTEXT = 131072;
var init_ollamaModels = __esm(() => {
  init_ollamaConfig();
  init_ollamaRouter();
  ollamaModelMetadataByName = new Map;
  cachedOllamaModelNames = [];
});

// src/utils/context.ts
function is1mContextDisabled() {
  return isEnvTruthy(process.env.UR_CODE_DISABLE_1M_CONTEXT);
}
function has1mContext(model) {
  if (is1mContextDisabled()) {
    return false;
  }
  return /\[1m\]/i.test(model);
}
function modelSupports1M(model) {
  if (is1mContextDisabled()) {
    return false;
  }
  if (getAPIProvider() === "ollama") {
    return false;
  }
  const cap = getModelCapability(model);
  return Boolean(cap?.max_input_tokens && cap.max_input_tokens >= 1e6);
}
function getContextWindowForModel(model, betas, apiProvider = getAPIProvider()) {
  if (apiProvider === "ollama") {
    const override = parseInt(process.env.OLLAMA_CONTEXT_TOKENS || "", 10);
    if (!isNaN(override) && override > 0) {
      return override;
    }
    const ollamaContextLength = getOllamaContextLengthForModel(model);
    if (ollamaContextLength !== undefined) {
      return ollamaContextLength;
    }
  }
  if (process.env.USER_TYPE === "ant" && process.env.UR_CODE_MAX_CONTEXT_TOKENS) {
    const override = parseInt(process.env.UR_CODE_MAX_CONTEXT_TOKENS, 10);
    if (!isNaN(override) && override > 0) {
      return override;
    }
  }
  if (has1mContext(model)) {
    return 1e6;
  }
  const cap = getModelCapability(model);
  if (cap?.max_input_tokens && cap.max_input_tokens >= 1e5) {
    if (cap.max_input_tokens > MODEL_CONTEXT_WINDOW_DEFAULT && is1mContextDisabled()) {
      return MODEL_CONTEXT_WINDOW_DEFAULT;
    }
    return cap.max_input_tokens;
  }
  if (betas?.includes(CONTEXT_1M_BETA_HEADER) && modelSupports1M(model)) {
    return 1e6;
  }
  if (getmodelS1mExpTreatmentEnabled(model)) {
    return 1e6;
  }
  if (process.env.USER_TYPE === "ant") {
    const antModel = resolveAntModel(model);
    if (antModel?.contextWindow) {
      return antModel.contextWindow;
    }
  }
  return MODEL_CONTEXT_WINDOW_DEFAULT;
}
function getmodelS1mExpTreatmentEnabled(model) {
  if (is1mContextDisabled()) {
    return false;
  }
  if (has1mContext(model)) {
    return false;
  }
  return false;
}
function getModelMaxOutputTokens(model) {
  let defaultTokens = MAX_OUTPUT_TOKENS_DEFAULT;
  let upperLimit = MAX_OUTPUT_TOKENS_UPPER_LIMIT;
  if (process.env.USER_TYPE === "ant") {
    const antModel = resolveAntModel(model.toLowerCase());
    if (antModel) {
      defaultTokens = antModel.defaultMaxTokens ?? MAX_OUTPUT_TOKENS_DEFAULT;
      upperLimit = antModel.upperMaxTokensLimit ?? MAX_OUTPUT_TOKENS_UPPER_LIMIT;
      return { default: defaultTokens, upperLimit };
    }
  }
  const cap = getModelCapability(model);
  if (cap?.max_tokens && cap.max_tokens >= 4096) {
    upperLimit = cap.max_tokens;
    defaultTokens = Math.min(defaultTokens, upperLimit);
  }
  return { default: defaultTokens, upperLimit };
}
function getMaxThinkingTokensForModel(model) {
  return getModelMaxOutputTokens(model).upperLimit - 1;
}
var MODEL_CONTEXT_WINDOW_DEFAULT = 200000, COMPACT_MAX_OUTPUT_TOKENS = 20000, MAX_OUTPUT_TOKENS_DEFAULT = 32000, MAX_OUTPUT_TOKENS_UPPER_LIMIT = 64000, CAPPED_DEFAULT_MAX_TOKENS = 8000, ESCALATED_MAX_TOKENS = 64000;
var init_context = __esm(() => {
  init_betas();
  init_envUtils();
  init_antModels();
  init_modelCapabilities();
  init_ollamaModels();
  init_providers();
});

// src/utils/fastMode.ts
function isFastModeEnabled() {
  return !isEnvTruthy(process.env.UR_CODE_DISABLE_FAST_MODE);
}
function isFastModeAvailable() {
  if (!isFastModeEnabled()) {
    return false;
  }
  return getFastModeUnavailableReason() === null;
}
function getDisabledReasonMessage(disabledReason, authType) {
  switch (disabledReason) {
    case "free":
      return authType === "oauth" ? "Fast mode requires a paid subscription" : "Fast mode unavailable during evaluation. Please purchase credits.";
    case "preference":
      return "Fast mode has been disabled by your organization";
    case "extra_usage_disabled":
      return "Fast mode requires extra usage billing · /extra-usage to enable";
    case "network_error":
      return "Fast mode unavailable due to network connectivity issues";
    case "unknown":
      return "Fast mode is currently unavailable";
  }
}
function getFastModeUnavailableReason() {
  if (!isFastModeEnabled()) {
    return "Fast mode is not available";
  }
  const statigReason = getFeatureValue_CACHED_MAY_BE_STALE("tengu_penguins_off", null);
  if (statigReason !== null) {
    logForDebugging(`Fast mode unavailable: ${statigReason}`);
    return statigReason;
  }
  if (!isInBundledMode() && getFeatureValue_CACHED_MAY_BE_STALE("tengu_marble_sandcastle", false)) {
    return "Fast mode requires the native binary · Install from: https://ur.com/product/ur";
  }
  if (getIsNonInteractiveSession() && preferThirdPartyAuthentication() && !getKairosActive()) {
    const flagFastMode = getSettingsForSource("flagSettings")?.fastMode;
    if (!flagFastMode) {
      const reason = "Fast mode is not available in the Agent SDK";
      logForDebugging(`Fast mode unavailable: ${reason}`);
      return reason;
    }
  }
  if (getAPIProvider() !== "firstParty") {
    const reason = "Fast mode is not available on Bedrock, Vertex, or Foundry";
    logForDebugging(`Fast mode unavailable: ${reason}`);
    return reason;
  }
  if (orgStatus.status === "disabled") {
    if (orgStatus.reason === "network_error" || orgStatus.reason === "unknown") {
      if (isEnvTruthy(process.env.UR_CODE_SKIP_FAST_MODE_NETWORK_ERRORS)) {
        return null;
      }
    }
    const authType = getURAIOAuthTokens() !== null ? "oauth" : "api-key";
    const reason = getDisabledReasonMessage(orgStatus.reason, authType);
    logForDebugging(`Fast mode unavailable: ${reason}`);
    return reason;
  }
  return null;
}
function getFastModeModel() {
  return "modelO" + (ismodelO1mMergeEnabled() ? "[1m]" : "");
}
function isFastModeSupportedByModel(modelSetting) {
  if (!isFastModeEnabled()) {
    return false;
  }
  return false;
}
function getFastModeRuntimeState() {
  if (runtimeState.status === "cooldown" && Date.now() >= runtimeState.resetAt) {
    if (isFastModeEnabled() && !hasLoggedCooldownExpiry) {
      logForDebugging("Fast mode cooldown expired, re-enabling fast mode");
      hasLoggedCooldownExpiry = true;
      cooldownExpired.emit();
    }
    runtimeState = { status: "active" };
  }
  return runtimeState;
}
function triggerFastModeCooldown(resetTimestamp, reason) {
  if (!isFastModeEnabled()) {
    return;
  }
  runtimeState = { status: "cooldown", resetAt: resetTimestamp, reason };
  hasLoggedCooldownExpiry = false;
  const cooldownDurationMs = resetTimestamp - Date.now();
  logForDebugging(`Fast mode cooldown triggered (${reason}), duration ${Math.round(cooldownDurationMs / 1000)}s`);
  logEvent("tengu_fast_mode_fallback_triggered", {
    cooldown_duration_ms: cooldownDurationMs,
    cooldown_reason: reason
  });
  cooldownTriggered.emit(resetTimestamp, reason);
}
function clearFastModeCooldown() {
  runtimeState = { status: "active" };
}
function handleFastModeRejectedByAPI() {
  if (orgStatus.status === "disabled") {
    return;
  }
  orgStatus = { status: "disabled", reason: "preference" };
  updateSettingsForSource("userSettings", { fastMode: undefined });
  saveGlobalConfig((current) => ({
    ...current,
    penguinModeOrgEnabled: false
  }));
  orgFastModeChange.emit(false);
}
function getOverageDisabledMessage(reason) {
  switch (reason) {
    case "out_of_credits":
      return "Fast mode disabled · extra usage credits exhausted";
    case "org_level_disabled":
    case "org_service_level_disabled":
      return "Fast mode disabled · extra usage disabled by your organization";
    case "org_level_disabled_until":
      return "Fast mode disabled · extra usage spending cap reached";
    case "member_level_disabled":
      return "Fast mode disabled · extra usage disabled for your account";
    case "seat_tier_level_disabled":
    case "seat_tier_zero_credit_limit":
    case "member_zero_credit_limit":
      return "Fast mode disabled · extra usage not available for your plan";
    case "overage_not_provisioned":
    case "no_limits_configured":
      return "Fast mode requires extra usage billing · /extra-usage to enable";
    default:
      return "Fast mode disabled · extra usage not available";
  }
}
function isOutOfCreditsReason(reason) {
  return reason === "org_level_disabled_until" || reason === "out_of_credits";
}
function handleFastModeOverageRejection(reason) {
  const message = getOverageDisabledMessage(reason);
  logForDebugging(`Fast mode overage rejection: ${reason ?? "unknown"} — ${message}`);
  logEvent("tengu_fast_mode_overage_rejected", {
    overage_disabled_reason: reason ?? "unknown"
  });
  if (!isOutOfCreditsReason(reason)) {
    updateSettingsForSource("userSettings", { fastMode: undefined });
    saveGlobalConfig((current) => ({
      ...current,
      penguinModeOrgEnabled: false
    }));
  }
  overageRejection.emit(message);
}
function isFastModeCooldown() {
  return getFastModeRuntimeState().status === "cooldown";
}
function getFastModeState(model, fastModeUserEnabled) {
  const enabled = isFastModeEnabled() && isFastModeAvailable() && !!fastModeUserEnabled && isFastModeSupportedByModel(model);
  if (enabled && isFastModeCooldown()) {
    return "cooldown";
  }
  if (enabled) {
    return "on";
  }
  return "off";
}
async function fetchFastModeStatus(auth) {
  const endpoint = `${getOauthConfig().BASE_API_URL}/api/ur_penguin_mode`;
  const headers = "accessToken" in auth ? {
    Authorization: `Bearer ${auth.accessToken}`,
    "urhq-beta": OAUTH_BETA_HEADER
  } : { "x-api-key": auth.apiKey };
  const response = await axios_default.get(endpoint, { headers });
  return response.data;
}
async function prefetchFastModeStatus() {
  if (isEssentialTrafficOnly()) {
    return;
  }
  if (!isFastModeEnabled()) {
    return;
  }
  if (inflightPrefetch) {
    logForDebugging("Fast mode prefetch in progress, returning in-flight promise");
    return inflightPrefetch;
  }
  const apiKey = getURHQApiKey();
  const hasUsableOAuth = getURAIOAuthTokens()?.accessToken && hasProfileScope();
  if (!hasUsableOAuth && !apiKey) {
    const isAnt = process.env.USER_TYPE === "ant";
    const cachedEnabled = getGlobalConfig().penguinModeOrgEnabled === true;
    orgStatus = isAnt || cachedEnabled ? { status: "enabled" } : { status: "disabled", reason: "preference" };
    return;
  }
  const now = Date.now();
  if (now - lastPrefetchAt < PREFETCH_MIN_INTERVAL_MS) {
    logForDebugging("Skipping fast mode prefetch, fetched recently");
    return;
  }
  lastPrefetchAt = now;
  const fetchWithCurrentAuth = async () => {
    const currentTokens = getURAIOAuthTokens();
    const auth = currentTokens?.accessToken && hasProfileScope() ? { accessToken: currentTokens.accessToken } : apiKey ? { apiKey } : null;
    if (!auth) {
      throw new Error("No auth available");
    }
    return fetchFastModeStatus(auth);
  };
  async function doFetch() {
    try {
      let status;
      try {
        status = await fetchWithCurrentAuth();
      } catch (err) {
        const isAuthError = axios_default.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403 && typeof err.response?.data === "string" && err.response.data.includes("OAuth token has been revoked"));
        if (isAuthError) {
          const failedAccessToken = getURAIOAuthTokens()?.accessToken;
          if (failedAccessToken) {
            await handleOAuth401Error(failedAccessToken);
            status = await fetchWithCurrentAuth();
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      const previousEnabled = orgStatus.status !== "pending" ? orgStatus.status === "enabled" : getGlobalConfig().penguinModeOrgEnabled;
      orgStatus = status.enabled ? { status: "enabled" } : {
        status: "disabled",
        reason: status.disabled_reason ?? "preference"
      };
      if (previousEnabled !== status.enabled) {
        if (!status.enabled) {
          updateSettingsForSource("userSettings", { fastMode: undefined });
        }
        saveGlobalConfig((current) => ({
          ...current,
          penguinModeOrgEnabled: status.enabled
        }));
        orgFastModeChange.emit(status.enabled);
      }
      logForDebugging(`Org fast mode: ${status.enabled ? "enabled" : `disabled (${status.disabled_reason ?? "preference"})`}`);
    } catch (err) {
      const isAnt = process.env.USER_TYPE === "ant";
      const cachedEnabled = getGlobalConfig().penguinModeOrgEnabled === true;
      orgStatus = isAnt || cachedEnabled ? { status: "enabled" } : { status: "disabled", reason: "network_error" };
      logForDebugging(`Failed to fetch org fast mode status, defaulting to ${orgStatus.status === "enabled" ? "enabled (cached)" : "disabled (network_error)"}: ${err}`, { level: "error" });
      logEvent("tengu_org_penguin_mode_fetch_failed", {});
    } finally {
      inflightPrefetch = null;
    }
  }
  inflightPrefetch = doFetch();
  return inflightPrefetch;
}
var FAST_MODE_MODEL_DISPLAY = "modelO 4.6", runtimeState, hasLoggedCooldownExpiry = false, cooldownTriggered, cooldownExpired, onCooldownTriggered, onCooldownExpired, overageRejection, onFastModeOverageRejection, orgStatus, orgFastModeChange, onOrgFastModeChanged, PREFETCH_MIN_INTERVAL_MS = 30000, lastPrefetchAt = 0, inflightPrefetch = null;
var init_fastMode = __esm(() => {
  init_axios();
  init_oauth();
  init_growthbook();
  init_state();
  init_analytics();
  init_auth();
  init_bundledMode();
  init_config();
  init_debug();
  init_envUtils();
  init_model();
  init_providers();
  init_privacyLevel();
  init_settings2();
  init_signal();
  runtimeState = { status: "active" };
  cooldownTriggered = createSignal();
  cooldownExpired = createSignal();
  onCooldownTriggered = cooldownTriggered.subscribe;
  onCooldownExpired = cooldownExpired.subscribe;
  overageRejection = createSignal();
  onFastModeOverageRejection = overageRejection.subscribe;
  orgStatus = { status: "pending" };
  orgFastModeChange = createSignal();
  onOrgFastModeChanged = orgFastModeChange.subscribe;
});

// src/utils/modelCost.ts
function getmodelO46CostTier(fastMode) {
  if (isFastModeEnabled() && fastMode) {
    return COST_TIER_30_150;
  }
  return COST_TIER_5_25;
}
function tokensToUSDCost(modelCosts, usage) {
  return usage.input_tokens / 1e6 * modelCosts.inputTokens + usage.output_tokens / 1e6 * modelCosts.outputTokens + (usage.cache_read_input_tokens ?? 0) / 1e6 * modelCosts.promptCacheReadTokens + (usage.cache_creation_input_tokens ?? 0) / 1e6 * modelCosts.promptCacheWriteTokens + (usage.server_tool_use?.web_search_requests ?? 0) * modelCosts.webSearchRequests;
}
function getModelCosts(model, usage) {
  const shortName = getCanonicalName(model);
  if (shortName === firstPartyNameToCanonical(UR_MODELO_4_6_CONFIG.firstParty)) {
    const isFastMode = usage.speed === "fast";
    return getmodelO46CostTier(isFastMode);
  }
  const costs = MODEL_COSTS[shortName];
  if (!costs) {
    trackUnknownModelCost(model, shortName);
    return MODEL_COSTS[getCanonicalName(getDefaultMainLoopModelSetting())] ?? DEFAULT_UNKNOWN_MODEL_COST;
  }
  return costs;
}
function trackUnknownModelCost(model, shortName) {
  logEvent("tengu_unknown_model_cost", {
    model,
    shortName
  });
  setHasUnknownModelCost();
}
function calculateUSDCost(resolvedModel, usage) {
  if (getAPIProvider() === "ollama") {
    return 0;
  }
  const modelCosts = getModelCosts(resolvedModel, usage);
  return tokensToUSDCost(modelCosts, usage);
}
function formatPrice(price) {
  if (Number.isInteger(price)) {
    return `$${price}`;
  }
  return `$${price.toFixed(2)}`;
}
function formatModelPricing(costs) {
  return `${formatPrice(costs.inputTokens)}/${formatPrice(costs.outputTokens)} per Mtok`;
}
var COST_TIER_3_15, COST_TIER_15_75, COST_TIER_5_25, COST_TIER_30_150, COST_MODELH_35, COST_MODELH_45, DEFAULT_UNKNOWN_MODEL_COST, MODEL_COSTS;
var init_modelCost = __esm(() => {
  init_analytics();
  init_state();
  init_fastMode();
  init_configs();
  init_model();
  init_providers();
  COST_TIER_3_15 = {
    inputTokens: 3,
    outputTokens: 15,
    promptCacheWriteTokens: 3.75,
    promptCacheReadTokens: 0.3,
    webSearchRequests: 0.01
  };
  COST_TIER_15_75 = {
    inputTokens: 15,
    outputTokens: 75,
    promptCacheWriteTokens: 18.75,
    promptCacheReadTokens: 1.5,
    webSearchRequests: 0.01
  };
  COST_TIER_5_25 = {
    inputTokens: 5,
    outputTokens: 25,
    promptCacheWriteTokens: 6.25,
    promptCacheReadTokens: 0.5,
    webSearchRequests: 0.01
  };
  COST_TIER_30_150 = {
    inputTokens: 30,
    outputTokens: 150,
    promptCacheWriteTokens: 37.5,
    promptCacheReadTokens: 3,
    webSearchRequests: 0.01
  };
  COST_MODELH_35 = {
    inputTokens: 0.8,
    outputTokens: 4,
    promptCacheWriteTokens: 1,
    promptCacheReadTokens: 0.08,
    webSearchRequests: 0.01
  };
  COST_MODELH_45 = {
    inputTokens: 1,
    outputTokens: 5,
    promptCacheWriteTokens: 1.25,
    promptCacheReadTokens: 0.1,
    webSearchRequests: 0.01
  };
  DEFAULT_UNKNOWN_MODEL_COST = COST_TIER_5_25;
  MODEL_COSTS = {
    [firstPartyNameToCanonical(UR_3_5_MODELH_CONFIG.firstParty)]: COST_MODELH_35,
    [firstPartyNameToCanonical(UR_MODELH_4_5_CONFIG.firstParty)]: COST_MODELH_45,
    [firstPartyNameToCanonical(UR_3_5_V2_MODELS_CONFIG.firstParty)]: COST_TIER_3_15,
    [firstPartyNameToCanonical(UR_3_7_MODELS_CONFIG.firstParty)]: COST_TIER_3_15,
    [firstPartyNameToCanonical(UR_MODELS_4_CONFIG.firstParty)]: COST_TIER_3_15,
    [firstPartyNameToCanonical(UR_MODELS_4_5_CONFIG.firstParty)]: COST_TIER_3_15,
    [firstPartyNameToCanonical(UR_MODELS_4_6_CONFIG.firstParty)]: COST_TIER_3_15,
    [firstPartyNameToCanonical(UR_MODELO_4_CONFIG.firstParty)]: COST_TIER_15_75,
    [firstPartyNameToCanonical(UR_MODELO_4_1_CONFIG.firstParty)]: COST_TIER_15_75,
    [firstPartyNameToCanonical(UR_MODELO_4_5_CONFIG.firstParty)]: COST_TIER_5_25,
    [firstPartyNameToCanonical(UR_MODELO_4_6_CONFIG.firstParty)]: COST_TIER_5_25
  };
});

// src/constants/figures.ts
var BLACK_CIRCLE, UR_HOUSE = "⌂", UP_ARROW = "↑", DOWN_ARROW = "↓", LIGHTNING_BOLT = "↯", EFFORT_LOW = "○", EFFORT_MEDIUM = "◐", EFFORT_HIGH = "●", EFFORT_MAX = "◉", PAUSE_ICON = "⏸", REFRESH_ARROW = "↻", DIAMOND_OPEN = "◇", DIAMOND_FILLED = "◆", REFERENCE_MARK = "※", BLOCKQUOTE_BAR = "▎";
var init_figures = __esm(() => {
  BLACK_CIRCLE = process.platform === "darwin" ? "⏺" : "●";
});

// src/utils/model/aliases.ts
function isModelAlias(modelInput) {
  return MODEL_ALIASES.includes(modelInput);
}
function isModelFamilyAlias(model) {
  return MODEL_FAMILY_ALIASES.includes(model);
}
var MODEL_ALIASES, MODEL_FAMILY_ALIASES;
var init_aliases = __esm(() => {
  MODEL_ALIASES = [
    "modelS",
    "modelO",
    "modelH",
    "best",
    "modelS[1m]",
    "modelO[1m]",
    "modelOplan"
  ];
  MODEL_FAMILY_ALIASES = ["modelS", "modelO", "modelH"];
});

// src/utils/model/modelAllowlist.ts
function modelBelongsToFamily(model, family) {
  if (model.includes(family)) {
    return true;
  }
  if (isModelAlias(model)) {
    const resolved = parseUserSpecifiedModel(model).toLowerCase();
    return resolved.includes(family);
  }
  return false;
}
function prefixMatchesModel(modelName, prefix) {
  if (!modelName.startsWith(prefix)) {
    return false;
  }
  return modelName.length === prefix.length || modelName[prefix.length] === "-";
}
function modelMatchesVersionPrefix(model, entry) {
  const resolvedModel = isModelAlias(model) ? parseUserSpecifiedModel(model).toLowerCase() : model;
  if (prefixMatchesModel(resolvedModel, entry)) {
    return true;
  }
  if (!entry.startsWith("ur-") && prefixMatchesModel(resolvedModel, `ur-${entry}`)) {
    return true;
  }
  return false;
}
function familyHasSpecificEntries(family, allowlist) {
  for (const entry of allowlist) {
    if (isModelFamilyAlias(entry)) {
      continue;
    }
    const idx = entry.indexOf(family);
    if (idx === -1) {
      continue;
    }
    const afterFamily = idx + family.length;
    if (afterFamily === entry.length || entry[afterFamily] === "-") {
      return true;
    }
  }
  return false;
}
function isModelAllowed(model) {
  if (getAPIProvider() === "ollama") {
    return true;
  }
  const settings = getSettings_DEPRECATED() || {};
  const { availableModels } = settings;
  if (!availableModels) {
    return true;
  }
  if (availableModels.length === 0) {
    return false;
  }
  const resolvedModel = resolveOverriddenModel(model);
  const normalizedModel = resolvedModel.trim().toLowerCase();
  const normalizedAllowlist = availableModels.map((m) => m.trim().toLowerCase());
  if (normalizedAllowlist.includes(normalizedModel)) {
    if (!isModelFamilyAlias(normalizedModel) || !familyHasSpecificEntries(normalizedModel, normalizedAllowlist)) {
      return true;
    }
  }
  for (const entry of normalizedAllowlist) {
    if (isModelFamilyAlias(entry) && !familyHasSpecificEntries(entry, normalizedAllowlist) && modelBelongsToFamily(normalizedModel, entry)) {
      return true;
    }
  }
  if (isModelAlias(normalizedModel)) {
    const resolved = parseUserSpecifiedModel(normalizedModel).toLowerCase();
    if (normalizedAllowlist.includes(resolved)) {
      return true;
    }
  }
  for (const entry of normalizedAllowlist) {
    if (!isModelFamilyAlias(entry) && isModelAlias(entry)) {
      const resolved = parseUserSpecifiedModel(entry).toLowerCase();
      if (resolved === normalizedModel) {
        return true;
      }
    }
  }
  for (const entry of normalizedAllowlist) {
    if (!isModelFamilyAlias(entry) && !isModelAlias(entry)) {
      if (modelMatchesVersionPrefix(normalizedModel, entry)) {
        return true;
      }
    }
  }
  return false;
}
var init_modelAllowlist = __esm(() => {
  init_settings2();
  init_aliases();
  init_model();
  init_modelStrings();
  init_providers();
});

// src/utils/stringUtils.ts
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function plural(n, word, pluralWord = word + "s") {
  return n === 1 ? word : pluralWord;
}
function firstLineOf(s) {
  const nl = s.indexOf(`
`);
  return nl === -1 ? s : s.slice(0, nl);
}
function countCharInString(str, char, start = 0) {
  let count2 = 0;
  let i = str.indexOf(char, start);
  while (i !== -1) {
    count2++;
    i = str.indexOf(char, i + 1);
  }
  return count2;
}
function normalizeFullWidthDigits(input) {
  return input.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 65248));
}
function normalizeFullWidthSpace(input) {
  return input.replace(/\u3000/g, " ");
}
function safeJoinLines(lines, delimiter = ",", maxSize = MAX_STRING_LENGTH) {
  const truncationMarker = "...[truncated]";
  let result = "";
  for (const line of lines) {
    const delimiterToAdd = result ? delimiter : "";
    const fullAddition = delimiterToAdd + line;
    if (result.length + fullAddition.length <= maxSize) {
      result += fullAddition;
    } else {
      const remainingSpace = maxSize - result.length - delimiterToAdd.length - truncationMarker.length;
      if (remainingSpace > 0) {
        result += delimiterToAdd + line.slice(0, remainingSpace) + truncationMarker;
      } else {
        result += truncationMarker;
      }
      return result;
    }
  }
  return result;
}

class EndTruncatingAccumulator {
  maxSize;
  content = "";
  isTruncated = false;
  totalBytesReceived = 0;
  constructor(maxSize = MAX_STRING_LENGTH) {
    this.maxSize = maxSize;
  }
  append(data) {
    const str = typeof data === "string" ? data : data.toString();
    this.totalBytesReceived += str.length;
    if (this.isTruncated && this.content.length >= this.maxSize) {
      return;
    }
    if (this.content.length + str.length > this.maxSize) {
      const remainingSpace = this.maxSize - this.content.length;
      if (remainingSpace > 0) {
        this.content += str.slice(0, remainingSpace);
      }
      this.isTruncated = true;
    } else {
      this.content += str;
    }
  }
  toString() {
    if (!this.isTruncated) {
      return this.content;
    }
    const truncatedBytes = this.totalBytesReceived - this.maxSize;
    const truncatedKB = Math.round(truncatedBytes / 1024);
    return this.content + `
... [output truncated - ${truncatedKB}KB removed]`;
  }
  clear() {
    this.content = "";
    this.isTruncated = false;
    this.totalBytesReceived = 0;
  }
  get length() {
    return this.content.length;
  }
  get truncated() {
    return this.isTruncated;
  }
  get totalBytes() {
    return this.totalBytesReceived;
  }
}
var MAX_STRING_LENGTH;
var init_stringUtils = __esm(() => {
  MAX_STRING_LENGTH = 2 ** 25;
});

// src/utils/model/model.ts
function __resetOllamaRouteMemoForTests() {
  memoizedRoutedDefaultModel = undefined;
  memoizedRoutedFastModel = undefined;
}
function getDefaultOllamaModel() {
  if (process.env.OLLAMA_MODEL) {
    return process.env.OLLAMA_MODEL;
  }
  if (isOllamaAutoRouteEnabled()) {
    if (memoizedRoutedDefaultModel)
      return memoizedRoutedDefaultModel;
    const routed = pickBestCoderModel(getCachedOllamaModelNames());
    if (routed) {
      memoizedRoutedDefaultModel = routed;
      return routed;
    }
  }
  return DEFAULT_OLLAMA_MODEL2;
}
function getSmallFastModel() {
  if (getAPIProvider() === "ollama") {
    if (process.env.OLLAMA_SMALL_FAST_MODEL) {
      return process.env.OLLAMA_SMALL_FAST_MODEL;
    }
    if (isOllamaAutoRouteEnabled()) {
      if (memoizedRoutedFastModel)
        return memoizedRoutedFastModel;
      const routed = pickSmallFastModel(getCachedOllamaModelNames());
      if (routed) {
        memoizedRoutedFastModel = routed;
        return routed;
      }
    }
    return getDefaultOllamaModel();
  }
  return process.env.URHQ_SMALL_FAST_MODEL || getDefaultmodelHModel();
}
function isNonCustommodelOModel(model) {
  return model === getModelStrings2().modelO40 || model === getModelStrings2().modelO41 || model === getModelStrings2().modelO45 || model === getModelStrings2().modelO46;
}
function getUserSpecifiedModelSetting() {
  let specifiedModel;
  const modelOverride = getMainLoopModelOverride();
  if (modelOverride !== undefined) {
    specifiedModel = modelOverride;
  } else {
    const settings = getSettings_DEPRECATED() || {};
    specifiedModel = process.env.URHQ_MODEL || settings.model || undefined;
  }
  if (specifiedModel && !isModelAllowed(specifiedModel)) {
    return;
  }
  return specifiedModel;
}
function getMainLoopModel() {
  const model = getUserSpecifiedModelSetting();
  if (model !== undefined && model !== null) {
    return parseUserSpecifiedModel(model);
  }
  return getDefaultMainLoopModel();
}
function getBestModel() {
  return getDefaultmodelOModel();
}
function getDefaultmodelOModel() {
  if (getAPIProvider() === "ollama") {
    return getDefaultOllamaModel();
  }
  if (process.env.URHQ_DEFAULT_MODELO_MODEL) {
    return process.env.URHQ_DEFAULT_MODELO_MODEL;
  }
  if (getAPIProvider() !== "firstParty") {
    return getModelStrings2().modelO46;
  }
  return getModelStrings2().modelO46;
}
function getDefaultmodelSModel() {
  if (getAPIProvider() === "ollama") {
    return getDefaultOllamaModel();
  }
  if (process.env.URHQ_DEFAULT_MODELS_MODEL) {
    return process.env.URHQ_DEFAULT_MODELS_MODEL;
  }
  if (getAPIProvider() !== "firstParty") {
    return getModelStrings2().modelS45;
  }
  return getModelStrings2().modelS46;
}
function getDefaultmodelHModel() {
  if (getAPIProvider() === "ollama") {
    return process.env.OLLAMA_SMALL_FAST_MODEL || getDefaultOllamaModel();
  }
  if (process.env.URHQ_DEFAULT_MODELH_MODEL) {
    return process.env.URHQ_DEFAULT_MODELH_MODEL;
  }
  return getModelStrings2().modelH45;
}
function getRuntimeMainLoopModel(params) {
  const { permissionMode, mainLoopModel, exceeds200kTokens = false } = params;
  if (getUserSpecifiedModelSetting() === "modelOplan" && permissionMode === "plan" && !exceeds200kTokens) {
    return getDefaultmodelOModel();
  }
  if (getUserSpecifiedModelSetting() === "modelH" && permissionMode === "plan") {
    return getDefaultmodelSModel();
  }
  return mainLoopModel;
}
function getDefaultMainLoopModelSetting() {
  const settings = getSettings_DEPRECATED() || {};
  const activeProvider = getActiveProviderSettings(settings).active ?? "ollama";
  if (activeProvider !== "ollama") {
    const providerDefault = getDefaultModelForProvider(activeProvider);
    if (providerDefault) {
      return providerDefault;
    }
  }
  if (getAPIProvider() === "ollama") {
    return getDefaultOllamaModel();
  }
  if (process.env.USER_TYPE === "ant") {
    return getAntModelOverrideConfig()?.defaultModel ?? getDefaultmodelOModel() + "[1m]";
  }
  if (isMaxSubscriber()) {
    return getDefaultmodelOModel() + (ismodelO1mMergeEnabled() ? "[1m]" : "");
  }
  if (isTeamPremiumSubscriber()) {
    return getDefaultmodelOModel() + (ismodelO1mMergeEnabled() ? "[1m]" : "");
  }
  return getDefaultmodelSModel();
}
function getDefaultMainLoopModel() {
  return parseUserSpecifiedModel(getDefaultMainLoopModelSetting());
}
function firstPartyNameToCanonical(name) {
  return name.toLowerCase();
}
function getCanonicalName(fullModelName) {
  return firstPartyNameToCanonical(resolveOverriddenModel(fullModelName));
}
function getURAiUserDefaultModelDescription(fastMode = false) {
  if (isMaxSubscriber() || isTeamPremiumSubscriber()) {
    if (ismodelO1mMergeEnabled()) {
      return `modelO 4.6 with 1M context · Most capable for complex work${fastMode ? getmodelO46PricingSuffix(true) : ""}`;
    }
    return `modelO 4.6 · Most capable for complex work${fastMode ? getmodelO46PricingSuffix(true) : ""}`;
  }
  return "modelS 4.6 · Best for everyday tasks";
}
function renderDefaultModelSetting(setting) {
  if (setting === "modelOplan") {
    return "modelO 4.6 in plan mode, else modelS 4.6";
  }
  return renderModelName(parseUserSpecifiedModel(setting));
}
function getmodelO46PricingSuffix(fastMode) {
  if (getAPIProvider() !== "firstParty")
    return "";
  const pricing = formatModelPricing(getmodelO46CostTier(fastMode));
  const fastModeIndicator = fastMode ? ` (${LIGHTNING_BOLT})` : "";
  return ` ·${fastModeIndicator} ${pricing}`;
}
function ismodelO1mMergeEnabled() {
  if (is1mContextDisabled() || isProSubscriber() || getAPIProvider() !== "firstParty") {
    return false;
  }
  if (isURAISubscriber() && getSubscriptionType() === null) {
    return false;
  }
  return true;
}
function renderModelSetting(setting) {
  if (setting === "modelOplan") {
    return "modelO Plan";
  }
  if (isModelAlias(setting)) {
    return capitalize(setting);
  }
  return renderModelName(setting);
}
function getPublicModelDisplayName(model) {
  if (getAPIProvider() === "ollama") {
    return null;
  }
  switch (model) {
    case getModelStrings2().modelO46:
      return "modelO 4.6";
    case getModelStrings2().modelO46 + "[1m]":
      return "modelO 4.6 (1M context)";
    case getModelStrings2().modelO45:
      return "modelO 4.5";
    case getModelStrings2().modelO41:
      return "modelO 4.1";
    case getModelStrings2().modelO40:
      return "modelO 4";
    case getModelStrings2().modelS46 + "[1m]":
      return "modelS 4.6 (1M context)";
    case getModelStrings2().modelS46:
      return "modelS 4.6";
    case getModelStrings2().modelS45 + "[1m]":
      return "modelS 4.5 (1M context)";
    case getModelStrings2().modelS45:
      return "modelS 4.5";
    case getModelStrings2().modelS40:
      return "modelS 4";
    case getModelStrings2().modelS40 + "[1m]":
      return "modelS 4 (1M context)";
    case getModelStrings2().modelS37:
      return "modelS 3.7";
    case getModelStrings2().modelS35:
      return "modelS 3.5";
    case getModelStrings2().modelH45:
      return "modelH 4.5";
    case getModelStrings2().modelH35:
      return "modelH 3.5";
    default:
      return null;
  }
}
function maskModelCodename(baseName) {
  const [codename = "", ...rest] = baseName.split("-");
  const masked = codename.slice(0, 3) + "*".repeat(Math.max(0, codename.length - 3));
  return [masked, ...rest].join("-");
}
function renderModelName(model) {
  const publicName = getPublicModelDisplayName(model);
  if (publicName) {
    return publicName;
  }
  if (process.env.USER_TYPE === "ant") {
    const resolved = parseUserSpecifiedModel(model);
    const antModel = resolveAntModel(model);
    if (antModel) {
      const baseName = antModel.model.replace(/\[1m\]$/i, "");
      const masked = maskModelCodename(baseName);
      const suffix = has1mContext(resolved) ? "[1m]" : "";
      return masked + suffix;
    }
    if (resolved !== model) {
      return `${model} (${resolved})`;
    }
    return resolved;
  }
  return model;
}
function getPublicModelName(model) {
  if (getAPIProvider() === "ollama") {
    return `Ollama (${model})`;
  }
  const publicName = getPublicModelDisplayName(model);
  if (publicName) {
    return `UR ${publicName}`;
  }
  return `UR (${model})`;
}
function parseUserSpecifiedModel(modelInput) {
  const modelInputTrimmed = modelInput.trim();
  const normalizedModel = modelInputTrimmed.toLowerCase();
  const has1mTag = has1mContext(normalizedModel);
  const modelString = has1mTag ? normalizedModel.replace(/\[1m]$/i, "").trim() : normalizedModel;
  switch (modelString) {
    case "modeloplan":
      return getDefaultmodelSModel() + (has1mTag ? "[1m]" : "");
    case "models":
      return getDefaultmodelSModel() + (has1mTag ? "[1m]" : "");
    case "modelh":
      return getDefaultmodelHModel() + (has1mTag ? "[1m]" : "");
    case "modelo":
      return getDefaultmodelOModel() + (has1mTag ? "[1m]" : "");
    case "best":
      return getBestModel();
    default:
  }
  if (getAPIProvider() === "firstParty" && isLegacymodelOFirstParty(modelString) && isLegacyModelRemapEnabled()) {
    return getDefaultmodelOModel() + (has1mTag ? "[1m]" : "");
  }
  if (process.env.USER_TYPE === "ant") {
    const has1mAntTag = has1mContext(normalizedModel);
    const baseAntModel = normalizedModel.replace(/\[1m]$/i, "").trim();
    const antModel = resolveAntModel(baseAntModel);
    if (antModel) {
      const suffix = has1mAntTag ? "[1m]" : "";
      return antModel.model + suffix;
    }
  }
  if (has1mTag) {
    return modelInputTrimmed.replace(/\[1m\]$/i, "").trim() + "[1m]";
  }
  return modelInputTrimmed;
}
function resolveSkillModelOverride(skillModel, currentModel) {
  if (has1mContext(skillModel) || !has1mContext(currentModel)) {
    return skillModel;
  }
  if (modelSupports1M(parseUserSpecifiedModel(skillModel))) {
    return skillModel + "[1m]";
  }
  return skillModel;
}
function isLegacymodelOFirstParty(model) {
  return LEGACY_MODELO_FIRSTPARTY.includes(model);
}
function isLegacyModelRemapEnabled() {
  return !isEnvTruthy(process.env.UR_CODE_DISABLE_LEGACY_MODEL_REMAP);
}
function modelDisplayString(model) {
  if (model === null) {
    if (process.env.USER_TYPE === "ant") {
      return `Default for Ants (${renderDefaultModelSetting(getDefaultMainLoopModelSetting())})`;
    } else if (isURAISubscriber()) {
      return `Default (${getURAiUserDefaultModelDescription()})`;
    }
    return `Default (${getDefaultMainLoopModel()})`;
  }
  const resolvedModel = parseUserSpecifiedModel(model);
  return model === resolvedModel ? resolvedModel : `${model} (${resolvedModel})`;
}
function getMarketingNameForModel(modelId) {
  if (getAPIProvider() === "foundry" || getAPIProvider() === "ollama") {
    return;
  }
  const has1m = modelId.toLowerCase().includes("[1m]");
  const canonical = getCanonicalName(modelId);
  if (canonical === "modelo") {
    return has1m ? "modelO (with 1M context)" : "modelO";
  }
  if (canonical === "models") {
    return has1m ? "modelS (with 1M context)" : "modelS";
  }
  if (canonical === "modelh") {
    return "modelH";
  }
  return;
}
function normalizeModelStringForAPI(model) {
  return model.replace(/\[(1|2)m\]/gi, "");
}
var DEFAULT_OLLAMA_MODEL2 = "qwen3-coder:480b-cloud", memoizedRoutedDefaultModel, memoizedRoutedFastModel, LEGACY_MODELO_FIRSTPARTY;
var init_model = __esm(() => {
  init_state();
  init_auth();
  init_context();
  init_envUtils();
  init_modelStrings();
  init_modelCost();
  init_settings2();
  init_providers();
  init_figures();
  init_modelAllowlist();
  init_aliases();
  init_stringUtils();
  init_antModels();
  init_ollamaModels();
  init_ollamaRouter();
  init_providerRegistry();
  LEGACY_MODELO_FIRSTPARTY = [];
});

// src/utils/model/modelSupportOverrides.ts
var TIERS, get3PModelCapabilityOverride;
var init_modelSupportOverrides = __esm(() => {
  init_memoize();
  init_providers();
  TIERS = [
    {
      modelEnvVar: "URHQ_DEFAULT_MODELO_MODEL",
      capabilitiesEnvVar: "URHQ_DEFAULT_MODELO_MODEL_SUPPORTED_CAPABILITIES"
    },
    {
      modelEnvVar: "URHQ_DEFAULT_MODELS_MODEL",
      capabilitiesEnvVar: "URHQ_DEFAULT_MODELS_MODEL_SUPPORTED_CAPABILITIES"
    },
    {
      modelEnvVar: "URHQ_DEFAULT_MODELH_MODEL",
      capabilitiesEnvVar: "URHQ_DEFAULT_MODELH_MODEL_SUPPORTED_CAPABILITIES"
    }
  ];
  get3PModelCapabilityOverride = memoize_default((model, capability) => {
    if (getAPIProvider() === "firstParty") {
      return;
    }
    const m = model.toLowerCase();
    for (const tier of TIERS) {
      const pinned = process.env[tier.modelEnvVar];
      const capabilities = process.env[tier.capabilitiesEnvVar];
      if (!pinned || capabilities === undefined)
        continue;
      if (m !== pinned.toLowerCase())
        continue;
      return capabilities.toLowerCase().split(",").map((s) => s.trim()).includes(capability);
    }
    return;
  }, (model, capability) => `${model.toLowerCase()}:${capability}`);
});

// src/utils/betas.ts
function modelSupportsISP(model) {
  if (getAPIProvider() === "ollama") {
    return false;
  }
  const supported3P = get3PModelCapabilityOverride(model, "interleaved_thinking");
  if (supported3P !== undefined) {
    return supported3P;
  }
  const canonical = getCanonicalName(model);
  const provider = getAPIProvider();
  if (provider === "foundry") {
    return true;
  }
  if (provider === "firstParty") {
    return true;
  }
  return false;
}
function vertexModelSupportsWebSearch(_model) {
  return false;
}
function modelSupportsContextManagement(model) {
  if (getAPIProvider() === "ollama") {
    return false;
  }
  const provider = getAPIProvider();
  if (provider === "foundry") {
    return true;
  }
  if (provider === "firstParty") {
    return true;
  }
  return false;
}
function modelSupportsStructuredOutputs(model) {
  const provider = getAPIProvider();
  return provider === "firstParty" || provider === "foundry";
}
function getToolSearchBetaHeader() {
  const provider = getAPIProvider();
  if (provider === "vertex" || provider === "bedrock") {
    return TOOL_SEARCH_BETA_HEADER_3P;
  }
  return TOOL_SEARCH_BETA_HEADER_1P;
}
function shouldIncludeFirstPartyOnlyBetas() {
  return (getAPIProvider() === "firstParty" || getAPIProvider() === "foundry") && !isEnvTruthy(process.env.UR_CODE_DISABLE_EXPERIMENTAL_BETAS);
}
function shouldUseGlobalCacheScope() {
  return getAPIProvider() === "firstParty" && !isEnvTruthy(process.env.UR_CODE_DISABLE_EXPERIMENTAL_BETAS);
}
function getMergedBetas(model, options) {
  const baseBetas = [...getModelBetas(model)];
  if (options?.isAgenticQuery) {
    if (!baseBetas.includes(UR_CODE_20250219_BETA_HEADER)) {
      baseBetas.push(UR_CODE_20250219_BETA_HEADER);
    }
    if (process.env.USER_TYPE === "ant" && process.env.UR_CODE_ENTRYPOINT === "cli" && CLI_INTERNAL_BETA_HEADER && !baseBetas.includes(CLI_INTERNAL_BETA_HEADER)) {
      baseBetas.push(CLI_INTERNAL_BETA_HEADER);
    }
  }
  const sdkBetas = getSdkBetas();
  if (!sdkBetas || sdkBetas.length === 0) {
    return baseBetas;
  }
  return [...baseBetas, ...sdkBetas.filter((b) => !baseBetas.includes(b))];
}
function clearBetasCaches() {
  getAllModelBetas.cache?.clear?.();
  getModelBetas.cache?.clear?.();
  getBedrockExtraBodyParamsBetas.cache?.clear?.();
}
var getAllModelBetas, getModelBetas, getBedrockExtraBodyParamsBetas;
var init_betas2 = __esm(() => {
  init_memoize();
  init_growthbook();
  init_state();
  init_betas();
  init_oauth();
  init_auth();
  init_context();
  init_envUtils();
  init_model();
  init_modelSupportOverrides();
  init_providers();
  init_settings2();
  getAllModelBetas = memoize_default((model) => {
    if (getAPIProvider() === "ollama") {
      return [];
    }
    const betaHeaders = [];
    const ismodelH = getCanonicalName(model).includes("modelH");
    const provider = getAPIProvider();
    const includeFirstPartyOnlyBetas = shouldIncludeFirstPartyOnlyBetas();
    if (!ismodelH) {
      betaHeaders.push(UR_CODE_20250219_BETA_HEADER);
      if (process.env.USER_TYPE === "ant" && process.env.UR_CODE_ENTRYPOINT === "cli") {
        if (CLI_INTERNAL_BETA_HEADER) {
          betaHeaders.push(CLI_INTERNAL_BETA_HEADER);
        }
      }
    }
    if (isURAISubscriber()) {
      betaHeaders.push(OAUTH_BETA_HEADER);
    }
    if (has1mContext(model)) {
      betaHeaders.push(CONTEXT_1M_BETA_HEADER);
    }
    if (!isEnvTruthy(process.env.DISABLE_INTERLEAVED_THINKING) && modelSupportsISP(model)) {
      betaHeaders.push(INTERLEAVED_THINKING_BETA_HEADER);
    }
    if (includeFirstPartyOnlyBetas && modelSupportsISP(model) && !getIsNonInteractiveSession() && getInitialSettings().showThinkingSummaries !== true) {
      betaHeaders.push(REDACT_THINKING_BETA_HEADER);
    }
    if (SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER && process.env.USER_TYPE === "ant" && includeFirstPartyOnlyBetas && !isEnvDefinedFalsy(process.env.USE_CONNECTOR_TEXT_SUMMARIZATION) && (isEnvTruthy(process.env.USE_CONNECTOR_TEXT_SUMMARIZATION) || getFeatureValue_CACHED_MAY_BE_STALE("tengu_slate_prism", false))) {
      betaHeaders.push(SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER);
    }
    const antOptedIntoToolClearing = isEnvTruthy(process.env.USE_API_CONTEXT_MANAGEMENT) && process.env.USER_TYPE === "ant";
    const thinkingPreservationEnabled = modelSupportsContextManagement(model);
    if (shouldIncludeFirstPartyOnlyBetas() && (antOptedIntoToolClearing || thinkingPreservationEnabled)) {
      betaHeaders.push(CONTEXT_MANAGEMENT_BETA_HEADER);
    }
    const strictToolsEnabled = checkStatsigFeatureGate_CACHED_MAY_BE_STALE("tengu_tool_pear");
    const tokenEfficientToolsEnabled = !strictToolsEnabled && getFeatureValue_CACHED_MAY_BE_STALE("tengu_amber_json_tools", false);
    if (includeFirstPartyOnlyBetas && modelSupportsStructuredOutputs(model) && strictToolsEnabled) {
      betaHeaders.push(STRUCTURED_OUTPUTS_BETA_HEADER);
    }
    if (process.env.USER_TYPE === "ant" && includeFirstPartyOnlyBetas && tokenEfficientToolsEnabled) {
      betaHeaders.push(TOKEN_EFFICIENT_TOOLS_BETA_HEADER);
    }
    if (provider === "vertex" && vertexModelSupportsWebSearch(model)) {
      betaHeaders.push(WEB_SEARCH_BETA_HEADER);
    }
    if (provider === "foundry") {
      betaHeaders.push(WEB_SEARCH_BETA_HEADER);
    }
    if (includeFirstPartyOnlyBetas) {
      betaHeaders.push(PROMPT_CACHING_SCOPE_BETA_HEADER);
    }
    if (process.env.URHQ_BETAS) {
      betaHeaders.push(...process.env.URHQ_BETAS.split(",").map((_) => _.trim()).filter(Boolean));
    }
    return betaHeaders;
  });
  getModelBetas = memoize_default((model) => {
    const modelBetas = getAllModelBetas(model);
    if (getAPIProvider() === "bedrock") {
      return modelBetas.filter((b) => !BEDROCK_EXTRA_PARAMS_HEADERS.has(b));
    }
    return modelBetas;
  });
  getBedrockExtraBodyParamsBetas = memoize_default((model) => {
    const modelBetas = getAllModelBetas(model);
    return modelBetas.filter((b) => BEDROCK_EXTRA_PARAMS_HEADERS.has(b));
  });
});

// src/utils/secureStorage/keychainPrefetch.ts
function getLegacyApiKeyPrefetchResult() {
  return legacyApiKeyPrefetch;
}
function clearLegacyApiKeyPrefetch() {
  legacyApiKeyPrefetch = null;
}
var legacyApiKeyPrefetch = null;
var init_keychainPrefetch = __esm(() => {
  init_envUtils();
  init_macOsKeychainHelpers();
});

// src/utils/sleep.ts
function sleep(ms, signal, opts) {
  return new Promise((resolve4, reject) => {
    if (signal?.aborted) {
      if (opts?.throwOnAbort || opts?.abortError) {
        reject(opts.abortError?.() ?? new Error("aborted"));
      } else {
        resolve4();
      }
      return;
    }
    const timer = setTimeout((signal2, onAbort2, resolve5) => {
      signal2?.removeEventListener("abort", onAbort2);
      resolve5();
    }, ms, signal, onAbort, resolve4);
    function onAbort() {
      clearTimeout(timer);
      if (opts?.throwOnAbort || opts?.abortError) {
        reject(opts.abortError?.() ?? new Error("aborted"));
      } else {
        resolve4();
      }
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    if (opts?.unref) {
      timer.unref();
    }
  });
}
var init_sleep = () => {};

// src/utils/toolSchemaCache.ts
function getToolSchemaCache() {
  return TOOL_SCHEMA_CACHE;
}
function clearToolSchemaCache() {
  TOOL_SCHEMA_CACHE.clear();
}
var TOOL_SCHEMA_CACHE;
var init_toolSchemaCache = __esm(() => {
  TOOL_SCHEMA_CACHE = new Map;
});

// src/utils/auth.ts
var exports_auth = {};
__export(exports_auth, {
  validateForceLoginOrg: () => validateForceLoginOrg,
  saveOAuthTokensIfNeeded: () => saveOAuthTokensIfNeeded,
  saveApiKey: () => saveApiKey,
  removeApiKey: () => removeApiKey,
  refreshGcpCredentialsIfNeeded: () => refreshGcpCredentialsIfNeeded,
  refreshGcpAuth: () => refreshGcpAuth,
  refreshAwsAuth: () => refreshAwsAuth,
  refreshAndGetAwsCredentials: () => refreshAndGetAwsCredentials,
  prefetchGcpCredentialsIfSafe: () => prefetchGcpCredentialsIfSafe,
  prefetchAwsCredentialsAndBedRockInfoIfSafe: () => prefetchAwsCredentialsAndBedRockInfoIfSafe,
  prefetchApiKeyFromApiKeyHelperIfSafe: () => prefetchApiKeyFromApiKeyHelperIfSafe,
  isUsing3PServices: () => isUsing3PServices,
  isURHQAuthEnabled: () => isURHQAuthEnabled,
  isURAISubscriber: () => isURAISubscriber,
  isTeamSubscriber: () => isTeamSubscriber,
  isTeamPremiumSubscriber: () => isTeamPremiumSubscriber,
  isProSubscriber: () => isProSubscriber,
  isOverageProvisioningAllowed: () => isOverageProvisioningAllowed,
  isOtelHeadersHelperFromProjectOrLocalSettings: () => isOtelHeadersHelperFromProjectOrLocalSettings,
  isMaxSubscriber: () => isMaxSubscriber,
  isGcpAuthRefreshFromProjectSettings: () => isGcpAuthRefreshFromProjectSettings,
  isEnterpriseSubscriber: () => isEnterpriseSubscriber,
  isCustomApiKeyApproved: () => isCustomApiKeyApproved,
  isConsumerSubscriber: () => isConsumerSubscriber,
  isAwsCredentialExportFromProjectSettings: () => isAwsCredentialExportFromProjectSettings,
  isAwsAuthRefreshFromProjectSettings: () => isAwsAuthRefreshFromProjectSettings,
  is1PApiCustomer: () => is1PApiCustomer,
  hasmodelOAccess: () => hasmodelOAccess,
  hasURHQApiKeyAuth: () => hasURHQApiKeyAuth,
  hasProfileScope: () => hasProfileScope,
  handleOAuth401Error: () => handleOAuth401Error,
  getURHQApiKeyWithSource: () => getURHQApiKeyWithSource,
  getURHQApiKey: () => getURHQApiKey,
  getURAIOAuthTokensAsync: () => getURAIOAuthTokensAsync,
  getURAIOAuthTokens: () => getURAIOAuthTokens,
  getSubscriptionType: () => getSubscriptionType,
  getSubscriptionName: () => getSubscriptionName,
  getRateLimitTier: () => getRateLimitTier,
  getOtelHeadersFromHelper: () => getOtelHeadersFromHelper,
  getOauthAccountInfo: () => getOauthAccountInfo,
  getConfiguredApiKeyHelper: () => getConfiguredApiKeyHelper,
  getAuthTokenSource: () => getAuthTokenSource,
  getApiKeyHelperElapsedMs: () => getApiKeyHelperElapsedMs,
  getApiKeyFromConfigOrMacOSKeychain: () => getApiKeyFromConfigOrMacOSKeychain,
  getApiKeyFromApiKeyHelperCached: () => getApiKeyFromApiKeyHelperCached,
  getApiKeyFromApiKeyHelper: () => getApiKeyFromApiKeyHelper,
  getAccountInformation: () => getAccountInformation,
  clearOAuthTokenCache: () => clearOAuthTokenCache,
  clearGcpCredentialsCache: () => clearGcpCredentialsCache,
  clearAwsCredentialsCache: () => clearAwsCredentialsCache,
  clearApiKeyHelperCache: () => clearApiKeyHelperCache,
  checkGcpCredentialsValid: () => checkGcpCredentialsValid,
  checkAndRefreshOAuthTokenIfNeeded: () => checkAndRefreshOAuthTokenIfNeeded,
  calculateApiKeyHelperTTL: () => calculateApiKeyHelperTTL
});
import { exec } from "child_process";
import { mkdir, stat as stat2 } from "fs/promises";
import { join as join10 } from "path";
function isManagedOAuthContext() {
  return isEnvTruthy(process.env.UR_CODE_REMOTE) || process.env.UR_CODE_ENTRYPOINT === "ur-desktop";
}
function isURHQAuthEnabled() {
  if (isBareMode())
    return false;
  if (process.env.URHQ_UNIX_SOCKET) {
    return !!process.env.UR_CODE_OAUTH_TOKEN;
  }
  const is3P = getAPIProvider() !== "firstParty";
  const settings = getSettings_DEPRECATED() || {};
  const apiKeyHelper = settings.apiKeyHelper;
  const hasExternalAuthToken = process.env.URHQ_AUTH_TOKEN || apiKeyHelper || process.env.UR_CODE_API_KEY_FILE_DESCRIPTOR;
  const { source: apiKeySource } = getURHQApiKeyWithSource({
    skipRetrievingKeyFromApiKeyHelper: true
  });
  const hasExternalApiKey = apiKeySource === "URHQ_API_KEY" || apiKeySource === "apiKeyHelper";
  const shouldDisableAuth = is3P || hasExternalAuthToken && !isManagedOAuthContext() || hasExternalApiKey && !isManagedOAuthContext();
  return !shouldDisableAuth;
}
function getAuthTokenSource() {
  if (isBareMode()) {
    if (getConfiguredApiKeyHelper()) {
      return { source: "apiKeyHelper", hasToken: true };
    }
    return { source: "none", hasToken: false };
  }
  if (process.env.URHQ_AUTH_TOKEN && !isManagedOAuthContext()) {
    return { source: "URHQ_AUTH_TOKEN", hasToken: true };
  }
  if (process.env.UR_CODE_OAUTH_TOKEN) {
    return { source: "UR_CODE_OAUTH_TOKEN", hasToken: true };
  }
  const oauthTokenFromFd = getOAuthTokenFromFileDescriptor();
  if (oauthTokenFromFd) {
    if (process.env.UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR) {
      return {
        source: "UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR",
        hasToken: true
      };
    }
    return {
      source: "CCR_OAUTH_TOKEN_FILE",
      hasToken: true
    };
  }
  const apiKeyHelper = getConfiguredApiKeyHelper();
  if (apiKeyHelper && !isManagedOAuthContext()) {
    return { source: "apiKeyHelper", hasToken: true };
  }
  const oauthTokens = getURAIOAuthTokens();
  if (shouldUseURAIAuth(oauthTokens?.scopes) && oauthTokens?.accessToken) {
    return { source: "ur.ai", hasToken: true };
  }
  return { source: "none", hasToken: false };
}
function getURHQApiKey() {
  const { key } = getURHQApiKeyWithSource();
  return key;
}
function hasURHQApiKeyAuth() {
  const { key, source } = getURHQApiKeyWithSource({
    skipRetrievingKeyFromApiKeyHelper: true
  });
  return key !== null && source !== "none";
}
function getURHQApiKeyWithSource(opts = {}) {
  if (isBareMode()) {
    if (getConfiguredApiKeyHelper()) {
      return {
        key: opts.skipRetrievingKeyFromApiKeyHelper ? null : getApiKeyFromApiKeyHelperCached(),
        source: "apiKeyHelper"
      };
    }
    return { key: null, source: "none" };
  }
  const apiKeyEnv = undefined;
  if (preferThirdPartyAuthentication() && apiKeyEnv) {
    return {
      key: apiKeyEnv,
      source: "URHQ_API_KEY"
    };
  }
  if (isEnvTruthy(process.env.CI) || false) {
    const apiKeyFromFd2 = getApiKeyFromFileDescriptor();
    if (apiKeyFromFd2) {
      return {
        key: apiKeyFromFd2,
        source: "URHQ_API_KEY"
      };
    }
    if (!apiKeyEnv && !process.env.UR_CODE_OAUTH_TOKEN && !process.env.UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR) {
      throw new Error("UR_CODE_OAUTH_TOKEN env var is required");
    }
    if (apiKeyEnv) {
      return {
        key: apiKeyEnv,
        source: "URHQ_API_KEY"
      };
    }
    return {
      key: null,
      source: "none"
    };
  }
  if (apiKeyEnv && getGlobalConfig().customApiKeyResponses?.approved?.includes(normalizeApiKeyForConfig(apiKeyEnv))) {
    return {
      key: apiKeyEnv,
      source: "URHQ_API_KEY"
    };
  }
  const apiKeyFromFd = getApiKeyFromFileDescriptor();
  if (apiKeyFromFd) {
    return {
      key: apiKeyFromFd,
      source: "URHQ_API_KEY"
    };
  }
  const apiKeyHelperCommand = getConfiguredApiKeyHelper();
  if (apiKeyHelperCommand) {
    if (opts.skipRetrievingKeyFromApiKeyHelper) {
      return {
        key: null,
        source: "apiKeyHelper"
      };
    }
    return {
      key: getApiKeyFromApiKeyHelperCached(),
      source: "apiKeyHelper"
    };
  }
  const apiKeyFromConfigOrMacOSKeychain = getApiKeyFromConfigOrMacOSKeychain();
  if (apiKeyFromConfigOrMacOSKeychain) {
    return apiKeyFromConfigOrMacOSKeychain;
  }
  return {
    key: null,
    source: "none"
  };
}
function getConfiguredApiKeyHelper() {
  if (isBareMode()) {
    return getSettingsForSource("flagSettings")?.apiKeyHelper;
  }
  const mergedSettings = getSettings_DEPRECATED() || {};
  return mergedSettings.apiKeyHelper;
}
function isApiKeyHelperFromProjectOrLocalSettings() {
  const apiKeyHelper = getConfiguredApiKeyHelper();
  if (!apiKeyHelper) {
    return false;
  }
  const projectSettings = getSettingsForSource("projectSettings");
  const localSettings = getSettingsForSource("localSettings");
  return projectSettings?.apiKeyHelper === apiKeyHelper || localSettings?.apiKeyHelper === apiKeyHelper;
}
function getConfiguredAwsAuthRefresh() {
  const mergedSettings = getSettings_DEPRECATED() || {};
  return mergedSettings.awsAuthRefresh;
}
function isAwsAuthRefreshFromProjectSettings() {
  const awsAuthRefresh = getConfiguredAwsAuthRefresh();
  if (!awsAuthRefresh) {
    return false;
  }
  const projectSettings = getSettingsForSource("projectSettings");
  const localSettings = getSettingsForSource("localSettings");
  return projectSettings?.awsAuthRefresh === awsAuthRefresh || localSettings?.awsAuthRefresh === awsAuthRefresh;
}
function getConfiguredAwsCredentialExport() {
  const mergedSettings = getSettings_DEPRECATED() || {};
  return mergedSettings.awsCredentialExport;
}
function isAwsCredentialExportFromProjectSettings() {
  const awsCredentialExport = getConfiguredAwsCredentialExport();
  if (!awsCredentialExport) {
    return false;
  }
  const projectSettings = getSettingsForSource("projectSettings");
  const localSettings = getSettingsForSource("localSettings");
  return projectSettings?.awsCredentialExport === awsCredentialExport || localSettings?.awsCredentialExport === awsCredentialExport;
}
function calculateApiKeyHelperTTL() {
  const envTtl = process.env.UR_CODE_API_KEY_HELPER_TTL_MS;
  if (envTtl) {
    const parsed = parseInt(envTtl, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
    logForDebugging(`Found UR_CODE_API_KEY_HELPER_TTL_MS env var, but it was not a valid number. Got ${envTtl}`, { level: "error" });
  }
  return DEFAULT_API_KEY_HELPER_TTL;
}
function getApiKeyHelperElapsedMs() {
  const startedAt = _apiKeyHelperInflight?.startedAt;
  return startedAt ? Date.now() - startedAt : 0;
}
async function getApiKeyFromApiKeyHelper(isNonInteractiveSession) {
  if (!getConfiguredApiKeyHelper())
    return null;
  const ttl = calculateApiKeyHelperTTL();
  if (_apiKeyHelperCache) {
    if (Date.now() - _apiKeyHelperCache.timestamp < ttl) {
      return _apiKeyHelperCache.value;
    }
    if (!_apiKeyHelperInflight) {
      _apiKeyHelperInflight = {
        promise: _runAndCache(isNonInteractiveSession, false, _apiKeyHelperEpoch),
        startedAt: null
      };
    }
    return _apiKeyHelperCache.value;
  }
  if (_apiKeyHelperInflight)
    return _apiKeyHelperInflight.promise;
  _apiKeyHelperInflight = {
    promise: _runAndCache(isNonInteractiveSession, true, _apiKeyHelperEpoch),
    startedAt: Date.now()
  };
  return _apiKeyHelperInflight.promise;
}
async function _runAndCache(isNonInteractiveSession, isCold, epoch) {
  try {
    const value = await _executeApiKeyHelper(isNonInteractiveSession);
    if (epoch !== _apiKeyHelperEpoch)
      return value;
    if (value !== null) {
      _apiKeyHelperCache = { value, timestamp: Date.now() };
    }
    return value;
  } catch (e) {
    if (epoch !== _apiKeyHelperEpoch)
      return " ";
    const detail = e instanceof Error ? e.message : String(e);
    console.error(source_default.red(`apiKeyHelper failed: ${detail}`));
    logForDebugging(`Error getting API key from apiKeyHelper: ${detail}`, {
      level: "error"
    });
    if (!isCold && _apiKeyHelperCache && _apiKeyHelperCache.value !== " ") {
      _apiKeyHelperCache = { ..._apiKeyHelperCache, timestamp: Date.now() };
      return _apiKeyHelperCache.value;
    }
    _apiKeyHelperCache = { value: " ", timestamp: Date.now() };
    return " ";
  } finally {
    if (epoch === _apiKeyHelperEpoch) {
      _apiKeyHelperInflight = null;
    }
  }
}
async function _executeApiKeyHelper(isNonInteractiveSession) {
  const apiKeyHelper = getConfiguredApiKeyHelper();
  if (!apiKeyHelper) {
    return null;
  }
  if (isApiKeyHelperFromProjectOrLocalSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !isNonInteractiveSession) {
      const error = new Error(`Security: apiKeyHelper executed before workspace trust is confirmed. If you see this message, post in ${"https://github.com/Maitham16/ur-nexus/issues"}.`);
      logAntError("apiKeyHelper invoked before trust check", error);
      logEvent("tengu_apiKeyHelper_missing_trust11", {});
      return null;
    }
  }
  const result = await execa(apiKeyHelper, {
    shell: true,
    timeout: 10 * 60 * 1000,
    reject: false
  });
  if (result.failed) {
    const why = result.timedOut ? "timed out" : `exited ${result.exitCode}`;
    const stderr = result.stderr?.trim();
    throw new Error(stderr ? `${why}: ${stderr}` : why);
  }
  const stdout = result.stdout?.trim();
  if (!stdout) {
    throw new Error("did not return a value");
  }
  return stdout;
}
function getApiKeyFromApiKeyHelperCached() {
  return _apiKeyHelperCache?.value ?? null;
}
function clearApiKeyHelperCache() {
  _apiKeyHelperEpoch++;
  _apiKeyHelperCache = null;
  _apiKeyHelperInflight = null;
}
function prefetchApiKeyFromApiKeyHelperIfSafe(isNonInteractiveSession) {
  if (isApiKeyHelperFromProjectOrLocalSettings() && !checkHasTrustDialogAccepted()) {
    return;
  }
  getApiKeyFromApiKeyHelper(isNonInteractiveSession);
}
async function runAwsAuthRefresh() {
  const awsAuthRefresh = getConfiguredAwsAuthRefresh();
  if (!awsAuthRefresh) {
    return false;
  }
  if (isAwsAuthRefreshFromProjectSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !getIsNonInteractiveSession()) {
      const error = new Error(`Security: awsAuthRefresh executed before workspace trust is confirmed. If you see this message, post in ${"https://github.com/Maitham16/ur-nexus/issues"}.`);
      logAntError("awsAuthRefresh invoked before trust check", error);
      logEvent("tengu_awsAuthRefresh_missing_trust", {});
      return false;
    }
  }
  try {
    logForDebugging("Fetching AWS caller identity for AWS auth refresh command");
    await checkStsCallerIdentity();
    logForDebugging("Fetched AWS caller identity, skipping AWS auth refresh command");
    return false;
  } catch {
    return refreshAwsAuth(awsAuthRefresh);
  }
}
function refreshAwsAuth(awsAuthRefresh) {
  logForDebugging("Running AWS auth refresh command");
  const authStatusManager = AwsAuthStatusManager.getInstance();
  authStatusManager.startAuthentication();
  return new Promise((resolve4) => {
    const refreshProc = exec(awsAuthRefresh, {
      timeout: AWS_AUTH_REFRESH_TIMEOUT_MS
    });
    refreshProc.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        authStatusManager.addOutput(output);
        logForDebugging(output, { level: "debug" });
      }
    });
    refreshProc.stderr.on("data", (data) => {
      const error = data.toString().trim();
      if (error) {
        authStatusManager.setError(error);
        logForDebugging(error, { level: "error" });
      }
    });
    refreshProc.on("close", (code, signal) => {
      if (code === 0) {
        logForDebugging("AWS auth refresh completed successfully");
        authStatusManager.endAuthentication(true);
        resolve4(true);
      } else {
        const timedOut = signal === "SIGTERM";
        const message = timedOut ? source_default.red("AWS auth refresh timed out after 3 minutes. Run your auth command manually in a separate terminal.") : source_default.red("Error running awsAuthRefresh (in settings or ~/.ur.json):");
        console.error(message);
        authStatusManager.endAuthentication(false);
        resolve4(false);
      }
    });
  });
}
async function getAwsCredsFromCredentialExport() {
  const awsCredentialExport = getConfiguredAwsCredentialExport();
  if (!awsCredentialExport) {
    return null;
  }
  if (isAwsCredentialExportFromProjectSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !getIsNonInteractiveSession()) {
      const error = new Error(`Security: awsCredentialExport executed before workspace trust is confirmed. If you see this message, post in ${"https://github.com/Maitham16/ur-nexus/issues"}.`);
      logAntError("awsCredentialExport invoked before trust check", error);
      logEvent("tengu_awsCredentialExport_missing_trust", {});
      return null;
    }
  }
  try {
    logForDebugging("Fetching AWS caller identity for credential export command");
    await checkStsCallerIdentity();
    logForDebugging("Fetched AWS caller identity, skipping AWS credential export command");
    return null;
  } catch {
    try {
      logForDebugging("Running AWS credential export command");
      const result = await execa(awsCredentialExport, {
        shell: true,
        reject: false
      });
      if (result.exitCode !== 0 || !result.stdout) {
        throw new Error("awsCredentialExport did not return a valid value");
      }
      const awsOutput = jsonParse(result.stdout.trim());
      if (!isValidAwsStsOutput(awsOutput)) {
        throw new Error("awsCredentialExport did not return valid AWS STS output structure");
      }
      logForDebugging("AWS credentials retrieved from awsCredentialExport");
      return {
        accessKeyId: awsOutput.Credentials.AccessKeyId,
        secretAccessKey: awsOutput.Credentials.SecretAccessKey,
        sessionToken: awsOutput.Credentials.SessionToken
      };
    } catch (e) {
      const message = source_default.red("Error getting AWS credentials from awsCredentialExport (in settings or ~/.ur.json):");
      if (e instanceof Error) {
        console.error(message, e.message);
      } else {
        console.error(message, e);
      }
      return null;
    }
  }
}
function clearAwsCredentialsCache() {
  refreshAndGetAwsCredentials.cache.clear();
}
function getConfiguredGcpAuthRefresh() {
  const mergedSettings = getSettings_DEPRECATED() || {};
  return mergedSettings.gcpAuthRefresh;
}
function isGcpAuthRefreshFromProjectSettings() {
  const gcpAuthRefresh = getConfiguredGcpAuthRefresh();
  if (!gcpAuthRefresh) {
    return false;
  }
  const projectSettings = getSettingsForSource("projectSettings");
  const localSettings = getSettingsForSource("localSettings");
  return projectSettings?.gcpAuthRefresh === gcpAuthRefresh || localSettings?.gcpAuthRefresh === gcpAuthRefresh;
}
async function checkGcpCredentialsValid() {
  try {
    const { GoogleAuth } = await import("./index-0yss9gp4.js").then((m)=>__toESM(m.default,1));
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const probe = (async () => {
      const client = await auth.getClient();
      await client.getAccessToken();
    })();
    const timeout = sleep(GCP_CREDENTIALS_CHECK_TIMEOUT_MS).then(() => {
      throw new GcpCredentialsTimeoutError("GCP credentials check timed out");
    });
    await Promise.race([probe, timeout]);
    return true;
  } catch {
    return false;
  }
}
async function runGcpAuthRefresh() {
  const gcpAuthRefresh = getConfiguredGcpAuthRefresh();
  if (!gcpAuthRefresh) {
    return false;
  }
  if (isGcpAuthRefreshFromProjectSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !getIsNonInteractiveSession()) {
      const error = new Error("Security: gcpAuthRefresh executed before workspace trust is confirmed. If you see this message, post in https://github.com/Maitham16/ur-nexus/issues.");
      logAntError("gcpAuthRefresh invoked before trust check", error);
      logEvent("tengu_gcpAuthRefresh_missing_trust", {});
      return false;
    }
  }
  try {
    logForDebugging("Checking GCP credentials validity for auth refresh");
    const isValid = await checkGcpCredentialsValid();
    if (isValid) {
      logForDebugging("GCP credentials are valid, skipping auth refresh command");
      return false;
    }
  } catch {}
  return refreshGcpAuth(gcpAuthRefresh);
}
function refreshGcpAuth(gcpAuthRefresh) {
  logForDebugging("Running GCP auth refresh command");
  const authStatusManager = AwsAuthStatusManager.getInstance();
  authStatusManager.startAuthentication();
  return new Promise((resolve4) => {
    const refreshProc = exec(gcpAuthRefresh, {
      timeout: GCP_AUTH_REFRESH_TIMEOUT_MS
    });
    refreshProc.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        authStatusManager.addOutput(output);
        logForDebugging(output, { level: "debug" });
      }
    });
    refreshProc.stderr.on("data", (data) => {
      const error = data.toString().trim();
      if (error) {
        authStatusManager.setError(error);
        logForDebugging(error, { level: "error" });
      }
    });
    refreshProc.on("close", (code, signal) => {
      if (code === 0) {
        logForDebugging("GCP auth refresh completed successfully");
        authStatusManager.endAuthentication(true);
        resolve4(true);
      } else {
        const timedOut = signal === "SIGTERM";
        const message = timedOut ? source_default.red("GCP auth refresh timed out after 3 minutes. Run your auth command manually in a separate terminal.") : source_default.red("Error running gcpAuthRefresh (in settings or ~/.ur.json):");
        console.error(message);
        authStatusManager.endAuthentication(false);
        resolve4(false);
      }
    });
  });
}
function clearGcpCredentialsCache() {
  refreshGcpCredentialsIfNeeded.cache.clear();
}
function prefetchGcpCredentialsIfSafe() {
  const gcpAuthRefresh = getConfiguredGcpAuthRefresh();
  if (!gcpAuthRefresh) {
    return;
  }
  if (isGcpAuthRefreshFromProjectSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !getIsNonInteractiveSession()) {
      return;
    }
  }
  refreshGcpCredentialsIfNeeded();
}
function prefetchAwsCredentialsAndBedRockInfoIfSafe() {
  const awsAuthRefresh = getConfiguredAwsAuthRefresh();
  const awsCredentialExport = getConfiguredAwsCredentialExport();
  if (!awsAuthRefresh && !awsCredentialExport) {
    return;
  }
  if (isAwsAuthRefreshFromProjectSettings() || isAwsCredentialExportFromProjectSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust && !getIsNonInteractiveSession()) {
      return;
    }
  }
  refreshAndGetAwsCredentials();
  getModelStrings2();
}
function isValidApiKey(apiKey) {
  return /^[a-zA-Z0-9-_]+$/.test(apiKey);
}
async function saveApiKey(apiKey) {
  if (!isValidApiKey(apiKey)) {
    throw new Error("Invalid API key format. API key must contain only alphanumeric characters, dashes, and underscores.");
  }
  await maybeRemoveApiKeyFromMacOSKeychain();
  let savedToKeychain = false;
  if (process.platform === "darwin") {
    try {
      const storageServiceName = getMacOsKeychainStorageServiceName();
      const username = getUsername();
      const hexValue = Buffer.from(apiKey, "utf-8").toString("hex");
      const command = `add-generic-password -U -a "${username}" -s "${storageServiceName}" -X "${hexValue}"
`;
      await execa("security", ["-i"], {
        input: command,
        reject: false
      });
      logEvent("tengu_api_key_saved_to_keychain", {});
      savedToKeychain = true;
    } catch (e) {
      logError(e);
      logEvent("tengu_api_key_keychain_error", {
        error: errorMessage(e)
      });
      logEvent("tengu_api_key_saved_to_config", {});
    }
  } else {
    logEvent("tengu_api_key_saved_to_config", {});
  }
  const normalizedKey = normalizeApiKeyForConfig(apiKey);
  saveGlobalConfig((current) => {
    const approved = current.customApiKeyResponses?.approved ?? [];
    return {
      ...current,
      primaryApiKey: savedToKeychain ? current.primaryApiKey : apiKey,
      customApiKeyResponses: {
        ...current.customApiKeyResponses,
        approved: approved.includes(normalizedKey) ? approved : [...approved, normalizedKey],
        rejected: current.customApiKeyResponses?.rejected ?? []
      }
    };
  });
  getApiKeyFromConfigOrMacOSKeychain.cache.clear?.();
  clearLegacyApiKeyPrefetch();
}
function isCustomApiKeyApproved(apiKey) {
  const config = getGlobalConfig();
  const normalizedKey = normalizeApiKeyForConfig(apiKey);
  return config.customApiKeyResponses?.approved?.includes(normalizedKey) ?? false;
}
async function removeApiKey() {
  await maybeRemoveApiKeyFromMacOSKeychain();
  saveGlobalConfig((current) => ({
    ...current,
    primaryApiKey: undefined
  }));
  getApiKeyFromConfigOrMacOSKeychain.cache.clear?.();
  clearLegacyApiKeyPrefetch();
}
async function maybeRemoveApiKeyFromMacOSKeychain() {
  try {
    await maybeRemoveApiKeyFromMacOSKeychainThrows();
  } catch (e) {
    logError(e);
  }
}
function saveOAuthTokensIfNeeded(tokens) {
  if (!shouldUseURAIAuth(tokens.scopes)) {
    logEvent("tengu_oauth_tokens_not_ur_ai", {});
    return { success: true };
  }
  if (!tokens.refreshToken || !tokens.expiresAt) {
    logEvent("tengu_oauth_tokens_inference_only", {});
    return { success: true };
  }
  const secureStorage = getSecureStorage();
  const storageBackend = secureStorage.name;
  try {
    const storageData = secureStorage.read() || {};
    const existingOauth = storageData.urAiOauth;
    storageData.urAiOauth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scopes: tokens.scopes,
      subscriptionType: tokens.subscriptionType ?? existingOauth?.subscriptionType ?? null,
      rateLimitTier: tokens.rateLimitTier ?? existingOauth?.rateLimitTier ?? null
    };
    const updateStatus = secureStorage.update(storageData);
    if (updateStatus.success) {
      logEvent("tengu_oauth_tokens_saved", { storageBackend });
    } else {
      logEvent("tengu_oauth_tokens_save_failed", { storageBackend });
    }
    getURAIOAuthTokens.cache?.clear?.();
    clearBetasCaches();
    clearToolSchemaCache();
    return updateStatus;
  } catch (error) {
    logError(error);
    logEvent("tengu_oauth_tokens_save_exception", {
      storageBackend,
      error: errorMessage(error)
    });
    return { success: false, warning: "Failed to save OAuth tokens" };
  }
}
function clearOAuthTokenCache() {
  getURAIOAuthTokens.cache?.clear?.();
  clearKeychainCache();
}
async function invalidateOAuthCacheIfDiskChanged() {
  try {
    const { mtimeMs } = await stat2(join10(getURConfigHomeDir(), ".credentials.json"));
    if (mtimeMs !== lastCredentialsMtimeMs) {
      lastCredentialsMtimeMs = mtimeMs;
      clearOAuthTokenCache();
    }
  } catch {
    getURAIOAuthTokens.cache?.clear?.();
  }
}
function handleOAuth401Error(failedAccessToken) {
  const pending = pending401Handlers.get(failedAccessToken);
  if (pending)
    return pending;
  const promise = handleOAuth401ErrorImpl(failedAccessToken).finally(() => {
    pending401Handlers.delete(failedAccessToken);
  });
  pending401Handlers.set(failedAccessToken, promise);
  return promise;
}
async function handleOAuth401ErrorImpl(failedAccessToken) {
  clearOAuthTokenCache();
  const currentTokens = await getURAIOAuthTokensAsync();
  if (!currentTokens?.refreshToken) {
    return false;
  }
  if (currentTokens.accessToken !== failedAccessToken) {
    logEvent("tengu_oauth_401_recovered_from_keychain", {});
    return true;
  }
  return checkAndRefreshOAuthTokenIfNeeded(0, true);
}
async function getURAIOAuthTokensAsync() {
  if (isBareMode())
    return null;
  if (process.env.UR_CODE_OAUTH_TOKEN || getOAuthTokenFromFileDescriptor()) {
    return getURAIOAuthTokens();
  }
  try {
    const secureStorage = getSecureStorage();
    const storageData = await secureStorage.readAsync();
    const oauthData = storageData?.urAiOauth;
    if (!oauthData?.accessToken) {
      return null;
    }
    return oauthData;
  } catch (error) {
    logError(error);
    return null;
  }
}
function checkAndRefreshOAuthTokenIfNeeded(retryCount = 0, force = false) {
  if (retryCount === 0 && !force) {
    if (pendingRefreshCheck) {
      return pendingRefreshCheck;
    }
    const promise = checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force);
    pendingRefreshCheck = promise.finally(() => {
      pendingRefreshCheck = null;
    });
    return pendingRefreshCheck;
  }
  return checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force);
}
async function checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force) {
  const MAX_RETRIES = 5;
  await invalidateOAuthCacheIfDiskChanged();
  const tokens = getURAIOAuthTokens();
  if (!force) {
    if (!tokens?.refreshToken || !isOAuthTokenExpired(tokens.expiresAt)) {
      return false;
    }
  }
  if (!tokens?.refreshToken) {
    return false;
  }
  if (!shouldUseURAIAuth(tokens.scopes)) {
    return false;
  }
  getURAIOAuthTokens.cache?.clear?.();
  clearKeychainCache();
  const freshTokens = await getURAIOAuthTokensAsync();
  if (!freshTokens?.refreshToken || !isOAuthTokenExpired(freshTokens.expiresAt)) {
    return false;
  }
  const urDir = getURConfigHomeDir();
  await mkdir(urDir, { recursive: true });
  let release;
  try {
    logEvent("tengu_oauth_token_refresh_lock_acquiring", {});
    release = await lock(urDir);
    logEvent("tengu_oauth_token_refresh_lock_acquired", {});
  } catch (err) {
    if (err.code === "ELOCKED") {
      if (retryCount < MAX_RETRIES) {
        logEvent("tengu_oauth_token_refresh_lock_retry", {
          retryCount: retryCount + 1
        });
        await sleep(1000 + Math.random() * 1000);
        return checkAndRefreshOAuthTokenIfNeededImpl(retryCount + 1, force);
      }
      logEvent("tengu_oauth_token_refresh_lock_retry_limit_reached", {
        maxRetries: MAX_RETRIES
      });
      return false;
    }
    logError(err);
    logEvent("tengu_oauth_token_refresh_lock_error", {
      error: errorMessage(err)
    });
    return false;
  }
  try {
    getURAIOAuthTokens.cache?.clear?.();
    clearKeychainCache();
    const lockedTokens = await getURAIOAuthTokensAsync();
    if (!lockedTokens?.refreshToken || !isOAuthTokenExpired(lockedTokens.expiresAt)) {
      logEvent("tengu_oauth_token_refresh_race_resolved", {});
      return false;
    }
    logEvent("tengu_oauth_token_refresh_starting", {});
    const refreshedTokens = await refreshOAuthToken(lockedTokens.refreshToken, {
      scopes: shouldUseURAIAuth(lockedTokens.scopes) ? undefined : lockedTokens.scopes
    });
    saveOAuthTokensIfNeeded(refreshedTokens);
    getURAIOAuthTokens.cache?.clear?.();
    clearKeychainCache();
    return true;
  } catch (error) {
    logError(error);
    getURAIOAuthTokens.cache?.clear?.();
    clearKeychainCache();
    const currentTokens = await getURAIOAuthTokensAsync();
    if (currentTokens && !isOAuthTokenExpired(currentTokens.expiresAt)) {
      logEvent("tengu_oauth_token_refresh_race_recovered", {});
      return true;
    }
    return false;
  } finally {
    logEvent("tengu_oauth_token_refresh_lock_releasing", {});
    await release();
    logEvent("tengu_oauth_token_refresh_lock_released", {});
  }
}
function isURAISubscriber() {
  if (!isURHQAuthEnabled()) {
    return false;
  }
  return shouldUseURAIAuth(getURAIOAuthTokens()?.scopes);
}
function hasProfileScope() {
  return getURAIOAuthTokens()?.scopes?.includes(UR_AI_PROFILE_SCOPE) ?? false;
}
function is1PApiCustomer() {
  if (getAPIProvider() !== "firstParty") {
    return false;
  }
  if (isURAISubscriber()) {
    return false;
  }
  return true;
}
function getOauthAccountInfo() {
  return isURHQAuthEnabled() ? getGlobalConfig().oauthAccount : undefined;
}
function isOverageProvisioningAllowed() {
  const accountInfo = getOauthAccountInfo();
  const billingType = accountInfo?.billingType;
  if (!isURAISubscriber() || !billingType) {
    return false;
  }
  if (billingType !== "stripe_subscription" && billingType !== "stripe_subscription_contracted" && billingType !== "apple_subscription" && billingType !== "google_play_subscription") {
    return false;
  }
  return true;
}
function hasmodelOAccess() {
  const subscriptionType = getSubscriptionType();
  return subscriptionType === "max" || subscriptionType === "enterprise" || subscriptionType === "team" || subscriptionType === "pro" || subscriptionType === null;
}
function getSubscriptionType() {
  if (shouldUseMockSubscription()) {
    return getMockSubscriptionType();
  }
  if (!isURHQAuthEnabled()) {
    return null;
  }
  const oauthTokens = getURAIOAuthTokens();
  if (!oauthTokens) {
    return null;
  }
  return oauthTokens.subscriptionType ?? null;
}
function isMaxSubscriber() {
  return getSubscriptionType() === "max";
}
function isTeamSubscriber() {
  return getSubscriptionType() === "team";
}
function isTeamPremiumSubscriber() {
  return getSubscriptionType() === "team" && getRateLimitTier() === "default_ur_max_5x";
}
function isEnterpriseSubscriber() {
  return getSubscriptionType() === "enterprise";
}
function isProSubscriber() {
  return getSubscriptionType() === "pro";
}
function getRateLimitTier() {
  if (!isURHQAuthEnabled()) {
    return null;
  }
  const oauthTokens = getURAIOAuthTokens();
  if (!oauthTokens) {
    return null;
  }
  return oauthTokens.rateLimitTier ?? null;
}
function getSubscriptionName() {
  const subscriptionType = getSubscriptionType();
  switch (subscriptionType) {
    case "enterprise":
      return "UR Enterprise";
    case "team":
      return "UR Team";
    case "max":
      return "UR Max";
    case "pro":
      return "UR Pro";
    default:
      return "UR API";
  }
}
function isUsing3PServices() {
  return getAPIProvider() !== "firstParty";
}
function getConfiguredOtelHeadersHelper() {
  const mergedSettings = getSettings_DEPRECATED() || {};
  return mergedSettings.otelHeadersHelper;
}
function isOtelHeadersHelperFromProjectOrLocalSettings() {
  const otelHeadersHelper = getConfiguredOtelHeadersHelper();
  if (!otelHeadersHelper) {
    return false;
  }
  const projectSettings = getSettingsForSource("projectSettings");
  const localSettings = getSettingsForSource("localSettings");
  return projectSettings?.otelHeadersHelper === otelHeadersHelper || localSettings?.otelHeadersHelper === otelHeadersHelper;
}
function getOtelHeadersFromHelper() {
  const otelHeadersHelper = getConfiguredOtelHeadersHelper();
  if (!otelHeadersHelper) {
    return {};
  }
  const debounceMs = parseInt(process.env.UR_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS || DEFAULT_OTEL_HEADERS_DEBOUNCE_MS.toString());
  if (cachedOtelHeaders && Date.now() - cachedOtelHeadersTimestamp < debounceMs) {
    return cachedOtelHeaders;
  }
  if (isOtelHeadersHelperFromProjectOrLocalSettings()) {
    const hasTrust = checkHasTrustDialogAccepted();
    if (!hasTrust) {
      return {};
    }
  }
  try {
    const result = execSyncWithDefaults_DEPRECATED(otelHeadersHelper, {
      timeout: 30000
    })?.toString().trim();
    if (!result) {
      throw new Error("otelHeadersHelper did not return a valid value");
    }
    const headers = jsonParse(result);
    if (typeof headers !== "object" || headers === null || Array.isArray(headers)) {
      throw new Error("otelHeadersHelper must return a JSON object with string key-value pairs");
    }
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value !== "string") {
        throw new Error(`otelHeadersHelper returned non-string value for key "${key}": ${typeof value}`);
      }
    }
    cachedOtelHeaders = headers;
    cachedOtelHeadersTimestamp = Date.now();
    return cachedOtelHeaders;
  } catch (error) {
    logError(new Error(`Error getting OpenTelemetry headers from otelHeadersHelper (in settings): ${errorMessage(error)}`));
    throw error;
  }
}
function isConsumerPlan(plan) {
  return plan === "max" || plan === "pro";
}
function isConsumerSubscriber() {
  const subscriptionType = getSubscriptionType();
  return isURAISubscriber() && subscriptionType !== null && isConsumerPlan(subscriptionType);
}
function getAccountInformation() {
  const apiProvider = getAPIProvider();
  if (apiProvider !== "firstParty") {
    return;
  }
  const { source: authTokenSource } = getAuthTokenSource();
  const accountInfo = {};
  if (authTokenSource === "UR_CODE_OAUTH_TOKEN" || authTokenSource === "UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR") {
    accountInfo.tokenSource = authTokenSource;
  } else if (isURAISubscriber()) {
    accountInfo.subscription = getSubscriptionName();
  } else {
    accountInfo.tokenSource = authTokenSource;
  }
  const { key: apiKey, source: apiKeySource } = getURHQApiKeyWithSource();
  if (apiKey) {
    accountInfo.apiKeySource = apiKeySource;
  }
  if (authTokenSource === "ur.ai" || apiKeySource === "/login managed key") {
    const orgName = getOauthAccountInfo()?.organizationName;
    if (orgName) {
      accountInfo.organization = orgName;
    }
  }
  const email = getOauthAccountInfo()?.emailAddress;
  if ((authTokenSource === "ur.ai" || apiKeySource === "/login managed key") && email) {
    accountInfo.email = email;
  }
  return accountInfo;
}
async function validateForceLoginOrg() {
  if (process.env.URHQ_UNIX_SOCKET) {
    return { valid: true };
  }
  if (!isURHQAuthEnabled()) {
    return { valid: true };
  }
  const requiredOrgUuid = getSettingsForSource("policySettings")?.forceLoginOrgUUID;
  if (!requiredOrgUuid) {
    return { valid: true };
  }
  await checkAndRefreshOAuthTokenIfNeeded();
  const tokens = getURAIOAuthTokens();
  if (!tokens) {
    return { valid: true };
  }
  const { source } = getAuthTokenSource();
  const isEnvVarToken = source === "UR_CODE_OAUTH_TOKEN" || source === "UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR";
  const profile = await getOauthProfileFromOauthToken(tokens.accessToken);
  if (!profile) {
    return {
      valid: false,
      message: `Unable to verify organization for the current authentication token.
This machine requires organization ${requiredOrgUuid} but the profile could not be fetched.
This may be a network error, or the token may lack the user:profile scope required for
verification (tokens from 'ur setup-token' do not include this scope).
Try again, or obtain a full-scope token via 'ur auth login'.`
    };
  }
  const tokenOrgUuid = profile.organization.uuid;
  if (tokenOrgUuid === requiredOrgUuid) {
    return { valid: true };
  }
  if (isEnvVarToken) {
    const envVarName = source === "UR_CODE_OAUTH_TOKEN" ? "UR_CODE_OAUTH_TOKEN" : "UR_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR";
    return {
      valid: false,
      message: `The ${envVarName} environment variable provides a token for a
different organization than required by this machine's managed settings.

Required organization: ${requiredOrgUuid}
Token organization:   ${tokenOrgUuid}

Remove the environment variable or obtain a token for the correct organization.`
    };
  }
  return {
    valid: false,
    message: `Your authentication token belongs to organization ${tokenOrgUuid},
but this machine requires organization ${requiredOrgUuid}.

Please log in with the correct organization: ur auth login`
  };
}
var DEFAULT_API_KEY_HELPER_TTL, _apiKeyHelperCache = null, _apiKeyHelperInflight = null, _apiKeyHelperEpoch = 0, DEFAULT_AWS_STS_TTL, AWS_AUTH_REFRESH_TIMEOUT_MS, refreshAndGetAwsCredentials, GCP_CREDENTIALS_CHECK_TIMEOUT_MS = 5000, DEFAULT_GCP_CREDENTIAL_TTL = 3600000, GCP_AUTH_REFRESH_TIMEOUT_MS = 180000, refreshGcpCredentialsIfNeeded, getApiKeyFromConfigOrMacOSKeychain, getURAIOAuthTokens, lastCredentialsMtimeMs = 0, pending401Handlers, pendingRefreshCheck = null, cachedOtelHeaders = null, cachedOtelHeadersTimestamp = 0, DEFAULT_OTEL_HEADERS_DEBOUNCE_MS = 1740000, GcpCredentialsTimeoutError;
var init_auth = __esm(() => {
  init_source();
  init_execa();
  init_memoize();
  init_oauth();
  init_analytics();
  init_modelStrings();
  init_providers();
  init_state();
  init_mockRateLimits();
  init_client();
  init_getOauthProfile();
  init_authFileDescriptor();
  init_authPortable();
  init_aws();
  init_awsAuthStatusManager();
  init_betas2();
  init_config();
  init_debug();
  init_envUtils();
  init_errors();
  init_execFileNoThrow();
  init_lockfile();
  init_log();
  init_memoize2();
  init_secureStorage();
  init_keychainPrefetch();
  init_macOsKeychainHelpers();
  init_settings2();
  init_sleep();
  init_slowOperations();
  init_toolSchemaCache();
  DEFAULT_API_KEY_HELPER_TTL = 5 * 60 * 1000;
  DEFAULT_AWS_STS_TTL = 60 * 60 * 1000;
  AWS_AUTH_REFRESH_TIMEOUT_MS = 3 * 60 * 1000;
  refreshAndGetAwsCredentials = memoizeWithTTLAsync(async () => {
    const refreshed = await runAwsAuthRefresh();
    const credentials = await getAwsCredsFromCredentialExport();
    if (refreshed || credentials) {
      await clearAwsIniCache();
    }
    return credentials;
  }, DEFAULT_AWS_STS_TTL);
  refreshGcpCredentialsIfNeeded = memoizeWithTTLAsync(async () => {
    const refreshed = await runGcpAuthRefresh();
    return refreshed;
  }, DEFAULT_GCP_CREDENTIAL_TTL);
  getApiKeyFromConfigOrMacOSKeychain = memoize_default(() => {
    if (isBareMode())
      return null;
    if (process.platform === "darwin") {
      const prefetch = getLegacyApiKeyPrefetchResult();
      if (prefetch) {
        if (prefetch.stdout) {
          return { key: prefetch.stdout, source: "/login managed key" };
        }
      } else {
        const storageServiceName = getMacOsKeychainStorageServiceName();
        try {
          const result = execSyncWithDefaults_DEPRECATED(`security find-generic-password -a $USER -w -s "${storageServiceName}"`);
          if (result) {
            return { key: result, source: "/login managed key" };
          }
        } catch (e) {
          logError(e);
        }
      }
    }
    const config = getGlobalConfig();
    if (!config.primaryApiKey) {
      return null;
    }
    return { key: config.primaryApiKey, source: "/login managed key" };
  });
  getURAIOAuthTokens = memoize_default(() => {
    if (isBareMode())
      return null;
    if (process.env.UR_CODE_OAUTH_TOKEN) {
      return {
        accessToken: process.env.UR_CODE_OAUTH_TOKEN,
        refreshToken: null,
        expiresAt: null,
        scopes: ["user:inference"],
        subscriptionType: null,
        rateLimitTier: null
      };
    }
    const oauthTokenFromFd = getOAuthTokenFromFileDescriptor();
    if (oauthTokenFromFd) {
      return {
        accessToken: oauthTokenFromFd,
        refreshToken: null,
        expiresAt: null,
        scopes: ["user:inference"],
        subscriptionType: null,
        rateLimitTier: null
      };
    }
    try {
      const secureStorage = getSecureStorage();
      const storageData = secureStorage.read();
      const oauthData = storageData?.urAiOauth;
      if (!oauthData?.accessToken) {
        return null;
      }
      return oauthData;
    } catch (error) {
      logError(error);
      return null;
    }
  });
  pending401Handlers = new Map;
  GcpCredentialsTimeoutError = class GcpCredentialsTimeoutError extends Error {
  };
});

// src/utils/userAgent.ts
function getURCodeUserAgent() {
  return `ur/${"1.0.2"}`;
}
var init_userAgent = () => {};

// src/utils/workloadContext.ts
import { AsyncLocalStorage } from "async_hooks";
function getWorkload() {
  return workloadStorage.getStore()?.workload;
}
var workloadStorage;
var init_workloadContext = __esm(() => {
  workloadStorage = new AsyncLocalStorage;
});

// src/utils/http.ts
function getUserAgent() {
  const agentSdkVersion = process.env.UR_AGENT_SDK_VERSION ? `, agent-sdk/${process.env.UR_AGENT_SDK_VERSION}` : "";
  const clientApp = process.env.UR_AGENT_SDK_CLIENT_APP ? `, client-app/${process.env.UR_AGENT_SDK_CLIENT_APP}` : "";
  const workload = getWorkload();
  const workloadSuffix = workload ? `, workload/${workload}` : "";
  return `ur-cli/${"1.0.2"} (${process.env.USER_TYPE}, ${process.env.UR_CODE_ENTRYPOINT ?? "cli"}${agentSdkVersion}${clientApp}${workloadSuffix})`;
}
function getMCPUserAgent() {
  const parts = [];
  if (process.env.UR_CODE_ENTRYPOINT) {
    parts.push(process.env.UR_CODE_ENTRYPOINT);
  }
  if (process.env.UR_AGENT_SDK_VERSION) {
    parts.push(`agent-sdk/${process.env.UR_AGENT_SDK_VERSION}`);
  }
  if (process.env.UR_AGENT_SDK_CLIENT_APP) {
    parts.push(`client-app/${process.env.UR_AGENT_SDK_CLIENT_APP}`);
  }
  const suffix = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `ur/${"1.0.2"}${suffix}`;
}
function getWebFetchUserAgent() {
  return `UR-User (${getURCodeUserAgent()})`;
}
function getAuthHeaders() {
  if (isURAISubscriber()) {
    const oauthTokens = getURAIOAuthTokens();
    if (!oauthTokens?.accessToken) {
      return {
        headers: {},
        error: "No OAuth token available"
      };
    }
    return {
      headers: {
        Authorization: `Bearer ${oauthTokens.accessToken}`,
        "urhq-beta": OAUTH_BETA_HEADER
      }
    };
  }
  const apiKey = getURHQApiKey();
  if (!apiKey) {
    return {
      headers: {},
      error: "No API key available"
    };
  }
  return {
    headers: {
      "x-api-key": apiKey
    }
  };
}
async function withOAuth401Retry(request, opts) {
  try {
    return await request();
  } catch (err) {
    if (!axios_default.isAxiosError(err))
      throw err;
    const status = err.response?.status;
    const isAuthError = status === 401 || opts?.also403Revoked && status === 403 && typeof err.response?.data === "string" && err.response.data.includes("OAuth token has been revoked");
    if (!isAuthError)
      throw err;
    const failedAccessToken = getURAIOAuthTokens()?.accessToken;
    if (!failedAccessToken)
      throw err;
    await handleOAuth401Error(failedAccessToken);
    return await request();
  }
}
var init_http = __esm(() => {
  init_axios();
  init_oauth();
  init_auth();
  init_userAgent();
  init_workloadContext();
});

// src/utils/user.ts
function resetUserCache() {
  cachedEmail = null;
  emailFetchPromise = null;
  getCoreUserData.cache.clear?.();
  getGitEmail.cache.clear?.();
}
function getUserForGrowthBook() {
  return getCoreUserData(true);
}
function getEmail() {
  if (cachedEmail !== null) {
    return cachedEmail;
  }
  const oauthAccount = getOauthAccountInfo();
  if (oauthAccount?.emailAddress) {
    return oauthAccount.emailAddress;
  }
  if (process.env.USER_TYPE !== "ant") {
    return;
  }
  if (process.env.COO_CREATOR) {
    return `${process.env.COO_CREATOR}@ur.local`;
  }
  return;
}
var cachedEmail = null, emailFetchPromise = null, getCoreUserData, getGitEmail;
var init_user = __esm(() => {
  init_execa();
  init_memoize();
  init_state();
  init_auth();
  init_config();
  init_cwd();
  init_env();
  init_envUtils();
  getCoreUserData = memoize_default((includeAnalyticsMetadata) => {
    const deviceId = getOrCreateUserID();
    const config = getGlobalConfig();
    let subscriptionType;
    let rateLimitTier;
    let firstTokenTime;
    if (includeAnalyticsMetadata) {
      subscriptionType = getSubscriptionType() ?? undefined;
      rateLimitTier = getRateLimitTier() ?? undefined;
      if (subscriptionType && config.urCodeFirstTokenDate) {
        const configFirstTokenTime = new Date(config.urCodeFirstTokenDate).getTime();
        if (!isNaN(configFirstTokenTime)) {
          firstTokenTime = configFirstTokenTime;
        }
      }
    }
    const oauthAccount = getOauthAccountInfo();
    const organizationUuid = oauthAccount?.organizationUuid;
    const accountUuid = oauthAccount?.accountUuid;
    return {
      deviceId,
      sessionId: getSessionId(),
      email: getEmail(),
      appVersion: "1.0.2",
      platform: getHostPlatformForAnalytics(),
      organizationUuid,
      accountUuid,
      userType: process.env.USER_TYPE,
      subscriptionType,
      rateLimitTier,
      firstTokenTime,
      ...isEnvTruthy(process.env.GITHUB_ACTIONS) && {
        githubActionsMetadata: {
          actor: process.env.GITHUB_ACTOR,
          actorId: process.env.GITHUB_ACTOR_ID,
          repository: process.env.GITHUB_REPOSITORY,
          repositoryId: process.env.GITHUB_REPOSITORY_ID,
          repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
          repositoryOwnerId: process.env.GITHUB_REPOSITORY_OWNER_ID
        }
      }
    };
  });
  getGitEmail = memoize_default(async () => {
    const result = await execa("git config --get user.email", {
      shell: true,
      reject: false,
      cwd: getCwd()
    });
    return result.exitCode === 0 && result.stdout ? result.stdout.trim() : undefined;
  });
});

// src/utils/intl.ts
function getGraphemeSegmenter() {
  if (!graphemeSegmenter) {
    graphemeSegmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme"
    });
  }
  return graphemeSegmenter;
}
function firstGrapheme(text) {
  if (!text)
    return "";
  const segments = getGraphemeSegmenter().segment(text);
  const first = segments[Symbol.iterator]().next().value;
  return first?.segment ?? "";
}
function getWordSegmenter() {
  if (!wordSegmenter) {
    wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  }
  return wordSegmenter;
}
function getRelativeTimeFormat(style, numeric) {
  const key = `${style}:${numeric}`;
  let rtf = rtfCache.get(key);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat("en", { style, numeric });
    rtfCache.set(key, rtf);
  }
  return rtf;
}
function getTimeZone() {
  if (!cachedTimeZone) {
    cachedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return cachedTimeZone;
}
var graphemeSegmenter = null, wordSegmenter = null, rtfCache, cachedTimeZone = null;
var init_intl = __esm(() => {
  rtfCache = new Map;
});

// node_modules/.bun/emoji-regex@10.6.0/node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS((exports, module) => {
  module.exports = () => {
    return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
  };
});

// node_modules/.bun/get-east-asian-width@1.5.0/node_modules/get-east-asian-width/lookup-data.js
var ambiguousRanges, fullwidthRanges, halfwidthRanges, narrowRanges, wideRanges;
var init_lookup_data = __esm(() => {
  ambiguousRanges = [161, 161, 164, 164, 167, 168, 170, 170, 173, 174, 176, 180, 182, 186, 188, 191, 198, 198, 208, 208, 215, 216, 222, 225, 230, 230, 232, 234, 236, 237, 240, 240, 242, 243, 247, 250, 252, 252, 254, 254, 257, 257, 273, 273, 275, 275, 283, 283, 294, 295, 299, 299, 305, 307, 312, 312, 319, 322, 324, 324, 328, 331, 333, 333, 338, 339, 358, 359, 363, 363, 462, 462, 464, 464, 466, 466, 468, 468, 470, 470, 472, 472, 474, 474, 476, 476, 593, 593, 609, 609, 708, 708, 711, 711, 713, 715, 717, 717, 720, 720, 728, 731, 733, 733, 735, 735, 768, 879, 913, 929, 931, 937, 945, 961, 963, 969, 1025, 1025, 1040, 1103, 1105, 1105, 8208, 8208, 8211, 8214, 8216, 8217, 8220, 8221, 8224, 8226, 8228, 8231, 8240, 8240, 8242, 8243, 8245, 8245, 8251, 8251, 8254, 8254, 8308, 8308, 8319, 8319, 8321, 8324, 8364, 8364, 8451, 8451, 8453, 8453, 8457, 8457, 8467, 8467, 8470, 8470, 8481, 8482, 8486, 8486, 8491, 8491, 8531, 8532, 8539, 8542, 8544, 8555, 8560, 8569, 8585, 8585, 8592, 8601, 8632, 8633, 8658, 8658, 8660, 8660, 8679, 8679, 8704, 8704, 8706, 8707, 8711, 8712, 8715, 8715, 8719, 8719, 8721, 8721, 8725, 8725, 8730, 8730, 8733, 8736, 8739, 8739, 8741, 8741, 8743, 8748, 8750, 8750, 8756, 8759, 8764, 8765, 8776, 8776, 8780, 8780, 8786, 8786, 8800, 8801, 8804, 8807, 8810, 8811, 8814, 8815, 8834, 8835, 8838, 8839, 8853, 8853, 8857, 8857, 8869, 8869, 8895, 8895, 8978, 8978, 9312, 9449, 9451, 9547, 9552, 9587, 9600, 9615, 9618, 9621, 9632, 9633, 9635, 9641, 9650, 9651, 9654, 9655, 9660, 9661, 9664, 9665, 9670, 9672, 9675, 9675, 9678, 9681, 9698, 9701, 9711, 9711, 9733, 9734, 9737, 9737, 9742, 9743, 9756, 9756, 9758, 9758, 9792, 9792, 9794, 9794, 9824, 9825, 9827, 9829, 9831, 9834, 9836, 9837, 9839, 9839, 9886, 9887, 9919, 9919, 9926, 9933, 9935, 9939, 9941, 9953, 9955, 9955, 9960, 9961, 9963, 9969, 9972, 9972, 9974, 9977, 9979, 9980, 9982, 9983, 10045, 10045, 10102, 10111, 11094, 11097, 12872, 12879, 57344, 63743, 65024, 65039, 65533, 65533, 127232, 127242, 127248, 127277, 127280, 127337, 127344, 127373, 127375, 127376, 127387, 127404, 917760, 917999, 983040, 1048573, 1048576, 1114109];
  fullwidthRanges = [12288, 12288, 65281, 65376, 65504, 65510];
  halfwidthRanges = [8361, 8361, 65377, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65512, 65518];
  narrowRanges = [32, 126, 162, 163, 165, 166, 172, 172, 175, 175, 10214, 10221, 10629, 10630];
  wideRanges = [4352, 4447, 8986, 8987, 9001, 9002, 9193, 9196, 9200, 9200, 9203, 9203, 9725, 9726, 9748, 9749, 9776, 9783, 9800, 9811, 9855, 9855, 9866, 9871, 9875, 9875, 9889, 9889, 9898, 9899, 9917, 9918, 9924, 9925, 9934, 9934, 9940, 9940, 9962, 9962, 9970, 9971, 9973, 9973, 9978, 9978, 9981, 9981, 9989, 9989, 9994, 9995, 10024, 10024, 10060, 10060, 10062, 10062, 10067, 10069, 10071, 10071, 10133, 10135, 10160, 10160, 10175, 10175, 11035, 11036, 11088, 11088, 11093, 11093, 11904, 11929, 11931, 12019, 12032, 12245, 12272, 12287, 12289, 12350, 12353, 12438, 12441, 12543, 12549, 12591, 12593, 12686, 12688, 12773, 12783, 12830, 12832, 12871, 12880, 42124, 42128, 42182, 43360, 43388, 44032, 55203, 63744, 64255, 65040, 65049, 65072, 65106, 65108, 65126, 65128, 65131, 94176, 94180, 94192, 94198, 94208, 101589, 101631, 101662, 101760, 101874, 110576, 110579, 110581, 110587, 110589, 110590, 110592, 110882, 110898, 110898, 110928, 110930, 110933, 110933, 110948, 110951, 110960, 111355, 119552, 119638, 119648, 119670, 126980, 126980, 127183, 127183, 127374, 127374, 127377, 127386, 127488, 127490, 127504, 127547, 127552, 127560, 127568, 127569, 127584, 127589, 127744, 127776, 127789, 127797, 127799, 127868, 127870, 127891, 127904, 127946, 127951, 127955, 127968, 127984, 127988, 127988, 127992, 128062, 128064, 128064, 128066, 128252, 128255, 128317, 128331, 128334, 128336, 128359, 128378, 128378, 128405, 128406, 128420, 128420, 128507, 128591, 128640, 128709, 128716, 128716, 128720, 128722, 128725, 128728, 128732, 128735, 128747, 128748, 128756, 128764, 128992, 129003, 129008, 129008, 129292, 129338, 129340, 129349, 129351, 129535, 129648, 129660, 129664, 129674, 129678, 129734, 129736, 129736, 129741, 129756, 129759, 129770, 129775, 129784, 131072, 196605, 196608, 262141];
});

// node_modules/.bun/get-east-asian-width@1.5.0/node_modules/get-east-asian-width/utilities.js
var isInRange = (ranges, codePoint) => {
  let low = 0;
  let high = Math.floor(ranges.length / 2) - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const i = mid * 2;
    if (codePoint < ranges[i]) {
      high = mid - 1;
    } else if (codePoint > ranges[i + 1]) {
      low = mid + 1;
    } else {
      return true;
    }
  }
  return false;
};
var init_utilities2 = () => {};

// node_modules/.bun/get-east-asian-width@1.5.0/node_modules/get-east-asian-width/lookup.js
function findWideFastPathRange(ranges) {
  let fastPathStart = ranges[0];
  let fastPathEnd = ranges[1];
  for (let index = 0;index < ranges.length; index += 2) {
    const start = ranges[index];
    const end = ranges[index + 1];
    if (commonCjkCodePoint >= start && commonCjkCodePoint <= end) {
      return [start, end];
    }
    if (end - start > fastPathEnd - fastPathStart) {
      fastPathStart = start;
      fastPathEnd = end;
    }
  }
  return [fastPathStart, fastPathEnd];
}
var minimumAmbiguousCodePoint, maximumAmbiguousCodePoint, minimumFullWidthCodePoint, maximumFullWidthCodePoint, minimumHalfWidthCodePoint, maximumHalfWidthCodePoint, minimumNarrowCodePoint, maximumNarrowCodePoint, minimumWideCodePoint, maximumWideCodePoint, commonCjkCodePoint = 19968, wideFastPathStart, wideFastPathEnd, isAmbiguous = (codePoint) => {
  if (codePoint < minimumAmbiguousCodePoint || codePoint > maximumAmbiguousCodePoint) {
    return false;
  }
  return isInRange(ambiguousRanges, codePoint);
}, isFullWidth = (codePoint) => {
  if (codePoint < minimumFullWidthCodePoint || codePoint > maximumFullWidthCodePoint) {
    return false;
  }
  return isInRange(fullwidthRanges, codePoint);
}, isWide = (codePoint) => {
  if (codePoint >= wideFastPathStart && codePoint <= wideFastPathEnd) {
    return true;
  }
  if (codePoint < minimumWideCodePoint || codePoint > maximumWideCodePoint) {
    return false;
  }
  return isInRange(wideRanges, codePoint);
};
var init_lookup = __esm(() => {
  init_lookup_data();
  init_utilities2();
  minimumAmbiguousCodePoint = ambiguousRanges[0];
  maximumAmbiguousCodePoint = ambiguousRanges.at(-1);
  minimumFullWidthCodePoint = fullwidthRanges[0];
  maximumFullWidthCodePoint = fullwidthRanges.at(-1);
  minimumHalfWidthCodePoint = halfwidthRanges[0];
  maximumHalfWidthCodePoint = halfwidthRanges.at(-1);
  minimumNarrowCodePoint = narrowRanges[0];
  maximumNarrowCodePoint = narrowRanges.at(-1);
  minimumWideCodePoint = wideRanges[0];
  maximumWideCodePoint = wideRanges.at(-1);
  [wideFastPathStart, wideFastPathEnd] = findWideFastPathRange(wideRanges);
});

// node_modules/.bun/get-east-asian-width@1.5.0/node_modules/get-east-asian-width/index.js
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
  validate(codePoint);
  if (isFullWidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) {
    return 2;
  }
  return 1;
}
var init_get_east_asian_width = __esm(() => {
  init_lookup();
});

// node_modules/.bun/ansi-regex@6.2.2/node_modules/ansi-regex/index.js
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;
  const csi = "[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  const pattern = `${osc}|${csi}`;
  return new RegExp(pattern, onlyFirst ? undefined : "g");
}
var init_ansi_regex = () => {};

// node_modules/.bun/strip-ansi@7.2.0/node_modules/strip-ansi/index.js
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  if (!string.includes("\x1B") && !string.includes("")) {
    return string;
  }
  return string.replace(regex, "");
}
var regex;
var init_strip_ansi = __esm(() => {
  init_ansi_regex();
  regex = ansiRegex();
});

// src/ink/stringWidth.ts
function stringWidthJavaScript(str) {
  if (typeof str !== "string" || str.length === 0) {
    return 0;
  }
  let isPureAscii = true;
  for (let i = 0;i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 127 || code === 27) {
      isPureAscii = false;
      break;
    }
  }
  if (isPureAscii) {
    let width2 = 0;
    for (let i = 0;i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code > 31) {
        width2++;
      }
    }
    return width2;
  }
  if (str.includes("\x1B")) {
    str = stripAnsi(str);
    if (str.length === 0) {
      return 0;
    }
  }
  if (!needsSegmentation(str)) {
    let width2 = 0;
    for (const char of str) {
      const codePoint = char.codePointAt(0);
      if (!isZeroWidth(codePoint)) {
        width2 += eastAsianWidth(codePoint, { ambiguousAsWide: false });
      }
    }
    return width2;
  }
  let width = 0;
  for (const { segment: grapheme } of getGraphemeSegmenter().segment(str)) {
    EMOJI_REGEX.lastIndex = 0;
    if (EMOJI_REGEX.test(grapheme)) {
      width += getEmojiWidth(grapheme);
      continue;
    }
    for (const char of grapheme) {
      const codePoint = char.codePointAt(0);
      if (!isZeroWidth(codePoint)) {
        width += eastAsianWidth(codePoint, { ambiguousAsWide: false });
        break;
      }
    }
  }
  return width;
}
function needsSegmentation(str) {
  for (const char of str) {
    const cp = char.codePointAt(0);
    if (cp >= 127744 && cp <= 129791)
      return true;
    if (cp >= 9728 && cp <= 10175)
      return true;
    if (cp >= 127462 && cp <= 127487)
      return true;
    if (cp >= 65024 && cp <= 65039)
      return true;
    if (cp === 8205)
      return true;
  }
  return false;
}
function getEmojiWidth(grapheme) {
  const first = grapheme.codePointAt(0);
  if (first >= 127462 && first <= 127487) {
    let count2 = 0;
    for (const _ of grapheme)
      count2++;
    return count2 === 1 ? 1 : 2;
  }
  if (grapheme.length === 2) {
    const second = grapheme.codePointAt(1);
    if (second === 65039 && (first >= 48 && first <= 57 || first === 35 || first === 42)) {
      return 1;
    }
  }
  return 2;
}
function isZeroWidth(codePoint) {
  if (codePoint >= 32 && codePoint < 127)
    return false;
  if (codePoint >= 160 && codePoint < 768)
    return codePoint === 173;
  if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159)
    return true;
  if (codePoint >= 8203 && codePoint <= 8205 || codePoint === 65279 || codePoint >= 8288 && codePoint <= 8292) {
    return true;
  }
  if (codePoint >= 65024 && codePoint <= 65039 || codePoint >= 917760 && codePoint <= 917999) {
    return true;
  }
  if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) {
    return true;
  }
  if (codePoint >= 2304 && codePoint <= 3407) {
    const offset = codePoint & 127;
    if (offset <= 3)
      return true;
    if (offset >= 58 && offset <= 79)
      return true;
    if (offset >= 81 && offset <= 87)
      return true;
    if (offset >= 98 && offset <= 99)
      return true;
  }
  if (codePoint === 3633 || codePoint >= 3636 && codePoint <= 3642 || codePoint >= 3655 && codePoint <= 3662 || codePoint === 3761 || codePoint >= 3764 && codePoint <= 3772 || codePoint >= 3784 && codePoint <= 3789) {
    return true;
  }
  if (codePoint >= 1536 && codePoint <= 1541 || codePoint === 1757 || codePoint === 1807 || codePoint === 2274) {
    return true;
  }
  if (codePoint >= 55296 && codePoint <= 57343)
    return true;
  if (codePoint >= 917504 && codePoint <= 917631)
    return true;
  return false;
}
var import_emoji_regex, EMOJI_REGEX, bunStringWidth, BUN_STRING_WIDTH_OPTS, stringWidth;
var init_stringWidth = __esm(() => {
  init_get_east_asian_width();
  init_strip_ansi();
  init_intl();
  import_emoji_regex = __toESM(require_emoji_regex(), 1);
  EMOJI_REGEX = import_emoji_regex.default();
  bunStringWidth = typeof Bun !== "undefined" && typeof Bun.stringWidth === "function" ? Bun.stringWidth : null;
  BUN_STRING_WIDTH_OPTS = { ambiguousIsNarrow: true };
  stringWidth = bunStringWidth ? (str) => bunStringWidth(str, BUN_STRING_WIDTH_OPTS) : stringWidthJavaScript;
});

// src/utils/truncate.ts
function truncatePathMiddle(path2, maxLength) {
  if (stringWidth(path2) <= maxLength) {
    return path2;
  }
  if (maxLength <= 0) {
    return "…";
  }
  if (maxLength < 5) {
    return truncateToWidth(path2, maxLength);
  }
  const lastSlash = path2.lastIndexOf("/");
  const filename = lastSlash >= 0 ? path2.slice(lastSlash) : path2;
  const directory = lastSlash >= 0 ? path2.slice(0, lastSlash) : "";
  const filenameWidth = stringWidth(filename);
  if (filenameWidth >= maxLength - 1) {
    return truncateStartToWidth(path2, maxLength);
  }
  const availableForDir = maxLength - 1 - filenameWidth;
  if (availableForDir <= 0) {
    return truncateStartToWidth(filename, maxLength);
  }
  const truncatedDir = truncateToWidthNoEllipsis(directory, availableForDir);
  return truncatedDir + "…" + filename;
}
function truncateToWidth(text, maxWidth) {
  if (stringWidth(text) <= maxWidth)
    return text;
  if (maxWidth <= 1)
    return "…";
  let width = 0;
  let result = "";
  for (const { segment } of getGraphemeSegmenter().segment(text)) {
    const segWidth = stringWidth(segment);
    if (width + segWidth > maxWidth - 1)
      break;
    result += segment;
    width += segWidth;
  }
  return result + "…";
}
function truncateStartToWidth(text, maxWidth) {
  if (stringWidth(text) <= maxWidth)
    return text;
  if (maxWidth <= 1)
    return "…";
  const segments = [...getGraphemeSegmenter().segment(text)];
  let width = 0;
  let startIdx = segments.length;
  for (let i = segments.length - 1;i >= 0; i--) {
    const segWidth = stringWidth(segments[i].segment);
    if (width + segWidth > maxWidth - 1)
      break;
    width += segWidth;
    startIdx = i;
  }
  return "…" + segments.slice(startIdx).map((s) => s.segment).join("");
}
function truncateToWidthNoEllipsis(text, maxWidth) {
  if (stringWidth(text) <= maxWidth)
    return text;
  if (maxWidth <= 0)
    return "";
  let width = 0;
  let result = "";
  for (const { segment } of getGraphemeSegmenter().segment(text)) {
    const segWidth = stringWidth(segment);
    if (width + segWidth > maxWidth)
      break;
    result += segment;
    width += segWidth;
  }
  return result;
}
function truncate(str, maxWidth, singleLine = false) {
  let result = str;
  if (singleLine) {
    const firstNewline = str.indexOf(`
`);
    if (firstNewline !== -1) {
      result = str.substring(0, firstNewline);
      if (stringWidth(result) + 1 > maxWidth) {
        return truncateToWidth(result, maxWidth);
      }
      return `${result}…`;
    }
  }
  if (stringWidth(result) <= maxWidth) {
    return result;
  }
  return truncateToWidth(result, maxWidth);
}
var init_truncate = __esm(() => {
  init_stringWidth();
  init_intl();
});

// src/utils/format.ts
function formatFileSize(sizeInBytes) {
  const kb = sizeInBytes / 1024;
  if (kb < 1) {
    return `${sizeInBytes} bytes`;
  }
  if (kb < 1024) {
    return `${kb.toFixed(1).replace(/\.0$/, "")}KB`;
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb.toFixed(1).replace(/\.0$/, "")}MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(1).replace(/\.0$/, "")}GB`;
}
function formatSecondsShort(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}
function formatDuration(ms, options) {
  if (ms < 60000) {
    if (ms === 0) {
      return "0s";
    }
    if (ms < 1) {
      const s2 = (ms / 1000).toFixed(1);
      return `${s2}s`;
    }
    const s = Math.floor(ms / 1000).toString();
    return `${s}s`;
  }
  let days = Math.floor(ms / 86400000);
  let hours = Math.floor(ms % 86400000 / 3600000);
  let minutes = Math.floor(ms % 3600000 / 60000);
  let seconds = Math.round(ms % 60000 / 1000);
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  if (minutes === 60) {
    minutes = 0;
    hours++;
  }
  if (hours === 24) {
    hours = 0;
    days++;
  }
  const hide = options?.hideTrailingZeros;
  if (options?.mostSignificantOnly) {
    if (days > 0)
      return `${days}d`;
    if (hours > 0)
      return `${hours}h`;
    if (minutes > 0)
      return `${minutes}m`;
    return `${seconds}s`;
  }
  if (days > 0) {
    if (hide && hours === 0 && minutes === 0)
      return `${days}d`;
    if (hide && minutes === 0)
      return `${days}d ${hours}h`;
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    if (hide && minutes === 0 && seconds === 0)
      return `${hours}h`;
    if (hide && seconds === 0)
      return `${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    if (hide && seconds === 0)
      return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
function formatNumber(number) {
  const shouldUseConsistentDecimals = number >= 1000;
  return getNumberFormatter(shouldUseConsistentDecimals).format(number).toLowerCase();
}
function formatTokens(count2) {
  return formatNumber(count2).replace(".0", "");
}
function formatRelativeTime(date, options = {}) {
  const { style = "narrow", numeric = "always", now = new Date } = options;
  const diffInMs = date.getTime() - now.getTime();
  const diffInSeconds = Math.trunc(diffInMs / 1000);
  const intervals = [
    { unit: "year", seconds: 31536000, shortUnit: "y" },
    { unit: "month", seconds: 2592000, shortUnit: "mo" },
    { unit: "week", seconds: 604800, shortUnit: "w" },
    { unit: "day", seconds: 86400, shortUnit: "d" },
    { unit: "hour", seconds: 3600, shortUnit: "h" },
    { unit: "minute", seconds: 60, shortUnit: "m" },
    { unit: "second", seconds: 1, shortUnit: "s" }
  ];
  for (const { unit, seconds: intervalSeconds, shortUnit } of intervals) {
    if (Math.abs(diffInSeconds) >= intervalSeconds) {
      const value = Math.trunc(diffInSeconds / intervalSeconds);
      if (style === "narrow") {
        return diffInSeconds < 0 ? `${Math.abs(value)}${shortUnit} ago` : `in ${value}${shortUnit}`;
      }
      return getRelativeTimeFormat("long", numeric).format(value, unit);
    }
  }
  if (style === "narrow") {
    return diffInSeconds <= 0 ? "0s ago" : "in 0s";
  }
  return getRelativeTimeFormat(style, numeric).format(0, "second");
}
function formatRelativeTimeAgo(date, options = {}) {
  const { now = new Date, ...restOptions } = options;
  if (date > now) {
    return formatRelativeTime(date, { ...restOptions, now });
  }
  return formatRelativeTime(date, { ...restOptions, numeric: "always", now });
}
function formatLogMetadata(log) {
  const sizeOrCount = log.fileSize !== undefined ? formatFileSize(log.fileSize) : `${log.messageCount} messages`;
  const parts = [
    formatRelativeTimeAgo(log.modified, { style: "short" }),
    ...log.gitBranch ? [log.gitBranch] : [],
    sizeOrCount
  ];
  if (log.tag) {
    parts.push(`#${log.tag}`);
  }
  if (log.agentSetting) {
    parts.push(`@${log.agentSetting}`);
  }
  if (log.prNumber) {
    parts.push(log.prRepository ? `${log.prRepository}#${log.prNumber}` : `#${log.prNumber}`);
  }
  return parts.join(" · ");
}
function formatResetTime(timestampInSeconds, showTimezone = false, showTime = true) {
  if (!timestampInSeconds)
    return;
  const date = new Date(timestampInSeconds * 1000);
  const now = new Date;
  const minutes = date.getMinutes();
  const hoursUntilReset = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilReset > 24) {
    const dateOptions = {
      month: "short",
      day: "numeric",
      hour: showTime ? "numeric" : undefined,
      minute: !showTime || minutes === 0 ? undefined : "2-digit",
      hour12: showTime ? true : undefined
    };
    if (date.getFullYear() !== now.getFullYear()) {
      dateOptions.year = "numeric";
    }
    const dateString = date.toLocaleString("en-US", dateOptions);
    return dateString.replace(/ ([AP]M)/i, (_match, ampm) => ampm.toLowerCase()) + (showTimezone ? ` (${getTimeZone()})` : "");
  }
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: minutes === 0 ? undefined : "2-digit",
    hour12: true
  });
  return timeString.replace(/ ([AP]M)/i, (_match, ampm) => ampm.toLowerCase()) + (showTimezone ? ` (${getTimeZone()})` : "");
}
function formatResetText(resetsAt, showTimezone = false, showTime = true) {
  const dt = new Date(resetsAt);
  return `${formatResetTime(Math.floor(dt.getTime() / 1000), showTimezone, showTime)}`;
}
var numberFormatterForConsistentDecimals = null, numberFormatterForInconsistentDecimals = null, getNumberFormatter = (useConsistentDecimals) => {
  if (useConsistentDecimals) {
    if (!numberFormatterForConsistentDecimals) {
      numberFormatterForConsistentDecimals = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
      });
    }
    return numberFormatterForConsistentDecimals;
  } else {
    if (!numberFormatterForInconsistentDecimals) {
      numberFormatterForInconsistentDecimals = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
        minimumFractionDigits: 0
      });
    }
    return numberFormatterForInconsistentDecimals;
  }
};
var init_format = __esm(() => {
  init_intl();
  init_truncate();
});

// src/utils/profilerBase.ts
function getPerformance() {
  if (!performance) {
    performance = __require("perf_hooks").performance;
  }
  return performance;
}
function formatMs(ms) {
  return ms.toFixed(3);
}
function formatTimelineLine(totalMs, deltaMs, name, memory, totalPad, deltaPad, extra = "") {
  const memInfo = memory ? ` | RSS: ${formatFileSize(memory.rss)}, Heap: ${formatFileSize(memory.heapUsed)}` : "";
  return `[+${formatMs(totalMs).padStart(totalPad)}ms] (+${formatMs(deltaMs).padStart(deltaPad)}ms) ${name}${extra}${memInfo}`;
}
var performance = null;
var init_profilerBase = __esm(() => {
  init_format();
});

// src/utils/startupProfiler.ts
import { dirname as dirname4, join as join11 } from "path";
function profileCheckpoint(name) {
  if (!SHOULD_PROFILE)
    return;
  const perf = getPerformance();
  perf.mark(name);
  if (DETAILED_PROFILING) {
    memorySnapshots.push(process.memoryUsage());
  }
}
function getReport() {
  if (!DETAILED_PROFILING) {
    return "Startup profiling not enabled";
  }
  const perf = getPerformance();
  const marks = perf.getEntriesByType("mark");
  if (marks.length === 0) {
    return "No profiling checkpoints recorded";
  }
  const lines = [];
  lines.push("=".repeat(80));
  lines.push("STARTUP PROFILING REPORT");
  lines.push("=".repeat(80));
  lines.push("");
  let prevTime = 0;
  for (const [i, mark] of marks.entries()) {
    lines.push(formatTimelineLine(mark.startTime, mark.startTime - prevTime, mark.name, memorySnapshots[i], 8, 7));
    prevTime = mark.startTime;
  }
  const lastMark = marks[marks.length - 1];
  lines.push("");
  lines.push(`Total startup time: ${formatMs(lastMark?.startTime ?? 0)}ms`);
  lines.push("=".repeat(80));
  return lines.join(`
`);
}
function profileReport() {
  if (reported)
    return;
  reported = true;
  logStartupPerf();
  if (DETAILED_PROFILING) {
    const path2 = getStartupPerfLogPath();
    const dir = dirname4(path2);
    const fs = getFsImplementation();
    fs.mkdirSync(dir);
    writeFileSync_DEPRECATED(path2, getReport(), {
      encoding: "utf8",
      flush: true
    });
    logForDebugging("Startup profiling report:");
    logForDebugging(getReport());
  }
}
function getStartupPerfLogPath() {
  return join11(getURConfigHomeDir(), "startup-perf", `${getSessionId()}.txt`);
}
function logStartupPerf() {
  if (!STATSIG_LOGGING_SAMPLED)
    return;
  const perf = getPerformance();
  const marks = perf.getEntriesByType("mark");
  if (marks.length === 0)
    return;
  const checkpointTimes = new Map;
  for (const mark of marks) {
    checkpointTimes.set(mark.name, mark.startTime);
  }
  const metadata = {};
  for (const [phaseName, [startCheckpoint, endCheckpoint]] of Object.entries(PHASE_DEFINITIONS)) {
    const startTime = checkpointTimes.get(startCheckpoint);
    const endTime = checkpointTimes.get(endCheckpoint);
    if (startTime !== undefined && endTime !== undefined) {
      metadata[`${phaseName}_ms`] = Math.round(endTime - startTime);
    }
  }
  metadata.checkpoint_count = marks.length;
  logEvent("tengu_startup_perf", metadata);
}
var DETAILED_PROFILING, STATSIG_SAMPLE_RATE = 0.005, STATSIG_LOGGING_SAMPLED, SHOULD_PROFILE, memorySnapshots, PHASE_DEFINITIONS, reported = false;
var init_startupProfiler = __esm(() => {
  init_state();
  init_analytics();
  init_debug();
  init_envUtils();
  init_fsOperations();
  init_profilerBase();
  init_slowOperations();
  DETAILED_PROFILING = isEnvTruthy(process.env.UR_CODE_PROFILE_STARTUP);
  STATSIG_LOGGING_SAMPLED = process.env.USER_TYPE === "ant" || Math.random() < STATSIG_SAMPLE_RATE;
  SHOULD_PROFILE = DETAILED_PROFILING || STATSIG_LOGGING_SAMPLED;
  memorySnapshots = [];
  PHASE_DEFINITIONS = {
    import_time: ["cli_entry", "main_tsx_imports_loaded"],
    init_time: ["init_function_start", "init_function_end"],
    settings_time: ["eagerLoadSettings_start", "eagerLoadSettings_end"],
    total_time: ["cli_entry", "main_after_run"]
  };
  if (SHOULD_PROFILE) {
    profileCheckpoint("profiler_initialized");
  }
});

// src/types/generated/google/protobuf/timestamp.ts
var init_timestamp = () => {};

// src/types/generated/events_mono/common/v1/auth.ts
var init_auth2 = () => {};

// src/types/generated/events_mono/ur/v1/ur_internal_event.ts
var init_ur_internal_event = __esm(() => {
  init_timestamp();
  init_auth2();
});

// src/types/generated/events_mono/growthbook/v1/growthbook_experiment_event.ts
var init_growthbook_experiment_event = __esm(() => {
  init_timestamp();
  init_auth2();
});

// src/utils/genericProcessUtils.ts
async function getAncestorPidsAsync(pid, maxDepth = 10) {
  if (process.platform === "win32") {
    const script2 = `
      $pid = ${String(pid)}
      $ancestors = @()
      for ($i = 0; $i -lt ${maxDepth}; $i++) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
        if (-not $proc -or -not $proc.ParentProcessId -or $proc.ParentProcessId -eq 0) { break }
        $pid = $proc.ParentProcessId
        $ancestors += $pid
      }
      $ancestors -join ','
    `.trim();
    const result2 = await execFileNoThrowWithCwd("powershell.exe", ["-NoProfile", "-Command", script2], { timeout: 3000 });
    if (result2.code !== 0 || !result2.stdout?.trim()) {
      return [];
    }
    return result2.stdout.trim().split(",").filter(Boolean).map((p) => parseInt(p, 10)).filter((p) => !isNaN(p));
  }
  const script = `pid=${String(pid)}; for i in $(seq 1 ${maxDepth}); do ppid=$(ps -o ppid= -p $pid 2>/dev/null | tr -d ' '); if [ -z "$ppid" ] || [ "$ppid" = "0" ] || [ "$ppid" = "1" ]; then break; fi; echo $ppid; pid=$ppid; done`;
  const result = await execFileNoThrowWithCwd("sh", ["-c", script], {
    timeout: 3000
  });
  if (result.code !== 0 || !result.stdout?.trim()) {
    return [];
  }
  return result.stdout.trim().split(`
`).filter(Boolean).map((p) => parseInt(p, 10)).filter((p) => !isNaN(p));
}
function getProcessCommand(pid) {
  try {
    const pidStr = String(pid);
    const command = process.platform === "win32" ? `powershell.exe -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"ProcessId=${pidStr}\\").CommandLine"` : `ps -o command= -p ${pidStr}`;
    const result = execSyncWithDefaults_DEPRECATED(command, { timeout: 1000 });
    return result ? result.trim() : null;
  } catch {
    return null;
  }
}
async function getAncestorCommandsAsync(pid, maxDepth = 10) {
  if (process.platform === "win32") {
    const script2 = `
      $currentPid = ${String(pid)}
      $commands = @()
      for ($i = 0; $i -lt ${maxDepth}; $i++) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$currentPid" -ErrorAction SilentlyContinue
        if (-not $proc) { break }
        if ($proc.CommandLine) { $commands += $proc.CommandLine }
        if (-not $proc.ParentProcessId -or $proc.ParentProcessId -eq 0) { break }
        $currentPid = $proc.ParentProcessId
      }
      $commands -join [char]0
    `.trim();
    const result2 = await execFileNoThrowWithCwd("powershell.exe", ["-NoProfile", "-Command", script2], { timeout: 3000 });
    if (result2.code !== 0 || !result2.stdout?.trim()) {
      return [];
    }
    return result2.stdout.split("\x00").filter(Boolean);
  }
  const script = `currentpid=${String(pid)}; for i in $(seq 1 ${maxDepth}); do cmd=$(ps -o command= -p $currentpid 2>/dev/null); if [ -n "$cmd" ]; then printf '%s\\0' "$cmd"; fi; ppid=$(ps -o ppid= -p $currentpid 2>/dev/null | tr -d ' '); if [ -z "$ppid" ] || [ "$ppid" = "0" ] || [ "$ppid" = "1" ]; then break; fi; currentpid=$ppid; done`;
  const result = await execFileNoThrowWithCwd("sh", ["-c", script], {
    timeout: 3000
  });
  if (result.code !== 0 || !result.stdout?.trim()) {
    return [];
  }
  return result.stdout.split("\x00").filter(Boolean);
}
var init_genericProcessUtils = __esm(() => {
  init_execFileNoThrow();
});

// src/utils/envDynamic.ts
import { stat as stat3 } from "fs/promises";
function getIsBubblewrapSandbox() {
  return process.platform === "linux" && isEnvTruthy(process.env.UR_CODE_BUBBLEWRAP);
}
function isMuslEnvironment() {
  if (false)
    ;
  if (false)
    ;
  if (process.platform !== "linux")
    return false;
  return muslRuntimeCache ?? false;
}
async function detectJetBrainsIDEFromParentProcessAsync() {
  if (jetBrainsIDECache !== undefined) {
    return jetBrainsIDECache;
  }
  if (process.platform === "darwin") {
    jetBrainsIDECache = null;
    return null;
  }
  try {
    const commands = await getAncestorCommandsAsync(process.pid, 10);
    for (const command of commands) {
      const lowerCommand = command.toLowerCase();
      for (const ide of JETBRAINS_IDES) {
        if (lowerCommand.includes(ide)) {
          jetBrainsIDECache = ide;
          return ide;
        }
      }
    }
  } catch {}
  jetBrainsIDECache = null;
  return null;
}
async function getTerminalWithJetBrainsDetectionAsync() {
  if (process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm") {
    if (env.platform !== "darwin") {
      const specificIDE = await detectJetBrainsIDEFromParentProcessAsync();
      return specificIDE || "pycharm";
    }
  }
  return env.terminal;
}
function getTerminalWithJetBrainsDetection() {
  if (process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm") {
    if (env.platform !== "darwin") {
      if (jetBrainsIDECache !== undefined) {
        return jetBrainsIDECache || "pycharm";
      }
      return "pycharm";
    }
  }
  return env.terminal;
}
async function initJetBrainsDetection() {
  if (process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm") {
    await detectJetBrainsIDEFromParentProcessAsync();
  }
}
var getIsDocker, muslRuntimeCache = null, jetBrainsIDECache, envDynamic;
var init_envDynamic = __esm(() => {
  init_memoize();
  init_env();
  init_envUtils();
  init_execFileNoThrow();
  init_genericProcessUtils();
  getIsDocker = memoize_default(async () => {
    if (process.platform !== "linux")
      return false;
    const { code } = await execFileNoThrow("test", ["-f", "/.dockerenv"]);
    return code === 0;
  });
  if (process.platform === "linux") {
    const muslArch = process.arch === "x64" ? "x86_64" : "aarch64";
    stat3(`/lib/libc.musl-${muslArch}.so.1`).then(() => {
      muslRuntimeCache = true;
    }, () => {
      muslRuntimeCache = false;
    });
  }
  envDynamic = {
    ...env,
    terminal: getTerminalWithJetBrainsDetection(),
    getIsDocker,
    getIsBubblewrapSandbox,
    isMuslEnvironment,
    getTerminalWithJetBrainsDetectionAsync,
    initJetBrainsDetection
  };
});

// src/services/mcp/officialRegistry.ts
function isOfficialMcpUrl(normalizedUrl) {
  return officialUrls?.has(normalizedUrl) ?? false;
}
var officialUrls = undefined;
var init_officialRegistry = () => {};

// src/utils/agentSwarmsEnabled.ts
function isAgentTeamsFlagSet() {
  return process.argv.includes("--agent-teams");
}
function isAgentSwarmsEnabled() {
  if (process.env.USER_TYPE === "ant") {
    return true;
  }
  if (!isEnvTruthy(process.env.UR_CODE_EXPERIMENTAL_AGENT_TEAMS) && !isAgentTeamsFlagSet()) {
    return false;
  }
  if (!getFeatureValue_CACHED_MAY_BE_STALE("tengu_amber_flint", true)) {
    return false;
  }
  return true;
}
var init_agentSwarmsEnabled = __esm(() => {
  init_growthbook();
  init_envUtils();
});

// src/utils/agentContext.ts
import { AsyncLocalStorage as AsyncLocalStorage2 } from "async_hooks";
function getAgentContext() {
  return agentContextStorage.getStore();
}
function runWithAgentContext(context, fn) {
  return agentContextStorage.run(context, fn);
}
function consumeInvokingRequestId() {
  const context = getAgentContext();
  if (!context?.invokingRequestId || context.invocationEmitted) {
    return;
  }
  context.invocationEmitted = true;
  return {
    invokingRequestId: context.invokingRequestId,
    invocationKind: context.invocationKind
  };
}
var agentContextStorage;
var init_agentContext = __esm(() => {
  init_agentSwarmsEnabled();
  agentContextStorage = new AsyncLocalStorage2;
});

// src/services/analytics/metadata.ts
import { extname } from "path";
function sanitizeToolNameForAnalytics(toolName) {
  if (toolName.startsWith("mcp__")) {
    return "mcp_tool";
  }
  return toolName;
}
function isToolDetailsLoggingEnabled() {
  return isEnvTruthy(process.env.OTEL_LOG_TOOL_DETAILS);
}
function isAnalyticsToolDetailsLoggingEnabled(mcpServerType, mcpServerBaseUrl) {
  if (process.env.UR_CODE_ENTRYPOINT === "local-agent") {
    return true;
  }
  if (mcpServerType === "urai-proxy") {
    return true;
  }
  if (mcpServerBaseUrl && isOfficialMcpUrl(mcpServerBaseUrl)) {
    return true;
  }
  return false;
}
function mcpToolDetailsForAnalytics(toolName, mcpServerType, mcpServerBaseUrl) {
  const details = extractMcpToolDetails(toolName);
  if (!details) {
    return {};
  }
  if (!BUILTIN_MCP_SERVER_NAMES.has(details.serverName) && !isAnalyticsToolDetailsLoggingEnabled(mcpServerType, mcpServerBaseUrl)) {
    return {};
  }
  return {
    mcpServerName: details.serverName,
    mcpToolName: details.mcpToolName
  };
}
function extractMcpToolDetails(toolName) {
  if (!toolName.startsWith("mcp__")) {
    return;
  }
  const parts = toolName.split("__");
  if (parts.length < 3) {
    return;
  }
  const serverName = parts[1];
  const mcpToolName = parts.slice(2).join("__");
  if (!serverName || !mcpToolName) {
    return;
  }
  return {
    serverName,
    mcpToolName
  };
}
function extractSkillName(toolName, input) {
  if (toolName !== "Skill") {
    return;
  }
  if (typeof input === "object" && input !== null && "skill" in input && typeof input.skill === "string") {
    return input.skill;
  }
  return;
}
function truncateToolInputValue(value, depth = 0) {
  if (typeof value === "string") {
    if (value.length > TOOL_INPUT_STRING_TRUNCATE_AT) {
      return `${value.slice(0, TOOL_INPUT_STRING_TRUNCATE_TO)}…[${value.length} chars]`;
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null || value === undefined) {
    return value;
  }
  if (depth >= TOOL_INPUT_MAX_DEPTH) {
    return "<nested>";
  }
  if (Array.isArray(value)) {
    const mapped = value.slice(0, TOOL_INPUT_MAX_COLLECTION_ITEMS).map((v) => truncateToolInputValue(v, depth + 1));
    if (value.length > TOOL_INPUT_MAX_COLLECTION_ITEMS) {
      mapped.push(`…[${value.length} items]`);
    }
    return mapped;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([k]) => !k.startsWith("_"));
    const mapped = entries.slice(0, TOOL_INPUT_MAX_COLLECTION_ITEMS).map(([k, v]) => [k, truncateToolInputValue(v, depth + 1)]);
    if (entries.length > TOOL_INPUT_MAX_COLLECTION_ITEMS) {
      mapped.push(["…", `${entries.length} keys`]);
    }
    return Object.fromEntries(mapped);
  }
  return String(value);
}
function extractToolInputForTelemetry(input) {
  if (!isToolDetailsLoggingEnabled()) {
    return;
  }
  const truncated = truncateToolInputValue(input);
  let json = jsonStringify(truncated);
  if (json.length > TOOL_INPUT_MAX_JSON_CHARS) {
    json = json.slice(0, TOOL_INPUT_MAX_JSON_CHARS) + "…[truncated]";
  }
  return json;
}
function getFileExtensionForAnalytics(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!ext || ext === ".") {
    return;
  }
  const extension = ext.slice(1);
  if (extension.length > MAX_FILE_EXTENSION_LENGTH) {
    return "other";
  }
  return extension;
}
function getFileExtensionsFromBashCommand(command, simulatedSedEditFilePath) {
  if (!command.includes(".") && !simulatedSedEditFilePath)
    return;
  let result;
  const seen = new Set;
  if (simulatedSedEditFilePath) {
    const ext = getFileExtensionForAnalytics(simulatedSedEditFilePath);
    if (ext) {
      seen.add(ext);
      result = ext;
    }
  }
  for (const subcmd of command.split(COMPOUND_OPERATOR_REGEX)) {
    if (!subcmd)
      continue;
    const tokens = subcmd.split(WHITESPACE_REGEX);
    if (tokens.length < 2)
      continue;
    const firstToken = tokens[0];
    const slashIdx = firstToken.lastIndexOf("/");
    const baseCmd = slashIdx >= 0 ? firstToken.slice(slashIdx + 1) : firstToken;
    if (!FILE_COMMANDS.has(baseCmd))
      continue;
    for (let i = 1;i < tokens.length; i++) {
      const arg = tokens[i];
      if (arg.charCodeAt(0) === 45)
        continue;
      const ext = getFileExtensionForAnalytics(arg);
      if (ext && !seen.has(ext)) {
        seen.add(ext);
        result = result ? result + "," + ext : ext;
      }
    }
  }
  if (!result)
    return;
  return result;
}
function getAgentIdentification() {
  const agentContext = getAgentContext();
  if (agentContext) {
    const result = {
      agentId: agentContext.agentId,
      parentSessionId: agentContext.parentSessionId,
      agentType: agentContext.agentType
    };
    if (agentContext.agentType === "teammate") {
      result.teamName = agentContext.teamName;
    }
    return result;
  }
  const agentId = getAgentId();
  const parentSessionId = getParentSessionId2();
  const teamName = getTeamName();
  const isSwarmAgent = isTeammate();
  const agentType = isSwarmAgent ? "teammate" : agentId ? "standalone" : undefined;
  if (agentId || agentType || parentSessionId || teamName) {
    return {
      ...agentId ? { agentId } : {},
      ...agentType ? { agentType } : {},
      ...parentSessionId ? { parentSessionId } : {},
      ...teamName ? { teamName } : {}
    };
  }
  const stateParentSessionId = getParentSessionId();
  if (stateParentSessionId) {
    return { parentSessionId: stateParentSessionId };
  }
  return {};
}
function buildProcessMetrics() {
  try {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const now = Date.now();
    let cpuPercent;
    if (prevCpuUsage && prevWallTimeMs) {
      const wallDeltaMs = now - prevWallTimeMs;
      if (wallDeltaMs > 0) {
        const userDeltaUs = cpu.user - prevCpuUsage.user;
        const systemDeltaUs = cpu.system - prevCpuUsage.system;
        cpuPercent = (userDeltaUs + systemDeltaUs) / (wallDeltaMs * 1000) * 100;
      }
    }
    prevCpuUsage = cpu;
    prevWallTimeMs = now;
    return {
      uptime: process.uptime(),
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
      constrainedMemory: process.constrainedMemory(),
      cpuUsage: cpu,
      cpuPercent
    };
  } catch {
    return;
  }
}
async function getEventMetadata(options = {}) {
  const model = options.model ? String(options.model) : getMainLoopModel();
  const betas = typeof options.betas === "string" ? options.betas : getModelBetas(model).join(",");
  const [envContext, repoRemoteHash] = await Promise.all([
    buildEnvContext(),
    getRepoRemoteHash()
  ]);
  const processMetrics = buildProcessMetrics();
  const metadata = {
    model,
    sessionId: getSessionId(),
    userType: process.env.USER_TYPE || "",
    ...betas.length > 0 ? { betas } : {},
    envContext,
    ...process.env.UR_CODE_ENTRYPOINT && {
      entrypoint: process.env.UR_CODE_ENTRYPOINT
    },
    ...process.env.UR_AGENT_SDK_VERSION && {
      agentSdkVersion: process.env.UR_AGENT_SDK_VERSION
    },
    isInteractive: String(getIsInteractive()),
    clientType: getClientType(),
    ...processMetrics && { processMetrics },
    sweBenchRunId: process.env.SWE_BENCH_RUN_ID || "",
    sweBenchInstanceId: process.env.SWE_BENCH_INSTANCE_ID || "",
    sweBenchTaskId: process.env.SWE_BENCH_TASK_ID || "",
    ...getAgentIdentification(),
    ...getSubscriptionType() && {
      subscriptionType: getSubscriptionType()
    },
    ...{},
    ...repoRemoteHash && { rh: repoRemoteHash }
  };
  return metadata;
}
var BUILTIN_MCP_SERVER_NAMES, TOOL_INPUT_STRING_TRUNCATE_AT = 512, TOOL_INPUT_STRING_TRUNCATE_TO = 128, TOOL_INPUT_MAX_JSON_CHARS, TOOL_INPUT_MAX_COLLECTION_ITEMS = 20, TOOL_INPUT_MAX_DEPTH = 2, MAX_FILE_EXTENSION_LENGTH = 10, FILE_COMMANDS, COMPOUND_OPERATOR_REGEX, WHITESPACE_REGEX, getVersionBase, buildEnvContext, prevCpuUsage = null, prevWallTimeMs = null;
var init_metadata = __esm(() => {
  init_memoize();
  init_env();
  init_envDynamic();
  init_betas2();
  init_model();
  init_state();
  init_envUtils();
  init_officialRegistry();
  init_auth();
  init_git();
  init_platform();
  init_agentContext();
  init_slowOperations();
  init_teammate();
  BUILTIN_MCP_SERVER_NAMES = new Set([]);
  TOOL_INPUT_MAX_JSON_CHARS = 4 * 1024;
  FILE_COMMANDS = new Set([
    "rm",
    "mv",
    "cp",
    "touch",
    "mkdir",
    "chmod",
    "chown",
    "cat",
    "head",
    "tail",
    "sort",
    "stat",
    "diff",
    "wc",
    "grep",
    "rg",
    "sed"
  ]);
  COMPOUND_OPERATOR_REGEX = /\s*(?:&&|\|\||[;|])\s*/;
  WHITESPACE_REGEX = /\s+/;
  getVersionBase = memoize_default(() => {
    const match = "1.0.2".match(/^\d+\.\d+\.\d+(?:-[a-z]+)?/);
    return match ? match[0] : undefined;
  });
  buildEnvContext = memoize_default(async () => {
    const [packageManagers, runtimes, linuxDistroInfo, vcs] = await Promise.all([
      env.getPackageManagers(),
      env.getRuntimes(),
      getLinuxDistroInfo(),
      detectVcs()
    ]);
    return {
      platform: getHostPlatformForAnalytics(),
      platformRaw: process.env.UR_CODE_HOST_PLATFORM || process.platform,
      arch: env.arch,
      nodeVersion: env.nodeVersion,
      terminal: envDynamic.terminal,
      packageManagers: packageManagers.join(","),
      runtimes: runtimes.join(","),
      isRunningWithBun: env.isRunningWithBun(),
      isCi: isEnvTruthy(process.env.CI),
      isClaubbit: isEnvTruthy(process.env.CLAUBBIT),
      isURCodeRemote: isEnvTruthy(process.env.UR_CODE_REMOTE),
      isLocalAgentMode: process.env.UR_CODE_ENTRYPOINT === "local-agent",
      isConductor: env.isConductor(),
      ...process.env.UR_CODE_REMOTE_ENVIRONMENT_TYPE && {
        remoteEnvironmentType: process.env.UR_CODE_REMOTE_ENVIRONMENT_TYPE
      },
      ...{},
      ...process.env.UR_CODE_CONTAINER_ID && {
        urCodeContainerId: process.env.UR_CODE_CONTAINER_ID
      },
      ...process.env.UR_CODE_REMOTE_SESSION_ID && {
        urCodeRemoteSessionId: process.env.UR_CODE_REMOTE_SESSION_ID
      },
      ...process.env.UR_CODE_TAGS && {
        tags: process.env.UR_CODE_TAGS
      },
      isGithubAction: isEnvTruthy(process.env.GITHUB_ACTIONS),
      isURCodeAction: isEnvTruthy(process.env.UR_CODE_ACTION),
      isURAiAuth: isURAISubscriber(),
      version: "1.0.2",
      versionBase: getVersionBase(),
      buildTime: "",
      deploymentEnvironment: env.detectDeploymentEnvironment(),
      ...isEnvTruthy(process.env.GITHUB_ACTIONS) && {
        githubEventName: process.env.GITHUB_EVENT_NAME,
        githubActionsRunnerEnvironment: process.env.RUNNER_ENVIRONMENT,
        githubActionsRunnerOs: process.env.RUNNER_OS,
        githubActionRef: process.env.GITHUB_ACTION_PATH?.includes("ur-action/") ? process.env.GITHUB_ACTION_PATH.split("ur-action/")[1] : undefined
      },
      ...getWslVersion() && { wslVersion: getWslVersion() },
      ...linuxDistroInfo ?? {},
      ...vcs.length > 0 ? { vcs: vcs.join(",") } : {}
    };
  });
});

// src/services/analytics/firstPartyEventLoggingExporter.ts
import { randomUUID } from "crypto";
var BATCH_UUID;
var init_firstPartyEventLoggingExporter = __esm(() => {
  init_state();
  init_ur_internal_event();
  init_growthbook_experiment_event();
  init_auth();
  init_config();
  init_debug();
  init_envUtils();
  init_errors();
  init_http();
  init_json();
  init_log();
  init_sleep();
  init_slowOperations();
  init_userAgent();
  init_client();
  init_analytics();
  init_metadata();
  BATCH_UUID = randomUUID();
});

// src/services/analytics/sinkKillswitch.ts
function isSinkKilled(sink) {
  const config = getDynamicConfig_CACHED_MAY_BE_STALE(SINK_KILLSWITCH_CONFIG_NAME, {});
  return config?.[sink] === true;
}
var SINK_KILLSWITCH_CONFIG_NAME = "tengu_frond_boric";
var init_sinkKillswitch = __esm(() => {
  init_growthbook();
});

// src/services/analytics/firstPartyEventLogger.ts
import { randomUUID as randomUUID2 } from "crypto";
function getEventSamplingConfig() {
  return getDynamicConfig_CACHED_MAY_BE_STALE(EVENT_SAMPLING_CONFIG_NAME, {});
}
function shouldSampleEvent(eventName) {
  const config = getEventSamplingConfig();
  const eventConfig = config[eventName];
  if (!eventConfig) {
    return null;
  }
  const sampleRate = eventConfig.sample_rate;
  if (typeof sampleRate !== "number" || sampleRate < 0 || sampleRate > 1) {
    return null;
  }
  if (sampleRate >= 1) {
    return null;
  }
  if (sampleRate <= 0) {
    return 0;
  }
  return Math.random() < sampleRate ? sampleRate : 0;
}
async function shutdown1PEventLogging() {
  if (!firstPartyEventLoggerProvider) {
    return;
  }
  try {
    await firstPartyEventLoggerProvider.shutdown();
    if (process.env.USER_TYPE === "ant") {
      logForDebugging("1P event logging: final shutdown complete");
    }
  } catch {}
}
function is1PEventLoggingEnabled() {
  return false;
}
async function logEventTo1PAsync(firstPartyEventLogger2, eventName, metadata = {}) {
  try {
    const coreMetadata = await getEventMetadata({
      model: metadata.model,
      betas: metadata.betas
    });
    const attributes = {
      event_name: eventName,
      event_id: randomUUID2(),
      core_metadata: coreMetadata,
      user_metadata: getCoreUserData(true),
      event_metadata: metadata
    };
    const userId = getOrCreateUserID();
    if (userId) {
      attributes.user_id = userId;
    }
    if (process.env.USER_TYPE === "ant") {
      logForDebugging(`[ANT-ONLY] 1P event: ${eventName} ${jsonStringify(metadata, null, 0)}`);
    }
    firstPartyEventLogger2.emit({
      body: eventName,
      attributes
    });
  } catch (e) {
    if (true) {
      throw e;
    }
    if (process.env.USER_TYPE === "ant") {
      logError(e);
    }
  }
}
function logEventTo1P(eventName, metadata = {}) {
  if (!is1PEventLoggingEnabled()) {
    return;
  }
  if (!firstPartyEventLogger || isSinkKilled("firstParty")) {
    return;
  }
  logEventTo1PAsync(firstPartyEventLogger, eventName, metadata);
}
function getEnvironmentForGrowthBook() {
  return "production";
}
function logGrowthBookExperimentTo1P(data) {
  if (!is1PEventLoggingEnabled()) {
    return;
  }
  if (!firstPartyEventLogger || isSinkKilled("firstParty")) {
    return;
  }
  const userId = getOrCreateUserID();
  const { accountUuid, organizationUuid } = getCoreUserData(true);
  const attributes = {
    event_type: "GrowthbookExperimentEvent",
    event_id: randomUUID2(),
    experiment_id: data.experimentId,
    variation_id: data.variationId,
    ...userId && { device_id: userId },
    ...accountUuid && { account_uuid: accountUuid },
    ...organizationUuid && { organization_uuid: organizationUuid },
    ...data.userAttributes && {
      session_id: data.userAttributes.sessionId,
      user_attributes: jsonStringify(data.userAttributes)
    },
    ...data.experimentMetadata && {
      experiment_metadata: jsonStringify(data.experimentMetadata)
    },
    environment: getEnvironmentForGrowthBook()
  };
  if (process.env.USER_TYPE === "ant") {
    logForDebugging(`[ANT-ONLY] 1P GrowthBook experiment: ${data.experimentId} variation=${data.variationId}`);
  }
  firstPartyEventLogger.emit({
    body: "growthbook_experiment",
    attributes
  });
}
var EVENT_SAMPLING_CONFIG_NAME = "tengu_event_sampling_config", firstPartyEventLogger = null, firstPartyEventLoggerProvider = null;
var init_firstPartyEventLogger = __esm(() => {
  init_config();
  init_debug();
  init_log();
  init_platform();
  init_slowOperations();
  init_startupProfiler();
  init_user();
  init_firstPartyEventLoggingExporter();
  init_growthbook();
  init_metadata();
  init_sinkKillswitch();
});

// src/services/analytics/growthbook.ts
function callSafe(listener) {
  try {
    Promise.resolve(listener()).catch((e) => {
      logError(e);
    });
  } catch (e) {
    logError(e);
  }
}
function onGrowthBookRefresh(listener) {
  let subscribed = true;
  const unsubscribe2 = refreshed.subscribe(() => callSafe(listener));
  if (remoteEvalFeatureValues.size > 0) {
    queueMicrotask(() => {
      if (subscribed && remoteEvalFeatureValues.size > 0) {
        callSafe(listener);
      }
    });
  }
  return () => {
    subscribed = false;
    unsubscribe2();
  };
}
function getEnvOverrides() {
  if (!envOverridesParsed) {
    envOverridesParsed = true;
    if (process.env.USER_TYPE === "ant") {
      const raw = process.env.UR_INTERNAL_FC_OVERRIDES;
      if (raw) {
        try {
          envOverrides = JSON.parse(raw);
          logForDebugging(`GrowthBook: Using env var overrides for ${Object.keys(envOverrides).length} features: ${Object.keys(envOverrides).join(", ")}`);
        } catch {
          logError(new Error(`GrowthBook: Failed to parse UR_INTERNAL_FC_OVERRIDES: ${raw}`));
        }
      }
    }
  }
  return envOverrides;
}
function getConfigOverrides() {
  if (process.env.USER_TYPE !== "ant")
    return;
  try {
    return getGlobalConfig().growthBookOverrides;
  } catch {
    return;
  }
}
function logExposureForFeature(feature) {
  if (loggedExposures.has(feature)) {
    return;
  }
  const expData = experimentDataByFeature.get(feature);
  if (expData) {
    loggedExposures.add(feature);
    logGrowthBookExperimentTo1P({
      experimentId: expData.experimentId,
      variationId: expData.variationId,
      userAttributes: getUserAttributes(),
      experimentMetadata: {
        feature_id: feature
      }
    });
  }
}
async function processRemoteEvalPayload(gbClient) {
  const payload = gbClient.getPayload();
  if (!payload?.features || Object.keys(payload.features).length === 0) {
    return false;
  }
  experimentDataByFeature.clear();
  const transformedFeatures = {};
  for (const [key, feature] of Object.entries(payload.features)) {
    const f = feature;
    if ("value" in f && !("defaultValue" in f)) {
      transformedFeatures[key] = {
        ...f,
        defaultValue: f.value
      };
    } else {
      transformedFeatures[key] = f;
    }
    if (f.source === "experiment" && f.experimentResult) {
      const expResult = f.experimentResult;
      const exp = f.experiment;
      if (exp?.key && expResult.variationId !== undefined) {
        experimentDataByFeature.set(key, {
          experimentId: exp.key,
          variationId: expResult.variationId
        });
      }
    }
  }
  await gbClient.setPayload({
    ...payload,
    features: transformedFeatures
  });
  remoteEvalFeatureValues.clear();
  for (const [key, feature] of Object.entries(transformedFeatures)) {
    const v = "value" in feature ? feature.value : feature.defaultValue;
    if (v !== undefined) {
      remoteEvalFeatureValues.set(key, v);
    }
  }
  return true;
}
function syncRemoteEvalToDisk() {
  const fresh = Object.fromEntries(remoteEvalFeatureValues);
  const config = getGlobalConfig();
  if (isEqual_default(config.cachedGrowthBookFeatures, fresh)) {
    return;
  }
  saveGlobalConfig((current) => ({
    ...current,
    cachedGrowthBookFeatures: fresh
  }));
}
function isGrowthBookEnabled() {
  return is1PEventLoggingEnabled();
}
function getApiBaseUrlHost() {
  return;
}
function getUserAttributes() {
  const user = getUserForGrowthBook();
  let email = user.email;
  if (!email && process.env.USER_TYPE === "ant") {
    email = getGlobalConfig().oauthAccount?.emailAddress;
  }
  const apiBaseUrlHost = getApiBaseUrlHost();
  const attributes = {
    id: user.deviceId,
    sessionId: user.sessionId,
    deviceID: user.deviceId,
    platform: user.platform,
    ...apiBaseUrlHost && { apiBaseUrlHost },
    ...user.organizationUuid && { organizationUUID: user.organizationUuid },
    ...user.accountUuid && { accountUUID: user.accountUuid },
    ...user.userType && { userType: user.userType },
    ...user.subscriptionType && { subscriptionType: user.subscriptionType },
    ...user.rateLimitTier && { rateLimitTier: user.rateLimitTier },
    ...user.firstTokenTime && { firstTokenTime: user.firstTokenTime },
    ...email && { email },
    ...user.appVersion && { appVersion: user.appVersion },
    ...user.githubActionsMetadata && {
      githubActionsMetadata: user.githubActionsMetadata
    }
  };
  return attributes;
}
async function getFeatureValueInternal(feature, defaultValue, logExposure) {
  const overrides = getEnvOverrides();
  if (overrides && feature in overrides) {
    return overrides[feature];
  }
  const configOverrides = getConfigOverrides();
  if (configOverrides && feature in configOverrides) {
    return configOverrides[feature];
  }
  if (!isGrowthBookEnabled()) {
    return defaultValue;
  }
  const growthBookClient = await initializeGrowthBook();
  if (!growthBookClient) {
    return defaultValue;
  }
  let result;
  if (remoteEvalFeatureValues.has(feature)) {
    result = remoteEvalFeatureValues.get(feature);
  } else {
    result = growthBookClient.getFeatureValue(feature, defaultValue);
  }
  if (logExposure) {
    logExposureForFeature(feature);
  }
  if (process.env.USER_TYPE === "ant") {
    logForDebugging(`GrowthBook: getFeatureValue("${feature}") = ${jsonStringify(result)}`);
  }
  return result;
}
async function getFeatureValue_DEPRECATED(feature, defaultValue) {
  return getFeatureValueInternal(feature, defaultValue, true);
}
function getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue) {
  const overrides = getEnvOverrides();
  if (overrides && feature in overrides) {
    return overrides[feature];
  }
  const configOverrides = getConfigOverrides();
  if (configOverrides && feature in configOverrides) {
    return configOverrides[feature];
  }
  if (!isGrowthBookEnabled()) {
    return defaultValue;
  }
  if (experimentDataByFeature.has(feature)) {
    logExposureForFeature(feature);
  } else {
    pendingExposures.add(feature);
  }
  if (remoteEvalFeatureValues.has(feature)) {
    return remoteEvalFeatureValues.get(feature);
  }
  try {
    const cached = getGlobalConfig().cachedGrowthBookFeatures?.[feature];
    return cached !== undefined ? cached : defaultValue;
  } catch {
    return defaultValue;
  }
}
function checkStatsigFeatureGate_CACHED_MAY_BE_STALE(gate) {
  const overrides = getEnvOverrides();
  if (overrides && gate in overrides) {
    return Boolean(overrides[gate]);
  }
  const configOverrides = getConfigOverrides();
  if (configOverrides && gate in configOverrides) {
    return Boolean(configOverrides[gate]);
  }
  if (!isGrowthBookEnabled()) {
    return false;
  }
  if (experimentDataByFeature.has(gate)) {
    logExposureForFeature(gate);
  } else {
    pendingExposures.add(gate);
  }
  const config = getGlobalConfig();
  const gbCached = config.cachedGrowthBookFeatures?.[gate];
  if (gbCached !== undefined) {
    return Boolean(gbCached);
  }
  return config.cachedStatsigGates?.[gate] ?? false;
}
async function checkSecurityRestrictionGate(gate) {
  const overrides = getEnvOverrides();
  if (overrides && gate in overrides) {
    return Boolean(overrides[gate]);
  }
  const configOverrides = getConfigOverrides();
  if (configOverrides && gate in configOverrides) {
    return Boolean(configOverrides[gate]);
  }
  if (!isGrowthBookEnabled()) {
    return false;
  }
  if (reinitializingPromise) {
    await reinitializingPromise;
  }
  const config = getGlobalConfig();
  const statsigCached = config.cachedStatsigGates?.[gate];
  if (statsigCached !== undefined) {
    return Boolean(statsigCached);
  }
  const gbCached = config.cachedGrowthBookFeatures?.[gate];
  if (gbCached !== undefined) {
    return Boolean(gbCached);
  }
  return false;
}
async function checkGate_CACHED_OR_BLOCKING(gate) {
  const overrides = getEnvOverrides();
  if (overrides && gate in overrides) {
    return Boolean(overrides[gate]);
  }
  const configOverrides = getConfigOverrides();
  if (configOverrides && gate in configOverrides) {
    return Boolean(configOverrides[gate]);
  }
  if (!isGrowthBookEnabled()) {
    return false;
  }
  const cached = getGlobalConfig().cachedGrowthBookFeatures?.[gate];
  if (cached === true) {
    if (experimentDataByFeature.has(gate)) {
      logExposureForFeature(gate);
    } else {
      pendingExposures.add(gate);
    }
    return true;
  }
  return getFeatureValueInternal(gate, false, true);
}
function refreshGrowthBookAfterAuthChange() {
  if (!isGrowthBookEnabled()) {
    return;
  }
  try {
    resetGrowthBook();
    refreshed.emit();
    reinitializingPromise = initializeGrowthBook().catch((error) => {
      logError(toError(error));
      return null;
    }).finally(() => {
      reinitializingPromise = null;
    });
  } catch (error) {
    if (true) {
      throw error;
    }
    logError(toError(error));
  }
}
function resetGrowthBook() {
  stopPeriodicGrowthBookRefresh();
  if (currentBeforeExitHandler) {
    process.off("beforeExit", currentBeforeExitHandler);
    currentBeforeExitHandler = null;
  }
  if (currentExitHandler) {
    process.off("exit", currentExitHandler);
    currentExitHandler = null;
  }
  client?.destroy();
  client = null;
  clientCreatedWithAuth = false;
  reinitializingPromise = null;
  experimentDataByFeature.clear();
  pendingExposures.clear();
  loggedExposures.clear();
  remoteEvalFeatureValues.clear();
  getGrowthBookClient.cache?.clear?.();
  initializeGrowthBook.cache?.clear?.();
  envOverrides = null;
  envOverridesParsed = false;
}
async function refreshGrowthBookFeatures() {
  if (!isGrowthBookEnabled()) {
    return;
  }
  try {
    const growthBookClient = await initializeGrowthBook();
    if (!growthBookClient) {
      return;
    }
    await growthBookClient.refreshFeatures();
    if (growthBookClient !== client) {
      if (process.env.USER_TYPE === "ant") {
        logForDebugging("GrowthBook: Skipping refresh processing for replaced client");
      }
      return;
    }
    const hadFeatures = await processRemoteEvalPayload(growthBookClient);
    if (growthBookClient !== client)
      return;
    if (process.env.USER_TYPE === "ant") {
      logForDebugging("GrowthBook: Light refresh completed");
    }
    if (hadFeatures) {
      syncRemoteEvalToDisk();
      refreshed.emit();
    }
  } catch (error) {
    if (true) {
      throw error;
    }
    logError(toError(error));
  }
}
function setupPeriodicGrowthBookRefresh() {
  if (!isGrowthBookEnabled()) {
    return;
  }
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  refreshInterval = setInterval(() => {
    refreshGrowthBookFeatures();
  }, GROWTHBOOK_REFRESH_INTERVAL_MS);
  refreshInterval.unref?.();
  if (!beforeExitListener) {
    beforeExitListener = () => {
      stopPeriodicGrowthBookRefresh();
    };
    process.once("beforeExit", beforeExitListener);
  }
}
function stopPeriodicGrowthBookRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (beforeExitListener) {
    process.removeListener("beforeExit", beforeExitListener);
    beforeExitListener = null;
  }
}
async function getDynamicConfig_BLOCKS_ON_INIT(configName, defaultValue) {
  return getFeatureValue_DEPRECATED(configName, defaultValue);
}
function getDynamicConfig_CACHED_MAY_BE_STALE(configName, defaultValue) {
  return getFeatureValue_CACHED_MAY_BE_STALE(configName, defaultValue);
}
var client = null, currentBeforeExitHandler = null, currentExitHandler = null, clientCreatedWithAuth = false, experimentDataByFeature, remoteEvalFeatureValues, pendingExposures, loggedExposures, reinitializingPromise = null, refreshed, envOverrides = null, envOverridesParsed = false, getGrowthBookClient, initializeGrowthBook, GROWTHBOOK_REFRESH_INTERVAL_MS, refreshInterval = null, beforeExitListener = null;
var init_growthbook = __esm(() => {
  init_esm();
  init_lodash();
  init_state();
  init_keys();
  init_config();
  init_debug();
  init_errors();
  init_http();
  init_log();
  init_signal();
  init_slowOperations();
  init_user();
  init_firstPartyEventLogger();
  experimentDataByFeature = new Map;
  remoteEvalFeatureValues = new Map;
  pendingExposures = new Set;
  loggedExposures = new Set;
  refreshed = createSignal();
  getGrowthBookClient = memoize_default(() => {
    if (!isGrowthBookEnabled()) {
      return null;
    }
    const attributes = getUserAttributes();
    const clientKey = getGrowthBookClientKey();
    if (process.env.USER_TYPE === "ant") {
      logForDebugging(`GrowthBook: Creating client with clientKey=${clientKey}, attributes: ${jsonStringify(attributes)}`);
    }
    const baseUrl = "";
    const hasTrust = checkHasTrustDialogAccepted() || getSessionTrustAccepted() || getIsNonInteractiveSession();
    const authHeaders = hasTrust ? getAuthHeaders() : { headers: {}, error: "trust not established" };
    const hasAuth = !authHeaders.error;
    clientCreatedWithAuth = hasAuth;
    const thisClient = new GrowthBook({
      apiHost: baseUrl,
      clientKey,
      attributes,
      remoteEval: true,
      cacheKeyAttributes: ["id", "organizationUUID"],
      ...authHeaders.error ? {} : { apiHostRequestHeaders: authHeaders.headers },
      ...process.env.USER_TYPE === "ant" ? {
        log: (msg, ctx) => {
          logForDebugging(`GrowthBook: ${msg} ${jsonStringify(ctx)}`);
        }
      } : {}
    });
    client = thisClient;
    if (!hasAuth) {
      return { client: thisClient, initialized: Promise.resolve() };
    }
    const initialized = thisClient.init({ timeout: 5000 }).then(async (result) => {
      if (client !== thisClient) {
        if (process.env.USER_TYPE === "ant") {
          logForDebugging("GrowthBook: Skipping init callback for replaced client");
        }
        return;
      }
      if (process.env.USER_TYPE === "ant") {
        logForDebugging(`GrowthBook initialized successfully, source: ${result.source}, success: ${result.success}`);
      }
      const hadFeatures = await processRemoteEvalPayload(thisClient);
      if (client !== thisClient)
        return;
      if (hadFeatures) {
        for (const feature of pendingExposures) {
          logExposureForFeature(feature);
        }
        pendingExposures.clear();
        syncRemoteEvalToDisk();
        refreshed.emit();
      }
      if (process.env.USER_TYPE === "ant") {
        const features = thisClient.getFeatures();
        if (features) {
          const featureKeys = Object.keys(features);
          logForDebugging(`GrowthBook loaded ${featureKeys.length} features: ${featureKeys.slice(0, 10).join(", ")}${featureKeys.length > 10 ? "..." : ""}`);
        }
      }
    }).catch((error) => {
      if (process.env.USER_TYPE === "ant") {
        logError(toError(error));
      }
    });
    currentBeforeExitHandler = () => client?.destroy();
    currentExitHandler = () => client?.destroy();
    process.on("beforeExit", currentBeforeExitHandler);
    process.on("exit", currentExitHandler);
    return { client: thisClient, initialized };
  });
  initializeGrowthBook = memoize_default(async () => {
    let clientWrapper = getGrowthBookClient();
    if (!clientWrapper) {
      return null;
    }
    if (!clientCreatedWithAuth) {
      const hasTrust = checkHasTrustDialogAccepted() || getSessionTrustAccepted() || getIsNonInteractiveSession();
      if (hasTrust) {
        const currentAuth = getAuthHeaders();
        if (!currentAuth.error) {
          if (process.env.USER_TYPE === "ant") {
            logForDebugging("GrowthBook: Auth became available after client creation, reinitializing");
          }
          resetGrowthBook();
          clientWrapper = getGrowthBookClient();
          if (!clientWrapper) {
            return null;
          }
        }
      }
    }
    await clientWrapper.initialized;
    setupPeriodicGrowthBookRefresh();
    return clientWrapper.client;
  });
  GROWTHBOOK_REFRESH_INTERVAL_MS = process.env.USER_TYPE !== "ant" ? 6 * 60 * 60 * 1000 : 20 * 60 * 1000;
});

// src/utils/fileReadCache.ts
class FileReadCache {
  cache = new Map;
  maxCacheSize = 1000;
  readFile(filePath) {
    const fs = getFsImplementation();
    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch (error) {
      this.cache.delete(filePath);
      throw error;
    }
    const cacheKey = filePath;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && cachedData.mtime === stats.mtimeMs) {
      return {
        content: cachedData.content,
        encoding: cachedData.encoding
      };
    }
    const encoding = detectFileEncoding(filePath);
    const content = fs.readFileSync(filePath, { encoding }).replaceAll(`\r
`, `
`);
    this.cache.set(cacheKey, {
      content,
      encoding,
      mtime: stats.mtimeMs
    });
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    return { content, encoding };
  }
  clear() {
    this.cache.clear();
  }
  invalidate(filePath) {
    this.cache.delete(filePath);
  }
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}
var fileReadCache;
var init_fileReadCache = __esm(() => {
  init_file();
  init_fsOperations();
  fileReadCache = new FileReadCache;
});

// src/utils/file.ts
import { chmodSync as chmodSync2, writeFileSync as fsWriteFileSync } from "fs";
import { realpath as realpath2, stat as stat4 } from "fs/promises";
import { homedir as homedir4 } from "os";
import {
  basename as basename2,
  dirname as dirname5,
  extname as extname2,
  isAbsolute as isAbsolute3,
  join as join12,
  normalize as normalize3,
  relative as relative2,
  resolve as resolve4,
  sep as sep3
} from "path";
async function pathExists(path2) {
  try {
    await stat4(path2);
    return true;
  } catch {
    return false;
  }
}
function readFileSafe(filepath) {
  try {
    const fs = getFsImplementation();
    return fs.readFileSync(filepath, { encoding: "utf8" });
  } catch (error) {
    logError(error);
    return null;
  }
}
function getFileModificationTime(filePath) {
  const fs = getFsImplementation();
  return Math.floor(fs.statSync(filePath).mtimeMs);
}
async function getFileModificationTimeAsync(filePath) {
  const s = await getFsImplementation().stat(filePath);
  return Math.floor(s.mtimeMs);
}
function writeTextContent(filePath, content, encoding, endings) {
  let toWrite = content;
  if (endings === "CRLF") {
    toWrite = content.replaceAll(`\r
`, `
`).split(`
`).join(`\r
`);
  }
  writeFileSyncAndFlush_DEPRECATED(filePath, toWrite, { encoding });
}
function detectFileEncoding(filePath) {
  try {
    const fs = getFsImplementation();
    const { resolvedPath } = safeResolvePath(fs, filePath);
    return detectEncodingForResolvedPath(resolvedPath);
  } catch (error) {
    if (isFsInaccessible(error)) {
      logForDebugging(`detectFileEncoding failed for expected reason: ${error.code}`, {
        level: "debug"
      });
    } else {
      logError(error);
    }
    return "utf8";
  }
}
function detectLineEndings(filePath, encoding = "utf8") {
  try {
    const fs = getFsImplementation();
    const { resolvedPath } = safeResolvePath(fs, filePath);
    const { buffer, bytesRead } = fs.readSync(resolvedPath, { length: 4096 });
    const content = buffer.toString(encoding, 0, bytesRead);
    return detectLineEndingsForString(content);
  } catch (error) {
    logError(error);
    return "LF";
  }
}
function convertLeadingTabsToSpaces(content) {
  if (!content.includes("\t"))
    return content;
  return content.replace(/^\t+/gm, (_) => "  ".repeat(_.length));
}
function getAbsoluteAndRelativePaths(path2) {
  const absolutePath = path2 ? expandPath(path2) : undefined;
  const relativePath = absolutePath ? relative2(getCwd(), absolutePath) : undefined;
  return { absolutePath, relativePath };
}
function getDisplayPath(filePath) {
  const { relativePath } = getAbsoluteAndRelativePaths(filePath);
  if (relativePath && !relativePath.startsWith("..")) {
    return relativePath;
  }
  const homeDir = homedir4();
  if (filePath.startsWith(homeDir + sep3)) {
    return "~" + filePath.slice(homeDir.length);
  }
  return filePath;
}
function findSimilarFile(filePath) {
  const fs = getFsImplementation();
  try {
    const dir = dirname5(filePath);
    const fileBaseName = basename2(filePath, extname2(filePath));
    const files = fs.readdirSync(dir);
    const similarFiles = files.filter((file) => basename2(file.name, extname2(file.name)) === fileBaseName && join12(dir, file.name) !== filePath);
    const firstMatch = similarFiles[0];
    if (firstMatch) {
      return firstMatch.name;
    }
    return;
  } catch (error) {
    if (!isENOENT(error)) {
      logError(error);
    }
    return;
  }
}
async function suggestPathUnderCwd(requestedPath) {
  const cwd = getCwd();
  const cwdParent = dirname5(cwd);
  let resolvedPath = requestedPath;
  try {
    const resolvedDir = await realpath2(dirname5(requestedPath));
    resolvedPath = join12(resolvedDir, basename2(requestedPath));
  } catch {}
  const cwdParentPrefix = cwdParent === sep3 ? sep3 : cwdParent + sep3;
  if (!resolvedPath.startsWith(cwdParentPrefix) || resolvedPath.startsWith(cwd + sep3) || resolvedPath === cwd) {
    return;
  }
  const relFromParent = relative2(cwdParent, resolvedPath);
  const correctedPath = join12(cwd, relFromParent);
  try {
    await stat4(correctedPath);
    return correctedPath;
  } catch {
    return;
  }
}
function isCompactLinePrefixEnabled() {
  return !getFeatureValue_CACHED_MAY_BE_STALE("tengu_compact_line_prefix_killswitch", false);
}
function addLineNumbers({
  content,
  startLine
}) {
  if (!content) {
    return "";
  }
  const lines = content.split(/\r?\n/);
  if (isCompactLinePrefixEnabled()) {
    return lines.map((line, index) => `${index + startLine}	${line}`).join(`
`);
  }
  return lines.map((line, index) => {
    const numStr = String(index + startLine);
    if (numStr.length >= 6) {
      return `${numStr}→${line}`;
    }
    return `${numStr.padStart(6, " ")}→${line}`;
  }).join(`
`);
}
function isDirEmpty(dirPath) {
  try {
    return getFsImplementation().isDirEmptySync(dirPath);
  } catch (e) {
    return isENOENT(e);
  }
}
function readFileSyncCached(filePath) {
  const { content } = fileReadCache.readFile(filePath);
  return content;
}
function writeFileSyncAndFlush_DEPRECATED(filePath, content, options = { encoding: "utf-8" }) {
  const fs = getFsImplementation();
  let targetPath = filePath;
  try {
    const linkTarget = fs.readlinkSync(filePath);
    targetPath = isAbsolute3(linkTarget) ? linkTarget : resolve4(dirname5(filePath), linkTarget);
    logForDebugging(`Writing through symlink: ${filePath} -> ${targetPath}`);
  } catch {}
  const tempPath = `${targetPath}.tmp.${process.pid}.${Date.now()}`;
  let targetMode;
  let targetExists = false;
  try {
    targetMode = fs.statSync(targetPath).mode;
    targetExists = true;
    logForDebugging(`Preserving file permissions: ${targetMode.toString(8)}`);
  } catch (e) {
    if (!isENOENT(e))
      throw e;
    if (options.mode !== undefined) {
      targetMode = options.mode;
      logForDebugging(`Setting permissions for new file: ${targetMode.toString(8)}`);
    }
  }
  try {
    logForDebugging(`Writing to temp file: ${tempPath}`);
    const writeOptions = {
      encoding: options.encoding,
      flush: true
    };
    if (!targetExists && options.mode !== undefined) {
      writeOptions.mode = options.mode;
    }
    fsWriteFileSync(tempPath, content, writeOptions);
    logForDebugging(`Temp file written successfully, size: ${content.length} bytes`);
    if (targetExists && targetMode !== undefined) {
      chmodSync2(tempPath, targetMode);
      logForDebugging(`Applied original permissions to temp file`);
    }
    logForDebugging(`Renaming ${tempPath} to ${targetPath}`);
    fs.renameSync(tempPath, targetPath);
    logForDebugging(`File ${targetPath} written atomically`);
  } catch (atomicError) {
    logForDebugging(`Failed to write file atomically: ${atomicError}`, {
      level: "error"
    });
    logEvent("tengu_atomic_write_error", {});
    try {
      logForDebugging(`Cleaning up temp file: ${tempPath}`);
      fs.unlinkSync(tempPath);
    } catch (cleanupError) {
      logForDebugging(`Failed to clean up temp file: ${cleanupError}`);
    }
    logForDebugging(`Falling back to non-atomic write for ${targetPath}`);
    try {
      const fallbackOptions = {
        encoding: options.encoding,
        flush: true
      };
      if (!targetExists && options.mode !== undefined) {
        fallbackOptions.mode = options.mode;
      }
      fsWriteFileSync(targetPath, content, fallbackOptions);
      logForDebugging(`File ${targetPath} written successfully with non-atomic fallback`);
    } catch (fallbackError) {
      logForDebugging(`Non-atomic write also failed: ${fallbackError}`);
      throw fallbackError;
    }
  }
}
function getDesktopPath() {
  const platform = getPlatform();
  const homeDir = homedir4();
  if (platform === "macos") {
    return join12(homeDir, "Desktop");
  }
  if (platform === "windows") {
    const windowsHome = process.env.USERPROFILE ? process.env.USERPROFILE.replace(/\\/g, "/") : null;
    if (windowsHome) {
      const wslPath = windowsHome.replace(/^[A-Z]:/, "");
      const desktopPath2 = `/mnt/c${wslPath}/Desktop`;
      if (getFsImplementation().existsSync(desktopPath2)) {
        return desktopPath2;
      }
    }
    try {
      const usersDir = "/mnt/c/Users";
      const userDirs = getFsImplementation().readdirSync(usersDir);
      for (const user of userDirs) {
        if (user.name === "Public" || user.name === "Default" || user.name === "Default User" || user.name === "All Users") {
          continue;
        }
        const potentialDesktopPath = join12(usersDir, user.name, "Desktop");
        if (getFsImplementation().existsSync(potentialDesktopPath)) {
          return potentialDesktopPath;
        }
      }
    } catch (error) {
      logError(error);
    }
  }
  const desktopPath = join12(homeDir, "Desktop");
  if (getFsImplementation().existsSync(desktopPath)) {
    return desktopPath;
  }
  return homeDir;
}
function isFileWithinReadSizeLimit(filePath, maxSizeBytes = MAX_OUTPUT_SIZE) {
  try {
    const stats = getFsImplementation().statSync(filePath);
    return stats.size <= maxSizeBytes;
  } catch {
    return false;
  }
}
function normalizePathForComparison(filePath) {
  let normalized = normalize3(filePath);
  if (getPlatform() === "windows") {
    normalized = normalized.replace(/\//g, "\\").toLowerCase();
  }
  return normalized;
}
function pathsEqual(path1, path2) {
  return normalizePathForComparison(path1) === normalizePathForComparison(path2);
}
var MAX_OUTPUT_SIZE, FILE_NOT_FOUND_CWD_NOTE = "Note: your current working directory is";
var init_file = __esm(() => {
  init_analytics();
  init_growthbook();
  init_cwd();
  init_debug();
  init_errors();
  init_fileRead();
  init_fileReadCache();
  init_fsOperations();
  init_log();
  init_path();
  init_platform();
  MAX_OUTPUT_SIZE = 0.25 * 1024 * 1024;
});

// src/utils/git/gitignore.ts
import { appendFile, mkdir as mkdir2, readFile as readFile2, writeFile } from "fs/promises";
import { homedir as homedir5 } from "os";
import { dirname as dirname6, join as join13 } from "path";
async function isPathGitignored(filePath, cwd) {
  const { code } = await execFileNoThrowWithCwd("git", ["check-ignore", filePath], {
    preserveOutputOnError: false,
    cwd
  });
  return code === 0;
}
function getGlobalGitignorePath() {
  return join13(homedir5(), ".config", "git", "ignore");
}
async function addFileGlobRuleToGitignore(filename, cwd = getCwd()) {
  try {
    if (!await dirIsInGitRepo(cwd)) {
      return;
    }
    const gitignoreEntry = `**/${filename}`;
    const testPath = filename.endsWith("/") ? `${filename}sample-file.txt` : filename;
    if (await isPathGitignored(testPath, cwd)) {
      return;
    }
    const globalGitignorePath = getGlobalGitignorePath();
    const configGitDir = dirname6(globalGitignorePath);
    await mkdir2(configGitDir, { recursive: true });
    try {
      const content = await readFile2(globalGitignorePath, { encoding: "utf-8" });
      if (content.includes(gitignoreEntry)) {
        return;
      }
      await appendFile(globalGitignorePath, `
${gitignoreEntry}
`);
    } catch (e) {
      const code = getErrnoCode(e);
      if (code === "ENOENT") {
        await writeFile(globalGitignorePath, `${gitignoreEntry}
`, "utf-8");
      } else {
        throw e;
      }
    }
  } catch (error) {
    logError(error);
  }
}
var init_gitignore = __esm(() => {
  init_cwd();
  init_errors();
  init_execFileNoThrow();
  init_git();
  init_log();
});

// src/utils/settings/constants.ts
function getSettingSourceName(source) {
  switch (source) {
    case "userSettings":
      return "user";
    case "projectSettings":
      return "project";
    case "localSettings":
      return "project, gitignored";
    case "flagSettings":
      return "cli flag";
    case "policySettings":
      return "managed";
  }
}
function getSourceDisplayName(source) {
  switch (source) {
    case "userSettings":
      return "User";
    case "projectSettings":
      return "Project";
    case "localSettings":
      return "Local";
    case "flagSettings":
      return "Flag";
    case "policySettings":
      return "Managed";
    case "plugin":
      return "Plugin";
    case "built-in":
      return "Built-in";
  }
}
function getSettingSourceDisplayNameLowercase(source) {
  switch (source) {
    case "userSettings":
      return "user settings";
    case "projectSettings":
      return "shared project settings";
    case "localSettings":
      return "project local settings";
    case "flagSettings":
      return "command line arguments";
    case "policySettings":
      return "enterprise managed settings";
    case "cliArg":
      return "CLI argument";
    case "command":
      return "command configuration";
    case "session":
      return "current session";
  }
}
function getSettingSourceDisplayNameCapitalized(source) {
  switch (source) {
    case "userSettings":
      return "User settings";
    case "projectSettings":
      return "Shared project settings";
    case "localSettings":
      return "Project local settings";
    case "flagSettings":
      return "Command line arguments";
    case "policySettings":
      return "Enterprise managed settings";
    case "cliArg":
      return "CLI argument";
    case "command":
      return "Command configuration";
    case "session":
      return "Current session";
  }
}
function getEnabledSettingSources() {
  const allowed = getAllowedSettingSources();
  const result = new Set(allowed);
  result.add("policySettings");
  result.add("flagSettings");
  return Array.from(result);
}
function isSettingSourceEnabled(source) {
  const enabled = getEnabledSettingSources();
  return enabled.includes(source);
}
var SETTING_SOURCES, SOURCES, UR_CODE_SETTINGS_SCHEMA_URL = "https://json.schemastore.org/ur-settings.json";
var init_constants = __esm(() => {
  init_state();
  SETTING_SOURCES = [
    "userSettings",
    "projectSettings",
    "localSettings",
    "flagSettings",
    "policySettings"
  ];
  SOURCES = [
    "localSettings",
    "projectSettings",
    "userSettings"
  ];
});

// src/utils/settings/internalWrites.ts
function markInternalWrite(path2) {
  timestamps.set(path2, Date.now());
}
function consumeInternalWrite(path2, windowMs) {
  const ts = timestamps.get(path2);
  if (ts !== undefined && Date.now() - ts < windowMs) {
    timestamps.delete(path2);
    return true;
  }
  return false;
}
function clearInternalWrites() {
  timestamps.clear();
}
var timestamps;
var init_internalWrites = __esm(() => {
  timestamps = new Map;
});

// src/entrypoints/sandboxTypes.ts
var SandboxNetworkConfigSchema, SandboxFilesystemConfigSchema, SandboxSettingsSchema;
var init_sandboxTypes = __esm(() => {
  init_v4();
  init_lazySchema();
  SandboxNetworkConfigSchema = lazySchema(() => exports_external.object({
    allowedDomains: exports_external.array(exports_external.string()).optional(),
    allowManagedDomainsOnly: exports_external.boolean().optional().describe("When true (and set in managed settings), only allowedDomains and WebFetch(domain:...) allow rules from managed settings are respected. " + "User, project, local, and flag settings domains are ignored. Denied domains are still respected from all sources."),
    allowUnixSockets: exports_external.array(exports_external.string()).optional().describe("macOS only: Unix socket paths to allow. Ignored on Linux (seccomp cannot filter by path)."),
    allowAllUnixSockets: exports_external.boolean().optional().describe("If true, allow all Unix sockets (disables blocking on both platforms)."),
    allowLocalBinding: exports_external.boolean().optional(),
    httpProxyPort: exports_external.number().optional(),
    socksProxyPort: exports_external.number().optional()
  }).optional());
  SandboxFilesystemConfigSchema = lazySchema(() => exports_external.object({
    allowWrite: exports_external.array(exports_external.string()).optional().describe("Additional paths to allow writing within the sandbox. " + "Merged with paths from Edit(...) allow permission rules."),
    denyWrite: exports_external.array(exports_external.string()).optional().describe("Additional paths to deny writing within the sandbox. " + "Merged with paths from Edit(...) deny permission rules."),
    denyRead: exports_external.array(exports_external.string()).optional().describe("Additional paths to deny reading within the sandbox. " + "Merged with paths from Read(...) deny permission rules."),
    allowRead: exports_external.array(exports_external.string()).optional().describe("Paths to re-allow reading within denyRead regions. " + "Takes precedence over denyRead for matching paths."),
    allowManagedReadPathsOnly: exports_external.boolean().optional().describe("When true (set in managed settings), only allowRead paths from policySettings are used.")
  }).optional());
  SandboxSettingsSchema = lazySchema(() => exports_external.object({
    enabled: exports_external.boolean().optional(),
    failIfUnavailable: exports_external.boolean().optional().describe("Exit with an error at startup if sandbox.enabled is true but the sandbox cannot start " + "(missing dependencies, unsupported platform, or platform not in enabledPlatforms). " + "When false (default), a warning is shown and commands run unsandboxed. " + "Intended for managed-settings deployments that require sandboxing as a hard gate."),
    autoAllowBashIfSandboxed: exports_external.boolean().optional(),
    allowUnsandboxedCommands: exports_external.boolean().optional().describe("Allow commands to run outside the sandbox via the dangerouslyDisableSandbox parameter. " + "When false, the dangerouslyDisableSandbox parameter is completely ignored and all commands must run sandboxed. " + "Default: true."),
    network: SandboxNetworkConfigSchema(),
    filesystem: SandboxFilesystemConfigSchema(),
    ignoreViolations: exports_external.record(exports_external.string(), exports_external.array(exports_external.string())).optional(),
    enableWeakerNestedSandbox: exports_external.boolean().optional(),
    enableWeakerNetworkIsolation: exports_external.boolean().optional().describe("macOS only: Allow access to com.apple.trustd.agent in the sandbox. " + "Needed for Go-based CLI tools (gh, gcloud, terraform, etc.) to verify TLS certificates " + "when using httpProxyPort with a MITM proxy and custom CA. " + "**Reduces security** — opens a potential data exfiltration vector through the trustd service. Default: false"),
    excludedCommands: exports_external.array(exports_external.string()).optional(),
    ripgrep: exports_external.object({
      command: exports_external.string(),
      args: exports_external.array(exports_external.string()).optional()
    }).optional().describe("Custom ripgrep configuration for bundled ripgrep support")
  }).passthrough());
});

// src/types/permissions.ts
var EXTERNAL_PERMISSION_MODES, INTERNAL_PERMISSION_MODES, PERMISSION_MODES;
var init_permissions = __esm(() => {
  EXTERNAL_PERMISSION_MODES = [
    "acceptEdits",
    "autoApprove",
    "bypassPermissions",
    "default",
    "plan"
  ];
  INTERNAL_PERMISSION_MODES = [
    ...EXTERNAL_PERMISSION_MODES,
    ...[]
  ];
  PERMISSION_MODES = INTERNAL_PERMISSION_MODES;
});

// src/utils/permissions/PermissionMode.ts
function isExternalPermissionMode(mode) {
  return EXTERNAL_PERMISSION_MODES.includes(mode);
}
function getModeConfig(mode) {
  return PERMISSION_MODE_CONFIG[mode] ?? PERMISSION_MODE_CONFIG.default;
}
function toExternalPermissionMode(mode) {
  return getModeConfig(mode).external;
}
function permissionModeFromString(str) {
  return PERMISSION_MODES.includes(str) ? str : "default";
}
function permissionModeTitle(mode) {
  return getModeConfig(mode).title;
}
function getModeColor(mode) {
  return getModeConfig(mode).color;
}
var permissionModeSchema, externalPermissionModeSchema, PERMISSION_MODE_CONFIG;
var init_PermissionMode = __esm(() => {
  init_v4();
  init_figures();
  init_permissions();
  init_lazySchema();
  permissionModeSchema = lazySchema(() => v4_default.enum(PERMISSION_MODES));
  externalPermissionModeSchema = lazySchema(() => v4_default.enum(EXTERNAL_PERMISSION_MODES));
  PERMISSION_MODE_CONFIG = {
    default: {
      title: "Default",
      shortTitle: "Default",
      symbol: "",
      color: "text",
      external: "default"
    },
    plan: {
      title: "Plan Mode",
      shortTitle: "Plan",
      symbol: PAUSE_ICON,
      color: "planMode",
      external: "plan"
    },
    acceptEdits: {
      title: "Accept edits",
      shortTitle: "Accept",
      symbol: "⏵⏵",
      color: "autoAccept",
      external: "acceptEdits"
    },
    autoApprove: {
      title: "Auto Approval",
      shortTitle: "Auto Approve",
      symbol: "⏵⏵",
      color: "warning",
      external: "autoApprove"
    },
    bypassPermissions: {
      title: "Bypass Permissions",
      shortTitle: "Bypass",
      symbol: "⏵⏵",
      color: "error",
      external: "bypassPermissions"
    },
    dontAsk: {
      title: "Don't Ask",
      shortTitle: "DontAsk",
      symbol: "⏵⏵",
      color: "error",
      external: "default"
    },
    ...{}
  };
});

// src/entrypoints/sdk/coreTypes.generated.ts
var init_coreTypes_generated = () => {};

// src/entrypoints/sdk/coreTypes.ts
var HOOK_EVENTS;
var init_coreTypes = __esm(() => {
  init_coreTypes_generated();
  HOOK_EVENTS = [
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "Notification",
    "UserPromptSubmit",
    "SessionStart",
    "SessionEnd",
    "Stop",
    "StopFailure",
    "SubagentStart",
    "SubagentStop",
    "PreCompact",
    "PostCompact",
    "PermissionRequest",
    "PermissionDenied",
    "Setup",
    "TeammateIdle",
    "TaskCreated",
    "TaskCompleted",
    "Elicitation",
    "ElicitationResult",
    "ConfigChange",
    "WorktreeCreate",
    "WorktreeRemove",
    "InstructionsLoaded",
    "CwdChanged",
    "FileChanged",
    "BeforeEdit",
    "AfterEdit",
    "BeforeCommand",
    "AfterCommand",
    "BeforeCommit",
    "OnFailure"
  ];
});

// src/entrypoints/sdk/runtimeTypes.ts
var init_runtimeTypes = () => {};

// src/entrypoints/sdk/toolTypes.ts
var init_toolTypes = () => {};

// src/entrypoints/agentSdkTypes.ts
var init_agentSdkTypes = __esm(() => {
  init_coreTypes();
  init_runtimeTypes();
  init_toolTypes();
});

// src/utils/shell/shellProvider.ts
var SHELL_TYPES, DEFAULT_HOOK_SHELL = "bash";
var init_shellProvider = __esm(() => {
  SHELL_TYPES = ["bash", "powershell"];
});

// src/schemas/hooks.ts
function buildHookSchemas() {
  const BashCommandHookSchema = exports_external.object({
    type: exports_external.literal("command").describe("Shell command hook type"),
    command: exports_external.string().describe("Shell command to execute"),
    if: IfConditionSchema(),
    shell: exports_external.enum(SHELL_TYPES).optional().describe("Shell interpreter. 'bash' uses your $SHELL (bash/zsh/sh); 'powershell' uses pwsh. Defaults to bash."),
    timeout: exports_external.number().positive().optional().describe("Timeout in seconds for this specific command"),
    statusMessage: exports_external.string().optional().describe("Custom status message to display in spinner while hook runs"),
    once: exports_external.boolean().optional().describe("If true, hook runs once and is removed after execution"),
    async: exports_external.boolean().optional().describe("If true, hook runs in background without blocking"),
    asyncRewake: exports_external.boolean().optional().describe("If true, hook runs in background and wakes the model on exit code 2 (blocking error). Implies async.")
  });
  const PromptHookSchema = exports_external.object({
    type: exports_external.literal("prompt").describe("LLM prompt hook type"),
    prompt: exports_external.string().describe("Prompt to evaluate with LLM. Use $ARGUMENTS placeholder for hook input JSON."),
    if: IfConditionSchema(),
    timeout: exports_external.number().positive().optional().describe("Timeout in seconds for this specific prompt evaluation"),
    model: exports_external.string().optional().describe("Provider-scoped model to use for this prompt hook. If not specified, uses the active provider/model selection."),
    statusMessage: exports_external.string().optional().describe("Custom status message to display in spinner while hook runs"),
    once: exports_external.boolean().optional().describe("If true, hook runs once and is removed after execution")
  });
  const HttpHookSchema = exports_external.object({
    type: exports_external.literal("http").describe("HTTP hook type"),
    url: exports_external.string().url().describe("URL to POST the hook input JSON to"),
    if: IfConditionSchema(),
    timeout: exports_external.number().positive().optional().describe("Timeout in seconds for this specific request"),
    headers: exports_external.record(exports_external.string(), exports_external.string()).optional().describe('Additional headers to include in the request. Values may reference environment variables using $VAR_NAME or ${VAR_NAME} syntax (e.g., "Authorization": "Bearer $MY_TOKEN"). Only variables listed in allowedEnvVars will be interpolated.'),
    allowedEnvVars: exports_external.array(exports_external.string()).optional().describe("Explicit list of environment variable names that may be interpolated in header values. Only variables listed here will be resolved; all other $VAR references are left as empty strings. Required for env var interpolation to work."),
    statusMessage: exports_external.string().optional().describe("Custom status message to display in spinner while hook runs"),
    once: exports_external.boolean().optional().describe("If true, hook runs once and is removed after execution")
  });
  const AgentHookSchema = exports_external.object({
    type: exports_external.literal("agent").describe("Agentic verifier hook type"),
    prompt: exports_external.string().describe('Prompt describing what to verify (e.g. "Verify that unit tests ran and passed."). Use $ARGUMENTS placeholder for hook input JSON.'),
    if: IfConditionSchema(),
    timeout: exports_external.number().positive().optional().describe("Timeout in seconds for agent execution (default 60)"),
    model: exports_external.string().optional().describe("Provider-scoped model to use for this agent hook. If not specified, uses the active provider/model selection."),
    statusMessage: exports_external.string().optional().describe("Custom status message to display in spinner while hook runs"),
    once: exports_external.boolean().optional().describe("If true, hook runs once and is removed after execution")
  });
  return {
    BashCommandHookSchema,
    PromptHookSchema,
    HttpHookSchema,
    AgentHookSchema
  };
}
var IfConditionSchema, HookCommandSchema, HookMatcherSchema, HooksSchema;
var init_hooks = __esm(() => {
  init_agentSdkTypes();
  init_v4();
  init_lazySchema();
  init_shellProvider();
  IfConditionSchema = lazySchema(() => exports_external.string().optional().describe('Permission rule syntax to filter when this hook runs (e.g., "Bash(git *)"). ' + "Only runs if the tool call matches the pattern. Avoids spawning hooks for non-matching commands."));
  HookCommandSchema = lazySchema(() => {
    const {
      BashCommandHookSchema,
      PromptHookSchema,
      AgentHookSchema,
      HttpHookSchema
    } = buildHookSchemas();
    return exports_external.discriminatedUnion("type", [
      BashCommandHookSchema,
      PromptHookSchema,
      AgentHookSchema,
      HttpHookSchema
    ]);
  });
  HookMatcherSchema = lazySchema(() => exports_external.object({
    matcher: exports_external.string().optional().describe('String pattern to match (e.g. tool names like "Write")'),
    hooks: exports_external.array(HookCommandSchema()).describe("List of hooks to execute when the matcher matches")
  }));
  HooksSchema = lazySchema(() => exports_external.partialRecord(exports_external.enum(HOOK_EVENTS), exports_external.array(HookMatcherSchema())));
});

// src/services/mcp/types.ts
var ConfigScopeSchema, TransportSchema, McpStdioServerConfigSchema, McpXaaConfigSchema, McpOAuthConfigSchema, McpSSEServerConfigSchema, McpSSEIDEServerConfigSchema, McpWebSocketIDEServerConfigSchema, McpHTTPServerConfigSchema, McpWebSocketServerConfigSchema, McpSdkServerConfigSchema, McpURAIProxyServerConfigSchema, McpServerConfigSchema, McpJsonConfigSchema;
var init_types = __esm(() => {
  init_v4();
  init_lazySchema();
  ConfigScopeSchema = lazySchema(() => exports_external.enum([
    "local",
    "user",
    "project",
    "dynamic",
    "enterprise",
    "urai",
    "managed"
  ]));
  TransportSchema = lazySchema(() => exports_external.enum(["stdio", "sse", "sse-ide", "http", "ws", "sdk"]));
  McpStdioServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("stdio").optional(),
    command: exports_external.string().min(1, "Command cannot be empty"),
    args: exports_external.array(exports_external.string()).default([]),
    env: exports_external.record(exports_external.string(), exports_external.string()).optional()
  }));
  McpXaaConfigSchema = lazySchema(() => exports_external.boolean());
  McpOAuthConfigSchema = lazySchema(() => exports_external.object({
    clientId: exports_external.string().optional(),
    callbackPort: exports_external.number().int().positive().optional(),
    authServerMetadataUrl: exports_external.string().url().startsWith("https://", {
      message: "authServerMetadataUrl must use https://"
    }).optional(),
    xaa: McpXaaConfigSchema().optional()
  }));
  McpSSEServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("sse"),
    url: exports_external.string(),
    headers: exports_external.record(exports_external.string(), exports_external.string()).optional(),
    headersHelper: exports_external.string().optional(),
    oauth: McpOAuthConfigSchema().optional()
  }));
  McpSSEIDEServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("sse-ide"),
    url: exports_external.string(),
    ideName: exports_external.string(),
    ideRunningInWindows: exports_external.boolean().optional()
  }));
  McpWebSocketIDEServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("ws-ide"),
    url: exports_external.string(),
    ideName: exports_external.string(),
    authToken: exports_external.string().optional(),
    ideRunningInWindows: exports_external.boolean().optional()
  }));
  McpHTTPServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("http"),
    url: exports_external.string(),
    headers: exports_external.record(exports_external.string(), exports_external.string()).optional(),
    headersHelper: exports_external.string().optional(),
    oauth: McpOAuthConfigSchema().optional()
  }));
  McpWebSocketServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("ws"),
    url: exports_external.string(),
    headers: exports_external.record(exports_external.string(), exports_external.string()).optional(),
    headersHelper: exports_external.string().optional()
  }));
  McpSdkServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("sdk"),
    name: exports_external.string()
  }));
  McpURAIProxyServerConfigSchema = lazySchema(() => exports_external.object({
    type: exports_external.literal("urai-proxy"),
    url: exports_external.string(),
    id: exports_external.string()
  }));
  McpServerConfigSchema = lazySchema(() => exports_external.union([
    McpStdioServerConfigSchema(),
    McpSSEServerConfigSchema(),
    McpSSEIDEServerConfigSchema(),
    McpWebSocketIDEServerConfigSchema(),
    McpHTTPServerConfigSchema(),
    McpWebSocketServerConfigSchema(),
    McpSdkServerConfigSchema(),
    McpURAIProxyServerConfigSchema()
  ]));
  McpJsonConfigSchema = lazySchema(() => exports_external.object({
    mcpServers: exports_external.record(exports_external.string(), McpServerConfigSchema())
  }));
});

// src/utils/plugins/schemas.ts
function isMarketplaceAutoUpdate(marketplaceName, entry) {
  const normalizedName = marketplaceName.toLowerCase();
  return entry.autoUpdate ?? (ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(normalizedName) && !NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES.has(normalizedName));
}
function isBlockedOfficialName(name) {
  if (ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(name.toLowerCase())) {
    return false;
  }
  if (NON_ASCII_PATTERN.test(name)) {
    return true;
  }
  return BLOCKED_OFFICIAL_NAME_PATTERN.test(name);
}
function validateOfficialNameSource(name, source) {
  const normalizedName = name.toLowerCase();
  if (!ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(normalizedName)) {
    return null;
  }
  if (source.source === "github") {
    const repo = source.repo || "";
    if (!repo.toLowerCase().startsWith(`${OFFICIAL_GITHUB_ORG}/`)) {
      return `The name '${name}' is reserved for official UR marketplaces. Only repositories from 'github.com/${OFFICIAL_GITHUB_ORG}/' can use this name.`;
    }
    return null;
  }
  if (source.source === "git" && source.url) {
    const url = source.url.toLowerCase();
    const officialOrg = OFFICIAL_GITHUB_ORG.toLowerCase();
    const isHttpsOfficial = url.includes(`github.com/${officialOrg}/`);
    const isSshOfficial = url.includes(`git@github.com:${officialOrg}/`);
    if (isHttpsOfficial || isSshOfficial) {
      return null;
    }
    return `The name '${name}' is reserved for official UR marketplaces. Only repositories from 'github.com/${OFFICIAL_GITHUB_ORG}/' can use this name.`;
  }
  return `The name '${name}' is reserved for official UR marketplaces and can only be used with GitHub sources from the '${OFFICIAL_GITHUB_ORG}' organization.`;
}
function isLocalPluginSource(source) {
  return typeof source === "string" && source.startsWith("./");
}
function isLocalMarketplaceSource(source) {
  return source.source === "file" || source.source === "directory";
}
var ALLOWED_OFFICIAL_MARKETPLACE_NAMES, NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES, BLOCKED_OFFICIAL_NAME_PATTERN, NON_ASCII_PATTERN, OFFICIAL_GITHUB_ORG = "Maitham16", RelativePath, RelativeJSONPath, McpbPath, RelativeMarkdownPath, RelativeCommandPath, MarketplaceNameSchema, PluginAuthorSchema, PluginManifestMetadataSchema, PluginHooksSchema, PluginManifestHooksSchema, CommandMetadataSchema, PluginManifestCommandsSchema, PluginManifestAgentsSchema, PluginManifestSkillsSchema, PluginManifestOutputStylesSchema, PluginManifestTemplatesSchema, PluginManifestValidatorsSchema, PluginManifestLanguageAdaptersSchema, nonEmptyString, fileExtension, PluginManifestMcpServerSchema, PluginUserConfigOptionSchema, PluginManifestUserConfigSchema, PluginManifestChannelsSchema, LspServerConfigSchema, PluginManifestLspServerSchema, NpmPackageNameSchema, PluginManifestSettingsSchema, PluginManifestSchema, MarketplaceSourceSchema, gitSha, PluginSourceSchema, SettingsMarketplacePluginSchema, PluginMarketplaceEntrySchema, PluginMarketplaceSchema, PluginIdSchema, DEP_REF_REGEX, DependencyRefSchema, SettingsPluginEntrySchema, InstalledPluginSchema, InstalledPluginsFileSchemaV1, PluginScopeSchema, PluginInstallationEntrySchema, InstalledPluginsFileSchemaV2, InstalledPluginsFileSchema, KnownMarketplaceSchema, KnownMarketplacesFileSchema;
var init_schemas = __esm(() => {
  init_v4();
  init_hooks();
  init_types();
  init_lazySchema();
  ALLOWED_OFFICIAL_MARKETPLACE_NAMES = new Set([
    "ur-marketplace",
    "ur-plugins",
    "ur-plugins-official",
    "agent-skills",
    "life-sciences",
    "knowledge-work-plugins"
  ]);
  NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES = new Set(["knowledge-work-plugins"]);
  BLOCKED_OFFICIAL_NAME_PATTERN = /(?:official[^a-z0-9]*ur|ur[^a-z0-9]*official|^ur[^a-z0-9]*(marketplace|plugins|official))/i;
  NON_ASCII_PATTERN = /[^\u0020-\u007E]/;
  RelativePath = lazySchema(() => exports_external.string().startsWith("./"));
  RelativeJSONPath = lazySchema(() => RelativePath().endsWith(".json"));
  McpbPath = lazySchema(() => exports_external.union([
    RelativePath().refine((path2) => path2.endsWith(".mcpb") || path2.endsWith(".dxt"), {
      message: "MCPB file path must end with .mcpb or .dxt"
    }).describe("Path to MCPB file relative to plugin root"),
    exports_external.string().url().refine((url) => url.endsWith(".mcpb") || url.endsWith(".dxt"), {
      message: "MCPB URL must end with .mcpb or .dxt"
    }).describe("URL to MCPB file")
  ]));
  RelativeMarkdownPath = lazySchema(() => RelativePath().endsWith(".md"));
  RelativeCommandPath = lazySchema(() => exports_external.union([
    RelativeMarkdownPath(),
    RelativePath()
  ]));
  MarketplaceNameSchema = lazySchema(() => exports_external.string().min(1, "Marketplace must have a name").refine((name) => !name.includes(" "), {
    message: 'Marketplace name cannot contain spaces. Use kebab-case (e.g., "my-marketplace")'
  }).refine((name) => !name.includes("/") && !name.includes("\\") && !name.includes("..") && name !== ".", {
    message: 'Marketplace name cannot contain path separators (/ or \\), ".." sequences, or be "."'
  }).refine((name) => !isBlockedOfficialName(name), {
    message: "Marketplace name impersonates an official UR marketplace"
  }).refine((name) => name.toLowerCase() !== "inline", {
    message: 'Marketplace name "inline" is reserved for --plugin-dir session plugins'
  }).refine((name) => name.toLowerCase() !== "builtin", {
    message: 'Marketplace name "builtin" is reserved for built-in plugins'
  }));
  PluginAuthorSchema = lazySchema(() => exports_external.object({
    name: exports_external.string().min(1, "Author name cannot be empty").describe("Display name of the plugin author or organization"),
    email: exports_external.string().optional().describe("Contact email for support or feedback"),
    url: exports_external.string().optional().describe("Website, GitHub profile, or organization URL")
  }));
  PluginManifestMetadataSchema = lazySchema(() => exports_external.object({
    name: exports_external.string().min(1, "Plugin name cannot be empty").refine((name) => !name.includes(" "), {
      message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")'
    }).describe("Unique identifier for the plugin, used for namespacing (prefer kebab-case)"),
    version: exports_external.string().optional().describe("Semantic version (e.g., 1.2.3) following semver.org specification"),
    description: exports_external.string().optional().describe("Brief, user-facing explanation of what the plugin provides"),
    author: PluginAuthorSchema().optional().describe("Information about the plugin creator or maintainer"),
    homepage: exports_external.string().url().optional().describe("Plugin homepage or documentation URL"),
    repository: exports_external.string().optional().describe("Source code repository URL"),
    license: exports_external.string().optional().describe("Plugin license identifier or custom license reference"),
    keywords: exports_external.array(exports_external.string()).optional().describe("Tags for plugin discovery and categorization"),
    dependencies: exports_external.array(DependencyRefSchema()).optional().describe(`Plugins that must be enabled for this plugin to function. Bare names (no "@marketplace") are resolved against the declaring plugin's own marketplace.`)
  }));
  PluginHooksSchema = lazySchema(() => exports_external.object({
    description: exports_external.string().optional().describe("Brief, user-facing explanation of what these hooks provide"),
    hooks: exports_external.lazy(() => HooksSchema()).describe("The hooks provided by the plugin, in the same format as the one used for settings")
  }));
  PluginManifestHooksSchema = lazySchema(() => exports_external.object({
    hooks: exports_external.union([
      RelativeJSONPath().describe("Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root"),
      exports_external.lazy(() => HooksSchema()).describe("Additional hooks (in addition to those in hooks/hooks.json, if it exists)"),
      exports_external.array(exports_external.union([
        RelativeJSONPath().describe("Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root"),
        exports_external.lazy(() => HooksSchema()).describe("Additional hooks (in addition to those in hooks/hooks.json, if it exists)")
      ]))
    ])
  }));
  CommandMetadataSchema = lazySchema(() => exports_external.object({
    source: RelativeCommandPath().optional().describe("Path to command markdown file, relative to plugin root"),
    content: exports_external.string().optional().describe("Inline markdown content for the command"),
    description: exports_external.string().optional().describe("Command description override"),
    argumentHint: exports_external.string().optional().describe('Hint for command arguments (e.g., "[file]")'),
    model: exports_external.string().optional().describe("Default model for this command"),
    allowedTools: exports_external.array(exports_external.string()).optional().describe("Tools allowed when command runs")
  }).refine((data) => data.source && !data.content || !data.source && data.content, {
    message: 'Command must have either "source" (file path) or "content" (inline markdown), but not both'
  }));
  PluginManifestCommandsSchema = lazySchema(() => exports_external.object({
    commands: exports_external.union([
      RelativeCommandPath().describe("Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativeCommandPath().describe("Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional command files or skill directories"),
      exports_external.record(exports_external.string(), CommandMetadataSchema()).describe('Object mapping of command names to their metadata and source files. Command name becomes the slash command name (e.g., "about" → "/plugin:about")')
    ])
  }));
  PluginManifestAgentsSchema = lazySchema(() => exports_external.object({
    agents: exports_external.union([
      RelativeMarkdownPath().describe("Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativeMarkdownPath().describe("Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional agent files")
    ])
  }));
  PluginManifestSkillsSchema = lazySchema(() => exports_external.object({
    skills: exports_external.union([
      RelativePath().describe("Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativePath().describe("Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional skill directories")
    ])
  }));
  PluginManifestOutputStylesSchema = lazySchema(() => exports_external.object({
    outputStyles: exports_external.union([
      RelativePath().describe("Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativePath().describe("Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional output styles directories or files")
    ])
  }));
  PluginManifestTemplatesSchema = lazySchema(() => exports_external.object({
    templates: exports_external.union([
      RelativePath().describe("Path to additional templates directory or file (in addition to those in the templates/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativePath().describe("Path to additional templates directory or file (in addition to those in the templates/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional template directories or files")
    ])
  }));
  PluginManifestValidatorsSchema = lazySchema(() => exports_external.object({
    validators: exports_external.union([
      RelativePath().describe("Path to additional validators directory or file (in addition to those in the validators/ directory, if it exists), relative to the plugin root"),
      exports_external.array(RelativePath().describe("Path to additional validators directory or file (in addition to those in the validators/ directory, if it exists), relative to the plugin root")).describe("List of paths to additional validator directories or files")
    ])
  }));
  PluginManifestLanguageAdaptersSchema = lazySchema(() => exports_external.object({
    languageAdapters: exports_external.record(exports_external.string().min(1), exports_external.object({
      extensions: exports_external.array(fileExtension()).describe("File extensions this adapter handles"),
      engine: exports_external.enum(["typescript", "lsp", "treesitter"]).describe("Preferred engine for this language"),
      grammarPackage: exports_external.string().optional().describe("Optional npm package providing a tree-sitter grammar"),
      lspServerName: exports_external.string().optional().describe("Optional reference to an LSP server declared in lspServers")
    }))
  }));
  nonEmptyString = lazySchema(() => exports_external.string().min(1));
  fileExtension = lazySchema(() => exports_external.string().min(2).refine((ext) => ext.startsWith("."), {
    message: 'File extensions must start with dot (e.g., ".ts", not "ts")'
  }));
  PluginManifestMcpServerSchema = lazySchema(() => exports_external.object({
    mcpServers: exports_external.union([
      RelativeJSONPath().describe("MCP servers to include in the plugin (in addition to those in the .mcp.json file, if it exists)"),
      McpbPath().describe("Path or URL to MCPB file containing MCP server configuration"),
      exports_external.record(exports_external.string(), McpServerConfigSchema()).describe("MCP server configurations keyed by server name"),
      exports_external.array(exports_external.union([
        RelativeJSONPath().describe("Path to MCP servers configuration file"),
        McpbPath().describe("Path or URL to MCPB file"),
        exports_external.record(exports_external.string(), McpServerConfigSchema()).describe("Inline MCP server configurations")
      ])).describe("Array of MCP server configurations (paths, MCPB files, or inline definitions)")
    ])
  }));
  PluginUserConfigOptionSchema = lazySchema(() => exports_external.object({
    type: exports_external.enum(["string", "number", "boolean", "directory", "file"]).describe("Type of the configuration value"),
    title: exports_external.string().describe("Human-readable label shown in the config dialog"),
    description: exports_external.string().describe("Help text shown beneath the field in the config dialog"),
    required: exports_external.boolean().optional().describe("If true, validation fails when this field is empty"),
    default: exports_external.union([exports_external.string(), exports_external.number(), exports_external.boolean(), exports_external.array(exports_external.string())]).optional().describe("Default value used when the user provides nothing"),
    multiple: exports_external.boolean().optional().describe("For string type: allow an array of strings"),
    sensitive: exports_external.boolean().optional().describe("If true, masks dialog input and stores value in secure storage (keychain/credentials file) instead of settings.json"),
    min: exports_external.number().optional().describe("Minimum value (number type only)"),
    max: exports_external.number().optional().describe("Maximum value (number type only)")
  }).strict());
  PluginManifestUserConfigSchema = lazySchema(() => exports_external.object({
    userConfig: exports_external.record(exports_external.string().regex(/^[A-Za-z_]\w*$/, "Option keys must be valid identifiers (letters, digits, underscore; no leading digit) — they become UR_PLUGIN_OPTION_<KEY> env vars in hooks"), PluginUserConfigOptionSchema()).optional().describe("User-configurable values this plugin needs. Prompted at enable time. " + "Non-sensitive values saved to settings.json; sensitive values to secure storage " + "(macOS keychain or .credentials.json). Available as ${user_config.KEY} in " + "MCP/LSP server config, hook commands, and (non-sensitive only) skill/agent content. " + "Note: sensitive values share a single keychain entry with OAuth tokens — keep " + "secret counts small to stay under the ~2KB stdin-safe limit (see INC-3028).")
  }));
  PluginManifestChannelsSchema = lazySchema(() => exports_external.object({
    channels: exports_external.array(exports_external.object({
      server: exports_external.string().min(1).describe("Name of the MCP server this channel binds to. Must match a key in this plugin's mcpServers."),
      displayName: exports_external.string().optional().describe('Human-readable name shown in the config dialog title (e.g., "Telegram"). Defaults to the server name.'),
      userConfig: exports_external.record(exports_external.string(), PluginUserConfigOptionSchema()).optional().describe("Fields to prompt the user for when enabling this plugin in assistant mode. " + "Saved values are substituted into ${user_config.KEY} references in the mcpServers env.")
    }).strict()).describe("Channels this plugin provides. Each entry declares an MCP server as a message channel " + "and optionally specifies user configuration to prompt for at enable time.")
  }));
  LspServerConfigSchema = lazySchema(() => exports_external.strictObject({
    command: exports_external.string().min(1).refine((cmd) => {
      if (cmd.includes(" ") && !cmd.startsWith("/")) {
        return false;
      }
      return true;
    }, {
      message: "Command should not contain spaces. Use args array for arguments."
    }).describe('Command to execute the LSP server (e.g., "typescript-language-server")'),
    args: exports_external.array(nonEmptyString()).optional().describe("Command-line arguments to pass to the server"),
    extensionToLanguage: exports_external.record(fileExtension(), nonEmptyString()).refine((record) => Object.keys(record).length > 0, {
      message: "extensionToLanguage must have at least one mapping"
    }).describe("Mapping from file extension to LSP language ID. File extensions and languages are derived from this mapping."),
    transport: exports_external.enum(["stdio", "socket"]).default("stdio").describe("Communication transport mechanism"),
    env: exports_external.record(exports_external.string(), exports_external.string()).optional().describe("Environment variables to set when starting the server"),
    initializationOptions: exports_external.unknown().optional().describe("Initialization options passed to the server during initialization"),
    settings: exports_external.unknown().optional().describe("Settings passed to the server via workspace/didChangeConfiguration"),
    workspaceFolder: exports_external.string().optional().describe("Workspace folder path to use for the server"),
    startupTimeout: exports_external.number().int().positive().optional().describe("Maximum time to wait for server startup (milliseconds)"),
    shutdownTimeout: exports_external.number().int().positive().optional().describe("Maximum time to wait for graceful shutdown (milliseconds)"),
    restartOnCrash: exports_external.boolean().optional().describe("Whether to restart the server if it crashes"),
    maxRestarts: exports_external.number().int().nonnegative().optional().describe("Maximum number of restart attempts before giving up")
  }));
  PluginManifestLspServerSchema = lazySchema(() => exports_external.object({
    lspServers: exports_external.union([
      RelativeJSONPath().describe("Path to .lsp.json configuration file relative to plugin root"),
      exports_external.record(exports_external.string(), LspServerConfigSchema()).describe("LSP server configurations keyed by server name"),
      exports_external.array(exports_external.union([
        RelativeJSONPath().describe("Path to LSP configuration file"),
        exports_external.record(exports_external.string(), LspServerConfigSchema()).describe("Inline LSP server configurations")
      ])).describe("Array of LSP server configurations (paths or inline definitions)")
    ])
  }));
  NpmPackageNameSchema = lazySchema(() => exports_external.string().refine((name) => !name.includes("..") && !name.includes("//"), "Package name cannot contain path traversal patterns").refine((name) => {
    const scopedPackageRegex = /^@[a-z0-9][a-z0-9-._]*\/[a-z0-9][a-z0-9-._]*$/;
    const regularPackageRegex = /^[a-z0-9][a-z0-9-._]*$/;
    return scopedPackageRegex.test(name) || regularPackageRegex.test(name);
  }, "Invalid npm package name format"));
  PluginManifestSettingsSchema = lazySchema(() => exports_external.object({
    settings: exports_external.record(exports_external.string(), exports_external.unknown()).optional().describe("Settings to merge when plugin is enabled. " + "Only allowlisted keys are kept (currently: agent)")
  }));
  PluginManifestSchema = lazySchema(() => exports_external.object({
    ...PluginManifestMetadataSchema().shape,
    ...PluginManifestHooksSchema().partial().shape,
    ...PluginManifestCommandsSchema().partial().shape,
    ...PluginManifestAgentsSchema().partial().shape,
    ...PluginManifestSkillsSchema().partial().shape,
    ...PluginManifestOutputStylesSchema().partial().shape,
    ...PluginManifestTemplatesSchema().partial().shape,
    ...PluginManifestValidatorsSchema().partial().shape,
    ...PluginManifestLanguageAdaptersSchema().partial().shape,
    ...PluginManifestChannelsSchema().partial().shape,
    ...PluginManifestMcpServerSchema().partial().shape,
    ...PluginManifestLspServerSchema().partial().shape,
    ...PluginManifestSettingsSchema().partial().shape,
    ...PluginManifestUserConfigSchema().partial().shape
  }));
  MarketplaceSourceSchema = lazySchema(() => exports_external.discriminatedUnion("source", [
    exports_external.object({
      source: exports_external.literal("url"),
      url: exports_external.string().url().describe("Direct URL to marketplace.json file"),
      headers: exports_external.record(exports_external.string(), exports_external.string()).optional().describe("Custom HTTP headers (e.g., for authentication)")
    }),
    exports_external.object({
      source: exports_external.literal("github"),
      repo: exports_external.string().describe("GitHub repository in owner/repo format"),
      ref: exports_external.string().optional().describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
      path: exports_external.string().optional().describe("Path to marketplace.json within repo (defaults to .ur-plugin/marketplace.json)"),
      sparsePaths: exports_external.array(exports_external.string()).optional().describe("Directories to include via git sparse-checkout (cone mode). " + "Use for monorepos where the marketplace lives in a subdirectory. " + 'Example: [".ur-plugin", "plugins"]. ' + "If omitted, the full repository is cloned.")
    }),
    exports_external.object({
      source: exports_external.literal("git"),
      url: exports_external.string().describe("Full git repository URL"),
      ref: exports_external.string().optional().describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
      path: exports_external.string().optional().describe("Path to marketplace.json within repo (defaults to .ur-plugin/marketplace.json)"),
      sparsePaths: exports_external.array(exports_external.string()).optional().describe("Directories to include via git sparse-checkout (cone mode). " + "Use for monorepos where the marketplace lives in a subdirectory. " + 'Example: [".ur-plugin", "plugins"]. ' + "If omitted, the full repository is cloned.")
    }),
    exports_external.object({
      source: exports_external.literal("npm"),
      package: NpmPackageNameSchema().describe("NPM package containing marketplace.json")
    }),
    exports_external.object({
      source: exports_external.literal("file"),
      path: exports_external.string().describe("Local file path to marketplace.json")
    }),
    exports_external.object({
      source: exports_external.literal("directory"),
      path: exports_external.string().describe("Local directory containing .ur-plugin/marketplace.json")
    }),
    exports_external.object({
      source: exports_external.literal("hostPattern"),
      hostPattern: exports_external.string().describe("Regex pattern to match the host/domain extracted from any marketplace source type. " + 'For github sources, matches against "github.com". For git sources (SSH or HTTPS), ' + "extracts the hostname from the URL. Use in strictKnownMarketplaces to allow all " + 'marketplaces from a specific host (e.g., "^github\\.mycompany\\.com$").')
    }),
    exports_external.object({
      source: exports_external.literal("pathPattern"),
      pathPattern: exports_external.string().describe("Regex pattern matched against the .path field of file and directory sources. " + "Use in strictKnownMarketplaces to allow filesystem-based marketplaces alongside " + 'hostPattern restrictions for network sources. Use ".*" to allow all filesystem ' + 'paths, or a narrower pattern (e.g., "^/opt/approved/") to restrict to specific ' + "directories.")
    }),
    exports_external.object({
      source: exports_external.literal("settings"),
      name: MarketplaceNameSchema().refine((name) => !ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(name.toLowerCase()), {
        message: "Reserved official marketplace names cannot be used with settings sources. " + "validateOfficialNameSource only accepts github/git sources from Maitham16/* " + "for these names; a settings source would be rejected after " + "loadAndCacheMarketplace has already written to disk with cleanupNeeded=false."
      }).describe("Marketplace name. Must match the extraKnownMarketplaces key (enforced); " + "the synthetic manifest is written under this name. Same validation " + "as PluginMarketplaceSchema plus reserved-name rejection — " + "validateOfficialNameSource runs after the disk write, too late to clean up."),
      plugins: exports_external.array(SettingsMarketplacePluginSchema()).describe("Plugin entries declared inline in settings.json"),
      owner: PluginAuthorSchema().optional()
    }).describe("Inline marketplace manifest defined directly in settings.json. " + "The reconciler writes a synthetic marketplace.json to the cache; " + "diffMarketplaces detects edits via isEqual on the stored source " + "(the plugins array is inside this object, so edits surface as sourceChanged).")
  ]));
  gitSha = lazySchema(() => exports_external.string().length(40).regex(/^[a-f0-9]{40}$/, "Must be a full 40-character lowercase git commit SHA"));
  PluginSourceSchema = lazySchema(() => exports_external.union([
    RelativePath().describe("Path to the plugin root, relative to the marketplace root (the directory containing .ur-plugin/, not .ur-plugin/ itself)"),
    exports_external.object({
      source: exports_external.literal("npm"),
      package: NpmPackageNameSchema().or(exports_external.string()).describe("Package name (or url, or local path, or anything else that can be passed to `npm` as a package)"),
      version: exports_external.string().optional().describe("Specific version or version range (e.g., ^1.0.0, ~2.1.0)"),
      registry: exports_external.string().url().optional().describe("Custom NPM registry URL (defaults to using system default, likely npmjs.org)")
    }).describe("NPM package as plugin source"),
    exports_external.object({
      source: exports_external.literal("pip"),
      package: exports_external.string().describe("Python package name as it appears on PyPI"),
      version: exports_external.string().optional().describe("Version specifier (e.g., ==1.0.0, >=2.0.0, <3.0.0)"),
      registry: exports_external.string().url().optional().describe("Custom PyPI registry URL (defaults to using system default, likely pypi.org)")
    }).describe("Python package as plugin source"),
    exports_external.object({
      source: exports_external.literal("url"),
      url: exports_external.string().describe("Full git repository URL (https:// or git@)"),
      ref: exports_external.string().optional().describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
      sha: gitSha().optional().describe("Specific commit SHA to use")
    }),
    exports_external.object({
      source: exports_external.literal("github"),
      repo: exports_external.string().describe("GitHub repository in owner/repo format"),
      ref: exports_external.string().optional().describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
      sha: gitSha().optional().describe("Specific commit SHA to use")
    }),
    exports_external.object({
      source: exports_external.literal("git-subdir"),
      url: exports_external.string().describe("Git repository: GitHub owner/repo shorthand, https://, or git@ URL"),
      path: exports_external.string().min(1).describe('Subdirectory within the repo containing the plugin (e.g., "tools/ur-plugin"). ' + "Cloned sparsely using partial clone (--filter=tree:0) to minimize bandwidth for monorepos."),
      ref: exports_external.string().optional().describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
      sha: gitSha().optional().describe("Specific commit SHA to use")
    }).describe("Plugin located in a subdirectory of a larger repository (monorepo). " + "Only the specified subdirectory is materialized; the rest of the repo is not downloaded.")
  ]));
  SettingsMarketplacePluginSchema = lazySchema(() => exports_external.object({
    name: exports_external.string().min(1, "Plugin name cannot be empty").refine((name) => !name.includes(" "), {
      message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")'
    }).describe("Plugin name as it appears in the target repository"),
    source: PluginSourceSchema().describe("Where to fetch the plugin from. Must be a remote source — relative " + "paths have no marketplace repository to resolve against."),
    description: exports_external.string().optional(),
    version: exports_external.string().optional(),
    strict: exports_external.boolean().optional()
  }).refine((p) => typeof p.source !== "string", {
    message: "Plugins in a settings-sourced marketplace must use remote sources " + '(github, git-subdir, npm, url, pip). Relative-path sources like "./foo" ' + "have no marketplace repository to resolve against."
  }));
  PluginMarketplaceEntrySchema = lazySchema(() => PluginManifestSchema().partial().extend({
    name: exports_external.string().min(1, "Plugin name cannot be empty").refine((name) => !name.includes(" "), {
      message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")'
    }).describe("Unique identifier matching the plugin name"),
    source: PluginSourceSchema().describe("Where to fetch the plugin from"),
    category: exports_external.string().optional().describe('Category for organizing plugins (e.g., "productivity", "development")'),
    tags: exports_external.array(exports_external.string()).optional().describe("Tags for searchability and discovery"),
    capabilities: exports_external.array(exports_external.enum([
      "commands",
      "agents",
      "mcp-tools",
      "skills",
      "templates",
      "validators",
      "language-adapters",
      "lsp-servers",
      "hooks"
    ])).optional().describe("High-level extension surfaces this plugin contributes. Used by marketplace discovery to show whether a plugin adds commands, MCP tools, skills, templates, validators, language adapters, LSP servers, agents, or hooks."),
    strict: exports_external.boolean().optional().default(true).describe("Require the plugin manifest to be present in the plugin folder. If false, the marketplace entry provides the manifest.")
  }));
  PluginMarketplaceSchema = lazySchema(() => exports_external.object({
    name: MarketplaceNameSchema(),
    owner: PluginAuthorSchema().describe("Marketplace maintainer or curator information"),
    plugins: exports_external.array(PluginMarketplaceEntrySchema()).describe("Collection of available plugins in this marketplace"),
    forceRemoveDeletedPlugins: exports_external.boolean().optional().describe("When true, plugins removed from this marketplace will be automatically uninstalled and flagged for users"),
    metadata: exports_external.object({
      pluginRoot: exports_external.string().optional().describe("Base path for relative plugin sources"),
      version: exports_external.string().optional().describe("Marketplace version"),
      description: exports_external.string().optional().describe("Marketplace description")
    }).optional().describe("Optional marketplace metadata"),
    allowCrossMarketplaceDependenciesOn: exports_external.array(exports_external.string()).optional().describe("Marketplace names whose plugins may be auto-installed as dependencies. Only the root marketplace's allowlist applies — no transitive trust.")
  }));
  PluginIdSchema = lazySchema(() => exports_external.string().regex(/^[a-z0-9][-a-z0-9._]*@[a-z0-9][-a-z0-9._]*$/i, "Plugin ID must be in format: plugin@marketplace"));
  DEP_REF_REGEX = /^[a-z0-9][-a-z0-9._]*(@[a-z0-9][-a-z0-9._]*)?(@\^[^@]*)?$/i;
  DependencyRefSchema = lazySchema(() => exports_external.union([
    exports_external.string().regex(DEP_REF_REGEX, "Dependency must be a plugin name, optionally qualified with @marketplace").transform((s) => s.replace(/@\^[^@]*$/, "")),
    exports_external.object({
      name: exports_external.string().min(1).regex(/^[a-z0-9][-a-z0-9._]*$/i),
      marketplace: exports_external.string().min(1).regex(/^[a-z0-9][-a-z0-9._]*$/i).optional()
    }).loose().transform((o) => o.marketplace ? `${o.name}@${o.marketplace}` : o.name)
  ]));
  SettingsPluginEntrySchema = lazySchema(() => exports_external.union([
    PluginIdSchema(),
    exports_external.object({
      id: PluginIdSchema().describe('Plugin identifier (e.g., "formatter@tools")'),
      version: exports_external.string().optional().describe('Version constraint (e.g., "^2.0.0")'),
      required: exports_external.boolean().optional().describe("If true, cannot be disabled"),
      config: exports_external.record(exports_external.string(), exports_external.unknown()).optional().describe("Plugin-specific configuration")
    })
  ]));
  InstalledPluginSchema = lazySchema(() => exports_external.object({
    version: exports_external.string().describe("Currently installed version"),
    installedAt: exports_external.string().describe("ISO 8601 timestamp of installation"),
    lastUpdated: exports_external.string().optional().describe("ISO 8601 timestamp of last update"),
    installPath: exports_external.string().describe("Absolute path to the installed plugin directory"),
    gitCommitSha: exports_external.string().optional().describe("Git commit SHA for git-based plugins (for version tracking)")
  }));
  InstalledPluginsFileSchemaV1 = lazySchema(() => exports_external.object({
    version: exports_external.literal(1).describe("Schema version 1"),
    plugins: exports_external.record(PluginIdSchema(), InstalledPluginSchema()).describe("Map of plugin IDs to their installation metadata")
  }));
  PluginScopeSchema = lazySchema(() => exports_external.enum(["managed", "user", "project", "local"]));
  PluginInstallationEntrySchema = lazySchema(() => exports_external.object({
    scope: PluginScopeSchema().describe("Installation scope"),
    projectPath: exports_external.string().optional().describe("Project path (required for project/local scopes)"),
    installPath: exports_external.string().describe("Absolute path to the versioned plugin directory"),
    version: exports_external.string().optional().describe("Currently installed version"),
    installedAt: exports_external.string().optional().describe("ISO 8601 timestamp of installation"),
    lastUpdated: exports_external.string().optional().describe("ISO 8601 timestamp of last update"),
    gitCommitSha: exports_external.string().optional().describe("Git commit SHA for git-based plugins")
  }));
  InstalledPluginsFileSchemaV2 = lazySchema(() => exports_external.object({
    version: exports_external.literal(2).describe("Schema version 2"),
    plugins: exports_external.record(PluginIdSchema(), exports_external.array(PluginInstallationEntrySchema())).describe("Map of plugin IDs to arrays of installation entries")
  }));
  InstalledPluginsFileSchema = lazySchema(() => exports_external.union([InstalledPluginsFileSchemaV1(), InstalledPluginsFileSchemaV2()]));
  KnownMarketplaceSchema = lazySchema(() => exports_external.object({
    source: MarketplaceSourceSchema().describe("Where to fetch the marketplace from"),
    installLocation: exports_external.string().describe("Local cache path where marketplace manifest is stored"),
    lastUpdated: exports_external.string().describe("ISO 8601 timestamp of last marketplace refresh"),
    autoUpdate: exports_external.boolean().optional().describe("Whether to automatically update this marketplace and its installed plugins on startup")
  }));
  KnownMarketplacesFileSchema = lazySchema(() => exports_external.record(exports_external.string(), KnownMarketplaceSchema()));
});

// src/services/mcp/normalization.ts
function normalizeNameForMCP(name) {
  let normalized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (name.startsWith(URAI_SERVER_PREFIX)) {
    normalized = normalized.replace(/_+/g, "_").replace(/^_|_$/g, "");
  }
  return normalized;
}
var URAI_SERVER_PREFIX = "ur.ai ";
var init_normalization = () => {};

// src/services/mcp/mcpStringUtils.ts
function mcpInfoFromString(toolString) {
  const parts = toolString.split("__");
  const [mcpPart, serverName, ...toolNameParts] = parts;
  if (mcpPart !== "mcp" || !serverName) {
    return null;
  }
  const toolName = toolNameParts.length > 0 ? toolNameParts.join("__") : undefined;
  return { serverName, toolName };
}
function getMcpPrefix(serverName) {
  return `mcp__${normalizeNameForMCP(serverName)}__`;
}
function buildMcpToolName(serverName, toolName) {
  return `${getMcpPrefix(serverName)}${normalizeNameForMCP(toolName)}`;
}
function getToolNameForPermissionCheck(tool) {
  return tool.mcpInfo ? buildMcpToolName(tool.mcpInfo.serverName, tool.mcpInfo.toolName) : tool.name;
}
function getMcpDisplayName(fullName, serverName) {
  const prefix = `mcp__${normalizeNameForMCP(serverName)}__`;
  return fullName.replace(prefix, "");
}
function extractMcpToolDisplayName(userFacingName) {
  let withoutSuffix = userFacingName.replace(/\s*\(MCP\)\s*$/, "");
  withoutSuffix = withoutSuffix.trim();
  const dashIndex = withoutSuffix.indexOf(" - ");
  if (dashIndex !== -1) {
    const displayName = withoutSuffix.substring(dashIndex + 3).trim();
    return displayName;
  }
  return withoutSuffix;
}
var init_mcpStringUtils = __esm(() => {
  init_normalization();
});

// src/tools/AgentTool/constants.ts
var AGENT_TOOL_NAME = "Agent", LEGACY_AGENT_TOOL_NAME = "Task", VERIFICATION_AGENT_TYPE = "verification", ONE_SHOT_BUILTIN_AGENT_TYPES;
var init_constants2 = __esm(() => {
  ONE_SHOT_BUILTIN_AGENT_TYPES = new Set([
    "Explore",
    "Plan"
  ]);
});

// src/tools/TaskOutputTool/constants.ts
var TASK_OUTPUT_TOOL_NAME = "TaskOutput";
var init_constants3 = () => {};

// src/tools/TaskStopTool/prompt.ts
var TASK_STOP_TOOL_NAME = "TaskStop", DESCRIPTION = `
- Stops a running background task by its ID
- Takes a task_id parameter identifying the task to stop
- Returns a success or failure status
- Use this tool when you need to terminate a long-running task
`;
var init_prompt = () => {};

// src/utils/permissions/permissionRuleParser.ts
function normalizeLegacyToolName(name) {
  return LEGACY_TOOL_NAME_ALIASES[name] ?? name;
}
function getLegacyToolNames(canonicalName) {
  const result = [];
  for (const [legacy, canonical] of Object.entries(LEGACY_TOOL_NAME_ALIASES)) {
    if (canonical === canonicalName)
      result.push(legacy);
  }
  return result;
}
function escapeRuleContent(content) {
  return content.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function unescapeRuleContent(content) {
  return content.replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");
}
function permissionRuleValueFromString(ruleString) {
  const openParenIndex = findFirstUnescapedChar(ruleString, "(");
  if (openParenIndex === -1) {
    return { toolName: normalizeLegacyToolName(ruleString) };
  }
  const closeParenIndex = findLastUnescapedChar(ruleString, ")");
  if (closeParenIndex === -1 || closeParenIndex <= openParenIndex) {
    return { toolName: normalizeLegacyToolName(ruleString) };
  }
  if (closeParenIndex !== ruleString.length - 1) {
    return { toolName: normalizeLegacyToolName(ruleString) };
  }
  const toolName = ruleString.substring(0, openParenIndex);
  const rawContent = ruleString.substring(openParenIndex + 1, closeParenIndex);
  if (!toolName) {
    return { toolName: normalizeLegacyToolName(ruleString) };
  }
  if (rawContent === "" || rawContent === "*") {
    return { toolName: normalizeLegacyToolName(toolName) };
  }
  const ruleContent = unescapeRuleContent(rawContent);
  return { toolName: normalizeLegacyToolName(toolName), ruleContent };
}
function permissionRuleValueToString(ruleValue) {
  if (!ruleValue.ruleContent) {
    return ruleValue.toolName;
  }
  const escapedContent = escapeRuleContent(ruleValue.ruleContent);
  return `${ruleValue.toolName}(${escapedContent})`;
}
function findFirstUnescapedChar(str, char) {
  for (let i = 0;i < str.length; i++) {
    if (str[i] === char) {
      let backslashCount = 0;
      let j = i - 1;
      while (j >= 0 && str[j] === "\\") {
        backslashCount++;
        j--;
      }
      if (backslashCount % 2 === 0) {
        return i;
      }
    }
  }
  return -1;
}
function findLastUnescapedChar(str, char) {
  for (let i = str.length - 1;i >= 0; i--) {
    if (str[i] === char) {
      let backslashCount = 0;
      let j = i - 1;
      while (j >= 0 && str[j] === "\\") {
        backslashCount++;
        j--;
      }
      if (backslashCount % 2 === 0) {
        return i;
      }
    }
  }
  return -1;
}
var LEGACY_TOOL_NAME_ALIASES;
var init_permissionRuleParser = __esm(() => {
  init_constants2();
  init_constants3();
  init_prompt();
  LEGACY_TOOL_NAME_ALIASES = {
    Task: AGENT_TOOL_NAME,
    KillShell: TASK_STOP_TOOL_NAME,
    AgentOutputTool: TASK_OUTPUT_TOOL_NAME,
    BashOutputTool: TASK_OUTPUT_TOOL_NAME,
    ...{}
  };
});

// src/utils/settings/toolValidationConfig.ts
function isFilePatternTool(toolName) {
  return TOOL_VALIDATION_CONFIG.filePatternTools.includes(toolName);
}
function isBashPrefixTool(toolName) {
  return TOOL_VALIDATION_CONFIG.bashPrefixTools.includes(toolName);
}
function getCustomValidation(toolName) {
  return TOOL_VALIDATION_CONFIG.customValidation[toolName];
}
var TOOL_VALIDATION_CONFIG;
var init_toolValidationConfig = __esm(() => {
  TOOL_VALIDATION_CONFIG = {
    filePatternTools: [
      "Read",
      "Write",
      "Edit",
      "Glob",
      "NotebookRead",
      "NotebookEdit"
    ],
    bashPrefixTools: ["Bash"],
    customValidation: {
      WebSearch: (content) => {
        if (content.includes("*") || content.includes("?")) {
          return {
            valid: false,
            error: "WebSearch does not support wildcards",
            suggestion: "Use exact search terms without * or ?",
            examples: ["WebSearch(ur ai)", "WebSearch(typescript tutorial)"]
          };
        }
        return { valid: true };
      },
      WebFetch: (content) => {
        if (content.includes("://") || content.startsWith("http")) {
          return {
            valid: false,
            error: "WebFetch permissions use domain format, not URLs",
            suggestion: 'Use "domain:hostname" format',
            examples: [
              "WebFetch(domain:example.com)",
              "WebFetch(domain:github.com)"
            ]
          };
        }
        if (!content.startsWith("domain:")) {
          return {
            valid: false,
            error: 'WebFetch permissions must use "domain:" prefix',
            suggestion: 'Use "domain:hostname" format',
            examples: [
              "WebFetch(domain:example.com)",
              "WebFetch(domain:*.google.com)"
            ]
          };
        }
        return { valid: true };
      }
    }
  };
});

// src/utils/settings/permissionValidation.ts
function isEscaped(str, index) {
  let backslashCount = 0;
  let j = index - 1;
  while (j >= 0 && str[j] === "\\") {
    backslashCount++;
    j--;
  }
  return backslashCount % 2 !== 0;
}
function countUnescapedChar(str, char) {
  let count2 = 0;
  for (let i = 0;i < str.length; i++) {
    if (str[i] === char && !isEscaped(str, i)) {
      count2++;
    }
  }
  return count2;
}
function hasUnescapedEmptyParens(str) {
  for (let i = 0;i < str.length - 1; i++) {
    if (str[i] === "(" && str[i + 1] === ")") {
      if (!isEscaped(str, i)) {
        return true;
      }
    }
  }
  return false;
}
function validatePermissionRule(rule) {
  if (!rule || rule.trim() === "") {
    return { valid: false, error: "Permission rule cannot be empty" };
  }
  const openCount = countUnescapedChar(rule, "(");
  const closeCount = countUnescapedChar(rule, ")");
  if (openCount !== closeCount) {
    return {
      valid: false,
      error: "Mismatched parentheses",
      suggestion: "Ensure all opening parentheses have matching closing parentheses"
    };
  }
  if (hasUnescapedEmptyParens(rule)) {
    const toolName = rule.substring(0, rule.indexOf("("));
    if (!toolName) {
      return {
        valid: false,
        error: "Empty parentheses with no tool name",
        suggestion: "Specify a tool name before the parentheses"
      };
    }
    return {
      valid: false,
      error: "Empty parentheses",
      suggestion: `Either specify a pattern or use just "${toolName}" without parentheses`,
      examples: [`${toolName}`, `${toolName}(some-pattern)`]
    };
  }
  const parsed = permissionRuleValueFromString(rule);
  const mcpInfo = mcpInfoFromString(parsed.toolName);
  if (mcpInfo) {
    if (parsed.ruleContent !== undefined || countUnescapedChar(rule, "(") > 0) {
      return {
        valid: false,
        error: "MCP rules do not support patterns in parentheses",
        suggestion: `Use "${parsed.toolName}" without parentheses, or use "mcp__${mcpInfo.serverName}__*" for all tools`,
        examples: [
          `mcp__${mcpInfo.serverName}`,
          `mcp__${mcpInfo.serverName}__*`,
          mcpInfo.toolName && mcpInfo.toolName !== "*" ? `mcp__${mcpInfo.serverName}__${mcpInfo.toolName}` : undefined
        ].filter(Boolean)
      };
    }
    return { valid: true };
  }
  if (!parsed.toolName || parsed.toolName.length === 0) {
    return { valid: false, error: "Tool name cannot be empty" };
  }
  if (parsed.toolName[0] !== parsed.toolName[0]?.toUpperCase()) {
    return {
      valid: false,
      error: "Tool names must start with uppercase",
      suggestion: `Use "${capitalize(String(parsed.toolName))}"`
    };
  }
  const customValidation = getCustomValidation(parsed.toolName);
  if (customValidation && parsed.ruleContent !== undefined) {
    const customResult = customValidation(parsed.ruleContent);
    if (!customResult.valid) {
      return customResult;
    }
  }
  if (isBashPrefixTool(parsed.toolName) && parsed.ruleContent !== undefined) {
    const content = parsed.ruleContent;
    if (content.includes(":*") && !content.endsWith(":*")) {
      return {
        valid: false,
        error: "The :* pattern must be at the end",
        suggestion: "Move :* to the end for prefix matching, or use * for wildcard matching",
        examples: [
          "Bash(npm run:*) - prefix matching (legacy)",
          "Bash(npm run *) - wildcard matching"
        ]
      };
    }
    if (content === ":*") {
      return {
        valid: false,
        error: "Prefix cannot be empty before :*",
        suggestion: "Specify a command prefix before :*",
        examples: ["Bash(npm:*)", "Bash(git:*)"]
      };
    }
  }
  if (isFilePatternTool(parsed.toolName) && parsed.ruleContent !== undefined) {
    const content = parsed.ruleContent;
    if (content.includes(":*")) {
      return {
        valid: false,
        error: 'The ":*" syntax is only for Bash prefix rules',
        suggestion: 'Use glob patterns like "*" or "**" for file matching',
        examples: [
          `${parsed.toolName}(*.ts) - matches .ts files`,
          `${parsed.toolName}(src/**) - matches all files in src`,
          `${parsed.toolName}(**/*.test.ts) - matches test files`
        ]
      };
    }
    if (content.includes("*") && !content.match(/^\*|\*$|\*\*|\/\*|\*\.|\*\)/) && !content.includes("**")) {
      return {
        valid: false,
        error: "Wildcard placement might be incorrect",
        suggestion: "Wildcards are typically used at path boundaries",
        examples: [
          `${parsed.toolName}(*.js) - all .js files`,
          `${parsed.toolName}(src/*) - all files directly in src`,
          `${parsed.toolName}(src/**) - all files recursively in src`
        ]
      };
    }
  }
  return { valid: true };
}
var PermissionRuleSchema;
var init_permissionValidation = __esm(() => {
  init_v4();
  init_mcpStringUtils();
  init_lazySchema();
  init_permissionRuleParser();
  init_stringUtils();
  init_toolValidationConfig();
  PermissionRuleSchema = lazySchema(() => exports_external.string().superRefine((val, ctx) => {
    const result = validatePermissionRule(val);
    if (!result.valid) {
      let message = result.error;
      if (result.suggestion) {
        message += `. ${result.suggestion}`;
      }
      if (result.examples && result.examples.length > 0) {
        message += `. Examples: ${result.examples.join(", ")}`;
      }
      ctx.addIssue({
        code: exports_external.ZodIssueCode.custom,
        message,
        params: { received: val }
      });
    }
  }));
});

// src/utils/settings/types.ts
function isMcpServerNameEntry(entry) {
  return "serverName" in entry && entry.serverName !== undefined;
}
function isMcpServerCommandEntry(entry) {
  return "serverCommand" in entry && entry.serverCommand !== undefined;
}
function isMcpServerUrlEntry(entry) {
  return "serverUrl" in entry && entry.serverUrl !== undefined;
}
var EnvironmentVariablesSchema, PermissionsSchema, ExtraKnownMarketplaceSchema, AllowedMcpServerEntrySchema, DeniedMcpServerEntrySchema, CUSTOMIZATION_SURFACES, PROVIDER_SETTING_IDS, NonSecretPreferenceSchema, SettingsSchema;
var init_types2 = __esm(() => {
  init_v4();
  init_sandboxTypes();
  init_envUtils();
  init_lazySchema();
  init_PermissionMode();
  init_schemas();
  init_constants();
  init_permissionValidation();
  init_hooks();
  init_hooks();
  init_array();
  EnvironmentVariablesSchema = lazySchema(() => exports_external.record(exports_external.string(), exports_external.coerce.string()));
  PermissionsSchema = lazySchema(() => exports_external.object({
    allow: exports_external.array(PermissionRuleSchema()).optional().describe("List of permission rules for allowed operations"),
    deny: exports_external.array(PermissionRuleSchema()).optional().describe("List of permission rules for denied operations"),
    ask: exports_external.array(PermissionRuleSchema()).optional().describe("List of permission rules that should always prompt for confirmation"),
    defaultMode: exports_external.enum(EXTERNAL_PERMISSION_MODES).optional().describe("Default permission mode when UR needs access"),
    disableBypassPermissionsMode: exports_external.enum(["disable"]).optional().describe("Disable the ability to bypass permission prompts"),
    ...{},
    additionalDirectories: exports_external.array(exports_external.string()).optional().describe("Additional directories to include in the permission scope")
  }).passthrough());
  ExtraKnownMarketplaceSchema = lazySchema(() => exports_external.object({
    source: MarketplaceSourceSchema().describe("Where to fetch the marketplace from"),
    installLocation: exports_external.string().optional().describe("Local cache path where marketplace manifest is stored (auto-generated if not provided)"),
    autoUpdate: exports_external.boolean().optional().describe("Whether to automatically update this marketplace and its installed plugins on startup")
  }));
  AllowedMcpServerEntrySchema = lazySchema(() => exports_external.object({
    serverName: exports_external.string().regex(/^[a-zA-Z0-9_-]+$/, "Server name can only contain letters, numbers, hyphens, and underscores").optional().describe("Name of the MCP server that users are allowed to configure"),
    serverCommand: exports_external.array(exports_external.string()).min(1, "Server command must have at least one element (the command)").optional().describe("Command array [command, ...args] to match exactly for allowed stdio servers"),
    serverUrl: exports_external.string().optional().describe('URL pattern with wildcard support (e.g., "https://*.example.com/*") for allowed remote MCP servers')
  }).refine((data) => {
    const defined = count([
      data.serverName !== undefined,
      data.serverCommand !== undefined,
      data.serverUrl !== undefined
    ], Boolean);
    return defined === 1;
  }, {
    message: 'Entry must have exactly one of "serverName", "serverCommand", or "serverUrl"'
  }));
  DeniedMcpServerEntrySchema = lazySchema(() => exports_external.object({
    serverName: exports_external.string().regex(/^[a-zA-Z0-9_-]+$/, "Server name can only contain letters, numbers, hyphens, and underscores").optional().describe("Name of the MCP server that is explicitly blocked"),
    serverCommand: exports_external.array(exports_external.string()).min(1, "Server command must have at least one element (the command)").optional().describe("Command array [command, ...args] to match exactly for blocked stdio servers"),
    serverUrl: exports_external.string().optional().describe('URL pattern with wildcard support (e.g., "https://*.example.com/*") for blocked remote MCP servers')
  }).refine((data) => {
    const defined = count([
      data.serverName !== undefined,
      data.serverCommand !== undefined,
      data.serverUrl !== undefined
    ], Boolean);
    return defined === 1;
  }, {
    message: 'Entry must have exactly one of "serverName", "serverCommand", or "serverUrl"'
  }));
  CUSTOMIZATION_SURFACES = [
    "skills",
    "agents",
    "hooks",
    "mcp"
  ];
  PROVIDER_SETTING_IDS = [
    "codex-cli",
    "claude-code-cli",
    "gemini-cli",
    "antigravity-cli",
    "openai-api",
    "anthropic-api",
    "gemini-api",
    "openrouter",
    "openai-compatible",
    "ollama",
    "lmstudio",
    "llama.cpp",
    "vllm"
  ];
  NonSecretPreferenceSchema = exports_external.union([
    exports_external.string(),
    exports_external.number(),
    exports_external.boolean()
  ]);
  SettingsSchema = lazySchema(() => exports_external.object({
    $schema: exports_external.literal(UR_CODE_SETTINGS_SCHEMA_URL).optional().describe("JSON Schema reference for UR settings"),
    apiKeyHelper: exports_external.string().optional().describe("Path to a script that outputs authentication values"),
    awsCredentialExport: exports_external.string().optional().describe("Path to a script that exports AWS credentials"),
    awsAuthRefresh: exports_external.string().optional().describe("Path to a script that refreshes AWS authentication"),
    gcpAuthRefresh: exports_external.string().optional().describe("Command to refresh GCP authentication (e.g., gcloud auth application-default login)"),
    ...isEnvTruthy(process.env.UR_CODE_ENABLE_XAA) ? {
      xaaIdp: exports_external.object({
        issuer: exports_external.string().url().describe("IdP issuer URL for OIDC discovery"),
        clientId: exports_external.string().describe("UR's client_id registered at the IdP"),
        callbackPort: exports_external.number().int().positive().optional().describe("Fixed loopback callback port for the IdP OIDC login. " + "Only needed if the IdP does not honor RFC 8252 port-any matching.")
      }).optional().describe("XAA (SEP-990) IdP connection. Configure once; all XAA-enabled MCP servers reuse this.")
    } : {},
    fileSuggestion: exports_external.object({
      type: exports_external.literal("command"),
      command: exports_external.string()
    }).optional().describe("Custom file suggestion configuration for @ mentions"),
    respectGitignore: exports_external.boolean().optional().describe("Whether file picker should respect .gitignore files (default: true). " + "Note: .ignore files are always respected."),
    cleanupPeriodDays: exports_external.number().nonnegative().int().optional().describe("Number of days to retain chat transcripts (default: 30). Setting to 0 disables session persistence entirely: no transcripts are written and existing transcripts are deleted at startup."),
    env: EnvironmentVariablesSchema().optional().describe("Environment variables to set for UR sessions"),
    attribution: exports_external.object({
      commit: exports_external.string().optional().describe("Attribution text for git commits, including any trailers. " + "Empty string hides attribution."),
      pr: exports_external.string().optional().describe("Attribution text for pull request descriptions. " + "Empty string hides attribution.")
    }).optional().describe("Customize attribution text for commits and PRs. " + "Each field defaults to the standard UR attribution if not set."),
    includeCoAuthoredBy: exports_external.boolean().optional().describe("Deprecated: Use attribution instead. " + "Whether to include UR's co-authored by attribution in commits and PRs (defaults to true)"),
    includeGitInstructions: exports_external.boolean().optional().describe("Include built-in commit and PR workflow instructions in UR's system prompt (default: true)"),
    permissions: PermissionsSchema().optional().describe("Tool usage permissions configuration"),
    model: exports_external.string().optional().describe("Override the default model used by UR"),
    provider: exports_external.object({
      active: exports_external.enum(PROVIDER_SETTING_IDS).optional().describe("Active legal model provider adapter"),
      model: exports_external.string().optional().describe("Selected model name for the active provider"),
      baseUrl: exports_external.string().optional().describe("Provider base URL without embedded credentials"),
      timeoutMs: exports_external.number().int().positive().optional().describe("Provider HTTP request timeout in milliseconds. Defaults to 120000."),
      commandPath: exports_external.string().optional().describe("Explicit official CLI executable path for subscription providers"),
      fallback: exports_external.union([exports_external.enum(PROVIDER_SETTING_IDS), exports_external.literal("disabled")]).optional().describe("Optional fallback provider; UR asks before using it"),
      preferences: exports_external.record(exports_external.string(), NonSecretPreferenceSchema).optional().describe("Non-secret provider preferences only")
    }).optional().describe("Legal provider configuration; credentials must stay in environment variables or official CLIs"),
    availableModels: exports_external.array(exports_external.string()).optional().describe("Allowlist of models that users can select. " + "Accepts exact provider-scoped model IDs and provider-specific aliases. " + "If undefined, all models are available. If empty array, only the default model is available. " + "Typically set in managed settings by enterprise administrators."),
    modelOverrides: exports_external.record(exports_external.string(), exports_external.string()).optional().describe("Override mapping from an existing model ID to a provider-specific " + "model ID. Typically set in managed settings by " + "enterprise administrators."),
    enableAllProjectMcpServers: exports_external.boolean().optional().describe("Whether to automatically approve all MCP servers in the project"),
    enabledMcpjsonServers: exports_external.array(exports_external.string()).optional().describe("List of approved MCP servers from .mcp.json"),
    disabledMcpjsonServers: exports_external.array(exports_external.string()).optional().describe("List of rejected MCP servers from .mcp.json"),
    allowedMcpServers: exports_external.array(AllowedMcpServerEntrySchema()).optional().describe("Enterprise allowlist of MCP servers that can be used. " + "Applies to all scopes including enterprise servers from managed-mcp.json. " + "If undefined, all servers are allowed. If empty array, no servers are allowed. " + "Denylist takes precedence - if a server is on both lists, it is denied."),
    deniedMcpServers: exports_external.array(DeniedMcpServerEntrySchema()).optional().describe("Enterprise denylist of MCP servers that are explicitly blocked. " + "If a server is on the denylist, it will be blocked across all scopes including enterprise. " + "Denylist takes precedence over allowlist - if a server is on both lists, it is denied."),
    hooks: HooksSchema().optional().describe("Custom commands to run before/after tool executions"),
    worktree: exports_external.object({
      symlinkDirectories: exports_external.array(exports_external.string()).optional().describe("Directories to symlink from main repository to worktrees to avoid disk bloat. " + "Must be explicitly configured - no directories are symlinked by default. " + 'Common examples: "node_modules", ".cache", ".bin"'),
      sparsePaths: exports_external.array(exports_external.string()).optional().describe("Directories to include when creating worktrees, via git sparse-checkout (cone mode). " + "Dramatically faster in large monorepos — only the listed paths are written to disk.")
    }).optional().describe("Git worktree configuration for --worktree flag."),
    disableAllHooks: exports_external.boolean().optional().describe("Disable all hooks and statusLine execution"),
    defaultShell: exports_external.enum(["bash", "powershell"]).optional().describe("Default shell for input-box ! commands. " + "Defaults to 'bash' on all platforms (no Windows auto-flip)."),
    allowManagedHooksOnly: exports_external.boolean().optional().describe("When true (and set in managed settings), only hooks from managed settings run. " + "User, project, and local hooks are ignored."),
    allowedHttpHookUrls: exports_external.array(exports_external.string()).optional().describe("Allowlist of URL patterns that HTTP hooks may target. " + 'Supports * as a wildcard (e.g. "https://hooks.example.com/*"). ' + "When set, HTTP hooks with non-matching URLs are blocked. " + "If undefined, all URLs are allowed. If empty array, no HTTP hooks are allowed. " + "Arrays merge across settings sources (same semantics as allowedMcpServers)."),
    httpHookAllowedEnvVars: exports_external.array(exports_external.string()).optional().describe("Allowlist of environment variable names HTTP hooks may interpolate into headers. " + "When set, each hook's effective allowedEnvVars is the intersection with this list. " + "If undefined, no restriction is applied. " + "Arrays merge across settings sources (same semantics as allowedMcpServers)."),
    allowManagedPermissionRulesOnly: exports_external.boolean().optional().describe("When true (and set in managed settings), only permission rules (allow/deny/ask) from managed settings are respected. " + "User, project, local, and CLI argument permission rules are ignored."),
    allowManagedMcpServersOnly: exports_external.boolean().optional().describe("When true (and set in managed settings), allowedMcpServers is only read from managed settings. " + "deniedMcpServers still merges from all sources, so users can deny servers for themselves. " + "Users can still add their own MCP servers, but only the admin-defined allowlist applies."),
    strictPluginOnlyCustomization: exports_external.preprocess((v) => Array.isArray(v) ? v.filter((x) => CUSTOMIZATION_SURFACES.includes(x)) : v, exports_external.union([exports_external.boolean(), exports_external.array(exports_external.enum(CUSTOMIZATION_SURFACES))])).optional().catch(undefined).describe("When set in managed settings, blocks non-plugin customization sources for the listed surfaces. " + 'Array form locks specific surfaces (e.g. ["skills", "hooks"]); `true` locks all four; `false` is an explicit no-op. ' + "Blocked: ~/.ur/{surface}/, .ur/{surface}/ (project), settings.json hooks, .mcp.json. " + "NOT blocked: managed (policySettings) sources, plugin-provided customizations. " + "Composes with strictKnownMarketplaces for end-to-end admin control — plugins gated by " + "marketplace allowlist, everything else blocked here."),
    statusLine: exports_external.object({
      type: exports_external.literal("command"),
      command: exports_external.string(),
      padding: exports_external.number().optional()
    }).optional().describe("Custom status line display configuration"),
    enabledPlugins: exports_external.record(exports_external.string(), exports_external.union([exports_external.array(exports_external.string()), exports_external.boolean(), exports_external.undefined()])).optional().describe('Enabled plugins using plugin-id@marketplace-id format. Example: { "formatter@urhq-tools": true }. Also supports extended format with version constraints.'),
    extraKnownMarketplaces: exports_external.record(exports_external.string(), ExtraKnownMarketplaceSchema()).check((ctx) => {
      for (const [key, entry] of Object.entries(ctx.value)) {
        if (entry.source.source === "settings" && entry.source.name !== key) {
          ctx.issues.push({
            code: "custom",
            input: entry.source.name,
            path: [key, "source", "name"],
            message: `Settings-sourced marketplace name must match its extraKnownMarketplaces key ` + `(got key "${key}" but source.name "${entry.source.name}")`
          });
        }
      }
    }).optional().describe("Additional marketplaces to make available for this repository. Typically used in repository .ur/settings.json to ensure team members have required plugin sources."),
    strictKnownMarketplaces: exports_external.array(MarketplaceSourceSchema()).optional().describe("Enterprise strict list of allowed marketplace sources. When set in managed settings, " + "ONLY these exact sources can be added as marketplaces. The check happens BEFORE " + "downloading, so blocked sources never touch the filesystem. " + "Note: this is a policy gate only — it does NOT register marketplaces. " + "To pre-register allowed marketplaces for users, also set extraKnownMarketplaces."),
    blockedMarketplaces: exports_external.array(MarketplaceSourceSchema()).optional().describe("Enterprise blocklist of marketplace sources. When set in managed settings, " + "these exact sources are blocked from being added as marketplaces. The check happens BEFORE " + "downloading, so blocked sources never touch the filesystem."),
    forceLoginMethod: exports_external.enum(["urai", "console"]).optional().describe('Force a specific login method: "urai" for UR Pro/Max, "console" for Console billing'),
    forceLoginOrgUUID: exports_external.string().optional().describe("Organization UUID to use for OAuth login"),
    otelHeadersHelper: exports_external.string().optional().describe("Path to a script that outputs OpenTelemetry headers"),
    outputStyle: exports_external.string().optional().describe("Controls the output style for assistant responses"),
    language: exports_external.string().optional().describe('Preferred language for UR responses and voice dictation (e.g., "japanese", "spanish")'),
    skipWebFetchPreflight: exports_external.boolean().optional().describe("Skip the WebFetch blocklist check for enterprise environments with restrictive security policies"),
    sandbox: SandboxSettingsSchema().optional(),
    feedbackSurveyRate: exports_external.number().min(0).max(1).optional().describe("Probability (0–1) that the session quality survey appears when eligible. 0.05 is a reasonable starting point."),
    spinnerTipsEnabled: exports_external.boolean().optional().describe("Whether to show tips in the spinner"),
    spinnerVerbs: exports_external.object({
      mode: exports_external.enum(["append", "replace"]),
      verbs: exports_external.array(exports_external.string())
    }).optional().describe('Customize spinner verbs. mode: "append" adds verbs to defaults, "replace" uses only your verbs.'),
    spinnerTipsOverride: exports_external.object({
      excludeDefault: exports_external.boolean().optional(),
      tips: exports_external.array(exports_external.string())
    }).optional().describe("Override spinner tips. tips: array of tip strings. excludeDefault: if true, only show custom tips (default: false)."),
    syntaxHighlightingDisabled: exports_external.boolean().optional().describe("Whether to disable syntax highlighting in diffs"),
    terminalTitleFromRename: exports_external.boolean().optional().describe("Whether /rename updates the terminal tab title (defaults to true). Set to false to keep auto-generated topic titles."),
    alwaysThinkingEnabled: exports_external.boolean().optional().describe("When false, thinking is disabled. When absent or true, thinking is " + "enabled automatically for supported models."),
    effortLevel: exports_external.enum(process.env.USER_TYPE === "ant" ? ["low", "medium", "high", "max"] : ["low", "medium", "high"]).optional().catch(undefined).describe("Persisted effort level for supported models."),
    advisorModel: exports_external.string().optional().describe("Advisor model for the server-side advisor tool."),
    fastMode: exports_external.boolean().optional().describe("When true, fast mode is enabled. When absent or false, fast mode is off."),
    fastModePerSessionOptIn: exports_external.boolean().optional().describe("When true, fast mode does not persist across sessions. Each session starts with fast mode off."),
    promptSuggestionEnabled: exports_external.boolean().optional().describe("When false, prompt suggestions are disabled. When absent or true, " + "prompt suggestions are enabled."),
    showClearContextOnPlanAccept: exports_external.boolean().optional().describe('When true, the plan-approval dialog offers a "clear context" option. Defaults to false.'),
    agent: exports_external.string().optional().describe("Name of an agent (built-in or custom) to use for the main thread. " + "Applies the agent's system prompt, tool restrictions, and model."),
    companyAnnouncements: exports_external.array(exports_external.string()).optional().describe("Company announcements to display at startup (one will be randomly selected if multiple are provided)"),
    pluginConfigs: exports_external.record(exports_external.string(), exports_external.object({
      mcpServers: exports_external.record(exports_external.string(), exports_external.record(exports_external.string(), exports_external.union([
        exports_external.string(),
        exports_external.number(),
        exports_external.boolean(),
        exports_external.array(exports_external.string())
      ]))).optional().describe("User configuration values for MCP servers keyed by server name"),
      options: exports_external.record(exports_external.string(), exports_external.union([
        exports_external.string(),
        exports_external.number(),
        exports_external.boolean(),
        exports_external.array(exports_external.string())
      ])).optional().describe("Non-sensitive option values from plugin manifest userConfig, keyed by option name. Sensitive values go to secure storage instead.")
    })).optional().describe("Per-plugin configuration including MCP server user configs, keyed by plugin ID (plugin@marketplace format)"),
    remote: exports_external.object({
      defaultEnvironmentId: exports_external.string().optional().describe("Default environment ID to use for remote sessions")
    }).optional().describe("Remote session configuration"),
    autoUpdatesChannel: exports_external.enum(["latest", "stable"]).optional().describe("Release channel for auto-updates (latest or stable)"),
    ...{},
    minimumVersion: exports_external.string().optional().describe("Minimum version to stay on - prevents downgrades when switching to stable channel"),
    plansDirectory: exports_external.string().optional().describe("Custom directory for plan files, relative to project root. " + "If not set, defaults to ~/.ur/plans/"),
    ...process.env.USER_TYPE === "ant" ? {
      classifierPermissionsEnabled: exports_external.boolean().optional().describe("Enable AI-based classification for Bash(prompt:...) permission rules")
    } : {},
    ...{},
    ...{},
    ...{},
    channelsEnabled: exports_external.boolean().optional().describe("Teams/Enterprise opt-in for channel notifications (MCP servers with the " + "ur/channel capability pushing inbound messages). Default off. " + "Set true to allow; users then select servers via --channels."),
    allowedChannelPlugins: exports_external.array(exports_external.object({
      marketplace: exports_external.string(),
      plugin: exports_external.string()
    })).optional().describe("Teams/Enterprise allowlist of channel plugins. When set, " + "replaces the default URHQ allowlist — admins decide which " + "plugins may push inbound messages. Undefined falls back to the default. " + "Requires channelsEnabled: true."),
    ...{},
    prefersReducedMotion: exports_external.boolean().optional().describe("Reduce or disable animations for accessibility (spinner shimmer, flash effects, etc.)"),
    autoMemoryEnabled: exports_external.boolean().optional().describe("Enable auto-memory for this project. When false, UR will not read from or write to the auto-memory directory."),
    autoMemoryDirectory: exports_external.string().optional().describe("Custom directory path for auto-memory storage. Supports ~/ prefix for home directory expansion. Ignored if set in projectSettings (checked-in .ur/settings.json) for security. When unset, defaults to ~/.ur/projects/<sanitized-cwd>/memory/."),
    autoMemoryExtractionInterval: exports_external.number().int().min(1).optional().describe("Run the auto-memory extraction agent only every N eligible turns (default 1 = every turn). The extraction is a forked agent call on the session model, so raising this trades memory freshness for lower token/compute usage."),
    verifier: exports_external.object({
      askBeforeGates: exports_external.boolean().optional().describe("When true, UR asks whether to run project verification commands (tests, typecheck, lint) after a task instead of running them automatically. Default: false.")
    }).optional().describe("Verifier behavior configuration"),
    autoDreamEnabled: exports_external.boolean().optional().describe("Enable background memory consolidation (auto-dream). When set, overrides the server-side default."),
    ollama: exports_external.object({
      host: exports_external.string().optional().describe("URL of the Ollama server to use (e.g. http://192.168.1.50:11434)"),
      lanDiscovery: exports_external.boolean().optional().describe("When true, UR asks to discover Ollama servers on the local network at startup")
    }).optional().describe("Ollama backend configuration"),
    offline: exports_external.boolean().optional().describe("Offline / local-first mode: disable cloud APIs, telemetry, auto-updates, remote control, and web-dependent commands. Local Ollama and filesystem tools still work."),
    showThinkingSummaries: exports_external.boolean().optional().describe("Show thinking summaries in the transcript view (ctrl+o). Default: false."),
    skipDangerousModePermissionPrompt: exports_external.boolean().optional().describe("Whether the user has accepted the bypass permissions mode dialog"),
    ...{},
    disableAutoMode: exports_external.enum(["disable"]).optional().describe("Disable auto mode"),
    sshConfigs: exports_external.array(exports_external.object({
      id: exports_external.string().describe("Unique identifier for this SSH config. Used to match configs across settings sources."),
      name: exports_external.string().describe("Display name for the SSH connection"),
      sshHost: exports_external.string().describe('SSH host in format "user@hostname" or "hostname", or a host alias from ~/.ssh/config'),
      sshPort: exports_external.number().int().optional().describe("SSH port (default: 22)"),
      sshIdentityFile: exports_external.string().optional().describe("Path to SSH identity file (private key)"),
      startDirectory: exports_external.string().optional().describe("Default working directory on the remote host. " + "Supports tilde expansion (e.g. ~/projects). " + "If not specified, defaults to the remote user home directory. " + "Can be overridden by the [dir] positional argument in `ur ssh <config> [dir]`.")
    })).optional().describe("SSH connection configurations for remote environments. " + "Typically set in managed settings by enterprise administrators " + "to pre-configure SSH connections for team members."),
    urMdExcludes: exports_external.array(exports_external.string()).optional().describe("Glob patterns or absolute paths of UR.md files to exclude from loading. " + "Patterns are matched against absolute file paths using picomatch. " + "Only applies to User, Project, and Local memory types (Managed/policy files cannot be excluded). " + 'Examples: "/home/user/monorepo/UR.md", "**/code/UR.md", "**/some-dir/.ur/rules/**"'),
    pluginTrustMessage: exports_external.string().optional().describe("Custom message to append to the plugin trust warning shown before installation. " + "Only read from policy settings (managed-settings.json / MDM). " + "Useful for enterprise administrators to add organization-specific context " + '(e.g., "All plugins from our internal marketplace are vetted and approved.").')
  }).passthrough());
});

// src/utils/settings/schemaOutput.ts
function generateSettingsJSONSchema() {
  const jsonSchema = toJSONSchema(SettingsSchema(), { unrepresentable: "any" });
  return jsonStringify(jsonSchema, null, 2);
}
var init_schemaOutput = __esm(() => {
  init_v4();
  init_slowOperations();
  init_types2();
});

// src/utils/settings/validationTips.ts
function getValidationTip(context) {
  const matcher = TIP_MATCHERS.find((m) => m.matches(context));
  if (!matcher)
    return null;
  const tip = { ...matcher.tip };
  if (context.code === "invalid_value" && context.enumValues && !tip.suggestion) {
    tip.suggestion = `Valid values: ${context.enumValues.map((v) => `"${v}"`).join(", ")}`;
  }
  if (!tip.docLink && context.path) {
    const pathPrefix = context.path.split(".")[0];
    if (pathPrefix) {
      tip.docLink = PATH_DOC_LINKS[pathPrefix];
    }
  }
  return tip;
}
var DOCUMENTATION_BASE = "https://docs.ur.dev/docs/en", TIP_MATCHERS, PATH_DOC_LINKS;
var init_validationTips = __esm(() => {
  TIP_MATCHERS = [
    {
      matches: (ctx) => ctx.path === "permissions.defaultMode" && ctx.code === "invalid_value",
      tip: {
        suggestion: 'Valid modes: "acceptEdits" (ask before file changes), "plan" (analysis only), "bypassPermissions" (auto-accept all), or "default" (standard behavior)',
        docLink: `${DOCUMENTATION_BASE}/iam#permission-modes`
      }
    },
    {
      matches: (ctx) => ctx.path === "apiKeyHelper" && ctx.code === "invalid_type",
      tip: {
        suggestion: 'Provide a shell command that outputs your API key to stdout. The script should output only the API key. Example: "/bin/generate_temp_api_key.sh"'
      }
    },
    {
      matches: (ctx) => ctx.path === "cleanupPeriodDays" && ctx.code === "too_small" && ctx.expected === "0",
      tip: {
        suggestion: "Must be 0 or greater. Set a positive number for days to retain transcripts (default is 30). Setting 0 disables session persistence entirely: no transcripts are written and existing transcripts are deleted at startup."
      }
    },
    {
      matches: (ctx) => ctx.path.startsWith("env.") && ctx.code === "invalid_type",
      tip: {
        suggestion: 'Environment variables must be strings. Wrap numbers and booleans in quotes. Example: "DEBUG": "true", "PORT": "3000"',
        docLink: `${DOCUMENTATION_BASE}/settings#environment-variables`
      }
    },
    {
      matches: (ctx) => (ctx.path === "permissions.allow" || ctx.path === "permissions.deny") && ctx.code === "invalid_type" && ctx.expected === "array",
      tip: {
        suggestion: 'Permission rules must be in an array. Format: ["Tool(specifier)"]. Examples: ["Bash(npm run build)", "Edit(docs/**)", "Read(~/.zshrc)"]. Use * for wildcards.'
      }
    },
    {
      matches: (ctx) => ctx.path.includes("hooks") && ctx.code === "invalid_type",
      tip: {
        suggestion: 'Hooks use a matcher + hooks array. The matcher is a string: a tool name ("Bash"), pipe-separated list ("Edit|Write"), or empty to match all. Example: {"PostToolUse": [{"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "echo Done"}]}]}'
      }
    },
    {
      matches: (ctx) => ctx.code === "invalid_type" && ctx.expected === "boolean",
      tip: {
        suggestion: 'Use true or false without quotes. Example: "includeCoAuthoredBy": true'
      }
    },
    {
      matches: (ctx) => ctx.code === "unrecognized_keys",
      tip: {
        suggestion: "Check for typos or refer to the documentation for valid fields",
        docLink: `${DOCUMENTATION_BASE}/settings`
      }
    },
    {
      matches: (ctx) => ctx.code === "invalid_value" && ctx.enumValues !== undefined,
      tip: {
        suggestion: undefined
      }
    },
    {
      matches: (ctx) => ctx.code === "invalid_type" && ctx.expected === "object" && ctx.received === null && ctx.path === "",
      tip: {
        suggestion: "Check for missing commas, unmatched brackets, or trailing commas. Use a JSON validator to identify the exact syntax error."
      }
    },
    {
      matches: (ctx) => ctx.path === "permissions.additionalDirectories" && ctx.code === "invalid_type",
      tip: {
        suggestion: 'Must be an array of directory paths. Example: ["~/projects", "/tmp/workspace"]. You can also use --add-dir flag or /add-dir command',
        docLink: `${DOCUMENTATION_BASE}/iam#working-directories`
      }
    }
  ];
  PATH_DOC_LINKS = {
    permissions: `${DOCUMENTATION_BASE}/iam#configuring-permissions`,
    env: `${DOCUMENTATION_BASE}/settings#environment-variables`,
    hooks: `${DOCUMENTATION_BASE}/hooks`
  };
});

// src/utils/settings/validation.ts
function isInvalidTypeIssue(issue) {
  return issue.code === "invalid_type";
}
function isInvalidValueIssue(issue) {
  return issue.code === "invalid_value";
}
function isUnrecognizedKeysIssue(issue) {
  return issue.code === "unrecognized_keys";
}
function isTooSmallIssue(issue) {
  return issue.code === "too_small";
}
function getReceivedType(value) {
  if (value === null)
    return "null";
  if (value === undefined)
    return "undefined";
  if (Array.isArray(value))
    return "array";
  return typeof value;
}
function extractReceivedFromMessage(msg) {
  const match = msg.match(/received (\w+)/);
  return match ? match[1] : undefined;
}
function formatZodError(error, filePath) {
  return error.issues.map((issue) => {
    const path2 = issue.path.map(String).join(".");
    let message = issue.message;
    let expected;
    let enumValues;
    let expectedValue;
    let receivedValue;
    let invalidValue;
    if (isInvalidValueIssue(issue)) {
      enumValues = issue.values.map((v) => String(v));
      expectedValue = enumValues.join(" | ");
      receivedValue = undefined;
      invalidValue = undefined;
    } else if (isInvalidTypeIssue(issue)) {
      expectedValue = issue.expected;
      const receivedType = extractReceivedFromMessage(issue.message);
      receivedValue = receivedType ?? getReceivedType(issue.input);
      invalidValue = receivedType ?? getReceivedType(issue.input);
    } else if (isTooSmallIssue(issue)) {
      expectedValue = String(issue.minimum);
    } else if (issue.code === "custom" && "params" in issue) {
      const params = issue.params;
      receivedValue = params.received;
      invalidValue = receivedValue;
    }
    const tip = getValidationTip({
      path: path2,
      code: issue.code,
      expected: expectedValue,
      received: receivedValue,
      enumValues,
      message: issue.message,
      value: receivedValue
    });
    if (isInvalidValueIssue(issue)) {
      expected = enumValues?.map((v) => `"${v}"`).join(", ");
      message = `Invalid value. Expected one of: ${expected}`;
    } else if (isInvalidTypeIssue(issue)) {
      const receivedType = extractReceivedFromMessage(issue.message) ?? getReceivedType(issue.input);
      if (issue.expected === "object" && receivedType === "null" && path2 === "") {
        message = "Invalid or malformed JSON";
      } else {
        message = `Expected ${issue.expected}, but received ${receivedType}`;
      }
    } else if (isUnrecognizedKeysIssue(issue)) {
      const keys = issue.keys.join(", ");
      message = `Unrecognized ${plural(issue.keys.length, "field")}: ${keys}`;
    } else if (isTooSmallIssue(issue)) {
      message = `Number must be greater than or equal to ${issue.minimum}`;
      expected = String(issue.minimum);
    }
    return {
      file: filePath,
      path: path2,
      message,
      expected,
      invalidValue,
      suggestion: tip?.suggestion,
      docLink: tip?.docLink
    };
  });
}
function validateSettingsFileContent(content) {
  try {
    const jsonData = jsonParse(content);
    const result = SettingsSchema().strict().safeParse(jsonData);
    if (result.success) {
      return { isValid: true };
    }
    const errors = formatZodError(result.error, "settings");
    const errorMessage2 = `Settings validation failed:
` + errors.map((err) => `- ${err.path}: ${err.message}`).join(`
`);
    return {
      isValid: false,
      error: errorMessage2,
      fullSchema: generateSettingsJSONSchema()
    };
  } catch (parseError) {
    return {
      isValid: false,
      error: `Invalid JSON: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
      fullSchema: generateSettingsJSONSchema()
    };
  }
}
function filterInvalidPermissionRules(data, filePath) {
  if (!data || typeof data !== "object")
    return [];
  const obj = data;
  if (!obj.permissions || typeof obj.permissions !== "object")
    return [];
  const perms = obj.permissions;
  const warnings = [];
  for (const key of ["allow", "deny", "ask"]) {
    const rules = perms[key];
    if (!Array.isArray(rules))
      continue;
    perms[key] = rules.filter((rule) => {
      if (typeof rule !== "string") {
        warnings.push({
          file: filePath,
          path: `permissions.${key}`,
          message: `Non-string value in ${key} array was removed`,
          invalidValue: rule
        });
        return false;
      }
      const result = validatePermissionRule(rule);
      if (!result.valid) {
        let message = `Invalid permission rule "${rule}" was skipped`;
        if (result.error)
          message += `: ${result.error}`;
        if (result.suggestion)
          message += `. ${result.suggestion}`;
        warnings.push({
          file: filePath,
          path: `permissions.${key}`,
          message,
          invalidValue: rule
        });
        return false;
      }
      return true;
    });
  }
  return warnings;
}
var init_validation = __esm(() => {
  init_slowOperations();
  init_stringUtils();
  init_permissionValidation();
  init_schemaOutput();
  init_types2();
  init_validationTips();
});

// src/utils/settings/mdm/constants.ts
import { homedir as homedir6, userInfo as userInfo2 } from "os";
import { join as join14 } from "path";
function getMacOSPlistPaths() {
  let username = "";
  try {
    username = userInfo2().username;
  } catch {}
  const paths = [];
  if (username) {
    paths.push({
      path: `/Library/Managed Preferences/${username}/${MACOS_PREFERENCE_DOMAIN}.plist`,
      label: "per-user managed preferences"
    });
  }
  paths.push({
    path: `/Library/Managed Preferences/${MACOS_PREFERENCE_DOMAIN}.plist`,
    label: "device-level managed preferences"
  });
  if (process.env.USER_TYPE === "ant") {
    paths.push({
      path: join14(homedir6(), "Library", "Preferences", `${MACOS_PREFERENCE_DOMAIN}.plist`),
      label: "user preferences (ant-only)"
    });
  }
  return paths;
}
var MACOS_PREFERENCE_DOMAIN = "com.urhq.urcode", WINDOWS_REGISTRY_KEY_PATH_HKLM = "HKLM\\SOFTWARE\\Policies\\URCode", WINDOWS_REGISTRY_KEY_PATH_HKCU = "HKCU\\SOFTWARE\\Policies\\URCode", WINDOWS_REGISTRY_VALUE_NAME = "Settings", PLUTIL_PATH = "/usr/bin/plutil", PLUTIL_ARGS_PREFIX, MDM_SUBPROCESS_TIMEOUT_MS = 5000;
var init_constants4 = __esm(() => {
  PLUTIL_ARGS_PREFIX = ["-convert", "json", "-o", "-", "--"];
});

// src/utils/settings/mdm/rawRead.ts
import { execFile } from "child_process";
import { existsSync } from "fs";
function execFilePromise(cmd, args) {
  return new Promise((resolve5) => {
    execFile(cmd, args, { encoding: "utf-8", timeout: MDM_SUBPROCESS_TIMEOUT_MS }, (err, stdout) => {
      resolve5({ stdout: stdout ?? "", code: err ? 1 : 0 });
    });
  });
}
function fireRawRead() {
  return (async () => {
    if (process.platform === "darwin") {
      const plistPaths = getMacOSPlistPaths();
      const allResults = await Promise.all(plistPaths.map(async ({ path: path2, label }) => {
        if (!existsSync(path2)) {
          return { stdout: "", label, ok: false };
        }
        const { stdout, code } = await execFilePromise(PLUTIL_PATH, [
          ...PLUTIL_ARGS_PREFIX,
          path2
        ]);
        return { stdout, label, ok: code === 0 && !!stdout };
      }));
      const winner = allResults.find((r) => r.ok);
      return {
        plistStdouts: winner ? [{ stdout: winner.stdout, label: winner.label }] : [],
        hklmStdout: null,
        hkcuStdout: null
      };
    }
    if (process.platform === "win32") {
      const [hklm, hkcu] = await Promise.all([
        execFilePromise("reg", [
          "query",
          WINDOWS_REGISTRY_KEY_PATH_HKLM,
          "/v",
          WINDOWS_REGISTRY_VALUE_NAME
        ]),
        execFilePromise("reg", [
          "query",
          WINDOWS_REGISTRY_KEY_PATH_HKCU,
          "/v",
          WINDOWS_REGISTRY_VALUE_NAME
        ])
      ]);
      return {
        plistStdouts: null,
        hklmStdout: hklm.code === 0 ? hklm.stdout : null,
        hkcuStdout: hkcu.code === 0 ? hkcu.stdout : null
      };
    }
    return { plistStdouts: null, hklmStdout: null, hkcuStdout: null };
  })();
}
var init_rawRead = __esm(() => {
  init_constants4();
});

// src/utils/settings/mdm/settings.ts
import { join as join15 } from "path";
function getMdmSettings() {
  return mdmCache ?? EMPTY_RESULT;
}
function getHkcuSettings() {
  return hkcuCache ?? EMPTY_RESULT;
}
function setMdmSettingsCache(mdm, hkcu) {
  mdmCache = mdm;
  hkcuCache = hkcu;
}
async function refreshMdmSettings() {
  const raw = await fireRawRead();
  return consumeRawReadResult(raw);
}
function parseCommandOutputAsSettings(stdout, sourcePath) {
  const data = safeParseJSON(stdout, false);
  if (!data || typeof data !== "object") {
    return { settings: {}, errors: [] };
  }
  const ruleWarnings = filterInvalidPermissionRules(data, sourcePath);
  const parseResult = SettingsSchema().safeParse(data);
  if (!parseResult.success) {
    const errors = formatZodError(parseResult.error, sourcePath);
    return { settings: {}, errors: [...ruleWarnings, ...errors] };
  }
  return { settings: parseResult.data, errors: ruleWarnings };
}
function parseRegQueryStdout(stdout, valueName = "Settings") {
  const lines = stdout.split(/\r?\n/);
  const escaped = valueName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^\\s+${escaped}\\s+REG_(?:EXPAND_)?SZ\\s+(.*)$`, "i");
  for (const line of lines) {
    const match = line.match(re);
    if (match && match[1]) {
      return match[1].trimEnd();
    }
  }
  return null;
}
function consumeRawReadResult(raw) {
  if (raw.plistStdouts && raw.plistStdouts.length > 0) {
    const { stdout, label } = raw.plistStdouts[0];
    const result = parseCommandOutputAsSettings(stdout, label);
    if (Object.keys(result.settings).length > 0) {
      return { mdm: result, hkcu: EMPTY_RESULT };
    }
  }
  if (raw.hklmStdout) {
    const jsonString = parseRegQueryStdout(raw.hklmStdout);
    if (jsonString) {
      const result = parseCommandOutputAsSettings(jsonString, `Registry: ${WINDOWS_REGISTRY_KEY_PATH_HKLM}\\${WINDOWS_REGISTRY_VALUE_NAME}`);
      if (Object.keys(result.settings).length > 0) {
        return { mdm: result, hkcu: EMPTY_RESULT };
      }
    }
  }
  if (hasManagedSettingsFile()) {
    return { mdm: EMPTY_RESULT, hkcu: EMPTY_RESULT };
  }
  if (raw.hkcuStdout) {
    const jsonString = parseRegQueryStdout(raw.hkcuStdout);
    if (jsonString) {
      const result = parseCommandOutputAsSettings(jsonString, `Registry: ${WINDOWS_REGISTRY_KEY_PATH_HKCU}\\${WINDOWS_REGISTRY_VALUE_NAME}`);
      return { mdm: EMPTY_RESULT, hkcu: result };
    }
  }
  return { mdm: EMPTY_RESULT, hkcu: EMPTY_RESULT };
}
function hasManagedSettingsFile() {
  try {
    const filePath = join15(getManagedFilePath(), "managed-settings.json");
    const content = readFileSync(filePath);
    const data = safeParseJSON(content, false);
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      return true;
    }
  } catch {}
  try {
    const dropInDir = getManagedSettingsDropInDir();
    const entries = getFsImplementation().readdirSync(dropInDir);
    for (const d of entries) {
      if (!(d.isFile() || d.isSymbolicLink()) || !d.name.endsWith(".json") || d.name.startsWith(".")) {
        continue;
      }
      try {
        const content = readFileSync(join15(dropInDir, d.name));
        const data = safeParseJSON(content, false);
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          return true;
        }
      } catch {}
    }
  } catch {}
  return false;
}
var EMPTY_RESULT, mdmCache = null, hkcuCache = null;
var init_settings = __esm(() => {
  init_debug();
  init_diagLogs();
  init_fileRead();
  init_fsOperations();
  init_json();
  init_startupProfiler();
  init_managedPath();
  init_types2();
  init_validation();
  init_constants4();
  init_rawRead();
  EMPTY_RESULT = Object.freeze({ settings: {}, errors: [] });
});

// src/utils/settings/settings.ts
import { dirname as dirname7, join as join16, resolve as resolve5 } from "path";
function getManagedSettingsFilePath() {
  return join16(getManagedFilePath(), "managed-settings.json");
}
function loadManagedFileSettings() {
  const errors = [];
  let merged = {};
  let found = false;
  const { settings, errors: baseErrors } = parseSettingsFile(getManagedSettingsFilePath());
  errors.push(...baseErrors);
  if (settings && Object.keys(settings).length > 0) {
    merged = mergeWith_default(merged, settings, settingsMergeCustomizer);
    found = true;
  }
  const dropInDir = getManagedSettingsDropInDir();
  try {
    const entries = getFsImplementation().readdirSync(dropInDir).filter((d) => (d.isFile() || d.isSymbolicLink()) && d.name.endsWith(".json") && !d.name.startsWith(".")).map((d) => d.name).sort();
    for (const name of entries) {
      const { settings: settings2, errors: fileErrors } = parseSettingsFile(join16(dropInDir, name));
      errors.push(...fileErrors);
      if (settings2 && Object.keys(settings2).length > 0) {
        merged = mergeWith_default(merged, settings2, settingsMergeCustomizer);
        found = true;
      }
    }
  } catch (e) {
    const code = getErrnoCode(e);
    if (code !== "ENOENT" && code !== "ENOTDIR") {
      logError(e);
    }
  }
  return { settings: found ? merged : null, errors };
}
function getManagedFileSettingsPresence() {
  const { settings: base } = parseSettingsFile(getManagedSettingsFilePath());
  const hasBase = !!base && Object.keys(base).length > 0;
  let hasDropIns = false;
  const dropInDir = getManagedSettingsDropInDir();
  try {
    hasDropIns = getFsImplementation().readdirSync(dropInDir).some((d) => (d.isFile() || d.isSymbolicLink()) && d.name.endsWith(".json") && !d.name.startsWith("."));
  } catch {}
  return { hasBase, hasDropIns };
}
function handleFileSystemError(error, path2) {
  if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") {
    logForDebugging(`Broken symlink or missing file encountered for settings.json at path: ${path2}`);
  } else {
    logError(error);
  }
}
function parseSettingsFile(path2) {
  const cached = getCachedParsedFile(path2);
  if (cached) {
    return {
      settings: cached.settings ? clone(cached.settings) : null,
      errors: cached.errors
    };
  }
  const result = parseSettingsFileUncached(path2);
  setCachedParsedFile(path2, result);
  return {
    settings: result.settings ? clone(result.settings) : null,
    errors: result.errors
  };
}
function parseSettingsFileUncached(path2) {
  try {
    const { resolvedPath } = safeResolvePath(getFsImplementation(), path2);
    const content = readFileSync(resolvedPath);
    if (content.trim() === "") {
      return { settings: {}, errors: [] };
    }
    const data = safeParseJSON(content, false);
    const ruleWarnings = filterInvalidPermissionRules(data, path2);
    const result = SettingsSchema().safeParse(data);
    if (!result.success) {
      const errors = formatZodError(result.error, path2);
      return { settings: null, errors: [...ruleWarnings, ...errors] };
    }
    return { settings: result.data, errors: ruleWarnings };
  } catch (error) {
    handleFileSystemError(error, path2);
    return { settings: null, errors: [] };
  }
}
function getSettingsRootPathForSource(source) {
  switch (source) {
    case "userSettings":
      return resolve5(getURConfigHomeDir());
    case "policySettings":
    case "projectSettings":
    case "localSettings": {
      return resolve5(getOriginalCwd());
    }
    case "flagSettings": {
      const path2 = getFlagSettingsPath();
      return path2 ? dirname7(resolve5(path2)) : resolve5(getOriginalCwd());
    }
  }
}
function getUserSettingsFilePath() {
  if (getUseCoworkPlugins() || isEnvTruthy(process.env.UR_CODE_USE_COWORK_PLUGINS)) {
    return "cowork_settings.json";
  }
  return "settings.json";
}
function getSettingsFilePathForSource(source) {
  switch (source) {
    case "userSettings":
      return join16(getSettingsRootPathForSource(source), getUserSettingsFilePath());
    case "projectSettings":
    case "localSettings": {
      return join16(getSettingsRootPathForSource(source), getRelativeSettingsFilePathForSource(source));
    }
    case "policySettings":
      return getManagedSettingsFilePath();
    case "flagSettings": {
      return getFlagSettingsPath();
    }
  }
}
function getRelativeSettingsFilePathForSource(source) {
  switch (source) {
    case "projectSettings":
      return join16(".ur", "settings.json");
    case "localSettings":
      return join16(".ur", "settings.local.json");
  }
}
function getSettingsForSource(source) {
  const cached = getCachedSettingsForSource(source);
  if (cached !== undefined)
    return cached;
  const result = getSettingsForSourceUncached(source);
  setCachedSettingsForSource(source, result);
  return result;
}
function getSettingsForSourceUncached(source) {
  if (source === "policySettings") {
    const remoteSettings = getRemoteManagedSettingsSyncFromCache();
    if (remoteSettings && Object.keys(remoteSettings).length > 0) {
      return remoteSettings;
    }
    const mdmResult = getMdmSettings();
    if (Object.keys(mdmResult.settings).length > 0) {
      return mdmResult.settings;
    }
    const { settings: fileSettings2 } = loadManagedFileSettings();
    if (fileSettings2) {
      return fileSettings2;
    }
    const hkcu = getHkcuSettings();
    if (Object.keys(hkcu.settings).length > 0) {
      return hkcu.settings;
    }
    return null;
  }
  const settingsFilePath = getSettingsFilePathForSource(source);
  const { settings: fileSettings } = settingsFilePath ? parseSettingsFile(settingsFilePath) : { settings: null };
  if (source === "flagSettings") {
    const inlineSettings = getFlagSettingsInline();
    if (inlineSettings) {
      const parsed = SettingsSchema().safeParse(inlineSettings);
      if (parsed.success) {
        return mergeWith_default(fileSettings || {}, parsed.data, settingsMergeCustomizer);
      }
    }
  }
  return fileSettings;
}
function getPolicySettingsOrigin() {
  const remoteSettings = getRemoteManagedSettingsSyncFromCache();
  if (remoteSettings && Object.keys(remoteSettings).length > 0) {
    return "remote";
  }
  const mdmResult = getMdmSettings();
  if (Object.keys(mdmResult.settings).length > 0) {
    return getPlatform() === "macos" ? "plist" : "hklm";
  }
  const { settings: fileSettings } = loadManagedFileSettings();
  if (fileSettings) {
    return "file";
  }
  const hkcu = getHkcuSettings();
  if (Object.keys(hkcu.settings).length > 0) {
    return "hkcu";
  }
  return null;
}
function updateSettingsForSource(source, settings) {
  if (source === "policySettings" || source === "flagSettings") {
    return { error: null };
  }
  const filePath = getSettingsFilePathForSource(source);
  if (!filePath) {
    return { error: null };
  }
  try {
    getFsImplementation().mkdirSync(dirname7(filePath));
    let existingSettings = getSettingsForSourceUncached(source);
    if (!existingSettings) {
      let content = null;
      try {
        content = readFileSync(filePath);
      } catch (e) {
        if (!isENOENT(e)) {
          throw e;
        }
      }
      if (content !== null) {
        const rawData = safeParseJSON(content);
        if (rawData === null) {
          return {
            error: new Error(`Invalid JSON syntax in settings file at ${filePath}`)
          };
        }
        if (rawData && typeof rawData === "object") {
          existingSettings = rawData;
          logForDebugging(`Using raw settings from ${filePath} due to validation failure`);
        }
      }
    }
    const updatedSettings = mergeWith_default(existingSettings || {}, settings, (_objValue, srcValue, key, object) => {
      if (srcValue === undefined && object && typeof key === "string") {
        delete object[key];
        return;
      }
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
      return;
    });
    markInternalWrite(filePath);
    writeFileSyncAndFlush_DEPRECATED(filePath, jsonStringify(updatedSettings, null, 2) + `
`);
    resetSettingsCache();
    if (source === "localSettings") {
      addFileGlobRuleToGitignore(getRelativeSettingsFilePathForSource("localSettings"), getOriginalCwd());
    }
  } catch (e) {
    const error = new Error(`Failed to read raw settings from ${filePath}: ${e}`);
    logError(error);
    return { error };
  }
  return { error: null };
}
function mergeArrays(targetArray, sourceArray) {
  return uniq([...targetArray, ...sourceArray]);
}
function settingsMergeCustomizer(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return mergeArrays(objValue, srcValue);
  }
  return;
}
function getManagedSettingsKeysForLogging(settings) {
  const validSettings = SettingsSchema().strip().parse(settings);
  const keysToExpand = ["permissions", "sandbox", "hooks"];
  const allKeys = [];
  const validNestedKeys = {
    permissions: new Set([
      "allow",
      "deny",
      "ask",
      "defaultMode",
      "disableBypassPermissionsMode",
      ...[],
      "additionalDirectories"
    ]),
    sandbox: new Set([
      "enabled",
      "failIfUnavailable",
      "allowUnsandboxedCommands",
      "network",
      "filesystem",
      "ignoreViolations",
      "excludedCommands",
      "autoAllowBashIfSandboxed",
      "enableWeakerNestedSandbox",
      "enableWeakerNetworkIsolation",
      "ripgrep"
    ]),
    hooks: new Set([
      "PreToolUse",
      "PostToolUse",
      "Notification",
      "UserPromptSubmit",
      "SessionStart",
      "SessionEnd",
      "Stop",
      "SubagentStop",
      "PreCompact",
      "PostCompact",
      "TeammateIdle",
      "TaskCreated",
      "TaskCompleted"
    ])
  };
  for (const key of Object.keys(validSettings)) {
    if (keysToExpand.includes(key) && validSettings[key] && typeof validSettings[key] === "object") {
      const nestedObj = validSettings[key];
      const validKeys = validNestedKeys[key];
      if (validKeys) {
        for (const nestedKey of Object.keys(nestedObj)) {
          if (validKeys.has(nestedKey)) {
            allKeys.push(`${key}.${nestedKey}`);
          }
        }
      }
    } else {
      allKeys.push(key);
    }
  }
  return allKeys.sort();
}
function loadSettingsFromDisk() {
  if (isLoadingSettings) {
    return { settings: {}, errors: [] };
  }
  const startTime = Date.now();
  profileCheckpoint("loadSettingsFromDisk_start");
  logForDiagnosticsNoPII("info", "settings_load_started");
  isLoadingSettings = true;
  try {
    const pluginSettings = getPluginSettingsBase();
    let mergedSettings = {};
    if (pluginSettings) {
      mergedSettings = mergeWith_default(mergedSettings, pluginSettings, settingsMergeCustomizer);
    }
    const allErrors = [];
    const seenErrors = new Set;
    const seenFiles = new Set;
    for (const source of getEnabledSettingSources()) {
      if (source === "policySettings") {
        let policySettings = null;
        const policyErrors = [];
        const remoteSettings = getRemoteManagedSettingsSyncFromCache();
        if (remoteSettings && Object.keys(remoteSettings).length > 0) {
          const result = SettingsSchema().safeParse(remoteSettings);
          if (result.success) {
            policySettings = result.data;
          } else {
            policyErrors.push(...formatZodError(result.error, "remote managed settings"));
          }
        }
        if (!policySettings) {
          const mdmResult = getMdmSettings();
          if (Object.keys(mdmResult.settings).length > 0) {
            policySettings = mdmResult.settings;
          }
          policyErrors.push(...mdmResult.errors);
        }
        if (!policySettings) {
          const { settings, errors } = loadManagedFileSettings();
          if (settings) {
            policySettings = settings;
          }
          policyErrors.push(...errors);
        }
        if (!policySettings) {
          const hkcu = getHkcuSettings();
          if (Object.keys(hkcu.settings).length > 0) {
            policySettings = hkcu.settings;
          }
          policyErrors.push(...hkcu.errors);
        }
        if (policySettings) {
          mergedSettings = mergeWith_default(mergedSettings, policySettings, settingsMergeCustomizer);
        }
        for (const error of policyErrors) {
          const errorKey = `${error.file}:${error.path}:${error.message}`;
          if (!seenErrors.has(errorKey)) {
            seenErrors.add(errorKey);
            allErrors.push(error);
          }
        }
        continue;
      }
      const filePath = getSettingsFilePathForSource(source);
      if (filePath) {
        const resolvedPath = resolve5(filePath);
        if (!seenFiles.has(resolvedPath)) {
          seenFiles.add(resolvedPath);
          const { settings, errors } = parseSettingsFile(filePath);
          for (const error of errors) {
            const errorKey = `${error.file}:${error.path}:${error.message}`;
            if (!seenErrors.has(errorKey)) {
              seenErrors.add(errorKey);
              allErrors.push(error);
            }
          }
          if (settings) {
            mergedSettings = mergeWith_default(mergedSettings, settings, settingsMergeCustomizer);
          }
        }
      }
      if (source === "flagSettings") {
        const inlineSettings = getFlagSettingsInline();
        if (inlineSettings) {
          const parsed = SettingsSchema().safeParse(inlineSettings);
          if (parsed.success) {
            mergedSettings = mergeWith_default(mergedSettings, parsed.data, settingsMergeCustomizer);
          }
        }
      }
    }
    logForDiagnosticsNoPII("info", "settings_load_completed", {
      duration_ms: Date.now() - startTime,
      source_count: seenFiles.size,
      error_count: allErrors.length
    });
    return { settings: mergedSettings, errors: allErrors };
  } finally {
    isLoadingSettings = false;
  }
}
function getInitialSettings() {
  const { settings } = getSettingsWithErrors();
  return settings || {};
}
function getSettingsWithSources() {
  resetSettingsCache();
  const sources = [];
  for (const source of getEnabledSettingSources()) {
    const settings = getSettingsForSource(source);
    if (settings && Object.keys(settings).length > 0) {
      sources.push({ source, settings });
    }
  }
  return { effective: getInitialSettings(), sources };
}
function getSettingsWithErrors() {
  const cached = getSessionSettingsCache();
  if (cached !== null) {
    return cached;
  }
  const result = loadSettingsFromDisk();
  profileCheckpoint("loadSettingsFromDisk_end");
  setSessionSettingsCache(result);
  return result;
}
function hasSkipDangerousModePermissionPrompt() {
  return !!(getSettingsForSource("userSettings")?.skipDangerousModePermissionPrompt || getSettingsForSource("localSettings")?.skipDangerousModePermissionPrompt || getSettingsForSource("flagSettings")?.skipDangerousModePermissionPrompt || getSettingsForSource("policySettings")?.skipDangerousModePermissionPrompt);
}
function hasAutoModeOptIn() {
  if (false) {}
  return false;
}
function getUseAutoModeDuringPlan() {
  if (false) {}
  return true;
}
function getAutoModeConfig() {
  if (false) {}
  return;
}
function rawSettingsContainsKey(key) {
  for (const source of getEnabledSettingSources()) {
    if (source === "policySettings") {
      continue;
    }
    const filePath = getSettingsFilePathForSource(source);
    if (!filePath) {
      continue;
    }
    try {
      const { resolvedPath } = safeResolvePath(getFsImplementation(), filePath);
      const content = readFileSync(resolvedPath);
      if (!content.trim()) {
        continue;
      }
      const rawData = safeParseJSON(content, false);
      if (rawData && typeof rawData === "object" && key in rawData) {
        return true;
      }
    } catch (error) {
      handleFileSystemError(error, filePath);
    }
  }
  return false;
}
var isLoadingSettings = false, getSettings_DEPRECATED;
var init_settings2 = __esm(() => {
  init_mergeWith();
  init_state();
  init_syncCacheState();
  init_array();
  init_debug();
  init_diagLogs();
  init_envUtils();
  init_errors();
  init_file();
  init_fileRead();
  init_fsOperations();
  init_gitignore();
  init_json();
  init_log();
  init_platform();
  init_slowOperations();
  init_startupProfiler();
  init_constants();
  init_internalWrites();
  init_managedPath();
  init_settings();
  init_settingsCache();
  init_types2();
  init_validation();
  getSettings_DEPRECATED = getInitialSettings;
});

// src/utils/model/ollamaConfig.ts
function normalizeOllamaBaseUrl(value) {
  const base = value?.trim() || "http://localhost:11434";
  const withScheme = /^https?:\/\//.test(base) ? base : `http://${base}`;
  return withScheme.replace(/\/api\/?$/, "").replace(/\/$/, "");
}
function getOllamaBaseUrl(env3 = process.env, settings) {
  if (sessionOverride) {
    return normalizeOllamaBaseUrl(sessionOverride);
  }
  const envHost = env3.OLLAMA_HOST || env3.OLLAMA_BASE_URL;
  if (envHost) {
    return normalizeOllamaBaseUrl(envHost);
  }
  const settingsHost = settings === undefined ? getInitialSettings().ollama?.host : settings.ollama?.host;
  if (settingsHost) {
    return normalizeOllamaBaseUrl(settingsHost);
  }
  return "http://localhost:11434";
}
var sessionOverride;
var init_ollamaConfig = __esm(() => {
  init_settings2();
});

// src/constants/oauth.ts
function fileSuffixForOauthConfig() {
  return "";
}
function getOauthConfig() {
  return {
    BASE_API_URL: getOllamaBaseUrl(),
    UR_AI_ORIGIN: "",
    UR_AI_AUTHORIZE_URL: "",
    CONSOLE_AUTHORIZE_URL: "",
    CLIENT_ID: "",
    MANUAL_REDIRECT_URL: "",
    TOKEN_URL: "",
    URAI_SUCCESS_URL: "",
    CONSOLE_SUCCESS_URL: "",
    ROLES_URL: "",
    API_KEY_URL: "",
    OAUTH_FILE_SUFFIX: "",
    MCP_PROXY_URL: "",
    MCP_PROXY_PATH: "/v1/mcp/{server_id}"
  };
}
var UR_AI_INFERENCE_SCOPE = "user:inference", UR_AI_PROFILE_SCOPE = "user:profile", CONSOLE_SCOPE = "org:create_api_key", OAUTH_BETA_HEADER = "oauth-2025-04-20", CONSOLE_OAUTH_SCOPES, UR_AI_OAUTH_SCOPES, ALL_OAUTH_SCOPES, MCP_CLIENT_METADATA_URL = "";
var init_oauth = __esm(() => {
  init_envUtils();
  init_ollamaConfig();
  CONSOLE_OAUTH_SCOPES = [
    CONSOLE_SCOPE,
    UR_AI_PROFILE_SCOPE
  ];
  UR_AI_OAUTH_SCOPES = [
    UR_AI_PROFILE_SCOPE,
    UR_AI_INFERENCE_SCOPE,
    "user:sessions:ur",
    "user:mcp_servers",
    "user:file_upload"
  ];
  ALL_OAUTH_SCOPES = Array.from(new Set([...CONSOLE_OAUTH_SCOPES, ...UR_AI_OAUTH_SCOPES]));
});

export { _baseAssignValue_default, init__baseAssignValue, _assignValue_default, init__assignValue, _baseFor_default, init__baseFor, isPlainObject_default, init_isPlainObject, readFileSyncWithMetadata, readFileSync, init_fileRead, setSessionCache, resetSyncCache, setEligibility, getSettingsPath, getRemoteManagedSettingsSyncFromCache, init_syncCacheState, isEqual_default, init_isEqual, init_lodash, _baseSet_default, init__baseSet, getPlatform, init_platform, findGitBashPath, windowsPathToPosixPath, posixPathToWindowsPath, init_windowsPaths, init_getWorktreePathsPortable, LITE_READ_BUF_SIZE, extractJsonStringField, extractLastJsonStringField, readHeadAndTail, sanitizePath, SKIP_PRECOMPACT_THRESHOLD, readTranscriptForLoad, init_sessionStoragePortable, expandPath, toRelativePath, getDirectoryForPath, containsPathTraversal, init_path, isAutoMemoryEnabled, getMemoryBaseDir, hasAutoMemPathOverride, getAutoMemPath, getAutoMemEntrypoint, isAutoMemPath, init_paths, fileSuffixForOauthConfig, UR_AI_INFERENCE_SCOPE, UR_AI_PROFILE_SCOPE, OAUTH_BETA_HEADER, CONSOLE_OAUTH_SCOPES, UR_AI_OAUTH_SCOPES, ALL_OAUTH_SCOPES, MCP_CLIENT_METADATA_URL, getOauthConfig, init_oauth, isRunningWithBun, isInBundledMode, init_bundledMode, findExecutable2 as findExecutable, init_findExecutable, getGlobalURFile, env, init_env, getManagedFilePath, getManagedSettingsDropInDir, init_managedPath, NOTIFICATION_CHANNELS, EDITOR_MODES, TEAMMATE_MODES, init_configConstants, checkHasTrustDialogAccepted, saveGlobalConfig, getGlobalConfig, getRemoteControlAtStartup, enableConfigs, getCurrentProjectConfig, saveCurrentProjectConfig, shouldSkipPluginAutoupdate, formatAutoUpdaterDisabledReason, getAutoUpdaterDisabledReason, getOrCreateUserID, getMemoryPath, getManagedURRulesDir, getUserURRulesDir, init_config, Chalk, source_default, init_source, sequential, init_sequential, getInferenceProfileBackingModel, getBedrockRegionPrefix, applyBedrockRegionPrefix, init_bedrock, UR_MODELO_4_6_CONFIG, ALL_MODEL_CONFIGS, init_configs, getModelStrings2 as getModelStrings, init_modelStrings, hasURAiBillingAccess, init_billing, getMockHeaderless429Message, getMockHeaders, applyMockHeaders, shouldProcessMockLimits, isMockFastModeRateLimitScenario, checkMockFastModeRateLimit, init_mockRateLimits, getOauthProfileFromOauthToken, init_getOauthProfile, shouldUseURAIAuth, parseScopes, buildAuthUrl, exchangeCodeForTokens, refreshOAuthToken, fetchAndStoreUserRoles, createAndStoreApiKey, isOAuthTokenExpired, fetchProfileInfo, getOrganizationUUID, populateOAuthAccountInfoIfNeeded, storeOAuthAccountInfo, init_client, CCR_SESSION_INGRESS_TOKEN_PATH, maybePersistTokenForSubprocesses, readTokenFromWellKnownFile, init_authFileDescriptor, clearKeychainCache, init_macOsKeychainHelpers, normalizeApiKeyForConfig, init_authPortable, isAwsCredentialsProviderError, init_aws, CONTEXT_1M_BETA_HEADER, CONTEXT_MANAGEMENT_BETA_HEADER, STRUCTURED_OUTPUTS_BETA_HEADER, EFFORT_BETA_HEADER, TASK_BUDGETS_BETA_HEADER, PROMPT_CACHING_SCOPE_BETA_HEADER, FAST_MODE_BETA_HEADER, REDACT_THINKING_BETA_HEADER, AFK_MODE_BETA_HEADER, ADVISOR_BETA_HEADER, VERTEX_COUNT_TOKENS_ALLOWED_BETAS, init_betas, getAntModelOverrideConfig, getAntModels, resolveAntModel, init_antModels, isMacOsKeychainLocked, init_macOsKeychainStorage, getSecureStorage, init_secureStorage, setProviderApiKey, getStoredProviderApiKey, getProviderApiKey, hasStoredProviderApiKey, clearProviderApiKey, getProviderApiKeySource, init_providerCredentials, parseOllamaModelNames, cacheOllamaModelMetadata, getOllamaContextLengthForModel, init_ollamaModels, ProviderResponseParseError, ProviderCapabilityError, resolveActiveProviderModel, init_providerClient, getURHQClient, CLIENT_REQUEST_ID_HEADER, init_client2 as init_client1, COMPACT_MAX_OUTPUT_TOKENS, CAPPED_DEFAULT_MAX_TOKENS, ESCALATED_MAX_TOKENS, is1mContextDisabled, has1mContext, getContextWindowForModel, getmodelS1mExpTreatmentEnabled, getModelMaxOutputTokens, getMaxThinkingTokensForModel, init_context, isFastModeEnabled, isFastModeAvailable, getFastModeUnavailableReason, FAST_MODE_MODEL_DISPLAY, getFastModeModel, isFastModeSupportedByModel, getFastModeRuntimeState, triggerFastModeCooldown, clearFastModeCooldown, handleFastModeRejectedByAPI, handleFastModeOverageRejection, isFastModeCooldown, getFastModeState, prefetchFastModeStatus, init_fastMode, COST_TIER_3_15, COST_MODELH_35, COST_MODELH_45, getmodelO46CostTier, MODEL_COSTS, calculateUSDCost, formatModelPricing, init_modelCost, BLACK_CIRCLE, UR_HOUSE, UP_ARROW, DOWN_ARROW, LIGHTNING_BOLT, EFFORT_LOW, EFFORT_MEDIUM, EFFORT_HIGH, EFFORT_MAX, REFRESH_ARROW, DIAMOND_OPEN, DIAMOND_FILLED, REFERENCE_MARK, BLOCKQUOTE_BAR, init_figures, MODEL_ALIASES, init_aliases, isModelAllowed, init_modelAllowlist, escapeRegExp, capitalize, plural, firstLineOf, countCharInString, normalizeFullWidthDigits, normalizeFullWidthSpace, safeJoinLines, EndTruncatingAccumulator, init_stringUtils, __resetOllamaRouteMemoForTests, getDefaultOllamaModel, getSmallFastModel, isNonCustommodelOModel, getUserSpecifiedModelSetting, getMainLoopModel, getBestModel, getDefaultmodelOModel, getDefaultmodelSModel, getDefaultmodelHModel, getRuntimeMainLoopModel, getDefaultMainLoopModelSetting, getDefaultMainLoopModel, firstPartyNameToCanonical, getCanonicalName, getURAiUserDefaultModelDescription, renderDefaultModelSetting, getmodelO46PricingSuffix, ismodelO1mMergeEnabled, renderModelSetting, getPublicModelDisplayName, renderModelName, getPublicModelName, parseUserSpecifiedModel, resolveSkillModelOverride, isLegacyModelRemapEnabled, modelDisplayString, getMarketingNameForModel, normalizeModelStringForAPI, init_model, get3PModelCapabilityOverride, init_modelSupportOverrides, modelSupportsStructuredOutputs, getToolSearchBetaHeader, shouldIncludeFirstPartyOnlyBetas, shouldUseGlobalCacheScope, getModelBetas, getBedrockExtraBodyParamsBetas, getMergedBetas, clearBetasCaches, init_betas2 as init_betas1, sleep, init_sleep, getToolSchemaCache, clearToolSchemaCache, init_toolSchemaCache, isURHQAuthEnabled, getAuthTokenSource, getURHQApiKey, hasURHQApiKeyAuth, getURHQApiKeyWithSource, getConfiguredApiKeyHelper, isAwsAuthRefreshFromProjectSettings, isAwsCredentialExportFromProjectSettings, calculateApiKeyHelperTTL, getApiKeyHelperElapsedMs, getApiKeyFromApiKeyHelper, getApiKeyFromApiKeyHelperCached, clearApiKeyHelperCache, prefetchApiKeyFromApiKeyHelperIfSafe, refreshAwsAuth, refreshAndGetAwsCredentials, clearAwsCredentialsCache, isGcpAuthRefreshFromProjectSettings, checkGcpCredentialsValid, refreshGcpAuth, refreshGcpCredentialsIfNeeded, clearGcpCredentialsCache, prefetchGcpCredentialsIfSafe, prefetchAwsCredentialsAndBedRockInfoIfSafe, getApiKeyFromConfigOrMacOSKeychain, saveApiKey, isCustomApiKeyApproved, removeApiKey, saveOAuthTokensIfNeeded, getURAIOAuthTokens, clearOAuthTokenCache, handleOAuth401Error, getURAIOAuthTokensAsync, checkAndRefreshOAuthTokenIfNeeded, isURAISubscriber, hasProfileScope, is1PApiCustomer, getOauthAccountInfo, isOverageProvisioningAllowed, hasmodelOAccess, getSubscriptionType, isMaxSubscriber, isTeamSubscriber, isTeamPremiumSubscriber, isEnterpriseSubscriber, isProSubscriber, getRateLimitTier, getSubscriptionName, isUsing3PServices, isOtelHeadersHelperFromProjectOrLocalSettings, getOtelHeadersFromHelper, isConsumerSubscriber, getAccountInformation, validateForceLoginOrg, exports_auth, init_auth, getURCodeUserAgent, init_userAgent, getWorkload, init_workloadContext, getUserAgent, getMCPUserAgent, getWebFetchUserAgent, getAuthHeaders, withOAuth401Retry, init_http, resetUserCache, init_user, getGraphemeSegmenter, firstGrapheme, getWordSegmenter, init_intl, require_emoji_regex, eastAsianWidth, init_get_east_asian_width, stripAnsi, init_strip_ansi, stringWidth, init_stringWidth, truncatePathMiddle, truncateToWidth, truncateStartToWidth, truncateToWidthNoEllipsis, truncate, init_truncate, formatFileSize, formatSecondsShort, formatDuration, formatNumber, formatTokens, formatRelativeTimeAgo, formatLogMetadata, formatResetTime, formatResetText, init_format, getPerformance, init_profilerBase, profileReport, init_startupProfiler, getAncestorPidsAsync, getProcessCommand, init_genericProcessUtils, envDynamic, init_envDynamic, isAgentSwarmsEnabled, init_agentSwarmsEnabled, getAgentContext, runWithAgentContext, consumeInvokingRequestId, init_agentContext, sanitizeToolNameForAnalytics, isToolDetailsLoggingEnabled, mcpToolDetailsForAnalytics, extractMcpToolDetails, extractSkillName, extractToolInputForTelemetry, getFileExtensionForAnalytics, getFileExtensionsFromBashCommand, getEventMetadata, init_metadata, isSinkKilled, init_sinkKillswitch, shouldSampleEvent, shutdown1PEventLogging, logEventTo1P, init_firstPartyEventLogger, onGrowthBookRefresh, getFeatureValue_CACHED_MAY_BE_STALE, checkStatsigFeatureGate_CACHED_MAY_BE_STALE, checkSecurityRestrictionGate, checkGate_CACHED_OR_BLOCKING, refreshGrowthBookAfterAuthChange, getDynamicConfig_BLOCKS_ON_INIT, getDynamicConfig_CACHED_MAY_BE_STALE, init_growthbook, pathExists, MAX_OUTPUT_SIZE, readFileSafe, getFileModificationTime, getFileModificationTimeAsync, writeTextContent, detectFileEncoding, detectLineEndings, convertLeadingTabsToSpaces, getDisplayPath, findSimilarFile, FILE_NOT_FOUND_CWD_NOTE, suggestPathUnderCwd, isCompactLinePrefixEnabled, addLineNumbers, isDirEmpty, readFileSyncCached, getDesktopPath, isFileWithinReadSizeLimit, normalizePathForComparison, pathsEqual, init_file, isPathGitignored, init_gitignore, SETTING_SOURCES, getSettingSourceName, getSourceDisplayName, getSettingSourceDisplayNameLowercase, getSettingSourceDisplayNameCapitalized, getEnabledSettingSources, isSettingSourceEnabled, SOURCES, init_constants, consumeInternalWrite, clearInternalWrites, init_internalWrites, EXTERNAL_PERMISSION_MODES, PERMISSION_MODES, init_permissions, permissionModeSchema, externalPermissionModeSchema, isExternalPermissionMode, toExternalPermissionMode, permissionModeFromString, permissionModeTitle, getModeColor, init_PermissionMode, HOOK_EVENTS, init_coreTypes, init_agentSdkTypes, DEFAULT_HOOK_SHELL, init_shellProvider, HooksSchema, McpServerConfigSchema, McpJsonConfigSchema, init_types, ALLOWED_OFFICIAL_MARKETPLACE_NAMES, isMarketplaceAutoUpdate, validateOfficialNameSource, PluginHooksSchema, LspServerConfigSchema, PluginManifestSchema, isLocalPluginSource, isLocalMarketplaceSource, PluginMarketplaceEntrySchema, PluginMarketplaceSchema, PluginIdSchema, InstalledPluginsFileSchemaV1, InstalledPluginsFileSchemaV2, KnownMarketplacesFileSchema, init_schemas, normalizeNameForMCP, init_normalization, mcpInfoFromString, buildMcpToolName, getToolNameForPermissionCheck, getMcpDisplayName, extractMcpToolDisplayName, init_mcpStringUtils, AGENT_TOOL_NAME, LEGACY_AGENT_TOOL_NAME, VERIFICATION_AGENT_TYPE, ONE_SHOT_BUILTIN_AGENT_TYPES, init_constants2 as init_constants1, TASK_OUTPUT_TOOL_NAME, init_constants3 as init_constants2, TASK_STOP_TOOL_NAME, DESCRIPTION, init_prompt, normalizeLegacyToolName, getLegacyToolNames, permissionRuleValueFromString, permissionRuleValueToString, init_permissionRuleParser, CUSTOMIZATION_SURFACES, SettingsSchema, isMcpServerNameEntry, isMcpServerCommandEntry, isMcpServerUrlEntry, init_types2 as init_types1, validateSettingsFileContent, init_validation, getMdmSettings, getHkcuSettings, setMdmSettingsCache, refreshMdmSettings, init_settings, loadManagedFileSettings, getManagedFileSettingsPresence, parseSettingsFile, getSettingsRootPathForSource, getSettingsFilePathForSource, getRelativeSettingsFilePathForSource, getSettingsForSource, getPolicySettingsOrigin, updateSettingsForSource, settingsMergeCustomizer, getManagedSettingsKeysForLogging, getInitialSettings, getSettings_DEPRECATED, getSettingsWithSources, getSettingsWithErrors, hasSkipDangerousModePermissionPrompt, hasAutoModeOptIn, getUseAutoModeDuringPlan, getAutoModeConfig, rawSettingsContainsKey, init_settings2 as init_settings1, getOllamaBaseUrl, init_ollamaConfig, PROVIDER_IDS, DEFAULT_PROVIDER_ID, UR_NATIVE_PROVIDER_BOUNDARY, SUBSCRIPTION_CLI_PROVIDER_BOUNDARY, UNCONFIGURED_SUBSCRIPTION_PROVIDER_BOUNDARY, PROVIDERS, isProviderId, resolveProviderId, providerAliasesFor, getProviderDefinition, getActiveProviderSettings, getProviderRuntimeInfo, getProviderRuntimeBackend, getProviderFamily, getRuntimeProviderId, authModeLabel, getProviderAccessTypeLabel, credentialTypeLabel, getProviderRuntimeKind, getProviderRuntimeBlockReason, isProviderRuntimeSelectable, listProviders, setSafeProviderConfig, classifyGeminiAccountSupport, doctorProvider, doctorActiveProvider, getConnectionStatusFromDoctorResult, formatProviderStatusLabel, getProviderStatus, authAliasForProvider, providerForAuthAlias, buildProviderAuthCommand, launchProviderAuth, formatProviderList, formatProviderDoctor, formatProviderStatus, PROVIDER_MODELS, clearProviderModelCacheForTests, cacheProviderModelsForProvider, listModelsForProviderWithSource, listModelsForProvider, isModelSupportedByProvider, getDefaultModelForProvider, getValidModelIdsForProvider, formatInvalidProviderModelMessage, validateProviderModelPair, validateProviderModelCompatibility, setProviderModel, init_providerRegistry, getAPIProvider, getAPIProviderForStatsig, isFirstPartyURHQBaseUrl, init_providers };
