/**
 * 定时器相关助手类
 * 注意事项：
 *  1、不提供全局【定时器】对象；这个涉到不少子scope的销毁，在全局挂着始终不好
 *  2、还没有补充单元测试、、、
 */

import { isArrayNotEmpty, isStringNotEmpty, mustFunction } from "./data";
import { run } from "./function";
import { ITimer } from "./models/timer-model";
import { IScope, IScopes, mountScope, useScopes } from "./scope";

/** 把自己的类型共享出去 */
export * from "./models/timer-model"

/**
 * 使用【定时器】
 * - 定时器销毁时，自动销毁内部清理setTimeou、setInterval
 * 
 * @returns 全新的【定时器】实例
 */
export function useTimer(): ITimer & IScope {

    //#region *************************************实现接口：ITimer接口方法*************************************
    /**
    * 执行timeout操作
    * - 内部使用 setTimeout实现
    * - 操作执行完成后自动销毁【作用域】
    * @param fn 要执行的方法
    * @param timeout 延迟时间，单位ms
    * @param args fn方法执行时传递参数
    * @returns 作用域，支持销毁定时器
    */
    function onTimeout(fn: (...args: any[]) => void, timeout?: number, ...args: any[]): IScope {
        mustFunction(fn, 'onTimeout: fn');
        const scope: IScope = scopes.get();
        const id = setTimeout(() => {
            if (scope.destroyed == false) {
                run(fn, ...args);
                scope.destroy();
            }
        }, timeout);
        return scope.onDestroy(() => clearTimeout(id));
    }
    /**
     * 执行interval操作
     * - 内部使用 setInterval 实现
     * @param fn 要执行的方法
     * @param timeout 定时轮询时间，单位ms
     * @param args fn方法执行时传递参数
     * @returns 作用域，支持销毁定时器
     */
    function onInterval(fn: (...args: any[]) => void, timeout?: number, ...args: any[]): IScope {
        mustFunction(fn, 'onInterval: fn');
        const scope: IScope = scopes.get();
        // @ts-ignore
        const id = setInterval(() => scope.destroyed || fn.apply(this, args), timeout);
        return scope.onDestroy(() => clearInterval(id));
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manger = mountScope<ITimer>({ onTimeout, onInterval }, "ITimer");
    const scopes: IScopes = useScopes();
    manger.onDestroy(scopes.destroy);
    return Object.freeze(manger);
}