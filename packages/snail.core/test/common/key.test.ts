import { beforeEach, afterEach, describe, expect, it, vi, test, assert } from 'vitest';
import { hasOwnProperty } from '../../src/base';
import { newId } from '../../src/common';

describe("newId", () => {
    test("", () => {
        const id = newId();
        assert.isTrue(id.length > 0);
    });
    const x = Object.create(null);
    const tmpFunc = () => {
        const str = newId();
        hasOwnProperty(x, str) && assert.fail(`存在重复id值:${str}`);
        x[str] = 1;
    }
    test("1", tmpFunc);
    test("2", tmpFunc);
    test("3", tmpFunc);
    test("4", tmpFunc);
    test("5", tmpFunc);
    test("loop", () => {
        for (let index = 0; index < 10000; index++) {
            tmpFunc();
        }
    })
})