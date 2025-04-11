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