<!-- 字段标题设置
    1、负责字段的标题设置处理
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义
-->
<template>
    <div class="setting-item">
        <div class="item-title" v-text="'标题'" />
        <div class="item-detail" v-if="readonly" v-text="field.title" />
        <input class="item-detail" v-else type="text" v-model.trim="valueRef" />
        <p class="item-error ellipsis" v-if="errorRef" v-text="errorRef" />
    </div>
</template>

<script setup lang="ts">
import { ShallowRef, shallowRef, } from "vue";
import { FieldSettingOptions } from "../../../models/field-setting";
import { useReactive } from "snail.vue";
import { isStringNotEmpty } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { field, container, readonly } = defineProps<FieldSettingOptions<any>>();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef: ShallowRef<string> = shallowRef(field.title);
const errorRef: ShallowRef<string> = shallowRef("");

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      监听标题变化，进行实时刷新
readonly || watcher(valueRef, (newValue, oldValue) => {
    errorRef.value = isStringNotEmpty(newValue) == false
        ? "字段标题不允许为空！"
        : container.isDuplicateTitle(field.id, newValue)
            ? "字段标题不允许重复！"
            : undefined
    //  字段合法，刷新字段
    if (errorRef.value == undefined) {
        field.title = newValue;
        container.refresh(field.id, field);
    }
});
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>