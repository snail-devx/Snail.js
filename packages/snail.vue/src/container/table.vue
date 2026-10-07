<!-- 基础表格组件
    1、采用原生table标签渲染；外部传入列配置，自动管理列宽度，并根据列配置生成表头
    2、对外提供插槽（从 tr 标签开始渲染）：
        1、header       表头行渲染，若内部渲染出tr-td
        2、main         表格主体行渲染，若无则提示无main插槽
        3、footer       表格底部行渲染，若无则提示无footer插槽
    3、对外提供事件：
        1、ready        表格组件准备好了
        2、bottom       滚动到底部时触发
-->
<template>
    <Scroll class="snail-table" :class="namespace, border ? 'start-border' : ''" :scroll="'both'"
        :bar-size="barSize || 'small'" @bottom="emits('bottom')">
        <Empty v-if="hasColumnsRef != true" :message="'无columns配置，无法进行表格渲染'" />
        <!-- 主内容区域 -->
        <table v-if="hasColumnsRef" cellpadding="0" cellspacing="0" :class="index == true ? 'start-index' : ''">
            <tbody>
                <slot name="main">
                    <tr>
                        <td :colspan="columns.length">无[main]插槽，tbody中tr无法渲染</td>
                    </tr>
                </slot>
            </tbody>
            <!-- 表头：放到 tbody 的后面，这样固定列头就不用 index 值了 -->
            <thead>
                <slot name="header">
                    <tr>
                        <td v-for="col in columns">
                            <span v-text="col.name" />
                        </td>
                    </tr>
                </slot>
            </thead>
            <!-- 底部数据行:用于统计合计,序号列,给各图标 -->
            <tfoot v-if="footer">
                <slot name="footer">
                    <tr>
                        <td :colspan="columns.length">
                            无[footer]插槽，tfooter中tr无法渲染
                        </td>
                    </tr>
                </slot>
            </tfoot>
        </table>
        <!-- loading提示效果 -->
        <Loading :show="loading" />
        <!-- 做一个列宽度辅助元素：将列表中配置的固定值放到这里自动计算出来实际宽度，用于辅助【buildTableColStyle】方法计算列宽度样式-->
        <div v-if="hasColumnsRef" class="column-assist" ref="column-assist">
            <span v-for="col in columns" :style="{ width: col.width }" />
        </div>
    </Scroll>
</template>

<script setup lang="ts">
import { correctString, isArrayNotEmpty } from 'snail.core';
import { AllStyle, StyleClassItem, useObserver, useStyle } from 'snail.view';
import { computed, onMounted, useTemplateRef } from 'vue';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import { TableEvents, TableOptions, TableRowOptions } from './models/table-model';
import Scroll from './scroll.vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TableOptions<any>>();
const emits = defineEmits<TableEvents>();
const colAssistDom = useTemplateRef("column-assist");
const { index = false } = props;
const { namespace, build } = useStyle();
const { onSize } = useObserver();
//  2、组件交互变量、常量
/**     是否有表格列配置 */
const hasColumnsRef = computed(() => isArrayNotEmpty(props.columns));

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建表格的样式信息
 */
function buildTableStyle() {
    const style: StyleClassItem[] = [];
    //  基础样式构建
    props.header && style.push({
        mode: "child",
        rule: "table>thead>tr",
        style: correctRowStyle(props.header),
    });
    props.main && style.push({
        mode: "child",
        rule: "table>tbody>tr",
        style: correctRowStyle(props.main),
    });
    props.footer && style.push({
        mode: "child",
        rule: "table>tfoot>tr",
        style: correctRowStyle(props.footer),
    });
    //  列样式构建
    style.push(...buildTableColStyle());

    build(style);
}

/**
 * 矫正行样式
 * @param row 
 * @returns 行样式配置
 */
function correctRowStyle(row: TableRowOptions): AllStyle {
    const style: AllStyle = Object.create(null);
    style.minHeight = correctString(row.minHeight, undefined, true);
    style.height = correctString(row.height, undefined, true);
    style.maxHeight = correctString(row.maxHeight, undefined, true);
    style.background = correctString(row.background, undefined, true);

    return style;
}
/**
 * 构建表格的列样式
 * @returns 列的类样式配置
 */
