import { IAsyncScope, ITimeValueManager } from "snail.core";

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
     * 禁用【初始化】功能
     * - 仅在`value`为空时才生效，若`value`不为空，则忽略此属性配置
     * - 为true，不自动选中【现在】的时分秒
     * - 为false时，自动选中【现在】的时分秒
     * - 默认自动初始化
     */
    initialDisabled?: boolean;
    /**
     * 禁用【现在】功能
     * - 为true时，不出【现在】功能
     */
    nowDisabled?: boolean;

    /**
     * 时间值管理器
     * - 若传入此值，则 `format`、`min`、`max` 失效
     */
    manager?: ITimeValueManager;
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