
//  @ts-ignore 这种是无效的，会被解析成npm包的路径，不会解析url路径
import url1 from "xxx.js?url";
export const x1 = url1;