# 快速上手

## 安装
推荐使用 npm 的方式安装，它能更好地和`webpack`打包工具配合使用。
若安装缓慢报错，可尝试用 cnpm 或别的镜像源自行安装：rm -rf node_modules && cnpm install。

```shell
npm i ppfish --save
```

## 使用

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { AnimationImageLoader } from 'ppfish';

ReactDOM.render(
  <AnimationImageLoader
    extraCls="u-nav-icon"
    src={require('./create_POI@2x.png')}
    zoom={0.5}
  />, document.getElementById('app')
);

```