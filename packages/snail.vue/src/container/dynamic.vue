<!-- 动态组件：
    1、支持基于name、url、Component等方式动态加载组件 
    2、支持动态组件中传入插槽使用
    3、可以捕捉url地址错误等异常情况，但组件内部错误，如setup中报错，这里不会进行处理，由被组件自身消化
-->
<template>
    <!-- 加载组件区域 -->
    <component :is="dynamicComponent" v-bind="$attrs" ref="componentRef">
        <template v-for="(_, name) in $slots" v-slot:[name]="slotData" :key="name">
            <slot :name="name" v-bind="slotData" />
        </template>
    </component>
    <!-- 加载错误时的展示区域 -->
    <div class="snail-dynamic-error" v-if="dynamicError != undefined" v-bind="$attrs">
        load component error：<span>{{ dynamicError }}</span>
    </div>
    <!-- 组件加载过程中的等待提示 -->
    <SnailLoading v-else-if="dynamicComponent == undefined" :show="true" :disabled-mask="true" />
</template>

<script setup lang="ts">
import { Component, onActivated, onDeactivated, onErrorCaptured, ref, shallowRef, watch } from "vue";
import { delay, getMessage, isObject, isStringNotEmpty, RunResult, script, throwError, throwIfNullOrUndefined, tidyString } from "snail.core";
import SnailLoading from "../prompt/loading.vue"
import { ComponentOptions } from "./models/component-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { name, component, url } = defineProps<ComponentOptions>();
/**      动态加载组件的ref实例引用 */
const componentRef = ref(null);
/**     动态加载出来的组件：使用浅层相应 */
const dynamicComponent = shallowRef<Component | string>(undefined);
/**     动态加载时的错误信息：使用浅层相应 */
const dynamicError = shallowRef<string | undefined>(undefined);
//  2、可选配置选项
defineOptions({ name: "Dynamic", inheritAttrs: false, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建动态组件
 */
async function buildDynamicComponent() {
    dynamicComponent.value = undefined;
    dynamicError.value = undefined;
    /* 根据优先级加载组件：name > component > url */
    if (isStringNotEmpty(name) == true) {
        dynamicComponent.value = name;
        return;
    }
    if (isObject(component) == true) {
        dynamicComponent.value = component;
        return;
    }
    //  动态Url地址：先执行loading加载，启动script做程序加载
    else if (isStringNotEmpty(url) == true) {
        /**
         * 可以使用 defineAsyncComponent 加载异步组件，但针对错误的处理能力会差一些，无法定制；还是先使用外部模拟方式
            dynamicComponent.value = defineAsyncComponent({
                loader: () => script.load<Component>(url),
                loadingComponent: SnailLoading,
                delay: 100,
                errorComponent: dynamicErrorComponent
            }); 
         */
        //  加载组件：增加延迟效果
        console.log("load dynamic component:", url);
        const task = script.load(url);
        await delay(200);
        //  解析组件组件信息
        try {
            const comp = await task;
            isObject(comp) || isStringNotEmpty(comp)
                ? (dynamicComponent.value = comp)
                : (dynamicError.value = `load component failed:return nulll or undefined. url:${url}.`)
        }
        catch (ex) {
            dynamicComponent.value = undefined;
            dynamicError.value = getMessage(ex);
        }
    }
    else {
        dynamicError.value = "load error: name component、url are all empty.";
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听：构建动态组件，响应外部属性变化（name、component、url）
{
    watch(() => name, buildDynamicComponent);
    watch(() => component, buildDynamicComponent);
    watch(() => url, buildDynamicComponent);
    buildDynamicComponent();
}
//  2、生命周期响应
//      监听component组件报错的错误信息；其他后代节点错误忽略；componentRef为null表示mount前报错了
onErrorCaptured((error, vm, info) => {
    if (componentRef.value == null || vm == componentRef.value) {
        console.error("动态加载组件报错，已拦截错误：", error.message, error);
        return false;
    }
});
//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 动态加载组件是的错误信息
.snail-dynamic-error {
    color: red;

    >span {
        color: gray;
    }
}
</style>