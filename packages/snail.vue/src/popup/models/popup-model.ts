/**
 * 公共通用数据结构：
 *  1、在弹窗、模态弹窗、跟随弹窗的效果下复用
 */

import { HeightStyle, WidthStyle } from "snail.view";
import { ShallowRef } from "vue";
import Dynamic from "../../base/dynamic.vue";
import { ComponentBindOptions, ComponentOptions } from "../../base/models/component-model";
import { FooterOptions, HeaderOptions } from "../../base/models/header-footer-model";
import { MotionEffectOptions } from "../../base/models/motion-model";

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
 * - 传递给各个弹窗组件，感知弹窗状态、zindex等信息
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
}
/**
 * 弹窗外壳 组件钩子函数
 * - 下放给业务组件使用
 */
export type PopupShellHook<T> = {
    /**
     * 注册【构建数据】事件方法
     * - 仅在Dialog为使用了wrapper模式时生效，用于在【确认】按钮点击时，构建实际内容组件中的数据
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 取数据时执行的钩子函数，支持异步；若需要阻止弹窗关闭则`fn`方法直接报错即可
     */
    onBuildData(fn: () => T | Promise<T>): void;
}

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
}