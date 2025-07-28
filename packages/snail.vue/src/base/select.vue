<!-- 下拉选择 组件：
    1、支持基础的html select ，支持多级选择，支持搜索功能 
-->
<template>
    <div class="snail-select" :class="{ 'readonly': proprs.readonly }">
        <!-- 选中选项数据：多选模式 -->
        <div class="select-result" v-if="proprs.multiple == true">
            多选模式
        </div>
        <!-- 单选模式：存在多个路径的情况 -->
        <div class="select-result" v-else>
            单选模式
        </div>
        <Icon type="arrow" :size="24" color="#8a9099" style="transform: rotate(90deg);" />
        <!-- 无选项时的适配：提示无选项。。。 -->
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import Icon from "./icon.vue";
import { SelectEvents, SelectOptions } from "./models/select-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const proprs = defineProps<SelectOptions<any>>();
const emits = defineEmits<SelectEvents<any>>();
//  2、可选配置选项
defineOptions({ name: "Select", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-select {
    background-color: white;
    width: 100%;
    height: 32px;
    border: 1px solid #dddfed;
    border-radius: 4px;
    cursor: pointer;
    color: #2e3033;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();

    //  已选结果区域
    >div.select-result {
        flex: 1;
        padding: 0 6px;
        //  flex 布局：display: flex，align-items 为center
        .flex-cross-center();
        flex-wrap: nowrap;
    }

    >svg.snail-icon {
        flex-shrink: 0;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  只读样式适配
.snail-select.readonly {
    cursor: auto;
}
</style>