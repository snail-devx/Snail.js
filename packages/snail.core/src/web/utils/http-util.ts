/**
 * Http助手类
 *  1、仅限 http.ts 使用，将其部分静态方法移动到此
 */
import { mustString, extract, hasOwnProperty, tidyString } from "../../base/data";
import { isFunction, isNullOrUndefined, isObject, isPromise, isRegexp, isStringNotEmpty } from "../../base/data";
import { throwIfTrue, throwIfUndefined } from "../../base/error";
import { defer } from "../../base/promise";
import { HttpOptions, HttpInterceptor, HttpRequest, HttpResponse, HttpError } from "../models/http-model";

//#region ************************************* HTTP配置 *************************************
/** 全局HTTP请求配置 */
export const HTTP_CONFIG: HttpOptions = { origin: undefined, contentType: undefined, accept: undefined };
/** 全局HTTP请求拦截器 */
export const HTTP_INTERCEPTORS: HttpInterceptor[] = [];

/**
 * 检查HTTP请求配置参数
 * @param options 
 * @returns 校验后的配置参数
 */
export function checkHttpOptions(options: Partial<HttpOptions>): HttpOptions {
    //  仅提取指定key数据，避免外部传入object无效key影响
    options = extract<HttpOptions>(Object.keys(HTTP_CONFIG), options);
    //  清理无效数据：仅传入时才生效
    hasOwnProperty(options, "origin") && (options.origin = tidyString(options.origin));
    hasOwnProperty(options, "contentType") && (options.contentType = tidyString(options.contentType));
    hasOwnProperty(options, "accept") && (options.accept = tidyString(options.accept));

    return options as HttpOptions;
}
//#endregion

//#region ************************************* 拦截相关 *************************************
/**
 * 验证拦截器；验证不通过报错
 * @param interceptor 
 * @returns 新的拦截器对象；和传入拦截器脱离，避免外部修改影响内部逻辑
 */
export function checkInterceptor(interceptor: HttpInterceptor): HttpInterceptor {
    isObject(interceptor) || (interceptor = undefined);
    throwIfUndefined(interceptor, "interceptor must be an Object,like {match,request,resolve,reject}");
    interceptor.match = isStringNotEmpty(interceptor.match)
        ? String(interceptor.match).toLowerCase()
        : isRegexp(interceptor.match) ? interceptor.match : undefined;
    throwIfUndefined(interceptor.match, "interceptor.match must be a RegExp or not empty string");
    //  request、resolve、reject；可以同时为空，不判断，为空就是不生效即可
    interceptor.request = isFunction(interceptor.request) ? interceptor.request : undefined;
    interceptor.resolve = isFunction(interceptor.resolve) ? interceptor.resolve : undefined;
    interceptor.reject = isFunction(interceptor.reject) ? interceptor.reject : undefined;
    // throwIfTrue(
    //     !interceptor.request && !interceptor.resolve && !interceptor.reject,
    //     "interceptor.request/resolve/reject cannot be not function at the same time"
    // )
    //  冻结并返回，避免外部修改影响
    interceptor = {
        match: interceptor.match,
        request: interceptor.request,
        resolve: interceptor.resolve,
        reject: interceptor.reject
    };
    return Object.freeze(interceptor);
}

/**
 * 执行指定的请求拦截器
 * @param request 
 * @param interceptor 
 * @returns 
 */
export function runRequestInterceptor<T>(request: HttpRequest, interceptor: HttpInterceptor): Promise<HttpResponse<T>> | undefined {
    var promise: Promise<HttpResponse<T>> = undefined;
    if (interceptor.request) {
        try {
            const ret = interceptor.request(request);
            //  返回值为promise，则等待promise结果作为响应结果数据
            if (isPromise(ret) == true) {
                promise = (ret as Promise<T>).then(
                    data => Promise.resolve<HttpResponse<T>>({ data, status: 200 }),
                    reason => buildInterceptReject(request, interceptor, `request intercepted with reject.${reason}`)
                );
            }
            //  返回值为false，则强制中断执行
            else if (ret === false) {
                promise = buildInterceptReject(request, interceptor, "request intercepted with false");
            }
        }
        catch (ex: any) {
            //@ts-ignore
            promise = buildInterceptReject(request, interceptor, `request intercepted with error.${ex.message}`, ex);
        }
    }
    return promise;
}
/**
 * 执行指定的响应拦截器
 * @param data 
 * @param response 
 * @param request 
 * @param interceptor 
 * @param isResolve 是resolve，还是reject
 * @returns 新的promise
 */
