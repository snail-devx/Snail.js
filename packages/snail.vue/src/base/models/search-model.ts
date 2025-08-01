import { PlaceholderOptions, ReadonlyOptions } from "./base-model";

/**
 * 搜索组件配置选项
 */
export type SearchOptions = ReadonlyOptions & PlaceholderOptions & {
    /**
     * 启用【自动完成】
     * - true 时，只要文本变化了，就触发 search 事件
     * - false 时，只有点击【搜索】按钮，才触发 search 事件
     */
    autoComplete?: boolean;
}
/**
 * 搜索组件事件
 */
export type SearchEvents = {
    /**
     * 事件：执行搜索
     * @param value 为搜索文本
     */
    search: [value: string];
}