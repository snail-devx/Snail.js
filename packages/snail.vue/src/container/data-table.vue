<!-- 数据表 组件
    1、仅支持桌面客户端下的数据列表渲染，若需要移动端渲染，请使用 ElasticTable 组件
    2、实现数据加载能力，支持触底加载更多
    3、支持选择数据行能力：可单选、多选、全选数据行
    4、支持拖拽行调整顺序能力：支持列的触发handle，不指定则整行、、
    5、对外暴露操作数据能力，如选择数据、刷新、添加数据等等
    6、支持事件能力，让外部能感知到表格组件状态，如渲染完成时将handle句柄暴露出去
    7、数据行渲染，完全交给外部，通过插槽实现，插槽绑定行、列相关信息
    8、后续支持能力：
        1、支持列头排序能力：支持单列、多列排序（升级、降序）操作
        2、支持固定列，固定在左侧、右侧等
-->
<template>
    <Table class="snail-data-table" :class="{ 'select-mode': selectModeRef && selectModeRef != 'none' }"
        :columns="columns" :index="options.index" :border="options.border" :header="header" :main="main"
        :footer="footer" :loading="context.loadingRef.value">
        <!-- 表头 -->
        <template #header>
            <tr>
                <td class="index" v-if="index == true">
                    <template v-if="selectModeRef == 'none'">序号</template>
                    <template v-else-if="selectModeRef == 'multiple'">
                        <div class="row-select" :class="[isSelected(undefined) == true ? 'on' : 'off']"
                            @click="toggleSelect(undefined)">
                            <Icon :type="'success'" :color="'white'" :size="12" />
                        </div>
                    </template>
                </td>
                <!-- 自定义渲染列：无配置则使用默认的渲染方式 -->
                <td v-for="(column, columnIndex) in columns" :key="getKey(column)">
                    <slot name="header" :="{ column, columnIndex }">
                        <span v-text="column.name" />
                    </slot>
                </td>
            </tr>
        </template>
        <!-- 数据行 -->
        <template #main>
            <!-- 无数据提醒 -->
            <tr class="empty-message" v-if="rowsRef.length == 0">
                <td :colspan="columns.length + (index == true ? 1 : 0)">
                    <Empty :message="emptyMessage" />
                </td>
            </tr>
            <!-- 真实数据行：main插槽；启用拖拽调整行顺序时，不允许和其他容器拖出、拖出-->
            <Sort :group="{ name: dragId, pull: false, put: false }" :changer="rowsRef.length" :draggable="'.tbody-row'"
                :ghost-class="'drag-ghost'" :drag-class="'dragging'" :handle="main ? main.dragHandle : undefined"
                :disabled="main ? (selectModeRef != 'none' || main.draggable != true) : true" @update="handle.moveRow">
                <tr v-for="(row, rowIndex) in rowsRef" :key="row.id" class="tbody-row"
                    :class="{ 'force-row': forceRowIdRef == row.id }" :id="context.buildRowDomId(row)">
                    <!-- 序号列 -->
                    <td class="index" v-if="index == true">
                        <template v-if="selectModeRef == 'single' || selectModeRef == 'multiple'">
                            <div class="row-select"
                                :class="[isSelected(row) == true ? 'on' : 'off', isSelectable(row) ? '' : 'disabled']"
                                @click="toggleSelect(row)">
                                <Icon :type="'success'" :color="'white'" :size="12" />
                            </div>
                        </template>
                        <template v-else>
                            {{ rowIndex + 1 }}
                        </template>
                    </td>
                    <!-- 真实数据列：无main/default插槽时，提示出来;操作列，在选择模式下不现实出来-->
                    <template v-if="$slots.main || $slots.default">
                        <td v-for="(column, columnIndex) in columns" :class="column.type" :key="getKey(column)"
                            @click="(column.type == 'link' || column.type == 'title') && emits('click', row, column)">
                            <slot name="main" v-if="$slots.main" :="{ column, columnIndex, row, rowIndex }" />
                            <slot name="default" v-else :="{ column, columnIndex, row, rowIndex }" />
                        </td>
                    </template>
                    <template v-else>
                        <td :colspan="columns.length">无mian和default插槽，td无法渲染</td>
                    </template>
                </tr>
            </Sort>
        </template>
        <!-- 底部数据行:用于统计合计,序号列,给个图标 -->
        <template #footer v-if="footer && rowsRef.length > 0">
            <tr>
                <!-- 序号列 -->
                <td class="index" v-if="index == true">
                    <Icon :type="'stats'" :title="'合计'" :size="20" :color="'#4c94ff'" />
                </td>
                <!-- 自定义渲染 -->
                <template v-if="$slots.footer">
                    <td v-for="(column, columnIndex) in columns" :key="getKey(column)">
                        <slot name="footer" :="{ column, columnIndex }" />
                    </td>
                </template>
                <template v-else>
                    <td :colspan="columns.length">无footer插槽，td无法渲染</td>
                </template>
            </tr>
        </template>
    </Table>
</template>

<script setup lang="ts">
import { correctString, newId, useKey } from 'snail.core';
import { computed, nextTick, onMounted } from 'vue';
import Icon from '../base/icon.vue';
import Empty from '../prompt/empty.vue';
import { useDataTable } from './components/table-context';
import { DataTableEvents, DataTableOptions } from './models/table-model';
import Sort from './sort.vue';
import Table from './table.vue';
import { correctDataTableOptions } from './utils/table-util';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DataTableOptions<any>>();
const emits = defineEmits<DataTableEvents>();
const options = correctDataTableOptions(props);
const context = useDataTable("desktop", options, emits);
const { getKey } = useKey();
//  2、参数解构，如覆盖props中属性
const emptyMessage = computed(() => correctString(props.emptyMessage, '暂无数据', true));
const { index, columns, header, main, footer } = options;
const { handle, rowsRef, forceRowIdRef, selectModeRef, isSelectable, isSelected, toggleSelect } = context;
//  3、界面交互属性变量
/**     拖拽组件分类的Id值，避免界面有多个Table组件时，相互拖入 */
const dragId: string = newId();

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(async () => {
    await nextTick();
    emits("ready", handle);
    handle.loadData("init");
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-data-table {
    flex: none;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    // 序号列的处理
    >table {
        td.index {
            >div.row-select {
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
    }

    //  数据行特定样式
    >table>tbody>tr {

        //  无数据提醒行
        // &.empty-message>td {}

        //  拖拽的时候 取消边框，避免因此出现滚动条
        // &.drag-ghost {}

        &.dragging {
            line-height: 40px;
        }

        //  聚焦行的特定样式
        &.force-row {
            animation: snail-data-table-force-row 0.6s linear;

            @keyframes snail-data-table-force-row {

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

    //  特定类型列的样式
    >table>tbody>tr> {

        //  标题和link列，给连接样式
        >td.link:hover,
        >td.title:hover {
            cursor: pointer;
            color: #58a4fd;
            text-decoration: underline;
        }
    }

    //  【选择模式】下的特殊处理
    &.select-mode>table>tbody>tr {
        >td.operate {
            cursor: not-allowed;
            pointer-events: none;
        }
    }
}
</style>