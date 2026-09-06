import { ReadonlyOptions } from "./base-model";

/**
 * 开关组件 配置选项
 */
export type SwitchOptions = ReadonlyOptions & {
    /**
     * 类型，决定开启/关闭状态的渲染效果
     * - switch     开关类型，默认效果
     * - radio      单选框效果，圆角边框
     * - checkbox   复选框效果，矩形边框
     */
    type?: "switch" | "radio" | "checkbox"
}

/**
 * 开关 事件
 */
export type SwitchEvents = {
    /**
     * 开关 状态变化时
     * @param value 开启、还是关闭
     */
    change: [value: boolean];
}