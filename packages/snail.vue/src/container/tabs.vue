<!-- 标签页组件：
    1、标签项支持左侧、顶部、右侧、底部显示
    2、标签内容支持渲染一个、渲染全部
    3、标签项内容，支持动态组件、或者插槽，切换标签页时，支持切换前钩子
 -->
<template>
    <div class="snail-tab" :class="[correctString(position, 'top', true)]"
        :style="{ '--tab-width': tabWidth, '--tab-height': tabHeight }">
        <Loading :show="loading" />
        <!-- 头部导航区域：显示标签项，点击时激活显示内容 -->
        <div class="tab-header" v-if="isArrayNotEmpty(tabs) && hideHeader != true">
            <!-- 标签项 -->
            <div class="tab-items small-scrollbar" :class="[correctString(align, 'left', true)]" ref="tab-items">
                <div class="tab-item" v-for="tab in tabs" :key="tab.id" :class="{ 'actived': selectedItemRef == tab }"
                    :title="tab.name" :id="tab.id" @click="onTabItemClick(tab)">
                    <template v-if="tab.icon">
                        <Icon class="tab-icon" v-if="isString(tab.icon)" :type="as<IconType>(tab.icon)" />
                        <component class="tab-icon" v-else :is="tab.content" />
                    </template>
                    <span class="ellipsis" v-text="tab.name" />
                </div>
            </div>
            <!-- 更多按钮：溢出时才出 -->
            <Icon class="more-items" button custom :size="20" :hover-color="'#279bf1'"
                v-if="overflowStatusRef && overflowStatusRef.overflowX == true" @click="onShowMoreTabs">
                <path
                    d="M150.54803811 177.65693516h677.72242858v90.36299049H150.54803811zM150.54803811 426.15515905h677.72242858v90.36299049H150.54803811zM150.54803811 674.65338292h677.72242858v90.36299043H150.54803811z" />
            </Icon>
        </div>
        <!-- 标签内容区域：渲染激活的标签项，支持插槽和动态组件两种方式 -->
        <div class="tab-content small-scrollbar" v-if="selectedItemRef">
            <Dynamic v-if="isObject(selectedItemRef.content)" :key="getKey(selectedItemRef)"
                :="as<ComponentOptions>(selectedItemRef.content)" :props="selectedItemRef.props"
                v-bind="buildTabItemHandle(selectedItemRef)" />
            <slot v-else-if="isString(selectedItemRef.content)" :key="getKey(selectedItemRef) + 'slot'"
                :name="selectedItemRef.content" :="selectedItemRef.props" v-bind="buildTabItemHandle(selectedItemRef)">
                <Empty :message="`无[${selectedItemRef.content}]插槽，无法渲染标签页`" />
            </slot>
            <Empty v-else :message="`[${selectedItemRef.name}]标签页未指定 content；无法渲染`" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, isArrayNotEmpty, IScope, isObject, isString, isStringNotEmpty, useHook, useKey } from 'snail.core';
import { ElementOverflowStatus, scrollIntoView, useObserver } from 'snail.view';
import { nextTick, onMounted, onUnmounted, shallowRef, ShallowRef, useTemplateRef } from 'vue';
import Dynamic from '../base/dynamic.vue';
import Icon from '../base/icon.vue';
import { ComponentOptions } from '../base/models/component-model';
import { IconType } from '../base/models/icon-model';
import { useReactive } from '../base/reactive';
import { as } from '../base/utils/base-util';
import { usePicker } from '../picker/manager';
import Empty from '../prompt/empty.vue';
import Loading from '../prompt/loading.vue';
import { TabsEvents, TabsHandle, TabsItemHandle, TabsItemOptions, TabsOptions } from './models/tabs-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<TabsOptions>();
const emits = defineEmits<TabsEvents>();
const { getKey } = useKey();
const { showAction } = usePicker();
const { onOverflow } = useObserver();
const { watcher } = useReactive();
const { register, runHookAsync } = useHook<string>();
/**     标签选项卡容器Dom，计算溢出使用 */
const tabItemsDom = useTemplateRef('tab-items');
//  2、组件交互变量、常量
/**     选中的标签项 */
const selectedItemRef: ShallowRef<TabsItemOptions> = shallowRef(undefined);
/**     标签选项卡容器Dom的溢出状态*/
const overflowStatusRef: ShallowRef<ElementOverflowStatus> = shallowRef();
/**     标签选项卡容器Dom的溢出状态监听作用域 */
let overflowScope: IScope = undefined;

