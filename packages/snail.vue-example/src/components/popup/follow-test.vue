<!-- 跟随效果测试组件 -->
<template>
    <div class="follow-test">
        <button @click="onFollow($event, { followX: 'start' })"
            style="position: absolute;left: 0;top: 0;">FollowX：start</button>
        <button @click="onFollow($event, { followX: 'end' })"
            style="position: absolute;right: 10px;top: 0;">FollowX：end</button>
        <button @click="onFollow($event, { followX: 'center' })"
            style="position: absolute;right: 150px;top: 10px;">FollowX：center</button>
        <button @click="onFollow($event, { followX: 'center' })"
            style="position: absolute;right: 50%;top: 50%;transform: translate(-50%,-50%);">FollowX：center</button>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { FollowOptions, usePopup } from "../../core";
import ChildContent from "./child-content.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const followOpitions: FollowOptions = Object.freeze<FollowOptions>({
    component: shallowRef(ChildContent),
});
const { follow } = usePopup();
//  2、可选配置选项
defineOptions({ name: "FollowTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 启动跟随
 * @param data 
 */
function onFollow(evt: Event, data: Partial<FollowOptions>): void {
    const options = Object.assign({}, followOpitions, data);
    follow(evt.target as HTMLElement, options);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.follow-test {
    //  width:100%；height:100%
    .wh-fill();
    overflow-y: auto;
    position: relative;
}
</style>