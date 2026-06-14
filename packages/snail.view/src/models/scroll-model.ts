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