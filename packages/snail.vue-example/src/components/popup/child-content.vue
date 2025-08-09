<!-- 组件介绍写到这里 -->
<template>
    <div class="test-popup-child-content" style="background-color: rosybrown;">
        <button @click="open();">打开弹窗</button>
        <button @click="onClose">关闭</button>
        <button @click="trigger();">触发事件</button>
        <div>inPopup：{{ inPopup }} closePopup：{{ typeof closePopup }}</div>
        <div>自定义传入内容：{{ $attrs }}</div>
        <div>v-Model：绑定值为 {{ bvModel }}</div>
    </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, DialogHandle, FollowHandle, PopupHandle, usePopup, useTimer } from "../../core"
const { } = components;
import DialogContentTest from "./child-content.vue";

// 👉 组件定义
//  1、props、data
const bvModel = defineModel<boolean>();
const { onInterval } = useTimer();
const {
    inPopup, closePopup,
    onBeforeClose,
} = defineProps<DialogHandle<any> & PopupHandle<any> & FollowHandle<any>>()
const emits = defineEmits<{
    (e: "customEvent", data: number)
}>();
const popup = usePopup();
//  2、可选配置选项
defineOptions({ name: "DialogContentTest", inheritAttrs: true, });

// 👉 方法+事件
function open() {
    popup.dialog<any, Record<string, any>, boolean>({
        // transition: "snail-scale",
        component: DialogContentTest,
        props: {
            xxx: 111,
            onCustomEvent(data: number) {
                console.log("接收自定义事件：", data);
            }
        },
        model: shallowRef(false),
    })
}
/**
 * 关闭事件
 */
function onClose() {
    closePopup();
};
function trigger() {
    emits("customEvent", 12);
}

// 👉 组件渲染
//  1、数据初始化、变化监听；仅dialog对话框才有此方法
onBeforeClose && onBeforeClose(() => {
    return new Date().getSeconds() % 2 == 0 ? false : undefined;
})
onInterval(() => bvModel.value = !bvModel.value, 1000);
//  2、生命周期响应
</script>

<style lang="less">
.test-popup-child-content {
    width: 400px;
    height: 300px;
}
</style>