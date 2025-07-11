/**
 * 服务器配置选项；先固化几个，后面再加
 */
export type ServerOptions = {
    /**
     * web服务器地址；用于进行html、js、css文件加载
     */
    web?: string,
    /**
     * api请求地址：用于进行api请求，完成api逻辑
     */
    api?: string,
    /**
     * socket通信地址
     */
    socket?: string,
}

/**
 * 接口：服务器地址管理器
 */
export interface IServerManager {
    /**
     * 注册全局服务器配置
     * @param code 服务器编码；若已存在，则覆盖
     * @param server 服务器配置
     * @returns 管理器自身，方便链式调用
     */
    register(code: string, server: ServerOptions): IServerManager,
    /**
     * 判断全局服务器配置是否存在
     * @param code 服务器编码
     * @returns 存在返回true，否则false
     */
    has(code: string): boolean;
    /**
     * 获取全局服务器配置
     * @param code 服务器编码
     * @returns 服务器配置选项；不存在返回undefined
     */
    get(code: string): ServerOptions | undefined;
    /**
     * 获取全局服务器配置的服务器地址
     * @param code 服务器编码；若code对应服务器不存在报错
     * @param type 类型值，不传入则走默认的"DEFAULT_ServerType"；不存在报错
     * @returns 注册的服务器地址
     */
    getUrl(code: string, type?: keyof (ServerOptions)): string;
    /**
     * 移除全局服务器配置
     * @param code 服务器编码
     * @returns 管理器自身，方便链式调用
     */
    remove(code: string): IServerManager;
}