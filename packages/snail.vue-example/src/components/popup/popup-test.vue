<!-- 组件介绍写到这里 -->
<template>
    <button @click="onPopupClick">popup</button>
    <button @click="onToastClick">toast</button>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { IPopupManager, usePopup } from "../../libraries/snail_vue"
import DialogChildContent from "./child-content.vue";


// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const popup: IPopupManager = usePopup();
//  2、可选配置选项
defineOptions({ name: "PopupText", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
function onPopupClick() {
    popup.popup({
        component: DialogChildContent,
        props: {

        },
        zIndex: 4000,
    });
}
function onToastClick() {
    popup.toast("close", "对对对对对对的点点滴滴哒哒哒哒哒哒哒哒哒哒哒哒哒哒哒");
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>