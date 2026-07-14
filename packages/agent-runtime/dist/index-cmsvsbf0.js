import {
  __commonJS,
  __require
} from "./index-8rxa073f.js";

// node_modules/.bun/@smithy+types@4.15.0/node_modules/@smithy/types/dist-cjs/index.js
var require_dist_cjs = __commonJS((exports) => {
  var HttpAuthLocation;
  (function(HttpAuthLocation2) {
    HttpAuthLocation2["HEADER"] = "header";
    HttpAuthLocation2["QUERY"] = "query";
  })(HttpAuthLocation || (HttpAuthLocation = {}));
  var HttpApiKeyAuthLocation;
  (function(HttpApiKeyAuthLocation2) {
    HttpApiKeyAuthLocation2["HEADER"] = "header";
    HttpApiKeyAuthLocation2["QUERY"] = "query";
  })(HttpApiKeyAuthLocation || (HttpApiKeyAuthLocation = {}));
  var EndpointURLScheme;
  (function(EndpointURLScheme2) {
    EndpointURLScheme2["HTTP"] = "http";
    EndpointURLScheme2["HTTPS"] = "https";
  })(EndpointURLScheme || (EndpointURLScheme = {}));
  var AlgorithmId;
  (function(AlgorithmId2) {
    AlgorithmId2["MD5"] = "md5";
    AlgorithmId2["CRC32"] = "crc32";
    AlgorithmId2["CRC32C"] = "crc32c";
    AlgorithmId2["SHA1"] = "sha1";
    AlgorithmId2["SHA256"] = "sha256";
  })(AlgorithmId || (AlgorithmId = {}));
  var getChecksumConfiguration = (runtimeConfig) => {
    const checksumAlgorithms = [];
    if (runtimeConfig.sha256 !== undefined) {
      checksumAlgorithms.push({
        algorithmId: () => AlgorithmId.SHA256,
        checksumConstructor: () => runtimeConfig.sha256
      });
    }
    if (runtimeConfig.md5 != null) {
      checksumAlgorithms.push({
        algorithmId: () => AlgorithmId.MD5,
        checksumConstructor: () => runtimeConfig.md5
      });
    }
    return {
      addChecksumAlgorithm(algo) {
        checksumAlgorithms.push(algo);
      },
      checksumAlgorithms() {
        return checksumAlgorithms;
      }
    };
  };
  var resolveChecksumRuntimeConfig = (clientConfig) => {
    const runtimeConfig = {};
    clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
      runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
    });
    return runtimeConfig;
  };
  var getDefaultClientConfiguration = (runtimeConfig) => {
    return getChecksumConfiguration(runtimeConfig);
  };
  var resolveDefaultRuntimeConfig = (config) => {
    return resolveChecksumRuntimeConfig(config);
  };
  var FieldPosition;
  (function(FieldPosition2) {
    FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
    FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
  })(FieldPosition || (FieldPosition = {}));
  var SMITHY_CONTEXT_KEY = "__smithy_context";
  var IniSectionType;
  (function(IniSectionType2) {
    IniSectionType2["PROFILE"] = "profile";
    IniSectionType2["SSO_SESSION"] = "sso-session";
    IniSectionType2["SERVICES"] = "services";
  })(IniSectionType || (IniSectionType = {}));
  var RequestHandlerProtocol;
  (function(RequestHandlerProtocol2) {
    RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
    RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
    RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
  })(RequestHandlerProtocol || (RequestHandlerProtocol = {}));
  exports.AlgorithmId = AlgorithmId;
  exports.EndpointURLScheme = EndpointURLScheme;
  exports.FieldPosition = FieldPosition;
  exports.HttpApiKeyAuthLocation = HttpApiKeyAuthLocation;
  exports.HttpAuthLocation = HttpAuthLocation;
  exports.IniSectionType = IniSectionType;
  exports.RequestHandlerProtocol = RequestHandlerProtocol;
  exports.SMITHY_CONTEXT_KEY = SMITHY_CONTEXT_KEY;
  exports.getDefaultClientConfiguration = getDefaultClientConfiguration;
  exports.resolveDefaultRuntimeConfig = resolveDefaultRuntimeConfig;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/transport/index.js
var require_transport = __commonJS((exports) => {
  var { SMITHY_CONTEXT_KEY } = require_dist_cjs();
  var getSmithyContext = (context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});

  class HttpRequest {
    method;
    protocol;
    hostname;
    port;
    path;
    query;
    headers;
    username;
    password;
    fragment;
    body;
    constructor(options) {
      this.method = options.method || "GET";
      this.hostname = options.hostname || "localhost";
      this.port = options.port;
      this.query = options.query || {};
      this.headers = options.headers || {};
      this.body = options.body;
      this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
      this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
      this.username = options.username;
      this.password = options.password;
      this.fragment = options.fragment;
    }
    static clone(request) {
      const cloned = new HttpRequest({
        ...request,
        headers: { ...request.headers }
      });
      if (cloned.query) {
        cloned.query = cloneQuery(cloned.query);
      }
      return cloned;
    }
    static isInstance(request) {
      if (!request) {
        return false;
      }
      const req = request;
      return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
    }
    clone() {
      return HttpRequest.clone(this);
    }
  }
  function cloneQuery(query) {
    return Object.keys(query).reduce((carry, paramName) => {
      const param = query[paramName];
      return {
        ...carry,
        [paramName]: Array.isArray(param) ? [...param] : param
      };
    }, {});
  }

  class HttpResponse {
    statusCode;
    reason;
    headers;
    body;
    constructor(options) {
      this.statusCode = options.statusCode;
      this.reason = options.reason;
      this.headers = options.headers || {};
      this.body = options.body;
    }
    static isInstance(response) {
      if (!response)
        return false;
      const resp = response;
      return typeof resp.statusCode === "number" && typeof resp.headers === "object";
    }
  }
  var VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
  var isValidHostLabel = (value, allowSubDomains = false) => {
    if (!allowSubDomains) {
      return VALID_HOST_LABEL_REGEX.test(value);
    }
    const labels = value.split(".");
    for (const label of labels) {
      if (!isValidHostLabel(label)) {
        return false;
      }
    }
    return true;
  };
  function isValidHostname(hostname) {
    const hostPattern = /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/;
    return hostPattern.test(hostname);
  }
  var normalizeProvider = (input) => {
    if (typeof input === "function")
      return input;
    const promisified = Promise.resolve(input);
    return () => promisified;
  };
  function parseQueryString(querystring) {
    const query = {};
    querystring = querystring.replace(/^\?/, "");
    if (querystring) {
      for (const pair of querystring.split("&")) {
        let [key, value = null] = pair.split("=");
        key = decodeURIComponent(key);
        if (value) {
          value = decodeURIComponent(value);
        }
        if (!(key in query)) {
          query[key] = value;
        } else if (Array.isArray(query[key])) {
          query[key].push(value);
        } else {
          query[key] = [query[key], value];
        }
      }
    }
    return query;
  }
  var parseUrl = (url) => {
    if (typeof url === "string") {
      return parseUrl(new URL(url));
    }
    const { hostname, pathname, port, protocol, search } = url;
    let query;
    if (search) {
      query = parseQueryString(search);
    }
    return {
      hostname,
      port: port ? parseInt(port) : undefined,
      protocol,
      path: pathname,
      query
    };
  };
  var toEndpointV1 = (endpoint) => {
    if (typeof endpoint === "object") {
      if ("url" in endpoint) {
        const v1Endpoint = parseUrl(endpoint.url);
        if (endpoint.headers) {
          v1Endpoint.headers = {};
          for (const name in endpoint.headers) {
            v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
          }
        }
        return v1Endpoint;
      }
      return endpoint;
    }
    return parseUrl(endpoint);
  };
  exports.HttpRequest = HttpRequest;
  exports.HttpResponse = HttpResponse;
  exports.getSmithyContext = getSmithyContext;
  exports.isValidHostLabel = isValidHostLabel;
  exports.isValidHostname = isValidHostname;
  exports.normalizeProvider = normalizeProvider;
  exports.parseQueryString = parseQueryString;
  exports.parseUrl = parseUrl;
  exports.toEndpointV1 = toEndpointV1;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/schema/index.js
var require_schema = __commonJS((exports) => {
  var { getSmithyContext, HttpResponse, toEndpointV1 } = require_transport();
  var deref = (schemaRef) => {
    if (typeof schemaRef === "function") {
      return schemaRef();
    }
    return schemaRef;
  };
  var operation = (namespace, name, traits, input, output) => ({
    name,
    namespace,
    traits,
    input,
    output
  });
  var schemaDeserializationMiddleware = (config) => (next, context) => async (args) => {
    const { response } = await next(args);
    const { operationSchema } = getSmithyContext(context);
    const [, ns, n, t, i, o] = operationSchema ?? [];
    try {
      const parsed = await config.protocol.deserializeResponse(operation(ns, n, t, i, o), {
        ...config,
        ...context
      }, response);
      return {
        response,
        output: parsed
      };
    } catch (error2) {
      Object.defineProperty(error2, "$response", {
        value: response,
        enumerable: false,
        writable: false,
        configurable: false
      });
      if (!("$metadata" in error2)) {
        const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
        try {
          error2.message += `
  ` + hint;
        } catch (e) {
          if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") {
            console.warn(hint);
          } else {
            context.logger?.warn?.(hint);
          }
        }
        if (typeof error2.$responseBodyText !== "undefined") {
          if (error2.$response) {
            error2.$response.body = error2.$responseBodyText;
          }
        }
        try {
          if (HttpResponse.isInstance(response)) {
            const { headers = {}, statusCode } = response;
            const headerEntries = Object.entries(headers);
            error2.$metadata = {
              httpStatusCode: statusCode,
              requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
              extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
              cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
            };
          }
        } catch (e) {}
      }
      throw error2;
    }
  };
  var findHeader = (pattern, headers) => {
    return (headers.find(([k]) => {
      return k.match(pattern);
    }) || [undefined, undefined])[1];
  };
  var schemaSerializationMiddleware = (config) => (next, context) => async (args) => {
    const { operationSchema } = getSmithyContext(context);
    const [, ns, n, t, i, o] = operationSchema ?? [];
    const endpoint = context.endpointV2 ? async () => toEndpointV1(context.endpointV2) : config.endpoint;
    const request = await config.protocol.serializeRequest(operation(ns, n, t, i, o), args.input, {
      ...config,
      ...context,
      endpoint
    });
    return next({
      ...args,
      request
    });
  };
  var deserializerMiddlewareOption = {
    name: "deserializerMiddleware",
    step: "deserialize",
    tags: ["DESERIALIZER"],
    override: true
  };
  var serializerMiddlewareOption = {
    name: "serializerMiddleware",
    step: "serialize",
    tags: ["SERIALIZER"],
    override: true
  };
  function getSchemaSerdePlugin(config) {
    return {
      applyToStack: (commandStack) => {
        commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption);
        commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
        config.protocol.setSerdeContext(config);
      }
    };
  }

  class Schema {
    name;
    namespace;
    traits;
    static assign(instance, values) {
      const schema = Object.assign(instance, values);
      return schema;
    }
    static [Symbol.hasInstance](lhs) {
      const isPrototype = this.prototype.isPrototypeOf(lhs);
      if (!isPrototype && typeof lhs === "object" && lhs !== null) {
        const list2 = lhs;
        return list2.symbol === this.symbol;
      }
      return isPrototype;
    }
    getName() {
      return this.namespace + "#" + this.name;
    }
  }

  class ListSchema extends Schema {
    static symbol = Symbol.for("@smithy/lis");
    name;
    traits;
    valueSchema;
    symbol = ListSchema.symbol;
  }
  var list = (namespace, name, traits, valueSchema) => Schema.assign(new ListSchema, {
    name,
    namespace,
    traits,
    valueSchema
  });

  class MapSchema extends Schema {
    static symbol = Symbol.for("@smithy/map");
    name;
    traits;
    keySchema;
    valueSchema;
    symbol = MapSchema.symbol;
  }
  var map = (namespace, name, traits, keySchema, valueSchema) => Schema.assign(new MapSchema, {
    name,
    namespace,
    traits,
    keySchema,
    valueSchema
  });

  class OperationSchema extends Schema {
    static symbol = Symbol.for("@smithy/ope");
    name;
    traits;
    input;
    output;
    symbol = OperationSchema.symbol;
  }
  var op = (namespace, name, traits, input, output) => Schema.assign(new OperationSchema, {
    name,
    namespace,
    traits,
    input,
    output
  });

  class StructureSchema extends Schema {
    static symbol = Symbol.for("@smithy/str");
    name;
    traits;
    memberNames;
    memberList;
    symbol = StructureSchema.symbol;
  }
  var struct = (namespace, name, traits, memberNames, memberList) => Schema.assign(new StructureSchema, {
    name,
    namespace,
    traits,
    memberNames,
    memberList
  });

  class ErrorSchema extends StructureSchema {
    static symbol = Symbol.for("@smithy/err");
    ctor;
    symbol = ErrorSchema.symbol;
  }
  var error = (namespace, name, traits, memberNames, memberList, ctor) => Schema.assign(new ErrorSchema, {
    name,
    namespace,
    traits,
    memberNames,
    memberList,
    ctor: null
  });
  var traitsCache = [];
  function translateTraits(indicator) {
    if (typeof indicator === "object") {
      return indicator;
    }
    indicator = indicator | 0;
    if (traitsCache[indicator]) {
      return traitsCache[indicator];
    }
    const traits = {};
    let i = 0;
    for (const trait of [
      "httpLabel",
      "idempotent",
      "idempotencyToken",
      "sensitive",
      "httpPayload",
      "httpResponseCode",
      "httpQueryParams"
    ]) {
      if ((indicator >> i++ & 1) === 1) {
        traits[trait] = 1;
      }
    }
    return traitsCache[indicator] = traits;
  }
  var anno = {
    it: Symbol.for("@smithy/nor-struct-it"),
    ns: Symbol.for("@smithy/ns")
  };
  var simpleSchemaCacheN = [];
  var simpleSchemaCacheS = {};

  class NormalizedSchema {
    ref;
    memberName;
    static symbol = Symbol.for("@smithy/nor");
    symbol = NormalizedSchema.symbol;
    name;
    schema;
    _isMemberSchema;
    traits;
    memberTraits;
    normalizedTraits;
    constructor(ref, memberName) {
      this.ref = ref;
      this.memberName = memberName;
      const traitStack = [];
      let _ref = ref;
      let schema = ref;
      this._isMemberSchema = false;
      while (isMemberSchema(_ref)) {
        traitStack.push(_ref[1]);
        _ref = _ref[0];
        schema = deref(_ref);
        this._isMemberSchema = true;
      }
      if (traitStack.length > 0) {
        this.memberTraits = {};
        for (let i = traitStack.length - 1;i >= 0; --i) {
          const traitSet = traitStack[i];
          Object.assign(this.memberTraits, translateTraits(traitSet));
        }
      } else {
        this.memberTraits = 0;
      }
      if (schema instanceof NormalizedSchema) {
        const computedMemberTraits = this.memberTraits;
        Object.assign(this, schema);
        this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
        this.normalizedTraits = undefined;
        this.memberName = memberName ?? schema.memberName;
        return;
      }
      this.schema = deref(schema);
      if (isStaticSchema(this.schema)) {
        this.name = `${this.schema[1]}#${this.schema[2]}`;
        this.traits = this.schema[3];
      } else {
        this.name = this.memberName ?? String(schema);
        this.traits = 0;
      }
      if (this._isMemberSchema && !memberName) {
        throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
      }
    }
    static [Symbol.hasInstance](lhs) {
      const isPrototype = this.prototype.isPrototypeOf(lhs);
      if (!isPrototype && typeof lhs === "object" && lhs !== null) {
        const ns = lhs;
        return ns.symbol === this.symbol;
      }
      return isPrototype;
    }
    static of(ref) {
      const keyAble = typeof ref === "function" || typeof ref === "object" && ref !== null;
      if (typeof ref === "number") {
        if (simpleSchemaCacheN[ref]) {
          return simpleSchemaCacheN[ref];
        }
      } else if (typeof ref === "string") {
        if (simpleSchemaCacheS[ref]) {
          return simpleSchemaCacheS[ref];
        }
      } else if (keyAble) {
        if (ref[anno.ns]) {
          return ref[anno.ns];
        }
      }
      const sc = deref(ref);
      if (sc instanceof NormalizedSchema) {
        return sc;
      }
      if (isMemberSchema(sc)) {
        const [ns2, traits] = sc;
        if (ns2 instanceof NormalizedSchema) {
          Object.assign(ns2.getMergedTraits(), translateTraits(traits));
          return ns2;
        }
        throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
      }
      const ns = new NormalizedSchema(sc);
      if (keyAble) {
        return ref[anno.ns] = ns;
      }
      if (typeof sc === "string") {
        return simpleSchemaCacheS[sc] = ns;
      }
      if (typeof sc === "number") {
        return simpleSchemaCacheN[sc] = ns;
      }
      return ns;
    }
    getSchema() {
      const sc = this.schema;
      if (Array.isArray(sc) && sc[0] === 0) {
        return sc[4];
      }
      return sc;
    }
    getName(withNamespace = false) {
      const { name } = this;
      const short = !withNamespace && name && name.includes("#");
      return short ? name.split("#")[1] : name || undefined;
    }
    getMemberName() {
      return this.memberName;
    }
    isMemberSchema() {
      return this._isMemberSchema;
    }
    isListSchema() {
      const sc = this.getSchema();
      return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
    }
    isMapSchema() {
      const sc = this.getSchema();
      return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
    }
    isStructSchema() {
      const sc = this.getSchema();
      if (typeof sc !== "object") {
        return false;
      }
      const id = sc[0];
      return id === 3 || id === -3 || id === 4;
    }
    isUnionSchema() {
      const sc = this.getSchema();
      if (typeof sc !== "object") {
        return false;
      }
      return sc[0] === 4;
    }
    isBlobSchema() {
      const sc = this.getSchema();
      return sc === 21 || sc === 42;
    }
    isTimestampSchema() {
      const sc = this.getSchema();
      return typeof sc === "number" && sc >= 4 && sc <= 7;
    }
    isUnitSchema() {
      return this.getSchema() === "unit";
    }
    isDocumentSchema() {
      return this.getSchema() === 15;
    }
    isStringSchema() {
      return this.getSchema() === 0;
    }
    isBooleanSchema() {
      return this.getSchema() === 2;
    }
    isNumericSchema() {
      return this.getSchema() === 1;
    }
    isBigIntegerSchema() {
      return this.getSchema() === 17;
    }
    isBigDecimalSchema() {
      return this.getSchema() === 19;
    }
    isStreaming() {
      const { streaming } = this.getMergedTraits();
      return !!streaming || this.getSchema() === 42;
    }
    isIdempotencyToken() {
      return !!this.getMergedTraits().idempotencyToken;
    }
    getMergedTraits() {
      return this.normalizedTraits ?? (this.normalizedTraits = {
        ...this.getOwnTraits(),
        ...this.getMemberTraits()
      });
    }
    getMemberTraits() {
      return translateTraits(this.memberTraits);
    }
    getOwnTraits() {
      return translateTraits(this.traits);
    }
    getKeySchema() {
      const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
      if (!isDoc && !isMap) {
        throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
      }
      const schema = this.getSchema();
      const memberSchema = isDoc ? 15 : schema[4] ?? 0;
      return member([memberSchema, 0], "key");
    }
    getValueSchema() {
      const sc = this.getSchema();
      const [isDoc, isMap, isList] = [this.isDocumentSchema(), this.isMapSchema(), this.isListSchema()];
      const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : undefined;
      if (memberSchema != null) {
        return member([memberSchema, 0], isMap ? "value" : "member");
      }
      throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
    }
    getMemberSchema(memberName) {
      const struct2 = this.getSchema();
      if (this.isStructSchema() && struct2[4].includes(memberName)) {
        const i = struct2[4].indexOf(memberName);
        const memberSchema = struct2[5][i];
        return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
      }
      if (this.isDocumentSchema()) {
        return member([15, 0], memberName);
      }
      throw new Error(`@smithy/core/schema - ${this.getName(true)} has no member=${memberName}.`);
    }
    getMemberSchemas() {
      const buffer = {};
      try {
        for (const [k, v] of this.structIterator()) {
          buffer[k] = v;
        }
      } catch (ignored) {}
      return buffer;
    }
    getEventStreamMember() {
      if (this.isStructSchema()) {
        for (const [memberName, memberSchema] of this.structIterator()) {
          if (memberSchema.isStreaming() && memberSchema.isStructSchema()) {
            return memberName;
          }
        }
      }
      return "";
    }
    *structIterator() {
      if (this.isUnitSchema()) {
        return;
      }
      if (!this.isStructSchema()) {
        throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
      }
      const struct2 = this.getSchema();
      const z = struct2[4].length;
      let it = struct2[anno.it];
      if (it && z === it.length) {
        yield* it;
        return;
      }
      it = Array(z);
      for (let i = 0;i < z; ++i) {
        const k = struct2[4][i];
        const v = member([struct2[5][i], 0], k);
        yield it[i] = [k, v];
      }
      struct2[anno.it] = it;
    }
  }
  function member(memberSchema, memberName) {
    if (memberSchema instanceof NormalizedSchema) {
      return Object.assign(memberSchema, {
        memberName,
        _isMemberSchema: true
      });
    }
    const internalCtorAccess = NormalizedSchema;
    return new internalCtorAccess(memberSchema, memberName);
  }
  var isMemberSchema = (sc) => Array.isArray(sc) && sc.length === 2;
  var isStaticSchema = (sc) => Array.isArray(sc) && sc.length >= 5;

  class SimpleSchema extends Schema {
    static symbol = Symbol.for("@smithy/sim");
    name;
    schemaRef;
    traits;
    symbol = SimpleSchema.symbol;
  }
  var sim = (namespace, name, schemaRef, traits) => Schema.assign(new SimpleSchema, {
    name,
    namespace,
    traits,
    schemaRef
  });
  var simAdapter = (namespace, name, traits, schemaRef) => Schema.assign(new SimpleSchema, {
    name,
    namespace,
    traits,
    schemaRef
  });
  var SCHEMA = {
    BLOB: 21,
    STREAMING_BLOB: 42,
    BOOLEAN: 2,
    STRING: 0,
    NUMERIC: 1,
    BIG_INTEGER: 17,
    BIG_DECIMAL: 19,
    DOCUMENT: 15,
    TIMESTAMP_DEFAULT: 4,
    TIMESTAMP_DATE_TIME: 5,
    TIMESTAMP_HTTP_DATE: 6,
    TIMESTAMP_EPOCH_SECONDS: 7,
    LIST_MODIFIER: 64,
    MAP_MODIFIER: 128
  };

  class TypeRegistry {
    namespace;
    schemas;
    exceptions;
    static registries = new Map;
    constructor(namespace, schemas = new Map, exceptions = new Map) {
      this.namespace = namespace;
      this.schemas = schemas;
      this.exceptions = exceptions;
    }
    static for(namespace) {
      if (!TypeRegistry.registries.has(namespace)) {
        TypeRegistry.registries.set(namespace, new TypeRegistry(namespace));
      }
      return TypeRegistry.registries.get(namespace);
    }
    copyFrom(other) {
      const { schemas, exceptions } = this;
      for (const [k, v] of other.schemas) {
        if (!schemas.has(k)) {
          schemas.set(k, v);
        }
      }
      for (const [k, v] of other.exceptions) {
        if (!exceptions.has(k)) {
          exceptions.set(k, v);
        }
      }
    }
    register(shapeId, schema) {
      const qualifiedName = this.normalizeShapeId(shapeId);
      for (const r of [this, TypeRegistry.for(qualifiedName.split("#")[0])]) {
        r.schemas.set(qualifiedName, schema);
      }
    }
    getSchema(shapeId) {
      const id = this.normalizeShapeId(shapeId);
      if (!this.schemas.has(id)) {
        if (!shapeId.includes("#")) {
          const suffix = "#" + shapeId;
          const candidates = [];
          for (const [shapeId2, schema] of this.schemas.entries()) {
            if (shapeId2.endsWith(suffix)) {
              candidates.push(schema);
            }
          }
          if (candidates.length === 1) {
            return candidates[0];
          }
        }
        throw new Error(`@smithy/core/schema - schema not found for ${id}`);
      }
      return this.schemas.get(id);
    }
    registerError(es, ctor) {
      const $error2 = es;
      const ns = $error2[1];
      for (const r of [this, TypeRegistry.for(ns)]) {
        r.schemas.set(ns + "#" + $error2[2], $error2);
        r.exceptions.set($error2, ctor);
      }
    }
    getErrorCtor(es) {
      const $error2 = es;
      if (this.exceptions.has($error2)) {
        return this.exceptions.get($error2);
      }
      const registry = TypeRegistry.for($error2[1]);
      return registry.exceptions.get($error2);
    }
    getBaseException() {
      for (const exceptionKey of this.exceptions.keys()) {
        if (Array.isArray(exceptionKey)) {
          const [, ns, name] = exceptionKey;
          const id = ns + "#" + name;
          if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) {
            return exceptionKey;
          }
        }
      }
      return;
    }
    find(predicate) {
      for (const schema of this.schemas.values()) {
        if (predicate(schema)) {
          return schema;
        }
      }
      return;
    }
    clear() {
      this.schemas.clear();
      this.exceptions.clear();
    }
    normalizeShapeId(shapeId) {
      if (shapeId.includes("#")) {
        return shapeId;
      }
      return this.namespace + "#" + shapeId;
    }
  }
  exports.ErrorSchema = ErrorSchema;
  exports.ListSchema = ListSchema;
  exports.MapSchema = MapSchema;
  exports.NormalizedSchema = NormalizedSchema;
  exports.OperationSchema = OperationSchema;
  exports.SCHEMA = SCHEMA;
  exports.Schema = Schema;
  exports.SimpleSchema = SimpleSchema;
  exports.StructureSchema = StructureSchema;
  exports.TypeRegistry = TypeRegistry;
  exports.deref = deref;
  exports.deserializerMiddlewareOption = deserializerMiddlewareOption;
  exports.error = error;
  exports.getSchemaSerdePlugin = getSchemaSerdePlugin;
  exports.isStaticSchema = isStaticSchema;
  exports.list = list;
  exports.map = map;
  exports.op = op;
  exports.operation = operation;
  exports.serializerMiddlewareOption = serializerMiddlewareOption;
  exports.sim = sim;
  exports.simAdapter = simAdapter;
  exports.simpleSchemaCacheN = simpleSchemaCacheN;
  exports.simpleSchemaCacheS = simpleSchemaCacheS;
  exports.struct = struct;
  exports.traitsCache = traitsCache;
  exports.translateTraits = translateTraits;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/client/index.js
