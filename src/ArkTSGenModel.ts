import { HvigorNode, HvigorPlugin, Json5Reader  } from '@ohos/hvigor';


import * as zip from 'unzipper'
import * as fs from 'fs'
import path from 'path';
import { log } from './conmon';
import { ArkTSGenModule } from './ArkTSGenModule';
import { MODULE_NAME } from './Constants';


export function genModelPlugin(): HvigorPlugin {
    return {
        pluginId: "genModelPlugin",
        apply(node: HvigorNode) {
            log("================================================================================");
            // 插件主体
            const projectPath = node.getNodePath()
            log("工程目录-" + projectPath);
            const projectName = path.basename(node.getNodePath())
            log("工程目录名-" + projectName);
            // 配置公共路由模块
            new ArkTSGenModule(node,()=>{
                log("添加模型文件")
                new ArkTSGenModel(node)
            })
            log("================================================================================");
        }
    }
}

export class ArkTSGenModel {

    constructor(node: HvigorNode){
        this.checkCreate(node)
    }

    buildModelFile(projectPath: string, modulePath: string){
        // 读取注解
        const filePath = modulePath + "/src/main/ets"
    }

    checkCreate(node: HvigorNode){
        const projectPath = node.getNodePath()
        const commonRouterPath = projectPath + "/json"
        log("遍历文件")
        this.traverseDirectory(commonRouterPath,(dirent)=>{
            log(dirent.parentPath + "/" + dirent.name);
            let buf =  fs.readFileSync(dirent.parentPath + "/" + dirent.name,{encoding:'utf-8'})
            // 如果是文件，处理文件
            let fileName = dirent.name.split('.')[0];
            fileName = fileName.substring(0, 1).toUpperCase() + fileName.substring(1);
            const filePath = `${projectPath}/${MODULE_NAME}/${fileName}.g.ets`;
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
        let init = `\tconstructor(face:${name}Face) {\n`;
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
                body += `\t${k[0]}:${objName} | undefined \n`
            }else{
                body += `\t${k[0]}:${typeof k[1]} | undefined \n`
            }
            init += `\t\tthis.${k[0]} = face.${k[0]} \n`
        })
        let model = `export interface ${name}Face{ \n ${body}}\n\n`
        model += `export class ${name} implements ${name}Face{\n${body}${init}\t}\n}\n\n`
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
                    return objName
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
                    this.traverseDirectory(fullPath,complete);
                }else{
                    complete(dirent)
                }
            })
        })
    }

    makeDir(commonRouterPath: string, complete: () => void){
        fs.mkdir(commonRouterPath,(err) => {
            if (err) {
                console.log('创建文失败', err);
                return;
            }else{
                log("创建" + MODULE_NAME + " 模块成功")
            }
        });
    }

    /// 创建模块
    unzipModule(projectPath: string, complete: () => void) {
        const unzipFile = __dirname + "/" + MODULE_NAME + " .zip"
        const directory = zip.Open.file(unzipFile).then(directory => {
            directory.extract({ path: projectPath }).then(() => {
                log("创建" + MODULE_NAME + " 模块")
                // 删除mac 解压附带产物
                this.deleteLocalFolder(projectPath + "/__MACOSX")
                this.addModuleToProjectBuildProfile(projectPath)
                this.addCommonRouterProjectPackageOverrides(projectPath)
                complete()
            })
        })
    }

    addModuleToProjectBuildProfile(projectPath: string) {
        const packageJson5 = Json5Reader.getJson5Obj(projectPath + "/build-profile.json5", "utf8")

        const packageJson5Obj = JSON.parse(JSON.stringify(packageJson5))

        const modules = packageJson5Obj.modules

        const commonRouterModule = modules.find((item: any) => item.name == MODULE_NAME)

        if (!commonRouterModule) {
            log("配置工程oh-package.json5,添加common-router 依赖")
            modules.push({
                name: MODULE_NAME,
                srcPath: "./" + MODULE_NAME,
                targets: [
                    {
                        name: "default",
                        applyToProducts: [
                            "default"
                        ]
                    }
                ]
            })
            fs.writeFileSync(projectPath + "/build-profile.json5", JSON.stringify(packageJson5Obj, null, 2))
        }
    }

    addCommonRouterProjectPackageOverrides(projectPath: string) {
        log("添加" + MODULE_NAME + "  依赖到工程级 oh-package.json5 的 overrides 中")
        const packageJson5 = Json5Reader.getJson5Obj(projectPath + "/oh-package.json5", "utf8")
        const packageJson5Obj = JSON.parse(JSON.stringify(packageJson5))
        log(JSON.stringify(packageJson5,null,2))
        if (!packageJson5Obj.overrides || !packageJson5Obj.overrides["@free/" + MODULE_NAME + " "]) {
            if (!packageJson5Obj.overrides) {
                packageJson5Obj.overrides = {}
            }
            packageJson5Obj.overrides["@free/" + MODULE_NAME + " "] = "file:" + MODULE_NAME + " "
            fs.writeFileSync(projectPath + "/oh-package.json5", JSON.stringify(packageJson5Obj, null, 2))
        }
    }

    deleteLocalFolder(folderPath: string): void {
        if (!fs.existsSync(folderPath)) {
            log('文件夹不存在，无法删除');
            return;
        }

        // 读取文件夹内容并递归删除
        fs.readdirSync(folderPath).forEach((file) => {
            const currentPath = path.join(folderPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                // 递归删除子文件夹
                this.deleteLocalFolder(currentPath);
            } else {
                // 删除文件
                fs.unlinkSync(currentPath);
            }
        });

        // 删除文件夹
        fs.rmdirSync(folderPath);
    }
};