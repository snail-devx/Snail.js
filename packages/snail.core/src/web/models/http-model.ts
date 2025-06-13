import { IServerManager } from "./server-model";

/**
 * 接口：HTTP客户端；负责进行http请求发送和结果响应解析
 */
export interface IHttpClient {
    /**
     * 配置客户端HTTP拦截器
     * @param interceptor 
     * @returns Http请求客户端
     */
    intercept(interceptor: HttpInterceptor): IHttpClient;
    /**
     * 发送HTTP请求
     * @param request 请求消息对象
     * @returns 请求结果，基于响应content-type做转换
     */
    send<T>(request: HttpRequest): Promise<T>;
    /**
     * 发送HTTP.GET请求
     * @param url 请求url地址
     * @returns 请求结果，基于响应content-type做转换
     */
    get<T>(url: string): Promise<T>;
    /**
     * 发送HTTP.POST请求
     * @param url 请求url地址
     * @param data post提交数据
     * @returns 请求结果，基于响应content-type做转换
     */
    post<T, Data>(url: string, data?: Data): Promise<T>;
}

/**
 * HTTP客户端配置选项
 * - 如配置默认的header
 */
export type HttpOptions = {
    /**
     * 默认的服务器地址
     * - 优先级： scope -> global；
     * - 当 HttpRequest.origin未配置时，则使用此值
     * - HttpRequest和options都未指定origin时，则需要HttpRequest.url显式指定服务器地址
     */
    origin: string;
    /**
     * HTTP请求默认的content-type值
     * - 不传入默认  application/json;charset=utf-8
     */
    contentType: string;
    /**
     * HTTP请求头的Accept值
     * - 默认 application/json, text/plain, *\/\* 
    */
    accept: string;
}

/**
 * HTTP请求拦截器
 */
export type HttpInterceptor = {
    /**
     * 拦截规则，匹配请求url
     * - string时固定等值匹配，不区分大小写
     * - 正则表达式匹配，外部定制度较高，推荐
     */
    match: RegExp | string;

    /**
     * 进行HTTP请求时调用
     * @param request 请求对象
     * @returns 基于返回结果判断是否需要继续往下执行
     * - boolean值时：===false 中断执行，并触发reject
     * - promise时，中断http请求，此promise将作为回调结果；如从缓存直取数据
     * - 其他值，继续执行；不做任何处理
     */
    request?(request: HttpRequest): boolean | Promise<any>;

    /**
     * HTTP请求成功后调用
     * @param data 请求结果，基于响应content-type做转换
     * @param response 响应对象
     * @param request 请求对象
     * @returns 响应结果；取值可选
     * - any时，作为http请求响应结果数据
     * - Promise时，等待执行完成，内部修改是返回给调用方成功还是失败，并给出具体值
     */
    resolve?(data: any, response: HttpResponse<any>, request: HttpRequest): any | Promise<any>;

    /**
     * HTTP请求失败后调用
     * @param reason 失败原因
     * @param response 响应对象
     * @param request 请求对象
     * @returns 可选返回值如下：
     * - any时，作为http请求失败原因
     * - Promise时，等待执行完成，内部修改是返回给调用方成功还是失败，并给出具体值
     */
    reject?(reason: any, response: HttpResponse<any>, request: HttpRequest): any | Promise<any>;
}

/**
 * HTTP请求；描述请求url地址、header等信息
 */
export type HttpRequest = {
    /**
     * 请求url地址
     * - HttpRequest和options都未指定origin时，则需要url显式指定服务器地址
     */
    url: string;
    /**
     * 请求Method值，默认Get请求
     */
    method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
    /**
     * 请求发送数据
     * - 仅post时生效
     */
    data?: any;

    /**
     * 当前url请求服务器地址
     * - 不指定时，使用HttpOptions.origin值
     * - HttpRequest和options都未指定origin时，则需要HttpRequest.url显式指定服务器地址
     */
    origin?: string;

    /**
     * 请求头
     */
    headers?: { [keyof in string]: string };

    /**
     * 超时时间；单位ms
     * - 默认60000（1分钟）
     * - 为0时不设置超时时间
     */
    timeout?: number;
    /**
     * 是否保持练级
     */
    keepalive?: boolean;
}

/**
 * HTTP响应结果
 */
export type HttpResponse<T> = {
    /**
     * 请求响应结果数据
     * - 基于body和header分析出来的数据
     */
    data?: T;
    /**
     * 响应状态码
     */
    status: number;

    /**
     * 请求响应内容
     */
    body?: ReadableStream;
    /**
     * 响应头
     */
    headers?: Headers;
}
/**
 * HTTP响应错误
 */
export type HttpError = {
    /**
     * 错误类型
     */
    type: "interceptor" | "send" | "response";
    /**
     * 响应状态码
     */
    status: number;
    /**
     * 错误消息
     */
    message: string;

    /**
     * 错误异常
     */
    ex?: Error;

    /**
     * HTTP请求对象
     */
    request: HttpRequest;
}