var require_client = __commonJS((exports) => {
  var { getSmithyContext, normalizeProvider } = require_transport();
  exports.getSmithyContext = getSmithyContext;
  exports.normalizeProvider = normalizeProvider;
  var { SMITHY_CONTEXT_KEY, AlgorithmId } = require_dist_cjs();
  exports.AlgorithmId = AlgorithmId;
  var { NormalizedSchema } = require_schema();
  var getAllAliases = (name, aliases) => {
    const _aliases = [];
    if (name) {
      _aliases.push(name);
    }
    if (aliases) {
      for (const alias of aliases) {
        _aliases.push(alias);
      }
    }
    return _aliases;
  };
  var getMiddlewareNameWithAliases = (name, aliases) => {
    return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
  };
  var constructStack = () => {
    let absoluteEntries = [];
    let relativeEntries = [];
    let identifyOnResolve = false;
    const entriesNameSet = new Set;
    const sort = (entries) => entries.sort((a, b) => stepWeights[b.step] - stepWeights[a.step] || priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"]);
    const removeByName = (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        const aliases = getAllAliases(entry.name, entry.aliases);
        if (aliases.includes(toRemove)) {
          isRemoved = true;
          for (const alias of aliases) {
            entriesNameSet.delete(alias);
          }
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    };
    const removeByReference = (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        if (entry.middleware === toRemove) {
          isRemoved = true;
          for (const alias of getAllAliases(entry.name, entry.aliases)) {
            entriesNameSet.delete(alias);
          }
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    };
    const cloneTo = (toStack) => {
      absoluteEntries.forEach((entry) => {
        toStack.add(entry.middleware, { ...entry });
      });
      relativeEntries.forEach((entry) => {
        toStack.addRelativeTo(entry.middleware, { ...entry });
      });
      toStack.identifyOnResolve?.(stack.identifyOnResolve());
      return toStack;
    };
    const expandRelativeMiddlewareList = (from) => {
      const expandedMiddlewareList = [];
      from.before.forEach((entry) => {
        if (entry.before.length === 0 && entry.after.length === 0) {
          expandedMiddlewareList.push(entry);
        } else {
          expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
        }
      });
      expandedMiddlewareList.push(from);
      from.after.reverse().forEach((entry) => {
        if (entry.before.length === 0 && entry.after.length === 0) {
          expandedMiddlewareList.push(entry);
        } else {
          expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
        }
      });
      return expandedMiddlewareList;
    };
    const getMiddlewareList = (debug = false) => {
      const normalizedAbsoluteEntries = [];
      const normalizedRelativeEntries = [];
      const normalizedEntriesNameMap = {};
      absoluteEntries.forEach((entry) => {
        const normalizedEntry = {
          ...entry,
          before: [],
          after: []
        };
        for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
          normalizedEntriesNameMap[alias] = normalizedEntry;
        }
        normalizedAbsoluteEntries.push(normalizedEntry);
      });
      relativeEntries.forEach((entry) => {
        const normalizedEntry = {
          ...entry,
          before: [],
          after: []
        };
        for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
          normalizedEntriesNameMap[alias] = normalizedEntry;
        }
        normalizedRelativeEntries.push(normalizedEntry);
      });
      normalizedRelativeEntries.forEach((entry) => {
        if (entry.toMiddleware) {
          const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
          if (toMiddleware === undefined) {
            if (debug) {
              return;
            }
            throw new Error(`${entry.toMiddleware} is not found when adding ` + `${getMiddlewareNameWithAliases(entry.name, entry.aliases)} ` + `middleware ${entry.relation} ${entry.toMiddleware}`);
          }
          if (entry.relation === "after") {
            toMiddleware.after.push(entry);
          }
          if (entry.relation === "before") {
            toMiddleware.before.push(entry);
          }
        }
      });
      const mainChain = sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
        wholeList.push(...expandedMiddlewareList);
        return wholeList;
      }, []);
      return mainChain;
    };
    const stack = {
      add: (middleware, options = {}) => {
        const { name, override, aliases: _aliases } = options;
        const entry = {
          step: "initialize",
          priority: "normal",
          middleware,
          ...options
        };
        const aliases = getAllAliases(name, _aliases);
        if (aliases.length > 0) {
          if (aliases.some((alias) => entriesNameSet.has(alias))) {
            if (!override)
              throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
            for (const alias of aliases) {
              const toOverrideIndex = absoluteEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a) => a === alias));
              if (toOverrideIndex === -1) {
                continue;
              }
              const toOverride = absoluteEntries[toOverrideIndex];
              if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
                throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ` + `${toOverride.priority} priority in ${toOverride.step} step cannot ` + `be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ` + `${entry.priority} priority in ${entry.step} step.`);
              }
              absoluteEntries.splice(toOverrideIndex, 1);
            }
          }
          for (const alias of aliases) {
            entriesNameSet.add(alias);
          }
        }
        absoluteEntries.push(entry);
      },
      addRelativeTo: (middleware, options) => {
        const { name, override, aliases: _aliases } = options;
        const entry = {
          middleware,
          ...options
        };
        const aliases = getAllAliases(name, _aliases);
        if (aliases.length > 0) {
          if (aliases.some((alias) => entriesNameSet.has(alias))) {
            if (!override)
              throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
            for (const alias of aliases) {
              const toOverrideIndex = relativeEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a) => a === alias));
              if (toOverrideIndex === -1) {
                continue;
              }
              const toOverride = relativeEntries[toOverrideIndex];
              if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
                throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ` + `${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden ` + `by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} ` + `"${entry.toMiddleware}" middleware.`);
              }
              relativeEntries.splice(toOverrideIndex, 1);
            }
          }
          for (const alias of aliases) {
            entriesNameSet.add(alias);
          }
        }
        relativeEntries.push(entry);
      },
      clone: () => cloneTo(constructStack()),
      use: (plugin) => {
        plugin.applyToStack(stack);
      },
      remove: (toRemove) => {
        if (typeof toRemove === "string")
          return removeByName(toRemove);
        else
          return removeByReference(toRemove);
      },
      removeByTag: (toRemove) => {
        let isRemoved = false;
        const filterCb = (entry) => {
          const { tags, name, aliases: _aliases } = entry;
          if (tags && tags.includes(toRemove)) {
            const aliases = getAllAliases(name, _aliases);
            for (const alias of aliases) {
              entriesNameSet.delete(alias);
            }
            isRemoved = true;
            return false;
          }
          return true;
        };
        absoluteEntries = absoluteEntries.filter(filterCb);
        relativeEntries = relativeEntries.filter(filterCb);
        return isRemoved;
      },
      concat: (from) => {
        const cloned = cloneTo(constructStack());
        cloned.use(from);
        cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
        return cloned;
      },
      applyToStack: cloneTo,
      identify: () => {
        return getMiddlewareList(true).map((mw) => {
          const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
          return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
        });
      },
      identifyOnResolve(toggle) {
        if (typeof toggle === "boolean")
          identifyOnResolve = toggle;
        return identifyOnResolve;
      },
      resolve: (handler, context) => {
        for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) {
          handler = middleware(handler, context);
        }
        if (identifyOnResolve) {
          console.log(stack.identify());
        }
        return handler;
      }
    };
    return stack;
  };
  var stepWeights = {
    initialize: 5,
    serialize: 4,
    build: 3,
    finalizeRequest: 2,
    deserialize: 1
  };
  var priorityWeights = {
    high: 3,
    normal: 2,
    low: 1
  };
  var invalidFunction = (message) => () => {
    throw new Error(message);
  };
  var invalidProvider = (message) => () => Promise.reject(message);
  var getCircularReplacer = () => {
    const seen = new WeakSet;
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  };
  var sleep = (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  };
  var waiterServiceDefaults = {
    minDelay: 2,
    maxDelay: 120
  };
  var WaiterState;
  (function(WaiterState2) {
    WaiterState2["ABORTED"] = "ABORTED";
    WaiterState2["FAILURE"] = "FAILURE";
    WaiterState2["SUCCESS"] = "SUCCESS";
    WaiterState2["RETRY"] = "RETRY";
    WaiterState2["TIMEOUT"] = "TIMEOUT";
  })(WaiterState || (WaiterState = {}));
  var checkExceptions = (result) => {
    if (result.state === WaiterState.ABORTED) {
      const abortError = new Error(`${JSON.stringify({
        ...result,
        reason: "Request was aborted"
      }, getCircularReplacer())}`);
      abortError.name = "AbortError";
      throw abortError;
    } else if (result.state === WaiterState.TIMEOUT) {
      const timeoutError = new Error(`${JSON.stringify({
        ...result,
        reason: "Waiter has timed out"
      }, getCircularReplacer())}`);
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    } else if (result.state !== WaiterState.SUCCESS) {
      throw new Error(`${JSON.stringify(result, getCircularReplacer())}`);
    }
    return result;
  };
  var runPolling = async ({ minDelay, maxDelay, maxWaitTime, abortController, client, abortSignal }, input, acceptorChecks) => {
    const observedResponses = {};
    const [minDelayMs, maxDelayMs] = [minDelay * 1000, maxDelay * 1000];
    let currentAttempt = 0;
    const waitUntil = Date.now() + maxWaitTime * 1000;
    const warn403Time = Date.now() + 60000;
    let didWarn403 = false;
    while (true) {
      if (currentAttempt > 0) {
        const delayMs = exponentialBackoffWithJitter(minDelayMs, maxDelayMs, currentAttempt, waitUntil);
        if (abortController?.signal?.aborted || abortSignal?.aborted) {
          const message = "AbortController signal aborted.";
          observedResponses[message] |= 0;
          observedResponses[message] += 1;
          return { state: WaiterState.ABORTED, observedResponses };
        }
        if (Date.now() + delayMs > waitUntil) {
          return { state: WaiterState.TIMEOUT, observedResponses };
        }
        await sleep(delayMs / 1000);
      }
      const { state, reason } = await acceptorChecks(client, input);
      if (reason) {
        const message = createMessageFromResponse(reason);
        observedResponses[message] |= 0;
        observedResponses[message] += 1;
      }
      if (state !== WaiterState.RETRY) {
        return { state, reason, final: reason, observedResponses };
      }
      currentAttempt += 1;
      if (!didWarn403 && Date.now() >= warn403Time) {
        checkWarn403(observedResponses, client);
        didWarn403 = true;
      }
    }
  };
  var checkWarn403 = (observedResponses = {}, client) => {
    const orderedErrors = Object.keys(observedResponses);
    let count403 = 0;
    for (const response of orderedErrors) {
      const n = observedResponses[response] | 0;
      if (response.startsWith("403:")) {
        count403 += n;
      }
    }
    const clientLogger = client?.config?.logger;
    const warningLogger = typeof clientLogger?.warn === "function" && !clientLogger.constructor?.name?.includes?.("NoOpLogger") ? clientLogger : console;
    if (count403 >= 3 || orderedErrors[orderedErrors.length - 1]?.startsWith("403:")) {
      warningLogger.warn(`@smithy/util-waiter WARN - 403 status code encountered during waiter polling.`);
    }
  };
  var createMessageFromResponse = (reason) => {
    const status = reason?.$response?.statusCode ?? reason?.$metadata?.httpStatusCode;
    if (reason?.$responseBodyText) {
      return `${status ? status + ": " : ""}Deserialization error for body: ${reason.$responseBodyText}`;
    }
    if (status) {
      if (reason?.$response || reason?.message) {
        return `${status ?? "Unknown"}: ${reason?.message}`;
      }
      return `${status}: OK`;
    }
    return String(reason?.message ?? JSON.stringify(reason, getCircularReplacer()) ?? "Unknown");
  };
  var exponentialBackoffWithJitter = (minDelayMs, maxDelayMs, attempt, waitUntil) => {
    const attemptCountCeiling = Math.log(maxDelayMs / minDelayMs) / Math.log(2) + 1;
    if (attempt > attemptCountCeiling) {
      return maxDelayMs;
    }
    const delay = minDelayMs * 2 ** (attempt - 1);
    const capped = Math.min(delay, maxDelayMs);
    const waitFor = randomInRange(minDelayMs, capped);
    if (Date.now() + waitFor > waitUntil) {
      const timeRemaining = waitUntil - Date.now();
      return Math.max(0, timeRemaining - 500);
    }
    return waitFor;
  };
  var randomInRange = (min, max) => min + Math.random() * (max - min);
  var validateWaiterOptions = (options) => {
    if (options.maxWaitTime <= 0) {
      throw new Error(`WaiterConfiguration.maxWaitTime must be greater than 0`);
    } else if (options.minDelay <= 0) {
      throw new Error(`WaiterConfiguration.minDelay must be greater than 0`);
    } else if (options.maxDelay <= 0) {
      throw new Error(`WaiterConfiguration.maxDelay must be greater than 0`);
    } else if (options.maxWaitTime <= options.minDelay) {
      throw new Error(`WaiterConfiguration.maxWaitTime [${options.maxWaitTime}] must be greater than WaiterConfiguration.minDelay [${options.minDelay}] for this waiter`);
    } else if (options.maxDelay < options.minDelay) {
      throw new Error(`WaiterConfiguration.maxDelay [${options.maxDelay}] must be greater than WaiterConfiguration.minDelay [${options.minDelay}] for this waiter`);
    }
  };
  var abortTimeout = (abortSignal) => {
    let onAbort;
    const promise = new Promise((resolve) => {
      onAbort = () => resolve({ state: WaiterState.ABORTED });
      if (typeof abortSignal.addEventListener === "function") {
        abortSignal.addEventListener("abort", onAbort);
      } else {
        abortSignal.onabort = onAbort;
      }
    });
    return {
      clearListener() {
        if (typeof abortSignal.removeEventListener === "function") {
          abortSignal.removeEventListener("abort", onAbort);
        }
      },
      aborted: promise
    };
  };
  var createWaiter = async (options, input, acceptorChecks) => {
    const params = {
      ...waiterServiceDefaults,
      ...options
    };
    validateWaiterOptions(params);
    const exitConditions = [runPolling(params, input, acceptorChecks)];
    const finalize = [];
    if (options.abortSignal) {
      const { aborted, clearListener } = abortTimeout(options.abortSignal);
      finalize.push(clearListener);
      exitConditions.push(aborted);
    }
    if (options.abortController?.signal) {
      const { aborted, clearListener } = abortTimeout(options.abortController.signal);
      finalize.push(clearListener);
      exitConditions.push(aborted);
    }
    return Promise.race(exitConditions).then((result) => {
      for (const fn of finalize) {
        fn();
      }
      return result;
    });
  };

  class Client {
    config;
    middlewareStack = constructStack();
    initConfig;
    handlers;
    constructor(config) {
      this.config = config;
      const { protocol, protocolSettings } = config;
      if (protocolSettings) {
        if (typeof protocol === "function") {
          config.protocol = new protocol(protocolSettings);
        }
      }
    }
    send(command, optionsOrCb, cb) {
      const options = typeof optionsOrCb !== "function" ? optionsOrCb : undefined;
      const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
      const useHandlerCache = options === undefined && this.config.cacheMiddleware === true;
      let handler;
      if (useHandlerCache) {
        if (!this.handlers) {
          this.handlers = new WeakMap;
        }
        const handlers = this.handlers;
        if (handlers.has(command.constructor)) {
          handler = handlers.get(command.constructor);
        } else {
          handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
          handlers.set(command.constructor, handler);
        }
      } else {
        delete this.handlers;
        handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
      }
      if (callback) {
        handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {});
      } else {
        return handler(command).then((result) => result.output);
      }
    }
    destroy() {
      this.config?.requestHandler?.destroy?.();
      delete this.handlers;
    }
  }
  var SENSITIVE_STRING$1 = "***SensitiveInformation***";
  function schemaLogFilter(schema, data) {
    if (data == null) {
      return data;
    }
    const ns = NormalizedSchema.of(schema);
    if (ns.getMergedTraits().sensitive) {
      return SENSITIVE_STRING$1;
    }
    if (ns.isListSchema()) {
      const isSensitive = !!ns.getValueSchema().getMergedTraits().sensitive;
      if (isSensitive) {
        return SENSITIVE_STRING$1;
      }
    } else if (ns.isMapSchema()) {
      const isSensitive = !!ns.getKeySchema().getMergedTraits().sensitive || !!ns.getValueSchema().getMergedTraits().sensitive;
      if (isSensitive) {
        return SENSITIVE_STRING$1;
      }
    } else if (ns.isStructSchema() && typeof data === "object") {
      const object = data;
      const newObject = {};
      for (const [member, memberNs] of ns.structIterator()) {
        if (object[member] != null) {
          newObject[member] = schemaLogFilter(memberNs, object[member]);
        }
      }
      return newObject;
    }
    return data;
  }

  class Command {
    middlewareStack = constructStack();
    schema;
    static classBuilder() {
      return new ClassBuilder;
    }
    resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
      for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
        this.middlewareStack.use(mw);
      }
      const stack = clientStack.concat(this.middlewareStack);
      const { logger } = configuration;
      const handlerExecutionContext = {
        logger,
        clientName,
        commandName,
        inputFilterSensitiveLog,
        outputFilterSensitiveLog,
        [SMITHY_CONTEXT_KEY]: {
          commandInstance: this,
          ...smithyContext
        },
        ...additionalContext
      };
      const { requestHandler } = configuration;
      let requestOptions = options ?? {};
      if (smithyContext.eventStream) {
        requestOptions = {
          isEventStream: true,
          ...requestOptions
        };
      }
      return stack.resolve((request) => requestHandler.handle(request.request, requestOptions), handlerExecutionContext);
    }
  }

  class ClassBuilder {
    _init = () => {};
    _ep = {};
    _middlewareFn = () => [];
    _commandName = "";
    _clientName = "";
    _additionalContext = {};
    _smithyContext = {};
    _inputFilterSensitiveLog = undefined;
    _outputFilterSensitiveLog = undefined;
    _serializer = null;
    _deserializer = null;
    _operationSchema;
    init(cb) {
      this._init = cb;
    }
    ep(endpointParameterInstructions) {
      this._ep = endpointParameterInstructions;
      return this;
    }
    m(middlewareSupplier) {
      this._middlewareFn = middlewareSupplier;
      return this;
    }
    s(service, operation, smithyContext = {}) {
      this._smithyContext = {
        service,
        operation,
        ...smithyContext
      };
      return this;
    }
    c(additionalContext = {}) {
      this._additionalContext = additionalContext;
      return this;
    }
    n(clientName, commandName) {
      this._clientName = clientName;
      this._commandName = commandName;
      return this;
    }
    f(inputFilter = (_) => _, outputFilter = (_) => _) {
      this._inputFilterSensitiveLog = inputFilter;
      this._outputFilterSensitiveLog = outputFilter;
      return this;
    }
    ser(serializer) {
      this._serializer = serializer;
      return this;
    }
    de(deserializer) {
      this._deserializer = deserializer;
      return this;
    }
    sc(operation) {
      this._operationSchema = operation;
      this._smithyContext.operationSchema = operation;
      return this;
    }
    build() {
      const closure = this;
      let CommandRef;
      return CommandRef = class extends Command {
        input;
        static getEndpointParameterInstructions() {
          return closure._ep;
        }
        constructor(...[input]) {
          super();
          this.input = input ?? {};
          closure._init(this);
          this.schema = closure._operationSchema;
        }
        resolveMiddleware(stack, configuration, options) {
          const op = closure._operationSchema;
          const input = op?.[4] ?? op?.input;
          const output = op?.[5] ?? op?.output;
          return this.resolveMiddlewareWithContext(stack, configuration, options, {
            CommandCtor: CommandRef,
            middlewareFn: closure._middlewareFn,
            clientName: closure._clientName,
            commandName: closure._commandName,
            inputFilterSensitiveLog: closure._inputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, input) : (_) => _),
            outputFilterSensitiveLog: closure._outputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, output) : (_) => _),
            smithyContext: closure._smithyContext,
            additionalContext: closure._additionalContext
          });
        }
        serialize = closure._serializer;
        deserialize = closure._deserializer;
      };
    }
  }
  var SENSITIVE_STRING = "***SensitiveInformation***";
  var createAggregatedClient = (commands, Client2, options) => {
    for (const [command, CommandCtor] of Object.entries(commands)) {
      const methodImpl = async function(args, optionsOrCb, cb) {
        const command2 = new CommandCtor(args);
        if (typeof optionsOrCb === "function") {
          this.send(command2, optionsOrCb);
        } else if (typeof cb === "function") {
          if (typeof optionsOrCb !== "object")
            throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
          this.send(command2, optionsOrCb || {}, cb);
        } else {
          return this.send(command2, optionsOrCb);
        }
      };
      const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
      Client2.prototype[methodName] = methodImpl;
    }
    const { paginators = {}, waiters = {} } = options ?? {};
    for (const [paginatorName, paginatorFn] of Object.entries(paginators)) {
      if (Client2.prototype[paginatorName] === undefined) {
        Client2.prototype[paginatorName] = function(commandInput = {}, paginationConfiguration, ...rest) {
          return paginatorFn({
            ...paginationConfiguration,
            client: this
          }, commandInput, ...rest);
        };
      }
    }
    for (const [waiterName, waiterFn] of Object.entries(waiters)) {
      if (Client2.prototype[waiterName] === undefined) {
        Client2.prototype[waiterName] = async function(commandInput = {}, waiterConfiguration, ...rest) {
          let config = waiterConfiguration;
          if (typeof waiterConfiguration === "number") {
            config = {
              maxWaitTime: waiterConfiguration
            };
          }
          return waiterFn({
            ...config,
            client: this
          }, commandInput, ...rest);
        };
      }
    }
  };

  class ServiceException extends Error {
    $fault;
    $response;
    $retryable;
    $metadata;
    constructor(options) {
      super(options.message);
      Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
      this.name = options.name;
      this.$fault = options.$fault;
      this.$metadata = options.$metadata;
    }
    static isInstance(value) {
      if (!value)
        return false;
      const candidate = value;
      return ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
    }
    static [Symbol.hasInstance](instance) {
      if (!instance)
        return false;
      const candidate = instance;
      if (this === ServiceException) {
        return ServiceException.isInstance(instance);
      }
      if (ServiceException.isInstance(instance)) {
        if (candidate.name && this.name) {
          return this.prototype.isPrototypeOf(instance) || candidate.name === this.name;
        }
        return this.prototype.isPrototypeOf(instance);
      }
      return false;
    }
  }
  var decorateServiceException = (exception, additions = {}) => {
    Object.entries(additions).filter(([, v]) => v !== undefined).forEach(([k, v]) => {
      if (exception[k] == undefined || exception[k] === "") {
        exception[k] = v;
      }
    });
    const message = exception.message || exception.Message || "UnknownError";
    exception.message = message;
    delete exception.Message;
    return exception;
  };
  var throwDefaultError = ({ output, parsedBody, exceptionCtor, errorCode }) => {
    const $metadata = deserializeMetadata(output);
    const statusCode = $metadata.httpStatusCode ? $metadata.httpStatusCode + "" : undefined;
    const response = new exceptionCtor({
      name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
      $fault: "client",
      $metadata
    });
    throw decorateServiceException(response, parsedBody);
  };
  var withBaseException = (ExceptionCtor) => {
    return ({ output, parsedBody, errorCode }) => {
      throwDefaultError({ output, parsedBody, exceptionCtor: ExceptionCtor, errorCode });
    };
  };
  var deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"]
  });
  var loadConfigsForDefaultMode = (mode) => {
    switch (mode) {
      case "standard":
        return {
          retryMode: "standard",
          connectionTimeout: 3100
        };
      case "in-region":
        return {
          retryMode: "standard",
          connectionTimeout: 1100
        };
      case "cross-region":
        return {
          retryMode: "standard",
          connectionTimeout: 3100
        };
      case "mobile":
        return {
          retryMode: "standard",
          connectionTimeout: 30000
        };
      default:
        return {};
    }
  };
  var warningEmitted = false;
  var emitWarningIfUnsupportedVersion = (version) => {
    if (version && !warningEmitted && parseInt(version.substring(1, version.indexOf("."))) < 16) {
      warningEmitted = true;
    }
  };
  var knownAlgorithms = Object.values(AlgorithmId);
  var getChecksumConfiguration = (runtimeConfig) => {
    const checksumAlgorithms = [];
    for (const id in AlgorithmId) {
      const algorithmId = AlgorithmId[id];
      if (runtimeConfig[algorithmId] === undefined) {
        continue;
      }
      checksumAlgorithms.push({
        algorithmId: () => algorithmId,
        checksumConstructor: () => runtimeConfig[algorithmId]
      });
    }
    for (const [id, ChecksumCtor] of Object.entries(runtimeConfig.checksumAlgorithms ?? {})) {
      checksumAlgorithms.push({
        algorithmId: () => id,
        checksumConstructor: () => ChecksumCtor
      });
    }
    return {
      addChecksumAlgorithm(algo) {
        runtimeConfig.checksumAlgorithms = runtimeConfig.checksumAlgorithms ?? {};
        const id = algo.algorithmId();
        const ctor = algo.checksumConstructor();
        if (knownAlgorithms.includes(id)) {
          runtimeConfig.checksumAlgorithms[id.toUpperCase()] = ctor;
        } else {
          runtimeConfig.checksumAlgorithms[id] = ctor;
        }
        checksumAlgorithms.push(algo);
      },
      checksumAlgorithms() {
        return checksumAlgorithms;
      }
    };
  };
  var resolveChecksumRuntimeConfig = (clientConfig) => {
    const runtimeConfig = {};
    clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
      const id = checksumAlgorithm.algorithmId();
      if (knownAlgorithms.includes(id)) {
        runtimeConfig[id] = checksumAlgorithm.checksumConstructor();
      }
    });
    return runtimeConfig;
  };
  var getRetryConfiguration = (runtimeConfig) => {
    return {
      setRetryStrategy(retryStrategy) {
        runtimeConfig.retryStrategy = retryStrategy;
      },
      retryStrategy() {
        return runtimeConfig.retryStrategy;
      }
    };
  };
  var resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
    const runtimeConfig = {};
    runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
    return runtimeConfig;
  };
  var getDefaultExtensionConfiguration = (runtimeConfig) => {
    return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
  };
  var getDefaultClientConfiguration = getDefaultExtensionConfiguration;
  var resolveDefaultRuntimeConfig = (config) => {
    return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
  };
  var getArrayIfSingleItem = (mayBeArray) => Array.isArray(mayBeArray) ? mayBeArray : [mayBeArray];
  var getValueFromTextNode = (obj) => {
    const textNodeName = "#text";
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key][textNodeName] !== undefined) {
        obj[key] = obj[key][textNodeName];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = getValueFromTextNode(obj[key]);
      }
    }
    return obj;
  };
  var isSerializableHeaderValue = (value) => {
    return value != null;
  };

  class NoOpLogger {
    trace() {}
    debug() {}
    info() {}
    warn() {}
    error() {}
  }
  function map(arg0, arg1, arg2) {
    let target;
    let filter;
    let instructions;
    if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
      target = {};
      instructions = arg0;
    } else {
      target = arg0;
      if (typeof arg1 === "function") {
        filter = arg1;
        instructions = arg2;
        return mapWithFilter(target, filter, instructions);
      } else {
        instructions = arg1;
      }
    }
    for (const key of Object.keys(instructions)) {
      if (!Array.isArray(instructions[key])) {
        target[key] = instructions[key];
        continue;
      }
      applyInstruction(target, null, instructions, key);
    }
    return target;
  }
  var convertMap = (target) => {
    const output = {};
    for (const [k, v] of Object.entries(target || {})) {
      output[k] = [, v];
    }
    return output;
  };
  var take = (source, instructions) => {
    const out = {};
    for (const key in instructions) {
      applyInstruction(out, source, instructions, key);
    }
    return out;
  };
  var mapWithFilter = (target, filter, instructions) => {
    return map(target, Object.entries(instructions).reduce((_instructions, [key, value]) => {
      if (Array.isArray(value)) {
        _instructions[key] = value;
      } else {
        if (typeof value === "function") {
          _instructions[key] = [filter, value()];
        } else {
          _instructions[key] = [filter, value];
        }
      }
      return _instructions;
    }, {}));
  };
  var applyInstruction = (target, source, instructions, targetKey) => {
    if (source !== null) {
      let instruction = instructions[targetKey];
      if (typeof instruction === "function") {
        instruction = [, instruction];
      }
      const [filter2 = nonNullish, valueFn = pass, sourceKey = targetKey] = instruction;
      if (typeof filter2 === "function" && filter2(source[sourceKey]) || typeof filter2 !== "function" && !!filter2) {
        target[targetKey] = valueFn(source[sourceKey]);
      }
      return;
    }
    let [filter, value] = instructions[targetKey];
    if (typeof value === "function") {
      let _value;
      const defaultFilterPassed = filter === undefined && (_value = value()) != null;
      const customFilterPassed = typeof filter === "function" && !!filter(undefined) || typeof filter !== "function" && !!filter;
      if (defaultFilterPassed) {
        target[targetKey] = _value;
      } else if (customFilterPassed) {
        target[targetKey] = value();
      }
    } else {
      const defaultFilterPassed = filter === undefined && value != null;
      const customFilterPassed = typeof filter === "function" && !!filter(value) || typeof filter !== "function" && !!filter;
      if (defaultFilterPassed || customFilterPassed) {
        target[targetKey] = value;
      }
    }
  };
  var nonNullish = (_) => _ != null;
  var pass = (_) => _;
  var serializeFloat = (value) => {
    if (value !== value) {
      return "NaN";
    }
    switch (value) {
      case Infinity:
        return "Infinity";
      case -Infinity:
        return "-Infinity";
      default:
        return value;
    }
  };
  var serializeDateTime = (date) => date.toISOString().replace(".000Z", "Z");
  var _json = (obj) => {
    if (obj == null) {
      return {};
    }
    if (Array.isArray(obj)) {
      return obj.filter((_) => _ != null).map(_json);
    }
    if (typeof obj === "object") {
      const target = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] == null) {
          continue;
        }
        target[key] = _json(obj[key]);
      }
      return target;
    }
    return obj;
  };
  exports.Client = Client;
  exports.Command = Command;
  exports.NoOpLogger = NoOpLogger;
  exports.SENSITIVE_STRING = SENSITIVE_STRING;
  exports.ServiceException = ServiceException;
  exports.WaiterState = WaiterState;
  exports._json = _json;
  exports.checkExceptions = checkExceptions;
  exports.constructStack = constructStack;
  exports.convertMap = convertMap;
  exports.createAggregatedClient = createAggregatedClient;
  exports.createWaiter = createWaiter;
  exports.decorateServiceException = decorateServiceException;
  exports.emitWarningIfUnsupportedVersion = emitWarningIfUnsupportedVersion;
  exports.getArrayIfSingleItem = getArrayIfSingleItem;
  exports.getChecksumConfiguration = getChecksumConfiguration;
  exports.getDefaultClientConfiguration = getDefaultClientConfiguration;
  exports.getDefaultExtensionConfiguration = getDefaultExtensionConfiguration;
  exports.getRetryConfiguration = getRetryConfiguration;
  exports.getValueFromTextNode = getValueFromTextNode;
  exports.invalidFunction = invalidFunction;
  exports.invalidProvider = invalidProvider;
  exports.isSerializableHeaderValue = isSerializableHeaderValue;
  exports.loadConfigsForDefaultMode = loadConfigsForDefaultMode;
  exports.map = map;
  exports.resolveChecksumRuntimeConfig = resolveChecksumRuntimeConfig;
  exports.resolveDefaultRuntimeConfig = resolveDefaultRuntimeConfig;
  exports.resolveRetryRuntimeConfig = resolveRetryRuntimeConfig;
  exports.schemaLogFilter = schemaLogFilter;
  exports.serializeDateTime = serializeDateTime;
  exports.serializeFloat = serializeFloat;
  exports.take = take;
  exports.throwDefaultError = throwDefaultError;
  exports.waiterServiceDefaults = waiterServiceDefaults;
  exports.withBaseException = withBaseException;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/config/index.js
