<!-- 组件介绍写到这里 -->
<template>
    <button @click="onConfirm">确认弹窗</button>
    <button @click="onMobileConfirm">移动端：确认弹窗</button>
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
import { defineComponent } from 'vue';
import { components, useApp, usePrompt } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Env } = components;
//  2、组件交互变量、常量
const prompt = usePrompt();
const promptMobile = usePrompt({ mode: "mobile" });

const tmpComponent = defineComponent({
    template: '<button @click="click">{{mode}}--toast</button>',
    data() {
        return {
            mode: useApp().mode
        }
    },
    setup() {
        const { toast } = usePrompt();
        return {
            click() {
                toast("对对对对对对的点点滴滴哒哒哒哒哒哒哒哒哒哒哒哒哒哒哒", { type: "warn" });
            }
        }
    }
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 确认弹窗
 */
async function onConfirm() {
    const data = await prompt.confirm("顶顶顶顶顶顶顶顶", "确定要删除【xxxxd的】吗?");
    console.log(data);
}
/**
 * 移动端确认弹窗
 */
async function onMobileConfirm() {
    const data = await promptMobile.confirm("顶顶顶顶顶顶顶顶", "确定要删除【xxxxd的】吗?");
    console.log(data);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>