<!--表格组件：
    1、使用原生 table 标签进行绘制，实现数据表能力
    2、支持列头排序能力：支持单列、多列排序（升级、降序）操作
    3、支持拖拽行调整顺序能力：支持列的触发handle，不指定则整行、、
    4、集成数据管理能力，为行、列提供附加数据管理能力，主动加载行数据，而不是被动调用
    5、对外暴露操作数据能力，如选择数据、刷新、添加数据等等
    6、数据行渲染，完全交给外部，通过插槽实现，插槽绑定行、列相关信息
    7、支持事件能力，让外部能感知到表格组件状态，如渲染完成时将handle句柄暴露出去
-->
<template>
    <div class="snail-table small-scrollbar" :class="namespace" ref="table-root">
        <!-- loading提示 -->
        <Loading :show="loadingRef" />
        <!-- 做一个宽度辅助元素：将列表中配置的固定值放到这里看看具体有宽：百分比和自适应不在这里计算 
                按照索引顺序索引出每列的渲染宽度，宽度为0的列作为自适应列做处理,若没出横向滚动条则平分，出了横向滚动条则最小宽度150px
         -->
        <div class="width-assist">
            <span v-for="col in columns" :style="{ width: col.width }" />
        </div>
        <!-- 实际内容表格渲染 -->
        <table cellpadding="0" cellspacing="0">
            <!-- 无数据提醒 -->
            <tbody v-if="rowsRef.length == 0">
                <tr class="empty-message">
                    <td :colspan="columns.length + 1">
                        <Empty :message="emptyMessage" />
                    </td>
                </tr>
            </tbody>
            <!-- 真实数据行:main或者default插槽-->
            <tbody v-else>
                <Sort :disabled="main ? (selectModeRef != 'none' || main.draggable != true) : true"
                    :changer="rowsRef.length" :draggable="'.tbody-row'" :handle="main.dragHandle"
                    @update="handle.moveRow">
                    <tr v-for="(row, rowIndex) in rowsRef" :key="row.id" class="tbody-row"
                        :class="{ 'force-row': forceRowIdRef == row.id }" :id="buildRowDomId(row.id)">
                        <td class="index">
                            <template v-if="selectModeRef == 'single' || selectModeRef == 'multiple'">
                                <div class="select"
                                    :class="[isSelected(row) == true ? 'on' : 'off', isSelectable(row) ? '' : 'disabled']"
                                    @click="toggleSelect(row)">
                                    <Icon :type="'success'" :color="'white'" :size="12" />
                                </div>
                            </template>
                            <template v-else>
                                {{ rowIndex + 1 }}
                            </template>
                        </td>
                        <td v-for="(column, columnIndex) in columns" :key="getKey(column)"
                            :class="{ link: column.type == 'link' }"
                            @click="column.type == 'link' && emits('click', row, column)">
                            <slot v-if="$slots.main" :="{ column, columnIndex, row, rowIndex }" />
                            <slot v-else :="{ column, columnIndex, row, rowIndex }" />
                        </td>
                    </tr>
                </Sort>
            </tbody>
            <!-- 表头 -->
            <thead>
                <tr>
                    <td class="index">
                        <template v-if="selectModeRef == 'none'">序号</template>
                        <template v-else-if="selectModeRef == 'multiple'">
                            <div class="select" :class="[isSelected(undefined) == true ? 'on' : 'off']"
                                @click="toggleSelect(undefined)">
                                <Icon :type="'success'" :color="'white'" :size="12" />
                            </div>
                        </template>
                    </td>
                    <td v-for="(column, columnIndex) in columns" :key="getKey(column)">
                        <slot name="header" :="{ column, columnIndex }">
                            <span v-text="column.name" />
                        </slot>
                    </td>
                </tr>
            </thead>
            <!-- 底部数据行:用于统计合计,序号列,给各图标 -->
            <tfoot v-if="!!footer && rowsRef.length > 0" v-show="selectModeRef == 'none'">
                <tr>
                    <td>
                        <Icon :type="'stats'" :title="'合计'" :size="20" :color="'#4c94ff'" />
                    </td>
                    <td v-for="(column, columnIndex) in columns" :key="getKey(column)">
                        <slot name="footer" :="{ column, columnIndex }" />
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script setup lang="ts">
import { correctString, useKey } from 'snail.core';
import { useObserver, useStyle } from 'snail.view';
import { computed, onMounted, useTemplateRef } from 'vue';
import Icon from '../base/icon.vue';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import { useTable } from './components/table-context.js';
import { TableColumnOptions, TableEvents, TableOptions } from './models/table-model';
import Sort from './sort.vue';
import { buildRowDomId, buildStyle, correctOptions } from './utils/table-util';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TableOptions<any>>();
const emits = defineEmits<TableEvents>();
const rootDom = useTemplateRef("table-root");
const options = correctOptions(props);
const manager = useTable(options, emits);
const { onSize } = useObserver();
const { getKey } = useKey<TableColumnOptions<any>>();
const { namespace, build } = useStyle();
//  2、参数解构，如覆盖props中属性
const { columns, main, footer } = options;
const emptyMessage = computed(() => correctString(props.emptyMessage, '暂无数据', true));
const { rowsRef, loadingRef, noMoreDataRef, forceRowIdRef, handle } = manager;
const { selectModeRef, isSelectable, isSelected, toggleSelect } = manager;
//  3、界面交互属性变量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建表格自定义样式
 * - 主要限定表格宽度
 */
