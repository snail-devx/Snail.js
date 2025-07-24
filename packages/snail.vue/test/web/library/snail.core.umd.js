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
    function removeFromArray(array, item) {
      if (isArrayNotEmpty(array) == true) {
        const index = array.indexOf(item);
        index != -1 && array.splice(index, 1);
        return index;
      }
      return -1;
    }
    function moveFromArray(array, from, to) {
      if (isArrayNotEmpty(array) == true) {
        const items = array.splice(from, 1);
        items.length == 1 && array.splice(to, 0, items[0]);
      }
      return array;
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

    function buildResultByError(error, title) {
      console.error(title, error);
      const isEx = error instanceof Error;
      return {
        success: false,
        ex: isEx ? error : undefined,
        reason: isEx ? error.message : error
      };
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
      return new Promise(resolve => setTimeout(resolve, timeout, true));
    }
    function wait(task) {
      return isPromise(task) == false ? Promise.resolve({
        success: true,
        data: task
      }) : task.then(data => ({
        success: true,
        data
      }), reason => buildResultByError(reason, "wait task error."));
    }

    function run(func) {
      try {
        mustFunction(func, "func");
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        const data = func.apply(this, args);
        return {
          success: true,
          data
        };
      } catch (ex) {
        return buildResultByError(ex, "run func failed:");
      }
    }
    async function runAsync(func) {
      try {
        mustFunction(func, "func");
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        const data = await func.apply(this, args);
        return {
          success: true,
          data
        };
      } catch (ex) {
        return buildResultByError(ex, "async run func failed:");
      }
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

    const mountHandles = [];
    function mountScope(target) {
      throwIfFalse(typeof target === "object", "mountScope: target must be an Object.");
      var destroyed = false;
      const handles = [];
      const scope = Object.defineProperties(target, {
        destroyed: {
          enumerable: false,
          get: () => destroyed
        },
        onDestroy: {
          enumerable: false,
          writable: false,
          value: function (fn) {
            mustFunction(fn, "useScope.onDestroy: fn");
            destroyed ? run(fn) : handles.push(fn);
            return target;
          }
        },
        destroy: {
          enumerable: false,
          writable: false,
          value: function () {
            if (destroyed == false) {
              destroyed = true;
              handles.splice(0).forEach(run);
            }
          }
        }
      });
      mountHandles.forEach(fn => run(fn, scope));
      return scope;
    }
    function onMountScope(fn) {
      mustFunction(fn, 'onMountScope: fn');
      mountHandles.push(fn);
    }
    function useScope() {
      return mountScope(Object.create(null));
    }
    function useScopes() {
      const children = new Map();
      const scopes = Object.defineProperties(Object.create(null), {
        add: {
          enumerable: false,
          writable: false,
          value: function (child) {
            checkScope(scopes, "useScopes.add: scopes destroyed.");
            mustFunction((child || {}).destroy, "useScopes.add: child must be an instance of IScope.");
            checkScope(child, "useScopes.add: child destroyed.");
            if (children.has(child) == false) {
              children.set(child, true);
              child.onDestroy(() => scopes.remove(child));
            }
            return child;
          }
        },
        remove: {
          enumerable: false,
          writable: false,
          value: function (child) {
            scopes.destroyed || children.delete(child);
          }
        },
        get: {
          enumerable: false,
          writable: false,
          value: function () {
            checkScope(scopes, "useScopes.get: scopes destroyed.");
            return scopes.add(useScope());
          }
        }
      });
      mountScope(scopes).onDestroy(function () {
        const tmpScopes = [...children.keys()];
        children.clear();
        tmpScopes.forEach(scope => scope.destroy());
      });
      return scopes;
    }
    function useAsyncScope(task) {
      throwIfFalse(isPromise(task), "useAsyncScope: task must be a Promise.");
      const scope = mountScope(task);
      task.finally(scope.destroy);
      return scope;
    }
    const KEY_SCOPE_MAP = new Map();
    function useKeyScope(key, reuse) {
      var scope = KEY_SCOPE_MAP.get(key);
      var isNew = false;
      if (scope != undefined && reuse != true) {
        scope.destroy();
        scope = undefined;
      }
      if (scope == undefined) {
        scope = useScope().onDestroy(() => KEY_SCOPE_MAP.delete(key));
        isNew = true;
        KEY_SCOPE_MAP.set(key, scope);
      }
      return {
        scope,
        reuse: !isNew
      };
    }
    function checkScope(scope, message) {
      throwIfTrue(scope.destroyed, message);
      return true;
    }

    function useEvent() {
      const events = Object.create(null);
      function on(name, handle) {
        checkScope(manager, "on: event manager destroyed.");
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
        checkScope(manager, "once: event manager destroyed.");
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
        checkScope(manager, "once: event manager destroyed.");
        name = tidyString(name);
        if (hasOwnProperty(events, name) == true) {
          const handles = isFunction(handle) ? events[name].filter(func => func !== handle) : undefined;
          hasAny(handles) ? events[name] = handles : delete events[name];
        }
        return manager;
      }
      function trigger(name, data, sync) {
        checkScope(manager, "trigger: event manager destroyed.");
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
      const manager = mountScope({
        on,
        once,
        off,
        trigger
      });
      manager.onDestroy(() => Object.keys(events).forEach(key => delete events[key]));
      return Object.freeze(manager);
    }
    const event = useEvent();

    function useHook() {
      const hookMap = new Map();
      function register(code, fn) {
        checkScope(manager, "register: hook manager destroyed.");
        mustFunction(fn, "fn");
        hookMap.has(code) == false && hookMap.set(code, []);
        const hooks = hookMap.get(code);
        const index = hooks.push(fn) - 1;
        return useScope().onDestroy(() => hooks[index] = undefined);
      }
      function runHook(code, options) {
        if (manager.destroyed == true) {
          const rt = {
            success: false,
            reason: "runHook: hook manager destroyed."
          };
          return rt;
        }
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
        checkScope(manager, "runHookAsync: hook manager destroyed.");
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
        checkScope(manager, "remove: hook manager destroyed.");
        hookMap.delete(code);
      }
      function voteHooks(code, options) {
        let hooks = hookMap.get(code) || [];
        hooks.length && (hooks = hooks.filter(fn => fn != undefined));
        if (options && hooks.length > 1) {
          options.order == "desc" && (hooks = hooks.reverse());
          options.mode === "one" && (hooks = [hooks[0]]);
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
      const manager = mountScope({
        register,
        runHook,
        runHookAsync,
        remove
      });
      manager.onDestroy(() => hookMap.clear());
      return Object.freeze(manager);
    }

    function useTimer() {
      const scopes = useScopes();
      function onTimeout(fn, timeout) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        mustFunction(fn, 'onTimeout: fn');
        const scope = scopes.get();
        const id = setTimeout(() => {
          if (scope.destroyed == false) {
            run(fn, ...args);
            scope.destroy();
          }
        }, timeout);
        return scope.onDestroy(() => clearTimeout(id));
      }
      function onInterval(fn, timeout) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }
        mustFunction(fn, 'onInterval: fn');
        const scope = scopes.get();
        const id = setInterval(() => scope.destroyed || fn.apply(this, args), timeout);
        return scope.onDestroy(() => clearInterval(id));
      }
      const manger = mountScope({
        onTimeout,
        onInterval
      });
      manger.onDestroy(scopes.destroy);
      return Object.freeze(manger);
    }

    const DEFAULT_ServerType = "api";
    function useServer() {
      const servers = Object.create(null);
      function register(code, server) {
        checkScope(manager, "register: server manager destroyed.");
        mustString(code, "code");
        isObject(server) || throwError("server must be a json");
        servers[code] = Object.freeze({
          ...server
        });
        return manager;
      }
      function has(code) {
        checkScope(manager, "has: server manager destroyed.");
        return hasOwnProperty(servers, code);
      }
      function get(code) {
        checkScope(manager, "get: server manager destroyed.");
        return servers[code];
      }
      function getUrl(code, type) {
        checkScope(manager, "getUrl: server manager destroyed.");
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
      const manager = mountScope({
        register,
        has,
        get,
        getUrl,
        remove
      });
      manager.onDestroy(() => Object.keys(servers).forEach(remove));
      return Object.freeze(manager);
    }
    const server = useServer();

    const HTTP_CONFIG = {
      origin: undefined,
      contentType: undefined,
      accept: undefined
    };
    const HTTP_INTERCEPTORS = [];
    function checkHttpOptions(options) {
      options = extract(Object.keys(HTTP_CONFIG), options);
      hasOwnProperty(options, "origin") && (options.origin = tidyString(options.origin));
      hasOwnProperty(options, "contentType") && (options.contentType = tidyString(options.contentType));
      hasOwnProperty(options, "accept") && (options.accept = tidyString(options.accept));
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

    function useHttp(options) {
      options = Object.freeze(checkHttpOptions(options));
      const scopeInterceptors = [];
      function intercept(interceptor) {
        checkScope(hc, "intercept: http client destroyed.");
        interceptor = checkInterceptor(interceptor);
        scopeInterceptors.push(interceptor);
        return hc;
      }
      function send(request) {
        checkScope(hc, "send: http client destroyed.");
        const interceptors = [...HTTP_INTERCEPTORS, ...scopeInterceptors].filter(item => typeof item.match == "string" ? request.url.toLowerCase() == item.match : (item.match.lastIndex = 0, item.match.test(request.url)));
        request.origin = tidyString(request.origin) || options.origin || HTTP_CONFIG.origin;
        let requestPromise = undefined;
        for (var interceptor of interceptors) {
          requestPromise = runRequestInterceptor(request, interceptor);
          if (requestPromise) {
            break;
          }
        }
        if (requestPromise == undefined) {
          const defaultHeaders = {
            "accept": options.accept || HTTP_CONFIG.accept || "application/json, text/plain, */*",
            "content-type": options.contentType || HTTP_CONFIG.contentType || "application/json"
          };
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
      const hc = mountScope({
        intercept,
        send,
        get,
        post
      });
      hc.onDestroy(() => scopeInterceptors.splice(0));
      return Object.freeze(hc);
    }
    function useHttpByServer(code) {
      let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "api";
      let options = arguments.length > 2 ? arguments[2] : undefined;
      const origin = (server.get(code) || {})[type];
      return useHttp({
        ...options,
        origin
      });
    }
    function configHttp(options) {
      options = checkHttpOptions(options);
      Object.assign(HTTP_CONFIG, options);
    }
    function configHttpIntercept(interceptor) {
      interceptor = checkInterceptor(interceptor);
      HTTP_INTERCEPTORS.push(interceptor);
      return useScope().onDestroy(() => {
        const index = HTTP_INTERCEPTORS.indexOf(interceptor);
        index !== -1 && HTTP_INTERCEPTORS.splice(index, 1);
      });
    }

    function useUrl() {
      function isSite(url) {
        return isStringNotEmpty(url) ? /^[a-zA-z]+:\/\/[^\s]+$/.test(url) : false;
      }
      function isAbsolute(url) {
        return isStringNotEmpty(url) ? url.replace(/\\/g, '/')[0] == '/' : false;
      }
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
      function getOrigin(server) {
        try {
          const url = new URL(server);
          return url.origin;
        } catch (ex) {
          console.error(`getOrigin[${server}] throw an exception:${ex.message}`);
          return undefined;
        }
      }
      return Object.freeze({
        isSite,
        isAbsolute,
        format,
        parse,
        getOrigin
      });
    }
    const url = useUrl();

    const DEFAULT_VERSION = String(new Date().getTime());
    const VERSION_CONFIG = {
      query: undefined,
      version: undefined
    };
    function checkVersionOptions(options) {
      options = extract(Object.keys(VERSION_CONFIG), options);
      hasOwnProperty(options, "query") && (options.query = tidyString(options.query));
      hasOwnProperty(options, "version") && (options.version = tidyString(options.version));
      return options;
    }

    function useVersion(options) {
      options = Object.freeze(checkVersionOptions(options));
      const versionFiles = Object.create(null);
      function getVersion(needQuery) {
        checkScope(manager, "getVersion: manager destroyed.");
        const vv = options.version || VERSION_CONFIG.version || DEFAULT_VERSION;
        return needQuery ? `${options.query || VERSION_CONFIG.query || "_snv"}=${vv}` : vv;
      }
      function addFile(file, fileUrl) {
        checkScope(manager, "addFile: manager destroyed.");
        let upr = url.parse(file);
        throwIfUndefined(upr, "file must be a non-empty string.");
        mustString(fileUrl, "fileUrl");
        versionFiles[upr.file.toLowerCase()] = fileUrl;
        return manager;
      }
      function formart(file) {
        checkScope(manager, "formart: manager destroyed.");
        mustString(file, "file");
        let upr = url.parse(file);
        let vQuery = options.query || VERSION_CONFIG.query || "_snv";
        if (upr.queryMap.get(vQuery) !== null) {
          return file;
        }
        let target = versionFiles[upr.file.toLowerCase()];
        if (target === undefined) {
          upr.queryMap.append(vQuery, getVersion());
        } else {
          let tUpr = url.parse(target);
          upr.file = tUpr.file;
          upr.hash || (upr.hash = tUpr.hash);
          tUpr.queryMap.forEach((value, key) => {
            upr.queryMap.get(key) === null && upr.queryMap.append(key, value);
          });
        }
        return upr.hash ? `${upr.file}?${upr.queryMap}#${upr.hash}` : `${upr.file}?${upr.queryMap}`;
      }
      const manager = mountScope({
        getVersion,
        addFile,
        formart
      });
      manager.onDestroy(() => Object.keys(versionFiles).forEach(key => delete versionFiles[key]));
      return Object.freeze(manager);
    }
    function configVersion(options) {
      options = checkVersionOptions(options);
      Object.assign(VERSION_CONFIG, options);
      return version;
    }
    const version = useVersion();

    const SCRIPT_CONFIG = {
      origin: undefined,
      version: undefined
    };
    function checkScriptOptions(options) {
      options = extract(Object.keys(SCRIPT_CONFIG), options);
      hasOwnProperty(options, "origin") && (options.origin = tidyString(options.origin));
      return options;
    }
    function formScriptUrl(file, referUrl, defaultOrign) {
      let scriptUrl = undefined;
      {
        mustString(file, "file");
        referUrl = tidyString(referUrl);
        defaultOrign = tidyString(defaultOrign) || location.origin;
        const baseUrl = referUrl == undefined ? defaultOrign : url.isSite(referUrl) ? referUrl : url.isAbsolute(referUrl) ? defaultOrign.concat(referUrl) : undefined;
        scriptUrl = baseUrl ? new URL(file, baseUrl) : new URL(file);
      }
      const path = url.format(scriptUrl.pathname);
      throwIfTrue(path == "", `file[${path}]is invalid, it is empty after format`);
      return {
        id: scriptUrl.origin == defaultOrign ? scriptUrl.pathname.toLowerCase() : `${scriptUrl.origin}${scriptUrl.pathname}`.toLowerCase(),
        url: scriptUrl.href,
        exports: undefined
      };
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
    const HC = useHttp(undefined);
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

    function useScript(options) {
      options = Object.freeze(checkScriptOptions(options));
      const SCRIPTS = Object.create(null);
      const LOADTASKMAP = Object.create(null);
      function register() {
        checkScope(manager, "register: script manager destroyed.");
        const sfs = Object.create(null);
        const defaultOrign = options.origin || SCRIPT_CONFIG.origin;
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
        return useScope().onDestroy(() => destroyScript(sfs));
      }
      function has(id, referUrl) {
        checkScope(manager, "has: script manager destroyed.");
        return !!getScriptFile(id, referUrl).script;
      }
      async function load(id, loadOptions) {
        checkScope(manager, "load: script manager destroyed.");
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
          if (manager !== script && script.has(id, loadOptions.refer) == true) {
            return script.load(id, loadOptions);
          }
          file = formScriptUrl(id, loadOptions.refer, options.origin || SCRIPT_CONFIG.origin);
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
            const fileUrl = (options.version || SCRIPT_CONFIG.version || version).formart(file.url);
            loadTask = buildScriptByUrl(manager, fileUrl, {
              ids: [...loadOptions.ids, file.id],
              refer: file.url
            });
            LOADTASKMAP[file.id] = loadTask;
          }
          const exports = await loadTask;
          return drillScriptByHash(exports, hash);
        } catch (ex) {
          console.error(`load script[${file.id}] failed:`, ex);
          return Promise.reject(getMessage(ex, `load script[${file.id}] failed.`));
        }
      }
      async function loads(ids, loadOptions) {
        checkScope(manager, "loads: script manager destroyed.");
        return isArrayNotEmpty(ids) ? Promise.all(ids.map(id => load(id, loadOptions))) : Promise.reject("ids must be an array and cannot ben empty");
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
          const tmpId = formScriptUrl(id, referUrl, options.origin || SCRIPT_CONFIG.origin).id;
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
      const manager = mountScope({
        register,
        has,
        load,
        loads
      });
      manager.onDestroy(() => destroyScript(SCRIPTS));
      return Object.freeze(manager);
    }
    const script = useScript();
    function configScript(options) {
      options = checkScriptOptions(options);
      Object.assign(SCRIPT_CONFIG, options);
      return script;
    }

    exports.checkScope = checkScope;
    exports.configHttp = configHttp;
    exports.configHttpIntercept = configHttpIntercept;
    exports.configScript = configScript;
    exports.configVersion = configVersion;
    exports.debounce = debounce;
    exports.defer = defer;
    exports.delay = delay;
    exports.drill = drill;
    exports.event = event;
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
    exports.mountScope = mountScope;
    exports.moveFromArray = moveFromArray;
    exports.mustArray = mustArray;
    exports.mustFunction = mustFunction;
    exports.mustObject = mustObject;
    exports.mustString = mustString;
    exports.newId = newId;
    exports.onMountScope = onMountScope;
    exports.polling = polling;
    exports.removeFromArray = removeFromArray;
    exports.run = run;
    exports.runAsync = runAsync;
    exports.script = script;
    exports.server = server;
    exports.throttle = throttle;
    exports.throwError = throwError;
    exports.throwIfFalse = throwIfFalse;
    exports.throwIfNull = throwIfNull;
    exports.throwIfNullOrUndefined = throwIfNullOrUndefined;
    exports.throwIfTrue = throwIfTrue;
    exports.throwIfUndefined = throwIfUndefined;
    exports.tidyFunction = tidyFunction;
    exports.tidyString = tidyString;
    exports.url = url;
    exports.useAsyncScope = useAsyncScope;
    exports.useEvent = useEvent;
    exports.useHook = useHook;
    exports.useHttp = useHttp;
    exports.useHttpByServer = useHttpByServer;
    exports.useKeyScope = useKeyScope;
    exports.useScope = useScope;
    exports.useScopes = useScopes;
    exports.useScript = useScript;
    exports.useServer = useServer;
    exports.useTimer = useTimer;
    exports.useVersion = useVersion;
    exports.version = version;
    exports.wait = wait;

}));
