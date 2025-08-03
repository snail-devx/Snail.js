<!-- 树 组件
    1、展示属性结构数据
    2、支持搜索框，本地搜索树节点 .text 值，不区分大小写
    3、支持默认插槽，可自定义单个树节点渲染样式
-->
<template>
    <div class="snail-tree">
        <Search v-if="props.search" :="props.search" @search="context.doSearch" />
        <Scroll :scroll-y="true">
            <TreeNode v-for="node in props.nodes || []" :key="node.id || newId()" :node="node" :parent="undefined"
                :level="1" :options="props.nodeOptions" :context="context"
                @click="(node, parents) => emits('click', node, parents)">
                <template #="slotProps">
                    <slot :="slotProps" />
                </template>
            </TreeNode>
        </Scroll>
    </div>
</template>

<script setup lang="ts">
import { isStringNotEmpty, newId } from "snail.core";
import { shallowRef } from "vue";
import { TreeEvents, TreeNodeModel, TreeOptions } from "./models/tree-model";
//  三方组件
import Scroll from "./scroll.vue";
import Search from "../base/search.vue";
import TreeNode from "./components/tree-node.vue";
import { ITreeContext } from "../base/models/tree-base";
import { useTreeContext } from "../base/components/tree-context";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TreeOptions<any>>();
const emits = defineEmits<TreeEvents<any>>();
/** 树的上下文 */
const context: ITreeContext<any> = useTreeContext<any>(props.nodes);
/** 搜索没匹配上的节点集合：操作的时候，修改value值，而不是push操作数组元素 */
const noMatchedNodes = shallowRef<TreeNodeModel<any>[]>([])
//  2、可选配置选项
defineOptions({ name: "Tree", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-tree {
    background-color: white;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    .snail-search {
        flex-direction: 0;
        margin: 12px 12px 12px 12px;
    }

    .snail-scroll {
        flex: 1;
    }
}
</style>