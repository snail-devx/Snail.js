import { mustFunction, isFunction, isPromise } from "./data";
import { getMessage } from "./error";
import { RunResult } from "./models/function-model";
import { AsyncResult, defer } from "./promise";
import { buildResultByError } from "./utils/function-util";

/** 把自己的类型共享出去 */
export * from "./models/function-model"

/**
 * 运行执行方法；内部自动拦截异常
 * @param func 要运行的方法
 * @param args 运行func时所需参数
 * @returns 运行结果
 */
export function run<T>(func: (...args: any[]) => T, ...args: any[]): RunResult<T> {
    try {
        mustFunction(func, "func");
        // @ts-ignore
        const data = func.apply(this, args);
        return { success: true, data };
    }
    catch (ex: any) {
        return buildResultByError(ex, "run func failed:");
    }
}
/**
 * 运行异步方法
 * @param func 要运行的异步方法
 * @param args 运行func时所需参数
 * @returns 运行结果
 */
export async function runAsync<T>(func: (...args: any[]) => Promise<T> | T, ...args: any[]): Promise<RunResult<T>> {
    try {
        mustFunction(func, "func");
        // @ts-ignore
        const data = await func.apply(this, args);
        return { success: true, data };
    }
    catch (ex: any) {
        return buildResultByError<T>(ex, "async run func failed:");
    }
}

/**
 * 防抖函数：在规定时间后执行fn方法；如果在这delay毫秒内再次执行了，则重新计时
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
            timer = undefined;
            //  @ts-ignore
            fn.apply(this, arguments);
        }, delay, arguments);
    }
}
/**
 * 节流函数：在规定时间内只执行一次fn方法；在delay毫秒内函数被多次触发，只有一次会真正调用执行，其余的会被忽略
 * @param fn 要执行的函数方法
 * @param delay 延迟时间（单位毫秒）
 * @returns 包装后的方法
 */
export function throttle(fn: Function, delay: number): (...args: any[]) => void {
    let last = 0;
    return function () {
        let now = Date.now();
        if (now - last >= delay) {
            last = now;
            //  @ts-ignore
            fn.apply(this, arguments);
        }

    }
}

/**
 * 轮询函数：定时轮询执行fn方法，直到check检测通过，或者执行报错、超时
 * @param fn 要轮询的方法
 * @param check 方法结果检测，是否成功，若返回false则继续轮询
 * @param interval 轮询间隔时间，单位s；<=0 则强制2s
 * @param timeout 轮询超时时间，单位s；超时强制停止轮训，<=0 不停止，始终等待
 * @param args 轮询方法时传递参数
 * @returns 轮询方法执行结果,可通过stop方法终止轮询
 */
export function polling<T>(fn: (...args: any[]) => T | Promise<T> | undefined, check: (data: T | undefined) => boolean, interval: number, timeout: number, ...args: any[])
    : AsyncResult<T> {
    //  准备工作：数据验证，变量定义
    mustFunction(fn, "fn") && mustFunction(check, "check");
    interval = (interval > 0 ? interval : 2) * 1000;
    timeout = timeout > 0 ? (timeout * 1000) : 0;
    const deferred = defer<T>();
    let isEnd: boolean = false;
    //      @ts-ignore 记录 上下文参数 
    const thisContext = this;
    //  轮询方法定义
    /**     停止执行时的操作 */
    const runReject = (reason: any) => isEnd || (isEnd = true, deferred.reject(reason));
    /**     执行check方法 */
    const runCheck = (data: T | undefined) => {
        if (isEnd != true) {
            isEnd = check(data);
            isEnd ? deferred.resolve(data) : setTimeout(runFunc, interval);
        }
    }
    /**     执行轮询：若为异步，则需要等待结果 */
    function runFunc(): void {
        try {
            const ret = fn.apply(thisContext, args);
            isPromise(ret)
                ? (ret as Promise<T>).then(runCheck, runReject)
                : runCheck(ret as T);
        }
        catch (ex: any) {
            console.trace("polling error:", ex);
            runReject(`polling error: ${getMessage(ex)}`);
        }
    }
    //  执行轮询；强制超时；返回等待promise，并挂载stop方法
    setTimeout(runFunc, 0);
    timeout > 0 && setTimeout(runReject, timeout, "polling timeout");
    // @ts-ignore
    deferred.promise.stop = () => runReject("polling stopped");
    return deferred.promise as AsyncResult<T>;
}