function buildTableColStyle(): StyleClassItem[] {
    /**
     * 表格列宽计算规则：
     *  1、使用辅助元素做处理，遍历辅助元素下的子元素，计算每列的宽度，并记录自动宽度列的数量和列的总宽度
     *      1、辅助元素下的子元素，会自动把固定值和百分比的实际宽度计算出来；未指定宽度的列宽度为0,判定为自适应列
     *  2、校正生成列宽度配置：根据是否有自适应列判断
     *      1、有自适应列；未出横向滚动条时，自适应列平分剩余宽度，最小值为150px；出了横向滚动条时，自适应列固定宽度为150px
     *      2、无自适应列：出了横向滚动条，则忽略计算，保持现有宽度；没出滚动条时，将这些固定宽度进行等比例放大求百分比 ，实现填充满
     */
    //  
    const colWidths: number[] = [];
    {
        //  梳理宽度信息：启用序号列，则排除60px固定宽度
        const realWidth = colAssistDom.value.clientWidth - (index == true ? 60 : 0);
        let autoWidthCount: number = 0;
        let colTotalWidth: number = 0;
        for (let index = 0; index < colAssistDom.value.children.length; index++) {
            const colDom = colAssistDom.value.children[index];
            const colWidth: number = colDom.clientWidth;
            colWidths.push(colWidth);
            colWidth == 0 ? (++autoWidthCount) : (colTotalWidth += colWidth);
        }
        // 计算自适应列
        if (autoWidthCount > 0) {
            const autoWidth = realWidth > colTotalWidth
                ? Math.max(Math.floor((realWidth - colTotalWidth) / autoWidthCount), 150)
                : 150;
            for (let index = 0; index < colWidths.length; index++) {
                colWidths[index] == 0 && (colWidths[index] = autoWidth);
            }
        }
        // 等比例放到列宽；等比例放大后，如果还有剩余宽度，则分割最后一列
        else if (realWidth > colTotalWidth) {
            const scale: number = realWidth / colTotalWidth;
            colTotalWidth = 0;
            for (let index = 0; index < colWidths.length; index++) {
                const newWidth = Math.floor(colWidths[index] * scale);
                colWidths[index] = newWidth;
                colTotalWidth += newWidth;
            }
            const offsetWidth = realWidth - colTotalWidth;
            if (offsetWidth > 0) {
                const lastColIndex = colWidths.length - 1;
                colWidths[lastColIndex] = colWidths[lastColIndex] + offsetWidth;
            }
        }
    }
    /**
     * 生成没列的宽度样式配置
     *  1、启用序号列则固定一个60px列；其他列按照上面的计算结果约束为固定宽度
     *  2、生成的样式宽度，强制加上 width，min-width，max-width 做限制，避免出现宽度异常撑开的问题
     */
    index == true && colWidths.splice(0, 0, 60);
    return colWidths.map<StyleClassItem>((width, index) => ({
        mode: "child",
        rule: `table>*>tr>td:nth-child(${index + 1})`,
        style: {
            width: `${width}px`,
            minWidth: `${width}px`,
            maxWidth: `${width}px`
        }
    }));
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => { //  事件监听处理
    onSize(colAssistDom.value, buildTableStyle);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-table {
    position: relative;
    min-width: 100%;
    max-width: 100%;
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
        }

        >tbody {

            //  行通用样式
            >tr {
                height: 40px;
                overflow-y: visible;
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

    >div.snail-loading {
        position: sticky;
        width: 100%;
        height: 100%;
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

//  启用序号列和不启用序号列的样式区别
.snail-table {
    >table {
        &.start-index {
            tr>td {
                &:nth-child(1) {
                    text-align: center;
                }

                &:nth-child(n+2) {
                    padding: 0 10px;
                }
            }
        }

        &:not(.start-index) {
            tr>td {
                padding: 0 10px;
            }
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