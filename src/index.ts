import {
    Logger,
    InitEvent,
    JSONFile
} from "../lib/index.js";
require("./file.js")
require("./tools.js")
import {start as netStart} from "./net.js"
netStart();
InitEvent.on((e)=>{
    Logger.info("插件初始化事件正常触发");
    return true;
})