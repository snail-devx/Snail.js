<!-- 动画组件
        1、利用group属性，同时实现 Transition、TransitionGroup
        2、使用自定义的类样式+阶段类样式名，从而实现效果范围框定
            不使用 类似“*-enter-from”，太累赘且没有结构从属，容易和全局冲突
        3、后续参照 https://animate.style/ 支持更多动画样式
        4、外部需要自定义动画效果时，采用如下结构；解构更加清晰
            .snail-transition {

                &.enter-active,
                &.leave-active {
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                &.enter-from {
                    opacity: 0;
                    transform: translateY(-30px);
                }

                &.leave-to {
                    opacity: 0;
                    // transform: translateX(30px);
                    transform: translateY(30px);
                    // scale: 0.4;
                }
            }
  -->
<template>
    <component :is="group ? TransitionGroup : Transition" :="$attrs" appear
        :enter-active-class="`${classNames} enter-active`" :enter-from-class="`${classNames} enter-from`"
        :enter-to-class="`${classNames} enter-to`" :leave-active-class="`${classNames} leave-active`"
        :leave-from-class="`${classNames} leave-from`" :leave-to-class="`${classNames} leave-to`">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, Transition, TransitionGroup } from "vue";
import { TransitionOptions } from "./models/transition-model";
import { isArray } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components "snail-transition"
const props = defineProps<TransitionOptions>();
//  2、组件交互变量、常量
/**     动画的类样式名数值，“ ”连接 */
const classNames = computed<string>(() => {
    const array = [props.customClass || "snail-transition"];
    if (isArray(props.effect)) {
        props.effect.length > 0
            ? array.push(...props.effect)
            : array.push("fade");
    }
    else {
        array.push(props.effect as string || "fade")
    }
    return array.join(" ");
});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-transition {

    &.enter-active,
    &.leave-active {
        transition-property: all;
        transition-duration: 0.4s;
        transition-timing-function: ease-in-out;
    }
}

//  淡入淡出     | 进入时 `opacity` 0-1             | 离开时 `opacity` 1 - 0
.snail-transition.fade {

    &.enter-active,
    &.leave-active {
        opacity: 1;
    }

    &.enter-from,
    &.leave-to {
        opacity: 0;
    }
}

//  缩放动画     | 进入时 `scale` 0-1               | 离开时 `scale` 0 - 1            
.snail-transition.scale {

    &.enter-active,
    &.leave-active {
        transform: scale(0);
    }

    &.enter-to,
    &.leave-from {
        transform: scale(1);
    }
}

//  旋转动画     | 进入时 `rotate` 360deg - 0       | 离开时 `rotate` 0 - 360deg 
.snail-transition.rotate {

    &.enter-active,
    &.leave-active {
        transform: rotate(360deg);
    }

    &.enter-to,
    &.leave-from {
        transform: rotate(0);
    }
}

//  上进上出     | 进入时 `translateY` 100% - 0     | 离开时 `translateY` 0 - -100% 
.snail-transition.up {

    &.enter-active,
    &.leave-active {
        transform: translateY(0);
    }

    &.enter-from {
        transform: translateY(100%);
    }

    &.leave-to {
        transform: translateY(-100%);
    }
}

//  下进下出     | 进入时 `translateY` -100% - 0    | 离开时 `translateY` 0 - 100% 
.snail-transition.down {

    &.enter-active,
    &.leave-active {
        transform: translateY(0);
    }

    &.enter-from {
        transform: translateY(-100%);
    }

    &.leave-to {
        transform: translateY(100%);
    }
}

//  上进下出     | 进入时 `translateY` 100% - 0     | 离开时 `translateY` 0 - 100%
.snail-transition.up-down {

    &.enter-active,
    &.leave-active {
        transform: translateY(0);
    }

    &.enter-from,
    &.leave-to {
        transform: translateY(100%);
    }
}

//  下进上出     | 进入时 `translateY` -100% - 0    | 离开时 `translateY` 0 - -100%
.snail-transition.down-up {

    &.enter-active,
    &.leave-active {
        transform: translateY(0);
    }

    &.enter-from,
    &.leave-to {
        transform: translateY(-100%);
    }
}

//  左进左出     | 进入时 `translateX` -100% - 0    | 离开时 `translateX` 0 - -100%
.snail-transition.left {

    &.enter-active,
    &.leave-active {
        transform: translateX(0);
    }

    &.enter-from,
    &.leave-to {
        transform: translateX(-100%);
    }
}

//  右进右出     | 进入时 `translateX` 100% - 0     | 离开时 `translateX` 0 - 100%
.snail-transition.right {

    &.enter-active,
    &.leave-active {
        transform: translateX(0);
    }

    &.enter-from,
    &.leave-to {
        transform: translateX(100%);
    }
}

//  左进右出     | 进入时 `translateX` -100% - 0    | 离开时 `translateX` 0 - 100%
.snail-transition.left-right {

    &.enter-active,
    &.leave-active {
        transform: translateX(0);
    }

    &.enter-from {
        transform: translateX(-100%);
    }

    &.leave-to {
        transform: translateX(100%);
    }
}

//  右进左出     | 进入时 `translateX` 100% - 0     | 离开时 `translateX` 0 - -100% 
.snail-transition.right-left {

    &.enter-active,
    &.leave-active {
        transform: translateX(0);
    }

    &.enter-from {
        transform: translateX(100%);
    }

    &.leave-to {
        transform: translateX(-100%);
    }
}
</style>