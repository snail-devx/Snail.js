/**
 * 动画管理器
 *  1、对一些常用动画做封装，结合IScope作用域实现生命周期管理
 *  2、【后续支持】配置一些常用动画属性，如动画时长
 *  3、【后续支持】全新作用域，隔离配置
 * 注意事项：
 *  1、不提供全局【观察者】对象；这个涉到不少子scope的销毁，在全局挂着始终不好
 */
import { IScope, IScopes, isObject, mountScope, mustFunction, run, ScopeOptions, throwIfFalse, useScopes } from "snail.core";
import { IAnimationFrameManager, IAnimationManager, TransitionEffect } from "../models/animation-model";
import { CSS } from "../models/css-model";
import { getAnimationScope } from "../utils/animation-util";
import { css } from "./css";

/**
 * 使用【动画管理器】
 * @param options 配置选项
 * @returns 全新的【动画管理器】+作用域
 */
export function useAnimation(options?: Pick<ScopeOptions, "global">): IAnimationManager & IScope {
    const global = options ? options.global : false;
    /** 作用域组：管理动画效果子作用域 */
    const scopes: IScopes = useScopes({ global });

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
    const manager = mountScope<IAnimationManager>(
        { transition },
        { global, type: "IAnimationManager" }
    );
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}

/**
 * 使用【动画管理器】
 * - 内部使用`requestAnimationFrame`实现调度。推荐只用于dom视图操作和更新，不推荐内部执行耗时操作，否则会阻塞动画
 * - 如拖拽、弹性滚动时的视图更新，在requestAnimationFrame中执行更顺滑
 * @param mode 执行模式：singleton，单例模式，执行回调时，取最新数据执行一次，用于节流；queue，队列模式，执行回调时，取当前队列所有数据依次执行
 * @param fn  回调方法，在`requestAnimationFrame`回调中执行此方法，执行次数根据{@link mode}而定
 */
export function useAnimationFrame<T>(mode: "singleton" | "queue", fn: (data: T) => void): IAnimationFrameManager<T> & IScope {
    mustFunction(fn, "fn");
    /** 队列模式 */
    const queueMode: "singleton" | "queue" = mode == "singleton" ? "singleton" : "queue";
    /** 数据队列 */
    const queue: T[] = [];
    /** 帧Id */
    let frameId: number = undefined;

    //#region *************************************实现接口：IAnimationFrameManager接口方法*************************************
    /**
     * 添加要使用动画帧的数据
     * @param data 数据信息
     */
    function add(data: T): void {
        //  单例模式时，清理队列再加入
        queueMode == "singleton" && (queue.splice(0, queue.length));
        queue.push(data);
        //  启动动画帧
        frameId == undefined && (frameId = requestAnimationFrame(animationFrame));
    }
    //#endregion

    //#region *************************************内部方法：辅助结构实现的方法*************************************
    /**
     * 动画帧执行方法
     */
    function animationFrame() {
        frameId = undefined;
        //  将当前帧所有数据取出，依次执行
        for (const data of queue) {
            const { success, ex } = run(fn, data);
            success != true && console.error("run animation frame error", ex);
        }
        queue.splice(0, queue.length);
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    {
        const manager = Object.freeze(mountScope<IAnimationFrameManager<T>>({ add }));
        manager.onDestroy(() => frameId != undefined && cancelAnimationFrame(frameId));
        return manager;
    }

}