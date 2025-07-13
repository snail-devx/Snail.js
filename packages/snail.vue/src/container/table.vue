<!-- 表格组件
    1、配合TableRow、TableCol使用 
    2、支持hearder插槽、默认为内容插槽
-->
<template>
    <Scroll class="snail-table" :scroll-x="props.scrollX" :scroll-y="props.scrollY"
        :class="{ 'start-border': props.border == true }">
        <!-- 头部区域 -->
        <div class="table-header" :style="getStyle(props.headerStyle)">
            <slot name="header" />
        </div>
        <!-- 内容区域：滚动 -->
        <div class="table-body">
            <slot />
        </div>
        <!-- 尾部区域 -->
        <div class="table-footer" :style="getStyle(props.footerStyle)">
            <slot name="footer" />
        </div>
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
    //  snail.view中还没封装 background属性，暂时先这样
    styleOptions = styleOptions || {};
    const style: CSSStyleDeclaration = Object.create(null);
    styleOptions.background && (style.background = styleOptions.background);
    styleOptions.height && (style.height = styleOptions.height);
    return style;
}
</script>

<style lang="less">
.snail-table {
    display: flex;
    flex-direction: column;

    //  表头区域、底部区域：不缩放；内部居中对齐，
    >div.table-header,
    >div.table-footer {
        width: 100%;
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    //  表头钉住位置
    >div.table-header {
        position: sticky !important;
        top: 0;
    }

    // 实际内容区域
    >div.table-body {
        width: 100%;
        flex: 1;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  启用边框时，进行修饰，避免边框线重叠（核心规则：body中尽可能全）
.snail-table.start-border {

    //  所有区域的列：从第二列开始取消左边框
    >div.table-header,
    >div.table-body>.table-row,
    >div.table-footer {
        >.table-col:nth-child(n + 2) {
            border-left: none !important;
        }
    }

    //  内容区域和尾部区域：取消列的顶部边框
    >div.table-body>.table-row,
    >div.table-footer {
        >.table-col {
            border-top: none !important;
        }
    }
}
</style>