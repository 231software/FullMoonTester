import { Logger, PlayerDropItemEvent } from "../lib/index.js";

PlayerDropItemEvent.on((e:PlayerDropItemEvent)=>{
    Logger.info("监听到玩家"+e.player.name+"丢出物品"+e.item.name)
})