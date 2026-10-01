/**
 * 滚动相关组件
 */

import { correctFunction, correctString, IScope, isNumberNotNaN, isStringNotEmpty, mountScope, throwIfFalse } from "snail.core";
import { IScrollManager, ScrollBaseOptions, ScrollDetail, ScrollStatus } from "../models/scroll-model";
import { useObserver } from "./observer";

/**
 * 将目标元素滚动到视图中
 * @param target 目标元素，支持dom元素或者dom元素Id
 * @param options 滚动配置效果
 * @param delay 延迟时间，若>0，则延迟执行，适用于需要等vue等组件渲染完成后再滚动的情况
 */
export function scrollIntoView(target: HTMLElement | string, options?: ScrollIntoViewOptions, delay?: number): void {
    function run() {
        isStringNotEmpty(target) == true && (target = document.getElementById(target as string));
        target instanceof HTMLElement
            ? target.scrollIntoView(options)
            : console.error("scrollIntoView: target must be a HTMLElement or a id of HTMLElement");
    }
    delay > 0 ? run() : setTimeout(run, delay);
}

/**
 * 使用滚动视图
 * - 提供滚动相关状态判断方法，和操作滚动方法
 * - 滚动状态自动维护样式，如滚动条显示隐藏， 自动反应到target的class中
 * @param target 要进行滚动管理的目标元素
 * @param options 
 * @param fn target的滚动状态变化时的回调方法，如滚动条出现了，隐藏了，到底了，开始滚动了等等
 * @returns 滚动管理器+作用域实例
 */
export function useScroll(target: HTMLElement, options: ScrollBaseOptions, fn?: (detail: ScrollDetail) => void): IScrollManager & IScope {

    /** 滚动视图上一次状态 */
    let preStatus: ScrollStatus = undefined;


    //#region ************************************* 接口方法：IScrollManager 具体实现 *************************************
    /**
     * 滚动条滚动
     * @param x x轴方向滚动距离，单位px；不传则不滚动
     * @param y y轴方向滚动距离，单位px；不传则不滚动
     */
    function scroll(x: number | undefined, y: number | undefined): void {
        isNumberNotNaN(x) && (target.scrollLeft += x);
        isNumberNotNaN(y) && (target.scrollTop += y);
        //  刷新滚动状态
        refreshStatus("other");
    }
    /**
     * 滚动到制定位置
     * @param x x轴位置，单位px；不传则不滚动
     * @param y y轴位置，单位px；不传则不滚动
     */
    function scrollTo(x: number | undefined, y: number | undefined): void {
        isNumberNotNaN(x) && (target.scrollLeft = x);
        isNumberNotNaN(y) && (target.scrollTop = y);
        //  刷新滚动状态
        refreshStatus("other");
    }

    /**
     * 刷新滚动视图
     * - 重新映射滚动容器上的class信息
     */
    function refresh(): void {
        //  映射溢出滚动样式
        {
            target.classList.remove("scroll-x", "scroll-y", "scroll-none", "scroll-xy");
            switch (options ? options.scroll : undefined) {
                case "x":
                case "y":
                case "none":
                    target.classList.add(`scroll-${options.scroll}`);
                    break;
                case "both":
                    target.classList.add("scroll-xy");
                    break;
            }
        }
        //  映射滚动条大小样式
        {
            target.classList.remove("normal-scrollbar", "small-scrollbar", "mini-scrollbar", "none-scrollbar");
            const barSize: string = options
                ? correctString(options.barSize, undefined, true)
                : undefined;
            barSize && target.classList.add(`${barSize}-scrollbar`);
        }
        //  刷新滚动状态
        refreshStatus("other");
    }
    /**
     * 获取滚动状态
     * @returns 
     */
    function getStatus(): Readonly<ScrollStatus> {
        const status: ScrollStatus = {
            //  滚动视图相关信息
            clientWidth: target.clientWidth,
            clientHeight: target.clientHeight,
            scrollWidth: target.scrollWidth,
            scrollHeight: target.scrollHeight,
            scrollLeft: target.scrollLeft,
            scrollTop: target.scrollTop,
            //  计算出来的滚动条状态
            xbar: target.scrollWidth > target.clientWidth,
            ybar: target.scrollHeight > target.clientHeight,
            left: isScrollLeft(target),
            right: isScrollRight(target),
            top: isScrollTop(target),
            bottom: isScrollBottom(target),
        };
        return Object.freeze<ScrollStatus>(status);
    }
    //#endregion


    //#region ************************************* 内部方法：辅助结构实现的方法 *************************************
    /**
     * 刷新滚动条状态
     * @param action 什么动作触发的
     */
    function refreshStatus(action: ScrollDetail["action"]) {
        //  计算滚滚动条状态，并冻结：计算左、右、顶、底时，对应方向需要有滚动条
        let detail: ScrollDetail;
        {
            const now: ScrollStatus = getStatus();
            detail = Object.freeze<ScrollDetail>({
                action,
                pre: preStatus || now,
                now,
            });
            preStatus = now;
        }
        //  水平垂直滚动条的变化反应状态到class上
        {
            if (detail.pre == detail.now || detail.pre.xbar != detail.now.xbar) {
                detail.now.xbar == true
                    ? target.classList.add("x-bar")
                    : target.classList.remove("x-bar");
            }
            if (detail.pre == detail.now || detail.pre.ybar != detail.now.ybar) {
                detail.now.ybar == true
                    ? target.classList.add("y-bar")
                    : target.classList.remove("y-bar");
            }
        }
        //  滚动视图状态有变化时，进行回调通知；初次始终判定为有变化
        {
            const isChange: boolean = detail.pre == detail.now
                || detail.pre.clientWidth != detail.now.clientWidth
                || detail.pre.clientHeight != detail.now.clientHeight
                || detail.pre.scrollWidth != detail.now.scrollWidth
                || detail.pre.scrollHeight != detail.now.scrollHeight
                || detail.pre.scrollLeft != detail.now.scrollLeft
                || detail.pre.scrollTop != detail.now.scrollTop
                || detail.pre.xbar != detail.now.xbar
                || detail.pre.ybar != detail.now.ybar
                || detail.pre.left != detail.now.left
                || detail.pre.right != detail.now.right
                || detail.pre.top != detail.now.top
                || detail.pre.bottom != detail.now.bottom;
            isChange == true && (
                fn == undefined ? console.log(detail) : fn(detail)
            );
        }
    }
    //#endregion

    //  初始化+数据验证；构建管理器，相关事件监听
    {
        throwIfFalse(target instanceof Element, "useScroll: target must be a Element");
        fn = correctFunction(fn, undefined);
        //  构建管理器
        const manager = Object.freeze(mountScope<IScrollManager>(
            { scroll, scrollTo, refresh, getStatus, },
            { type: "IScrollManager" }
        ));
        //  事件监听：大小变化，滚动事件，定时器监听滚动视图内部内容变化
        {
            //  定时器监听滚动视图内部内容变化导致的滚动条变化
            const timer = setInterval(() => preStatus && refreshStatus("other"), 100);
            //  事件监听：大小变化，滚动事件
            const observer = useObserver();
            observer.onSize(target, () => refreshStatus("size"));
            observer.onEvent(target, "scroll", () => refreshStatus("scroll"));
            //      测试用
            // observer.onEvent(target, "scroll", console.log);

            manager.onDestroy(() => {
                clearInterval(timer);
                observer.destroy();
            });
        }
        //  滚动视图信息初始化
        refresh();
        refreshStatus("initial");

        return manager;
    }
}


