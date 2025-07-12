import { IScope } from "snail.core";

/**
 * 接口
 */
export interface IObserver {
    /**
     * 监听指定事件
     * - scope销毁时自动移除监听
     * - 内部使用addEventListener 方法监听事件，销毁时自动执行removeEventListener
     * @param target 监听元素
     * @param name 事件名称
     * @param fn 事件处理方法
     * @returns 作用域，可销毁监听
     */
    onEvent(target: Element | Window, name: string, fn: EventListenerOrEventListenerObject): IScope;

    /**
     * 监听元素尺寸变化
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    onSize(el: Element, fn: (size: Readonly<ElementSize>) => void): IScope;

    /**
     * 监听元素客户端位置、大小变化
     * - 位置计算规则：相对window屏幕
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param fn 变化时的回调方法
     * @returns 作用域，可销毁监听
     */
    onClient(el: Element, fn: (rect: DOMRectReadOnly) => void): IScope;
}

/**
 * 元素尺寸
 */
export type ElementSize = {
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number
};