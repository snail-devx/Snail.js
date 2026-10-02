import { ElasticBaseOptions, ElasticDetail, StyleClassItem } from "snail.view";

/**
 * 构建弹性滚动视图的滚动条样式
 * - 配合 `Elastic.vue`组件使用
 * @param target 弹性滚动的目标元素
 * @@param elastic 弹性滚动配置
 * @param detail 当前弹性滚动详情
 */
export function buildBarStyle(target: HTMLElement, elastic: ElasticBaseOptions["elastic"], detail: ElasticDetail): StyleClassItem[] {
    const classes: StyleClassItem[] = [];
    // 水平滚动条
    if (elastic == "both" || elastic == "x") {
        const xbar = calcBarStyle(target.parentElement.clientWidth, target.clientWidth, detail.position.x);
        classes.push({
            mode: "nesting",
            rule: ".snail-elastic::before",
            style: {
                width: xbar.size == undefined ? "0" : `${xbar.size}px`,
                left: xbar.position == undefined ? "0" : `${xbar.position}px`,
            }
        });
    }
    // 垂直滚动条
    if (elastic == "both" || elastic == "y") {
        // console.log("--------------", target.clientHeight);
        const ybar = calcBarStyle(target.parentElement.clientHeight, target.clientHeight, detail.position.y);
        classes.push({
            mode: "nesting",
            rule: ".snail-elastic::after",
            style: {
                height: ybar.size == undefined ? "0" : `${ybar.size}px`,
                top: ybar.position == undefined ? "0" : `${ybar.position}px`,
            }
        });
    }

    return classes;
}
/**
 * 计算滚动条样式：大小和位置
 * - 支持水平、垂直滚动条的设置
 * @param parentSize 容器父的尺寸，宽度/高度
 * @param size  内容尺寸，宽度/高度
 * @param position 内容元素位置，x/y轴
 */
function calcBarStyle(parentSize: number, size: number, position: number): { size: number, position: number } {
    //  position >=0 向下、向右时； position 始终为0,但是尺寸要加上position
    if (position >= 0) {
        size += position;
        size = Math.floor((parentSize / size) * parentSize);
        position = 0;
    }
    //  position <0 向上、向左时；到结束位置后，固定在结束为止，但尺寸要加上溢出的尺寸
    else {
        //  计算溢出尺寸：若内容尺寸小于容器尺寸，则溢出尺寸为0
        const minOffset = Math.min(0, parentSize - size);
        if (position < minOffset) {
            size += minOffset - position;
        }
        //  计算尺寸大小和比例
        const scale = parentSize / size;
        size = Math.floor(scale * parentSize);
        position = Math.floor((-position) * scale);
    }
    //  超出最大尺寸时，忽略滚动条；如内容尺寸小于内容尺寸时
    parentSize <= size && (size = 0);
    return { size, position };
}