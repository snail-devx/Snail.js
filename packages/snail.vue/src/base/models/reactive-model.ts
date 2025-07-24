import { IScope, RunResult } from "snail.core";
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
    transition<T>(rv: ReactiveVar<T>, effect: { from: T, to: T }, time: number): IScope;

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
    load<T>(task: Promise<T>, loading: ReactiveVar<boolean>, delay: number): Promise<RunResult<T>>;

    /**
     * 监听器：监听单个值变化
     * - 内部利用vue的watch逻辑实现
     * - 自动进行生命周期管理，作用域销毁时自动清理watch监听
     * - 仅实现简化版本watch监听；复杂的监听逻辑，自行使用watch方法
     * @param getter 监听值的get方法，返回要监听的值
     * @param callback 回调方法：可接收新旧值变化
     * @returns 监听作用域，destroy可销毁监听
     */
    watcher<T>(getter: () => T, callback: (newValue: T, oldValue: T) => void): IScope;
}

/**
 * 响应式变量
 */
export type ReactiveVar<T> = ShallowRef<T> | Ref<T>;