<!-- dynamic 动态加载组件测试 -->
<template>
    <div style="width:100%;height:100%;position: relative;">
        <Dynamic :name="dynamicName" :component="dynamicComponent!" :url="dynamicUrl" :show="showLoading"
            :title="'dhad西溪新的'">
            <template #="data">
                海鲜好想好想 {{ data }}
            </template>
        </Dynamic>
    </div>
</template>
<script setup lang="ts">
import { Component, shallowRef } from "vue"
import { components } from "snail.vue"
const { Dynamic, Loading } = components;

const showLoading = true;
const dynamicName = shallowRef<string | undefined>("DialogContent");
const dynamicComponent = shallowRef<Component | undefined>(Loading);
const dynamicUrl = shallowRef<string | undefined>("/components/dynamic-test.js#default");
setTimeout(() => {
    dynamicName.value = undefined;
}, 1000);
setTimeout(() => {
    dynamicComponent.value = undefined;
}, 2000);
setTimeout(() => {
    dynamicUrl.value = "/container/dynamic-url-test.js#comp";
}, 3000);
//  组件内部错误，不会处理
setTimeout(() => {
    dynamicUrl.value = "/components/container/dynamic-url-test.js#error";
}, 4000);
setTimeout(() => {
    dynamicUrl.value = "/components/container/dynamic-url-test.js#errorSetup";
}, 6000);
setTimeout(() => {
    dynamicUrl.value = "/components/container/dynamic-url-test.js#errorMounted";
}, 8000);
//  url地址错误
setTimeout(() => {
    dynamicUrl.value = "sxxxx";
}, 10000);
setTimeout(() => {
    dynamicUrl.value = "/components/container/dynamic-url-test.js#default";
}, 12000);
</script>