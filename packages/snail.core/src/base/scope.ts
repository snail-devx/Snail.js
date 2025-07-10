import { isPromise, mustFunction } from "./data";
import { throwIfFalse, throwIfTrue } from "./error";
import { run } from "./function";
import { IScope, IAsyncScope, IScopes, IScopeManager } from "./models/scope-model";

/**
 * 给指定对象挂载【作用域】
 * - 将IScope的相关属性、方法挂载到target对象上
 * @param target 要挂载【作用域】的实例
 * @returns 挂载的【作用域】实例
 */
function mountScope<T>(target: T): T {
    throwIfFalse(typeof (target) === "object", "mountScope: target must be an Object.");
    var destroyed: boolean = false;
    const handles: Array<() => void> = [];
    /** 使用  defineProperties 进行只读赋值，避免外部改变，且destroyed为属性，通过 defineProperties get 方法实现 */
    return Object.defineProperties(target, {
        //  【作用域】是否销毁了：通过get属性实现外部只读，内部修改可直接反应出来
        destroyed: { get: (): Readonly<boolean> => destroyed },
        //  外部监听【作用域】销毁；若本身已经销毁了，则直接执行fn方法
        onDestroy: {
            writable: false,
            value: function (fn: () => void): IScope {
                mustFunction(fn, "useScope.onDestroy: fn");
                destroyed ? run(fn) : handles.push(fn);
                return target as IScope;
            }
        },
        //  销毁【作用域】
        destroy: {
            writable: false,
            value: function (): void {
                if (destroyed == false) {
                    destroyed = true;
                    handles.forEach(run);
                    handles.splice(0);
                }
            }
        }
    });
}

/**
 * 使用新的【作用域】
 * @returns 【作用域】对象
 */
function useScope(): IScope {
    return mountScope<IScope>(Object.create(null));
}
/**
 * 使用新的【作用域组】
 * @returns 【作用域组】对象
 */
function useScopes(): IScopes {
    //  管理子作用域、挂载scope属性，监听【作用域】销毁事件
    const children: IScope[] = [];
    const scopes: IScopes = Object.defineProperties(Object.create(null), {
        //  添加【子作用域】
        add: {
            writable: false,
            value: function (child: IScope): IScope {
                throwIfTrue(scopes.destroyed, "scopes has destroyed, cannot add child scope again.");
                mustFunction((child || {}).destroy, "useScopes.add: child must be an instance of IScope.");
                children.push(child);
                return child;
            }
        },
        //  移除【子作用域】
        remove: {
            writable: false,
            value: function (child: IScope): void {
                if (scopes.destroyed == false) {
                    const index = children.indexOf(child);
                    index >= 0 && children.splice(index, 1);
                }
            }
        }
    });
    mountScope(scopes).onDestroy(() => children.forEach(sc => run(sc.destroy)));
    return scopes;
}
/**
 * 使用【异步作用域】
 * - 等待task执行完成后，自动销毁作用域
 * @param task 异步任务对象
 * @returns 【异步作用域】对象
 */
function useAsyncScope<T>(task: Promise<T>): IAsyncScope<T> {
    throwIfFalse(isPromise(task), "task must be a Promise.");
    const scope = mountScope<Promise<T>>(task) as IAsyncScope<T>
    task.then(scope.destroy, scope.destroy);
    return scope;
}

/** 把自己的类型共享出去 */
export * from "./models/scope-model";
/**
 * 作用域 管理器
 */
export const scope: Readonly<IScopeManager> = { mountScope, useScope, useScopes, useAsyncScope }; 