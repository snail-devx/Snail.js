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
    <div class="snail-table small-scrollbar" :class="namespace, border ? 'start-border' : ''" ref="table-root">
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
            <!-- 真实数据行:main或者default插槽；启用拖拽调整行顺序时，不允许和其他容器拖出、拖出-->
            <tbody v-else>
                <Sort :group="{ name: dragId, pull: false, put: false }" :changer="rowsRef.length"
                    :draggable="'.tbody-row'" :ghost-class="'drag-ghost'" :drag-class="'dragging'"
                    :handle="main.dragHandle"
                    :disabled="main ? (selectModeRef != 'none' || main.draggable != true) : true"
                    @update="handle.moveRow">
                    <tr v-for="(row, rowIndex) in rowsRef" :key="row.id" class="tbody-row"
                        :class="{ 'force-row': forceRowIdRef == row.id }" :id="buildRowDomId(row.id)">
                        <!-- 序号列 -->
                        <td class="index">
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
                        <!-- 真实数据列 -->
                        <td v-for="(column, columnIndex) in columns" :key="getKey(column)"
                            :class="{ link: column.type == 'link' }"
                            @click="column.type == 'link' && emits('click', row, column)">
                            <slot v-if="$slots.main" :="{ column, columnIndex, row, rowIndex }" />
                            <slot v-else :="{ column, columnIndex, row, rowIndex }" />
                        </td>
                    </tr>
                </Sort>
            </tbody>
            <!-- 表头：放到 tbody 的后面，这样固定列头就不用 index 值了 -->
            <thead>
                <tr>
                    <td class="index">
                        <template v-if="selectModeRef == 'none'">序号</template>
                        <template v-else-if="selectModeRef == 'multiple'">
                            <div class="row-select" :class="[isSelected(undefined) == true ? 'on' : 'off']"
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
        <!-- loading提示 -->
        <Loading :show="loadingRef" />
        <!-- 做一个列宽度辅助元素：将列表中配置的固定值放到这里自动计算出来实际宽度，用于辅助【buildTableColStyle】方法计算列宽度样式-->
        <div class="column-assist" ref="column-assist">
            <span v-for="col in columns" :style="{ width: col.width }" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, newId, useKey, useScopes } from 'snail.core';
import { ScrollDetail, useObserver, useScroll, useStyle } from 'snail.view';
import { computed, onMounted, useTemplateRef } from 'vue';
import Icon from '../base/icon.vue';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import { useTable } from './components/table-context.js';
import { TableColumnOptions, TableEvents, TableOptions } from './models/table-model';
import Sort from './sort.vue';
import { buildRowDomId, buildTableBaseStyle, buildTableColStyle, correctOptions } from './utils/table-util';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TableOptions<any>>();
const emits = defineEmits<TableEvents>();
const rootDom = useTemplateRef("table-root");
const colAssistDom = useTemplateRef("column-assist");
const options = correctOptions(props);
const manager = useTable(options, emits);
const { onSize } = useObserver();
const { getKey } = useKey<TableColumnOptions<any>>();
const { namespace, build } = useStyle();
const scopes = useScopes();
//  2、参数解构，如覆盖props中属性
const { border, columns, main, footer } = options;
const emptyMessage = computed(() => correctString(props.emptyMessage, '暂无数据', true));
const { rowsRef, loadingRef, noMoreDataRef, forceRowIdRef, handle } = manager;
const { selectModeRef, isSelectable, isSelected, toggleSelect } = manager;
//  3、界面交互属性变量
/**     拖拽组件分类的Id值，避免界面有多个Table组件时，相互拖入 */
const dragId: string = newId();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建表格自定义样式
 * - 主要限定表格宽度
 */
function buildTableStyle() {
    const style = buildTableBaseStyle(options);
    const colStyle = buildTableColStyle(colAssistDom.value);
    style.push(...colStyle);
    build(style);
}
/**
 * 处理滚动事件
 * - 触底加载更多数据
 * @param detail 
 */
