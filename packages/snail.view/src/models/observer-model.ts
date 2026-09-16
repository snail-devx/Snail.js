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
     * 监听元素触摸事件
     * - 支持 touch 相关事件
     * - 兼容 mouse 相关事件
     * @param el 元素对象
     * @param options 配置选项
     * @param fn 触摸回调，回调时告知当前触摸详细信息
     * @returns 作用域，可销毁监听
     */
    onTouch(el: Element, options: TouchOptions, fn: (detail: TouchDetail) => void): IScope;

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
/**
 * 元素位置
 */
export type ElementPosition = {
    /**
     * x轴位置
     */
    x: number;
    /**
     * y轴位置
     */
    y: number;
}


/**
 * 触摸配置选项
 * 配合 `onTouch` 使用
 */
export type TouchOptions = {
    // /**
    //  * 禁用鼠标事件
    //  * - 为true时， mousedown mouseup mousemove 相关事件，不触发
    //  */
    // disableMouse: boolean;

    //  后续支持鼠标 wheel 事件，进行单位滑动，然后翻译为 回调中的效果数据
}
/**
 * 触摸详情
 * - `onTouch`回调方法中使用
 */
export type TouchDetail = {
    /**
     * 当前状态
     */
    status: TouchStatus;

    /**
     * 触摸启动时的对象信息
     * - 包含位置、时间戳、事件目标对象等
     */
    start: TouchTarget;
    /**
     * 上一次触摸事件对象信息
     * - 包含位置、时间戳、事件目标对象等
     */
    pre: TouchTarget;
    /**
     * 当前触摸事件对象信息
     * - 包含位置、时间戳、事件目标对象等
     */
    now: TouchTarget;

    /**
     * 移动距离信息
     * - 上次回调到现在
     * - 仅 status 为 move 时有值
     */
    move?: TouchDistance;
    /**
     * 整体移动距离信息
     * - 启动到现在
     * - status 为 start 时无值
     */
    total?: TouchDistance;
}
/**
 * 触摸的目标对象信息
 */
export type TouchTarget = {
    /**
     * 时间戳
     * - 单位毫秒
     */
    timestamp: number;

    /**
     * 触发触摸事件的事件对象
     */
    target: EventTarget;

    /**
     * 触摸点x轴位置
     * - 触摸结束、取消时，可能无值
     * - 触摸开始、移动时，有值
     */
    x: number;
    /**
     * 触摸点y轴位置
     * - 触摸结束、取消时，可能无值
     * - 触摸开始、移动时，有值
     */
    y: number;

};
/**
 * 触摸状态
 * - start      启动
 * - move       移动中
 * - end        已结束
 * - cancel     已取消
 */
export type TouchStatus = "start" | "move" | "end" | "cancel";
/**
 * 触摸移动距离
 * - 包含 时间、xy轴距离，xy轴速度
 */
export type TouchDistance = {
    /**
     * 当前时间戳
     * - 单位毫秒
     */
    timestamp: number;
    /**
     * 耗费时间
     * - 单位毫秒
     */
    time: number;

    /**
     * x轴移动距离
     * - 正负表示方向
     */
    x: number;
    /**
     * x轴移动速度
     * - `x` / `time`
     */
    vx: number;

    /**
     * y轴移动距离
     * - 正负表示方向
     */
    y: number;
    /**
     * y轴移动速度
     * - `y` / `time`
     */
    vy: number;
}