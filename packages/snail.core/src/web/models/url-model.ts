/**
 * URL管理器
 * - 目前仅提供静态方法
 */
export interface IUrlManager {
    /**
     * 是否是站点url；如:http://www.baidu.com/xxxxxx
     * @param url url地址
     */
    isSite(url: string): boolean;
    /**
     * 是否是绝对路径url地址；以“/”开头
     * @param url url地址
     * @returns 
     */
    isAbsolute(url: string): boolean;
    /**
     * 格式化url
     * - “\”换成“/” 
     * - 连续“/”换成"/""
     * - 去掉末尾的“/”
     * @param url 要格式化的url
     * @returns 格式化好的url地址；无效url（空、非string）返回undefined
     */
    format(url: string): string | undefined;
    /**
     * 转换url
     * @param url 
     * @return 转换结果值，若url无效，则返回undefined
     */
    parse(url: string): UrlParseResult | undefined;

    /**
     * 获取url源：返回 协议://域名：端口
     * @param server 要格式化的服务器地址
     * @returns 格式化好的服务器地址：无效则返回undefined
     */
    getOrigin(server: string): string | undefined;
}


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