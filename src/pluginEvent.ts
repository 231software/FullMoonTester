import { getPluginFunc, Logger, regPluginFunc } from "../lib/index.js";
import { INFO } from "../lib/plugin_info.js";

const PLUGIN_NAME = INFO.name

// 注册一个计算函数
Logger.info("注册结果："+regPluginFunc( "getPlayerBalance", (playerName: string) => {
    Logger.info(`[${PLUGIN_NAME}] Received request for: ${playerName}`);
    // 模拟一点耗时
    const balance = Math.floor(Math.random() * 10000);
    return { player: playerName, balance: balance };
}))

// 注册一个加法函数
Logger.info("注册结果："+regPluginFunc( "addNumbers", (a: number, b: number) => {
    return a + b;
}));

//理论上可以调用自己的函数，因此它将测试自己
const addNumbers=getPluginFunc(INFO.name,"addNumbers")
if(addNumbers)Logger.info("加法函数执行结果："+addNumbers(23,32))
else Logger.error("函数获取失败！")