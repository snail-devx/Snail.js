import { TransitionOptions } from "./transition-model";

/**
 * 元素组件 配置选项
 */
export type ElementOptions = {
    /**
     * 元素的tag标签，对应HTML元素名
     * - 如 div、span等
     * - 默认 div
     */
    tag?: string;

    /**
     * 是否显示
     * - true  显示
     * - false 隐藏，通过`showMode`确定隐藏时的控制模式
     */
    show: boolean;
    /**
     * 显隐的控制模式
     * - vIf 指令控制显隐，元素被移除
     * - vShow 指令控制显隐，元素style增加`display:none`
     * - 默认值 "vIf"
     */
    showMode?: "vIf" | "vShow";

    /**
     * 元素显隐切换时的动画配置
     */
    transition?: Pick<TransitionOptions, "customClass" | "duration" | "effect">;
    /**
     * 子元素相关配置
     * - 如配置子元素显隐切换时的动画配置
     */
    children?: TransitionOptions;
}