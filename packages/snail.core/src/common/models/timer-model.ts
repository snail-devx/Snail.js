import { IScope } from "./scope-model";

/**
 * 定时器接口
 */
export interface ITimer {
    /**
     * 执行timeout操作
     * - 内部使用 setTimeout实现
     * - 操作执行完成后自动销毁【作用域】
     * @param fn 要执行的方法
     * @param timeout 延迟时间，单位ms
     * @param args fn方法执行时传递参数
     * @returns 作用域，支持销毁定时器
     */
    onTimeout(fn: (...args: any[]) => void, timeout?: number, ...args: any[]): IScope;
    /**
     * 执行interval操作
     * - 内部使用 setInterval 实现
     * @param fn 要执行的方法
     * @param timeout 定时轮询时间，单位ms
     * @param args fn方法执行时传递参数
     * @returns 作用域，支持销毁定时器
     */
    onInterval(fn: (...args: any[]) => void, timeout?: number, ...args: any[]): IScope;
}