var require_config = __commonJS((exports) => {
  var { homedir } = __require("node:os");
  var { sep, join } = __require("node:path");
  var { createHash } = __require("node:crypto");
  var { readFile: readFile$1 } = __require("node:fs/promises");
  var { IniSectionType } = require_dist_cjs();
  var { normalizeProvider } = require_client();
  var { isValidHostLabel } = require_transport();

  class ProviderError extends Error {
    name = "ProviderError";
    tryNextLink;
    constructor(message, options = true) {
      let logger;
      let tryNextLink = true;
      if (typeof options === "boolean") {
        logger = undefined;
        tryNextLink = options;
      } else if (options != null && typeof options === "object") {
        logger = options.logger;
        tryNextLink = options.tryNextLink ?? true;
      }
      super(message);
      this.tryNextLink = tryNextLink;
      Object.setPrototypeOf(this, ProviderError.prototype);
      logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
    }
    static from(error, options = true) {
      return Object.assign(new this(error.message, options), error);
    }
  }

  class CredentialsProviderError extends ProviderError {
    name = "CredentialsProviderError";
    constructor(message, options = true) {
      super(message, options);
      Object.setPrototypeOf(this, CredentialsProviderError.prototype);
    }
  }

  class TokenProviderError extends ProviderError {
    name = "TokenProviderError";
    constructor(message, options = true) {
      super(message, options);
      Object.setPrototypeOf(this, TokenProviderError.prototype);
    }
  }
  var chain = (...providers) => async () => {
    if (providers.length === 0) {
      throw new ProviderError("No providers in chain");
    }
    let lastProviderError;
    for (const provider of providers) {
      try {
        const credentials = await provider();
        return credentials;
      } catch (err) {
        lastProviderError = err;
        if (err?.tryNextLink) {
          continue;
        }
        throw err;
      }
    }
    throw lastProviderError;
  };
  var fromValue = (staticValue) => () => Promise.resolve(staticValue);
  var memoize = (provider, isExpired, requiresRefresh) => {
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async () => {
      if (!pending) {
        pending = provider();
      }
      try {
        resolved = await pending;
        hasResult = true;
        isConstant = false;
      } finally {
        pending = undefined;
      }
      return resolved;
    };
    if (isExpired === undefined) {
      return async (options) => {
        if (!hasResult || options?.forceRefresh) {
          resolved = await coalesceProvider();
        }
        return resolved;
      };
    }
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider();
      }
      if (isConstant) {
        return resolved;
      }
      if (requiresRefresh && !requiresRefresh(resolved)) {
        isConstant = true;
        return resolved;
      }
      if (isExpired(resolved)) {
        await coalesceProvider();
        return resolved;
      }
      return resolved;
    };
  };
  var booleanSelector = (obj, key, type) => {
    if (!(key in obj))
      return;
    if (obj[key] === "true")
      return true;
    if (obj[key] === "false")
      return false;
    throw new Error(`Cannot load ${type} "${key}". Expected "true" or "false", got ${obj[key]}.`);
  };
  var numberSelector = (obj, key, type) => {
    if (!(key in obj))
      return;
    const numberValue = parseInt(obj[key], 10);
    if (Number.isNaN(numberValue)) {
      throw new TypeError(`Cannot load ${type} '${key}'. Expected number, got '${obj[key]}'.`);
    }
    return numberValue;
  };
  var SelectorType;
  (function(SelectorType2) {
    SelectorType2["ENV"] = "env";
    SelectorType2["CONFIG"] = "shared config entry";
  })(SelectorType || (SelectorType = {}));
  var homeDirCache = {};
  var getHomeDirCacheKey = () => {
    if (process && process.geteuid) {
      return `${process.geteuid()}`;
    }
    return "DEFAULT";
  };
  var getHomeDir = () => {
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${sep}` } = process.env;
    if (HOME)
      return HOME;
    if (USERPROFILE)
      return USERPROFILE;
    if (HOMEPATH)
      return `${HOMEDRIVE}${HOMEPATH}`;
    const homeDirCacheKey = getHomeDirCacheKey();
    if (!homeDirCache[homeDirCacheKey])
      homeDirCache[homeDirCacheKey] = homedir();
    return homeDirCache[homeDirCacheKey];
  };
  var ENV_PROFILE = "AWS_PROFILE";
  var DEFAULT_PROFILE = "default";
  var getProfileName = (init) => init.profile || process.env[ENV_PROFILE] || DEFAULT_PROFILE;
  var getSSOTokenFilepath = (id) => {
    const hasher = createHash("sha1");
    const cacheName = hasher.update(id).digest("hex");
    return join(getHomeDir(), ".aws", "sso", "cache", `${cacheName}.json`);
  };
  var tokenIntercept = {};
  var getSSOTokenFromFile = async (id) => {
    if (tokenIntercept[id]) {
      return tokenIntercept[id];
    }
    const ssoTokenFilepath = getSSOTokenFilepath(id);
    const ssoTokenText = await readFile$1(ssoTokenFilepath, "utf8");
    return JSON.parse(ssoTokenText);
  };
  var CONFIG_PREFIX_SEPARATOR = ".";
  var getConfigData = (data) => Object.entries(data).filter(([key]) => {
    const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
    if (indexOfSeparator === -1) {
      return false;
    }
    return Object.values(IniSectionType).includes(key.substring(0, indexOfSeparator));
  }).reduce((acc, [key, value]) => {
    const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
    const updatedKey = key.substring(0, indexOfSeparator) === IniSectionType.PROFILE ? key.substring(indexOfSeparator + 1) : key;
    acc[updatedKey] = value;
    return acc;
  }, {
    ...data.default && { default: data.default }
  });
  var ENV_CONFIG_PATH = "AWS_CONFIG_FILE";
  var getConfigFilepath = () => process.env[ENV_CONFIG_PATH] || join(getHomeDir(), ".aws", "config");
  var ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
  var getCredentialsFilepath = () => process.env[ENV_CREDENTIALS_PATH] || join(getHomeDir(), ".aws", "credentials");
  var prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@\+\.%:/]+)\2$/;
  var profileNameBlockList = ["__proto__", "profile __proto__"];
  var parseIni = (iniData) => {
    const map = {};
    let currentSection;
    let currentSubSection;
    for (const iniLine of iniData.split(/\r?\n/)) {
      const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
      const isSection = trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]";
      if (isSection) {
        currentSection = undefined;
        currentSubSection = undefined;
        const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
        const matches = prefixKeyRegex.exec(sectionName);
        if (matches) {
          const [, prefix, , name] = matches;
          if (Object.values(IniSectionType).includes(prefix)) {
            currentSection = [prefix, name].join(CONFIG_PREFIX_SEPARATOR);
          }
        } else {
          currentSection = sectionName;
        }
        if (profileNameBlockList.includes(sectionName)) {
          throw new Error(`Found invalid profile name "${sectionName}"`);
        }
      } else if (currentSection) {
        const indexOfEqualsSign = trimmedLine.indexOf("=");
        if (![0, -1].includes(indexOfEqualsSign)) {
          const [name, value] = [
            trimmedLine.substring(0, indexOfEqualsSign).trim(),
            trimmedLine.substring(indexOfEqualsSign + 1).trim()
          ];
          if (value === "") {
            currentSubSection = name;
          } else {
            if (currentSubSection && iniLine.trimStart() === iniLine) {
              currentSubSection = undefined;
            }
            map[currentSection] = map[currentSection] || {};
            const key = currentSubSection ? [currentSubSection, name].join(CONFIG_PREFIX_SEPARATOR) : name;
            map[currentSection][key] = value;
          }
        }
      }
    }
    return map;
  };
  var filePromises = {};
  var fileIntercept = {};
  var readFile = (path, options) => {
    if (fileIntercept[path] !== undefined) {
      return fileIntercept[path];
    }
    if (!filePromises[path] || options?.ignoreCache) {
      filePromises[path] = readFile$1(path, "utf8");
    }
    return filePromises[path];
  };
  var swallowError$1 = () => ({});
  var loadSharedConfigFiles = async (init = {}) => {
    const { filepath = getCredentialsFilepath(), configFilepath = getConfigFilepath() } = init;
    const homeDir = getHomeDir();
    const relativeHomeDirPrefix = "~/";
    let resolvedFilepath = filepath;
    if (filepath.startsWith(relativeHomeDirPrefix)) {
      resolvedFilepath = join(homeDir, filepath.slice(2));
    }
    let resolvedConfigFilepath = configFilepath;
    if (configFilepath.startsWith(relativeHomeDirPrefix)) {
      resolvedConfigFilepath = join(homeDir, configFilepath.slice(2));
    }
    const parsedFiles = await Promise.all([
      readFile(resolvedConfigFilepath, {
        ignoreCache: init.ignoreCache
      }).then(parseIni).then(getConfigData).catch(swallowError$1),
      readFile(resolvedFilepath, {
        ignoreCache: init.ignoreCache
      }).then(parseIni).catch(swallowError$1)
    ]);
    return {
      configFile: parsedFiles[0],
      credentialsFile: parsedFiles[1]
    };
  };
  var getSsoSessionData = (data) => Object.entries(data).filter(([key]) => key.startsWith(IniSectionType.SSO_SESSION + CONFIG_PREFIX_SEPARATOR)).reduce((acc, [key, value]) => ({ ...acc, [key.substring(key.indexOf(CONFIG_PREFIX_SEPARATOR) + 1)]: value }), {});
  var swallowError = () => ({});
  var loadSsoSessionData = async (init = {}) => readFile(init.configFilepath ?? getConfigFilepath()).then(parseIni).then(getSsoSessionData).catch(swallowError);
  var mergeConfigFiles = (...files) => {
    const merged = {};
    for (const file of files) {
      for (const [key, values] of Object.entries(file)) {
        if (merged[key] !== undefined) {
          Object.assign(merged[key], values);
        } else {
          merged[key] = values;
        }
      }
    }
    return merged;
  };
  var parseKnownFiles = async (init) => {
    const parsedFiles = await loadSharedConfigFiles(init);
    return mergeConfigFiles(parsedFiles.configFile, parsedFiles.credentialsFile);
  };
  var externalDataInterceptor = {
    getFileRecord() {
      return fileIntercept;
    },
    interceptFile(path, contents) {
      fileIntercept[path] = Promise.resolve(contents);
    },
    getTokenRecord() {
      return tokenIntercept;
    },
    interceptToken(id, contents) {
      tokenIntercept[id] = contents;
    }
  };
  function getSelectorName(functionString) {
    try {
      const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
      constants.delete("CONFIG");
      constants.delete("CONFIG_PREFIX_SEPARATOR");
      constants.delete("ENV");
      return [...constants].join(", ");
    } catch (e) {
      return functionString;
    }
  }
  var fromEnv = (envVarSelector, options) => async () => {
    try {
      const config = envVarSelector(process.env, options);
      if (config === undefined) {
        throw new Error;
      }
      return config;
    } catch (e) {
      throw new CredentialsProviderError(e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`, { logger: options?.logger });
    }
  };
  var fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {}) => async () => {
    const profile = getProfileName(init);
    const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
    const profileFromCredentials = credentialsFile[profile] || {};
    const profileFromConfig = configFile[profile] || {};
    const mergedProfile = preferredFile === "config" ? { ...profileFromCredentials, ...profileFromConfig } : { ...profileFromConfig, ...profileFromCredentials };
    try {
      const cfgFile = preferredFile === "config" ? configFile : credentialsFile;
      const configValue = configSelector(mergedProfile, cfgFile);
      if (configValue === undefined) {
        throw new Error;
      }
      return configValue;
    } catch (e) {
      throw new CredentialsProviderError(e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`, { logger: init.logger });
    }
  };
  var isFunction = (func) => typeof func === "function";
  var fromStatic = (defaultValue) => isFunction(defaultValue) ? async () => await defaultValue() : fromValue(defaultValue);
  var loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => {
    const { signingName, logger } = configuration;
    const envOptions = { signingName, logger };
    return memoize(chain(fromEnv(environmentVariableSelector, envOptions), fromSharedConfigFiles(configFileSelector, configuration), fromStatic(defaultValue)));
  };
  var ENV_USE_DUALSTACK_ENDPOINT = "AWS_USE_DUALSTACK_ENDPOINT";
  var CONFIG_USE_DUALSTACK_ENDPOINT = "use_dualstack_endpoint";
  var DEFAULT_USE_DUALSTACK_ENDPOINT = false;
  var NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
    configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
    default: false
  };
  var nodeDualstackConfigSelectors = {
    environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
    configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
    default: undefined
  };
  var ENV_USE_FIPS_ENDPOINT = "AWS_USE_FIPS_ENDPOINT";
  var CONFIG_USE_FIPS_ENDPOINT = "use_fips_endpoint";
  var DEFAULT_USE_FIPS_ENDPOINT = false;
  var NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
    configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
    default: false
  };
  var nodeFipsConfigSelectors = {
    environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
    configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
    default: undefined
  };
  var resolveCustomEndpointsConfig = (input) => {
    const { tls, endpoint, urlParser, useDualstackEndpoint } = input;
    return Object.assign(input, {
      tls: tls ?? true,
      endpoint: normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint),
      isCustomEndpoint: true,
      useDualstackEndpoint: normalizeProvider(useDualstackEndpoint ?? false)
    });
  };
  var getEndpointFromRegion = async (input) => {
    const { tls = true } = input;
    const region = await input.region();
    const dnsHostRegex = new RegExp(/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/);
    if (!dnsHostRegex.test(region)) {
      throw new Error("Invalid region in client config");
    }
    const useDualstackEndpoint = await input.useDualstackEndpoint();
    const useFipsEndpoint = await input.useFipsEndpoint();
    const { hostname } = await input.regionInfoProvider(region, { useDualstackEndpoint, useFipsEndpoint }) ?? {};
    if (!hostname) {
      throw new Error("Cannot resolve hostname from client config");
    }
    return input.urlParser(`${tls ? "https:" : "http:"}//${hostname}`);
  };
  var resolveEndpointsConfig = (input) => {
    const useDualstackEndpoint = normalizeProvider(input.useDualstackEndpoint ?? false);
    const { endpoint, useFipsEndpoint, urlParser, tls } = input;
    return Object.assign(input, {
      tls: tls ?? true,
      endpoint: endpoint ? normalizeProvider(typeof endpoint === "string" ? urlParser(endpoint) : endpoint) : () => getEndpointFromRegion({ ...input, useDualstackEndpoint, useFipsEndpoint }),
      isCustomEndpoint: !!endpoint,
      useDualstackEndpoint
    });
  };
  var REGION_ENV_NAME = "AWS_REGION";
  var REGION_INI_NAME = "region";
  var NODE_REGION_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => env[REGION_ENV_NAME],
    configFileSelector: (profile) => profile[REGION_INI_NAME],
    default: () => {
      throw new Error("Region is missing");
    }
  };
  var NODE_REGION_CONFIG_FILE_OPTIONS = {
    preferredFile: "credentials"
  };
  var validRegions = new Set;
  var checkRegion = (region, check = isValidHostLabel) => {
    if (!validRegions.has(region) && !check(region)) {
      if (region === "*") {
        console.warn(`@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.`);
      } else {
        throw new Error(`Region not accepted: region="${region}" is not a valid hostname component.`);
      }
    } else {
      validRegions.add(region);
    }
  };
  var isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
  var getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;
  var resolveRegionConfig = (input) => {
    const { region, useFipsEndpoint } = input;
    if (!region) {
      throw new Error("Region is missing");
    }
    return Object.assign(input, {
      region: async () => {
        const providedRegion = typeof region === "function" ? await region() : region;
        const realRegion = getRealRegion(providedRegion);
        checkRegion(realRegion);
        return realRegion;
      },
      useFipsEndpoint: async () => {
        const providedRegion = typeof region === "string" ? region : await region();
        if (isFipsRegion(providedRegion)) {
          return true;
        }
        return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
      }
    });
  };
  var getHostnameFromVariants = (variants = [], { useFipsEndpoint, useDualstackEndpoint }) => variants.find(({ tags }) => useFipsEndpoint === tags.includes("fips") && useDualstackEndpoint === tags.includes("dualstack"))?.hostname;
  var getResolvedHostname = (resolvedRegion, { regionHostname, partitionHostname }) => regionHostname ? regionHostname : partitionHostname ? partitionHostname.replace("{region}", resolvedRegion) : undefined;
  var getResolvedPartition = (region, { partitionHash }) => Object.keys(partitionHash || {}).find((key) => partitionHash[key].regions.includes(region)) ?? "aws";
  var getResolvedSigningRegion = (hostname, { signingRegion, regionRegex, useFipsEndpoint }) => {
    if (signingRegion) {
      return signingRegion;
    } else if (useFipsEndpoint) {
      const regionRegexJs = regionRegex.replace("\\\\", "\\").replace(/^\^/g, "\\.").replace(/\$$/g, "\\.");
      const regionRegexmatchArray = hostname.match(regionRegexJs);
      if (regionRegexmatchArray) {
        return regionRegexmatchArray[0].slice(1, -1);
      }
    }
  };
  var getRegionInfo = (region, { useFipsEndpoint = false, useDualstackEndpoint = false, signingService, regionHash, partitionHash }) => {
    const partition = getResolvedPartition(region, { partitionHash });
    const resolvedRegion = region in regionHash ? region : partitionHash[partition]?.endpoint ?? region;
    const hostnameOptions = { useFipsEndpoint, useDualstackEndpoint };
    const regionHostname = getHostnameFromVariants(regionHash[resolvedRegion]?.variants, hostnameOptions);
    const partitionHostname = getHostnameFromVariants(partitionHash[partition]?.variants, hostnameOptions);
    const hostname = getResolvedHostname(resolvedRegion, { regionHostname, partitionHostname });
    if (hostname === undefined) {
      throw new Error(`Endpoint resolution failed for: ${{ resolvedRegion, useFipsEndpoint, useDualstackEndpoint }}`);
    }
    const signingRegion = getResolvedSigningRegion(hostname, {
      signingRegion: regionHash[resolvedRegion]?.signingRegion,
      regionRegex: partitionHash[partition].regionRegex,
      useFipsEndpoint
    });
    return {
      partition,
      signingService,
      hostname,
      ...signingRegion && { signingRegion },
      ...regionHash[resolvedRegion]?.signingService && {
        signingService: regionHash[resolvedRegion].signingService
      }
    };
  };
  var AWS_EXECUTION_ENV = "AWS_EXECUTION_ENV";
  var AWS_REGION_ENV = "AWS_REGION";
  var AWS_DEFAULT_REGION_ENV = "AWS_DEFAULT_REGION";
  var ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED";
  var DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];
  var IMDS_REGION_PATH = "/latest/meta-data/placement/region";
  var AWS_DEFAULTS_MODE_ENV = "AWS_DEFAULTS_MODE";
  var AWS_DEFAULTS_MODE_CONFIG = "defaults_mode";
  var NODE_DEFAULTS_MODE_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => {
      return env[AWS_DEFAULTS_MODE_ENV];
    },
    configFileSelector: (profile) => {
      return profile[AWS_DEFAULTS_MODE_CONFIG];
    },
    default: "legacy"
  };
  var resolveDefaultsModeConfig = ({ region = loadConfig(NODE_REGION_CONFIG_OPTIONS), defaultsMode = loadConfig(NODE_DEFAULTS_MODE_CONFIG_OPTIONS) } = {}) => memoize(async () => {
    const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
    switch (mode?.toLowerCase()) {
      case "auto":
        return resolveNodeDefaultsModeAuto(region);
      case "in-region":
      case "cross-region":
      case "mobile":
      case "standard":
      case "legacy":
        return Promise.resolve(mode?.toLocaleLowerCase());
      case undefined:
        return Promise.resolve("legacy");
      default:
        throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
    }
  });
  var resolveNodeDefaultsModeAuto = async (clientRegion) => {
    if (clientRegion) {
      const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
      const inferredRegion = await inferPhysicalRegion();
      if (!inferredRegion) {
        return "standard";
      }
      if (resolvedRegion === inferredRegion) {
        return "in-region";
      } else {
        return "cross-region";
      }
    }
    return "standard";
  };
  var inferPhysicalRegion = async () => {
    if (process.env[AWS_EXECUTION_ENV] && (process.env[AWS_REGION_ENV] || process.env[AWS_DEFAULT_REGION_ENV])) {
      return process.env[AWS_REGION_ENV] ?? process.env[AWS_DEFAULT_REGION_ENV];
    }
    if (!process.env[ENV_IMDS_DISABLED]) {
      try {
        const endpoint = await getImdsEndpoint();
        return (await imdsHttpGet({ hostname: endpoint.hostname, path: IMDS_REGION_PATH })).toString();
      } catch (e) {}
    }
  };
  var getImdsEndpoint = async () => {
    const envEndpoint = process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT;
    if (envEndpoint) {
      const url = new URL(envEndpoint);
      return { hostname: url.hostname, path: url.pathname };
    }
    const envMode = process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE;
    if (envMode === "IPv6") {
      return { hostname: "fd00:ec2::254", path: "/" };
    }
    return { hostname: "169.254.169.254", path: "/" };
  };
  var imdsHttpGet = async ({ hostname, path }) => {
    const { request } = __require("node:http");
    return new Promise((resolve, reject) => {
      const req = request({
        method: "GET",
        hostname: hostname.replace(/^\[(.+)]$/, "$1"),
        path,
        timeout: 1000,
        signal: AbortSignal.timeout(1000)
      });
      req.on("error", (err) => {
        reject(err);
        req.destroy();
      });
      req.on("timeout", () => {
        reject(new Error("TimeoutError from instance metadata service"));
        req.destroy();
      });
      req.on("response", (res) => {
        const { statusCode = 400 } = res;
        if (statusCode < 200 || 300 <= statusCode) {
          reject(Object.assign(new Error("Error response received from instance metadata service"), { statusCode }));
          req.destroy();
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve(Buffer.concat(chunks));
          req.destroy();
        });
      });
      req.end();
    });
  };
  exports.CONFIG_PREFIX_SEPARATOR = CONFIG_PREFIX_SEPARATOR;
  exports.CONFIG_USE_DUALSTACK_ENDPOINT = CONFIG_USE_DUALSTACK_ENDPOINT;
  exports.CONFIG_USE_FIPS_ENDPOINT = CONFIG_USE_FIPS_ENDPOINT;
  exports.CredentialsProviderError = CredentialsProviderError;
  exports.DEFAULT_PROFILE = DEFAULT_PROFILE;
  exports.DEFAULT_USE_DUALSTACK_ENDPOINT = DEFAULT_USE_DUALSTACK_ENDPOINT;
  exports.DEFAULT_USE_FIPS_ENDPOINT = DEFAULT_USE_FIPS_ENDPOINT;
  exports.ENV_PROFILE = ENV_PROFILE;
  exports.ENV_USE_DUALSTACK_ENDPOINT = ENV_USE_DUALSTACK_ENDPOINT;
  exports.ENV_USE_FIPS_ENDPOINT = ENV_USE_FIPS_ENDPOINT;
  exports.NODE_REGION_CONFIG_FILE_OPTIONS = NODE_REGION_CONFIG_FILE_OPTIONS;
  exports.NODE_REGION_CONFIG_OPTIONS = NODE_REGION_CONFIG_OPTIONS;
  exports.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS;
  exports.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS;
  exports.ProviderError = ProviderError;
  exports.REGION_ENV_NAME = REGION_ENV_NAME;
  exports.REGION_INI_NAME = REGION_INI_NAME;
  exports.SelectorType = SelectorType;
  exports.TokenProviderError = TokenProviderError;
  exports.booleanSelector = booleanSelector;
  exports.chain = chain;
  exports.externalDataInterceptor = externalDataInterceptor;
  exports.fromStatic = fromStatic;
  exports.fromValue = fromValue;
  exports.getHomeDir = getHomeDir;
  exports.getProfileName = getProfileName;
  exports.getRegionInfo = getRegionInfo;
  exports.getSSOTokenFilepath = getSSOTokenFilepath;
  exports.getSSOTokenFromFile = getSSOTokenFromFile;
  exports.loadConfig = loadConfig;
  exports.loadSharedConfigFiles = loadSharedConfigFiles;
  exports.loadSsoSessionData = loadSsoSessionData;
  exports.memoize = memoize;
  exports.nodeDualstackConfigSelectors = nodeDualstackConfigSelectors;
  exports.nodeFipsConfigSelectors = nodeFipsConfigSelectors;
  exports.numberSelector = numberSelector;
  exports.parseKnownFiles = parseKnownFiles;
  exports.readFile = readFile;
  exports.resolveCustomEndpointsConfig = resolveCustomEndpointsConfig;
  exports.resolveDefaultsModeConfig = resolveDefaultsModeConfig;
  exports.resolveEndpointsConfig = resolveEndpointsConfig;
  exports.resolveRegionConfig = resolveRegionConfig;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/endpoints/index.js
