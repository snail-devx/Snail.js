import { ScrollbarOptions, ScrollStatus } from "snail.view";

/**
 * 滚动视图配置选项
 */
export type ScrollOptions = ScrollbarOptions & {
    //  后期增加其他配置
}

/**
 * 滚动视图对外暴露方法
 */
export type ScrollExpose = {
    /**
     * 获取滚动状态信息
     * @returns 
     */
    getStatus(): ScrollStatus;

    /**
     * 进行滚动操作
     * - 在当前的滚动条位置基础上，滚动指定单位
     * @param left 水平滚动单位；null、undefined 表示水平不滚动；小于0向左滚动；大于0向右滚动
     * @param top 垂直滚动单位；null、undefined 表示垂直不滚动；小于0向上滚动；大于0向下滚动
     */
    scroll(left?: number, top?: number): void;
    /**
     * 滚动到指定位置
     * @param left 水平滚动条位置；null、undefined 表示水平不滚动
     * @param top 垂直滚动条位置；null、undefined 表示垂直不滚动
     */
    scrollTo(left?: number, top?: number): void;
}


/**
 * 滚动视图事件
 */
export type ScrollEvents = {
    /**
     * 【x轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    xbar: [show: boolean];
    /**
     * 【x轴方向】滚到【最左侧】了
     */
    left: [];
    /**
     * 【x轴方向】滚到【最右侧】了
     */
    right: [];

    /**
     * 【y轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    ybar: [show: boolean];
    /**
     * 【y轴方向】滚到【最顶部】了
     */
    top: [];
    /**
     * 【y轴方向】滚到【最底部】了
     */
    bottom: [];
}