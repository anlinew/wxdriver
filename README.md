# wxmanagement
博宇司机端小程序
```
│  app.js
│  app.json //全局设置
│  app.wxss //全局样式
│  project.config.json
│  README.md
│  weui.wxss
│
├─pages
│  ├─image
│  │      avatar@2x.png
│  │      login@2x.png
│  │
│  ├─index
│  │      index.js
│  │      index.json
│  │      index.wxml
│  │      index.wxss
│  │
│  └─login
│          login.js
│          login.json
│          login.wxml
│          login.wxss
│
├─plugins
│  ├─wx-request
│  │  └─lib
│  │      │  index.js
│  │      │
│  │      ├─core
│  │      │      InterceptorManager.js
│  │      │      WxRequest.js
│  │      │
│  │      └─helpers
│  │              Utils.js
│  │
│  └─wx-validate
│          WxValidate.js //表单校验
│
├─requests
│      api.js //api接口
│
└─utils
        moment.js
        util.js //工具函数
```