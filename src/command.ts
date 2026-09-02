import { FMPCommandEnumOptions } from "../lib/Game/Command.js";
import { Command, CommandEnum, CommandParam, CommandParamDataType, CommandParamType, Logger,
    CommandEvent, Player,
    CommandEnumOptions
 } from "../lib/index.js";
import { PLATFORM } from "../lib/plugin_info.js";
Logger.info("是的孩子们是我在注册命令")
CommandEvent.on(e=>{
    //只会拦截intercept参数
    const commandPatters=e.command.split(" ")
    if(commandPatters[0]=="test"){
        if(commandPatters[1]?.startsWith("intercept")){
            e.executor.sendSuccess("将拦截这个命令")
            return false;
        }
    }
})
const testCommand=new Command("test",
    [
        new CommandParam(CommandParamType.Mandatory,"intercept",CommandParamDataType.Enum,new CommandEnum("intercept",["intercept"]),FMPCommandEnumOptions.Unfold),
        new CommandParam(CommandParamType.Mandatory,"msg",CommandParamDataType.Enum,new CommandEnum("msg",["msg"]),CommandEnumOptions.Unfold),
        new CommandParam(CommandParamType.Mandatory,"message",CommandParamDataType.Message)
    ],
    [
        [],
        ["intercept"],
        ["msg","message"]
    ],
    result=>{
        //from转换链用法示例：把执行者转换为玩家，控制台执行者会得到undefined
        //nodejs与llse均已提供from转换链：玩家执行者转出FMPPlayer，控制台执行者得到undefined
        const player=(Player as any).from?.(result.executor)
        result.executor.sendSuccess("执行者转玩家结果："+(player?player.name:"undefined"))
        if(result.params.get("intercept")?.value=="intercept"){
            result.executor.sendError("命令拦截失败！")
        }
        else if(result.params.get("msg")?.value=="msg"){
            //Message类型的参数会吞掉从它开始的所有后续参数，值始终为字符串
            //例如执行 test msg 114514 1919810，此处收到的将是"114514 1919810"
            const message=result.params.get("message")?.value
            result.executor.sendSuccess("Message参数接收到的内容："+JSON.stringify(message))
            if(typeof message=="string")result.executor.sendSuccess("Message参数类型检查通过，确为字符串")
            else result.executor.sendError("Message参数类型检查失败：不是字符串！")
        }
        else{
            result.executor.sendSuccess("空参命令执行成功")
        }
    }
)
//Message会吞掉其后的所有参数，所以必须作为重载的最后一个参数。Message不在末位的命令注册必须失败
//nodejs模拟命令系统在注册时校验这一点，llse由原生命令系统自行处理Message，故只在nodejs平台测试
if((PLATFORM as string)=="nodejs"){
    try{
        new Command("testInvalidMessage",
            [
                new CommandParam(CommandParamType.Mandatory,"msg",CommandParamDataType.Message),
                new CommandParam(CommandParamType.Mandatory,"after",CommandParamDataType.String)
            ],
            [["msg","after"]],
            result=>{}
        )
        Logger.error("Message位置校验测试失败：Message不在末位的命令竟然注册成功了！")
    }catch(e:any){
        Logger.info("Message位置校验测试通过，非法命令已被拒绝注册："+e.message)
    }
}