<!-- 跟随弹窗 容器
    1、不借助popup弹窗中转，直接自己处理即可；中转过去意义不大
    2、不构建新的dom元素，交给外部自己处理
 -->
<template>
    <Dynamic class="snail-follow" :name="props.name" :component="props.component" :url="props.url" :in-follow="true"
        :close-follow="props.closeFollow" v-bind="props.props" ref="follow-root" />
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, onMounted, useTemplateRef, nextTick } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { FollowHandle, FollowOptions } from "../models/follow-model";
import { } from "../utils/follow-util";
import { IObserver, useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<FollowOptions & FollowHandle<any>>();
const { onClient, onSize, onEvent } = useObserver() as IObserver;
/** Follow根元素 */
const rootDom = useTemplateRef("follow-root");
//  2、可选配置选项.
defineOptions({ name: "FollowContainer", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    //  计算跟随效果，在target位置、大小发生改变时计算；windows尺寸发生改变时计算
    //  计算完成后，记录一下自己元素的大小，如果发生变化了则需要重新计算位置
    //  要注意子有多个的情况
    nextTick(() => {
        console.log(rootDom);
    });
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-follow {
    position: fixed;
}
</style>