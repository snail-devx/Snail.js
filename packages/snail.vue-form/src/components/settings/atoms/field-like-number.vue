<!-- 字段的数值类属性配置
    1、如文本类字段的最大长度、最小长度，数值类控件的最大值、最小值；使用此组件进行配置，外部监听 change 事件同步属性值
    2、结合【../../common/field-setting-proxy.vue】组件使用，公共样式在此组件中定义
    3、字段宽度：这个定制化比较强，先不再这里实现
-->
<template>
  <div class="setting-item">
    <div class="item-title" :class="{ question: isStringNotEmpty(help) }" :title="help" v-text="title" />
    <div class="item-detail" v-if="readonly" v-text="value" />
    <input class="item-detail" v-else type="number" :placeholder="readonly ? '' : placeholder"
      v-model.number="valueRef" />
    <p class="item-error ellipsis" v-text="error" />
  </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty } from "snail.core";
import { nextTick, ref, shallowRef, } from "vue";
import { ChangeEvents, ReadonlyOptions, useReactive } from "snail.vue";
import { FieldNumberPropertySettingOptions } from "../../../models/field-setting";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldNumberPropertySettingOptions>();
const emits = defineEmits<ChangeEvents<number>>();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef = shallowRef(_.value);
const precision: number = _.precision >= 0
  ? parseInt(String(_.precision))
  : -1;
let hasDealValueChange: boolean = false;

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//    监听值变化，小数点位置
_.readonly || watcher(valueRef, (newValue, oldValue) => {
  if (hasDealValueChange == true) {
    hasDealValueChange = false;
    return;
  }
  // @ts-ignore 输入无效值时，设置为undefined
  newValue === "" && (newValue = undefined);
  //  值非空时，进行小数位数和绝对值处理
  if (newValue != undefined && precision >= 0) {
    const tmpValue: string = newValue.toFixed(precision);
    newValue = precision == 0 ? parseInt(tmpValue) : parseFloat(tmpValue);
    _.absValue == true && (newValue = Math.abs(newValue));
    isNaN(newValue) && (newValue = undefined);
  }
  //  处理后发送值改变事件；若值和原始新值不一致时，同步更新
  if (valueRef.value != newValue) {
    hasDealValueChange = true;
    valueRef.value = newValue;
  }
  emits("change", newValue);
});
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>