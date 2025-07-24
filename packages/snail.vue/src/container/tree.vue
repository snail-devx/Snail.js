<!-- 树 组件 
    1、仅作为容器管理，树上的节点展示，外圈由外部通过【插槽】控制
    2、后期考虑支持选中操作
    3、展开、收起操作，支持外部传入图标，不传入则采用默认的
-->
<template>
    <!-- 树节点展示区域：将插槽绑定属性同步向外传递  -->
    <Scroll class="snail-tree" :scroll-y="true">
        <TreeNode v-for="node in props.nodes || []" :key="newId()" :level="1" :node="node" :extend="props.nodeExtend"
            @click="onTreeNodeClick">
            <template #="slotProps">
                <slot :="slotProps" />
            </template>
        </TreeNode>
    </Scroll>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { TreeEvents, TreeNodeEvents, TreeOptions } from "./models/tree-model";
import Scroll from "./scroll.vue";
import TreeNode from "./components/tree-node.vue";
import { newId } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<TreeOptions<any>>();
const emit = defineEmits<TreeEvents<any> & TreeNodeEvents<any>>();
//  2、可选配置选项
defineOptions({ name: "Tree", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 树节点点击事件
 * @param node 
 * @param parent 
 */
function onTreeNodeClick(node, parent) {
    emit("click", node, parent);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-tree {
    background-color: white;
}
</style>