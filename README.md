# generator

#### 介绍 

这是鸿蒙hvigor的一个根据配置自动生成文件库

#### 安装教程 [点击下载lib](./lib)

1、手动导入 把下载好的.tgz包放入项目中，再`/hvigor/hvigor-config.json5`文件中引入 `XXX`替换存放路径
```
/hvigor/hvigor-config.json5

{
  "dependencies": {
    "@free/generator": "file:../XXX.tgz"
  },
}

```

#### 使用说明

1、在entry下hvigorfile.json5文件中引入

```
/entry/hvigorfile.json5

import { jsonToModelPlugin } from '@free/generator';

// input: josn入口的地方 默认 /entry/json/
// out: model出口的地方  默认 /entry/model/

export default {
    system: hapTasks, 
    plugins:[
        jsonToModelPlugin(input?:string,out?:string)
    ]        
}

```
 
 执行命令`hvigorw --sync`