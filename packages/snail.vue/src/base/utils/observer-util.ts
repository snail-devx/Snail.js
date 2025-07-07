
/**
 * 监视器 模块：封装便捷方法做监听，并在不支持浏览器下做垫片
 * - 和 VueUse 库很像，但只封装自己需要的
 * - 内部变量不使用响应式，那样外部需要 传入el时内部需要兼容useTemplateRef逻辑，这个交给外部处理更灵活
 * - ResizeObserver 监听元素大小变化
 */
import { mustFunction, mustString, throwIfFalse, IScope } from "snail.core";
import { getCurrentScope, onScopeDispose } from "vue";

/**
 * 监听vue的Scope销毁
 * -在vue的setup中调用，否则监听失败
 * - 暂不对外提供
 * @param fn 销毁时的回调方法
 * @returns  监听成功返回true；否则false
 */
function tryOnScopeDispose(fn: () => void) {
    if (getCurrentScope()) {
        onScopeDispose(fn)
        return true
    }
    return false
}

/**
 * 使用作用域
 * - 内部管理多个子作用域，在destroy时自动执行子作用域的destroy方法
 * - 在vue的setup中使用时，vue组件销毁时，自动销毁作用域
 * @returns 销毁方法，add 添加子作用域
 */
export function useScopes(): IScope & { add: (scope: IScope) => void } {
    const scopes: IScope[] = [];
    const destroy = () => scopes.forEach(scope => scope.destroy());
    tryOnScopeDispose(destroy);
    return {
        add: scope => mustFunction((scope || {}).destroy, "add: scope.destroy") && scopes.push(scope),
        destroy,
    }
}

/**
 * 监听Interval执行
 * - 内部使用 setInterval 实现
 * @param fn 执行方法
 * @param delay 间隔，单位：ms
 * @param args fn执行时传递参数
 * @returns destroy 停止fn执行
 */
export function onInterval(fn: (...args: any[]) => void, delay?: number, ...args: any[]): IScope {
    mustFunction(fn, "onInterval: fn");
    const timer = setInterval(fn, delay, ...args);
    return {
        destroy: () => clearInterval(timer)
    }
}
/**
 * 监听Timeout执行
 * - 内部使用 setTimeout 实现
 * @param fn 执行方法
 * @param delay 延时，单位：ms
 * @param args fn执行时传递参数
 * @returns destroy 停止fn执行；若fn已执行则无效
 */
export function onTimeout(fn: (...args: any[]) => void, delay?: number, ...args: any[]): IScope {
    mustFunction(fn, "onTimeout: fn");
    const timer = setTimeout(fn, delay, ...args);
    return {
        destroy: () => clearTimeout(timer)
    }
}

/**
 * 监听事件
 * - 内部使用addEventListener 方法监听事件，销毁时自动执行removeEventListener
 * @param target 监听元素
 * @param name 事件名称
 * @param fn 事件处理方法
 * @returns destroy 销毁监听
 */
export function onEvent(target: Element | Window, name: string, fn: EventListenerOrEventListenerObject): IScope {
    throwIfFalse(target instanceof Element || target === window, "onEvent: target must be Element or Window")
    mustString(name, "onEvent: name");
    mustFunction(fn, "onEvent: fn");
    target.addEventListener(name, fn);
    return {
        destroy: () => target.removeEventListener(name, fn)
    };
}

/**
 * 监听元素尺寸变化
 * @param el 监听元素
 * @param fn 尺寸变化时的回调方法
 * @returns destroy 销毁监听
 */
export function onResize(el: Element, fn: (size: Readonly<{ width: number; height: number }>) => void): IScope {
    throwIfFalse(el instanceof Element, "onResize: el must be Element.");
    var isDestroy = false;
    var preSize: { width: number, height: number } = undefined;
    /** 计算元素的size值，有变化时更新到size量中 */
    function calcSize() {
        if (isDestroy == true) {
            resizeObserver && resizeObserver.disconnect();
            timer && clearInterval(timer);
            return;
        }
        const rect = el.getBoundingClientRect();
        const isChange: boolean = preSize == undefined
            || preSize.width != rect.width || preSize.height != rect.height;
        if (isChange == true) {
            preSize = Object.freeze({ width: rect.width, height: rect.height });
            fn(preSize);
        }
    }
    //  计算元素大小：优先使用 ResizeObserver ，否则做定时器（使用requestAnimationFrame有点浪费性能，采用定时器100ms执行一次）
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(calcSize) : undefined;
    const timer = resizeObserver ? resizeObserver.observe(el) : setInterval(calcSize, 100);
    calcSize();

    return {
        destroy: () => isDestroy = true
    };
}
/**
 * 监听元素客户端位置、大小变化
 * - 位置计算规则：相对window屏幕
 * @param el 监听元素
 * @param fn 
 * @returns destroy 销毁监听
 */
export function onRerect(el: Element, fn: (rect: DOMRectReadOnly) => void): IScope {
    throwIfFalse(el instanceof Element, "onRect: el must be Element.");
    var isDestroy = false;
    var preRect: DOMRectReadOnly = undefined;
    /** 计算元素的rect值，有变化时更新到rect变量中 */
    function calcRect() {
        if (isDestroy == true) {
            clearInterval(timer);
            return;
        }
        const rect = el.getBoundingClientRect();
        const isChange: boolean = preRect == undefined
            || rect.x != preRect.x || rect.y != preRect.y
            || rect.width != preRect.width || rect.height != preRect.height;
        if (isChange == true) {
            preRect = DOMRectReadOnly.fromRect(rect);
            fn(preRect);
        }
    }
    //  监听rect变化，并尝试自动销毁：使用requestAnimationFrame有点浪费性能，采用定时器100ms执行一次
    const timer = setInterval(calcRect, 100);
    calcRect();

    return {
        destroy: () => isDestroy = true
    };
}