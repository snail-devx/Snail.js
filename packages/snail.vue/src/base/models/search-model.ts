import { PlaceholderOptions, ReadonlyOptions } from "./base-mode";

/**
 * 搜索组件配置选项
 */
export type SearchOptions = ReadonlyOptions & PlaceholderOptions & {

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