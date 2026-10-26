<!-- 标签页组件：
    1、标签项支持左侧、顶部、右侧、底部显示
    2、标签内容支持渲染一个、渲染全部
    3、标签项内容，支持动态组件、或者插槽，切换标签页时，支持切换前钩子
 -->
<template>
    <div class="snail-tab" :class="correctString(position, 'top', true)">
        <Loading :show="loading" />
        <!-- 头部导航区域：显示标签项，点击时激活显示内容 -->
        <div class="tab-header" v-if="isArrayNotEmpty(tabs) && hideHeader != true">
            <!-- 标签项 -->
            <div class="tab-items small-scrollbar">
                <div class="tab-item" v-for="tab in tabs" :key="tab.code" :class="{ 'actived': selectedItemRef == tab }"
                    :title="tab.name" @click="onTabItemClick(tab)">
                    <span class="ellipsis" v-text="tab.name" />
                </div>
            </div>
            <!-- 更多按钮：溢出时才出 -->
            <Icon class="more-items" button custom :size="20" :hover-color="'#279bf1'"
                v-if="position != 'left' && position != 'right'">
                <path
                    d="M150.54803811 177.65693516h677.72242858v90.36299049H150.54803811zM150.54803811 426.15515905h677.72242858v90.36299049H150.54803811zM150.54803811 674.65338292h677.72242858v90.36299043H150.54803811z" />
            </Icon>
        </div>
        <!-- 标签内容区域：渲染激活的标签项，支持插槽和动态组件两种方式 -->
        <div class="tab-content small-scrollbar" v-if="selectedItemRef">
            <Dynamic v-if="isObject(selectedItemRef.content)" :key="getKey(selectedItemRef)"
                :="as<ComponentOptions>(selectedItemRef.content)" :props="selectedItemRef.props" />
            <slot v-else-if="isString(selectedItemRef.content)" :key="getKey(selectedItemRef) + 'slot'"
                :name="selectedItemRef.content" :="selectedItemRef.props">
                <Empty :message="`无[${selectedItemRef.content}]插槽，无法渲染标签页`" />
            </slot>
            <Empty v-else :message="`[${selectedItemRef.name}]标签页未指定 content；无法渲染`" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, isArrayNotEmpty, isObject, isString, useKey } from 'snail.core';
import { nextTick, onMounted, shallowRef, ShallowRef } from 'vue';
import Dynamic from '../base/dynamic.vue';
import Icon from '../base/icon.vue';
import { ComponentOptions } from '../base/models/component-model.js';
import { as } from '../base/utils/base-util';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import { TabEvents, TabHandle, TabItemOptions, TabOptions } from './models/tab-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TabOptions>();
const emits = defineEmits<TabEvents>();
const { getKey } = useKey();
//  2、组件交互变量、常量
/**     选中的标签项 */
const selectedItemRef: ShallowRef<TabItemOptions> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************
/**     标签页操作句柄 */
const handle: TabHandle = Object.freeze<TabHandle>({});

/**
 * 页签项点击时
 * @param tab 
 */
function onTabItemClick(tab: TabItemOptions) {
    if (selectedItemRef.value != tab) {
        //  初次不用执行钩子函数
        if (selectedItemRef.value == undefined) {
            selectedItemRef.value = tab;
        }
        //  执行钩子函数，然后再切换，根据返回值决定是否切换
        else {
            selectedItemRef.value = tab;
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(async () => {
    emits("ready", handle);
    //  选中第一个页签
    if (isArrayNotEmpty(props.tabs) == true) {
        await nextTick();
        selectedItemRef.value == undefined && onTabItemClick(props.tabs[0]);
    }
});
</script>

<style lang="less">
.snail-tab {
    display: flex;
    overflow: hidden;
    position: relative;
    //  变量定义
    --actived-color: #279bf1;
    --border-color: #e6e9f0;

    >.tab-header {
        position: relative;
        flex: none;
        display: flex;
        overflow: hidden;

        >.tab-items {
            flex: 1;
            position: relative;

            >.tab-item {
                position: relative;
                cursor: pointer;
                padding: 0 20px;
                color: #646464;
                display: flex;
                align-items: center;
            }
        }

        // 更多tabs导航按钮
        >.more-items {
            flex: none;
            justify-self: flex-end;
        }
    }

    >.tab-content {
        position: relative;
        flex: 1;
        overflow: auto;
    }
}

//  左右两侧的适配
.snail-tab {

    &.left,
    &.right {

        >.tab-header {
            width: 240px;

            >.tab-items {
                overflow: hidden auto;

                >.tab-item {
                    height: 40px;

                    &:hover {
                        background-color: #EFF9FF;
                    }

                    &.actived {
                        background-color: var(--actived-color);
                        color: white;
                    }
                }
            }
        }
    }

    &.left {
        >.tab-header {
            border-right: 1px solid var(--border-color);
        }
    }

    &.right {
        >.tab-header {
            border-left: 1px solid var(--border-color);
            order: 2;
        }
    }
}

// 顶部和底部
.snail-tab {

    &.top,
    &.bottom {
        flex-direction: column;

        >.tab-header {
            height: 44px;

            >.tab-items {
                overflow: hidden;
                display: flex;

                >.tab-item {
                    >span {
                        max-width: 100px;
                    }

                    &.actived,
                    &:hover {
                        color: var(--actived-color);
                    }
                }
            }

            >.more-items {
                align-self: center;
            }
        }
    }

    // 顶部显示
    &.top {
        >.tab-header {
            border-bottom: 1px solid var(--border-color);

            >.tab-items {
                >.tab-item.actived::after {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    content: "";
                    left: 0;
                    bottom: 1px;
                    background-color: var(--actived-color);
                }
            }
        }
    }


    //  底部显示
    &.bottom {
        >.tab-header {
            order: 2;
            border-top: 1px solid var(--border-color);
        }
    }
}
</style>