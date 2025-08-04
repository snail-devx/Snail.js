<!-- 树 组件
    1、展示属性结构数据
    2、支持搜索框，本地搜索树节点 .text 值，不区分大小写
    3、支持默认插槽，可自定义单个树节点渲染样式
-->
<template>
    <div class="snail-tree">
        <Search v-if="props.search" :="props.search" @search="onSearch" />
        <Scroll :scroll-y="true">
            <TreeNode v-for="node in props.nodes || []" :key="node.id || newId()" :node="node" :parent="undefined"
                :level="1" :options="props.nodeOptions" :context="context"
                @click="(node, parents) => emits('click', node, parents)">
                <template #="slotProps: TreeNodeSlotOptions<any>">
                    <slot :="slotProps" />
                </template>
            </TreeNode>
        </Scroll>
    </div>
</template>

<script setup lang="ts">
import { newId } from "snail.core";
import { TreeEvents, TreeNodeSlotOptions, TreeOptions } from "./models/tree-model";
//  三方组件
import Scroll from "./scroll.vue";
import Search from "../base/search.vue";
import TreeNode from "./components/tree-node.vue";
import { ITreeBaseContext } from "../base/models/tree-base";
import { useTreeContext } from "../base/components/tree-base";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TreeOptions<any>>();
const emits = defineEmits<TreeEvents<any>>();
/** 树的上下文 */
const context: ITreeBaseContext<any> = useTreeContext<any>(props.nodes);
//  2、可选配置选项：对外可访问contxt属性
defineExpose({ context });
defineOptions({ name: "Tree", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 搜索时
 * @param text 
 */
function onSearch(text: string) {
    context.doSearch(text);
    emits("searched", text);
}

// *****************************************   👉  组件渲染    *****************************************
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-tree {
    background-color: white;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    .flex-column();

    .snail-search {
        flex-shrink: 0;
        margin: 12px 12px 12px 12px;
    }

    .snail-scroll {
        flex: 1;
    }
}
</style>