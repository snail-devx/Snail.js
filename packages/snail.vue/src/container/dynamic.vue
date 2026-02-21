<!-- 动态组件：
    1、支持基于name、url、Component等方式动态加载组件 
    2、支持动态组件中传入插槽使用
    3、可以捕捉url地址错误等异常情况，但组件内部错误，如setup中报错，这里不会进行处理，由被组件自身消化
-->
<template>
    <component ref="componentRef" :is="dynamicComponentRef" :="props" v-bind="$attrs">
        <template v-for="(_, name) in $slots" v-slot:[name]="slotData" :key="name">
            <slot :name="name" v-bind="slotData == undefined ? {} : slotData" />
        </template>
    </component>
</template>

<script setup lang="ts">
import { Component, defineComponent, onErrorCaptured, ref, shallowRef } from "vue";
import { delay, isObject, isStringNotEmpty, script, } from "snail.core";
import Loading from "../prompt/loading.vue"
import { useReactive } from "../base/reactive";
import { DynamicOptions } from "./models/dynamic-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineOptions({ name: "Dynamic", inheritAttrs: false, });
const { name, component, url, props = {} } = defineProps<DynamicOptions<Record<string, any>>>();
const { watcher } = useReactive();
//  2、组件交互变量、常量
/**      动态加载组件的ref实例引用 */
const componentRef = ref(null);
/**     动态加载出来的组件：使用浅层相应 */
const dynamicComponentRef = shallowRef<Component | string>();
/**     动态加载时的错误信息：使用浅层相应 */
const errorRef = shallowRef<string | undefined>(undefined);
//  3、特定组件，辅助组件加载渲染展示
/**     loading提示组件 */
const loadingComponent = defineComponent({
    inheritAttrs: false,
    components: { Loading },
    template: "<Loading :mask-disabled='true' />"
});
/**     错误信息显示组件 */
const errorComponent = defineComponent({
    inheritAttrs: false,
    template: `<div class="snail-dynamic-error">load component error：<span v-text="error" /></div>`,
    data() {
        return {
            error: errorRef
        }
    }
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建动态组件
 */
async function buildDynamicComponent() {
    dynamicComponentRef.value = loadingComponent;
    errorRef.value = undefined;
    /* 根据优先级加载组件：name > component > url */
    if (isStringNotEmpty(name) == true) {
        dynamicComponentRef.value = name;
        return;
    }
    if (isObject(component) == true) {
        dynamicComponentRef.value = component;
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
                errorComponent: errorComponent
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
                ? (dynamicComponentRef.value = comp)
                : (errorRef.value = `load component failed:return nulll or undefined. url:${url}.`)
        }
        catch (ex: any) {
            dynamicComponentRef.value = undefined;
            errorRef.value = ex.message;
        }
    }
    else {
        errorRef.value = "load error: name component、url are all empty.";
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听：构建动态组件，响应外部属性变化（name、component、url）
{
    watcher(() => name, buildDynamicComponent);
    watcher(() => component, buildDynamicComponent);
    watcher(() => url, buildDynamicComponent);
    watcher(errorRef, () => isStringNotEmpty(errorRef.value) && (dynamicComponentRef.value = errorComponent));
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
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

// 动态加载组件是的错误信息
.snail-dynamic-error {
    color: red;

    >span {
        color: gray;
    }
}
</style>