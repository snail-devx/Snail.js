import { IScope } from "snail.core";
import { TransitionEffect } from "snail.view";
import { Ref, ShallowRef } from "vue";

/**
 * 接口：响应式管理器
 */
export interface IReactiveManager {
    /**
     * 【过渡】响应式变量值
     * - 通过设置 rv.value 的值来实现.value值过渡
     * - 执行顺序 from、to
     * - 开始时，设置 rv.value 值为 from；延迟time时间后，强制销毁scope
     * - 销毁scope时，强制将 rv.value 值设置为 to 值
     * @param rv 响应式变量对象 
     * @param effect 过渡效果配置，约束 from end 样式
     * @param time 过渡持续时间，到时间后销毁作用域
     * @returns 作用域对象，可销毁【值过渡】效果
     */
    transition<T>(rv: { value?: T }, effect: { from: T, to: T }, time: number): IScope;
}