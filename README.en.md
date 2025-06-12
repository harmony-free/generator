# refresh

#### Description [中文](README.md)

This is a file library automatically generated based on configuration by HONAM HVIGOR.

#### Software Architecture 

Huawei Hvigor Script

#### Installation [Click to download lib](./lib)


1、Manual import: Place the downloaded.tgz package into the project, and then in the `/hvigor/hvigor-config.json5` file, introduce `XXX` to replace the storage path.
```
/hvigor/hvigor-config.json5

{
  "dependencies": {
    "@free/generator": "file:../XXX.tgz"
  },
}

```

#### Instructions


1、Introduce the hvigorfile.json5 file under the "entry" section.

```
/entry/hvigorfile.json5

import { jsonToModelPlugin } from '@free/generator';

// input: josn The entrance area, Default /entry/json/
// out: model The exit point,  Default /entry/model/

export default {
    system: hapTasks, 
    plugins:[
        jsonToModelPlugin(input?:string,out?:string)
    ]        
}

```

2、Execute the command `hvigorw --sync`

#### Contribution

1.  Fork the repository
2.  Create Feat_xxx branch
3.  Commit your code
4.  Create Pull Request


#### Gitee Feature

1.  You can use Readme\_XXX.md to support different languages, such as Readme\_en.md, Readme\_zh.md
2.  Gitee blog [blog.gitee.com](https://blog.gitee.com)
3.  Explore open source project [https://gitee.com/explore](https://gitee.com/explore)
4.  The most valuable open source project [GVP](https://gitee.com/gvp)
5.  The manual of Gitee [https://gitee.com/help](https://gitee.com/help)
6.  The most popular members  [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
