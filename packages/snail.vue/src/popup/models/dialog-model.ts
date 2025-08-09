/**
 * 模态弹窗数据结构
 */
import { PopupHandle, PopupOptions } from "./popup-model";
import { ComponentBindOptions } from "../../container/models/component-model";

/**
 * 模态弹窗 配置选项
 * - 继承 ComponentOptions ，动态加载组件
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type DialogOptions<Props = void, Model = void> = PopupOptions<Props, Model> & {
    /**
     * 禁用【遮罩层】
     * - 目前没实现，先忽略
    maskDisabled?: boolean;
     */

    /**
     * 点击【遮罩层】时是否关闭弹窗
     * - 针对无遮罩层的弹窗，则点击非【弹窗组件】区域时是否关闭
     */
    closeOnMask?: boolean;
    /**
     * 按下【ESC】健时是否关闭弹窗
     */
    closeOnEscape?: boolean;

    /**
     * 模态弹窗的自定义class
     * - 绑定到模态弹窗的根元素上
     */
    rootClass?: string | string[];
}

/**
 * 弹窗组件句柄
 * - 用于在弹窗内容组件中进行模式判断和关闭
 */
export type DialogHandle<T> = PopupHandle<T> & {
    /**
     * 注册监听【弹窗关闭】事件方法
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 关闭时执行的钩子函数，支持异步，返回false时将阻止弹窗关闭
     */
    onBeforeClose(fn: () => false | undefined | Promise<false | undefined>): void;
}