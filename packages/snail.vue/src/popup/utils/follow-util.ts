/**
 * 跟随弹窗 助手方法
 */
import { isArray, isArrayNotEmpty, isNumberNotNaN, isString, isStringNotEmpty, throwIfFalse, throwIfUndefined } from "snail.core";
import { FollowOptions, FollowStrategy } from "../models/follow-model";

/**
 * 检测弹窗配置选项
 * @param options 弹窗配置选项
 * @returns 检测结果：为空则检测通过，否则返回错误信息
 */
export function checkFollow(options: FollowOptions): string | undefined {
    //  暂无可检测配置项
    return undefined;
}

/**
 * 计算x轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param target 目标元素的矩形信息
 * @param width 跟随组件的宽度
 * @returns 水平方向的跟随效果：left标记坐标位置，width标记组件新的宽度；undefined表示不设置，
 */
export function calcFollowX(options: FollowOptions, target: DOMRectReadOnly, width: number): { left: string, width?: string } {
    const space = isNumberNotNaN(options.spaceX) ? options.spaceX : 0;
    const spaceClient = isNumberNotNaN(options.spaceClient) ? options.spaceClient : 0;
    //  若target已经显示不全了，则不再显示follow
    if ((target.left < spaceClient) || (target.right + spaceClient > window.innerWidth)) {
        return { left: `-${width}px` };
    }
    //  计算left值，若操作了宽度值，则强制更新回去：
    const position = electPosition(
        getFollowStrategy(options.followX) || ["after", "before", "start", "end", "center", "ratio"],
        target.left, target.right, width, window.innerWidth, space, spaceClient
    );
    const style: { left: string, width?: string } = { left: `${position.start}px` };
    position.size == undefined || (style.width = `${position.size}px`);
    return style;
}
/**
 * 计算y轴方向的【跟随效果】
 * @param options 跟随配置选项
 * @param target 目标元素的矩形信息
 * @param height 跟随组件的高度
 * @returns 水平方向的跟随效果：top、bottom标记坐标位置，height标记组件新的高度；undefined表示不设置，
 */
export function calcFollowY(options: FollowOptions, target: DOMRectReadOnly, height: number): { top?: string, height?: string } {
    //  若target已经显示不全了，则不再显示follow
    const space = isNumberNotNaN(options.spaceY) ? options.spaceY : 0;
    const spaceClient = isNumberNotNaN(options.spaceClient) ? options.spaceClient : 0;
    if ((target.top < spaceClient) || (target.bottom + spaceClient > window.innerHeight)) {
        return { top: `-${height}px` };
    }
    //  计算top值，若操作了高度值，则强制更新回去：
    const position = electPosition(
        getFollowStrategy(options.followY) || ["after", "before", "start", "end", "center", "ratio"],
        target.top, target.bottom, height, window.innerHeight, space, spaceClient
    );
    const style: { top?: string, height?: string } = { top: `${position.start}px` };
    position.size == undefined || (style.height = `${position.size}px`);
    return style;
}

//#region ***************************************************************** 私有变量、方法 *****************************************************************
/**
 * 获取跟随策略
 * @param strategy 
 * @returns 策略数组，未传入则返回undefined
 */
function getFollowStrategy(strategy?: FollowStrategy | FollowStrategy[]): FollowStrategy[] | undefined {
    return isStringNotEmpty(strategy)
        ? [strategy as FollowStrategy]
        : isArrayNotEmpty(strategy)
            ? strategy as FollowStrategy[]
            : undefined;
}
/**
 * 选举跟随位置
 * @param strategy 跟随策略数组
 * @param targetStart 目标元素起始位置，left、top
 * @param targetEnd 目标元素结束位置，right、bottom
 * @param contentSize 当前内容元素大小，width、height
 * @param clientSize 客户端大小：window.innerWidth、window.innerHeight
 * @param space 留白空间：offsetX、offsetY
 * @param spaceClient 边缘位置
 * @returns 
 */