var require_endpoints = __commonJS((exports) => {
  var { CONFIG_PREFIX_SEPARATOR, loadConfig } = require_config();
  var { toEndpointV1, getSmithyContext, normalizeProvider, isValidHostLabel } = require_transport();
  exports.isValidHostLabel = isValidHostLabel;
  exports.middlewareEndpointToEndpointV1 = toEndpointV1;
  exports.toEndpointV1 = toEndpointV1;
  var { EndpointURLScheme } = require_dist_cjs();
  var ENV_ENDPOINT_URL = "AWS_ENDPOINT_URL";
  var CONFIG_ENDPOINT_URL = "endpoint_url";
  var getEndpointUrlConfig = (serviceId) => ({
    environmentVariableSelector: (env) => {
      const serviceSuffixParts = serviceId.split(" ").map((w) => w.toUpperCase());
      const serviceEndpointUrl = env[[ENV_ENDPOINT_URL, ...serviceSuffixParts].join("_")];
      if (serviceEndpointUrl)
        return serviceEndpointUrl;
      const endpointUrl = env[ENV_ENDPOINT_URL];
      if (endpointUrl)
        return endpointUrl;
      return;
    },
    configFileSelector: (profile, config) => {
      if (config && profile.services) {
        const servicesSection = config[["services", profile.services].join(CONFIG_PREFIX_SEPARATOR)];
        if (servicesSection) {
          const servicePrefixParts = serviceId.split(" ").map((w) => w.toLowerCase());
          const endpointUrl2 = servicesSection[[servicePrefixParts.join("_"), CONFIG_ENDPOINT_URL].join(CONFIG_PREFIX_SEPARATOR)];
          if (endpointUrl2)
            return endpointUrl2;
        }
      }
      const endpointUrl = profile[CONFIG_ENDPOINT_URL];
      if (endpointUrl)
        return endpointUrl;
      return;
    },
    default: undefined
  });
  var getEndpointFromConfig = async (serviceId) => loadConfig(getEndpointUrlConfig(serviceId ?? ""))();
  var resolveParamsForS3 = async (endpointParams) => {
    const bucket = endpointParams?.Bucket || "";
    if (typeof endpointParams.Bucket === "string") {
      endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
    }
    if (isArnBucketName(bucket)) {
      if (endpointParams.ForcePathStyle === true) {
        throw new Error("Path-style addressing cannot be used with ARN buckets");
      }
    } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
      endpointParams.ForcePathStyle = true;
    }
    if (endpointParams.DisableMultiRegionAccessPoints) {
      endpointParams.disableMultiRegionAccessPoints = true;
      endpointParams.DisableMRAP = true;
    }
    return endpointParams;
  };
  var DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
  var IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
  var DOTS_PATTERN = /\.\./;
  var isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
  var isArnBucketName = (bucketName) => {
    const [arn, partition, service, , , bucket] = bucketName.split(":");
    const isArn = arn === "arn" && bucketName.split(":").length >= 6;
    const isValidArn = Boolean(isArn && partition && service && bucket);
    if (isArn && !isValidArn) {
      throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
    }
    return isValidArn;
  };
  var createConfigValueProvider = (configKey, canonicalEndpointParamKey, config, isClientContextParam = false) => {
    const configProvider = async () => {
      let configValue;
      if (isClientContextParam) {
        const clientContextParams = config.clientContextParams;
        const nestedValue = clientContextParams?.[configKey];
        configValue = nestedValue ?? config[configKey] ?? config[canonicalEndpointParamKey];
      } else {
        configValue = config[configKey] ?? config[canonicalEndpointParamKey];
      }
      if (typeof configValue === "function") {
        return configValue();
      }
      return configValue;
    };
    if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
      return async () => {
        const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
        const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
        return configValue;
      };
    }
    if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
      return async () => {
        const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
        const configValue = credentials?.accountId ?? credentials?.AccountId;
        return configValue;
      };
    }
    if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
      return async () => {
        if (config.isCustomEndpoint === false) {
          return;
        }
        const endpoint = await configProvider();
        if (endpoint && typeof endpoint === "object") {
          if ("url" in endpoint) {
            return endpoint.url.href;
          }
          if ("hostname" in endpoint) {
            const { protocol, hostname, port, path } = endpoint;
            return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
          }
        }
        return endpoint;
      };
    }
    return configProvider;
  };
  function bindGetEndpointFromInstructions(getEndpointFromConfig2) {
    return async (commandInput, instructionsSupplier, clientConfig, context) => {
      if (!clientConfig.isCustomEndpoint) {
        let endpointFromConfig;
        if (clientConfig.serviceConfiguredEndpoint) {
          endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
        } else {
          endpointFromConfig = await getEndpointFromConfig2(clientConfig.serviceId);
        }
        if (endpointFromConfig) {
          clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
          clientConfig.isCustomEndpoint = true;
        }
      }
      const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
      if (typeof clientConfig.endpointProvider !== "function") {
        throw new Error("config.endpointProvider is not set.");
      }
      const endpoint = clientConfig.endpointProvider(endpointParams, context);
      if (clientConfig.isCustomEndpoint && clientConfig.endpoint) {
        const customEndpoint = await clientConfig.endpoint();
        if (customEndpoint?.headers) {
          endpoint.headers ??= {};
          for (const [name, value] of Object.entries(customEndpoint.headers)) {
            endpoint.headers[name] = Array.isArray(value) ? value : [value];
          }
        }
      }
      return endpoint;
    };
  }
  var resolveParams = async (commandInput, instructionsSupplier, clientConfig) => {
    const endpointParams = {};
    const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
    for (const [name, instruction] of Object.entries(instructions)) {
      switch (instruction.type) {
        case "staticContextParams":
          endpointParams[name] = instruction.value;
          break;
        case "contextParams":
          endpointParams[name] = commandInput[instruction.name];
          break;
        case "clientContextParams":
        case "builtInParams":
          endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
          break;
        case "operationContextParams":
          endpointParams[name] = instruction.get(commandInput);
          break;
        default:
          throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
      }
    }
    if (Object.keys(instructions).length === 0) {
      Object.assign(endpointParams, clientConfig);
    }
    if (String(clientConfig.serviceId).toLowerCase() === "s3") {
      await resolveParamsForS3(endpointParams);
    }
    return endpointParams;
  };
  function setFeature(context, feature, value) {
    if (!context.__smithy_context) {
      context.__smithy_context = { features: {} };
    } else if (!context.__smithy_context.features) {
      context.__smithy_context.features = {};
    }
    context.__smithy_context.features[feature] = value;
  }
  function bindEndpointMiddleware(getEndpointFromConfig2) {
    const getEndpointFromInstructions2 = bindGetEndpointFromInstructions(getEndpointFromConfig2);
    return ({ config, instructions }) => {
      return (next, context) => async (args) => {
        if (config.isCustomEndpoint) {
          setFeature(context, "ENDPOINT_OVERRIDE", "N");
        }
        const endpoint = await getEndpointFromInstructions2(args.input, {
          getEndpointParameterInstructions() {
            return instructions;
          }
        }, { ...config }, context);
        context.endpointV2 = endpoint;
        context.authSchemes = endpoint.properties?.authSchemes;
        const authScheme = context.authSchemes?.[0];
        if (authScheme) {
          context["signing_region"] = authScheme.signingRegion;
          context["signing_service"] = authScheme.signingName;
          const smithyContext = getSmithyContext(context);
          const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
          if (httpAuthOption) {
            httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
              signing_region: authScheme.signingRegion,
              signingRegion: authScheme.signingRegion,
              signing_service: authScheme.signingName,
              signingName: authScheme.signingName,
              signingRegionSet: authScheme.signingRegionSet
            }, authScheme.properties);
          }
        }
        return next({
          ...args
        });
      };
    };
  }
  var serializerMiddlewareOption = {
    name: "serializerMiddleware"
  };
  var endpointMiddlewareOptions = {
    step: "serialize",
    tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
    name: "endpointV2Middleware",
    override: true,
    relation: "before",
    toMiddleware: serializerMiddlewareOption.name
  };
  function bindGetEndpointPlugin(getEndpointFromConfig2) {
    const endpointMiddleware2 = bindEndpointMiddleware(getEndpointFromConfig2);
    return (config, instructions) => ({
      applyToStack: (clientStack) => {
        clientStack.addRelativeTo(endpointMiddleware2({
          config,
          instructions
        }), endpointMiddlewareOptions);
      }
    });
  }
  function bindResolveEndpointConfig(getEndpointFromConfig2) {
    return (input) => {
      const tls = input.tls ?? true;
      const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
      const customEndpointProvider = endpoint != null ? async () => toEndpointV1(await normalizeProvider(endpoint)()) : undefined;
      const isCustomEndpoint = !!endpoint;
      const resolvedConfig = Object.assign(input, {
        endpoint: customEndpointProvider,
        tls,
        isCustomEndpoint,
        useDualstackEndpoint: normalizeProvider(useDualstackEndpoint ?? false),
        useFipsEndpoint: normalizeProvider(useFipsEndpoint ?? false)
      });
      let configuredEndpointPromise = undefined;
      resolvedConfig.serviceConfiguredEndpoint = async () => {
        if (input.serviceId && !configuredEndpointPromise) {
          configuredEndpointPromise = getEndpointFromConfig2(input.serviceId);
        }
        return configuredEndpointPromise;
      };
      return resolvedConfig;
    };
  }

  class BinaryDecisionDiagram {
    nodes;
    root;
    conditions;
    results;
    constructor(bdd, root, conditions, results) {
      this.nodes = bdd;
      this.root = root;
      this.conditions = conditions;
      this.results = results;
    }
    static from(bdd, root, conditions, results) {
      return new BinaryDecisionDiagram(bdd, root, conditions, results);
    }
  }

  class EndpointCache {
    capacity;
    data = new Map;
    parameters = [];
    constructor({ size, params }) {
      this.capacity = size ?? 50;
      if (params) {
        this.parameters = params;
      }
    }
    get(endpointParams, resolver) {
      const key = this.hash(endpointParams);
      if (key === false) {
        return resolver();
      }
      if (!this.data.has(key)) {
        if (this.data.size > this.capacity + 10) {
          const keys = this.data.keys();
          let i = 0;
          while (true) {
            const { value, done } = keys.next();
            this.data.delete(value);
            if (done || ++i > 10) {
              break;
            }
          }
        }
        this.data.set(key, resolver());
      }
      return this.data.get(key);
    }
    size() {
      return this.data.size;
    }
    hash(endpointParams) {
      let buffer = "";
      const { parameters } = this;
      if (parameters.length === 0) {
        return false;
      }
      for (const param of parameters) {
        const val = String(endpointParams[param] ?? "");
        if (val.includes("|;")) {
          return false;
        }
        buffer += val + "|;";
      }
      return buffer;
    }
  }

  class EndpointError extends Error {
    constructor(message) {
      super(message);
      this.name = "EndpointError";
    }
  }
  var debugId = "endpoints";
  function toDebugString(input) {
    if (typeof input !== "object" || input == null) {
      return input;
    }
    if ("ref" in input) {
      return `$${toDebugString(input.ref)}`;
    }
    if ("fn" in input) {
      return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
    }
    return JSON.stringify(input, null, 2);
  }
  var customEndpointFunctions = {};
  var booleanEquals = (value1, value2) => value1 === value2;
  function coalesce(...args) {
    for (const arg of args) {
      if (arg != null) {
        return arg;
      }
    }
    return;
  }
  var getAttrPathList = (path) => {
    const parts = path.split(".");
    const pathList = [];
    for (const part of parts) {
      const squareBracketIndex = part.indexOf("[");
      if (squareBracketIndex !== -1) {
        if (part.indexOf("]") !== part.length - 1) {
          throw new EndpointError(`Path: '${path}' does not end with ']'`);
        }
        const arrayIndex = part.slice(squareBracketIndex + 1, -1);
        if (Number.isNaN(parseInt(arrayIndex))) {
          throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
        }
        if (squareBracketIndex !== 0) {
          pathList.push(part.slice(0, squareBracketIndex));
        }
        pathList.push(arrayIndex);
      } else {
        pathList.push(part);
      }
    }
    return pathList;
  };
  var getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
    if (typeof acc !== "object") {
      throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
    } else if (Array.isArray(acc)) {
      const i = parseInt(index);
      return acc[i < 0 ? acc.length + i : i];
    }
    return acc[index];
  }, value);
  var isSet = (value) => value != null;
  function ite(condition, trueValue, falseValue) {
    return condition ? trueValue : falseValue;
  }
  var not = (value) => !value;
  var IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
  var isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");
  var DEFAULT_PORTS = {
    [EndpointURLScheme.HTTP]: 80,
    [EndpointURLScheme.HTTPS]: 443
  };
  var parseURL = (value) => {
    const whatwgURL = (() => {
      try {
        if (value instanceof URL) {
          return value;
        }
        if (typeof value === "object" && "hostname" in value) {
          const { hostname: hostname2, port, protocol: protocol2 = "", path = "", query = {} } = value;
          const url = new URL(`${protocol2}//${hostname2}${port ? `:${port}` : ""}${path}`);
          url.search = Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&");
          return url;
        }
        return new URL(value);
      } catch (error) {
        return null;
      }
    })();
    if (!whatwgURL) {
      console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
      return null;
    }
    const urlString = whatwgURL.href;
    const { host, hostname, pathname, protocol, search } = whatwgURL;
    if (search) {
      return null;
    }
    const scheme = protocol.slice(0, -1);
    if (!Object.values(EndpointURLScheme).includes(scheme)) {
      return null;
    }
    const isIp = isIpAddress(hostname);
    const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`);
    const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
    return {
      scheme,
      authority,
      path: pathname,
      normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
      isIp
    };
  };
  function split(value, delimiter, limit) {
    if (limit === 1) {
      return [value];
    }
    if (value === "") {
      return [""];
    }
    const parts = value.split(delimiter);
    if (limit === 0) {
      return parts;
    }
    return parts.slice(0, limit - 1).concat(parts.slice(1).join(delimiter));
  }
  var stringEquals = (value1, value2) => value1 === value2;
  var substring = (input, start, stop, reverse) => {
    if (input == null || start >= stop || input.length < stop || /[^\u0000-\u007f]/.test(input)) {
      return null;
    }
    if (!reverse) {
      return input.substring(start, stop);
    }
    return input.substring(input.length - stop, input.length - start);
  };
  var uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  var endpointFunctions = {
    booleanEquals,
    coalesce,
    getAttr,
    isSet,
    isValidHostLabel,
    ite,
    not,
    parseURL,
    split,
    stringEquals,
    substring,
    uriEncode
  };
  var evaluateTemplate = (template, options) => {
    const evaluatedTemplateArr = [];
    const { referenceRecord, endpointParams } = options;
    let currentIndex = 0;
    while (currentIndex < template.length) {
      const openingBraceIndex = template.indexOf("{", currentIndex);
      if (openingBraceIndex === -1) {
        evaluatedTemplateArr.push(template.slice(currentIndex));
        break;
      }
      evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
      const closingBraceIndex = template.indexOf("}", openingBraceIndex);
      if (closingBraceIndex === -1) {
        evaluatedTemplateArr.push(template.slice(openingBraceIndex));
        break;
      }
      if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
        evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
        currentIndex = closingBraceIndex + 2;
      }
      const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
      if (parameterName.includes("#")) {
        const [refName, attrName] = parameterName.split("#");
        evaluatedTemplateArr.push(getAttr(referenceRecord[refName] ?? endpointParams[refName], attrName));
      } else {
        evaluatedTemplateArr.push(referenceRecord[parameterName] ?? endpointParams[parameterName]);
      }
      currentIndex = closingBraceIndex + 1;
    }
    return evaluatedTemplateArr.join("");
  };
  var getReferenceValue = ({ ref }, options) => {
    return options.referenceRecord[ref] ?? options.endpointParams[ref];
  };
  var evaluateExpression = (obj, keyName, options) => {
    if (typeof obj === "string") {
      return evaluateTemplate(obj, options);
    } else if (obj["fn"]) {
      return group$2.callFunction(obj, options);
    } else if (obj["ref"]) {
      return getReferenceValue(obj, options);
    }
    throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
  };
  var callFunction = ({ fn, argv }, options) => {
    const evaluatedArgs = Array(argv.length);
    for (let i = 0;i < evaluatedArgs.length; ++i) {
      const arg = argv[i];
      if (typeof arg === "boolean" || typeof arg === "number") {
        evaluatedArgs[i] = arg;
      } else {
        evaluatedArgs[i] = group$2.evaluateExpression(arg, "arg", options);
      }
    }
    const namespaceSeparatorIndex = fn.indexOf(".");
    if (namespaceSeparatorIndex !== -1) {
      const namespaceFunctions = customEndpointFunctions[fn.slice(0, namespaceSeparatorIndex)];
      const customFunction = namespaceFunctions?.[fn.slice(namespaceSeparatorIndex + 1)];
      if (typeof customFunction === "function") {
        return customFunction(...evaluatedArgs);
      }
    }
    const callable = endpointFunctions[fn];
    if (typeof callable === "function") {
      return callable(...evaluatedArgs);
    }
    throw new Error(`function ${fn} not loaded in endpointFunctions.`);
  };
  var group$2 = {
    evaluateExpression,
    callFunction
  };
  var evaluateCondition = (condition, options) => {
    const { assign } = condition;
    if (assign && assign in options.referenceRecord) {
      throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
    }
    const value = callFunction(condition, options);
    options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(condition)} = ${toDebugString(value)}`);
    const result = value === "" ? true : !!value;
    if (assign != null) {
      return { result, toAssign: { name: assign, value } };
    }
    return { result };
  };
  var getEndpointHeaders = (headers, options) => Object.entries(headers ?? {}).reduce((acc, [headerKey, headerVal]) => {
    acc[headerKey] = headerVal.map((headerValEntry) => {
      const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
      if (typeof processedExpr !== "string") {
        throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
      }
      return processedExpr;
    });
    return acc;
  }, {});
  var getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => {
    acc[propertyKey] = group$1.getEndpointProperty(propertyVal, options);
    return acc;
  }, {});
  var getEndpointProperty = (property, options) => {
    if (Array.isArray(property)) {
      return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
    }
    switch (typeof property) {
      case "string":
        return evaluateTemplate(property, options);
      case "object":
        if (property === null) {
          throw new EndpointError(`Unexpected endpoint property: ${property}`);
        }
        return group$1.getEndpointProperties(property, options);
      case "boolean":
        return property;
      default:
        throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
    }
  };
  var group$1 = {
    getEndpointProperty,
    getEndpointProperties
  };
  var getEndpointUrl = (endpointUrl, options) => {
    const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
    if (typeof expression === "string") {
      try {
        return new URL(expression);
      } catch (error) {
        console.error(`Failed to construct URL with ${expression}`, error);
        throw error;
      }
    }
    throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
  };
  var RESULT = 1e8;
  var decideEndpoint = (bdd, options) => {
    const { nodes, root, results, conditions } = bdd;
    let ref = root;
    const referenceRecord = {};
    const closure = {
      referenceRecord,
      endpointParams: options.endpointParams,
      logger: options.logger
    };
    while (ref !== 1 && ref !== -1 && ref < RESULT) {
      const node_i = 3 * (Math.abs(ref) - 1);
      const [condition_i, highRef, lowRef] = [nodes[node_i], nodes[node_i + 1], nodes[node_i + 2]];
      const [fn, argv, assign] = conditions[condition_i];
      const evaluation = evaluateCondition({ fn, assign, argv }, closure);
      if (evaluation.toAssign) {
        const { name, value } = evaluation.toAssign;
        referenceRecord[name] = value;
      }
      ref = ref >= 0 === evaluation.result ? highRef : lowRef;
    }
    if (ref >= RESULT) {
      const result = results[ref - RESULT];
      if (result[0] === -1) {
        const [, errorExpression] = result;
        throw new EndpointError(evaluateExpression(errorExpression, "Error", closure));
      }
      const [url, properties, headers] = result;
      return {
        url: getEndpointUrl(url, closure),
        properties: getEndpointProperties(properties, closure),
        headers: getEndpointHeaders(headers ?? {}, closure)
      };
    }
    throw new EndpointError(`No matching endpoint.`);
  };
  var evaluateConditions = (conditions = [], options) => {
    const conditionsReferenceRecord = {};
    const conditionOptions = {
      ...options,
      referenceRecord: { ...options.referenceRecord }
    };
    let didAssign = false;
    for (const condition of conditions) {
      const { result, toAssign } = evaluateCondition(condition, conditionOptions);
      if (!result) {
        return { result };
      }
      if (toAssign) {
        didAssign = true;
        conditionsReferenceRecord[toAssign.name] = toAssign.value;
        conditionOptions.referenceRecord[toAssign.name] = toAssign.value;
        options.logger?.debug?.(`${debugId} assign: ${toAssign.name} := ${toDebugString(toAssign.value)}`);
      }
    }
    if (didAssign) {
      return { result: true, referenceRecord: conditionsReferenceRecord };
    }
    return { result: true };
  };
  var evaluateEndpointRule = (endpointRule, options) => {
    const { conditions, endpoint } = endpointRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    const endpointRuleOptions = referenceRecord ? {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    } : options;
    const { url, properties, headers } = endpoint;
    options.logger?.debug?.(`${debugId} Resolving endpoint from template: ${toDebugString(endpoint)}`);
    const endpointToReturn = { url: getEndpointUrl(url, endpointRuleOptions) };
    if (headers != null) {
      endpointToReturn.headers = getEndpointHeaders(headers, endpointRuleOptions);
    }
    if (properties != null) {
      endpointToReturn.properties = getEndpointProperties(properties, endpointRuleOptions);
    }
    return endpointToReturn;
  };
  var evaluateErrorRule = (errorRule, options) => {
    const { conditions, error } = errorRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    const errorRuleOptions = referenceRecord ? {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    } : options;
    throw new EndpointError(evaluateExpression(error, "Error", errorRuleOptions));
  };
  var evaluateRules = (rules, options) => {
    for (const rule of rules) {
      if (rule.type === "endpoint") {
        const endpointOrUndefined = evaluateEndpointRule(rule, options);
        if (endpointOrUndefined) {
          return endpointOrUndefined;
        }
      } else if (rule.type === "error") {
        evaluateErrorRule(rule, options);
      } else if (rule.type === "tree") {
        const endpointOrUndefined = group.evaluateTreeRule(rule, options);
        if (endpointOrUndefined) {
          return endpointOrUndefined;
        }
      } else {
        throw new EndpointError(`Unknown endpoint rule: ${rule}`);
      }
    }
    throw new EndpointError(`Rules evaluation failed`);
  };
  var evaluateTreeRule = (treeRule, options) => {
    const { conditions, rules } = treeRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    const treeRuleOptions = referenceRecord ? { ...options, referenceRecord: { ...options.referenceRecord, ...referenceRecord } } : options;
    return group.evaluateRules(rules, treeRuleOptions);
  };
  var group = {
    evaluateRules,
    evaluateTreeRule
  };
  var resolveEndpoint = (ruleSetObject, options) => {
    const { endpointParams, logger } = options;
    const { parameters, rules } = ruleSetObject;
    options.logger?.debug?.(`${debugId} Initial EndpointParams: ${toDebugString(endpointParams)}`);
    for (const paramKey in parameters) {
      const parameter = parameters[paramKey];
      const endpointParam = endpointParams[paramKey];
      if (endpointParam == null && parameter.default != null) {
        endpointParams[paramKey] = parameter.default;
        continue;
      }
      if (parameter.required && endpointParam == null) {
        throw new EndpointError(`Missing required parameter: '${paramKey}'`);
      }
    }
    const endpoint = evaluateRules(rules, { endpointParams, logger, referenceRecord: {} });
    options.logger?.debug?.(`${debugId} Resolved endpoint: ${toDebugString(endpoint)}`);
    return endpoint;
  };
  var resolveEndpointRequiredConfig = (input) => {
    const { endpoint } = input;
    if (endpoint === undefined) {
      input.endpoint = async () => {
        throw new Error("@smithy/middleware-endpoint: (default endpointRuleSet) endpoint is not set - you must configure an endpoint.");
      };
    }
    return input;
  };
  var getEndpointFromInstructions = bindGetEndpointFromInstructions(getEndpointFromConfig);
  var resolveEndpointConfig = bindResolveEndpointConfig(getEndpointFromConfig);
  var endpointMiddleware = bindEndpointMiddleware(getEndpointFromConfig);
  var getEndpointPlugin = bindGetEndpointPlugin(getEndpointFromConfig);
  exports.BinaryDecisionDiagram = BinaryDecisionDiagram;
  exports.EndpointCache = EndpointCache;
  exports.EndpointError = EndpointError;
  exports.customEndpointFunctions = customEndpointFunctions;
  exports.decideEndpoint = decideEndpoint;
  exports.endpointMiddleware = endpointMiddleware;
  exports.endpointMiddlewareOptions = endpointMiddlewareOptions;
  exports.getEndpointFromInstructions = getEndpointFromInstructions;
  exports.getEndpointPlugin = getEndpointPlugin;
  exports.isIpAddress = isIpAddress;
  exports.resolveEndpoint = resolveEndpoint;
  exports.resolveEndpointConfig = resolveEndpointConfig;
  exports.resolveEndpointRequiredConfig = resolveEndpointRequiredConfig;
  exports.resolveParams = resolveParams;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/serde/index.js
