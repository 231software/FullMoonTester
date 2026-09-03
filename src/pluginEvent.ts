import { getPluginFunc, Logger, PluginEvent, PluginEventHandler, regPluginFunc } from "../lib/index.js";
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

//注册一个事件
const testEvent=new PluginEventHandler("test");

//自己监听自己，用于测试
PluginEvent.on((e:PluginEvent)=>{
    Logger.info("插件自行提供的事件被成功触发！");
},"test",INFO.name)

//触发这个事件，如果注册成功的话此时马上就能监听到
testEvent.trigger(new Map())