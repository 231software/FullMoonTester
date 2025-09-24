import {
    JSONFile,
    Logger,
    File,
    Directory
} from "../lib"
import {
    INFO,data_path
} from "../lib/plugin_info.js"
//文件读写测试
//因为文件读写已经改为异步，所以此处包上自执行异步函数
(async ()=>{
Logger.info("测试新建路径")
await File.initDir(data_path)
Logger.info("清理上次测试缓存")
for(let fileName of ["test","test1","test1.txt","test2.txt","test3.txt"]){
    if((await File.ls(data_path)).includes(fileName))await File.permanentlyDelete(data_path+"/"+fileName)
}
await File.initDir(data_path+"/test1")
const mainConf=await JSONFile.create(data_path+"/config.json")
mainConf.init("tested_apis",{
    "mode":"blacklist",
    "list":[
    ]
})
const testedAPIs=mainConf.get("testedAPIs")

Logger.info("正在测试文件读写")
if((await File.ls(data_path)).includes("config.json"))Logger.info("File.ls测试成功")
else Logger.error("File.ls无法正常工作！")

//test1
Logger.info("测试修改文件夹名")
await File.rename(data_path+"/test1",data_path+"/test")
//test
if((await File.ls(data_path)).includes("test"))Logger.info("修改文件夹名成功")
else("File.rename无法正常工作！")
Logger.info("测试重命名文件")
//test1,test1.txt
await File.initFile(data_path+"/test.txt")
await File.rename(data_path+"/test.txt",data_path+"/test1.txt")
if((await File.ls(data_path)).includes("test1.txt"))Logger.info("修改文件名成功")
else Logger.error("File.rename无法正常工作！")
Logger.info("测试移动文件")
//test(test1.txt)
await File.rename(data_path+"/test1.txt",data_path+"/test/test1.txt")
if(!(await File.ls(data_path)).includes("test1.txt")&&(await File.ls(data_path + "/test")).includes("test1.txt"))Logger.info("移动文件成功")
else Logger.error("File.rename无法正常工作！")
Logger.info("测试移动文件时同名文件跳过")
//test(test1.txt(b)),test1.txt(a)
await File.initFile(data_path+"/test1.txt")
await File.forceWrite(data_path+"/test1.txt","a")
await File.forceWrite(data_path+"/test/test1.txt","b")
await File.rename(data_path+"/test1.txt",data_path+"/test/test1.txt",{skipSameName:true})
if((await File.ls(data_path)).includes("test1.txt")&&await File.read(data_path + "/test1.txt")=="a"&&await File.read(data_path + "/test/test1.txt")=="b")Logger.info("跳过同名文件移动测试成功")
else Logger.info("移动文件时同名文件跳过功能无法正常工作！")
Logger.info("测试移动文件时同名文件替换")
//test(test1.txt(a))
await File.forceWrite(data_path+"/test1.txt","a")
await File.forceWrite(data_path+"/test/test1.txt","b")
await File.rename(data_path+"/test1.txt",data_path+"/test/test1.txt",{replaceFiles:true})
if(!(await File.ls(data_path)).includes("test1.txt")&&await File.read(data_path + "/test/test1.txt")=="a")Logger.info("覆盖同名文件移动测试成功")
else Logger.info("移动文件时同名文件覆盖功能无法正常工作！")
//删除测试文件
Logger.info("测试删除文件")
await File.permanentlyDelete(data_path+"/test/test1.txt")
if((await File.ls(data_path + "/test")).includes("test1.txt"))Logger.error("File.permanently_delete无法正常工作！")
else Logger.info("删除文件成功")
Logger.info("测试复制文件")
await File.initFile(data_path+"/test1.txt")
await File.forceWrite(data_path+"/test1.txt","a")
await File.copy(data_path+"/test1.txt",data_path+"/test/test1.txt")
if((await File.ls(data_path + "/test")).includes("test1.txt")&&await File.read(data_path + "/test/test1.txt")=="a")Logger.info("复制文件成功")
else Logger.error("File.copy无法正常工作！")
Logger.info("测试复制文件时同名文件跳过")
//test(test1.txt(b)),test1.txt(a)
await File.forceWrite(data_path+"/test1.txt","a")
await File.forceWrite(data_path+"/test/test1.txt","b")
await File.copy(data_path+"/test1.txt",data_path+"/test/test1.txt",{skipSameName:true})
if((await File.ls(data_path)).includes("test1.txt")&&await File.read(data_path + "/test/test1.txt")=="b")Logger.info("跳过同名文件复制测试成功")
else Logger.info("复制文件时同名文件跳过功能无法正常工作！")
Logger.info("测试复制文件时同名文件替换")
//test(test1.txt(a)),test1.txt(a)
await File.copy(data_path+"/test1.txt",data_path+"/test/test1.txt",{replaceFiles:true})
if((await File.ls(data_path)).includes("test1.txt")&&await File.read(data_path + "/test/test1.txt")=="a")Logger.info("跳过同名文件复制测试成功")
else Logger.info("复制文件时同名文件跳过功能无法正常工作！")
//删除测试用的test1.txt文件
await File.permanentlyDelete(data_path+"/test1.txt");
//边删除测试用的test文件夹，边进行测试
Logger.info("测试删除文件夹")
await File.permanentlyDelete(data_path+"/test");
if(!(await File.ls(data_path)).includes("test"))Logger.info("删除文件夹测试成功")
else Logger.info("删除文件夹功能无法正常工作！")

})()
