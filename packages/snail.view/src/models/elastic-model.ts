/**
 * 弹性视图相关数据结构
 */

import { ElementPosition, TouchDetail } from "./observer-model";

/**
 * 接口：弹性滚动管理器
 * - 自动实现弹性滚动效果管理
 * - 外部可基于管理器暴露方法，操作滚动效果
 */
export interface IElasticManager {
    /**
     * 滚动到指定位置
     * @param x x轴位置，为空不滚动x轴
     * @param y y轴位置，为空不滚动y轴
     */
    scrollTo(x: number | undefined, y: number | undefined): void;
    /**
     * 重置dock配置
     * - 用于在下拉刷新和上拉加载时，进行二次控制
     * @param options 新的dock配置，不传入则取消dock控制
     */
    dock(options?: ElasticDockOptions): void;

    /**
     * 刷新
     * - 重新计算位置，避免漂移出去
     * - 如在滚动区域大小发生变化时刷新位置
     */
    refresh(): void;
}
/**
 * 弹性滚动基础配置选项
 */
export type ElasticBaseOptions = {
    /**
     * 弹性效果启动配置
     * - x 仅在x轴方向上启用弹簧效果
     * - y 仅在y轴方向上启用弹簧效果
     * - both ：同时启用x轴和y轴的弹簧效果
     */
    elastic: "x" | "y" | "both";

    /**
     * 弹性效果距离
     * - 到顶、到底后，还能滚动多长距离
     * - 默认100
     */
    distance?: number;

    /**
     * 弹性因子
     * - 到顶、到底后触发弹簧效果，此时移动距离的弹性因子
     * - 取值范围 0.1-1，值越大，弹性越小，移动距离越短
     * - 默认 0.8
     */
    factor?: number;

    /**
     * 弹性停靠配置
     * - 在滚动结束后，根据配置项，将滚动位置停靠到指定位置
     * - 不传入则默认；无特殊需求不建议传入
     */
    dock?: ElasticDockOptions;
}
/**
 * 弹性滚动的详情
 * - 在回调通知使用方时的参数对象
 */
export type ElasticDetail = {
    /**
     * 弹性滚动状态
     */
    status: ElasticStatus;
    /**
     * 滚动位置
     * - 内容元素相对容器元素的位置
     */
    position: ElementPosition;
    /**
     * 当前的触摸滚动信息
     * - 外部可给基于此判断滚动方向等细节
     */
    touch: TouchDetail;
}
/**
 * 弹性滚动的状态
 * - start      开始滚动：触摸开始
 * - scroll     正在滚动：触摸移动移动中
 * - inertia    惯性补偿偏移解阶段：触摸滚动已结束，但速度触摸速度较快，会做一个补偿偏移量
 * - end        弹性滚动结束
 */
export type ElasticStatus = "start" | "scroll" | "inertia" | "end";

/**
 * 弹性滚动时的停靠配置
 */
export type ElasticDockOptions = {
    /**
     * 弹性滚动到最左侧停靠位置
     * - 等于0：则贴合容器左侧
     * - 大于0：则左侧留白指定距离
     * - 小于0：则左侧遮住指定距离
     * - 无效/未设置：按等于0处理
     */
    left?: number;
    /**
     * 弹性滚动到最右侧时的停靠位置
     * - 等于0：则贴合容器右侧
     * - 大于0：则右侧留白指定距离
     * - 小于0：则右侧遮住指定距离
     * - 无效/未设置：按等于0处理
     */
    right?: number;
    /**
     * 弹性滚动到最顶部时的停靠位置
     * - 等于0：则贴合容器顶部
     * - 大于0：则顶部留白指定距离
     * - 小于0：则顶部遮住指定距离
     * - 无效/未设置：按等于0处理
     */
    top?: number;
    /**
     * 弹性滚动到最底部时的停靠位置
     * - 等于0：则贴合容器底部
     * - 大于0：则底部留白指定距离
     * - 小于0：则底部遮住指定距离
     * - 无效/未设置：按等于0处理
     */
    bottom?: number;
}