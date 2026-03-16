import { DateFormat, DateValue, IAsyncScope, TimeValue } from "snail.core";
import { DisabledOptions, ValueOptions } from "../../base/models/base-model";

/**
 * 日期时间的功能禁用配置选项
 */
export type DatetimeDisabledOptions = {
    /**
     * 禁用【工具条】
     * - 为true则不显示【确定】、【现在】等按钮的工具条区域
     */
    toolbarDisabled?: boolean;
    /**
     * 禁用【现在】按钮
     * - 为true时不显示【现在】按钮
     */
    nowDisabled?: boolean;
    /**
     * 禁用【清空】按钮
     * - 为true时不显示【清空】按钮
     */
    clearDisabled?: boolean;
}

/**
 * 日期选择器 配置选项
 */
export type DatePickerOptions = {
    /**
     * 已选日期值
     * -格式为 "年-月-日 时:分:秒"
     */
    value?: string;
    /**
     * 日期格式
     * - 默认 “yyyy-MM-dd"
     */
    format?: DateFormat;

    /**
     * 日期最小值
     * - 选择年月日时，早于此值的年月日不可选
     * - 确定时，组合时间选取值，晚于此值的日期+时间选择值无效
     */
    min?: string;
    /**
     * 日期最大值
     * - 选择年月日时，晚于此值的年月日不可选
     * - 组合时间选取值，晚于此值的日期+时间选择值无效
     */
    max?: string;

    /**
     * 最小选择时间
     * - 早于此值的时间不可选
     * - 不参与日期最小值验证，仅在选择时间时框定起始时间
     */
    minPickTime?: string;
    /**
     * 最大选择时间
     * - 不参与日期最大值验证，仅在选择时间时框定结束时间
     */
    maxPickTime?: string;
} & DatetimeDisabledOptions;
/**
 * 时间选择控件配置项
 */
export type TimePickerOptions = {
    /**
     * 已选值
     * - 格式为 “时:分:秒"
     */
    value?: string;
    /**
     * 时间格式
     */
    format?: "HH:mm:ss" | "HH:mm";
    /**
     * 最小时间
     * - 传入值格式为 "时:分:秒" 
     * - 如 "08:30:00"，则08:30:00为最小时间，之前的时间不可选择
     * - 如 "08" ，则 08:00:00为最小时间，之前的时间不可选择
     */
    min?: string;
    /**
     * 最大时间
     * - 传入值格式为 "时:分:秒"
     * - 如 "08:30:00"，则08:30:00为最大时间，之后的时间不可选择
     * - 如 "08" ，则 08:00:00为最大时间，之后时间不可选择
     */
    max?: string;
} & DatetimeDisabledOptions;

/**
 * 日期时间选择 事件
 */
export type DatetimePickerEvents = {
    /**
     * 清空
     */
    clear: [];
    /**
     * 确定选择
     * - @param value 已选则的日期时间
     */
    confirm: [value: string];
}

/**
 * 日期选择器 一个年项
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type DatePickerYearItem = Required<Pick<DateValue, "year"> & DisabledOptions>;
/**
 * 日期选择器 一个月项
 * - 当前月，以及所属的年份
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type DatePickerMonthItem = Required<Pick<DateValue, "month" | "year"> & DisabledOptions & { text: string }>;
/**
 * 日期选择器的一个天项
 * - 当前天，以及所属的月份和年份
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type DatePickerDayItem = Required<Pick<DateValue, "day" | "month" | "year"> & DisabledOptions>;

/**
 * 时间选择器 一个小时项
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type TimePickerHourItem = Required<Pick<TimeValue, "hour"> & DisabledOptions>;
/**
 * 时间选择器 一个分钟项
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type TimePickerMinuteItem = Required<Pick<TimeValue, "minute" | "hour"> & DisabledOptions>;
/**
 * 时间选择器 一个秒项
 * - disabled 标记当前选项是否禁用，基于min和max校验出来的
 */
export type TimePickerSecondItem = Required<TimeValue & DisabledOptions>;