/**
 * 时间相关数据实体
 */

/**
 * 时间格式
 * - HH:mm:ss ： 时分秒
 * - HH:mm ： 时分
 * - HH ： 时
 */
export type TimeFormat = "HH:mm:ss" | "HH:mm" | "HH";
/**
 * 时间值，描述时分秒值
 */
export type TimeValue = {
    /**
     * 小时
     */
    hour: number;
    /**
     * 分钟
     */
    minute?: number;
    /**
     * 秒钟
     */
    second?: number;
}

/**
 * 接口：时间值管理器
 * - 统一进行时间的解析、校验、转换等工作
 */
export interface ITimeValueManager {
    /**
     * 当前的时间格式
     */
    readonly format: TimeFormat;
    /**
     * 时间最小值
     */
    readonly min: TimeValue;
    /**
     * 时间最大值
     */
    readonly max: TimeValue;

    /**
     * 从文本解析时间值
     * - 1、解析后会自动执行`correct`方法完成修正工作
     * @param text 时间文本
     * @returns 时间值，无效则返回undefined
     */
    parse(text?: string): TimeValue | undefined;
    /**
     * 基于时间值格式，修正值
     * - 1、按照`format`格式，多余部分设置为Undefined；缺失部分设置为0
     * - 2、格式为 HH 时， mm、ss为多余部分；格式为 HH:mm:ss 时，若仅传入了小时部分，则 mm、ss部分为缺失部分
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns 有效返回`time`自身，否则undefined
     */
    correct(time: TimeValue): TimeValue | undefined;

    /**
     * 将时间值转为数值
     * - 1、自动执行`correct`方法完成校正工作
     * - 2、值为unfined部分，使用0补全填充
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns 数值
     */
    toNumber(time: TimeValue): number | undefined
    /**
     * 将时间值转为字符串
     * - 1、自动执行`correct`方法完成校正工作
     * - 2、根据 `format`,缺失部分使用0补全，多余部分忽略
     * - 3、`hour`为undefined时，返回undefined
     * @param time 时间值
     * @returns 字符串，若对应位置无值，则用 00 补齐
     */
    toString(time: TimeValue): string | undefined;

    /**
     * 是否是有效时间值
     * - 1、执行`correct`方法完成校正工作
     * - 2、基于`format`进行验证
     * @param time 时间值
     * @returns true：有效；false：无效
     */
    validate(time: TimeValue): boolean;
    /**
     * 是否是有效【HH】值
     * - 1、比较小时是否在最大值、最小值范围
     * @param hour 小时
     * @returns true：有效；false：无效
     */
    validateHH(hour: number): boolean;
    /**
     * 是否是有效【HHmm】值
     * - 1、比较`HHmm00`组成时间是否在最大值、最小值范围
     * - 2、不会基于`format`进行格式化
     * @param hour 小时
     * @param minute 分钟
     * @returns true：有效；false：无效
     */
    validateHHmm(hour: number, minute: number): boolean;
    /**
     * 是否是有效【HHmmss】值
     * - 1、比较`HHmmss`组成时间是否在最大值、最小值范围
     * - 2、不会基于`format`进行格式化
     * @param hour 小时
     * @param minute 分钟
     * @param second 秒钟
     * @returns true：有效；false：无效
     */
    validateHHmmss(hour: number, minute: number, second: number): boolean;
}

/**
 * 时间值管理器选项
 */
export type TimeValueManagerOptions = {
    /**
     * 时间格式
     */
    format?: TimeFormat;
    /**
     * 时间最小值
     */
    min?: TimeValue;
    /**
     * 时间最大值
     */
    max?: TimeValue;
}