/**
 * 样式管理模块
 *  1、基于配置构建css样式数据
 *  2、【后续支持】构建style标签，并生成css样式插入到页面
 */
import { AllStyle, IStyleManager } from "../models/style-model";
import { buildAlign, buildBorder, buildMargin, buildPadding, buildSize, buildTransition } from "../utils/style-util";

// 把自己的类型共享出去
export * from "../models/style-model";

/**
 * 使用【样式管理器】
 * @returns 全新的【样式管理器】
 */
function useStyle(): IStyleManager {

    //#region *****************************************   CSS样式构建  ****************************************
    /**
     * 构建样式
     * @param options 样式配置
     * @param isFlex 是否是flex布局
     * @returns 计算出来的组件样式信息
     */
    function build(options: AllStyle | undefined, isFlex?: boolean): Partial<CSSStyleDeclaration> {
        const style: CSSStyleDeclaration = Object.create(null);
        if (options) {
            //  对齐方式
            buildAlign(style, options, isFlex);
            //  盒子模型
            buildSize(style, options.width, "width", isFlex);
            buildSize(style, options.height, "height", isFlex);
            buildMargin(style, options);
            buildBorder(style, options);
            buildPadding(style, options);
            //  动画
            buildTransition(style, options);
        }
        return style;
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    return Object.freeze({ build });
}
/**
 * 全局的【样式管理器】
 */
export const style: IStyleManager = useStyle();