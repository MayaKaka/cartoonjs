##CartoonJS是什么?

[CarootJS](http://cartoonjs.duapp.com)是一款基于HTML5的动画效果框架，致力于帮助大家轻松的创建基于WEB的交互动画和游戏。


##如何部署工程

* 安装 [nodejs](https://nodejs.org/)
    *  工程使用 nodejs + express 构建了一个 web server
    *  首先你需要安装一个 nodejs 环境
  
* 安装依赖模块
    * 在 cartoonjs 目录下，使用 npm install 下载相关依赖包

* 安装 [node-canvas](https://github.com/Automattic/node-canvas)
    * 在安装依赖模块 node-canvas 时，需要机器上有编译环境和图形库 cairo
    * 如果安装失败，可以通过 https://github.com/MayaKaka/node-canvas-build 找到对应版本， 并覆盖 node_modules 下的 canvas 目录即可。

* 启动应用
    * 在 cartoonjs 目录下，使用 node app.js
    * 通用 http://localhost 访问

##有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(chenrui09#baidu.com, 把#换成@)
* QQ: 410206258

##感激
感谢以下的项目,排名不分先后

* [createjs](http://createjs.com/) 
* [jquery](http://jquery.com)
* [ace](http://ace.ajax.org/)
* [express](https://github.com/Automattic/node-canvas)
* [node-canvas](https://github.com/Automattic/node-canvas)

##关于作者

```javascript
  console.log('hello world');
```