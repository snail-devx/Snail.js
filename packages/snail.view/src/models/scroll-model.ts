import { ElementPosition, ElementSize, TouchDetail } from "./observer-model";

/**
 * 接口：滚动视图管理器
 * - 先支持滚动条和滚动位置判断
 * - 后续支持滚动到指定位置，判断是否在可见视图、、、
 */
export interface IScrollManager {
    /**
     * 是否到最左了
     * @param root 视图根节点
     * @returns 
     */
    isLeft(root: HTMLElement): boolean;
    /**
     * 是否到最右了
     * @param root 视图根节点
     * @returns 
     */
    isRight(root: HTMLElement): boolean;
    /**
     * 是否到最顶了
     * @param root 视图根节点
     * @returns 
     */
    isTop(root: HTMLElement): boolean;
    /**
     * 是否到最底了
     * @param root 视图根节点
     * @returns 
     */
    isBottom(root: HTMLElement): boolean;

    /**
     * 获取滚动状态
     * @param root 视图根节点
     * @returns 
     */
    getStatus(root: HTMLElement): ScrollStatus;

    /**
     * 构建滚动视图的自定义样式
     * @param options 滚动视图配置选项
     * @returns 类样式数组 
     */
    buildClassStyle(options: ScrollbarOptions): string[];
}

/**
 * 滚动条配置选项
 */
export type ScrollbarOptions = {
    /**
     * 支持滚动的方向
     * - 默认值：both
     * - 可选配置如下：
     * - - x ：支持水平方向滚动，内容超出时出横向滚动条
     * - - y ：支持垂直方向滚动，内容超出时出纵向滚动条
     * - - both ：支持水平和垂直方向滚动，内容超出时出横向纵向滚动条
     * - - none ： 无滚动条
     */
    scroll: "x" | "y" | "both" | "none";

    /**
     * 滚动条尺寸
     * - normal ：常规，10px
     * - small ：小尺寸，宽度 6px
     * - mini ：迷你尺寸，宽度 4px
     * - none ：无，不显示滚动条，但仍然能够滚动
     */
    barSize?: "normal" | "small" | "mini" | "none";
}

/**
 * 滚动状态信息
 * - 缓存滚动状态 和下次做比对，触发对应事件
 */
export type ScrollStatus = {
    /**
     * 水平滚动条是否显示
     */
    xbar: boolean;
    /**
     * 垂直滚动条是否显示
     */
    ybar: boolean;

    /**
     * 滚动到【左侧】了
     */
    left: boolean;
    /**
     * 滚动到【右侧】了
     */
    right: boolean;
    /**
     * 滚动到【顶部】了
     */
    top: boolean;
    /**
     * 滚动到【底部】了
     */
    bottom: boolean;

    /**
     * 滚动视图宽度
     */
    scrollWidth: number;
    /**
     * 滚动视图高度
     */
    scrollHeight: number;

    /**
     * x轴滚动条的位置
     */
    scrollLeft: number;
    /**
     * y轴滚动条的位置
     */
    scrollTop: number;
}


/**
 * 接口：弹性滚动管理器
 * - 自动实现弹性滚动效果管理
 * - 外部可基于管理器暴露方法，操作滚动效果
 */
export interface IElasticManager {
    // /**
    //  * 禁用弹性滚动
    //  * @param disabled 为true时禁用弹性滚动；否则启用弹性滚动
    //  */
    // disable(disabled: boolean): void;
    /**
     * 滚动到指定位置
     * @param x x轴位置，为空不滚动x轴
     * @param y y轴位置，为空不滚动y轴
     */
    scrollTo(x: number | undefined, y: number | undefined): void;
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