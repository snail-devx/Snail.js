/**
 * 数值处理相关
 *  1、数值转字符串，保留小数位
 *  2、数值格式化，千分位
 *  3、数值计算，解决 0.1+0.2 !== 0.3 的问题
 *      0.1+0.2 = 0.30000000000000004
 *      1-0.8 = 0.19999999999999996
 *      0.1*0.2 = 0.020000000000000004
 *      0.3 / 0.1 = 2.9999999999999996
 */

import { isNumber, isStringNotEmpty } from "./data";
import { throwIfNullOrUndefined } from "./error";
import { RunResult } from "./function";
import { INumberManager, NumberParseResult, NumberToFixedOptions } from "./models/number-model";
import { IScope, mountScope } from "./scope";

//  导出数据结构
export * from "./models/number-model";

/**
 * 使用数值管理器
 *  - 数值转字符串，保留小数位
 *  - 数值格式化，千分位
 *  - 数值精度处理，解决 0.1+0.2 !== 0.3 的问题
 * @returns 数值管理器实例+作用域实例
 */
export function useNumber(): INumberManager & IScope {

    //#region *************************************实现接口：IKeyManager接口方法*************************************
    /**
     * 解析数值
     * @param value 要解析的值，数值或者字符串
     * @preturns 解析结果对象
     */
    function parse(value: number | string): NumberParseResult {
        //  验证，都转成字符串做验证
        if (isNumber(value) == true) {
            if (isNaN(value as number) == true) {
                return { valid: false, number: undefined, error: "value is NaN number" };
            }
        }
        value = String(value).replace(/,/g, '');
        if (value.length == 0) {
            return { valid: false, number: undefined, error: "value must be a non-empty string" };
        }
        //  是否为负数，若仅为“-”，
        const isNegative = value.startsWith('-');
        if (isNegative == true) {
            value = value.substring(1);
            if (value.length == 0) {
                return { valid: false, number: undefined, error: "value is only negative sign '-'" };
            }
        }
        //  验证剩余的是否是数字；若以“.”结尾，则判定为未完整输入
        if (/^(?:[1-9]\d*|0)(?:\.\d*)?$/.test(value) == false) {
            return { valid: false, number: undefined, error: "value is not valid number string" };
        }
        /** 转成数值 超过最大精度范围强制无效
         *      只有在 -253 + 1 到 253 - 1 范围内（闭区间）的整数才能在不丢失精度的情况下被表示
         *      可通过 Number.MIN_SAFE_INTEGER 和 Number.MAX_SAFE_INTEGER 获得
         *      详细参照：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number#number_%E7%BC%96%E7%A0%81
         */
        const number: number = isNegative ? -parseFloat(value) : parseFloat(value);
        if (9007199254740991 < number || number < -9007199254740991) {
            return { valid: false, number: undefined, error: "value is out of safe range" };
        }
        const [integerPart, decimalPart] = String(number).split(".");
        return Object.freeze<NumberParseResult>({
            valid: true,
            number: number,
            isNegative: isNegative,
            isDecimal: decimalPart !== undefined,
            integerPart: integerPart,
            decimalPart: decimalPart
        });
    }

    /**
     * 计算多个数值的总和
     * @param nums 要求和的数值数组
     * @returns 计算后的数值
     */
    function sum(...nums: number[]): number {
        throw new Error("Method not implemented.");
    }
    /**
     * 计算多个数值的差值
     * @param nums 要求差值的数值数组，第一个数值为被减数，后续数值为减数
     * @returns 计算后的数值
     */
    function subtract(...nums: number[]): number {
        throw new Error("Method not implemented.");
    }
    /**
     * 计算多个数值的乘积
     * @param nums 要求乘积的数值数组，第一个数值为被乘数，后续数值为乘数
     * @returns 计算后的数值
     */
    function multiply(...nums: number[]): number {
        throw new Error("Method not implemented.");
    }
    /**
     * 计算多个数值的商
     * @param nums 要求商的数值数组，第一个数值为被除数，后续数值为除数
     * @returns 计算后的数值
     * @param nums 
     */
    function divide(...nums: number[]): number {
        throw new Error("Method not implemented.");
    }

    /**
     * 固定小数位
     * @param number 要处理的数值
     * @param options 保留小数位数的配置选项
     * @returns 小数位数处理后的字符串结果
     */
    function toFixed(number: number | NumberParseResult, options: NumberToFixedOptions): RunResult<string> {
        const result = options ? buildToFixedResult(number, options) : getParseResult(number);
        if (result.valid != true) {
            return { success: false, reason: "输入值无效" };
        }
        const text = buildResultString(result.isNegative, result.integerPart, result.decimalPart);
        return {
            success: true,
            data: text
        };
    }
    /**
     * 添加千分位
     * @param number 要处理的数值
     * @param options 小数位数处理，不传入则不进行小数位数处理
     * @returns 千分位处理后的字符串结果
     */
    function toThousands(number: number | NumberParseResult, options?: NumberToFixedOptions): RunResult<string> {
        /** 千分位只格式化整数部分，小数部分直接添加过来 */
        const result = options ? buildToFixedResult(number, options) : getParseResult(number);
        if (result.valid != true) {
            return { success: false, reason: "输入值无效" };
        }
        let text = result.integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        text = buildResultString(result.isNegative, text, result.decimalPart);
        return {
            success: true,
            data: text
        };
    }
    /**
     * 转成中文大写
     * - 强制单位元，不支持美元等
     * @param number 要处理的数值
     * @param options 小数位数处理，不传入则不进行小数位数处理
     * @returns 大写中文字符串结果 
     */
    function toChineseUpper(number: number | NumberParseResult, options?: NumberToFixedOptions): RunResult<string> {
        /** 先转整数部分，再转换小数部分，转换失败则直接失败 */
        const result = options ? buildToFixedResult(number, options) : getParseResult(number);
        if (result.valid != true) {
            return { success: false, reason: "输入值无效" };
        }
        const rt = toChineseUpperIntegerPart(result.integerPart);
        if (rt.success != true) {
            return rt;
        }
        const decimalPart = toChineseUpperOfDecimalPart(result.decimalPart) || "整";
        return {
            success: true,
            data: `${result.isNegative ? '负' : ''}${rt.data}元${decimalPart}`
        };
    }
    //#endregion

    //#region *************************************内部助手类方法               *************************************
    /**
     * 获取值的解析结果
     * @param value 
     * @returns 
     */
    function getParseResult(value: number | string | NumberParseResult): NumberParseResult {
        throwIfNullOrUndefined(value, "value");
        return typeof (value) == "number" || typeof (value) == "string"
            ? parse(value)
            : value as NumberParseResult;
    }
    /**
     * 构建固定小数位数的结果对象
     * @param number 
     * @param options 
     * @returns 值的解析结果对象，包含整数部分、小数部分、是否是负数等信息
     */
    function buildToFixedResult(number: number | NumberParseResult, options: NumberToFixedOptions): NumberParseResult {
        /** 计算精度，未指定则保持现状 */
        number = getParseResult(number);
        if (number.valid != true || options == undefined || (options.precision >= 0) == false) {
            return number;
        }
        const precision = Math.trunc(options.precision);
        switch (options.rounding || "half-up") {
            case "half-up":
            case "half-even":
            case "up":
            case "down":
            case "ceil":
            case "floor":
                throw new Error(`Rounding mode ${options.rounding} is not implemented yet.`);
                break;
            default:
                throw new Error(`Unsupported rounding mode: ${options.rounding}`);
        }
    }

    /**
     * 整数部分转成中文大写
     */
    function toChineseUpperIntegerPart(integerPart: string): RunResult<string> {
        if (isStringNotEmpty(integerPart) != true) {
            return { success: true, data: "" };
        }
        //  不能超过构建的最大值
        const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const units = ['仟万', '佰万', '拾万', '万', '仟', '佰', '拾', '亿', '仟', '佰', '拾', '万', '仟', '佰', '拾', ''];
        const isNegativeNumber = integerPart.startsWith('-');
        isNegativeNumber && (integerPart = integerPart.substring(1));
        if (units.length < integerPart.length) {
            return { success: false, reason: `转换大写时整数部分最多支持${units.length}位。` };
        }
        //  从右往前处理，最多到 千亿级别，再往上就是 亿亿 ？？？
        const texts: string[] = [];
        const unitsOffset: number = units.length - integerPart.length;
        for (let index = integerPart.length - 1; index >= 0; index--) {
            const digit = `${digits[parseInt(integerPart[index])]}`;
            const unit = units[index + unitsOffset];
            //  构建数值时，进行特殊处理，0进行借位，如 100001，中间的多个0干掉，但要保留 万、亿等特殊单位
            digit != "零"
                ? texts.push(`${digit}${unit}`)
                : (unit == "亿" || unit == "万") && texts.push(unit);
        }
        isNegativeNumber && texts.push("负");
        //  返回格式化值，但对特例做处理，如多个000时，可能出现 亿万在一起的情况，后续这里再优化一下，否则继续扩大时会有问题
        const text = texts.reverse().join("").replace("万万亿", "万亿").replace("亿万", "亿") || "零";
        return { success: true, data: text }
    }
    /**
     * 小数部分转成中文大写
     * - 只处理两位小数，角、分
     * @param decimalPart 
     */
    function toChineseUpperOfDecimalPart(decimalPart: string) {
        if (isStringNotEmpty(decimalPart) != true) {
            return "";
        }
        const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        let one: number = parseInt(decimalPart[0]), two: number = parseInt(decimalPart[1]);
        //  第二个值无效
        if (isNaN(two) == true || two === 0) {
            return isNaN(one) == true || one === 0
                ? ""
                : `${digits[one]}角`
        }
        //  第二个值有效
        else {
            return isNaN(one) == true || one === 0
                ? `零${digits[two]}分`
                : `${digits[one]}角${digits[two]}分`;
        }
    }

    /**
     * 获取数值解析结果的字符串显示
     * - 进行整数，小数位数拼接
     * @param isNegative 是否是负数
     * @param integerPart 数值输入的整数部分；取整数部分绝对值，如-1.2，仅为1
     * @param decimalPart 小数部分
     * @returns 
     */
    function buildResultString(isNegative: boolean, integerPart: string, decimalPart?: string): string {
        let minusSign = isNegative ? "-" : "";
        return isStringNotEmpty(decimalPart)
            ? `${minusSign}${integerPart}.${decimalPart}`
            : `${minusSign}${integerPart}`;
    }
    //#endregion

    return Object.freeze(mountScope<INumberManager>({
        parse,
        sum, subtract, multiply, divide,
        toFixed, toThousands, toChineseUpper
    }, "INumberManager"));
}