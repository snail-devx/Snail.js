/**
 * 公共通用数据结构：
 *  1、在弹窗、模态弹窗、跟随弹窗的效果下复用
 */
import { Component, ShallowRef } from "vue";
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
 * 弹窗标识信息
 */
export type PopupFlagOptions = {
    /**
     * 分配给弹窗的Id值
     */
    id: number;
    /**
     * 实际分配的zIndex值
     */
    zIndex: number;
}

/**
 * 弹出组件句柄
 */
export type PopupHandle<T> = {
    /**
     * 组件是否在【弹出窗口】中
     */
    inPopup: Readonly<boolean>;
    /**
     * 关闭弹窗
     * @param data 关闭时传递数据
     */
    closePopup(data?: T): void;
}

/**
 * 弹窗状态：响应式
 * - open       打开
 * - active     激活
 * - unactive   非激活
 * - close      关闭
 */
export type PopupStatus = ShallowRef<"open" | "active" | "unactive" | "close">;

/**
 * 弹窗扩展信息
 */
export type PopupExtend = {
    /**
     * 弹窗状态
     */
    popupStatus: PopupStatus;
}
