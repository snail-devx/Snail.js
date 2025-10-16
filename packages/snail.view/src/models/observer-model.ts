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
     * @param useCapture 是否使用捕获模式
     * @returns 作用域，可销毁监听
     */
    onEvent(target: Element | Window, name: string, fn: (...args: any[]) => void, useCapture?: boolean): IScope;

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

    /**
     * 监听元素的突变
     *  - 通过options配置支持元素自身属性、子元素、子元素属性等；如支持子元素发生变化时（添加、删除、属性变化）等
     *  - 内部通过 MutationObserver 实现；详细参照：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
     * - scope销毁时自动移除监听
     * @param el 监听元素
     * @param options  配置选项，监听元素的哪些变化
     * @param fn 回调方法
     * @returns 作用域，可销毁监听
     */
    onMutation(el: Element, options: MutationObserverInit, fn: (record: MutationRecord[], observer: MutationObserver) => void): IScope;
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