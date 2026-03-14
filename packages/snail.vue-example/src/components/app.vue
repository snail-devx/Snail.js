<template>
    <div class="app">
        <Tree :="treeOptions" @click="onTreeNodeClick" />
        <div class="container">
            <component :is="curComponent" v-if="showRef" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { Component, onMounted, shallowRef } from "vue";
import { useReactive, components, TreeOptions, TreeNodeModel, TreeNodeSlotOptions } from "snail.vue";

//#region *******************************   👉  组件定义    *****************************************
//  👉 基础组件：
import BaseTest from "./base/base-test.vue";
import ButtonTest from "./base/button-test.vue";
import DatepickerTest from "./base/datepicker-test.vue";
import ChooseTest from "./base/choose-test.vue";
import HeaderFooterTest from "./base/header-footer-test.vue";
import IconTest from "./base/icon-test.vue";
import InputTest from "./base/input-test.vue";
import SearchTest from "./base/search-test.vue";
import SelectTest from "./base/select-test.vue";
import SwitchTest from "./base/switch-test.vue";
import TextareaTest from "./base/textarea-test.vue";

//  👉 容器组件
import DynamicTest from "./container/dynamic-test.vue";
import FoldTest from "./container/fold-test.vue";
import LayoutTest from "./container/layout-test.vue";
import ScrollTest from "./container/scroll-test.vue";
import TableTest from "./container/table-test.vue";
import TransitionsTest from "./container/transitions-test.vue";
import TreeTest from "./container/tree-test.vue";
//  👉 表单组件
import DesignerTest from "./form/designer-test.vue";
import RendererTest from "./form/renderer-test.vue";
//  👉 选择器组件
import DatepickerTest2 from "./picker/datepicker-test.vue";
import TimepickerTest from "./picker/timepicker-test.vue";

//  👉 弹窗组件
import DialogTest from "./popup/dialog-test.vue";
import FollowTest from "./popup/follow-test.vue";
import PopupTest from "./popup/popup-test.vue";
//  👉 提示组件
import LoadingTest from "./prompt/loading-test.vue";
import DragVerifyTest from "./prompt/drag-verify-test.vue";
import EmptyTest from "./prompt/empty-test.vue";
//#endregion

// *****************************************   👉  组件定义    *****************************************
const { transition } = useReactive();
const { Tree } = components;
/** 当前展示组件*/
var curComponent: Component = undefined;
/** 是否显示组件 */
const showRef = shallowRef(false);

/**
 * 组件树 配置选项
 */
const treeOptions: TreeOptions<Component> = {
    search: {
        placeholder: "大爷常来玩儿..",
        autoComplete: true,
    },
    nodeOptions: {
        // foldDisabled: true,
    },
    nodes: [
        {
            text: "基础组件",
            fixed: true,
            children: [
                { text: "基础测试组件", data: BaseTest, clickable: true, searchable: true, },
                { text: "Button 按钮组件", data: ButtonTest, clickable: true, searchable: true, },
                { text: "Choose 选择组件", data: ChooseTest, clickable: true, searchable: true, },
                { text: "Datepicker 日期选择器", data: DatepickerTest, clickable: true, searchable: true },
                { text: "Header/Footer 头尾组件", data: HeaderFooterTest, clickable: true, searchable: true, },
                { text: "Icon 图标组件", data: IconTest, clickable: true, searchable: true, },
                { text: "Input 输入框组件", data: InputTest, clickable: true, searchable: true, },
                { text: "Search 搜索组件", data: SearchTest, clickable: true, searchable: true, },
                { text: "Select 选项菜单组件", data: SelectTest, clickable: true, searchable: true, },
                { text: "Switch 开关组件", data: SwitchTest, clickable: true, searchable: true, },
                { text: "Textarea 多行文本框", data: TextareaTest, clickable: true, searchable: true }
            ],
        },
        {
            text: "容器组件",
            children: [
                { text: "Dynamic 动态组件", data: DynamicTest, clickable: true, searchable: true, },
                { text: "Fold 折叠组件", data: FoldTest, clickable: true, searchable: true, },
                { text: "Layout 布局测试", data: LayoutTest, clickable: true, searchable: true, },
                { text: "Scroll 滚动组件", data: ScrollTest, clickable: true, searchable: true, },
                { text: "Table 表格组件", data: TableTest, clickable: true, searchable: true, },
                { text: "Transitions 动画组件", data: TransitionsTest, clickable: true, searchable: true },
                { text: "Tree 树组件", data: TreeTest, clickable: true, searchable: true, },
            ]
        },
        {
            text: "表单组件",
            children: [
                { text: "Designer 设计器", data: DesignerTest, clickable: true, searchable: true, },
                { text: "Renderer 渲染器", data: RendererTest, clickable: true, searchable: true, },
            ]
        },
        {
            text: "选择器",
            children: [
                { text: "日期选择器", data: DatepickerTest2, clickable: true, searchable: true },
                { text: "时间选择器", data: TimepickerTest, clickable: true, searchable: true },
            ]
        },
        {
            text: "弹窗管理",
            children: [
                { text: "Dialog 模态弹窗", data: DialogTest, clickable: true, searchable: true, },
                { text: "Follow 跟随弹窗", data: FollowTest, clickable: true, searchable: true, },
                { text: "Popup 弹出", data: PopupTest, clickable: true, searchable: true, },
            ]
        },
        {
            text: "提示组件",
            children: [
                { text: "DragVerify 滑块验证", data: DragVerifyTest, clickable: true, searchable: true, },
                { text: "Empty 空状态", data: EmptyTest, clickable: true, searchable: true, },
                { text: "Loading 加载状态", data: LoadingTest, clickable: true, searchable: true, },
            ]
        }
    ],
}

// *****************************************   👉  方法事件    *****************************************
/**
 * 树节点点击时
 * @param node 
 * @param parents 
 */
function onTreeNodeClick(node: TreeNodeModel<Component>, parents: TreeNodeModel<Component>[]) {
    console.log(node, parents);
    curComponent = shallowRef(node.data);
    transition<boolean>(showRef, { from: false, to: true }, 10);
}

onMounted(() => {
    // onTreeNodeClick(treeOptions.nodes[2].children[0], undefined);
    // onTreeNodeClick(treeOptions.nodes[3].children[0], undefined);
    onTreeNodeClick(treeOptions.nodes[3].children[1], undefined);
});
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.app {
    //  width:100%；height:100%；overflow: hidden
    .wh-fill-hidden();
    display: flex;

    >div {
        height: 100%;
    }

    >.snail-tree {
        width: 210px;
        border-right: 1px solid gray;
        flex-shrink: 0;
    }

    >.container {
        flex: 1;
        padding: 10px;
        overflow: hidden auto;
        position: relative;

        >section {
            margin: auto;
            width: 30%;
            float: left;
        }

        >article {
            float: left;
            width: 100%;

            >h1 {
                width: 100%;
            }

            >section {
                vertical-align: top;
                padding: 4px;
                width: 30%;
                float: left;
            }
        }
    }
}
</style>