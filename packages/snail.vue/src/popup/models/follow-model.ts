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
    followWidth?: boolean;
    /**
     * 启用【高度】更碎
     * - 为true则和 target 高度保持一致
     * - false时，高度由 弹出组件 自己维护
     * - 不管是true、还是false，若高度超过浏览器最大高度，会进行强制干预
     */
    followHeight?: boolean;

    /**
     * x轴方向上跟随 target 的效果
     * - start ： 和 target 起始位置（left）一致
     * - center：和 target 中心位置一致
     * - end ： 和 target 结束位置（right）一致
     * - 不指定则自动计算，得到合适位置（尽可能将元素展示全）；计算顺序
     * - -- 右侧（end）展示，左侧（start）展示，followX = start、followX = end、followX=center、微调left值
     */
    followX?: "start" | "center" | "end";
    /**
     * y轴方向上的位置跟随效果
     * - start ： 和 target 起始位置（top）一致
     * - center：和 target 中心位置一致
     * - end ： 和 target 结束位置（bottom）一致
     * - 不指定则自动计算，得到合适位置（尽可能将元素展示全）；计算顺序
     * - -- 底部（end）展示，顶部（start）展示，followY = start、followY=end、followY=center、微调top值
     */
    followY?: "start" | "center" | "end";

    /**
     * x轴方向上 target 之间的留白空间
     * - 默认0；仅在 followX 为 start、end时生效 
     * - 增加间距，提升展示效果
     * - 
     */
    spaceX?: number;
    /**
     * y轴方向上 target 之间的留白空间
     * - 默认0；仅在 followY 为 start、end时生效 
     * - 增加间距，提升展示效果
     */
    spaceY?: number;

    /**
     * 和 浏览器客户 端之间的留白空间
     * - 弹出组件 和浏览器客户端窗口之间的【留白空间】
     * - 仅在 弹出组件 计算出来位置紧贴浏览器窗口时生效
     * - 若强制指定了 start、end，则对应的起始、结束位置不受此值影响
     */
    spaceClient?: number;

    /**
     * 点击【遮罩层】时是否关闭弹窗
     * - 则点击非【跟随组件】区域时是否关闭
     */
    closeOnMask?: boolean;
    /**
     * 按下【ESC】健时是否关闭弹窗
     */
    closeOnEscape?: boolean;
    /**
     * window窗口【resize】时是否关闭弹窗
     */
    closeOnResize?: boolean;
    /**
     * target改变时是否关闭弹窗
     * - target尺寸、位置变化
     */
    closeOnTarget?: boolean;
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
     * 跟随的目标元素
     */
    target: HTMLElement;
    /**
     * 跟随状态
     */
    followStatus: PopupStatus;
}