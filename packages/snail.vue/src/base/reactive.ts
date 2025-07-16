/**
 * 响应式 模块；
 *  1、针对Vue的响应式相关功能，做一些便捷封装
 *  2、方便使用，减少重复性代码量
 */
import { Ref, ShallowRef } from "vue";
import { IReactiveManager } from "./models/reactive-model";
import { IAsyncScope, IScope, IScopes, isObject, isPromise, mountScope, RunResult, throwIfFalse, useAsyncScope, useScopes } from "snail.core";

/**
 * 使用【响应式管理器】
 * - 请在Vue组件的setup中使用此方法，否则 getCurrentScope 方法无法取到值
 * @returns 全新的【响应式管理器】+作用域
 */
export function useReactive(): IReactiveManager & IScope {
    /** 作用域组：管理动画效果子作用域 */
    const scopes: IScopes = useScopes();

    //#region *************************************实现接口：IReactiveManager接口方法*************************************
    /**
     * 【过渡】变量值
     * - 通过设置 rv.value 的值来实现.value值过渡
     * - 执行顺序 from、to
     * - 开始时，设置 rv.value 值为 from；延迟time时间后，强制销毁scope
     * - 销毁scope时，强制将 rv.value 值设置为 to 值
     * @param rv 响应式变量对象 
     * @param effect 过渡效果配置，约束 from end 样式
     * @param time 过渡持续时间，到时间后销毁作用域
     * @returns 作用域对象，可销毁【值过渡】效果
     */
    function transition<T>(rv: ShallowRef<T> | Ref<T>, effect: { from: T, to: T }, time: number): IScope {
        throwIfFalse(isObject(effect), "transition: effect must be an object.");
        const scope: IScope = scopes.get();
        //  设置初始值，并延迟销毁作用域
        rv.value = effect.from;
        const endId = setTimeout(scope.destroy, time);
        //  作用域销毁时：设置to值，并清理用到的定时器
        return scope.onDestroy(function () {
            rv.value = effect.to;
            clearTimeout(endId);
        });
    }
    /**
     * 【任务】响应式
     * - 任务运行时，设置loading.value=true
     * - 任务完成后，设置loading.value=false
     * - 可通过delay值，延迟执行 loading.value=false 操作
     * - 可在api请求等耗时操作任务过程中，实现响应式显隐Loading组件
     * @param task 要运行的任务
     * @param loading 正在加载的响应式变量
     * @param delay 延迟时间，单位ms；不传则不延迟
     * @returns 任务自身
     */
    function task<T, E>(task: Promise<T>, loading: ShallowRef<boolean> | Ref<boolean>, delay: number)
        : Promise<{ success: boolean, data?: T, error?: E }> {
        throwIfFalse(isPromise(task), "task: task must be a Promise.");
        //  维护loading状态值
        loading.value = true;
        task.finally(function () {
            delay > 0
                ? setTimeout(() => loading.value = false, delay)
                : loading.value = false;
        });
        //  等待任务执行完成，返回具体结果
        return task.then(
            data => ({ success: true, data }),
            error => ({ success: false, error })
        )
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IReactiveManager>({ transition, task });
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}