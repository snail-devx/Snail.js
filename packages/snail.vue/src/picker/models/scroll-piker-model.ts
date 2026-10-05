/**
 * 滚动选择器 相关实体
 */

import { TitleOptions } from "../../base/models/base-model";

/**
 * 滚动选择器 组件配置选项
 */
export type ScrollPickerOptions = {
    /**
     * 选择项 数组
     */
    items: ScrollPickItem[];
    /**
     * 选中值
     * - 选择项的`code`值
     */
    value?: string;

    /**
     * 选中项的后缀值
     * - 如年月日选择，在选中值后面追加 年 月 日
     */
    suffix?: string;
    /** 
     * 选中项的后缀值偏移量
     * - 解决选项文本较多的时候，后缀和选项文本重合问题
     */
    suffixOffset?: number;
}
/**
 * 滚动选择器 组件弹窗时配置选项
 */
export type ScrollPickerPopupOptions = TitleOptions & {
    /**
     * 禁用【清空】按钮
     */
    clearDisabled?: boolean;
};

/**
 * 滚动选择器的一个滚动选项
 */
export type ScrollPickItem = {
    /**
     * 选项code
     * - 保持唯一
     */
    code: string;
    /**
     * 选项名称
     */
    name: string;

    /**
     * 是否禁用
     * - 为true,表示禁用此选项，不能被选中
     */
    disabled?: boolean;
}
/**
 * 滚动选择器 组件事件
 */
export type ScrollPickerEvents = {
    /**
     * 滚动选择后
     */
    select: [code: string];
}