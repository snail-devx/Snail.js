<!-- 树节点 组件
    1、配合Tree组件使用；根节点区域不使用 tree-node 作为class名称，太通用了，很容易被覆盖
    2、展示节点和节点下的子节点，用于构建出属性结构
    3、后期考虑支持节点动画，移除或者展示时做一些效果优化
-->
<template>
    <div class="node-panel" v-if="node.disabled != true">
        <!-- 树节点自身渲染区域：若外部传入【】，则不用渲染缩进、图标、节点名称等 -->
        <div class="node" :class="[`level-${level}`, node.clickable ? 'clickable' : '']">
            <template v-if="extend.rewrite == true">
                <slot v-bind="{ node, parent, level, toggleFold }" />
            </template>
            <template v-else>
                <div class="indent" />
                <div class="node-fold" v-if="extend.foldDisabled != true">
                    <Icon v-if="hasChildrenRef" :class="statusRef" :type="'custom'" :size="24" :color="'#8a8099'"
                        :draw="'M 298.667 426.667 l 213.333 256 l 213.333 -256 Z'" @click="toggleFold" />
                </div>
                <span class="node-text" :title="node.text" v-text="node.text" @click="onNodeClick(node, parent)" />
                <div class="node-slot">
                    <slot v-bind="{ node, parent, level, toggleFold }" />
                </div>
            </template>
        </div>
        <!-- 子节点区域：遍历子，插槽绑定时，将插槽绑定属性同步向外传递 -->
        <div class="children" v-if="hasChildrenRef" ref="children">
            <TreeNode v-for="child in node.children" :key="newId()" :node="child" :parent="node" :level="nextLevel"
                :extend="extend" @click="onNodeClick">
                <template #="slotProps">
                    <slot :="slotProps" />
                </template>
            </TreeNode>
        </div>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, useTemplateRef } from "vue";
import { TreeNodeEvents, TreeNodeOptions } from "../models/tree-model";
import { isArrayNotEmpty, newId, throwIfTrue } from "snail.core";
import Icon from "../../base/icon.vue";
import { useAnimation } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { node, parent, level, extend = {} } = defineProps<TreeNodeOptions<any>>();
throwIfTrue(level > 10, "tree node level cannot exceed 10.");
const emit = defineEmits<TreeNodeEvents<any>>();
const { transition } = useAnimation();
/**     折叠状态，默认展开 */
const statusRef = shallowRef<"expand" | "fold">("expand");
/**     是否有子节点 */
const hasChildrenRef = computed(() => isArrayNotEmpty(node.children));
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
        const minHeight = childrenDom.value.previousElementSibling.getBoundingClientRect().height;
        const maxHeight = minHeight + childrenDom.value.getBoundingClientRect().height;
        transition(childrenDom.value.parentElement, {
            from: { transition: "height 0.2s ease", overflow: "hidden", height: `${statusRef.value == 'fold' ? maxHeight : minHeight}px` },
            to: { height: `${statusRef.value == 'fold' ? minHeight : maxHeight}px` },
            end: statusRef.value == 'fold' ? { height: `${minHeight}px`, overflow: 'hidden' } : {}
        }, 200);
    }
}
/**
 * 树节点点击时
 * - 支持自身节点，子节点
 * - 子节点点击时，逐步往上冒泡
 * - 这里不写类型，避免和 TreeNode.vue 组件名称重复
 * @param node 
 * @param parent 
 */
function onNodeClick(node, parent?) {
    node.clickable == true && emit("click", node, parent);
}
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.node-panel {
    width: 100%;

    //  节点自身
    >.node {
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
    >.children {
        width: 100%;
    }
}

// *****************************************   👉  特殊样式适配    *****************************************
//  缩进层级样式适配：最多支持10级缩进
@levelIndent: 24px;

.node-panel>.level-1>.indent {
    padding-left: 0;
}

.node-panel>.level-2>.indent {
    padding-left: 1*@levelIndent;
}

.node-panel>.level-3>.indent {
    padding-left: 2*@levelIndent;
}

.node-panel>.level-4>.indent {
    padding-left: 3*@levelIndent;
}

.node-panel>.level-5>.indent {
    padding-left: 4*@levelIndent;
}

.node-panel>.level-6>.indent {
    padding-left: 5*@levelIndent;
}

.node-panel>.level-7>.indent {
    padding-left: 6*@levelIndent;
}

.node-panel>.level-8>.indent {
    padding-left: 7*@levelIndent;
}

.node-panel>.level-9>.indent {
    padding-left: 8*@levelIndent;
}

.node-panel>.level-10>.indent {
    padding-left: 9*@levelIndent;
}
</style>