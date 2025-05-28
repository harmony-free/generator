import { HvigorNode, HvigorPlugin  } from '@ohos/hvigor';

import * as fs from 'fs'
import path from 'path';
import { log } from './conmon';

interface GenConfig{
    out:string,
    input:string
}

/// 通过json生成model
export function jsonToModelPlugin(input?:string,out?:string): HvigorPlugin {
    return {
        pluginId: "jsonToModelPlugin",
        apply(node: HvigorNode) {
            log("================================================================================");
            // 插件主体
            const projectPath = node.getNodePath()
            log("工程目录-" + projectPath);
            const projectName = path.basename(node.getNodePath())
            log("工程目录名-" + projectName);
            new ArkTSGenModel({out:out??projectPath+"/model",input:input??projectPath+"/json"})
            log("================================================================================");
        }
    }
}

export class ArkTSGenModel {
    config:GenConfig
    constructor(config:GenConfig){
        this.config = config
        this.checkCreate()
    }

    checkCreate(){
        this.makeDir(`${this.config.out}`)
        log("遍历文件")
        this.traverseDirectory(this.config.input,(dirent)=>{
            log(dirent.parentPath + "/" + dirent.name);
            let buf =  fs.readFileSync(dirent.parentPath + "/" + dirent.name,{encoding:'utf-8'})
            // 如果是文件，处理文件
            let fileName = dirent.name.split('.')[0];
            fileName = fileName.substring(0, 1).toUpperCase() + fileName.substring(1);
            const filePath = `${this.config.out}/${fileName}.g.ets`;
            try{
                let model = this.jsonToModel(JSON.parse(buf),fileName)
                fs.writeFileSync(filePath,model)
                log("创建文件成功:"+filePath)
            }catch(e){
                log("创建文件失败:"+e)
            }
            
        })
    }

    jsonToModel(json:object,name:string):string{
        let data = Object.entries(json);
        let body = "";
        let init = `\tconstructor(face:${name}Face) {\n\t\tif(face==null)`;
        let otherMap:Map<string,any> = new Map()
        data.forEach((k)=>{
            if(k[1] instanceof Array){
                // if(k[1]!=null && k[1].length > 0){
                //     if(typeof k[1][0] == "object"){
                //         if(k[1][0] instanceof Array){
                //             /// todo: 待处理数组嵌套问题
                //             body += `\t${k[0]}:Array<Array<object>> | undefined \n`
                //         }else{
                //             let objName = k[0].substring(0, 1).toUpperCase() + k[0].substring(1);
                //             otherMap.set(objName,k[1][0])
                //             body += `\t${k[0]}:Array<${objName}> | undefined \n`
                //         }
                //     }else{
                //         body += `\t${k[0]}:Array<${typeof k[1][0]}> | undefined \n`
                //     }
                // }else{
                //     body += `\t${k[0]}:Array<object> | undefined \n`
                // }
                // 处理数组嵌套问题
                body += `\t${k[0]}:Array<${this.arrayToModel(k[0],k[1],otherMap,name)}> | undefined \n`
            }else if(k[1] != null && typeof k[1] == "object"){
                let objName = name + k[0].substring(0, 1).toUpperCase() + k[0].substring(1);
                otherMap.set(objName,k[1])
                body += `\t${k[0]}:${objName}Model | undefined \n`
            }else{
                body += `\t${k[0]}:${typeof k[1]} | undefined \n`
            }
            init += `\t\tthis.${k[0]} = face.${k[0]} \n`
        })
        let model = `export interface ${name}Face{ \n ${body}}\n\n`
        // model += `export class ${name} implements ${name}Face{\n${body}${init}\t}\n}\n\n`
        model += `export class ${name}Model implements ${name}Face{\n${body}\n}\n\n`
        otherMap.forEach((v,k)=>{
            model += this.jsonToModel(v,k)
        })
        return model
    }

    arrayToModel(k:string,v:Array<any>,otherMap:Map<string,any>,name:string):string{
        if(v.length > 0){
            if(typeof v[0] == "object"){
                if(v[0] instanceof Array){
                    return `Array<${this.arrayToModel(k,v[0],otherMap,name)}>`;
                }else{
                    let objName = name + k.substring(0, 1).toUpperCase() + k.substring(1);
                    otherMap.set(objName,v[0])
                    return objName + "Model"
                }
            }else{
                return typeof v[0]
            }
        }else{
            return "object"
        }
    }

    traverseDirectory(path:string,complete: (dirent: fs.Dirent<string>) => void){
        fs.readdir(path, { withFileTypes: true },(err,dirents)=>{
            if (err) {
                log(`Error reading directory ${path}:${err}`);
                return;
            }
            dirents.forEach((dirent)=>{
                const fullPath = `${path}/${dirent.name}`;
                if (dirent.isDirectory()){
                    // 如果是文件夹，递归调用
                    this.makeDir(`${this.config.out}/${dirent.name}`)
                    this.traverseDirectory(fullPath,complete);
                }else{
                    complete(dirent)
                }
            })
        })
    }

    makeDir(path: string){
        let isDirectory = false
        try {
            const stats = fs.statSync(path)
            isDirectory = stats.isDirectory()
        } catch {
            isDirectory = false
        }
        if(!isDirectory){
            fs.mkdir(path,(err) => {
                if (err) {
                    console.log('创建文夹失败', err);
                    return;
                }else{
                    log("创建文件夹成功:"+path)
                }
            });
        }else{
            log("文件夹已存在:"+path)
        }
            
    }
};