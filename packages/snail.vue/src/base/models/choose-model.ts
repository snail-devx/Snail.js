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
    type: "radio" | "checkbox";
    /**
     * 显示模式
     * - native     原生默认，浏览器自己渲染；不同浏览器效果不一致
     * - beautiful  美化模式，不同浏览器下效果通义
     */
    mode?: "native" | "beautiful";
    /**
     * 选项布局
     * - 默认值：horizontal
     * - 可选值：
     * - - horizontal 水平布局；所有选项一行
     * - - vertical   垂直布局；每个选项一行
     */
    layout?: "horizontal" | "vertical";

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
    value: T;

    /**
     * 选项描述信息，一般作为解释使用
     */
    description?: string;
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