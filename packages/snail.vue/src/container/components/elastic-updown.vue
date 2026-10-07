<!-- Elastic 弹性容器插件：上拉加载、下拉刷新扩展
    1、在弹性容器 拖拽时，实时感知是否需要进行上拉加载、下拉刷新
    2、样式信息挂载到 .snail-elastic 下
    3、使用此组件的要求，需要 y 轴启用弹性，且使用Elastic时配置dock配置（top 40；bottom 40），否则无法正常使用
    4、触发上拉加载，下拉刷新时，将通过事件通知外部
-->
<template>
    <!-- 下拉刷新数据 -->
    <div v-if="down == true && refreshRef" class="down-refresh">
        <Icon v-if="refreshRef != 'running'" custom :size="16" :rotate="refreshRef == 'release' ? 180 : 0">
            <path :d="downIconPath" />
        </Icon>
        <Icon v-else class="circle-infinite" :type="'circle-loading'" :size="16" />
        <span>
            <template v-if="refreshRef == 'initial'">下拉刷新数据</template>
            <template v-if="refreshRef == 'release'">释放立即刷新</template>
            <template v-if="refreshRef == 'running'">{{ refreshMessageRef }}</template>
        </span>
    </div>
    <!-- 上拉加载更多数据 -->
    <div v-if="up == true && moreRef" class="up-more" :style="{ bottom: `${moreBottomRef}px` }">
        <Icon v-if="moreRef != 'running'" custom :size="16" :rotate="moreRef == 'release' ? 0 : 180">
            <path :d="downIconPath" />
        </Icon>
        <Icon v-else class="circle-infinite" :type="'circle-loading'" :size="16" />
        <span>
            <template v-if="moreRef == 'initial'">上拉加载更多数据</template>
            <template v-if="moreRef == 'release'">释放立即加载</template>
            <template v-if="moreRef == 'running'">加载中...</template>
        </span>
    </div>
</template>

<script setup lang="ts">
import { correctString, isFunction } from 'snail.core';
import { ElasticDetail, ElasticDockOptions } from 'snail.view';
import { onMounted, shallowRef, ShallowRef } from 'vue';
import Icon from '../../base/icon.vue';
import { ReadyEvents } from '../../base/models/base-event';
import { useReactive } from '../../base/reactive';
import { ElasticSlotHandle, ElasticUpdownHandle, ElasticUpdownOptions } from '../models/elastic-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticUpdownOptions & ElasticSlotHandle>();
const emits = defineEmits<ReadyEvents<ElasticUpdownHandle>>();
const { watcher } = useReactive();
const { target } = props;
//  2、组件交互变量、常量
/** 下拉刷新状态：开始态、等待释放生效、刷新中 */
const refreshRef: ShallowRef<"initial" | "release" | "running"> = shallowRef();
/** 下拉刷新时的消息提示语，默认“刷新中" */
const refreshMessageRef: ShallowRef<string> = shallowRef();
/** 上拉加载状态：初始态、等待释放生效、加载中 */
const moreRef: ShallowRef<"initial" | "release" | "running"> = shallowRef();
/** 上拉加载更多的bottom位置定位值 */
const moreBottomRef: ShallowRef<number> = shallowRef(0);
/** 向下的图标绘制路径 */
const downIconPath: string = "M955.733333 460.8c-37.546667-40.96-105.813333-40.96-143.36-3.413333l-177.493333 170.666666V119.466667C631.466667 54.613333 576.853333 0 512 0s-119.466667 54.613333-119.466667 119.466667v505.173333l-177.493333-170.666667c-40.96-37.546667-105.813333-37.546667-143.36 3.413334-37.546667 40.96-37.546667 105.813333 3.413333 143.36l430.08 416.426666c-3.413333 6.826667 3.413333 6.826667 6.826667 6.826667s10.24 0 10.24-3.413333l430.08-416.426667c40.96-37.546667 40.96-102.4 3.413333-143.36z";

// *****************************************   👉  方法+事件    ****************************************
/**
 * 弹性视图状态详情变化时
 * @param detail 
 */
