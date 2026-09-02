import {
    Logger,
    HTTPServer,
    HTTPRequest,
    HTTPMethod,
    HTTPContentType,
    TCPServer,
    TCPConnect
} from "../lib/index.js";
import { runtimeID } from "./tools.js";
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
    server.start().then(()=>Logger.info("http测试服务器已启动，端口"+testPort));
    //5秒后关闭服务器，防止前面代码出错导致原定的关闭计划被搁置
    const forceStop=setTimeout(()=>{
        Logger.info("正在关闭http服务器以避免端口冲突")
        server.stop().then(()=>Logger.info("http服务器已成功关闭"));
    },10000);
    //测试方法：客户端向服务端隔100ms发送三条数据，然后服务端会将它们返回，整个过程异步，程序会继续测试剩下的内容
    (async ()=>{
        //在grakkit上立即执行会导致服务器线程卡死，原因不明，只有加一定的延时能解决
        await new Promise<void>(resolve=>setTimeout(resolve,1));
        Logger.info("即将测试sendJSONSimpleGET")
        for(let i=1;i<=3;i++){
            Logger.info("正在向测试服务器发送测试请求：第"+i+"条");
            try{
                const data=await (await HTTPRequest.sendSimpleGET("localhost:"+testPort)).getBody()
                if(data.trim()==="客户端发送的请求体为空。")Logger.info("请求已得到回复，内容正常。");
                else {
                    Logger.error("请求得到的回复不正常："+data)
                    Logger.error("实际长度："+data.length)
                }                
            }
            catch(e:any){
                Logger.error("http请求失败，详情："+e.message)
            }
            //100ms后开始下一轮请求
            await new Promise<void>(resolve=>setTimeout(resolve,100))
        }
        Logger.info("即将测试sendJSONSimplePOST")
        //测试简单post
        const data=await (await HTTPRequest.sendSimplePOST("localhost:"+testPort,HTTPContentType.JSON,"{}")).getBody()
        try{
            if(data.trim()==="{}")Logger.info("请求已得到回复，内容正常。")
            else Logger.error("请求得到的回复不正常："+data)
        }
        catch(e:any){
            Logger.error("http请求失败，详情："+e.message)
        }
        Logger.info("http测试全部完成。");
        Logger.info("现在关闭http服务器。");
        await server.stop();
        Logger.info("http服务器已成功关闭")
        //停止强制关闭服务器的计时
        clearTimeout(forceStop)
        //http测试结束后，依照同样的流程继续测试tcp功能
        await startTCPTest();
    })()
}


// HTTPRequest.sendSimpleGET("192.168.101.96",data=>{
//     Logger.info(data);
// },"/",17360)

/**
 * 依照上方 http 测试的流程测试 tcp 功能：
 * 开启一个把收到的数据原样返回（回显）的 tcp 服务端，
 * 客户端建立连接后连续发送多条消息并核对每次回显，
 * 最后优雅关闭连接并关闭服务端。
 * 测试中所有交互都由 tcp 的事件回调驱动，与 http 测试一样全程异步。
 */
async function startTCPTest():Promise<void>{
    Logger.info("正在测试tcp功能")
    const testPort=Math.floor(Math.random()*65535)
    Logger.info("创建tcp服务器")
    const server=new TCPServer(testPort,socket=>{
        //把收到的数据原样返回给客户端
        socket.onData=data=>{
            socket.write(data)
        }
        socket.onError=e=>{
            Logger.error("tcp连接出错："+e.message)
        }
        socket.onClose=()=>{
            Logger.info("tcp连接已关闭")
        }
    })
    Logger.info("tcp服务器已创建，正在开启。");
    try{
        await server.start()
    }
    catch(e:any){
        Logger.error("tcp服务器启动失败，详情："+e.message)
        return
    }
    Logger.info("tcp测试服务器已启动，端口"+testPort)
    //与http测试相同的保护：如果前面代码出错导致关闭计划被搁置，5秒后强制关闭服务器避免端口冲突
    const forceStop=setTimeout(()=>{
        Logger.info("正在关闭tcp服务器以避免端口冲突")
        server.stop().then(()=>Logger.info("tcp服务器已成功关闭"))
    },5000);
    let testSucceeded=true
    try{
        await new Promise<void>(resolve=>{
            const socket=TCPConnect(testPort,"localhost")
            const testMessages=[
                "tcp测试消息第1条，用于测试数据回显。",
                "tcp测试消息第2条，用于测试数据回显。",
                "tcp测试消息第3条，用于测试数据回显。"
            ]
            //已发送的消息条数，回显到达时用它定位本次发送的内容进行核对
            let sentCount=0
            const sendNext=()=>{
                if(sentCount>=testMessages.length)return;
                const message=testMessages[sentCount]
                sentCount++
                Logger.info("正在向测试服务器发送tcp测试消息：第"+sentCount+"条")
                socket.write(message)
            }
            socket.onError=e=>{
                Logger.error("tcp客户端连接出错："+e.message)
                testSucceeded=false
                socket.destroy()
            }
            socket.onConnect=()=>{
                Logger.info("tcp客户端已成功连接测试服务器")
                sendNext()
            }
            socket.onData=data=>{
                const message=testMessages[sentCount-1]
                if(data.toString()===message){
                    Logger.info("第"+sentCount+"条消息已得到回显，内容正常。");
                }
                else{
                    Logger.error("第"+sentCount+"条消息回显不正常："+data.toString())
                    testSucceeded=false
                }
                if(sentCount<testMessages.length){
                    //与http测试相同，间隔100ms发送下一条消息
                    setTimeout(sendNext,100)
                }
                else{
                    //所有消息都核对完毕，客户端不再发送数据并等待连接关闭
                    Logger.info("tcp收发的数据均已核对完毕，准备关闭连接。")
                    socket.end()
                }
            }
            socket.onClose=()=>{
                resolve()
            }
        })
    }
    catch(e:any){
        Logger.error("tcp测试失败，详情："+e.message)
        testSucceeded=false
    }
    finally{
        Logger.info("现在关闭tcp服务器。");
        await server.stop();
        Logger.info("tcp服务器已成功关闭")
        //停止强制关闭服务器的计时
        clearTimeout(forceStop)
    }
    if(testSucceeded)Logger.info("tcp功能测试全部通过。")
    else Logger.error("tcp功能测试存在失败项。")
}