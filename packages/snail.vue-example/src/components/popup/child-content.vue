<!-- 组件介绍写到这里 -->
<template>
    <div style="width: 400px;height: 300px;background-color: rosybrown;">
        <button @click="open();">打开弹窗</button>
        <button @click="closeDialog ? closeDialog(1234) : closePopup()">关闭</button>
        <button @click="trigger();">触发事件</button>
        <div>inDialog：{{ inDialog }} ；closeDialog：{{ typeof closeDialog }}</div>
        <div>inPopup{{ inPopup }} closePopup{{ typeof closePopup }}</div>
        <div>自定义传入内容：{{ $attrs }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, DialogHandle, PopupHandle, usePopup } from "../../core"
const { } = components;
import DialogContentTest from "./child-content.vue";

// 👉 组件定义
//  1、props、data
const {
    inDialog, closeDialog, onDialogClose,
    inPopup, closePopup,
} = defineProps<DialogHandle<any> & PopupHandle<any>>()
const emit = defineEmits<{
    (e: "customEvent", data: number)
}>();
const popup = usePopup();
//  2、可选配置选项
defineOptions({ name: "DialogContentTest", inheritAttrs: true, });

// 👉 方法+事件
function open() {
    popup.dialog({
        component: shallowRef(DialogContentTest),
        props: {
            xxx: 111,
            onCustomEvent(data: number) {
                console.log("接收自定义事件：", data);
            }
        }
    })
}
function trigger() {
    emit("customEvent", 12);
}

// 👉 组件渲染
//  1、数据初始化、变化监听
onDialogClose && onDialogClose(() => {
    return new Date().getSeconds() % 2 == 0 ? false : undefined;
})
//  2、生命周期响应

</script>

<style lang="less"></style>