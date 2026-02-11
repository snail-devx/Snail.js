/**
 * 数值控件的数据结构
 */

import { ChangeEvents } from "./base-event";
import { PlaceholderOptions, ReadonlyOptions } from "./base-model";

/**
 * 数值组件的基础配置选项
 */
export type NumberBaseOptions = {
    /**
     * 最小值
     */
    minValue?: number;
    /**
     * 最大值
     */
    maxValue?: number;
    /**
     * 值超过阈值（最大值、最小值）时的处理模式
     * - 默认值为 `keep`；可选取值范围：
     * - - `keep` 保持原样值显示，不做任何处理
     * - - `clamp` 截断超出阈值值，低于最小值时直接取最小值，超过最大值时，强制值为最大值
     * - 值超过阈值时，会自动触发事件，事件名`NumberEvents`的`belowMin`和`exceedMax`
     */
    clampMode?: "keep" | "clamp";

    /**
     * 精度，保留几位小数
     * - 要求0、正整数,输入小数则强制整数
     * - 负数、不传入则不处理
     */
    precision?: number;
    /**
     * 对数值进行千分位格式处理
     * - 默认值为 `disabled`；可选值范围：
     * - `disabled` 禁用千分位功能
     * - `inline`  内联千分位功能
     * - `below`  下拉千分位功能
     */
    thousands?: "disabled" | "inline" | "below";
    /**
     * 是否启用数值大写
     * - 为true时，转成中文大写值
     * - 如金额时，自动转为壹仟壹佰壹拾壹元叁角叁分
     * - 小数点后面只处理两位（角分）；剩余不处理
     */
    upper?: boolean;

    /**
     * 前缀字符串
     * - 如金额时，可配置前缀 ￥
     */
    prefix?: string;
    /**
     * 后缀字符串
     * - 如金额时，可配置后缀 元/美元、、
     */
    suffix?: string;

    /**
     * 数值控制器
     * - 便捷加减调整数值的控制按钮
     * - 默认值`disabled`；可选值范围：
     * - - `disabled` 时禁用
     * - - `default` 默认模式，左侧 — 右侧 +
     * - - `right`   右侧模式，+ - 都在右侧
     */
    controls?: "disabled" | "default" | "right";
    /**
     * 数值步长值
     * - `controls` 未禁用时生效
     * - 每次+、- 的步长值
     */
    step?: number;
}

/**
 * 数值组件的配置选项
 */
export type NumberOptions = PlaceholderOptions & ReadonlyOptions & NumberBaseOptions;

/**
 * 数值组件的事件选项
 */
export type NumberEvents = ChangeEvents<number> & {
    /**
     * 小于最小值
     * @param value 当前值
     * @param minValue 最小值
     */
    belowMin: [value: number, minValue: number];
    /**
     * 超过最大值
     * @param value 当前值
     * @param maxValue 最大值
     */
    exceedMax: [value: number, maxValue: number];
}