<!-- 树 组件
    1、展示属性结构数据
    2、支持搜索框，本地搜索树节点 .text 值，不区分大小写
    3、支持默认插槽，可自定义单个树节点渲染样式
-->
<template>
    <div class="snail-tree">
        <Search v-if="search" :="search" @search="onSearch" />
        <div class="tree-nodes small-scrollbar">
            <TreeNode v-for="node in nodes || []" :key="context.getKey(node)" :node="node" :parent="undefined"
                :level="1" :options="nodeOptions" :context="context" @click="onTreeNodeClick">
                <template #="slotProps: TreeNodeSlotOptions<any>">
                    <slot :="slotProps" />
                </template>
            </TreeNode>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TreeEvents, TreeNodeModel, TreeNodeSlotOptions, TreeOptions } from "./models/tree-model";
//  三方组件
import { shallowRef, ShallowRef } from "vue";
import Search from "../control/search.vue";
import { useTreeContext } from "./components/tree-base";
import TreeNode from "./components/tree-node.vue";
import { ITreeBaseContext } from "./models/tree-base";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TreeOptions<any>>();
const emits = defineEmits<TreeEvents<any>>();
/**     当前激活的节点*/
const activedNodeRef: ShallowRef<TreeNodeModel<any>> = shallowRef(undefined);
/**     树的上下文 */
const context: ITreeBaseContext<any> = useTreeContext<any>(props.nodes, activedNodeRef);
//  2、可选配置选项：对外可访问contxt属性
defineExpose({ context, onTreeNodeClick });
defineOptions({ name: "Tree", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 搜索时
 * @param text 
 */
function onSearch(text: string) {
    debugger;
    context.doSearch(text);
    emits("searched", text);
}
/**
 * 树节点点击时
 * @param node 
 * @param parents 
 */
function onTreeNodeClick(node: TreeNodeModel<any>, parents?: TreeNodeModel<any>[]) {
    activedNodeRef.value = node;
    emits('click', node, parents)
}

// *****************************************   👉  组件渲染    *****************************************
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-tree {
    background-color: white;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    .snail-search {
        flex-shrink: 0;
        margin: 12px 12px 12px 12px;
    }

    >.tree-nodes {
        overflow: hidden auto;
        flex: 1;
    }
}
</style>