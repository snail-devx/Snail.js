/**
 * 搜索组件配置选项
 */
export type SearchOptions = {
    /**
     * 是否为只读模式
     */
    readonly?: boolean;
    /**
     * 搜索提示语
     */
    placeholder?: string;
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