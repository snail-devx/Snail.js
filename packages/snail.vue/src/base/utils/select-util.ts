/**
 * 选项菜单组件 助手方法
 */

import { isArrayNotEmpty, isBoolean, isStringNotEmpty } from "snail.core";
import { SelectItem, SelectNode, SelectOptions } from "../models/select-model";
import { shallowRef } from "vue";

/**
 * 构建选项节点
 * - 处理默认值，梳理树形节点信息
 * @param items 
 * @returns 
 */
export function buildSelectNodes(items: SelectItem<any>[]): SelectNode<any>[] {
    return isArrayNotEmpty(items)
        ? items.map(item => {
            const children = item.type == "group" ? buildSelectNodes(item.children) : undefined;
            //  返回前，对item做冻结处理，并干掉children属性
            {
                item = { ...item };
                delete item.children;
                isBoolean(item.clickable) || (item.clickable = item.type != "group");
                isBoolean(item.search) || (item.search = item.type != "group");

                Object.freeze(item);
            }
            return {
                item, children,
                selected: shallowRef(false),
                disabled: shallowRef(false)
            };
        })
        : [];
}

/**
 * 刷新选择项节点
 * @param nodes 
 * @param values 
 */
export function refreshSelectNodes(nodes: SelectNode<any>[], values: SelectItem<any>[]): SelectNode<any>[] {
    //  取消 disabled属性；查看是否为选中将诶点
    values = values || [];
    if (isArrayNotEmpty(nodes) == true) {
        for (const node of nodes) {
            node.disabled.value = false;
            node.selected.value = values.length > 0 && values.includes(node.item);
            refreshSelectNodes(node.children, values);
        }
    }
    return nodes;
}

/**
 * 搜索选择项节点
 * @param nodes 
 * @param text 
 * @returns 是否有命中节点
 */
export function searchSelectNode(nodes: SelectNode<any>[], text: string): boolean {
    if (isArrayNotEmpty(nodes) == false) {
        return false;
    }
    var matched: boolean = false;
    for (const node of nodes) {
        //  子节点是否命中；若命中，则强制自身也命中
        const childMatched = searchSelectNode(node.children, text);
        if (childMatched == true) {
            node.disabled.value = false;
            matched = true;
            continue;
        }
        //  自身命中规则：无搜索文本，或者text包含搜索文本
        node.disabled.value = isStringNotEmpty(text) && node.item.text.indexOf(text) == -1;
        node.disabled.value || (matched = true);
    }
    return matched;
}