/**
 * 动画管理器
 *  1、对一些常用动画做封装，结合IScope作用域实现生命周期管理
 *  2、【后续支持】配置一些常用动画属性，如动画时长
 *  3、【后续支持】全新作用域，隔离配置
 * 注意事项：
 *  1、不提供全局【观察者】对象；这个涉到不少子scope的销毁，在全局挂着始终不好
 */
import { IScope, IScopes, isObject, ITimer, mountScope, throwIfFalse, useScopes, useTimer } from "snail.core";
import { TransitionEffect, IAnimationManager } from "../models/animation-model";
import { getAnimationScope } from "../utils/animation-util";
import { CSS, css } from "./css";

// 把自己的类型共享出去
export * from "../models/animation-model";

/**
 * 使用【动画管理器】
 * @returns 全新的【动画管理器】+作用域
 */
export function useAnimation(): IAnimationManager & IScope {
    /** 作用域组：管理动画效果子作用域 */
    const scopes: IScopes = useScopes();

    //#region *************************************实现接口：IAnimationManager接口方法*************************************
    /**
     * 过渡动画：从初始样式变为目标样式
     * - 执行顺序 from - to - end
     * - 开始动画时，清理 to end 操作样式，设置 from 再设异步设置 to 样式
     * - 动画结束后，清理 from to 操作样式，保留 end 样式
     * @param el 执行动画的元素
     * @param effect 过渡效果配置，约束 from to end 样式
     * @param time 动画持续时长，单位ms，默认200ms；动画结束后销毁作用域
     * @returns 动画作用域
     * @example 将div的高度在1s内从100px变为200px。动画结束后保持200px高度，则可以使用如下代码：
     * transition(el,{
     *      from: { transition: "height 1s ease", "overflow": "hidden", height: "100px" },
     *      to: { height: "200px" },
     *      end: { height: "200px" }
     * }, 1000);
     */
    function transition(el: HTMLElement, effect: TransitionEffect<CSS>, time?: number): IScope {
        throwIfFalse(isObject(effect), "transition: effect must be an object.");
        const scope = scopes.add(getAnimationScope(manager, el));
        const fromCss = css.parse(effect.from);
        const toCss = css.parse(effect.to);
        const endCss = css.parse(effect.end);
        //  启动动画：先 清理 to end ；设置 from ，然后异步设置 to，并延迟销毁作用域
        css.operate(el, "clear", toCss);
        css.operate(el, "clear", endCss);
        css.operate(el, "add", fromCss);
        const toId = setTimeout(css.operate, 1, el, "add", toCss);
        const endId = setTimeout(scope.destroy, time > 0 ? time : 200);
        //  作用域销毁时：清理from、to样式，设置end样式，并清理用到的定时器
        return scope.onDestroy(function () {
            css.operate(el, "clear", fromCss);
            css.operate(el, "clear", toCss);
            css.operate(el, "add", endCss);
            clearTimeout(toId);
            clearTimeout(endId);
        });
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IAnimationManager>({ transition }, "IAnimationManager");
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}