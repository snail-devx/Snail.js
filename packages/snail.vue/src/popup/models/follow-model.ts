/**
 * 跟随效果 弹窗
 */

import { PopupExtend, PopupOptions, PopupStatus } from "./popup-model";

/**
 * 跟随弹窗 配置选项
 * - 传入的组件，根据配置跟随 target 位置和大小；
 */
export type FollowOptions = PopupOptions & {
    /**
     * 启用【宽度】跟随
     * - 为true则和 target 宽度保持一致
     * - false时，宽度由 弹出组件 自己维护
     * - 不管是true、还是false，若宽度超过浏览器最大宽度，会进行强制干预
     */
    width?: boolean;
    /**
     * 启用【高度】更碎
     * - 为true则和 target 高度保持一致
     * - false时，高度由 弹出组件 自己维护
     * - 不管是true、还是false，若高度超过浏览器最大高度，会进行强制干预
     */
    height?: boolean;

    /**
     * x轴方向上的位置跟随效果
     * - start : 和 target 的 left 值保持一致
     * - center：和 target x轴中心位置一致
     * - end ： 和 target 的 right 值保持一致
     * - 不传入则自动裁决最合适位置：start ，然后 end，最后 center
     */
    followX?: "start" | "center" | "end";
    /**
     * y轴方向上的位置跟随效果
     * - start : 和 target 的 top 值保持一致
     * - center：和 target y轴中心位置一致
     * - end ： 和 target 的 bottom 值保持一致
     * - 不传入则自动裁决最合适位置：start ，然后 end，最后 center
     */
    followY?: "start" | "center" | "end";

    /**
     * x轴方向上的位置跟随偏移量
     * - 默认为0；>0 向右偏移，<0 向左偏移
     * - followX 计算出来的位置值 加 此偏移量值，最最终x方向上的跟随位置
     */
    offsetX?: number;
    /**
     * y轴方向上的位置跟随偏移量
     * - 默认为0；>0 向下偏移，<0 向上偏移
     * - followy 计算出来的位置值 加 此偏移量值，最最终x方向上的跟随位置
     */
    offsetY?: number;

    /**
     * 客户端留白空间
     * - 弹出组件 和浏览器客户端窗口之间的【留白空间】
     * - 仅在 弹出组件 计算出来位置紧贴浏览器窗口时生效
     */
    clientSpace?: number;
};

/**
 * 跟随弹窗 句柄
 * - 用于在 弹窗组件 内部进行模式判断和关闭跟随弹窗
 */
export type FollowHandle<T> = {
    /**
     * 组件是否处于【跟随弹窗】模式
     */
    inFollow?: boolean;
    /**
     * 关闭跟随
     * @param data 关闭时传递数据
     */
    closeFollow(data?: T): void;
}
/**
 * 跟随弹窗 扩展配置
 */
export type FollowExtend = {
    /**
     * 跟随状态
     */
    followStatus: PopupStatus;
    /**
     * 跟随的目标元素
     */
    target: HTMLElement;
}