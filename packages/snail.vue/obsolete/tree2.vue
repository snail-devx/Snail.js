<!-- 树 组件 
    1、仅作为容器管理，树上的节点展示，外圈由外部通过【插槽】控制
    2、后期考虑支持选中操作
    3、展开、收起操作，支持外部传入图标，不传入则采用默认的
-->
<template>
    <!-- 树节点展示区域：将插槽绑定属性同步向外传递  -->
    <Scroll class="snail-tree" :scroll-y="true">
        <Tree2Node v-for="node in props.nodes || []" :key="newId()" :level="1" :node="node" :extend="props.nodeExtend"
            @click="onTreeNodeClick">
            <template #="slotProps">
                <slot :="slotProps" />
            </template>
        </Tree2Node>
    </Scroll>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { Tree2Events, Tree2NodeEvents, Tree2Options } from "./tree2-model";
import Scroll from "../src/container/scroll.vue";
import Tree2Node from "./tree2-node.vue";
import { newId } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<Tree2Options<any>>();
const emits = defineEmits<Tree2Events<any> & Tree2NodeEvents<any>>();
//  2、可选配置选项
defineOptions({ name: "Tree2", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 树节点点击事件
 * @param node 
 * @param parent 
 */
function onTreeNodeClick(node, parent) {
    emits("click", node, parent);
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