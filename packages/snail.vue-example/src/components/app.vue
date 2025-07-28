<template>
    <div class="app">
        <Tree :="treeOptions" @click="onTreeNodeClick" />
        <div class="container">
            <component :is="curComponent" v-if="showRef" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { Component, shallowRef } from "vue";
import { useReactive, TreeNode, TreeOptions, components } from "../core";

//#region *******************************   👉  组件定义    *****************************************
//  👉 基础组件：
import ButtonTest from "./base/button-test.vue";
import ChooseTest from "./base/choose-test.vue";
import HeaderFooterTest from "./base/header-footer-test.vue";
import IconTest from "./base/icon-test.vue";
import SearchTest from "./base/search-test.vue";
import SwitchTest from "./base/switch-test.vue";
//  👉 容器组件
import DynamicTest from "./container/dynamic-test.vue";
import FoldTest from "./container/fold-test.vue";
import ScrollTest from "./container/scroll-test.vue";
import TableTest from "./container/table-test.vue";
import TreeTest from "./container/tree-test.vue";
//  👉 表单组件
import InputTest from "./form/input-test.vue";
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
/** 树组件配置选项 */
const treeOptions: TreeOptions<Component> = {
    nodeExtend: {
        foldDisabled: true,
    },
    nodes: [
        {
            text: "弹窗管理",
            children: [
                { text: "Dialog 模态弹窗", data: DialogTest, clickable: true },
                { text: "Follow 跟随弹窗", data: FollowTest, clickable: true },
                { text: "Popup 弹出", data: PopupTest, clickable: true },
            ]
        },
        {
            text: "基础组件",
            children: [
                { text: "Button 按钮组件", data: ButtonTest, clickable: true },
                { text: "Choose 选择组件", data: ChooseTest, clickable: true },
                { text: "Header/Footer 头尾组件", data: HeaderFooterTest, clickable: true, },
                { text: "Icon 图标组件", data: IconTest, clickable: true },
                { text: "Search 搜索组件", data: SearchTest, clickable: true },
                { text: "Switch 开关组件", data: SwitchTest, clickable: true },
            ],
        },
        {
            text: "容器组件",
            children: [
                { text: "Dynamic 动态组件", data: DynamicTest, clickable: true },
                { text: "Fold 折叠组件", data: FoldTest, clickable: true },
                { text: "Scroll 滚动组件", data: ScrollTest, clickable: true },
                { text: "Table 表格组件", data: TableTest, clickable: true },
                { text: "Tree 树组件", data: TreeTest, clickable: true },
            ]
        },
        {
            text: "表单组件",
            children: [
                { text: "Input 输入框组件", data: InputTest, clickable: true },
            ]
        },
        {
            text: "提示组件",
            children: [
                { text: "DragVerify 滑块验证", data: DragVerifyTest, clickable: true },
                { text: "Empty 空状态", data: EmptyTest, clickable: true },
                { text: "Loading 加载状态", data: LoadingTest, clickable: true },
            ]
        }
    ]
}

// *****************************************   👉  方法事件    *****************************************
/**
 * 树节点点击时
 */
function onTreeNodeClick(node: TreeNode<Component>) {
    curComponent = shallowRef(node.data);
    transition<boolean>(showRef, { from: false, to: true }, 10);
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

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

        .node-panel>.node {
            height: 30px;
        }
    }

    >.container {
        flex: 1;
        padding: 10px;
        overflow: hidden;
        position: relative;
    }
}
</style>