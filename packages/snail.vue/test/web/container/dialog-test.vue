<!-- 模态弹窗测试组件 -->
<template>
    <button @click="onOpenClick">打开弹窗</button>
</template>

<script setup lang="ts">
import { shallowRef, onActivated, onDeactivated, } from "vue";
import { openDialog } from "../../../src/snail.vue";
import DialogContent from "./dialog-child-content.vue"

// 👉 组件定义
//  1、props、data

//  2、可选配置选项
defineOptions({ name: "DialogTest", inheritAttrs: false, });

// 👉 方法+事件
/**
 * 打开弹窗
 */
function onOpenClick() {
    const dialog = openDialog({
        component: shallowRef(DialogContent),
        closeOnEscape: true,
        closeOnMask: true,
        props: {
            onCustomEvent(data: number) {
                console.log("接收自定义事件：", data);
            }
        }
    });
    dialog.then(data => console.log(data));
    // 测试弹窗自动关闭
    // setTimeout(() => dialog.close(), 4000);
}

// 👉 组件渲染
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>
<style lang="less"></style>