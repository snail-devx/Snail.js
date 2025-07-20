import { IScope } from "snail.core";
import { TransitionEffect } from "snail.view";
import { Ref, ShallowRef } from "vue";

/**
 * 接口：响应式管理器
 */
export interface IReactiveManager {
    /**
     * 响应式【过渡】变量值
     * - 通过设置 rv.value 的值来实现.value值过渡
     * - 执行顺序 from、to
     * - 开始时，设置 rv.value 值为 from；延迟time时间后，强制销毁scope
     * - 销毁scope时，强制将 rv.value 值设置为 to 值
     * @param rv 响应式变量对象 
     * @param effect 过渡效果配置，约束 from end 样式
     * @param time 过渡持续时间，到时间后销毁作用域
     * @returns 作用域对象，可销毁【值过渡】效果
     */
    transition<T>(rv: ShallowRef<T> | Ref<T>, effect: { from: T, to: T }, time: number): IScope;

    /**
     * 响应式【加载】任务
     * - 任务运行时，设置loading.value=true
     * - 任务完成后，设置loading.value=false
     * - 可通过delay值，延迟执行 loading.value=false 操作
     * - 可在api请求等耗时操作任务过程中，实现响应式显隐Loading组件
     * @param task 要运行的任务
     * @param loading 正在加载的响应式变量
     * @param delay 延迟时间，单位ms；不传则不延迟
     * @returns 任务自身
     */
    load<T, E>(task: Promise<T>, loading: ShallowRef<boolean> | Ref<boolean>, delay: number)
        : Promise<{ success: boolean, data?: T, error?: E }>;
}

/**
 * 响应式变量
 */
export type ReactiveVar<T> = ShallowRef<T> | Ref<T>;