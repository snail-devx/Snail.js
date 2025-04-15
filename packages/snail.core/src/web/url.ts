import { isStringNotEmpty } from "../base/data";
import { UrlParseResult } from "./models/url";

/** 把自己的类型共享出去 */
export * from "./models/url"

/**
 * url模块：支持对URL地址做解析和格式化
 */
export namespace url {
    /**
     * 是否是站点url；如:http://www.baidu.com/xxxxxx
     * @param url url地址
     */
    export function isSite(url: string): boolean {
        /* 暂时先使用正则匹配；后续看情况要是不准，直接使用new URL判断 
        try {
            return !!new URL(url);
        }
        catch (ex) {
            return false;
        }
        */
        //  站点完整URL；带有协议头的url地址
        return isStringNotEmpty(url)
            ? /^[a-zA-z]+:\/\/[^\s]+$/.test(url)
            : false;
    }
    /**
     * 是否是绝对路径url地址；以“/”开头
     * @param url url地址
     * @returns 
     */
    export function isAbsolute(url: string): boolean {
        return isStringNotEmpty(url)
            ? url.replace(/\\/g, '/')[0] == '/'
            : false;
    }

    /**
     * 格式化url
     * - “\”换成“/” 
     * - 连续“/”换成"/""
     * - 去掉末尾的“/”
     * @param url 要格式化的url
     * @returns 格式化好的url地址；无效url（空、非string）返回undefined
     */
    export function format(url: string): string | undefined {
        if (isStringNotEmpty(url) == false) {
            return undefined;
        }
        //  兼容一下siteUrl模式
        let origin: string = undefined;
        if (isSite(url) == true) {
            const tmpUrl = new URL(url);
            origin = tmpUrl.origin;
            url = `${tmpUrl.pathname}${tmpUrl.search}${tmpUrl.hash}`;
        }
        url = url.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/+$/, '');
        return origin ? `${origin}${url}` : url;
    }
    /**
     * 转换url
     * @param url 
     * @return 转换结果值，若url无效，则返回undefined
     */
    export function parse(url: string): UrlParseResult | undefined {
        if (isStringNotEmpty(url)) {
            var hash = undefined;
            var [file, query] = url.split('?', 2);
            query
                ? [query, hash] = query.split('#', 2)
                : [file, hash] = file.split('#', 2);
            file = format(file) || file;
            return { file, query, queryMap: new URLSearchParams(query), hash }
        }
        return undefined;
    }

    /**
     * 获取url源：返回 协议://域名：端口
     * @param server 要格式化的服务器地址
     * @returns 格式化好的服务器地址：无效则返回undefined
     */
    export function getOrigin(server: string): string | undefined {
        try {
            const url = new URL(server);
            // return `${url.protocol}//${url.host}`;
            return url.origin;
        }
        catch (ex: any) {
            console.error(`getOrigin[${server}] throw an exception:${ex.message}`);
            return undefined;
        }
    }
}