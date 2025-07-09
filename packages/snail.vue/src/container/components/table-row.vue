<!-- 表格行组件：配合Table组件使用，作为内容行组件 -->
<template>
    <div class="table-row" :style="rowStyle">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TableRowOptions } from "../models/table-model"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableRowOptions>();
/**     行样式*/
const rowStyle = computed<Record<string, any>>(() => {
    const style: CSSStyleDeclaration = Object.create(null);
    props.height > 0 && (style.height = props.height + (props.unit || "px"));
    return style;
});
//  2、可选配置选项
defineOptions({ name: "TableRow", inheritAttrs: true, });
</script>

<style lang="less">
//  行 默认填充满、内部元素垂直居中
.table-row {
    min-width: 100%;
    display: flex;
    align-items: center;
}
</style>