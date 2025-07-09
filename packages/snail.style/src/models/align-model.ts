/**
 * 组件对齐样式
 * - flex布局时约束 align-items和 justify-content
 * - 非flex布局时约束 text-align和 vertical-align
 */
export type AlignStyle = {
    /**
     * 对齐方式
     * - left: 左对齐
     * - center: 居中对齐
     * - right: 右对齐
     */
    align?: "left" | "center" | "right";
    /**
     * 垂直对齐方式
     * - top: 顶部对齐
     * - middle: 居中对齐
     * - bottom: 底部对齐
     */
    valign?: "top" | "middle" | "bottom";
}