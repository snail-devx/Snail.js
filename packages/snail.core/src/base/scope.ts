import { isPromise, mustFunction } from "./data";
import { throwIfFalse, throwIfTrue } from "./error";
import { run } from "./function";
import { IScope, IAsyncScope, IScopes, KeyScopeUseResult } from "./models/scope-model";

// 把自己的类型共享出去
export * from "./models/scope-model";

/** 挂载【作用域】的回调函数列表 */
const mountHandles: Array<(scope: IScope) => void> = [];
/**
 * 挂载【作用域】
 * - 通过 Object.defineProperties 将IScope相关属性、方法挂载给target
 * - 挂载时配置为 只读、不可枚举
 * - 让target拥有自己的专有【作用域】，如给IHttpClient、IScriptManager等接口实例提供【作用域】功能
 * @param target 要挂载【作用域】的实例
 * @returns 挂载了IScope的target实例
 */
export function mountScope<T>(target: T): T & IScope {
    throwIfFalse(typeof (target) === "object", "mountScope: target must be an Object.");
    var destroyed: boolean = false;
    const handles: Array<() => void> = [];
    /** 使用  defineProperties 进行只读赋值，避免外部改变，且destroyed为属性，通过 defineProperties get 方法实现 */
    const scope = Object.defineProperties(target, {
        //  【作用域】是否销毁了：通过get属性实现外部只读，内部修改可直接反应出来
        destroyed: {
            enumerable: false,
            get: (): Readonly<boolean> => destroyed
        },
        //  外部监听【作用域】销毁；若本身已经销毁了，则直接执行fn方法
        onDestroy: {
            enumerable: false,
            writable: false,
            value: function (fn: () => void): IScope {
                mustFunction(fn, "useScope.onDestroy: fn");
                destroyed ? run(fn) : handles.push(fn);
                return target as IScope;
            }
        },
        //  销毁【作用域】：销毁时，先将句柄全部清空在遍历运行，否则可能出现死循环逻辑
        destroy: {
            enumerable: false,
            writable: false,
            value: function (): void {
                if (destroyed == false) {
                    destroyed = true;
                    handles.splice(0).forEach(run);
                }
            }
        }
    }) as T & IScope;
    //  返回挂载【作用域】；触发【onMountScope】句柄方法
    mountHandles.forEach(fn => run(fn, scope));
    return scope;
}
/**
 * 监听 挂载【作用域】 操作
 * - 外部可通过此方法，监听新挂载的【作用域】，如Vue中实现组件销毁时自动销毁此【作用域】
 * @param fn 挂载【作用域】 后执行方法，执行时传入当前挂载的scope实例
 */
export function onMountScope(fn: (scope: IScope) => void): void {
    mustFunction(fn, 'onMountScope: fn');
    mountHandles.push(fn);
}

/**
 * 使用【作用域】
 * - 内部逻辑：Object.create(null)创建对象，然后执行 mountScope 挂载作用域
 * @returns 全新的IScope实例
 */
export function useScope(): IScope {
    return mountScope<IScope>(Object.create(null));
}
/**
 * 使用【作用域组】
 * - 通过 Object.defineProperties 将IScopes相关属性、方法挂载
 * - 挂载时配置为 只读、不可枚举
 * @returns 全新的IScopes实例
 */
export function useScopes(): IScopes {
    //  管理子作用域、挂载scope属性；使用map管理，方便remove时操作
    const children: Map<IScope, boolean> = new Map();
    const scopes: IScopes = Object.defineProperties(Object.create(null), {
        //  添加【子作用域】
        add: {
            enumerable: false,
            writable: false,
            value: function <T extends IScope>(child: T): T {
                //  作用域销毁，添加无意义
                checkScope(scopes, "useScopes.add: scopes destroyed.");
                mustFunction((child || {}).destroy, "useScopes.add: child must be an instance of IScope.");
                checkScope(child, "useScopes.add: child destroyed.");
                //  添加后返回子自身：避免重复添加，监听子的【销毁】事件，从scopes中移除掉
                if (children.has(child) == false) {
                    children.set(child, true);
                    child.onDestroy(() => scopes.remove(child));
                }
                return child;
            }
        },
        //  移除【子作用域】
        remove: {
            enumerable: false,
            writable: false,
            value: function (child: IScope): void {
                scopes.destroyed || children.delete(child);
            }
        },
        //  构建【子作用域】
        /* v8 ignore next 8 不用测试，拼接的功能 */
        get: {
            enumerable: false,
            writable: false,
            value: function (): IScope {
                checkScope(scopes, "useScopes.get: scopes destroyed.");
                return scopes.add(useScope());
            }
        }
    });
    //  监听【作用域】销毁事件，执行子作用域的销毁逻辑
    mountScope(scopes).onDestroy(function () {
        /*  先备份子作用域，清理后再执行destroy方法；避免remove过程中影响map的keys索引 */
        const tmpScopes = [...children.keys()];
        children.clear();
        tmpScopes.forEach(scope => scope.destroy());
    });
    return scopes;
}

/**
 * 使用【异步作用域】
 * - 执行 mountScope 挂载作用域给task
 * - 等待task执行完成后，自动销毁作用域
 * @param task 异步任务对象
 * @returns 【异步作用域】对象
 */
export function useAsyncScope<T>(task: Promise<T>): IAsyncScope<T> {
    throwIfFalse(isPromise(task), "useAsyncScope: task must be a Promise.");
    const scope = mountScope<Promise<T>>(task) as IAsyncScope<T>
    task.finally(scope.destroy);
    return scope;
}

/** 【唯一作用域】对象字典 */
const KEY_SCOPE_MAP: Map<any, IScope> = new Map();
/**
 * 使用【唯一作用域】
 * - 推荐用于一些并发控制场景，可确保活动作用域的复用
 * @param key 作用域Key，此key下至多存在一个作用域
 * @param reuse 【作用域】复用：true 则复用已存在的scope；否则 先销毁存在的scope
 * @returns use结果，作用域对象+是否为新建作用域
 */
export function useKeyScope<T>(key: T, reuse: boolean): KeyScopeUseResult {
    var scope = KEY_SCOPE_MAP.get(key);
    var isNew: boolean = false;
    //  不复用，则先销毁
    if (scope != undefined && reuse != true) {
        scope.destroy();
        scope = undefined;
    }
    //  无作用域则先创建
    if (scope == undefined) {
        scope = useScope().onDestroy(() => KEY_SCOPE_MAP.delete(key));
        isNew = true;
        KEY_SCOPE_MAP.set(key, scope);
    }

    return { scope, reuse: !isNew };
}

/**
 * 检测【作用域】
 * - 【作用域】销毁了，则抛出异常
 * @param scope 要检测的【作用域】对象
 * @param message 抛出异常时的错误信息
 * @returns true 【作用域】未销毁；其他情况报错无返回值
 */
export function checkScope(scope: IScope, message: string): true {
    throwIfTrue(scope.destroyed, message);
    return true;
}