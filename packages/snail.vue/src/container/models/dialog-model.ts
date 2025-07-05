import { AsyncResult, IScope } from "snail.core";
import { ComponentMountOptions, ComponentOptions } from "./component-model"
import { PropType } from "vue";

/**
 * 模态弹窗显示的组件配置选项
 */
export type DialogOptions = ComponentOptions & {
    /**
     * 传递给组件的属性值，执行v-bind绑定到要显示的组件
     * - key为属性名称，遵循vue解析规则
     * - 若为事件监听，则使用onXXX
     */
    props?: Record<string, any>;

    /**
     * 自定义class
     * - 绑定模块弹窗显示的组件根元素上
     */
    class?: string | string[];
    /**
     * 自定义style
     * - 绑定模块弹窗显示的组件根元素上
     */
    style?: string | string[];

    /**
     * 按下esc健时是否关闭弹窗
     * - 默认值：false
     */
    closeOnEscape?: boolean;
    /**
     * 点击遮罩层时是否关闭弹窗
     * - 默认值：false
     */
    closeOnMask?: boolean;
    /**
     * 弹窗的z-index值
     * - 无特殊情况，建议不粗韩，内部会自动生成，确保弹窗正确性
     */
    zIndex?: number;

    /**
     * 模态弹窗的自定义class
     * - 绑定到模态弹窗的根元素上
     */
    rootClass?: string | string[];
}
/**
 * 模块弹窗打开后的结果
 * - 执行destroy方法时，强制关闭，不会执行onDialogClose
 */
export type DialogOpenResult<T> = Promise<T> & IScope;

/**
 * 弹窗句柄：绑定给子组件使用
 */
export type DialogHandle<T> = {
    /**  组件是否处于【弹窗】模式下 */
    inDialog: boolean;
    /**
     * 关闭弹窗的方法
     * @param data 关闭时传递数据
     */
    closeDialog(data?: T): void;
    /**
     * 注册监听【弹窗关闭的方法】
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 关闭时执行的钩子函数，支持异步，返回false时将阻止弹窗关闭
     */
    onDialogClose(fn: () => false | undefined | Promise<false | undefined>): void;
}

/**
 * 模态弹窗；配合【../components/dialog-wrapper.vue】使用
 */
export type Dialog = {
    /**
     * 弹窗Id，唯一值
     */
    id: string;

    /** 
     * 模态弹窗显示的组件配置选项
     */
    options: DialogOptions;

    /**
     * 弹窗句柄
     * - 提供关闭弹窗等操作
     * - 将挂载到内容组件的属性上，方便使用
     */
    handle: DialogHandle<any>,
}