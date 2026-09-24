<!-- 组件介绍写到这里 -->
<template>
    将样式注入到head中，namespace：{{ namespace }}
    <div :class="namespace">
        <button @click="onChangeStyle">改变样式</button>
        <div class="text padding" :style="{ overflowX: 'hidden' }">测试实例</div>
        <span>测试标签选择</span>
    </div>
</template>

<script setup lang="ts">
import { IScope } from "snail.core";
import { onUnmounted } from "vue";
import { useStyle } from "../../libraries/snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components

//  2、组件交互变量、常量
const { namespace, build } = useStyle();
let scope: IScope;


// *****************************************   👉  方法+事件    ****************************************
function onChangeStyle() {
    scope && scope.destroy();
    const rt = build([
        {
            rule: ".text",
            styles: {
                height: "200px",
                color: "red",
                overflowX: "hidden"
            }
        },
        {
            rule: ".padding",
            styles: {
                paddingLeft: "20px",
                backgroundColor: "gray"
            }
        }, {
            rule: "span",
            styles: {
                border: "1px solid red"
            }
        }
    ]);
    scope = rt;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听

//  2、生命周期响应
onUnmounted(() => scope && scope.destroy());

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>