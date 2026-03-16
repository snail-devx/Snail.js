/**
 * 日期相关扩展数据实体
 */

/**
 * 日期格式
 * - yyyy-MM-dd             ：年月日
 * - yyyy-MM                ：年月
 * - yyyy                   ：年
 * - yyyy-MM-dd HH:mm:ss    ：年月日 时分秒
 * - yyyy-MM-dd HH:mm       ：年月日 时分
 */
export type DateFormat = "yyyy-MM-dd" | "yyyy-MM" | "yyyy" | "yyyy-MM-dd HH:mm:ss" | "yyyy-MM-dd HH:mm";
/**
 * 时间格式
 * - HH:mm:ss ： 时分秒
 * - HH:mm ： 时分
 * - HH ： 时
 */
export type TimeFormat = "HH:mm:ss" | "HH:mm" | "HH";

/**
 * 日期值
 * - 描述年月日时分秒值
 */
export type DateValue = {
    /**
     * 年
     */
    year: number;
    /**
     * 月
     */
    month: number;
    /**
     * 日
     */
    day: number;
} & TimeValue;
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
    minute: number;
    /**
     * 秒钟
     */
    second: number;
}