// *****************************************   👉  句柄+接口    ****************************************
/**     标签页操作句柄 */
const handle: TabsHandle = Object.freeze<TabsHandle>({
    active(position: string | number) {
        if (props.tabs && props.tabs.length > 0) {
            const tab = isString(position) ? props.tabs.find(t => t.id == position) : props.tabs[position];
            return tab != undefined ? onTabItemClick(tab) : Promise.resolve(false);
        }
        return Promise.resolve(false);
    },
    next() {
        if (props.tabs && props.tabs.length > 0) {
            let tab: TabsItemOptions = selectedItemRef.value == undefined ? props.tabs[0] : undefined;
            if (tab == undefined) {
                const index = props.tabs.indexOf(selectedItemRef.value);
                index != -1 && index < props.tabs.length - 1 && (tab = props.tabs[index + 1]);
            }
            return tab != undefined ? onTabItemClick(tab) : Promise.resolve(false);
        }
        return Promise.resolve(false);
    },
    prev() {
        if (props.tabs && props.tabs.length > 0) {
            let tab: TabsItemOptions = selectedItemRef.value == undefined ? props.tabs[0] : undefined;
            if (tab == undefined) {
                const index = props.tabs.indexOf(selectedItemRef.value);
                index > 0 && (tab = props.tabs[index - 1]);
            }
            return tab != undefined ? onTabItemClick(tab) : Promise.resolve(false);
        }
        return Promise.resolve(false);
    }
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 监控标签页容器Dom的溢出状态
 */
function monitTabItemsOverFlow() {
    //  无需溢出监听
    if (props.hideHeader == true || props.position == "left" || props.position == "right") {
        overflowStatusRef.value = undefined;
        overflowScope && overflowScope.destroy();
        overflowScope = undefined;
        return;
    }
    //  需要溢出监听：但要避免重复监听
    if (overflowScope == undefined || overflowScope.destroyed == true) {
        overflowScope = onOverflow(tabItemsDom.value, now => overflowStatusRef.value = now);
    }
}
/**
 * 构建标签项的操作句柄
 * @param tab 
 */
function buildTabItemHandle(tab: TabsItemOptions): TabsItemHandle {
    return {
        onBeforeLeave: fn => register(tab.id, fn),
    }
}

/**
 * 页签项点击时
 * @param tab 
 * @returns 是否切换成功
 */
async function onTabItemClick(tab: TabsItemOptions): Promise<boolean> {
    if (selectedItemRef.value != tab) {
        emits("click", tab.id);
        //  初次不用执行钩子函数；否则执行钩子函数，然后根据返回值决定是否切换
        let canSelect = selectedItemRef.value == undefined ? true : undefined;
        if (canSelect == undefined) {
            const rt = await runHookAsync(selectedItemRef.value.id, { mode: "one", order: "desc" });
            canSelect = rt.success == true && rt.data !== false;
        }
        if (canSelect == true) {
            const oldTabId = selectedItemRef.value ? selectedItemRef.value.id : undefined;
            selectedItemRef.value = tab;
            scrollIntoView(tab.id);
            emits("active", tab.id);
            emits("change", tab.id, oldTabId);
            return true;
        }
    }
    return false;
}
/**
 * 显示更多的标签页
 */
async function onShowMoreTabs(evt: Event) {
    const code = await showAction(evt.target as HTMLElement, {
        title: "标签页",
        actions: props.tabs.map(t => ({ id: t.id, name: t.name })),
        value: selectedItemRef.value ? selectedItemRef.value.id : undefined,
    });
    //  若切换了选中页签，则同步激活，并确保显示到视图窗口中
    if (isStringNotEmpty(code) && (selectedItemRef.value == undefined || selectedItemRef.value.id != code)) {
        handle.active(code);
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
    //  监听值改变，进行溢出状态计算
    watcher(() => props.position, monitTabItemsOverFlow);
    watcher(() => props.hideHeader, monitTabItemsOverFlow);
    setTimeout(monitTabItemsOverFlow, 0);
});
onUnmounted(() => overflowScope && overflowScope.destroy());
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
            display: flex;
            flex: 1;
            position: relative;

            & {
                &.center {
                    justify-content: center;
                }

                &.end {
                    justify-content: flex-end;
                }
            }

            >.tab-item {
                flex: none;
                position: relative;
                cursor: pointer;
                padding: 0 10px;
                gap: 4px;
                color: #646464;
                display: flex;
                align-items: center;

                // 标签项图标
                >svg.tab-icon {
                    flex: none;
                    fill: currentColor;
                    width: 14px;
                    height: 14px;
                }
            }
        }

        // 更多tabs导航按钮
        >.more-items {
            flex: none;
            margin-left: 10px;
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
        //  变量定义
        --tab-width: 200px;
        --tab-height: 40px;

        >.tab-header {
            width: var(--tab-width);

            >.tab-items {
                flex-direction: column;
                overflow: hidden auto;

                >.tab-item {
                    height: var(--tab-height);

                    &:hover {
                        background-color: #EFF9FF;
                        color: var(--actived-color);
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
        flex-direction: column; //  变量定义
        --tab-width: 100px;
        --tab-height: 44px;

        >.tab-header {
            height: var(--tab-height);

            >.tab-items {
                overflow: hidden;

                >.tab-item {
                    justify-content: center;
                    width: var(--tab-width);

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