<!-- 组件介绍写到这里 -->
<template>
    <div>inPopup：{{ inPopup }} closePopup：{{ typeof closePopup }}</div>
    <div>$attrs:{{ $attrs }}</div>
    <div> inPageShell:{{ inPageShell }}</div>
    <div>v-Model：绑定值为 {{ valueModel }}</div>
</template>

<script setup lang="ts">
import { useTimer } from 'snail.core';
import { PageShellHandle, PopupHandle } from '../../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ inheritAttrs: false });
const props = defineProps<PopupHandle<any> & PageShellHandle>();
const valueModel = defineModel<string>();
const { onInterval } = useTimer();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
if (props.inPageShell == true) {
    props.setPage({
        type: 'dialog',
        desktop: {
            header: { title: '自定义标题', align: 'center' },
            footer: {
                align: "end",
                buttons: [
                    { id: "1", name: "1" },
                    { id: "2", name: "2" },
                ]
            }
        }
    });
    props.onPage({
        onBack() {
            props.closePopup();
        },
        onButton(id: string) {
            console.log("-- PageShell中按钮事件", id);
        },
        onClose() {
            props.closePopup();
        }
    });
}
//  2、生命周期响应
onInterval(() => valueModel.value = Date.now().toString(), 1000);
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>