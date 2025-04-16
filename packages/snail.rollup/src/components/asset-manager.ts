import { isFunction } from "snail.core";
import { AssetOptions } from "../builder";

/**
 * 资产文件管理器
 */
export class AssetManager<T extends AssetOptions> {
    /** 要管理的资产文件数组；将src和dist小写后做key缓存 */
    private readonly files: { sKey: string, dKey: string, file: T }[];

    /**
     * 构造方法；内部会自动把writed强制置为undefined
     * @param assets 资产文件信息
     */
    constructor(assets: T[]) {
        this.files = assets?.map(file => {
            file.writed = undefined;
            return { sKey: file.src.toLowerCase(), dKey: file.dist.toLowerCase(), file };
        }) || [];
    }

    /**
     * 添加资产文件；若添加成功，会将writed强制设置为undefined
     * @param file 
     * @returns 添加成功则返回true；flase（已经存在此资产文件了）
     */
    public add(file: T): boolean {
        //  排查src和dist是否存在，存在则不加了
        const sKey = file.src.toLowerCase(), dKey = file.src.toLowerCase();
        const canAdd: boolean = this.files.find(file => file.sKey == sKey && file.dKey == dKey) == undefined;
        canAdd && (file.writed = undefined, this.files.push({ sKey, dKey, file }));
        return canAdd;
    }

    /**
     * 查找指定资产src对应的资产数据
     * @param src src绝对路径
     * @returns 存在返回数组；不存在返回空数组
     */
    public find(src: string): T[] {
        const sKey = src.toLowerCase();
        return this.files.filter(file => file.sKey == sKey).map(file => file.file);
    }

    /**
     * 遍历所有的资产文件
     * @param func 
     */
    public forEach(func: (file: T) => void): void {
        isFunction(func) && this.files.forEach(file => func(file.file));
    }
}