import { TransitionProps } from "vue";

/**
 * 动画组件配置选项
 * - 实现组件出/退场的动画效果
 */
export type MotionOptions = {
    /**
     * 是否是多元素模式
     * - 为true时，则使用 TransitionGroup 组件实现多元素间动画控制
     * - 为false时，则使用 Transition 组件实现单元素动画控制
     */
    multiple?: boolean;

    /**
     * 动画库名称
     * - 用于约束动画实现库根类样式名称；
     * - 配合 `enter`和 `leave` 属性组合成 进入/离开时动画的`class`值
     * - 默认"snail-motion"；若需要自定义动画效果，先传入自定义动画库名称
     */
    motion?: string;
    /**
     * 出场进入时的动画效果
     * - 配合 `motion` 组合成 `${montion} ${enter}` 作为进入时的动画类样式
     * - 最终映射成 Transition 组件的 `enter-active-class` 属性
     * - 默认 `fade`；若内置动画效果无法满足需求，则使用string数组组合自定义class样式
     */
    enter?: MotionEffect | string[];
    /**
     * 退场离开时的动画效果
     * - 配合 `motion` 组合成 `${montion} ${leave}` 作为离开时的动画类样式
     * - 最终映射成 Transition 组件的 `leave-active-class` 属性
     * - 默认 `enter` 值；若内置动画效果无法满足需求，则使用string数组组合自定义class样式
     */
    leave?: MotionEffect | string[];

    // /**
    //  * 动画类型
    //  * - 用来确定过渡结束的时间；默认情况下会自动检测;持续时间较长的类型
    //  * - transition 使用 `transition-duration` 属性值来控制动画时长
    //  * - animation 使用 `animation-duration` 属性l值来控制动画时长
    //  */
    // type?: "transition" | "animation";
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
export type MotionEffect = "fade" | "scale" | "rotate"
    | "up" | "down" | "up-down" | "down-up"
    | "left" | "right" | "left-right" | "right-left";
