<!-- 弹性布局组件
    1、使用 flex 布局；支持row、column、row-reverse、column-reverse布局方式
    2、支持设置主轴、交叉之换行方式，支持换行
    3、针对多行项目等宽、等高时，最后一行自动填充占位项，实现均分布局，特别是在space-between、space-around布局方式时，最后一行子项不够时展示补全的问题
-->
<template>
    <div :="$attrs" class="snail-flex" :class="classRef" :style="isStringNotEmpty(gap) ? { '--gap': gap } : undefined"
        ref="root-flex">
        <slot />
        <!-- 空间修复组件，遍历需要修复的数量 -->
        <component :class="[props.itemClass || '', 'repair-item']" :is="correctString(props.itemTag, 'div', true)"
            v-for="_ in repairItemsRef" />
    </div>
</template>

<script setup lang="ts">
import { correctString, isStringNotEmpty } from "snail.core";
import { useObserver } from "snail.view";
import { computed, onMounted, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { useReactive } from "../base/reactive";
import { FlexOptions } from "./models/flex-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "Flex", inheritAttrs: false });
const props = defineProps<FlexOptions>();
const rootDom = useTemplateRef("root-flex");
const { onSize } = useObserver();
const { watcher } = useReactive();
//  2、组件交互变量、常量
/** 自定义类样式 */
const classRef = computed(buildClass);
/** 修补的占位空元素个数 */
const repairItemsRef: ShallowRef<number> = shallowRef(0);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建类样式
 * - drirection和wrap
 */
function buildClass() {
    const items: string[] = [];
    //  direction给默认值，若需要计算修复，则强制给 row值
    let direction: string = props.direction;
    props.repairItem == true && isStringNotEmpty(direction) == false && (direction = "row");
    direction && items.push(direction);

    props.wrap && items.push(props.wrap);
    //  对齐方式
    isStringNotEmpty(props.main) && items.push(`justify-${props.main}`);
    isStringNotEmpty(props.cross) && items.push(`items-${props.cross}`);
    isStringNotEmpty(props.content) && items.push(`content-${props.content}`);

    return items;
}

/**
 * 构建修复子项空间
 */
function repairSpace() {
    repairItemsRef.value = 0;
    const needRepair = props.repairItem == true
        && (props.main == "between" || props.main == "around" || props.main == "evenly")
        && props.itemCount > 0
        && rootDom.value.children.length > 0;
    if (needRepair == true) {
        //  计算容器尺寸、子项尺寸、子项间距
        let containerSize: number, itemSize: number, itemGap: number;
        const containerStyle = getComputedStyle(rootDom.value);
        const itemStyle = getComputedStyle(rootDom.value.children[0]);
        switch (props.direction) {
            //  按列布局时
            case "column":
            case "column-reverse": {
                containerSize = parseFloat(containerStyle.height);
                itemGap = parseFloat(containerStyle.rowGap);
                itemSize = parseFloat(itemStyle.height);
                break;
            }
            //  按行布局时
            default: {
                containerSize = parseFloat(containerStyle.width);
                itemGap = parseFloat(containerStyle.columnGap);
                itemSize = parseFloat(itemStyle.width);
                break;
            }
        }
        /** 计算每行能显示多少个子项
         *   1、初期规则：根据不同space效果做测试，发现左右两侧的间距时有可能调整为0的，所有始终按照如下公式计算即可
         *           x*size+(x-1)*gap=totalSize  -> x*size+x*gap=totalSize+gap;
         *          itemCountPer = Math.floor((containerSize + itemGap) / (itemSize + itemGap));
         *   2、备份代码：
         *      // switch (parseFloat(itemStyle.flexGrow) > 0 ? "between" : props.main) {
         *      //     //  x*size+(x-1)*gap=totalSize  -> x*size+x*gap=totalSize+gap;
         *      //     case "between": {
         *      //         itemCountPer = Math.floor((containerSize + itemGap) / (itemSize + itemGap));
         *      //         break;
         *      //     }
         *      //     //  x*size+x*2*gap=totalSize  
         *      //     case "around": {
         *      //         itemCountPer = Math.floor(containerSize / (itemSize + 2 * itemGap));
         *      //         break;
         *      //     }
         *      //     //  x*size+(x+1)*gap=totalSize
         *      //     case "evenly": {
         *      //         itemCountPer = Math.floor((containerSize - itemGap) / (itemSize + itemGap));
         *      //         break;
         *      //     }
         *      // }
         */
        let itemCountPer: number = Math.floor((containerSize + itemGap) / (itemSize + itemGap));
        //  计算最后一行需要补充的子项：每行仅显示1个的话，没有修复的意义，忽略
        if (itemCountPer > 1) {
            const mode = props.itemCount % itemCountPer;
            mode > 0 && (repairItemsRef.value = itemCountPer - mode);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    repairSpace();
    //  监听响应式处理，后续看情况增加其他属性监听，实现更精细化的控制
    watcher<boolean>(() => props.repairItem, repairSpace);
    watcher<number>(() => props.itemCount, repairSpace);
    //  容器大小发生变化时，重新计算修复空间
    onSize(rootDom.value, repairSpace);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

//  flex基础信息：方向、换行、间距等
.snail-flex {
    display: flex;
    --gap: 0;
    gap: var(--gap);

    //  1️⃣ flex的方向  flex-direction

    &.row {
        flex-direction: row;
    }

    &.row-reverse {
        flex-direction: row-reverse;
    }

    &.column {
        flex-direction: column;
    }

    &.column-reverse {
        flex-direction: column-reverse;
    }

    //  2️⃣ 换行配置    flex-wrap

    &.nowrap {
        flex-wrap: nowrap;
    }

    &.wrap {
        flex-wrap: wrap;
    }

    &.wrap-reverse {
        flex-wrap: wrap-reverse;
    }
}

//  对齐方式：主轴、交叉轴、多行对齐
.snail-flex {

    //  1️⃣ 主轴对齐方式    justify-content

    &.justify-start {
        justify-content: flex-start;
    }

    &.justify-center {
        justify-content: center;
    }

    &.justify-end {
        justify-content: flex-end;
    }

    &.justify-between {
        justify-content: space-between;
    }

    &.justify-around {
        justify-content: space-around;
    }

    &.justify-evenly {
        justify-content: space-evenly;
    }

    //  2️⃣ 交叉轴对齐方式   align-items

    &.items-start {
        align-items: flex-start;
    }

    &.items-center {
        align-items: center;
    }

    &.items-end {
        align-items: flex-end;
    }

    &.items-stretch {
        align-items: stretch;
    }

    &.items-baseline {
        align-items: baseline;
    }

    //  3️⃣ 多行时交叉轴对齐方式    align-content

    &.content-start {
        align-content: flex-start;
    }

    &.content-center {
        align-content: center;
    }

    &.content-end {
        align-content: flex-end;
    }

    &.content-stretch {
        align-content: stretch;
    }

    &.content-between {
        align-content: space-between;
    }

    &.content-around {
        align-content: space-around;
    }

    &.content-evenly {
        align-content: space-evenly;
    }
}

//  修复空间时的特殊样式
.snail-flex {

    //  行布局时的空间修补子项特例样式：不显示，无高度
    &.row>.repair-item,
    &.row-reverse>.repair-item {
        height: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        visibility: hidden !important;
    }

    //  列布局时的空间修补子项特例样式：不显示，无宽度
    &.column>.repair-item,
    &.column-reverse {
        width: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        visibility: hidden !important;
    }
}
</style>