function onDetailChange(detail: ElasticDetail) {
    //  启动时，进行初始化操作：后续看情况，如下拉刷新和上拉加载正在进行中，应该停止继续判断上拉加载和下拉刷新
    if (detail.status == "start") {
        refreshRef.value != "running" && (refreshRef.value = undefined);
        moreRef.value != "running" && (moreRef.value = undefined);
    }
    //  弹性过程中，判断是否需要进行上拉加载和下拉刷新
    else if (detail.status != "end") {
        //  下拉时：看看是否开启了下拉刷新
        if (props.down == true && detail.touch.total.y > 0 && refreshRef.value != "running") {
            refreshRef.value = detail.position.y >= 40 ? "release" : "initial";
        }
        //  上拉时：看看是否开启了上拉加载更多；判定处于释放状态时，【上拉加载更多】提示跟手往上移动
        else if (props.up == true && detail.touch.total.y < 0 && moreRef.value != "running") {
            const minY: number = target.parentElement.clientHeight - target.clientHeight;
            if (detail.position.y - minY <= - 40) {
                moreRef.value = "release";
                moreBottomRef.value = -(detail.position.y - minY + 40);
            }
            else {
                moreRef.value = "initial";
                moreBottomRef.value = 0;
            }
        }

        resetDock(false);
    }
    //  结束态：对应方向处理【释放】状态时，触发【刷新】或【加载更多】
    else {
        if (refreshRef.value == "release") {
            refreshRef.value = "running";
            refreshMessageRef.value = "正在刷新...";
            setTimeout(onRefreshOrMore, 0, "refresh");
        }
        else if (moreRef.value == "release") {
            moreRef.value = "running";
            setTimeout(onRefreshOrMore, 0, "more");
        }
        moreBottomRef.value = 0;
    }
}

/**
 * 重置停靠位置
 * @param refreshView 是否刷新视图
 */
function resetDock(refreshView: boolean) {
    //  基于状态重置dock配置
    const options: ElasticDockOptions = Object.create(null);
    options.top = refreshRef.value == "running" || refreshRef.value == "release" ? 40 : 0;
    options.bottom = moreRef.value == "running" || moreRef.value == "release" ? 40 : 0;
    props.dock(options);

    refreshView && props.refresh();
}
/**
 * 执行刷新或者加载更多
 * @param mode 
 */
async function onRefreshOrMore(mode: "refresh" | "more") {
    //  通知外面，但需要等待上一次操作完成了
    try {
        await props.load(mode);
    }
    catch (ex) {
        console.error("elastic-up-down: load function run error", ex);
    }
    finally {
        refreshRef.value = undefined;
        moreRef.value = undefined;
        resetDock(true);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
    props.elastic != "both" && props.elastic != "y"
        && console.warn("elastic-up-down: elastic must be 'both' or 'y'");
    isFunction(props.load) != true
        && console.warn("elastic-up-down: load must be a function");
}
//  2、生命周期响应：挂载后，禁用dock（在下拉刷新和上拉加载时再启用）,并进行弹性状态监听（挂载前监听无意义）
onMounted(() => {
    props.dock(undefined);
    watcher(() => props.detail, onDetailChange);
    //  发送准备事件
    const handle: ElasticUpdownHandle = Object.freeze<ElasticUpdownHandle>({
        refresh(message: string) {
            if (props.down != true) {
                console.warn("elastic-up-down: down is false, can not refresh");
                return;
            }
            refreshMessageRef.value = correctString(message, "正在刷新...", true);
            //  执行刷新处理；后续看情况，如果刷新中，则不进行刷新
            refreshRef.value = "running";
            moreRef.value = undefined;
            resetDock(true);
            onRefreshOrMore("refresh");
        }
    });
    emits("ready", handle);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {

    .down-refresh,
    .up-more {
        user-select: none;
        position: absolute;
        left: 0;
        width: 100%;
        height: 40px;
        overflow: hidden;
        z-index: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        >svg {
            fill: #2e3033;
            opacity: 0.8;
        }

        >span {
            line-height: 18px;
            color: #2e3033;
        }
    }

    .down-refresh {
        top: 0;
    }

    .up-more {
        bottom: 0;
        //  后期看情况启用动画效果
        // transition: bottom 0.2s ease-out;
    }
}
</style>