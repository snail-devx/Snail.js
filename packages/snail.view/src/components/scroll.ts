/**
 * 滚动相关组件
 */

import { correctString, IScope, isStringNotEmpty, mountScope } from "snail.core";
import { IScrollManager, ScrollbarOptions, ScrollStatus } from "../models/scroll-model";

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
 * @returns 滚动视图管理器+作用域实例
 */
export function useScroll(): IScrollManager & IScope {

    //#region ************************************* 接口方法：IScrollManager具体实现 *************************************
    /**
     * 是否到最左了
     * @param root 视图根节点
     * @returns 
     */
    function isLeft(root: HTMLElement): boolean {
        return root.scrollLeft == 0;
    }
    /**
     * 是否到最右了
     * @param root 视图根节点
     */
    function isRight(root: HTMLElement): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollLeft + root.clientWidth) >= root.scrollWidth
        return Math.abs(root.scrollWidth - root.clientWidth - root.scrollLeft) < 1;
    }
    /**
     * 是否到最顶了
     * @param root 视图根节点
     * @returns 
     */
    function isTop(root: HTMLElement): boolean {
        return root.scrollTop == 0;
    }
    /**
     * 是否到最底了
     * @param root 视图根节点
     * @returns 
     */
    function isBottom(root: HTMLElement): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollTop + root.clientHeight) >= root.scrollHeight;
        return Math.abs(root.scrollHeight - root.clientHeight - root.scrollTop) < 1;
    }

    /**
     * 获取滚动状态
     * @param root 视图根节点
     * @returns 
     */
    function getStatus(root: HTMLElement): ScrollStatus {
        const status: ScrollStatus = {
            xbar: root.scrollWidth > root.clientWidth,
            ybar: root.scrollHeight > root.clientHeight,
            left: false,
            right: false,
            top: false,
            bottom: false,
            //  滚动视图相关信息
            scrollWidth: root.scrollWidth,
            scrollHeight: root.scrollHeight,
            scrollLeft: root.scrollLeft,
            scrollTop: root.scrollTop,
        };
        if (status.xbar == true) {
            status.left = isLeft(root);
            status.right = isRight(root);
        }
        if (status.ybar == true) {
            status.top = isTop(root);
            status.bottom = isBottom(root);
        }
        return status;
    }

    /**
    * 构建滚动视图的自定义样式
    * @param options 滚动视图配置选项
    * @returns 类样式数组 
    */
    function buildClassStyle(options: ScrollbarOptions): string[] {
        const classes: string[] = [];
        //  scroll
        switch (options ? options.scroll : undefined) {
            case "x":
            case "y":
            case "none":
                classes.push(`scroll-${options.scroll}`);
                break;
            case "both":
                classes.push("scroll-xy");
                break;
        }
        //  barSize
        const barSize: string = options
            ? correctString(options.barSize, undefined, true)
            : undefined;
        barSize && classes.push(`${barSize}-scrollbar`);

        return classes;
    }
    //#endregion

    //  构建管理器
    return Object.freeze(mountScope<IScrollManager>(
        {
            isLeft, isRight,
            isTop, isBottom,
            getStatus,
            buildClassStyle,
        },
        { type: "IScrollManager" }
    ));
}