function onScrollDetail(detail: ScrollDetail) {
    const { now, pre } = detail;
    //  判断是否到底了,到底了触发加载更多数据
    now.ybar && now.bottom && now.bottom != pre.bottom && handle.loadData("more");
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    //  事件监听处理
    onSize(rootDom.value, buildTableStyle);
    scopes.add(useScroll(
        rootDom.value,
        { scroll: "both", barSize: "small" },
        onScrollDetail)
    );
    //  准备好了，进行数据加载
    emits("ready", handle);
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

    // 表格内容渲染
    >table {
        position: relative;
        min-width: 100%;
        table-layout: fixed;
        border-collapse: collapse;

        //  行通用样式
        tr {
            position: relative;
            background: white;

            //  所有列的通用样式
            >td {
                position: relative;
                white-space: nowrap;
                color: #2e3033;
                overflow-x: hidden;
                text-overflow: ellipsis;

                &:nth-child(1) {
                    text-align: center;
                }

                &:nth-child(n+2) {
                    padding: 0 10px;
                }

                // 使用伪类构建一个下边框线，不占用实际高度
                &::after {
                    content: "";
                    position: absolute;
                    width: 100%;
                    border-bottom: 1px solid #e0e0e0;
                    bottom: 0;
                    left: 0;
                }
            }

            //  序号列的特定处理
            >td.index {
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

        >tbody {

            //  行通用样式
            >tr {
                height: 40px;
                overflow-y: visible;
                // box-shadow: rgba(66, 185, 131, 0.1) 0px 0px 2px 0px;

                //  拖拽的时候 取消边框，避免因此出现滚动条
                &.drag-ghost {
                    border: none !important;
                }

                &.dragging {
                    line-height: 40px;
                }

                >td {
                    // border-bottom: 0.5px solid rgba(220, 223, 230, 0.8);

                    &.link:hover {
                        cursor: pointer;
                        color: #58a4fd;
                        text-decoration: underline;
                    }
                }
            }

            // 无数据提醒行样式
            >tr.empty-message {
                >td {
                    border-bottom: none !important;
                }
            }

            //  聚焦行样式，进行动画提醒
            >tr.force-row {
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

        >thead {
            box-shadow: rgba(46, 48, 51, 0.1) 0px 0px 12px 0px;
            position: sticky;
            top: 0;

            >tr {
                height: 40px;
                overflow-y: hidden;
            }
        }

        >tfoot {
            box-shadow: 0px -4px 8px 0px rgba(0, 0, 0, 0.08);
            position: sticky;
            bottom: 0;

            >tr {
                height: 50px;
                overflow-y: visible;
            }
        }
    }

    //  宽度辅助元素：不显示出来，给高度0。加绝对优先级处理，防止外部做通用化标签处理影响
    >div.column-assist {
        width: 100% !important;
        height: 0px !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;

        // 子元素禁止缩放，列配置的宽度是多少就是多少，自适应列在flex布局下不指定宽度则为0
        >span {
            flex: none !important;
        }
    }
}

//  启用边框线时：使用after和before绘制边框线，避免其占用实际空间；且取消阴影效果，避免干扰
.snail-table.start-border {
    // 取消自身的阴影效果
    box-shadow: none;

    //  td 补充左侧边框线，分别每个td，tr构建最右边的边框线做收尾
    >table {

        td::before,
        tr::after {
            content: "";
            position: absolute;
            height: 100%;
            border-right: 1px solid #e0e0e0;
            top: 0;
        }

        td::before {
            left: 0;
        }

        tr::after {
            right: 0;
        }
    }

    //  thead、foot补充顶部边框线
    >table {
        //  ⚠️ 使用伪类构建边框线的时候，thead和tfoot禁止使用 before 构建，避免影响宽度显示效果，具体原因没找出来

        thead::after,
        tfoot::after {
            content: "";
            position: absolute;
            width: 100%;
            border-top: 1px solid #e0e0e0;
            top: 0;
        }

        //  tfooter需要错位一下，否则和tbody的最后一行重叠出现重影
        tfoot::after {
            top: -1px;
        }
    }
}
</style>