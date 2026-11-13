<!-- 模态弹窗测试组件 -->
<template>
    <button @click="onOpenClick">打开弹窗</button>
    <button @click="onOpenInShell">使用弹窗壳</button>
    <button @click="onConfirm">确认弹窗</button>
    <button @click="onMobileConfirm">移动端：确认弹窗</button>
    <hr />
    vModelTest值双向绑定到弹窗中：{{ vModelTest }}
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, shallowRef, } from "vue";
import { components, MOTION, PopupShellOptions, usePopup } from "../../libraries/snail_vue";
import DialogContent from "./components/child-content.vue";

// 👉 组件定义
//  1、props、data
const popup = usePopup();
const popupMobile = usePopup({ mode: "mobile" });
const vModelTest = shallowRef<boolean>(true);
const { PopupShell } = components;

//  2、可选配置选项
defineOptions({ name: "DialogTest", inheritAttrs: false, });

// 👉 方法+事件
/**
 * 打开弹窗
 */
function onOpenClick() {
    const dialog = popup.dialog<any, Record<string, any>, boolean>({
        component: DialogContent,
        closeOnEscape: true,
        closeOnMask: true,
        motion: MOTION.bottom,
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
 * 在弹窗壳中打开弹窗
 */
function onOpenInShell() {
    const dialog = popup.dialog<any, PopupShellOptions<Record<string, any>>, boolean>({
        component: PopupShell,
        closeOnEscape: true,
        closeOnMask: true,
        motion: MOTION.scale,
        props: {
            size: { width: "50%", height: "40%" },
            header: { useTo: "dialog", title: "测试弹窗壳" },
            main: {
                component: DialogContent,
                props: {
                    //  接收自定义事件
                    onCustomEvent(data: number) {
                        console.log("接收自定义事件：", data);
                    }
                }
            }
        },
        model: vModelTest,
    });
    dialog.then(data => console.log("返回数据：", data));
}
/**
 * 确认弹窗
 */
async function onConfirm() {
    const data = await popup.confirm("顶顶顶顶顶顶顶顶", "确定要删除【xxxxd的】吗?");
    console.log(data);
}
/**
 * 移动端确认弹窗
 */
async function onMobileConfirm() {
    const data = await popupMobile.confirm("顶顶顶顶顶顶顶顶", "确定要删除【xxxxd的】吗?");
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