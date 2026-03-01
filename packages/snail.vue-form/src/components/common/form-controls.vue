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
                <div v-for="control in global.controls" class="control-item" :key="control.type" :title="control.name"
                    v-show="control.name.indexOf(searchTextRef || '') != -1" :data-type="'control'"
                    :data-tag="control.type" @click="emits('click', control.type)">
                    <span>
                        <Icon :type="'custom'" :size="control.iconSize || 20" :color="'#65698f'"
                            :draw="control.icon || defaultIcon" />
                    </span>
                    <span class="ellipsis" v-text="control.name" />
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
const { Scroll, Search, Sort, Empty, Icon } = components;
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
/**     默认的控件图标 */
const defaultIcon: string = "M146.285714 256c64.347429 0 117.613714-47.798857 126.537143-109.714286H987.428571a18.285714 " +
    "18.285714 0 1 0 0-36.571428H272.822857C263.899429 47.798857 210.633143 0 146.285714 0 75.702857 0 18.285714 57.435429 " +
    "18.285714 128s57.417143 128 128 128zM146.285714 36.571429c50.413714 0 91.428571 41.014857 91.428572 91.428571s-41.014857 " +
    "91.428571-91.428572 91.428571-91.428571-41.014857-91.428571-91.428571 41.014857-91.428571 91.428571-91.428571zM877.714286 " +
    "768c-64.347429 0-117.613714 47.798857-126.537143 109.714286H36.571429a18.285714 18.285714 0 1 0 0 36.571428h714.605714c8.923429 " +
    "61.915429 62.189714 109.714286 126.537143 109.714286 70.564571 0 128-57.435429 128-128s-57.435429-128-128-128z m0 219.428571c-50.413714 " +
    "0-91.428571-41.014857-91.428572-91.428571s41.014857-91.428571 91.428572-91.428571 91.428571 41.014857 91.428571 91.428571-41.014857 " +
    "91.428571-91.428571 91.428571zM987.428571 493.714286H646.729143c-7.241143-65.865143-63.177143-117.284571-130.944-117.284572-67.766857 " +
    "0-123.702857 51.437714-130.944 117.284572H36.571429a18.285714 18.285714 0 1 0 0 36.571428h349.421714c10.550857 62.171429 64.658286 " +
    "109.714286 129.792 109.714286s119.222857-47.542857 129.773714-109.714286H987.428571a18.285714 18.285714 0 1 0 0-36.571428z m-471.643428 " +
    "109.714285C463.286857 603.428571 420.571429 560.713143 420.571429 508.214857s42.715429-95.213714 95.213714-95.213714 95.213714 42.715429 " +
    "95.213714 95.213714S568.283429 603.428571 515.785143 603.428571z";

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
            overflow: hidden;

            //  控件图标+名称
            display: flex;
            align-items: center;

            >span:first-child {
                width: 22px;
                flex-shrink: 0;
                margin: 0 4px;
                display: flex;
                align-items: center;
            }

            >span:last-child {
                flex: 1;
            }

            svg {
                cursor: move;
            }

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