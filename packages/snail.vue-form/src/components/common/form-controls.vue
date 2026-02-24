<!-- 表单控件集合 -->
<template>
    <div class="snail-form-controls">
        <!-- 搜索组件 -->
        <Search placeholder="请输入控件名称搜索" :auto-complete="true" @search="text => searchTextRef = text" />
        <!-- 控件列表：暂时不做分组，后期再考虑，符合搜索值的控件才显示出来 -->
        <Scroll :scroll-y="true" class="control-list">
            <Empty v-if="hasControls != true" message="无可用控件" />
            <Sort v-else draggable=".control-item" changer="1" :disabled="global.readonly" :sortDisabled="true"
                :group="{ name: global.global, pull: 'clone', put: false }" @remove="onControlItemRemove">
                <div v-for="control in global.controls" class="control-item" :key="control.type"
                    v-show="control.name.indexOf(searchTextRef || '') != -1" :data-type="'control'"
                    :data-tag="control.type" @click="emits('click', control.type)">
                    {{ control.name }}
                </div>
            </Sort>
        </Scroll>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, shallowRef, ShallowRef } from "vue";
import { isArrayNotEmpty, isStringNotEmpty } from "snail.core";
import { components, SortEvent } from "snail.vue";
import { } from "../../models/field-container";
import { INJECTKEY_GlobalContext } from "./field-common";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const emits = defineEmits<{ click: [type: string] }>();
const { Scroll, Search, Sort, Empty, Transitions } = components;
/**   字段全局上下文 */
const global = inject(INJECTKEY_GlobalContext);
/**     搜索文本 */
const searchTextRef: ShallowRef<string> = shallowRef();
/**     是否有可用控件*/
const hasControls = computed(() => isArrayNotEmpty(global.controls) == true
    ? isStringNotEmpty(searchTextRef.value)
        ? global.controls.find(control => control.name.indexOf(searchTextRef.value) != -1) != undefined
        : true
    : false
);
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 控件从控件列表移除时
 * - 采用 clone 模式拖拽时，移除时需要重新处理一下，否则click事件会出问题
 * @param evt 
 */
function onControlItemRemove(evt: SortEvent) {
    evt.clone.parentElement.replaceChild(evt.item, evt.clone);
}
// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-controls {
    position: relative;
    flex-shrink: 0;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    //  搜索区域
    >.snail-search {
        height: 50px;
        padding: 10px;
        flex-shrink: 0;
    }

    //  控件列表
    >.control-list {
        padding: 0 10px 10px 10px;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;

        >.control-item {
            width: 50%;
            height: 30px;
            color: #2e3033;
            flex-shrink: 0;
            line-height: 30px;
            border: 1px dashed transparent;
            cursor: move;
            user-select: none;

            //  鼠标移入、激活、拖拽时；特定特定边框色标记
            &:hover,
            &.actived,
            &.snail-sort-drag,
            &.snail-sort-ghost {
                border-color: #ed9239;
                border-radius: 0 !important;
            }

            //  避免从其他容器拖拽回来时，产生动画效果
            &.snail-sort-ghost {
                transform: none !important;
            }
        }
    }
}
</style>