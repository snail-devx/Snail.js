<!-- 字段的数值类属性配置
    1、如文本类字段的最大长度、最小长度，数值类控件的最大值、最小值；使用此组件进行配置，外部监听 change 事件同步属性值
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义
    3、字段宽度：这个定制化比较强，先不再这里实现
-->
<template>
  <div class="setting-item">
    <div class="item-title" v-text="title" />
    <div class="item-detail" v-if="readonly" v-text="value" />
    <input class="item-detail" v-else type="number" v-model.trim="valueRef" />
    <p class="item-error ellipsis" v-text="error" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { ChangeEvents, ReadonlyOptions, useReactive } from "snail.vue";
import { FieldNumberPropertySettingOptions } from "../../../models/field-setting";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldNumberPropertySettingOptions>();
const emits = defineEmits<ChangeEvents<number>>();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef = shallowRef(_.value);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//    监听值变化，小数点位置
_.readonly || watcher(valueRef, (newValue, oldValue) => {
  const precision = _.precision >= 0 ? _.precision : 0;
  newValue = Math.trunc(newValue * 10 ^ precision) / 10 ^ precision;
  isNaN(newValue) && (newValue = undefined);
  valueRef.value == newValue
    ? emits("change", newValue)
    : (valueRef.value = newValue);
});
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>