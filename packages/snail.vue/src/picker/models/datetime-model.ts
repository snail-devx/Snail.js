import { IAsyncScope } from "snail.core";


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
     * 禁用【秒】功能
     * - 为true时，只选择【时】、【分】
     * - 为false时，选择【时】、【分】、【秒】
     * - 默认启用【秒】功能
     */
    secondDisabled?: boolean;
    /**
     * 禁用【初始化】功能
     * - 仅在`value`为空时才生效，若`value`不为空，则忽略此属性配置
     * - 为true，不自动选中【现在】的时分秒
     * - 为false时，自动选中【现在】的时分秒
     * - 默认自动初始化
     */
    initialDisabled?: boolean;

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
}


/**
 * 时间部分的值
 */
export type TimePartValue = {
    /**
     * 小时
     */
    hour: number | undefined;
    /**
     * 分钟
     */
    minute: number | undefined;
    /**
     * 秒钟
     */
    second: number | undefined;
}

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