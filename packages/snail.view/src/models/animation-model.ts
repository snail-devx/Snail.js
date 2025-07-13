import { IScope } from "snail.core";
import { CSS } from "./css-model";

/**
 * 动画管理器
 */
export interface IAnimationManager {
    /**
     * 过渡动画：从初始样式变为目标样式
     * - 执行顺序 from - to - end
     * - 开始动画时，清理 to end 操作样式，设置 from 再设异步置 to 样式
     * - 动画结束后，清理 from to 操作样式，保留 end 样式
     * @param el 执行动画的元素
     * @param effect 动画效果配置，约束 from to end 样式
     * @param time 动画持续时长，单位ms，默认200ms；动画结束后销毁作用域
     * @returns 动画作用域
     * @example 将div的高度在1s内从100px变为200px。动画结束后保持200px高度，则可以使用如下代码：
     * transition(el,{
     *      from: { transition: "height 1s ease", "overflow": "hidden", height: "100px" },
     *      to: { height: "200px" },
     *      end: { height: "200px" }
     * }, 1000);
     */
    transition(el: HTMLElement, effect: TransitionEffectOptions, time?: number): IScope;
}

/**
 * 过渡动画效果配置信息
 * - 执行顺序 from - to - end
 */
export type TransitionEffectOptions = {
    /**
     * 过渡动画开始样式
     * - 支持 class 、style 样式属性
     * - 如 高度 从 100 到 200；100 则为动画开始样式
     */
    from: CSS;
    /**
     * 过渡动画目标样式
     * - 支持 class 、style 样式属性
     * - 如 高度 从 100 到 200；200 则为动画目标样式
     */
    to: CSS;
    /**
     * 动画结束样式
     * - 支持 class 、style 样式属性
     */
    end?: CSS;
}