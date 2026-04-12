/**
 * 弹性滚动 助手类方法
 */

import { ElasticScrollStatus } from "../models/elastic-model";

/**
 * 获取当前滚动状态
 * @param root 
 */
export function getScrollStatus(root: HTMLElement): ElasticScrollStatus {
    const status: ElasticScrollStatus = {
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
        status.left = root.scrollLeft == 0;
        status.right = isRight(root);
    }
    if (status.ybar == true) {
        status.top = root.scrollTop == 0;
        status.bottom = isBottom(root);
    }
    return status;
}

/**
 * 是否到最右了
 * @param root 
 * @returns 
 */
export function isRight(root: HTMLElement): boolean {
    //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
    return (root.scrollLeft + root.clientWidth) >= root.scrollWidth
}
/**
 * 是否到最底了
 * @param root 
 * @returns 
 */
export function isBottom(root: HTMLElement): boolean {
    //  不管是否存在滚动条，滚动条是否存在单独判断：移动端特定情况下，有些极端情况下存在小数位置，加起来微超过，没查具体原因，先兼容一下
    return (root.scrollTop + root.clientHeight) >= root.scrollHeight;
}