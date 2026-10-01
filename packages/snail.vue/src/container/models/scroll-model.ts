import { IScrollManager, ScrollBaseOptions, ScrollStatus } from "snail.view";

/**
 * 滚动视图配置选项
 */
export type ScrollOptions = ScrollBaseOptions & {
    //  后期增加其他配置
}
/**
 * 滚动视图事件
 */
export type ScrollEvents = {
    /**
     * 滚动视图准备好了
     * - 组件加载完成，可对外提供操作服务
     * @param handle 滚动视图操作接口
     */
    ready: [handle: ScrollHandle];
    /**
     * 滚动视图状态变化时
     * @param now 当前状态
     * @param pre 之前状态
     */
    change: [now: ScrollStatus, pre: ScrollStatus];

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

/**
 * 滚动视图对外操作句柄
 */
export type ScrollHandle = Required<Pick<IScrollManager, "getStatus" | "scroll" | "scrollTo">>;