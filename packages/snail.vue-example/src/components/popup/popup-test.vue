<!-- 组件介绍写到这里 -->
<template>
    <button @click="onPopupClick">popup</button>

    <h2>Toast 测试</h2>
    <Env :mode="'desktop'">
        <h3>桌面端</h3>
        <tmpComponent />
    </Env>
    <Env :mode="'mobile'">
        <h3>移动端</h3>
        <tmpComponent />
    </Env>
</template>

<script setup lang="ts">
import { defineComponent, onActivated, onDeactivated } from "vue";
import { components, IPopupManager, useApp, usePopup } from "../../libraries/snail_vue";
import DialogChildContent from "./child-content.vue";


// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const popup: IPopupManager = usePopup();
const { Env } = components;
//  2、可选配置选项
defineOptions({ name: "PopupText", inheritAttrs: true, });

const tmpComponent = defineComponent({
    template: '<button @click="click">{{mode}}--toast</button>',
    data() {
        return {
            mode: useApp().mode
        }
    },
    setup() {
        const pupup = usePopup();
        return {
            click() {
                pupup.toast("对对对对对对的点点滴滴哒哒哒哒哒哒哒哒哒哒哒哒哒哒哒", { type: "error" });
            }
        }
    }
});

// *****************************************   👉  方法+事件    ****************************************
function onPopupClick() {
    popup.popup({
        component: DialogChildContent,
        props: {

        },
        zIndex: 4000,
    });
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