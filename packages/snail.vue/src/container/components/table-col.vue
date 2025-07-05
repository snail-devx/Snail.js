<!-- 表格列组件；配合Table和TableRow使用 -->
<template>
    <div class="table-col" :style="colStyle">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, computed } from "vue";
import { TableColOptions } from "../models/table-model"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableColOptions>();
/**     行样式*/
const colStyle = computed<Record<string, any>>(() => {
    const style: CSSStyleDeclaration = Object.create(null);
    //  flex 优先级比width高
    props.flex != undefined
        ? style.flex = String(props.flex)
        : props.width && (style.width = props.width + (props.unit || "px"));
    //  minWidth和maxWidth：flex指定或者width未指定时生效
    if (props.flex != undefined || props.width == undefined) {
        props.minWidth && (style.minWidth = props.minWidth + (props.unit || "px"));
        props.maxWidth && (style.maxWidth = props.maxWidth + (props.unit || "px"));
    }
    //  col其他属性
    props.align && (style.justifyContent = props.align);
    props.borderStyle && (style.border = props.borderStyle);
    props.paddingStyle && (style.padding = props.paddingStyle);

    return style;
});
//  2、可选配置选项
defineOptions({ name: "TableCol", inheritAttrs: true, });
</script>