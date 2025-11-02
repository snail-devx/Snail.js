<!-- 表格行组件：配合Table组件使用，作为内容行组件 -->
<template>
    <div class="table-row" :style="styleRef">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TableRowOptions } from "../models/table-model"
import { css } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableRowOptions>();
/**     行样式：使用css样式*/
const styleRef = computed(() => css.buildStyle(props));
//  2、可选配置选项
defineOptions({ name: "TableRow", inheritAttrs: true, });
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  行 默认填充满、内部元素垂直居中
.table-row {
    // flex 布局：display: flex，align-items 为center
    .flex-cross-center();
}
</style>