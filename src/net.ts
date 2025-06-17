import { Logger,HTTPServer, HTTPRequest, HTTPMethod } from "../lib";
import { runtimeID } from "./tools";
//如果在开服的时候立即执行http测试，可能会因为前置未初始化完毕导致出错
export function start(){
    Logger.info("正在测试http功能")
    const testPort=Math.floor(Math.random()*65535)
    Logger.info("创建服务器")
    const server=new HTTPServer(testPort,(request)=>{
        // Logger.info("收到客户端请求")
        // Logger.info("方法："+request.method)
        // Logger.info("URL："+request.url)
        // Logger.info("请求头："+JSON.stringify(request.headers,undefined,4))
        // Logger.info("状态码："+request.statusCode)
        return new Promise<any>(resolve=>{
            request.getBody().then(body=>{
                resolve({
                    statusCode:200,
                    head:{ 'Content-Type': 'text/plain' },
                    body:body.length==0?"客户端发送的请求体为空。":body,
                    charset:"utf-8"
                });
            })
        })

    })
    Logger.info("服务器已创建，正在开启。");
    server.start().then(()=>{for(let i=1;i<5;i++)Logger.info("http测试服务器已启动，端口"+testPort)});
    //测试方法：客户端向服务端隔100ms发送三条数据，然后服务端会将它们返回，整个过程异步，程序会继续测试剩下的内容
    (async ()=>{
        //在grakkit上立即执行会导致服务器线程卡死，原因不明，只有加一定的延时能解决
        await new Promise<void>(resolve=>setTimeout(resolve,1));
        Logger.info("即将测试sendJSONSimpleGET")
        for(let i=1;i<=3;i++){
            Logger.info("正在向测试服务器发送测试请求：第"+i+"条");
            await new Promise<void>(resolve=>HTTPRequest.sendSimpleGET("localhost",data=>{
                if(data.trim()==="客户端发送的请求体为空。")Logger.info("请求已得到回复，内容正常。");
                else {
                    Logger.error("请求得到的回复不正常："+data)
                    Logger.error("实际长度："+data.length)
                }
                resolve()
                //100ms后开始下一轮请求
                setTimeout(resolve,100)
            },"",testPort,{},e=>Logger.error("http请求失败，详情："+e.message)))
        }
        Logger.info("即将测试sendJSONSimplePOST")
        //测试简单post
        await new Promise<void>(resolve=>HTTPRequest.sendJSONSimplePOST("localhost","{}",data=>{
            if(data.trim()==="{}")Logger.info("请求已得到回复，内容正常。")
            else Logger.error("请求得到的回复不正常："+data)
            resolve()
        },"",testPort,{},e=>Logger.error("http请求失败，详情："+e.message)))
        Logger.info("http测试全部完成。");
    })().then(()=>{
        Logger.info("现在关闭http服务器。");
        server.stop().then(()=>Logger.info("http服务器已成功关闭"))
    })    
    //10秒后关闭服务器，防止前面代码出错导致原定的关闭计划被搁置
    setTimeout(()=>{
        Logger.info("正在关闭http服务器以避免端口冲突")
        server.stop().then(()=>Logger.info("http服务器已成功关闭"));
    },5000)
}


// HTTPRequest.sendSimpleGET("192.168.101.96",data=>{
//     Logger.info(data);
// },"/",17360)