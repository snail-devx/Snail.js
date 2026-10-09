<!-- 弹性视图数据表
    1、基于 Elastic 组件封装，在移动端实现数据管理能力
    2、支持上拉加载，下拉刷新能力
    3、支持数据选择能力，添加数据行、删除数据行、更新数据行等能力
    4、每行数据，交给插槽自定义渲染，若未指定，则采用默认模板
        1、标题列占整行
        2、其他列按照配置宽度渲染
-->
<template>
    <Elastic class="snail-elastic-table" bar elastic="y" :distance="150"
        :class="[namespace, selectModeRef && selectModeRef != 'none' ? 'select-mode' : '']"
        @ready="h => elasticHandleRef = h">
        <template #default>
            <Empty v-if="rowsRef.length == 0" :message="emptyMessage" />
            <template v-else>
                <Motion :multiple="true" :effect="options.motion" :duration="options.motion ? undefined : 0">
                    <div v-for="(row, rowIndex) in rowsRef" :key="row.id" class="data-row"
                        :class="{ 'force-row': forceRowIdRef == row.id }" :id="context.buildRowDomId(row)">
                        <!-- 选择模式预留 -->
                        <div class="row-select" v-show="selectModeRef != 'none'"
                            :class="[isSelected(row) == true ? 'on' : 'off', isSelectable(row) ? '' : 'disabled']"
                            @click="toggleSelect(row)">
                            <Icon :type="'success'" :color="'white'" :size="14" />
                        </div>
                        <!-- 实际内容区域：默认插槽逻辑。区分行插槽还是列插槽 -->
                        <div class="row-body" @click="selectModeRef == 'none' && emits('click', row, undefined)">
                            <template v-if="$slots.row">
                                <slot name="row" :="{ columns, row, rowIndex }">
                                    无[row]插槽，无法渲染数据行
                                </slot>
                            </template>
                            <template v-else>
                                <div v-for="(column, columnIndex) in columns" :key="getKey(column)"
                                    class="column-item ellipsis" :class="column.type" :style="{ width: column.width }"
                                    :data-role="column.role">
                                    <slot name="column" v-if="$slots.column"
                                        :="{ row, rowIndex, column, columnIndex }" />
                                    <slot name="default" v-else-if="$slots.default"
                                        :="{ row, rowIndex, column, columnIndex }" />
                                    <template v-else>
                                        无[column]/[default]插槽，{{ column.name }} 无法渲染
                                    </template>
                                </div>
                            </template>
                        </div>
                        <!-- 尾部区域：使用插槽渲染 -->
                        <div class="row-footer" v-if="$slots.footer">
                            <slot name="footer" :="{ row, rowIndex }" />
                        </div>
                    </div>
                </Motion>
                <!-- 没有更多数据了：这个需要再琢磨一下，需要在没有数据后的下一次加载更多触发时才显示出来 -->
                <!-- <div class="no-more-data" v-if="noMoreDataRef && options.loadMore == true">没有更多数据了...</div> -->
            </template>
        </template>
        <template #plugin="handle">
            <!-- 这个需要琢磨一下，需要在没有数据后的下一次触发后，再禁用，并配合【没有更多数据了】的提示 -->
            <ElasticUpdown :="handle" :up="noMoreDataRef != true && options.more == true" :down="options.refresh"
                @ready="handle => updownHandleRef = handle" @refresh="onDownRefresh" @more="onUpMore" />
            <!-- Loading提示能力 -->
            <Loading :show="loadTypeRef == undefined && loadingRef" />
        </template>
    </Elastic>
</template>

<script setup lang="ts">
import { correctString, IScope, useKey, wait } from 'snail.core';
import { useStyle } from 'snail.view';
import { computed, nextTick, onMounted, shallowRef, ShallowRef } from 'vue';
import Icon from '../base/icon.vue';
import { useReactive } from '../base/reactive.js';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import ElasticUpdown from './components/elastic-updown.vue';
import { useDataTable } from './components/table-context.js';
import Elastic from './elastic.vue';
import { ElasticHandle, ElasticUpdownHandle } from './models/elastic-model';
import { DataTableContextUseExt, DataTableEvents, DataTableLoadType, DataTableRow, ElasticTableOptions } from './models/table-model';
import Motion from './motion.vue';
import { correctElasticTableOptions } from './utils/table-util.js';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticTableOptions<any>>();
const emits = defineEmits<DataTableEvents>();
const options = correctElasticTableOptions(props);
const context = useDataTable("mobile", options, emits, Object.freeze<DataTableContextUseExt>({ forceRow }));
const { getKey } = useKey();
const { watcher } = useReactive();
const { namespace, build } = useStyle();
//  2、参数解构，如覆盖props中属性
const emptyMessage = computed(() => correctString(props.emptyMessage, '暂无数据', true));
const { loadTypeRef, loadingRef, handle, rowsRef, forceRowIdRef, selectModeRef, isSelectable, isSelected, toggleSelect, noMoreDataRef } = context;
//  3、组件交互变量、常量
/**     Elastic组件操作句柄 */
const elasticHandleRef: ShallowRef<ElasticHandle> = shallowRef();
/**     下拉刷新、上拉加载的操作句柄 */
const updownHandleRef: ShallowRef<ElasticUpdownHandle> = shallowRef();
/**     上一次数据记载的scope */
let preLoadScope: IScope = undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 聚焦制定行
 * @param row 
 */
