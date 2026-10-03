import { IScrollManager, ScrollBaseOptions, ScrollStatus } from "snail.view";
import { ReadyEvents } from "../../base/models/base-event";

/**
 * 滚动视图配置选项
 */
export type ScrollOptions = ScrollBaseOptions & {
    //  后期增加其他配置
}
/**
 * 滚动视图事件
 */
export type ScrollEvents = ReadyEvents<ScrollHandle> & {
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