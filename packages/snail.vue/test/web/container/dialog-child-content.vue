<!-- 组件介绍写到这里 -->
<template>
    <div>
        <button @click="open();">打开弹窗</button>
        <button @click="closeDialog(1234);">关闭</button>
        <button @click="trigger();">触发事件</button>
        <div>inDialog：{{ inDialog }} ；closeDialog：{{ typeof closeDialog }}</div>
        <div>自定义传入内容：{{ $attrs }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { openDialog } from "../../../src/snail.vue";
import { DialogHandle } from "../../../src/container/models/dialog-model";
import DialogContentTest from "./dialog-child-content.vue";

// 👉 组件定义
//  1、props、data
const { inDialog, closeDialog, onDialogClose, returnFalse } = defineProps<DialogHandle<any> & { returnFalse: boolean }>()
const emit = defineEmits<{
    (e: "customEvent", data: number)
}>();
//  2、可选配置选项
defineOptions({ name: "DialogContentTest", inheritAttrs: true, });

// 👉 方法+事件
function open() {
    openDialog({
        component: shallowRef(DialogContentTest),
        props: {
            xxx: 111,
            //  向下传递false标记，拦截弹窗关闭操作
            returnFalse: true,
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
onDialogClose(() => {
    return returnFalse ? false : undefined;
})
//  2、生命周期响应

</script>

<style lang="less"></style>