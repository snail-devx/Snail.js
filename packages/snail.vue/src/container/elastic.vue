<!-- 弹性容器：
    1、根据内容变化，自动出现滚动条
    2、支持触顶、底部等事件，从而实现加载更多功能；
    3、支持移动端橡皮筋效果，支持上拉加载更多、下拉刷新数据等功能
  -->
<template>
    <div :="$attrs" class="snail-elastic" :class="style.namespace">
        <!-- 主内容区域 -->
        <div class="main-area" ref="main-area">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElasticDetail, useElastic, useStyle } from "snail.view";
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { ElasticOptions } from "./models/elastic-model";
import { buildBarStyle } from "./utils/elastic-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "Elastic", inheritAttrs: false });
const props = defineProps<ElasticOptions>();
const mainAreaDom = useTemplateRef("main-area");
const style = useStyle();
//      解构属性
const { elastic, bar } = props;
//  2、组件交互变量、常量
/** 滚动条结束时的定时器 */
let barEndTimer: NodeJS.Timeout = undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 弹性滚动时的处理
 * @param detail 
 */
function onElasticDetail(detail: ElasticDetail) {
    //  计算水平滚动条和垂直滚动条的大小：后期这里进行 requestAnimationFrame 更新，让滚动条流畅跟手
    if (bar == true) {
        barEndTimer && clearTimeout(barEndTimer);
        barEndTimer = undefined;
        const classes = buildBarStyle(mainAreaDom.value, elastic, detail);
        style.build(classes);
        //  结束后，超时隐藏滚动条
        if (detail.status == "end" && classes.length > 0) {
            classes.forEach(item => item.style.opacity = 0);
            barEndTimer = setTimeout(style.build, 400, classes);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    console.log({ ...props });
    useElastic(mainAreaDom.value, props, onElasticDetail);
});
onUnmounted(() => {
    barEndTimer && clearTimeout(barEndTimer);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    position: relative;
    background-color: #F6F8FF;
    overflow: hidden;
}

//  主内容区域
.snail-elastic {
    >div.main-area {
        position: relative;
        min-width: 100%;
        height: fit-content;
        z-index: 1;
        user-select: none;
    }
}

//  滚动条区域：采用伪类绘制
.snail-elastic {

    &::before,
    &::after {
        position: absolute;
        content: " ";
        background-color: #c3c7cb;
        z-index: 2;
        border-radius: 2px;
        transition: opacity 0.2s linear;
        opacity: 1;
    }

    // 水平滚动条
    &::before {
        height: 4px;
        bottom: 0;
    }

    // 垂直滚动条
    &::after {
        width: 4px;
        right: 0;
    }
}
</style>