var require_serde = __commonJS((exports) => {
  var { createHmac, createHash, getRandomValues } = __require("node:crypto");
  var { ReadStream, lstatSync, fstatSync } = __require("node:fs");
  var { HttpResponse } = require_transport();
  var { toEndpointV1 } = require_endpoints();
  var { Duplex, Readable, Writable, PassThrough } = __require("node:stream");
  var isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
  var fromArrayBuffer = (input, offset = 0, length = input.byteLength - offset) => {
    if (!isArrayBuffer(input)) {
      throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
    }
    return Buffer.from(input, offset, length);
  };
  var fromString = (input, encoding) => {
    if (typeof input !== "string") {
      throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
    }
    return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
  };
  var BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
  var fromBase64$1 = (input) => {
    if (input.length * 3 % 4 !== 0) {
      throw new TypeError(`Incorrect padding on base64 string.`);
    }
    if (!BASE64_REGEX.exec(input)) {
      throw new TypeError(`Invalid base64 string.`);
    }
    const buffer = fromString(input, "base64");
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  };
  var fromUtf8$1 = (input) => {
    const buf = fromString(input, "utf8");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  };
  var toBase64$1 = (_input) => {
    let input;
    if (typeof _input === "string") {
      input = fromUtf8$1(_input);
    } else {
      input = _input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
      throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
    }
    return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("base64");
  };
  function bindUint8ArrayBlobAdapter(toUtf82, fromUtf82, toBase642, fromBase642) {
    return class Uint8ArrayBlobAdapter2 extends Uint8Array {
      static fromString(source, encoding = "utf-8") {
        if (typeof source === "string") {
          if (encoding === "base64") {
            return Uint8ArrayBlobAdapter2.mutate(fromBase642(source));
          }
          return Uint8ArrayBlobAdapter2.mutate(fromUtf82(source));
        }
        throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
      }
      static mutate(source) {
        Object.setPrototypeOf(source, Uint8ArrayBlobAdapter2.prototype);
        return source;
      }
      transformToString(encoding = "utf-8") {
        if (encoding === "base64") {
          return toBase642(this);
        }
        return toUtf82(this);
      }
    };
  }
  var toUtf8$1 = (input) => {
    if (typeof input === "string") {
      return input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
      throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
    }
    return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
  };
  var decimalToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bindV4(getRandomValues2) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return () => crypto.randomUUID();
    }
    return () => {
      const rnds = new Uint8Array(16);
      getRandomValues2(rnds);
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
    };
  }
  var copyDocumentWithTransform = (source, schemaRef, transform = (_) => _) => source;
  var parseBoolean = (value) => {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new Error(`Unable to parse boolean value "${value}"`);
    }
  };
  var expectBoolean = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === "number") {
      if (value === 0 || value === 1) {
        logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
      }
      if (value === 0) {
        return false;
      }
      if (value === 1) {
        return true;
      }
    }
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "false" || lower === "true") {
        logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
      }
      if (lower === "false") {
        return false;
      }
      if (lower === "true") {
        return true;
      }
    }
    if (typeof value === "boolean") {
      return value;
    }
    throw new TypeError(`Expected boolean, got ${typeof value}: ${value}`);
  };
  var expectNumber = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        if (String(parsed) !== String(value)) {
          logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
        }
        return parsed;
      }
    }
    if (typeof value === "number") {
      return value;
    }
    throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
  };
  var MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
  var expectFloat32 = (value) => {
    const expected = expectNumber(value);
    if (expected !== undefined && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
      if (Math.abs(expected) > MAX_FLOAT) {
        throw new TypeError(`Expected 32-bit float, got ${value}`);
      }
    }
    return expected;
  };
  var expectLong = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (Number.isInteger(value) && !Number.isNaN(value)) {
      return value;
    }
    throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
  };
  var expectInt = expectLong;
  var expectInt32 = (value) => expectSizedInt(value, 32);
  var expectShort = (value) => expectSizedInt(value, 16);
  var expectByte = (value) => expectSizedInt(value, 8);
  var expectSizedInt = (value, size) => {
    const expected = expectLong(value);
    if (expected !== undefined && castInt(expected, size) !== expected) {
      throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
    }
    return expected;
  };
  var castInt = (value, size) => {
    switch (size) {
      case 32:
        return Int32Array.of(value)[0];
      case 16:
        return Int16Array.of(value)[0];
      case 8:
        return Int8Array.of(value)[0];
    }
  };
  var expectNonNull = (value, location) => {
    if (value === null || value === undefined) {
      if (location) {
        throw new TypeError(`Expected a non-null value for ${location}`);
      }
      throw new TypeError("Expected a non-null value");
    }
    return value;
  };
  var expectObject = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
    const receivedType = Array.isArray(value) ? "array" : typeof value;
    throw new TypeError(`Expected object, got ${receivedType}: ${value}`);
  };
  var expectString = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === "string") {
      return value;
    }
    if (["boolean", "number", "bigint"].includes(typeof value)) {
      logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
      return String(value);
    }
    throw new TypeError(`Expected string, got ${typeof value}: ${value}`);
  };
  var expectUnion = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    const asObject = expectObject(value);
    const setKeys = [];
    for (const k in asObject) {
      if (asObject[k] != null) {
        setKeys.push(k);
      }
    }
    if (setKeys.length === 0) {
      throw new TypeError(`Unions must have exactly one non-null member. None were found.`);
    }
    if (setKeys.length > 1) {
      throw new TypeError(`Unions must have exactly one non-null member. Keys ${setKeys} were not null.`);
    }
    return asObject;
  };
  var strictParseDouble = (value) => {
    if (typeof value == "string") {
      return expectNumber(parseNumber(value));
    }
    return expectNumber(value);
  };
  var strictParseFloat = strictParseDouble;
  var strictParseFloat32 = (value) => {
    if (typeof value == "string") {
      return expectFloat32(parseNumber(value));
    }
    return expectFloat32(value);
  };
  var NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
  var parseNumber = (value) => {
    const matches = value.match(NUMBER_REGEX);
    if (matches === null || matches[0].length !== value.length) {
      throw new TypeError(`Expected real number, got implicit NaN`);
    }
    return parseFloat(value);
  };
  var limitedParseDouble = (value) => {
    if (typeof value == "string") {
      return parseFloatString(value);
    }
    return expectNumber(value);
  };
  var handleFloat = limitedParseDouble;
  var limitedParseFloat = limitedParseDouble;
  var limitedParseFloat32 = (value) => {
    if (typeof value == "string") {
      return parseFloatString(value);
    }
    return expectFloat32(value);
  };
  var parseFloatString = (value) => {
    switch (value) {
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        throw new Error(`Unable to parse float value: ${value}`);
    }
  };
  var strictParseLong = (value) => {
    if (typeof value === "string") {
      return expectLong(parseNumber(value));
    }
    return expectLong(value);
  };
  var strictParseInt = strictParseLong;
  var strictParseInt32 = (value) => {
    if (typeof value === "string") {
      return expectInt32(parseNumber(value));
    }
    return expectInt32(value);
  };
  var strictParseShort = (value) => {
    if (typeof value === "string") {
      return expectShort(parseNumber(value));
    }
    return expectShort(value);
  };
  var strictParseByte = (value) => {
    if (typeof value === "string") {
      return expectByte(parseNumber(value));
    }
    return expectByte(value);
  };
  var stackTraceWarning = (message) => {
    return String(new TypeError(message).stack || message).split(`
`).slice(0, 5).filter((s) => !s.includes("stackTraceWarning")).join(`
`);
  };
  var logger = {
    warn: console.warn
  };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dateToUtcString(date2) {
    const year2 = date2.getUTCFullYear();
    const month = date2.getUTCMonth();
    const dayOfWeek = date2.getUTCDay();
    const dayOfMonthInt = date2.getUTCDate();
    const hoursInt = date2.getUTCHours();
    const minutesInt = date2.getUTCMinutes();
    const secondsInt = date2.getUTCSeconds();
    const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
    const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
    const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
    const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
    return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year2} ${hoursString}:${minutesString}:${secondsString} GMT`;
  }
  var RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
  var parseRfc3339DateTime = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC-3339 date-times must be expressed as strings");
    }
    const match = RFC3339.exec(value);
    if (!match) {
      throw new TypeError("Invalid RFC-3339 date-time value");
    }
    const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    const year2 = strictParseShort(stripLeadingZeroes(yearStr));
    const month = parseDateValue(monthStr, "month", 1, 12);
    const day = parseDateValue(dayStr, "day", 1, 31);
    return buildDate(year2, month, day, { hours, minutes, seconds, fractionalMilliseconds });
  };
  var RFC3339_WITH_OFFSET$1 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/);
  var parseRfc3339DateTimeWithOffset = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC-3339 date-times must be expressed as strings");
    }
    const match = RFC3339_WITH_OFFSET$1.exec(value);
    if (!match) {
      throw new TypeError("Invalid RFC-3339 date-time value");
    }
    const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
    const year2 = strictParseShort(stripLeadingZeroes(yearStr));
    const month = parseDateValue(monthStr, "month", 1, 12);
    const day = parseDateValue(dayStr, "day", 1, 31);
    const date2 = buildDate(year2, month, day, { hours, minutes, seconds, fractionalMilliseconds });
    if (offsetStr.toUpperCase() != "Z") {
      date2.setTime(date2.getTime() - parseOffsetToMilliseconds(offsetStr));
    }
    return date2;
  };
  var IMF_FIXDATE$1 = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
  var RFC_850_DATE$1 = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
  var ASC_TIME$1 = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
  var parseRfc7231DateTime = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC-7231 date-times must be expressed as strings");
    }
    let match = IMF_FIXDATE$1.exec(value);
    if (match) {
      const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
      return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
    }
    match = RFC_850_DATE$1.exec(value);
    if (match) {
      const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
      return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
        hours,
        minutes,
        seconds,
        fractionalMilliseconds
      }));
    }
    match = ASC_TIME$1.exec(value);
    if (match) {
      const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
      return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
    }
    throw new TypeError("Invalid RFC-7231 date-time value");
  };
  var parseEpochTimestamp = (value) => {
    if (value === null || value === undefined) {
      return;
    }
    let valueAsDouble;
    if (typeof value === "number") {
      valueAsDouble = value;
    } else if (typeof value === "string") {
      valueAsDouble = strictParseDouble(value);
    } else if (typeof value === "object" && value.tag === 1) {
      valueAsDouble = value.value;
    } else {
      throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
    }
    if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) {
      throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
    }
    return new Date(Math.round(valueAsDouble * 1000));
  };
  var buildDate = (year2, month, day, time2) => {
    const adjustedMonth = month - 1;
    validateDayOfMonth(year2, adjustedMonth, day);
    return new Date(Date.UTC(year2, adjustedMonth, day, parseDateValue(time2.hours, "hour", 0, 23), parseDateValue(time2.minutes, "minute", 0, 59), parseDateValue(time2.seconds, "seconds", 0, 60), parseMilliseconds(time2.fractionalMilliseconds)));
  };
  var parseTwoDigitYear = (value) => {
    const thisYear = new Date().getUTCFullYear();
    const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
    if (valueInThisCentury < thisYear) {
      return valueInThisCentury + 100;
    }
    return valueInThisCentury;
  };
  var FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1000;
  var adjustRfc850Year = (input) => {
    if (input.getTime() - new Date().getTime() > FIFTY_YEARS_IN_MILLIS) {
      return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
    }
    return input;
  };
  var parseMonthByShortName = (value) => {
    const monthIdx = MONTHS.indexOf(value);
    if (monthIdx < 0) {
      throw new TypeError(`Invalid month: ${value}`);
    }
    return monthIdx + 1;
  };
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var validateDayOfMonth = (year2, month, day) => {
    let maxDays = DAYS_IN_MONTH[month];
    if (month === 1 && isLeapYear(year2)) {
      maxDays = 29;
    }
    if (day > maxDays) {
      throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year2}: ${day}`);
    }
  };
  var isLeapYear = (year2) => {
    return year2 % 4 === 0 && (year2 % 100 !== 0 || year2 % 400 === 0);
  };
  var parseDateValue = (value, type, lower, upper) => {
    const dateVal = strictParseByte(stripLeadingZeroes(value));
    if (dateVal < lower || dateVal > upper) {
      throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
    }
    return dateVal;
  };
  var parseMilliseconds = (value) => {
    if (value === null || value === undefined) {
      return 0;
    }
    return strictParseFloat32("0." + value) * 1000;
  };
  var parseOffsetToMilliseconds = (value) => {
    const directionStr = value[0];
    let direction = 1;
    if (directionStr == "+") {
      direction = 1;
    } else if (directionStr == "-") {
      direction = -1;
    } else {
      throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
    }
    const hour = Number(value.substring(1, 3));
    const minute = Number(value.substring(4, 6));
    return direction * (hour * 60 + minute) * 60 * 1000;
  };
  var stripLeadingZeroes = (value) => {
    let idx = 0;
    while (idx < value.length - 1 && value.charAt(idx) === "0") {
      idx++;
    }
    if (idx === 0) {
      return value;
    }
    return value.slice(idx);
  };
  var LazyJsonString = function LazyJsonString2(val) {
    const str = Object.assign(new String(val), {
      deserializeJSON() {
        return JSON.parse(String(val));
      },
      toString() {
        return String(val);
      },
      toJSON() {
        return String(val);
      }
    });
    return str;
  };
  LazyJsonString.from = (object) => {
    if (object && typeof object === "object" && (object instanceof LazyJsonString || ("deserializeJSON" in object))) {
      return object;
    } else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) {
      return LazyJsonString(String(object));
    }
    return LazyJsonString(JSON.stringify(object));
  };
  LazyJsonString.fromObject = LazyJsonString.from;
  function quoteHeader(part) {
    if (part.includes(",") || part.includes('"')) {
      part = `"${part.replace(/"/g, "\\\"")}"`;
    }
    return part;
  }
  var ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
  var mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
  var time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
  var date = `(\\d?\\d)`;
  var year = `(\\d{4})`;
  var RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
  var IMF_FIXDATE = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
  var RFC_850_DATE = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
  var ASC_TIME = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var _parseEpochTimestamp = (value) => {
    if (value == null) {
      return;
    }
    let num = NaN;
    if (typeof value === "number") {
      num = value;
    } else if (typeof value === "string") {
      if (!/^-?\d*\.?\d+$/.test(value)) {
        throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
      }
      num = Number.parseFloat(value);
    } else if (typeof value === "object" && value.tag === 1) {
      num = value.value;
    }
    if (isNaN(num) || Math.abs(num) === Infinity) {
      throw new TypeError("Epoch timestamps must be valid finite numbers.");
    }
    return new Date(Math.round(num * 1000));
  };
  var _parseRfc3339DateTimeWithOffset = (value) => {
    if (value == null) {
      return;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC3339 timestamps must be strings");
    }
    const matches = RFC3339_WITH_OFFSET.exec(value);
    if (!matches) {
      throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
    }
    const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
    range(monthStr, 1, 12);
    range(dayStr, 1, 31);
    range(hours, 0, 23);
    range(minutes, 0, 59);
    range(seconds, 0, 60);
    const date2 = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1000) : 0));
    date2.setUTCFullYear(Number(yearStr));
    if (offsetStr.toUpperCase() != "Z") {
      const [, sign, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [undefined, "+", 0, 0];
      const scalar = sign === "-" ? 1 : -1;
      date2.setTime(date2.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1000 + Number(offsetM) * 60 * 1000));
    }
    return date2;
  };
  var _parseRfc7231DateTime = (value) => {
    if (value == null) {
      return;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC7231 timestamps must be strings.");
    }
    let day;
    let month;
    let year2;
    let hour;
    let minute;
    let second;
    let fraction;
    let matches;
    if (matches = IMF_FIXDATE.exec(value)) {
      [, day, month, year2, hour, minute, second, fraction] = matches;
    } else if (matches = RFC_850_DATE.exec(value)) {
      [, day, month, year2, hour, minute, second, fraction] = matches;
      year2 = (Number(year2) + 1900).toString();
    } else if (matches = ASC_TIME.exec(value)) {
      [, month, day, hour, minute, second, fraction, year2] = matches;
    }
    if (year2 && second) {
      const timestamp = Date.UTC(Number(year2), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1000) : 0);
      range(day, 1, 31);
      range(hour, 0, 23);
      range(minute, 0, 59);
      range(second, 0, 60);
      const date2 = new Date(timestamp);
      date2.setUTCFullYear(Number(year2));
      return date2;
    }
    throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
  };
  function range(v, min, max) {
    const _v = Number(v);
    if (_v < min || _v > max) {
      throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
    }
  }
  function splitEvery(value, delimiter, numDelimiters) {
    if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) {
      throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
    }
    const segments = value.split(delimiter);
    if (numDelimiters === 1) {
      return segments;
    }
    const compoundSegments = [];
    let currentSegment = "";
    for (let i = 0;i < segments.length; i++) {
      if (currentSegment === "") {
        currentSegment = segments[i];
      } else {
        currentSegment += delimiter + segments[i];
      }
      if ((i + 1) % numDelimiters === 0) {
        compoundSegments.push(currentSegment);
        currentSegment = "";
      }
    }
    if (currentSegment !== "") {
      compoundSegments.push(currentSegment);
    }
    return compoundSegments;
  }
  var splitHeader = (value) => {
    const z = value.length;
    const values = [];
    let withinQuotes = false;
    let prevChar = undefined;
    let anchor = 0;
    for (let i = 0;i < z; ++i) {
      const char = value[i];
      switch (char) {
        case `"`:
          if (prevChar !== "\\") {
            withinQuotes = !withinQuotes;
          }
          break;
        case ",":
          if (!withinQuotes) {
            values.push(value.slice(anchor, i));
            anchor = i + 1;
          }
          break;
      }
      prevChar = char;
    }
    values.push(value.slice(anchor));
    return values.map((v) => {
      v = v.trim();
      const z2 = v.length;
      if (z2 < 2) {
        return v;
      }
      if (v[0] === `"` && v[z2 - 1] === `"`) {
        v = v.slice(1, z2 - 1);
      }
      return v.replace(/\\"/g, '"');
    });
  };
  var format = /^-?\d*(\.\d+)?$/;

  class NumericValue {
    string;
    type;
    constructor(string, type) {
      this.string = string;
      this.type = type;
      if (!format.test(string)) {
        throw new Error(`@smithy/core/serde - NumericValue must only contain [0-9], at most one decimal point ".", and an optional negation prefix "-".`);
      }
    }
    toString() {
      return this.string;
    }
    static [Symbol.hasInstance](object) {
      if (!object || typeof object !== "object") {
        return false;
      }
      const _nv = object;
      return NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
    }
  }
  function nv(input) {
    return new NumericValue(String(input), "bigDecimal");
  }
  var SHORT_TO_HEX = {};
  var HEX_TO_SHORT = {};
  for (let i = 0;i < 256; i++) {
    let encodedByte = i.toString(16).toLowerCase();
    if (encodedByte.length === 1) {
      encodedByte = `0${encodedByte}`;
    }
    SHORT_TO_HEX[i] = encodedByte;
    HEX_TO_SHORT[encodedByte] = i;
  }
  function fromHex(encoded) {
    if (encoded.length % 2 !== 0) {
      throw new Error("Hex encoded strings must have an even number length");
    }
    const out = new Uint8Array(encoded.length / 2);
    for (let i = 0;i < encoded.length; i += 2) {
      const encodedByte = encoded.slice(i, i + 2).toLowerCase();
      if (encodedByte in HEX_TO_SHORT) {
        out[i / 2] = HEX_TO_SHORT[encodedByte];
      } else {
        throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
      }
    }
    return out;
  }
  function toHex(bytes) {
    let out = "";
    for (let i = 0;i < bytes.byteLength; i++) {
      out += SHORT_TO_HEX[bytes[i]];
    }
    return out;
  }
  var calculateBodyLength = (body) => {
    if (!body) {
      return 0;
    }
    if (typeof body === "string") {
      return Buffer.byteLength(body);
    } else if (typeof body.byteLength === "number") {
      return body.byteLength;
    } else if (typeof body.size === "number") {
      return body.size;
    } else if (typeof body.start === "number" && typeof body.end === "number") {
      return body.end + 1 - body.start;
    } else if (body instanceof ReadStream) {
      if (body.path != null) {
        return lstatSync(body.path).size;
      } else if (typeof body.fd === "number") {
        return fstatSync(body.fd).size;
      }
    }
    throw new Error(`Body Length computation failed for ${body}`);
  };
  var toUint8Array = (data) => {
    if (typeof data === "string") {
      return fromUtf8$1(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  };
  var deserializerMiddleware = (options, deserializer) => (next, context) => async (args) => {
    const { response } = await next(args);
    try {
      const parsed = await deserializer(response, options);
      return {
        response,
        output: parsed
      };
    } catch (error) {
      Object.defineProperty(error, "$response", {
        value: response,
        enumerable: false,
        writable: false,
        configurable: false
      });
      if (!("$metadata" in error)) {
        const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
        try {
          error.message += `
  ` + hint;
        } catch (e) {
          if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") {
            console.warn(hint);
          } else {
            context.logger?.warn?.(hint);
          }
        }
        if (typeof error.$responseBodyText !== "undefined") {
          if (error.$response) {
            error.$response.body = error.$responseBodyText;
          }
        }
        try {
          if (HttpResponse.isInstance(response)) {
            const { headers = {} } = response;
            const headerEntries = Object.entries(headers);
            error.$metadata = {
              httpStatusCode: response.statusCode,
              requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
              extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
              cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
            };
          }
        } catch (e) {}
      }
      throw error;
    }
  };
  var findHeader = (pattern, headers) => {
    return (headers.find(([k]) => {
      return k.match(pattern);
    }) || [undefined, undefined])[1];
  };
  var serializerMiddleware = (options, serializer) => (next, context) => async (args) => {
    const endpointConfig = options;
    const endpoint = context.endpointV2 ? async () => toEndpointV1(context.endpointV2) : endpointConfig.endpoint;
    if (!endpoint) {
      throw new Error("No valid endpoint provider available.");
    }
    const request = await serializer(args.input, { ...options, endpoint });
    return next({
      ...args,
      request
    });
  };
  var deserializerMiddlewareOption = {
    name: "deserializerMiddleware",
    step: "deserialize",
    tags: ["DESERIALIZER"],
    override: true
  };
  var serializerMiddlewareOption = {
    name: "serializerMiddleware",
    step: "serialize",
    tags: ["SERIALIZER"],
    override: true
  };
  function getSerdePlugin(config, serializer, deserializer) {
    return {
      applyToStack: (commandStack) => {
        commandStack.add(deserializerMiddleware(config, deserializer), deserializerMiddlewareOption);
        commandStack.add(serializerMiddleware(config, serializer), serializerMiddlewareOption);
      }
    };
  }

  class Hash {
    algorithmIdentifier;
    secret;
    hash;
    constructor(algorithmIdentifier, secret) {
      this.algorithmIdentifier = algorithmIdentifier;
      this.secret = secret;
      this.reset();
    }
    update(toHash, encoding) {
      this.hash.update(toUint8Array(castSourceData(toHash, encoding)));
    }
    digest() {
      return Promise.resolve(this.hash.digest());
    }
    reset() {
      this.hash = this.secret ? createHmac(this.algorithmIdentifier, castSourceData(this.secret)) : createHash(this.algorithmIdentifier);
    }
  }
  function castSourceData(toCast, encoding) {
    if (Buffer.isBuffer(toCast)) {
      return toCast;
    }
    if (typeof toCast === "string") {
      return fromString(toCast, encoding);
    }
    if (ArrayBuffer.isView(toCast)) {
      return fromArrayBuffer(toCast.buffer, toCast.byteOffset, toCast.byteLength);
    }
    return fromArrayBuffer(toCast);
  }
  var ChecksumStream$1 = class ChecksumStream2 extends Duplex {
    expectedChecksum;
    checksumSourceLocation;
    checksum;
    source;
    base64Encoder;
    pendingCallback = null;
    constructor({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) {
      super();
      if (typeof source.pipe === "function") {
        this.source = source;
      } else {
        throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
      }
      this.base64Encoder = base64Encoder ?? toBase64$1;
      this.expectedChecksum = expectedChecksum;
      this.checksum = checksum;
      this.checksumSourceLocation = checksumSourceLocation;
      this.source.pipe(this);
    }
    _read(size) {
      if (this.pendingCallback) {
        const callback = this.pendingCallback;
        this.pendingCallback = null;
        callback();
      }
    }
    _write(chunk, encoding, callback) {
      try {
        this.checksum.update(chunk);
        const canPushMore = this.push(chunk);
        if (!canPushMore) {
          this.pendingCallback = callback;
          return;
        }
      } catch (e) {
        return callback(e);
      }
      return callback();
    }
    async _final(callback) {
      try {
        const digest = await this.checksum.digest();
        const received = this.base64Encoder(digest);
        if (this.expectedChecksum !== received) {
          return callback(new Error(`Checksum mismatch: expected "${this.expectedChecksum}" but received "${received}"` + ` in response header "${this.checksumSourceLocation}".`));
        }
      } catch (e) {
        return callback(e);
      }
      this.push(null);
      return callback();
    }
  };
  var isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
  var isBlob = (blob) => {
    return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
  };
  var fromUtf8 = (input) => new TextEncoder().encode(input);
  var chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
  var alphabetByEncoding = Object.entries(chars).reduce((acc, [i, c]) => {
    acc[c] = Number(i);
    return acc;
  }, {});
  var alphabetByValue = chars.split("");
  var bitsPerLetter = 6;
  var bitsPerByte = 8;
  var maxLetterValue = 63;
  function toBase64(_input) {
    let input;
    if (typeof _input === "string") {
      input = fromUtf8(_input);
    } else {
      input = _input;
    }
    const isArrayLike = typeof input === "object" && typeof input.length === "number";
    const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
    if (!isArrayLike && !isUint8Array) {
      throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
    }
    let str = "";
    for (let i = 0;i < input.length; i += 3) {
      let bits = 0;
      let bitLength = 0;
      for (let j = i, limit = Math.min(i + 3, input.length);j < limit; j++) {
        bits |= input[j] << (limit - j - 1) * bitsPerByte;
        bitLength += bitsPerByte;
      }
      const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
      bits <<= bitClusterCount * bitsPerLetter - bitLength;
      for (let k = 1;k <= bitClusterCount; k++) {
        const offset = (bitClusterCount - k) * bitsPerLetter;
        str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
      }
      str += "==".slice(0, 4 - bitClusterCount);
    }
    return str;
  }
  var ReadableStreamRef = typeof ReadableStream === "function" ? ReadableStream : function() {};

  class ChecksumStream extends ReadableStreamRef {
  }
  var createChecksumStream$1 = ({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) => {
    if (!isReadableStream(source)) {
      throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
    }
    const encoder = base64Encoder ?? toBase64;
    if (typeof TransformStream !== "function") {
      throw new Error("@smithy/util-stream: unable to instantiate ChecksumStream because API unavailable: ReadableStream/TransformStream.");
    }
    const transform = new TransformStream({
      start() {},
      async transform(chunk, controller) {
        checksum.update(chunk);
        controller.enqueue(chunk);
      },
      async flush(controller) {
        const digest = await checksum.digest();
        const received = encoder(digest);
        if (expectedChecksum !== received) {
          const error = new Error(`Checksum mismatch: expected "${expectedChecksum}" but received "${received}"` + ` in response header "${checksumSourceLocation}".`);
          controller.error(error);
        } else {
          controller.terminate();
        }
      }
    });
    source.pipeThrough(transform);
    const readable = transform.readable;
    Object.setPrototypeOf(readable, ChecksumStream.prototype);
    return readable;
  };
  function createChecksumStream(init) {
    if (typeof ReadableStream === "function" && isReadableStream(init.source)) {
      return createChecksumStream$1(init);
    }
    return new ChecksumStream$1(init);
  }

  class ByteArrayCollector {
    allocByteArray;
    byteLength = 0;
    byteArrays = [];
    constructor(allocByteArray) {
      this.allocByteArray = allocByteArray;
    }
    push(byteArray) {
      this.byteArrays.push(byteArray);
      this.byteLength += byteArray.byteLength;
    }
    flush() {
      if (this.byteArrays.length === 1) {
        const bytes = this.byteArrays[0];
        this.reset();
        return bytes;
      }
      const aggregation = this.allocByteArray(this.byteLength);
      let cursor = 0;
      for (let i = 0;i < this.byteArrays.length; ++i) {
        const bytes = this.byteArrays[i];
        aggregation.set(bytes, cursor);
        cursor += bytes.byteLength;
      }
      this.reset();
      return aggregation;
    }
    reset() {
      this.byteArrays = [];
      this.byteLength = 0;
    }
  }
  function createBufferedReadableStream(upstream, size, logger2) {
    const reader = upstream.getReader();
    let streamBufferingLoggedWarning = false;
    let bytesSeen = 0;
    const buffers = ["", new ByteArrayCollector((size2) => new Uint8Array(size2))];
    let mode = -1;
    const pull = async (controller) => {
      const { value, done } = await reader.read();
      const chunk = value;
      if (done) {
        if (mode !== -1) {
          const remainder = flush(buffers, mode);
          if (sizeOf(remainder) > 0) {
            controller.enqueue(remainder);
          }
        }
        controller.close();
      } else {
        const chunkMode = modeOf(chunk, false);
        if (mode !== chunkMode) {
          if (mode >= 0) {
            controller.enqueue(flush(buffers, mode));
          }
          mode = chunkMode;
        }
        if (mode === -1) {
          controller.enqueue(chunk);
          return;
        }
        const chunkSize = sizeOf(chunk);
        bytesSeen += chunkSize;
        const bufferSize = sizeOf(buffers[mode]);
        if (chunkSize >= size && bufferSize === 0) {
          controller.enqueue(chunk);
        } else {
          const newSize = merge(buffers, mode, chunk);
          if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
            streamBufferingLoggedWarning = true;
            logger2?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
          }
          if (newSize >= size) {
            controller.enqueue(flush(buffers, mode));
          } else {
            await pull(controller);
          }
        }
      }
    };
    return new ReadableStream({
      pull
    });
  }
  function merge(buffers, mode, chunk) {
    switch (mode) {
      case 0:
        buffers[0] += chunk;
        return sizeOf(buffers[0]);
      case 1:
      case 2:
        buffers[mode].push(chunk);
        return sizeOf(buffers[mode]);
    }
  }
  function flush(buffers, mode) {
    switch (mode) {
      case 0:
        const s = buffers[0];
        buffers[0] = "";
        return s;
      case 1:
      case 2:
        return buffers[mode].flush();
    }
    throw new Error(`@smithy/util-stream - invalid index ${mode} given to flush()`);
  }
  function sizeOf(chunk) {
    return chunk?.byteLength ?? chunk?.length ?? 0;
  }
  function modeOf(chunk, allowBuffer = true) {
    if (allowBuffer && typeof Buffer !== "undefined" && chunk instanceof Buffer) {
      return 2;
    }
    if (chunk instanceof Uint8Array) {
      return 1;
    }
    if (typeof chunk === "string") {
      return 0;
    }
    return -1;
  }
  function createBufferedReadable(upstream, size, logger2) {
    if (isReadableStream(upstream)) {
      return createBufferedReadableStream(upstream, size, logger2);
    }
    const downstream = new Readable({ read() {} });
    let streamBufferingLoggedWarning = false;
    let bytesSeen = 0;
    const buffers = [
      "",
      new ByteArrayCollector((size2) => new Uint8Array(size2)),
      new ByteArrayCollector((size2) => Buffer.from(new Uint8Array(size2)))
    ];
    let mode = -1;
    upstream.on("data", (chunk) => {
      const chunkMode = modeOf(chunk, true);
      if (mode !== chunkMode) {
        if (mode >= 0) {
          downstream.push(flush(buffers, mode));
        }
        mode = chunkMode;
      }
      if (mode === -1) {
        downstream.push(chunk);
        return;
      }
      const chunkSize = sizeOf(chunk);
      bytesSeen += chunkSize;
      const bufferSize = sizeOf(buffers[mode]);
      if (chunkSize >= size && bufferSize === 0) {
        downstream.push(chunk);
      } else {
        const newSize = merge(buffers, mode, chunk);
        if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
          streamBufferingLoggedWarning = true;
          logger2?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
        }
        if (newSize >= size) {
          downstream.push(flush(buffers, mode));
        }
      }
    });
    upstream.on("end", () => {
      if (mode !== -1) {
        const remainder = flush(buffers, mode);
        if (sizeOf(remainder) > 0) {
          downstream.push(remainder);
        }
      }
      downstream.push(null);
    });
    return downstream;
  }
  var getAwsChunkedEncodingStream$1 = (readableStream, options) => {
    const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
    const checksumRequired = base64Encoder !== undefined && bodyLengthChecker !== undefined && checksumAlgorithmFn !== undefined && checksumLocationName !== undefined && streamHasher !== undefined;
    const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : undefined;
    const reader = readableStream.getReader();
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) {
          controller.enqueue(`0\r
`);
          if (checksumRequired) {
            const checksum = base64Encoder(await digest);
            controller.enqueue(`${checksumLocationName}:${checksum}\r
`);
            controller.enqueue(`\r
`);
          }
          controller.close();
        } else {
          controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r
${value}\r
`);
        }
      }
    });
  };
  function getAwsChunkedEncodingStream(stream, options) {
    const readable = stream;
    const readableStream = stream;
    if (isReadableStream(readableStream)) {
      return getAwsChunkedEncodingStream$1(readableStream, options);
    }
    const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
    const checksumRequired = base64Encoder !== undefined && checksumAlgorithmFn !== undefined && checksumLocationName !== undefined && streamHasher !== undefined;
    const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readable) : undefined;
    const awsChunkedEncodingStream = new Readable({
      read: () => {}
    });
    readable.on("data", (data) => {
      const length = bodyLengthChecker(data) || 0;
      if (length === 0) {
        return;
      }
      awsChunkedEncodingStream.push(`${length.toString(16)}\r
`);
      awsChunkedEncodingStream.push(data);
      awsChunkedEncodingStream.push(`\r
`);
    });
    readable.on("end", async () => {
      awsChunkedEncodingStream.push(`0\r
`);
      if (checksumRequired) {
        const checksum = base64Encoder(await digest);
        awsChunkedEncodingStream.push(`${checksumLocationName}:${checksum}\r
`);
        awsChunkedEncodingStream.push(`\r
`);
      }
      awsChunkedEncodingStream.push(null);
    });
    return awsChunkedEncodingStream;
  }
  async function headStream$1(stream, bytes) {
    let byteLengthCounter = 0;
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        byteLengthCounter += value?.byteLength ?? 0;
      }
      if (byteLengthCounter >= bytes) {
        break;
      }
      isDone = done;
    }
    reader.releaseLock();
    const collected = new Uint8Array(Math.min(bytes, byteLengthCounter));
    let offset = 0;
    for (const chunk of chunks) {
      if (chunk.byteLength > collected.byteLength - offset) {
        collected.set(chunk.subarray(0, collected.byteLength - offset), offset);
        break;
      } else {
        collected.set(chunk, offset);
      }
      offset += chunk.length;
    }
    return collected;
  }
  var headStream = (stream, bytes) => {
    if (isReadableStream(stream)) {
      return headStream$1(stream, bytes);
    }
    return new Promise((resolve, reject) => {
      const collector = new Collector$1;
      collector.limit = bytes;
      stream.pipe(collector);
      stream.on("error", (err) => {
        collector.end();
        reject(err);
      });
      collector.on("error", reject);
      collector.on("finish", function() {
        const bytes2 = new Uint8Array(Buffer.concat(this.buffers));
        resolve(bytes2);
      });
    });
  };
  var Collector$1 = class Collector2 extends Writable {
    buffers = [];
    limit = Infinity;
    bytesBuffered = 0;
    _write(chunk, encoding, callback) {
      this.buffers.push(chunk);
      this.bytesBuffered += chunk.byteLength ?? 0;
      if (this.bytesBuffered >= this.limit) {
        const excess = this.bytesBuffered - this.limit;
        const tailBuffer = this.buffers[this.buffers.length - 1];
        this.buffers[this.buffers.length - 1] = tailBuffer.subarray(0, tailBuffer.byteLength - excess);
        this.emit("finish");
      }
      callback();
    }
  };
  var toUtf8 = (input) => {
    if (typeof input === "string") {
      return input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
      throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
    }
    return new TextDecoder("utf-8").decode(input);
  };
  var fromBase64 = (input) => {
    let totalByteLength = input.length / 4 * 3;
    if (input.slice(-2) === "==") {
      totalByteLength -= 2;
    } else if (input.slice(-1) === "=") {
      totalByteLength--;
    }
    const out = new ArrayBuffer(totalByteLength);
    const dataView = new DataView(out);
    for (let i = 0;i < input.length; i += 4) {
      let bits = 0;
      let bitLength = 0;
      for (let j = i, limit = i + 3;j <= limit; j++) {
        if (input[j] !== "=") {
          if (!(input[j] in alphabetByEncoding)) {
            throw new TypeError(`Invalid character ${input[j]} in base64 string.`);
          }
          bits |= alphabetByEncoding[input[j]] << (limit - j) * bitsPerLetter;
          bitLength += bitsPerLetter;
        } else {
          bits >>= bitsPerLetter;
        }
      }
      const chunkOffset = i / 4 * 3;
      bits >>= bitLength % bitsPerByte;
      const byteLength = Math.floor(bitLength / bitsPerByte);
      for (let k = 0;k < byteLength; k++) {
        const offset = (byteLength - k - 1) * bitsPerByte;
        dataView.setUint8(chunkOffset + k, (bits & 255 << offset) >> offset);
      }
    }
    return new Uint8Array(out);
  };
  var streamCollector$1 = async (stream) => {
    if (typeof Blob === "function" && stream instanceof Blob || stream.constructor?.name === "Blob") {
      if (Blob.prototype.arrayBuffer !== undefined) {
        return new Uint8Array(await stream.arrayBuffer());
      }
      return collectBlob(stream);
    }
    return collectStream(stream);
  };
  async function collectBlob(blob) {
    const base64 = await readToBase64(blob);
    const arrayBuffer = fromBase64(base64);
    return new Uint8Array(arrayBuffer);
  }
  async function collectStream(stream) {
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    let length = 0;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        length += value.length;
      }
      isDone = done;
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      collected.set(chunk, offset);
      offset += chunk.length;
    }
    return collected;
  }
  function readToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onloadend = () => {
        if (reader.readyState !== 2) {
          return reject(new Error("Reader aborted too early"));
        }
        const result = reader.result ?? "";
        const commaIndex = result.indexOf(",");
        const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
        resolve(result.substring(dataOffset));
      };
      reader.onabort = () => reject(new Error("Read aborted"));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1 = "The stream has already been transformed.";
  var sdkStreamMixin$1 = (stream) => {
    if (!isBlobInstance(stream) && !isReadableStream(stream)) {
      const name = stream?.__proto__?.constructor?.name || stream;
      throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
    }
    let transformed = false;
    const transformToByteArray = async () => {
      if (transformed) {
        throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
      }
      transformed = true;
      return await streamCollector$1(stream);
    };
    const blobToWebStream = (blob) => {
      if (typeof blob.stream !== "function") {
        throw new Error(`Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.
` + "If you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
      }
      return blob.stream();
    };
    return Object.assign(stream, {
      transformToByteArray,
      transformToString: async (encoding) => {
        const buf = await transformToByteArray();
        if (encoding === "base64") {
          return toBase64(buf);
        } else if (encoding === "hex") {
          return toHex(buf);
        } else if (encoding === undefined || encoding === "utf8" || encoding === "utf-8") {
          return toUtf8(buf);
        } else if (typeof TextDecoder === "function") {
          return new TextDecoder(encoding).decode(buf);
        } else {
          throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
        }
      },
      transformToWebStream: () => {
        if (transformed) {
          throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED$1);
        }
        transformed = true;
        if (isBlobInstance(stream)) {
          return blobToWebStream(stream);
        } else if (isReadableStream(stream)) {
          return stream;
        } else {
          throw new Error(`Cannot transform payload to web stream, got ${stream}`);
        }
      }
    });
  };
  var isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;

  class Collector extends Writable {
    bufferedBytes = [];
    _write(chunk, encoding, callback) {
      this.bufferedBytes.push(chunk);
      callback();
    }
  }
  var isReadableStreamInstance = (stream) => typeof ReadableStream === "function" && stream instanceof ReadableStream;
  async function collectReadableStream(stream) {
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    let length = 0;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        length += value.length;
      }
      isDone = done;
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      collected.set(chunk, offset);
      offset += chunk.length;
    }
    return collected;
  }
  var streamCollector = (stream) => {
    if (isReadableStreamInstance(stream)) {
      return collectReadableStream(stream);
    }
    return new Promise((resolve, reject) => {
      const collector = new Collector;
      stream.pipe(collector);
      stream.on("error", (err) => {
        collector.end();
        reject(err);
      });
      collector.on("error", reject);
      collector.on("finish", function() {
        const bytes = new Uint8Array(Buffer.concat(this.bufferedBytes));
        resolve(bytes);
      });
    });
  };
  var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
  var sdkStreamMixin = (stream) => {
    if (!(stream instanceof Readable)) {
      try {
        return sdkStreamMixin$1(stream);
      } catch (e) {
        const name = stream?.__proto__?.constructor?.name || stream;
        throw new Error(`Unexpected stream implementation, expect Stream.Readable instance, got ${name}`);
      }
    }
    let transformed = false;
    const transformToByteArray = async () => {
      if (transformed) {
        throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
      }
      transformed = true;
      return await streamCollector(stream);
    };
    return Object.assign(stream, {
      transformToByteArray,
      transformToString: async (encoding) => {
        const buf = await transformToByteArray();
        if (encoding === undefined || Buffer.isEncoding(encoding)) {
          return fromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength).toString(encoding);
        } else {
          const decoder = new TextDecoder(encoding);
          return decoder.decode(buf);
        }
      },
      transformToWebStream: () => {
        if (transformed) {
          throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        if (stream.readableFlowing !== null) {
          throw new Error("The stream has been consumed by other callbacks.");
        }
        if (typeof Readable.toWeb !== "function") {
          throw new Error("Readable.toWeb() is not supported. Please ensure a polyfill is available.");
        }
        transformed = true;
        return Readable.toWeb(stream);
      }
    });
  };
  async function splitStream$1(stream) {
    if (typeof stream.stream === "function") {
      stream = stream.stream();
    }
    const readableStream = stream;
    return readableStream.tee();
  }
  async function splitStream(stream) {
    if (isReadableStream(stream) || isBlob(stream)) {
      return splitStream$1(stream);
    }
    const stream1 = new PassThrough;
    const stream2 = new PassThrough;
    stream.pipe(stream1);
    stream.pipe(stream2);
    return [stream1, stream2];
  }

  class Uint8ArrayBlobAdapter extends bindUint8ArrayBlobAdapter(toUtf8$1, fromUtf8$1, toBase64$1, fromBase64$1) {
  }
  var _getRandomValues = getRandomValues;
  var v4 = bindV4(_getRandomValues);
  var generateIdempotencyToken = v4;
  exports.ChecksumStream = ChecksumStream$1;
  exports.Hash = Hash;
  exports.LazyJsonString = LazyJsonString;
  exports.NumericValue = NumericValue;
  exports.Uint8ArrayBlobAdapter = Uint8ArrayBlobAdapter;
  exports._parseEpochTimestamp = _parseEpochTimestamp;
  exports._parseRfc3339DateTimeWithOffset = _parseRfc3339DateTimeWithOffset;
  exports._parseRfc7231DateTime = _parseRfc7231DateTime;
  exports.calculateBodyLength = calculateBodyLength;
  exports.copyDocumentWithTransform = copyDocumentWithTransform;
  exports.createBufferedReadable = createBufferedReadable;
  exports.createChecksumStream = createChecksumStream;
  exports.dateToUtcString = dateToUtcString;
  exports.deserializerMiddleware = deserializerMiddleware;
  exports.deserializerMiddlewareOption = deserializerMiddlewareOption;
  exports.expectBoolean = expectBoolean;
  exports.expectByte = expectByte;
  exports.expectFloat32 = expectFloat32;
  exports.expectInt = expectInt;
  exports.expectInt32 = expectInt32;
  exports.expectLong = expectLong;
  exports.expectNonNull = expectNonNull;
  exports.expectNumber = expectNumber;
  exports.expectObject = expectObject;
  exports.expectShort = expectShort;
  exports.expectString = expectString;
  exports.expectUnion = expectUnion;
  exports.fromArrayBuffer = fromArrayBuffer;
  exports.fromBase64 = fromBase64$1;
  exports.fromHex = fromHex;
  exports.fromString = fromString;
  exports.fromUtf8 = fromUtf8$1;
  exports.generateIdempotencyToken = generateIdempotencyToken;
  exports.getAwsChunkedEncodingStream = getAwsChunkedEncodingStream;
  exports.getSerdePlugin = getSerdePlugin;
  exports.handleFloat = handleFloat;
  exports.headStream = headStream;
  exports.isArrayBuffer = isArrayBuffer;
  exports.isBlob = isBlob;
  exports.isReadableStream = isReadableStream;
  exports.limitedParseDouble = limitedParseDouble;
  exports.limitedParseFloat = limitedParseFloat;
  exports.limitedParseFloat32 = limitedParseFloat32;
  exports.logger = logger;
  exports.nv = nv;
  exports.parseBoolean = parseBoolean;
  exports.parseEpochTimestamp = parseEpochTimestamp;
  exports.parseRfc3339DateTime = parseRfc3339DateTime;
  exports.parseRfc3339DateTimeWithOffset = parseRfc3339DateTimeWithOffset;
  exports.parseRfc7231DateTime = parseRfc7231DateTime;
  exports.quoteHeader = quoteHeader;
  exports.sdkStreamMixin = sdkStreamMixin;
  exports.serializerMiddleware = serializerMiddleware;
  exports.serializerMiddlewareOption = serializerMiddlewareOption;
  exports.splitEvery = splitEvery;
  exports.splitHeader = splitHeader;
  exports.splitStream = splitStream;
  exports.strictParseByte = strictParseByte;
  exports.strictParseDouble = strictParseDouble;
  exports.strictParseFloat = strictParseFloat;
  exports.strictParseFloat32 = strictParseFloat32;
  exports.strictParseInt = strictParseInt;
  exports.strictParseInt32 = strictParseInt32;
  exports.strictParseLong = strictParseLong;
  exports.strictParseShort = strictParseShort;
  exports.toBase64 = toBase64$1;
  exports.toHex = toHex;
  exports.toUint8Array = toUint8Array;
  exports.toUtf8 = toUtf8$1;
  exports.v4 = v4;
});

// node_modules/.bun/tslib@2.8.1/node_modules/tslib/tslib.js
var require_tslib = __commonJS((exports, module) => {
  var __extends;
  var __assign;
  var __rest;
  var __decorate;
  var __param;
  var __esDecorate;
  var __runInitializers;
  var __propKey;
  var __setFunctionName;
  var __metadata;
  var __awaiter;
  var __generator;
  var __exportStar;
  var __values;
  var __read;
  var __spread;
  var __spreadArrays;
  var __spreadArray;
  var __await;
  var __asyncGenerator;
  var __asyncDelegator;
  var __asyncValues;
  var __makeTemplateObject;
  var __importStar;
  var __importDefault;
  var __classPrivateFieldGet;
  var __classPrivateFieldSet;
  var __classPrivateFieldIn;
  var __createBinding;
  var __addDisposableResource;
  var __disposeResources;
  var __rewriteRelativeImportExtension;
  (function(factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
      define("tslib", ["exports"], function(exports2) {
        factory(createExporter(root, createExporter(exports2)));
      });
    } else if (typeof module === "object" && typeof exports === "object") {
      factory(createExporter(root, createExporter(exports)));
    } else {
      factory(createExporter(root));
    }
    function createExporter(exports2, previous) {
      if (exports2 !== root) {
        if (typeof Object.create === "function") {
          Object.defineProperty(exports2, "__esModule", { value: true });
        } else {
          exports2.__esModule = true;
        }
      }
      return function(id, v) {
        return exports2[id] = previous ? previous(id, v) : v;
      };
    }
  })(function(exporter) {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
      d.__proto__ = b;
    } || function(d, b) {
      for (var p in b)
        if (Object.prototype.hasOwnProperty.call(b, p))
          d[p] = b[p];
    };
    __extends = function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
    };
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    __rest = function(s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s);i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    };
    __decorate = function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
      else
        for (var i = decorators.length - 1;i >= 0; i--)
          if (d = decorators[i])
            r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    __param = function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
      function accept(f) {
        if (f !== undefined && typeof f !== "function")
          throw new TypeError("Function expected");
        return f;
      }
      var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
      var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
      var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
      var _, done = false;
      for (var i = decorators.length - 1;i >= 0; i--) {
        var context = {};
        for (var p in contextIn)
          context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access)
          context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
          if (done)
            throw new TypeError("Cannot add initializers after decoration has completed");
          extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
          if (result === undefined)
            continue;
          if (result === null || typeof result !== "object")
            throw new TypeError("Object expected");
          if (_ = accept(result.get))
            descriptor.get = _;
          if (_ = accept(result.set))
            descriptor.set = _;
          if (_ = accept(result.init))
            initializers.unshift(_);
        } else if (_ = accept(result)) {
          if (kind === "field")
            initializers.unshift(_);
          else
            descriptor[key] = _;
        }
      }
      if (target)
        Object.defineProperty(target, contextIn.name, descriptor);
      done = true;
    };
    __runInitializers = function(thisArg, initializers, value) {
      var useValue = arguments.length > 2;
      for (var i = 0;i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
      }
      return useValue ? value : undefined;
    };
    __propKey = function(x) {
      return typeof x === "symbol" ? x : "".concat(x);
    };
    __setFunctionName = function(f, name, prefix) {
      if (typeof name === "symbol")
        name = name.description ? "[".concat(name.description, "]") : "";
      return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };
    __metadata = function(metadataKey, metadataValue) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(metadataKey, metadataValue);
    };
    __awaiter = function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    __generator = function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
      return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return { value: op[0] ? op[1] : undefined, done: true };
      }
    };
    __exportStar = function(m, o) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
          __createBinding(o, m, p);
    };
    __createBinding = Object.create ? function(o, m, k, k2) {
      if (k2 === undefined)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === undefined)
        k2 = k;
      o[k2] = m[k];
    };
    __values = function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = undefined;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    __read = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === undefined || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __spread = function() {
      for (var ar = [], i = 0;i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    __spreadArrays = function() {
      for (var s = 0, i = 0, il = arguments.length;i < il; i++)
        s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0;i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length;j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    __spreadArray = function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar;i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    __await = function(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };
    __asyncGenerator = function(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function awaitReturn(f) {
        return function(v) {
          return Promise.resolve(v).then(f, reject);
        };
      }
      function verb(n, f) {
        if (g[n]) {
          i[n] = function(v) {
            return new Promise(function(a, b) {
              q.push([n, v, a, b]) > 1 || resume(n, v);
            });
          };
          if (f)
            i[n] = f(i[n]);
        }
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length)
          resume(q[0][0], q[0][1]);
      }
    };
    __asyncDelegator = function(o) {
      var i, p;
      return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
      }), verb("return"), i[Symbol.iterator] = function() {
        return this;
      }, i;
      function verb(n, f) {
        i[n] = o[n] ? function(v) {
          return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
        } : f;
      }
    };
    __asyncValues = function(o) {
      if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    __makeTemplateObject = function(cooked, raw) {
      if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", { value: raw });
      } else {
        cooked.raw = raw;
      }
      return cooked;
    };
    var __setModuleDefault = Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    };
    var ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2)
          if (Object.prototype.hasOwnProperty.call(o2, k))
            ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    __importStar = function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0;i < k.length; i++)
          if (k[i] !== "default")
            __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    __importDefault = function(mod) {
      return mod && mod.__esModule ? mod : { default: mod };
    };
    __classPrivateFieldGet = function(receiver, state, kind, f) {
      if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };
    __classPrivateFieldSet = function(receiver, state, value, kind, f) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
    };
    __classPrivateFieldIn = function(state, receiver) {
      if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
        throw new TypeError("Cannot use 'in' operator on non-object");
      return typeof state === "function" ? receiver === state : state.has(receiver);
    };
    __addDisposableResource = function(env, value, async) {
      if (value !== null && value !== undefined) {
        if (typeof value !== "object" && typeof value !== "function")
          throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
          if (!Symbol.asyncDispose)
            throw new TypeError("Symbol.asyncDispose is not defined.");
          dispose = value[Symbol.asyncDispose];
        }
        if (dispose === undefined) {
          if (!Symbol.dispose)
            throw new TypeError("Symbol.dispose is not defined.");
          dispose = value[Symbol.dispose];
          if (async)
            inner = dispose;
        }
        if (typeof dispose !== "function")
          throw new TypeError("Object not disposable.");
        if (inner)
          dispose = function() {
            try {
              inner.call(this);
            } catch (e) {
              return Promise.reject(e);
            }
          };
        env.stack.push({ value, dispose, async });
      } else if (async) {
        env.stack.push({ async: true });
      }
      return value;
    };
    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    __disposeResources = function(env) {
      function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      var r, s = 0;
      function next() {
        while (r = env.stack.pop()) {
          try {
            if (!r.async && s === 1)
              return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
              var result = r.dispose.call(r.value);
              if (r.async)
                return s |= 2, Promise.resolve(result).then(next, function(e) {
                  fail(e);
                  return next();
                });
            } else
              s |= 1;
          } catch (e) {
            fail(e);
          }
        }
        if (s === 1)
          return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError)
          throw env.error;
      }
      return next();
    };
    __rewriteRelativeImportExtension = function(path, preserveJsx) {
      if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
        });
      }
      return path;
    };
    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__esDecorate", __esDecorate);
    exporter("__runInitializers", __runInitializers);
    exporter("__propKey", __propKey);
    exporter("__setFunctionName", __setFunctionName);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
    exporter("__addDisposableResource", __addDisposableResource);
    exporter("__disposeResources", __disposeResources);
    exporter("__rewriteRelativeImportExtension", __rewriteRelativeImportExtension);
  });
});

// node_modules/.bun/@smithy+is-array-buffer@2.2.0/node_modules/@smithy/is-array-buffer/dist-cjs/index.js
var require_dist_cjs2 = __commonJS((exports, module) => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var src_exports = {};
  __export(src_exports, {
    isArrayBuffer: () => isArrayBuffer
  });
  module.exports = __toCommonJS(src_exports);
  var isArrayBuffer = /* @__PURE__ */ __name((arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]", "isArrayBuffer");
});

// node_modules/.bun/@smithy+util-buffer-from@2.2.0/node_modules/@smithy/util-buffer-from/dist-cjs/index.js
var require_dist_cjs3 = __commonJS((exports, module) => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var src_exports = {};
  __export(src_exports, {
    fromArrayBuffer: () => fromArrayBuffer,
    fromString: () => fromString
  });
  module.exports = __toCommonJS(src_exports);
  var import_is_array_buffer = require_dist_cjs2();
  var import_buffer = __require("buffer");
  var fromArrayBuffer = /* @__PURE__ */ __name((input, offset = 0, length = input.byteLength - offset) => {
    if (!(0, import_is_array_buffer.isArrayBuffer)(input)) {
      throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
    }
    return import_buffer.Buffer.from(input, offset, length);
  }, "fromArrayBuffer");
  var fromString = /* @__PURE__ */ __name((input, encoding) => {
    if (typeof input !== "string") {
      throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
    }
    return encoding ? import_buffer.Buffer.from(input, encoding) : import_buffer.Buffer.from(input);
  }, "fromString");
});

// node_modules/.bun/@smithy+util-utf8@2.3.0/node_modules/@smithy/util-utf8/dist-cjs/index.js
var require_dist_cjs4 = __commonJS((exports, module) => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var src_exports = {};
  __export(src_exports, {
    fromUtf8: () => fromUtf8,
    toUint8Array: () => toUint8Array,
    toUtf8: () => toUtf8
  });
  module.exports = __toCommonJS(src_exports);
  var import_util_buffer_from = require_dist_cjs3();
  var fromUtf8 = /* @__PURE__ */ __name((input) => {
    const buf = (0, import_util_buffer_from.fromString)(input, "utf8");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }, "fromUtf8");
  var toUint8Array = /* @__PURE__ */ __name((data) => {
    if (typeof data === "string") {
      return fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  }, "toUint8Array");
  var toUtf8 = /* @__PURE__ */ __name((input) => {
    if (typeof input === "string") {
      return input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
      throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
    }
    return (0, import_util_buffer_from.fromArrayBuffer)(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
  }, "toUtf8");
});

// node_modules/.bun/@aws-crypto+util@5.2.0/node_modules/@aws-crypto/util/build/main/convertToBuffer.js
var require_convertToBuffer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.convertToBuffer = undefined;
  var util_utf8_1 = require_dist_cjs4();
  var fromUtf8 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
    return Buffer.from(input, "utf8");
  } : util_utf8_1.fromUtf8;
  function convertToBuffer(data) {
    if (data instanceof Uint8Array)
      return data;
    if (typeof data === "string") {
      return fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  }
  exports.convertToBuffer = convertToBuffer;
});

// node_modules/.bun/@aws-crypto+util@5.2.0/node_modules/@aws-crypto/util/build/main/isEmptyData.js
var require_isEmptyData = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.isEmptyData = undefined;
  function isEmptyData(data) {
    if (typeof data === "string") {
      return data.length === 0;
    }
    return data.byteLength === 0;
  }
  exports.isEmptyData = isEmptyData;
});

// node_modules/.bun/@aws-crypto+util@5.2.0/node_modules/@aws-crypto/util/build/main/numToUint8.js
var require_numToUint8 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.numToUint8 = undefined;
  function numToUint8(num) {
    return new Uint8Array([
      (num & 4278190080) >> 24,
      (num & 16711680) >> 16,
      (num & 65280) >> 8,
      num & 255
    ]);
  }
  exports.numToUint8 = numToUint8;
});

// node_modules/.bun/@aws-crypto+util@5.2.0/node_modules/@aws-crypto/util/build/main/uint32ArrayFrom.js
var require_uint32ArrayFrom = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.uint32ArrayFrom = undefined;
  function uint32ArrayFrom(a_lookUpTable) {
    if (!Uint32Array.from) {
      var return_array = new Uint32Array(a_lookUpTable.length);
      var a_index = 0;
      while (a_index < a_lookUpTable.length) {
        return_array[a_index] = a_lookUpTable[a_index];
        a_index += 1;
      }
      return return_array;
    }
    return Uint32Array.from(a_lookUpTable);
  }
  exports.uint32ArrayFrom = uint32ArrayFrom;
});

// node_modules/.bun/@aws-crypto+util@5.2.0/node_modules/@aws-crypto/util/build/main/index.js
var require_main = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.uint32ArrayFrom = exports.numToUint8 = exports.isEmptyData = exports.convertToBuffer = undefined;
  var convertToBuffer_1 = require_convertToBuffer();
  Object.defineProperty(exports, "convertToBuffer", { enumerable: true, get: function() {
    return convertToBuffer_1.convertToBuffer;
  } });
  var isEmptyData_1 = require_isEmptyData();
  Object.defineProperty(exports, "isEmptyData", { enumerable: true, get: function() {
    return isEmptyData_1.isEmptyData;
  } });
  var numToUint8_1 = require_numToUint8();
  Object.defineProperty(exports, "numToUint8", { enumerable: true, get: function() {
    return numToUint8_1.numToUint8;
  } });
  var uint32ArrayFrom_1 = require_uint32ArrayFrom();
  Object.defineProperty(exports, "uint32ArrayFrom", { enumerable: true, get: function() {
    return uint32ArrayFrom_1.uint32ArrayFrom;
  } });
});

// node_modules/.bun/@aws-crypto+crc32@5.2.0/node_modules/@aws-crypto/crc32/build/main/aws_crc32.js
var require_aws_crc32 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AwsCrc32 = undefined;
  var tslib_1 = require_tslib();
  var util_1 = require_main();
  var index_1 = require_main2();
  var AwsCrc32 = function() {
    function AwsCrc322() {
      this.crc32 = new index_1.Crc32;
    }
    AwsCrc322.prototype.update = function(toHash) {
      if ((0, util_1.isEmptyData)(toHash))
        return;
      this.crc32.update((0, util_1.convertToBuffer)(toHash));
    };
    AwsCrc322.prototype.digest = function() {
      return tslib_1.__awaiter(this, undefined, undefined, function() {
        return tslib_1.__generator(this, function(_a) {
          return [2, (0, util_1.numToUint8)(this.crc32.digest())];
        });
      });
    };
    AwsCrc322.prototype.reset = function() {
      this.crc32 = new index_1.Crc32;
    };
    return AwsCrc322;
  }();
  exports.AwsCrc32 = AwsCrc32;
});

// node_modules/.bun/@aws-crypto+crc32@5.2.0/node_modules/@aws-crypto/crc32/build/main/index.js
var require_main2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AwsCrc32 = exports.Crc32 = exports.crc32 = undefined;
  var tslib_1 = require_tslib();
  var util_1 = require_main();
  function crc32(data) {
    return new Crc32().update(data).digest();
  }
  exports.crc32 = crc32;
  var Crc32 = function() {
    function Crc322() {
      this.checksum = 4294967295;
    }
    Crc322.prototype.update = function(data) {
      var e_1, _a;
      try {
        for (var data_1 = tslib_1.__values(data), data_1_1 = data_1.next();!data_1_1.done; data_1_1 = data_1.next()) {
          var byte = data_1_1.value;
          this.checksum = this.checksum >>> 8 ^ lookupTable[(this.checksum ^ byte) & 255];
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (data_1_1 && !data_1_1.done && (_a = data_1.return))
            _a.call(data_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      return this;
    };
    Crc322.prototype.digest = function() {
      return (this.checksum ^ 4294967295) >>> 0;
    };
    return Crc322;
  }();
  exports.Crc32 = Crc32;
  var a_lookUpTable = [
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918000,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
  ];
  var lookupTable = (0, util_1.uint32ArrayFrom)(a_lookUpTable);
  var aws_crc32_1 = require_aws_crc32();
  Object.defineProperty(exports, "AwsCrc32", { enumerable: true, get: function() {
    return aws_crc32_1.AwsCrc32;
  } });
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/event-streams/index.js
var require_event_streams = __commonJS((exports) => {
  var { Crc32 } = require_main2();
  var { toHex, fromHex, toUtf8, fromUtf8 } = require_serde();
  var { Readable } = __require("node:stream");

  class Int64 {
    bytes;
    constructor(bytes) {
      this.bytes = bytes;
      if (bytes.byteLength !== 8) {
        throw new Error("Int64 buffers must be exactly 8 bytes");
      }
    }
    static fromNumber(number) {
      if (number > 9223372036854776000 || number < -9223372036854776000) {
        throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
      }
      const bytes = new Uint8Array(8);
      for (let i = 7, remaining = Math.abs(Math.round(number));i > -1 && remaining > 0; i--, remaining /= 256) {
        bytes[i] = remaining;
      }
      if (number < 0) {
        negate(bytes);
      }
      return new Int64(bytes);
    }
    valueOf() {
      const bytes = this.bytes.slice(0);
      const negative = bytes[0] & 128;
      if (negative) {
        negate(bytes);
      }
      return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
    }
    toString() {
      return String(this.valueOf());
    }
  }
  function negate(bytes) {
    for (let i = 0;i < 8; i++) {
      bytes[i] ^= 255;
    }
    for (let i = 7;i > -1; i--) {
      bytes[i]++;
      if (bytes[i] !== 0)
        break;
    }
  }

  class HeaderMarshaller {
    toUtf8;
    fromUtf8;
    constructor(toUtf82, fromUtf82) {
      this.toUtf8 = toUtf82;
      this.fromUtf8 = fromUtf82;
    }
    format(headers) {
      const chunks = [];
      for (const headerName of Object.keys(headers)) {
        const bytes = this.fromUtf8(headerName);
        chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
      }
      const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
      let position = 0;
      for (const chunk of chunks) {
        out.set(chunk, position);
        position += chunk.byteLength;
      }
      return out;
    }
    formatHeaderValue(header) {
      switch (header.type) {
        case "boolean":
          return Uint8Array.from([header.value ? 0 : 1]);
        case "byte":
          return Uint8Array.from([2, header.value]);
        case "short":
          const shortView = new DataView(new ArrayBuffer(3));
          shortView.setUint8(0, 3);
          shortView.setInt16(1, header.value, false);
          return new Uint8Array(shortView.buffer);
        case "integer":
          const intView = new DataView(new ArrayBuffer(5));
          intView.setUint8(0, 4);
          intView.setInt32(1, header.value, false);
          return new Uint8Array(intView.buffer);
        case "long":
          const longBytes = new Uint8Array(9);
          longBytes[0] = 5;
          longBytes.set(header.value.bytes, 1);
          return longBytes;
        case "binary":
          const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
          binView.setUint8(0, 6);
          binView.setUint16(1, header.value.byteLength, false);
          const binBytes = new Uint8Array(binView.buffer);
          binBytes.set(header.value, 3);
          return binBytes;
        case "string":
          const utf8Bytes = this.fromUtf8(header.value);
          const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
          strView.setUint8(0, 7);
          strView.setUint16(1, utf8Bytes.byteLength, false);
          const strBytes = new Uint8Array(strView.buffer);
          strBytes.set(utf8Bytes, 3);
          return strBytes;
        case "timestamp":
          const tsBytes = new Uint8Array(9);
          tsBytes[0] = 8;
          tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
          return tsBytes;
        case "uuid":
          if (!UUID_PATTERN.test(header.value)) {
            throw new Error(`Invalid UUID received: ${header.value}`);
          }
          const uuidBytes = new Uint8Array(17);
          uuidBytes[0] = 9;
          uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
          return uuidBytes;
      }
    }
    parse(headers) {
      const out = {};
      let position = 0;
      while (position < headers.byteLength) {
        const nameLength = headers.getUint8(position++);
        const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
        position += nameLength;
        switch (headers.getUint8(position++)) {
          case 0:
            out[name] = {
              type: BOOLEAN_TAG,
              value: true
            };
            break;
          case 1:
            out[name] = {
              type: BOOLEAN_TAG,
              value: false
            };
            break;
          case 2:
            out[name] = {
              type: BYTE_TAG,
              value: headers.getInt8(position++)
            };
            break;
          case 3:
            out[name] = {
              type: SHORT_TAG,
              value: headers.getInt16(position, false)
            };
            position += 2;
            break;
          case 4:
            out[name] = {
              type: INT_TAG,
              value: headers.getInt32(position, false)
            };
            position += 4;
            break;
          case 5:
            out[name] = {
              type: LONG_TAG,
              value: new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
            };
            position += 8;
            break;
          case 6:
            const binaryLength = headers.getUint16(position, false);
            position += 2;
            out[name] = {
              type: BINARY_TAG,
              value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
            };
            position += binaryLength;
            break;
          case 7:
            const stringLength = headers.getUint16(position, false);
            position += 2;
            out[name] = {
              type: STRING_TAG,
              value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
            };
            position += stringLength;
            break;
          case 8:
            out[name] = {
              type: TIMESTAMP_TAG,
              value: new Date(new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
            };
            position += 8;
            break;
          case 9:
            const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
            position += 16;
            out[name] = {
              type: UUID_TAG,
              value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
            };
            break;
          default:
            throw new Error(`Unrecognized header type tag`);
        }
      }
      return out;
    }
  }
  var HEADER_VALUE_TYPE;
  (function(HEADER_VALUE_TYPE2) {
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["boolTrue"] = 0] = "boolTrue";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["boolFalse"] = 1] = "boolFalse";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["byte"] = 2] = "byte";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["short"] = 3] = "short";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["integer"] = 4] = "integer";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["long"] = 5] = "long";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["byteArray"] = 6] = "byteArray";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["string"] = 7] = "string";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["timestamp"] = 8] = "timestamp";
    HEADER_VALUE_TYPE2[HEADER_VALUE_TYPE2["uuid"] = 9] = "uuid";
  })(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
  var BOOLEAN_TAG = "boolean";
  var BYTE_TAG = "byte";
  var SHORT_TAG = "short";
  var INT_TAG = "integer";
  var LONG_TAG = "long";
  var BINARY_TAG = "binary";
  var STRING_TAG = "string";
  var TIMESTAMP_TAG = "timestamp";
  var UUID_TAG = "uuid";
  var UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  var PRELUDE_MEMBER_LENGTH = 4;
  var PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
  var CHECKSUM_LENGTH = 4;
  var MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
  function splitMessage({ byteLength, byteOffset, buffer }) {
    if (byteLength < MINIMUM_MESSAGE_LENGTH) {
      throw new Error("Provided message too short to accommodate event stream message overhead");
    }
    const view = new DataView(buffer, byteOffset, byteLength);
    const messageLength = view.getUint32(0, false);
    if (byteLength !== messageLength) {
      throw new Error("Reported message length does not match received message length");
    }
    const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
    const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
    const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
    const checksummer = new Crc32().update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
    if (expectedPreludeChecksum !== checksummer.digest()) {
      throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digest()})`);
    }
    checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH)));
    if (expectedMessageChecksum !== checksummer.digest()) {
      throw new Error(`The message checksum (${checksummer.digest()}) did not match the expected value of ${expectedMessageChecksum}`);
    }
    return {
      headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
      body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH + CHECKSUM_LENGTH))
    };
  }

  class EventStreamCodec {
    headerMarshaller;
    messageBuffer;
    isEndOfStream;
    constructor(toUtf82, fromUtf82) {
      this.headerMarshaller = new HeaderMarshaller(toUtf82, fromUtf82);
      this.messageBuffer = [];
      this.isEndOfStream = false;
    }
    feed(message) {
      this.messageBuffer.push(this.decode(message));
    }
    endOfStream() {
      this.isEndOfStream = true;
    }
    getMessage() {
      const message = this.messageBuffer.pop();
      const isEndOfStream = this.isEndOfStream;
      return {
        getMessage() {
          return message;
        },
        isEndOfStream() {
          return isEndOfStream;
        }
      };
    }
    getAvailableMessages() {
      const messages = this.messageBuffer;
      this.messageBuffer = [];
      const isEndOfStream = this.isEndOfStream;
      return {
        getMessages() {
          return messages;
        },
        isEndOfStream() {
          return isEndOfStream;
        }
      };
    }
    encode({ headers: rawHeaders, body }) {
      const headers = this.headerMarshaller.format(rawHeaders);
      const length = headers.byteLength + body.byteLength + 16;
      const out = new Uint8Array(length);
      const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
      const checksum = new Crc32;
      view.setUint32(0, length, false);
      view.setUint32(4, headers.byteLength, false);
      view.setUint32(8, checksum.update(out.subarray(0, 8)).digest(), false);
      out.set(headers, 12);
      out.set(body, headers.byteLength + 12);
      view.setUint32(length - 4, checksum.update(out.subarray(8, length - 4)).digest(), false);
      return out;
    }
    decode(message) {
      const { headers, body } = splitMessage(message);
      return { headers: this.headerMarshaller.parse(headers), body };
    }
    formatHeaders(rawHeaders) {
      return this.headerMarshaller.format(rawHeaders);
    }
  }

  class MessageDecoderStream {
    options;
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async* asyncIterator() {
      for await (const bytes of this.options.inputStream) {
        const decoded = this.options.decoder.decode(bytes);
        yield decoded;
      }
    }
  }

  class MessageEncoderStream {
    options;
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async* asyncIterator() {
      for await (const msg of this.options.messageStream) {
        const encoded = this.options.encoder.encode(msg);
        yield encoded;
      }
      if (this.options.includeEndFrame) {
        yield new Uint8Array(0);
      }
    }
  }

  class SmithyMessageDecoderStream {
    options;
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async* asyncIterator() {
      for await (const message of this.options.messageStream) {
        const deserialized = await this.options.deserializer(message);
        if (deserialized === undefined)
          continue;
        yield deserialized;
      }
    }
  }

  class SmithyMessageEncoderStream {
    options;
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async* asyncIterator() {
      for await (const chunk of this.options.inputStream) {
        const payloadBuf = this.options.serializer(chunk);
        yield payloadBuf;
      }
    }
  }
  function getChunkedStream(source) {
    let currentMessageTotalLength = 0;
    let currentMessagePendingLength = 0;
    let currentMessage = null;
    let messageLengthBuffer = null;
    const allocateMessage = (size) => {
      if (typeof size !== "number") {
        throw new Error("Attempted to allocate an event message where size was not a number: " + size);
      }
      currentMessageTotalLength = size;
      currentMessagePendingLength = 4;
      currentMessage = new Uint8Array(size);
      const currentMessageView = new DataView(currentMessage.buffer);
      currentMessageView.setUint32(0, size, false);
    };
    const iterator = async function* () {
      const sourceIterator = source[Symbol.asyncIterator]();
      while (true) {
        const { value, done } = await sourceIterator.next();
        if (done) {
          if (!currentMessageTotalLength) {
            return;
          } else if (currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
          } else {
            throw new Error("Truncated event message received.");
          }
          return;
        }
        const chunkLength = value.length;
        let currentOffset = 0;
        while (currentOffset < chunkLength) {
          if (!currentMessage) {
            const bytesRemaining = chunkLength - currentOffset;
            if (!messageLengthBuffer) {
              messageLengthBuffer = new Uint8Array(4);
            }
            const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
            messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
            currentMessagePendingLength += numBytesForTotal;
            currentOffset += numBytesForTotal;
            if (currentMessagePendingLength < 4) {
              break;
            }
            allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
            messageLengthBuffer = null;
          }
          const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
          currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
          currentMessagePendingLength += numBytesToWrite;
          currentOffset += numBytesToWrite;
          if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
            currentMessage = null;
            currentMessageTotalLength = 0;
            currentMessagePendingLength = 0;
          }
        }
      }
    };
    return {
      [Symbol.asyncIterator]: iterator
    };
  }
  function getUnmarshalledStream(source, options) {
    const messageUnmarshaller = getMessageUnmarshaller(options.deserializer, options.toUtf8);
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const chunk of source) {
          const message = options.eventStreamCodec.decode(chunk);
          const type = await messageUnmarshaller(message);
          if (type === undefined)
            continue;
          yield type;
        }
      }
    };
  }
  function getMessageUnmarshaller(deserializer, toUtf82) {
    return async function(message) {
      const { value: messageType } = message.headers[":message-type"];
      if (messageType === "error") {
        const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
        unmodeledError.name = message.headers[":error-code"].value;
        throw unmodeledError;
      } else if (messageType === "exception") {
        const code = message.headers[":exception-type"].value;
        const exception = { [code]: message };
        const deserializedException = await deserializer(exception);
        if (deserializedException.$unknown) {
          const error = new Error(toUtf82(message.body));
          error.name = code;
          throw error;
        }
        throw deserializedException[code];
      } else if (messageType === "event") {
        const event = {
          [message.headers[":event-type"].value]: message
        };
        const deserialized = await deserializer(event);
        if (deserialized.$unknown)
          return;
        return deserialized;
      } else {
        throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
      }
    };
  }
  var EventStreamMarshaller$1 = class EventStreamMarshaller2 {
    eventStreamCodec;
    utfEncoder;
    constructor({ utf8Encoder, utf8Decoder }) {
      this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
      this.utfEncoder = utf8Encoder;
    }
    deserialize(body, deserializer) {
      const inputStream = getChunkedStream(body);
      return new SmithyMessageDecoderStream({
        messageStream: new MessageDecoderStream({ inputStream, decoder: this.eventStreamCodec }),
        deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
      });
    }
    serialize(inputStream, serializer) {
      return new MessageEncoderStream({
        messageStream: new SmithyMessageEncoderStream({ inputStream, serializer }),
        encoder: this.eventStreamCodec,
        includeEndFrame: true
      });
    }
  };
  var eventStreamSerdeProvider$1 = (options) => new EventStreamMarshaller$1(options);

  class EventStreamMarshaller {
    universalMarshaller;
    constructor({ utf8Encoder, utf8Decoder }) {
      this.universalMarshaller = new EventStreamMarshaller$1({
        utf8Decoder,
        utf8Encoder
      });
    }
    deserialize(body, deserializer) {
      const bodyIterable = typeof body[Symbol.asyncIterator] === "function" ? body : readableToIterable(body);
      return this.universalMarshaller.deserialize(bodyIterable, deserializer);
    }
    serialize(input, serializer) {
      return Readable.from(this.universalMarshaller.serialize(input, serializer));
    }
  }
  var eventStreamSerdeProvider = (options) => new EventStreamMarshaller(options);
  async function* readableToIterable(readStream) {
    let streamEnded = false;
    let generationEnded = false;
    const records = new Array;
    readStream.on("error", (err) => {
      if (!streamEnded) {
        streamEnded = true;
      }
      if (err) {
        throw err;
      }
    });
    readStream.on("data", (data) => {
      records.push(data);
    });
    readStream.on("end", () => {
      streamEnded = true;
    });
    while (!generationEnded) {
      const value = await new Promise((resolve) => setTimeout(() => resolve(records.shift()), 0));
      if (value) {
        yield value;
      }
      generationEnded = streamEnded && records.length === 0;
    }
  }
  var readableStreamToIterable = (readableStream) => ({
    [Symbol.asyncIterator]: async function* () {
      const reader = readableStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
  });
  var iterableToReadableStream = (asyncIterable) => {
    const iterator = asyncIterable[Symbol.asyncIterator]();
    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await iterator.next();
        if (done) {
          return controller.close();
        }
        controller.enqueue(value);
      }
    });
  };
  var resolveEventStreamSerdeConfig = (input) => Object.assign(input, {
    eventStreamMarshaller: input.eventStreamSerdeProvider(input)
  });

  class EventStreamSerde {
    marshaller;
    serializer;
    deserializer;
    serdeContext;
    defaultContentType;
    constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType }) {
      this.marshaller = marshaller;
      this.serializer = serializer;
      this.deserializer = deserializer;
      this.serdeContext = serdeContext;
      this.defaultContentType = defaultContentType;
    }
    async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
      const marshaller = this.marshaller;
      const eventStreamMember = requestSchema.getEventStreamMember();
      const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
      const serializer = this.serializer;
      const defaultContentType = this.defaultContentType;
      const initialRequestMarker = Symbol("initialRequestMarker");
      const eventStreamIterable = {
        async* [Symbol.asyncIterator]() {
          if (initialRequest) {
            const headers = {
              ":event-type": { type: "string", value: "initial-request" },
              ":message-type": { type: "string", value: "event" },
              ":content-type": { type: "string", value: defaultContentType }
            };
            serializer.write(requestSchema, initialRequest);
            const body = serializer.flush();
            yield {
              [initialRequestMarker]: true,
              headers,
              body
            };
          }
          for await (const page of eventStream) {
            yield page;
          }
        }
      };
      return marshaller.serialize(eventStreamIterable, (event) => {
        if (event[initialRequestMarker]) {
          return {
            headers: event.headers,
            body: event.body
          };
        }
        let unionMember = "";
        for (const key in event) {
          if (key !== "__type") {
            unionMember = key;
            break;
          }
        }
        const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
        const headers = {
          ":event-type": { type: "string", value: eventType },
          ":message-type": { type: "string", value: "event" },
          ":content-type": { type: "string", value: explicitPayloadContentType ?? defaultContentType },
          ...additionalHeaders
        };
        return {
          headers,
          body
        };
      });
    }
    async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
      const marshaller = this.marshaller;
      const eventStreamMember = responseSchema.getEventStreamMember();
      const unionSchema = responseSchema.getMemberSchema(eventStreamMember);
      const memberSchemas = unionSchema.getMemberSchemas();
      const initialResponseMarker = Symbol("initialResponseMarker");
      const asyncIterable = marshaller.deserialize(response.body, async (event) => {
        let unionMember = "";
        for (const key in event) {
          if (key !== "__type") {
            unionMember = key;
            break;
          }
        }
        const body = event[unionMember].body;
        if (unionMember === "initial-response") {
          const dataObject = await this.deserializer.read(responseSchema, body);
          delete dataObject[eventStreamMember];
          return {
            [initialResponseMarker]: true,
            ...dataObject
          };
        } else if (unionMember in memberSchemas) {
          const eventStreamSchema = memberSchemas[unionMember];
          if (eventStreamSchema.isStructSchema()) {
            const out = {};
            let hasBindings = false;
            for (const [name, member] of eventStreamSchema.structIterator()) {
              const { eventHeader, eventPayload } = member.getMergedTraits();
              hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
              if (eventPayload) {
                if (member.isBlobSchema()) {
                  out[name] = body;
                } else if (member.isStringSchema()) {
                  out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8)(body);
                } else if (member.isStructSchema()) {
                  out[name] = await this.deserializer.read(member, body);
                }
              } else if (eventHeader) {
                const value = event[unionMember].headers[name]?.value;
                if (value != null) {
                  if (member.isNumericSchema()) {
                    if (value && typeof value === "object" && "bytes" in value) {
                      out[name] = BigInt(value.toString());
                    } else {
                      out[name] = Number(value);
                    }
                  } else {
                    out[name] = value;
                  }
                }
              }
            }
            if (hasBindings) {
              return {
                [unionMember]: out
              };
            }
            if (body.byteLength === 0) {
              return {
                [unionMember]: {}
              };
            }
          }
          return {
            [unionMember]: await this.deserializer.read(eventStreamSchema, body)
          };
        } else {
          return {
            $unknown: event
          };
        }
      });
      const asyncIterator = asyncIterable[Symbol.asyncIterator]();
      const firstEvent = await asyncIterator.next();
      if (firstEvent.done) {
        return asyncIterable;
      }
      if (firstEvent.value?.[initialResponseMarker]) {
        if (!responseSchema) {
          throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
        }
        for (const key in firstEvent.value) {
          initialResponseContainer[key] = firstEvent.value[key];
        }
      }
      return {
        async* [Symbol.asyncIterator]() {
          if (!firstEvent?.value?.[initialResponseMarker]) {
            yield firstEvent.value;
          }
          while (true) {
            const { done, value } = await asyncIterator.next();
            if (done) {
              break;
            }
            yield value;
          }
        }
      };
    }
    writeEventBody(unionMember, unionSchema, event) {
      const serializer = this.serializer;
      let eventType = unionMember;
      let explicitPayloadMember = null;
      let explicitPayloadContentType;
      const isKnownSchema = (() => {
        const struct = unionSchema.getSchema();
        return struct[4].includes(unionMember);
      })();
      const additionalHeaders = {};
      if (!isKnownSchema) {
        const [type, value] = event[unionMember];
        eventType = type;
        serializer.write(15, value);
      } else {
        const eventSchema = unionSchema.getMemberSchema(unionMember);
        if (eventSchema.isStructSchema()) {
          for (const [memberName, memberSchema] of eventSchema.structIterator()) {
            const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
            if (eventPayload) {
              explicitPayloadMember = memberName;
            } else if (eventHeader) {
              const value = event[unionMember][memberName];
              let type = "binary";
              if (memberSchema.isNumericSchema()) {
                if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) {
                  type = "integer";
                } else {
                  type = "long";
                }
              } else if (memberSchema.isTimestampSchema()) {
                type = "timestamp";
              } else if (memberSchema.isStringSchema()) {
                type = "string";
              } else if (memberSchema.isBooleanSchema()) {
                type = "boolean";
              }
              if (value != null) {
                additionalHeaders[memberName] = {
                  type,
                  value
                };
                delete event[unionMember][memberName];
              }
            }
          }
          if (explicitPayloadMember !== null) {
            const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
            if (payloadSchema.isBlobSchema()) {
              explicitPayloadContentType = "application/octet-stream";
            } else if (payloadSchema.isStringSchema()) {
              explicitPayloadContentType = "text/plain";
            }
            serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
          } else {
            serializer.write(eventSchema, event[unionMember]);
          }
        } else if (eventSchema.isUnitSchema()) {
          serializer.write(eventSchema, {});
        } else {
          throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
        }
      }
      const messageSerialization = serializer.flush() ?? new Uint8Array;
      const body = typeof messageSerialization === "string" ? (this.serdeContext?.utf8Decoder ?? fromUtf8)(messageSerialization) : messageSerialization;
      return {
        body,
        eventType,
        explicitPayloadContentType,
        additionalHeaders
      };
    }
  }
  exports.EventStreamCodec = EventStreamCodec;
  exports.EventStreamMarshaller = EventStreamMarshaller;
  exports.EventStreamSerde = EventStreamSerde;
  exports.HeaderMarshaller = HeaderMarshaller;
  exports.Int64 = Int64;
  exports.MessageDecoderStream = MessageDecoderStream;
  exports.MessageEncoderStream = MessageEncoderStream;
  exports.SmithyMessageDecoderStream = SmithyMessageDecoderStream;
  exports.SmithyMessageEncoderStream = SmithyMessageEncoderStream;
  exports.UniversalEventStreamMarshaller = EventStreamMarshaller$1;
  exports.eventStreamSerdeProvider = eventStreamSerdeProvider;
  exports.getChunkedStream = getChunkedStream;
  exports.getMessageUnmarshaller = getMessageUnmarshaller;
  exports.getUnmarshalledStream = getUnmarshalledStream;
  exports.iterableToReadableStream = iterableToReadableStream;
  exports.readableStreamToIterable = readableStreamToIterable;
  exports.resolveEventStreamSerdeConfig = resolveEventStreamSerdeConfig;
  exports.universalEventStreamSerdeProvider = eventStreamSerdeProvider$1;
});

