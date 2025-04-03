import { assert, describe, expect, test } from 'vitest'
import { drilling, ensureFunction, ensureString, getType, hasAny, hasOwnProperty, isArray, isArrayNotEmpty, isBoolean, isDate, isFalsey, isFunction, isNull, isNullOrUndefined, isNumber, isNumberNotNaN, isObject, isPromise, isRegexp, isString, isStringNotEmpty, isUndefined, isWindow, newId, tidyFunction, tidyString } from "../../../packages/snail.core/src/base/data"

//  getType、isXX测试
[
    //  无效值
    { src: null, getType: "[object Null]", isNull: true, isNullOrUndefined: true, isFalsey: true },
    { src: undefined, getType: "[object Undefined]", isUndefined: true, isNullOrUndefined: true, isFalsey: true },
    //  object
    { src: {}, getType: "[object Object]", isObject: true },
    { src: new Object(), getType: "[object Object]", isObject: true },
    { src: Object.create(null), getType: "[object Object]", isObject: true },
    //  function
    { src: () => { }, getType: "[object Function]", isFunction: true },
    { src: function () { }, getType: "[object Function]", isFunction: true },
    { src: new Function(), getType: "[object Function]", isFunction: true },
    //  数组
    { src: [], getType: "[object Array]", isArray: true },
    { src: new Array(), getType: "[object Array]", isArray: true },
    { src: [1], getType: "[object Array]", isArray: true, isArrayNotEmpty: true },
    { src: [null], getType: "[object Array]", isArray: true, isArrayNotEmpty: true },
    //  布尔值
    { src: true, getType: "[object Boolean]", isBoolean: true, },
    { src: false, getType: "[object Boolean]", isBoolean: true, isFalsey: true },
    //  数值
    { src: NaN, getType: "[object Number]", isNumber: true, isFalsey: true },
    { src: 1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
    { src: 1.1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
    { src: 0, getType: "[object Number]", isNumber: true, isNumberNotNaN: true, isFalsey: true },
    { src: -1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
    { src: -1.1, getType: "[object Number]", isNumber: true, isNumberNotNaN: true },
    //  string
    { src: "", getType: "[object String]", isString: true, isFalsey: true },
    { src: "0", getType: "[object String]", isString: true, isFalsey: true, isStringNotEmpty: true },
    { src: "1", getType: "[object String]", isString: true, isStringNotEmpty: true },
    { src: "迭代", getType: "[object String]", isString: true, isStringNotEmpty: true },
    { src: 'c', getType: "[object String]", isString: true, isStringNotEmpty: true },
    { src: new String(), getType: "[object String]", isString: true },
    { src: new String(111), getType: "[object String]", isString: true, isStringNotEmpty: true },
    { src: String(null), getType: "[object String]", isString: true, isStringNotEmpty: true },
    { src: String(undefined), getType: "[object String]", isString: true, isStringNotEmpty: true },
    // Date
    { src: new Date(), getType: "[object Date]", isDate: true },
    // isRegexp
    { src: / /, getType: "[object RegExp]", isRegexp: true },
    { src: / /gi, getType: "[object RegExp]", isRegexp: true },
    { src: new RegExp(""), getType: "[object RegExp]", isRegexp: true },
    { src: new RegExp("."), getType: "[object RegExp]", isRegexp: true },
    //  Promise
    { src: new Promise(() => { }), getType: "[object Promise]", isPromise: true },
].forEach(item => {
    [
        getType,
        isNull,
        isUndefined,
        isNullOrUndefined,
        isObject,
        isFunction,
        isArray,
        isArrayNotEmpty,
        isBoolean,
        isNumber,
        isNumberNotNaN,
        isString,
        isStringNotEmpty,
        isDate,
        isRegexp,
        isPromise,
        isWindow,
        isFalsey
    ].forEach(func => {
        const funcName = func.name;
        test(funcName, () => {
            const wantValue = hasOwnProperty(item, funcName) ? item[funcName] : false;
            expect(func(item.src), `${funcName}:${JSON.stringify(item)}`).toBe(wantValue);
        });
    });
});
test("hasOwnProperty", () => {
    expect(hasOwnProperty(undefined, "key")).toBe(false);
    expect(hasOwnProperty(null, "key")).toBe(false);
    expect(hasOwnProperty({}, "key")).toBe(false);
    expect(hasOwnProperty({ key: undefined }, "key")).toBe(true);
    expect(hasOwnProperty({ key: null }, "key")).toBe(true);
    expect(hasOwnProperty({ key: 11 }, "key")).toBe(true);
    expect(hasOwnProperty({ key: 11 }, "toString")).toBe(false);
});
test("hasAny", () => {
    expect(hasAny("")).toBe(false);
    expect(hasAny([])).toBe(false);
    expect(hasAny("1")).toBe(true);
    expect(hasAny(" ")).toBe(true);
    expect(hasAny([1])).toBe(true);
});
test("ensureString", () => {
    expect(() => ensureString(undefined, "ensureString1")).toThrowError("ensureString1 must be a string and cannot be empty")
    expect(() => ensureString(null, "ensureString1")).toThrowError("ensureString1 must be a string and cannot be empty")
    expect(() => ensureString({}, "ensureString1")).toThrowError("ensureString1 must be a string and cannot be empty")
    expect(() => ensureString("", "ensureString1")).toThrowError("ensureString1 must be a string and cannot be empty")
    expect(ensureString("11", "")).toBe(true);
    expect(ensureString(" ", "")).toBe(true);
});
test("ensureFunction", () => {
    expect(() => ensureFunction(undefined, "ensureString1")).toThrowError("ensureString1 must be a function")
    expect(() => ensureFunction(null, "ensureString1")).toThrowError("ensureString1 must be a function")
    expect(() => ensureFunction({}, "ensureString1")).toThrowError("ensureString1 must be a function")
    expect(() => ensureFunction("", "ensureString1")).toThrowError("ensureString1 must be a function")
    expect(ensureFunction(() => { }, "")).toBe(true);
    expect(ensureFunction(function () { }, "")).toBe(true);
    expect(ensureFunction(new Function(), "")).toBe(true);
});
test("tidyString", () => {
    expect(tidyString(null)).toBe(null);
    expect(tidyString(undefined)).toBe(null);
    expect(tidyString(1)).toBe(null);
    expect(tidyString(NaN)).toBe(null);
    expect(tidyString({})).toBe(null);
    expect(tidyString(new Object)).toBe(null);
    expect(tidyString(function () { })).toBe(null);
    expect(tidyString("")).toBe(null);
    expect(tidyString("111")).toBe("111");
});
test("tidyFunction", () => {
    expect(tidyFunction("")).toBe(null);
    expect(tidyFunction(null)).toBe(null);
    expect(tidyFunction(undefined)).toBe(null);
    expect(tidyFunction(1)).toBe(null);
    expect(tidyFunction(function () { }));
});
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
test("drilling", () => {
    expect(drilling.call(undefined)).toBeUndefined();
    expect(drilling(1)).toBe(1);
    expect(drilling({}, ["1", "2"])).toBeUndefined();
    expect(drilling(undefined, ["1", "2"])).toBeUndefined();
    expect(drilling({ "toBen": "11" }, ["toBen"])).toBe("11");
    expect(drilling({ "toBen": undefined }, ["toBen"])).toBeUndefined();
    expect(drilling({ "toBen": { drilling: 33 } }, ["toBen", "drilling"])).toBe(33);
    expect(drilling({ "toBen": {} }, ["toBen", "drilling"])).toBe(undefined);
});