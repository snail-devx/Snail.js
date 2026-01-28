/**
 * 跟随效果 弹窗
 */

import { ShallowRef } from "vue";
import { PopupHandle, PopupOptions, PopupStatusOptions } from "./popup-model";

/**
 * 跟随弹窗 配置选项
 * - 传入的组件，根据配置跟随 target 位置和大小；
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type FollowOptions<Props = void, Model = void> = PopupOptions<Props, Model> & {
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
     * x轴方向上的跟随策略
     * - 支持传入一个或者多个，依次尝试选举最优位置（全宽度展示，否则取最大宽度位置）
     * - 不传入则按照默认策略；["start","end","after","before","center","ratio"]
     * - 可选策略值如下：
     * - - start  ： 起点跟随，和 target 起始位置（left）一致
     * - - end    ： 终点跟随，和 target 结束位置（right）一致
     * - - center ： 中心跟随，和 target 中心位置一致
     * - - before ： 之前跟随，组件在 target 左侧展示
     * - - after  ： 之后跟随，组件在 target 右侧展示
     * - - ratio  ： 比例跟随，按比例（target中心点/窗口宽度）锚定位置，动态计算left值。
     */
    followX?: FollowStrategy | FollowStrategy[];
    /**
     * y轴方向上的跟随策略
     * - 支持传入一个或者多个，依次尝试选举最优位置（全高度展示，否则取最大高度位置）
     * - 不传入则按照默认策略；["after","before","start","end","center","ratio"]
     * - 可选策略值如下：
     * - - start  ： 起点跟随，和 target 起始位置（top）一致
     * - - end    ： 终点跟随，和 target 结束位置（bottom）一致
     * - - center ： 中心跟随，和 target 中心位置一致
     * - - before ： 之前跟随，组件在 target 顶部展示
     * - - after  ： 之后跟随，组件在 target 底部展示
     * - - ratio  ： 比例跟随，按比例（target中心点/窗口高度）锚定位置，动态计算top值。
     */
    followY?: FollowStrategy | FollowStrategy[];

    /**
     * x轴方向上 target 之间的留白空间
     * - 默认0； followX 为 center、ratio 时间距失效
     * - 增加间距，提升展示效果
     * - 
     */
    spaceX?: number;
    /**
     * y轴方向上 target 之间的留白空间
     * - 默认0；followY 为 center、ratio 时间距失效
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
 * 跟随策略
 * - 详细值定义，参照 FollowOptions.followX 和 FollowOptions.followY
 */
export type FollowStrategy = "start" | "center" | "end" | "before" | "after" | "ratio";

/**
 * 跟随弹窗 句柄
 * - 用于在 弹窗组件 内部进行模式判断和关闭跟随弹窗
 */
export type FollowHandle<T> = PopupHandle<T> & {
}
/**
 * 跟随弹窗 扩展配置
 */
export type FollowExtend = PopupStatusOptions & {
    /**
     * 跟随的目标元素
     */
    target: HTMLElement;

    /**
     * x轴方向的跟随策略：响应式
     * - 基于外部传入的跟随策略，计算选举出来的最优策略值
     */
    followX: ShallowRef<FollowStrategy>;
    /**
     * y轴方向的跟随策略：响应式
     * - 基于外部传入的跟随策略，计算选举出来的最优策略值
     */
    followY: ShallowRef<FollowStrategy>;

    /**
     * Follow弹窗是否【钉住】了
     * - 为true时，closeOnMask、closeOnEscape失效
     * - 满足 子弹窗 点击等操作时，不自动销毁父级弹窗
     */
    pinned: ShallowRef<boolean>;
}

/**
 * 跟随策略 配置选项
 */
export type FollowStrategyOptions = {
    /**
     * x轴的跟随策略
     */
    followX?: FollowStrategy,
    /**
     * x轴的跟随策略
     */
    followY?: FollowStrategy;
}

/**
 * 跟随选举结果
 */
export type FollowElectResult = {
    /**
     * 跟随策略
     */
    strategy: FollowStrategy;
    /**
     * 开始位置：x/top
     */
    start: number;
    /**
     * 调整后的尺寸（width/height)
     * - 为undefined表示无需调整尺寸
     */
    size?: number;
}