// node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/protocols/index.js
var require_protocols = __commonJS((exports) => {
  var { Uint8ArrayBlobAdapter, sdkStreamMixin, splitEvery, splitHeader, fromBase64, _parseEpochTimestamp, _parseRfc7231DateTime, _parseRfc3339DateTimeWithOffset, LazyJsonString, NumericValue, toUtf8, fromUtf8, generateIdempotencyToken, toBase64, dateToUtcString, quoteHeader } = require_serde();
  var { TypeRegistry, NormalizedSchema, translateTraits } = require_schema();
  var { HttpRequest, HttpResponse } = require_transport();
  var { isValidHostname, parseQueryString, parseUrl } = require_transport();
  exports.HttpRequest = HttpRequest;
  exports.HttpResponse = HttpResponse;
  exports.isValidHostname = isValidHostname;
  exports.parseQueryString = parseQueryString;
  exports.parseUrl = parseUrl;
  var { FieldPosition } = require_dist_cjs();
  var collectBody = async (streamBody = new Uint8Array, context) => {
    if (streamBody instanceof Uint8Array) {
      return Uint8ArrayBlobAdapter.mutate(streamBody);
    }
    if (!streamBody) {
      return Uint8ArrayBlobAdapter.mutate(new Uint8Array);
    }
    const fromContext = context.streamCollector(streamBody);
    return Uint8ArrayBlobAdapter.mutate(await fromContext);
  };
  function extendedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  class SerdeContext {
    serdeContext;
    setSerdeContext(serdeContext) {
      this.serdeContext = serdeContext;
    }
  }

  class HttpProtocol extends SerdeContext {
    options;
    compositeErrorRegistry;
    constructor(options) {
      super();
      this.options = options;
      this.compositeErrorRegistry = TypeRegistry.for(options.defaultNamespace);
      for (const etr of options.errorTypeRegistries ?? []) {
        this.compositeErrorRegistry.copyFrom(etr);
      }
    }
    getRequestType() {
      return HttpRequest;
    }
    getResponseType() {
      return HttpResponse;
    }
    setSerdeContext(serdeContext) {
      this.serdeContext = serdeContext;
      this.serializer.setSerdeContext(serdeContext);
      this.deserializer.setSerdeContext(serdeContext);
      if (this.getPayloadCodec()) {
        this.getPayloadCodec().setSerdeContext(serdeContext);
      }
    }
    updateServiceEndpoint(request, endpoint) {
      if ("url" in endpoint) {
        request.protocol = endpoint.url.protocol;
        request.hostname = endpoint.url.hostname;
        request.port = endpoint.url.port ? Number(endpoint.url.port) : undefined;
        request.path = endpoint.url.pathname;
        request.fragment = endpoint.url.hash || undefined;
        request.username = endpoint.url.username || undefined;
        request.password = endpoint.url.password || undefined;
        if (!request.query) {
          request.query = {};
        }
        for (const [k, v] of endpoint.url.searchParams.entries()) {
          request.query[k] = v;
        }
        if (endpoint.headers) {
          for (const name in endpoint.headers) {
            request.headers[name] = endpoint.headers[name].join(", ");
          }
        }
        return request;
      } else {
        request.protocol = endpoint.protocol;
        request.hostname = endpoint.hostname;
        request.port = endpoint.port ? Number(endpoint.port) : undefined;
        request.path = endpoint.path;
        request.query = {
          ...endpoint.query
        };
        if (endpoint.headers) {
          for (const name in endpoint.headers) {
            request.headers[name] = endpoint.headers[name];
          }
        }
        return request;
      }
    }
    setHostPrefix(request, operationSchema, input) {
      if (this.serdeContext?.disableHostPrefix) {
        return;
      }
      const inputNs = NormalizedSchema.of(operationSchema.input);
      const opTraits = translateTraits(operationSchema.traits ?? {});
      if (opTraits.endpoint) {
        let hostPrefix = opTraits.endpoint?.[0];
        if (typeof hostPrefix === "string") {
          for (const [name, member] of inputNs.structIterator()) {
            if (!member.getMergedTraits().hostLabel) {
              continue;
            }
            const replacement = input[name];
            if (typeof replacement !== "string") {
              throw new Error(`@smithy/core/schema - ${name} in input must be a string as hostLabel.`);
            }
            hostPrefix = hostPrefix.replace(`{${name}}`, replacement);
          }
          request.hostname = hostPrefix + request.hostname;
        }
      }
    }
    deserializeMetadata(output) {
      return {
        httpStatusCode: output.statusCode,
        requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
        extendedRequestId: output.headers["x-amz-id-2"],
        cfId: output.headers["x-amz-cf-id"]
      };
    }
    async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
      const eventStreamSerde = await this.loadEventStreamCapability();
      return eventStreamSerde.serializeEventStream({
        eventStream,
        requestSchema,
        initialRequest
      });
    }
    async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
      const eventStreamSerde = await this.loadEventStreamCapability();
      return eventStreamSerde.deserializeEventStream({
        response,
        responseSchema,
        initialResponseContainer
      });
    }
    async loadEventStreamCapability() {
      const { EventStreamSerde, eventStreamSerdeProvider } = require_event_streams();
      const marshaller = this.resolveEventStreamMarshaller(eventStreamSerdeProvider);
      return new EventStreamSerde({
        marshaller,
        serializer: this.serializer,
        deserializer: this.deserializer,
        serdeContext: this.serdeContext,
        defaultContentType: this.getDefaultContentType()
      });
    }
    resolveEventStreamMarshaller(importedProvider) {
      const context = this.serdeContext;
      if (context.eventStreamMarshaller) {
        return context.eventStreamMarshaller;
      }
      return importedProvider(this.serdeContext);
    }
    getDefaultContentType() {
      throw new Error(`@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`);
    }
    async deserializeHttpMessage(schema, context, response, arg4, arg5) {
      return [];
    }
    getEventStreamMarshaller() {
      const context = this.serdeContext;
      if (!context.eventStreamMarshaller) {
        throw new Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
      }
      return context.eventStreamMarshaller;
    }
  }

  class HttpBindingProtocol extends HttpProtocol {
    async serializeRequest(operationSchema, _input, context) {
      const input = _input && typeof _input === "object" ? _input : {};
      const serializer = this.serializer;
      const query = {};
      const headers = {};
      const endpoint = await context.endpoint();
      const ns = NormalizedSchema.of(operationSchema?.input);
      const payloadMemberNames = [];
      const payloadMemberSchemas = [];
      let hasNonHttpBindingMember = false;
      let payload;
      const request = new HttpRequest({
        protocol: "",
        hostname: "",
        port: undefined,
        path: "",
        fragment: undefined,
        query,
        headers,
        body: undefined
      });
      if (endpoint) {
        this.updateServiceEndpoint(request, endpoint);
        this.setHostPrefix(request, operationSchema, input);
        const opTraits = translateTraits(operationSchema.traits);
        if (opTraits.http) {
          request.method = opTraits.http[0];
          const [path, search] = opTraits.http[1].split("?");
          if (request.path == "/") {
            request.path = path;
          } else {
            request.path += path;
          }
          const traitSearchParams = new URLSearchParams(search ?? "");
          for (const [key, value] of traitSearchParams) {
            query[key] = value;
          }
        }
      }
      for (const [memberName, memberNs] of ns.structIterator()) {
        const memberTraits = memberNs.getMergedTraits() ?? {};
        const inputMemberValue = input[memberName];
        if (inputMemberValue == null && !memberNs.isIdempotencyToken()) {
          if (memberTraits.httpLabel) {
            if (request.path.includes(`{${memberName}+}`) || request.path.includes(`{${memberName}}`)) {
              throw new Error(`No value provided for input HTTP label: ${memberName}.`);
            }
          }
          continue;
        }
        if (memberTraits.httpPayload) {
          const isStreaming = memberNs.isStreaming();
          if (isStreaming) {
            const isEventStream = memberNs.isStructSchema();
            if (isEventStream) {
              if (input[memberName]) {
                payload = await this.serializeEventStream({
                  eventStream: input[memberName],
                  requestSchema: ns
                });
              }
            } else {
              payload = inputMemberValue;
            }
          } else {
            serializer.write(memberNs, inputMemberValue);
            payload = serializer.flush();
          }
        } else if (memberTraits.httpLabel) {
          serializer.write(memberNs, inputMemberValue);
          const replacement = serializer.flush();
          if (request.path.includes(`{${memberName}+}`)) {
            request.path = request.path.replace(`{${memberName}+}`, replacement.split("/").map(extendedEncodeURIComponent).join("/"));
          } else if (request.path.includes(`{${memberName}}`)) {
            request.path = request.path.replace(`{${memberName}}`, extendedEncodeURIComponent(replacement));
          }
        } else if (memberTraits.httpHeader) {
          serializer.write(memberNs, inputMemberValue);
          headers[memberTraits.httpHeader.toLowerCase()] = String(serializer.flush());
        } else if (typeof memberTraits.httpPrefixHeaders === "string") {
          for (const key in inputMemberValue) {
            const val = inputMemberValue[key];
            const amalgam = memberTraits.httpPrefixHeaders + key;
            serializer.write([memberNs.getValueSchema(), { httpHeader: amalgam }], val);
            headers[amalgam.toLowerCase()] = serializer.flush();
          }
        } else if (memberTraits.httpQuery || memberTraits.httpQueryParams) {
          this.serializeQuery(memberNs, inputMemberValue, query);
        } else {
          hasNonHttpBindingMember = true;
          payloadMemberNames.push(memberName);
          payloadMemberSchemas.push(memberNs);
        }
      }
      if (hasNonHttpBindingMember && input) {
        const [namespace, name] = (ns.getName(true) ?? "#Unknown").split("#");
        const requiredMembers = ns.getSchema()[6];
        const payloadSchema = [
          3,
          namespace,
          name,
          ns.getMergedTraits(),
          payloadMemberNames,
          payloadMemberSchemas,
          undefined
        ];
        if (requiredMembers) {
          payloadSchema[6] = requiredMembers;
        } else {
          payloadSchema.pop();
        }
        serializer.write(payloadSchema, input);
        payload = serializer.flush();
      }
      request.headers = headers;
      request.query = query;
      request.body = payload;
      return request;
    }
    serializeQuery(ns, data, query) {
      const serializer = this.serializer;
      const traits = ns.getMergedTraits();
      if (traits.httpQueryParams) {
        for (const key in data) {
          if (!(key in query)) {
            const val = data[key];
            const valueSchema = ns.getValueSchema();
            Object.assign(valueSchema.getMergedTraits(), {
              ...traits,
              httpQuery: key,
              httpQueryParams: undefined
            });
            this.serializeQuery(valueSchema, val, query);
          }
        }
        return;
      }
      if (ns.isListSchema()) {
        const sparse = !!ns.getMergedTraits().sparse;
        const buffer = [];
        for (const item of data) {
          serializer.write([ns.getValueSchema(), traits], item);
          const serializable = serializer.flush();
          if (sparse || serializable !== undefined) {
            buffer.push(serializable);
          }
        }
        query[traits.httpQuery] = buffer;
      } else {
        serializer.write([ns, traits], data);
        query[traits.httpQuery] = serializer.flush();
      }
    }
    async deserializeResponse(operationSchema, context, response) {
      const deserializer = this.deserializer;
      const ns = NormalizedSchema.of(operationSchema.output);
      const dataObject = {};
      if (response.statusCode >= 300) {
        const bytes = await collectBody(response.body, context);
        if (bytes.byteLength > 0) {
          Object.assign(dataObject, await deserializer.read(15, bytes));
        }
        await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
        throw new Error("@smithy/core/protocols - HTTP Protocol error handler failed to throw.");
      }
      for (const header in response.headers) {
        const value = response.headers[header];
        delete response.headers[header];
        response.headers[header.toLowerCase()] = value;
      }
      const nonHttpBindingMembers = await this.deserializeHttpMessage(ns, context, response, dataObject);
      if (nonHttpBindingMembers.length) {
        const bytes = await collectBody(response.body, context);
        if (bytes.byteLength > 0) {
          const dataFromBody = await deserializer.read(ns, bytes);
          for (const member of nonHttpBindingMembers) {
            if (dataFromBody[member] != null) {
              dataObject[member] = dataFromBody[member];
            }
          }
        }
      } else if (nonHttpBindingMembers.discardResponseBody) {
        await collectBody(response.body, context);
      }
      dataObject.$metadata = this.deserializeMetadata(response);
      return dataObject;
    }
    async deserializeHttpMessage(schema, context, response, arg4, arg5) {
      let dataObject;
      if (arg4 instanceof Set) {
        dataObject = arg5;
      } else {
        dataObject = arg4;
      }
      let discardResponseBody = true;
      const deserializer = this.deserializer;
      const ns = NormalizedSchema.of(schema);
      const nonHttpBindingMembers = [];
      for (const [memberName, memberSchema] of ns.structIterator()) {
        const memberTraits = memberSchema.getMemberTraits();
        if (memberTraits.httpPayload) {
          discardResponseBody = false;
          const isStreaming = memberSchema.isStreaming();
          if (isStreaming) {
            const isEventStream = memberSchema.isStructSchema();
            if (isEventStream) {
              dataObject[memberName] = await this.deserializeEventStream({
                response,
                responseSchema: ns
              });
            } else {
              dataObject[memberName] = sdkStreamMixin(response.body);
            }
          } else if (response.body) {
            const bytes = await collectBody(response.body, context);
            if (bytes.byteLength > 0) {
              dataObject[memberName] = await deserializer.read(memberSchema, bytes);
            }
          }
        } else if (memberTraits.httpHeader) {
          const key = String(memberTraits.httpHeader).toLowerCase();
          const value = response.headers[key];
          if (value != null) {
            if (memberSchema.isListSchema()) {
              const headerListValueSchema = memberSchema.getValueSchema();
              headerListValueSchema.getMergedTraits().httpHeader = key;
              let sections;
              if (headerListValueSchema.isTimestampSchema() && headerListValueSchema.getSchema() === 4) {
                sections = splitEvery(value, ",", 2);
              } else {
                sections = splitHeader(value);
              }
              const list = [];
              for (const section of sections) {
                list.push(await deserializer.read(headerListValueSchema, section.trim()));
              }
              dataObject[memberName] = list;
            } else {
              dataObject[memberName] = await deserializer.read(memberSchema, value);
            }
          }
        } else if (memberTraits.httpPrefixHeaders !== undefined) {
          dataObject[memberName] = {};
          for (const header in response.headers) {
            if (header.startsWith(memberTraits.httpPrefixHeaders)) {
              const value = response.headers[header];
              const valueSchema = memberSchema.getValueSchema();
              valueSchema.getMergedTraits().httpHeader = header;
              dataObject[memberName][header.slice(memberTraits.httpPrefixHeaders.length)] = await deserializer.read(valueSchema, value);
            }
          }
        } else if (memberTraits.httpResponseCode) {
          dataObject[memberName] = response.statusCode;
        } else {
          nonHttpBindingMembers.push(memberName);
        }
      }
      nonHttpBindingMembers.discardResponseBody = discardResponseBody;
      return nonHttpBindingMembers;
    }
  }

  class RpcProtocol extends HttpProtocol {
    async serializeRequest(operationSchema, _input, context) {
      const serializer = this.serializer;
      const query = {};
      const headers = {};
      const endpoint = await context.endpoint();
      const ns = NormalizedSchema.of(operationSchema?.input);
      const schema = ns.getSchema();
      let payload;
      const input = _input && typeof _input === "object" ? _input : {};
      const request = new HttpRequest({
        protocol: "",
        hostname: "",
        port: undefined,
        path: "/",
        fragment: undefined,
        query,
        headers,
        body: undefined
      });
      if (endpoint) {
        this.updateServiceEndpoint(request, endpoint);
        this.setHostPrefix(request, operationSchema, input);
      }
      if (input) {
        const eventStreamMember = ns.getEventStreamMember();
        if (eventStreamMember) {
          if (input[eventStreamMember]) {
            const initialRequest = {};
            for (const [memberName, memberSchema] of ns.structIterator()) {
              if (memberName !== eventStreamMember && input[memberName]) {
                serializer.write(memberSchema, input[memberName]);
                initialRequest[memberName] = serializer.flush();
              }
            }
            payload = await this.serializeEventStream({
              eventStream: input[eventStreamMember],
              requestSchema: ns,
              initialRequest
            });
          }
        } else {
          serializer.write(schema, input);
          payload = serializer.flush();
        }
      }
      request.headers = Object.assign(request.headers, headers);
      request.query = query;
      request.body = payload;
      request.method = "POST";
      return request;
    }
    async deserializeResponse(operationSchema, context, response) {
      const deserializer = this.deserializer;
      const ns = NormalizedSchema.of(operationSchema.output);
      const dataObject = {};
      if (response.statusCode >= 300) {
        const bytes = await collectBody(response.body, context);
        if (bytes.byteLength > 0) {
          Object.assign(dataObject, await deserializer.read(15, bytes));
        }
        await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
        throw new Error("@smithy/core/protocols - RPC Protocol error handler failed to throw.");
      }
      for (const header in response.headers) {
        const value = response.headers[header];
        delete response.headers[header];
        response.headers[header.toLowerCase()] = value;
      }
      const eventStreamMember = ns.getEventStreamMember();
      if (eventStreamMember) {
        dataObject[eventStreamMember] = await this.deserializeEventStream({
          response,
          responseSchema: ns,
          initialResponseContainer: dataObject
        });
      } else {
        const bytes = await collectBody(response.body, context);
        if (bytes.byteLength > 0) {
          Object.assign(dataObject, await deserializer.read(ns, bytes));
        }
      }
      dataObject.$metadata = this.deserializeMetadata(response);
      return dataObject;
    }
  }
  var resolvedPath = (resolvedPath2, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) => {
    if (input != null && input[memberName] !== undefined) {
      const labelValue = labelValueProvider();
      if (labelValue == null || labelValue.length <= 0) {
        throw new Error("Empty value provided for input HTTP label: " + memberName + ".");
      }
      resolvedPath2 = resolvedPath2.replace(uriLabel, isGreedyLabel ? labelValue.split("/").map((segment) => extendedEncodeURIComponent(segment)).join("/") : extendedEncodeURIComponent(labelValue));
    } else {
      throw new Error("No value provided for input HTTP label: " + memberName + ".");
    }
    return resolvedPath2;
  };
  function requestBuilder(input, context) {
    return new RequestBuilder(input, context);
  }

  class RequestBuilder {
    input;
    context;
    query = {};
    method = "";
    headers = {};
    path = "";
    body = null;
    hostname = "";
    resolvePathStack = [];
    constructor(input, context) {
      this.input = input;
      this.context = context;
    }
    async build() {
      const { hostname, protocol = "https", port, path: basePath } = await this.context.endpoint();
      this.path = basePath;
      for (const resolvePath of this.resolvePathStack) {
        resolvePath(this.path);
      }
      return new HttpRequest({
        protocol,
        hostname: this.hostname || hostname,
        port,
        method: this.method,
        path: this.path,
        query: this.query,
        body: this.body,
        headers: this.headers
      });
    }
    hn(hostname) {
      this.hostname = hostname;
      return this;
    }
    bp(uriLabel) {
      this.resolvePathStack.push((basePath) => {
        this.path = `${basePath?.endsWith("/") ? basePath.slice(0, -1) : basePath || ""}` + uriLabel;
      });
      return this;
    }
    p(memberName, labelValueProvider, uriLabel, isGreedyLabel) {
      this.resolvePathStack.push((path) => {
        this.path = resolvedPath(path, this.input, memberName, labelValueProvider, uriLabel, isGreedyLabel);
      });
      return this;
    }
    h(headers) {
      this.headers = headers;
      return this;
    }
    q(query) {
      this.query = query;
      return this;
    }
    b(body) {
      this.body = body;
      return this;
    }
    m(method) {
      this.method = method;
      return this;
    }
  }
  function determineTimestampFormat(ns, settings) {
    if (settings.timestampFormat.useTrait) {
      if (ns.isTimestampSchema() && (ns.getSchema() === 5 || ns.getSchema() === 6 || ns.getSchema() === 7)) {
        return ns.getSchema();
      }
    }
    const { httpLabel, httpPrefixHeaders, httpHeader, httpQuery } = ns.getMergedTraits();
    const bindingFormat = settings.httpBindings ? typeof httpPrefixHeaders === "string" || Boolean(httpHeader) ? 6 : Boolean(httpQuery) || Boolean(httpLabel) ? 5 : undefined : undefined;
    return bindingFormat ?? settings.timestampFormat.default;
  }

  class FromStringShapeDeserializer extends SerdeContext {
    settings;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    read(_schema, data) {
      const ns = NormalizedSchema.of(_schema);
      if (ns.isListSchema()) {
        return splitHeader(data).map((item) => this.read(ns.getValueSchema(), item));
      }
      if (ns.isBlobSchema()) {
        return (this.serdeContext?.base64Decoder ?? fromBase64)(data);
      }
      if (ns.isTimestampSchema()) {
        const format = determineTimestampFormat(ns, this.settings);
        switch (format) {
          case 5:
            return _parseRfc3339DateTimeWithOffset(data);
          case 6:
            return _parseRfc7231DateTime(data);
          case 7:
            return _parseEpochTimestamp(data);
          default:
            console.warn("Missing timestamp format, parsing value with Date constructor:", data);
            return new Date(data);
        }
      }
      if (ns.isStringSchema()) {
        const mediaType = ns.getMergedTraits().mediaType;
        let intermediateValue = data;
        if (mediaType) {
          if (ns.getMergedTraits().httpHeader) {
            intermediateValue = this.base64ToUtf8(intermediateValue);
          }
          const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
          if (isJson) {
            intermediateValue = LazyJsonString.from(intermediateValue);
          }
          return intermediateValue;
        }
      }
      if (ns.isNumericSchema()) {
        return Number(data);
      }
      if (ns.isBigIntegerSchema()) {
        return BigInt(data);
      }
      if (ns.isBigDecimalSchema()) {
        return new NumericValue(data, "bigDecimal");
      }
      if (ns.isBooleanSchema()) {
        return String(data).toLowerCase() === "true";
      }
      return data;
    }
    base64ToUtf8(base64String) {
      return (this.serdeContext?.utf8Encoder ?? toUtf8)((this.serdeContext?.base64Decoder ?? fromBase64)(base64String));
    }
  }

  class HttpInterceptingShapeDeserializer extends SerdeContext {
    codecDeserializer;
    stringDeserializer;
    constructor(codecDeserializer, codecSettings) {
      super();
      this.codecDeserializer = codecDeserializer;
      this.stringDeserializer = new FromStringShapeDeserializer(codecSettings);
    }
    setSerdeContext(serdeContext) {
      this.stringDeserializer.setSerdeContext(serdeContext);
      this.codecDeserializer.setSerdeContext(serdeContext);
      this.serdeContext = serdeContext;
    }
    read(schema, data) {
      const ns = NormalizedSchema.of(schema);
      const traits = ns.getMergedTraits();
      const toString = this.serdeContext?.utf8Encoder ?? toUtf8;
      if (traits.httpHeader || traits.httpResponseCode) {
        return this.stringDeserializer.read(ns, toString(data));
      }
      if (traits.httpPayload) {
        if (ns.isBlobSchema()) {
          const toBytes = this.serdeContext?.utf8Decoder ?? fromUtf8;
          if (typeof data === "string") {
            return toBytes(data);
          }
          return data;
        } else if (ns.isStringSchema()) {
          if ("byteLength" in data) {
            return toString(data);
          }
          return data;
        }
      }
      return this.codecDeserializer.read(ns, data);
    }
  }

  class ToStringShapeSerializer extends SerdeContext {
    settings;
    stringBuffer = "";
    constructor(settings) {
      super();
      this.settings = settings;
    }
    write(schema, value) {
      const ns = NormalizedSchema.of(schema);
      switch (typeof value) {
        case "object":
          if (value === null) {
            this.stringBuffer = "null";
            return;
          }
          if (ns.isTimestampSchema()) {
            if (!(value instanceof Date)) {
              throw new Error(`@smithy/core/protocols - received non-Date value ${value} when schema expected Date in ${ns.getName(true)}`);
            }
            const format = determineTimestampFormat(ns, this.settings);
            switch (format) {
              case 5:
                this.stringBuffer = value.toISOString().replace(".000Z", "Z");
                break;
              case 6:
                this.stringBuffer = dateToUtcString(value);
                break;
              case 7:
                this.stringBuffer = String(value.getTime() / 1000);
                break;
              default:
                console.warn("Missing timestamp format, using epoch seconds", value);
                this.stringBuffer = String(value.getTime() / 1000);
            }
            return;
          }
          if (ns.isBlobSchema() && "byteLength" in value) {
            this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(value);
            return;
          }
          if (ns.isListSchema() && Array.isArray(value)) {
            let buffer = "";
            for (const item of value) {
              this.write([ns.getValueSchema(), ns.getMergedTraits()], item);
              const headerItem = this.flush();
              const serialized = ns.getValueSchema().isTimestampSchema() ? headerItem : quoteHeader(headerItem);
              if (buffer !== "") {
                buffer += ", ";
              }
              buffer += serialized;
            }
            this.stringBuffer = buffer;
            return;
          }
          this.stringBuffer = JSON.stringify(value, null, 2);
          break;
        case "string":
          const mediaType = ns.getMergedTraits().mediaType;
          let intermediateValue = value;
          if (mediaType) {
            const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
            if (isJson) {
              intermediateValue = LazyJsonString.from(intermediateValue);
            }
            if (ns.getMergedTraits().httpHeader) {
              this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(intermediateValue.toString());
              return;
            }
          }
          this.stringBuffer = value;
          break;
        default:
          if (ns.isIdempotencyToken()) {
            this.stringBuffer = generateIdempotencyToken();
          } else {
            this.stringBuffer = String(value);
          }
      }
    }
    flush() {
      const buffer = this.stringBuffer;
      this.stringBuffer = "";
      return buffer;
    }
  }

  class HttpInterceptingShapeSerializer {
    codecSerializer;
    stringSerializer;
    buffer;
    constructor(codecSerializer, codecSettings, stringSerializer = new ToStringShapeSerializer(codecSettings)) {
      this.codecSerializer = codecSerializer;
      this.stringSerializer = stringSerializer;
    }
    setSerdeContext(serdeContext) {
      this.codecSerializer.setSerdeContext(serdeContext);
      this.stringSerializer.setSerdeContext(serdeContext);
    }
    write(schema, value) {
      const ns = NormalizedSchema.of(schema);
      const traits = ns.getMergedTraits();
      if (traits.httpHeader || traits.httpLabel || traits.httpQuery) {
        this.stringSerializer.write(ns, value);
        this.buffer = this.stringSerializer.flush();
        return;
      }
      return this.codecSerializer.write(ns, value);
    }
    flush() {
      if (this.buffer !== undefined) {
        const buffer = this.buffer;
        this.buffer = undefined;
        return buffer;
      }
      return this.codecSerializer.flush();
    }
  }

  class Field {
    name;
    kind;
    values;
    constructor({ name, kind = FieldPosition.HEADER, values = [] }) {
      this.name = name;
      this.kind = kind;
      this.values = values;
    }
    add(value) {
      this.values.push(value);
    }
    set(values) {
      this.values = values;
    }
    remove(value) {
      this.values = this.values.filter((v) => v !== value);
    }
    toString() {
      return this.values.map((v) => v.includes(",") || v.includes(" ") ? `"${v}"` : v).join(", ");
    }
    get() {
      return this.values;
    }
  }

  class Fields {
    entries = {};
    encoding;
    constructor({ fields = [], encoding = "utf-8" }) {
      fields.forEach(this.setField.bind(this));
      this.encoding = encoding;
    }
    setField(field) {
      this.entries[field.name.toLowerCase()] = field;
    }
    getField(name) {
      return this.entries[name.toLowerCase()];
    }
    removeField(name) {
      delete this.entries[name.toLowerCase()];
    }
    getByType(kind) {
      return Object.values(this.entries).filter((field) => field.kind === kind);
    }
  }
  var getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
    return {
      setHttpHandler(handler) {
        runtimeConfig.httpHandler = handler;
      },
      httpHandler() {
        return runtimeConfig.httpHandler;
      },
      updateHttpClientConfig(key, value) {
        runtimeConfig.httpHandler?.updateHttpClientConfig(key, value);
      },
      httpHandlerConfigs() {
        return runtimeConfig.httpHandler.httpHandlerConfigs();
      }
    };
  };
  var resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
    return {
      httpHandler: httpHandlerExtensionConfiguration.httpHandler()
    };
  };
  var CONTENT_LENGTH_HEADER = "content-length";
  function contentLengthMiddleware(bodyLengthChecker) {
    return (next) => async (args) => {
      const request = args.request;
      if (HttpRequest.isInstance(request)) {
        const { body, headers } = request;
        if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER) === -1) {
          try {
            const length = bodyLengthChecker(body);
            request.headers = {
              ...request.headers,
              [CONTENT_LENGTH_HEADER]: String(length)
            };
          } catch (error) {}
        }
      }
      return next({
        ...args,
        request
      });
    };
  }
  var contentLengthMiddlewareOptions = {
    step: "build",
    tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
    name: "contentLengthMiddleware",
    override: true
  };
  var getContentLengthPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
    }
  });
  var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
  var hexEncode = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
  var escapeUriPath = (uri) => uri.split("/").map(escapeUri).join("/");
  function buildQueryString(query) {
    const parts = [];
    for (let key of Object.keys(query).sort()) {
      const value = query[key];
      key = escapeUri(key);
      if (Array.isArray(value)) {
        for (let i = 0, iLen = value.length;i < iLen; i++) {
          parts.push(`${key}=${escapeUri(value[i])}`);
        }
      } else {
        let qsEntry = key;
        if (value || typeof value === "string") {
          qsEntry += `=${escapeUri(value)}`;
        }
        parts.push(qsEntry);
      }
    }
    return parts.join("&");
  }
  exports.Field = Field;
  exports.Fields = Fields;
  exports.FromStringShapeDeserializer = FromStringShapeDeserializer;
  exports.HttpBindingProtocol = HttpBindingProtocol;
  exports.HttpInterceptingShapeDeserializer = HttpInterceptingShapeDeserializer;
  exports.HttpInterceptingShapeSerializer = HttpInterceptingShapeSerializer;
  exports.HttpProtocol = HttpProtocol;
  exports.RequestBuilder = RequestBuilder;
  exports.RpcProtocol = RpcProtocol;
  exports.SerdeContext = SerdeContext;
  exports.ToStringShapeSerializer = ToStringShapeSerializer;
  exports.buildQueryString = buildQueryString;
  exports.collectBody = collectBody;
  exports.contentLengthMiddleware = contentLengthMiddleware;
  exports.contentLengthMiddlewareOptions = contentLengthMiddlewareOptions;
  exports.determineTimestampFormat = determineTimestampFormat;
  exports.escapeUri = escapeUri;
  exports.escapeUriPath = escapeUriPath;
  exports.extendedEncodeURIComponent = extendedEncodeURIComponent;
  exports.getContentLengthPlugin = getContentLengthPlugin;
  exports.getHttpHandlerExtensionConfiguration = getHttpHandlerExtensionConfiguration;
  exports.requestBuilder = requestBuilder;
  exports.resolveHttpHandlerRuntimeConfig = resolveHttpHandlerRuntimeConfig;
  exports.resolvedPath = resolvedPath;
});