function electPosition(strategy: FollowStrategy[], targetStart: number, targetEnd: number, contentSize: number, clientSize: number, space: number, spaceClient: number)
    : { start: number, size?: number } {
    var maxPosition: { start: number, size?: number } = undefined;
    for (const fs of strategy) {
        const tmp = deducePosition(fs, targetStart, targetEnd, contentSize, clientSize, space, spaceClient);
        //  位置计算无效，继续尝试
        if (tmp == undefined) {
            continue;
        }
        //  无需调整尺寸，即可展示，则直接返回
        if (tmp.size == undefined) {
            return tmp;
        }
        //  记录最大尺寸展示位置
        if (maxPosition == undefined || maxPosition.size < tmp.size) {
            maxPosition = tmp;
        }
    }
    //  选择最大尺寸位置，若无则报错
    if (maxPosition == undefined) {
        const msg = `electPosition: invalid follow strategy, deduce position failed. strategy: ${strategy.join(",")}.`;
        throw new Error(msg);
    }
    return maxPosition;
}

/**
 * 位置推断：传入固定策略进行推断
 * @param strategy 位置类型；传入非支持值则返回undefined
 * @param targetStart 目标元素起始位置，left、top
 * @param targetEnd 目标元素结束位置，right、bottom
 * @param contentSize 当前内容元素大小，width、height
 * @param clientSize 客户端大小
 * @param space 留白空间：offsetX、offsetY
 * @param spaceClient 边缘位置
 * @returns 推断结果，undefined表示 strategy 值无效
 */
function deducePosition(strategy: FollowStrategy, targetStart: number, targetEnd: number, contentSize: number, clientSize: number, space: number, spaceClient: number)
    : { start: number, size?: number } | undefined {
    //  计算一些变量，方便后面复用
    /**     最大的结束位置 */
    const maxEnd = clientSize - spaceClient;
    //  根据策略计算位置
    switch (strategy) {
        //  target结束位置 之后展示；展示不全，则缩放尺寸
        case "after": {
            const start = targetEnd + space;
            return {
                start,
                size: start + contentSize > maxEnd ? maxEnd - start : undefined,
            }
        }
        //  target开始位置 之前展示；展示不全，则缩放尺寸
        case "before": {
            const start = targetStart - contentSize - space;
            return {
                start: Math.max(spaceClient, start),
                size: start < spaceClient ? (targetStart - space - spaceClient) : undefined,
            }
        }
        //  和target相同开始值；展示不全，则缩放尺寸
        case "start": {
            const start = targetStart + space;
            return {
                start,
                size: start + contentSize > maxEnd ? maxEnd - start : undefined,
            };
        }
        //  和target相同结束位置；展示不全，则缩放尺寸
        case "end": {
            const tmpStart = targetEnd - space - contentSize;
            const sizeOffset = Math.min(0, tmpStart - spaceClient);
            return {
                start: tmpStart + sizeOffset,
                size: sizeOffset < 0 ? contentSize + sizeOffset : undefined
            };
        }
        //  和target相同中心点；展示不全，则缩放尺寸；取消间距
        case "center": {
            const center = parseInt(targetStart + (targetEnd - targetStart) / 2 as any);
            //  起始位置，展示不全，则计算size偏移量，并强制起始位置为 spaceClient
            var tmp = parseInt(center - contentSize / 2 as any);
            var sizeOffset: number = Math.min(0, tmp - spaceClient);
            const start = sizeOffset < 0 ? spaceClient : tmp;
            //  结束位置是否能够展示全，展示不全，继续调整size偏移量
            tmp = parseInt(center + contentSize / 2 as any);
            sizeOffset += Math.min(0, maxEnd - tmp);
            return {
                start,
                size: sizeOffset < 0 ? contentSize + sizeOffset : undefined
            };
        }
        //  按比例（target中心点/窗口尺寸）锚定位置，动态计算位置；展示不全，则缩放尺寸
        case "ratio": {
            const maxSize = maxEnd - spaceClient;
            //  能展示全，则等比例微调start值：此时不考虑 space 间距值
            if (contentSize < maxSize) {
                const center = parseInt(targetStart + (targetEnd - targetStart) / 2 as any);
                const startSize = parseInt((center / clientSize) * contentSize as any);
                return {
                    start: center - startSize,
                }
            }
            //  展示不全，直接贴边展示；等于最大值时，不调整size值
            return {
                start: spaceClient,
                size: contentSize == maxSize ? undefined : maxSize
            };
        }
        //  其他情况，不属于制式规则，返回undefined；后期考虑报错
        default: {
            return undefined;
        }
    }
}
//#endregion