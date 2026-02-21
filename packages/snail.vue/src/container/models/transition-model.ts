/**
 * Vue 动画容器组件配置选项
 */
export type TransitionOptions = {
    /**
     * 动画效果样式
     * - 填写自定义的效果样式class名；不会作为 Transition的 name 属性名
     * - 默认为 snail-transition
     * - 动画的各个阶段，在此样式下增加 
     * - - enter-active enter-from enter-to
     * - - leave-active leave-from leave-to
     */
    effect?: string;
    /**
     * 是分组动画，还是单个动画
     * - true 则使用  TransitionGroup
     * - false 则使用   Transition 
     */
    group: boolean;
}