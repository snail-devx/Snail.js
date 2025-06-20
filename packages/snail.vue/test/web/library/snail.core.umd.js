(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Snail = {}));
})(this, (function (exports) { 'use strict';

    function getType(data) {
      return Object.prototype.toString.call(data);
    }
    function isNull(data) {
      return data === null;
    }
    function isUndefined(data) {
      return data === undefined;
    }
    function isNullOrUndefined(data) {
      return data === null || data === undefined;
    }
    function isObject(data) {
      return getType(data) == "[object Object]";
    }
    function isFunction(data) {
      const type = getType(data);
      return type == "[object Function]" || type == "[object AsyncFunction]";
    }
    function isArray(data) {
      return getType(data) == "[object Array]";
    }
    function isArrayNotEmpty(data) {
      return getType(data) == "[object Array]" && data.length > 0;
    }
    function isBoolean(data) {
      return getType(data) == "[object Boolean]";
    }
    function isNumber(data) {
      return getType(data) == "[object Number]";
    }
    function isNumberNotNaN(data) {
      return getType(data) == "[object Number]" && isNaN(data) == false;
    }
    function isString(data) {
      return getType(data) == "[object String]";
    }
    function isStringNotEmpty(data) {
      return getType(data) == "[object String]" && data.length > 0;
    }
    function isDate(data) {
      return getType(data) == "[object Date]";
    }
    function isRegexp(data) {
      return data instanceof RegExp;
    }
    function isPromise(data) {
      return getType(data) == "[object Promise]";
    }
    function isWindow(win) {
      return getType(win) == "[object Window]";
    }
    function isFalsey(data) {
      return data === null || data === undefined || data === false || data === "" || data === "0" || data === 0 || isNumber(data) && isNaN(data);
    }
    function hasOwnProperty(data, prop) {
      return data === null || data === undefined ? false : Object.prototype.hasOwnProperty.call(data, prop);
    }
    function hasAny(data) {
      return hasOwnProperty(data, "length") ? data.length > 0 : false;
    }
    function mustString(data, paramName) {
      if (isStringNotEmpty(data) == true) {
        return true;
      }
      throw new Error(`${paramName} must be a non-empty string.`);
    }
    function mustArray(data, paramName) {
      if (isArrayNotEmpty(data) == true) {
        return true;
      }
      throw new Error(`${paramName} must be a non-empty array.`);
    }
    function mustFunction(data, paramName) {
      if (isFunction(data) == true) {
        return true;
      }
      throw new Error(`${paramName} must be a function.`);
    }
    function mustObject(data, paramName) {
      if (isObject(data) == true) {
        return true;
      }
      throw new Error(`${paramName} must be an object.`);
    }
    function tidyString(str) {
      str = isString(str) ? str.trim() : undefined;
      return hasAny(str) ? str : undefined;
    }
    function tidyFunction(func) {
      return isFunction(func) ? func : undefined;
    }
    function newId() {
      var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16).toUpperCase();
      });
      return newId.toLowerCase().replace(/-/g, "");
    }
    function drill(data, paths) {
      if (isArrayNotEmpty(paths) == true) {
        for (let key of paths) {
          data = (data || {})[key];
          if (data == undefined) {
            break;
          }
        }
      }
      return data;
    }
    function extract(keys) {
      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }
      const ret = Object.create(null);
      isArrayNotEmpty(keys) && isArrayNotEmpty(sources) && keys.forEach(key => {
        for (const source of sources) {
          hasOwnProperty(source, key) && (ret[key] = source[key]);
        }
      });
      return ret;
    }

    function throwError(msg) {
      msg = isString(msg) == true ? msg : '';
      throw new Error(msg);
    }
    function throwIfTrue(bValue, msg) {
      bValue === true && throwError(msg);
    }
    function throwIfFalse(bValue, msg) {
      bValue === false && throwError(msg);
    }
    function throwIfUndefined(data, msg) {
      data === undefined && throwError(msg);
    }
    function throwIfNull(data, msg) {
      data === null && throwError(msg);
    }
    function throwIfNullOrUndefined(data, msg) {
      isNullOrUndefined(data) && throwError(msg);
    }
    function getMessage(error) {
      let preMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      const message = error instanceof Error ? error.message : typeof error == "string" ? error : JSON.stringify(error);
      return `${preMessage}${message}`;
    }

    function defer() {
      let onResolve = undefined,
        onReject = undefined;
      let promise = new Promise((resolve, reject) => {
        onResolve = resolve;
        onReject = reject;
      });
      return Object.freeze({
        promise,
        resolve: onResolve,
        reject: onReject
      });
    }
    function delay(timeout) {
      return new Promise(resolve => {
        setTimeout(resolve, timeout, true);
      });
    }
    function awaitX(obj) {
      return isPromise(obj) == false ? Promise.resolve({
        success: true,
        data: obj
      }) : new Promise((resolve, reject) => {
        obj.then(data => resolve({
          success: true,
          data: data
        }), reason => {
          const rt = {
            success: false,
            ex: reason instanceof Error ? reason : undefined,
            reason: getMessage(reason)
          };
          resolve(rt);
        });
      });
    }

    function run(func) {
      const ret = Object.create(null);
      try {
        mustFunction(func, "func");
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        ret.data = func.apply(this, args);
        ret.success = true;
      } catch (ex) {
        ret.success = false;
        ret.ex = ex;
        ret.reason = getMessage(ex);
      }
      return ret;
    }
    async function runAsync(func) {
      const ret = Object.create(null);
      try {
        mustFunction(func, "func");
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        ret.data = await func.apply(this, args);
        ret.success = true;
      } catch (ex) {
        ret.success = false;
        ret.ex = ex;
        ret.reason = getMessage(ex);
      }
      return ret;
    }
    function debounce(fn, delay) {
      let timer = undefined;
      return function () {
        timer && (clearTimeout(timer), timer = undefined);
        timer = setTimeout(() => {
          timer = undefined;
          fn.apply(this, arguments);
        }, delay, arguments);
      };
    }
    function throttle(fn, delay) {
      let last = 0;
      return function () {
        let now = Date.now();
        if (now - last >= delay) {
          last = now;
          fn.apply(this, arguments);
        }
      };
    }
    function polling(fn, check, interval, timeout) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 4 ? _len3 - 4 : 0), _key3 = 4; _key3 < _len3; _key3++) {
        args[_key3 - 4] = arguments[_key3];
      }
      mustFunction(fn, "fn") && mustFunction(check, "check");
      interval = (interval > 0 ? interval : 2) * 1000;
      timeout = timeout > 0 ? timeout * 1000 : 0;
      const deferred = defer();
      let isEnd = false;
      const thisContext = this;
      const runReject = reason => isEnd || (isEnd = true, deferred.reject(reason));
      const runCheck = data => {
        if (isEnd != true) {
          isEnd = check(data);
          isEnd ? deferred.resolve(data) : setTimeout(runFunc, interval);
        }
      };
      function runFunc() {
        try {
          const ret = fn.apply(thisContext, args);
          isPromise(ret) ? ret.then(runCheck, runReject) : runCheck(ret);
        } catch (ex) {
          console.trace("polling error:", ex);
          runReject(`polling error: ${getMessage(ex)}`);
        }
      }
      setTimeout(runFunc, 0);
      timeout > 0 && setTimeout(runReject, timeout, "polling timeout");
      deferred.promise.stop = () => runReject("polling stopped");
      return deferred.promise;
    }

    exports.event = void 0;
    (function (event) {
      const global = newScope();
      function newScope() {
        const events = Object.create(null);
        function on(name, handle) {
          mustString(name = tidyString(name), "name");
          mustFunction(handle, "handle");
          const handles = events[name] || [];
          if (handles.length == 0 || handles.indexOf(handle) == -1) {
            handles.push(handle);
            events[name] = handles;
          }
          return manager;
        }
        function once(name, handle) {
          const origin = handle;
          var hasCalled = false;
          handle = (sender, data) => {
            if (hasCalled === false) {
              hasCalled = true;
              manager.off(name, handle);
              origin(sender, data);
            }
          };
          on(name, handle);
          return manager;
        }
        function off(name, handle) {
          name = tidyString(name);
          if (hasOwnProperty(events, name) == true) {
            const handles = isFunction(handle) ? events[name].filter(func => func !== handle) : undefined;
            hasAny(handles) ? events[name] = handles : delete events[name];
          }
          return manager;
        }
        function trigger(name, data, sync) {
          mustString(name = tidyString(name), "name");
          const handles = events[name] || [];
          handles.length > 0 && (sync === true ? runHandles(name, handles, data) : setTimeout(runHandles, 0, name, handles, data));
          return manager;
        }
        function runHandles(name, handles, data) {
          var isStop;
          const sender = Object.freeze({
            id: newId(),
            type: name,
            data: data,
            stopPropagation: () => isStop = true
          });
          for (var handle of handles) {
            const rt = run(handle, data, sender);
            rt.ex && console.error("trigger error;", "evtName:", sender.type, ";ex:", rt.ex);
            if (isStop === true) {
              break;
            }
          }
        }
        const manager = Object.freeze({
          on,
          once,
          off,
          trigger
        });
        return manager;
      }
      event.newScope = newScope;
      function on(name, handle) {
        return global.on(name, handle);
      }
      event.on = on;
      function once(name, handle) {
        return global.once(name, handle);
      }
      event.once = once;
      function off(name, handle) {
        return global.off(name, handle);
      }
      event.off = off;
      function trigger(name, data, sync) {
        return global.trigger(name, data, sync);
      }
      event.trigger = trigger;
    })(exports.event || (exports.event = {}));

    exports.hook = void 0;
    (function (hook) {
      function newScope() {
        const hookMap = new Map();
        function register(code, fn) {
          mustFunction(fn, "fn");
          hookMap.has(code) == false && hookMap.set(code, []);
          const hooks = hookMap.get(code);
          const index = hooks.push(fn) - 1;
          return {
            destroy: () => hooks[index] = undefined
          };
        }
        function runHook(code, options) {
          console.log(`start to run hook function. code: ${code}`);
          const hooks = voteHooks(code, options);
          for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
          }
          for (let index = 0; index < hooks.length; index++) {
            const rt = run(hooks[index], ...args);
            const hRT = buildHookRunResult(rt, index);
            if (hRT != undefined) {
              return hRT;
            }
          }
          return {
            success: true
          };
        }
        async function runHookAsync(code, options) {
          console.log(`async start to run hook function. code: ${code}`);
          const hooks = voteHooks(code, options);
          for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            args[_key2 - 2] = arguments[_key2];
          }
          for (let index = 0; index < hooks.length; index++) {
            const rt = await runAsync(hooks[index], ...args);
            const hRT = buildHookRunResult(rt, index);
            if (hRT != undefined) {
              return hRT;
            }
          }
          return {
            success: true
          };
        }
        function remove(code) {
          hookMap.delete(code);
        }
        function destroy() {
          hookMap.clear();
        }
        function voteHooks(code, options) {
          let hooks = hookMap.get(code) || [];
          hooks.length && (hooks = hooks.filter(fn => fn != undefined));
          if (hooks.length > 1) {
            (options === null || options === void 0 ? void 0 : options.order) == "desc" && (hooks = hooks.reverse());
            (options === null || options === void 0 ? void 0 : options.mode) === "one" && (hooks = [hooks[0]]);
          }
          return hooks;
        }
        function buildHookRunResult(rt, index) {
          if (rt.success === false) {
            const reason = `interrupted: hook function[${index}] run failed. reason: ${rt.reason}`;
            console.error(reason, rt.ex);
            return {
              success: false,
              reason,
              ex: rt.ex
            };
          }
          if (rt.data === false) {
            const reason = `interrupted: hook function[${index}] return false.`;
            console.warn(reason);
            return {
              success: false,
              data: false,
              reason
            };
          }
          return undefined;
        }
        return Object.freeze({
          register,
          runHook,
          runHookAsync,
          remove,
          destroy
        });
      }
      hook.newScope = newScope;
    })(exports.hook || (exports.hook = {}));

    exports.http = void 0;
    (function (http) {
      const CONFIG = {
        origin: undefined,
        contentType: undefined,
        accept: undefined
      };
      const INTERCEPTORS = [];
      function create(options) {
        options = Object.freeze(checkHttpOptions(options));
        const scopeInterceptors = [];
        function intercept(interceptor) {
          interceptor = checkInterceptor(interceptor);
          scopeInterceptors.push(interceptor);
          return hc;
        }
        function send(request) {
          const interceptors = [...INTERCEPTORS, ...scopeInterceptors].filter(item => typeof item.match == "string" ? request.url.toLowerCase() == item.match : (item.match.lastIndex = 0, item.match.test(request.url)));
          let requestPromise = undefined;
          for (var interceptor of interceptors) {
            requestPromise = runRequestInterceptor(request, interceptor);
            if (requestPromise) {
              break;
            }
          }
          if (requestPromise == undefined) {
            const defaultHeaders = {
              "accept": options.accept || CONFIG.accept || "application/json, text/plain, */*",
              "content-type": options.contentType || CONFIG.contentType || "application/json"
            };
            request.origin = tidyString(request.origin) || options.origin || CONFIG.origin;
            requestPromise = runHttpRequest(request, defaultHeaders);
          }
          let response = undefined;
          let responsePromise = requestPromise.then(res => (response = res, res.data), reason => Promise.reject(reason));
          interceptors.forEach(interceptor => {
            responsePromise = responsePromise.then(data => runResponseInterceptor(data, response, request, interceptor, true), reason => runResponseInterceptor(reason, response, request, interceptor, false));
          });
          return responsePromise;
        }
        function get(url) {
          return send({
            url,
            method: "GET"
          });
        }
        function post(url, data) {
          return send({
            url,
            method: "POST",
            data
          });
        }
        const hc = Object.freeze({
          intercept,
          send,
          get,
          post
        });
        return hc;
      }
      http.create = create;
      function config(options) {
        options = checkHttpOptions(options);
        Object.assign(CONFIG, options);
      }
      http.config = config;
      function intercept(interceptor) {
        interceptor = checkInterceptor(interceptor);
        INTERCEPTORS.push(interceptor);
        return {
          destroy() {
            const index = INTERCEPTORS.indexOf(interceptor);
            index !== -1 && INTERCEPTORS.splice(index, 1);
          }
        };
      }
      http.intercept = intercept;
      function checkHttpOptions(options) {
        options = extract(Object.keys(CONFIG), options);
        options.origin = tidyString(options.origin);
        options.contentType = tidyString(options.contentType);
        options.accept = tidyString(options.accept);
        return options;
      }
      function checkInterceptor(interceptor) {
        isObject(interceptor) || (interceptor = undefined);
        throwIfUndefined(interceptor, "interceptor must be an Object,like {match,request,resolve,reject}");
        interceptor.match = isStringNotEmpty(interceptor.match) ? String(interceptor.match).toLowerCase() : isRegexp(interceptor.match) ? interceptor.match : undefined;
        throwIfUndefined(interceptor.match, "interceptor.match must be a RegExp or not empty string");
        interceptor.request = isFunction(interceptor.request) ? interceptor.request : undefined;
        interceptor.resolve = isFunction(interceptor.resolve) ? interceptor.resolve : undefined;
        interceptor.reject = isFunction(interceptor.reject) ? interceptor.reject : undefined;
        interceptor = {
          match: interceptor.match,
          request: interceptor.request,
          resolve: interceptor.resolve,
          reject: interceptor.reject
        };
        return Object.freeze(interceptor);
      }
      function runHttpRequest(request, defaultHeaders) {
        const deferred = defer();
        const headers = new Headers();
        try {
          request.url = tidyString(request.url);
          mustString(request.url, "request.url");
          request.method = tidyString(request.method) || "GET";
          throwIfTrue(["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].indexOf(request.method.toUpperCase()) == -1, `not support request.method value[${request.method}]`);
          request.timeout = request.timeout >= 0 ? request.timeout : 60 * 1000;
          if (isObject(request.headers) == true) {
            for (var key in request.headers) {
              hasOwnProperty(request.headers, key) && headers.has(key) == false && headers.append(key, request.headers[key]);
            }
          }
          tryInitRequestHeaders(headers, request.headers);
          tryInitRequestHeaders(headers, defaultHeaders);
          request.keepalive && headers.set("connection", "keep-alive");
        } catch (ex) {
          const message = `formatRequest error:${ex.message}`;
          deferred.reject({
            type: "send",
            status: -200,
            message,
            ex,
            request
          });
          return deferred.promise;
        }
        const controller = request.timeout > 0 ? new AbortController() : undefined;
        const timeoutId = controller ? setTimeout(() => controller.abort(), request.timeout) : undefined;
        const fOptions = {
          headers,
          keepalive: request.keepalive === true,
          method: request.method,
          mode: "cors",
          referrerPolicy: "strict-origin-when-cross-origin",
          signal: controller ? controller.signal : undefined
        };
        if (isNullOrUndefined(request.data) == false) {
          const contentType = headers.get("content-type");
          if (/application\/json/i.test(contentType) == true) {
            fOptions.body = JSON.stringify(request.data);
          } else if (/application\/x\-www\-form\-urlencoded/i.test(contentType) == true) {
            fOptions.body = typeof request.data === "object" && String(request.data) !== "[object File]" ? buildFormSubmitData(request.data) : request.data;
          } else {
            fOptions.body = request.data;
          }
        }
        let requetUrl = undefined;
        try {
          requetUrl = request.origin ? new URL(request.url, request.origin) : new URL(request.url);
        } catch (ex) {
          const message = `request url is invalid.url:${request.url},orign:${request.origin}`;
          deferred.reject({
            type: "send",
            status: -200,
            message,
            ex,
            request
          });
          return deferred.promise;
        }
        fetch(requetUrl, fOptions).then(hr => {
          if (hr.ok === false) {
            const message = `response status is not ok:${hr.status} ${hr.statusText}`;
            return deferred.reject({
              type: "response",
              status: hr.status,
              message,
              request
            });
          }
          const contentType = hr.headers.get("content-type");
          const resolve = data => {
            deferred.resolve({
              data,
              status: hr.status,
              body: hr.body,
              headers: hr.headers
            });
          };
          if (/application\/json/i.test(contentType) == true) {
            hr.json().then(resolve);
          } else if (isTextResponse(contentType)) {
            hr.text().then(resolve);
          } else {
            resolve(hr.body);
          }
        }, reason => {
          const message = reason && reason.name == "AbortError" ? "request is timeout" : `fetch error.${reason}`;
          deferred.reject({
            type: "response",
            status: -200,
            message,
            request
          });
        }).finally(() => timeoutId !== undefined && clearTimeout(timeoutId));
        return deferred.promise;
      }
      function tryInitRequestHeaders(headers, obj) {
        if (isObject(obj) == true) {
          for (const key in obj) {
            hasOwnProperty(obj, key) && headers.has(key) == false && headers.append(key, obj[key]);
          }
        }
      }
      function buildFormSubmitData(data) {
        var query = '',
          name,
          value,
          fullSubName,
          subName,
          subValue,
          innerObj,
          i,
          sbuquery;
        for (name in data) {
          if (name.toLowerCase() == "$$hashkey") {
            continue;
          }
          value = data[name];
          if (value instanceof Date) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value.toUTCString()) + '&';
          } else if (value instanceof Array) {
            for (i = 0; i < value.length; ++i) {
              subValue = value[i];
              fullSubName = name + '[' + i + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              sbuquery = buildFormSubmitData(innerObj);
              if (sbuquery !== undefined && sbuquery !== null && sbuquery !== '') {
                query += sbuquery + '&';
              }
            }
          } else if (value instanceof Object) {
            for (subName in value) {
              if (subName.toLowerCase() === "$$hashkey") {
                continue;
              }
              subValue = value[subName];
              fullSubName = name + '[' + subName + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              sbuquery = buildFormSubmitData(innerObj);
              if (sbuquery !== undefined && sbuquery !== null && sbuquery !== '') {
                query += sbuquery + '&';
              }
            }
          } else if (value !== undefined && value !== null) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
          }
        }
        return query.length ? query.substring(0, query.length - 1) : query;
      }
      function isTextResponse(contentType) {
        return /text\/*/i.test(contentType) || /application\/javascript/.test(contentType);
      }
      function runRequestInterceptor(request, interceptor) {
        var promise = undefined;
        if (interceptor.request) {
          try {
            const ret = interceptor.request(request);
            if (isPromise(ret) == true) {
              promise = ret.then(data => Promise.resolve({
                data,
                status: 200
              }), reason => buildInterceptReject(request, interceptor, `request intercepted with reject.${reason}`));
            } else if (ret === false) {
              promise = buildInterceptReject(request, interceptor, "request intercepted with false");
            }
          } catch (ex) {
            promise = buildInterceptReject(request, interceptor, `request intercepted with error.${ex.message}`, ex);
          }
        }
        return promise;
      }
      function runResponseInterceptor(data, response, request, interceptor, isResolve) {
        try {
          const func = isResolve ? interceptor.resolve : interceptor.reject;
          func && (data = func(data, response, request));
          isPromise(data) || (data = isResolve ? Promise.resolve(data) : Promise.reject(data));
          return data;
        } catch (ex) {
          return buildInterceptReject(request, interceptor, `response intercepted with error.${ex.message}`, ex);
        }
      }
      function buildInterceptReject(request, interceptor, message, ex) {
        const reason = {
          type: "interceptor",
          status: -200,
          request,
          match: String(interceptor.match),
          message: !ex ? message : `${message}:${ex.message}`,
          ex
        };
        return Promise.reject(reason);
      }
    })(exports.http || (exports.http = {}));

    exports.url = void 0;
    (function (url_1) {
      function isSite(url) {
        return isStringNotEmpty(url) ? /^[a-zA-z]+:\/\/[^\s]+$/.test(url) : false;
      }
      url_1.isSite = isSite;
      function isAbsolute(url) {
        return isStringNotEmpty(url) ? url.replace(/\\/g, '/')[0] == '/' : false;
      }
      url_1.isAbsolute = isAbsolute;
      function format(url) {
        if (isStringNotEmpty(url) == false) {
          return undefined;
        }
        let origin = undefined;
        if (isSite(url) == true) {
          const tmpUrl = new URL(url);
          origin = tmpUrl.origin;
          url = `${tmpUrl.pathname}${tmpUrl.search}${tmpUrl.hash}`;
        }
        url = url.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/+$/, '');
        return origin ? `${origin}${url}` : url;
      }
      url_1.format = format;
      function parse(url) {
        if (isStringNotEmpty(url)) {
          var hash = undefined;
          var [file, query] = url.split('?', 2);
          query ? [query, hash] = query.split('#', 2) : [file, hash] = file.split('#', 2);
          file = format(file) || file;
          return {
            file,
            query,
            queryMap: new URLSearchParams(query),
            hash
          };
        }
        return undefined;
      }
      url_1.parse = parse;
      function getOrigin(server) {
        try {
          const url = new URL(server);
          return url.origin;
        } catch (ex) {
          console.error(`getOrigin[${server}] throw an exception:${ex.message}`);
          return undefined;
        }
      }
      url_1.getOrigin = getOrigin;
    })(exports.url || (exports.url = {}));

    exports.version = void 0;
    (function (version) {
      const DEFAULT_VERSION = String(new Date().getTime());
      const CONFIG = {
        query: undefined,
        version: undefined
      };
      const global = newScope();
      function newScope(options) {
        options = Object.freeze(checkVersionOptions(options));
        const versionFiles = Object.create(null);
        function getVersion(needQuery) {
          const vv = options.version || CONFIG.version || DEFAULT_VERSION;
          return needQuery ? `${options.query || CONFIG.query || "_snv"}=${vv}` : vv;
        }
        function addFile(file, fileUrl) {
          let upr = exports.url.parse(file);
          throwIfUndefined(upr, "file must be a non-empty string.");
          mustString(fileUrl, "fileUrl");
          versionFiles[upr.file.toLowerCase()] = fileUrl;
          return manager;
        }
        function formart(file) {
          mustString(file, "file");
          let upr = exports.url.parse(file);
          let vQuery = options.query || CONFIG.query || "_snv";
          if (upr.queryMap.get(vQuery) !== null) {
            return file;
          }
          let target = versionFiles[upr.file.toLowerCase()];
          if (target === undefined) {
            upr.queryMap.append(vQuery, getVersion());
          } else {
            let tUpr = exports.url.parse(target);
            upr.file = tUpr.file;
            upr.hash || (upr.hash = tUpr.hash);
            tUpr.queryMap.forEach((value, key) => {
              upr.queryMap.get(key) === null && upr.queryMap.append(key, value);
            });
          }
          return upr.hash ? `${upr.file}?${upr.queryMap}#${upr.hash}` : `${upr.file}?${upr.queryMap}`;
        }
        const manager = Object.freeze({
          config,
          getVersion,
          addFile,
          formart
        });
        return manager;
      }
      version.newScope = newScope;
      function config(options) {
        options = checkVersionOptions(options);
        Object.assign(CONFIG, options);
        return global;
      }
      version.config = config;
      function getVersion(needQuery) {
        return global.getVersion(needQuery);
      }
      version.getVersion = getVersion;
      function addFile(file, url) {
        return global.addFile(file, url);
      }
      version.addFile = addFile;
      function formart(url) {
        return global.formart(url);
      }
      version.formart = formart;
      function checkVersionOptions(options) {
        options = extract(Object.keys(CONFIG), options);
        options.query = tidyString(options.query);
        options.version = tidyString(options.version);
        return options;
      }
    })(exports.version || (exports.version = {}));

    exports.script = void 0;
    (function (script) {
      const CONFIG = {
        origin: undefined,
        version: undefined
      };
      const HC = exports.http.create(undefined);
      const global = newScope(undefined);
      function newScope(options) {
        options = Object.freeze(checkScriptOptions(options));
        const SCRIPTS = Object.create(null);
        const LOADTASKMAP = Object.create(null);
        function register() {
          const sfs = Object.create(null);
          const defaultOrign = options.origin || CONFIG.origin;
          for (var _len = arguments.length, files = new Array(_len), _key = 0; _key < _len; _key++) {
            files[_key] = arguments[_key];
          }
          isArrayNotEmpty(files) && files.forEach(file => {
            throwIfNullOrUndefined(file, "file is invalid in files:null or undefined");
            let sf = undefined;
            if (typeof file == "string") {
              sf = formScriptUrl(file, undefined, defaultOrign);
            } else {
              sf = file.exports !== undefined ? Object.assign({}, file) : formScriptUrl(file.url, undefined, defaultOrign);
              sf.id = tidyString(file.id) || sf.id;
            }
            mustString(sf.id, "sf.id");
            throwIfTrue(hasOwnProperty(SCRIPTS, sf.id), `files[${sf.id}] has been registered`);
            sf = Object.freeze(sf);
            SCRIPTS[sf.id] = sf;
            sfs[sf.id] = sf;
          });
          return {
            destroy: () => destroyScript(sfs)
          };
        }
        function has(id, referUrl) {
          return !!getScriptFile(id, referUrl).script;
        }
        async function load(id, loadOptions) {
          isObject(loadOptions) || (loadOptions = {
            ids: [],
            refer: undefined
          });
          isArray(loadOptions.ids) || (loadOptions.ids = []);
          let {
            script: file,
            hash
          } = getScriptFile(id, loadOptions.refer);
          if (file === undefined) {
            if (manager !== global && global.has(id, loadOptions.refer) == true) {
              return global.load(id, loadOptions);
            }
            file = formScriptUrl(id, loadOptions.refer, options.origin || CONFIG.origin);
            SCRIPTS[file.id] = file;
          }
          if (file.exports !== undefined) {
            return drillScriptByHash(file.exports, hash);
          }
          if (loadOptions.ids.indexOf(file.id) != -1) {
            const message = getMessage(loadOptions.ids.concat(file.id), `dead loop load script[${file.id}].`);
            return Promise.reject(message);
          }
          try {
            let loadTask = LOADTASKMAP[file.id];
            if (loadTask === undefined) {
              const fileUrl = (options.version || CONFIG.version || exports.version).formart(file.url);
              loadTask = buildScriptByUrl(manager, fileUrl, {
                ids: [...loadOptions.ids, file.id],
                refer: file.url
              });
              LOADTASKMAP[file.id] = loadTask;
            }
            const exports$1 = await loadTask;
            return drillScriptByHash(exports$1, hash);
          } catch (ex) {
            console.error(`load script[${file.id}] failed:`, ex);
            return Promise.reject(getMessage(ex, `load script[${file.id}] failed.`));
          }
        }
        function loads(ids, loadOptions) {
          return isArrayNotEmpty(ids) ? Promise.all(ids.map(id => load(id, loadOptions))) : Promise.reject("ids must be an array and cannot ben empty");
        }
        function destroy() {
          destroyScript(SCRIPTS);
        }
        function getScriptFile(id, referUrl) {
          let hash = undefined;
          if (isStringNotEmpty(id) == true) {
            const index = id.indexOf('#');
            if (index != -1) {
              hash = id.substring(index);
              id = id.substring(0, index);
            }
          }
          mustString(id = tidyString(id), "id");
          let sf = SCRIPTS[id];
          if (!sf) {
            const tmpId = formScriptUrl(id, referUrl, options.origin || CONFIG.origin).id;
            sf = SCRIPTS[tmpId];
            sf && (id = tmpId);
          }
          return {
            script: sf,
            id,
            hash
          };
        }
        function destroyScript(files) {
          Object.keys(files).forEach(key => {
            delete SCRIPTS[key];
            delete LOADTASKMAP[key];
          });
        }
        const manager = Object.freeze({
          register,
          has,
          load,
          loads,
          destroy
        });
        return manager;
      }
      script.newScope = newScope;
      function config(options) {
        options = checkScriptOptions(options);
        Object.assign(CONFIG, options);
        return global;
      }
      script.config = config;
      function register() {
        return global.register(...arguments);
      }
      script.register = register;
      function has(id) {
        return global.has(id);
      }
      script.has = has;
      function load(id) {
        return global.load(id);
      }
      script.load = load;
      function loads(ids) {
        return global.loads(ids);
      }
      script.loads = loads;
      function checkScriptOptions(options) {
        options = extract(Object.keys(CONFIG), options);
        options.origin = tidyString(options.origin);
        return options;
      }
      function formScriptUrl(file, referUrl, defaultOrign) {
        let scriptUrl = undefined;
        {
          mustString(file, "file");
          referUrl = tidyString(referUrl);
          defaultOrign = tidyString(defaultOrign) || location.origin;
          const baseUrl = referUrl == undefined ? defaultOrign : exports.url.isSite(referUrl) ? referUrl : exports.url.isAbsolute(referUrl) ? defaultOrign.concat(referUrl) : undefined;
          scriptUrl = baseUrl ? new URL(file, baseUrl) : new URL(file);
        }
        const path = exports.url.format(scriptUrl.pathname);
        throwIfTrue(path == "", `file[${path}]is invalid, it is empty after format`);
        return {
          id: scriptUrl.origin == defaultOrign ? scriptUrl.pathname.toLowerCase() : `${scriptUrl.origin}${scriptUrl.pathname}`.toLowerCase(),
          url: scriptUrl.href,
          exports: undefined
        };
      }
      async function buildScriptByUrl(manager, fileUrl, loadOptions) {
        const deferred = defer();
        let amdTask = undefined;
        const globalThis = Object.create(null);
        const exports = Object.create(null);
        const globalArgs = Object.create(null);
        {
          globalArgs.globalThis = globalThis;
          globalArgs.global = globalThis;
          globalArgs.self = globalThis;
          globalArgs.window = globalThis;
          globalArgs.exports = exports;
          globalArgs.module = undefined;
          globalArgs.require = function () {
            const message = getMessage(arguments, "require function is not supported,try to amd define.args:");
            deferred.reject(message);
          };
          globalArgs.define = function () {
            const id = tidyString(arguments[arguments.length - 3]);
            const deps = arguments[arguments.length - 2] || undefined;
            const factory = arguments[arguments.length - 1] || undefined;
            id && console.warn(`define does not support id[${id}] argument,will ignore it`, {
              id,
              deps,
              factory
            });
            mustFunction(factory, "define arguments 'factory'");
            let hasExportsDep = false;
            const depTasks = (typeof deps == "string" ? [deps] : deps || []).map(dep => dep === "exports" ? (hasExportsDep = true, Promise.resolve(exports)) : manager.load(dep, loadOptions));
            if (depTasks.length == 0) {
              let frt = factory.apply(globalThis);
              amdTask = Promise.resolve(frt);
            } else {
              amdTask = Promise.all(depTasks).then(data => {
                let frt = factory.apply(globalThis, data);
                return hasExportsDep ? exports : frt;
              }, reason => Promise.reject(reason));
            }
          };
          globalArgs.define.amd = "snail.script";
        }
        try {
          const text = await HC.get(fileUrl);
          const funcRet = new Function(...Object.keys(globalArgs), `'use strict';${text || ""}`).apply(globalThis, Object.values(globalArgs));
          amdTask == undefined ? deferred.resolve(isNullOrUndefined(funcRet) ? globalThis[Object.keys(globalThis)[0]] : funcRet) : amdTask.then(deferred.resolve, deferred.reject);
        } catch (ex) {
          console.error("buildScriptByUrl build script error", ex);
          deferred.reject(getMessage(ex, "buildScriptByUrl build script error:"));
        }
        return deferred.promise;
      }
      function drillScriptByHash(exports, hash) {
        const hashes = (hash || "").split('#').map(item => item.trim()).filter(item => item !== "");
        if (hashes.length > 0) {
          const ret = Object.create(null);
          hashes.forEach(item => ret[item] = drill(exports, item.split(".")));
          return hashes.length == 1 ? ret[Object.keys(ret)[0]] : ret;
        }
        return exports;
      }
    })(exports.script || (exports.script = {}));

    exports.server = void 0;
    (function (server_1) {
      var DEFAULT_ServerType = "api";
      function newScope() {
        const servers = Object.create(null);
        function register(code, server) {
          mustString(code, "code");
          isObject(server) || throwError("server must be a json");
          servers[code] = Object.freeze({
            ...server
          });
          return manager;
        }
        function has(code) {
          return hasOwnProperty(servers, code);
        }
        function get(code) {
          return servers[code];
        }
        function getUrl(code, type) {
          const server = servers[code];
          throwIfNullOrUndefined(server, `the server[${code}] is not registered`);
          type = type || DEFAULT_ServerType;
          const url = server[type];
          isStringNotEmpty(url) || throwError(`the server[${code}] has not this type[${type}] server address`);
          return url;
        }
        function remove(code) {
          delete servers[code];
          return manager;
        }
        const manager = Object.freeze({
          register,
          has,
          get,
          getUrl,
          remove
        });
        return manager;
      }
      server_1.newScope = newScope;
      const global = newScope();
      function register(code, server) {
        return global.register(code, server);
      }
      server_1.register = register;
      function has(code) {
        return global.has(code);
      }
      server_1.has = has;
      function get(code) {
        return global.get(code);
      }
      server_1.get = get;
      function getUrl(code, type) {
        return global.getUrl(code, type);
      }
      server_1.getUrl = getUrl;
      function remove(code) {
        return global.remove(code);
      }
      server_1.remove = remove;
    })(exports.server || (exports.server = {}));

    exports.style = void 0;
    (function (style_1) {
      const CONFIG = {
        theme: undefined,
        container: undefined,
        origin: undefined,
        version: undefined
      };
      const EVENT_ChangeTheme = "Snail.Style.ChangeTheme";
      const global = newScope();
      function newScope(options) {
        options = Object.freeze(checkStyoleOptions(options));
        var scopeTheme = undefined;
        const scopeStyles = [];
        function register() {
          const funcStyles = [];
          for (var _len = arguments.length, files = new Array(_len), _key = 0; _key < _len; _key++) {
            files[_key] = arguments[_key];
          }
          isArrayNotEmpty(files) && files.forEach(file => {
            let href = typeof file == "string" ? file : file.file;
            mustString(href, "href");
            const theme = typeof file == "string" ? undefined : file.theme || undefined;
            let tmpStr = options.origin || CONFIG.origin;
            isStringNotEmpty(tmpStr) && (href = new URL(href, tmpStr).toString());
            tmpStr = href.toLowerCase();
            let styleEle = scopeStyles.find(s => s.theme == theme && s.file.toLowerCase() == tmpStr);
            if (!styleEle) {
              styleEle = {
                file: href,
                theme,
                ref: 0
              };
              scopeStyles.push(styleEle);
            }
            styleEle.ref += 1;
            funcStyles.push(styleEle);
            if (!styleEle.element) {
              styleEle.element = document.createElement("link");
              styleEle.element.href = (options.version || CONFIG.version || exports.version).formart(styleEle.file);
              styleEle.element.rel = "stylesheet";
              styleEle.element.disabled = true;
              theme && styleEle.element.setAttribute("data-theme", theme);
              let container = options.container || CONFIG.container || document.getElementById("snail_style_container");
              if (!container) {
                container = document.createElement("div");
                container.id = "snail_style_container";
                container.style.display = "none !important";
                container.style.height = "0px";
                container.style.width = "0px";
                document.body.appendChild(container);
              }
              container.appendChild(styleEle.element);
            }
            styleEle.element.setAttribute("data-ref", styleEle.ref.toString());
          });
          funcStyles.length > 0 && setStyleByTheme(funcStyles, scopeTheme);
          return {
            destroy: () => funcStyles.length > 0 && destroyStyle(funcStyles, false)
          };
        }
        function theme(code) {
          mustString(code, "code");
          scopeTheme != code && setStyleByTheme(scopeStyles, scopeTheme = code);
          return manager;
        }
        function destroy() {
          exports.event.off(EVENT_ChangeTheme, theme);
          destroyStyle(scopeStyles, true);
        }
        function setStyleByTheme(styles, code) {
          let hasMatchTheme = false;
          styles.forEach(style => {
            code && style.theme == code && (hasMatchTheme = true);
            style.element.disabled = style.ref == 0 || style.theme != undefined && style.theme != code;
          });
          let defaultTheme = hasMatchTheme ? undefined : options.theme || CONFIG.theme;
          defaultTheme && styles.forEach(style => {
            style.theme == defaultTheme && (style.element.disabled = style.ref == 0);
          });
        }
        function destroyStyle(styles, isDel) {
          styles.forEach(style => {
            style.ref = isDel ? 0 : Math.max(0, style.ref - 1);
            style.element.setAttribute("data-ref", style.ref.toString());
            style.element.disabled = style.ref == 0;
            if (isDel == true) {
              style.element.parentNode && style.element.parentNode.removeChild(style.element);
              style.element = undefined;
            }
          });
          styles.splice(0);
        }
        exports.event.on(EVENT_ChangeTheme, theme);
        const manager = Object.freeze({
          config,
          register,
          theme,
          destroy
        });
        return manager;
      }
      style_1.newScope = newScope;
      function config(options) {
        options = checkStyoleOptions(options);
        Object.assign(CONFIG, options);
        return global;
      }
      style_1.config = config;
      function register() {
        return global.register(...arguments);
      }
      style_1.register = register;
      function theme(code) {
        global.theme(code);
        exports.event.trigger(EVENT_ChangeTheme, code, true);
        return global;
      }
      style_1.theme = theme;
      function destroy() {
        global.destroy();
      }
      style_1.destroy = destroy;
      function checkStyoleOptions(options) {
        options = extract(Object.keys(CONFIG), options);
        options.theme = tidyString(options.theme);
        options.origin = tidyString(options.origin);
        return options;
      }
    })(exports.style || (exports.style = {}));

    exports.awaitX = awaitX;
    exports.debounce = debounce;
    exports.defer = defer;
    exports.delay = delay;
    exports.drill = drill;
    exports.extract = extract;
    exports.getMessage = getMessage;
    exports.getType = getType;
    exports.hasAny = hasAny;
    exports.hasOwnProperty = hasOwnProperty;
    exports.isArray = isArray;
    exports.isArrayNotEmpty = isArrayNotEmpty;
    exports.isBoolean = isBoolean;
    exports.isDate = isDate;
    exports.isFalsey = isFalsey;
    exports.isFunction = isFunction;
    exports.isNull = isNull;
    exports.isNullOrUndefined = isNullOrUndefined;
    exports.isNumber = isNumber;
    exports.isNumberNotNaN = isNumberNotNaN;
    exports.isObject = isObject;
    exports.isPromise = isPromise;
    exports.isRegexp = isRegexp;
    exports.isString = isString;
    exports.isStringNotEmpty = isStringNotEmpty;
    exports.isUndefined = isUndefined;
    exports.isWindow = isWindow;
    exports.mustArray = mustArray;
    exports.mustFunction = mustFunction;
    exports.mustObject = mustObject;
    exports.mustString = mustString;
    exports.newId = newId;
    exports.polling = polling;
    exports.run = run;
    exports.runAsync = runAsync;
    exports.throttle = throttle;
    exports.throwError = throwError;
    exports.throwIfFalse = throwIfFalse;
    exports.throwIfNull = throwIfNull;
    exports.throwIfNullOrUndefined = throwIfNullOrUndefined;
    exports.throwIfTrue = throwIfTrue;
    exports.throwIfUndefined = throwIfUndefined;
    exports.tidyFunction = tidyFunction;
    exports.tidyString = tidyString;

}));
