/**
 * 时间 相关扩展
 * - 系统不存在Time类型，独立一个class类来专门处理时间相关值
 */

// import { TimeValue } from "../models/time-model";
import { ITimeValueManager, TimeValue, TimeFormat, TimeValueManagerOptions } from "../models/time-model";
import { correctDate } from "./date";
import { correctNumber, isNumberInRange } from "./number";
import { isStringNotEmpty, padStart } from "./string";

/**
 * 获取时间值
 * - 分析日期的时分秒部分的值转成 TimeValue
 * @param date 日期对象
 * @returns 时间值；若date不是有效日期，则返回undefined
 */
export function getTimeValue(date: Date): TimeValue | undefined {
    date = correctDate(date, undefined);
    return date != undefined
        ? {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        }
        : undefined;
}
/**
 * 从文本解析时间值
 * @param text 时间文本
 * @returns 时间值，无效则返回undefined
 */
export function parseTimeValue(text: string): TimeValue | undefined {
    if (isStringNotEmpty(text)) {
        const [h, m, s] = text.split(":");
        const time: TimeValue = { hour: undefined, minute: undefined, second: undefined };
        time.hour = parseInt(h);
        time.minute = parseInt(m);
        time.second = parseInt(s);
        //  基础验证，需有效值
        return correctTimeValue(time);
    }
    return undefined;
}
/**
 * 校正时间
 * - hour在0-23之间，minute、second在0-59之间
 * - 若传入了不在这些区间内的数值，则整体强制为无效时间值
 * - 若hour为undefined，则返回undefined
 * @param time 时间值
 * @returns 验证通过返回time自身；验证失败返回undefined
 */
export function correctTimeValue(time: TimeValue): TimeValue | undefined {
    /** 小时部分必须🉐有值且在0-23之间，不然没有意义 */
    if (time) {
        //  传入值不是有效数值时，强制undefined
        time.hour = correctNumber(time.hour, undefined);
        time.minute = correctNumber(time.minute, undefined);
        time.second = correctNumber(time.second, undefined);
        //  小时部分
        if (isNumberInRange(time.hour, 0, 23) == false) {
            return undefined;
        }
        if (time.minute != undefined && isNumberInRange(time.minute, 0, 59) == false) {
            return undefined;
        }
        if (time.second != undefined && isNumberInRange(time.second, 0, 59) == false) {
            return undefined;
        }
        //  分钟为Undefined，则强制秒钟为undefined
        time.minute == undefined && (time.second = undefined);

        return time;
    }
    return undefined;
}
/**
 * 校正时间格式
 * @param format 时间格式
 * @param newValue 新的时间格式
 * @returns format是有效时，返回`format`，其他情况返回`newValue`
 */
export function correctTimeFormat(format: TimeFormat, newValue: TimeFormat): TimeFormat {
    switch (format) {
        case "HH":
        case "HH:mm":
        case "HH:mm:ss":
            return format;
        default:
            return newValue;
    }
}

/**
 * 格式化时间值
 * @param time 时间值
 * @param format 格式，默认`HH:mm:ss`
 * @returns 格式化后的时间字符串；time无效返回undefined
 */
export function formatTimeValue(time: TimeValue, format?: TimeFormat): string | undefined {
    //  考虑再优化一下，避免一开始构建全部构建出来
    time = correctTimeValue({ ...time });
    if (time) {
        const { hour, minute, second } = time;
        const items: string[] = [
            padStart(hour | 0, 2, "0"),
            padStart(minute | 0, 2, "0"),
            padStart(second | 0, 2, "0")
        ];
        switch (format) {
            case "HH": items.splice(1); break;
            case "HH:mm": items.splice(2); break;
            default: break;
        }
        return items.join(":");
    }
    return undefined;
}

/**
 * 使用时间值管理器
 * @param options 配置选项：时间格式、最大值、最小值校验
 * @returns 时间值管理器
 */
