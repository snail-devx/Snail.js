<!-- 树节点 组件
    1、展示一个树节点和它的子节点 
    2、支持插槽，由外部自定义展示内容；根据配置插槽可完全重写 树节点
-->
<template>
    <div class="snail-tree-node" v-if="showRef" :class="classRef">
        <template v-if="options.rewrite == true">
            <slot :="slotOptions" />
        </template>
        <template v-else>
            <div class="indent" />
            <div class="node-fold" v-if="options.foldDisabled != true">
                <Icon v-if="showChildrenRef" :class="statusRef" :type="'custom'" :size="24" :color="'#8a8099'"
                    :draw="'M 298.667 426.667 l 213.333 256 l 213.333 -256 Z'" @click="toggleFold" />
            </div>
            <div class="node-text" :title="node.text" v-text="node.text" @click="onNodeClick(node)" />
            <div class="node-slot">
                <slot :="slotOptions" />
            </div>
        </template>
    </div>
    <div class="snail-tree-children" v-if="showRef && showChildrenRef" ref="children">
        <TreeNode v-for="child in node.children" :key="child.id || newId()" :node="child" :parent="node"
            :level="nextLevel" :options="options" :context="context"
            @click="(node, parents) => onChildNodeClick(node, parents)">
            <template #="slotProps">
                <slot :="slotProps" />
            </template>
        </TreeNode>
    </div>
</template>

<script setup lang="ts">
import { newId, throwIfTrue } from "snail.core";
import { useAnimation } from "snail.view";
import { shallowRef, computed, useTemplateRef } from "vue";
import { TreeNodeEvents, TreeNodeModel, TreeNodeOptions, TreeNodeSlotOptions } from "../models/tree-model";
import Icon from "../../base/icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { node, parent, options = {}, level, context } = defineProps<TreeNodeOptions<any>>();
throwIfTrue(level > 10, "tree node level cannot exceed 10.");
const emits = defineEmits<TreeNodeEvents<any>>();
const { transition } = useAnimation();
/**     节点是否可显示 */
const showRef = computed(() => context.canShow(node));
/**     节点的子节点是否可显示 */
const showChildrenRef = computed(() => context.canShowChildren(node))
/**     自定义绑定的类样式：层级节点和可点击标记等 */
const classRef = computed(() => {
    const array = [`level-${level}`];
    node.clickable && array.push("clickable")
    return array;
});
/**     树节点的【插槽】配置选项 */
const slotOptions = Object.freeze<TreeNodeSlotOptions<any>>({
    node,
    parent,
    level,
    toggle: toggleFold,
    click: () => onNodeClick(node),
});
/**     折叠状态，默认展开 */
const statusRef = shallowRef<"expand" | "fold">("expand");
/**     下一个层级： */
const nextLevel: number = level + 1;
/**     子节点区域Dom元素引用 */
const childrenDom = useTemplateRef("children");
//  2、可选配置选项
defineOptions({ name: "TreeNode", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 折叠状态点击时
 */
function toggleFold() {
    switch (statusRef.value) {
        case "expand":
            statusRef.value = "fold";
            break;
        case "fold":
            statusRef.value = "expand";
            break;
    }
    //  有子节点时，计算位置动画效果
    if (childrenDom.value) {
        const minHeight = 0;
        const maxHeight = childrenDom.value.scrollHeight;
        transition(childrenDom.value, {
            from: { transition: "height 0.2s ease", overflow: "hidden", height: `${statusRef.value == 'fold' ? maxHeight : minHeight}px` },
            to: { height: `${statusRef.value == 'fold' ? minHeight : maxHeight}px` },
            end: statusRef.value == 'fold' ? { height: `${minHeight}px`, overflow: 'hidden' } : {}
        }, 200);
    }
}
/**
 * 树节点点击时
 * @param node 
 */
function onNodeClick(node: TreeNodeModel<any>) {
    node.clickable == true
        && emits("click", node, parent ? [parent] : undefined);
}
/**
 * 子节点点击事件：把自己的父节点加进来
 * @param child     子节点 
 * @param parents   已有的父节点路径
 */
function onChildNodeClick(child: TreeNodeModel<any>, parents: TreeNodeModel<any>[]) {
    parents = parent ? [parent, ...parents] : parents;
    emits("click", child, parents);
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

//  节点自身
.snail-tree-node {
    width: 100%;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();
    flex-wrap: nowrap;
    height: 40px;

    &:hover {
        background-color: #f8f9fa;
    }

    //  缩进、图标、插槽区域：不缩放
    >.indent,
    >.snail-icon,
    >.node-slot {
        flex-shrink: 0;
    }

    //  节点折叠区域
    >.node-fold {
        width: 24px;
        height: 100%;
        //  flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();

        >.snail-icon {
            transition: transform 0.1s ease-in;

            //  折叠状态时，图标旋转一下
            &.fold {
                transform: rotate(-90deg);
            }
        }
    }

    //  节点文本、插槽区域：文本溢出隐藏
    >.node-text,
    >.node-slot {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    >.node-text {
        flex: 1;
        min-width: 30px;
        color: #2e3033;
    }

    //  节点可点击时，节点文本区域鼠标手型
    &.clickable>.node-text {
        cursor: pointer;
    }
}

//  子节点容器
.snail-tree-children {
    width: 100%;
}

// *****************************************   👉  特殊样式适配    *****************************************
//  缩进层级样式适配：最多支持10级缩进
@levelIndent: 24px;

.snail-tree-node.level-1>.indent {
    padding-left: 4px;
}

.snail-tree-node.level-2>.indent {
    padding-left: 1*@levelIndent;
}

.snail-tree-node.level-3>.indent {
    padding-left: 2*@levelIndent;
}

.snail-tree-node.level-4>.indent {
    padding-left: 3*@levelIndent;
}

.snail-tree-node.level-5>.indent {
    padding-left: 4*@levelIndent;
}

.snail-tree-node.level-6>.indent {
    padding-left: 5*@levelIndent;
}

.snail-tree-node.level-7>.indent {
    padding-left: 6*@levelIndent;
}

.snail-tree-node.level-8>.indent {
    padding-left: 7*@levelIndent;
}

.snail-tree-node.level-9>.indent {
    padding-left: 8*@levelIndent;
}

.snail-tree-node.level-10>.indent {
    padding-left: 9*@levelIndent;
}
</style>