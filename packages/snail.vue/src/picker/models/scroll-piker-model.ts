/**
 * 滚动选择器 相关实体
 */

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
}
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
     * 选项文本
     */
    text: string;

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