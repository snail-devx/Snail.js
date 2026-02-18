/**
 * 数值管理相关数据实体
 */

import { RunResult } from "./function-model";

/**
 * 接口：数值管理器
 */
export interface INumberManager {
    /**
     * 解析数值
     * @param value 要解析的值，数值或者字符串
     * @preturns 解析结果对象
     */
    parse(value: number | string): NumberParseResult;

    /**
     * 计算多个数值的总和
     * @param nums 要求和的数值数组
     * @returns 计算后的数值
     */
    sum(...nums: number[]): number;
    /**
     * 计算多个数值的差值
     * @param nums 要求差值的数值数组，第一个数值为被减数，后续数值为减数
     * @returns 计算后的数值
     */
    subtract(...nums: number[]): number;
    /**
     * 计算多个数值的乘积
     * @param nums 要求乘积的数值数组，第一个数值为被乘数，后续数值为乘数
     * @returns 计算后的数值
     */
    multiply(...nums: number[]): number;
    /**
     * 计算多个数值的商
     * @param nums 要求商的数值数组，第一个数值为被除数，后续数值为除数
     * @returns 计算后的数值
     * @param nums 
     */
    divide(...nums: number[]): number;

    /**
     * 固定小数位
     * @param number 要处理的数值
     * @param options 保留小数位数的配置选项
     * @returns 小数位数处理后的字符串结果
     */
    toFixed(number: number | NumberParseResult, options: NumberToFixedOptions): RunResult<string>;
    /**
     * 添加千分位
     * @param number 要处理的数值
     * @param options 小数位数处理，不传入则不进行小数位数处理
     * @returns 千分位处理后的字符串结果
     */
    toThousands(number: number | NumberParseResult, options?: NumberToFixedOptions): RunResult<string>;
    /**
     * 转成中文大写
     * - 强制单位元，不支持美元等
     * @param number 要处理的数值
     * @param options 小数位数处理，不传入则不进行小数位数处理
     * @returns 大写中文字符串结果 
     */
    toChineseUpper(number: number | NumberParseResult, options?: NumberToFixedOptions): RunResult<string>;
}
/**
 * 数值解析结果
 */
export type NumberParseResult = {
    /**
     * 是否时有效的数值输入
     * - `- 0 1 2 3 4 5 6 7 8 9  0 .`算是合法输入
     */
    readonly valid: boolean;
    /**
     * 有效的数值
     * - undefined时，输入无法转换成有效的数值
     */
    readonly number: number | undefined;
    /**
     * 解析数值时发生的错误
     * - 输入数值有效，但是格式化时发生错误了
     */
    readonly error?: string;

    /**
     * 是否是负数
     * - true 时说明以`-`开始；false时为正数
     */
    readonly isNegative?: boolean;
    /**
     * 是否是小数
     * - true 时说明有小数点“.”；false 时为整数
     */
    readonly isDecimal?: boolean;

    /**
     * 数值输入的整数部分
     * - 取整数部分绝对值，如-1.2，仅为1
     */
    readonly integerPart?: string;
    /**
     * 小数部分
     * - undefined表示没有输入小数点，是整数
     * - 为空表示仅输入了小数点，还没输入具体的小数部分
     */
    readonly decimalPart?: string;
}
/**
 * 数值保留小数位的配置选项
 */
export type NumberToFixedOptions = {
    /**
     * 小数位数
     * - 0或正整数，表示要保留的小数位数
     * - undefined和负数，表示不进行小数位处理，保持原有的小数位数
     */
    readonly precision: number;
    /**
     * 四舍五入方式
     * - `half-up`（默认）: 四舍五入，5向上进位。1.5 → 2,  -1.5 → -2，
     * - `half-even`: 银行家舍入法，5向最近的偶数进位。1.5 → 2, 2.5 → 2, -1.5 → -2, -2.5 → -2
     * - `up`: 远离零：向上舍入，始终向上进位       1.1 → 2, -1.1 → -2
     * - `down`: 向零舍入：向下舍入，始终向下舍入     1.9 → 1, -1.9 → -1
     * - `ceil`: 向正无穷大方向舍入，正数向上进位，负数向下舍入
     * - `floor`: 向负无穷大方向舍入，正数向下舍入，负数向上进位
     */
    readonly rounding?: "half-up" | "half-even" | "up" | "down" | "ceil" | "floor";
};