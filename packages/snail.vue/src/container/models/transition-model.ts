/**
 * Vue 动画容器组件配置选项
 */
export type TransitionOptions = {
    /**
     * 动画的自定义类样式名称
     * - 默认为 `snail-transition`；不会作为 Transition的 name 属性名
     * - 动画生效时组成的`class`规则为：`customClass`+动画状态；类似`snail-transition enter-from`
     * - 动画状态可选值：
     *  |-------------------|----------------------|
     *  |   --              |--                    |
     *  |   enter-active    | 进入动画的生效状态    |
     *  |   enter-from      | 进入动画的起始状态    |
     *  |   enter-to        | 进入动画的结束状态    |
     *  |   leave-active    | 离开动画的生效状态    |
     *  |   leave-from      | 离开动画的起始状态    |
     *  |   leave-to        | 离开动画的结束状态    |
     * 
     */
    customClass?: string;
    /**
     * 动画效果
     * - 配合 `customClass` 使用，用于标记动画的具体实现
     * - 作为默认动画效果，组装出来的动画效果类似 `snail-transition fade enter-from`
     * - 效果可选值；默认值 fade
     *  |----------------|-------------|----------------------------------|---------------------------------|
     *  |   --           |--           |--                                |--                               |
     *  |   `fade`       | 淡入淡出     | 进入时 `opacity` 0-1             | 离开时 `opacity` 1 - 0           |
     *  |   `scale`      | 缩放动画     | 进入时 `scale` 0-1               | 离开时 `scale` 0 - 1             |
     *  |   `rotate`     | 旋转动画     | 进入时 `rotate` 360deg - 0       | 离开时 `rotate` 0 - 360deg       |
     *  |   `up`         | 上进上出     | 进入时 `translateY` 100% - 0     | 离开时 `translateY` 0 - -100%    |
     *  |   `down`       | 下进下出     | 进入时 `translateY` -100% - 0    | 离开时 `translateY` 0 - 100%     |
     *  |   `up-down`    | 上进下出     | 进入时 `translateY` 100% - 0     | 离开时 `translateY` 0 - 100%     |
     *  |   `down-up`    | 下进上出     | 进入时 `translateY` -100% - 0    | 离开时 `translateY` 0 - -100%    |
     *  |   `left`       | 左进左出     | 进入时 `translateX` -100% - 0    | 离开时 `translateX` 0 - -100%    |
     *  |   `right`      | 右进右出     | 进入时 `translateX` 100% - 0     | 离开时 `translateX` 0 - 100%     |
     *  |   `left-right` | 左进右出     | 进入时 `translateX` -100% - 0    | 离开时 `translateX` 0 - 100%     |
     *  |   `right-left` | 右进左出     | 进入时 `translateX` 100% - 0     | 离开时 `translateX` 0 - -100%    |
     */
    effect?: TransitionEffect | Array<TransitionEffect>;
    /**
     * 是分组动画，还是单个动画
     * - true 则使用  TransitionGroup
     * - false 则使用   Transition 
     */
    group: boolean;
}
export type TransitionEffect = "fade" | "scale" | "rotate"
    | "up" | "down" | "up-down" | "down-up"
    | "left" | "right" | "left-right" | "right-left";