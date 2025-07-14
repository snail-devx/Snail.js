import { tidyString } from "../base/data";
import { checkScope, IScope, mountScope, useScope } from "../base/scope";
import { HttpOptions, HttpInterceptor, IHttpClient, HttpRequest, HttpResponse } from "./models/http-model";
import { server, ServerOptions } from "./server";
import {
    HTTP_CONFIG, HTTP_INTERCEPTORS,
    checkInterceptor, runRequestInterceptor, runResponseInterceptor,
    runHttpRequest,
    checkHttpOptions,
} from "./utils/http-util";

// 把自己的类型共享出去
export * from "./models/http-model";

/**
 * 使用【Http客户端】
 * @param options HTTP配置选项
 * @returns 全新的【HTTP客户端】+作用域
 */
export function useHttp(options?: Partial<HttpOptions>): IHttpClient & IScope {
    options = Object.freeze(checkHttpOptions(options));
    /** HTTP客户端实例拦截器 */
    const scopeInterceptors: HttpInterceptor[] = [];

    //#region ************************************* 接口方法：IHttpClient具体实现 *************************************
    /**
     * 配置客户端HTTP拦截器
     * @param interceptor 
     * @returns Http请求客户端
     */
    function intercept(interceptor: HttpInterceptor): IHttpClient {
        checkScope(hc, "intercept: http client destroyed.");
        interceptor = checkInterceptor(interceptor);
        scopeInterceptors.push(interceptor);
        return hc;
    }

    /**
     * 发送Http请求
     * @param request 请求消息对象
     * @returns 请求结果，基于响应content-type做转换
     */
    function send<T>(request: HttpRequest): Promise<T> {
        checkScope(hc, "send: http client destroyed.");
        //  正则匹配，若外部加了g，则可能存在全局缓存；得清理lastIndex
        const interceptors: HttpInterceptor[] = [...HTTP_INTERCEPTORS, ...scopeInterceptors]
            .filter(item => typeof (item.match) == "string"
                ? request.url.toLowerCase() == item.match
                : (item.match.lastIndex = 0, item.match.test(request.url))
            );
        //  1、执行HTTP请求：运行请求拦截器，若拦截成功则不用执行实际的http请求了
        request.origin = tidyString(request.origin) || options.origin || HTTP_CONFIG.origin;
        let requestPromise: Promise<HttpResponse<T>> = undefined;
        for (var interceptor of interceptors) {
            requestPromise = runRequestInterceptor(request, interceptor);
            if (requestPromise) {
                break;
            }
        }
        if (requestPromise == undefined) {
            const defaultHeaders: Record<string, string> = {
                "accept": options.accept || HTTP_CONFIG.accept || "application/json, text/plain, */*",
                "content-type": options.contentType || HTTP_CONFIG.contentType || "application/json",
            }
            requestPromise = runHttpRequest(request, defaultHeaders);
        }
        //  2、分析结果返回；然后分发执行resolve和reject
        let response: HttpResponse<T> = undefined;
        let responsePromise: Promise<T> = requestPromise.then(
            res => (response = res, res.data),
            reason => Promise.reject(reason)
        )
        interceptors.forEach(interceptor => {
            responsePromise = responsePromise.then(
                data => runResponseInterceptor(data, response, request, interceptor, true),
                reason => runResponseInterceptor(reason, response, request, interceptor, false)
            );
        });
        return responsePromise;
    }
    /**
     * 发送HTTP.GET请求
     * @param url 请求url地址
     * @returns 请求结果，基于响应content-type做转换
     */
    function get<T>(url: string): Promise<T> {
        return send<T>({ url, method: "GET" });
    }
    /**
     * 发送HTTP.POST请求
     * @param url 请求url地址
     * @param data post提交数据
     * @returns 请求结果，基于响应content-type做转换
     */
    function post<T, Data>(url: string, data?: Data): Promise<T> {
        return send<T>({ url, method: "POST", data })
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const hc = mountScope<IHttpClient>({ intercept, send, get, post });
    hc.onDestroy(() => scopeInterceptors.splice(0));
    return Object.freeze(hc);
}
/**
 * 使用【Http客户端】
 * - 基于服务器配置创建HTTP请求客户端
 * @param code 服务器编码
 * @param type 服务器类型
 * @param options HTTP配置选项
 * @returns 全新的【HTTP客户端】+作用域
 */
/* v8 ignore next 4 不用测试，拼接的功能 */
export function useHttpByServer(code: string, type: keyof ServerOptions = "api", options?: Omit<Partial<HttpOptions>, "origin">): IHttpClient & IScope {
    const origin = (server.get(code) || {})[type];
    return useHttp({ ...options, origin });
}
/**
 * HTTP全局配置
 * @param options 
 */
export function configHttp(options: Partial<HttpOptions>): void {
    options = checkHttpOptions(options);
    Object.assign(HTTP_CONFIG, options);
}
/**
 * 配置HTTP全局拦截器
 * @param interceptor 拦截器对象
 * @returns 拦截器句柄，可根据需要销毁此拦截器
 */
export function configHttpIntercept(interceptor: HttpInterceptor): IScope {
    interceptor = checkInterceptor(interceptor);
    HTTP_INTERCEPTORS.push(interceptor);
    return useScope().onDestroy(() => {
        const index = HTTP_INTERCEPTORS.indexOf(interceptor);
        index !== -1 && HTTP_INTERCEPTORS.splice(index, 1);
    });
}