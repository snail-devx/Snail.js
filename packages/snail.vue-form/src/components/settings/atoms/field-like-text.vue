<!-- 字段的文本类属性值配置
    1、描述、提示语、默认值等；，使用此组件进行配置，外部监听 change 事件同步属性值
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义
    3、字段标题：这个定制化比较强，先不再这里实现
-->
<template>
    <div class="setting-item" :class="{ 'multiple': multiple }">
        <div class="item-title" v-text="title" />
        <div class="item-detail" v-if="readonly" v-text="valueRef" />
        <template v-else>
            <input class="item-detail" v-if="multiple != true" type="text" :title="valueRef" v-model.trim="valueRef" />
            <textarea class="item-detail" v-else :title="valueRef" v-model.trim="valueRef" />
            <p class="item-error ellipsis" v-if="error" v-text="error" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ShallowRef, shallowRef, } from "vue";
import { ChangeEvents, useReactive } from "snail.vue";
import { FieldTextPropertySettingOptions } from "../../../models/field-setting";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldTextPropertySettingOptions>();
const emits = defineEmits<ChangeEvents<string>>();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef: ShallowRef<string> = shallowRef(_.value);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      监听标题变化，进行实时刷新
_.readonly || watcher(valueRef, (newValue, oldValue) => emits("change", newValue, oldValue));
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>