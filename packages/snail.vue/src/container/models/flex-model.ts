/**
 * 弹性布局组件配置选项
 */
export type FlexOptions = {
    /**
     * 主轴方向
     * - css属性：flex-direction
     * - 取值范围：
     * - - row（默认值） 水平主轴，起点在左端
     * - - row-reverse 水平主轴，起点在右端
     * - - column 垂直主轴，起点在上沿
     * - - column-reverse 垂直主轴，起点在下沿
     */
    direction?: "row" | "column" | "row-reverse" | "column-reverse";
    /**
     * 是否换行
     * - css属性：flex-wrap
     * - 取值范围：
     * - - nowrap（默认值） 不换行，所有 flex 项都排在一行
     * - - wrap 换行，第一行在上方
     * - - wrap-reverse 换行，第一行在下方
     */
    wrap?: "nowrap" | "wrap" | "wrap-reverse";
    /**
     * 行与列之间的间隙（网格间距）
     * - css属性：gap
     * - row-gap、column-gap的缩写
     * - 举例：gap: "10px 20px" 表示行间距为10px，列间距为20px；gap: "10px" 表示行间距和列间距都为10px
     */
    gap?: string;
    /**
     * 主轴对齐方式
     * - css属性：justify-content
     * - 取值范围：
     * - - start（默认值） 主轴起点对齐
     * - - end 主轴终点对齐
     * - - center 主轴居中对齐
     * - - space-between 主轴两端对齐，项目之间间隔平均分布
     * - - space-around 主轴每个项目两侧间隔平均分布
     * - - space-evenly 主轴每个项目之间间隔平均分布
     */
    justifyContent?: "start" | "end" | "center" | "space-between" | "space-around" | "space-evenly";
    /**
     * 交叉轴对齐方式
     * - css属性：align-items
     * - 取值范围：
     * - - stretch（默认值） 交叉轴拉伸对齐（如果项目未设置高度或设为 auto，将占满整个交叉轴）
     * - - start 交叉轴起点对齐
     * - - end 交叉轴终点对齐
     * - - center 交叉轴居中对齐
     * - - baseline 交叉轴第一行文字基线对齐
     */
    alignItems?: "start" | "end" | "center" | "stretch" | "baseline";
    /**
     * 多行时的交叉轴对齐方式
     * - css属性：align-content
     * - 取值范围：
     * - - stretch（默认值） 交叉轴拉伸对齐（如果项目未设置高度或设为 auto，将占满整个交叉轴）
     * - - start 交叉轴起点对齐
     * - - end 交叉轴终点对齐
     * - - center 交叉轴居中对齐
     * - - space-between 交叉轴两端对齐，行之间间隔平均分布
     * - - space-around 交叉轴每行两侧间隔平均分布
     * - - space-evenly 交叉轴每行之间间隔平均分布
     */
    alignContent?: "start" | "end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly";

    /**
     * 启用子项修复
     * - 在`justify-content`启用`space-`相关属性时，子项之间会有间隔，当子项数量较少时，可能出现空间过大的问题，特别时多行的最后一样时
     * - 启动后，会基于子项数量补全最后一行缺失的子项数量，来修复空间过大的问题
     * - 推荐仅在所有子项主轴方向尺寸一样时，否则修复可能不准确
     */
    repairItem?: boolean;
    /**
     * flex容器的子项数量
     * - 配合 `repairSpace` 构建修复空间的子项数量
     * - 当 `repairSpace` 启用时，自动监听子项数量变化来动态调整修复空间的子项数量；不启用时忽略
     */
    itemCount?: number;
    /**
     * flex容器的子项标签名
     * - 配合 `repairSpace` 构建修复空间的子项元素标签名
     * - 默认值为`div`，即子项元素为`<div>`标签
     * - 可配置为其他标签名，如`span`，则子项元素为`<span>`标签
     */
    itemTag?: string;
    /**
     * flex容器的子项类样式名
     * - 配合 `repairSpace` 构建修复空间的子项元素类样式名
     * - 推荐设置为一个固定值的类样式名，如`flex-item`，来方便用户通过该类样式名来设置子项元素的样式
     * - 构建的子项，会自动追加一个 "repair-item”的类样式名，来方便用户通过该类样式名来设置修复空间子项元素的样式
     */
    itemClass?: string;
}