export function runResponseInterceptor<T>(data: any, response: HttpResponse<T>, request: HttpRequest, interceptor: HttpInterceptor, isResolve: boolean): Promise<T> {
    try {
        const func = isResolve ? interceptor.resolve : interceptor.reject;
        func && (data = func(data, response, request));
        isPromise(data) || (data = isResolve ? Promise.resolve(data) : Promise.reject(data));
        return data;
    }
    catch (ex: any) {
        //  @ts-ignore
        return buildInterceptReject(request, interceptor, `response intercepted with error.${ex.message}`, ex);
    }
}
/**
 * 构建拦截器的失败promise对象
 * @param request       http请求对象
 * @param interceptor   http拦截器
 * @param message       失败消息
 * @param ex            ex异常对象
 * @returns promise
 */
function buildInterceptReject(request: HttpRequest, interceptor: HttpInterceptor, message: string, ex?: Error): Promise<HttpError> {
    const reason: HttpError & { match: string } = {
        type: "interceptor",
        status: -200,
        request,
        match: String(interceptor.match),
        message: !ex ? message : `${message}:${ex.message}`,
        ex
    }
    return Promise.reject<HttpError>(reason);
}
//#endregion

//#region ************************************* 请求发送 *************************************
/**
 * 执行HTTP请求
 * @param request 
 * @param defaultHeaders 默认的header配置
 * @param controller 停止控制器，完成超时时间设置
 * @returns 
 */
export function runHttpRequest<T>(request: HttpRequest, defaultHeaders: Record<string, string>): Promise<HttpResponse<T>> {
    const deferred = defer<HttpResponse<T>>();
    //  1、验证并格式化request
    const headers: Headers = new Headers();
    try {
        //  格式化url：先不format，传入siteUrl会有问题
        request.url = tidyString(request.url);
        mustString(request.url, "request.url");
        // request.url = url.format(request.url);
        // @ts-ignore 格式化method
        request.method = tidyString(request.method) || "GET";
        throwIfTrue(
            ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].indexOf(request.method.toUpperCase()) == -1,
            `not support request.method value[${request.method}]`
        )
        //  超时时间：默认1分钟；传入0，不超时
        request.timeout = request.timeout >= 0 ? request.timeout : 60 * 1000;
        //  请求头headers：强制做默认处理
        if (isObject(request.headers) == true) {
            for (var key in request.headers) {
                hasOwnProperty(request.headers, key)
                    && headers.has(key) == false && headers.append(key, request.headers[key]);
            }
        }
        tryInitRequestHeaders(headers, request.headers);
        tryInitRequestHeaders(headers, defaultHeaders);
        request.keepalive && headers.set("connection", "keep-alive");
    }
    catch (ex: any) {
        const message: string = `formatRequest error:${ex.message}`;
        deferred.reject<HttpError>({ type: "send", status: -200, message, ex, request })
        return deferred.promise;
    }
    //      超时处理
    const controller: AbortController = request.timeout > 0 ? new AbortController() : undefined;
    const timeoutId: NodeJS.Timeout = controller
        ? setTimeout(() => controller.abort(), request.timeout)
        : undefined;
    //  2、构建fetch请求相关信息 RequestInit信息，
    const fOptions: RequestInit = {
        headers,
        keepalive: request.keepalive === true,
        method: request.method,
        mode: "cors",
        /** 默认不发送源 */
        // referrerPolicy: "no-referrer",
        referrerPolicy: "strict-origin-when-cross-origin",
        /** 超时信号 */
        signal: controller ? controller.signal : undefined
    }
    //      body格式化：json和form做处理，其他的原样写入
    if (isNullOrUndefined(request.data) == false) {
        const contentType: string = headers.get("content-type");
        if (/application\/json/i.test(contentType) == true) {
            fOptions.body = JSON.stringify(request.data);
        }
        else if (/application\/x\-www\-form\-urlencoded/i.test(contentType) == true) {
            fOptions.body = typeof request.data === "object" && String(request.data) !== "[object File]"
                ? buildFormSubmitData(request.data)
                : request.data;
        }
        else {
            fOptions.body = request.data;
        }
    }
    //      组装请求url地址；若orign没传，且url不带有请求头，则会报错
    let requetUrl: URL = undefined;
    try {
        requetUrl = request.origin ? new URL(request.url, request.origin) : new URL(request.url);
    }
    catch (ex: any) {
        const message: string = `request url is invalid.url:${request.url},orign:${request.origin}`;
        deferred.reject<HttpError>({ type: "send", status: -200, message, ex, request });
        return deferred.promise;
    }
    //  3、发送fetch；解析响应结果
    fetch(requetUrl, fOptions).then(
        hr => {
            //  状态码非ok，判定为失败
            if (hr.ok === false) {
                const message = `response status is not ok:${hr.status} ${hr.statusText}`;
                return deferred.reject<HttpError>({ type: "response", status: hr.status, message, request });
            }
            //  解析返回结果：基于响应结果类型分析；后期做成字典映射，if太多
            /*  json格式->text->body：json、text的promise常规来回不会报错
                除非response的content-type和body值不匹配；但目前来说没有
                */
            const contentType = hr.headers.get("content-type");
            const resolve = (data: any) => {
                deferred.resolve({ data, status: hr.status, body: hr.body, headers: hr.headers });
            }
            if (/application\/json/i.test(contentType) == true) {
                hr.json().then(resolve);
            }
            else if (isTextResponse(contentType)) {
                hr.text().then(resolve);
            }
            else {
                resolve(hr.body);
            }
        },
        reason => {
            //  AbortError 超时时 controller.abort 方法抛出的错误，特殊处理
            const message = reason && reason.name == "AbortError"
                ? "request is timeout"
                : `fetch error.${reason}`;
            deferred.reject<HttpError>({ type: "response", status: -200, message, request });
        }
    ).finally(() => timeoutId !== undefined && clearTimeout(timeoutId));
    return deferred.promise;
}
/**
 * 尝试初始化请求头部
 * - 将obj中的key在headers中不存在是，追加到headers中
 * @param headers 
 * @param obj 
 */
