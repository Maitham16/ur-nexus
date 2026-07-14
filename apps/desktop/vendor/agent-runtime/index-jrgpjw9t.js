import {
  require_client,
  require_config,
  require_dist_cjs,
  require_dist_cjs1 as require_dist_cjs2,
  require_endpoints,
  require_protocols,
  require_schema,
  require_serde,
  require_transport
} from "./index-ht13gg1d.js";
import {
  __commonJS,
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/retry/index.js
var require_retry = __commonJS((exports) => {
  var { Readable } = __require("node:stream");
  var { NoOpLogger, normalizeProvider } = require_client();
  var { HttpResponse, HttpRequest } = require_protocols();
  var { parseRfc7231DateTime, v4 } = require_serde();
  var isStreamingPayload = (request) => request?.body instanceof Readable || typeof ReadableStream !== "undefined" && request?.body instanceof ReadableStream;
  var CLOCK_SKEW_ERROR_CODES = [
    "AuthFailure",
    "InvalidSignatureException",
    "RequestExpired",
    "RequestInTheFuture",
    "RequestTimeTooSkewed",
    "SignatureDoesNotMatch"
  ];
  var THROTTLING_ERROR_CODES = [
    "BandwidthLimitExceeded",
    "EC2ThrottledException",
    "LimitExceededException",
    "PriorRequestNotComplete",
    "ProvisionedThroughputExceededException",
    "RequestLimitExceeded",
    "RequestThrottled",
    "RequestThrottledException",
    "SlowDown",
    "ThrottledException",
    "Throttling",
    "ThrottlingException",
    "TooManyRequestsException",
    "TransactionInProgressException"
  ];
  var TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
  var TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
  var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];
  var NODEJS_NETWORK_ERROR_CODES = ["EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "EAI_AGAIN"];
  var isRetryableByTrait = (error) => error?.$retryable !== undefined;
  var isClockSkewError = (error) => CLOCK_SKEW_ERROR_CODES.includes(error.name);
  var isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
  var isBrowserNetworkError = (error) => {
    const errorMessages = new Set([
      "Failed to fetch",
      "NetworkError when attempting to fetch resource",
      "The Internet connection appears to be offline",
      "Load failed",
      "Network request failed"
    ]);
    const isValid = error && error instanceof TypeError;
    if (!isValid) {
      return false;
    }
    return errorMessages.has(error.message);
  };
  var isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
  var isTransientError = (error, depth = 0) => isRetryableByTrait(error) || isClockSkewCorrectedError(error) || error.name === "InvalidSignatureException" && error.message?.includes("Signature expired") || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || isNodeJsHttp2TransientError(error) || error.cause !== undefined && depth <= 10 && isTransientError(error.cause, depth + 1);
  var isServerError = (error) => {
    if (error.$metadata?.httpStatusCode !== undefined) {
      const statusCode = error.$metadata.httpStatusCode;
      if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
        return true;
      }
      return false;
    }
    return false;
  };
  function isNodeJsHttp2TransientError(error) {
    return error.code === "ERR_HTTP2_STREAM_ERROR" && error.message.includes("NGHTTP2_REFUSED_STREAM");
  }
  var DEFAULT_RETRY_DELAY_BASE = 100;
  var MAXIMUM_RETRY_DELAY = 20 * 1000;
  var THROTTLING_RETRY_DELAY_BASE = 500;
  var INITIAL_RETRY_TOKENS = 500;
  var RETRY_COST = 5;
  var TIMEOUT_RETRY_COST = 10;
  var NO_RETRY_INCREMENT = 1;
  var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
  var REQUEST_HEADER = "amz-sdk-request";
  function parseRetryAfterHeader(response, logger) {
    if (!HttpResponse.isInstance(response)) {
      return;
    }
    for (const header of Object.keys(response.headers)) {
      const h = header.toLowerCase();
      if (h === "retry-after") {
        const retryAfter = response.headers[header];
        let retryAfterSeconds = NaN;
        if (retryAfter.endsWith("GMT")) {
          try {
            const date = parseRfc7231DateTime(retryAfter);
            retryAfterSeconds = (date.getTime() - Date.now()) / 1000;
          } catch (e) {
            logger?.trace?.("Failed to parse retry-after header");
            logger?.trace?.(e);
          }
        } else if (retryAfter.match(/ GMT, ((\d+)|(\d+\.\d+))$/)) {
          retryAfterSeconds = Number(retryAfter.match(/ GMT, ([\d.]+)$/)?.[1]);
        } else if (retryAfter.match(/^((\d+)|(\d+\.\d+))$/)) {
          retryAfterSeconds = Number(retryAfter);
        } else if (Date.parse(retryAfter) >= Date.now()) {
          retryAfterSeconds = (Date.parse(retryAfter) - Date.now()) / 1000;
        }
        if (isNaN(retryAfterSeconds)) {
          return;
        }
        return new Date(Date.now() + retryAfterSeconds * 1000);
      } else if (h === "x-amz-retry-after") {
        const v = response.headers[header];
        const backoffMilliseconds = Number(v);
        if (isNaN(backoffMilliseconds)) {
          logger?.trace?.(`Failed to parse x-amz-retry-after=${v}`);
          return;
        }
        return new Date(Date.now() + backoffMilliseconds);
      }
    }
  }
  function getRetryAfterHint(response, logger) {
    return parseRetryAfterHeader(response, logger);
  }
  var asSdkError = (error) => {
    if (error instanceof Error)
      return error;
    if (error instanceof Object)
      return Object.assign(new Error, error);
    if (typeof error === "string")
      return new Error(error);
    return new Error(`AWS SDK error wrapper for ${error}`);
  };
  function bindRetryMiddleware(isStreamingPayload2) {
    return (options) => (next, context) => async (args) => {
      let retryStrategy = await options.retryStrategy();
      const maxAttempts = await options.maxAttempts();
      if (isRetryStrategyV2(retryStrategy)) {
        retryStrategy = retryStrategy;
        let retryToken = await retryStrategy.acquireInitialRetryToken((context["partition_id"] ?? "") + (context.__retryLongPoll ? ":longpoll" : ""));
        let lastError = new Error;
        let attempts = 0;
        let totalRetryDelay = 0;
        const { request } = args;
        const isRequest = HttpRequest.isInstance(request);
        if (isRequest) {
          request.headers[INVOCATION_ID_HEADER] = v4();
        }
        while (true) {
          try {
            if (isRequest) {
              request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
            }
            const { response, output } = await next(args);
            retryStrategy.recordSuccess(retryToken);
            output.$metadata.attempts = attempts + 1;
            output.$metadata.totalRetryDelay = totalRetryDelay;
            return { response, output };
          } catch (e) {
            const retryErrorInfo = getRetryErrorInfo(e, options.logger);
            lastError = asSdkError(e);
            if (isRequest && isStreamingPayload2(request)) {
              (context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
              throw lastError;
            }
            try {
              retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
            } catch (refreshError) {
              if (!lastError.$metadata) {
                lastError.$metadata = {};
              }
              lastError.$metadata.attempts = attempts + 1;
              lastError.$metadata.totalRetryDelay = totalRetryDelay;
              throw lastError;
            }
            attempts = retryToken.getRetryCount();
            const delay = retryToken.getRetryDelay();
            totalRetryDelay += (retryToken?.$retryLog?.acquisitionDelay ?? 0) + delay;
            if (delay > 0) {
              await cooldown(delay);
            }
          }
        }
      } else {
        retryStrategy = retryStrategy;
        if (retryStrategy?.mode) {
          context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
        }
        return retryStrategy.retry(next, args);
      }
    };
  }
  var cooldown = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
  var getRetryErrorInfo = (error, logger) => {
    const errorInfo = {
      error,
      errorType: getRetryErrorType(error)
    };
    const retryAfterHint = parseRetryAfterHeader(error.$response, logger);
    if (retryAfterHint) {
      errorInfo.retryAfterHint = retryAfterHint;
    }
    return errorInfo;
  };
  var getRetryErrorType = (error) => {
    if (isThrottlingError(error))
      return "THROTTLING";
    if (isTransientError(error))
      return "TRANSIENT";
    if (isServerError(error))
      return "SERVER_ERROR";
    return "CLIENT_ERROR";
  };
  var retryMiddlewareOptions = {
    name: "retryMiddleware",
    tags: ["RETRY"],
    step: "finalizeRequest",
    priority: "high",
    override: true
  };
  function bindGetRetryPlugin(isStreamingPayload2) {
    const retryMiddleware2 = bindRetryMiddleware(isStreamingPayload2);
    return (options) => ({
      applyToStack: (clientStack) => {
        clientStack.add(retryMiddleware2(options), retryMiddlewareOptions);
      }
    });
  }

  class DefaultRateLimiter {
    static setTimeoutFn = (fn, delay) => setTimeout(fn, delay);
    beta;
    minCapacity;
    minFillRate;
    scaleConstant;
    smooth;
    enabled = false;
    availableTokens = 0;
    lastMaxRate = 0;
    measuredTxRate = 0;
    requestCount = 0;
    fillRate;
    lastThrottleTime;
    lastTimestamp = 0;
    lastTxRateBucket;
    maxCapacity;
    timeWindow = 0;
    constructor(options) {
      this.beta = options?.beta ?? 0.7;
      this.minCapacity = options?.minCapacity ?? 1;
      this.minFillRate = options?.minFillRate ?? 0.5;
      this.scaleConstant = options?.scaleConstant ?? 0.4;
      this.smooth = options?.smooth ?? 0.8;
      this.lastThrottleTime = this.getCurrentTimeInSeconds();
      this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
      this.fillRate = this.minFillRate;
      this.maxCapacity = this.minCapacity;
    }
    async getSendToken() {
      return this.acquireTokenBucket(1);
    }
    updateClientSendingRate(response) {
      let calculatedRate;
      this.updateMeasuredRate();
      const retryErrorInfo = response;
      const isThrottling = retryErrorInfo?.errorType === "THROTTLING" || isThrottlingError(retryErrorInfo?.error ?? response);
      if (isThrottling) {
        const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
        this.lastMaxRate = rateToUse;
        this.calculateTimeWindow();
        this.lastThrottleTime = this.getCurrentTimeInSeconds();
        calculatedRate = this.cubicThrottle(rateToUse);
        this.enableTokenBucket();
      } else {
        this.calculateTimeWindow();
        calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
      }
      const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
      this.updateTokenBucketRate(newRate);
    }
    getCurrentTimeInSeconds() {
      return Date.now() / 1000;
    }
    async acquireTokenBucket(amount) {
      if (!this.enabled) {
        return;
      }
      this.refillTokenBucket();
      while (amount > this.availableTokens) {
        const delay = (amount - this.availableTokens) / this.fillRate * 1000;
        await new Promise((resolve) => DefaultRateLimiter.setTimeoutFn(resolve, delay));
        this.refillTokenBucket();
      }
      this.availableTokens = this.availableTokens - amount;
    }
    refillTokenBucket() {
      const timestamp = this.getCurrentTimeInSeconds();
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
        return;
      }
      const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
      this.availableTokens = Math.min(this.maxCapacity, this.availableTokens + fillAmount);
      this.lastTimestamp = timestamp;
    }
    calculateTimeWindow() {
      this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
    }
    cubicThrottle(rateToUse) {
      return this.getPrecise(rateToUse * this.beta);
    }
    cubicSuccess(timestamp) {
      return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
    }
    enableTokenBucket() {
      this.enabled = true;
    }
    updateTokenBucketRate(newRate) {
      this.refillTokenBucket();
      this.fillRate = Math.max(newRate, this.minFillRate);
      this.maxCapacity = Math.max(newRate, this.minCapacity);
      this.availableTokens = Math.min(this.availableTokens, this.maxCapacity);
    }
    updateMeasuredRate() {
      const t = this.getCurrentTimeInSeconds();
      const timeBucket = Math.floor(t * 2) / 2;
      this.requestCount++;
      if (timeBucket > this.lastTxRateBucket) {
        const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
        this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
        this.requestCount = 0;
        this.lastTxRateBucket = timeBucket;
      }
    }
    getPrecise(num) {
      return parseFloat(num.toFixed(8));
    }
  }

  class Retry {
    static v2026 = typeof process !== "undefined" && process.env?.SMITHY_NEW_RETRIES_2026 === "true";
    static delay() {
      return Retry.v2026 ? 50 : 100;
    }
    static throttlingDelay() {
      return Retry.v2026 ? 1000 : 500;
    }
    static cost() {
      return Retry.v2026 ? 14 : 5;
    }
    static throttlingCost() {
      return Retry.v2026 ? 5 : 10;
    }
    static modifiedCostType() {
      return Retry.v2026 ? "THROTTLING" : "TRANSIENT";
    }
  }

  class DefaultRetryBackoffStrategy {
    x = Retry.delay();
    computeNextBackoffDelay(i) {
      const b = Math.random();
      const r = 2;
      const t_i = b * Math.min(this.x * r ** i, MAXIMUM_RETRY_DELAY);
      return Math.floor(t_i);
    }
    setDelayBase(delay) {
      this.x = delay;
    }
  }

  class DefaultRetryToken {
    delay;
    count;
    cost;
    longPoll;
    $retryLog = {
      acquisitionDelay: 0
    };
    constructor(delay, count, cost, longPoll) {
      this.delay = delay;
      this.count = count;
      this.cost = cost;
      this.longPoll = longPoll;
    }
    getRetryCount() {
      return this.count;
    }
    getRetryDelay() {
      return Math.min(MAXIMUM_RETRY_DELAY, this.delay);
    }
    getRetryCost() {
      return this.cost;
    }
    isLongPoll() {
      return this.longPoll;
    }
  }
  var RETRY_MODES;
  (function(RETRY_MODES2) {
    RETRY_MODES2["STANDARD"] = "standard";
    RETRY_MODES2["ADAPTIVE"] = "adaptive";
  })(RETRY_MODES || (RETRY_MODES = {}));
  var DEFAULT_MAX_ATTEMPTS = 3;
  var DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;
  var refusal = {
    incompatible: 1,
    attempts: 2,
    capacity: 3
  };
  var StandardRetryStrategy$1 = class StandardRetryStrategy2 {
    mode = RETRY_MODES.STANDARD;
    retryBackoffStrategy;
    capacity = INITIAL_RETRY_TOKENS;
    maxAttemptsProvider;
    baseDelay;
    constructor(arg1) {
      if (typeof arg1 === "number") {
        this.maxAttemptsProvider = async () => arg1;
      } else if (typeof arg1 === "function") {
        this.maxAttemptsProvider = arg1;
      } else if (arg1 && typeof arg1 === "object") {
        this.maxAttemptsProvider = async () => arg1.maxAttempts;
        this.baseDelay = arg1.baseDelay;
        this.retryBackoffStrategy = arg1.backoff;
      }
      this.maxAttemptsProvider ??= async () => DEFAULT_MAX_ATTEMPTS;
      this.baseDelay ??= Retry.delay();
      this.retryBackoffStrategy ??= new DefaultRetryBackoffStrategy;
    }
    async acquireInitialRetryToken(retryTokenScope) {
      return new DefaultRetryToken(Retry.delay(), 0, undefined, Retry.v2026 && retryTokenScope.includes(":longpoll"));
    }
    async refreshRetryTokenForRetry(token, errorInfo) {
      const maxAttempts = await this.getMaxAttempts();
      const retryCode = this.retryCode(token, errorInfo, maxAttempts);
      const shouldRetry = retryCode === 0;
      const isLongPoll = token.isLongPoll?.();
      if (shouldRetry || isLongPoll) {
        const errorType = errorInfo.errorType;
        this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? Retry.throttlingDelay() : this.baseDelay);
        const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
        let retryDelay = delayFromErrorType;
        if (errorInfo.retryAfterHint instanceof Date) {
          retryDelay = Math.max(delayFromErrorType, Math.min(errorInfo.retryAfterHint.getTime() - Date.now(), delayFromErrorType + 5000));
        }
        if (!shouldRetry) {
          const longPollBackoff = Retry.v2026 && retryCode === refusal.capacity && isLongPoll ? retryDelay : 0;
          if (longPollBackoff > 0) {
            await new Promise((r) => setTimeout(r, longPollBackoff));
          }
        } else {
          const capacityCost = this.getCapacityCost(errorType);
          this.capacity -= capacityCost;
          const nextToken = new DefaultRetryToken(0, token.getRetryCount() + 1, capacityCost, token.isLongPoll?.() ?? false);
          await new Promise((r) => setTimeout(r, retryDelay));
          nextToken.$retryLog.acquisitionDelay = retryDelay;
          return nextToken;
        }
      }
      throw new Error("No retry token available");
    }
    recordSuccess(token) {
      this.capacity = Math.min(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
    }
    getCapacity() {
      return this.capacity;
    }
    async maxAttempts() {
      return this.maxAttemptsProvider();
    }
    async getMaxAttempts() {
      try {
        return await this.maxAttemptsProvider();
      } catch (error) {
        console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
        return DEFAULT_MAX_ATTEMPTS;
      }
    }
    retryCode(tokenToRenew, errorInfo, maxAttempts) {
      const attempts = tokenToRenew.getRetryCount() + 1;
      const retryableStatus = this.isRetryableError(errorInfo.errorType) ? 0 : refusal.incompatible;
      const attemptStatus = attempts < maxAttempts ? 0 : refusal.attempts;
      const capacityStatus = this.capacity >= this.getCapacityCost(errorInfo.errorType) ? 0 : refusal.capacity;
      return retryableStatus || attemptStatus || capacityStatus;
    }
    getCapacityCost(errorType) {
      return errorType === Retry.modifiedCostType() ? Retry.throttlingCost() : Retry.cost();
    }
    isRetryableError(errorType) {
      return errorType === "THROTTLING" || errorType === "TRANSIENT";
    }
  };
  var AdaptiveRetryStrategy$1 = class AdaptiveRetryStrategy2 {
    mode = RETRY_MODES.ADAPTIVE;
    rateLimiter;
    standardRetryStrategy;
    constructor(maxAttemptsProvider, options) {
      const { rateLimiter } = options ?? {};
      this.rateLimiter = rateLimiter ?? new DefaultRateLimiter;
      this.standardRetryStrategy = options ? new StandardRetryStrategy$1({
        maxAttempts: typeof maxAttemptsProvider === "number" ? maxAttemptsProvider : 3,
        ...options
      }) : new StandardRetryStrategy$1(maxAttemptsProvider);
    }
    async acquireInitialRetryToken(retryTokenScope) {
      const token = await this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
      await this.rateLimiter.getSendToken();
      return token;
    }
    async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
      this.rateLimiter.updateClientSendingRate(errorInfo);
      const token = await this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
      await this.rateLimiter.getSendToken();
      return token;
    }
    recordSuccess(token) {
      this.rateLimiter.updateClientSendingRate({});
      this.standardRetryStrategy.recordSuccess(token);
    }
    async maxAttemptsProvider() {
      return this.standardRetryStrategy.maxAttempts();
    }
  };

  class ConfiguredRetryStrategy extends StandardRetryStrategy$1 {
    computeNextBackoffDelay;
    constructor(maxAttempts, computeNextBackoffDelay = Retry.delay()) {
      super(typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts);
      if (typeof computeNextBackoffDelay === "number") {
        this.computeNextBackoffDelay = () => computeNextBackoffDelay;
      } else {
        this.computeNextBackoffDelay = computeNextBackoffDelay;
      }
      this.retryBackoffStrategy.computeNextBackoffDelay = (completedAttempt) => {
        const nextAttempt = completedAttempt + 1;
        return this.computeNextBackoffDelay(nextAttempt);
      };
    }
  }
  var getDefaultRetryQuota = (initialRetryTokens, options) => {
    const MAX_CAPACITY = initialRetryTokens;
    const noRetryIncrement = NO_RETRY_INCREMENT;
    const retryCost = RETRY_COST;
    const timeoutRetryCost = TIMEOUT_RETRY_COST;
    let availableCapacity = initialRetryTokens;
    const getCapacityAmount = (error) => error.name === "TimeoutError" ? timeoutRetryCost : retryCost;
    const hasRetryTokens = (error) => getCapacityAmount(error) <= availableCapacity;
    const retrieveRetryTokens = (error) => {
      if (!hasRetryTokens(error)) {
        throw new Error("No retry token available");
      }
      const capacityAmount = getCapacityAmount(error);
      availableCapacity -= capacityAmount;
      return capacityAmount;
    };
    const releaseRetryTokens = (capacityReleaseAmount) => {
      availableCapacity += capacityReleaseAmount ?? noRetryIncrement;
      availableCapacity = Math.min(availableCapacity, MAX_CAPACITY);
    };
    return Object.freeze({
      hasRetryTokens,
      retrieveRetryTokens,
      releaseRetryTokens
    });
  };
  var defaultDelayDecider = (delayBase, attempts) => Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
  var defaultRetryDecider = (error) => {
    if (!error) {
      return false;
    }
    return isRetryableByTrait(error) || isClockSkewError(error) || isThrottlingError(error) || isTransientError(error);
  };

  class StandardRetryStrategy {
    maxAttemptsProvider;
    retryDecider;
    delayDecider;
    retryQuota;
    mode = RETRY_MODES.STANDARD;
    constructor(maxAttemptsProvider, options) {
      this.maxAttemptsProvider = maxAttemptsProvider;
      this.retryDecider = options?.retryDecider ?? defaultRetryDecider;
      this.delayDecider = options?.delayDecider ?? defaultDelayDecider;
      this.retryQuota = options?.retryQuota ?? getDefaultRetryQuota(INITIAL_RETRY_TOKENS);
    }
    shouldRetry(error, attempts, maxAttempts) {
      return attempts < maxAttempts && this.retryDecider(error) && this.retryQuota.hasRetryTokens(error);
    }
    async getMaxAttempts() {
      let maxAttempts;
      try {
        maxAttempts = await this.maxAttemptsProvider();
      } catch (error) {
        maxAttempts = DEFAULT_MAX_ATTEMPTS;
      }
      return maxAttempts;
    }
    async retry(next, args, options) {
      let retryTokenAmount;
      let attempts = 0;
      let totalDelay = 0;
      const maxAttempts = await this.getMaxAttempts();
      const { request } = args;
      if (HttpRequest.isInstance(request)) {
        request.headers[INVOCATION_ID_HEADER] = v4();
      }
      while (true) {
        try {
          if (HttpRequest.isInstance(request)) {
            request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
          }
          if (options?.beforeRequest) {
            await options.beforeRequest();
          }
          const { response, output } = await next(args);
          if (options?.afterRequest) {
            options.afterRequest(response);
          }
          this.retryQuota.releaseRetryTokens(retryTokenAmount);
          output.$metadata.attempts = attempts + 1;
          output.$metadata.totalRetryDelay = totalDelay;
          return { response, output };
        } catch (e) {
          const err = asSdkError(e);
          attempts++;
          if (this.shouldRetry(err, attempts, maxAttempts)) {
            retryTokenAmount = this.retryQuota.retrieveRetryTokens(err);
            const delayFromDecider = this.delayDecider(isThrottlingError(err) ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE, attempts);
            const delayFromResponse = getDelayFromRetryAfterHeader(err.$response);
            const delay = Math.max(delayFromResponse || 0, delayFromDecider);
            totalDelay += delay;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          if (!err.$metadata) {
            err.$metadata = {};
          }
          err.$metadata.attempts = attempts;
          err.$metadata.totalRetryDelay = totalDelay;
          throw err;
        }
      }
    }
  }
  var getDelayFromRetryAfterHeader = (response) => {
    if (!HttpResponse.isInstance(response))
      return;
    const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
    if (!retryAfterHeaderName)
      return;
    const retryAfter = response.headers[retryAfterHeaderName];
    const retryAfterSeconds = Number(retryAfter);
    if (!Number.isNaN(retryAfterSeconds))
      return Math.min(retryAfterSeconds * 1000, 20000);
    const retryAfterDate = new Date(retryAfter);
    return Math.min(retryAfterDate.getTime() - Date.now(), 20000);
  };

  class AdaptiveRetryStrategy extends StandardRetryStrategy {
    rateLimiter;
    constructor(maxAttemptsProvider, options) {
      const { rateLimiter, ...superOptions } = options ?? {};
      super(maxAttemptsProvider, superOptions);
      this.rateLimiter = rateLimiter ?? new DefaultRateLimiter;
      this.mode = RETRY_MODES.ADAPTIVE;
    }
    async retry(next, args) {
      return super.retry(next, args, {
        beforeRequest: async () => {
          return this.rateLimiter.getSendToken();
        },
        afterRequest: (response) => {
          this.rateLimiter.updateClientSendingRate(response);
        }
      });
    }
  }
  var ENV_MAX_ATTEMPTS = "AWS_MAX_ATTEMPTS";
  var CONFIG_MAX_ATTEMPTS = "max_attempts";
  var NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => {
      const value = env[ENV_MAX_ATTEMPTS];
      if (!value)
        return;
      const maxAttempt = parseInt(value);
      if (Number.isNaN(maxAttempt)) {
        throw new Error(`Environment variable ${ENV_MAX_ATTEMPTS} mast be a number, got "${value}"`);
      }
      return maxAttempt;
    },
    configFileSelector: (profile) => {
      const value = profile[CONFIG_MAX_ATTEMPTS];
      if (!value)
        return;
      const maxAttempt = parseInt(value);
      if (Number.isNaN(maxAttempt)) {
        throw new Error(`Shared config file entry ${CONFIG_MAX_ATTEMPTS} mast be a number, got "${value}"`);
      }
      return maxAttempt;
    },
    default: DEFAULT_MAX_ATTEMPTS
  };
  var resolveRetryConfig = (input, defaults) => {
    const { retryStrategy, retryMode } = input;
    const { defaultMaxAttempts = DEFAULT_MAX_ATTEMPTS, defaultBaseDelay = Retry.delay() } = defaults ?? {};
    const maxAttemptsProvider = normalizeProvider(input.maxAttempts ?? defaultMaxAttempts);
    let controller = retryStrategy ? Promise.resolve(retryStrategy) : undefined;
    const getDefault = async () => {
      const maxAttempts = await maxAttemptsProvider();
      const adaptive = await normalizeProvider(retryMode)() === RETRY_MODES.ADAPTIVE;
      if (adaptive) {
        return new AdaptiveRetryStrategy$1(maxAttemptsProvider, {
          maxAttempts,
          baseDelay: defaultBaseDelay
        });
      }
      return new StandardRetryStrategy$1({
        maxAttempts,
        baseDelay: defaultBaseDelay
      });
    };
    return Object.assign(input, {
      maxAttempts: maxAttemptsProvider,
      retryStrategy: () => controller ??= getDefault()
    });
  };
  var ENV_RETRY_MODE = "AWS_RETRY_MODE";
  var CONFIG_RETRY_MODE = "retry_mode";
  var NODE_RETRY_MODE_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => env[ENV_RETRY_MODE],
    configFileSelector: (profile) => profile[CONFIG_RETRY_MODE],
    default: DEFAULT_RETRY_MODE
  };
  var omitRetryHeadersMiddleware = () => (next) => async (args) => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      delete request.headers[INVOCATION_ID_HEADER];
      delete request.headers[REQUEST_HEADER];
    }
    return next(args);
  };
  var omitRetryHeadersMiddlewareOptions = {
    name: "omitRetryHeadersMiddleware",
    tags: ["RETRY", "HEADERS", "OMIT_RETRY_HEADERS"],
    relation: "before",
    toMiddleware: "awsAuthMiddleware",
    override: true
  };
  var getOmitRetryHeadersPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(omitRetryHeadersMiddleware(), omitRetryHeadersMiddlewareOptions);
    }
  });
  var retryMiddleware = bindRetryMiddleware(isStreamingPayload);
  var getRetryPlugin = bindGetRetryPlugin(isStreamingPayload);
  exports.AdaptiveRetryStrategy = AdaptiveRetryStrategy$1;
  exports.CONFIG_MAX_ATTEMPTS = CONFIG_MAX_ATTEMPTS;
  exports.CONFIG_RETRY_MODE = CONFIG_RETRY_MODE;
  exports.ConfiguredRetryStrategy = ConfiguredRetryStrategy;
  exports.DEFAULT_MAX_ATTEMPTS = DEFAULT_MAX_ATTEMPTS;
  exports.DEFAULT_RETRY_DELAY_BASE = DEFAULT_RETRY_DELAY_BASE;
  exports.DEFAULT_RETRY_MODE = DEFAULT_RETRY_MODE;
  exports.DefaultRateLimiter = DefaultRateLimiter;
  exports.DeprecatedAdaptiveRetryStrategy = AdaptiveRetryStrategy;
  exports.DeprecatedStandardRetryStrategy = StandardRetryStrategy;
  exports.ENV_MAX_ATTEMPTS = ENV_MAX_ATTEMPTS;
  exports.ENV_RETRY_MODE = ENV_RETRY_MODE;
  exports.INITIAL_RETRY_TOKENS = INITIAL_RETRY_TOKENS;
  exports.INVOCATION_ID_HEADER = INVOCATION_ID_HEADER;
  exports.MAXIMUM_RETRY_DELAY = MAXIMUM_RETRY_DELAY;
  exports.NODE_MAX_ATTEMPT_CONFIG_OPTIONS = NODE_MAX_ATTEMPT_CONFIG_OPTIONS;
  exports.NODE_RETRY_MODE_CONFIG_OPTIONS = NODE_RETRY_MODE_CONFIG_OPTIONS;
  exports.NO_RETRY_INCREMENT = NO_RETRY_INCREMENT;
  exports.REQUEST_HEADER = REQUEST_HEADER;
  exports.RETRY_COST = RETRY_COST;
  exports.RETRY_MODES = RETRY_MODES;
  exports.Retry = Retry;
  exports.StandardRetryStrategy = StandardRetryStrategy$1;
  exports.THROTTLING_RETRY_DELAY_BASE = THROTTLING_RETRY_DELAY_BASE;
  exports.TIMEOUT_RETRY_COST = TIMEOUT_RETRY_COST;
  exports.defaultDelayDecider = defaultDelayDecider;
  exports.defaultRetryDecider = defaultRetryDecider;
  exports.getOmitRetryHeadersPlugin = getOmitRetryHeadersPlugin;
  exports.getRetryAfterHint = getRetryAfterHint;
  exports.getRetryPlugin = getRetryPlugin;
  exports.isBrowserNetworkError = isBrowserNetworkError;
  exports.isClockSkewCorrectedError = isClockSkewCorrectedError;
  exports.isClockSkewError = isClockSkewError;
  exports.isNodeJsHttp2TransientError = isNodeJsHttp2TransientError;
  exports.isRetryableByTrait = isRetryableByTrait;
  exports.isServerError = isServerError;
  exports.isThrottlingError = isThrottlingError;
  exports.isTransientError = isTransientError;
  exports.omitRetryHeadersMiddleware = omitRetryHeadersMiddleware;
  exports.omitRetryHeadersMiddlewareOptions = omitRetryHeadersMiddlewareOptions;
  exports.resolveRetryConfig = resolveRetryConfig;
  exports.retryMiddleware = retryMiddleware;
  exports.retryMiddlewareOptions = retryMiddlewareOptions;
});

// ../../node_modules/.bun/@aws+lambda-invoke-store@0.2.4/node_modules/@aws/lambda-invoke-store/dist-cjs/invoke-store.js
var require_invoke_store = __commonJS((exports) => {
  var PROTECTED_KEYS = {
    REQUEST_ID: Symbol.for("_AWS_LAMBDA_REQUEST_ID"),
    X_RAY_TRACE_ID: Symbol.for("_AWS_LAMBDA_X_RAY_TRACE_ID"),
    TENANT_ID: Symbol.for("_AWS_LAMBDA_TENANT_ID")
  };
  var NO_GLOBAL_AWS_LAMBDA = ["true", "1"].includes(process.env?.AWS_LAMBDA_NODEJS_NO_GLOBAL_AWSLAMBDA ?? "");
  if (!NO_GLOBAL_AWS_LAMBDA) {
    globalThis.awslambda = globalThis.awslambda || {};
  }

  class InvokeStoreBase {
    static PROTECTED_KEYS = PROTECTED_KEYS;
    isProtectedKey(key) {
      return Object.values(PROTECTED_KEYS).includes(key);
    }
    getRequestId() {
      return this.get(PROTECTED_KEYS.REQUEST_ID) ?? "-";
    }
    getXRayTraceId() {
      return this.get(PROTECTED_KEYS.X_RAY_TRACE_ID);
    }
    getTenantId() {
      return this.get(PROTECTED_KEYS.TENANT_ID);
    }
  }

  class InvokeStoreSingle extends InvokeStoreBase {
    currentContext;
    getContext() {
      return this.currentContext;
    }
    hasContext() {
      return this.currentContext !== undefined;
    }
    get(key) {
      return this.currentContext?.[key];
    }
    set(key, value) {
      if (this.isProtectedKey(key)) {
        throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
      }
      this.currentContext = this.currentContext || {};
      this.currentContext[key] = value;
    }
    run(context, fn) {
      this.currentContext = context;
      return fn();
    }
  }

  class InvokeStoreMulti extends InvokeStoreBase {
    als;
    static async create() {
      const instance = new InvokeStoreMulti;
      const asyncHooks = await import("node:async_hooks");
      instance.als = new asyncHooks.AsyncLocalStorage;
      return instance;
    }
    getContext() {
      return this.als.getStore();
    }
    hasContext() {
      return this.als.getStore() !== undefined;
    }
    get(key) {
      return this.als.getStore()?.[key];
    }
    set(key, value) {
      if (this.isProtectedKey(key)) {
        throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
      }
      const store = this.als.getStore();
      if (!store) {
        throw new Error("No context available");
      }
      store[key] = value;
    }
    run(context, fn) {
      return this.als.run(context, fn);
    }
  }
  exports.InvokeStore = undefined;
  (function(InvokeStore) {
    let instance = null;
    async function getInstanceAsync(forceInvokeStoreMulti) {
      if (!instance) {
        instance = (async () => {
          const isMulti = forceInvokeStoreMulti === true || "AWS_LAMBDA_MAX_CONCURRENCY" in process.env;
          const newInstance = isMulti ? await InvokeStoreMulti.create() : new InvokeStoreSingle;
          if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda?.InvokeStore) {
            return globalThis.awslambda.InvokeStore;
          } else if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda) {
            globalThis.awslambda.InvokeStore = newInstance;
            return newInstance;
          } else {
            return newInstance;
          }
        })();
      }
      return instance;
    }
    InvokeStore.getInstanceAsync = getInstanceAsync;
    InvokeStore._testing = process.env.AWS_LAMBDA_BENCHMARK_MODE === "1" ? {
      reset: () => {
        instance = null;
        if (globalThis.awslambda?.InvokeStore) {
          delete globalThis.awslambda.InvokeStore;
        }
        globalThis.awslambda = { InvokeStore: undefined };
      }
    } : undefined;
  })(exports.InvokeStore || (exports.InvokeStore = {}));
  exports.InvokeStoreBase = InvokeStoreBase;
});

// ../../node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/index.js
var require_dist_cjs3 = __commonJS((exports) => {
  var { getSmithyContext } = require_transport();
  exports.getSmithyContext = getSmithyContext;
  var { HttpRequest } = require_protocols();
  var { requestBuilder } = require_protocols();
  exports.requestBuilder = requestBuilder;
  var { HttpApiKeyAuthLocation } = require_dist_cjs();
  var resolveAuthOptions = (candidateAuthOptions, authSchemePreference) => {
    if (!authSchemePreference || authSchemePreference.length === 0) {
      return candidateAuthOptions;
    }
    const preferredAuthOptions = [];
    for (const preferredSchemeName of authSchemePreference) {
      for (const candidateAuthOption of candidateAuthOptions) {
        const candidateAuthSchemeName = candidateAuthOption.schemeId.split("#")[1];
        if (candidateAuthSchemeName === preferredSchemeName) {
          preferredAuthOptions.push(candidateAuthOption);
        }
      }
    }
    for (const candidateAuthOption of candidateAuthOptions) {
      if (!preferredAuthOptions.find(({ schemeId }) => schemeId === candidateAuthOption.schemeId)) {
        preferredAuthOptions.push(candidateAuthOption);
      }
    }
    return preferredAuthOptions;
  };
  function convertHttpAuthSchemesToMap(httpAuthSchemes) {
    const map = new Map;
    for (const scheme of httpAuthSchemes) {
      map.set(scheme.schemeId, scheme);
    }
    return map;
  }
  var httpAuthSchemeMiddleware = (config, mwOptions) => (next, context) => async (args) => {
    const options = config.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
    const authSchemePreference = config.authSchemePreference ? await config.authSchemePreference() : [];
    const resolvedOptions = resolveAuthOptions(options, authSchemePreference);
    const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
    const smithyContext = getSmithyContext(context);
    const failureReasons = [];
    for (const option of resolvedOptions) {
      const scheme = authSchemes.get(option.schemeId);
      if (!scheme) {
        failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
        continue;
      }
      const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
      if (!identityProvider) {
        failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
        continue;
      }
      const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
      option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
      option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
      smithyContext.selectedHttpAuthScheme = {
        httpAuthOption: option,
        identity: await identityProvider(option.identityProperties),
        signer: scheme.signer
      };
      break;
    }
    if (!smithyContext.selectedHttpAuthScheme) {
      throw new Error(failureReasons.join(`
`));
    }
    return next(args);
  };
  var httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
    step: "serialize",
    tags: ["HTTP_AUTH_SCHEME"],
    name: "httpAuthSchemeMiddleware",
    override: true,
    relation: "before",
    toMiddleware: "endpointV2Middleware"
  };
  var getHttpAuthSchemeEndpointRuleSetPlugin = (config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
        httpAuthSchemeParametersProvider,
        identityProviderConfigProvider
      }), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
    }
  });
  var httpAuthSchemeMiddlewareOptions = {
    step: "serialize",
    tags: ["HTTP_AUTH_SCHEME"],
    name: "httpAuthSchemeMiddleware",
    override: true,
    relation: "before",
    toMiddleware: "serializerMiddleware"
  };
  var getHttpAuthSchemePlugin = (config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
        httpAuthSchemeParametersProvider,
        identityProviderConfigProvider
      }), httpAuthSchemeMiddlewareOptions);
    }
  });
  var defaultErrorHandler = (signingProperties) => (error) => {
    throw error;
  };
  var defaultSuccessHandler = (httpResponse, signingProperties) => {};
  var httpSigningMiddleware = (config) => (next, context) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) {
      return next(args);
    }
    const smithyContext = getSmithyContext(context);
    const scheme = smithyContext.selectedHttpAuthScheme;
    if (!scheme) {
      throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
    }
    const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
    const output = await next({
      ...args,
      request: await signer.sign(args.request, identity, signingProperties)
    }).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
    (signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
    return output;
  };
  var httpSigningMiddlewareOptions = {
    step: "finalizeRequest",
    tags: ["HTTP_SIGNING"],
    name: "httpSigningMiddleware",
    aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
    override: true,
    relation: "after",
    toMiddleware: "retryMiddleware"
  };
  var getHttpSigningPlugin = (config) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(httpSigningMiddleware(), httpSigningMiddlewareOptions);
    }
  });
  var normalizeProvider = (input) => {
    if (typeof input === "function")
      return input;
    const promisified = Promise.resolve(input);
    return () => promisified;
  };
  var makePagedClientRequest = async (CommandCtor, client, input, withCommand = (_) => _, ...args) => {
    let command = new CommandCtor(input);
    command = withCommand(command) ?? command;
    return await client.send(command, ...args);
  };
  function createPaginator(ClientCtor, CommandCtor, inputTokenName, outputTokenName, pageSizeTokenName) {
    return async function* paginateOperation(config, input, ...additionalArguments) {
      const _input = input;
      let token = config.startingToken ?? _input[inputTokenName];
      let hasNext = true;
      let page;
      while (hasNext) {
        _input[inputTokenName] = token;
        if (pageSizeTokenName) {
          _input[pageSizeTokenName] = _input[pageSizeTokenName] ?? config.pageSize;
        }
        if (config.client instanceof ClientCtor) {
          page = await makePagedClientRequest(CommandCtor, config.client, input, config.withCommand, ...additionalArguments);
        } else {
          throw new Error(`Invalid client, expected instance of ${ClientCtor.name}`);
        }
        yield page;
        const prevToken = token;
        token = get(page, outputTokenName);
        hasNext = !!(token && (!config.stopOnSameToken || token !== prevToken));
      }
      return;
    };
  }
  var get = (fromObject, path) => {
    let cursor = fromObject;
    const pathComponents = path.split(".");
    for (const step of pathComponents) {
      if (!cursor || typeof cursor !== "object") {
        return;
      }
      cursor = cursor[step];
    }
    return cursor;
  };
  function setFeature(context, feature, value) {
    if (!context.__smithy_context) {
      context.__smithy_context = {
        features: {}
      };
    } else if (!context.__smithy_context.features) {
      context.__smithy_context.features = {};
    }
    context.__smithy_context.features[feature] = value;
  }

  class DefaultIdentityProviderConfig {
    authSchemes = new Map;
    constructor(config) {
      for (const key in config) {
        const value = config[key];
        if (value !== undefined) {
          this.authSchemes.set(key, value);
        }
      }
    }
    getIdentityProvider(schemeId) {
      return this.authSchemes.get(schemeId);
    }
  }

  class HttpApiKeyAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
      if (!signingProperties) {
        throw new Error("request could not be signed with `apiKey` since the `name` and `in` signer properties are missing");
      }
      if (!signingProperties.name) {
        throw new Error("request could not be signed with `apiKey` since the `name` signer property is missing");
      }
      if (!signingProperties.in) {
        throw new Error("request could not be signed with `apiKey` since the `in` signer property is missing");
      }
      if (!identity.apiKey) {
        throw new Error("request could not be signed with `apiKey` since the `apiKey` is not defined");
      }
      const clonedRequest = HttpRequest.clone(httpRequest);
      if (signingProperties.in === HttpApiKeyAuthLocation.QUERY) {
        clonedRequest.query[signingProperties.name] = identity.apiKey;
      } else if (signingProperties.in === HttpApiKeyAuthLocation.HEADER) {
        clonedRequest.headers[signingProperties.name] = signingProperties.scheme ? `${signingProperties.scheme} ${identity.apiKey}` : identity.apiKey;
      } else {
        throw new Error("request can only be signed with `apiKey` locations `query` or `header`, " + "but found: `" + signingProperties.in + "`");
      }
      return clonedRequest;
    }
  }

  class HttpBearerAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
      const clonedRequest = HttpRequest.clone(httpRequest);
      if (!identity.token) {
        throw new Error("request could not be signed with `token` since the `token` is not defined");
      }
      clonedRequest.headers["Authorization"] = `Bearer ${identity.token}`;
      return clonedRequest;
    }
  }

  class NoAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
      return httpRequest;
    }
  }
  var createIsIdentityExpiredFunction = (expirationMs) => function isIdentityExpired2(identity) {
    return doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
  };
  var EXPIRATION_MS = 300000;
  var isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
  var doesIdentityRequireRefresh = (identity) => identity.expiration !== undefined;
  var memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
    if (provider === undefined) {
      return;
    }
    const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async (options) => {
      if (!pending) {
        pending = normalizedProvider(options);
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
          resolved = await coalesceProvider(options);
        }
        return resolved;
      };
    }
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider(options);
      }
      if (isConstant) {
        return resolved;
      }
      if (!requiresRefresh(resolved)) {
        isConstant = true;
        return resolved;
      }
      if (isExpired(resolved)) {
        await coalesceProvider(options);
        return resolved;
      }
      return resolved;
    };
  };
  exports.DefaultIdentityProviderConfig = DefaultIdentityProviderConfig;
  exports.EXPIRATION_MS = EXPIRATION_MS;
  exports.HttpApiKeyAuthSigner = HttpApiKeyAuthSigner;
  exports.HttpBearerAuthSigner = HttpBearerAuthSigner;
  exports.NoAuthSigner = NoAuthSigner;
  exports.createIsIdentityExpiredFunction = createIsIdentityExpiredFunction;
  exports.createPaginator = createPaginator;
  exports.doesIdentityRequireRefresh = doesIdentityRequireRefresh;
  exports.getHttpAuthSchemeEndpointRuleSetPlugin = getHttpAuthSchemeEndpointRuleSetPlugin;
  exports.getHttpAuthSchemePlugin = getHttpAuthSchemePlugin;
  exports.getHttpSigningPlugin = getHttpSigningPlugin;
  exports.httpAuthSchemeEndpointRuleSetMiddlewareOptions = httpAuthSchemeEndpointRuleSetMiddlewareOptions;
  exports.httpAuthSchemeMiddleware = httpAuthSchemeMiddleware;
  exports.httpAuthSchemeMiddlewareOptions = httpAuthSchemeMiddlewareOptions;
  exports.httpSigningMiddleware = httpSigningMiddleware;
  exports.httpSigningMiddlewareOptions = httpSigningMiddlewareOptions;
  exports.isIdentityExpired = isIdentityExpired;
  exports.memoizeIdentityProvider = memoizeIdentityProvider;
  exports.normalizeProvider = normalizeProvider;
  exports.setFeature = setFeature;
});

// ../../node_modules/.bun/bowser@2.14.1/node_modules/bowser/es5.js
var require_es5 = __commonJS((exports, module) => {
  (function(e, t) {
    typeof exports == "object" && typeof module == "object" ? module.exports = t() : typeof define == "function" && define.amd ? define([], t) : typeof exports == "object" ? exports.bowser = t() : e.bowser = t();
  })(exports, function() {
    return function(e) {
      var t = {};
      function r(i) {
        if (t[i])
          return t[i].exports;
        var n = t[i] = { i, l: false, exports: {} };
        return e[i].call(n.exports, n, n.exports, r), n.l = true, n.exports;
      }
      return r.m = e, r.c = t, r.d = function(e2, t2, i) {
        r.o(e2, t2) || Object.defineProperty(e2, t2, { enumerable: true, get: i });
      }, r.r = function(e2) {
        typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, r.t = function(e2, t2) {
        if (1 & t2 && (e2 = r(e2)), 8 & t2)
          return e2;
        if (4 & t2 && typeof e2 == "object" && e2 && e2.__esModule)
          return e2;
        var i = Object.create(null);
        if (r.r(i), Object.defineProperty(i, "default", { enumerable: true, value: e2 }), 2 & t2 && typeof e2 != "string")
          for (var n in e2)
            r.d(i, n, function(t3) {
              return e2[t3];
            }.bind(null, n));
        return i;
      }, r.n = function(e2) {
        var t2 = e2 && e2.__esModule ? function() {
          return e2.default;
        } : function() {
          return e2;
        };
        return r.d(t2, "a", t2), t2;
      }, r.o = function(e2, t2) {
        return Object.prototype.hasOwnProperty.call(e2, t2);
      }, r.p = "", r(r.s = 90);
    }({ 17: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i = r(18), n = function() {
        function e2() {}
        return e2.getFirstMatch = function(e3, t2) {
          var r2 = t2.match(e3);
          return r2 && r2.length > 0 && r2[1] || "";
        }, e2.getSecondMatch = function(e3, t2) {
          var r2 = t2.match(e3);
          return r2 && r2.length > 1 && r2[2] || "";
        }, e2.matchAndReturnConst = function(e3, t2, r2) {
          if (e3.test(t2))
            return r2;
        }, e2.getWindowsVersionName = function(e3) {
          switch (e3) {
            case "NT":
              return "NT";
            case "XP":
              return "XP";
            case "NT 5.0":
              return "2000";
            case "NT 5.1":
              return "XP";
            case "NT 5.2":
              return "2003";
            case "NT 6.0":
              return "Vista";
            case "NT 6.1":
              return "7";
            case "NT 6.2":
              return "8";
            case "NT 6.3":
              return "8.1";
            case "NT 10.0":
              return "10";
            default:
              return;
          }
        }, e2.getMacOSVersionName = function(e3) {
          var t2 = e3.split(".").splice(0, 2).map(function(e4) {
            return parseInt(e4, 10) || 0;
          });
          t2.push(0);
          var r2 = t2[0], i2 = t2[1];
          if (r2 === 10)
            switch (i2) {
              case 5:
                return "Leopard";
              case 6:
                return "Snow Leopard";
              case 7:
                return "Lion";
              case 8:
                return "Mountain Lion";
              case 9:
                return "Mavericks";
              case 10:
                return "Yosemite";
              case 11:
                return "El Capitan";
              case 12:
                return "Sierra";
              case 13:
                return "High Sierra";
              case 14:
                return "Mojave";
              case 15:
                return "Catalina";
              default:
                return;
            }
          switch (r2) {
            case 11:
              return "Big Sur";
            case 12:
              return "Monterey";
            case 13:
              return "Ventura";
            case 14:
              return "Sonoma";
            case 15:
              return "Sequoia";
            default:
              return;
          }
        }, e2.getAndroidVersionName = function(e3) {
          var t2 = e3.split(".").splice(0, 2).map(function(e4) {
            return parseInt(e4, 10) || 0;
          });
          if (t2.push(0), !(t2[0] === 1 && t2[1] < 5))
            return t2[0] === 1 && t2[1] < 6 ? "Cupcake" : t2[0] === 1 && t2[1] >= 6 ? "Donut" : t2[0] === 2 && t2[1] < 2 ? "Eclair" : t2[0] === 2 && t2[1] === 2 ? "Froyo" : t2[0] === 2 && t2[1] > 2 ? "Gingerbread" : t2[0] === 3 ? "Honeycomb" : t2[0] === 4 && t2[1] < 1 ? "Ice Cream Sandwich" : t2[0] === 4 && t2[1] < 4 ? "Jelly Bean" : t2[0] === 4 && t2[1] >= 4 ? "KitKat" : t2[0] === 5 ? "Lollipop" : t2[0] === 6 ? "Marshmallow" : t2[0] === 7 ? "Nougat" : t2[0] === 8 ? "Oreo" : t2[0] === 9 ? "Pie" : undefined;
        }, e2.getVersionPrecision = function(e3) {
          return e3.split(".").length;
        }, e2.compareVersions = function(t2, r2, i2) {
          i2 === undefined && (i2 = false);
          var n2 = e2.getVersionPrecision(t2), a = e2.getVersionPrecision(r2), o = Math.max(n2, a), s = 0, u = e2.map([t2, r2], function(t3) {
            var r3 = o - e2.getVersionPrecision(t3), i3 = t3 + new Array(r3 + 1).join(".0");
            return e2.map(i3.split("."), function(e3) {
              return new Array(20 - e3.length).join("0") + e3;
            }).reverse();
          });
          for (i2 && (s = o - Math.min(n2, a)), o -= 1;o >= s; ) {
            if (u[0][o] > u[1][o])
              return 1;
            if (u[0][o] === u[1][o]) {
              if (o === s)
                return 0;
              o -= 1;
            } else if (u[0][o] < u[1][o])
              return -1;
          }
        }, e2.map = function(e3, t2) {
          var r2, i2 = [];
          if (Array.prototype.map)
            return Array.prototype.map.call(e3, t2);
          for (r2 = 0;r2 < e3.length; r2 += 1)
            i2.push(t2(e3[r2]));
          return i2;
        }, e2.find = function(e3, t2) {
          var r2, i2;
          if (Array.prototype.find)
            return Array.prototype.find.call(e3, t2);
          for (r2 = 0, i2 = e3.length;r2 < i2; r2 += 1) {
            var n2 = e3[r2];
            if (t2(n2, r2))
              return n2;
          }
        }, e2.assign = function(e3) {
          for (var t2, r2, i2 = e3, n2 = arguments.length, a = new Array(n2 > 1 ? n2 - 1 : 0), o = 1;o < n2; o++)
            a[o - 1] = arguments[o];
          if (Object.assign)
            return Object.assign.apply(Object, [e3].concat(a));
          var s = function() {
            var e4 = a[t2];
            typeof e4 == "object" && e4 !== null && Object.keys(e4).forEach(function(t3) {
              i2[t3] = e4[t3];
            });
          };
          for (t2 = 0, r2 = a.length;t2 < r2; t2 += 1)
            s();
          return e3;
        }, e2.getBrowserAlias = function(e3) {
          return i.BROWSER_ALIASES_MAP[e3];
        }, e2.getBrowserTypeByAlias = function(e3) {
          return i.BROWSER_MAP[e3] || "";
        }, e2;
      }();
      t.default = n, e.exports = t.default;
    }, 18: function(e, t, r) {
      t.__esModule = true, t.ENGINE_MAP = t.OS_MAP = t.PLATFORMS_MAP = t.BROWSER_MAP = t.BROWSER_ALIASES_MAP = undefined;
      t.BROWSER_ALIASES_MAP = { AmazonBot: "amazonbot", "Amazon Silk": "amazon_silk", "Android Browser": "android", BaiduSpider: "baiduspider", Bada: "bada", BingCrawler: "bingcrawler", Brave: "brave", BlackBerry: "blackberry", "ChatGPT-User": "chatgpt_user", Chrome: "chrome", ClaudeBot: "claudebot", Chromium: "chromium", Diffbot: "diffbot", DuckDuckBot: "duckduckbot", DuckDuckGo: "duckduckgo", Electron: "electron", Epiphany: "epiphany", FacebookExternalHit: "facebookexternalhit", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", GPTBot: "gptbot", "Internet Explorer": "ie", InternetArchiveCrawler: "internetarchivecrawler", "K-Meleon": "k_meleon", LibreWolf: "librewolf", Linespider: "linespider", Maxthon: "maxthon", "Meta-ExternalAds": "meta_externalads", "Meta-ExternalAgent": "meta_externalagent", "Meta-ExternalFetcher": "meta_externalfetcher", "Meta-WebIndexer": "meta_webindexer", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", "OAI-SearchBot": "oai_searchbot", Omgilibot: "omgilibot", Opera: "opera", "Opera Coast": "opera_coast", "Pale Moon": "pale_moon", PerplexityBot: "perplexitybot", "Perplexity-User": "perplexity_user", PhantomJS: "phantomjs", PingdomBot: "pingdombot", Puffin: "puffin", QQ: "qq", QQLite: "qqlite", QupZilla: "qupzilla", Roku: "roku", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SlackBot: "slackbot", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", "Sogou Browser": "sogou", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", YahooSlurp: "yahooslurp", "Yandex Browser": "yandex", YandexBot: "yandexbot", YouBot: "youbot" };
      t.BROWSER_MAP = { amazonbot: "AmazonBot", amazon_silk: "Amazon Silk", android: "Android Browser", baiduspider: "BaiduSpider", bada: "Bada", bingcrawler: "BingCrawler", blackberry: "BlackBerry", brave: "Brave", chatgpt_user: "ChatGPT-User", chrome: "Chrome", claudebot: "ClaudeBot", chromium: "Chromium", diffbot: "Diffbot", duckduckbot: "DuckDuckBot", duckduckgo: "DuckDuckGo", edge: "Microsoft Edge", electron: "Electron", epiphany: "Epiphany", facebookexternalhit: "FacebookExternalHit", firefox: "Firefox", focus: "Focus", generic: "Generic", google_search: "Google Search", googlebot: "Googlebot", gptbot: "GPTBot", ie: "Internet Explorer", internetarchivecrawler: "InternetArchiveCrawler", k_meleon: "K-Meleon", librewolf: "LibreWolf", linespider: "Linespider", maxthon: "Maxthon", meta_externalads: "Meta-ExternalAds", meta_externalagent: "Meta-ExternalAgent", meta_externalfetcher: "Meta-ExternalFetcher", meta_webindexer: "Meta-WebIndexer", mz: "MZ Browser", naver: "NAVER Whale Browser", oai_searchbot: "OAI-SearchBot", omgilibot: "Omgilibot", opera: "Opera", opera_coast: "Opera Coast", pale_moon: "Pale Moon", perplexitybot: "PerplexityBot", perplexity_user: "Perplexity-User", phantomjs: "PhantomJS", pingdombot: "PingdomBot", puffin: "Puffin", qq: "QQ Browser", qqlite: "QQ Browser Lite", qupzilla: "QupZilla", roku: "Roku", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", slackbot: "SlackBot", sleipnir: "Sleipnir", sogou: "Sogou Browser", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yahooslurp: "YahooSlurp", yandex: "Yandex Browser", yandexbot: "YandexBot", youbot: "YouBot" };
      t.PLATFORMS_MAP = { bot: "bot", desktop: "desktop", mobile: "mobile", tablet: "tablet", tv: "tv" };
      t.OS_MAP = { Android: "Android", Bada: "Bada", BlackBerry: "BlackBerry", ChromeOS: "Chrome OS", HarmonyOS: "HarmonyOS", iOS: "iOS", Linux: "Linux", MacOS: "macOS", PlayStation4: "PlayStation 4", Roku: "Roku", Tizen: "Tizen", WebOS: "WebOS", Windows: "Windows", WindowsPhone: "Windows Phone" };
      t.ENGINE_MAP = { Blink: "Blink", EdgeHTML: "EdgeHTML", Gecko: "Gecko", Presto: "Presto", Trident: "Trident", WebKit: "WebKit" };
    }, 90: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i, n = (i = r(91)) && i.__esModule ? i : { default: i }, a = r(18);
      function o(e2, t2) {
        for (var r2 = 0;r2 < t2.length; r2++) {
          var i2 = t2[r2];
          i2.enumerable = i2.enumerable || false, i2.configurable = true, "value" in i2 && (i2.writable = true), Object.defineProperty(e2, i2.key, i2);
        }
      }
      var s = function() {
        function e2() {}
        var t2, r2, i2;
        return e2.getParser = function(e3, t3, r3) {
          if (t3 === undefined && (t3 = false), r3 === undefined && (r3 = null), typeof e3 != "string")
            throw new Error("UserAgent should be a string");
          return new n.default(e3, t3, r3);
        }, e2.parse = function(e3, t3) {
          return t3 === undefined && (t3 = null), new n.default(e3, t3).getResult();
        }, t2 = e2, i2 = [{ key: "BROWSER_MAP", get: function() {
          return a.BROWSER_MAP;
        } }, { key: "ENGINE_MAP", get: function() {
          return a.ENGINE_MAP;
        } }, { key: "OS_MAP", get: function() {
          return a.OS_MAP;
        } }, { key: "PLATFORMS_MAP", get: function() {
          return a.PLATFORMS_MAP;
        } }], (r2 = null) && o(t2.prototype, r2), i2 && o(t2, i2), e2;
      }();
      t.default = s, e.exports = t.default;
    }, 91: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i = u(r(92)), n = u(r(93)), a = u(r(94)), o = u(r(95)), s = u(r(17));
      function u(e2) {
        return e2 && e2.__esModule ? e2 : { default: e2 };
      }
      var d = function() {
        function e2(e3, t3, r2) {
          if (t3 === undefined && (t3 = false), r2 === undefined && (r2 = null), e3 == null || e3 === "")
            throw new Error("UserAgent parameter can't be empty");
          this._ua = e3;
          var i2 = false;
          typeof t3 == "boolean" ? (i2 = t3, this._hints = r2) : this._hints = t3 != null && typeof t3 == "object" ? t3 : null, this.parsedResult = {}, i2 !== true && this.parse();
        }
        var t2 = e2.prototype;
        return t2.getHints = function() {
          return this._hints;
        }, t2.hasBrand = function(e3) {
          if (!this._hints || !Array.isArray(this._hints.brands))
            return false;
          var t3 = e3.toLowerCase();
          return this._hints.brands.some(function(e4) {
            return e4.brand && e4.brand.toLowerCase() === t3;
          });
        }, t2.getBrandVersion = function(e3) {
          if (this._hints && Array.isArray(this._hints.brands)) {
            var t3 = e3.toLowerCase(), r2 = this._hints.brands.find(function(e4) {
              return e4.brand && e4.brand.toLowerCase() === t3;
            });
            return r2 ? r2.version : undefined;
          }
        }, t2.getUA = function() {
          return this._ua;
        }, t2.test = function(e3) {
          return e3.test(this._ua);
        }, t2.parseBrowser = function() {
          var e3 = this;
          this.parsedResult.browser = {};
          var t3 = s.default.find(i.default, function(t4) {
            if (typeof t4.test == "function")
              return t4.test(e3);
            if (Array.isArray(t4.test))
              return t4.test.some(function(t5) {
                return e3.test(t5);
              });
            throw new Error("Browser's test function is not valid");
          });
          return t3 && (this.parsedResult.browser = t3.describe(this.getUA(), this)), this.parsedResult.browser;
        }, t2.getBrowser = function() {
          return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
        }, t2.getBrowserName = function(e3) {
          return e3 ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
        }, t2.getBrowserVersion = function() {
          return this.getBrowser().version;
        }, t2.getOS = function() {
          return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
        }, t2.parseOS = function() {
          var e3 = this;
          this.parsedResult.os = {};
          var t3 = s.default.find(n.default, function(t4) {
            if (typeof t4.test == "function")
              return t4.test(e3);
            if (Array.isArray(t4.test))
              return t4.test.some(function(t5) {
                return e3.test(t5);
              });
            throw new Error("Browser's test function is not valid");
          });
          return t3 && (this.parsedResult.os = t3.describe(this.getUA())), this.parsedResult.os;
        }, t2.getOSName = function(e3) {
          var t3 = this.getOS().name;
          return e3 ? String(t3).toLowerCase() || "" : t3 || "";
        }, t2.getOSVersion = function() {
          return this.getOS().version;
        }, t2.getPlatform = function() {
          return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
        }, t2.getPlatformType = function(e3) {
          e3 === undefined && (e3 = false);
          var t3 = this.getPlatform().type;
          return e3 ? String(t3).toLowerCase() || "" : t3 || "";
        }, t2.parsePlatform = function() {
          var e3 = this;
          this.parsedResult.platform = {};
          var t3 = s.default.find(a.default, function(t4) {
            if (typeof t4.test == "function")
              return t4.test(e3);
            if (Array.isArray(t4.test))
              return t4.test.some(function(t5) {
                return e3.test(t5);
              });
            throw new Error("Browser's test function is not valid");
          });
          return t3 && (this.parsedResult.platform = t3.describe(this.getUA())), this.parsedResult.platform;
        }, t2.getEngine = function() {
          return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
        }, t2.getEngineName = function(e3) {
          return e3 ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
        }, t2.parseEngine = function() {
          var e3 = this;
          this.parsedResult.engine = {};
          var t3 = s.default.find(o.default, function(t4) {
            if (typeof t4.test == "function")
              return t4.test(e3);
            if (Array.isArray(t4.test))
              return t4.test.some(function(t5) {
                return e3.test(t5);
              });
            throw new Error("Browser's test function is not valid");
          });
          return t3 && (this.parsedResult.engine = t3.describe(this.getUA())), this.parsedResult.engine;
        }, t2.parse = function() {
          return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
        }, t2.getResult = function() {
          return s.default.assign({}, this.parsedResult);
        }, t2.satisfies = function(e3) {
          var t3 = this, r2 = {}, i2 = 0, n2 = {}, a2 = 0;
          if (Object.keys(e3).forEach(function(t4) {
            var o3 = e3[t4];
            typeof o3 == "string" ? (n2[t4] = o3, a2 += 1) : typeof o3 == "object" && (r2[t4] = o3, i2 += 1);
          }), i2 > 0) {
            var o2 = Object.keys(r2), u2 = s.default.find(o2, function(e4) {
              return t3.isOS(e4);
            });
            if (u2) {
              var d2 = this.satisfies(r2[u2]);
              if (d2 !== undefined)
                return d2;
            }
            var c = s.default.find(o2, function(e4) {
              return t3.isPlatform(e4);
            });
            if (c) {
              var f = this.satisfies(r2[c]);
              if (f !== undefined)
                return f;
            }
          }
          if (a2 > 0) {
            var l = Object.keys(n2), b = s.default.find(l, function(e4) {
              return t3.isBrowser(e4, true);
            });
            if (b !== undefined)
              return this.compareVersion(n2[b]);
          }
        }, t2.isBrowser = function(e3, t3) {
          t3 === undefined && (t3 = false);
          var r2 = this.getBrowserName().toLowerCase(), i2 = e3.toLowerCase(), n2 = s.default.getBrowserTypeByAlias(i2);
          return t3 && n2 && (i2 = n2.toLowerCase()), i2 === r2;
        }, t2.compareVersion = function(e3) {
          var t3 = [0], r2 = e3, i2 = false, n2 = this.getBrowserVersion();
          if (typeof n2 == "string")
            return e3[0] === ">" || e3[0] === "<" ? (r2 = e3.substr(1), e3[1] === "=" ? (i2 = true, r2 = e3.substr(2)) : t3 = [], e3[0] === ">" ? t3.push(1) : t3.push(-1)) : e3[0] === "=" ? r2 = e3.substr(1) : e3[0] === "~" && (i2 = true, r2 = e3.substr(1)), t3.indexOf(s.default.compareVersions(n2, r2, i2)) > -1;
        }, t2.isOS = function(e3) {
          return this.getOSName(true) === String(e3).toLowerCase();
        }, t2.isPlatform = function(e3) {
          return this.getPlatformType(true) === String(e3).toLowerCase();
        }, t2.isEngine = function(e3) {
          return this.getEngineName(true) === String(e3).toLowerCase();
        }, t2.is = function(e3, t3) {
          return t3 === undefined && (t3 = false), this.isBrowser(e3, t3) || this.isOS(e3) || this.isPlatform(e3);
        }, t2.some = function(e3) {
          var t3 = this;
          return e3 === undefined && (e3 = []), e3.some(function(e4) {
            return t3.is(e4);
          });
        }, e2;
      }();
      t.default = d, e.exports = t.default;
    }, 92: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i, n = (i = r(17)) && i.__esModule ? i : { default: i };
      var a = /version\/(\d+(\.?_?\d+)+)/i, o = [{ test: [/gptbot/i], describe: function(e2) {
        var t2 = { name: "GPTBot" }, r2 = n.default.getFirstMatch(/gptbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/chatgpt-user/i], describe: function(e2) {
        var t2 = { name: "ChatGPT-User" }, r2 = n.default.getFirstMatch(/chatgpt-user\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/oai-searchbot/i], describe: function(e2) {
        var t2 = { name: "OAI-SearchBot" }, r2 = n.default.getFirstMatch(/oai-searchbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i], describe: function(e2) {
        var t2 = { name: "ClaudeBot" }, r2 = n.default.getFirstMatch(/(?:claudebot|claude-web|claude-user|claude-searchbot)\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/omgilibot/i, /webzio-extended/i], describe: function(e2) {
        var t2 = { name: "Omgilibot" }, r2 = n.default.getFirstMatch(/(?:omgilibot|webzio-extended)\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/diffbot/i], describe: function(e2) {
        var t2 = { name: "Diffbot" }, r2 = n.default.getFirstMatch(/diffbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/perplexitybot/i], describe: function(e2) {
        var t2 = { name: "PerplexityBot" }, r2 = n.default.getFirstMatch(/perplexitybot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/perplexity-user/i], describe: function(e2) {
        var t2 = { name: "Perplexity-User" }, r2 = n.default.getFirstMatch(/perplexity-user\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/youbot/i], describe: function(e2) {
        var t2 = { name: "YouBot" }, r2 = n.default.getFirstMatch(/youbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/meta-webindexer/i], describe: function(e2) {
        var t2 = { name: "Meta-WebIndexer" }, r2 = n.default.getFirstMatch(/meta-webindexer\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/meta-externalads/i], describe: function(e2) {
        var t2 = { name: "Meta-ExternalAds" }, r2 = n.default.getFirstMatch(/meta-externalads\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/meta-externalagent/i], describe: function(e2) {
        var t2 = { name: "Meta-ExternalAgent" }, r2 = n.default.getFirstMatch(/meta-externalagent\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/meta-externalfetcher/i], describe: function(e2) {
        var t2 = { name: "Meta-ExternalFetcher" }, r2 = n.default.getFirstMatch(/meta-externalfetcher\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/googlebot/i], describe: function(e2) {
        var t2 = { name: "Googlebot" }, r2 = n.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/linespider/i], describe: function(e2) {
        var t2 = { name: "Linespider" }, r2 = n.default.getFirstMatch(/(?:linespider)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/amazonbot/i], describe: function(e2) {
        var t2 = { name: "AmazonBot" }, r2 = n.default.getFirstMatch(/amazonbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/bingbot/i], describe: function(e2) {
        var t2 = { name: "BingCrawler" }, r2 = n.default.getFirstMatch(/bingbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/baiduspider/i], describe: function(e2) {
        var t2 = { name: "BaiduSpider" }, r2 = n.default.getFirstMatch(/baiduspider\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/duckduckbot/i], describe: function(e2) {
        var t2 = { name: "DuckDuckBot" }, r2 = n.default.getFirstMatch(/duckduckbot\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/ia_archiver/i], describe: function(e2) {
        var t2 = { name: "InternetArchiveCrawler" }, r2 = n.default.getFirstMatch(/ia_archiver\/(\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/facebookexternalhit/i, /facebookcatalog/i], describe: function() {
        return { name: "FacebookExternalHit" };
      } }, { test: [/slackbot/i, /slack-imgProxy/i], describe: function(e2) {
        var t2 = { name: "SlackBot" }, r2 = n.default.getFirstMatch(/(?:slackbot|slack-imgproxy)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/yahoo!?[\s/]*slurp/i], describe: function() {
        return { name: "YahooSlurp" };
      } }, { test: [/yandexbot/i, /yandexmobilebot/i], describe: function() {
        return { name: "YandexBot" };
      } }, { test: [/pingdom/i], describe: function() {
        return { name: "PingdomBot" };
      } }, { test: [/opera/i], describe: function(e2) {
        var t2 = { name: "Opera" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/opr\/|opios/i], describe: function(e2) {
        var t2 = { name: "Opera" }, r2 = n.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/SamsungBrowser/i], describe: function(e2) {
        var t2 = { name: "Samsung Internet for Android" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/Whale/i], describe: function(e2) {
        var t2 = { name: "NAVER Whale Browser" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/PaleMoon/i], describe: function(e2) {
        var t2 = { name: "Pale Moon" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:PaleMoon)[\s/](\d+(?:\.\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/MZBrowser/i], describe: function(e2) {
        var t2 = { name: "MZ Browser" }, r2 = n.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/focus/i], describe: function(e2) {
        var t2 = { name: "Focus" }, r2 = n.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/swing/i], describe: function(e2) {
        var t2 = { name: "Swing" }, r2 = n.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/coast/i], describe: function(e2) {
        var t2 = { name: "Opera Coast" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/opt\/\d+(?:.?_?\d+)+/i], describe: function(e2) {
        var t2 = { name: "Opera Touch" }, r2 = n.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/yabrowser/i], describe: function(e2) {
        var t2 = { name: "Yandex Browser" }, r2 = n.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/ucbrowser/i], describe: function(e2) {
        var t2 = { name: "UC Browser" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/Maxthon|mxios/i], describe: function(e2) {
        var t2 = { name: "Maxthon" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/epiphany/i], describe: function(e2) {
        var t2 = { name: "Epiphany" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/puffin/i], describe: function(e2) {
        var t2 = { name: "Puffin" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/sleipnir/i], describe: function(e2) {
        var t2 = { name: "Sleipnir" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/k-meleon/i], describe: function(e2) {
        var t2 = { name: "K-Meleon" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/micromessenger/i], describe: function(e2) {
        var t2 = { name: "WeChat" }, r2 = n.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/qqbrowser/i], describe: function(e2) {
        var t2 = { name: /qqbrowserlite/i.test(e2) ? "QQ Browser Lite" : "QQ Browser" }, r2 = n.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/msie|trident/i], describe: function(e2) {
        var t2 = { name: "Internet Explorer" }, r2 = n.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/\sedg\//i], describe: function(e2) {
        var t2 = { name: "Microsoft Edge" }, r2 = n.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/edg([ea]|ios)/i], describe: function(e2) {
        var t2 = { name: "Microsoft Edge" }, r2 = n.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/vivaldi/i], describe: function(e2) {
        var t2 = { name: "Vivaldi" }, r2 = n.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/seamonkey/i], describe: function(e2) {
        var t2 = { name: "SeaMonkey" }, r2 = n.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/sailfish/i], describe: function(e2) {
        var t2 = { name: "Sailfish" }, r2 = n.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/silk/i], describe: function(e2) {
        var t2 = { name: "Amazon Silk" }, r2 = n.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/phantom/i], describe: function(e2) {
        var t2 = { name: "PhantomJS" }, r2 = n.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/slimerjs/i], describe: function(e2) {
        var t2 = { name: "SlimerJS" }, r2 = n.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e2) {
        var t2 = { name: "BlackBerry" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/(web|hpw)[o0]s/i], describe: function(e2) {
        var t2 = { name: "WebOS Browser" }, r2 = n.default.getFirstMatch(a, e2) || n.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/bada/i], describe: function(e2) {
        var t2 = { name: "Bada" }, r2 = n.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/tizen/i], describe: function(e2) {
        var t2 = { name: "Tizen" }, r2 = n.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/qupzilla/i], describe: function(e2) {
        var t2 = { name: "QupZilla" }, r2 = n.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/librewolf/i], describe: function(e2) {
        var t2 = { name: "LibreWolf" }, r2 = n.default.getFirstMatch(/(?:librewolf)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/firefox|iceweasel|fxios/i], describe: function(e2) {
        var t2 = { name: "Firefox" }, r2 = n.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/electron/i], describe: function(e2) {
        var t2 = { name: "Electron" }, r2 = n.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/sogoumobilebrowser/i, /metasr/i, /se 2\.[x]/i], describe: function(e2) {
        var t2 = { name: "Sogou Browser" }, r2 = n.default.getFirstMatch(/(?:sogoumobilebrowser)[\s/](\d+(\.?_?\d+)+)/i, e2), i2 = n.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2), a2 = n.default.getFirstMatch(/se ([\d.]+)x/i, e2), o2 = r2 || i2 || a2;
        return o2 && (t2.version = o2), t2;
      } }, { test: [/MiuiBrowser/i], describe: function(e2) {
        var t2 = { name: "Miui" }, r2 = n.default.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: function(e2) {
        return !!e2.hasBrand("DuckDuckGo") || e2.test(/\sDdg\/[\d.]+$/i);
      }, describe: function(e2, t2) {
        var r2 = { name: "DuckDuckGo" };
        if (t2) {
          var i2 = t2.getBrandVersion("DuckDuckGo");
          if (i2)
            return r2.version = i2, r2;
        }
        var a2 = n.default.getFirstMatch(/\sDdg\/([\d.]+)$/i, e2);
        return a2 && (r2.version = a2), r2;
      } }, { test: function(e2) {
        return e2.hasBrand("Brave");
      }, describe: function(e2, t2) {
        var r2 = { name: "Brave" };
        if (t2) {
          var i2 = t2.getBrandVersion("Brave");
          if (i2)
            return r2.version = i2, r2;
        }
        return r2;
      } }, { test: [/chromium/i], describe: function(e2) {
        var t2 = { name: "Chromium" }, r2 = n.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e2) || n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/chrome|crios|crmo/i], describe: function(e2) {
        var t2 = { name: "Chrome" }, r2 = n.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/GSA/i], describe: function(e2) {
        var t2 = { name: "Google Search" }, r2 = n.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: function(e2) {
        var t2 = !e2.test(/like android/i), r2 = e2.test(/android/i);
        return t2 && r2;
      }, describe: function(e2) {
        var t2 = { name: "Android Browser" }, r2 = n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/playstation 4/i], describe: function(e2) {
        var t2 = { name: "PlayStation 4" }, r2 = n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/safari|applewebkit/i], describe: function(e2) {
        var t2 = { name: "Safari" }, r2 = n.default.getFirstMatch(a, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/.*/i], describe: function(e2) {
        var t2 = e2.search("\\(") !== -1 ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
        return { name: n.default.getFirstMatch(t2, e2), version: n.default.getSecondMatch(t2, e2) };
      } }];
      t.default = o, e.exports = t.default;
    }, 93: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i, n = (i = r(17)) && i.__esModule ? i : { default: i }, a = r(18);
      var o = [{ test: [/Roku\/DVP/], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e2);
        return { name: a.OS_MAP.Roku, version: t2 };
      } }, { test: [/windows phone/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e2);
        return { name: a.OS_MAP.WindowsPhone, version: t2 };
      } }, { test: [/windows /i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e2), r2 = n.default.getWindowsVersionName(t2);
        return { name: a.OS_MAP.Windows, version: t2, versionName: r2 };
      } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function(e2) {
        var t2 = { name: a.OS_MAP.iOS }, r2 = n.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/macintosh/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e2).replace(/[_\s]/g, "."), r2 = n.default.getMacOSVersionName(t2), i2 = { name: a.OS_MAP.MacOS, version: t2 };
        return r2 && (i2.versionName = r2), i2;
      } }, { test: [/(ipod|iphone|ipad)/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e2).replace(/[_\s]/g, ".");
        return { name: a.OS_MAP.iOS, version: t2 };
      } }, { test: [/OpenHarmony/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/OpenHarmony\s+(\d+(\.\d+)*)/i, e2);
        return { name: a.OS_MAP.HarmonyOS, version: t2 };
      } }, { test: function(e2) {
        var t2 = !e2.test(/like android/i), r2 = e2.test(/android/i);
        return t2 && r2;
      }, describe: function(e2) {
        var t2 = n.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e2), r2 = n.default.getAndroidVersionName(t2), i2 = { name: a.OS_MAP.Android, version: t2 };
        return r2 && (i2.versionName = r2), i2;
      } }, { test: [/(web|hpw)[o0]s/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e2), r2 = { name: a.OS_MAP.WebOS };
        return t2 && t2.length && (r2.version = t2), r2;
      } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e2) || n.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e2) || n.default.getFirstMatch(/\bbb(\d+)/i, e2);
        return { name: a.OS_MAP.BlackBerry, version: t2 };
      } }, { test: [/bada/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e2);
        return { name: a.OS_MAP.Bada, version: t2 };
      } }, { test: [/tizen/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e2);
        return { name: a.OS_MAP.Tizen, version: t2 };
      } }, { test: [/linux/i], describe: function() {
        return { name: a.OS_MAP.Linux };
      } }, { test: [/CrOS/], describe: function() {
        return { name: a.OS_MAP.ChromeOS };
      } }, { test: [/PlayStation 4/], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e2);
        return { name: a.OS_MAP.PlayStation4, version: t2 };
      } }];
      t.default = o, e.exports = t.default;
    }, 94: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i, n = (i = r(17)) && i.__esModule ? i : { default: i }, a = r(18);
      var o = [{ test: [/googlebot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Google" };
      } }, { test: [/linespider/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Line" };
      } }, { test: [/amazonbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Amazon" };
      } }, { test: [/gptbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
      } }, { test: [/chatgpt-user/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
      } }, { test: [/oai-searchbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
      } }, { test: [/baiduspider/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Baidu" };
      } }, { test: [/bingbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Bing" };
      } }, { test: [/duckduckbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "DuckDuckGo" };
      } }, { test: [/claudebot/i, /claude-web/i, /claude-user/i, /claude-searchbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Anthropic" };
      } }, { test: [/omgilibot/i, /webzio-extended/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Webz.io" };
      } }, { test: [/diffbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Diffbot" };
      } }, { test: [/perplexitybot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
      } }, { test: [/perplexity-user/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
      } }, { test: [/youbot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "You.com" };
      } }, { test: [/ia_archiver/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Internet Archive" };
      } }, { test: [/meta-webindexer/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
      } }, { test: [/meta-externalads/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
      } }, { test: [/meta-externalagent/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
      } }, { test: [/meta-externalfetcher/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
      } }, { test: [/facebookexternalhit/i, /facebookcatalog/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
      } }, { test: [/slackbot/i, /slack-imgProxy/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Slack" };
      } }, { test: [/yahoo/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Yahoo" };
      } }, { test: [/yandexbot/i, /yandexmobilebot/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Yandex" };
      } }, { test: [/pingdom/i], describe: function() {
        return { type: a.PLATFORMS_MAP.bot, vendor: "Pingdom" };
      } }, { test: [/huawei/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/(can-l01)/i, e2) && "Nova", r2 = { type: a.PLATFORMS_MAP.mobile, vendor: "Huawei" };
        return t2 && (r2.model = t2), r2;
      } }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet, vendor: "Nexus" };
      } }, { test: [/ipad/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
      } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
      } }, { test: [/kftt build/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" };
      } }, { test: [/silk/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet, vendor: "Amazon" };
      } }, { test: [/tablet(?! pc)/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tablet };
      } }, { test: function(e2) {
        var t2 = e2.test(/ipod|iphone/i), r2 = e2.test(/like (ipod|iphone)/i);
        return t2 && !r2;
      }, describe: function(e2) {
        var t2 = n.default.getFirstMatch(/(ipod|iphone)/i, e2);
        return { type: a.PLATFORMS_MAP.mobile, vendor: "Apple", model: t2 };
      } }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: function() {
        return { type: a.PLATFORMS_MAP.mobile, vendor: "Nexus" };
      } }, { test: [/Nokia/i], describe: function(e2) {
        var t2 = n.default.getFirstMatch(/Nokia\s+([0-9]+(\.[0-9]+)?)/i, e2), r2 = { type: a.PLATFORMS_MAP.mobile, vendor: "Nokia" };
        return t2 && (r2.model = t2), r2;
      } }, { test: [/[^-]mobi/i], describe: function() {
        return { type: a.PLATFORMS_MAP.mobile };
      } }, { test: function(e2) {
        return e2.getBrowserName(true) === "blackberry";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.mobile, vendor: "BlackBerry" };
      } }, { test: function(e2) {
        return e2.getBrowserName(true) === "bada";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.mobile };
      } }, { test: function(e2) {
        return e2.getBrowserName() === "windows phone";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.mobile, vendor: "Microsoft" };
      } }, { test: function(e2) {
        var t2 = Number(String(e2.getOSVersion()).split(".")[0]);
        return e2.getOSName(true) === "android" && t2 >= 3;
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.tablet };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "android";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.mobile };
      } }, { test: [/smart-?tv|smarttv/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tv };
      } }, { test: [/netcast/i], describe: function() {
        return { type: a.PLATFORMS_MAP.tv };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "macos";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.desktop, vendor: "Apple" };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "windows";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.desktop };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "linux";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.desktop };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "playstation 4";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.tv };
      } }, { test: function(e2) {
        return e2.getOSName(true) === "roku";
      }, describe: function() {
        return { type: a.PLATFORMS_MAP.tv };
      } }];
      t.default = o, e.exports = t.default;
    }, 95: function(e, t, r) {
      t.__esModule = true, t.default = undefined;
      var i, n = (i = r(17)) && i.__esModule ? i : { default: i }, a = r(18);
      var o = [{ test: function(e2) {
        return e2.getBrowserName(true) === "microsoft edge";
      }, describe: function(e2) {
        if (/\sedg\//i.test(e2))
          return { name: a.ENGINE_MAP.Blink };
        var t2 = n.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e2);
        return { name: a.ENGINE_MAP.EdgeHTML, version: t2 };
      } }, { test: [/trident/i], describe: function(e2) {
        var t2 = { name: a.ENGINE_MAP.Trident }, r2 = n.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: function(e2) {
        return e2.test(/presto/i);
      }, describe: function(e2) {
        var t2 = { name: a.ENGINE_MAP.Presto }, r2 = n.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: function(e2) {
        var t2 = e2.test(/gecko/i), r2 = e2.test(/like gecko/i);
        return t2 && !r2;
      }, describe: function(e2) {
        var t2 = { name: a.ENGINE_MAP.Gecko }, r2 = n.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }, { test: [/(apple)?webkit\/537\.36/i], describe: function() {
        return { name: a.ENGINE_MAP.Blink };
      } }, { test: [/(apple)?webkit/i], describe: function(e2) {
        var t2 = { name: a.ENGINE_MAP.WebKit }, r2 = n.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e2);
        return r2 && (t2.version = r2), t2;
      } }];
      t.default = o, e.exports = t.default;
    } });
  });
});

// ../../node_modules/.bun/@aws-sdk+core@3.974.23/node_modules/@aws-sdk/core/dist-cjs/submodules/client/index.js
var require_client2 = __commonJS((exports) => {
  var __dirname = "/Users/maith/Desktop/ur-nexus/node_modules/.bun/@aws-sdk+core@3.974.23/node_modules/@aws-sdk/core/dist-cjs/submodules/client";
  var { Retry, RETRY_MODES } = require_retry();
  var { HttpRequest, parseUrl } = require_protocols();
  var { InvokeStore } = require_invoke_store();
  var { normalizeProvider } = require_dist_cjs3();
  var { platform, release } = __require("node:os");
  var { versions, env } = __require("node:process");
  var { booleanSelector, SelectorType, loadConfig, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS } = require_config();
  var { REGION_ENV_NAME, REGION_INI_NAME, resolveRegionConfig } = require_config();
  exports.NODE_REGION_CONFIG_FILE_OPTIONS = NODE_REGION_CONFIG_FILE_OPTIONS;
  exports.NODE_REGION_CONFIG_OPTIONS = NODE_REGION_CONFIG_OPTIONS;
  exports.REGION_ENV_NAME = REGION_ENV_NAME;
  exports.REGION_INI_NAME = REGION_INI_NAME;
  exports.resolveRegionConfig = resolveRegionConfig;
  var { readFile } = __require("node:fs/promises");
  var { normalize, sep, join } = __require("node:path");
  var { isValidHostLabel, isIpAddress, customEndpointFunctions } = require_endpoints();
  var { EndpointError, resolveEndpoint } = require_endpoints();
  exports.EndpointError = EndpointError;
  exports.isIpAddress = isIpAddress;
  exports.resolveEndpoint = resolveEndpoint;
  var state = {
    warningEmitted: false
  };
  var emitWarningIfUnsupportedVersion = (version) => {
    if (version && !state.warningEmitted) {
      if (process.env.AWS_SDK_JS_NODE_VERSION_SUPPORT_WARNING_DISABLED === "true") {
        state.warningEmitted = true;
        return;
      }
      const userMajorVersion = parseInt(version.substring(1, version.indexOf(".")));
      const vv = 22;
      if (userMajorVersion < vv) {
        state.warningEmitted = true;
        process.emitWarning(`NodeVersionSupportWarning: The AWS SDK for JavaScript (v3)
versions published after the first week of January 2027
will require node >=${vv}. You are running node ${version}.

To continue receiving updates to AWS services, bug fixes,
and security updates please upgrade to node >=${vv}.

More information can be found at: https://a.co/c895JFp`);
      }
    }
  };
  var longPollMiddleware = () => (next, context) => async (args) => {
    context.__retryLongPoll = true;
    return next(args);
  };
  var longPollMiddlewareOptions = {
    name: "longPollMiddleware",
    tags: ["RETRY"],
    step: "initialize",
    override: true
  };
  var getLongPollPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(longPollMiddleware(), longPollMiddlewareOptions);
    }
  });
  function setCredentialFeature(credentials, feature, value) {
    if (!credentials.$source) {
      credentials.$source = {};
    }
    credentials.$source[feature] = value;
    return credentials;
  }
  Retry.v2026 ||= typeof process === "object" && process.env?.AWS_NEW_RETRIES_2026 === "true";
  function setFeature(context, feature, value) {
    if (!context.__aws_sdk_context) {
      context.__aws_sdk_context = {
        features: {}
      };
    } else if (!context.__aws_sdk_context.features) {
      context.__aws_sdk_context.features = {};
    }
    context.__aws_sdk_context.features[feature] = value;
  }
  function setTokenFeature(token, feature, value) {
    if (!token.$source) {
      token.$source = {};
    }
    token.$source[feature] = value;
    return token;
  }
  function resolveHostHeaderConfig(input) {
    return input;
  }
  var hostHeaderMiddleware = (options) => (next) => async (args) => {
    if (!HttpRequest.isInstance(args.request))
      return next(args);
    const { request } = args;
    const { handlerProtocol = "" } = options.requestHandler.metadata || {};
    if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
      delete request.headers["host"];
      request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
    } else if (!request.headers["host"]) {
      let host = request.hostname;
      if (request.port != null)
        host += `:${request.port}`;
      request.headers["host"] = host;
    }
    return next(args);
  };
  var hostHeaderMiddlewareOptions = {
    name: "hostHeaderMiddleware",
    step: "build",
    priority: "low",
    tags: ["HOST"],
    override: true
  };
  var getHostHeaderPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
    }
  });
  var loggerMiddleware = () => (next, context) => async (args) => {
    try {
      const response = await next(args);
      const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
      const { $metadata, ...outputWithoutMetadata } = response.output;
      logger?.info?.({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        output: outputFilterSensitiveLog(outputWithoutMetadata),
        metadata: $metadata
      });
      return response;
    } catch (error) {
      const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      logger?.error?.({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        error,
        metadata: error.$metadata
      });
      throw error;
    }
  };
  var loggerMiddlewareOptions = {
    name: "loggerMiddleware",
    tags: ["LOGGER"],
    step: "initialize",
    override: true
  };
  var getLoggerPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
    }
  });
  var recursionDetectionMiddlewareOptions = {
    step: "build",
    tags: ["RECURSION_DETECTION"],
    name: "recursionDetectionMiddleware",
    override: true,
    priority: "low"
  };
  var TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
  var ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
  var ENV_TRACE_ID = "_X_AMZN_TRACE_ID";
  var recursionDetectionMiddleware = () => (next) => async (args) => {
    const { request } = args;
    if (!HttpRequest.isInstance(request)) {
      return next(args);
    }
    const traceIdHeader = Object.keys(request.headers ?? {}).find((h) => h.toLowerCase() === TRACE_ID_HEADER_NAME.toLowerCase()) ?? TRACE_ID_HEADER_NAME;
    if (request.headers.hasOwnProperty(traceIdHeader)) {
      return next(args);
    }
    const functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
    const traceIdFromEnv = process.env[ENV_TRACE_ID];
    const invokeStore = await InvokeStore.getInstanceAsync();
    const traceIdFromInvokeStore = invokeStore?.getXRayTraceId();
    const traceId = traceIdFromInvokeStore ?? traceIdFromEnv;
    const nonEmptyString = (str) => typeof str === "string" && str.length > 0;
    if (nonEmptyString(functionName) && nonEmptyString(traceId)) {
      request.headers[TRACE_ID_HEADER_NAME] = traceId;
    }
    return next({
      ...args,
      request
    });
  };
  var getRecursionDetectionPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(recursionDetectionMiddleware(), recursionDetectionMiddlewareOptions);
    }
  });
  var DEFAULT_UA_APP_ID = undefined;
  function isValidUserAgentAppId(appId) {
    if (appId === undefined) {
      return true;
    }
    return typeof appId === "string" && appId.length <= 50;
  }
  function resolveUserAgentConfig(input) {
    const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
    const { customUserAgent } = input;
    return Object.assign(input, {
      customUserAgent: typeof customUserAgent === "string" ? [[customUserAgent]] : customUserAgent,
      userAgentAppId: async () => {
        const appId = await normalizedAppIdProvider();
        if (!isValidUserAgentAppId(appId)) {
          const logger = input.logger?.constructor?.name === "NoOpLogger" || !input.logger ? console : input.logger;
          if (typeof appId !== "string") {
            logger?.warn("userAgentAppId must be a string or undefined.");
          } else if (appId.length > 50) {
            logger?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
          }
        }
        return appId;
      }
    });
  }
  var partitionsInfo = {
    partitions: [
      {
        id: "aws",
        outputs: {
          dnsSuffix: "amazonaws.com",
          dualStackDnsSuffix: "api.aws",
          implicitGlobalRegion: "us-east-1",
          name: "aws",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
        regions: {
          "af-south-1": {
            description: "Africa (Cape Town)"
          },
          "ap-east-1": {
            description: "Asia Pacific (Hong Kong)"
          },
          "ap-east-2": {
            description: "Asia Pacific (Taipei)"
          },
          "ap-northeast-1": {
            description: "Asia Pacific (Tokyo)"
          },
          "ap-northeast-2": {
            description: "Asia Pacific (Seoul)"
          },
          "ap-northeast-3": {
            description: "Asia Pacific (Osaka)"
          },
          "ap-south-1": {
            description: "Asia Pacific (Mumbai)"
          },
          "ap-south-2": {
            description: "Asia Pacific (Hyderabad)"
          },
          "ap-southeast-1": {
            description: "Asia Pacific (Singapore)"
          },
          "ap-southeast-2": {
            description: "Asia Pacific (Sydney)"
          },
          "ap-southeast-3": {
            description: "Asia Pacific (Jakarta)"
          },
          "ap-southeast-4": {
            description: "Asia Pacific (Melbourne)"
          },
          "ap-southeast-5": {
            description: "Asia Pacific (Malaysia)"
          },
          "ap-southeast-6": {
            description: "Asia Pacific (New Zealand)"
          },
          "ap-southeast-7": {
            description: "Asia Pacific (Thailand)"
          },
          "aws-global": {
            description: "aws global region"
          },
          "ca-central-1": {
            description: "Canada (Central)"
          },
          "ca-west-1": {
            description: "Canada West (Calgary)"
          },
          "eu-central-1": {
            description: "Europe (Frankfurt)"
          },
          "eu-central-2": {
            description: "Europe (Zurich)"
          },
          "eu-north-1": {
            description: "Europe (Stockholm)"
          },
          "eu-south-1": {
            description: "Europe (Milan)"
          },
          "eu-south-2": {
            description: "Europe (Spain)"
          },
          "eu-west-1": {
            description: "Europe (Ireland)"
          },
          "eu-west-2": {
            description: "Europe (London)"
          },
          "eu-west-3": {
            description: "Europe (Paris)"
          },
          "il-central-1": {
            description: "Israel (Tel Aviv)"
          },
          "me-central-1": {
            description: "Middle East (UAE)"
          },
          "me-south-1": {
            description: "Middle East (Bahrain)"
          },
          "mx-central-1": {
            description: "Mexico (Central)"
          },
          "sa-east-1": {
            description: "South America (Sao Paulo)"
          },
          "us-east-1": {
            description: "US East (N. Virginia)"
          },
          "us-east-2": {
            description: "US East (Ohio)"
          },
          "us-west-1": {
            description: "US West (N. California)"
          },
          "us-west-2": {
            description: "US West (Oregon)"
          }
        }
      },
      {
        id: "aws-cn",
        outputs: {
          dnsSuffix: "amazonaws.com.cn",
          dualStackDnsSuffix: "api.amazonwebservices.com.cn",
          implicitGlobalRegion: "cn-northwest-1",
          name: "aws-cn",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^cn\\-\\w+\\-\\d+$",
        regions: {
          "aws-cn-global": {
            description: "aws-cn global region"
          },
          "cn-north-1": {
            description: "China (Beijing)"
          },
          "cn-northwest-1": {
            description: "China (Ningxia)"
          }
        }
      },
      {
        id: "aws-eusc",
        outputs: {
          dnsSuffix: "amazonaws.eu",
          dualStackDnsSuffix: "api.amazonwebservices.eu",
          implicitGlobalRegion: "eusc-de-east-1",
          name: "aws-eusc",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^eusc\\-(de)\\-\\w+\\-\\d+$",
        regions: {
          "eusc-de-east-1": {
            description: "AWS European Sovereign Cloud (Germany)"
          }
        }
      },
      {
        id: "aws-iso",
        outputs: {
          dnsSuffix: "c2s.ic.gov",
          dualStackDnsSuffix: "api.aws.ic.gov",
          implicitGlobalRegion: "us-iso-east-1",
          name: "aws-iso",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-global": {
            description: "aws-iso global region"
          },
          "us-iso-east-1": {
            description: "US ISO East"
          },
          "us-iso-west-1": {
            description: "US ISO WEST"
          }
        }
      },
      {
        id: "aws-iso-b",
        outputs: {
          dnsSuffix: "sc2s.sgov.gov",
          dualStackDnsSuffix: "api.aws.scloud",
          implicitGlobalRegion: "us-isob-east-1",
          name: "aws-iso-b",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-b-global": {
            description: "aws-iso-b global region"
          },
          "us-isob-east-1": {
            description: "US ISOB East (Ohio)"
          },
          "us-isob-west-1": {
            description: "US ISOB West"
          }
        }
      },
      {
        id: "aws-iso-e",
        outputs: {
          dnsSuffix: "cloud.adc-e.uk",
          dualStackDnsSuffix: "api.cloud-aws.adc-e.uk",
          implicitGlobalRegion: "eu-isoe-west-1",
          name: "aws-iso-e",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-e-global": {
            description: "aws-iso-e global region"
          },
          "eu-isoe-west-1": {
            description: "EU ISOE West"
          }
        }
      },
      {
        id: "aws-iso-f",
        outputs: {
          dnsSuffix: "csp.hci.ic.gov",
          dualStackDnsSuffix: "api.aws.hci.ic.gov",
          implicitGlobalRegion: "us-isof-south-1",
          name: "aws-iso-f",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-f-global": {
            description: "aws-iso-f global region"
          },
          "us-isof-east-1": {
            description: "US ISOF EAST"
          },
          "us-isof-south-1": {
            description: "US ISOF SOUTH"
          }
        }
      },
      {
        id: "aws-us-gov",
        outputs: {
          dnsSuffix: "amazonaws.com",
          dualStackDnsSuffix: "api.aws",
          implicitGlobalRegion: "us-gov-west-1",
          name: "aws-us-gov",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
        regions: {
          "aws-us-gov-global": {
            description: "aws-us-gov global region"
          },
          "us-gov-east-1": {
            description: "AWS GovCloud (US-East)"
          },
          "us-gov-west-1": {
            description: "AWS GovCloud (US-West)"
          }
        }
      }
    ],
    version: "1.1"
  };
  var selectedPartitionsInfo = partitionsInfo;
  var selectedUserAgentPrefix = "";
  var partition = (value) => {
    const { partitions } = selectedPartitionsInfo;
    for (const partition2 of partitions) {
      const { regions, outputs } = partition2;
      for (const [region, regionData] of Object.entries(regions)) {
        if (region === value) {
          return {
            ...outputs,
            ...regionData
          };
        }
      }
    }
    for (const partition2 of partitions) {
      const { regionRegex, outputs } = partition2;
      if (new RegExp(regionRegex).test(value)) {
        return {
          ...outputs
        };
      }
    }
    const DEFAULT_PARTITION = partitions.find((partition2) => partition2.id === "aws");
    if (!DEFAULT_PARTITION) {
      throw new Error("Provided region was not found in the partition array or regex," + " and default partition with id 'aws' doesn't exist.");
    }
    return {
      ...DEFAULT_PARTITION.outputs
    };
  };
  var setPartitionInfo = (partitionsInfo2, userAgentPrefix = "") => {
    selectedPartitionsInfo = partitionsInfo2;
    selectedUserAgentPrefix = userAgentPrefix;
  };
  var useDefaultPartitionInfo = () => {
    setPartitionInfo(partitionsInfo, "");
  };
  var getUserAgentPrefix = () => selectedUserAgentPrefix;
  var ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
  async function checkFeatures(context, config, args) {
    const request = args.request;
    if (request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") {
      setFeature(context, "PROTOCOL_RPC_V2_CBOR", "M");
    }
    if (typeof config.retryStrategy === "function") {
      const retryStrategy = await config.retryStrategy();
      if (typeof retryStrategy.mode === "string") {
        switch (retryStrategy.mode) {
          case RETRY_MODES.ADAPTIVE:
            setFeature(context, "RETRY_MODE_ADAPTIVE", "F");
            break;
          case RETRY_MODES.STANDARD:
            setFeature(context, "RETRY_MODE_STANDARD", "E");
            break;
        }
      }
    }
    if (typeof config.accountIdEndpointMode === "function") {
      const endpointV2 = context.endpointV2;
      if (String(endpointV2?.url?.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) {
        setFeature(context, "ACCOUNT_ID_ENDPOINT", "O");
      }
      switch (await config.accountIdEndpointMode?.()) {
        case "disabled":
          setFeature(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
          break;
        case "preferred":
          setFeature(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
          break;
        case "required":
          setFeature(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
          break;
      }
    }
    const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
    if (identity?.$source) {
      const credentials = identity;
      if (credentials.accountId) {
        setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
      }
      for (const [key, value] of Object.entries(credentials.$source ?? {})) {
        setFeature(context, key, value);
      }
    }
  }
  var USER_AGENT = "user-agent";
  var X_AMZ_USER_AGENT = "x-amz-user-agent";
  var SPACE = " ";
  var UA_NAME_SEPARATOR = "/";
  var UA_NAME_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w]/g;
  var UA_VALUE_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w#]/g;
  var UA_ESCAPE_CHAR = "-";
  var BYTE_LIMIT = 1024;
  function encodeFeatures(features) {
    let buffer = "";
    for (const key in features) {
      const val = features[key];
      if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
        if (buffer.length) {
          buffer += "," + val;
        } else {
          buffer += val;
        }
        continue;
      }
      break;
    }
    return buffer;
  }
  var userAgentMiddleware = (options) => (next, context) => async (args) => {
    const { request } = args;
    if (!HttpRequest.isInstance(request)) {
      return next(args);
    }
    const { headers } = request;
    const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
    const defaultUserAgent2 = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
    await checkFeatures(context, options, args);
    const awsContext = context;
    defaultUserAgent2.push(`m/${encodeFeatures(Object.assign({}, context.__smithy_context?.features, awsContext.__aws_sdk_context?.features))}`);
    const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
    const appId = await options.userAgentAppId();
    if (appId) {
      defaultUserAgent2.push(escapeUserAgent([`app`, `${appId}`]));
    }
    const prefix = getUserAgentPrefix();
    const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent2, ...userAgent, ...customUserAgent]).join(SPACE);
    const normalUAValue = [
      ...defaultUserAgent2.filter((section) => section.startsWith("aws-sdk-")),
      ...customUserAgent
    ].join(SPACE);
    if (options.runtime !== "browser") {
      if (normalUAValue) {
        headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
      }
      headers[USER_AGENT] = sdkUserAgentValue;
    } else {
      headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
    }
    return next({
      ...args,
      request
    });
  };
  var escapeUserAgent = (userAgentPair) => {
    const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
    const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
    const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
    const prefix = name.substring(0, prefixSeparatorIndex);
    let uaName = name.substring(prefixSeparatorIndex + 1);
    if (prefix === "api") {
      uaName = uaName.toLowerCase();
    }
    return [prefix, uaName, version].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
      switch (index) {
        case 0:
          return item;
        case 1:
          return `${acc}/${item}`;
        default:
          return `${acc}#${item}`;
      }
    }, "");
  };
  var getUserAgentMiddlewareOptions = {
    name: "getUserAgentMiddleware",
    step: "build",
    priority: "low",
    tags: ["SET_USER_AGENT", "USER_AGENT"],
    override: true
  };
  var getUserAgentPlugin = (config) => ({
    applyToStack: (clientStack) => {
      clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
    }
  });
  var getRuntimeUserAgentPair = () => {
    const runtimesToCheck = ["deno", "bun", "llrt"];
    for (const runtime of runtimesToCheck) {
      if (versions[runtime]) {
        return [`md/${runtime}`, versions[runtime]];
      }
    }
    return ["md/nodejs", versions.node];
  };
  var getNodeModulesParentDirs = (dirname) => {
    const cwd = process.cwd();
    if (!dirname) {
      return [cwd];
    }
    const normalizedPath = normalize(dirname);
    const parts = normalizedPath.split(sep);
    const nodeModulesIndex = parts.indexOf("node_modules");
    const parentDir = nodeModulesIndex !== -1 ? parts.slice(0, nodeModulesIndex).join(sep) : normalizedPath;
    if (cwd === parentDir) {
      return [cwd];
    }
    return [parentDir, cwd];
  };
  var SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
  var getSanitizedTypeScriptVersion = (version = "") => {
    const match = version.match(SEMVER_REGEX);
    if (!match) {
      return;
    }
    const [major, minor, patch, prerelease] = [match[1], match[2], match[3], match[4]];
    return prerelease ? `${major}.${minor}.${patch}-${prerelease}` : `${major}.${minor}.${patch}`;
  };
  var ALLOWED_PREFIXES = ["^", "~", ">=", "<=", ">", "<"];
  var ALLOWED_DIST_TAGS = ["latest", "beta", "dev", "rc", "insiders", "next"];
  var getSanitizedDevTypeScriptVersion = (version = "") => {
    if (ALLOWED_DIST_TAGS.includes(version)) {
      return version;
    }
    const prefix = ALLOWED_PREFIXES.find((p) => version.startsWith(p)) ?? "";
    const sanitizedTypeScriptVersion = getSanitizedTypeScriptVersion(version.slice(prefix.length));
    if (!sanitizedTypeScriptVersion) {
      return;
    }
    return `${prefix}${sanitizedTypeScriptVersion}`;
  };
  var tscVersion;
  var TS_PACKAGE_JSON = join("node_modules", "typescript", "package.json");
  var getTypeScriptUserAgentPair = async () => {
    if (tscVersion === null) {
      return;
    } else if (typeof tscVersion === "string") {
      return ["md/tsc", tscVersion];
    }
    let isTypeScriptDetectionDisabled = false;
    try {
      isTypeScriptDetectionDisabled = booleanSelector(process.env, "AWS_SDK_JS_TYPESCRIPT_DETECTION_DISABLED", SelectorType.ENV) || false;
    } catch {}
    if (isTypeScriptDetectionDisabled) {
      tscVersion = null;
      return;
    }
    const dirname = typeof __dirname !== "undefined" ? __dirname : undefined;
    const nodeModulesParentDirs = getNodeModulesParentDirs(dirname);
    let versionFromApp;
    for (const nodeModulesParentDir of nodeModulesParentDirs) {
      try {
        const appPackageJsonPath = join(nodeModulesParentDir, "package.json");
        const packageJson = await readFile(appPackageJsonPath, "utf-8");
        const { dependencies, devDependencies } = JSON.parse(packageJson);
        const version = devDependencies?.typescript ?? dependencies?.typescript;
        if (typeof version !== "string") {
          continue;
        }
        versionFromApp = version;
        break;
      } catch {}
    }
    if (!versionFromApp) {
      tscVersion = null;
      return;
    }
    let versionFromNodeModules;
    for (const nodeModulesParentDir of nodeModulesParentDirs) {
      try {
        const tsPackageJsonPath = join(nodeModulesParentDir, TS_PACKAGE_JSON);
        const packageJson = await readFile(tsPackageJsonPath, "utf-8");
        const { version } = JSON.parse(packageJson);
        const sanitizedVersion2 = getSanitizedTypeScriptVersion(version);
        if (typeof sanitizedVersion2 !== "string") {
          continue;
        }
        versionFromNodeModules = sanitizedVersion2;
        break;
      } catch {}
    }
    if (versionFromNodeModules) {
      tscVersion = versionFromNodeModules;
      return ["md/tsc", tscVersion];
    }
    const sanitizedVersion = getSanitizedDevTypeScriptVersion(versionFromApp);
    if (typeof sanitizedVersion !== "string") {
      tscVersion = null;
      return;
    }
    tscVersion = `dev_${sanitizedVersion}`;
    return ["md/tsc", tscVersion];
  };
  var crtAvailability = {
    isCrtAvailable: false
  };
  var isCrtAvailable = () => {
    if (crtAvailability.isCrtAvailable) {
      return ["md/crt-avail"];
    }
    return null;
  };
  var createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => {
    const runtimeUserAgentPair = getRuntimeUserAgentPair();
    return async (config) => {
      const sections = [
        ["aws-sdk-js", clientVersion],
        ["ua", "2.1"],
        [`os/${platform()}`, release()],
        ["lang/js"],
        runtimeUserAgentPair
      ];
      const typescriptUserAgentPair = await getTypeScriptUserAgentPair();
      if (typescriptUserAgentPair) {
        sections.push(typescriptUserAgentPair);
      }
      const crtAvailable = isCrtAvailable();
      if (crtAvailable) {
        sections.push(crtAvailable);
      }
      if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
      }
      if (env.AWS_EXECUTION_ENV) {
        sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
      }
      const appId = await config?.userAgentAppId?.();
      const resolvedUserAgent = appId ? [...sections, [`app/${appId}`]] : [...sections];
      return resolvedUserAgent;
    };
  };
  var defaultUserAgent = createDefaultUserAgentProvider;
  var UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
  var UA_APP_ID_INI_NAME = "sdk_ua_app_id";
  var UA_APP_ID_INI_NAME_DEPRECATED = "sdk-ua-app-id";
  var NODE_APP_ID_CONFIG_OPTIONS = {
    environmentVariableSelector: (env2) => env2[UA_APP_ID_ENV_NAME],
    configFileSelector: (profile) => profile[UA_APP_ID_INI_NAME] ?? profile[UA_APP_ID_INI_NAME_DEPRECATED],
    default: DEFAULT_UA_APP_ID
  };
  var createUserAgentStringParsingProvider = ({ serviceId, clientVersion }) => async (config) => {
    const module2 = require_es5();
    const parse = module2.parse ?? module2.default.parse ?? (() => "");
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent ? parse(window.navigator.userAgent) : undefined;
    const sections = [
      ["aws-sdk-js", clientVersion],
      ["ua", "2.1"],
      [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
      ["lang/js"],
      ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`]
    ];
    if (serviceId) {
      sections.push([`api/${serviceId}`, clientVersion]);
    }
    const appId = await config?.userAgentAppId?.();
    if (appId) {
      sections.push([`app/${appId}`]);
    }
    return sections;
  };
  var fallback = {
    os(ua) {
      if (/iPhone|iPad|iPod/.test(ua))
        return "iOS";
      if (/Macintosh|Mac OS X/.test(ua))
        return "macOS";
      if (/Windows NT/.test(ua))
        return "Windows";
      if (/Android/.test(ua))
        return "Android";
      if (/Linux/.test(ua))
        return "Linux";
      return;
    },
    browser(ua) {
      if (/EdgiOS|EdgA|Edg\//.test(ua))
        return "Microsoft Edge";
      if (/Firefox\//.test(ua))
        return "Firefox";
      if (/Chrome\//.test(ua))
        return "Chrome";
      if (/Safari\//.test(ua))
        return "Safari";
      return;
    }
  };
  var isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
    if (allowSubDomains) {
      for (const label of value.split(".")) {
        if (!isVirtualHostableS3Bucket(label)) {
          return false;
        }
      }
      return true;
    }
    if (!isValidHostLabel(value)) {
      return false;
    }
    if (value.length < 3 || value.length > 63) {
      return false;
    }
    if (value !== value.toLowerCase()) {
      return false;
    }
    if (isIpAddress(value)) {
      return false;
    }
    return true;
  };
  var ARN_DELIMITER = ":";
  var RESOURCE_DELIMITER = "/";
  var parseArn = (value) => {
    const segments = value.split(ARN_DELIMITER);
    if (segments.length < 6)
      return null;
    const [arn, partition2, service, region, accountId, ...resourcePath] = segments;
    if (arn !== "arn" || partition2 === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "")
      return null;
    const resourceId = resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat();
    return {
      partition: partition2,
      service,
      region,
      accountId,
      resourceId
    };
  };
  var awsEndpointFunctions = {
    isVirtualHostableS3Bucket,
    parseArn,
    partition
  };
  customEndpointFunctions.aws = awsEndpointFunctions;
  var resolveDefaultAwsRegionalEndpointsConfig = (input) => {
    if (typeof input.endpointProvider !== "function") {
      throw new Error("@aws-sdk/util-endpoint - endpointProvider and endpoint missing in config for this client.");
    }
    const { endpoint } = input;
    if (endpoint === undefined) {
      input.endpoint = async () => {
        return toEndpointV1(input.endpointProvider({
          Region: typeof input.region === "function" ? await input.region() : input.region,
          UseDualStack: typeof input.useDualstackEndpoint === "function" ? await input.useDualstackEndpoint() : input.useDualstackEndpoint,
          UseFIPS: typeof input.useFipsEndpoint === "function" ? await input.useFipsEndpoint() : input.useFipsEndpoint,
          Endpoint: undefined
        }, { logger: input.logger }));
      };
    }
    return input;
  };
  var toEndpointV1 = (endpoint) => parseUrl(endpoint.url);
  function stsRegionDefaultResolver(loaderConfig = {}) {
    return loadConfig({
      ...NODE_REGION_CONFIG_OPTIONS,
      async default() {
        if (!warning.silence) {
          console.warn("@aws-sdk - WARN - default STS region of us-east-1 used. See @aws-sdk/credential-providers README and set a region explicitly.");
        }
        return "us-east-1";
      }
    }, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig });
  }
  var warning = {
    silence: false
  };
  var getAwsRegionExtensionConfiguration = (runtimeConfig) => {
    return {
      setRegion(region) {
        runtimeConfig.region = region;
      },
      region() {
        return runtimeConfig.region;
      }
    };
  };
  var resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
    return {
      region: awsRegionExtensionConfiguration.region()
    };
  };
  exports.DEFAULT_UA_APP_ID = DEFAULT_UA_APP_ID;
  exports.NODE_APP_ID_CONFIG_OPTIONS = NODE_APP_ID_CONFIG_OPTIONS;
  exports.UA_APP_ID_ENV_NAME = UA_APP_ID_ENV_NAME;
  exports.UA_APP_ID_INI_NAME = UA_APP_ID_INI_NAME;
  exports.awsEndpointFunctions = awsEndpointFunctions;
  exports.createDefaultUserAgentProvider = createDefaultUserAgentProvider;
  exports.createUserAgentStringParsingProvider = createUserAgentStringParsingProvider;
  exports.crtAvailability = crtAvailability;
  exports.defaultUserAgent = defaultUserAgent;
  exports.emitWarningIfUnsupportedVersion = emitWarningIfUnsupportedVersion;
  exports.fallback = fallback;
  exports.getAwsRegionExtensionConfiguration = getAwsRegionExtensionConfiguration;
  exports.getHostHeaderPlugin = getHostHeaderPlugin;
  exports.getLoggerPlugin = getLoggerPlugin;
  exports.getLongPollPlugin = getLongPollPlugin;
  exports.getRecursionDetectionPlugin = getRecursionDetectionPlugin;
  exports.getUserAgentMiddlewareOptions = getUserAgentMiddlewareOptions;
  exports.getUserAgentPlugin = getUserAgentPlugin;
  exports.getUserAgentPrefix = getUserAgentPrefix;
  exports.hostHeaderMiddleware = hostHeaderMiddleware;
  exports.hostHeaderMiddlewareOptions = hostHeaderMiddlewareOptions;
  exports.isVirtualHostableS3Bucket = isVirtualHostableS3Bucket;
  exports.loggerMiddleware = loggerMiddleware;
  exports.loggerMiddlewareOptions = loggerMiddlewareOptions;
  exports.parseArn = parseArn;
  exports.partition = partition;
  exports.recursionDetectionMiddleware = recursionDetectionMiddleware;
  exports.recursionDetectionMiddlewareOptions = recursionDetectionMiddlewareOptions;
  exports.resolveAwsRegionExtensionConfiguration = resolveAwsRegionExtensionConfiguration;
  exports.resolveDefaultAwsRegionalEndpointsConfig = resolveDefaultAwsRegionalEndpointsConfig;
  exports.resolveHostHeaderConfig = resolveHostHeaderConfig;
  exports.resolveUserAgentConfig = resolveUserAgentConfig;
  exports.setCredentialFeature = setCredentialFeature;
  exports.setFeature = setFeature;
  exports.setPartitionInfo = setPartitionInfo;
  exports.setTokenFeature = setTokenFeature;
  exports.state = state;
  exports.stsRegionDefaultResolver = stsRegionDefaultResolver;
  exports.stsRegionWarning = warning;
  exports.toEndpointV1 = toEndpointV1;
  exports.useDefaultPartitionInfo = useDefaultPartitionInfo;
  exports.userAgentMiddleware = userAgentMiddleware;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-env@3.972.49/node_modules/@aws-sdk/credential-provider-env/dist-cjs/index.js
var require_dist_cjs4 = __commonJS((exports) => {
  var { setCredentialFeature } = require_client2();
  var { CredentialsProviderError } = require_config();
  var ENV_KEY = "AWS_ACCESS_KEY_ID";
  var ENV_SECRET = "AWS_SECRET_ACCESS_KEY";
  var ENV_SESSION = "AWS_SESSION_TOKEN";
  var ENV_EXPIRATION = "AWS_CREDENTIAL_EXPIRATION";
  var ENV_CREDENTIAL_SCOPE = "AWS_CREDENTIAL_SCOPE";
  var ENV_ACCOUNT_ID = "AWS_ACCOUNT_ID";
  var fromEnv = (init) => async () => {
    init?.logger?.debug("@aws-sdk/credential-provider-env - fromEnv");
    const accessKeyId = process.env[ENV_KEY];
    const secretAccessKey = process.env[ENV_SECRET];
    const sessionToken = process.env[ENV_SESSION];
    const expiry = process.env[ENV_EXPIRATION];
    const credentialScope = process.env[ENV_CREDENTIAL_SCOPE];
    const accountId = process.env[ENV_ACCOUNT_ID];
    if (accessKeyId && secretAccessKey) {
      const credentials = {
        accessKeyId,
        secretAccessKey,
        ...sessionToken && { sessionToken },
        ...expiry && { expiration: new Date(expiry) },
        ...credentialScope && { credentialScope },
        ...accountId && { accountId }
      };
      setCredentialFeature(credentials, "CREDENTIALS_ENV_VARS", "g");
      return credentials;
    }
    throw new CredentialsProviderError("Unable to find environment variable credentials.", { logger: init?.logger });
  };
  exports.ENV_ACCOUNT_ID = ENV_ACCOUNT_ID;
  exports.ENV_CREDENTIAL_SCOPE = ENV_CREDENTIAL_SCOPE;
  exports.ENV_EXPIRATION = ENV_EXPIRATION;
  exports.ENV_KEY = ENV_KEY;
  exports.ENV_SECRET = ENV_SECRET;
  exports.ENV_SESSION = ENV_SESSION;
  exports.fromEnv = fromEnv;
});

// ../../node_modules/.bun/@smithy+credential-provider-imds@4.4.2/node_modules/@smithy/credential-provider-imds/dist-cjs/index.js
var require_dist_cjs5 = __commonJS((exports) => {
  var { ProviderError, CredentialsProviderError, loadConfig } = require_config();
  var node_http = __require("node:http");
  var { parseUrl } = require_protocols();
  var isImdsCredentials = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.AccessKeyId === "string" && typeof arg.SecretAccessKey === "string" && typeof arg.Token === "string" && typeof arg.Expiration === "string";
  var fromImdsCredentials = (creds) => ({
    accessKeyId: creds.AccessKeyId,
    secretAccessKey: creds.SecretAccessKey,
    sessionToken: creds.Token,
    expiration: new Date(creds.Expiration),
    ...creds.AccountId && { accountId: creds.AccountId }
  });
  var DEFAULT_TIMEOUT = 1000;
  var DEFAULT_MAX_RETRIES = 0;
  var providerConfigFromInit = ({ maxRetries = DEFAULT_MAX_RETRIES, timeout = DEFAULT_TIMEOUT }) => ({ maxRetries, timeout });
  function httpRequest(options) {
    return new Promise((resolve, reject) => {
      const req = node_http.request({
        method: "GET",
        ...options,
        hostname: options.hostname?.replace(/^\[(.+)\]$/, "$1")
      });
      req.on("error", (err) => {
        reject(Object.assign(new ProviderError("Unable to connect to instance metadata service"), err));
        req.destroy();
      });
      req.on("timeout", () => {
        reject(new ProviderError("TimeoutError from instance metadata service"));
        req.destroy();
      });
      req.on("response", (res) => {
        const { statusCode = 400 } = res;
        if (statusCode < 200 || 300 <= statusCode) {
          reject(Object.assign(new ProviderError("Error response received from instance metadata service"), { statusCode }));
          req.destroy();
        }
        const chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          resolve(Buffer.concat(chunks));
          req.destroy();
        });
      });
      req.end();
    });
  }
  var retry = (toRetry, maxRetries) => {
    let promise = toRetry();
    for (let i = 0;i < maxRetries; i++) {
      promise = promise.catch(toRetry);
    }
    return promise;
  };
  var ENV_CMDS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
  var ENV_CMDS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
  var ENV_CMDS_AUTH_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
  var fromContainerMetadata = (init = {}) => {
    const { timeout, maxRetries } = providerConfigFromInit(init);
    return () => retry(async () => {
      const requestOptions = await getCmdsUri({ logger: init.logger });
      const credsResponse = JSON.parse(await requestFromEcsImds(timeout, requestOptions));
      if (!isImdsCredentials(credsResponse)) {
        throw new CredentialsProviderError("Invalid response received from instance metadata service.", {
          logger: init.logger
        });
      }
      return fromImdsCredentials(credsResponse);
    }, maxRetries);
  };
  var requestFromEcsImds = async (timeout, options) => {
    if (process.env[ENV_CMDS_AUTH_TOKEN]) {
      options.headers = {
        ...options.headers,
        Authorization: process.env[ENV_CMDS_AUTH_TOKEN]
      };
    }
    const buffer = await httpRequest({
      ...options,
      timeout
    });
    return buffer.toString();
  };
  var CMDS_IP = "169.254.170.2";
  var GREENGRASS_HOSTS = new Set(["localhost", "127.0.0.1"]);
  var GREENGRASS_PROTOCOLS = new Set(["http:", "https:"]);
  var getCmdsUri = async ({ logger }) => {
    if (process.env[ENV_CMDS_RELATIVE_URI]) {
      return {
        hostname: CMDS_IP,
        path: process.env[ENV_CMDS_RELATIVE_URI]
      };
    }
    if (process.env[ENV_CMDS_FULL_URI]) {
      let parsed;
      try {
        parsed = new URL(process.env[ENV_CMDS_FULL_URI]);
      } catch {
        throw new CredentialsProviderError(`${process.env[ENV_CMDS_FULL_URI]} is not a valid container metadata service URL`, { tryNextLink: false, logger });
      }
      if (!parsed.hostname || !GREENGRASS_HOSTS.has(parsed.hostname)) {
        throw new CredentialsProviderError(`${parsed.hostname} is not a valid container metadata service hostname`, {
          tryNextLink: false,
          logger
        });
      }
      if (!parsed.protocol || !GREENGRASS_PROTOCOLS.has(parsed.protocol)) {
        throw new CredentialsProviderError(`${parsed.protocol} is not a valid container metadata service protocol`, {
          tryNextLink: false,
          logger
        });
      }
      return {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        port: parsed.port ? parseInt(parsed.port, 10) : undefined
      };
    }
    throw new CredentialsProviderError("The container metadata credential provider cannot be used unless" + ` the ${ENV_CMDS_RELATIVE_URI} or ${ENV_CMDS_FULL_URI} environment` + " variable is set", {
      tryNextLink: false,
      logger
    });
  };

  class InstanceMetadataV1FallbackError extends CredentialsProviderError {
    tryNextLink;
    name = "InstanceMetadataV1FallbackError";
    constructor(message, tryNextLink = true) {
      super(message, tryNextLink);
      this.tryNextLink = tryNextLink;
      Object.setPrototypeOf(this, InstanceMetadataV1FallbackError.prototype);
    }
  }
  var Endpoint;
  (function(Endpoint2) {
    Endpoint2["IPv4"] = "http://169.254.169.254";
    Endpoint2["IPv6"] = "http://[fd00:ec2::254]";
  })(Endpoint || (Endpoint = {}));
  var ENV_ENDPOINT_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT";
  var CONFIG_ENDPOINT_NAME = "ec2_metadata_service_endpoint";
  var ENDPOINT_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => env[ENV_ENDPOINT_NAME],
    configFileSelector: (profile) => profile[CONFIG_ENDPOINT_NAME],
    default: undefined
  };
  var EndpointMode;
  (function(EndpointMode2) {
    EndpointMode2["IPv4"] = "IPv4";
    EndpointMode2["IPv6"] = "IPv6";
  })(EndpointMode || (EndpointMode = {}));
  var ENV_ENDPOINT_MODE_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE";
  var CONFIG_ENDPOINT_MODE_NAME = "ec2_metadata_service_endpoint_mode";
  var ENDPOINT_MODE_CONFIG_OPTIONS = {
    environmentVariableSelector: (env) => env[ENV_ENDPOINT_MODE_NAME],
    configFileSelector: (profile) => profile[CONFIG_ENDPOINT_MODE_NAME],
    default: EndpointMode.IPv4
  };
  var getInstanceMetadataEndpoint = async () => parseUrl(await getFromEndpointConfig() || await getFromEndpointModeConfig());
  var getFromEndpointConfig = async () => loadConfig(ENDPOINT_CONFIG_OPTIONS)();
  var getFromEndpointModeConfig = async () => {
    const endpointMode = await loadConfig(ENDPOINT_MODE_CONFIG_OPTIONS)();
    switch (endpointMode) {
      case EndpointMode.IPv4:
        return Endpoint.IPv4;
      case EndpointMode.IPv6:
        return Endpoint.IPv6;
      default:
        throw new Error(`Unsupported endpoint mode: ${endpointMode}.` + ` Select from ${Object.values(EndpointMode)}`);
    }
  };
  var STATIC_STABILITY_REFRESH_INTERVAL_SECONDS = 5 * 60;
  var STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS = 5 * 60;
  var STATIC_STABILITY_DOC_URL = "https://docs.aws.amazon.com/sdkref/latest/guide/feature-static-credentials.html";
  var getExtendedInstanceMetadataCredentials = (credentials, logger) => {
    const refreshInterval = STATIC_STABILITY_REFRESH_INTERVAL_SECONDS + Math.floor(Math.random() * STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS);
    const newExpiration = new Date(Date.now() + refreshInterval * 1000);
    logger.warn("Attempting credential expiration extension due to a credential service availability issue. A refresh of these " + `credentials will be attempted after ${new Date(newExpiration)}.
For more information, please visit: ` + STATIC_STABILITY_DOC_URL);
    const originalExpiration = credentials.originalExpiration ?? credentials.expiration;
    return {
      ...credentials,
      ...originalExpiration ? { originalExpiration } : {},
      expiration: newExpiration
    };
  };
  var staticStabilityProvider = (provider, options = {}) => {
    const logger = options?.logger || console;
    let pastCredentials;
    return async () => {
      let credentials;
      try {
        credentials = await provider();
        if (credentials.expiration && credentials.expiration.getTime() < Date.now()) {
          credentials = getExtendedInstanceMetadataCredentials(credentials, logger);
        }
      } catch (e) {
        if (pastCredentials) {
          logger.warn("Credential renew failed: ", e);
          credentials = getExtendedInstanceMetadataCredentials(pastCredentials, logger);
        } else {
          throw e;
        }
      }
      pastCredentials = credentials;
      return credentials;
    };
  };
  var IMDS_PATH = "/latest/meta-data/iam/security-credentials/";
  var IMDS_TOKEN_PATH = "/latest/api/token";
  var AWS_EC2_METADATA_V1_DISABLED = "AWS_EC2_METADATA_V1_DISABLED";
  var PROFILE_AWS_EC2_METADATA_V1_DISABLED = "ec2_metadata_v1_disabled";
  var X_AWS_EC2_METADATA_TOKEN = "x-aws-ec2-metadata-token";
  var fromInstanceMetadata = (init = {}) => staticStabilityProvider(getInstanceMetadataProvider(init), { logger: init.logger });
  var getInstanceMetadataProvider = (init = {}) => {
    let disableFetchToken = false;
    const { logger, profile } = init;
    const { timeout, maxRetries } = providerConfigFromInit(init);
    const getCredentials = async (maxRetries2, options) => {
      const isImdsV1Fallback = disableFetchToken || options.headers?.[X_AWS_EC2_METADATA_TOKEN] == null;
      if (isImdsV1Fallback) {
        let fallbackBlockedFromProfile = false;
        let fallbackBlockedFromProcessEnv = false;
        const configValue = await loadConfig({
          environmentVariableSelector: (env) => {
            const envValue = env[AWS_EC2_METADATA_V1_DISABLED];
            fallbackBlockedFromProcessEnv = !!envValue && envValue !== "false";
            if (envValue === undefined) {
              throw new CredentialsProviderError(`${AWS_EC2_METADATA_V1_DISABLED} not set in env, checking config file next.`, { logger: init.logger });
            }
            return fallbackBlockedFromProcessEnv;
          },
          configFileSelector: (profile2) => {
            const profileValue = profile2[PROFILE_AWS_EC2_METADATA_V1_DISABLED];
            fallbackBlockedFromProfile = !!profileValue && profileValue !== "false";
            return fallbackBlockedFromProfile;
          },
          default: false
        }, {
          profile
        })();
        if (init.ec2MetadataV1Disabled || configValue) {
          const causes = [];
          if (init.ec2MetadataV1Disabled)
            causes.push("credential provider initialization (runtime option ec2MetadataV1Disabled)");
          if (fallbackBlockedFromProfile)
            causes.push(`config file profile (${PROFILE_AWS_EC2_METADATA_V1_DISABLED})`);
          if (fallbackBlockedFromProcessEnv)
            causes.push(`process environment variable (${AWS_EC2_METADATA_V1_DISABLED})`);
          throw new InstanceMetadataV1FallbackError(`AWS EC2 Metadata v1 fallback has been blocked by AWS SDK configuration in the following: [${causes.join(", ")}].`);
        }
      }
      const imdsProfile = (await retry(async () => {
        let profile2;
        try {
          profile2 = await getProfile(options);
        } catch (err) {
          if (err.statusCode === 401) {
            disableFetchToken = false;
          }
          throw err;
        }
        return profile2;
      }, maxRetries2)).trim();
      return retry(async () => {
        let creds;
        try {
          creds = await getCredentialsFromProfile(imdsProfile, options, init);
        } catch (err) {
          if (err.statusCode === 401) {
            disableFetchToken = false;
          }
          throw err;
        }
        return creds;
      }, maxRetries2);
    };
    return async () => {
      const endpoint = await getInstanceMetadataEndpoint();
      if (disableFetchToken) {
        logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (no token fetch)");
        return getCredentials(maxRetries, { ...endpoint, timeout });
      } else {
        let token;
        try {
          token = (await getMetadataToken({ ...endpoint, timeout })).toString();
        } catch (error) {
          if (error?.statusCode === 400) {
            throw Object.assign(error, {
              message: "EC2 Metadata token request returned error"
            });
          } else if (error.message === "TimeoutError" || [403, 404, 405].includes(error.statusCode)) {
            disableFetchToken = true;
          }
          logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (initial)");
          return getCredentials(maxRetries, { ...endpoint, timeout });
        }
        return getCredentials(maxRetries, {
          ...endpoint,
          headers: {
            [X_AWS_EC2_METADATA_TOKEN]: token
          },
          timeout
        });
      }
    };
  };
  var getMetadataToken = async (options) => httpRequest({
    ...options,
    path: IMDS_TOKEN_PATH,
    method: "PUT",
    headers: {
      "x-aws-ec2-metadata-token-ttl-seconds": "21600"
    }
  });
  var getProfile = async (options) => (await httpRequest({ ...options, path: IMDS_PATH })).toString();
  var getCredentialsFromProfile = async (profile, options, init) => {
    const credentialsResponse = JSON.parse((await httpRequest({
      ...options,
      path: IMDS_PATH + profile
    })).toString());
    if (!isImdsCredentials(credentialsResponse)) {
      throw new CredentialsProviderError("Invalid response received from instance metadata service.", {
        logger: init.logger
      });
    }
    return fromImdsCredentials(credentialsResponse);
  };
  exports.DEFAULT_MAX_RETRIES = DEFAULT_MAX_RETRIES;
  exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
  exports.ENV_CMDS_AUTH_TOKEN = ENV_CMDS_AUTH_TOKEN;
  exports.ENV_CMDS_FULL_URI = ENV_CMDS_FULL_URI;
  exports.ENV_CMDS_RELATIVE_URI = ENV_CMDS_RELATIVE_URI;
  exports.Endpoint = Endpoint;
  exports.fromContainerMetadata = fromContainerMetadata;
  exports.fromInstanceMetadata = fromInstanceMetadata;
  exports.getInstanceMetadataEndpoint = getInstanceMetadataEndpoint;
  exports.httpRequest = httpRequest;
  exports.providerConfigFromInit = providerConfigFromInit;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-http@3.972.51/node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/checkUrl.js
var require_checkUrl = __commonJS((exports) => {
  var { CredentialsProviderError } = require_config();
  var ECS_CONTAINER_HOST = "169.254.170.2";
  var EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
  var EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
  exports.checkUrl = (url, logger) => {
    if (url.protocol === "https:") {
      return;
    }
    if (url.hostname === ECS_CONTAINER_HOST || url.hostname === EKS_CONTAINER_HOST_IPv4 || url.hostname === EKS_CONTAINER_HOST_IPv6) {
      return;
    }
    if (url.hostname.includes("[")) {
      if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") {
        return;
      }
    } else {
      if (url.hostname === "localhost") {
        return;
      }
      const ipComponents = url.hostname.split(".");
      const inRange = (component) => {
        const num = parseInt(component, 10);
        return 0 <= num && num <= 255;
      };
      if (ipComponents[0] === "127" && inRange(ipComponents[1]) && inRange(ipComponents[2]) && inRange(ipComponents[3]) && ipComponents.length === 4) {
        return;
      }
    }
    throw new CredentialsProviderError(`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, { logger });
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-http@3.972.51/node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/requestHelpers.js
var require_requestHelpers = __commonJS((exports) => {
  var { CredentialsProviderError } = require_config();
  var { HttpRequest } = require_protocols();
  var { parseRfc3339DateTime } = require_serde();
  var { sdkStreamMixin } = require_serde();
  exports.createGetRequest = function createGetRequest(url) {
    return new HttpRequest({
      protocol: url.protocol,
      hostname: url.hostname,
      port: Number(url.port),
      path: url.pathname,
      query: Array.from(url.searchParams.entries()).reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {}),
      fragment: url.hash
    });
  };
  exports.getCredentials = async function getCredentials(response, logger) {
    const stream = sdkStreamMixin(response.body);
    const str = await stream.transformToString();
    if (response.statusCode === 200) {
      const parsed = JSON.parse(str);
      if (typeof parsed.AccessKeyId !== "string" || typeof parsed.SecretAccessKey !== "string" || typeof parsed.Token !== "string" || typeof parsed.Expiration !== "string") {
        throw new CredentialsProviderError("HTTP credential provider response not of the required format, an object matching: " + "{ AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", { logger });
      }
      return {
        accessKeyId: parsed.AccessKeyId,
        secretAccessKey: parsed.SecretAccessKey,
        sessionToken: parsed.Token,
        expiration: parseRfc3339DateTime(parsed.Expiration)
      };
    }
    if (response.statusCode >= 400 && response.statusCode < 500) {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(str);
      } catch (e) {}
      throw Object.assign(new CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger }), {
        Code: parsedBody.Code,
        Message: parsedBody.Message
      });
    }
    throw new CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger });
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-http@3.972.51/node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/retry-wrapper.js
var require_retry_wrapper = __commonJS((exports) => {
  exports.retryWrapper = (toRetry, maxRetries, delayMs) => {
    return async () => {
      for (let i = 0;i < maxRetries; ++i) {
        try {
          return await toRetry();
        } catch (e) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      return await toRetry();
    };
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-http@3.972.51/node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/fromHttp.js
var require_fromHttp = __commonJS((exports) => {
  var { setCredentialFeature } = require_client2();
  var { CredentialsProviderError } = require_config();
  var { NodeHttpHandler } = require_dist_cjs2();
  var fs = __require("node:fs/promises");
  var { checkUrl } = require_checkUrl();
  var { createGetRequest, getCredentials } = require_requestHelpers();
  var { retryWrapper } = require_retry_wrapper();
  var AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
  var DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
  var AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
  var AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
  var AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
  exports.fromHttp = (options = {}) => {
    options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
    let host;
    const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
    const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
    const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
    const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
    const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn ? console.warn : options.logger.warn.bind(options.logger);
    if (relative && full) {
      warn("@aws-sdk/credential-provider-http: " + "you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
      warn("awsContainerCredentialsFullUri will take precedence.");
    }
    if (token && tokenFile) {
      warn("@aws-sdk/credential-provider-http: " + "you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
      warn("awsContainerAuthorizationToken will take precedence.");
    }
    if (full) {
      host = full;
    } else if (relative) {
      host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
    } else {
      throw new CredentialsProviderError(`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, { logger: options.logger });
    }
    const url = new URL(host);
    checkUrl(url, options.logger);
    const requestHandler = NodeHttpHandler.create({ connectionTimeout: options.timeout ?? 1000 });
    const requestTimeout = options.timeout ?? 1000;
    const provider = retryWrapper(async () => {
      const request = createGetRequest(url);
      if (token) {
        request.headers.Authorization = token;
      } else if (tokenFile) {
        request.headers.Authorization = (await fs.readFile(tokenFile)).toString();
      }
      try {
        const result = await requestHandler.handle(request, { requestTimeout });
        return getCredentials(result.response).then((creds) => setCredentialFeature(creds, "CREDENTIALS_HTTP", "z"));
      } catch (e) {
        throw new CredentialsProviderError(String(e), { logger: options.logger });
      }
    }, options.maxRetries ?? 3, options.timeout ?? 1000);
    return async () => {
      try {
        return await provider();
      } finally {
        requestHandler.destroy?.();
      }
    };
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-http@3.972.51/node_modules/@aws-sdk/credential-provider-http/dist-cjs/index.js
var require_dist_cjs6 = __commonJS((exports) => {
  var { fromHttp } = require_fromHttp();
  exports.fromHttp = fromHttp;
});

// ../../node_modules/.bun/@smithy+signature-v4@5.5.2/node_modules/@smithy/signature-v4/dist-cjs/index.js
var require_dist_cjs7 = __commonJS((exports) => {
  var { fromUtf8, fromHex, toHex, toUint8Array, isArrayBuffer } = require_serde();
  var { normalizeProvider } = require_client();
  var { escapeUri, HttpRequest } = require_protocols();

  class HeaderFormatter {
    format(headers) {
      const chunks = [];
      for (const headerName of Object.keys(headers)) {
        const bytes = fromUtf8(headerName);
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
          const utf8Bytes = fromUtf8(header.value);
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
  var UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

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
  var ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
  var CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
  var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
  var SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
  var EXPIRES_QUERY_PARAM = "X-Amz-Expires";
  var SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
  var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
  var REGION_SET_PARAM = "X-Amz-Region-Set";
  var AUTH_HEADER = "authorization";
  var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
  var DATE_HEADER = "date";
  var GENERATED_HEADERS = [AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER];
  var SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
  var SHA256_HEADER = "x-amz-content-sha256";
  var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
  var HOST_HEADER = "host";
  var ALWAYS_UNSIGNABLE_HEADERS = {
    authorization: true,
    "cache-control": true,
    connection: true,
    expect: true,
    from: true,
    "keep-alive": true,
    "max-forwards": true,
    pragma: true,
    referer: true,
    te: true,
    trailer: true,
    "transfer-encoding": true,
    upgrade: true,
    "user-agent": true,
    "x-amzn-trace-id": true
  };
  var PROXY_HEADER_PATTERN = /^proxy-/;
  var SEC_HEADER_PATTERN = /^sec-/;
  var UNSIGNABLE_PATTERNS = [/^proxy-/i, /^sec-/i];
  var ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
  var ALGORITHM_IDENTIFIER_V4A = "AWS4-ECDSA-P256-SHA256";
  var EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
  var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
  var MAX_CACHE_SIZE = 50;
  var KEY_TYPE_IDENTIFIER = "aws4_request";
  var MAX_PRESIGNED_TTL = 60 * 60 * 24 * 7;
  var getCanonicalQuery = ({ query = {} }) => {
    const keys = [];
    const serialized = {};
    for (const key of Object.keys(query)) {
      if (key.toLowerCase() === SIGNATURE_HEADER) {
        continue;
      }
      const encodedKey = escapeUri(key);
      keys.push(encodedKey);
      const value = query[key];
      if (typeof value === "string") {
        serialized[encodedKey] = `${encodedKey}=${escapeUri(value)}`;
      } else if (Array.isArray(value)) {
        serialized[encodedKey] = value.slice(0).reduce((encoded, value2) => encoded.concat([`${encodedKey}=${escapeUri(value2)}`]), []).sort().join("&");
      }
    }
    return keys.sort().map((key) => serialized[key]).filter((serialized2) => serialized2).join("&");
  };
  var iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
  var toDate = (time) => {
    if (typeof time === "number") {
      return new Date(time * 1000);
    }
    if (typeof time === "string") {
      if (Number(time)) {
        return new Date(Number(time) * 1000);
      }
      return new Date(time);
    }
    return time;
  };

  class SignatureV4Base {
    service;
    regionProvider;
    credentialProvider;
    sha256;
    uriEscapePath;
    applyChecksum;
    constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
      this.service = service;
      this.sha256 = sha256;
      this.uriEscapePath = uriEscapePath;
      this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
      this.regionProvider = normalizeProvider(region);
      this.credentialProvider = normalizeProvider(credentials);
    }
    createCanonicalRequest(request, canonicalHeaders, payloadHash) {
      const sortedHeaders = Object.keys(canonicalHeaders).sort();
      return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join(`
`)}

${sortedHeaders.join(";")}
${payloadHash}`;
    }
    async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
      const hash = new this.sha256;
      hash.update(toUint8Array(canonicalRequest));
      const hashedRequest = await hash.digest();
      return `${algorithmIdentifier}
${longDate}
${credentialScope}
${toHex(hashedRequest)}`;
    }
    getCanonicalPath({ path }) {
      if (this.uriEscapePath) {
        const normalizedPathSegments = [];
        for (const pathSegment of path.split("/")) {
          if (pathSegment?.length === 0)
            continue;
          if (pathSegment === ".")
            continue;
          if (pathSegment === "..") {
            normalizedPathSegments.pop();
          } else {
            normalizedPathSegments.push(pathSegment);
          }
        }
        const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
        const doubleEncoded = escapeUri(normalizedPath);
        return doubleEncoded.replace(/%2F/g, "/");
      }
      return path;
    }
    validateResolvedCredentials(credentials) {
      if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") {
        throw new Error("Resolved credential object is not valid");
      }
    }
    formatDate(now) {
      const longDate = iso8601(now).replace(/[\-:]/g, "");
      return {
        longDate,
        shortDate: longDate.slice(0, 8)
      };
    }
    getCanonicalHeaderList(headers) {
      return Object.keys(headers).sort().join(";");
    }
  }
  var signingKeyCache = {};
  var cacheQueue = [];
  var createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
  var getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
    const credsHash = await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
    const cacheKey = `${shortDate}:${region}:${service}:${toHex(credsHash)}:${credentials.sessionToken}`;
    if (cacheKey in signingKeyCache) {
      return signingKeyCache[cacheKey];
    }
    cacheQueue.push(cacheKey);
    while (cacheQueue.length > MAX_CACHE_SIZE) {
      delete signingKeyCache[cacheQueue.shift()];
    }
    let key = `AWS4${credentials.secretAccessKey}`;
    for (const signable of [shortDate, region, service, KEY_TYPE_IDENTIFIER]) {
      key = await hmac(sha256Constructor, key, signable);
    }
    return signingKeyCache[cacheKey] = key;
  };
  var clearCredentialCache = () => {
    cacheQueue.length = 0;
    Object.keys(signingKeyCache).forEach((cacheKey) => {
      delete signingKeyCache[cacheKey];
    });
  };
  var hmac = (ctor, secret, data) => {
    const hash = new ctor(secret);
    hash.update(toUint8Array(data));
    return hash.digest();
  };
  var getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
    const canonical = {};
    for (const headerName of Object.keys(headers).sort()) {
      if (headers[headerName] == undefined) {
        continue;
      }
      const canonicalHeaderName = headerName.toLowerCase();
      if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
        if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) {
          continue;
        }
      }
      canonical[canonicalHeaderName] = headers[headerName].trim().replace(/\s+/g, " ");
    }
    return canonical;
  };
  var getPayloadHash = async ({ headers, body }, hashConstructor) => {
    for (const headerName of Object.keys(headers)) {
      if (headerName.toLowerCase() === SHA256_HEADER) {
        return headers[headerName];
      }
    }
    if (body == undefined) {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    } else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
      const hashCtor = new hashConstructor;
      hashCtor.update(toUint8Array(body));
      return toHex(await hashCtor.digest());
    }
    return UNSIGNED_PAYLOAD;
  };
  var hasHeader = (soughtHeader, headers) => {
    soughtHeader = soughtHeader.toLowerCase();
    for (const headerName of Object.keys(headers)) {
      if (soughtHeader === headerName.toLowerCase()) {
        return true;
      }
    }
    return false;
  };
  var moveHeadersToQuery = (request, options = {}) => {
    const { headers, query = {} } = HttpRequest.clone(request);
    for (const name of Object.keys(headers)) {
      const lname = name.toLowerCase();
      if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
        query[name] = headers[name];
        delete headers[name];
      }
    }
    return {
      ...request,
      headers,
      query
    };
  };
  var prepareRequest = (request) => {
    request = HttpRequest.clone(request);
    for (const headerName of Object.keys(request.headers)) {
      if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) {
        delete request.headers[headerName];
      }
    }
    return request;
  };

  class SignatureV4 extends SignatureV4Base {
    headerFormatter = new HeaderFormatter;
    constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
      super({
        applyChecksum,
        credentials,
        region,
        service,
        sha256,
        uriEscapePath
      });
    }
    async presign(originalRequest, options = {}) {
      const { signingDate = new Date, expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
      const credentials = await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const { longDate, shortDate } = this.formatDate(signingDate);
      if (expiresIn > MAX_PRESIGNED_TTL) {
        return Promise.reject("Signature version 4 presigned URLs" + " must have an expiration date less than one week in" + " the future");
      }
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const request = moveHeadersToQuery(prepareRequest(originalRequest), { unhoistableHeaders, hoistableHeaders });
      if (credentials.sessionToken) {
        request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
      }
      request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
      request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
      request.query[AMZ_DATE_QUERY_PARAM] = longDate;
      request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
      request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
      return request;
    }
    async sign(toSign, options) {
      if (typeof toSign === "string") {
        return this.signString(toSign, options);
      } else if (toSign.headers && toSign.payload) {
        return this.signEvent(toSign, options);
      } else if (toSign.message) {
        return this.signMessage(toSign, options);
      } else {
        return this.signRequest(toSign, options);
      }
    }
    async signEvent({ headers, payload }, { signingDate = new Date, priorSignature, signingRegion, signingService, eventStreamCredentials }) {
      const region = signingRegion ?? await this.regionProvider();
      const { shortDate, longDate } = this.formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const hashedPayload = await getPayloadHash({ headers: {}, body: payload }, this.sha256);
      const hash = new this.sha256;
      hash.update(headers);
      const hashedHeaders = toHex(await hash.digest());
      const stringToSign = [
        EVENT_ALGORITHM_IDENTIFIER,
        longDate,
        scope,
        priorSignature,
        hashedHeaders,
        hashedPayload
      ].join(`
`);
      return this.signString(stringToSign, {
        signingDate,
        signingRegion: region,
        signingService,
        eventStreamCredentials
      });
    }
    async signMessage(signableMessage, { signingDate = new Date, signingRegion, signingService, eventStreamCredentials }) {
      const promise = this.signEvent({
        headers: this.headerFormatter.format(signableMessage.message.headers),
        payload: signableMessage.message.body
      }, {
        signingDate,
        signingRegion,
        signingService,
        priorSignature: signableMessage.priorSignature,
        eventStreamCredentials
      });
      return promise.then((signature) => {
        return { message: signableMessage.message, signature };
      });
    }
    async signString(stringToSign, { signingDate = new Date, signingRegion, signingService, eventStreamCredentials } = {}) {
      const credentials = eventStreamCredentials ?? await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const { shortDate } = this.formatDate(signingDate);
      const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
      hash.update(toUint8Array(stringToSign));
      return toHex(await hash.digest());
    }
    async signRequest(requestToSign, { signingDate = new Date, signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
      const credentials = await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const request = prepareRequest(requestToSign);
      const { longDate, shortDate } = this.formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      request.headers[AMZ_DATE_HEADER] = longDate;
      if (credentials.sessionToken) {
        request.headers[TOKEN_HEADER] = credentials.sessionToken;
      }
      const payloadHash = await getPayloadHash(request, this.sha256);
      if (!hasHeader(SHA256_HEADER, request.headers) && this.applyChecksum) {
        request.headers[SHA256_HEADER] = payloadHash;
      }
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
      request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} ` + `Credential=${credentials.accessKeyId}/${scope}, ` + `SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, ` + `Signature=${signature}`;
      return request;
    }
    async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
      const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
      const hash = new this.sha256(await keyPromise);
      hash.update(toUint8Array(stringToSign));
      return toHex(await hash.digest());
    }
    getSigningKey(credentials, region, shortDate, service) {
      return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
    }
  }
  var signatureV4aContainer = {
    SignatureV4a: null
  };
  exports.ALGORITHM_IDENTIFIER = ALGORITHM_IDENTIFIER;
  exports.ALGORITHM_IDENTIFIER_V4A = ALGORITHM_IDENTIFIER_V4A;
  exports.ALGORITHM_QUERY_PARAM = ALGORITHM_QUERY_PARAM;
  exports.ALWAYS_UNSIGNABLE_HEADERS = ALWAYS_UNSIGNABLE_HEADERS;
  exports.AMZ_DATE_HEADER = AMZ_DATE_HEADER;
  exports.AMZ_DATE_QUERY_PARAM = AMZ_DATE_QUERY_PARAM;
  exports.AUTH_HEADER = AUTH_HEADER;
  exports.CREDENTIAL_QUERY_PARAM = CREDENTIAL_QUERY_PARAM;
  exports.DATE_HEADER = DATE_HEADER;
  exports.EVENT_ALGORITHM_IDENTIFIER = EVENT_ALGORITHM_IDENTIFIER;
  exports.EXPIRES_QUERY_PARAM = EXPIRES_QUERY_PARAM;
  exports.GENERATED_HEADERS = GENERATED_HEADERS;
  exports.HOST_HEADER = HOST_HEADER;
  exports.KEY_TYPE_IDENTIFIER = KEY_TYPE_IDENTIFIER;
  exports.MAX_CACHE_SIZE = MAX_CACHE_SIZE;
  exports.MAX_PRESIGNED_TTL = MAX_PRESIGNED_TTL;
  exports.PROXY_HEADER_PATTERN = PROXY_HEADER_PATTERN;
  exports.REGION_SET_PARAM = REGION_SET_PARAM;
  exports.SEC_HEADER_PATTERN = SEC_HEADER_PATTERN;
  exports.SHA256_HEADER = SHA256_HEADER;
  exports.SIGNATURE_HEADER = SIGNATURE_HEADER;
  exports.SIGNATURE_QUERY_PARAM = SIGNATURE_QUERY_PARAM;
  exports.SIGNED_HEADERS_QUERY_PARAM = SIGNED_HEADERS_QUERY_PARAM;
  exports.SignatureV4 = SignatureV4;
  exports.SignatureV4Base = SignatureV4Base;
  exports.TOKEN_HEADER = TOKEN_HEADER;
  exports.TOKEN_QUERY_PARAM = TOKEN_QUERY_PARAM;
  exports.UNSIGNABLE_PATTERNS = UNSIGNABLE_PATTERNS;
  exports.UNSIGNED_PAYLOAD = UNSIGNED_PAYLOAD;
  exports.clearCredentialCache = clearCredentialCache;
  exports.createScope = createScope;
  exports.getCanonicalHeaders = getCanonicalHeaders;
  exports.getCanonicalQuery = getCanonicalQuery;
  exports.getPayloadHash = getPayloadHash;
  exports.getSigningKey = getSigningKey;
  exports.hasHeader = hasHeader;
  exports.moveHeadersToQuery = moveHeadersToQuery;
  exports.prepareRequest = prepareRequest;
  exports.signatureV4aContainer = signatureV4aContainer;
});

// ../../node_modules/.bun/@aws-sdk+core@3.974.23/node_modules/@aws-sdk/core/dist-cjs/submodules/httpAuthSchemes/index.js
var require_httpAuthSchemes = __commonJS((exports) => {
  var { HttpResponse, HttpRequest } = require_protocols();
  var { normalizeProvider, memoizeIdentityProvider, isIdentityExpired, doesIdentityRequireRefresh } = require_dist_cjs3();
  var { ProviderError } = require_config();
  var { setCredentialFeature } = require_client2();
  var { SignatureV4 } = require_dist_cjs7();
  var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : undefined;
  var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);
  var isClockSkewed = (clockTime, systemClockOffset) => Math.abs(getSkewCorrectedDate(systemClockOffset).getTime() - clockTime) >= 300000;
  var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset) => {
    const clockTimeInMs = Date.parse(clockTime);
    if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) {
      return clockTimeInMs - Date.now();
    }
    return currentSystemClockOffset;
  };
  var throwSigningPropertyError = (name, property) => {
    if (!property) {
      throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
    }
    return property;
  };
  var validateSigningProperties = async (signingProperties) => {
    const context = throwSigningPropertyError("context", signingProperties.context);
    const config = throwSigningPropertyError("config", signingProperties.config);
    const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
    const signerFunction = throwSigningPropertyError("signer", config.signer);
    const signer = await signerFunction(authScheme);
    const signingRegion = signingProperties?.signingRegion;
    const signingRegionSet = signingProperties?.signingRegionSet;
    const signingName = signingProperties?.signingName;
    return {
      config,
      signer,
      signingRegion,
      signingRegionSet,
      signingName
    };
  };

  class AwsSdkSigV4Signer {
    async sign(httpRequest, identity, signingProperties) {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const validatedProps = await validateSigningProperties(signingProperties);
      const { config, signer } = validatedProps;
      let { signingRegion, signingName } = validatedProps;
      const handlerExecutionContext = signingProperties.context;
      if (handlerExecutionContext?.authSchemes?.length ?? 0 > 1) {
        const [first, second] = handlerExecutionContext.authSchemes;
        if (first?.name === "sigv4a" && second?.name === "sigv4") {
          signingRegion = second?.signingRegion ?? signingRegion;
          signingName = second?.signingName ?? signingName;
        }
      }
      signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
      const signedRequest = await signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config.systemClockOffset),
        signingRegion,
        signingService: signingName
      });
      return signedRequest;
    }
    errorHandler(signingProperties) {
      return (error) => {
        const errorException = error;
        const serverTime = errorException.ServerTime ?? getDateHeader(errorException.$response);
        if (serverTime) {
          const config = throwSigningPropertyError("config", signingProperties.config);
          const preRequestOffset = signingProperties._preRequestSystemClockOffset;
          const newOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset);
          const isLocalCorrection = newOffset !== config.systemClockOffset;
          const isConcurrentCorrection = preRequestOffset !== undefined && preRequestOffset !== newOffset;
          const clockSkewCorrected = isLocalCorrection || isConcurrentCorrection;
          if (clockSkewCorrected && errorException.$metadata) {
            config.systemClockOffset = newOffset;
            errorException.$metadata.clockSkewCorrected = true;
          }
        }
        throw error;
      };
    }
    successHandler(httpResponse, signingProperties) {
      const dateHeader = getDateHeader(httpResponse);
      if (dateHeader) {
        const config = throwSigningPropertyError("config", signingProperties.config);
        config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset);
      }
    }
  }
  var AWSSDKSigV4Signer = AwsSdkSigV4Signer;

  class AwsSdkSigV4ASigner extends AwsSdkSigV4Signer {
    async sign(httpRequest, identity, signingProperties) {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const { config, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
      const configResolvedSigningRegionSet = await config.sigv4aSigningRegionSet?.();
      const multiRegionOverride = (configResolvedSigningRegionSet ?? signingRegionSet ?? [signingRegion]).join(",");
      signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
      const signedRequest = await signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config.systemClockOffset),
        signingRegion: multiRegionOverride,
        signingService: signingName
      });
      return signedRequest;
    }
  }
  var getArrayForCommaSeparatedString = (str) => typeof str === "string" && str.length > 0 ? str.split(",").map((item) => item.trim()) : [];
  var getBearerTokenEnvKey = (signingName) => `AWS_BEARER_TOKEN_${signingName.replace(/[\s-]/g, "_").toUpperCase()}`;
  var NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY = "AWS_AUTH_SCHEME_PREFERENCE";
  var NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY = "auth_scheme_preference";
  var NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = {
    environmentVariableSelector: (env, options) => {
      if (options?.signingName) {
        const bearerTokenKey = getBearerTokenEnvKey(options.signingName);
        if (bearerTokenKey in env)
          return ["httpBearerAuth"];
      }
      if (!(NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY in env))
        return;
      return getArrayForCommaSeparatedString(env[NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY]);
    },
    configFileSelector: (profile) => {
      if (!(NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY in profile))
        return;
      return getArrayForCommaSeparatedString(profile[NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY]);
    },
    default: []
  };
  var resolveAwsSdkSigV4AConfig = (config) => {
    config.sigv4aSigningRegionSet = normalizeProvider(config.sigv4aSigningRegionSet);
    return config;
  };
  var NODE_SIGV4A_CONFIG_OPTIONS = {
    environmentVariableSelector(env) {
      if (env.AWS_SIGV4A_SIGNING_REGION_SET) {
        return env.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
      }
      throw new ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", {
        tryNextLink: true
      });
    },
    configFileSelector(profile) {
      if (profile.sigv4a_signing_region_set) {
        return (profile.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
      }
      throw new ProviderError("sigv4a_signing_region_set not set in profile.", {
        tryNextLink: true
      });
    },
    default: undefined
  };
  var resolveAwsSdkSigV4Config = (config) => {
    let inputCredentials = config.credentials;
    let isUserSupplied = !!config.credentials;
    let resolvedCredentials = undefined;
    Object.defineProperty(config, "credentials", {
      set(credentials) {
        if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) {
          isUserSupplied = true;
        }
        inputCredentials = credentials;
        const memoizedProvider = normalizeCredentialProvider(config, {
          credentials: inputCredentials,
          credentialDefaultProvider: config.credentialDefaultProvider
        });
        const boundProvider = bindCallerConfig(config, memoizedProvider);
        if (isUserSupplied && !boundProvider.attributed) {
          const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
          resolvedCredentials = async (options) => {
            const creds = await boundProvider(options);
            const attributedCreds = creds;
            if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) {
              return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
            }
            return attributedCreds;
          };
          resolvedCredentials.memoized = boundProvider.memoized;
          resolvedCredentials.configBound = boundProvider.configBound;
          resolvedCredentials.attributed = true;
        } else {
          resolvedCredentials = boundProvider;
        }
      },
      get() {
        return resolvedCredentials;
      },
      enumerable: true,
      configurable: true
    });
    config.credentials = inputCredentials;
    const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
    let signer;
    if (config.signer) {
      signer = normalizeProvider(config.signer);
    } else if (config.regionInfoProvider) {
      signer = () => normalizeProvider(config.region)().then(async (region) => [
        await config.regionInfoProvider(region, {
          useFipsEndpoint: await config.useFipsEndpoint(),
          useDualstackEndpoint: await config.useDualstackEndpoint()
        }) || {},
        region
      ]).then(([regionInfo, region]) => {
        const { signingRegion, signingService } = regionInfo;
        config.signingRegion = config.signingRegion || signingRegion || region;
        config.signingName = config.signingName || signingService || config.serviceId;
        const params = {
          ...config,
          credentials: config.credentials,
          region: config.signingRegion,
          service: config.signingName,
          sha256,
          uriEscapePath: signingEscapePath
        };
        const SignerCtor = config.signerConstructor || SignatureV4;
        return new SignerCtor(params);
      });
    } else {
      signer = async (authScheme) => {
        authScheme = Object.assign({}, {
          name: "sigv4",
          signingName: config.signingName || config.defaultSigningName,
          signingRegion: await normalizeProvider(config.region)(),
          properties: {}
        }, authScheme);
        const signingRegion = authScheme.signingRegion;
        const signingService = authScheme.signingName;
        config.signingRegion = config.signingRegion || signingRegion;
        config.signingName = config.signingName || signingService || config.serviceId;
        const params = {
          ...config,
          credentials: config.credentials,
          region: config.signingRegion,
          service: config.signingName,
          sha256,
          uriEscapePath: signingEscapePath
        };
        const SignerCtor = config.signerConstructor || SignatureV4;
        return new SignerCtor(params);
      };
    }
    const resolvedConfig = Object.assign(config, {
      systemClockOffset,
      signingEscapePath,
      signer
    });
    return resolvedConfig;
  };
  var resolveAWSSDKSigV4Config = resolveAwsSdkSigV4Config;
  function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
    let credentialsProvider;
    if (credentials) {
      if (!credentials?.memoized) {
        credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
      } else {
        credentialsProvider = credentials;
      }
    } else {
      if (credentialDefaultProvider) {
        credentialsProvider = normalizeProvider(credentialDefaultProvider(Object.assign({}, config, {
          parentClientConfig: config
        })));
      } else {
        credentialsProvider = async () => {
          throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
        };
      }
    }
    credentialsProvider.memoized = true;
    return credentialsProvider;
  }
  function bindCallerConfig(config, credentialsProvider) {
    if (credentialsProvider.configBound) {
      return credentialsProvider;
    }
    const fn = async (options) => credentialsProvider({ ...options, callerClientConfig: config });
    fn.memoized = credentialsProvider.memoized;
    fn.configBound = true;
    return fn;
  }
  exports.AWSSDKSigV4Signer = AWSSDKSigV4Signer;
  exports.AwsSdkSigV4ASigner = AwsSdkSigV4ASigner;
  exports.AwsSdkSigV4Signer = AwsSdkSigV4Signer;
  exports.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = NODE_AUTH_SCHEME_PREFERENCE_OPTIONS;
  exports.NODE_SIGV4A_CONFIG_OPTIONS = NODE_SIGV4A_CONFIG_OPTIONS;
  exports.getBearerTokenEnvKey = getBearerTokenEnvKey;
  exports.resolveAWSSDKSigV4Config = resolveAWSSDKSigV4Config;
  exports.resolveAwsSdkSigV4AConfig = resolveAwsSdkSigV4AConfig;
  exports.resolveAwsSdkSigV4Config = resolveAwsSdkSigV4Config;
  exports.validateSigningProperties = validateSigningProperties;
});

// ../../node_modules/.bun/@smithy+core@3.26.0/node_modules/@smithy/core/dist-cjs/submodules/cbor/index.js
var require_cbor = __commonJS((exports) => {
  var { nv, NumericValue, calculateBodyLength, _parseEpochTimestamp, fromBase64, generateIdempotencyToken } = require_serde();
  var { HttpRequest, collectBody, SerdeContext, RpcProtocol } = require_protocols();
  var { NormalizedSchema, deref, TypeRegistry } = require_schema();
  var { getSmithyContext } = require_transport();
  var majorUint64 = 0;
  var majorNegativeInt64 = 1;
  var majorUnstructuredByteString = 2;
  var majorUtf8String = 3;
  var majorList = 4;
  var majorMap = 5;
  var majorTag = 6;
  var majorSpecial = 7;
  var specialFalse = 20;
  var specialTrue = 21;
  var specialNull = 22;
  var specialUndefined = 23;
  var extendedOneByte = 24;
  var extendedFloat16 = 25;
  var extendedFloat32 = 26;
  var extendedFloat64 = 27;
  var minorIndefinite = 31;
  function alloc(size) {
    return typeof Buffer !== "undefined" ? Buffer.alloc(size) : new Uint8Array(size);
  }
  var tagSymbol = Symbol("@smithy/core/cbor::tagSymbol");
  function tag(data2) {
    data2[tagSymbol] = true;
    return data2;
  }
  var USE_BUFFER$1 = typeof Buffer !== "undefined";
  var textDecoder = new TextDecoder;
  var payload = alloc(0);
  var isBuffer = false;
  var dataView$1 = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  var _offset = 0;
  function setPayload(bytes) {
    payload = bytes;
    isBuffer = USE_BUFFER$1 && payload instanceof Buffer;
    dataView$1 = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  }
  function decode(at, to) {
    if (at >= to) {
      throw new Error("unexpected end of (decode) payload.");
    }
    const major = (payload[at] & 224) >> 5;
    const minor = payload[at] & 31;
    if (minor === minorIndefinite && 2 <= major && major <= 5) {
      return decodeIndefinite(at, to);
    }
    switch (major) {
      case majorUint64:
      case majorNegativeInt64:
      case majorTag: {
        let unsignedInt;
        let offset;
        if (minor < 24) {
          unsignedInt = minor;
          offset = 1;
        } else {
          switch (minor) {
            case extendedOneByte:
              if (to - at < 2) {
                overflow(1);
              }
              unsignedInt = payload[at + 1];
              offset = 2;
              break;
            case extendedFloat16:
              if (to - at < 3) {
                overflow(2);
              }
              unsignedInt = dataView$1.getUint16(at + 1);
              offset = 3;
              break;
            case extendedFloat32:
              if (to - at < 5) {
                overflow(4);
              }
              unsignedInt = dataView$1.getUint32(at + 1);
              offset = 5;
              break;
            case extendedFloat64:
              if (to - at < 9) {
                overflow(8);
              }
              {
                const hi = dataView$1.getUint32(at + 1);
                if (hi < 2097152) {
                  unsignedInt = hi * 4294967296 + dataView$1.getUint32(at + 5);
                } else {
                  unsignedInt = dataView$1.getBigUint64(at + 1);
                }
              }
              offset = 9;
              break;
            default:
              unexpectedMinor(minor);
          }
        }
        if (major === majorUint64) {
          _offset = offset;
          return castBigInt(unsignedInt);
        } else if (major === majorNegativeInt64) {
          let negativeInt;
          if (typeof unsignedInt === "bigint") {
            negativeInt = BigInt(-1) - unsignedInt;
          } else {
            negativeInt = -1 - unsignedInt;
          }
          _offset = offset;
          return castBigInt(negativeInt);
        } else {
          return decodeTagValue(at, to, minor, unsignedInt, offset);
        }
      }
      case majorUtf8String:
        return decodeUtf8String(at, to);
      case majorMap:
        return decodeMap(at, to);
      case majorList:
        return decodeList(at, to);
      case majorUnstructuredByteString:
        return decodeUnstructuredByteString(at, to);
      default:
        return decodeSpecial(at, to);
    }
  }
  function decodeIndefinite(at, to) {
    const major = (payload[at] & 224) >> 5;
    const minor = payload[at] & 31;
    if (minor === minorIndefinite) {
      switch (major) {
        case majorUtf8String:
          return decodeUtf8StringIndefinite(at, to);
        case majorMap:
          return decodeMapIndefinite(at, to);
        case majorList:
          return decodeListIndefinite(at, to);
        case majorUnstructuredByteString:
          return decodeUnstructuredByteStringIndefinite(at, to);
      }
    }
  }
  function bytesToFloat16(a, b) {
    const sign = a >> 7;
    const exponent = (a & 124) >> 2;
    const fraction = (a & 3) << 8 | b;
    const scalar = sign === 0 ? 1 : -1;
    if (exponent === 0) {
      if (fraction === 0) {
        return 0;
      }
      return scalar * (Math.pow(2, 1 - 15) * (fraction / 1024));
    } else if (exponent === 31) {
      if (fraction === 0) {
        return scalar * Infinity;
      }
      return NaN;
    }
    return scalar * (Math.pow(2, exponent - 15) * (1 + fraction / 1024));
  }
  function decodeMap(at, to) {
    const mapDataLength = decodeCount(at, to);
    if (mapDataLength < 15) {
      return decodeMapSmall(at, to, mapDataLength);
    }
    return decodeMapLarge(at, to, mapDataLength);
  }
  function decodeMapLarge(at, to, mapDataLength) {
    const offset = _offset;
    at += offset;
    const base = at;
    const map = Object.create(null);
    for (let i = 0;i < mapDataLength; ++i) {
      const key = decodeUtf8String(at, to);
      at += _offset;
      const valMajor = (payload[at] & 224) >> 5;
      if (valMajor === majorUtf8String) {
        map[key] = decodeUtf8String(at, to);
      } else {
        map[key] = decode(at, to);
      }
      at += _offset;
    }
    _offset = offset + (at - base);
    Object.setPrototypeOf(map, Object.prototype);
    return map;
  }
  function decodeMapSmall(at, to, mapDataLength) {
    const offset = _offset;
    at += offset;
    const base = at;
    const map = {};
    for (let i = 0;i < mapDataLength; ++i) {
      const key = decodeUtf8String(at, to);
      at += _offset;
      map[key] = decode(at, to);
      at += _offset;
    }
    _offset = offset + (at - base);
    return map;
  }
  function decodeList(at, to) {
    const listDataLength = decodeCount(at, to);
    const offset = _offset;
    at += offset;
    const base = at;
    const list = Array(listDataLength);
    for (let i = 0;i < listDataLength; ++i) {
      list[i] = decode(at, to);
      at += _offset;
    }
    _offset = offset + (at - base);
    return list;
  }
  function decodeUtf8String(at, to) {
    const length = decodeCount(at, to);
    const offset = _offset;
    at += offset;
    if (to - at < length) {
      overflow(length);
    }
    _offset = offset + length;
    if (length < 24) {
      return decodeUtf8StringCached(at, length);
    }
    if (isBuffer) {
      return payload.toString("utf-8", at, at + length);
    }
    return textDecoder.decode(payload.subarray(at, at + length));
  }
  var stringCache = new Array(2048);
  var stringCacheEpochs = new Uint16Array(2048);
  var cacheEpoch = 0;
  function advanceDecodingEpoch() {
    cacheEpoch = cacheEpoch + 1 & 65535;
  }
  function decodeUtf8StringCached(at, length) {
    let h = length;
    for (let i = 0;i < length; ++i) {
      h = h * 31 + payload[at + i] | 0;
    }
    const slot = h >>> 0 & 2047;
    const cached = stringCache[slot];
    if (cached !== undefined) {
      if (cached.length === length) {
        let match = true;
        for (let i = 0;i < length; ++i) {
          if (cached.charCodeAt(i) !== payload[at + i]) {
            match = false;
            break;
          }
        }
        if (match) {
          stringCacheEpochs[slot] = cacheEpoch;
          return cached;
        }
      }
    }
    const result = isBuffer ? payload.toString("utf-8", at, at + length) : textDecoder.decode(payload.subarray(at, at + length));
    if (stringCacheEpochs[slot] !== cacheEpoch) {
      stringCache[slot] = result;
      stringCacheEpochs[slot] = cacheEpoch;
    }
    return result;
  }
  function decodeUnstructuredByteString(at, to) {
    const length = decodeCount(at, to);
    const offset = _offset;
    at += offset;
    if (to - at < length) {
      overflow(length);
    }
    const value = payload.subarray(at, at + length);
    _offset = offset + length;
    return value;
  }
  function decodeTagValue(at, to, minor, unsignedInt, offset) {
    if (minor === 2 || minor === 3) {
      const length = decodeCount(at + offset, to);
      let b = BigInt(0);
      const start = at + offset + _offset;
      for (let i = start;i < start + length; ++i) {
        b = b << BigInt(8) | BigInt(payload[i]);
      }
      _offset = offset + _offset + length;
      return minor === 3 ? -b - BigInt(1) : b;
    } else if (minor === 4) {
      const decimalFraction = decode(at + offset, to);
      const [exponent, mantissa] = decimalFraction;
      const normalizer = mantissa < 0 ? -1 : 1;
      const mantissaStr = "0".repeat(Math.abs(exponent) + 1) + String(BigInt(normalizer) * BigInt(mantissa));
      let numericString;
      const sign = mantissa < 0 ? "-" : "";
      numericString = exponent === 0 ? mantissaStr : mantissaStr.slice(0, mantissaStr.length + exponent) + "." + mantissaStr.slice(exponent);
      numericString = numericString.replace(/^0+/g, "");
      if (numericString === "") {
        numericString = "0";
      }
      if (numericString[0] === ".") {
        numericString = "0" + numericString;
      }
      numericString = sign + numericString;
      _offset = offset + _offset;
      return nv(numericString);
    } else {
      const value = decode(at + offset, to);
      const valueOffset = _offset;
      _offset = offset + valueOffset;
      return tag({ tag: castBigInt(unsignedInt), value });
    }
  }
  function decodeSpecial(at, to) {
    const minor = payload[at] & 31;
    switch (minor) {
      case specialTrue:
      case specialFalse:
        _offset = 1;
        return minor === specialTrue;
      case specialNull:
        _offset = 1;
        return null;
      case specialUndefined:
        _offset = 1;
        return null;
      case extendedFloat16:
        if (to - at < 3) {
          throw new Error("incomplete float16 at end of buf.");
        }
        _offset = 3;
        return bytesToFloat16(payload[at + 1], payload[at + 2]);
      case extendedFloat32:
        if (to - at < 5) {
          throw new Error("incomplete float32 at end of buf.");
        }
        _offset = 5;
        return dataView$1.getFloat32(at + 1);
      case extendedFloat64:
        if (to - at < 9) {
          throw new Error("incomplete float64 at end of buf.");
        }
        _offset = 9;
        return dataView$1.getFloat64(at + 1);
      default:
        unexpectedMinor(minor);
    }
  }
  function decodeCount(at, to) {
    const minor = payload[at] & 31;
    if (minor < 24) {
      _offset = 1;
      return minor;
    }
    switch (minor) {
      case extendedOneByte:
        if (to - at < 2) {
          overflow(1);
        }
        _offset = 2;
        return payload[at + 1];
      case extendedFloat16:
        if (to - at < 3) {
          overflow(2);
        }
        _offset = 3;
        return dataView$1.getUint16(at + 1);
      case extendedFloat32:
        if (to - at < 5) {
          overflow(4);
        }
        _offset = 5;
        return dataView$1.getUint32(at + 1);
      case extendedFloat64:
        if (to - at < 9) {
          overflow(8);
        }
        _offset = 9;
        return demote(dataView$1.getBigUint64(at + 1));
      default:
        unexpectedMinor(minor);
    }
  }
  function decodeMapIndefinite(at, to) {
    at += 1;
    const base = at;
    const map = {};
    for (;at < to; ) {
      if (payload[at] === 255) {
        _offset = at - base + 2;
        return map;
      }
      const key = decodeUtf8String(at, to);
      at += _offset;
      map[key] = decode(at, to);
      at += _offset;
    }
    throw new Error("expected break marker.");
  }
  function decodeListIndefinite(at, to) {
    at += 1;
    const list = [];
    for (const base = at;at < to; ) {
      if (payload[at] === 255) {
        _offset = at - base + 2;
        return list;
      }
      list.push(decode(at, to));
      at += _offset;
    }
    throw new Error("expected break marker.");
  }
  function decodeUtf8StringIndefinite(at, to) {
    at += 1;
    const vector = [];
    for (const base = at;at < to; ) {
      if (payload[at] === 255) {
        const data2 = alloc(vector.length);
        data2.set(vector, 0);
        _offset = at - base + 2;
        if (USE_BUFFER$1) {
          return data2.toString("utf-8", 0, data2.length);
        }
        return textDecoder.decode(data2);
      }
      const major = (payload[at] & 224) >> 5;
      const minor = payload[at] & 31;
      if (major !== majorUtf8String) {
        unexpectedMajorInIndefiniteString(major);
      }
      if (minor === minorIndefinite) {
        throw new Error("nested indefinite string.");
      }
      const bytes = decodeUnstructuredByteString(at, to);
      const length = _offset;
      at += length;
      for (let i = 0;i < bytes.length; ++i) {
        vector.push(bytes[i]);
      }
    }
    throw new Error("expected break marker.");
  }
  function decodeUnstructuredByteStringIndefinite(at, to) {
    at += 1;
    const vector = [];
    for (const base = at;at < to; ) {
      if (payload[at] === 255) {
        const data2 = alloc(vector.length);
        data2.set(vector, 0);
        _offset = at - base + 2;
        return data2;
      }
      const major = (payload[at] & 224) >> 5;
      const minor = payload[at] & 31;
      if (major !== majorUnstructuredByteString) {
        unexpectedMajorInIndefiniteString(major);
      }
      if (minor === minorIndefinite) {
        throw new Error("nested indefinite string.");
      }
      const bytes = decodeUnstructuredByteString(at, to);
      const length = _offset;
      at += length;
      for (let i = 0;i < bytes.length; ++i) {
        vector.push(bytes[i]);
      }
    }
    throw new Error("expected break marker.");
  }
  function castBigInt(bigInt) {
    if (typeof bigInt === "number") {
      return bigInt;
    }
    const num = Number(bigInt);
    if (Number.MIN_SAFE_INTEGER <= num && num <= Number.MAX_SAFE_INTEGER) {
      return num;
    }
    return bigInt;
  }
  function demote(bigInteger) {
    const num = Number(bigInteger);
    if (num < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < num) {
      console.warn(new Error(`@smithy/core/cbor - truncating BigInt(${bigInteger}) to ${num} with loss of precision.`));
    }
    return num;
  }
  function overflow(n) {
    throw new Error(`length ${n} greater than remaining buf len.`);
  }
  function unexpectedMinor(minor) {
    throw new Error(`unexpected minor value ${minor}.`);
  }
  function unexpectedMajorInIndefiniteString(major) {
    throw new Error(`unexpected major type ${major} in indefinite string.`);
  }
  var USE_BUFFER = typeof Buffer !== "undefined";
  var encodeStringCache = new Map;
  var encodeCacheEpoch = 0;
  var encodeCacheSaturated = false;
  var initialSize = 2048;
  var data = alloc(initialSize);
  var dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  var cursor = 0;
  function encode(_input) {
    const encodeStack = [_input];
    while (encodeStack.length) {
      const input = encodeStack.pop();
      if (typeof input === "string") {
        const len = input.length;
        if (USE_BUFFER) {
          ensureSpace(len * 3 + 9);
          if (len > 23) {
            encodeHeader(majorUtf8String, Buffer.byteLength(input));
            cursor += data.write(input, cursor);
          } else {
            encodeStringCached(input);
          }
        } else {
          const maxBytes = len * 3;
          ensureSpace(maxBytes + 9);
          const headerPos = cursor;
          const result = new TextEncoder().encodeInto(input, data.subarray(cursor + 9));
          const byteLen = result.written;
          let headerSize;
          if (byteLen < 24) {
            headerSize = 1;
          } else if (byteLen < 256) {
            headerSize = 2;
          } else if (byteLen < 65536) {
            headerSize = 3;
          } else if (byteLen < 4294967296) {
            headerSize = 5;
          } else {
            headerSize = 9;
          }
          if (headerSize < 9) {
            data.copyWithin(headerPos + headerSize, headerPos + 9, headerPos + 9 + byteLen);
          }
          cursor = headerPos;
          encodeInteger(majorUtf8String, byteLen);
          cursor += byteLen;
        }
        continue;
      }
      if (data.byteLength - cursor < 9) {
        ensureSpace(64);
      }
      if (typeof input === "number") {
        if (Number.isInteger(input)) {
          const nonNegative = input >= 0;
          const major = nonNegative ? majorUint64 : majorNegativeInt64;
          const value = nonNegative ? input : -input - 1;
          if (value < 24) {
            data[cursor++] = major << 5 | value;
          } else if (value < 256) {
            data[cursor++] = major << 5 | 24;
            data[cursor++] = value;
          } else if (value < 65536) {
            data[cursor++] = major << 5 | extendedFloat16;
            data[cursor++] = value >> 8;
            data[cursor++] = value & 255;
          } else if (value < 4294967296) {
            data[cursor++] = major << 5 | extendedFloat32;
            dataView.setUint32(cursor, value);
            cursor += 4;
          } else {
            data[cursor++] = major << 5 | extendedFloat64;
            const hi = value / 4294967296 | 0;
            const lo = value - hi * 4294967296 | 0;
            dataView.setUint32(cursor, hi);
            dataView.setUint32(cursor + 4, lo);
            cursor += 8;
          }
          continue;
        }
        data[cursor++] = majorSpecial << 5 | extendedFloat64;
        dataView.setFloat64(cursor, input);
        cursor += 8;
        continue;
      } else if (typeof input === "bigint") {
        const nonNegative = input >= 0;
        const major = nonNegative ? majorUint64 : majorNegativeInt64;
        const value = nonNegative ? input : -input - BigInt(1);
        if (value < BigInt("18446744073709551616")) {
          const n = Number(value);
          if (n < 4294967296) {
            encodeInteger(major, n);
          } else {
            data[cursor++] = major << 5 | extendedFloat64;
            dataView.setBigUint64(cursor, value);
            cursor += 8;
          }
        } else {
          const binaryBigInt = value.toString(2);
          const bigIntBytes = new Uint8Array(Math.ceil(binaryBigInt.length / 8));
          let b = value;
          let i = 0;
          while (bigIntBytes.byteLength - ++i >= 0) {
            bigIntBytes[bigIntBytes.byteLength - i] = Number(b & BigInt(255));
            b >>= BigInt(8);
          }
          ensureSpace(bigIntBytes.byteLength * 2 + 16);
          data[cursor++] = nonNegative ? 194 : 195;
          encodeHeader(majorUnstructuredByteString, bigIntBytes.byteLength);
          data.set(bigIntBytes, cursor);
          cursor += bigIntBytes.byteLength;
        }
        continue;
      } else if (input === null) {
        data[cursor++] = majorSpecial << 5 | specialNull;
        continue;
      } else if (typeof input === "boolean") {
        data[cursor++] = majorSpecial << 5 | (input ? specialTrue : specialFalse);
        continue;
      } else if (typeof input === "undefined") {
        throw new Error("@smithy/core/cbor: client may not serialize undefined value.");
      } else if (Array.isArray(input)) {
        encodeInteger(majorList, input.length);
        ensureSpace(input.length * 9 + 64);
        for (let i = input.length - 1;i >= 0; --i) {
          encodeStack.push(input[i]);
        }
        continue;
      } else if (typeof input.byteLength === "number") {
        ensureSpace(input.length * 2 + 9);
        encodeInteger(majorUnstructuredByteString, input.length);
        data.set(input, cursor);
        cursor += input.byteLength;
        continue;
      } else if (typeof input === "object") {
        if (input instanceof NumericValue) {
          const decimalIndex = input.string.indexOf(".");
          const exponent = decimalIndex === -1 ? 0 : decimalIndex - input.string.length + 1;
          const mantissa = BigInt(input.string.replace(".", ""));
          data[cursor++] = 196;
          encodeInteger(majorList, 2);
          encodeStack.push(mantissa);
          encodeStack.push(exponent);
          continue;
        }
        if (input[tagSymbol]) {
          if ("tag" in input && "value" in input) {
            encodeStack.push(input.value);
            encodeHeader(majorTag, input.tag);
            continue;
          } else {
            throw new Error("tag encountered with missing fields, need 'tag' and 'value', found: " + JSON.stringify(input));
          }
        }
        const keys = Object.keys(input);
        const len = keys.length;
        encodeInteger(majorMap, len);
        for (let i = len - 1;i >= 0; --i) {
          encodeStack.push(input[keys[i]]);
          encodeStack.push(keys[i]);
        }
        continue;
      }
      throw new Error(`data type ${input?.constructor?.name ?? typeof input} not compatible for encoding.`);
    }
  }
  function advanceEncodingEpoch() {
    encodeCacheEpoch = encodeCacheEpoch + 1 & 65535;
    encodeCacheSaturated = false;
  }
  function toUint8Array() {
    const out = alloc(cursor);
    out.set(data.subarray(0, cursor), 0);
    cursor = 0;
    return out;
  }
  function resize(size) {
    const old = data;
    data = alloc(size);
    if (old) {
      if (old.copy) {
        old.copy(data, 0, 0, old.byteLength);
      } else {
        data.set(old, 0);
      }
    }
    dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }
  function encodeStringCached(input) {
    const cached = encodeStringCache.get(input);
    if (cached !== undefined) {
      data.set(cached.bytes, cursor);
      cursor += cached.bytes.length;
      cached.epoch = encodeCacheEpoch;
      return;
    }
    const start = cursor;
    const byteLen = Buffer.byteLength(input);
    encodeInteger(majorUtf8String, byteLen);
    cursor += data.write(input, cursor);
    const bytes = Uint8Array.prototype.slice.call(data, start, cursor);
    if (encodeStringCache.size >= 2048) {
      if (encodeCacheSaturated) {
        return;
      }
      let evicted = 0;
      for (const [key, entry] of encodeStringCache) {
        if (evicted >= 1024) {
          break;
        }
        if (entry.epoch !== encodeCacheEpoch) {
          encodeStringCache.delete(key);
          evicted++;
        }
      }
      if (evicted === 0) {
        encodeCacheSaturated = true;
        return;
      }
    }
    if (encodeStringCache.size < 2048) {
      encodeStringCache.set(input, { epoch: encodeCacheEpoch, bytes });
    }
  }
  function ensureSpace(bytes) {
    const remaining = data.byteLength - cursor;
    if (remaining < bytes) {
      if (cursor < 16000000) {
        resize(Math.max(data.byteLength * 4, data.byteLength + bytes));
      } else {
        resize(data.byteLength + bytes + 16000000);
      }
    }
  }
  function encodeHeader(major, value) {
    if (value < 24) {
      data[cursor++] = major << 5 | value;
    } else if (value < 256) {
      data[cursor++] = major << 5 | 24;
      data[cursor++] = value;
    } else if (value < 65536) {
      data[cursor++] = major << 5 | extendedFloat16;
      dataView.setUint16(cursor, value);
      cursor += 2;
    } else if (value < 4294967296) {
      data[cursor++] = major << 5 | extendedFloat32;
      dataView.setUint32(cursor, value);
      cursor += 4;
    } else {
      data[cursor++] = major << 5 | extendedFloat64;
      dataView.setBigUint64(cursor, typeof value === "bigint" ? value : BigInt(value));
      cursor += 8;
    }
  }
  function encodeInteger(major, value) {
    if (value < 24) {
      data[cursor++] = major << 5 | value;
    } else if (value < 256) {
      data[cursor++] = major << 5 | 24;
      data[cursor++] = value;
    } else if (value < 65536) {
      data[cursor++] = major << 5 | extendedFloat16;
      data[cursor++] = value >> 8;
      data[cursor++] = value & 255;
    } else if (value < 4294967296) {
      data[cursor++] = major << 5 | extendedFloat32;
      dataView.setUint32(cursor, value);
      cursor += 4;
    } else {
      data[cursor++] = major << 5 | extendedFloat64;
      const hi = value / 4294967296 | 0;
      const lo = value - hi * 4294967296 | 0;
      dataView.setUint32(cursor, hi);
      dataView.setUint32(cursor + 4, lo);
      cursor += 8;
    }
  }
  var cbor = {
    deserialize(payload2) {
      advanceDecodingEpoch();
      setPayload(payload2);
      return decode(0, payload2.length);
    },
    serialize(input) {
      advanceEncodingEpoch();
      try {
        encode(input);
        return toUint8Array();
      } catch (e) {
        toUint8Array();
        throw e;
      }
    },
    resizeEncodingBuffer(size) {
      resize(size);
    }
  };
  var parseCborBody = (streamBody, context) => {
    return collectBody(streamBody, context).then(async (bytes) => {
      if (bytes.length) {
        try {
          return cbor.deserialize(bytes);
        } catch (e) {
          Object.defineProperty(e, "$responseBodyText", {
            value: context.utf8Encoder(bytes)
          });
          throw e;
        }
      }
      return {};
    });
  };
  var dateToTag = (date) => {
    return tag({
      tag: 1,
      value: date.getTime() / 1000
    });
  };
  var parseCborErrorBody = async (errorBody, context) => {
    const value = await parseCborBody(errorBody, context);
    value.message = value.message ?? value.Message;
    return value;
  };
  var loadSmithyRpcV2CborErrorCode = (output, data2) => {
    const sanitizeErrorCode = (rawValue) => {
      let cleanValue = rawValue;
      if (typeof cleanValue === "number") {
        cleanValue = cleanValue.toString();
      }
      if (cleanValue.indexOf(",") >= 0) {
        cleanValue = cleanValue.split(",")[0];
      }
      if (cleanValue.indexOf(":") >= 0) {
        cleanValue = cleanValue.split(":")[0];
      }
      if (cleanValue.indexOf("#") >= 0) {
        cleanValue = cleanValue.split("#")[1];
      }
      return cleanValue;
    };
    if (data2["__type"] !== undefined) {
      return sanitizeErrorCode(data2["__type"]);
    }
    let codeKey;
    for (const key in data2) {
      if (key.toLowerCase() === "code") {
        codeKey = key;
        break;
      }
    }
    if (codeKey && data2[codeKey] !== undefined) {
      return sanitizeErrorCode(data2[codeKey]);
    }
  };
  var checkCborResponse = (response) => {
    if (String(response.headers["smithy-protocol"]).toLowerCase() !== "rpc-v2-cbor") {
      throw new Error("Malformed RPCv2 CBOR response, status: " + response.statusCode);
    }
  };
  var buildHttpRpcRequest = async (context, headers, path, resolvedHostname, body) => {
    const endpoint = await context.endpoint();
    const { hostname, protocol = "https", port, path: basePath } = endpoint;
    const contents = {
      protocol,
      hostname,
      port,
      method: "POST",
      path: basePath.endsWith("/") ? basePath.slice(0, -1) + path : basePath + path,
      headers: {
        ...headers
      }
    };
    if (resolvedHostname !== undefined) {
      contents.hostname = resolvedHostname;
    }
    if (endpoint.headers) {
      for (const name in endpoint.headers) {
        contents.headers[name] = endpoint.headers[name];
      }
    }
    if (body !== undefined) {
      contents.body = body;
      try {
        contents.headers["content-length"] = String(calculateBodyLength(body));
      } catch (e) {}
    }
    return new HttpRequest(contents);
  };

  class CborCodec extends SerdeContext {
    createSerializer() {
      const serializer = new CborShapeSerializer;
      serializer.setSerdeContext(this.serdeContext);
      return serializer;
    }
    createDeserializer() {
      const deserializer = new CborShapeDeserializer;
      deserializer.setSerdeContext(this.serdeContext);
      return deserializer;
    }
  }

  class CborShapeSerializer extends SerdeContext {
    value;
    write(schema, value) {
      this.value = this.serialize(schema, value);
    }
    serialize(schema, source) {
      const ns = NormalizedSchema.of(schema);
      if (source == null) {
        if (ns.isIdempotencyToken()) {
          return generateIdempotencyToken();
        }
        return source;
      }
      if (ns.isBlobSchema()) {
        if (typeof source === "string") {
          return (this.serdeContext?.base64Decoder ?? fromBase64)(source);
        }
        return source;
      }
      if (ns.isTimestampSchema()) {
        if (typeof source === "number" || typeof source === "bigint") {
          return dateToTag(new Date(Number(source) / 1000 | 0));
        }
        return dateToTag(source);
      }
      if (typeof source === "function" || typeof source === "object") {
        const sourceObject = source;
        if (ns.isListSchema() && Array.isArray(sourceObject)) {
          const sparse = !!ns.getMergedTraits().sparse;
          const newArray = [];
          let i = 0;
          for (const item of sourceObject) {
            const value = this.serialize(ns.getValueSchema(), item);
            if (value != null || sparse) {
              newArray[i++] = value;
            }
          }
          return newArray;
        }
        if (sourceObject instanceof Date) {
          return dateToTag(sourceObject);
        }
        const newObject = {};
        if (ns.isMapSchema()) {
          const sparse = !!ns.getMergedTraits().sparse;
          for (const key in sourceObject) {
            const value = this.serialize(ns.getValueSchema(), sourceObject[key]);
            if (value != null || sparse) {
              newObject[key] = value;
            }
          }
        } else if (ns.isStructSchema()) {
          for (const [key, memberSchema] of ns.structIterator()) {
            const value = this.serialize(memberSchema, sourceObject[key]);
            if (value != null) {
              newObject[key] = value;
            }
          }
          const isUnion = ns.isUnionSchema();
          if (isUnion && Array.isArray(sourceObject.$unknown)) {
            const [k, v] = sourceObject.$unknown;
            newObject[k] = v;
          } else if (typeof sourceObject.__type === "string") {
            for (const k in sourceObject) {
              if (!(k in newObject)) {
                newObject[k] = this.serialize(15, sourceObject[k]);
              }
            }
          }
        } else if (ns.isDocumentSchema()) {
          for (const key in sourceObject) {
            newObject[key] = this.serialize(ns.getValueSchema(), sourceObject[key]);
          }
        } else if (ns.isBigDecimalSchema()) {
          return sourceObject;
        }
        return newObject;
      }
      return source;
    }
    flush() {
      const buffer = cbor.serialize(this.value);
      this.value = undefined;
      return buffer;
    }
  }

  class CborShapeDeserializer extends SerdeContext {
    read(schema, bytes) {
      const data2 = cbor.deserialize(bytes);
      return this.readValue(schema, data2);
    }
    readValue(_schema, value) {
      const ns = NormalizedSchema.of(_schema);
      if (ns.isTimestampSchema()) {
        if (typeof value === "number") {
          return _parseEpochTimestamp(value);
        }
        if (typeof value === "object") {
          if (value.tag === 1 && "value" in value) {
            return _parseEpochTimestamp(value.value);
          }
        }
      }
      if (ns.isBlobSchema()) {
        if (typeof value === "string") {
          return (this.serdeContext?.base64Decoder ?? fromBase64)(value);
        }
        return value;
      }
      if (typeof value === "undefined" || typeof value === "boolean" || typeof value === "number" || typeof value === "string" || typeof value === "bigint" || typeof value === "symbol") {
        return value;
      } else if (typeof value === "object") {
        if (value === null) {
          return null;
        }
        if ("byteLength" in value) {
          return value;
        }
        if (value instanceof Date) {
          return value;
        }
        if (ns.isDocumentSchema()) {
          return value;
        }
        if (ns.isListSchema()) {
          const newArray = [];
          const memberSchema = ns.getValueSchema();
          for (const item of value) {
            const itemValue = this.readValue(memberSchema, item);
            newArray.push(itemValue);
          }
          return newArray;
        }
        const newObject = {};
        if (ns.isMapSchema()) {
          const targetSchema = ns.getValueSchema();
          for (const key in value) {
            const itemValue = this.readValue(targetSchema, value[key]);
            newObject[key] = itemValue;
          }
        } else if (ns.isStructSchema()) {
          const isUnion = ns.isUnionSchema();
          let keys;
          if (isUnion) {
            keys = new Set;
            for (const k in value) {
              if (k !== "__type") {
                keys.add(k);
              }
            }
          }
          for (const [key, memberSchema] of ns.structIterator()) {
            if (isUnion) {
              keys.delete(key);
            }
            if (value[key] != null) {
              newObject[key] = this.readValue(memberSchema, value[key]);
            }
          }
          if (isUnion && keys?.size === 1) {
            let newObjectEmpty = true;
            for (const _ in newObject) {
              newObjectEmpty = false;
              break;
            }
            if (newObjectEmpty) {
              const k = keys.values().next().value;
              newObject.$unknown = [k, value[k]];
            }
          } else if (typeof value.__type === "string") {
            for (const k in value) {
              if (!(k in newObject)) {
                newObject[k] = value[k];
              }
            }
          }
        } else if (value instanceof NumericValue) {
          return value;
        }
        return newObject;
      } else {
        return value;
      }
    }
  }

  class SmithyRpcV2CborProtocol extends RpcProtocol {
    codec = new CborCodec;
    serializer = this.codec.createSerializer();
    deserializer = this.codec.createDeserializer();
    constructor({ defaultNamespace, errorTypeRegistries }) {
      super({ defaultNamespace, errorTypeRegistries });
    }
    getShapeId() {
      return "smithy.protocols#rpcv2Cbor";
    }
    getPayloadCodec() {
      return this.codec;
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      Object.assign(request.headers, {
        "content-type": this.getDefaultContentType(),
        "smithy-protocol": "rpc-v2-cbor",
        accept: this.getDefaultContentType()
      });
      if (deref(operationSchema.input) === "unit") {
        delete request.body;
        delete request.headers["content-type"];
      } else {
        if (!request.body) {
          this.serializer.write(15, {});
          request.body = this.serializer.flush();
        }
        try {
          request.headers["content-length"] = String(request.body.byteLength);
        } catch (e) {}
      }
      const { service, operation } = getSmithyContext(context);
      const path = `/service/${service}/operation/${operation}`;
      if (request.path.endsWith("/")) {
        request.path += path.slice(1);
      } else {
        request.path += path;
      }
      return request;
    }
    async deserializeResponse(operationSchema, context, response) {
      return super.deserializeResponse(operationSchema, context, response);
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      const errorName = loadSmithyRpcV2CborErrorCode(response, dataObject) ?? "Unknown";
      const errorMetadata = {
        $metadata: metadata,
        $fault: response.statusCode <= 500 ? "client" : "server"
      };
      let namespace = this.options.defaultNamespace;
      if (errorName.includes("#")) {
        [namespace] = errorName.split("#");
      }
      const registry = this.compositeErrorRegistry;
      const nsRegistry = TypeRegistry.for(namespace);
      registry.copyFrom(nsRegistry);
      let errorSchema;
      try {
        errorSchema = registry.getSchema(errorName);
      } catch (e) {
        if (dataObject.Message) {
          dataObject.message = dataObject.Message;
        }
        const syntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + namespace);
        registry.copyFrom(syntheticRegistry);
        const baseExceptionSchema = registry.getBaseException();
        if (baseExceptionSchema) {
          const ErrorCtor2 = registry.getErrorCtor(baseExceptionSchema);
          throw Object.assign(new ErrorCtor2({ name: errorName }), errorMetadata, dataObject);
        }
        throw Object.assign(new Error(errorName), errorMetadata, dataObject);
      }
      const ns = NormalizedSchema.of(errorSchema);
      const ErrorCtor = registry.getErrorCtor(errorSchema);
      const message = dataObject.message ?? dataObject.Message ?? "Unknown";
      const exception = new ErrorCtor({});
      const output = {};
      for (const [name, member] of ns.structIterator()) {
        output[name] = this.deserializer.readValue(member, dataObject[name]);
      }
      throw Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output);
    }
    getDefaultContentType() {
      return "application/cbor";
    }
  }
  exports.CborCodec = CborCodec;
  exports.CborShapeDeserializer = CborShapeDeserializer;
  exports.CborShapeSerializer = CborShapeSerializer;
  exports.SmithyRpcV2CborProtocol = SmithyRpcV2CborProtocol;
  exports.buildHttpRpcRequest = buildHttpRpcRequest;
  exports.cbor = cbor;
  exports.checkCborResponse = checkCborResponse;
  exports.dateToTag = dateToTag;
  exports.loadSmithyRpcV2CborErrorCode = loadSmithyRpcV2CborErrorCode;
  exports.parseCborBody = parseCborBody;
  exports.parseCborErrorBody = parseCborErrorBody;
  exports.tag = tag;
  exports.tagSymbol = tagSymbol;
});

// ../../node_modules/.bun/@aws-sdk+xml-builder@3.972.31/node_modules/@aws-sdk/xml-builder/dist-cjs/xml-parser.js
var require_xml_parser = __commonJS((exports) => {
  exports.parseXML = function parseXML(xml) {
    const state = new AwsXmlParser(xml);
    return state.parse();
  };

  class AwsXmlParser {
    x;
    i = 0;
    z;
    constructor(x) {
      this.x = x;
      this.x = x.replace(/\r\n?/g, `
`);
      this.z = this.x.length;
    }
    parse() {
      const p = this;
      const { z } = p;
      while (p.i < z) {
        p.trim();
        if (p.i >= z) {
          break;
        }
        if (p.isNext("<?")) {
          p.readTo("?>");
          p.trim();
        } else if (p.isNext("<!--")) {
          p.readTo("-->");
          p.trim();
        } else if (p.isNext("<!DOCTYPE", false)) {
          p.skipDoctype();
          p.trim();
        } else if (p.x[p.i] === "<") {
          const root = p.parseTag();
          return { [root.tag]: root.value };
        } else {
          throw new Error("@aws-sdk XML parse error: unexpected content.");
        }
      }
      throw new Error("@aws-sdk XML parse error: no root element.");
    }
    isNext(s, caseSensitive = true) {
      const p = this;
      if (caseSensitive) {
        return p.x.startsWith(s, p.i);
      }
      return p.x.toLowerCase().startsWith(s.toLowerCase(), p.i);
    }
    readTo(stop) {
      const p = this;
      const _i = p.x.indexOf(stop, p.i);
      if (_i === -1) {
        throw new Error(`@aws-sdk XML parse error: expected "${stop}" not found.`);
      }
      const result = p.x.slice(p.i, _i);
      p.i = _i + stop.length;
      return result;
    }
    trim() {
      const p = this;
      while (p.i < p.z && ` 	\r
`.includes(p.x[p.i])) {
        ++p.i;
      }
    }
    readAttrValue() {
      const p = this;
      const quote = p.x[p.i];
      ++p.i;
      let value = "";
      while (p.i < p.z && p.x[p.i] !== quote) {
        value += p.x[p.i++];
      }
      ++p.i;
      return p.decodeEntities(value);
    }
    parseTag() {
      const p = this;
      ++p.i;
      let tag = "";
      while (p.i < p.z && !` 	\r
>/`.includes(p.x[p.i])) {
        tag += p.x[p.i++];
      }
      let hasAttrs = false;
      const attrs = Object.create(null);
      while (p.i < p.z) {
        p.trim();
        if (">/".includes(p.x[p.i])) {
          break;
        }
        let name = "";
        while (p.i < p.z && !`= 	\r
>/?`.includes(p.x[p.i])) {
          name += p.x[p.i++];
        }
        p.trim();
        if (p.x[p.i] !== "=") {
          break;
        }
        ++p.i;
        p.trim();
        attrs[name] = p.readAttrValue();
        hasAttrs = true;
      }
      if (p.i >= p.z) {
        throw new Error("@aws-sdk XML parse error: unexpected end of input.");
      }
      if (p.x[p.i] === "/") {
        ++p.i;
        if (p.i >= p.z || p.x[p.i] !== ">") {
          throw new Error("@aws-sdk XML parse error: expected > at the end of self-closing tag.");
        }
        ++p.i;
        Object.setPrototypeOf(attrs, Object.prototype);
        return { tag, value: hasAttrs ? attrs : "" };
      }
      if (p.x[p.i] !== ">") {
        throw new Error("@aws-sdk XML parse error: expected > at the end of opening tag.");
      }
      ++p.i;
      const textParts = [];
      const childTags = [];
      let hasElementChild = false;
      while (p.i < p.z) {
        if (p.isNext("</")) {
          break;
        }
        if (p.x[p.i] === "<") {
          if (p.isNext("<!--")) {
            p.readTo("-->");
          } else if (p.isNext("<![CDATA[")) {
            p.i += 9;
            textParts.push(p.readTo("]]>"));
          } else if (p.isNext("<?")) {
            p.readTo("?>");
          } else {
            hasElementChild = true;
            childTags.push(p.parseTag());
          }
        } else {
          let text = "";
          while (p.i < p.z && p.x[p.i] !== "<") {
            text += p.x[p.i++];
          }
          textParts.push(p.decodeEntities(text));
        }
      }
      if (!p.isNext("</")) {
        throw new Error(`@aws-sdk XML parse error: missing closing tag </${tag}>.`);
      }
      p.i += 2;
      const closeTag = p.readTo(">").trim();
      if (closeTag !== tag) {
        throw new Error(`@aws-sdk XML parse error: mismatched tags <${tag}> and </${closeTag}>.`);
      }
      if (!hasAttrs && textParts.length === 0 && !hasElementChild) {
        return { tag, value: "" };
      }
      if (!hasAttrs && !hasElementChild) {
        const text = textParts.length === 1 ? textParts[0] : textParts.join("");
        if (text.trim() === "" && text.includes(`
`)) {
          return { tag, value: "" };
        }
        return { tag, value: text };
      }
      const obj = Object.create(null);
      for (const text of textParts) {
        if (text.trim() === "" && text.includes(`
`)) {
          continue;
        }
        obj["#text"] = "#text" in obj ? obj["#text"] + text : text;
      }
      for (const child of childTags) {
        if (child.tag in obj) {
          if (Array.isArray(obj[child.tag])) {
            obj[child.tag].push(child.value);
          } else {
            obj[child.tag] = [obj[child.tag], child.value];
          }
        } else {
          obj[child.tag] = child.value;
        }
      }
      for (const [k, v] of Object.entries(attrs)) {
        obj[k] = v;
      }
      Object.setPrototypeOf(obj, Object.prototype);
      return { tag, value: obj };
    }
    static ENTITIES = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'"
    };
    skipDoctype() {
      const p = this;
      p.i += 9;
      let depth = 0;
      while (p.i < p.z) {
        const c = p.x[p.i];
        if (c === "[") {
          ++depth;
        } else if (c === "]") {
          --depth;
        } else if (c === ">" && depth === 0) {
          ++p.i;
          return;
        }
        ++p.i;
      }
      throw new Error("@aws-sdk XML parse error: unclosed DOCTYPE.");
    }
    decodeEntities(s) {
      return s.replace(/&(?:#x([0-9a-fA-F]{1,6})|#(\d{1,7})|([a-zA-Z][a-zA-Z0-9]{0,30}));/g, (_, hex, dec, named) => {
        if (hex) {
          return String.fromCharCode(parseInt(hex, 16));
        }
        if (dec) {
          return String.fromCharCode(parseInt(dec, 10));
        }
        return AwsXmlParser.ENTITIES[named] ?? "";
      });
    }
  }
});

// ../../node_modules/.bun/@aws-sdk+xml-builder@3.972.31/node_modules/@aws-sdk/xml-builder/dist-cjs/index.js
var require_dist_cjs8 = __commonJS((exports) => {
  var { parseXML } = require_xml_parser();
  exports.parseXML = parseXML;
  var ATTR_ESCAPE_RE = /[&<>"]/g;
  var ATTR_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  };
  function escapeAttribute(value) {
    return value.replace(ATTR_ESCAPE_RE, (ch) => ATTR_ESCAPE_MAP[ch]);
  }
  var ELEMENT_ESCAPE_RE = /[&"'<>\r\n\u0085\u2028]/g;
  var ELEMENT_ESCAPE_MAP = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    "<": "&lt;",
    ">": "&gt;",
    "\r": "&#x0D;",
    "\n": "&#x0A;",
    "": "&#x85;",
    "\u2028": "&#x2028;"
  };
  function escapeElement(value) {
    return value.replace(ELEMENT_ESCAPE_RE, (ch) => ELEMENT_ESCAPE_MAP[ch]);
  }

  class XmlText {
    value;
    constructor(value) {
      this.value = value;
    }
    toString() {
      return escapeElement("" + this.value);
    }
  }

  class XmlNode {
    name;
    children;
    attributes = {};
    static of(name, childText, withName) {
      const node = new XmlNode(name);
      if (childText !== undefined) {
        node.addChildNode(new XmlText(childText));
      }
      if (withName !== undefined) {
        node.withName(withName);
      }
      return node;
    }
    constructor(name, children = []) {
      this.name = name;
      this.children = children;
    }
    withName(name) {
      this.name = name;
      return this;
    }
    addAttribute(name, value) {
      this.attributes[name] = value;
      return this;
    }
    addChildNode(child) {
      this.children.push(child);
      return this;
    }
    removeAttribute(name) {
      delete this.attributes[name];
      return this;
    }
    n(name) {
      this.name = name;
      return this;
    }
    c(child) {
      this.children.push(child);
      return this;
    }
    a(name, value) {
      if (value != null) {
        this.attributes[name] = value;
      }
      return this;
    }
    cc(input, field, withName = field) {
      if (input[field] != null) {
        const node = XmlNode.of(field, input[field]).withName(withName);
        this.c(node);
      }
    }
    l(input, listName, memberName, valueProvider) {
      if (input[listName] != null) {
        const nodes = valueProvider();
        nodes.map((node) => {
          node.withName(memberName);
          this.c(node);
        });
      }
    }
    lc(input, listName, memberName, valueProvider) {
      if (input[listName] != null) {
        const nodes = valueProvider();
        const containerNode = new XmlNode(memberName);
        nodes.map((node) => {
          containerNode.c(node);
        });
        this.c(containerNode);
      }
    }
    toString() {
      const hasChildren = Boolean(this.children.length);
      let xmlText = `<${this.name}`;
      const attributes = this.attributes;
      for (const attributeName of Object.keys(attributes)) {
        const attribute = attributes[attributeName];
        if (attribute != null) {
          xmlText += ` ${attributeName}="${escapeAttribute("" + attribute)}"`;
        }
      }
      return xmlText += !hasChildren ? "/>" : `>${this.children.map((c) => c.toString()).join("")}</${this.name}>`;
    }
  }
  exports.XmlNode = XmlNode;
  exports.XmlText = XmlText;
});

// ../../node_modules/.bun/@aws-sdk+core@3.974.23/node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js
var require_protocols2 = __commonJS((exports) => {
  var { SmithyRpcV2CborProtocol, loadSmithyRpcV2CborErrorCode } = require_cbor();
  var { TypeRegistry, NormalizedSchema, deref } = require_schema();
  var { decorateServiceException, getValueFromTextNode } = require_client();
  var { collectBody, determineTimestampFormat, RpcProtocol, HttpBindingProtocol, HttpInterceptingShapeSerializer, HttpInterceptingShapeDeserializer, FromStringShapeDeserializer, extendedEncodeURIComponent } = require_protocols();
  var { NumericValue, toUtf8, fromBase64, LazyJsonString, parseEpochTimestamp, parseRfc7231DateTime, parseRfc3339DateTimeWithOffset, toBase64, dateToUtcString, generateIdempotencyToken, expectUnion } = require_serde();
  var { parseXML, XmlNode, XmlText } = require_dist_cjs8();

  class ProtocolLib {
    queryCompat;
    errorRegistry;
    constructor(queryCompat = false) {
      this.queryCompat = queryCompat;
    }
    resolveRestContentType(defaultContentType, inputSchema) {
      const members = inputSchema.getMemberSchemas();
      const httpPayloadMember = Object.values(members).find((m) => {
        return !!m.getMergedTraits().httpPayload;
      });
      if (httpPayloadMember) {
        const mediaType = httpPayloadMember.getMergedTraits().mediaType;
        if (mediaType) {
          return mediaType;
        } else if (httpPayloadMember.isStringSchema()) {
          return "text/plain";
        } else if (httpPayloadMember.isBlobSchema()) {
          return "application/octet-stream";
        } else {
          return defaultContentType;
        }
      } else if (!inputSchema.isUnitSchema()) {
        const hasBody = Object.values(members).find((m) => {
          const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m.getMergedTraits();
          const noPrefixHeaders = httpPrefixHeaders === undefined;
          return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && noPrefixHeaders;
        });
        if (hasBody) {
          return defaultContentType;
        }
      }
    }
    async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
      let errorName = errorIdentifier;
      if (errorIdentifier.includes("#")) {
        [, errorName] = errorIdentifier.split("#");
      }
      const errorMetadata = {
        $metadata: metadata,
        $fault: response.statusCode < 500 ? "client" : "server"
      };
      if (!this.errorRegistry) {
        throw new Error("@aws-sdk/core/protocols - error handler not initialized.");
      }
      try {
        const errorSchema = getErrorSchema?.(this.errorRegistry, errorName) ?? this.errorRegistry.getSchema(errorIdentifier);
        return { errorSchema, errorMetadata };
      } catch (e) {
        dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
        const synthetic = this.errorRegistry;
        const baseExceptionSchema = synthetic.getBaseException();
        if (baseExceptionSchema) {
          const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
          throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
        }
        const d = dataObject;
        const message = d?.message ?? d?.Message ?? d?.Error?.Message ?? d?.Error?.message;
        throw this.decorateServiceException(Object.assign(new Error(message), {
          name: errorName
        }, errorMetadata), dataObject);
      }
    }
    compose(composite, errorIdentifier, defaultNamespace) {
      let namespace = defaultNamespace;
      if (errorIdentifier.includes("#")) {
        [namespace] = errorIdentifier.split("#");
      }
      const staticRegistry = TypeRegistry.for(namespace);
      const defaultSyntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + defaultNamespace);
      composite.copyFrom(staticRegistry);
      composite.copyFrom(defaultSyntheticRegistry);
      this.errorRegistry = composite;
    }
    decorateServiceException(exception, additions = {}) {
      if (this.queryCompat) {
        const msg = exception.Message ?? additions.Message;
        const error = decorateServiceException(exception, additions);
        if (msg) {
          error.message = msg;
        }
        const errorObj = error.Error ?? {};
        errorObj.Type = error.Error?.Type;
        errorObj.Code = error.Error?.Code;
        errorObj.Message = error.Error?.message ?? error.Error?.Message ?? msg;
        error.Error = errorObj;
        const reqId = error.$metadata.requestId;
        if (reqId) {
          error.RequestId = reqId;
        }
        return error;
      }
      return decorateServiceException(exception, additions);
    }
    setQueryCompatError(output, response) {
      const queryErrorHeader = response.headers?.["x-amzn-query-error"];
      if (output !== undefined && queryErrorHeader != null) {
        const [Code, Type] = queryErrorHeader.split(";");
        const keys = Object.keys(output);
        const Error2 = {
          Code,
          Type
        };
        output.Code = Code;
        output.Type = Type;
        for (let i = 0;i < keys.length; i++) {
          const k = keys[i];
          Error2[k === "message" ? "Message" : k] = output[k];
        }
        delete Error2.__type;
        output.Error = Error2;
      }
    }
    queryCompatOutput(queryCompatErrorData, errorData) {
      if (queryCompatErrorData.Error) {
        errorData.Error = queryCompatErrorData.Error;
      }
      if (queryCompatErrorData.Type) {
        errorData.Type = queryCompatErrorData.Type;
      }
      if (queryCompatErrorData.Code) {
        errorData.Code = queryCompatErrorData.Code;
      }
    }
    findQueryCompatibleError(registry, errorName) {
      try {
        return registry.getSchema(errorName);
      } catch (e) {
        return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
      }
    }
  }

  class AwsSmithyRpcV2CborProtocol extends SmithyRpcV2CborProtocol {
    awsQueryCompatible;
    mixin;
    constructor({ defaultNamespace, errorTypeRegistries, awsQueryCompatible }) {
      super({ defaultNamespace, errorTypeRegistries });
      this.awsQueryCompatible = !!awsQueryCompatible;
      this.mixin = new ProtocolLib(this.awsQueryCompatible);
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      if (this.awsQueryCompatible) {
        request.headers["x-amzn-query-mode"] = "true";
      }
      return request;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      if (this.awsQueryCompatible) {
        this.mixin.setQueryCompatError(dataObject, response);
      }
      const errorName = (() => {
        const compatHeader = response.headers["x-amzn-query-error"];
        if (compatHeader && this.awsQueryCompatible) {
          return compatHeader.split(";")[0];
        }
        return loadSmithyRpcV2CborErrorCode(response, dataObject) ?? "Unknown";
      })();
      this.mixin.compose(this.compositeErrorRegistry, errorName, this.options.defaultNamespace);
      const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorName, this.options.defaultNamespace, response, dataObject, metadata, this.awsQueryCompatible ? this.mixin.findQueryCompatibleError : undefined);
      const ns = NormalizedSchema.of(errorSchema);
      const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
      const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
      const exception = new ErrorCtor({});
      const output = {};
      for (const [name, member] of ns.structIterator()) {
        if (dataObject[name] != null) {
          output[name] = this.deserializer.readValue(member, dataObject[name]);
        }
      }
      if (this.awsQueryCompatible) {
        this.mixin.queryCompatOutput(dataObject, output);
      }
      throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output), dataObject);
    }
  }
  var _toStr = (val) => {
    if (val == null) {
      return val;
    }
    if (typeof val === "number" || typeof val === "bigint") {
      const warning = new Error(`Received number ${val} where a string was expected.`);
      warning.name = "Warning";
      console.warn(warning);
      return String(val);
    }
    if (typeof val === "boolean") {
      const warning = new Error(`Received boolean ${val} where a string was expected.`);
      warning.name = "Warning";
      console.warn(warning);
      return String(val);
    }
    return val;
  };
  var _toBool = (val) => {
    if (val == null) {
      return val;
    }
    if (typeof val === "string") {
      const lowercase = val.toLowerCase();
      if (val !== "" && lowercase !== "false" && lowercase !== "true") {
        const warning = new Error(`Received string "${val}" where a boolean was expected.`);
        warning.name = "Warning";
        console.warn(warning);
      }
      return val !== "" && lowercase !== "false";
    }
    return val;
  };
  var _toNum = (val) => {
    if (val == null) {
      return val;
    }
    if (typeof val === "string") {
      const num = Number(val);
      if (num.toString() !== val) {
        const warning = new Error(`Received string "${val}" where a number was expected.`);
        warning.name = "Warning";
        console.warn(warning);
        return val;
      }
      return num;
    }
    return val;
  };

  class SerdeContextConfig {
    serdeContext;
    setSerdeContext(serdeContext) {
      this.serdeContext = serdeContext;
    }
  }

  class UnionSerde {
    from;
    to;
    keys;
    constructor(from, to) {
      this.from = from;
      this.to = to;
      const keys = Object.keys(this.from);
      const set = new Set(keys);
      set.delete("__type");
      this.keys = set;
    }
    mark(key) {
      this.keys.delete(key);
    }
    hasUnknown() {
      return this.keys.size === 1 && Object.keys(this.to).length === 0;
    }
    writeUnknown() {
      if (this.hasUnknown()) {
        const k = this.keys.values().next().value;
        const v = this.from[k];
        this.to.$unknown = [k, v];
      }
    }
  }
  function jsonReviver(key, value, context) {
    if (context?.source) {
      const numericString = context.source;
      if (typeof value === "number") {
        if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER || numericString !== String(value)) {
          const isFractional = numericString.includes(".");
          if (isFractional) {
            return new NumericValue(numericString, "bigDecimal");
          } else {
            return BigInt(numericString);
          }
        }
      }
    }
    return value;
  }
  var collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => (context?.utf8Encoder ?? toUtf8)(body));
  var parseJsonBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
    if (encoded.length) {
      try {
        return JSON.parse(encoded);
      } catch (e) {
        if (e?.name === "SyntaxError") {
          Object.defineProperty(e, "$responseBodyText", {
            value: encoded
          });
        }
        throw e;
      }
    }
    return {};
  });
  var parseJsonErrorBody = async (errorBody, context) => {
    const value = await parseJsonBody(errorBody, context);
    value.message = value.message ?? value.Message;
    return value;
  };
  var findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
  var sanitizeErrorCode = (rawValue) => {
    let cleanValue = rawValue;
    if (typeof cleanValue === "number") {
      cleanValue = cleanValue.toString();
    }
    if (cleanValue.indexOf(",") >= 0) {
      cleanValue = cleanValue.split(",")[0];
    }
    if (cleanValue.indexOf(":") >= 0) {
      cleanValue = cleanValue.split(":")[0];
    }
    if (cleanValue.indexOf("#") >= 0) {
      cleanValue = cleanValue.split("#")[1];
    }
    return cleanValue;
  };
  var loadRestJsonErrorCode = (output, data) => {
    return loadErrorCode(output, data, ["header", "code", "type"]);
  };
  var loadJsonRpcErrorCode = (output, data, queryCompat = false) => {
    return loadErrorCode(output, data, queryCompat ? ["code", "header", "type"] : ["type", "code", "header"]);
  };
  var loadErrorCode = ({ headers }, data, order) => {
    while (order.length > 0) {
      const location = order.shift();
      switch (location) {
        case "header":
          const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
          if (headerKey !== undefined) {
            return sanitizeErrorCode(headers[headerKey]);
          }
          break;
        case "code":
          const codeKey = findKey(data ?? {}, "code");
          if (codeKey && data[codeKey] !== undefined) {
            return sanitizeErrorCode(data[codeKey]);
          }
          break;
        case "type":
          if (data?.__type !== undefined) {
            return sanitizeErrorCode(data.__type);
          }
          break;
      }
    }
  };

  class JsonShapeDeserializer extends SerdeContextConfig {
    settings;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    async read(schema, data) {
      return this._read(schema, typeof data === "string" ? JSON.parse(data, jsonReviver) : await parseJsonBody(data, this.serdeContext));
    }
    readObject(schema, data) {
      return this._read(schema, data);
    }
    _read(schema, value) {
      const isObject = value !== null && typeof value === "object";
      const ns = NormalizedSchema.of(schema);
      if (isObject) {
        if (ns.isStructSchema()) {
          const record = value;
          const union = ns.isUnionSchema();
          const out = {};
          let nameMap = undefined;
          const { jsonName } = this.settings;
          if (jsonName) {
            nameMap = {};
          }
          let unionSerde;
          if (union) {
            unionSerde = new UnionSerde(record, out);
          }
          for (const [memberName, memberSchema] of ns.structIterator()) {
            let fromKey = memberName;
            if (jsonName) {
              fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
              nameMap[fromKey] = memberName;
            }
            if (union) {
              unionSerde.mark(fromKey);
            }
            if (record[fromKey] != null) {
              out[memberName] = this._read(memberSchema, record[fromKey]);
            }
          }
          if (union) {
            unionSerde.writeUnknown();
          } else if (typeof record.__type === "string") {
            for (const k in record) {
              const v = record[k];
              const t = jsonName ? nameMap[k] ?? k : k;
              if (!(t in out)) {
                out[t] = v;
              }
            }
          }
          return out;
        }
        if (Array.isArray(value) && ns.isListSchema()) {
          const listMember = ns.getValueSchema();
          const out = [];
          for (const item of value) {
            out.push(this._read(listMember, item));
          }
          return out;
        }
        if (ns.isMapSchema()) {
          const mapMember = ns.getValueSchema();
          const out = {};
          for (const _k in value) {
            out[_k] = this._read(mapMember, value[_k]);
          }
          return out;
        }
      }
      if (ns.isBlobSchema() && typeof value === "string") {
        return fromBase64(value);
      }
      const mediaType = ns.getMergedTraits().mediaType;
      if (ns.isStringSchema() && typeof value === "string" && mediaType) {
        const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
        if (isJson) {
          return LazyJsonString.from(value);
        }
        return value;
      }
      if (ns.isTimestampSchema() && value != null) {
        const format = determineTimestampFormat(ns, this.settings);
        switch (format) {
          case 5:
            return parseRfc3339DateTimeWithOffset(value);
          case 6:
            return parseRfc7231DateTime(value);
          case 7:
            return parseEpochTimestamp(value);
          default:
            console.warn("Missing timestamp format, parsing value with Date constructor:", value);
            return new Date(value);
        }
      }
      if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) {
        return BigInt(value);
      }
      if (ns.isBigDecimalSchema() && value != null) {
        if (value instanceof NumericValue) {
          return value;
        }
        const untyped = value;
        if (untyped.type === "bigDecimal" && "string" in untyped) {
          return new NumericValue(untyped.string, untyped.type);
        }
        return new NumericValue(String(value), "bigDecimal");
      }
      if (ns.isNumericSchema() && typeof value === "string") {
        switch (value) {
          case "Infinity":
            return Infinity;
          case "-Infinity":
            return -Infinity;
          case "NaN":
            return NaN;
        }
        return value;
      }
      if (ns.isDocumentSchema()) {
        if (isObject) {
          const out = Array.isArray(value) ? [] : {};
          for (const k in value) {
            const v = value[k];
            if (v instanceof NumericValue) {
              out[k] = v;
            } else {
              out[k] = this._read(ns, v);
            }
          }
          return out;
        } else {
          return structuredClone(value);
        }
      }
      return value;
    }
  }
  var NUMERIC_CONTROL_CHAR = String.fromCharCode(925);

  class JsonReplacer {
    values = new Map;
    counter = 0;
    stage = 0;
    createReplacer() {
      if (this.stage === 1) {
        throw new Error("@aws-sdk/core/protocols - JsonReplacer already created.");
      }
      if (this.stage === 2) {
        throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
      }
      this.stage = 1;
      return (key, value) => {
        if (value instanceof NumericValue) {
          const v = `${NUMERIC_CONTROL_CHAR + "nv" + this.counter++}_` + value.string;
          this.values.set(`"${v}"`, value.string);
          return v;
        }
        if (typeof value === "bigint") {
          const s = value.toString();
          const v = `${NUMERIC_CONTROL_CHAR + "b" + this.counter++}_` + s;
          this.values.set(`"${v}"`, s);
          return v;
        }
        return value;
      };
    }
    replaceInJson(json) {
      if (this.stage === 0) {
        throw new Error("@aws-sdk/core/protocols - JsonReplacer not created yet.");
      }
      if (this.stage === 2) {
        throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
      }
      this.stage = 2;
      if (this.counter === 0) {
        return json;
      }
      for (const [key, value] of this.values) {
        json = json.replace(key, value);
      }
      return json;
    }
  }

  class JsonShapeSerializer extends SerdeContextConfig {
    settings;
    buffer;
    useReplacer = false;
    rootSchema;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    write(schema, value) {
      this.rootSchema = NormalizedSchema.of(schema);
      this.buffer = this._write(this.rootSchema, value);
    }
    flush() {
      const { rootSchema, useReplacer } = this;
      this.rootSchema = undefined;
      this.useReplacer = false;
      if (rootSchema?.isStructSchema() || rootSchema?.isDocumentSchema()) {
        if (!useReplacer) {
          return JSON.stringify(this.buffer);
        }
        const replacer = new JsonReplacer;
        return replacer.replaceInJson(JSON.stringify(this.buffer, replacer.createReplacer(), 0));
      }
      return this.buffer;
    }
    writeDiscriminatedDocument(schema, value) {
      this.write(schema, value);
      if (typeof this.buffer === "object") {
        this.buffer.__type = NormalizedSchema.of(schema).getName(true);
      }
    }
    _write(schema, value, container) {
      const isObject = value !== null && typeof value === "object";
      const ns = NormalizedSchema.of(schema);
      if (isObject) {
        if (ns.isStructSchema()) {
          const record = value;
          const out = {};
          const { jsonName } = this.settings;
          let nameMap = undefined;
          if (jsonName) {
            nameMap = {};
          }
          let outCount = 0;
          for (const [memberName, memberSchema] of ns.structIterator()) {
            const serializableValue = this._write(memberSchema, record[memberName], ns);
            if (serializableValue !== undefined) {
              let targetKey = memberName;
              if (jsonName) {
                targetKey = memberSchema.getMergedTraits().jsonName ?? memberName;
                nameMap[memberName] = targetKey;
              }
              out[targetKey] = serializableValue;
              outCount++;
            }
          }
          if (ns.isUnionSchema() && outCount === 0) {
            const { $unknown } = record;
            if (Array.isArray($unknown)) {
              const [k, v] = $unknown;
              out[k] = this._write(15, v);
            }
          } else if (typeof record.__type === "string") {
            for (const k in record) {
              const v = record[k];
              const targetKey = jsonName ? nameMap[k] ?? k : k;
              if (!(targetKey in out)) {
                out[targetKey] = this._write(15, v);
              }
            }
          }
          return out;
        }
        if (Array.isArray(value) && ns.isListSchema()) {
          const listMember = ns.getValueSchema();
          const out = [];
          const sparse = !!ns.getMergedTraits().sparse;
          for (const item of value) {
            if (sparse || item != null) {
              out.push(this._write(listMember, item));
            }
          }
          return out;
        }
        if (ns.isMapSchema()) {
          const mapMember = ns.getValueSchema();
          const out = {};
          const sparse = !!ns.getMergedTraits().sparse;
          for (const _k in value) {
            const _v = value[_k];
            if (sparse || _v != null) {
              out[_k] = this._write(mapMember, _v);
            }
          }
          return out;
        }
        if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
          if (ns === this.rootSchema) {
            return value;
          }
          return (this.serdeContext?.base64Encoder ?? toBase64)(value);
        }
        if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
          const format = determineTimestampFormat(ns, this.settings);
          switch (format) {
            case 5:
              return value.toISOString().replace(".000Z", "Z");
            case 6:
              return dateToUtcString(value);
            case 7:
              return value.getTime() / 1000;
            default:
              console.warn("Missing timestamp format, using epoch seconds", value);
              return value.getTime() / 1000;
          }
        }
        if (value instanceof NumericValue) {
          this.useReplacer = true;
        }
      }
      if (value === null && container?.isStructSchema()) {
        return;
      }
      if (ns.isStringSchema()) {
        if (typeof value === "undefined" && ns.isIdempotencyToken()) {
          return generateIdempotencyToken();
        }
        const mediaType = ns.getMergedTraits().mediaType;
        if (value != null && mediaType) {
          const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
          if (isJson) {
            return LazyJsonString.from(value);
          }
        }
        return value;
      }
      if (typeof value === "number" && ns.isNumericSchema()) {
        if (Math.abs(value) === Infinity || isNaN(value)) {
          return String(value);
        }
        return value;
      }
      if (typeof value === "string" && ns.isBlobSchema()) {
        if (ns === this.rootSchema) {
          return value;
        }
        return (this.serdeContext?.base64Encoder ?? toBase64)(value);
      }
      if (typeof value === "bigint") {
        this.useReplacer = true;
      }
      if (ns.isDocumentSchema()) {
        if (isObject) {
          const out = Array.isArray(value) ? [] : {};
          for (const k in value) {
            const v = value[k];
            if (v instanceof NumericValue) {
              this.useReplacer = true;
              out[k] = v;
            } else {
              out[k] = this._write(ns, v);
            }
          }
          return out;
        } else {
          return structuredClone(value);
        }
      }
      return value;
    }
  }

  class JsonCodec extends SerdeContextConfig {
    settings;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    createSerializer() {
      const serializer = new JsonShapeSerializer(this.settings);
      serializer.setSerdeContext(this.serdeContext);
      return serializer;
    }
    createDeserializer() {
      const deserializer = new JsonShapeDeserializer(this.settings);
      deserializer.setSerdeContext(this.serdeContext);
      return deserializer;
    }
  }

  class AwsJsonRpcProtocol extends RpcProtocol {
    serializer;
    deserializer;
    serviceTarget;
    codec;
    mixin;
    awsQueryCompatible;
    constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
      super({
        defaultNamespace,
        errorTypeRegistries
      });
      this.serviceTarget = serviceTarget;
      this.codec = jsonCodec ?? new JsonCodec({
        timestampFormat: {
          useTrait: true,
          default: 7
        },
        jsonName: false
      });
      this.serializer = this.codec.createSerializer();
      this.deserializer = this.codec.createDeserializer();
      this.awsQueryCompatible = !!awsQueryCompatible;
      this.mixin = new ProtocolLib(this.awsQueryCompatible);
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      if (!request.path.endsWith("/")) {
        request.path += "/";
      }
      request.headers["content-type"] = `application/x-amz-json-${this.getJsonRpcVersion()}`;
      request.headers["x-amz-target"] = `${this.serviceTarget}.${operationSchema.name}`;
      if (this.awsQueryCompatible) {
        request.headers["x-amzn-query-mode"] = "true";
      }
      if (deref(operationSchema.input) === "unit" || !request.body) {
        request.body = "{}";
      }
      return request;
    }
    getPayloadCodec() {
      return this.codec;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      const { awsQueryCompatible } = this;
      if (awsQueryCompatible) {
        this.mixin.setQueryCompatError(dataObject, response);
      }
      const errorIdentifier = loadJsonRpcErrorCode(response, dataObject, awsQueryCompatible) ?? "Unknown";
      this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
      const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata, awsQueryCompatible ? this.mixin.findQueryCompatibleError : undefined);
      const ns = NormalizedSchema.of(errorSchema);
      const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
      const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
      const exception = new ErrorCtor({});
      const output = {};
      const errorDeserializer = this.codec.createDeserializer();
      for (const [name, member] of ns.structIterator()) {
        if (dataObject[name] != null) {
          output[name] = errorDeserializer.readObject(member, dataObject[name]);
        }
      }
      if (awsQueryCompatible) {
        this.mixin.queryCompatOutput(dataObject, output);
      }
      throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output), dataObject);
    }
  }

  class AwsJson1_0Protocol extends AwsJsonRpcProtocol {
    constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
      super({
        defaultNamespace,
        errorTypeRegistries,
        serviceTarget,
        awsQueryCompatible,
        jsonCodec
      });
    }
    getShapeId() {
      return "aws.protocols#awsJson1_0";
    }
    getJsonRpcVersion() {
      return "1.0";
    }
    getDefaultContentType() {
      return "application/x-amz-json-1.0";
    }
  }

  class AwsJson1_1Protocol extends AwsJsonRpcProtocol {
    constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
      super({
        defaultNamespace,
        errorTypeRegistries,
        serviceTarget,
        awsQueryCompatible,
        jsonCodec
      });
    }
    getShapeId() {
      return "aws.protocols#awsJson1_1";
    }
    getJsonRpcVersion() {
      return "1.1";
    }
    getDefaultContentType() {
      return "application/x-amz-json-1.1";
    }
  }

  class AwsRestJsonProtocol extends HttpBindingProtocol {
    serializer;
    deserializer;
    codec;
    mixin = new ProtocolLib;
    constructor({ defaultNamespace, errorTypeRegistries }) {
      super({
        defaultNamespace,
        errorTypeRegistries
      });
      const settings = {
        timestampFormat: {
          useTrait: true,
          default: 7
        },
        httpBindings: true,
        jsonName: true
      };
      this.codec = new JsonCodec(settings);
      this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
      this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
    }
    getShapeId() {
      return "aws.protocols#restJson1";
    }
    getPayloadCodec() {
      return this.codec;
    }
    setSerdeContext(serdeContext) {
      this.codec.setSerdeContext(serdeContext);
      super.setSerdeContext(serdeContext);
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      const inputSchema = NormalizedSchema.of(operationSchema.input);
      if (!request.headers["content-type"]) {
        const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
        if (contentType) {
          request.headers["content-type"] = contentType;
        }
      }
      if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) {
        request.body = "{}";
      }
      return request;
    }
    async deserializeResponse(operationSchema, context, response) {
      const output = await super.deserializeResponse(operationSchema, context, response);
      const outputSchema = NormalizedSchema.of(operationSchema.output);
      for (const [name, member] of outputSchema.structIterator()) {
        if (member.getMemberTraits().httpPayload && !(name in output)) {
          output[name] = null;
        }
      }
      return output;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      const errorIdentifier = loadRestJsonErrorCode(response, dataObject) ?? "Unknown";
      this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
      const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
      const ns = NormalizedSchema.of(errorSchema);
      const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
      const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
      const exception = new ErrorCtor({});
      await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
      const output = {};
      const errorDeserializer = this.codec.createDeserializer();
      for (const [name, member] of ns.structIterator()) {
        const target = member.getMergedTraits().jsonName ?? name;
        output[name] = errorDeserializer.readObject(member, dataObject[target]);
      }
      throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output), dataObject);
    }
    getDefaultContentType() {
      return "application/json";
    }
  }
  var awsExpectUnion = (value) => {
    if (value == null) {
      return;
    }
    if (typeof value === "object" && "__type" in value) {
      delete value.__type;
    }
    return expectUnion(value);
  };

  class XmlShapeDeserializer extends SerdeContextConfig {
    settings;
    stringDeserializer;
    constructor(settings) {
      super();
      this.settings = settings;
      this.stringDeserializer = new FromStringShapeDeserializer(settings);
    }
    setSerdeContext(serdeContext) {
      this.serdeContext = serdeContext;
      this.stringDeserializer.setSerdeContext(serdeContext);
    }
    read(schema, bytes, key) {
      const ns = NormalizedSchema.of(schema);
      const memberSchemas = ns.getMemberSchemas();
      const isEventPayload = ns.isStructSchema() && ns.isMemberSchema() && !!Object.values(memberSchemas).find((memberNs) => {
        return !!memberNs.getMemberTraits().eventPayload;
      });
      if (isEventPayload) {
        const output = {};
        const memberName = Object.keys(memberSchemas)[0];
        const eventMemberSchema = memberSchemas[memberName];
        if (eventMemberSchema.isBlobSchema()) {
          output[memberName] = bytes;
        } else {
          output[memberName] = this.read(memberSchemas[memberName], bytes);
        }
        return output;
      }
      const xmlString = (this.serdeContext?.utf8Encoder ?? toUtf8)(bytes);
      const parsedObject = this.parseXml(xmlString);
      return this.readSchema(schema, key ? parsedObject[key] : parsedObject);
    }
    readSchema(_schema, value) {
      const ns = NormalizedSchema.of(_schema);
      if (ns.isUnitSchema()) {
        return;
      }
      const traits = ns.getMergedTraits();
      if (ns.isListSchema() && !Array.isArray(value)) {
        return this.readSchema(ns, [value]);
      }
      if (value == null) {
        return value;
      }
      if (typeof value === "object") {
        const flat = !!traits.xmlFlattened;
        if (ns.isListSchema()) {
          const listValue = ns.getValueSchema();
          const buffer2 = [];
          const sourceKey = listValue.getMergedTraits().xmlName ?? "member";
          const source = flat ? value : (value[0] ?? value)[sourceKey];
          if (source == null) {
            return buffer2;
          }
          const sourceArray = Array.isArray(source) ? source : [source];
          for (const v of sourceArray) {
            buffer2.push(this.readSchema(listValue, v));
          }
          return buffer2;
        }
        const buffer = {};
        if (ns.isMapSchema()) {
          const keyNs = ns.getKeySchema();
          const memberNs = ns.getValueSchema();
          let entries;
          if (flat) {
            entries = Array.isArray(value) ? value : [value];
          } else {
            entries = Array.isArray(value.entry) ? value.entry : [value.entry];
          }
          const keyProperty = keyNs.getMergedTraits().xmlName ?? "key";
          const valueProperty = memberNs.getMergedTraits().xmlName ?? "value";
          for (const entry of entries) {
            const key = entry[keyProperty];
            const value2 = entry[valueProperty];
            buffer[key] = this.readSchema(memberNs, value2);
          }
          return buffer;
        }
        if (ns.isStructSchema()) {
          const union = ns.isUnionSchema();
          let unionSerde;
          if (union) {
            unionSerde = new UnionSerde(value, buffer);
          }
          for (const [memberName, memberSchema] of ns.structIterator()) {
            const memberTraits = memberSchema.getMergedTraits();
            const xmlObjectKey = !memberTraits.httpPayload ? memberSchema.getMemberTraits().xmlName ?? memberName : memberTraits.xmlName ?? memberSchema.getName();
            if (union) {
              unionSerde.mark(xmlObjectKey);
            }
            if (value[xmlObjectKey] != null) {
              buffer[memberName] = this.readSchema(memberSchema, value[xmlObjectKey]);
            }
          }
          if (union) {
            unionSerde.writeUnknown();
          }
          return buffer;
        }
        if (ns.isDocumentSchema()) {
          return value;
        }
        throw new Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${ns.getName(true)}`);
      }
      if (ns.isListSchema()) {
        return [];
      }
      if (ns.isMapSchema() || ns.isStructSchema()) {
        return {};
      }
      return this.stringDeserializer.read(ns, value);
    }
    parseXml(xml) {
      if (xml.length) {
        let parsedObj;
        try {
          parsedObj = parseXML(xml);
        } catch (e) {
          if (e && typeof e === "object") {
            Object.defineProperty(e, "$responseBodyText", {
              value: xml
            });
          }
          throw e;
        }
        const textNodeName = "#text";
        const key = Object.keys(parsedObj)[0];
        const parsedObjToReturn = parsedObj[key];
        if (parsedObjToReturn[textNodeName]) {
          parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
          delete parsedObjToReturn[textNodeName];
        }
        return getValueFromTextNode(parsedObjToReturn);
      }
      return {};
    }
  }

  class QueryShapeSerializer extends SerdeContextConfig {
    settings;
    buffer;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    write(schema, value, prefix = "") {
      if (this.buffer === undefined) {
        this.buffer = "";
      }
      const ns = NormalizedSchema.of(schema);
      if (prefix && !prefix.endsWith(".")) {
        prefix += ".";
      }
      if (ns.isBlobSchema()) {
        if (typeof value === "string" || value instanceof Uint8Array) {
          this.writeKey(prefix);
          this.writeValue((this.serdeContext?.base64Encoder ?? toBase64)(value));
        }
      } else if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isStringSchema()) {
        if (value != null) {
          this.writeKey(prefix);
          this.writeValue(String(value));
        } else if (ns.isIdempotencyToken()) {
          this.writeKey(prefix);
          this.writeValue(generateIdempotencyToken());
        }
      } else if (ns.isBigIntegerSchema()) {
        if (value != null) {
          this.writeKey(prefix);
          this.writeValue(String(value));
        }
      } else if (ns.isBigDecimalSchema()) {
        if (value != null) {
          this.writeKey(prefix);
          this.writeValue(value instanceof NumericValue ? value.string : String(value));
        }
      } else if (ns.isTimestampSchema()) {
        if (value instanceof Date) {
          this.writeKey(prefix);
          const format = determineTimestampFormat(ns, this.settings);
          switch (format) {
            case 5:
              this.writeValue(value.toISOString().replace(".000Z", "Z"));
              break;
            case 6:
              this.writeValue(dateToUtcString(value));
              break;
            case 7:
              this.writeValue(String(value.getTime() / 1000));
              break;
          }
        }
      } else if (ns.isDocumentSchema()) {
        if (Array.isArray(value)) {
          this.write(64 | 15, value, prefix);
        } else if (value instanceof Date) {
          this.write(4, value, prefix);
        } else if (value instanceof Uint8Array) {
          this.write(21, value, prefix);
        } else if (value && typeof value === "object") {
          this.write(128 | 15, value, prefix);
        } else {
          this.writeKey(prefix);
          this.writeValue(String(value));
        }
      } else if (ns.isListSchema()) {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            if (this.settings.serializeEmptyLists) {
              this.writeKey(prefix);
              this.writeValue("");
            }
          } else {
            const member = ns.getValueSchema();
            const flat = this.settings.flattenLists || ns.getMergedTraits().xmlFlattened;
            let i = 1;
            for (const item of value) {
              if (item == null) {
                continue;
              }
              const traits = member.getMergedTraits();
              const suffix = this.getKey("member", traits.xmlName, traits.ec2QueryName);
              const key = flat ? `${prefix}${i}` : `${prefix}${suffix}.${i}`;
              this.write(member, item, key);
              ++i;
            }
          }
        }
      } else if (ns.isMapSchema()) {
        if (value && typeof value === "object") {
          const keySchema = ns.getKeySchema();
          const memberSchema = ns.getValueSchema();
          const flat = ns.getMergedTraits().xmlFlattened;
          let i = 1;
          for (const k in value) {
            const v = value[k];
            if (v == null) {
              continue;
            }
            const keyTraits = keySchema.getMergedTraits();
            const keySuffix = this.getKey("key", keyTraits.xmlName, keyTraits.ec2QueryName);
            const key = flat ? `${prefix}${i}.${keySuffix}` : `${prefix}entry.${i}.${keySuffix}`;
            const valTraits = memberSchema.getMergedTraits();
            const valueSuffix = this.getKey("value", valTraits.xmlName, valTraits.ec2QueryName);
            const valueKey = flat ? `${prefix}${i}.${valueSuffix}` : `${prefix}entry.${i}.${valueSuffix}`;
            this.write(keySchema, k, key);
            this.write(memberSchema, v, valueKey);
            ++i;
          }
        }
      } else if (ns.isStructSchema()) {
        if (value && typeof value === "object") {
          let didWriteMember = false;
          for (const [memberName, member] of ns.structIterator()) {
            if (value[memberName] == null && !member.isIdempotencyToken()) {
              continue;
            }
            const traits = member.getMergedTraits();
            const suffix = this.getKey(memberName, traits.xmlName, traits.ec2QueryName, "struct");
            const key = `${prefix}${suffix}`;
            this.write(member, value[memberName], key);
            didWriteMember = true;
          }
          if (!didWriteMember && ns.isUnionSchema()) {
            const { $unknown } = value;
            if (Array.isArray($unknown)) {
              const [k, v] = $unknown;
              const key = `${prefix}${k}`;
              this.write(15, v, key);
            }
          }
        }
      } else if (ns.isUnitSchema())
        ;
      else {
        throw new Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${ns.getName(true)}`);
      }
    }
    flush() {
      if (this.buffer === undefined) {
        throw new Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
      }
      const str = this.buffer;
      delete this.buffer;
      return str;
    }
    getKey(memberName, xmlName, ec2QueryName, keySource) {
      const { ec2, capitalizeKeys } = this.settings;
      if (ec2 && ec2QueryName) {
        return ec2QueryName;
      }
      const key = xmlName ?? memberName;
      if (capitalizeKeys && keySource === "struct") {
        return key[0].toUpperCase() + key.slice(1);
      }
      return key;
    }
    writeKey(key) {
      if (key.endsWith(".")) {
        key = key.slice(0, key.length - 1);
      }
      this.buffer += `&${extendedEncodeURIComponent(key)}=`;
    }
    writeValue(value) {
      this.buffer += extendedEncodeURIComponent(value);
    }
  }

  class AwsQueryProtocol extends RpcProtocol {
    options;
    serializer;
    deserializer;
    mixin = new ProtocolLib;
    constructor(options) {
      super({
        defaultNamespace: options.defaultNamespace,
        errorTypeRegistries: options.errorTypeRegistries
      });
      this.options = options;
      const settings = {
        timestampFormat: {
          useTrait: true,
          default: 5
        },
        httpBindings: false,
        xmlNamespace: options.xmlNamespace,
        serviceNamespace: options.defaultNamespace,
        serializeEmptyLists: true
      };
      this.serializer = new QueryShapeSerializer(settings);
      this.deserializer = new XmlShapeDeserializer(settings);
    }
    getShapeId() {
      return "aws.protocols#awsQuery";
    }
    setSerdeContext(serdeContext) {
      this.serializer.setSerdeContext(serdeContext);
      this.deserializer.setSerdeContext(serdeContext);
    }
    getPayloadCodec() {
      throw new Error("AWSQuery protocol has no payload codec.");
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      if (!request.path.endsWith("/")) {
        request.path += "/";
      }
      request.headers["content-type"] = "application/x-www-form-urlencoded";
      if (deref(operationSchema.input) === "unit" || !request.body) {
        request.body = "";
      }
      const action = operationSchema.name.split("#")[1] ?? operationSchema.name;
      request.body = `Action=${action}&Version=${this.options.version}` + request.body;
      if (request.body.endsWith("&")) {
        request.body = request.body.slice(-1);
      }
      return request;
    }
    async deserializeResponse(operationSchema, context, response) {
      const deserializer = this.deserializer;
      const ns = NormalizedSchema.of(operationSchema.output);
      const dataObject = {};
      if (response.statusCode >= 300) {
        const bytes2 = await collectBody(response.body, context);
        if (bytes2.byteLength > 0) {
          Object.assign(dataObject, await deserializer.read(15, bytes2));
        }
        await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
      }
      for (const header in response.headers) {
        const value = response.headers[header];
        delete response.headers[header];
        response.headers[header.toLowerCase()] = value;
      }
      const shortName = operationSchema.name.split("#")[1] ?? operationSchema.name;
      const awsQueryResultKey = ns.isStructSchema() && this.useNestedResult() ? shortName + "Result" : undefined;
      const bytes = await collectBody(response.body, context);
      if (bytes.byteLength > 0) {
        Object.assign(dataObject, await deserializer.read(ns, bytes, awsQueryResultKey));
      }
      dataObject.$metadata = this.deserializeMetadata(response);
      return dataObject;
    }
    useNestedResult() {
      return true;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      const errorIdentifier = this.loadQueryErrorCode(response, dataObject) ?? "Unknown";
      this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
      const errorData = this.loadQueryError(dataObject) ?? {};
      const message = this.loadQueryErrorMessage(dataObject);
      errorData.message = message;
      errorData.Error = {
        Type: errorData.Type,
        Code: errorData.Code,
        Message: message
      };
      const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, errorData, metadata, this.mixin.findQueryCompatibleError);
      const ns = NormalizedSchema.of(errorSchema);
      const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
      const exception = new ErrorCtor({});
      const output = {
        Type: errorData.Error.Type,
        Code: errorData.Error.Code,
        Error: errorData.Error
      };
      for (const [name, member] of ns.structIterator()) {
        const target = member.getMergedTraits().xmlName ?? name;
        const value = errorData[target] ?? dataObject[target];
        output[name] = this.deserializer.readSchema(member, value);
      }
      throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output), dataObject);
    }
    loadQueryErrorCode(output, data) {
      const code = (data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error)?.Code;
      if (code !== undefined) {
        return code;
      }
      if (output.statusCode == 404) {
        return "NotFound";
      }
    }
    loadQueryError(data) {
      return data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error;
    }
    loadQueryErrorMessage(data) {
      const errorData = this.loadQueryError(data);
      return errorData?.message ?? errorData?.Message ?? data.message ?? data.Message ?? "Unknown";
    }
    getDefaultContentType() {
      return "application/x-www-form-urlencoded";
    }
  }

  class AwsEc2QueryProtocol extends AwsQueryProtocol {
    options;
    constructor(options) {
      super(options);
      this.options = options;
      const ec2Settings = {
        capitalizeKeys: true,
        flattenLists: true,
        serializeEmptyLists: false,
        ec2: true
      };
      Object.assign(this.serializer.settings, ec2Settings);
    }
    getShapeId() {
      return "aws.protocols#ec2Query";
    }
    useNestedResult() {
      return false;
    }
  }
  var parseXmlBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
    if (encoded.length) {
      let parsedObj;
      try {
        parsedObj = parseXML(encoded);
      } catch (e) {
        if (e && typeof e === "object") {
          Object.defineProperty(e, "$responseBodyText", {
            value: encoded
          });
        }
        throw e;
      }
      const textNodeName = "#text";
      const key = Object.keys(parsedObj)[0];
      const parsedObjToReturn = parsedObj[key];
      if (parsedObjToReturn[textNodeName]) {
        parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
        delete parsedObjToReturn[textNodeName];
      }
      return getValueFromTextNode(parsedObjToReturn);
    }
    return {};
  });
  var parseXmlErrorBody = async (errorBody, context) => {
    const value = await parseXmlBody(errorBody, context);
    if (value.Error) {
      value.Error.message = value.Error.message ?? value.Error.Message;
    }
    return value;
  };
  var loadRestXmlErrorCode = (output, data) => {
    if (data?.Error?.Code !== undefined) {
      return data.Error.Code;
    }
    if (data?.Code !== undefined) {
      return data.Code;
    }
    if (output.statusCode == 404) {
      return "NotFound";
    }
  };

  class XmlShapeSerializer extends SerdeContextConfig {
    settings;
    stringBuffer;
    byteBuffer;
    buffer;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    write(schema, value) {
      const ns = NormalizedSchema.of(schema);
      if (ns.isStringSchema() && typeof value === "string") {
        this.stringBuffer = value;
      } else if (ns.isBlobSchema()) {
        this.byteBuffer = "byteLength" in value ? value : (this.serdeContext?.base64Decoder ?? fromBase64)(value);
      } else {
        this.buffer = this.writeStruct(ns, value, undefined);
        const traits = ns.getMergedTraits();
        if (traits.httpPayload && !traits.xmlName) {
          this.buffer.withName(ns.getName());
        }
      }
    }
    flush() {
      if (this.byteBuffer !== undefined) {
        const bytes = this.byteBuffer;
        delete this.byteBuffer;
        return bytes;
      }
      if (this.stringBuffer !== undefined) {
        const str = this.stringBuffer;
        delete this.stringBuffer;
        return str;
      }
      const buffer = this.buffer;
      if (this.settings.xmlNamespace) {
        if (!buffer?.attributes?.["xmlns"]) {
          buffer.addAttribute("xmlns", this.settings.xmlNamespace);
        }
      }
      delete this.buffer;
      return buffer.toString();
    }
    writeStruct(ns, value, parentXmlns) {
      const traits = ns.getMergedTraits();
      const name = ns.isMemberSchema() && !traits.httpPayload ? ns.getMemberTraits().xmlName ?? ns.getMemberName() : traits.xmlName ?? ns.getName();
      if (!name || !ns.isStructSchema()) {
        throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write struct with empty name or non-struct, schema=${ns.getName(true)}.`);
      }
      const structXmlNode = XmlNode.of(name);
      const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
      for (const [memberName, memberSchema] of ns.structIterator()) {
        const val = value[memberName];
        if (val != null || memberSchema.isIdempotencyToken()) {
          if (memberSchema.getMergedTraits().xmlAttribute) {
            structXmlNode.addAttribute(memberSchema.getMergedTraits().xmlName ?? memberName, this.writeSimple(memberSchema, val));
            continue;
          }
          if (memberSchema.isListSchema()) {
            this.writeList(memberSchema, val, structXmlNode, xmlns);
          } else if (memberSchema.isMapSchema()) {
            this.writeMap(memberSchema, val, structXmlNode, xmlns);
          } else if (memberSchema.isStructSchema()) {
            structXmlNode.addChildNode(this.writeStruct(memberSchema, val, xmlns));
          } else {
            const memberNode = XmlNode.of(memberSchema.getMergedTraits().xmlName ?? memberSchema.getMemberName());
            this.writeSimpleInto(memberSchema, val, memberNode, xmlns);
            structXmlNode.addChildNode(memberNode);
          }
        }
      }
      const { $unknown } = value;
      if ($unknown && ns.isUnionSchema() && Array.isArray($unknown) && Object.keys(value).length === 1) {
        const [k, v] = $unknown;
        const node = XmlNode.of(k);
        if (typeof v !== "string") {
          if (value instanceof XmlNode || value instanceof XmlText) {
            structXmlNode.addChildNode(value);
          } else {
            throw new Error(`@aws-sdk - $unknown union member in XML requires ` + `value of type string, @aws-sdk/xml-builder::XmlNode or XmlText.`);
          }
        }
        this.writeSimpleInto(0, v, node, xmlns);
        structXmlNode.addChildNode(node);
      }
      if (xmlns) {
        structXmlNode.addAttribute(xmlnsAttr, xmlns);
      }
      return structXmlNode;
    }
    writeList(listMember, array, container, parentXmlns) {
      if (!listMember.isMemberSchema()) {
        throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member list: ${listMember.getName(true)}`);
      }
      const listTraits = listMember.getMergedTraits();
      const listValueSchema = listMember.getValueSchema();
      const listValueTraits = listValueSchema.getMergedTraits();
      const sparse = !!listValueTraits.sparse;
      const flat = !!listTraits.xmlFlattened;
      const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(listMember, parentXmlns);
      const writeItem = (container2, value) => {
        if (listValueSchema.isListSchema()) {
          this.writeList(listValueSchema, Array.isArray(value) ? value : [value], container2, xmlns);
        } else if (listValueSchema.isMapSchema()) {
          this.writeMap(listValueSchema, value, container2, xmlns);
        } else if (listValueSchema.isStructSchema()) {
          const struct = this.writeStruct(listValueSchema, value, xmlns);
          container2.addChildNode(struct.withName(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member"));
        } else {
          const listItemNode = XmlNode.of(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member");
          this.writeSimpleInto(listValueSchema, value, listItemNode, xmlns);
          container2.addChildNode(listItemNode);
        }
      };
      if (flat) {
        for (const value of array) {
          if (sparse || value != null) {
            writeItem(container, value);
          }
        }
      } else {
        const listNode = XmlNode.of(listTraits.xmlName ?? listMember.getMemberName());
        if (xmlns) {
          listNode.addAttribute(xmlnsAttr, xmlns);
        }
        for (const value of array) {
          if (sparse || value != null) {
            writeItem(listNode, value);
          }
        }
        container.addChildNode(listNode);
      }
    }
    writeMap(mapMember, map, container, parentXmlns, containerIsMap = false) {
      if (!mapMember.isMemberSchema()) {
        throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member map: ${mapMember.getName(true)}`);
      }
      const mapTraits = mapMember.getMergedTraits();
      const mapKeySchema = mapMember.getKeySchema();
      const mapKeyTraits = mapKeySchema.getMergedTraits();
      const keyTag = mapKeyTraits.xmlName ?? "key";
      const mapValueSchema = mapMember.getValueSchema();
      const mapValueTraits = mapValueSchema.getMergedTraits();
      const valueTag = mapValueTraits.xmlName ?? "value";
      const sparse = !!mapValueTraits.sparse;
      const flat = !!mapTraits.xmlFlattened;
      const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(mapMember, parentXmlns);
      const addKeyValue = (entry, key, val) => {
        const keyNode = XmlNode.of(keyTag, key);
        const [keyXmlnsAttr, keyXmlns] = this.getXmlnsAttribute(mapKeySchema, xmlns);
        if (keyXmlns) {
          keyNode.addAttribute(keyXmlnsAttr, keyXmlns);
        }
        entry.addChildNode(keyNode);
        let valueNode = XmlNode.of(valueTag);
        if (mapValueSchema.isListSchema()) {
          this.writeList(mapValueSchema, val, valueNode, xmlns);
        } else if (mapValueSchema.isMapSchema()) {
          this.writeMap(mapValueSchema, val, valueNode, xmlns, true);
        } else if (mapValueSchema.isStructSchema()) {
          valueNode = this.writeStruct(mapValueSchema, val, xmlns);
        } else {
          this.writeSimpleInto(mapValueSchema, val, valueNode, xmlns);
        }
        entry.addChildNode(valueNode);
      };
      if (flat) {
        for (const key in map) {
          const val = map[key];
          if (sparse || val != null) {
            const entry = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
            addKeyValue(entry, key, val);
            container.addChildNode(entry);
          }
        }
      } else {
        let mapNode;
        if (!containerIsMap) {
          mapNode = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
          if (xmlns) {
            mapNode.addAttribute(xmlnsAttr, xmlns);
          }
          container.addChildNode(mapNode);
        }
        for (const key in map) {
          const val = map[key];
          if (sparse || val != null) {
            const entry = XmlNode.of("entry");
            addKeyValue(entry, key, val);
            (containerIsMap ? container : mapNode).addChildNode(entry);
          }
        }
      }
    }
    writeSimple(_schema, value) {
      if (value === null) {
        throw new Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
      }
      const ns = NormalizedSchema.of(_schema);
      let nodeContents = null;
      if (value && typeof value === "object") {
        if (ns.isBlobSchema()) {
          nodeContents = (this.serdeContext?.base64Encoder ?? toBase64)(value);
        } else if (ns.isTimestampSchema() && value instanceof Date) {
          const format = determineTimestampFormat(ns, this.settings);
          switch (format) {
            case 5:
              nodeContents = value.toISOString().replace(".000Z", "Z");
              break;
            case 6:
              nodeContents = dateToUtcString(value);
              break;
            case 7:
              nodeContents = String(value.getTime() / 1000);
              break;
            default:
              console.warn("Missing timestamp format, using http date", value);
              nodeContents = dateToUtcString(value);
              break;
          }
        } else if (ns.isBigDecimalSchema() && value) {
          if (value instanceof NumericValue) {
            return value.string;
          }
          return String(value);
        } else if (ns.isMapSchema() || ns.isListSchema()) {
          throw new Error("@aws-sdk/core/protocols - xml serializer, cannot call _write() on List/Map schema, call writeList or writeMap() instead.");
        } else {
          throw new Error(`@aws-sdk/core/protocols - xml serializer, unhandled schema type for object value and schema: ${ns.getName(true)}`);
        }
      }
      if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) {
        nodeContents = String(value);
      }
      if (ns.isStringSchema()) {
        if (value === undefined && ns.isIdempotencyToken()) {
          nodeContents = generateIdempotencyToken();
        } else {
          nodeContents = String(value);
        }
      }
      if (nodeContents === null) {
        throw new Error(`Unhandled schema-value pair ${ns.getName(true)}=${value}`);
      }
      return nodeContents;
    }
    writeSimpleInto(_schema, value, into, parentXmlns) {
      const nodeContents = this.writeSimple(_schema, value);
      const ns = NormalizedSchema.of(_schema);
      const content = new XmlText(nodeContents);
      const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
      if (xmlns) {
        into.addAttribute(xmlnsAttr, xmlns);
      }
      into.addChildNode(content);
    }
    getXmlnsAttribute(ns, parentXmlns) {
      const traits = ns.getMergedTraits();
      const [prefix, xmlns] = traits.xmlNamespace ?? [];
      if (xmlns && xmlns !== parentXmlns) {
        return [prefix ? `xmlns:${prefix}` : "xmlns", xmlns];
      }
      return [undefined, undefined];
    }
  }

  class XmlCodec extends SerdeContextConfig {
    settings;
    constructor(settings) {
      super();
      this.settings = settings;
    }
    createSerializer() {
      const serializer = new XmlShapeSerializer(this.settings);
      serializer.setSerdeContext(this.serdeContext);
      return serializer;
    }
    createDeserializer() {
      const deserializer = new XmlShapeDeserializer(this.settings);
      deserializer.setSerdeContext(this.serdeContext);
      return deserializer;
    }
  }

  class AwsRestXmlProtocol extends HttpBindingProtocol {
    codec;
    serializer;
    deserializer;
    mixin = new ProtocolLib;
    constructor(options) {
      super(options);
      const settings = {
        timestampFormat: {
          useTrait: true,
          default: 5
        },
        httpBindings: true,
        xmlNamespace: options.xmlNamespace,
        serviceNamespace: options.defaultNamespace
      };
      this.codec = new XmlCodec(settings);
      this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
      this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
    }
    getPayloadCodec() {
      return this.codec;
    }
    getShapeId() {
      return "aws.protocols#restXml";
    }
    async serializeRequest(operationSchema, input, context) {
      const request = await super.serializeRequest(operationSchema, input, context);
      const inputSchema = NormalizedSchema.of(operationSchema.input);
      if (!request.headers["content-type"]) {
        const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
        if (contentType) {
          request.headers["content-type"] = contentType;
        }
      }
      if (typeof request.body === "string" && request.headers["content-type"] === this.getDefaultContentType() && !request.body.startsWith("<?xml ") && !this.hasUnstructuredPayloadBinding(inputSchema)) {
        request.body = '<?xml version="1.0" encoding="UTF-8"?>' + request.body;
      }
      return request;
    }
    async deserializeResponse(operationSchema, context, response) {
      return super.deserializeResponse(operationSchema, context, response);
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
      const errorIdentifier = loadRestXmlErrorCode(response, dataObject) ?? "Unknown";
      this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
      if (dataObject.Error && typeof dataObject.Error === "object") {
        for (const key of Object.keys(dataObject.Error)) {
          dataObject[key] = dataObject.Error[key];
          if (key.toLowerCase() === "message") {
            dataObject.message = dataObject.Error[key];
          }
        }
      }
      if (dataObject.RequestId && !metadata.requestId) {
        metadata.requestId = dataObject.RequestId;
      }
      const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
      const ns = NormalizedSchema.of(errorSchema);
      const message = dataObject.Error?.message ?? dataObject.Error?.Message ?? dataObject.message ?? dataObject.Message ?? "UnknownError";
      const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
      const exception = new ErrorCtor({});
      await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
      const output = {};
      const errorDeserializer = this.codec.createDeserializer();
      for (const [name, member] of ns.structIterator()) {
        const target = member.getMergedTraits().xmlName ?? name;
        const value = dataObject.Error?.[target] ?? dataObject[target];
        output[name] = errorDeserializer.readSchema(member, value);
      }
      throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
        $fault: ns.getMergedTraits().error,
        message
      }, output), dataObject);
    }
    getDefaultContentType() {
      return "application/xml";
    }
    hasUnstructuredPayloadBinding(ns) {
      for (const [, member] of ns.structIterator()) {
        if (member.getMergedTraits().httpPayload) {
          return !(member.isStructSchema() || member.isMapSchema() || member.isListSchema());
        }
      }
      return false;
    }
  }
  exports.AwsEc2QueryProtocol = AwsEc2QueryProtocol;
  exports.AwsJson1_0Protocol = AwsJson1_0Protocol;
  exports.AwsJson1_1Protocol = AwsJson1_1Protocol;
  exports.AwsJsonRpcProtocol = AwsJsonRpcProtocol;
  exports.AwsQueryProtocol = AwsQueryProtocol;
  exports.AwsRestJsonProtocol = AwsRestJsonProtocol;
  exports.AwsRestXmlProtocol = AwsRestXmlProtocol;
  exports.AwsSmithyRpcV2CborProtocol = AwsSmithyRpcV2CborProtocol;
  exports.JsonCodec = JsonCodec;
  exports.JsonShapeDeserializer = JsonShapeDeserializer;
  exports.JsonShapeSerializer = JsonShapeSerializer;
  exports.QueryShapeSerializer = QueryShapeSerializer;
  exports.XmlCodec = XmlCodec;
  exports.XmlShapeDeserializer = XmlShapeDeserializer;
  exports.XmlShapeSerializer = XmlShapeSerializer;
  exports._toBool = _toBool;
  exports._toNum = _toNum;
  exports._toStr = _toStr;
  exports.awsExpectUnion = awsExpectUnion;
  exports.loadJsonRpcErrorCode = loadJsonRpcErrorCode;
  exports.loadRestJsonErrorCode = loadRestJsonErrorCode;
  exports.loadRestXmlErrorCode = loadRestXmlErrorCode;
  exports.parseJsonBody = parseJsonBody;
  exports.parseJsonErrorBody = parseJsonErrorBody;
  exports.parseXmlBody = parseXmlBody;
  exports.parseXmlErrorBody = parseXmlErrorBody;
});

// ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.23/node_modules/@aws-sdk/nested-clients/dist-cjs/submodules/sso-oidc/index.js
var require_sso_oidc = __commonJS((exports) => {
  var { awsEndpointFunctions, emitWarningIfUnsupportedVersion: emitWarningIfUnsupportedVersion$1, createDefaultUserAgentProvider, NODE_APP_ID_CONFIG_OPTIONS, getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration, resolveUserAgentConfig, resolveHostHeaderConfig, getUserAgentPlugin, getHostHeaderPlugin, getLoggerPlugin, getRecursionDetectionPlugin } = require_client2();
  var { NoAuthSigner, getHttpAuthSchemeEndpointRuleSetPlugin, DefaultIdentityProviderConfig, getHttpSigningPlugin } = require_dist_cjs3();
  var { normalizeProvider, getSmithyContext, ServiceException, NoOpLogger, emitWarningIfUnsupportedVersion, loadConfigsForDefaultMode, getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig, Client, Command, createAggregatedClient } = require_client();
  exports.$Command = Command;
  exports.__Client = Client;
  var { resolveDefaultsModeConfig, loadConfig, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS, resolveRegionConfig } = require_config();
  var { BinaryDecisionDiagram, EndpointCache, decideEndpoint, customEndpointFunctions, resolveEndpointConfig, getEndpointPlugin } = require_endpoints();
  var { parseUrl, getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig, getContentLengthPlugin } = require_protocols();
  var { DEFAULT_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, getRetryPlugin } = require_retry();
  var { TypeRegistry, getSchemaSerdePlugin } = require_schema();
  var { resolveAwsSdkSigV4Config, AwsSdkSigV4Signer, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS } = require_httpAuthSchemes();
  var { toUtf8, fromUtf8, toBase64, fromBase64, Hash, calculateBodyLength } = require_serde();
  var { streamCollector, NodeHttpHandler } = require_dist_cjs2();
  var { AwsRestJsonProtocol } = require_protocols2();
  var defaultSSOOIDCHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
      operation: getSmithyContext(context).operation,
      region: await normalizeProvider(config.region)() || (() => {
        throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
      })()
    };
  };
  function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4",
      signingProperties: {
        name: "sso-oauth",
        region: authParameters.region
      },
      propertiesExtractor: (config, context) => ({
        signingProperties: {
          config,
          context
        }
      })
    };
  }
  function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
      schemeId: "smithy.api#noAuth"
    };
  }
  var defaultSSOOIDCHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
      case "CreateToken": {
        options.push(createSmithyApiNoAuthHttpAuthOption());
        break;
      }
      default: {
        options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
      }
    }
    return options;
  };
  var resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    return Object.assign(config_0, {
      authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
    });
  };
  var resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
      useDualstackEndpoint: options.useDualstackEndpoint ?? false,
      useFipsEndpoint: options.useFipsEndpoint ?? false,
      defaultSigningName: "sso-oauth"
    });
  };
  var commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
  };
  var version = "3.997.22";
  var packageInfo = {
    version
  };
  var k = "ref";
  var a = -1;
  var b = true;
  var c = "isSet";
  var d = "PartitionResult";
  var e = "booleanEquals";
  var f = "getAttr";
  var g = { [k]: "Endpoint" };
  var h = { [k]: d };
  var i = {};
  var j = [{ [k]: "Region" }];
  var _data = {
    conditions: [
      [c, [g]],
      [c, j],
      ["aws.partition", j, d],
      [e, [{ [k]: "UseFIPS" }, b]],
      [e, [{ [k]: "UseDualStack" }, b]],
      [e, [{ fn: f, argv: [h, "supportsDualStack"] }, b]],
      [e, [{ fn: f, argv: [h, "supportsFIPS"] }, b]],
      ["stringEquals", [{ fn: f, argv: [h, "name"] }, "aws-us-gov"]]
    ],
    results: [
      [a],
      [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
      [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
      [g, i],
      ["https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
      [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
      ["https://oidc.{Region}.amazonaws.com", i],
      ["https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}", i],
      [a, "FIPS is enabled but this partition does not support FIPS"],
      ["https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
      [a, "DualStack is enabled but this partition does not support DualStack"],
      ["https://oidc.{Region}.{PartitionResult#dnsSuffix}", i],
      [a, "Invalid Configuration: Missing Region"]
    ]
  };
  var root = 2;
  var r = 1e8;
  var nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    13,
    3,
    1,
    4,
    r + 12,
    2,
    5,
    r + 12,
    3,
    8,
    6,
    4,
    7,
    r + 11,
    5,
    r + 9,
    r + 10,
    4,
    11,
    9,
    6,
    10,
    r + 8,
    7,
    r + 6,
    r + 7,
    5,
    12,
    r + 5,
    6,
    r + 4,
    r + 5,
    3,
    r + 1,
    14,
    4,
    r + 2,
    r + 3
  ]);
  var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
  var cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"]
  });
  var defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => decideEndpoint(bdd, {
      endpointParams,
      logger: context.logger
    }));
  };
  customEndpointFunctions.aws = awsEndpointFunctions;

  class SSOOIDCServiceException extends ServiceException {
    constructor(options) {
      super(options);
      Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
    }
  }

  class AccessDeniedException extends SSOOIDCServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
      super({
        name: "AccessDeniedException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, AccessDeniedException.prototype);
      this.error = opts.error;
      this.reason = opts.reason;
      this.error_description = opts.error_description;
    }
  }

  class AuthorizationPendingException extends SSOOIDCServiceException {
    name = "AuthorizationPendingException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "AuthorizationPendingException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class ExpiredTokenException extends SSOOIDCServiceException {
    name = "ExpiredTokenException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "ExpiredTokenException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, ExpiredTokenException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class InternalServerException extends SSOOIDCServiceException {
    name = "InternalServerException";
    $fault = "server";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "InternalServerException",
        $fault: "server",
        ...opts
      });
      Object.setPrototypeOf(this, InternalServerException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class InvalidClientException extends SSOOIDCServiceException {
    name = "InvalidClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "InvalidClientException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidClientException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class InvalidGrantException extends SSOOIDCServiceException {
    name = "InvalidGrantException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "InvalidGrantException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidGrantException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class InvalidRequestException extends SSOOIDCServiceException {
    name = "InvalidRequestException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
      super({
        name: "InvalidRequestException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidRequestException.prototype);
      this.error = opts.error;
      this.reason = opts.reason;
      this.error_description = opts.error_description;
    }
  }

  class InvalidScopeException extends SSOOIDCServiceException {
    name = "InvalidScopeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "InvalidScopeException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidScopeException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class SlowDownException extends SSOOIDCServiceException {
    name = "SlowDownException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "SlowDownException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, SlowDownException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class UnauthorizedClientException extends SSOOIDCServiceException {
    name = "UnauthorizedClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "UnauthorizedClientException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }

  class UnsupportedGrantTypeException extends SSOOIDCServiceException {
    name = "UnsupportedGrantTypeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
      super({
        name: "UnsupportedGrantTypeException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
      this.error = opts.error;
      this.error_description = opts.error_description;
    }
  }
  var _ADE = "AccessDeniedException";
  var _APE = "AuthorizationPendingException";
  var _AT = "AccessToken";
  var _CS = "ClientSecret";
  var _CT = "CreateToken";
  var _CTR = "CreateTokenRequest";
  var _CTRr = "CreateTokenResponse";
  var _CV = "CodeVerifier";
  var _ETE = "ExpiredTokenException";
  var _ICE = "InvalidClientException";
  var _IGE = "InvalidGrantException";
  var _IRE = "InvalidRequestException";
  var _ISE = "InternalServerException";
  var _ISEn = "InvalidScopeException";
  var _IT = "IdToken";
  var _RT = "RefreshToken";
  var _SDE = "SlowDownException";
  var _UCE = "UnauthorizedClientException";
  var _UGTE = "UnsupportedGrantTypeException";
  var _aT = "accessToken";
  var _c = "client";
  var _cI = "clientId";
  var _cS = "clientSecret";
  var _cV = "codeVerifier";
  var _co = "code";
  var _dC = "deviceCode";
  var _e = "error";
  var _eI = "expiresIn";
  var _ed = "error_description";
  var _gT = "grantType";
  var _h = "http";
  var _hE = "httpError";
  var _iT = "idToken";
  var _r = "reason";
  var _rT = "refreshToken";
  var _rU = "redirectUri";
  var _s = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc";
  var _sc = "scope";
  var _se = "server";
  var _tT = "tokenType";
  var n0 = "com.amazonaws.ssooidc";
  var _s_registry = TypeRegistry.for(_s);
  var SSOOIDCServiceException$ = [-3, _s, "SSOOIDCServiceException", 0, [], []];
  _s_registry.registerError(SSOOIDCServiceException$, SSOOIDCServiceException);
  var n0_registry = TypeRegistry.for(n0);
  var AccessDeniedException$ = [
    -3,
    n0,
    _ADE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0]
  ];
  n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
  var AuthorizationPendingException$ = [
    -3,
    n0,
    _APE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(AuthorizationPendingException$, AuthorizationPendingException);
  var ExpiredTokenException$ = [
    -3,
    n0,
    _ETE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
  var InternalServerException$ = [
    -3,
    n0,
    _ISE,
    { [_e]: _se, [_hE]: 500 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(InternalServerException$, InternalServerException);
  var InvalidClientException$ = [
    -3,
    n0,
    _ICE,
    { [_e]: _c, [_hE]: 401 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(InvalidClientException$, InvalidClientException);
  var InvalidGrantException$ = [
    -3,
    n0,
    _IGE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(InvalidGrantException$, InvalidGrantException);
  var InvalidRequestException$ = [
    -3,
    n0,
    _IRE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0]
  ];
  n0_registry.registerError(InvalidRequestException$, InvalidRequestException);
  var InvalidScopeException$ = [
    -3,
    n0,
    _ISEn,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(InvalidScopeException$, InvalidScopeException);
  var SlowDownException$ = [
    -3,
    n0,
    _SDE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(SlowDownException$, SlowDownException);
  var UnauthorizedClientException$ = [
    -3,
    n0,
    _UCE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(UnauthorizedClientException$, UnauthorizedClientException);
  var UnsupportedGrantTypeException$ = [
    -3,
    n0,
    _UGTE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0]
  ];
  n0_registry.registerError(UnsupportedGrantTypeException$, UnsupportedGrantTypeException);
  var errorTypeRegistries = [
    _s_registry,
    n0_registry
  ];
  var AccessToken = [0, n0, _AT, 8, 0];
  var ClientSecret = [0, n0, _CS, 8, 0];
  var CodeVerifier = [0, n0, _CV, 8, 0];
  var IdToken = [0, n0, _IT, 8, 0];
  var RefreshToken = [0, n0, _RT, 8, 0];
  var CreateTokenRequest$ = [
    3,
    n0,
    _CTR,
    0,
    [_cI, _cS, _gT, _dC, _co, _rT, _sc, _rU, _cV],
    [0, [() => ClientSecret, 0], 0, 0, 0, [() => RefreshToken, 0], 64 | 0, 0, [() => CodeVerifier, 0]],
    3
  ];
  var CreateTokenResponse$ = [
    3,
    n0,
    _CTRr,
    0,
    [_aT, _tT, _eI, _rT, _iT],
    [[() => AccessToken, 0], 0, 1, [() => RefreshToken, 0], [() => IdToken, 0]]
  ];
  var CreateToken$ = [
    9,
    n0,
    _CT,
    { [_h]: ["POST", "/token", 200] },
    () => CreateTokenRequest$,
    () => CreateTokenResponse$
  ];
  var getRuntimeConfig$1 = (config) => {
    return {
      apiVersion: "2019-06-10",
      base64Decoder: config?.base64Decoder ?? fromBase64,
      base64Encoder: config?.base64Encoder ?? toBase64,
      disableHostPrefix: config?.disableHostPrefix ?? false,
      endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
      extensions: config?.extensions ?? [],
      httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOOIDCHttpAuthSchemeProvider,
      httpAuthSchemes: config?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
          signer: new AwsSdkSigV4Signer
        },
        {
          schemeId: "smithy.api#noAuth",
          identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
          signer: new NoAuthSigner
        }
      ],
      logger: config?.logger ?? new NoOpLogger,
      protocol: config?.protocol ?? AwsRestJsonProtocol,
      protocolSettings: config?.protocolSettings ?? {
        defaultNamespace: "com.amazonaws.ssooidc",
        errorTypeRegistries,
        version: "2019-06-10",
        serviceTarget: "AWSSSOOIDCService"
      },
      serviceId: config?.serviceId ?? "SSO OIDC",
      urlParser: config?.urlParser ?? parseUrl,
      utf8Decoder: config?.utf8Decoder ?? fromUtf8,
      utf8Encoder: config?.utf8Encoder ?? toUtf8
    };
  };
  var getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const loaderConfig = {
      profile: config?.profile,
      logger: clientSharedValues.logger
    };
    return {
      ...clientSharedValues,
      ...config,
      runtime: "node",
      defaultsMode,
      authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
      bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
      defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
      maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
      region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
      requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
      retryMode: config?.retryMode ?? loadConfig({
        ...NODE_RETRY_MODE_CONFIG_OPTIONS,
        default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
      }, config),
      sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
      streamCollector: config?.streamCollector ?? streamCollector,
      useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
    };
  };
  var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
      setHttpAuthScheme(httpAuthScheme) {
        const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
        if (index === -1) {
          _httpAuthSchemes.push(httpAuthScheme);
        } else {
          _httpAuthSchemes.splice(index, 1, httpAuthScheme);
        }
      },
      httpAuthSchemes() {
        return _httpAuthSchemes;
      },
      setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
        _httpAuthSchemeProvider = httpAuthSchemeProvider;
      },
      httpAuthSchemeProvider() {
        return _httpAuthSchemeProvider;
      },
      setCredentials(credentials) {
        _credentials = credentials;
      },
      credentials() {
        return _credentials;
      }
    };
  };
  var resolveHttpAuthRuntimeConfig = (config) => {
    return {
      httpAuthSchemes: config.httpAuthSchemes(),
      httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
      credentials: config.credentials()
    };
  };
  var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
  };

  class SSOOIDCClient extends Client {
    config;
    constructor(...[configuration]) {
      const _config_0 = getRuntimeConfig(configuration || {});
      super(_config_0);
      this.initConfig = _config_0;
      const _config_1 = resolveClientEndpointParameters(_config_0);
      const _config_2 = resolveUserAgentConfig(_config_1);
      const _config_3 = resolveRetryConfig(_config_2);
      const _config_4 = resolveRegionConfig(_config_3);
      const _config_5 = resolveHostHeaderConfig(_config_4);
      const _config_6 = resolveEndpointConfig(_config_5);
      const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
      const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
      this.config = _config_8;
      this.middlewareStack.use(getSchemaSerdePlugin(this.config));
      this.middlewareStack.use(getUserAgentPlugin(this.config));
      this.middlewareStack.use(getRetryPlugin(this.config));
      this.middlewareStack.use(getContentLengthPlugin(this.config));
      this.middlewareStack.use(getHostHeaderPlugin(this.config));
      this.middlewareStack.use(getLoggerPlugin(this.config));
      this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
      this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: defaultSSOOIDCHttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials
        })
      }));
      this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
      super.destroy();
    }
  }

  class CreateTokenCommand extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o) {
    return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
  }).s("AWSSSOOIDCService", "CreateToken", {}).n("SSOOIDCClient", "CreateTokenCommand").sc(CreateToken$).build() {
  }
  var commands = {
    CreateTokenCommand
  };

  class SSOOIDC extends SSOOIDCClient {
  }
  createAggregatedClient(commands, SSOOIDC);
  var AccessDeniedExceptionReason = {
    KMS_ACCESS_DENIED: "KMS_AccessDeniedException"
  };
  var InvalidRequestExceptionReason = {
    KMS_DISABLED_KEY: "KMS_DisabledException",
    KMS_INVALID_KEY_USAGE: "KMS_InvalidKeyUsageException",
    KMS_INVALID_STATE: "KMS_InvalidStateException",
    KMS_KEY_NOT_FOUND: "KMS_NotFoundException"
  };
  exports.AccessDeniedException = AccessDeniedException;
  exports.AccessDeniedException$ = AccessDeniedException$;
  exports.AccessDeniedExceptionReason = AccessDeniedExceptionReason;
  exports.AuthorizationPendingException = AuthorizationPendingException;
  exports.AuthorizationPendingException$ = AuthorizationPendingException$;
  exports.CreateToken$ = CreateToken$;
  exports.CreateTokenCommand = CreateTokenCommand;
  exports.CreateTokenRequest$ = CreateTokenRequest$;
  exports.CreateTokenResponse$ = CreateTokenResponse$;
  exports.ExpiredTokenException = ExpiredTokenException;
  exports.ExpiredTokenException$ = ExpiredTokenException$;
  exports.InternalServerException = InternalServerException;
  exports.InternalServerException$ = InternalServerException$;
  exports.InvalidClientException = InvalidClientException;
  exports.InvalidClientException$ = InvalidClientException$;
  exports.InvalidGrantException = InvalidGrantException;
  exports.InvalidGrantException$ = InvalidGrantException$;
  exports.InvalidRequestException = InvalidRequestException;
  exports.InvalidRequestException$ = InvalidRequestException$;
  exports.InvalidRequestExceptionReason = InvalidRequestExceptionReason;
  exports.InvalidScopeException = InvalidScopeException;
  exports.InvalidScopeException$ = InvalidScopeException$;
  exports.SSOOIDC = SSOOIDC;
  exports.SSOOIDCClient = SSOOIDCClient;
  exports.SSOOIDCServiceException = SSOOIDCServiceException;
  exports.SSOOIDCServiceException$ = SSOOIDCServiceException$;
  exports.SlowDownException = SlowDownException;
  exports.SlowDownException$ = SlowDownException$;
  exports.UnauthorizedClientException = UnauthorizedClientException;
  exports.UnauthorizedClientException$ = UnauthorizedClientException$;
  exports.UnsupportedGrantTypeException = UnsupportedGrantTypeException;
  exports.UnsupportedGrantTypeException$ = UnsupportedGrantTypeException$;
  exports.errorTypeRegistries = errorTypeRegistries;
});

// ../../node_modules/.bun/@aws-sdk+token-providers@3.1074.0/node_modules/@aws-sdk/token-providers/dist-cjs/index.js
var require_dist_cjs9 = __commonJS((exports) => {
  var { setTokenFeature } = require_client2();
  var { getBearerTokenEnvKey } = require_httpAuthSchemes();
  var { TokenProviderError, getSSOTokenFilepath, parseKnownFiles, getProfileName, loadSsoSessionData, getSSOTokenFromFile, memoize, chain } = require_config();
  var { promises } = __require("node:fs");
  var fromEnvSigningName = ({ logger, signingName } = {}) => async () => {
    logger?.debug?.("@aws-sdk/token-providers - fromEnvSigningName");
    if (!signingName) {
      throw new TokenProviderError("Please pass 'signingName' to compute environment variable key", { logger });
    }
    const bearerTokenKey = getBearerTokenEnvKey(signingName);
    if (!(bearerTokenKey in process.env)) {
      throw new TokenProviderError(`Token not present in '${bearerTokenKey}' environment variable`, { logger });
    }
    const token = { token: process.env[bearerTokenKey] };
    setTokenFeature(token, "BEARER_SERVICE_ENV_VARS", "3");
    return token;
  };
  var EXPIRE_WINDOW_MS = 5 * 60 * 1000;
  var REFRESH_MESSAGE = `To refresh this SSO session run 'aws sso login' with the corresponding profile.`;
  var getSsoOidcClient = async (ssoRegion, init = {}, callerClientConfig) => {
    const { SSOOIDCClient } = require_sso_oidc();
    const coalesce = (prop) => init.clientConfig?.[prop] ?? init.parentClientConfig?.[prop] ?? callerClientConfig?.[prop];
    const ssoOidcClient = new SSOOIDCClient(Object.assign({}, init.clientConfig ?? {}, {
      region: ssoRegion ?? init.clientConfig?.region,
      logger: coalesce("logger"),
      userAgentAppId: coalesce("userAgentAppId")
    }));
    return ssoOidcClient;
  };
  var getNewSsoOidcToken = async (ssoToken, ssoRegion, init = {}, callerClientConfig) => {
    const { CreateTokenCommand } = require_sso_oidc();
    const ssoOidcClient = await getSsoOidcClient(ssoRegion, init, callerClientConfig);
    return ssoOidcClient.send(new CreateTokenCommand({
      clientId: ssoToken.clientId,
      clientSecret: ssoToken.clientSecret,
      refreshToken: ssoToken.refreshToken,
      grantType: "refresh_token"
    }));
  };
  var validateTokenExpiry = (token) => {
    if (token.expiration && token.expiration.getTime() < Date.now()) {
      throw new TokenProviderError(`Token is expired. ${REFRESH_MESSAGE}`, false);
    }
  };
  var validateTokenKey = (key, value, forRefresh = false) => {
    if (typeof value === "undefined") {
      throw new TokenProviderError(`Value not present for '${key}' in SSO Token${forRefresh ? ". Cannot refresh" : ""}. ${REFRESH_MESSAGE}`, false);
    }
  };
  var { writeFile } = promises;
  var writeSSOTokenToFile = (id, ssoToken) => {
    const tokenFilepath = getSSOTokenFilepath(id);
    const tokenString = JSON.stringify(ssoToken, null, 2);
    return writeFile(tokenFilepath, tokenString);
  };
  var lastRefreshAttemptTime = new Date(0);
  var fromSso = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/token-providers - fromSso");
    const profiles = await parseKnownFiles(init);
    const profileName = getProfileName({
      profile: init.profile ?? callerClientConfig?.profile
    });
    const profile = profiles[profileName];
    if (!profile) {
      throw new TokenProviderError(`Profile '${profileName}' could not be found in shared credentials file.`, false);
    } else if (!profile["sso_session"]) {
      throw new TokenProviderError(`Profile '${profileName}' is missing required property 'sso_session'.`);
    }
    const ssoSessionName = profile["sso_session"];
    const ssoSessions = await loadSsoSessionData(init);
    const ssoSession = ssoSessions[ssoSessionName];
    if (!ssoSession) {
      throw new TokenProviderError(`Sso session '${ssoSessionName}' could not be found in shared credentials file.`, false);
    }
    for (const ssoSessionRequiredKey of ["sso_start_url", "sso_region"]) {
      if (!ssoSession[ssoSessionRequiredKey]) {
        throw new TokenProviderError(`Sso session '${ssoSessionName}' is missing required property '${ssoSessionRequiredKey}'.`, false);
      }
    }
    ssoSession["sso_start_url"];
    const ssoRegion = ssoSession["sso_region"];
    let ssoToken;
    try {
      ssoToken = await getSSOTokenFromFile(ssoSessionName);
    } catch (e) {
      throw new TokenProviderError(`The SSO session token associated with profile=${profileName} was not found or is invalid. ${REFRESH_MESSAGE}`, false);
    }
    validateTokenKey("accessToken", ssoToken.accessToken);
    validateTokenKey("expiresAt", ssoToken.expiresAt);
    const { accessToken, expiresAt } = ssoToken;
    const existingToken = { token: accessToken, expiration: new Date(expiresAt) };
    if (existingToken.expiration.getTime() - Date.now() > EXPIRE_WINDOW_MS) {
      return existingToken;
    }
    if (Date.now() - lastRefreshAttemptTime.getTime() < 30 * 1000) {
      validateTokenExpiry(existingToken);
      return existingToken;
    }
    validateTokenKey("clientId", ssoToken.clientId, true);
    validateTokenKey("clientSecret", ssoToken.clientSecret, true);
    validateTokenKey("refreshToken", ssoToken.refreshToken, true);
    try {
      lastRefreshAttemptTime.setTime(Date.now());
      const newSsoOidcToken = await getNewSsoOidcToken(ssoToken, ssoRegion, init, callerClientConfig);
      validateTokenKey("accessToken", newSsoOidcToken.accessToken);
      validateTokenKey("expiresIn", newSsoOidcToken.expiresIn);
      const newTokenExpiration = new Date(Date.now() + newSsoOidcToken.expiresIn * 1000);
      try {
        await writeSSOTokenToFile(ssoSessionName, {
          ...ssoToken,
          accessToken: newSsoOidcToken.accessToken,
          expiresAt: newTokenExpiration.toISOString(),
          refreshToken: newSsoOidcToken.refreshToken
        });
      } catch (error) {}
      return {
        token: newSsoOidcToken.accessToken,
        expiration: newTokenExpiration
      };
    } catch (error) {
      validateTokenExpiry(existingToken);
      return existingToken;
    }
  };
  var fromStatic = ({ token, logger }) => async () => {
    logger?.debug("@aws-sdk/token-providers - fromStatic");
    if (!token || !token.token) {
      throw new TokenProviderError(`Please pass a valid token to fromStatic`, false);
    }
    return token;
  };
  var nodeProvider = (init = {}) => memoize(chain(fromSso(init), async () => {
    throw new TokenProviderError("Could not load token from any providers", false);
  }), (token) => token.expiration !== undefined && token.expiration.getTime() - Date.now() < 300000, (token) => token.expiration !== undefined);
  exports.fromEnvSigningName = fromEnvSigningName;
  exports.fromSso = fromSso;
  exports.fromStatic = fromStatic;
  exports.nodeProvider = nodeProvider;
});

// ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.23/node_modules/@aws-sdk/nested-clients/dist-cjs/submodules/sso/index.js
var require_sso = __commonJS((exports) => {
  var { awsEndpointFunctions, emitWarningIfUnsupportedVersion: emitWarningIfUnsupportedVersion$1, createDefaultUserAgentProvider, NODE_APP_ID_CONFIG_OPTIONS, getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration, resolveUserAgentConfig, resolveHostHeaderConfig, getUserAgentPlugin, getHostHeaderPlugin, getLoggerPlugin, getRecursionDetectionPlugin } = require_client2();
  var { NoAuthSigner, getHttpAuthSchemeEndpointRuleSetPlugin, DefaultIdentityProviderConfig, getHttpSigningPlugin } = require_dist_cjs3();
  var { normalizeProvider, getSmithyContext, ServiceException, NoOpLogger, emitWarningIfUnsupportedVersion, loadConfigsForDefaultMode, getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig, Client, Command, createAggregatedClient } = require_client();
  exports.$Command = Command;
  exports.__Client = Client;
  var { resolveDefaultsModeConfig, loadConfig, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS, resolveRegionConfig } = require_config();
  var { BinaryDecisionDiagram, EndpointCache, decideEndpoint, customEndpointFunctions, resolveEndpointConfig, getEndpointPlugin } = require_endpoints();
  var { parseUrl, getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig, getContentLengthPlugin } = require_protocols();
  var { DEFAULT_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, getRetryPlugin } = require_retry();
  var { TypeRegistry, getSchemaSerdePlugin } = require_schema();
  var { resolveAwsSdkSigV4Config, AwsSdkSigV4Signer, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS } = require_httpAuthSchemes();
  var { toUtf8, fromUtf8, toBase64, fromBase64, Hash, calculateBodyLength } = require_serde();
  var { streamCollector, NodeHttpHandler } = require_dist_cjs2();
  var { AwsRestJsonProtocol } = require_protocols2();
  var defaultSSOHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
      operation: getSmithyContext(context).operation,
      region: await normalizeProvider(config.region)() || (() => {
        throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
      })()
    };
  };
  function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4",
      signingProperties: {
        name: "awsssoportal",
        region: authParameters.region
      },
      propertiesExtractor: (config, context) => ({
        signingProperties: {
          config,
          context
        }
      })
    };
  }
  function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
      schemeId: "smithy.api#noAuth"
    };
  }
  var defaultSSOHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
      case "GetRoleCredentials": {
        options.push(createSmithyApiNoAuthHttpAuthOption());
        break;
      }
      default: {
        options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
      }
    }
    return options;
  };
  var resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    return Object.assign(config_0, {
      authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
    });
  };
  var resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
      useDualstackEndpoint: options.useDualstackEndpoint ?? false,
      useFipsEndpoint: options.useFipsEndpoint ?? false,
      defaultSigningName: "awsssoportal"
    });
  };
  var commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
  };
  var version = "3.997.22";
  var packageInfo = {
    version
  };
  var k = "ref";
  var a = -1;
  var b = true;
  var c = "isSet";
  var d = "PartitionResult";
  var e = "booleanEquals";
  var f = "getAttr";
  var g = { [k]: "Endpoint" };
  var h = { [k]: d };
  var i = {};
  var j = [{ [k]: "Region" }];
  var _data = {
    conditions: [
      [c, [g]],
      [c, j],
      ["aws.partition", j, d],
      [e, [{ [k]: "UseFIPS" }, b]],
      [e, [{ [k]: "UseDualStack" }, b]],
      [e, [{ fn: f, argv: [h, "supportsDualStack"] }, b]],
      [e, [{ fn: f, argv: [h, "supportsFIPS"] }, b]],
      ["stringEquals", [{ fn: f, argv: [h, "name"] }, "aws-us-gov"]]
    ],
    results: [
      [a],
      [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
      [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
      [g, i],
      ["https://portal.sso-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
      [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
      ["https://portal.sso.{Region}.amazonaws.com", i],
      ["https://portal.sso-fips.{Region}.{PartitionResult#dnsSuffix}", i],
      [a, "FIPS is enabled but this partition does not support FIPS"],
      ["https://portal.sso.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
      [a, "DualStack is enabled but this partition does not support DualStack"],
      ["https://portal.sso.{Region}.{PartitionResult#dnsSuffix}", i],
      [a, "Invalid Configuration: Missing Region"]
    ]
  };
  var root = 2;
  var r = 1e8;
  var nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    13,
    3,
    1,
    4,
    r + 12,
    2,
    5,
    r + 12,
    3,
    8,
    6,
    4,
    7,
    r + 11,
    5,
    r + 9,
    r + 10,
    4,
    11,
    9,
    6,
    10,
    r + 8,
    7,
    r + 6,
    r + 7,
    5,
    12,
    r + 5,
    6,
    r + 4,
    r + 5,
    3,
    r + 1,
    14,
    4,
    r + 2,
    r + 3
  ]);
  var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
  var cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"]
  });
  var defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => decideEndpoint(bdd, {
      endpointParams,
      logger: context.logger
    }));
  };
  customEndpointFunctions.aws = awsEndpointFunctions;

  class SSOServiceException extends ServiceException {
    constructor(options) {
      super(options);
      Object.setPrototypeOf(this, SSOServiceException.prototype);
    }
  }

  class InvalidRequestException extends SSOServiceException {
    name = "InvalidRequestException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "InvalidRequestException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidRequestException.prototype);
    }
  }

  class ResourceNotFoundException extends SSOServiceException {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "ResourceNotFoundException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
  }

  class TooManyRequestsException extends SSOServiceException {
    name = "TooManyRequestsException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "TooManyRequestsException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
  }

  class UnauthorizedException extends SSOServiceException {
    name = "UnauthorizedException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "UnauthorizedException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
  }
  var _ATT = "AccessTokenType";
  var _GRC = "GetRoleCredentials";
  var _GRCR = "GetRoleCredentialsRequest";
  var _GRCRe = "GetRoleCredentialsResponse";
  var _IRE = "InvalidRequestException";
  var _RC = "RoleCredentials";
  var _RNFE = "ResourceNotFoundException";
  var _SAKT = "SecretAccessKeyType";
  var _STT = "SessionTokenType";
  var _TMRE = "TooManyRequestsException";
  var _UE = "UnauthorizedException";
  var _aI = "accountId";
  var _aKI = "accessKeyId";
  var _aT = "accessToken";
  var _ai = "account_id";
  var _c = "client";
  var _e = "error";
  var _ex = "expiration";
  var _h = "http";
  var _hE = "httpError";
  var _hH = "httpHeader";
  var _hQ = "httpQuery";
  var _m = "message";
  var _rC = "roleCredentials";
  var _rN = "roleName";
  var _rn = "role_name";
  var _s = "smithy.ts.sdk.synthetic.com.amazonaws.sso";
  var _sAK = "secretAccessKey";
  var _sT = "sessionToken";
  var _xasbt = "x-amz-sso_bearer_token";
  var n0 = "com.amazonaws.sso";
  var _s_registry = TypeRegistry.for(_s);
  var SSOServiceException$ = [-3, _s, "SSOServiceException", 0, [], []];
  _s_registry.registerError(SSOServiceException$, SSOServiceException);
  var n0_registry = TypeRegistry.for(n0);
  var InvalidRequestException$ = [
    -3,
    n0,
    _IRE,
    { [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(InvalidRequestException$, InvalidRequestException);
  var ResourceNotFoundException$ = [
    -3,
    n0,
    _RNFE,
    { [_e]: _c, [_hE]: 404 },
    [_m],
    [0]
  ];
  n0_registry.registerError(ResourceNotFoundException$, ResourceNotFoundException);
  var TooManyRequestsException$ = [
    -3,
    n0,
    _TMRE,
    { [_e]: _c, [_hE]: 429 },
    [_m],
    [0]
  ];
  n0_registry.registerError(TooManyRequestsException$, TooManyRequestsException);
  var UnauthorizedException$ = [
    -3,
    n0,
    _UE,
    { [_e]: _c, [_hE]: 401 },
    [_m],
    [0]
  ];
  n0_registry.registerError(UnauthorizedException$, UnauthorizedException);
  var errorTypeRegistries = [
    _s_registry,
    n0_registry
  ];
  var AccessTokenType = [0, n0, _ATT, 8, 0];
  var SecretAccessKeyType = [0, n0, _SAKT, 8, 0];
  var SessionTokenType = [0, n0, _STT, 8, 0];
  var GetRoleCredentialsRequest$ = [
    3,
    n0,
    _GRCR,
    0,
    [_rN, _aI, _aT],
    [[0, { [_hQ]: _rn }], [0, { [_hQ]: _ai }], [() => AccessTokenType, { [_hH]: _xasbt }]],
    3
  ];
  var GetRoleCredentialsResponse$ = [
    3,
    n0,
    _GRCRe,
    0,
    [_rC],
    [[() => RoleCredentials$, 0]]
  ];
  var RoleCredentials$ = [
    3,
    n0,
    _RC,
    0,
    [_aKI, _sAK, _sT, _ex],
    [0, [() => SecretAccessKeyType, 0], [() => SessionTokenType, 0], 1]
  ];
  var GetRoleCredentials$ = [
    9,
    n0,
    _GRC,
    { [_h]: ["GET", "/federation/credentials", 200] },
    () => GetRoleCredentialsRequest$,
    () => GetRoleCredentialsResponse$
  ];
  var getRuntimeConfig$1 = (config) => {
    return {
      apiVersion: "2019-06-10",
      base64Decoder: config?.base64Decoder ?? fromBase64,
      base64Encoder: config?.base64Encoder ?? toBase64,
      disableHostPrefix: config?.disableHostPrefix ?? false,
      endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
      extensions: config?.extensions ?? [],
      httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOHttpAuthSchemeProvider,
      httpAuthSchemes: config?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
          signer: new AwsSdkSigV4Signer
        },
        {
          schemeId: "smithy.api#noAuth",
          identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
          signer: new NoAuthSigner
        }
      ],
      logger: config?.logger ?? new NoOpLogger,
      protocol: config?.protocol ?? AwsRestJsonProtocol,
      protocolSettings: config?.protocolSettings ?? {
        defaultNamespace: "com.amazonaws.sso",
        errorTypeRegistries,
        version: "2019-06-10",
        serviceTarget: "SWBPortalService"
      },
      serviceId: config?.serviceId ?? "SSO",
      urlParser: config?.urlParser ?? parseUrl,
      utf8Decoder: config?.utf8Decoder ?? fromUtf8,
      utf8Encoder: config?.utf8Encoder ?? toUtf8
    };
  };
  var getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const loaderConfig = {
      profile: config?.profile,
      logger: clientSharedValues.logger
    };
    return {
      ...clientSharedValues,
      ...config,
      runtime: "node",
      defaultsMode,
      authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
      bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
      defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
      maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
      region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
      requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
      retryMode: config?.retryMode ?? loadConfig({
        ...NODE_RETRY_MODE_CONFIG_OPTIONS,
        default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
      }, config),
      sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
      streamCollector: config?.streamCollector ?? streamCollector,
      useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
    };
  };
  var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
      setHttpAuthScheme(httpAuthScheme) {
        const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
        if (index === -1) {
          _httpAuthSchemes.push(httpAuthScheme);
        } else {
          _httpAuthSchemes.splice(index, 1, httpAuthScheme);
        }
      },
      httpAuthSchemes() {
        return _httpAuthSchemes;
      },
      setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
        _httpAuthSchemeProvider = httpAuthSchemeProvider;
      },
      httpAuthSchemeProvider() {
        return _httpAuthSchemeProvider;
      },
      setCredentials(credentials) {
        _credentials = credentials;
      },
      credentials() {
        return _credentials;
      }
    };
  };
  var resolveHttpAuthRuntimeConfig = (config) => {
    return {
      httpAuthSchemes: config.httpAuthSchemes(),
      httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
      credentials: config.credentials()
    };
  };
  var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
  };

  class SSOClient extends Client {
    config;
    constructor(...[configuration]) {
      const _config_0 = getRuntimeConfig(configuration || {});
      super(_config_0);
      this.initConfig = _config_0;
      const _config_1 = resolveClientEndpointParameters(_config_0);
      const _config_2 = resolveUserAgentConfig(_config_1);
      const _config_3 = resolveRetryConfig(_config_2);
      const _config_4 = resolveRegionConfig(_config_3);
      const _config_5 = resolveHostHeaderConfig(_config_4);
      const _config_6 = resolveEndpointConfig(_config_5);
      const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
      const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
      this.config = _config_8;
      this.middlewareStack.use(getSchemaSerdePlugin(this.config));
      this.middlewareStack.use(getUserAgentPlugin(this.config));
      this.middlewareStack.use(getRetryPlugin(this.config));
      this.middlewareStack.use(getContentLengthPlugin(this.config));
      this.middlewareStack.use(getHostHeaderPlugin(this.config));
      this.middlewareStack.use(getLoggerPlugin(this.config));
      this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
      this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: defaultSSOHttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials
        })
      }));
      this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
      super.destroy();
    }
  }

  class GetRoleCredentialsCommand extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o) {
    return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
  }).s("SWBPortalService", "GetRoleCredentials", {}).n("SSOClient", "GetRoleCredentialsCommand").sc(GetRoleCredentials$).build() {
  }
  var commands = {
    GetRoleCredentialsCommand
  };

  class SSO extends SSOClient {
  }
  createAggregatedClient(commands, SSO);
  exports.GetRoleCredentials$ = GetRoleCredentials$;
  exports.GetRoleCredentialsCommand = GetRoleCredentialsCommand;
  exports.GetRoleCredentialsRequest$ = GetRoleCredentialsRequest$;
  exports.GetRoleCredentialsResponse$ = GetRoleCredentialsResponse$;
  exports.InvalidRequestException = InvalidRequestException;
  exports.InvalidRequestException$ = InvalidRequestException$;
  exports.ResourceNotFoundException = ResourceNotFoundException;
  exports.ResourceNotFoundException$ = ResourceNotFoundException$;
  exports.RoleCredentials$ = RoleCredentials$;
  exports.SSO = SSO;
  exports.SSOClient = SSOClient;
  exports.SSOServiceException = SSOServiceException;
  exports.SSOServiceException$ = SSOServiceException$;
  exports.TooManyRequestsException = TooManyRequestsException;
  exports.TooManyRequestsException$ = TooManyRequestsException$;
  exports.UnauthorizedException = UnauthorizedException;
  exports.UnauthorizedException$ = UnauthorizedException$;
  exports.errorTypeRegistries = errorTypeRegistries;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-sso@3.972.55/node_modules/@aws-sdk/credential-provider-sso/dist-cjs/loadSso-BGYXHf8s.js
var require_loadSso_BGYXHf8s = __commonJS((exports) => {
  var { GetRoleCredentialsCommand, SSOClient } = require_sso();
  exports.GetRoleCredentialsCommand = GetRoleCredentialsCommand;
  exports.SSOClient = SSOClient;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-sso@3.972.55/node_modules/@aws-sdk/credential-provider-sso/dist-cjs/index.js
var require_dist_cjs10 = __commonJS((exports) => {
  var { CredentialsProviderError, getSSOTokenFromFile, getProfileName, parseKnownFiles, loadSsoSessionData } = require_config();
  var { setCredentialFeature } = require_client2();
  var { fromSso } = require_dist_cjs9();
  var isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
  var SHOULD_FAIL_CREDENTIAL_CHAIN = false;
  var resolveSSOCredentials = async ({ ssoStartUrl, ssoSession, ssoAccountId, ssoRegion, ssoRoleName, ssoClient, clientConfig, parentClientConfig, callerClientConfig, profile, filepath, configFilepath, ignoreCache, logger }) => {
    let token;
    const refreshMessage = `To refresh this SSO session run aws sso login with the corresponding profile.`;
    if (ssoSession) {
      try {
        const _token = await fromSso({
          profile,
          filepath,
          configFilepath,
          ignoreCache,
          clientConfig,
          parentClientConfig,
          logger
        })({ callerClientConfig });
        token = {
          accessToken: _token.token,
          expiresAt: new Date(_token.expiration).toISOString()
        };
      } catch (e) {
        throw new CredentialsProviderError(e.message, {
          tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
          logger
        });
      }
    } else {
      try {
        token = await getSSOTokenFromFile(ssoStartUrl);
      } catch (e) {
        throw new CredentialsProviderError(`The SSO session associated with this profile is invalid. ${refreshMessage}`, {
          tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
          logger
        });
      }
    }
    if (new Date(token.expiresAt).getTime() - Date.now() <= 0) {
      throw new CredentialsProviderError(`The SSO session associated with this profile has expired. ${refreshMessage}`, {
        tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
        logger
      });
    }
    const { accessToken } = token;
    const { SSOClient, GetRoleCredentialsCommand } = require_loadSso_BGYXHf8s();
    const sso = ssoClient || new SSOClient(Object.assign({}, clientConfig ?? {}, {
      logger: clientConfig?.logger ?? callerClientConfig?.logger ?? parentClientConfig?.logger,
      region: clientConfig?.region ?? ssoRegion,
      userAgentAppId: clientConfig?.userAgentAppId ?? callerClientConfig?.userAgentAppId ?? parentClientConfig?.userAgentAppId
    }));
    let ssoResp;
    try {
      ssoResp = await sso.send(new GetRoleCredentialsCommand({
        accountId: ssoAccountId,
        roleName: ssoRoleName,
        accessToken
      }));
    } catch (e) {
      throw new CredentialsProviderError(e, {
        tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
        logger
      });
    }
    const { roleCredentials: { accessKeyId, secretAccessKey, sessionToken, expiration, credentialScope, accountId } = {} } = ssoResp;
    if (!accessKeyId || !secretAccessKey || !sessionToken || !expiration) {
      throw new CredentialsProviderError("SSO returns an invalid temporary credential.", {
        tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
        logger
      });
    }
    const credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
      expiration: new Date(expiration),
      ...credentialScope && { credentialScope },
      ...accountId && { accountId }
    };
    if (ssoSession) {
      setCredentialFeature(credentials, "CREDENTIALS_SSO", "s");
    } else {
      setCredentialFeature(credentials, "CREDENTIALS_SSO_LEGACY", "u");
    }
    return credentials;
  };
  var validateSsoProfile = (profile, logger) => {
    const { sso_start_url, sso_account_id, sso_region, sso_role_name } = profile;
    if (!sso_start_url || !sso_account_id || !sso_region || !sso_role_name) {
      throw new CredentialsProviderError(`Profile is configured with invalid SSO credentials. Required parameters "sso_account_id", ` + `"sso_region", "sso_role_name", "sso_start_url". Got ${Object.keys(profile).join(", ")}
Reference: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html`, { tryNextLink: false, logger });
    }
    return profile;
  };
  var fromSSO = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/credential-provider-sso - fromSSO");
    const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
    const { ssoClient } = init;
    const profileName = getProfileName({
      profile: init.profile ?? callerClientConfig?.profile
    });
    if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) {
      const profiles = await parseKnownFiles(init);
      const profile = profiles[profileName];
      if (!profile) {
        throw new CredentialsProviderError(`Profile ${profileName} was not found.`, { logger: init.logger });
      }
      if (!isSsoProfile(profile)) {
        throw new CredentialsProviderError(`Profile ${profileName} is not configured with SSO credentials.`, {
          logger: init.logger
        });
      }
      if (profile?.sso_session) {
        const ssoSessions = await loadSsoSessionData(init);
        const session = ssoSessions[profile.sso_session];
        const conflictMsg = ` configurations in profile ${profileName} and sso-session ${profile.sso_session}`;
        if (ssoRegion && ssoRegion !== session.sso_region) {
          throw new CredentialsProviderError(`Conflicting SSO region` + conflictMsg, {
            tryNextLink: false,
            logger: init.logger
          });
        }
        if (ssoStartUrl && ssoStartUrl !== session.sso_start_url) {
          throw new CredentialsProviderError(`Conflicting SSO start_url` + conflictMsg, {
            tryNextLink: false,
            logger: init.logger
          });
        }
        profile.sso_region = session.sso_region;
        profile.sso_start_url = session.sso_start_url;
      }
      const { sso_start_url, sso_account_id, sso_region, sso_role_name, sso_session } = validateSsoProfile(profile, init.logger);
      return resolveSSOCredentials({
        ssoStartUrl: sso_start_url,
        ssoSession: sso_session,
        ssoAccountId: sso_account_id,
        ssoRegion: sso_region,
        ssoRoleName: sso_role_name,
        ssoClient,
        clientConfig: init.clientConfig,
        parentClientConfig: init.parentClientConfig,
        callerClientConfig: init.callerClientConfig,
        profile: profileName,
        filepath: init.filepath,
        configFilepath: init.configFilepath,
        ignoreCache: init.ignoreCache,
        logger: init.logger
      });
    } else if (!ssoStartUrl || !ssoAccountId || !ssoRegion || !ssoRoleName) {
      throw new CredentialsProviderError("Incomplete configuration. The fromSSO() argument hash must include " + '"ssoStartUrl", "ssoAccountId", "ssoRegion", "ssoRoleName"', { tryNextLink: false, logger: init.logger });
    } else {
      return resolveSSOCredentials({
        ssoStartUrl,
        ssoSession,
        ssoAccountId,
        ssoRegion,
        ssoRoleName,
        ssoClient,
        clientConfig: init.clientConfig,
        parentClientConfig: init.parentClientConfig,
        callerClientConfig: init.callerClientConfig,
        profile: profileName,
        filepath: init.filepath,
        configFilepath: init.configFilepath,
        ignoreCache: init.ignoreCache,
        logger: init.logger
      });
    }
  };
  exports.fromSSO = fromSSO;
  exports.isSsoProfile = isSsoProfile;
  exports.validateSsoProfile = validateSsoProfile;
});

// ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.23/node_modules/@aws-sdk/nested-clients/dist-cjs/submodules/signin/index.js
var require_signin = __commonJS((exports) => {
  var { awsEndpointFunctions, emitWarningIfUnsupportedVersion: emitWarningIfUnsupportedVersion$1, createDefaultUserAgentProvider, NODE_APP_ID_CONFIG_OPTIONS, getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration, resolveUserAgentConfig, resolveHostHeaderConfig, getUserAgentPlugin, getHostHeaderPlugin, getLoggerPlugin, getRecursionDetectionPlugin } = require_client2();
  var { NoAuthSigner, getHttpAuthSchemeEndpointRuleSetPlugin, DefaultIdentityProviderConfig, getHttpSigningPlugin } = require_dist_cjs3();
  var { normalizeProvider, getSmithyContext, ServiceException, NoOpLogger, emitWarningIfUnsupportedVersion, loadConfigsForDefaultMode, getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig, Client, Command, createAggregatedClient } = require_client();
  exports.$Command = Command;
  exports.__Client = Client;
  var { resolveDefaultsModeConfig, loadConfig, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS, resolveRegionConfig } = require_config();
  var { BinaryDecisionDiagram, EndpointCache, decideEndpoint, customEndpointFunctions, resolveEndpointConfig, getEndpointPlugin } = require_endpoints();
  var { parseUrl, getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig, getContentLengthPlugin } = require_protocols();
  var { DEFAULT_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, getRetryPlugin } = require_retry();
  var { TypeRegistry, getSchemaSerdePlugin } = require_schema();
  var { resolveAwsSdkSigV4Config, AwsSdkSigV4Signer, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS } = require_httpAuthSchemes();
  var { toUtf8, fromUtf8, toBase64, fromBase64, Hash, calculateBodyLength } = require_serde();
  var { streamCollector, NodeHttpHandler } = require_dist_cjs2();
  var { AwsRestJsonProtocol } = require_protocols2();
  var defaultSigninHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
      operation: getSmithyContext(context).operation,
      region: await normalizeProvider(config.region)() || (() => {
        throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
      })()
    };
  };
  function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4",
      signingProperties: {
        name: "signin",
        region: authParameters.region
      },
      propertiesExtractor: (config, context) => ({
        signingProperties: {
          config,
          context
        }
      })
    };
  }
  function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
      schemeId: "smithy.api#noAuth"
    };
  }
  var defaultSigninHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
      case "CreateOAuth2Token": {
        options.push(createSmithyApiNoAuthHttpAuthOption());
        break;
      }
      default: {
        options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
      }
    }
    return options;
  };
  var resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    return Object.assign(config_0, {
      authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
    });
  };
  var resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
      useDualstackEndpoint: options.useDualstackEndpoint ?? false,
      useFipsEndpoint: options.useFipsEndpoint ?? false,
      defaultSigningName: "signin"
    });
  };
  var commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
  };
  var version = "3.997.22";
  var packageInfo = {
    version
  };
  var p = "ref";
  var a = -1;
  var b = true;
  var c = "isSet";
  var d = "booleanEquals";
  var e = "PartitionResult";
  var f = "stringEquals";
  var g = "getAttr";
  var h = "https://signin.{Region}.{PartitionResult#dualStackDnsSuffix}";
  var i = { [p]: "Endpoint" };
  var j = { fn: g, argv: [{ [p]: e }, "name"] };
  var k = { [p]: e };
  var l = { [p]: "Region" };
  var m = { authSchemes: [{ name: "sigv4", signingName: "signin", signingRegion: "{Region}" }] };
  var n = {};
  var o = [l];
  var _data = {
    conditions: [
      [c, o],
      [d, [{ fn: "coalesce", argv: [{ [p]: "IsControlPlane" }, false] }, b]],
      [c, [i]],
      ["aws.partition", o, e],
      [d, [{ [p]: "UseFIPS" }, b]],
      [d, [{ [p]: "UseDualStack" }, b]],
      [f, [j, "aws"]],
      [f, [j, "aws-cn"]],
      [d, [{ fn: g, argv: [k, "supportsDualStack"] }, b]],
      [f, [l, "us-gov-west-1"]],
      [f, [j, "aws-us-gov"]],
      [d, [{ fn: g, argv: [k, "supportsFIPS"] }, b]],
      [f, [j, "aws-iso"]],
      [f, [j, "aws-iso-b"]],
      [f, [j, "aws-iso-f"]],
      [f, [j, "aws-iso-e"]],
      [f, [j, "aws-eusc"]]
    ],
    results: [
      [a],
      ["https://signin.{Region}.api.aws", m],
      ["https://signin.{Region}.api.amazonwebservices.com.cn", m],
      [h, m],
      ["https://{Region}.signin.aws.amazon.com", n],
      ["https://{Region}.signin.amazonaws.cn", n],
      ["https://{Region}.signin.amazonaws-us-gov.com", n],
      ["https://{Region}.signin.c2shome.ic.gov", n],
      ["https://{Region}.signin.sc2shome.sgov.gov", n],
      ["https://{Region}.signin.csphome.hci.ic.gov", n],
      ["https://{Region}.signin.csphome.adc-e.uk", n],
      ["https://{Region}.signin.amazonaws-eusc.eu", n],
      ["https://signin-fips.amazonaws-us-gov.com", n],
      ["https://{Region}.signin-fips.amazonaws-us-gov.com", n],
      ["https://{Region}.signin.{PartitionResult#dnsSuffix}", n],
      [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
      [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
      [i, n],
      ["https://signin-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", n],
      [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
      ["https://signin-fips.{Region}.{PartitionResult#dnsSuffix}", n],
      [a, "FIPS is enabled but this partition does not support FIPS"],
      [h, n],
      [a, "DualStack is enabled but this partition does not support DualStack"],
      ["https://signin.{Region}.{PartitionResult#dnsSuffix}", n],
      [a, "Invalid Configuration: Missing Region"]
    ]
  };
  var root = 2;
  var r = 1e8;
  var nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    4,
    3,
    2,
    30,
    r + 25,
    1,
    24,
    5,
    2,
    30,
    6,
    3,
    7,
    26,
    4,
    18,
    8,
    5,
    17,
    9,
    6,
    r + 4,
    10,
    7,
    r + 5,
    11,
    10,
    r + 6,
    12,
    12,
    r + 7,
    13,
    13,
    r + 8,
    14,
    14,
    r + 9,
    15,
    15,
    r + 10,
    16,
    16,
    r + 11,
    r + 14,
    8,
    r + 22,
    r + 23,
    5,
    22,
    19,
    9,
    r + 12,
    20,
    10,
    r + 13,
    21,
    11,
    r + 20,
    r + 21,
    8,
    23,
    r + 19,
    11,
    r + 18,
    r + 19,
    2,
    29,
    25,
    3,
    32,
    26,
    4,
    27,
    r + 25,
    5,
    r + 25,
    28,
    9,
    r + 12,
    r + 25,
    3,
    32,
    30,
    4,
    r + 15,
    31,
    5,
    r + 16,
    r + 17,
    6,
    r + 1,
    33,
    7,
    r + 2,
    r + 3
  ]);
  var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
  var cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "IsControlPlane", "Region", "UseDualStack", "UseFIPS"]
  });
  var defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => decideEndpoint(bdd, {
      endpointParams,
      logger: context.logger
    }));
  };
  customEndpointFunctions.aws = awsEndpointFunctions;

  class SigninServiceException extends ServiceException {
    constructor(options) {
      super(options);
      Object.setPrototypeOf(this, SigninServiceException.prototype);
    }
  }

  class AccessDeniedException extends SigninServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    error;
    constructor(opts) {
      super({
        name: "AccessDeniedException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, AccessDeniedException.prototype);
      this.error = opts.error;
    }
  }

  class InternalServerException extends SigninServiceException {
    name = "InternalServerException";
    $fault = "server";
    error;
    constructor(opts) {
      super({
        name: "InternalServerException",
        $fault: "server",
        ...opts
      });
      Object.setPrototypeOf(this, InternalServerException.prototype);
      this.error = opts.error;
    }
  }

  class TooManyRequestsError extends SigninServiceException {
    name = "TooManyRequestsError";
    $fault = "client";
    error;
    constructor(opts) {
      super({
        name: "TooManyRequestsError",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, TooManyRequestsError.prototype);
      this.error = opts.error;
    }
  }

  class ValidationException extends SigninServiceException {
    name = "ValidationException";
    $fault = "client";
    error;
    constructor(opts) {
      super({
        name: "ValidationException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, ValidationException.prototype);
      this.error = opts.error;
    }
  }
  var _ADE = "AccessDeniedException";
  var _AT = "AccessToken";
  var _COAT = "CreateOAuth2Token";
  var _COATR = "CreateOAuth2TokenRequest";
  var _COATRB = "CreateOAuth2TokenRequestBody";
  var _COATRBr = "CreateOAuth2TokenResponseBody";
  var _COATRr = "CreateOAuth2TokenResponse";
  var _ISE = "InternalServerException";
  var _RT = "RefreshToken";
  var _TMRE = "TooManyRequestsError";
  var _VE = "ValidationException";
  var _aKI = "accessKeyId";
  var _aT = "accessToken";
  var _c = "client";
  var _cI = "clientId";
  var _cV = "codeVerifier";
  var _co = "code";
  var _e = "error";
  var _eI = "expiresIn";
  var _gT = "grantType";
  var _h = "http";
  var _hE = "httpError";
  var _iT = "idToken";
  var _jN = "jsonName";
  var _m = "message";
  var _rT = "refreshToken";
  var _rU = "redirectUri";
  var _s = "smithy.ts.sdk.synthetic.com.amazonaws.signin";
  var _sAK = "secretAccessKey";
  var _sT = "sessionToken";
  var _se = "server";
  var _tI = "tokenInput";
  var _tO = "tokenOutput";
  var _tT = "tokenType";
  var n0 = "com.amazonaws.signin";
  var _s_registry = TypeRegistry.for(_s);
  var SigninServiceException$ = [-3, _s, "SigninServiceException", 0, [], []];
  _s_registry.registerError(SigninServiceException$, SigninServiceException);
  var n0_registry = TypeRegistry.for(n0);
  var AccessDeniedException$ = [
    -3,
    n0,
    _ADE,
    { [_e]: _c },
    [_e, _m],
    [0, 0],
    2
  ];
  n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
  var InternalServerException$ = [
    -3,
    n0,
    _ISE,
    { [_e]: _se, [_hE]: 500 },
    [_e, _m],
    [0, 0],
    2
  ];
  n0_registry.registerError(InternalServerException$, InternalServerException);
  var TooManyRequestsError$ = [
    -3,
    n0,
    _TMRE,
    { [_e]: _c, [_hE]: 429 },
    [_e, _m],
    [0, 0],
    2
  ];
  n0_registry.registerError(TooManyRequestsError$, TooManyRequestsError);
  var ValidationException$ = [
    -3,
    n0,
    _VE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _m],
    [0, 0],
    2
  ];
  n0_registry.registerError(ValidationException$, ValidationException);
  var errorTypeRegistries = [
    _s_registry,
    n0_registry
  ];
  var RefreshToken = [0, n0, _RT, 8, 0];
  var AccessToken$ = [
    3,
    n0,
    _AT,
    8,
    [_aKI, _sAK, _sT],
    [[0, { [_jN]: _aKI }], [0, { [_jN]: _sAK }], [0, { [_jN]: _sT }]],
    3
  ];
  var CreateOAuth2TokenRequest$ = [
    3,
    n0,
    _COATR,
    0,
    [_tI],
    [[() => CreateOAuth2TokenRequestBody$, 16]],
    1
  ];
  var CreateOAuth2TokenRequestBody$ = [
    3,
    n0,
    _COATRB,
    0,
    [_cI, _gT, _co, _rU, _cV, _rT],
    [[0, { [_jN]: _cI }], [0, { [_jN]: _gT }], 0, [0, { [_jN]: _rU }], [0, { [_jN]: _cV }], [() => RefreshToken, { [_jN]: _rT }]],
    2
  ];
  var CreateOAuth2TokenResponse$ = [
    3,
    n0,
    _COATRr,
    0,
    [_tO],
    [[() => CreateOAuth2TokenResponseBody$, 16]],
    1
  ];
  var CreateOAuth2TokenResponseBody$ = [
    3,
    n0,
    _COATRBr,
    0,
    [_aT, _tT, _eI, _rT, _iT],
    [[() => AccessToken$, { [_jN]: _aT }], [0, { [_jN]: _tT }], [1, { [_jN]: _eI }], [() => RefreshToken, { [_jN]: _rT }], [0, { [_jN]: _iT }]],
    4
  ];
  var CreateOAuth2Token$ = [
    9,
    n0,
    _COAT,
    { [_h]: ["POST", "/v1/token", 200] },
    () => CreateOAuth2TokenRequest$,
    () => CreateOAuth2TokenResponse$
  ];
  var getRuntimeConfig$1 = (config) => {
    return {
      apiVersion: "2023-01-01",
      base64Decoder: config?.base64Decoder ?? fromBase64,
      base64Encoder: config?.base64Encoder ?? toBase64,
      disableHostPrefix: config?.disableHostPrefix ?? false,
      endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
      extensions: config?.extensions ?? [],
      httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSigninHttpAuthSchemeProvider,
      httpAuthSchemes: config?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
          signer: new AwsSdkSigV4Signer
        },
        {
          schemeId: "smithy.api#noAuth",
          identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
          signer: new NoAuthSigner
        }
      ],
      logger: config?.logger ?? new NoOpLogger,
      protocol: config?.protocol ?? AwsRestJsonProtocol,
      protocolSettings: config?.protocolSettings ?? {
        defaultNamespace: "com.amazonaws.signin",
        errorTypeRegistries,
        version: "2023-01-01",
        serviceTarget: "Signin"
      },
      serviceId: config?.serviceId ?? "Signin",
      urlParser: config?.urlParser ?? parseUrl,
      utf8Decoder: config?.utf8Decoder ?? fromUtf8,
      utf8Encoder: config?.utf8Encoder ?? toUtf8
    };
  };
  var getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const loaderConfig = {
      profile: config?.profile,
      logger: clientSharedValues.logger
    };
    return {
      ...clientSharedValues,
      ...config,
      runtime: "node",
      defaultsMode,
      authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
      bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
      defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
      maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
      region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
      requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
      retryMode: config?.retryMode ?? loadConfig({
        ...NODE_RETRY_MODE_CONFIG_OPTIONS,
        default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
      }, config),
      sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
      streamCollector: config?.streamCollector ?? streamCollector,
      useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
    };
  };
  var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
      setHttpAuthScheme(httpAuthScheme) {
        const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
        if (index === -1) {
          _httpAuthSchemes.push(httpAuthScheme);
        } else {
          _httpAuthSchemes.splice(index, 1, httpAuthScheme);
        }
      },
      httpAuthSchemes() {
        return _httpAuthSchemes;
      },
      setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
        _httpAuthSchemeProvider = httpAuthSchemeProvider;
      },
      httpAuthSchemeProvider() {
        return _httpAuthSchemeProvider;
      },
      setCredentials(credentials) {
        _credentials = credentials;
      },
      credentials() {
        return _credentials;
      }
    };
  };
  var resolveHttpAuthRuntimeConfig = (config) => {
    return {
      httpAuthSchemes: config.httpAuthSchemes(),
      httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
      credentials: config.credentials()
    };
  };
  var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
  };

  class SigninClient extends Client {
    config;
    constructor(...[configuration]) {
      const _config_0 = getRuntimeConfig(configuration || {});
      super(_config_0);
      this.initConfig = _config_0;
      const _config_1 = resolveClientEndpointParameters(_config_0);
      const _config_2 = resolveUserAgentConfig(_config_1);
      const _config_3 = resolveRetryConfig(_config_2);
      const _config_4 = resolveRegionConfig(_config_3);
      const _config_5 = resolveHostHeaderConfig(_config_4);
      const _config_6 = resolveEndpointConfig(_config_5);
      const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
      const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
      this.config = _config_8;
      this.middlewareStack.use(getSchemaSerdePlugin(this.config));
      this.middlewareStack.use(getUserAgentPlugin(this.config));
      this.middlewareStack.use(getRetryPlugin(this.config));
      this.middlewareStack.use(getContentLengthPlugin(this.config));
      this.middlewareStack.use(getHostHeaderPlugin(this.config));
      this.middlewareStack.use(getLoggerPlugin(this.config));
      this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
      this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: defaultSigninHttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials
        })
      }));
      this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
      super.destroy();
    }
  }

  class CreateOAuth2TokenCommand extends Command.classBuilder().ep({
    ...commonParams,
    IsControlPlane: { type: "staticContextParams", value: false }
  }).m(function(Command2, cs, config, o2) {
    return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
  }).s("Signin", "CreateOAuth2Token", {}).n("SigninClient", "CreateOAuth2TokenCommand").sc(CreateOAuth2Token$).build() {
  }
  var commands = {
    CreateOAuth2TokenCommand
  };

  class Signin extends SigninClient {
  }
  createAggregatedClient(commands, Signin);
  var OAuth2ErrorCode = {
    AUTHCODE_EXPIRED: "AUTHCODE_EXPIRED",
    CONFLICT: "CONFLICT",
    INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
    INVALID_REQUEST: "INVALID_REQUEST",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    SERVER_ERROR: "server_error",
    SERVICE_QUOTA_EXCEEDED: "SERVICE_QUOTA_EXCEEDED",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    USER_CREDENTIALS_CHANGED: "USER_CREDENTIALS_CHANGED"
  };
  exports.AccessDeniedException = AccessDeniedException;
  exports.AccessDeniedException$ = AccessDeniedException$;
  exports.AccessToken$ = AccessToken$;
  exports.CreateOAuth2Token$ = CreateOAuth2Token$;
  exports.CreateOAuth2TokenCommand = CreateOAuth2TokenCommand;
  exports.CreateOAuth2TokenRequest$ = CreateOAuth2TokenRequest$;
  exports.CreateOAuth2TokenRequestBody$ = CreateOAuth2TokenRequestBody$;
  exports.CreateOAuth2TokenResponse$ = CreateOAuth2TokenResponse$;
  exports.CreateOAuth2TokenResponseBody$ = CreateOAuth2TokenResponseBody$;
  exports.InternalServerException = InternalServerException;
  exports.InternalServerException$ = InternalServerException$;
  exports.OAuth2ErrorCode = OAuth2ErrorCode;
  exports.Signin = Signin;
  exports.SigninClient = SigninClient;
  exports.SigninServiceException = SigninServiceException;
  exports.SigninServiceException$ = SigninServiceException$;
  exports.TooManyRequestsError = TooManyRequestsError;
  exports.TooManyRequestsError$ = TooManyRequestsError$;
  exports.ValidationException = ValidationException;
  exports.ValidationException$ = ValidationException$;
  exports.errorTypeRegistries = errorTypeRegistries;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-login@3.972.55/node_modules/@aws-sdk/credential-provider-login/dist-cjs/index.js
var require_dist_cjs11 = __commonJS((exports) => {
  var { setCredentialFeature } = require_client2();
  var { CredentialsProviderError, readFile, parseKnownFiles, getProfileName } = require_config();
  var { HttpRequest } = require_protocols();
  var { createHash, createPrivateKey, createPublicKey, sign } = __require("node:crypto");
  var { promises } = __require("node:fs");
  var { homedir } = __require("node:os");
  var { dirname, join } = __require("node:path");

  class LoginCredentialsFetcher {
    profileData;
    init;
    callerClientConfig;
    static REFRESH_THRESHOLD = 5 * 60 * 1000;
    constructor(profileData, init, callerClientConfig) {
      this.profileData = profileData;
      this.init = init;
      this.callerClientConfig = callerClientConfig;
    }
    async loadCredentials() {
      const token = await this.loadToken();
      if (!token) {
        throw new CredentialsProviderError(`Failed to load a token for session ${this.loginSession}, please re-authenticate using aws login`, { tryNextLink: false, logger: this.logger });
      }
      const accessToken = token.accessToken;
      const now = Date.now();
      const expiryTime = new Date(accessToken.expiresAt).getTime();
      const timeUntilExpiry = expiryTime - now;
      if (timeUntilExpiry <= LoginCredentialsFetcher.REFRESH_THRESHOLD) {
        return this.refresh(token);
      }
      return {
        accessKeyId: accessToken.accessKeyId,
        secretAccessKey: accessToken.secretAccessKey,
        sessionToken: accessToken.sessionToken,
        accountId: accessToken.accountId,
        expiration: new Date(accessToken.expiresAt)
      };
    }
    get logger() {
      return this.init?.logger;
    }
    get loginSession() {
      return this.profileData.login_session;
    }
    async refresh(token) {
      const { SigninClient, CreateOAuth2TokenCommand } = require_signin();
      const { logger, userAgentAppId } = this.callerClientConfig ?? {};
      const isH2 = (requestHandler2) => {
        return requestHandler2?.metadata?.handlerProtocol === "h2";
      };
      const requestHandler = isH2(this.callerClientConfig?.requestHandler) ? undefined : this.callerClientConfig?.requestHandler;
      const region = this.profileData.region ?? await this.callerClientConfig?.region?.() ?? process.env.AWS_REGION;
      const client = new SigninClient({
        credentials: {
          accessKeyId: "",
          secretAccessKey: ""
        },
        region,
        requestHandler,
        logger,
        userAgentAppId,
        ...this.init?.clientConfig
      });
      this.createDPoPInterceptor(client.middlewareStack);
      const commandInput = {
        tokenInput: {
          clientId: token.clientId,
          refreshToken: token.refreshToken,
          grantType: "refresh_token"
        }
      };
      try {
        const response = await client.send(new CreateOAuth2TokenCommand(commandInput));
        const { accessKeyId, secretAccessKey, sessionToken } = response.tokenOutput?.accessToken ?? {};
        const { refreshToken, expiresIn } = response.tokenOutput ?? {};
        if (!accessKeyId || !secretAccessKey || !sessionToken || !refreshToken) {
          throw new CredentialsProviderError("Token refresh response missing required fields", {
            logger: this.logger,
            tryNextLink: false
          });
        }
        const expiresInMs = (expiresIn ?? 900) * 1000;
        const expiration = new Date(Date.now() + expiresInMs);
        const updatedToken = {
          ...token,
          accessToken: {
            ...token.accessToken,
            accessKeyId,
            secretAccessKey,
            sessionToken,
            expiresAt: expiration.toISOString()
          },
          refreshToken
        };
        await this.saveToken(updatedToken);
        const newAccessToken = updatedToken.accessToken;
        return {
          accessKeyId: newAccessToken.accessKeyId,
          secretAccessKey: newAccessToken.secretAccessKey,
          sessionToken: newAccessToken.sessionToken,
          accountId: newAccessToken.accountId,
          expiration
        };
      } catch (error) {
        if (error.name === "AccessDeniedException") {
          const errorType = error.error;
          let message;
          switch (errorType) {
            case "TOKEN_EXPIRED":
              message = "Your session has expired. Please reauthenticate.";
              break;
            case "USER_CREDENTIALS_CHANGED":
              message = "Unable to refresh credentials because of a change in your password. Please reauthenticate with your new password.";
              break;
            case "INSUFFICIENT_PERMISSIONS":
              message = "Unable to refresh credentials due to insufficient permissions. You may be missing permission for the 'CreateOAuth2Token' action.";
              break;
            default:
              message = `Failed to refresh token: ${String(error)}. Please re-authenticate using \`aws login\``;
          }
          throw new CredentialsProviderError(message, { logger: this.logger, tryNextLink: false });
        }
        throw new CredentialsProviderError(`Failed to refresh token: ${String(error)}. Please re-authenticate using aws login`, { logger: this.logger });
      }
    }
    async loadToken() {
      const tokenFilePath = this.getTokenFilePath();
      try {
        let tokenData;
        try {
          tokenData = await readFile(tokenFilePath, { ignoreCache: this.init?.ignoreCache });
        } catch {
          tokenData = await promises.readFile(tokenFilePath, "utf8");
        }
        const token = JSON.parse(tokenData);
        const missingFields = ["accessToken", "clientId", "refreshToken", "dpopKey"].filter((k) => !token[k]);
        if (!token.accessToken?.accountId) {
          missingFields.push("accountId");
        }
        if (missingFields.length > 0) {
          throw new CredentialsProviderError(`Token validation failed, missing fields: ${missingFields.join(", ")}`, {
            logger: this.logger,
            tryNextLink: false
          });
        }
        return token;
      } catch (error) {
        throw new CredentialsProviderError(`Failed to load token from ${tokenFilePath}: ${String(error)}`, {
          logger: this.logger,
          tryNextLink: false
        });
      }
    }
    async saveToken(token) {
      const tokenFilePath = this.getTokenFilePath();
      const directory = dirname(tokenFilePath);
      try {
        await promises.mkdir(directory, { recursive: true });
      } catch (error) {}
      await promises.writeFile(tokenFilePath, JSON.stringify(token, null, 2), "utf8");
    }
    getTokenFilePath() {
      const directory = process.env.AWS_LOGIN_CACHE_DIRECTORY ?? join(homedir(), ".aws", "login", "cache");
      const loginSessionBytes = Buffer.from(this.loginSession, "utf8");
      const loginSessionSha256 = createHash("sha256").update(loginSessionBytes).digest("hex");
      return join(directory, `${loginSessionSha256}.json`);
    }
    derToRawSignature(derSignature) {
      let offset = 2;
      if (derSignature[offset] !== 2) {
        throw new Error("Invalid DER signature");
      }
      offset++;
      const rLength = derSignature[offset++];
      let r = derSignature.subarray(offset, offset + rLength);
      offset += rLength;
      if (derSignature[offset] !== 2) {
        throw new Error("Invalid DER signature");
      }
      offset++;
      const sLength = derSignature[offset++];
      let s = derSignature.subarray(offset, offset + sLength);
      r = r[0] === 0 ? r.subarray(1) : r;
      s = s[0] === 0 ? s.subarray(1) : s;
      const rPadded = Buffer.concat([Buffer.alloc(32 - r.length), r]);
      const sPadded = Buffer.concat([Buffer.alloc(32 - s.length), s]);
      return Buffer.concat([rPadded, sPadded]);
    }
    createDPoPInterceptor(middlewareStack) {
      middlewareStack.add((next) => async (args) => {
        if (HttpRequest.isInstance(args.request)) {
          const request = args.request;
          const actualEndpoint = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}`;
          const dpop = await this.generateDpop(request.method, actualEndpoint);
          request.headers = {
            ...request.headers,
            DPoP: dpop
          };
        }
        return next(args);
      }, {
        step: "finalizeRequest",
        name: "dpopInterceptor",
        override: true
      });
    }
    async generateDpop(method = "POST", endpoint) {
      const token = await this.loadToken();
      try {
        const privateKey = createPrivateKey({
          key: token.dpopKey,
          format: "pem",
          type: "sec1"
        });
        const publicKey = createPublicKey(privateKey);
        const publicDer = publicKey.export({ format: "der", type: "spki" });
        let pointStart = -1;
        for (let i = 0;i < publicDer.length; i++) {
          if (publicDer[i] === 4) {
            pointStart = i;
            break;
          }
        }
        const x = publicDer.slice(pointStart + 1, pointStart + 33);
        const y = publicDer.slice(pointStart + 33, pointStart + 65);
        const header = {
          alg: "ES256",
          typ: "dpop+jwt",
          jwk: {
            kty: "EC",
            crv: "P-256",
            x: x.toString("base64url"),
            y: y.toString("base64url")
          }
        };
        const payload = {
          jti: crypto.randomUUID(),
          htm: method,
          htu: endpoint,
          iat: Math.floor(Date.now() / 1000)
        };
        const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
        const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const message = `${headerB64}.${payloadB64}`;
        const asn1Signature = sign("sha256", Buffer.from(message), privateKey);
        const rawSignature = this.derToRawSignature(asn1Signature);
        const signatureB64 = rawSignature.toString("base64url");
        return `${message}.${signatureB64}`;
      } catch (error) {
        throw new CredentialsProviderError(`Failed to generate Dpop proof: ${error instanceof Error ? error.message : String(error)}`, { logger: this.logger, tryNextLink: false });
      }
    }
  }
  var fromLoginCredentials = (init) => async ({ callerClientConfig } = {}) => {
    init?.logger?.debug?.("@aws-sdk/credential-providers - fromLoginCredentials");
    const profiles = await parseKnownFiles(init || {});
    const profileName = getProfileName({
      profile: init?.profile ?? callerClientConfig?.profile
    });
    const profile = profiles[profileName];
    if (!profile?.login_session) {
      throw new CredentialsProviderError(`Profile ${profileName} does not contain login_session.`, {
        tryNextLink: true,
        logger: init?.logger
      });
    }
    const fetcher = new LoginCredentialsFetcher(profile, init, callerClientConfig);
    const credentials = await fetcher.loadCredentials();
    return setCredentialFeature(credentials, "CREDENTIALS_LOGIN", "AD");
  };
  exports.fromLoginCredentials = fromLoginCredentials;
});

// ../../node_modules/.bun/@aws-sdk+signature-v4-multi-region@3.996.35/node_modules/@aws-sdk/signature-v4-multi-region/dist-cjs/index.js
var require_dist_cjs12 = __commonJS((exports) => {
  var { SignatureV4, signatureV4aContainer } = require_dist_cjs7();
  var signatureV4CrtContainer = {
    CrtSignerV4: null
  };
  var SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
  var SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();

  class SignatureV4SignWithCredentials extends SignatureV4 {
    async signWithCredentials(requestToSign, credentials, options) {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return privateAccess.signRequest(requestToSign, options ?? {});
    }
    async presignWithCredentials(requestToSign, credentials, options) {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      delete requestToSign.headers[SESSION_TOKEN_HEADER];
      requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      requestToSign.query = requestToSign.query ?? {};
      requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return this.presign(requestToSign, options);
    }
  }
  function getCredentialsWithoutSessionToken(credentials) {
    return {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      expiration: credentials.expiration
    };
  }
  function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
    const currentCredentialProvider = privateAccess.credentialProvider;
    privateAccess.credentialProvider = () => {
      privateAccess.credentialProvider = currentCredentialProvider;
      return Promise.resolve(credentialsWithoutSessionToken);
    };
  }

  class SignatureV4MultiRegion {
    sigv4aSigner;
    sigv4Signer;
    signerOptions;
    static sigv4aDependency() {
      if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") {
        return "crt";
      } else if (typeof signatureV4aContainer.SignatureV4a === "function") {
        return "js";
      }
      return "none";
    }
    constructor(options) {
      this.sigv4Signer = new SignatureV4SignWithCredentials(options);
      this.signerOptions = options;
    }
    async sign(requestToSign, options = {}) {
      if (options.signingRegion === "*") {
        return this.getSigv4aSigner().sign(requestToSign, options);
      }
      return this.sigv4Signer.sign(requestToSign, options);
    }
    async signWithCredentials(requestToSign, credentials, options = {}) {
      if (options.signingRegion === "*") {
        const signer = this.getSigv4aSigner();
        const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
        if (CrtSignerV4 && signer instanceof CrtSignerV4) {
          return signer.signWithCredentials(requestToSign, credentials, options);
        } else {
          throw new Error(`signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. ` + `Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. ` + `You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] ` + `or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. ` + `For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`);
        }
      }
      return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
    }
    async presign(originalRequest, options = {}) {
      if (options.signingRegion === "*") {
        const signer = this.getSigv4aSigner();
        const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
        if (CrtSignerV4 && signer instanceof CrtSignerV4) {
          return signer.presign(originalRequest, options);
        } else {
          throw new Error(`presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. ` + `Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. ` + `You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] ` + `or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. ` + `For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`);
        }
      }
      return this.sigv4Signer.presign(originalRequest, options);
    }
    async presignWithCredentials(originalRequest, credentials, options = {}) {
      if (options.signingRegion === "*") {
        throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
      }
      return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
    }
    getSigv4aSigner() {
      if (!this.sigv4aSigner) {
        const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
        const JsSigV4aSigner = signatureV4aContainer.SignatureV4a;
        if (this.signerOptions.runtime === "node") {
          if (!CrtSignerV4 && !JsSigV4aSigner) {
            throw new Error("Neither CRT nor JS SigV4a implementation is available. " + "Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. " + "For more information please go to " + "https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
          }
          if (CrtSignerV4 && typeof CrtSignerV4 === "function") {
            this.sigv4aSigner = new CrtSignerV4({
              ...this.signerOptions,
              signingAlgorithm: 1
            });
          } else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") {
            this.sigv4aSigner = new JsSigV4aSigner({
              ...this.signerOptions
            });
          } else {
            throw new Error("Available SigV4a implementation is not a valid constructor. " + "Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a." + "For more information please go to " + "https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
          }
        } else {
          if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") {
            throw new Error("JS SigV4a implementation is not available or not a valid constructor. " + "Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. " + "You must also register the package by calling [require('@aws-sdk/signature-v4a');] " + "or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. " + "For more information please go to " + "https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
          }
          this.sigv4aSigner = new JsSigV4aSigner({
            ...this.signerOptions
          });
        }
      }
      return this.sigv4aSigner;
    }
  }
  exports.SignatureV4MultiRegion = SignatureV4MultiRegion;
  exports.SignatureV4SignWithCredentials = SignatureV4SignWithCredentials;
  exports.signatureV4CrtContainer = signatureV4CrtContainer;
});

// ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.23/node_modules/@aws-sdk/nested-clients/dist-cjs/submodules/sts/index.js
var require_sts = __commonJS((exports) => {
  var { awsEndpointFunctions, emitWarningIfUnsupportedVersion: emitWarningIfUnsupportedVersion$1, createDefaultUserAgentProvider, NODE_APP_ID_CONFIG_OPTIONS, getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration, resolveUserAgentConfig, resolveHostHeaderConfig, getUserAgentPlugin, getHostHeaderPlugin, getLoggerPlugin, getRecursionDetectionPlugin, setCredentialFeature, stsRegionDefaultResolver } = require_client2();
  var { NoAuthSigner, getHttpAuthSchemeEndpointRuleSetPlugin, DefaultIdentityProviderConfig, getHttpSigningPlugin } = require_dist_cjs3();
  var { normalizeProvider, getSmithyContext, ServiceException, NoOpLogger, emitWarningIfUnsupportedVersion, loadConfigsForDefaultMode, getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig, Client, Command, createAggregatedClient } = require_client();
  exports.$Command = Command;
  exports.__Client = Client;
  var { resolveDefaultsModeConfig, loadConfig, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS, resolveRegionConfig } = require_config();
  var { BinaryDecisionDiagram, EndpointCache, decideEndpoint, customEndpointFunctions, resolveParams, resolveEndpointConfig, getEndpointPlugin } = require_endpoints();
  var { parseUrl, getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig, getContentLengthPlugin } = require_protocols();
  var { DEFAULT_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, getRetryPlugin } = require_retry();
  var { TypeRegistry, getSchemaSerdePlugin } = require_schema();
  var { resolveAwsSdkSigV4Config, resolveAwsSdkSigV4AConfig, AwsSdkSigV4Signer, AwsSdkSigV4ASigner, NODE_SIGV4A_CONFIG_OPTIONS, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS } = require_httpAuthSchemes();
  var { SignatureV4MultiRegion } = require_dist_cjs12();
  var { toUtf8, fromUtf8, toBase64, fromBase64, Hash, calculateBodyLength } = require_serde();
  var { streamCollector, NodeHttpHandler } = require_dist_cjs2();
  var { AwsQueryProtocol } = require_protocols2();
  var q = "ref";
  var a = -1;
  var b = true;
  var c = "isSet";
  var d = "PartitionResult";
  var e = "booleanEquals";
  var f = "stringEquals";
  var g = "getAttr";
  var h = "us-east-1";
  var i = "sigv4";
  var j = "sts";
  var k = "https://sts.{Region}.{PartitionResult#dnsSuffix}";
  var l = { [q]: "Endpoint" };
  var m = { [q]: "Region" };
  var n = { [q]: d };
  var o = {};
  var p = [m];
  var _data = {
    conditions: [
      [c, [l]],
      [c, p],
      ["aws.partition", p, d],
      [e, [{ [q]: "UseFIPS" }, b]],
      [e, [{ [q]: "UseDualStack" }, b]],
      [f, [m, "aws-global"]],
      [e, [{ [q]: "UseGlobalEndpoint" }, b]],
      [f, [m, "eu-central-1"]],
      [e, [{ fn: g, argv: [n, "supportsDualStack"] }, b]],
      [e, [{ fn: g, argv: [n, "supportsFIPS"] }, b]],
      [f, [m, "ap-south-1"]],
      [f, [m, "eu-north-1"]],
      [f, [m, "eu-west-1"]],
      [f, [m, "eu-west-2"]],
      [f, [m, "eu-west-3"]],
      [f, [m, "sa-east-1"]],
      [f, [m, h]],
      [f, [m, "us-east-2"]],
      [f, [m, "us-west-2"]],
      [f, [m, "us-west-1"]],
      [f, [m, "ca-central-1"]],
      [f, [m, "ap-southeast-1"]],
      [f, [m, "ap-northeast-1"]],
      [f, [m, "ap-southeast-2"]],
      [f, [{ fn: g, argv: [n, "name"] }, "aws-us-gov"]]
    ],
    results: [
      [a],
      ["https://sts.amazonaws.com", { authSchemes: [{ name: i, signingName: j, signingRegion: h }] }],
      [k, { authSchemes: [{ name: i, signingName: j, signingRegion: "{Region}" }] }],
      [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
      [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
      [l, o],
      ["https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
      [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
      ["https://sts.{Region}.amazonaws.com", o],
      ["https://sts-fips.{Region}.{PartitionResult#dnsSuffix}", o],
      [a, "FIPS is enabled but this partition does not support FIPS"],
      ["https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
      [a, "DualStack is enabled but this partition does not support DualStack"],
      [k, o],
      [a, "Invalid Configuration: Missing Region"]
    ]
  };
  var root = 2;
  var r = 1e8;
  var nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    30,
    3,
    1,
    4,
    r + 14,
    2,
    5,
    r + 14,
    3,
    25,
    6,
    4,
    24,
    7,
    5,
    r + 1,
    8,
    6,
    9,
    r + 13,
    7,
    r + 1,
    10,
    10,
    r + 1,
    11,
    11,
    r + 1,
    12,
    12,
    r + 1,
    13,
    13,
    r + 1,
    14,
    14,
    r + 1,
    15,
    15,
    r + 1,
    16,
    16,
    r + 1,
    17,
    17,
    r + 1,
    18,
    18,
    r + 1,
    19,
    19,
    r + 1,
    20,
    20,
    r + 1,
    21,
    21,
    r + 1,
    22,
    22,
    r + 1,
    23,
    23,
    r + 1,
    r + 2,
    8,
    r + 11,
    r + 12,
    4,
    28,
    26,
    9,
    27,
    r + 10,
    24,
    r + 8,
    r + 9,
    8,
    29,
    r + 7,
    9,
    r + 6,
    r + 7,
    3,
    r + 3,
    31,
    4,
    r + 4,
    r + 5
  ]);
  var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
  var cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS", "UseGlobalEndpoint"]
  });
  var defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => decideEndpoint(bdd, {
      endpointParams,
      logger: context.logger
    }));
  };
  customEndpointFunctions.aws = awsEndpointFunctions;
  var createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
    if (!input) {
      throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
    }
    const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
    const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
    if (!instructionsFn) {
      throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
    }
    const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config);
    return Object.assign(defaultParameters, endpointParameters);
  };
  var _defaultSTSHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
      operation: getSmithyContext(context).operation,
      region: await normalizeProvider(config.region)() || (() => {
        throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
      })()
    };
  };
  var defaultSTSHttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultSTSHttpAuthSchemeParametersProvider);
  function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4",
      signingProperties: {
        name: "sts",
        region: authParameters.region
      },
      propertiesExtractor: (config, context) => ({
        signingProperties: {
          config,
          context
        }
      })
    };
  }
  function createAwsAuthSigv4aHttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4a",
      signingProperties: {
        name: "sts",
        region: authParameters.region
      },
      propertiesExtractor: (config, context) => ({
        signingProperties: {
          config,
          context
        }
      })
    };
  }
  function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
      schemeId: "smithy.api#noAuth"
    };
  }
  var createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver2, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
    const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
      const endpoint = defaultEndpointResolver2(authParameters);
      const authSchemes = endpoint.properties?.authSchemes;
      if (!authSchemes) {
        return defaultHttpAuthSchemeResolver(authParameters);
      }
      const options = [];
      for (const scheme of authSchemes) {
        const { name: resolvedName, properties = {}, ...rest } = scheme;
        const name = resolvedName.toLowerCase();
        if (resolvedName !== name) {
          console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
        }
        let schemeId;
        if (name === "sigv4a") {
          schemeId = "aws.auth#sigv4a";
          const sigv4Present = authSchemes.find((s) => {
            const name2 = s.name.toLowerCase();
            return name2 !== "sigv4a" && name2.startsWith("sigv4");
          });
          if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) {
            continue;
          }
        } else if (name.startsWith("sigv4")) {
          schemeId = "aws.auth#sigv4";
        } else {
          throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
        }
        const createOption = createHttpAuthOptionFunctions[schemeId];
        if (!createOption) {
          throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
        }
        const option = createOption(authParameters);
        option.schemeId = schemeId;
        option.signingProperties = { ...option.signingProperties || {}, ...rest, ...properties };
        options.push(option);
      }
      return options;
    };
    return endpointRuleSetHttpAuthSchemeProvider;
  };
  var _defaultSTSHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
      case "AssumeRoleWithWebIdentity": {
        options.push(createSmithyApiNoAuthHttpAuthOption());
        options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
        break;
      }
      default: {
        options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
      }
    }
    return options;
  };
  var defaultSTSHttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultSTSHttpAuthSchemeProvider, {
    "aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
    "aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption,
    "smithy.api#noAuth": createSmithyApiNoAuthHttpAuthOption
  });
  var resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    const config_1 = resolveAwsSdkSigV4AConfig(config_0);
    return Object.assign(config_1, {
      authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
    });
  };
  var resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
      useDualstackEndpoint: options.useDualstackEndpoint ?? false,
      useFipsEndpoint: options.useFipsEndpoint ?? false,
      useGlobalEndpoint: options.useGlobalEndpoint ?? false,
      defaultSigningName: "sts"
    });
  };
  var commonParams = {
    UseGlobalEndpoint: { type: "builtInParams", name: "useGlobalEndpoint" },
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
  };
  var version = "3.997.22";
  var packageInfo = {
    version
  };

  class STSServiceException extends ServiceException {
    constructor(options) {
      super(options);
      Object.setPrototypeOf(this, STSServiceException.prototype);
    }
  }

  class ExpiredTokenException extends STSServiceException {
    name = "ExpiredTokenException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "ExpiredTokenException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, ExpiredTokenException.prototype);
    }
  }

  class MalformedPolicyDocumentException extends STSServiceException {
    name = "MalformedPolicyDocumentException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "MalformedPolicyDocumentException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
    }
  }

  class PackedPolicyTooLargeException extends STSServiceException {
    name = "PackedPolicyTooLargeException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "PackedPolicyTooLargeException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
    }
  }

  class RegionDisabledException extends STSServiceException {
    name = "RegionDisabledException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "RegionDisabledException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, RegionDisabledException.prototype);
    }
  }

  class IDPRejectedClaimException extends STSServiceException {
    name = "IDPRejectedClaimException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "IDPRejectedClaimException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
    }
  }

  class InvalidIdentityTokenException extends STSServiceException {
    name = "InvalidIdentityTokenException";
    $fault = "client";
    constructor(opts) {
      super({
        name: "InvalidIdentityTokenException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
    }
  }

  class IDPCommunicationErrorException extends STSServiceException {
    name = "IDPCommunicationErrorException";
    $fault = "client";
    $retryable = {};
    constructor(opts) {
      super({
        name: "IDPCommunicationErrorException",
        $fault: "client",
        ...opts
      });
      Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
    }
  }
  var _A = "Arn";
  var _AKI = "AccessKeyId";
  var _AR = "AssumeRole";
  var _ARI = "AssumedRoleId";
  var _ARR = "AssumeRoleRequest";
  var _ARRs = "AssumeRoleResponse";
  var _ARU = "AssumedRoleUser";
  var _ARWWI = "AssumeRoleWithWebIdentity";
  var _ARWWIR = "AssumeRoleWithWebIdentityRequest";
  var _ARWWIRs = "AssumeRoleWithWebIdentityResponse";
  var _Au = "Audience";
  var _C = "Credentials";
  var _CA = "ContextAssertion";
  var _DS = "DurationSeconds";
  var _E = "Expiration";
  var _EI = "ExternalId";
  var _ETE = "ExpiredTokenException";
  var _IDPCEE = "IDPCommunicationErrorException";
  var _IDPRCE = "IDPRejectedClaimException";
  var _IITE = "InvalidIdentityTokenException";
  var _K = "Key";
  var _MPDE = "MalformedPolicyDocumentException";
  var _P = "Policy";
  var _PA = "PolicyArns";
  var _PAr = "ProviderArn";
  var _PC = "ProvidedContexts";
  var _PCLT = "ProvidedContextsListType";
  var _PCr = "ProvidedContext";
  var _PDT = "PolicyDescriptorType";
  var _PI = "ProviderId";
  var _PPS = "PackedPolicySize";
  var _PPTLE = "PackedPolicyTooLargeException";
  var _Pr = "Provider";
  var _RA = "RoleArn";
  var _RDE = "RegionDisabledException";
  var _RSN = "RoleSessionName";
  var _SAK = "SecretAccessKey";
  var _SFWIT = "SubjectFromWebIdentityToken";
  var _SI = "SourceIdentity";
  var _SN = "SerialNumber";
  var _ST = "SessionToken";
  var _T = "Tags";
  var _TC = "TokenCode";
  var _TTK = "TransitiveTagKeys";
  var _Ta = "Tag";
  var _V = "Value";
  var _WIT = "WebIdentityToken";
  var _a = "arn";
  var _aKST = "accessKeySecretType";
  var _aQE = "awsQueryError";
  var _c = "client";
  var _cTT = "clientTokenType";
  var _e = "error";
  var _hE = "httpError";
  var _m = "message";
  var _pDLT = "policyDescriptorListType";
  var _s = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
  var _tLT = "tagListType";
  var n0 = "com.amazonaws.sts";
  var _s_registry = TypeRegistry.for(_s);
  var STSServiceException$ = [-3, _s, "STSServiceException", 0, [], []];
  _s_registry.registerError(STSServiceException$, STSServiceException);
  var n0_registry = TypeRegistry.for(n0);
  var ExpiredTokenException$ = [
    -3,
    n0,
    _ETE,
    { [_aQE]: [`ExpiredTokenException`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
  var IDPCommunicationErrorException$ = [
    -3,
    n0,
    _IDPCEE,
    { [_aQE]: [`IDPCommunicationError`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(IDPCommunicationErrorException$, IDPCommunicationErrorException);
  var IDPRejectedClaimException$ = [
    -3,
    n0,
    _IDPRCE,
    { [_aQE]: [`IDPRejectedClaim`, 403], [_e]: _c, [_hE]: 403 },
    [_m],
    [0]
  ];
  n0_registry.registerError(IDPRejectedClaimException$, IDPRejectedClaimException);
  var InvalidIdentityTokenException$ = [
    -3,
    n0,
    _IITE,
    { [_aQE]: [`InvalidIdentityToken`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(InvalidIdentityTokenException$, InvalidIdentityTokenException);
  var MalformedPolicyDocumentException$ = [
    -3,
    n0,
    _MPDE,
    { [_aQE]: [`MalformedPolicyDocument`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(MalformedPolicyDocumentException$, MalformedPolicyDocumentException);
  var PackedPolicyTooLargeException$ = [
    -3,
    n0,
    _PPTLE,
    { [_aQE]: [`PackedPolicyTooLarge`, 400], [_e]: _c, [_hE]: 400 },
    [_m],
    [0]
  ];
  n0_registry.registerError(PackedPolicyTooLargeException$, PackedPolicyTooLargeException);
  var RegionDisabledException$ = [
    -3,
    n0,
    _RDE,
    { [_aQE]: [`RegionDisabledException`, 403], [_e]: _c, [_hE]: 403 },
    [_m],
    [0]
  ];
  n0_registry.registerError(RegionDisabledException$, RegionDisabledException);
  var errorTypeRegistries = [
    _s_registry,
    n0_registry
  ];
  var accessKeySecretType = [0, n0, _aKST, 8, 0];
  var clientTokenType = [0, n0, _cTT, 8, 0];
  var AssumedRoleUser$ = [
    3,
    n0,
    _ARU,
    0,
    [_ARI, _A],
    [0, 0],
    2
  ];
  var AssumeRoleRequest$ = [
    3,
    n0,
    _ARR,
    0,
    [_RA, _RSN, _PA, _P, _DS, _T, _TTK, _EI, _SN, _TC, _SI, _PC],
    [0, 0, () => policyDescriptorListType, 0, 1, () => tagListType, 64 | 0, 0, 0, 0, 0, () => ProvidedContextsListType],
    2
  ];
  var AssumeRoleResponse$ = [
    3,
    n0,
    _ARRs,
    0,
    [_C, _ARU, _PPS, _SI],
    [[() => Credentials$, 0], () => AssumedRoleUser$, 1, 0]
  ];
  var AssumeRoleWithWebIdentityRequest$ = [
    3,
    n0,
    _ARWWIR,
    0,
    [_RA, _RSN, _WIT, _PI, _PA, _P, _DS],
    [0, 0, [() => clientTokenType, 0], 0, () => policyDescriptorListType, 0, 1],
    3
  ];
  var AssumeRoleWithWebIdentityResponse$ = [
    3,
    n0,
    _ARWWIRs,
    0,
    [_C, _SFWIT, _ARU, _PPS, _Pr, _Au, _SI],
    [[() => Credentials$, 0], 0, () => AssumedRoleUser$, 1, 0, 0, 0]
  ];
  var Credentials$ = [
    3,
    n0,
    _C,
    0,
    [_AKI, _SAK, _ST, _E],
    [0, [() => accessKeySecretType, 0], 0, 4],
    4
  ];
  var PolicyDescriptorType$ = [
    3,
    n0,
    _PDT,
    0,
    [_a],
    [0]
  ];
  var ProvidedContext$ = [
    3,
    n0,
    _PCr,
    0,
    [_PAr, _CA],
    [0, 0]
  ];
  var Tag$ = [
    3,
    n0,
    _Ta,
    0,
    [_K, _V],
    [0, 0],
    2
  ];
  var policyDescriptorListType = [
    1,
    n0,
    _pDLT,
    0,
    () => PolicyDescriptorType$
  ];
  var ProvidedContextsListType = [
    1,
    n0,
    _PCLT,
    0,
    () => ProvidedContext$
  ];
  var tagListType = [
    1,
    n0,
    _tLT,
    0,
    () => Tag$
  ];
  var AssumeRole$ = [
    9,
    n0,
    _AR,
    0,
    () => AssumeRoleRequest$,
    () => AssumeRoleResponse$
  ];
  var AssumeRoleWithWebIdentity$ = [
    9,
    n0,
    _ARWWI,
    0,
    () => AssumeRoleWithWebIdentityRequest$,
    () => AssumeRoleWithWebIdentityResponse$
  ];
  var getRuntimeConfig$1 = (config) => {
    return {
      apiVersion: "2011-06-15",
      base64Decoder: config?.base64Decoder ?? fromBase64,
      base64Encoder: config?.base64Encoder ?? toBase64,
      disableHostPrefix: config?.disableHostPrefix ?? false,
      endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
      extensions: config?.extensions ?? [],
      httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSTSHttpAuthSchemeProvider,
      httpAuthSchemes: config?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
          signer: new AwsSdkSigV4Signer
        },
        {
          schemeId: "aws.auth#sigv4a",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
          signer: new AwsSdkSigV4ASigner
        },
        {
          schemeId: "smithy.api#noAuth",
          identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
          signer: new NoAuthSigner
        }
      ],
      logger: config?.logger ?? new NoOpLogger,
      protocol: config?.protocol ?? AwsQueryProtocol,
      protocolSettings: config?.protocolSettings ?? {
        defaultNamespace: "com.amazonaws.sts",
        errorTypeRegistries,
        xmlNamespace: "https://sts.amazonaws.com/doc/2011-06-15/",
        version: "2011-06-15",
        serviceTarget: "AWSSecurityTokenServiceV20110615"
      },
      serviceId: config?.serviceId ?? "STS",
      signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
      urlParser: config?.urlParser ?? parseUrl,
      utf8Decoder: config?.utf8Decoder ?? fromUtf8,
      utf8Encoder: config?.utf8Encoder ?? toUtf8
    };
  };
  var getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const loaderConfig = {
      profile: config?.profile,
      logger: clientSharedValues.logger
    };
    return {
      ...clientSharedValues,
      ...config,
      runtime: "node",
      defaultsMode,
      authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
      bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
      defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
      httpAuthSchemes: config?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4") || (async (idProps) => await config.credentialDefaultProvider(idProps?.__config || {})()),
          signer: new AwsSdkSigV4Signer
        },
        {
          schemeId: "aws.auth#sigv4a",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
          signer: new AwsSdkSigV4ASigner
        },
        {
          schemeId: "smithy.api#noAuth",
          identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
          signer: new NoAuthSigner
        }
      ],
      maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
      region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
      requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
      retryMode: config?.retryMode ?? loadConfig({
        ...NODE_RETRY_MODE_CONFIG_OPTIONS,
        default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
      }, config),
      sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
      sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? loadConfig(NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
      streamCollector: config?.streamCollector ?? streamCollector,
      useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
      userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
    };
  };
  var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
      setHttpAuthScheme(httpAuthScheme) {
        const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
        if (index === -1) {
          _httpAuthSchemes.push(httpAuthScheme);
        } else {
          _httpAuthSchemes.splice(index, 1, httpAuthScheme);
        }
      },
      httpAuthSchemes() {
        return _httpAuthSchemes;
      },
      setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
        _httpAuthSchemeProvider = httpAuthSchemeProvider;
      },
      httpAuthSchemeProvider() {
        return _httpAuthSchemeProvider;
      },
      setCredentials(credentials) {
        _credentials = credentials;
      },
      credentials() {
        return _credentials;
      }
    };
  };
  var resolveHttpAuthRuntimeConfig = (config) => {
    return {
      httpAuthSchemes: config.httpAuthSchemes(),
      httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
      credentials: config.credentials()
    };
  };
  var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
  };

  class STSClient extends Client {
    config;
    constructor(...[configuration]) {
      const _config_0 = getRuntimeConfig(configuration || {});
      super(_config_0);
      this.initConfig = _config_0;
      const _config_1 = resolveClientEndpointParameters(_config_0);
      const _config_2 = resolveUserAgentConfig(_config_1);
      const _config_3 = resolveRetryConfig(_config_2);
      const _config_4 = resolveRegionConfig(_config_3);
      const _config_5 = resolveHostHeaderConfig(_config_4);
      const _config_6 = resolveEndpointConfig(_config_5);
      const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
      const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
      this.config = _config_8;
      this.middlewareStack.use(getSchemaSerdePlugin(this.config));
      this.middlewareStack.use(getUserAgentPlugin(this.config));
      this.middlewareStack.use(getRetryPlugin(this.config));
      this.middlewareStack.use(getContentLengthPlugin(this.config));
      this.middlewareStack.use(getHostHeaderPlugin(this.config));
      this.middlewareStack.use(getLoggerPlugin(this.config));
      this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
      this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: defaultSTSHttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials,
          "aws.auth#sigv4a": config.credentials
        })
      }));
      this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
      super.destroy();
    }
  }

  class AssumeRoleCommand extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
    return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
  }).s("AWSSecurityTokenServiceV20110615", "AssumeRole", {}).n("STSClient", "AssumeRoleCommand").sc(AssumeRole$).build() {
  }

  class AssumeRoleWithWebIdentityCommand extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
    return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
  }).s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithWebIdentity", {}).n("STSClient", "AssumeRoleWithWebIdentityCommand").sc(AssumeRoleWithWebIdentity$).build() {
  }
  var commands = {
    AssumeRoleCommand,
    AssumeRoleWithWebIdentityCommand
  };

  class STS extends STSClient {
  }
  createAggregatedClient(commands, STS);
  var getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
    if (typeof assumedRoleUser?.Arn === "string") {
      const arnComponents = assumedRoleUser.Arn.split(":");
      if (arnComponents.length > 4 && arnComponents[4] !== "") {
        return arnComponents[4];
      }
    }
    return;
  };
  var resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
    const region = typeof _region === "function" ? await _region() : _region;
    const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
    let stsDefaultRegion = "";
    const resolvedRegion = region ?? parentRegion ?? (stsDefaultRegion = await stsRegionDefaultResolver(loaderConfig)());
    credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
    return resolvedRegion;
  };
  var getDefaultRoleAssumer$1 = (stsOptions, STSClient2) => {
    let stsClient;
    let closureSourceCreds;
    return async (sourceCreds, params) => {
      closureSourceCreds = sourceCreds;
      if (!stsClient) {
        const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
        const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
          logger,
          profile
        });
        const isCompatibleRequestHandler = !isH2(requestHandler);
        stsClient = new STSClient2({
          ...stsOptions,
          userAgentAppId,
          profile,
          credentialDefaultProvider: () => async () => closureSourceCreds,
          region: resolvedRegion,
          requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
          logger
        });
      }
      const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
      if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
        throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
      }
      const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
      const credentials = {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
        expiration: Credentials.Expiration,
        ...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
        ...accountId && { accountId }
      };
      setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
      return credentials;
    };
  };
  var getDefaultRoleAssumerWithWebIdentity$1 = (stsOptions, STSClient2) => {
    let stsClient;
    return async (params) => {
      if (!stsClient) {
        const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
        const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
          logger,
          profile
        });
        const isCompatibleRequestHandler = !isH2(requestHandler);
        stsClient = new STSClient2({
          ...stsOptions,
          userAgentAppId,
          profile,
          region: resolvedRegion,
          requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
          logger
        });
      }
      const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
      if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
        throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
      }
      const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
      const credentials = {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
        expiration: Credentials.Expiration,
        ...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
        ...accountId && { accountId }
      };
      if (accountId) {
        setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
      }
      setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
      return credentials;
    };
  };
  var isH2 = (requestHandler) => {
    return requestHandler?.metadata?.handlerProtocol === "h2";
  };
  var getCustomizableStsClientCtor = (baseCtor, customizations) => {
    if (!customizations)
      return baseCtor;
    else
      return class CustomizableSTSClient extends baseCtor {
        constructor(config) {
          super(config);
          for (const customization of customizations) {
            this.middlewareStack.use(customization);
          }
        }
      };
  };
  var getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumer$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
  var getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
  var decorateDefaultCredentialProvider = (provider) => (input) => provider({
    roleAssumer: getDefaultRoleAssumer(input),
    roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(input),
    ...input
  });
  exports.AssumeRole$ = AssumeRole$;
  exports.AssumeRoleCommand = AssumeRoleCommand;
  exports.AssumeRoleRequest$ = AssumeRoleRequest$;
  exports.AssumeRoleResponse$ = AssumeRoleResponse$;
  exports.AssumeRoleWithWebIdentity$ = AssumeRoleWithWebIdentity$;
  exports.AssumeRoleWithWebIdentityCommand = AssumeRoleWithWebIdentityCommand;
  exports.AssumeRoleWithWebIdentityRequest$ = AssumeRoleWithWebIdentityRequest$;
  exports.AssumeRoleWithWebIdentityResponse$ = AssumeRoleWithWebIdentityResponse$;
  exports.AssumedRoleUser$ = AssumedRoleUser$;
  exports.Credentials$ = Credentials$;
  exports.ExpiredTokenException = ExpiredTokenException;
  exports.ExpiredTokenException$ = ExpiredTokenException$;
  exports.IDPCommunicationErrorException = IDPCommunicationErrorException;
  exports.IDPCommunicationErrorException$ = IDPCommunicationErrorException$;
  exports.IDPRejectedClaimException = IDPRejectedClaimException;
  exports.IDPRejectedClaimException$ = IDPRejectedClaimException$;
  exports.InvalidIdentityTokenException = InvalidIdentityTokenException;
  exports.InvalidIdentityTokenException$ = InvalidIdentityTokenException$;
  exports.MalformedPolicyDocumentException = MalformedPolicyDocumentException;
  exports.MalformedPolicyDocumentException$ = MalformedPolicyDocumentException$;
  exports.PackedPolicyTooLargeException = PackedPolicyTooLargeException;
  exports.PackedPolicyTooLargeException$ = PackedPolicyTooLargeException$;
  exports.PolicyDescriptorType$ = PolicyDescriptorType$;
  exports.ProvidedContext$ = ProvidedContext$;
  exports.RegionDisabledException = RegionDisabledException;
  exports.RegionDisabledException$ = RegionDisabledException$;
  exports.STS = STS;
  exports.STSClient = STSClient;
  exports.STSServiceException = STSServiceException;
  exports.STSServiceException$ = STSServiceException$;
  exports.Tag$ = Tag$;
  exports.decorateDefaultCredentialProvider = decorateDefaultCredentialProvider;
  exports.errorTypeRegistries = errorTypeRegistries;
  exports.getDefaultRoleAssumer = getDefaultRoleAssumer;
  exports.getDefaultRoleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-process@3.972.49/node_modules/@aws-sdk/credential-provider-process/dist-cjs/index.js
var require_dist_cjs13 = __commonJS((exports) => {
  var { externalDataInterceptor, CredentialsProviderError, parseKnownFiles, getProfileName } = require_config();
  var { exec } = __require("node:child_process");
  var { promisify } = __require("node:util");
  var { setCredentialFeature } = require_client2();
  var getValidatedProcessCredentials = (profileName, data, profiles) => {
    if (data.Version !== 1) {
      throw Error(`Profile ${profileName} credential_process did not return Version 1.`);
    }
    if (data.AccessKeyId === undefined || data.SecretAccessKey === undefined) {
      throw Error(`Profile ${profileName} credential_process returned invalid credentials.`);
    }
    if (data.Expiration) {
      const currentTime = new Date;
      const expireTime = new Date(data.Expiration);
      if (expireTime < currentTime) {
        throw Error(`Profile ${profileName} credential_process returned expired credentials.`);
      }
    }
    let accountId = data.AccountId;
    if (!accountId && profiles?.[profileName]?.aws_account_id) {
      accountId = profiles[profileName].aws_account_id;
    }
    const credentials = {
      accessKeyId: data.AccessKeyId,
      secretAccessKey: data.SecretAccessKey,
      ...data.SessionToken && { sessionToken: data.SessionToken },
      ...data.Expiration && { expiration: new Date(data.Expiration) },
      ...data.CredentialScope && { credentialScope: data.CredentialScope },
      ...accountId && { accountId }
    };
    setCredentialFeature(credentials, "CREDENTIALS_PROCESS", "w");
    return credentials;
  };
  var resolveProcessCredentials = async (profileName, profiles, logger) => {
    const profile = profiles[profileName];
    if (profiles[profileName]) {
      const credentialProcess = profile["credential_process"];
      if (credentialProcess !== undefined) {
        const execPromise = promisify(externalDataInterceptor?.getTokenRecord?.().exec ?? exec);
        try {
          const { stdout } = await execPromise(credentialProcess);
          let data;
          try {
            data = JSON.parse(stdout.trim());
          } catch {
            throw Error(`Profile ${profileName} credential_process returned invalid JSON.`);
          }
          return getValidatedProcessCredentials(profileName, data, profiles);
        } catch (error) {
          throw new CredentialsProviderError(error.message, { logger });
        }
      } else {
        throw new CredentialsProviderError(`Profile ${profileName} did not contain credential_process.`, { logger });
      }
    } else {
      throw new CredentialsProviderError(`Profile ${profileName} could not be found in shared credentials file.`, {
        logger
      });
    }
  };
  var fromProcess = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/credential-provider-process - fromProcess");
    const profiles = await parseKnownFiles(init);
    return resolveProcessCredentials(getProfileName({
      profile: init.profile ?? callerClientConfig?.profile
    }), profiles, init.logger);
  };
  exports.fromProcess = fromProcess;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-web-identity@3.972.55/node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/fromWebToken.js
var require_fromWebToken = __commonJS((exports) => {
  exports.fromWebToken = (init) => async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromWebToken");
    const { roleArn, roleSessionName, webIdentityToken, providerId, policyArns, policy, durationSeconds } = init;
    let { roleAssumerWithWebIdentity } = init;
    if (!roleAssumerWithWebIdentity) {
      const { getDefaultRoleAssumerWithWebIdentity } = require_sts();
      roleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity({
        ...init.clientConfig,
        credentialProviderLogger: init.logger,
        parentClientConfig: {
          ...awsIdentityProperties?.callerClientConfig,
          ...init.parentClientConfig
        }
      }, init.clientPlugins);
    }
    return roleAssumerWithWebIdentity({
      RoleArn: roleArn,
      RoleSessionName: roleSessionName ?? `aws-sdk-js-session-${Date.now()}`,
      WebIdentityToken: webIdentityToken,
      ProviderId: providerId,
      PolicyArns: policyArns,
      Policy: policy,
      DurationSeconds: durationSeconds
    });
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-web-identity@3.972.55/node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/fromTokenFile.js
var require_fromTokenFile = __commonJS((exports) => {
  var { setCredentialFeature } = require_client2();
  var { CredentialsProviderError, externalDataInterceptor } = require_config();
  var { readFileSync } = __require("node:fs");
  var { fromWebToken } = require_fromWebToken();
  var ENV_TOKEN_FILE = "AWS_WEB_IDENTITY_TOKEN_FILE";
  var ENV_ROLE_ARN = "AWS_ROLE_ARN";
  var ENV_ROLE_SESSION_NAME = "AWS_ROLE_SESSION_NAME";
  exports.fromTokenFile = (init = {}) => async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromTokenFile");
    const webIdentityTokenFile = init?.webIdentityTokenFile ?? process.env[ENV_TOKEN_FILE];
    const roleArn = init?.roleArn ?? process.env[ENV_ROLE_ARN];
    const roleSessionName = init?.roleSessionName ?? process.env[ENV_ROLE_SESSION_NAME];
    if (!webIdentityTokenFile || !roleArn) {
      throw new CredentialsProviderError("Web identity configuration not specified", {
        logger: init.logger
      });
    }
    const credentials = await fromWebToken({
      ...init,
      webIdentityToken: externalDataInterceptor?.getTokenRecord?.()[webIdentityTokenFile] ?? readFileSync(webIdentityTokenFile, { encoding: "ascii" }),
      roleArn,
      roleSessionName
    })(awsIdentityProperties);
    if (webIdentityTokenFile === process.env[ENV_TOKEN_FILE]) {
      setCredentialFeature(credentials, "CREDENTIALS_ENV_VARS_STS_WEB_ID_TOKEN", "h");
    }
    return credentials;
  };
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-web-identity@3.972.55/node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/index.js
var require_dist_cjs14 = __commonJS((exports) => {
  var __exportStar = (m, e) => {
    Object.assign(e, m);
  };
  __exportStar(require_fromTokenFile(), exports);
  __exportStar(require_fromWebToken(), exports);
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-ini@3.972.56/node_modules/@aws-sdk/credential-provider-ini/dist-cjs/index.js
var require_dist_cjs15 = __commonJS((exports) => {
  var { CredentialsProviderError, chain, getProfileName, parseKnownFiles } = require_config();
  var { setCredentialFeature } = require_client2();
  var { fromLoginCredentials } = require_dist_cjs11();
  var resolveCredentialSource = (credentialSource, profileName, logger) => {
    const sourceProvidersMap = {
      EcsContainer: async (options) => {
        const { fromHttp } = require_dist_cjs6();
        const { fromContainerMetadata } = require_dist_cjs5();
        logger?.debug("@aws-sdk/credential-provider-ini - credential_source is EcsContainer");
        return async () => chain(fromHttp(options ?? {}), fromContainerMetadata(options))().then(setNamedProvider);
      },
      Ec2InstanceMetadata: async (options) => {
        logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Ec2InstanceMetadata");
        const { fromInstanceMetadata } = require_dist_cjs5();
        return async () => fromInstanceMetadata(options)().then(setNamedProvider);
      },
      Environment: async (options) => {
        logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Environment");
        const { fromEnv } = require_dist_cjs4();
        return async () => fromEnv(options)().then(setNamedProvider);
      }
    };
    if (credentialSource in sourceProvidersMap) {
      return sourceProvidersMap[credentialSource];
    } else {
      throw new CredentialsProviderError(`Unsupported credential source in profile ${profileName}. Got ${credentialSource}, ` + `expected EcsContainer or Ec2InstanceMetadata or Environment.`, { logger });
    }
  };
  var setNamedProvider = (creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_NAMED_PROVIDER", "p");
  var isAssumeRoleProfile = (arg, { profile = "default", logger } = {}) => {
    return Boolean(arg) && typeof arg === "object" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1 && ["undefined", "string"].indexOf(typeof arg.external_id) > -1 && ["undefined", "string"].indexOf(typeof arg.mfa_serial) > -1 && (isAssumeRoleWithSourceProfile(arg, { profile, logger }) || isCredentialSourceProfile(arg, { profile, logger }));
  };
  var isAssumeRoleWithSourceProfile = (arg, { profile, logger }) => {
    const withSourceProfile = typeof arg.source_profile === "string" && typeof arg.credential_source === "undefined";
    if (withSourceProfile) {
      logger?.debug?.(`    ${profile} isAssumeRoleWithSourceProfile source_profile=${arg.source_profile}`);
    }
    return withSourceProfile;
  };
  var isCredentialSourceProfile = (arg, { profile, logger }) => {
    const withProviderProfile = typeof arg.credential_source === "string" && typeof arg.source_profile === "undefined";
    if (withProviderProfile) {
      logger?.debug?.(`    ${profile} isCredentialSourceProfile credential_source=${arg.credential_source}`);
    }
    return withProviderProfile;
  };
  var resolveAssumeRoleCredentials = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, resolveProfileData2) => {
    options.logger?.debug("@aws-sdk/credential-provider-ini - resolveAssumeRoleCredentials (STS)");
    const profileData = profiles[profileName];
    const { source_profile, region } = profileData;
    if (!options.roleAssumer) {
      const { getDefaultRoleAssumer } = require_sts();
      options.roleAssumer = getDefaultRoleAssumer({
        ...options.clientConfig,
        credentialProviderLogger: options.logger,
        parentClientConfig: {
          ...callerClientConfig,
          ...options?.parentClientConfig,
          region: region ?? options?.parentClientConfig?.region ?? callerClientConfig?.region
        }
      }, options.clientPlugins);
    }
    if (source_profile && source_profile in visitedProfiles) {
      throw new CredentialsProviderError(`Detected a cycle attempting to resolve credentials for profile` + ` ${getProfileName(options)}. Profiles visited: ` + Object.keys(visitedProfiles).join(", "), { logger: options.logger });
    }
    options.logger?.debug(`@aws-sdk/credential-provider-ini - finding credential resolver using ${source_profile ? `source_profile=[${source_profile}]` : `profile=[${profileName}]`}`);
    const sourceCredsProvider = source_profile ? resolveProfileData2(source_profile, profiles, options, callerClientConfig, {
      ...visitedProfiles,
      [source_profile]: true
    }, isCredentialSourceWithoutRoleArn(profiles[source_profile] ?? {})) : (await resolveCredentialSource(profileData.credential_source, profileName, options.logger)(options))();
    if (isCredentialSourceWithoutRoleArn(profileData)) {
      return sourceCredsProvider.then((creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
    } else {
      const params = {
        RoleArn: profileData.role_arn,
        RoleSessionName: profileData.role_session_name || `aws-sdk-js-${Date.now()}`,
        ExternalId: profileData.external_id,
        DurationSeconds: parseInt(profileData.duration_seconds || "3600", 10)
      };
      const { mfa_serial } = profileData;
      if (mfa_serial) {
        if (!options.mfaCodeProvider) {
          throw new CredentialsProviderError(`Profile ${profileName} requires multi-factor authentication, but no MFA code callback was provided.`, { logger: options.logger, tryNextLink: false });
        }
        params.SerialNumber = mfa_serial;
        params.TokenCode = await options.mfaCodeProvider(mfa_serial);
      }
      const sourceCreds = await sourceCredsProvider;
      return options.roleAssumer(sourceCreds, params).then((creds) => setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
    }
  };
  var isCredentialSourceWithoutRoleArn = (section) => {
    return !section.role_arn && !!section.credential_source;
  };
  var isLoginProfile = (data) => {
    return Boolean(data && data.login_session);
  };
  var resolveLoginCredentials = async (profileName, options, callerClientConfig) => {
    const credentials = await fromLoginCredentials({
      ...options,
      profile: profileName
    })({ callerClientConfig });
    return setCredentialFeature(credentials, "CREDENTIALS_PROFILE_LOGIN", "AC");
  };
  var isProcessProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.credential_process === "string";
  var resolveProcessCredentials = async (options, profile) => {
    const { fromProcess } = require_dist_cjs13();
    const credentials = await fromProcess({
      ...options,
      profile
    })();
    return setCredentialFeature(credentials, "CREDENTIALS_PROFILE_PROCESS", "v");
  };
  var resolveSsoCredentials = async (profile, profileData, options = {}, callerClientConfig) => {
    const { fromSSO } = require_dist_cjs10();
    return fromSSO({
      profile,
      logger: options.logger,
      parentClientConfig: options.parentClientConfig,
      clientConfig: options.clientConfig
    })({
      callerClientConfig
    }).then((creds) => {
      if (profileData.sso_session) {
        return setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO", "r");
      } else {
        return setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO_LEGACY", "t");
      }
    });
  };
  var isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
  var isStaticCredsProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.aws_access_key_id === "string" && typeof arg.aws_secret_access_key === "string" && ["undefined", "string"].indexOf(typeof arg.aws_session_token) > -1 && ["undefined", "string"].indexOf(typeof arg.aws_account_id) > -1;
  var resolveStaticCredentials = async (profile, options) => {
    options?.logger?.debug("@aws-sdk/credential-provider-ini - resolveStaticCredentials");
    const credentials = {
      accessKeyId: profile.aws_access_key_id,
      secretAccessKey: profile.aws_secret_access_key,
      sessionToken: profile.aws_session_token,
      ...profile.aws_credential_scope && { credentialScope: profile.aws_credential_scope },
      ...profile.aws_account_id && { accountId: profile.aws_account_id }
    };
    return setCredentialFeature(credentials, "CREDENTIALS_PROFILE", "n");
  };
  var isWebIdentityProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.web_identity_token_file === "string" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1;
  var resolveWebIdentityCredentials = async (profile, options, callerClientConfig) => {
    const { fromTokenFile } = require_dist_cjs14();
    const credentials = await fromTokenFile({
      webIdentityTokenFile: profile.web_identity_token_file,
      roleArn: profile.role_arn,
      roleSessionName: profile.role_session_name,
      roleAssumerWithWebIdentity: options.roleAssumerWithWebIdentity,
      logger: options.logger,
      parentClientConfig: options.parentClientConfig
    })({
      callerClientConfig
    });
    return setCredentialFeature(credentials, "CREDENTIALS_PROFILE_STS_WEB_ID_TOKEN", "q");
  };
  var resolveProfileData = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, isAssumeRoleRecursiveCall = false) => {
    const data = profiles[profileName];
    if (Object.keys(visitedProfiles).length > 0 && isStaticCredsProfile(data)) {
      return resolveStaticCredentials(data, options);
    }
    if (isAssumeRoleRecursiveCall || isAssumeRoleProfile(data, { profile: profileName, logger: options.logger })) {
      return resolveAssumeRoleCredentials(profileName, profiles, options, callerClientConfig, visitedProfiles, resolveProfileData);
    }
    if (isStaticCredsProfile(data)) {
      return resolveStaticCredentials(data, options);
    }
    if (isWebIdentityProfile(data)) {
      return resolveWebIdentityCredentials(data, options, callerClientConfig);
    }
    if (isProcessProfile(data)) {
      return resolveProcessCredentials(options, profileName);
    }
    if (isSsoProfile(data)) {
      return await resolveSsoCredentials(profileName, data, options, callerClientConfig);
    }
    if (isLoginProfile(data)) {
      return resolveLoginCredentials(profileName, options, callerClientConfig);
    }
    throw new CredentialsProviderError(`Could not resolve credentials using profile: [${profileName}] in configuration/credentials file(s).`, { logger: options.logger });
  };
  var fromIni = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/credential-provider-ini - fromIni");
    const profiles = await parseKnownFiles(init);
    return resolveProfileData(getProfileName({
      profile: init.profile ?? callerClientConfig?.profile
    }), profiles, init, callerClientConfig);
  };
  exports.fromIni = fromIni;
});

// ../../node_modules/.bun/@aws-sdk+credential-provider-node@3.972.58/node_modules/@aws-sdk/credential-provider-node/dist-cjs/index.js
function memoizeChain(providers, treatAsExpired) {
  const chain2 = internalCreateChain(providers);
  let activeLock;
  let passiveLock;
  let credentials;
  let forceRefreshLock;
  const provider = async (options) => {
    if (options?.forceRefresh) {
      if (!forceRefreshLock) {
        forceRefreshLock = chain2(options).then((c) => {
          credentials = c;
        }).finally(() => {
          forceRefreshLock = undefined;
        });
      }
      await forceRefreshLock;
      return credentials;
    }
    if (credentials?.expiration) {
      if (credentials?.expiration?.getTime() < Date.now()) {
        credentials = undefined;
      }
    }
    if (activeLock) {
      await activeLock;
    } else if (!credentials || treatAsExpired?.(credentials)) {
      if (credentials) {
        if (!passiveLock) {
          passiveLock = chain2(options).then((c) => {
            credentials = c;
          }).finally(() => {
            passiveLock = undefined;
          });
        }
      } else {
        activeLock = chain2(options).then((c) => {
          credentials = c;
        }).finally(() => {
          activeLock = undefined;
        });
        return provider(options);
      }
    }
    return credentials;
  };
  return provider;
}
var ENV_KEY, ENV_SECRET, fromEnv, chain, CredentialsProviderError, ENV_PROFILE, ENV_IMDS_DISABLED = "AWS_EC2_METADATA_DISABLED", remoteProvider = async (init) => {
  const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = require_dist_cjs5();
  if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
    init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
    const { fromHttp } = require_dist_cjs6();
    return chain(fromHttp(init), fromContainerMetadata(init));
  }
  if (process.env[ENV_IMDS_DISABLED] && process.env[ENV_IMDS_DISABLED] !== "false") {
    return async () => {
      throw new CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
    };
  }
  init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
  return fromInstanceMetadata(init);
}, internalCreateChain = (providers) => async (awsIdentityProperties) => {
  let lastProviderError;
  for (const provider of providers) {
    try {
      return await provider(awsIdentityProperties);
    } catch (err) {
      lastProviderError = err;
      if (err?.tryNextLink) {
        continue;
      }
      throw err;
    }
  }
  throw lastProviderError;
}, multipleCredentialSourceWarningEmitted = false, defaultProvider = (init = {}) => memoizeChain([
  async () => {
    const profile = init.profile ?? process.env[ENV_PROFILE];
    if (profile) {
      const envStaticCredentialsAreSet = process.env[ENV_KEY] && process.env[ENV_SECRET];
      if (envStaticCredentialsAreSet) {
        if (!multipleCredentialSourceWarningEmitted) {
          const warnFn = init.logger?.warn && init.logger?.constructor?.name !== "NoOpLogger" ? init.logger.warn.bind(init.logger) : console.warn;
          warnFn(`@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
    Multiple credential sources detected: 
    Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
    This SDK will proceed with the AWS_PROFILE value.
    
    However, a future version may change this behavior to prefer the ENV static credentials.
    Please ensure that your environment only sets either the AWS_PROFILE or the
    AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.
`);
          multipleCredentialSourceWarningEmitted = true;
        }
      }
      throw new CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", {
        logger: init.logger,
        tryNextLink: true
      });
    }
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
    return fromEnv(init)();
  },
  async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
    const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
    if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) {
      throw new CredentialsProviderError("Skipping SSO provider in default chain (inputs do not include SSO fields).", { logger: init.logger });
    }
    const { fromSSO } = require_dist_cjs10();
    return fromSSO(init)(awsIdentityProperties);
  },
  async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
    const { fromIni } = require_dist_cjs15();
    return fromIni(init)(awsIdentityProperties);
  },
  async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
    const { fromProcess } = require_dist_cjs13();
    return fromProcess(init)(awsIdentityProperties);
  },
  async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
    const { fromTokenFile } = require_dist_cjs14();
    return fromTokenFile(init)(awsIdentityProperties);
  },
  async () => {
    init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::remoteProvider");
    return (await remoteProvider(init))();
  },
  async () => {
    throw new CredentialsProviderError("Could not load credentials from any providers", {
      tryNextLink: false,
      logger: init.logger
    });
  }
], credentialsTreatedAsExpired), credentialsWillNeedRefresh = (credentials) => credentials?.expiration !== undefined, credentialsTreatedAsExpired = (credentials) => credentials?.expiration !== undefined && credentials.expiration.getTime() - Date.now() < 300000, $credentialsTreatedAsExpired, $credentialsWillNeedRefresh, $defaultProvider;
var init_dist_cjs = __esm(() => {
  ({ ENV_KEY, ENV_SECRET, fromEnv } = require_dist_cjs4());
  ({ chain, CredentialsProviderError, ENV_PROFILE } = require_config());
  $credentialsTreatedAsExpired = credentialsTreatedAsExpired;
  $credentialsWillNeedRefresh = credentialsWillNeedRefresh;
  $defaultProvider = defaultProvider;
});
init_dist_cjs();

export {
  $defaultProvider as defaultProvider,
  $credentialsWillNeedRefresh as credentialsWillNeedRefresh,
  $credentialsTreatedAsExpired as credentialsTreatedAsExpired
};
export default {
  get defaultProvider() {
    return $defaultProvider;
  },
  get credentialsWillNeedRefresh() {
    return $credentialsWillNeedRefresh;
  },
  get credentialsTreatedAsExpired() {
    return $credentialsTreatedAsExpired;
  }
};
