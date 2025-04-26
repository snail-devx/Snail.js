import "./styles/c1.less"
import "./styles/c2.css"
// @ts-ignore   引入componentRoot下的样式文件，并获取样式文件的url
import styleUrl from "./styles/c2.css"
console.log(styleUrl);
// @ts-ignore   引入网络路径
import netStyle from "/app/styles.less?ADDLINK";
console.log(netStyle);
// @ts-ignore   引入srcRoot下，componentRoot外的src样式
import outStyle1 from "../outer/styles/1.less";
console.log(outStyle1);
// @ts-ignore
import outStyle2 from "../outer/styles/2.css";
console.log(outStyle2);
//  引入空less
import "./styles/empty.less";