function tryInitRequestHeaders(headers: Headers, obj: object): void {
    if (isObject(obj) == true) {
        for (const key in obj) {
            hasOwnProperty(obj, key)
                && headers.has(key) == false
                && headers.append(key, obj[key]);
        }
    }
}
/**
 * 构建HTTP请求的form格式提交数据
 * @param data 
 * @returns 
 */
function buildFormSubmitData(data: any): string {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i, sbuquery;
    for (name in data) {
        //  过滤到AngularJS对象中的 $$hashkey
        if (name.toLowerCase() == "$$hashkey") {
            continue;
        }
        //  进行数据类型分发做序列化
        value = data[name];
        //      日期类型
        if (value instanceof Date) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value.toUTCString()) + '&';
        }
        //      数组：遍历每个子元素
        else if (value instanceof Array) {
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
        }
        //      JSON Object对象；遍历每个Key值
        else if (value instanceof Object) {
            for (subName in value) {
                //  过滤到AngularJS对象中的 $$hashkey
                if (subName.toLowerCase() === "$$hashkey") {
                    continue;
                }
                //  取值进行递归分析做序列化
                subValue = value[subName];
                fullSubName = name + '[' + subName + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                sbuquery = buildFormSubmitData(innerObj);
                if (sbuquery !== undefined && sbuquery !== null && sbuquery !== '') {
                    query += sbuquery + '&';
                }
            }
        }
        //      其他值，如number、string等，直接序列化自身
        else if (value !== undefined && value !== null) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
    }
    //  去掉最后一个&连接符
    return query.length ? query.substring(0, query.length - 1) : query;
}
/**
 * 是否是text文本响应
 * @param contentType 
 * @returns true 文本响应，执行.text
 */
function isTextResponse(contentType: string): boolean {
    //  text/*算是text；application/javascript js文件响应，也算作text
    return /text\/*/i.test(contentType)
        || /application\/javascript/.test(contentType);
}
//#endregion
