
import { ElasticBaseOptions, ElasticDetail, IElasticManager } from "snail.view";

/**
 * 弹性视图组件配置选项
 * - 是否启用下拉刷新和上拉加载
 */
export type ElasticOptions = ElasticBaseOptions & {
    /**
     * 弹性视图滚动时是否显示滚动条
     */
    bar: boolean;
}

/**
 * 弹性组件操作句柄
 */
export type ElasticHandle = {

}

/**
 * 弹性组件的插槽句柄
 */
export type ElasticSlotHandle = {
    /**
     * 弹性配置
     */
    elastic: ElasticBaseOptions["elastic"],

    /**
     * 要进行弹性滚动的目标dom元素
     */
    target: HTMLDivElement;
    /**
     * 弹性滚动的详情
     * - 可监听此对象变化实时获取滚动状态
     */
    detail?: ElasticDetail,
} & Required<Pick<IElasticManager, "dock" | "refresh">>;


/**
 * 弹性组件【上拉加载、下拉刷新】组件配置选项
 */
export type ElasticUpdownOptions = {
    /**
     * 是否启用【上拉加载】功能
     * - {@link ElasticOptions.elastic}  为 `y/both`时生效
     * - 满足上拉加载条件后，触发`more`事件，处理完成后调用resolve函数，通知完成加载数据操作
     */
    up: boolean;
    /**
     * 是否启用【下拉刷新】功能
     * - {@link ElasticOptions.elastic} 为 `y/both`时生效
     * - 满足下拉刷新条件后，触发`refresh`事件，处理完成后调用resolve函数，通知完成刷新数据操作
     */
    down: boolean;

    /**
     * 数据加载方法
     * - 触发上拉加载和下拉刷新时调用此方法通知外部加载数据
     * @param mode 回调模式，`refresh`为下拉刷新，`more`为上拉加载
     * @returns 异步任务，处理完成后通知完成操作
     */
    readonly load: (mode: "refresh" | "more") => Promise<any>;
};
/**
 * 弹性组件【上拉加载、下拉刷新】组件操作句柄
 */
export type ElasticUpdownHandle = {
    /**
     * 触发下拉刷新
     */
    refresh(): void;
}