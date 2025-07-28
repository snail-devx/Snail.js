<!-- 搜索组件-->
<template>
    <div class="snail-search" :class="props.readonly ? 'readonly' : ''">
        <input type="search" :placeholder="props.placeholder" :readonly="props.readonly == true"
            v-model.trim="textModel" @keyup.enter="onSearch" />
        <div>
            <Icon class="search-button" :type="'custom'" :draw="searchIon" :size="24" :color="'#707070'"
                @click="onSearch" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { SearchEvents, SearchOptions } from "./models/search-model";
import Icon from "./icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SearchOptions>();
const emits = defineEmits<SearchEvents>();
/**     搜索文本 */
const textModel = defineModel<string>({ default: "" });
/**     搜索图标 */
const searchIon: string = "M 860.16 824.32 l -163.84 -163.84 c 102.4 -120.32 97.28 -302.08 -17.92 -414.72 c -120.32 -120.32 -314.88 -120.32 -435.2 0 c -120.32 120.32 -120.32 314.88 0 435.2 c 112.64 112.64 294.4 120.32 414.72 17.92 l 163.84 163.84 c 10.24 10.24 25.6 10.24 35.84 0 c 12.8 -12.8 12.8 -28.16 2.56 -38.4 Z M 281.6 642.56 C 181.76 542.72 181.76 381.44 281.6 281.6 c 99.84 -99.84 261.12 -99.84 360.96 0 c 99.84 99.84 99.84 261.12 0 360.96 c -99.84 102.4 -261.12 102.4 -360.96 0 Z";
//      三方组件
//  2、可选配置选项
defineOptions({ name: "Search", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 搜索按钮点击
 */
function onSearch() {
    //  后期做一些验证，将旧值存储起来，没变化时不做触发
    props.readonly || emits("search", textModel.value);
}

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-search {
    height: 34px;
    background: white;
    flex-shrink: 0;
    //  flex 布局：display: flex，align-items 为center
    .flex-cross-center();

    >input {
        height: 100%;
        border-radius: 0 !important;
        flex: 1;
    }

    >div {
        width: 34px;
        height: 100%;
        flex-shrink: 0;
        border: 1px solid #DDDFED;
        border-left: none;
        //  flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();
    }

}
</style>
