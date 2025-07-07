
/**
 * 拖动验证配置选项
 */
export type DragVerifyOptions = {
    /**
     * 验证提示消息
     */
    message: string;
}
/**
 * 拖拽验证信息
 */
export type DragVerifyInfo = {
    /**
     * 状态：无、拖拽中、成功
     */
    status: "none" | "dragging" | "success";
    /**
     * 拖拽开始位置
     */
    startX: number;
    /**
     * 拖拽结束位置
     */
    endX: number;
    /**
     * 拖拽距离
     */
    distance: number;
}