/**
 * 模态弹窗数据结构
 */
import { PopupOptions, PopupStatus } from "./popup-model";

/**
 * 模态弹窗配置选项
 * - 继承 ComponentOptions ，动态加载组件
 */
export type DialogOptions = PopupOptions & {
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
     * 模态弹窗动画名
     * - 不传则使用默认，具体有弹窗容器确认，如dialog为 snail-dialog
     */
    transition?: string;
    /**
     * 动画持续时间
     * - 配合 transition 使用；单位ms，默认100ms
     * - 外部传入自定义动画时，传入动画持续时间，否则可能导致关闭时动画失效
     */
    transitionDuration?: number;

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
export type DialogHandle<T> = {
    /**
     * 组件是否处于【模态弹窗】模式
     */
    inDialog: Readonly<boolean>;
    /**
     * 关闭弹窗
     * @param data 关闭时传递数据
     */
    closeDialog(data?: T): void;
    /**
     * 注册监听【弹窗关闭】事件方法
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 关闭时执行的钩子函数，支持异步，返回false时将阻止弹窗关闭
     */
    onDialogClose(fn: () => false | undefined | Promise<false | undefined>): void;
}

/**
 * 弹窗扩展信息
 */
export type DailogExtend = {
    /**
     * 弹窗状态
     */
    dialogStatus: PopupStatus;
}