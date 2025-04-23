import { StyleTransformResult } from "snail.rollup-style";

/**
 * Vue中style编译结果
 */
export type VueStyleTransformResult = StyleTransformResult & {
    /**
     * 是否是scoped作用域样式
     */
    scoped: boolean,
}