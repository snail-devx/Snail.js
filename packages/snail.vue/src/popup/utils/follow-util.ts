/**
 * 跟随弹窗 助手方法
 */

import { FollowOptions } from "../models/follow-model";

/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkFollow(options: FollowOptions): string | undefined {
    //  暂无可检测配置项
    return undefined;
}

/**
 * 计算x轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param targetRect 目标元素的矩形信息
 * @param width 跟随组件的宽度
 * @returns 水平方向的跟随效果：left、right标记坐标位置，width标记组件新的宽度；undefined表示不设置，
 */
export function calcFollowX(options: FollowOptions, targetRect: DOMRectReadOnly, width: number)
    : { left?: string, right?: string, width?: string } {
    // 水平位置推断：不能超出浏览器宽度
    return undefined;
}
/**
 * 计算y轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param targetRect 目标元素的矩形信息
 * @param height 跟随组件的高度
 * @returns 水平方向的跟随效果：top、bottom标记坐标位置，height标记组件新的高度；undefined表示不设置，
 */
export function calcFollowY(options: FollowOptions, targetRect: DOMRectReadOnly, height: number)
    : { top?: string, bottom?: string, height?: string } {
    // 垂直位置推断：不能超出浏览器高度
    return undefined;
}