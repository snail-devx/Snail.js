/**
 * 视图观察者
 *  
 * 注意事项：
 *  1、不提供全局【观察者】对象；这个涉到不少子scope的销毁，在全局挂着始终不好
 */
import { checkScope, IScope, IScopes, mountScope, mustFunction, mustString, run, throwIfFalse, useScope, useScopes } from "snail.core";
import { ElementSize, IObserver } from "../models/observer-model";

// 把自己的类型共享出去
export * from "../models/observer-model";

/**
 * 使用【观察者】
 * - 观察元素尺寸、位置变化
 * - 观察事件，scope销毁时自动清理事件监听
 * @returns 全新的【观察者】+作用域
 */
export function useObserver(): IObserver & IScope {
    /** 作用域组：管理【观察者】子作用域 */
    const scopes: IScopes = useScopes();

    //#region ************************************* 接口方法：IObserver具体实现 *************************************
    /**
     * 监听指定事件
     * - scope销毁时自动移除监听
     * - 内部使用addEventListener 方法监听事件，销毁时自动执行removeEventListener
     * @param target 监听元素
     * @param name 事件名称
     * @param fn 事件处理方法
     * @returns 作用域，可销毁监听
     */
    function onEvent(target: Element | Window, name: string, fn: (...args: any[]) => void): IScope {
        checkScope(manager, "onEvent: observer destroyed.");
        throwIfFalse(target instanceof Element || target === window, "onEvent: target must be a Element or Window")
        mustString(name, "onEvent: name");
        mustFunction(fn, "onEvent: fn");
        target.addEventListener(name, fn);
        return scopes.get().onDestroy(() => target.removeEventListener(name, fn));
    }

    /**
     * 监听元素尺寸变化
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    function onSize(el: Element, fn: (size: Readonly<ElementSize>) => void): IScope {
        checkScope(manager, "onSize: observer destroyed.");
        throwIfFalse(el instanceof Element, "onSize: el must be a Element.");
        const scope = scopes.get();
        //  计算元素的size值；优先ResizeObserver ，否则定时器100ms计算一次（requestAnimationFrame浪费性能）
        var preSize: Readonly<ElementSize> = undefined;
        function calcSize() {
            if (scope.destroyed == false) {
                const rect = el.getBoundingClientRect();
                const isChange: boolean = preSize == undefined
                    || preSize.width != rect.width || preSize.height != rect.height;
                if (isChange == true) {
                    preSize = Object.freeze({ width: rect.width, height: rect.height });
                    run(fn, preSize);
                }
            }
        }
        const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(calcSize) : undefined;
        const timer = resizeObserver ? resizeObserver.observe(el) : setInterval(calcSize, 100);
        setTimeout(calcSize);
        //  scope销毁时，移除监听
        return scope.onDestroy(() => {
            resizeObserver && resizeObserver.disconnect();
            timer && clearInterval(timer);
        });
    }

    /**
     * 监听元素客户端位置、大小变化
     * - 位置计算规则：相对window屏幕
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    function onClient(el: Element, fn: (rect: DOMRectReadOnly) => void): IScope {
        checkScope(manager, "onClient: observer destroyed.");
        throwIfFalse(el instanceof Element, "onClient: el must be a Element.");
        const scope = scopes.get();
        //  监听rect变化，并尝试自动销毁：使用requestAnimationFrame有点浪费性能，采用定时器100ms执行一次
        var preRect: DOMRectReadOnly = undefined;
        const timer = setInterval(function () {
            if (scope.destroyed == false) {
                const rect = el.getBoundingClientRect();
                const isChange: boolean = preRect == undefined
                    || rect.x != preRect.x || rect.y != preRect.y
                    || rect.width != preRect.width || rect.height != preRect.height;
                if (isChange == true) {
                    preRect = DOMRectReadOnly.fromRect(rect);
                    run(fn, preRect);
                }
            }
        }, 100);
        //  scope销毁时，移除监听
        return scope.onDestroy(() => clearInterval(timer));
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IObserver>({ onEvent, onSize, onClient });
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}