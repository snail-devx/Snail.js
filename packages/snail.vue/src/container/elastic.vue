<!-- 弹性容器：
    1、根据内容变化，自动出现滚动条
    2、支持触顶、底部等事件，从而实现加载更多功能；
    3、支持移动端橡皮筋效果，支持上拉加载更多、下拉刷新数据等功能
  -->
<template>
    <div :="$attrs" class="snail-elastic">
        <!-- 主内容区域 -->
        <div class="main-area" ref="main-area">
            <slot />
        </div>
        <!-- 插件挂载区域 -->
        <template v-if="readyRef">
            <!-- 默认挂载插件：滚动条，在bar为true时生效 -->
            <ElasticBar v-if="bar" :="slotHandle" :detail="detailRef" />
            <!-- 自定义插件：通过 plugin 插槽挂载一些自定义的组件过来，如下拉刷新、上拉加载 -->
            <slot name="plugin" :="slotHandle" :detail="detailRef" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ElasticDetail, useElastic } from "snail.view";
import { onMounted, shallowRef, ShallowRef, useTemplateRef } from "vue";
import ElasticBar from "./components/elastic-bar.vue";
import { ElasticOptions, ElasticSlotHandle } from "./models/elastic-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "Elastic", inheritAttrs: false });
const props = defineProps<ElasticOptions>();
const mainAreaDom = useTemplateRef("main-area");
const { elastic, bar } = props;
//  2、组件交互变量、常量
/**     是否准备好了，准备二区号了，进行插件插槽渲染 */
const readyRef: ShallowRef<boolean> = shallowRef(false);
/**     插槽句柄：初始化中赋值并锁定 */
const slotHandle: ElasticSlotHandle = Object.create(null);
/**     弹性滚动的详情信息：感知滚动状态 */
const detailRef: ShallowRef<ElasticDetail> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    const em = useElastic(mainAreaDom.value, props, detail => detailRef.value = detail);
    //  插槽句柄初始化
    Object.assign<ElasticSlotHandle, ElasticSlotHandle>(slotHandle, {
        elastic: elastic,
        target: mainAreaDom.value,
        dock: em.dock,
        refresh: em.refresh,
        //  这属性直接绑定
        detail: undefined,
    });
    Object.freeze(slotHandle);

    readyRef.value = true;
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    position: relative;
    background-color: #F6F8FF;
    overflow: hidden;

    //  主内容区域
    >div.main-area {
        position: relative;
        min-width: 100%;
        height: fit-content;
        z-index: 1;
        user-select: none;
        background-color: white;
    }
}
</style>
