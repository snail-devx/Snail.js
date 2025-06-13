/**
 * url转换结果结果
 */
export type UrlParseResult = {
    /**
     * 文件地址
     */
    file: string,
    /**
     * 查询字符串；不带"?"
     */
    query?: string,
    /**
     * 查询参数字典；key为查询参数，value为参数值
     */
    queryMap: URLSearchParams,
    /**
     * 锚点字符串：不带“#”
     */
    hash?: string
}