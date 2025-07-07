<!-- 表格组件
    1、配合TableRow、TableCol使用 
    2、支持hearder插槽、默认为内容插槽
-->
<template>
    <Scroll class="snail-table" :scroll-x="props.scrollX" :scroll-y="props.scrollY"
        :class="{ 'start-border': props.border == true }">
        <!-- 头部区域 -->
        <header class="table-header" :style="getStyle(props.headerStyle)">
            <slot name="header" />
        </header>
        <!-- 内容区域：滚动 -->
        <main class="table-body">
            <slot />
        </main>
        <!-- 尾部区域 -->
        <footer class="table-footer" :style="getStyle(props.footerStyle)">
            <slot name="footer" />
        </footer>
    </Scroll>
</template>

<script setup lang="ts">
import Scroll from "./scroll.vue"
import { TableOptions, TableStyleOptions } from "./models/table-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableOptions>();
//  2、可选配置选项
defineOptions({ name: "Table", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 获取样式信息
 * - 用于计算表格头部、尾部样式
 * @param styleOptions 样式配置项
 */
function getStyle(styleOptions: TableStyleOptions): Record<string, any> {
    const style: CSSStyleDeclaration = Object.create(null);
    styleOptions.background && (style.background = styleOptions.background);
    styleOptions.height && (style.height = styleOptions.height + (styleOptions.heightUnit || "px"));
    return style;
}
</script>

<style lang="less">
.snail-table {
    display: flex;
    flex-direction: column;

    >header.table-header,
    >header.table-footer,
    >main.table-body {
        width: 100%;
    }

    //  表头钉住位置
    >header.table-header {
        position: sticky !important;
        top: 0;
    }

    // 实际内容区域
    >main.table-body {
        flex: 1;
    }


    //  表头区域、底部区域：不缩放；内部居中对齐，
    >header.table-header,
    >header.table-footer {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }
}

//  特殊情况适配
//      启用边框时，进行修饰，避免边框线重叠
.snail-table.start-border {

    //  所有区域的列：从第二类开始取消左边框
    >header.table-header,
    >main.table-body>.table-row,
    >main.table-footer {
        >.table-col:nth-child(n + 2) {
            border-left: none !important;
        }
    }

    //  内容区域行下的列，取消上边框
    >main.table-body>.table-row {
        >.table-col {
            border-top: none !important;
        }
    }
}
</style>