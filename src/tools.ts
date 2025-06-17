import {
    Logger,
    TwoWayMap,
    Location,
    Dimension,
    RegionRectangle,
    newUUID4,
} from "../lib"
import { availableDimensions } from "./world_info"
Logger.info("-----即将测试日志输出-----")
Logger.debug("测试日志输出：debug")
Logger.info("测试日志输出：info")
Logger.warn("测试日志输出：warn")
Logger.error("测试日志输出：error")
Logger.fatal("测试日志输出：fatal")
Logger.info("-----日志输出测试完毕-----")
Logger.info("正在测试双向映射表")
const testTwoWayMap=new TwoWayMap<string,string>(new Map<string,string>())
Logger.info("测试添加数据")
testTwoWayMap.add("a","b")
testTwoWayMap.add("c","d")
Logger.info("测试访问数据")
if(testTwoWayMap.toRight("a")=="b")Logger.info("测试左值检索右值成功。")
else Logger.error("TwoWayMap.toRight或TwoWayMap.add无法正常工作！")
if(testTwoWayMap.toLeft("d")=="c")Logger.info("测试右值检索左值成功。")
else Logger.error("TwoWayMap.toLeft或TwoWayMap.add无法正常工作！")
Logger.info("测试删除数据")
testTwoWayMap.delLeft("a")
if(typeof testTwoWayMap.toRight("a")==="undefined")Logger.info("测试按左值删除映射成功")
else Logger.error("TwoWayMap.delLeft无法正常工作！")
testTwoWayMap.delRight("d")
if(typeof testTwoWayMap.toLeft("a")==="undefined")Logger.info("测试按右值删除映射成功")
else Logger.error("TwoWayMap.delRight无法正常工作！")
export async function testRegionRectangle(){
    const multipleAvailableDimensions=availableDimensions.length>1
    if(availableDimensions.length==1)throw new Error("无法在当前服务器中获取到任何维度，无法测试testRegionRectangle！")
    Logger.info("正在测试RegionRectangle")
    //location的new静态方法改为构造方法的重载
    const testedRegionRectangle=new RegionRectangle(new Location(0,0,0,availableDimensions[0]),new Location(1,1,1,Dimension.getDimension("overworld")),false)
    if((()=>{
        if(
            testedRegionRectangle.isInRegion(new Location(0.5,0.5,0.5,availableDimensions[0]))==true

            &&testedRegionRectangle.isInRegion(new Location(-1,-1,1,availableDimensions[0]))==false
        ){
            if(multipleAvailableDimensions){
                return !testedRegionRectangle.isInRegion(new Location(0.5,0.5,0.5,availableDimensions[1]))
            }
            return true;
        }
        return false;
    })())Logger.info("isInRegion测试成功")
    else Logger.error("isInRegion无法正常工作！")    
}
export const runtimeID=newUUID4()
Logger.info("测试UUID4生成。生成结果："+runtimeID)

