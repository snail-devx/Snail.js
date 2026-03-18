/**
 * 动画效果配置选项
 */
export type MotionEffectOptions = {
    /**
     * 入场进入时的动画效果
     * - 配合 `motion` 组合成 `${montion} ${enter}` 作为进入时的动画类样式
     * - 最终映射成 Transition 组件的 `enter-active-class` 属性
     * - 默认 `fade-in`；若内置动画效果无法满足需求，则使用string数组组合自定义class样式
     */
    enter?: string;
    /**
     * 退场离开时的动画效果
     * - 配合 `motion` 组合成 `${montion} ${leave}` 作为离开时的动画类样式
     * - 最终映射成 Transition 组件的 `leave-active-class` 属性
     * - 默认 `fade-out`；若内置动画效果无法满足需求，则使用string数组组合自定义class样式
     */
    leave?: string;
}

/**
 * 动画组件配置选项
 * - 实现组件出/退场的动画效果
 */
export type MotionOptions = MotionEffectOptions & {
    /**
     * 是否是多元素模式
     * - 为true时，则使用 TransitionGroup 组件实现多元素间动画控制
     * - 为false时，则使用 Transition 组件实现单元素动画控制
     */
    multiple?: boolean;

    /**
     * 动画持续时间，单位ms，默认200ms
     * - 为0则禁用动画
     */
    duration?: number;
    /**
     * 动画模式
     * - default（默认） 入场和退场动画同时执行
     * - in-out 入场动画先执行，退场动画后执行
     * - out-in 退场动画先执行，入场动画后执行
     * - 在多个元素之间切换时生效，一个元素的显隐切换无效果
     */
    mode?: "in-out" | "out-in" | "default";
}