<!-- 表格行组件：配合Table组件使用，作为内容行组件 -->
<template>
    <div class="table-row" :style="rowStyle">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, computed } from "vue";
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