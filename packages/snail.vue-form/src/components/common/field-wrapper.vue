<!-- 字段包裹组件
  1、将字段的通用信息和功能封装进来，复用通用代码，简化字段渲染
  2、包含字段的标题，字段详细渲染信息采用插槽方式
-->
<template>
  <div class="snail-field-wrapper">
    <div class="field-title" v-if="titleDisabled != true">
      {{ title }}
      <span v-if="required">*</span>
    </div>
    <div class="field-detail">
      <slot></slot>
      <p class="ellipsis desc" v-text="description" />
      <p class="ellipsis error" v-text="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<{ title: string, description: string, required: boolean, error?: string, titleDisabled?: boolean }>();

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-field-wrapper {
  width: 100%;
  overflow-x: hidden;
  min-height: 42px;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;

  // 字段标题+必填标记
  >.field-title {
    width: 120px;
    flex-shrink: 0;
    padding: 12px 0 10px 10px;
    color: #63688e;

    >span {
      color: #f74b4b;
    }
  }

  // 字段详情，追加上 字段描述和验证相关信息
  >.field-detail {
    flex: 1;
    padding: 4px 10px;

    >p.desc,
    >p.error {
      color: #aaa;
      font-size: 12px;
      padding: 0;
      line-height: 20px;
    }

    >p.error {
      color: #f74b4b;
    }
  }
}
</style>