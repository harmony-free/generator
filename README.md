# generator

#### 介绍  [English](README.en.md)

这是鸿蒙hvigor的一个根据配置自动生成文件库

#### 软件架构

华为 hvigor 脚本

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
 
2、执行命令`hvigorw --sync`


#### 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request

#### 特技

1. 使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2. Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3. 你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4. [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5. Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6. Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