async function forceRow(row: DataTableRow<any>) {
    await nextTick();
    const domId = context.buildRowDomId(row);
    const el = document.getElementById(domId);
    elasticHandleRef.value && elasticHandleRef.value.scrollIntoView(el);
}

/**
 * 触发下拉刷新时
 * @param scope 
 */
async function onDownRefresh(scope: IScope) {
    preLoadScope && preLoadScope.destroy();
    preLoadScope = scope;
    await wait(handle.loadData("refresh"));
    scope.destroy();
    preLoadScope = undefined;
}
/**
 * 触发上拉加载更多时
 * @param scope 
 */
async function onUpMore(scope: IScope) {
    preLoadScope && preLoadScope.destroy();
    preLoadScope = scope;
    await wait(handle.loadData("more"));
    scope.destroy();
    preLoadScope = undefined;
}

/**
 * loadType 值改变时，进行效果响应
 * - 如外部搜索时，需要响应出刷新效果，而不是干巴的loading
 * @param type 
 */
function onLoadTypeChange(type: DataTableLoadType) {
    //  如果是 updown 组件自身触发导致的改变，不进行响应
    if (preLoadScope && preLoadScope.destroyed == false) {
        return;
    }
    //  加载完成了，状态无值，清理效果
    if (type == undefined) {
        updownHandleRef.value.clear();
        return;
    }
    //  其他情况，基于状态做响应
    switch (type) {
        //  刷新系列
        case "init": return updownHandleRef.value.show("refresh", "数据加载中...");
        case "refresh": return updownHandleRef.value.show("refresh", "刷新中...");
        case "search": return updownHandleRef.value.show("refresh", "搜索中...");
        //  加载系列
        case "more": return updownHandleRef.value.show("more");
        //  其他情况，提示警告，避免出现意料之外的情况
        default:
            console.warn("ElasticTable: not support loadType: ", type);
            break;
    }
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(async () => {
    await nextTick();
    emits("ready", handle);
    watcher(loadTypeRef, onLoadTypeChange);
    handle.loadData("init");
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic-table {
    >.main-area {
        display: flex;
        flex-direction: column;

        // 数据行基础样式
        >.data-row {
            position: relative;
            background: white;
            overflow-x: hidden;
            min-height: 40px;
            flex: none;
            //  flex布局
            display: flex;
            flex-direction: row;
            align-items: center;

            // 来个底部边框
            &::after {
                position: absolute;
                content: " ";
                left: 0;
                right: 0;
                bottom: 0;
                height: 1px;
                opacity: 0.4;
                background-color: #d4d6d9;
            }

            //  聚焦行的特定样式
            &.force-row {
                animation: snail-elastic-table-force-row 0.6s linear;

                @keyframes snail-elastic-table-force-row {

                    0%,
                    50% {
                        opacity: 1;
                        transform: translateX(-10px);
                    }

                    25%,
                    75% {
                        opacity: 0;
                        transform: translateX(0);
                    }
                }
            }
        }

        //  数据行的选择数据区域
        >.data-row>.row-select {
            flex: none;
            width: 20px;
            height: 20px;
            border-radius: 20px;
            margin-right: 14px;
            display: flex;
            align-items: center;
            justify-content: center;

            &.off {
                border: solid 1px #dcdfe6;

                >svg {
                    display: none;
                }
            }

            &.on {
                border: solid 1px #4c9aff;
                background-color: #4c9aff;
            }

            &.disabled {
                cursor: not-allowed;
            }

            &:not(.disabled) {
                cursor: pointer;
            }
        }

        //  数据行实际渲染
        >.data-row>.row-body {
            flex: 1;
            overflow-x: hidden !important;
            color: #8a8f99;
            // flex布局，列自动根据宽度布局，超出则放到下一行
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;

            // 每列默认100%宽度，且最大100%宽度超出隐藏；高度最小22px
            >.column-item {
                flex: none;
                width: 100%;
                max-width: 100% !important;
                overflow-x: hidden !important;
                min-height: 22px;

                // 特定样式列
                &.title {
                    margin-bottom: 6px;
                    font-size: 16px;
                    color: #2e3033;
                }
            }
        }

        // 行的默认区域
        >.data-row>.row-footer {
            flex: none;
        }

        // 没有更多数据了
        >.no-more-data {
            background-color: #f7f8f9;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #777777;
            font-size: 14px;
            font-weight: bold;
            height: 30px;
        }
    }
}
</style>