// node_modules/.bun/@smithy+node-http-handler@4.8.2/node_modules/@smithy/node-http-handler/dist-cjs/index.js
var require_dist_cjs5 = __commonJS((exports) => {
  var { buildQueryString, HttpResponse } = require_protocols();
  var node_https = __require("node:https");
  var { Readable, Writable } = __require("node:stream");
  var http2 = __require("node:http2");
  function buildAbortError(abortSignal) {
    const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : undefined;
    if (reason) {
      if (reason instanceof Error) {
        const abortError3 = new Error("Request aborted");
        abortError3.name = "AbortError";
        abortError3.cause = reason;
        return abortError3;
      }
      const abortError2 = new Error(String(reason));
      abortError2.name = "AbortError";
      return abortError2;
    }
    const abortError = new Error("Request aborted");
    abortError.name = "AbortError";
    return abortError;
  }
  var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "EPIPE", "ETIMEDOUT"];
  var getTransformedHeaders = (headers) => {
    const transformedHeaders = {};
    for (const name in headers) {
      const headerValues = headers[name];
      transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
    }
    return transformedHeaders;
  };
  var timing = {
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (timeoutId) => clearTimeout(timeoutId)
  };
  var DEFER_EVENT_LISTENER_TIME$2 = 1000;
  var setConnectionTimeout = (request, reject, timeoutInMs = 0) => {
    if (!timeoutInMs) {
      return -1;
    }
    const registerTimeout = (offset) => {
      const timeoutId = timing.setTimeout(() => {
        request.destroy();
        reject(Object.assign(new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), {
          name: "TimeoutError"
        }));
      }, timeoutInMs - offset);
      const doWithSocket = (socket) => {
        if (socket?.connecting) {
          socket.on("connect", () => {
            timing.clearTimeout(timeoutId);
          });
        } else {
          timing.clearTimeout(timeoutId);
        }
      };
      if (request.socket) {
        doWithSocket(request.socket);
      } else {
        request.on("socket", doWithSocket);
      }
    };
    if (timeoutInMs < 2000) {
      registerTimeout(0);
      return 0;
    }
    return timing.setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME$2), DEFER_EVENT_LISTENER_TIME$2);
  };
  var setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger) => {
    if (timeoutInMs) {
      return timing.setTimeout(() => {
        let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
        if (throwOnRequestTimeout) {
          const error = Object.assign(new Error(msg), {
            name: "TimeoutError",
            code: "ETIMEDOUT"
          });
          req.destroy(error);
          reject(error);
        } else {
          msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
          logger?.warn?.(msg);
        }
      }, timeoutInMs);
    }
    return -1;
  };
  var DEFER_EVENT_LISTENER_TIME$1 = 3000;
  var setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME$1) => {
    if (keepAlive !== true) {
      return -1;
    }
    const registerListener = () => {
      if (request.socket) {
        request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
      } else {
        request.on("socket", (socket) => {
          socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
        });
      }
    };
    if (deferTimeMs === 0) {
      registerListener();
      return 0;
    }
    return timing.setTimeout(registerListener, deferTimeMs);
  };
  var DEFER_EVENT_LISTENER_TIME = 3000;
  var setSocketTimeout = (request, reject, timeoutInMs = 0) => {
    const registerTimeout = (offset) => {
      const timeout = timeoutInMs - offset;
      const onTimeout = () => {
        request.destroy();
        reject(Object.assign(new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), { name: "TimeoutError" }));
      };
      if (request.socket) {
        request.socket.setTimeout(timeout, onTimeout);
        request.on("close", () => request.socket?.removeListener("timeout", onTimeout));
      } else {
        request.setTimeout(timeout, onTimeout);
      }
    };
    if (0 < timeoutInMs && timeoutInMs < 6000) {
      registerTimeout(0);
      return 0;
    }
    return timing.setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
  };
  var MIN_WAIT_TIME = 6000;
  async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
    const headers = request.headers;
    const expect = headers ? headers.Expect || headers.expect : undefined;
    let timeoutId = -1;
    let sendBody = true;
    if (!externalAgent && expect === "100-continue") {
      sendBody = await Promise.race([
        new Promise((resolve) => {
          timeoutId = Number(timing.setTimeout(() => resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
        }),
        new Promise((resolve) => {
          httpRequest.on("continue", () => {
            timing.clearTimeout(timeoutId);
            resolve(true);
          });
          httpRequest.on("response", () => {
            timing.clearTimeout(timeoutId);
            resolve(false);
          });
          httpRequest.on("error", () => {
            timing.clearTimeout(timeoutId);
            resolve(false);
          });
        })
      ]);
    }
    if (sendBody) {
      writeBody(httpRequest, request.body);
    }
  }
  function writeBody(httpRequest, body) {
    if (body instanceof Readable) {
      body.pipe(httpRequest);
      return;
    }
    if (body) {
      const isBuffer = Buffer.isBuffer(body);
      const isString = typeof body === "string";
      if (isBuffer || isString) {
        if (isBuffer && body.byteLength === 0) {
          httpRequest.end();
        } else {
          httpRequest.end(body);
        }
        return;
      }
      const uint8 = body;
      if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
        httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
        return;
      }
      httpRequest.end(Buffer.from(body));
      return;
    }
    httpRequest.end();
  }
  var DEFAULT_REQUEST_TIMEOUT = 0;
  var hAgent = undefined;
  var hRequest = undefined;

  class NodeHttpHandler {
    config;
    configProvider;
    socketWarningTimestamp = 0;
    externalAgent = false;
    metadata = { handlerProtocol: "http/1.1" };
    static create(instanceOrOptions) {
      if (typeof instanceOrOptions?.handle === "function") {
        return instanceOrOptions;
      }
      return new NodeHttpHandler(instanceOrOptions);
    }
    static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
      const { sockets, requests, maxSockets } = agent;
      if (typeof maxSockets !== "number" || maxSockets === Infinity) {
        return socketWarningTimestamp;
      }
      const interval = 15000;
      if (Date.now() - interval < socketWarningTimestamp) {
        return socketWarningTimestamp;
      }
      if (sockets && requests) {
        for (const origin in sockets) {
          const socketsInUse = sockets[origin]?.length ?? 0;
          const requestsEnqueued = requests[origin]?.length ?? 0;
          if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
            logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
            return Date.now();
          }
        }
      }
      return socketWarningTimestamp;
    }
    constructor(options) {
      this.configProvider = new Promise((resolve, reject) => {
        if (typeof options === "function") {
          options().then((_options) => {
            resolve(this.resolveDefaultConfig(_options));
          }).catch(reject);
        } else {
          resolve(this.resolveDefaultConfig(options));
        }
      });
    }
    destroy() {
      this.config?.httpAgent?.destroy();
      this.config?.httpsAgent?.destroy();
    }
    async handle(request, { abortSignal, requestTimeout } = {}) {
      if (!this.config) {
        this.config = await this.configProvider;
      }
      const config = this.config;
      const isSSL = request.protocol === "https:";
      if (!isSSL && !this.config.httpAgent) {
        this.config.httpAgent = await this.config.httpAgentProvider();
      }
      return new Promise((_resolve, _reject) => {
        let writeRequestBodyPromise = undefined;
        let socketWarningTimeoutId = -1;
        let connectionTimeoutId = -1;
        let requestTimeoutId = -1;
        let socketTimeoutId = -1;
        let keepAliveTimeoutId = -1;
        const clearTimeouts = () => {
          timing.clearTimeout(socketWarningTimeoutId);
          timing.clearTimeout(connectionTimeoutId);
          timing.clearTimeout(requestTimeoutId);
          timing.clearTimeout(socketTimeoutId);
          timing.clearTimeout(keepAliveTimeoutId);
        };
        const resolve = async (arg) => {
          await writeRequestBodyPromise;
          clearTimeouts();
          _resolve(arg);
        };
        const reject = async (arg) => {
          await writeRequestBodyPromise;
          clearTimeouts();
          _reject(arg);
        };
        if (abortSignal?.aborted) {
          const abortError = buildAbortError(abortSignal);
          reject(abortError);
          return;
        }
        const headers = request.headers;
        const expectContinue = headers ? (headers.Expect ?? headers.expect) === "100-continue" : false;
        let agent = isSSL ? config.httpsAgent : config.httpAgent;
        if (expectContinue && !this.externalAgent) {
          agent = new (isSSL ? node_https.Agent : hAgent)({
            keepAlive: false,
            maxSockets: Infinity
          });
        }
        socketWarningTimeoutId = timing.setTimeout(() => {
          this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, config.logger);
        }, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2000) + (config.connectionTimeout ?? 1000));
        const queryString = request.query ? buildQueryString(request.query) : "";
        let auth = undefined;
        if (request.username != null || request.password != null) {
          const username = request.username ?? "";
          const password = request.password ?? "";
          auth = `${username}:${password}`;
        }
        let path = request.path;
        if (queryString) {
          path += `?${queryString}`;
        }
        if (request.fragment) {
          path += `#${request.fragment}`;
        }
        let hostname = request.hostname ?? "";
        if (hostname[0] === "[" && hostname.endsWith("]")) {
          hostname = request.hostname.slice(1, -1);
        } else {
          hostname = request.hostname;
        }
        const nodeHttpsOptions = {
          headers: request.headers,
          host: hostname,
          method: request.method,
          path,
          port: request.port,
          agent,
          auth
        };
        const requestFunc = isSSL ? node_https.request : hRequest;
        const req = requestFunc(nodeHttpsOptions, (res) => {
          const httpResponse = new HttpResponse({
            statusCode: res.statusCode || -1,
            reason: res.statusMessage,
            headers: getTransformedHeaders(res.headers),
            body: res
          });
          resolve({ response: httpResponse });
        });
        req.on("error", (err) => {
          if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) {
            reject(Object.assign(err, { name: "TimeoutError" }));
          } else {
            reject(err);
          }
        });
        if (abortSignal) {
          const onAbort = () => {
            req.destroy();
            const abortError = buildAbortError(abortSignal);
            reject(abortError);
          };
          if (typeof abortSignal.addEventListener === "function") {
            const signal = abortSignal;
            signal.addEventListener("abort", onAbort, { once: true });
            req.once("close", () => signal.removeEventListener("abort", onAbort));
          } else {
            abortSignal.onabort = onAbort;
          }
        }
        const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
        connectionTimeoutId = setConnectionTimeout(req, reject, config.connectionTimeout);
        requestTimeoutId = setRequestTimeout(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, config.logger ?? console);
        socketTimeoutId = setSocketTimeout(req, reject, config.socketTimeout);
        const httpAgent = nodeHttpsOptions.agent;
        if (typeof httpAgent === "object" && "keepAlive" in httpAgent) {
          keepAliveTimeoutId = setSocketKeepAlive(req, {
            keepAlive: httpAgent.keepAlive,
            keepAliveMsecs: httpAgent.keepAliveMsecs
          });
        }
        writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout, this.externalAgent).catch((e) => {
          clearTimeouts();
          return _reject(e);
        });
      });
    }
    updateHttpClientConfig(key, value) {
      this.config = undefined;
      this.configProvider = this.configProvider.then((config) => {
        return {
          ...config,
          [key]: value
        };
      });
    }
    httpHandlerConfigs() {
      return this.config ?? {};
    }
    resolveDefaultConfig(options) {
      const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
      const keepAlive = true;
      const maxSockets = 50;
      return {
        connectionTimeout,
        requestTimeout,
        socketTimeout,
        socketAcquisitionWarningTimeout,
        throwOnRequestTimeout,
        httpAgentProvider: async () => {
          const node_http = __require("node:http");
          const { Agent, request } = node_http.default ?? node_http;
          hRequest = request;
          hAgent = Agent;
          if (httpAgent instanceof hAgent || typeof httpAgent?.destroy === "function") {
            this.externalAgent = true;
            return httpAgent;
          }
          return new hAgent({ keepAlive, maxSockets, ...httpAgent });
        },
        httpsAgent: (() => {
          if (httpsAgent instanceof node_https.Agent || typeof httpsAgent?.destroy === "function") {
            this.externalAgent = true;
            return httpsAgent;
          }
          return new node_https.Agent({ keepAlive, maxSockets, ...httpsAgent });
        })(),
        logger
      };
    }
  }
  var ids = new Uint16Array(1);

  class ClientHttp2SessionRef {
    id = ids[0]++;
    total = 0;
    max = 0;
    session;
    refs = 0;
    constructor(session) {
      session.unref();
      this.session = session;
    }
    retain() {
      if (this.session.destroyed) {
        throw new Error("@smithy/node-http-handler - cannot acquire reference to destroyed session.");
      }
      this.refs += 1;
      this.total += 1;
      this.max = Math.max(this.refs, this.max);
      this.session.ref();
    }
    free() {
      if (this.session.destroyed) {
        return;
      }
      this.refs -= 1;
      if (this.refs === 0) {
        this.session.unref();
      }
      if (this.refs < 0) {
        throw new Error("@smithy/node-http-handler - ClientHttp2Session refcount at zero, cannot decrement.");
      }
    }
    deref() {
      return this.session;
    }
    close() {
      if (!this.session.closed) {
        this.session.close();
      }
    }
    destroy() {
      this.refs = 0;
      if (!this.session.destroyed) {
        this.session.destroy();
      }
    }
    useCount() {
      return this.refs;
    }
  }

  class NodeHttp2ConnectionPool {
    sessions = [];
    maxConcurrency = 0;
    constructor(sessions) {
      this.sessions = (sessions ?? []).map((session) => new ClientHttp2SessionRef(session));
    }
    poll() {
      let cleanup = false;
      for (const session of this.sessions) {
        if (session.deref().destroyed) {
          cleanup = true;
          continue;
        }
        if (!this.maxConcurrency || session.useCount() < this.maxConcurrency) {
          return session;
        }
      }
      if (cleanup) {
        for (const session of this.sessions) {
          if (session.deref().destroyed) {
            this.remove(session);
          }
        }
      }
    }
    offerLast(ref) {
      this.sessions.push(ref);
    }
    remove(ref) {
      const ix = this.sessions.indexOf(ref);
      if (ix > -1) {
        this.sessions.splice(ix, 1);
      }
    }
    [Symbol.iterator]() {
      return this.sessions[Symbol.iterator]();
    }
    setMaxConcurrency(maxConcurrency) {
      this.maxConcurrency = maxConcurrency;
    }
    destroy(ref) {
      this.remove(ref);
      ref.destroy();
    }
  }

  class NodeHttp2ConnectionManager {
    config;
    connectOptions;
    connectionPools = new Map;
    constructor(config) {
      this.config = config;
      if (this.config.maxConcurrency && this.config.maxConcurrency <= 0) {
        throw new RangeError("maxConcurrency must be greater than zero.");
      }
    }
    lease(requestContext, connectionConfiguration) {
      const url = this.getUrlString(requestContext);
      const pool = this.getPool(url);
      if (!this.config.disableConcurrency && !connectionConfiguration.isEventStream) {
        const available = pool.poll();
        if (available) {
          available.retain();
          return available;
        }
      }
      const ref = new ClientHttp2SessionRef(this.connect(url));
      const session = ref.deref();
      if (this.config.maxConcurrency) {
        session.settings({ maxConcurrentStreams: this.config.maxConcurrency }, (err) => {
          if (err) {
            throw new Error("Fail to set maxConcurrentStreams to " + this.config.maxConcurrency + "when creating new session for " + requestContext.destination.toString());
          }
        });
      }
      const graceful = () => {
        this.removeFromPoolAndClose(url, ref);
      };
      const ensureDestroyed = () => {
        this.removeFromPoolAndCheckedDestroy(url, ref);
      };
      session.on("goaway", graceful);
      session.on("error", ensureDestroyed);
      session.on("frameError", ensureDestroyed);
      session.on("close", ensureDestroyed);
      if (connectionConfiguration.requestTimeout) {
        session.setTimeout(connectionConfiguration.requestTimeout, ensureDestroyed);
      }
      pool.offerLast(ref);
      ref.retain();
      return ref;
    }
    release(_requestContext, ref) {
      ref.free();
    }
    createIsolatedSession(requestContext, connectionConfiguration) {
      const url = this.getUrlString(requestContext);
      const ref = new ClientHttp2SessionRef(this.connect(url));
      const session = ref.deref();
      session.settings({ maxConcurrentStreams: 1 });
      const ensureDestroyed = () => {
        ref.destroy();
      };
      session.on("error", ensureDestroyed);
      session.on("frameError", ensureDestroyed);
      session.on("close", ensureDestroyed);
      if (connectionConfiguration.requestTimeout) {
        session.setTimeout(connectionConfiguration.requestTimeout, ensureDestroyed);
      }
      ref.retain();
      return ref;
    }
    destroy() {
      for (const [url, connectionPool] of this.connectionPools) {
        for (const session of [...connectionPool]) {
          session.destroy();
        }
        this.connectionPools.delete(url);
      }
    }
    setMaxConcurrentStreams(maxConcurrentStreams) {
      if (maxConcurrentStreams && maxConcurrentStreams <= 0) {
        throw new RangeError("maxConcurrentStreams must be greater than zero.");
      }
      this.config.maxConcurrency = maxConcurrentStreams;
      for (const pool of this.connectionPools.values()) {
        pool.setMaxConcurrency(maxConcurrentStreams);
      }
    }
    setDisableConcurrentStreams(disableConcurrentStreams) {
      this.config.disableConcurrency = disableConcurrentStreams;
    }
    setNodeHttp2ConnectOptions(nodeHttp2ConnectOptions) {
      this.connectOptions = nodeHttp2ConnectOptions;
    }
    debug() {
      const pools = {};
      for (const [url, pool] of this.connectionPools) {
        const sessions = [];
        for (const ref of pool) {
          sessions.push({
            id: ref.id,
            active: ref.useCount(),
            maxConcurrent: ref.max,
            totalRequests: ref.total
          });
        }
        pools[url] = { sessions };
      }
      return pools;
    }
    removeFromPoolAndClose(authority, ref) {
      this.connectionPools.get(authority)?.remove(ref);
      ref.close();
    }
    removeFromPoolAndCheckedDestroy(authority, ref) {
      this.connectionPools.get(authority)?.remove(ref);
      ref.destroy();
    }
    getPool(url) {
      if (!this.connectionPools.has(url)) {
        const pool = new NodeHttp2ConnectionPool;
        if (this.config.maxConcurrency) {
          pool.setMaxConcurrency(this.config.maxConcurrency);
        }
        this.connectionPools.set(url, pool);
      }
      return this.connectionPools.get(url);
    }
    getUrlString(request) {
      return request.destination.toString();
    }
    connect(url) {
      return this.connectOptions === undefined ? http2.connect(url) : http2.connect(url, this.connectOptions);
    }
  }
  var { constants } = http2;

  class NodeHttp2Handler {
    config;
    configProvider;
    metadata = { handlerProtocol: "h2" };
    connectionManager = new NodeHttp2ConnectionManager({});
    static create(instanceOrOptions) {
      if (typeof instanceOrOptions?.handle === "function") {
        return instanceOrOptions;
      }
      return new NodeHttp2Handler(instanceOrOptions);
    }
    constructor(options) {
      this.configProvider = new Promise((resolve, reject) => {
        if (typeof options === "function") {
          options().then((opts) => {
            resolve(opts || {});
          }).catch(reject);
        } else {
          resolve(options || {});
        }
      });
    }
    destroy() {
      this.connectionManager.destroy();
    }
    async handle(request, { abortSignal, requestTimeout, isEventStream } = {}) {
      if (!this.config) {
        this.config = await this.configProvider;
        const { disableConcurrentStreams: disableConcurrentStreams2, maxConcurrentStreams, nodeHttp2ConnectOptions } = this.config;
        this.connectionManager.setDisableConcurrentStreams(disableConcurrentStreams2 ?? false);
        if (maxConcurrentStreams) {
          this.connectionManager.setMaxConcurrentStreams(maxConcurrentStreams);
        }
        if (nodeHttp2ConnectOptions) {
          this.connectionManager.setNodeHttp2ConnectOptions(nodeHttp2ConnectOptions);
        }
      }
      const { requestTimeout: configRequestTimeout, disableConcurrentStreams } = this.config;
      const useIsolatedSession = disableConcurrentStreams || isEventStream;
      const effectiveRequestTimeout = requestTimeout ?? configRequestTimeout;
      return new Promise((_resolve, _reject) => {
        let fulfilled = false;
        let writeRequestBodyPromise = undefined;
        const resolve = async (arg) => {
          await writeRequestBodyPromise;
          _resolve(arg);
        };
        const reject = async (arg) => {
          await writeRequestBodyPromise;
          _reject(arg);
        };
        if (abortSignal?.aborted) {
          fulfilled = true;
          const abortError = buildAbortError(abortSignal);
          reject(abortError);
          return;
        }
        const { hostname, method, port, protocol, query } = request;
        let auth = "";
        if (request.username != null || request.password != null) {
          const username = request.username ?? "";
          const password = request.password ?? "";
          auth = `${username}:${password}@`;
        }
        const authority = `${protocol}//${auth}${hostname}${port ? `:${port}` : ""}`;
        const requestContext = { destination: new URL(authority) };
        const connectConfig = {
          requestTimeout: this.config?.sessionTimeout,
          isEventStream
        };
        const ref = useIsolatedSession ? this.connectionManager.createIsolatedSession(requestContext, connectConfig) : this.connectionManager.lease(requestContext, connectConfig);
        const session = ref.deref();
        const rejectWithDestroy = (err) => {
          if (useIsolatedSession) {
            ref.destroy();
          }
          fulfilled = true;
          reject(err);
        };
        const queryString = query ? buildQueryString(query) : "";
        let path = request.path;
        if (queryString) {
          path += `?${queryString}`;
        }
        if (request.fragment) {
          path += `#${request.fragment}`;
        }
        const clientHttp2Stream = session.request({
          ...request.headers,
          [constants.HTTP2_HEADER_PATH]: path,
          [constants.HTTP2_HEADER_METHOD]: method
        });
        if (effectiveRequestTimeout) {
          clientHttp2Stream.setTimeout(effectiveRequestTimeout, () => {
            clientHttp2Stream.close();
            const timeoutError = new Error(`Stream timed out because of no activity for ${effectiveRequestTimeout} ms`);
            timeoutError.name = "TimeoutError";
            rejectWithDestroy(timeoutError);
          });
        }
        if (abortSignal) {
          const onAbort = () => {
            clientHttp2Stream.close();
            const abortError = buildAbortError(abortSignal);
            rejectWithDestroy(abortError);
          };
          if (typeof abortSignal.addEventListener === "function") {
            const signal = abortSignal;
            signal.addEventListener("abort", onAbort, { once: true });
            clientHttp2Stream.once("close", () => signal.removeEventListener("abort", onAbort));
          } else {
            abortSignal.onabort = onAbort;
          }
        }
        clientHttp2Stream.on("frameError", (type, code, id) => {
          rejectWithDestroy(new Error(`Frame type id ${type} in stream id ${id} has failed with code ${code}.`));
        });
        clientHttp2Stream.on("error", rejectWithDestroy);
        clientHttp2Stream.on("aborted", () => {
          rejectWithDestroy(new Error(`HTTP/2 stream is abnormally aborted in mid-communication with result code ${clientHttp2Stream.rstCode}.`));
        });
        clientHttp2Stream.on("response", (headers) => {
          const httpResponse = new HttpResponse({
            statusCode: headers[":status"] ?? -1,
            headers: getTransformedHeaders(headers),
            body: clientHttp2Stream
          });
          fulfilled = true;
          resolve({ response: httpResponse });
          if (useIsolatedSession) {
            session.close();
          }
        });
        clientHttp2Stream.on("close", () => {
          if (useIsolatedSession) {
            ref.destroy();
          } else {
            this.connectionManager.release(requestContext, ref);
          }
          if (!fulfilled) {
            rejectWithDestroy(new Error("Unexpected error: http2 request did not get a response"));
          }
        });
        writeRequestBodyPromise = writeRequestBody(clientHttp2Stream, request, effectiveRequestTimeout);
      });
    }
    updateHttpClientConfig(key, value) {
      this.config = undefined;
      this.configProvider = this.configProvider.then((config) => {
        return {
          ...config,
          [key]: value
        };
      });
    }
    httpHandlerConfigs() {
      return this.config ?? {};
    }
  }

  class Collector extends Writable {
    bufferedBytes = [];
    _write(chunk, encoding, callback) {
      this.bufferedBytes.push(chunk);
      callback();
    }
  }
  var streamCollector = (stream) => {
    if (isReadableStreamInstance(stream)) {
      return collectReadableStream(stream);
    }
    return new Promise((resolve, reject) => {
      const collector = new Collector;
      stream.pipe(collector);
      stream.on("error", (err) => {
        collector.end();
        reject(err);
      });
      collector.on("error", reject);
      collector.on("finish", function() {
        const bytes = new Uint8Array(Buffer.concat(this.bufferedBytes));
        resolve(bytes);
      });
    });
  };
  var isReadableStreamInstance = (stream) => typeof ReadableStream === "function" && stream instanceof ReadableStream;
  async function collectReadableStream(stream) {
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    let length = 0;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        length += value.length;
      }
      isDone = done;
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      collected.set(chunk, offset);
      offset += chunk.length;
    }
    return collected;
  }
  exports.DEFAULT_REQUEST_TIMEOUT = DEFAULT_REQUEST_TIMEOUT;
  exports.NodeHttp2Handler = NodeHttp2Handler;
  exports.NodeHttpHandler = NodeHttpHandler;
  exports.streamCollector = streamCollector;
});

export { require_dist_cjs, require_transport, require_schema, require_client, require_config, require_endpoints, require_serde, require_protocols, require_dist_cjs5 as require_dist_cjs1 };