//#region ************************************* 全局助手方法：暂不对外开放*************************************
/**
 * 是否到滚动到最左了
 * @returns 水平方向出现滚动条时，在最左返回true,否则false；无滚动条时，返回undefined
 */
function isScrollLeft(target: HTMLElement): boolean | undefined {
    return target.scrollWidth > target.clientWidth
        ? target.scrollLeft == 0
        : undefined;
}
/**
 * 是否滚动到最右了
 * @returns 水平方向出现滚动条时，在最右返回true,否则false；无滚动条时，返回undefined
 */
function isScrollRight(target: HTMLElement): boolean {
    //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
    // return (target.scrollLeft + target.clientWidth) >= target.scrollWidth

    return target.scrollWidth > target.clientWidth
        ? Math.abs(target.scrollWidth - target.clientWidth - target.scrollLeft) < 1
        : undefined;
}
/**
 * 是否滚动到最顶了
 * @returns 垂直方向出现滚动条时，在最顶返回true,否则false；无滚动条时，返回undefined
 */
function isScrollTop(target: HTMLElement): boolean {
    return target.scrollHeight > target.clientHeight
        ? target.scrollTop == 0
        : undefined;
}
/**
 * 是否滚动到最底了
 * @returns 垂直方向出现滚动条时，在最底返回true,否则false；无滚动条时，返回undefined
 */
function isScrollBottom(target: HTMLElement): boolean {
    //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
    // return (target.scrollTop + target.clientHeight) >= target.scrollHeight;
    return target.scrollHeight > target.clientHeight
        ? Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 1
        : true;
}
// #endregion