/**
 * 滚动相关组件
 */

import { correctString, IScope, mountScope, throwIfNullish, useScope } from "snail.core";
import { IScrollManager, ScrollbarOptions, ScrollStatus } from "../models/scroll-model";

// 把自己的类型共享出去
export * from "../models/scroll-model";

/**
 * 使用滚动视图
 * @param root 滚动视图根节点
 * @param options 
 * @returns 滚动视图管理器+作用域实例
 */
export function useScroll(root: HTMLElement, options: ScrollbarOptions): IScrollManager & IScope {
    throwIfNullish(root, "root");
    /** 自定义样式 */
    const classes: string[] = [];

    //#region ************************************* 接口方法：IScrollManager具体实现 *************************************
    /**
     * 是否到最左了
     * @returns 
     */
    function isLeft(): boolean {
        return root.scrollLeft == 0;
    }
    /**
     * 是否到最右了
     */
    function isRight(): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollLeft + root.clientWidth) >= root.scrollWidth
        return Math.abs(root.scrollWidth - root.clientWidth - root.scrollLeft) < 1;
    }
    /**
     * 是否到最顶了
     */
    function isTop(): boolean {
        return root.scrollTop == 0;
    }
    /**
     * 是否到最底了
     */
    function isBottom(): boolean {
        //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
        // return (root.scrollTop + root.clientHeight) >= root.scrollHeight;
        return Math.abs(root.scrollHeight - root.clientHeight - root.scrollTop) < 1;
    }

    /**
     * 获取滚动状态
     */
    function getStatus(): ScrollStatus {
        const status: ScrollStatus = {
            xbar: root.scrollWidth > root.clientWidth,
            ybar: root.scrollHeight > root.clientHeight,
            left: false,
            right: false,
            top: false,
            bottom: false,
            scrollwidth: root.scrollWidth,
            scrollheight: root.scrollHeight,
        };
        if (status.xbar == true) {
            status.left = isLeft();
            status.right = isRight();
        }
        if (status.ybar == true) {
            status.top = isTop();
            status.bottom = isBottom();
        }
        return status;
    }

    /**
     * 刷新滚动视图
     * - 更新滚动条配置、、、
     */
    function refresh(): void {
        //  先清空
        classes.length && root.classList.remove(...classes);
        classes.splice(0);
        //  构建自定义样式
        //      barSize
        const barSize: string = options
            ? correctString(options.barSize, undefined, true)
            : undefined;
        barSize && classes.push(`${barSize}-scrollbar`);
        //      scroll
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
        //  添加样式
        classes.length && root.classList.add(...classes);
    }
    //#endregion

    //  初始化
    {
        refresh();
    }

    //  构建管理器
    return Object.freeze(mountScope<IScrollManager>({
        isLeft, isRight,
        isTop, isBottom,
        getStatus, refresh
    }, "IScrollManager"));
}