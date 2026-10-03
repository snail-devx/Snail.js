
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
} & Required<Pick<IElasticManager, "dock">>;