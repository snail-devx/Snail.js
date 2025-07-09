<!-- 表格列组件；作为Table、TableRow的配套组件，根class不用加 snail 前缀-->
<template>
    <div class="table-col" :style="colStyle" :class="props.align">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
    //  col其他属性：align绑定到class上作为通用样式存在
    // props.align && (style.justifyContent = props.align);
    props.borderStyle && (style.border = props.borderStyle);
    props.paddingStyle && (style.padding = props.paddingStyle);

    return style;
});
//  2、可选配置选项
defineOptions({ name: "TableCol", inheritAttrs: true, });
</script>

<style lang="less">
//  列 高度100%，内部元素垂直居中，内部文本默认不换行
.table-col {
    display: inline-flex;
    height: 100%;
    align-items: center;
    white-space: nowrap;
}

// *****************************************   👉  特殊样式适配    *****************************************
//  2、左对齐时，按钮给左边距
.table-col.left {
    justify-content: left;
}

//  3、居中对齐时，按钮（除第一个外）给左边距
.table-col.center {
    justify-content: center;
}

//  4、对齐时，按钮给右边距
.table-col.right {
    justify-content: right;
}
</style>