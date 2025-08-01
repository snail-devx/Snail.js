/**
 * 公共通用数据结构：
 *  1、在弹窗、模态弹窗、跟随弹窗的效果下复用
 */
import { ShallowRef } from "vue";
import { ComponentOptions } from "../../container/models/component-model";

/**
 * 弹窗配置选项
 * - 约束弹出组件信息
 * - 弹出组件时传递的参数信息
 */
export type PopupOptions = ComponentOptions & {
    /**
     * 传递给组件的属性值，执行v-bind绑定到要显示的组件
     * - key为属性名称，遵循vue解析规则
     * - 若为事件监听，则使用onXXX
     */
    props?: Record<string, any>;

    /**
     * 弹窗动画名
     * - 不传则默认“snail-fade”
     * - 动画规则：打开弹窗时，为 [transition]-in ；关闭弹窗时，为[transition]-out
     * - - 传入 "snail-scale"，则打开弹窗为 "snail-scale-in"；关闭弹窗时为 "snail-scale-out"
     */
    transition?: string;
    /**
     * 动画持续时间
     * - 配合 transition 使用；单位ms，默认500ms
     * - 外部传入自定义动画时，传入动画持续时间，否则可能导致关闭时动画失效
     */
    transitionDuration?: number;

    /**
     * 自定义class
     * - 绑定到内容组件根元素上
     * - 可以直接在props中指定，无需特殊设置
    class?: string | string[];
     */
    /**
     * 自定义style
     * - 绑定到内容组件根元素上
     * - 可以直接在props中指定，无需特殊设置
    style?: AllStyle;
     */

    /**
     * 弹窗的z-index值
     * - 无特殊情况，建议不指定，内部会自动生成，确保弹窗正确性
     */
    zIndex?: number;
}

/**
 * 弹出组件句柄
 */
export type PopupHandle<T> = {
    /**
     * 组件是否在【弹出窗口】中
     * - popup  ：  普通弹出弹窗
     * - dialog ：  模态对话弹窗
     * - follow ：  跟随效果弹窗
     */
    inPopup: Readonly<"popup" | "dialog" | "follow">;
    /**
     * 关闭弹窗
     * @param data 关闭时传递数据
     */
    closePopup(data?: T): void;
}

/**
 * 弹窗状态：响应式
 * - open       打开
 * - active     激活，针对Dialog弹窗生效
 * - unactive   非激活，针对Dialog弹窗生效
 * - closed     关闭
 */
export type PopupStatus = ShallowRef<"open" | "active" | "unactive" | "closed">;
/**
 * 弹窗状态 配置选项
 */
export type PopupStatusOptions = {
    /**
     * 弹窗状态：响应式
     */
    popupStatus: PopupStatus;
}

/**
 * 弹窗对象描述器
 * - 给弹窗容器使用，传递过去作为props使用
 */
export type PopupDescriptor<Options extends PopupOptions, ExtOptions> = PopupStatusOptions & {
    /**
     * 弹窗Id
     * - 自动分配，全局唯一
     */
    popupId: string,

    /**
     * 弹窗配置选项
     * - 由外部传递过来的业务数据配置信息
     * - 约束具体弹窗的业务组件和业务组件所需props等数据
     */
    options: Options;

    /**
     * 弹窗扩展配置选项
     * - 由 popup、follow等方法内部组件：如关闭弹窗方法、钩子函数等
     * - 配合业务组件使用的一些配置数据
     */
    extOptions: ExtOptions;

    /**
     * 实际分配的zIndex值
     */
    zIndex: number;

    /**
     * 弹窗动画名
     * - 约束打开、关闭动画；基于 PopupOptions.transition 构建出来的
     * - 具体使用方，将此值绑定的根元素上
     */
    popupTransition: ShallowRef<string>;
}