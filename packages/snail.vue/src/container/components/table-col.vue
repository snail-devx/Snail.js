<!-- 表格列组件；作为Table、TableRow的配套组件，根class不用加 snail 前缀-->
<template>
    <div class="table-col" :style="styleRef" :class="textAlign">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TableColOptions } from "../models/table-model"
import { css } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableColOptions>();
/**     行样式*/
const styleRef = computed<Record<string, any>>(() => css.buildStyle(props));
//  2、可选配置选项
defineOptions({ name: "TableCol", inheritAttrs: true, });
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  列 高度100%，内部元素垂直居中，内部文本默认不换行
.table-col {
    height: 100%;
    white-space: nowrap;
    // flex 布局：display: flex，align-items 为center
    .flex-cross-center();
}

// *****************************************   👉  特殊样式适配    *****************************************
//  2、左对齐时，按钮给左边距
.table-col.left {
    justify-content: flex-start;
}

//  3、居中对齐时，按钮（除第一个外）给左边距
.table-col.center {
    justify-content: center;
}

//  4、对齐时，按钮给右边距
.table-col.right {
    justify-content: flex-end;
}
</style>