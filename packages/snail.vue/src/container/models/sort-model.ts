import { DisabledOptions } from "../../base/models/base-model";

/**
 * 排序组件 配置选项
 * - disabled       禁用排序效果，不能再拖拽元素排序
 * - 整理部分SortableJs中的配置，不分逻辑不开放
 */
export type SortOptions<T> = DisabledOptions & {
    /**
     * 变化器
     * - 在此元素值发生变化时，重新刷新排序面板
     * - 如在增加元素时，改变此值实现 新元素 可拖拽排序
     */
    changer: T;

    /**
     * 拖动哪个元素
     * - 传入类样式选择器；如 .table-row
     */
    draggable: string;
    /**
     * 拖动的元素上增加的类样式
     * - 执行拖拽时随着鼠标移动元素，脱离文档流了
     * - 可自定义一些样式实现拖动元素的高度、宽度自定义等
     * - 默认：snail-sort-drag
     */
    dragClass?: string;
    /**
     * 幽灵元素类样式名称
     * - 拖动时在面板上占位的元素
     * - 默认：snail-sort-ghost
     */
    ghostClass?: string;
    /**
     * 哪个元素启动拖拽
     * - 传入类样式选择器；如 .sort-handle
     * - 不传入则默认 draggable
     * - 若自定义，则传入 draggable 下的dom元素作为启动拖拽的句柄
     */
    handle?: string;
    /**
     * 过滤器，不需要进行拖动的元素
     * - 传入类样式选择器；如 .sort-handle
     * - 实现特定子元素不触发拖动排序功能
     */
    filter?: string;

    /**
     * 排序组
     * - 组相同时，可跨组拖拽排序
     * - 不传入，则内部生成guid
     */
    group?: string;
    /**
     * 动画时间
     * - 单位ms；默认150ms
     */
    animation?: number;
}

/**
 * 排序组件 事件
 */
export type SortEvents = {
    /**
     * 元素排序顺序变化
     * @param oldIndex 旧位置索引值
     * @param newIndex 新顺序索引值
     */
    update: [oldIndex: number, newIndex: number];
}