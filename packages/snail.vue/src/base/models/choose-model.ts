/**
 * 检查选项 数据结构
 */

import { HeightStyle, MarginStyle, WidthStyle } from "snail.view";
import { ReadonlyOptions } from "./base-model";

/**
 * 选择 组件配置选项
 */
export type ChooseOptions<T> = ReadonlyOptions & {
    /**
     * 是否为多选模式
     * - true 多选模式，可以选中items中多个选项
     * - false 单选模式，只能选中items中的一个选项
     */
    multi?: boolean;
    /**
     * 选项类型
     * - radio:     单选框样式
     * - checkbox:  多选框样式
     */
    type: "checkbox" | "radio";

    /**
     * 待选项目
     * text 可不传入
     */
    items: ChooseItem<T>[];
    /**
     * 选项自定义样式
     * - 可指定选项宽度、高度、外边距
     */
    itemStyle?: WidthStyle & HeightStyle & MarginStyle;
}
/**
 * 选择项
 */
export type ChooseItem<T> = {
    /**
     * 选项文本
     */
    text?: string;
    /**
     * 选项值
     */
    value: any;
}

/**
 * 选择 组件事件
 */
export type ChooseEvents<T> = {
    /**
     * 值改变 事件
     * - values 为当前选中值；单选时为单个值，多选时为值数组
     */
    change: [values: T | T[]];
}