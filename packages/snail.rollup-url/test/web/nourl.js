
//  @ts-ignore 这种是无效的，会被解析成npm包的路径，不会解析url路径
import url1 from "xxx.js";
export const x1 = url1;

//  @ts-ignore 测试网络路径
import url2 from "/app/xxx.js";
export const x2 = url2;

//  @ts-ignore  测试+网址的网络路径
import url3 from "http://www.baidu.com/app/xxx.js";
export const x3 = url3;

//  @ts-ignore src 路径
import { x5 } from "./src_existsurl.js";
export const x51 = url5;
