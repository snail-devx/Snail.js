import { assert, describe, expect, test } from 'vitest'
import { script } from "../../../packages/snail.core/src/web/script"
import { http } from '../../../packages/snail.core/src/web/http';
import { HttpRequest } from '../../../packages/snail.core/src/web/models/http';

//  HTTP全局拦截：支持的几种加载模式，返回代码
{
    http.intercept({
        match: /scripts\/amd\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
        `);
        },
    });
    http.intercept({
        match: /scripts\/cmd\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
        `);
        },
    });
    http.intercept({
        match: /scripts\/iife\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
        `);
        },
    });
    http.intercept({
        match: /scripts\/umd\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
        `);
        },
    });
}

//  测试全局
test("global", async () => {
    var data = await script.load("scripts/amd.js")

});