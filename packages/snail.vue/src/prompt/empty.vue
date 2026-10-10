<!-- 空状态提醒 组件；
 - 用于数据加载时 无数据、搜索无数据时的提醒
 - 支持外部自定义图片，自定义提示插槽 
 -->
<template>
    <div class="snail-empty" :class="mode">
        <!-- 提醒图片 -->
        <!-- <img :src="imageUrl || defaultImageBase64" /> -->
        <Icon custom :color="'#e6e9f0'" :size="50">
            <path
                d="M876.229411 328.362018H147.924196L0 593.847292v331.331767h1024.051203v-331.331767l-147.821792-265.434071z m-234.098104 268.455023a130.105705 130.105705 0 0 1-260.211411 0H61.084654l118.431522-226.008101h664.865243l118.431522 226.008101zM512.486424 56.220411a25.60128 25.60128 0 0 1 25.60128 25.60128V197.129856a25.60128 25.60128 0 0 1-51.20256 0V81.821691a25.60128 25.60128 0 0 1 25.60128-25.60128z m-234.046902 51.20256a25.60128 25.60128 0 0 1 35.022551 9.370069l57.654083 99.896194a25.60128 25.60128 0 0 1-44.39262 25.601281L269.069453 142.39432a25.60128 25.60128 0 0 1 9.370069-34.971349z m468.093805-2.20171a25.60128 25.60128 0 0 1 9.370068 35.022551l-57.654083 99.844992a25.60128 25.60128 0 1 1-44.392619-25.60128l57.654083-99.844992a25.60128 25.60128 0 0 1 35.022551-9.370068z" />
        </Icon>
        <!-- 提醒消息 -->
        <slot>
            <div class="message" v-text="message || '无数据'" />
        </slot>
    </div>
</template>

<script setup lang="ts">
import Icon from "../base/icon.vue";
import { useApp } from "../base/utils/app-util";
import { EmptyOptions } from "./models/empty-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<EmptyOptions>();
const { mode } = useApp();
//  2、可选配置选项
defineOptions({ name: "Empty", inheritAttrs: true, });
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-empty {
    // width:100%；height:100%
    .wh-fill();
    // flex 布局：display: flex，align-items、justify-content 都为center
    .flex-center();
    flex-direction: column;

    &.mobile {
        min-height: 250px;
    }

    &:not(.mobile) {
        min-height: 150px;
    }

    >img {
        height: 60px;
        width: 60px;
    }

    >div.message {
        color: #babdc2;
        font-weight: 400;
        padding: 10px;
    }
}
</style>