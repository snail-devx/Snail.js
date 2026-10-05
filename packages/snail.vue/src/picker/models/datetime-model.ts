import { DateFormat, DateValue, TimeFormat, TimeValue } from "snail.core";
import { DisabledOptions, ReadonlyOptions } from "../../base/models/base-model";

/**
 * 日期时间选择器 配置项
 * - 支持选择日期、时间、日期时间
 */
export type DateTimePickerOptions = ReadonlyOptions & DateTimePickerBaseOptions & {
    /**
     * 显示风格
     * - default    默认模式，文本框+图标，文本框填充满+边框
     * - simple     简单模式，有值时才显示文本框，且无边框+不填充满
     * @remarks     移动端时，此配置项无效，始终显示为 default 模式
     */
    display?: "default" | "simple";
};
/**
 * 日期时间选择器 基础配置选项
 */
export type DateTimePickerBaseOptions = {
    /**
     * 日期时间格式
     * - 默认为日期格式 “yyyy-MM-dd"
     * - 不支持 “HH” 格式,容易和“yyyy”冲突，后期看情况考虑
     */
    format?: DateFormat | "HH:mm" | "HH:mm:ss";
    /**
     * 已选日期时间值
     * - 传入和`formart`格式对应值
     * - 传入值和格式不对应时，会忽略
     */
    value?: string;

    /**
     * 日期最小值
     * - 格式为 "年-月-日"
     * - 选择年月日时，早于此值的年月日不可选
     * - `formart`为日期`DateFormat`格式时生效
     */
    minDate?: string;
    /**
     * 日期最大值
     * - 格式为 "年-月-日"
     * - 选择年月日时，晚于此值的年月日不可选
     * - `formart`为日期`DateFormat`格式时生效
     */
    maxDate?: string;
    /**
     * 时间最小值
     * - 格式为 "时:分:秒"
     * - 选择时分秒时，早于此值的时间不可选
     * - `formart`为时间`TimeFormat`格式、或者`DateFormat`包含时间部分时生效
     */
    minTime?: string;
    /**
     * 时间最大值
     * - 格式为 "时:分:秒"
     * - 选择时分秒时，晚于此值的时间不可选
     * - `formart`为时间`TimeFormat`格式、或者`DateFormat`包含时间部分时生效
     */
    maxTime?: string;

    /**
     * 工具条配置
     */
    toolbar?: DateTimePickerToolbarOptions;
}
/**
 * 日期时间选择器 工具条配置项
 */
export type DateTimePickerToolbarOptions = {
    /**
     * 禁用【工具条】
     * - 为true则不显示【确定】、【现在】等按钮的工具条区域
     * - 移动端时，此配置项无效，工具条区域始终显示
     */
    disabled?: boolean;
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
 * 日期时间的功能禁用配置选项
 */
export type DatetimeDisabledOptions = {
    /**
     * 禁用【工具条】
     * - 为true则不显示【确定】、【现在】等按钮的工具条区域
     * - 移动端时，此配置项无效，工具条区域始终显示
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
 * 日期时间格式校正结果
 * - 基于组件传入的 `formart` 校正
 */
export type DatetimeFormatCorrectResult = {
    /** 
     * 日期格式
     * - 传入格式为 TimeFormat 时，此值为undefined
     * - 传入无效格式，或者空时，此值为 yyyy-MM-dd
     */
    dateFormat: DateFormat | undefined;

    /** 
     * 时间格式
     * - 传入格式为 DateFormat 时，此值为undefined
     */
    timeFormat: TimeFormat | undefined;
}

/**
 * 日期选择器 配置选项
 */
export type DatePickerOptions = {
    /**
     * 日期格式
     * - 默认 “yyyy-MM-dd"
     */
    format?: DateFormat;
    /**
     * 已选日期值
     * -格式为 "年-月-日 时:分:秒"
     */
    value?: string;
    /**
     * 渲染模式
     * - default    默认模式，文本框+图标，文本框填充满+边框
     * - simple     简单模式，有值时才显示文本框，且无边框+不填充满
     */
    mode?: "default" | "simple";

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
     * 时间格式
     */
    format?: "HH:mm:ss" | "HH:mm";
    /**
     * 已选值
     * - 格式为 “时:分:秒"
     */
    value?: string;
    /**
     * 渲染模式
     * - default    默认模式，文本框+图标，文本框填充满+边框
     * - simple     简单模式，有值时才显示文本框，且无边框+不填充满
     */
    mode?: "default" | "simple";

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