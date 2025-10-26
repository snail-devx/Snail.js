<!-- 表格组件
    1、配合TableRow、TableCol使用 
    2、支持hearder插槽、默认为内容插槽
-->
<template>
    <Scroll class="snail-table" :scroll-x="scrollX" :scroll-y="scrollY" :class="{ 'start-border': border == true }">
        <!-- 头部区域 -->
        <div class="table-header" :style="hStyleRef">
            <slot name="header" />
        </div>
        <!-- 内容区域：滚动 -->
        <div class="table-body">
            <slot />
        </div>
        <!-- 尾部区域 -->
        <div class="table-footer" :style="fStyleRef">
            <slot name="footer" />
        </div>
    </Scroll>
</template>

<script setup lang="ts">
import Scroll from "./scroll.vue"
import { TableOptions } from "./models/table-model";
import { computed } from "vue";
import { css } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TableOptions>();
/** 表头样式 */
const hStyleRef = computed(() => css.buildStyle(props.headerStyle));
/** 表尾样式 */
const fStyleRef = computed(() => css.buildStyle(props.footerStyle));
//  2、可选配置选项
defineOptions({ name: "Table", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-table {
    display: flex;
    flex-direction: column;

    //  表头区域、底部区域：不缩放；内部居中对齐，
    >div.table-header,
    >div.table-footer {
        width: 100%;
        flex-shrink: 0;
        // flex 布局：display: flex，align-items 为center
        .flex-cross-center();
    }

    //  表头钉住位置；给个默认背景色，避免滑动时盖不住数据行
    >div.table-header {
        position: sticky !important;
        top: 0;
        z-index: 1;
        background-color: white;
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