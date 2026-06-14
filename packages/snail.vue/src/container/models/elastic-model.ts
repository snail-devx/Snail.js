
import { ScrollEvents, ScrollOptions } from "./scroll-model";

/**
 * 弹性容器组件 配置选项
 */
export type ElasticOptions = ScrollOptions & {
    /**
     * 滚动条弹簧效果
     * - x 仅在x轴方向上启用弹簧效果
     * - y 仅在y轴方向上启用弹簧效果
     * - both ：同时启用x轴和y轴的弹簧效果
     */
    spring?: "x" | "y" | "both";
    /**
     * 是否启用【下拉刷新】功能
     * - `spring` 为 `y/both`时生效
     * - 满足下拉刷新条件后，触发`refresh`事件，处理完成后调用resolve函数，通知完成刷新数据操作
     */
    downRefresh?: boolean;
    /**
     * 是否启用【上拉加载】功能
     * - `spring` 为 `y/both`时生效
     * - 满足上拉加载条件后，触发`more`事件，处理完成后调用resolve函数，通知完成加载数据操作
     */
    upMore?: boolean;
}

/**
 * 弹性容器组件 事件监听
 */
export type ElasticEvents = ScrollEvents & {
    /**
     * 刷新数据
     * - 配合 `downRefresh`实现下拉刷新功能
     * @param resolve 处理完成后调用resolve函数，通知完成刷新数据操作
     */
    refresh: [resolve: () => void];
    /**
     * 加载更多
     * - 配合 `upMore`实现上拉加载功能
     * @param resolve 处理完成后调用resolve函数，通知完成加载数据操作
     */
    more: [resolve: () => void];
}

/**
 * 弹性组件 对外暴露属性接口
 */
export type ElasticExpose = {
    /**
     * 加载刷新数据
     * - 触发下拉刷新数据
     * @returns 异步任务对象，外部感知任务执行完成
     */
    loadRefresh(): Promise<void>;
    /**
     * 加载更多数据
     * - 触发上拉加载更多数据
     * @returns 异步任务对象，外部感知任务执行完成
     */
    loadMore(): Promise<void>;
}

/**
 * 弹性组件的弹簧状态信息
 */
export type ElasticSpringStatus = {
    /*
     * x轴方向的橡皮筋效果偏移量
     */
    x: number | undefined;
    /**
     * y轴方向的橡皮筋效果偏移量
     */
    y: number | undefined;
}