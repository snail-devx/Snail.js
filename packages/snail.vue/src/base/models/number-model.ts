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
    clamp?: "keep" | "clamp";

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
     * 是否启用数值大写格式化处理
     * - 为true时，转成中文大写值
     * - 单位自动为“元”，不支持美元等
     * - 如金额时，自动转为壹仟壹佰壹拾壹元叁角叁分
     * - 小数点后面只处理两位（角分）；剩余不处理
     */
    upper?: boolean;
    /**
     * 格式化时的放大系数
     * - 用于在格式化千分位、大写时，对实际值进行系数放大，value*formatMultiplier
     * - 仅接收正整数，取值规则为10^n，默认1
     * - 千分位格式化时，仅`thousands`为`below`时才进行放到系数处理
     * - 使用示例例：金额是为万元单位时，这里的放大系数就为 “10000”
     */
    formatMultiplier?: number;

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
 * 接口：数值格式化器
 */
export interface INumberFormatter extends Required<Readonly<
    Pick<NumberBaseOptions, "minValue" | "maxValue" | "precision" | "thousands" | "upper">>> {

    /**
     * 格式化输入文本
     * @param text 输入文本
     * @param isEnd 是否是输入结束，true时，已经输入结束将进行数值精度处理
     * @returns 数值格式化结果
     */
    format(text: string, isEnd: boolean): NumberFormatResult;

    /**
     * 进行阈值检测，检测是否超过设定的最大值、最小值
     * @param number 要检测的数值
     * @returns 检测结果，`number` 新的值，`belowMin`是否低于最小值，`exceedMax`是否超过最大值
     */
    checkThreshold(number): { number: number, belowMin: boolean, exceedMax: boolean };

    /**
     * 对数值文本转大写
     * @param result 
     * @returns 大写文本值
     */
    buildUpper(result: NumberFormatResult): string;
    /**
     * 对数值文本进行千分位格式化
     * @param result 
     * @returns 格式化后的文本值
     */
    buildThousands(result: NumberFormatResult): string;

    /**
     * 基于步长计算值
     * @param number 要重新计算的数值
     * @param isPlus true为+，false为-
     * @returns 新的数值
     */
    calcByStep(number: number, isPlus: boolean): number;
}

/**
 * 数值格式化结果
 */
export type NumberFormatResult = {
    /**
     * 输入是否是有效输入
     * - `- 0 1 2 3 4 5 6 7 8 9  0 .`算是合法输入
     */
    readonly valid: boolean;
    /**
     * 有效的数值
     * - undefined时，输入无法转换成有效的数值
     */
    readonly number: number | undefined;
    /**
     * 数值的显示文本
     * - 无千分位等处理的数值显示文本
     * - 若需要在行内显示 千分位 格式文本，需要单独处理
     */
    readonly text: string;
    /**
     * 格式化数值时发生的错误
     * - 输入数值有效，但是格式化时发生错误了
     */
    readonly error?: string;

    /**
     * 是否是负数
     * - true 时说明以`-`开始；false时为正数
     * - 若为true，但`integerPart`为undefined，则说明仅输入了`-`
     */
    readonly isNegative?: boolean;
    /**
     * 是否是小数
     * - true 时说明有小数点“.”；false 时为整数
     * - 若为true，但`decimalPart`为undefined，则说明是以`.`结尾，还没输入具体的小数部分
     */
    readonly isDecimal?: boolean;

    /**
     * 数值输入的整数部分
     * - 取整数部分绝对值，如-1.2，仅为1
     */
    readonly integerPart?: string;
    /**
     * 小数部分
     */
    readonly decimalPart?: string;

    /**
     * 进行系数放大后的整数部分
     */
    readonly integerPartAfterMultiplier?: string;
    /**
     * 进行系数放大后的小数部分
     */
    readonly decimalPartAfterMultiplier?: string;
}

/**
 * 数值组件的事件选项
 */
export type NumberEvents = ChangeEvents<number> & {
    /**
     * 数值发生错误时
     * - 若超过最大的精度范围
     * - 其他未知异常等
     * @param reason 错误原因
     */
    error: [reason: string];
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