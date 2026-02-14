import { hasAny, IScope, isNumberNotNaN, isStringNotEmpty, mountScope, RunResult } from "snail.core";
import { INumberFormatter, NumberBaseOptions, NumberFormatResult } from "../models/number-model";

/**
 * 数值格式化器
 * - 进行数值格式处理
 * @param options 数值基础配置选项
 * @returns 格式化器+scope作用域实例
 */
export function useFormatter(options: NumberBaseOptions): INumberFormatter & IScope {
    //#region ************************************* 基础属性定义 **************************************************************
    /** 放大系数，小数位数后移几位（10^n)的n值，无值强制0*/
    const multiplier: number = options.formatMultiplier > 1
        ? Math.trunc(Math.log10(options.formatMultiplier))
        : 0;
    /** 步长值 */
    const step: number = options.step > 1 ? parseInt(String(options.step)) : 1;
    /** 值超过阈值（最大值、最小值）时的处理模式 */
    const clamp = options.clamp || "keep";
    //#endregion

    //#region ************************************* INumberFormatter：接口实现 ***********************************************
    /**
     * 格式化输入文本
     * @param text 输入文本
     * @param isEnd 是否是输入结束，true时，已经输入结束将进行数值精度处理
     * @returns 数值格式化结果
     */
    function format(text: string, isEnd: boolean): NumberFormatResult {
        //  空输入，有效但无number值（清空千分符后空输入也算）
        isStringNotEmpty(text) && (text = text.replace(/,/g, ''));
        if (hasAny(text) == false) {
            return Object.freeze<NumberFormatResult>({
                valid: true,
                number: undefined,
                text: ""
            });
        }
        //  是否为负数，若仅为“-”，则输入不完整
        const isNegative = text.startsWith('-');
        if (isNegative == true) {
            text = text.substring(1);
            if (text.length == 0) {
                return Object.freeze<NumberFormatResult>({
                    valid: isEnd ? false : true,
                    number: undefined,
                    text: isEnd ? "" : "-"
                });
            }
        }
        //  验证剩余的是否时数字；若以“.”结尾，则判定为未完整输入
        if (/^(?:[1-9]\d*|0)(?:\.\d*)?$/.test(text) == false) {
            return Object.freeze<NumberFormatResult>({
                valid: false,
                number: undefined,
                text: ""
            });
        }
        //  这里处理精度 toFixed 采用的时银行家算法，不合适，后期再琢磨一下；不久就小数全部舍去
        isEnd && formatter.precision >= 0 && (text = parseFloat(text).toFixed(formatter.precision));
        const [integerPart, decimalPart] = text.split(".");
        const multiplier = dealMultiplier(integerPart, decimalPart);

        return Object.freeze<NumberFormatResult>({
            valid: true,
            number: isNegative ? -parseFloat(text) : parseFloat(text),
            text: isNegative ? `-${text}` : text,
            isNegative: isNegative,
            isDecimal: decimalPart !== undefined,
            integerPart: integerPart,
            decimalPart: decimalPart,
            integerPartAfterMultiplier: multiplier.integerPart,
            decimalPartAfterMultiplier: multiplier.decimalPart,
        });
    }
    /**
     * 进行阈值检测，检测是否超过设定的最大值、最小值
     * @param number 要检测的数值
     * @returns 检测结果，`number` 新的值，`belowMin`是否低于最小值，`exceedMax`是否超过最大值
     */
    function checkThreshold(number): { number: number, belowMin: boolean, exceedMax: boolean } {
        const belowMin: boolean = formatter.minValue == undefined ? false : number < formatter.minValue;
        const exceedMax: boolean = formatter.maxValue == undefined ? false : number > formatter.maxValue;
        //  超过阈值时的值处理策略
        if (belowMin == true) {
            clamp == "clamp" && (number = formatter.minValue);
        }
        else if (exceedMax == true) {
            clamp == "clamp" && (number = formatter.maxValue);
        }

        return { number, belowMin, exceedMax };
    }

    /**
     * 对数值文本转大写
     * @param result 
     * @returns 大写文本值
     */
    function buildUpper(result: NumberFormatResult): string {
        //  使用系数放大后的整数和小数文本做处理
        if (formatter.upper == true) {
            const rt = buildIntegerPartUpperText(result.integerPartAfterMultiplier);
            if (rt.success != true) {
                return rt.reason;
            }
            const decimalPart = buildDecimalPartUpperText(result.decimalPartAfterMultiplier) || "整";
            return `${result.isNegative ? '负' : ''}${rt.data}元${decimalPart}`;
        }
        return "";
    }
    /**
     * 对数值文本进行千分位格式化
     * @param result 
     * @returns 格式化后的文本值
     */
    function buildThousands(result: NumberFormatResult): string {
        //  行内显示千分位格式文本时，使用原样文本，否则使用系数放大后的
        if (formatter.thousands != "disabled") {
            const integerPart: string = (formatter.thousands == "inline"
                ? result.integerPart
                : result.integerPartAfterMultiplier
            ).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const decimalPart: string = formatter.thousands == "inline"
                ? result.decimalPart
                : result.decimalPartAfterMultiplier;
            return decimalPart === undefined
                ? `${result.isNegative ? '-' : ''}${integerPart}`
                : `${result.isNegative ? '-' : ''}${integerPart}.${decimalPart}`;
        }
        return "";
    }

    /**
     * 基于步长计算值
     * @param number 要重新计算的数值
     * @param isPlus true为+，false为-
     * @returns 新的数值
     */
    function calcByStep(number: number, isPlus: boolean): number {
        /* 避免加减导致的精度丢失，直接截取整数部分做处理 */
        number === undefined && (number = 0);
        let [, tmpStr] = String(number).split(".");
        number = Math.trunc(number) + (isPlus ? step : -step);
        tmpStr = tmpStr === undefined ? String(number) : `${number}.${tmpStr}`;
        return parseFloat(tmpStr);
    }
    //#endregion

    //#region ************************************* 辅助方法                   ***********************************************
    /**
     * 处理放到系数
     * @param integerPart 
     * @param decimalPart 
     * @returns 进行系数放到后的整数和小数部分
     */
    function dealMultiplier(integerPart: string, decimalPart: string): { integerPart: string, decimalPart: string } {
        for (let index = 1; index <= multiplier; index++) {
            let moveStr: string = undefined;
            if (isStringNotEmpty(decimalPart) == true) {
                moveStr = decimalPart[0];
                decimalPart = decimalPart.substring(1);
            }
            moveStr === undefined && (moveStr = "0");
            integerPart += moveStr;
        }
        return { integerPart, decimalPart };
    }

    /**
     * 构建整数部分文本
     */
    function buildIntegerPartUpperText(integerPart: string): RunResult<string> {
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
     * 构建小数部分小写
     * - 只处理两位小数，角、分
     * @param decimalPart 
     */
    function buildDecimalPartUpperText(decimalPart: string) {
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
    //#endregion

    //  构建格式化器，并返回
    const formatter = Object.freeze(mountScope<INumberFormatter>({
        minValue: isNumberNotNaN(options.minValue) ? options.minValue : undefined,
        maxValue: isNumberNotNaN(options.maxValue) ? options.maxValue : undefined,
        precision: options.precision >= 0
            ? parseInt(String(options.precision))
            : undefined,
        thousands: options.thousands || "disabled",
        upper: options.upper === true,

        format, checkThreshold,
        buildUpper, buildThousands,
        calcByStep,
    }, "INumberFormatter"));
    return formatter;
}