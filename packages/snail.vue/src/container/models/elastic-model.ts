
import { IScope } from "snail.core";
import { ElasticBaseOptions, ElasticDetail, IElasticManager } from "snail.view";
import { ReadyEvents } from "../../base/models/base-event";

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
    /**
     * 将子元素滚动到视图内
     * @param el 
     */
    scrollIntoView(el: HTMLElement): void;
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
} & Required<Pick<IElasticManager, "dock" | "refresh" | "scrollTo">>;


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
};
/**
 * 弹性组件【上拉加载、下拉刷新】组件事件
 */
export type ElasticUpdownEvents = ReadyEvents<ElasticUpdownHandle> & {
    /**
     * 下拉刷新事件
     * @param scope 刷新完成后，销毁此作用域，取消刷新效果
     */
    refresh: [scope: IScope];
    /**
     * 上拉加载更多事件
     * @param scope 加载完成后，销毁此作用域，取消加载效果
     * @returns 
     */
    more: [scope: IScope];
}
/**
 * 弹性组件【上拉加载、下拉刷新】组件操作句柄
 */
export type ElasticUpdownHandle = {
    /**
     * 显示上拉加载和下拉刷新效果
     * @param mode 模式：具体显示下拉刷新还是上拉加载
     * @param message refresh 模式时生效（可制定刷新提示语，不传入则使用默认的)
     */
    show(mode: "refresh" | "more", message?: string): void;
    /**
     * 清理上拉加载和下拉刷新状态
     */
    clear(): void;
}