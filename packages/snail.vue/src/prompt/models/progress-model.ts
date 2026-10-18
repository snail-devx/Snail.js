/**
 * 进度提示 组件配置选项
 */
export type ProgressOptions = {
    /**
     * 进度值
     * - 已完成多少了
     * - 取值范围：0-1
     */
    progress: number;

    /**
     * 整体背景色
     */
    background?: string;
    /**
     * 进度前景色
     * - 已完成区域的颜色
     */
    foreground?: string;

    /**
     * 进度条尺寸
     * - 进度条尺寸，目前为水平条，所以为高度值；后期支持圆形滚动条时，此值为源半径
     * - 不传入则默认 10px
     */
    size?: string;
}