function buildTableStyle() {
    build(buildStyle(rootDom.value, options));
    console.log(arguments);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    emits("ready", handle);
    // buildTableStyle();
    onSize(rootDom.value, buildTableStyle);

    handle.loadData("init")
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-table {
    position: relative;
    overflow: auto;
    box-shadow: 0px 0px 6px 0px rgba(46, 48, 51, 0.14);

    //  给默认值
    >table {
        table-layout: fixed;
        width: fit-content;
        min-width: 100%;

        >*>tr {
            background: white;
        }

        >*>tr>td {
            white-space: nowrap;
            color: #2e3033;
            overflow-x: hidden;

            &:nth-child(n+2) {
                padding: 0 10px;
            }
        }

        //  头部和内容区域的【序号列】中的选择按钮
        >thead>tr>td.index>div.select,
        >tbody>tr>td.index>div.select {
            width: 14px;
            height: 14px;
            margin: 0 auto;
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
    }

    //  各个区域的特定样式
    >table {
        >thead {
            box-shadow: rgba(46, 48, 51, 0.1) 0px 0px 12px 0px;
            position: sticky;
            top: 0;

            >tr {
                height: 40px;
                overflow-y: hidden;
            }
        }

        >tbody {
            >tr {
                height: 40px;
                overflow-y: visible;
                // box-shadow: rgba(66, 185, 131, 0.1) 0px 0px 2px 0px;

                >td {
                    border-bottom: 0.5px solid rgba(220, 223, 230, 0.8);

                    &.link:hover {
                        cursor: pointer;
                        color: #58a4fd;
                        text-decoration: underline;
                    }
                }

                //  ------------- 特定样式   -------------

                //      无数据提醒的样式
                &.empty-message {
                    >td {
                        border-bottom: none !important;
                    }
                }

                //      聚焦行动画改编透明度
                &.force-row {
                    animation: snail-table-force-row 0.6s linear;

                    @keyframes snail-table-force-row {

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
        }

        >tfoot {
            box-shadow: 0px -4px 8px 0px rgba(0, 0, 0, 0.08);
            position: sticky;
            bottom: 0;

            >tr {
                height: 50px;
                overflow-y: visible;

                >td {
                    border-bottom: 0.5px solid rgba(220, 223, 230, 0.8);
                }
            }
        }
    }

    //  宽度辅助元素：不显示出来，给高度0
    >div.width-assist {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow: hidden;
        height: 1px;
        gap: 1px;

        >span {
            flex: none;
            background-color: red;
        }
    }
}
</style>