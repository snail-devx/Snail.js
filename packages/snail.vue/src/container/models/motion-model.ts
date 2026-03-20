/**
 * 动画组件配置选项
 * - 实现组件入/退场的动画效果
 */
export type MotionOptions = {
    /**
     * 是否是多元素模式
     * - 为true时，则使用 TransitionGroup 组件实现多元素间动画控制
     * - 为false时，则使用 Transition 组件实现单元素动画控制
     */
    multiple?: boolean;

    /**
     * 动画效果
     * - 为Object时，显式指定 `enter`和`leave`样式，此时应使用`animation`实现动画样式
     * - - 可访问`MOTION`使用内置动画效果
     * - 为string时，为动画的根样式，实现动画效果时：
     * - - 入场动画：`${effect}.enter-active` `${effect}.enter-from` `${effect}.enter-to` 
     * - - 退场动画：`${effect}.leave-active` `${effect}.leave-from` `${effect}.leave-to` 
     * - 为空时，使用`MOTION.fade`值；
     */
    effect?: MotionEffectOptions | string;
    /**
     * 动画持续时间，单位ms，默认200ms
     * - `>0`时生效，否则禁用动画
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
};
/**
 * 动画效果配置选项
 */
export type MotionEffectOptions = {
    /**
     * 入场进入时的动画效果
     * - 用于初始化入场动画；最终映射成 Transition 组件的 `enter-active-class` 属性
     */
    enter?: string;
    /**
     * 退场离开时的动画效果
     * - 用于初始化退场动画；最终映射成 Transition 组件的 `leave-active-class` 属性
     */
    leave?: string;
}