export function useTimeValue(options?: TimeValueManagerOptions): ITimeValueManager {
    //  初始值校验
    const { format, min, max } = correctOptions(options);

    //#region ************************************* ITimeValueManager 接口实现 *************************************
    /**
    * 从文本解析时间值
    * - 1、解析后会自动执行`correct`方法完成修正工作
    * @param text 时间文本
    * @returns 时间值，若`text`无效，将返回undefined
    */
    function parse(text?: string): TimeValue | undefined {
        const time: TimeValue = parseTimeValue(text);
        return correct(time);
    }
    /**
     * 基于时间值格式，修正值
     * - 1、按照`format`格式，多余部分设置为Undefined；缺失部分设置为0
     * - 2、格式为 HH 时， mm、ss为多余部分；格式为 HH:mm:ss 时，若仅传入了小时部分，则 mm、ss部分为缺失部分
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns `time`自身
     */
    function correct(time: TimeValue): TimeValue | undefined {
        //  基于时间格式处理：多余部分设置为undefined、缺失部分设置为0
        time = correctTimeValue(time);
        if (time) {
            switch (format) {
                case "HH":
                    time.minute = undefined;
                    time.second = undefined;
                    break;
                case "HH:mm":
                    time.second = undefined;
                    time.minute == undefined && (time.minute = 0);
                    break;
                default:
                    time.minute == undefined && (time.minute = 0);
                    time.second == undefined && (time.second = 0);
                    break;
            }
        }
        return time;
    }

    /**
     * 将时间值转为数值
     * - 1、自动执行`correct`方法完成校正工作
     * - 2、值为unfined部分，使用0补全填充
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns 数值
     */
    function toNumber(time: TimeValue): number | undefined {
        time = correct({ ...time });
        return time
            ? getTimeNumber(time.hour, time.minute, time.second)
            : undefined;
    }
    /**
     * 将时间值转为字符串
     * - 1、自动执行`correct`方法完成校正工作
     * - 2、根据 `format`,缺失部分使用0补全，多余部分忽略
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns 字符串，若对应位置无值，则用 00 补齐
     */
    function toString(time: TimeValue): string | undefined {
        return formatTimeValue(time, format);
    }

    /**
     * 是否是有效时间值
     * - 1、执行`correct`方法完成校正工作
     * - 2、基于`format`进行验证
     * @param time 时间值
     * @returns true：有效；false：无效
     */
    function validate(time: TimeValue): boolean {
        time = correct({ ...time });
        if (time) {
            const { hour, minute, second } = time;
            switch (format) {
                case "HH": return validateHH(hour);
                case "HH:mm": return validateHHmm(hour, minute);
                default: return validateHHmmss(hour, minute, second);
            }
        }
        return false;
    }
    /**
     * 是否是有效【HH】值
     * - 1、比较小时是否在最大值、最小值范围
     * @param hour 小时
     * @returns true：有效；false：无效
     */
    function validateHH(hour: number): boolean {
        return hour != undefined
            ? isNumberInRange(hour, min.hour, max.hour)
            : false;
    }
    /**
    * 是否是有效【HHmm】值
    * - 1、比较`HHmm00`组成时间是否在最大值、最小值范围
    * - 2、不会基于`format`进行格式化
    * @param hour 小时
    * @param minute 分钟
    * @returns true：有效；false：无效
    */
    function validateHHmm(hour: number, minute: number): boolean {
        if (validateHH(hour) && isNumberInRange(minute, 0, 59)) {
            const current = getTimeNumber(hour, minute, 0);
            const minNumber = getTimeNumber(min.hour, min.minute, 0);
            const maxNumber = getTimeNumber(max.hour, max.minute, 0);
            return isNumberInRange(current, minNumber, maxNumber);
        }
        return false;
    }
    /**
    * 是否是有效【HHmmss】值
    * - 1、比较`HHmmss`组成时间是否在最大值、最小值范围
    * - 2、不会基于`format`进行格式化
    * @param hour 小时
    * @param minute 分钟
    * @param second 秒钟
    * @returns true：有效；false：无效
    */
    function validateHHmmss(hour: number, minute: number, second: number): boolean {
        if (validateHH(hour) && isNumberInRange(minute, 0, 59) && isNumberInRange(second, 0, 59)) {
            const current = getTimeNumber(hour, minute, second);
            const minNumber = getTimeNumber(min.hour, min.minute, min.second);
            const maxNumber = getTimeNumber(max.hour, max.minute, max.second);
            return isNumberInRange(current, minNumber, maxNumber);
        }
        return false;
    }
    //#endregion

    //  范围值对象
    return Object.freeze<ITimeValueManager>({
        format, min, max,
        parse, correct,
        toNumber, toString,
        validate, validateHH, validateHHmm, validateHHmmss
    });
}

//#region ************************************* 内部辅助方法，不对外开放 ****************************************
/**
 * 获取时分秒组成的数值
 * - 按照HHmmss格式的值
 * - 用于进行大小比较；缺失部分用0补齐
 * @param hour 
 * @param minute 
 * @param second 
 * @returns 
 */
function getTimeNumber(hour: number, minute: number, second: number) {
    return (hour || 0) * 10000 + (minute || 0) * 100 + (second || 0)
}
/**
 * 校正时间值管理器配置选项
 * - 给出默认值，并填充最大值和最小值区间，方便后续判断
 * @param options 
 * @returns 校正后的值，非空
 */
function correctOptions(options?: TimeValueManagerOptions): Required<TimeValueManagerOptions> {
    let { format, min, max } = { ...options };
    format = correctTimeFormat(format, "HH:mm:ss");
    //  最小值不传入则为0
    min = correctTimeValue({ ...min }) || { hour: 0 };
    min.minute == undefined && (min.minute = 0);
    min.second == undefined && (min.second = 0);
    Object.freeze(min);
    //  最大值不传入则为 23:59:59
    max = correctTimeValue({ ...max }) || { hour: 23 };
    max.minute == undefined && (max.minute = 59);
    max.second == undefined && (max.second = 59);
    Object.freeze(max);

    return { format, min, max };
}
//#endregion