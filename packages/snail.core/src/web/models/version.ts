/**
 * 接口：版本管理器
 */
export interface IVersionManager {
    /**
     * 获取版本值
     * @returns 版本值，未设置则返回全局的
     */
    getVersion(): string;
    /**
     * 添加文本版本；满足特定文件走固定版本规则
     * @param file 文件路径：绝对路径，不区分大小写；忽略url的query和hash
     * @param url 带有版本的url地址
     * @returns 管理器自身
     */
    addFile(file: string, url: string): IVersionManager
    /**
     * 格式化url，自动加上版本查询参数
     * - 已配置文件版本（忽略file的query、hash），则直接返回对应的fileUrl
     * - 未配置文本版本，则将配置的version信息追加到url中
     * @param url url地址
     * @returns 格式化后带有版本的url地址
     */
    formart(url: string): string;
}

/**
 * 版本配置选项
 */
export type VersionOptions = {
    /**
     * 版本的查询参数名，默认_sv
     */
    query: string;
    /**
     * 版本的默认值，默认new Date().getTime()
     */
    version: string;
}