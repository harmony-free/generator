### 初始化typescript项目

1、 创建一个空目录 `custom-plugin`。 在命令行工具中使用cd命令进入空目录下。

2、 全局安装TypeScript。权限不足会导致无法安装 配置npm全局文件 或者 用管理员打开命令

`npm install typescript -g` 或者 `npm install typescript`

3、 初始化一个npm项目

`npm init`

4、 生成typescript配置文件。 初始化typeScript配置文件

`tsc --init`

5、 typescript项目初始化完成。

### 开发插件

1、 配置npm镜像仓库地址。 在用户目录下创建或打开.npmrc文件，配置如下信息：

```
registry=https://repo.huaweicloud.com/repository/npm/

@ohos:registry=https://repo.harmonyos.com/npm/
```

2、 添加依赖声明。 打开package.json添加devDependencies配置。

```
"devDependencies": {
    "@ohos/hvigor": "5.2.2"
}
```

3、安装依赖。 执行如下命令安装依赖。

```
npm install
```

4、 编写插件代码。 创建custom-plugin.ts文件，编写插件代码，更多接口请参考[扩展构建API](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/ide-hvigor-apis)。

```
import { HvigorNode, HvigorPlugin } from '@ohos/hvigor';

export function customPlugin(): HvigorPlugin {
    return {
        pluginId: 'customPlugin',
        apply(node: HvigorNode) {
            console.log('hello customPlugin!');
        }
    }
}
```

5、导出插件。 创建index.ts文件，并在该文件中声明插件方法的导出。

```
export { customPlugin } from './src/plugin/custom-plugin';
```

6、在终端执行npm pack命令，在plugin目录下就生成了plugin-1.0.0.tgz文件。

```
npm pack
```

### 发布插件

1、 配置registry。 在用户目录下创建.npmrc文件，配置您需要发布的镜像仓库。

```
registry=[npm镜像仓库地址]
```

2、 生成AccessToken。 执行如下命令，注册并登录npm仓库，在用户目录下.npmrc文件中自动生成token信息。

```
npm login
```

3、 发布npm包。 执行如下命令，将npm项目打包并发布至镜像仓库。

```
npm publish
```

### 使用插件

1、 添加依赖。 在工程下hvigor/hvigor-config.json5中添加自定义插件依赖，依赖项支持离线插件配置。

```
 "dependencies": {
    "custom-plugin": "1.0.0"   // 添加自定义插件依赖
  }
```

2、 安装依赖。

方式1：执行编辑区右上角Sync Now或执行菜单File -> Sync and Refresh Project进行工程Sync后，DevEco Studio将会根据hvigor-config.json5中的依赖配置自动安装。

方式2：使用hvigorw命令行工具执行任一命令，命令行工具会自动执行安装构建依赖。

```
hvigorw --sync
```

3、 导入插件。 根据插件编写时基于的node节点，确定导入的节点所在的hvigorfile.ts文件，在hvigorfile.ts中导入插件。

```
import { customPlugin } from 'custom-plugin';
```

4、 使用插件。 将自定义插件添加到export default的plugins中。

```
export default {
    system: appTasks,
    plugins:[
        customPlugin()  // 应用自定义插件
    ]
}
```







