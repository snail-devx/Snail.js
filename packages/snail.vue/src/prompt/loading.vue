<!-- loading提示组件：默认行为，支持外部传入插槽
    1、支持外部指定 动画名称，loading根class名称，不指定则默认  snail-loading
    2、可禁止mask遮罩层
    3、支持插槽定制类容，插槽名称default
 -->
<template>
    <Transition :name="transition">
        <div class="snail-loading" :class="{ 'show-mask': disabledMask != true }" v-bind:class="rootClass" v-if="show">
            <slot v-bind="$attrs"></slot>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { LoadingOptions } from './models/loading-model';

const {
    show = false,
    disabledMask = false,
    rootClass = [],
    transition = "snail-loading",
} = defineProps<LoadingOptions>();
defineOptions({ name: "SnailLoading", inheritAttrs: false });
</script>

<style lang="less">
.snail-loading {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    z-index: 10000;
    top: 0;
    left: 0;

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

//  进入和销毁时的动画效果：https://cn.vuejs.org/guide/built-ins/transition.html
.snail-loading-enter-active,
.snail-loading-leave-active {
    transition: opacity 0.5s ease-in-out;
}

.snail-loading-enter-from,
.snail-loading-leave-to {
    opacity: 0;
}
</style>