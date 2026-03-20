<!-- loading提示组件：默认行为，支持外部传入插槽
    1、支持外部指定 动画名称，loading根class名称，不指定则默认  snail-loading
    2、可禁止mask遮罩层
    3、支持插槽定制类容，插槽名称default
 -->
<template>
    <Motion :effect="MOTION.fade">
        <div class="snail-loading" :class="{ 'show-mask': maskDisabled != true }" v-bind:class="rootClass" v-if="show">
            <slot v-bind="$attrs"></slot>
        </div>
    </Motion>
</template>

<script setup lang="ts">
import Motion from '../container/motion.vue';
import { MOTION } from '../container/utils/motion-util';
import { LoadingOptions } from './models/loading-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { show = false, maskDisabled = false, rootClass = [], transition = "snail-loading" } = defineProps<LoadingOptions>();
//  2、可选配置选项
defineOptions({ name: "Loading", inheritAttrs: true });
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-loading {
    position: absolute;
    z-index: 10000;
    // x、y起始位置：left:0,top:0
    .left-top-start();
    // width:100%；height:100%
    .wh-fill();

    &.show-mask {
        background-color: rgba(0, 0, 0, 0.15);
    }

    &::before,
    &::after {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        content: "";
        margin-top: -6px;
        margin-left: -18px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        animation: snail-loading-stretch 1s infinite ease-in-out;
    }

    &::before {
        background-color: #279bf1;
    }

    &::after {
        margin-left: 0;
        margin-right: -18px;
        background: #64d214;
        animation-delay: -0.5s;
    }
}

//  默认的loading动画：拉伸效果
@keyframes snail-loading-stretch {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(2);
    }
}
</style>