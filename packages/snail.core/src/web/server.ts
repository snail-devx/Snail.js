import { mustString, hasOwnProperty, isObject, isStringNotEmpty } from "../base/data";
import { throwError, throwIfNullOrUndefined } from "../base/error";
import { IServerManager, ServerOptions } from "./models/server";

/** 把自己的类型共享出去 */
export * from "./models/server"

/**
 * 服务器模块：支持服务器器地址管理
 * - 支持全局服务器配置管理 addServer、
 * - 支持新作用域 newScope ，和全局配置隔离
 */
export namespace server {
    /** 默认的服务器类型；后续支持configServer方法中做配置*/
    var DEFAULT_ServerType: keyof (ServerOptions) = "api";

    /**
     * 创建服务器管理器作用域；执行后返回一个全新的管理器对象
     * - 事件作用域为当前上下文特有；不和全局等共享
     * @returns 服务器管理器对象
     */
    export function newScope(): IServerManager {
        /** 注册的服务器：key为服务器编码code；value为对应的服务器配置选项 */
        const servers: { [key in string]: ServerOptions } = Object.create(null);

        /**
         * 注册服务器
         * @param code 服务器编码；若已存在，则覆盖
         * @param server 服务器配置
         * @returns 管理器自身，方便链式调用
         */
        function register(code: string, server: ServerOptions): IServerManager {
            mustString(code, "code");
            isObject(server) || throwError("server must be a json");
            servers[code] = Object.freeze({ ...server });
            return manager;
        }
        /**
         * 是否存在指定服务器
         * @param code 服务器编码
         * @returns 服务器配置选项；不存在返回undefined
         */
        function has(code: string): boolean {
            return hasOwnProperty(servers, code);
        }
        /**
         * 获取指定服务器
         * @param code 服务器编码
         * @returns 服务器配置选项；不存在返回undefined
         */
        function get(code: string): ServerOptions | undefined {
            return servers[code];
        }
        /**
         * 获取指定类型的服务器地址
         * @param code 服务器编码；若code对应服务器不存在报错
         * @param type 类型值，不传入则走默认的"DEFAULT_ServerType"；不存在报错
         * @returns 注册的服务器地址
         */
        function getUrl(code: string, type?: keyof (ServerOptions)): string {
            const server = servers[code];
            throwIfNullOrUndefined(server, `the server[${code}] is not registered`);
            type = type || DEFAULT_ServerType;
            const url: string = server[type];
            isStringNotEmpty(url) || throwError(`the server[${code}] has not this type[${type}] server address`);
            return url;
        }
        /**
         * 移除指定服务器
         * @param code 服务器编码
         * @returns 管理器自身，方便链式调用
         */
        function remove(code: string): IServerManager {
            delete servers[code];
            return manager;
        }

        /** 管理器对象 */
        const manager: IServerManager = Object.freeze({ register, has, get, getUrl, remove });
        return manager;
    }

    /** 全局服务器配置管理器 */
    const global: IServerManager = newScope();
    /**
     * 注册服务器
     * @param code 服务器编码；若已存在，则覆盖
     * @param server 服务器配置
     * @returns 管理器自身，方便链式调用
     */
    export function register(code: string, server: ServerOptions): IServerManager {
        return global.register(code, server);
    }
    /**
     * 是否存在指定服务器
     * @param code 服务器编码
     * @returns 服务器配置选项；不存在返回undefined
     */
    export function has(code: string): boolean {
        return global.has(code);
    }
    /**
     * 获取指定服务器
     * @param code 服务器编码
     * @returns 服务器配置选项；不存在返回undefined
     */
    export function get(code: string): ServerOptions | undefined {
        return global.get(code);
    }
    /**
     * 获取指定类型的服务器地址
     * @param code 服务器编码；若code对应服务器不存在报错
     * @param type 类型值，不传入则走默认的"DEFAULT_ServerType"；不存在报错
     * @returns 注册的服务器地址
     */
    export function getUrl(code: string, type?: keyof (ServerOptions)): string {
        return global.getUrl(code, type);
    }
    /**
     * 移除指定服务器
     * @param code 服务器编码
     * @returns 管理器自身，方便链式调用
     */
    export function remove(code: string): IServerManager {
        return global.remove(code);
    }
}