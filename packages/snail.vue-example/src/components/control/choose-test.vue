<!-- 组件介绍写到这里 -->
<template>
    <div style="width: 400px;float: left;">
        <h2>单选模式，复选项样式：</h2>
        <Choose :multi="false" :type="'checkbox'" :items="chooseItems" :readonly="false" style="width: 200px;"
            v-model="checked" @change="console.log" />
        <Choose :multi="false" :type="'checkbox'" :items="chooseItems" :readonly="true" style="width: 200px;"
            v-model="checked" />
        <h2>单选模式，单选项样式：</h2>
        <Choose :multi="false" :type="'radio'" :items="chooseItems" :readonly="false" style="width: 200px;"
            @change="console.log" />
        <Choose :multi="false" :type="'radio'" :items="chooseItems" :readonly="true" style="width: 200px;"
            v-model="checked" />
        <h2>复选模式，复选项样式：</h2>
        <Choose :multi="true" :type="'checkbox'" :items="chooseItems" :readonly="false" style="width: 200px;"
            @change="console.log" />
        <Choose :multi="true" :type="'checkbox'" :items="chooseItems" :readonly="true" style="width: 200px;" />
        <h2>复选模式，单选项样式：</h2>
        <Choose :multi="true" :type="'radio'" :items="chooseItems" :readonly="false" style="width: 200px;"
            @change="console.log" />
        <Choose :multi="true" :type="'radio'" :items="chooseItems" :readonly="true" style="width: 200px;" />
    </div>
    <div style="width: 400px;float: left;">
        <h2>单选模式，复选项样式：</h2>
        <Choose :multi="false" :type="'checkbox'" :items="chooseItems" :readonly="false" :mode="'beautiful'"
            style="width: 200px;" v-model="checked" @change="console.log" />
        <Choose :multi="false" :type="'checkbox'" :items="chooseItems" :readonly="true" :mode="'beautiful'"
            style="width: 200px;" v-model="checked" />
        <h2>单选模式，单选项样式：</h2>
        <Choose :multi="false" :type="'radio'" :items="chooseItems" :readonly="false" :mode="'beautiful'"
            style="width: 200px;" @change="console.log" />
        <Choose :multi="false" :type="'radio'" :items="chooseItems" :readonly="true" :mode="'beautiful'"
            style="width: 200px;" v-model="checked" />
        <h2>复选模式，复选项样式：</h2>
        <Choose :multi="true" :type="'checkbox'" :items="chooseItems" :readonly="false" :mode="'beautiful'"
            style="width: 200px;" @change="console.log" />
        <Choose :multi="true" :type="'checkbox'" :items="chooseItems" :readonly="true" :mode="'beautiful'"
            style="width: 200px;" />
        <h2>复选模式，单选项样式：</h2>
        <Choose :multi="true" :type="'radio'" :items="chooseItems" :readonly="false" :mode="'beautiful'"
            style="width: 200px;" @change="console.log" />
        <Choose :multi="true" :type="'radio'" :items="chooseItems" :readonly="true" :mode="'beautiful'"
            style="width: 200px;" />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../libraries/snail_vue"
const { Choose } = components;
//  选项组件
const chooseItems: { text: string, value: boolean }[] = [
    { text: "升序", value: true },
    { text: "降序", value: false }
];

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const checked = ref<boolean>(true);
const checkeds = ref<boolean[]>([true, false]);
//  2、可选配置选项
defineOptions({ name: "ChooseTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

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