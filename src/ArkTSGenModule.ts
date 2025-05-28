import { HvigorNode, Json5Reader } from '@ohos/hvigor';

import * as zip from 'unzipper'
import * as fs from 'fs'
import path from 'path';
import { log } from './conmon';
import { MODULE_NAME } from './Constants';

export class ArkTSGenModule {

    constructor(node: HvigorNode,complete: () => void){
        this.checkCreate(node,complete)
    }

    checkCreate(node: HvigorNode,complete: () => void){
        const projectPath = node.getNodePath()
        const commonRouterPath = projectPath + "/" + MODULE_NAME
        let isDirectory = false
        try {
            const stats = fs.statSync(commonRouterPath)
            isDirectory = stats.isDirectory()
        } catch {
            isDirectory = false
        }
        if (isDirectory) {
            log("工程" + projectPath + "- 存在 " + MODULE_NAME + " 模块")
            complete()
        } else {
            log("工程" + projectPath + "- 不存在 " + MODULE_NAME + " 模块")
            log("开始创建" + MODULE_NAME + "模块...")
            this.makeDir(commonRouterPath, complete)
            // this.unzipModule(projectPath, complete)
        }
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