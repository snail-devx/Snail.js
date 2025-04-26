import { ModuleTransformResult } from "snail.rollup";

/**
 * Style样式转码编译结果
 */
export type StyleTransformResult = {
    /**
     * 源文件地址
     */
    src: string;
    /**
     * 目标文件地址
     */
    dist: string;

    /**
     * 编译后的css文件信息
     */
    css?: string;
    /**
     * css的sourceMap信息
     */
    map?: string;

    /**
     * 依赖样式文件路径； @import引入了哪些style文件
     */
    dependencies?: string[];
    /** 
     * 是否已经写入过了 
     */
    writed?: boolean;
}


export interface IStyleProcessor {
    /**
     * 转换编译文本样式
     * @param style 样式文本内容
     * @param from 样式内容来自哪里，用于分析内部的url文件地址、@import 等物理文件等
     * @param from 样式内容来自哪里，用于分析内部的url文件地址、@import 等物理文件等
     * @param map 已有的sourcemap；为false时不生成sourceMap值
     * @param scopeId 支持外部传入scopeId值，支持Vue的scope样式
     * @returns 
     */
    transform(style: string, from: string, to?: string, map?: any, scopeId?: string): Promise<ModuleTransformResult>;
    /**
     * 转义编译样式文件
     * @param file 样式文件地址
     * @returns 
     */
    transformFile(file: string): Promise<ModuleTransformResult>;
}