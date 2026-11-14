/**
 * 弹窗 相关数据结构
 *  1、通用弹窗
 *  2、Follow弹窗
 *  3、Dialog弹窗
 */

import { IAsyncScope } from "snail.core";
import { HeightStyle, WidthStyle } from "snail.view";
import { ShallowRef } from "vue";
import { AppEnv } from "./app-model";
import { ComponentBindOptions, ComponentOptions } from "./component-model";
import { FooterOptions, HeaderOptions } from "./header-footer-model";
import { MotionEffectOptions } from "./motion-model";

//#region ************************************* 公共数据结构 *************************************
/**
 * 弹窗管理器
 */
export interface IPopupManager {
    /**
     * 应用模式
     * - 当前处于哪种模式，方便组件进行多端适配
     */
    readonly mode: AppEnv["mode"],

    /**
     * 弹出
     * - 弹窗位置位置、大小、动画效果等由组件自己完成
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    popup<T, Props = void, Model = void>(options: PopupOptions<Props, Model>): IAsyncScope<T>;
    /**
     * 对话框
     * - 支持指定模态和非模态对话框
     * - 默认垂直水平居中展示
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    dialog<T, Props = void, Model = void>(options: DialogOptions<Props, Model>): IAsyncScope<T>;
    /**
     * 跟随弹窗
     * - 跟随指定的target对象，可跟随位置、大小
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param target 跟随的目标元素
     * @param options 跟随配置选项
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    follow<T, Props = void, Model = void>(target: HTMLElement, options: FollowOptions<Props, Model>): IAsyncScope<T>;
}

/**
 * 弹窗配置选项
 * - {@link ComponentOptions} 哪个组件要弹窗打开
 * - {@link ComponentBindOptions} 组件弹窗打开时，传递的props和model 信息
 * @typeparam Props 组件弹窗打开时传递的的props
 * @typeparam Model 组件弹窗打开时传递的model
 */
export type PopupOptions<Props = void, Model = void> = ComponentOptions & ComponentBindOptions<Props, Model> & PopupExtendOptions;
/**
 * 弹窗扩展配置选项
 * - 约束动画、层级等信息
 */
export type PopupExtendOptions = {
    /**
     * 弹窗动画效果
     * - 为Object时，显式指定 `enter`和`leave`样式，此时应使用`animation`实现动画样式
     * - - 可访问 {@link MOTION}使用内置动画效果
     * - 为string时，自动拼接 in 和 out 作为弹窗打开、关闭时的动画效果类样式
     * - - 打开弹窗时，为 [motion]-in ；关闭弹窗时，为 [motion]-out
     * - - 如传入 "scale"，则打开弹窗为 "scale-in"；关闭弹窗时为 "scale-out"
     * - 为function时，根据弹窗类型和弹窗状态，返回对应的动画完整类样式，内部不会追加in/out
     * - 不建议对`follow`弹窗使用缩放，转场类动画，可能导致跟随效果定位异常
     * - 默认值为 "fade"
     */
    motion?: MotionEffectOptions | string | ((popupType: PopupType, status: PopupStatus) => string);
    /**
     * 弹窗动画效果持续时间
     * - 配合 motion 使用；单位ms，默认200ms
     * - 外部传入自定义动画时，传入动画持续时间，否则可能导致效果异常
     */
    motionDuration?: number;

    /**
     * 弹窗的z-index值
     * - 涉及到多层弹窗时，指定的z-index值若低于前面弹窗，会自动校正
     * - 无特殊情况，建议不指定，内部会自动生成，确保弹窗正确性
     */
    zIndex?: number;
}

/**
 * 模态弹窗 配置选项
 * - 继承 ComponentOptions ，动态加载组件
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type DialogOptions<Props = void, Model = void> = PopupOptions<Props, Model> & DialogExtendOptions;
/**
 * 模态弹窗 扩展配置 
 */
export type DialogExtendOptions = {
    /**
     * 禁用【遮罩层】
     * - 目前没实现，先忽略
    maskDisabled?: boolean;
     */

    /**
     * 点击【遮罩层】时是否关闭弹窗
     * - 针对无遮罩层的弹窗，则点击非【弹窗组件】区域时是否关闭
     */
    closeOnMask?: boolean;
    /**
     * 按下【ESC】健时是否关闭弹窗
     */
    closeOnEscape?: boolean;

    /**
     * 模态弹窗的自定义class
     * - 绑定到模态弹窗的根元素上
     */
    rootClass?: string | string[];
};

/**
 * 跟随弹窗 配置选项
 * - 传入的组件，根据配置跟随 target 位置和大小；
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type FollowOptions<Props = void, Model = void> = PopupOptions<Props, Model> & FollowExtendOptions;
/**
 * 跟随弹窗 扩展配置选项
 * - 约束如何跟随 target 位置和大小
 * - 基于此计算出最终的跟随效果
 */
export type FollowExtendOptions = {
    /**
     * 启用【宽度】跟随
     * - 为true则和 target 宽度保持一致
     * - false时，宽度由 弹出组件 自己维护
     * - 不管是true、还是false，若宽度超过浏览器最大宽度，会进行强制干预
     */
    followWidth?: boolean;
    /**
     * 启用【高度】跟随
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
     * - target点击时
     */
    closeOnTarget?: boolean;
};
/**
 * 跟随策略
 * - 详细值定义，参照 FollowOptions.followX 和 FollowOptions.followY
 */
export type FollowStrategy = "start" | "center" | "end" | "before" | "after" | "ratio";

/**
 * 弹窗句柄
 * - 下放给弹窗的具体业务组件使用
 * @typeparam T 关闭弹窗时，传递的数据类型
 */
export type PopupHandle<T> = {
    /**
     * 组件是否在【弹出窗口】中
     * - 有值时，表示具体的弹窗类型
     */
    readonly inPopup: PopupType;
    /**
     * 弹窗状态
     * - 响应式只读副本，不可修改
     */
    readonly popupStatus: Readonly<ShallowRef<PopupStatus>>;
    /**
     * 关闭弹窗
     * @param data 关闭时传递数据
     */
    readonly closePopup: (data?: T) => void;
};
/**
 * 弹窗类型
 * - popup  ：  普通弹出弹窗
 * - dialog ：  模态对话弹窗
 * - follow ：  跟随效果弹窗
 */
export type PopupType = "popup" | "dialog" | "follow";
/**
 * 弹窗状态
 * - open       打开
 * - active     激活，针对Dialog弹窗生效
 * - unactive   非激活，针对Dialog弹窗生效
 * - closed     关闭
 */
export type PopupStatus = "open" | "active" | "unactive" | "closed";
/**
 * 跟随弹窗句柄
 * - 下放给弹窗的具体业务组件使用
 */
export type FollowHandle<T> = PopupHandle<T> & {
    /**
     * 当前跟随的目标元素
     */
    readonly target: HTMLElement;
    /**
     * x轴的跟随策略
     * - 响应式只读副本，不可修改
     */
    readonly followX: Readonly<ShallowRef<FollowStrategy>>,
    /**
     * y轴的跟随策略
     * - 响应式只读副本，不可修改
     */
    readonly followY: Readonly<ShallowRef<FollowStrategy>>,

    /**
     * Follow弹窗是否【钉住】了
     * - 响应式，可以通过修改此值，控制是否钉住
     * - 为true时，closeOnMask、closeOnEscape失效
     * - 满足 子弹窗 点击等操作时，不自动销毁父级弹窗
     */
    readonly pinned: ShallowRef<boolean>;
};

/**
 * 弹窗外壳 组件配置选项
 * - 各个地方不支持 disabled 配置，这个是弹窗，一锤子买卖，若不需要，直接不构建即可
 */
export type PopupShellOptions<Props = void, Model = void> = {
    /**
     * 弹窗尺寸
     * - 可指定固定值，最大、最小值，也可以指定百分比
     * - 必须指定，否则会出现闪动情况；若不确定最后宽度，可给一个最小宽度、高度值
     * - 原因：content 是异步加载，若不指定则一开始只会渲染header和footer，很小一部分，等 content 加载渲染完成后，弹窗尺寸会变大
     */
    size: WidthStyle & HeightStyle;
    /**
     * Header组件配置
     * - 不传入，则不需要 Header组件
     */
    header?: HeaderOptions;
    /**
     * 内容组件配置
     * - 直接通过 {@link Dynamic} 组件加载作为，不会在外层包裹一层div
     */
    main: ComponentOptions & ComponentBindOptions<Props, Model>;
    /**
     * Footer组件配置
     * - 不传入，则不需要 Footer 组件
     */
    footer?: FooterOptions;
};

/**
 * 弹窗外壳 组件的操作句柄
 * - 下方给业务组件使用
 */
export type PopupShellHandle = {
    /**
     * 是否在【弹窗外壳】中
     * - 取值为 弹窗类型，有值时表示在弹窗外壳中
     */
    inShell: PopupType;

    /**
     * 设置弹窗尾部内容
     * @param footer 尾部配置，为空表示无尾部
     */
    setFooter(footer?: FooterOptions): void;
};
//#endregion

//#region ************************************* 内部使用的数据结构 *************************************
/**
 * 弹窗容器组件配置选项
 * - 方便容器组件中 defineProps 使用
 * - 只有通用基础的属性选项，如模态弹窗和跟随弹窗的特性配置属性，不在此定义，容器自己 & 对应类型
 * - {@link ComponentOptions} 哪个组件要弹窗打开
 * - {@link ComponentBindOptions} 组件弹窗打开时，传递的props和model 信息
 * @typeparam T 关闭弹窗时，传递的数据类型
 * @typeparam Props 组件弹窗打开时传递的的props
 * @typeparam Model 组件弹窗打开时传递的model
 */
export type PopupContainerOptions<T, Props = void, Model = void> = ComponentOptions & ComponentBindOptions<Props, Model> & {
    /**
     * 弹窗上下文
    * - 传递给各个弹窗组件，感知弹窗状态、zindex等信息
     */
    context: PopupContext<T>;
}
/**
 * 弹窗上下文
 * - 传递给各个弹窗根容器组件，感知弹窗状态、zindex等信息
 * - 传递close方法，用于具体弹窗组件中，关闭弹窗
 * @typeparam T 关闭弹窗时，传递的数据类型
 */
export type PopupContext<T = void> = PopupHandle<T> & {
    /**
     * 弹窗Id
     * - 自动分配，全局唯一
     */
    readonly popupId: string,
    /**
     * 实际分配的zIndex值
     */
    readonly zIndex: number;
    /**
     * 弹窗动画名
     * - 响应式只读副本，不可修改
     * - 约束打开、关闭动画；基于 PopupOptions.motion 构建出来的
     * - 具体使用方，将此值绑定的根元素上
     */
    readonly motion: Readonly<ShallowRef<string>>;
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

/**
 * 弹窗应用描述器
 * - 内部使用
 */
export type PopupAppDescriptor = {
    // /**
    //  * 弹窗app实例
    //  */
    // app: App<Element>;
    /**
     * 弹窗状态，响应式
     */
    statusRef: ShallowRef<PopupStatus>;
    /**
     * 弹窗动画效果类样式，响应式
     */
    motionRef: ShallowRef<string>;
    /**
     * 销毁弹窗应用
     */
    destroy(): void;
}
//#endregion