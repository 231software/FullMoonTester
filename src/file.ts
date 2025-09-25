import {
    JSONFile,
    Logger,
    File,
    Directory,
    YMLFile
} from "../lib"
import { FMPFile } from "../lib/File.js"
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
Logger.info("文件读写测试全部完成，接下来测试数据存储读写能力。")
Logger.info("现在测试JSON格式")
//由于刚才已经连带test一起删除，所以此处考验递归文件夹创建的能力
const JSONTestFile=await JSONFile.create(data_path+"/test/testConfig.json")
await JSONTestFile.init("num",0)
await JSONTestFile.init("obj",{})
const JSONSurfaceTest=JSON.parse(await File.read(data_path+"/test/testConfig.json"))
if(areObjectsEqual(JSONSurfaceTest,{num:0,obj:{}}))Logger.info("JSON表层init测试成功")
else Logger.error("JSON表层init工作不正常")
await JSONTestFile.set("num",1)
if(await JSONTestFile.get("num")==1)Logger.info("JSON表层set和test测试成功")
else Logger.error("JSON表层set和test工作不正常")
Logger.info("JSON表层测试完成，即将测试深层")
const DeepJSONTestFile=await JSONFile.create(data_path+"/test/testConfig.json",["obj"])
await DeepJSONTestFile.init("num",0)
await DeepJSONTestFile.init("obj1",{})
const JSONDeepTest=JSON.parse(await File.read(data_path+"/test/testConfig.json"))
if(areObjectsEqual(JSONDeepTest,{num:1,obj:{num:0,obj1:{}}}))Logger.info("JSON深层第一层init测试成功")
else Logger.error("JSON深层第一层init工作不正常")
await DeepJSONTestFile.set("num",1)
if(await DeepJSONTestFile.get("num")==1)Logger.info("JSON深层第一层set和test测试成功")
else Logger.error("JSON深层第一层set和test工作不正常")
Logger.info("JSON表层测试完成，即将测试深层第二层")
const DeepJSONTestFile2=await JSONFile.create(data_path+"/test/testConfig.json",["obj","obj1"])
await DeepJSONTestFile2.init("num",0)
await DeepJSONTestFile2.init("obj2",{})
const JSONDeepTest2=JSON.parse(await File.read(data_path+"/test/testConfig.json"))
if(areObjectsEqual(JSONDeepTest2,{num:1,obj:{num:1,obj1:{num:0,obj2:{}}}}))Logger.info("JSON深层第二层init测试成功")
else Logger.error("JSON深层第二层init工作不正常")
await DeepJSONTestFile2.set("num",1)
if(await DeepJSONTestFile2.get("num")==1)Logger.info("JSON深层第二层set和test测试成功")
else Logger.error("JSON深层第二层set和test工作不正常")
//删除测试文件
await FMPFile.permanentlyDelete(data_path+"/test")
Logger.info("现在测试YAML格式")
//由于刚才已经连带test一起删除，所以此处考验递归文件夹创建的能力
const YMLTestFile=await YMLFile.create(data_path+"/test/testConfig.yml")
await YMLTestFile.init("num",0)
await YMLTestFile.init("obj",{})
if(areObjectsEqual(YMLTestFile.rootobj,{num:0,obj:{}}))Logger.info("YML表层init测试成功")
else Logger.error("YML表层init工作不正常")
await YMLTestFile.set("num",1)
if(await YMLTestFile.get("num")==1)Logger.info("YML表层set和test测试成功")
else Logger.error("YML表层set和test工作不正常")
Logger.info("YML表层测试完成，即将测试深层")
const DeepYMLTestFile=await YMLFile.create(data_path+"/test/testConfig.yml",["obj"])
await DeepYMLTestFile.init("num",0)
await DeepYMLTestFile.init("obj1",{})
if(areObjectsEqual(DeepYMLTestFile.rootobj,{num:1,obj:{num:0,obj1:{}}}))Logger.info("YML深层第一层init测试成功")
else Logger.error("YML深层第一层init工作不正常")
await DeepYMLTestFile.set("num",1)
if(await DeepYMLTestFile.get("num")==1)Logger.info("YML深层第一层set和test测试成功")
else Logger.error("YML深层第一层set和test工作不正常")
Logger.info("YML表层测试完成，即将测试深层第二层")
const DeepYMLTestFile2=await YMLFile.create(data_path+"/test/testConfig.yml",["obj","obj1"])
await DeepYMLTestFile2.init("num",0)
await DeepYMLTestFile2.init("obj2",{})
if(areObjectsEqual(DeepYMLTestFile2.rootobj,{num:1,obj:{num:1,obj1:{num:0,obj2:{}}}}))Logger.info("YML深层第二层init测试成功")
else Logger.error("YML深层第二层init工作不正常")
await DeepYMLTestFile2.set("num",1)
if(await DeepYMLTestFile2.get("num")==1)Logger.info("YML深层第二层set和test测试成功")
else Logger.error("YML深层第二层set和test工作不正常")
//删除测试文件
await FMPFile.permanentlyDelete(data_path+"/test")
})()

function areObjectsEqual(obj1:any, obj2:any) {
    // 1. 检查类型，如果类型不同，直接返回 false
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }

    // 2. 检查引用是否相同，如果引用相同，直接返回 true
    if (obj1 === obj2) {
        return true;
    }

    // 3. 获取所有属性名
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // 4. 检查属性数量
    if (keys1.length !== keys2.length) {
        return false;
    }

    // 5. 遍历并递归比较每个属性
    for (const key of keys1) {
        // 检查 obj2 是否有相同的属性
        if (!keys2.includes(key)) {
            return false;
        }

        const val1 = obj1[key];
        const val2 = obj2[key];

        // 如果属性值是对象，则递归比较
        const areObjects = typeof val1 === 'object' && typeof val2 === 'object';
        if (areObjects && !areObjectsEqual(val1, val2) || !areObjects && val1 !== val2) {
            return false;
        }
    }

    // 6. 所有检查都通过，返回 true
    return true;
}