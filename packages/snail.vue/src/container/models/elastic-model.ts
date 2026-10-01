
import { ElasticBaseOptions } from "snail.view";

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