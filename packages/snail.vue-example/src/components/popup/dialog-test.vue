<!-- 模态弹窗测试组件 -->
<template>
    <button @click="onOpenClick(false)">打开弹窗</button>
    <button @click="onOpenClick(true)">打开弹窗：Wrapper</button>
    <button @click="onConfirm">确认弹窗</button>
    <hr />
    vModelTest值双向绑定到弹窗中：{{ vModelTest }}
</template>

<script setup lang="ts">
import { shallowRef, onActivated, onDeactivated, } from "vue";
import { usePopup, useReactive } from "../../libraries/snail_vue"
import DialogContent from "./child-content.vue"

// 👉 组件定义
//  1、props、data
const popup = usePopup();
const vModelTest = shallowRef<boolean>(true);

//  2、可选配置选项
defineOptions({ name: "DialogTest", inheritAttrs: false, });

// 👉 方法+事件
/**
 * 打开弹窗
 */
function onOpenClick(startWrapper) {
    const dialog = popup.dialog<any, Record<string, any>, boolean>({
        component: DialogContent,
        closeOnEscape: true,
        closeOnMask: true,
        wrapper: startWrapper ? {
            header: { title: "弹窗", class: "fffffffffff-header" },
            content: { scroll: "none", class: "ffffffffffff-content" },
            footer: { class: "fffffffffffff-footer" }
        } : undefined,
        // transition: "scale",
        props: {
            //  接收自定义事件
            onCustomEvent(data: number) {
                console.log("接收自定义事件：", data);
            }
        },
        model: vModelTest,
    });
    dialog.then(data => console.log("返回数据：", data));
    // 测试弹窗自动关闭
    // setTimeout(() => dialog.close(), 4000);
}
/**
 * 确认弹窗
 */
async function onConfirm() {
    const data = await popup.confirm("顶顶顶顶顶顶顶顶", "确定要删除【xxxxd的】吗?");
    console.log(data);
}

// 👉 组件渲染
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>
<style lang="less"></style>