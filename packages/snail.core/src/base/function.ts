/**
 * 函数模块：针对js方法的相关封装
 */

import { ensureFunction, isFunction, isPromise } from "./data";
import { RunResult } from "./models/function";
import { defer } from "./promise";

/**
 * 运行执行方法；内部自动拦截异常
 * @param func 要运行的方法
 * @param args 运行func时所需参数
 * @returns 运行结果
 */
export function run<T>(func: (...args: any[]) => T, ...args: any[]): RunResult<T> {
    const ret: RunResult<T> = Object.create(null);
    try {
        ensureFunction(func, "func");
        // @ts-ignore
        ret.data = func.apply(this, args);
        ret.success = true;
    }
    catch (ex: any) {
        ret.success = false;
        ret.ex = ex;
        ret.reason = ex.message;
    }
    return ret;
}
/**
 * 运行异步方法
 * @param func 要运行的异步方法
 * @param args 运行func时所需参数
 * @returns 运行结果
 */
export function runAsync<T>(func: (...args: any[]) => Promise<T> | T, ...args: any[]): Promise<RunResult<T>> {
    const ret: RunResult<T | Promise<T>> = run(func, ...args);
    const deferred = defer<RunResult<T>>();
    if (isPromise(ret.data) == true) {
        (ret.data as Promise<T>).then(
            function (data) {
                ret.success = true;
                ret.data = data;
                deferred.resolve(ret as RunResult<T>);
            },
            function (reason) {
                delete ret.data;
                ret.success = false;
                ret.reason = reason;
                deferred.resolve(ret as RunResult<T>);
            }
        );
    }
    else {
        deferred.resolve(ret as RunResult<T>);
    }
    return deferred.promise;
};

/**
 * 防抖函数：指定延迟时间仅执行最新一次触发
 * @param fn 要执行的函数方法
 * @param delay 延迟时间
 * @returns 包装后的方法
 */
export function debounce(fn: Function, delay: number): (...args: any[]) => void {
    // 定时器
    let timer: any = undefined;
    // 将debounce处理结果当作函数返回
    return function () {
        // 每次事件被触发时，都去清除之前的旧定时器，再构建新的定时器
        timer && (clearTimeout(timer), timer = undefined);
        timer = setTimeout(() => {
            //  @ts-ignore
            fn.apply(this, arguments)
            timer = undefined;
        }, delay, arguments);
    }
}
/**
 * 轮询方法：直到方法检测通过，或者执行报错、超时
 * @param fn 要轮询的方法，返回promise对象
 * @param check 方法结果检测，是否成功，若返回false则继续轮询
 * @param interval 轮询间隔时间，单位s；<=0 则强制5s
 * @param timeout 轮询超时时间，单位s；超时强制停止轮训，<=0 不停止，始终等待
 * @param args 轮询方法时传递参数
 * @returns Promise
 */
export function polling<T>(fn: (...args: any[]) => Promise<T> | T, check: (data: T) => boolean, interval: number, timeout: number, ...args: any[]): Promise<T> {
    //  准备工作：数据验证，变量定义
    ensureFunction(fn, "fn") && ensureFunction(check, "check");
    interval = (interval > 0 ? interval : 5) * 1000;
    timeout = timeout > 0 ? (timeout * 1000) : 0;
    const deferred = defer<T>();
    let isEnd: boolean = false;
    //  @ts-ignore
    const thisContext = this;
    //  执行方法：检测通过则不用再执行，否则一直不停轮询
    const runFunc = () => {
        const ret = fn.apply(thisContext, args);
        if (isPromise(ret) == true) {
            (ret as Promise<T>).then(
                data => {
                    isEnd = check(data) == true;
                    isEnd ? deferred.resolve(data) : setTimeout(runFunc, interval);
                },
                error => (isEnd = true, deferred.reject(error))
            )
        }
        else {
            isEnd = check(ret as T) == true;
            isEnd ? deferred.resolve(ret as T) : setTimeout(runFunc, interval);
        }
    }
    //  立马执行（超时则强制终止），并返回promise
    setTimeout(runFunc, 0);
    timeout > 0 && setTimeout(
        () => {
            if (isEnd != true) {
                isEnd = true;
                deferred.reject("超时时间已到，强制停止");
            }
        },
        timeout
    );
    return deferred.promise;
}