# Webpack5学习指南

## Webpack介绍

### Webpack的功能
- 将多个文件合并(打包)，减少HTTP请求次数，从而提高效率
- 对代码进行编译，确保浏览器兼容性
- 对代码进行压缩，减小文件体积，提高加载速度
- 检测代码格式，确保代码质量
- 提供热更新服务，提高开发效率
- 针对不同环境，提供不同的打包策略；开发模式和产品模式、

Webpack的发展历史
- 2012.3.10，诞生
- 2014.2，Webpack1
- 2016.12，Webpack2
- 2017.6，Webpack3
- 2018.2，Webpack4
- 2020.10，Webpack5（Node.js10.13+）

### 核心概念
- 入口（Entry）
- 出口（Output）
- 加载器（Loader）
- 插件（Plugin）
- 模式（Mode）
- 模块（Module）
- 依赖图（Dependency Graph）

### 入口
- 打包时，第一个被访问的源代码文件
- 默认是src/index.js（可以通过配置文件指定）
- Webpack通过入口加载整个项目的依赖

### 出口
- 打包后，输出的文件
- 默认是dist/main.js（可以通过配置文件指定）

### 加载器
- 专门用来处理一类非JS文件的工具
  - Webpack默认只能识别JS，想要处理其他类型的文件，需要对应的loader
- 命名方式：xxx-loader（css-loader | html-loader | file-loader）
  - 以`-loader`为后缀
- 常用加载器：https://www.webpackjs.com/loaders

### 插件
- 实现loader之外的其他功能
  - Plugin是Webpack的支柱，用来实现丰富的功能
- 命名方式：xxx-webpack-plugin（html-webpack-plugin）
  - 以`-webpack-plugin`为后缀
- 常用插件：https://www.webpackjs.com/plugins

> loader和plugin本质上都是npm包

### 模式
- 用来区分环境的关键字
  - 不同环境的打包逻辑不通，因此需要加以区分
- 三种模式
  - development（自动优化打包速度，添加一些调试过程中的辅助）
  - production（自动优化打包结果）
  - none（运行最原始的打包，不做任何额外处理）

### 模块
- Webpack中，模块的概念比较宽泛（一切皆为模块）
  - JS模块
  - 一段CSS代码
  - 一张图片
  - 一个字体文件
  - ...
- 详情：https://www.webpackjs.com/concepts/modules

### 依赖图

### Webpack最佳实践

- 初始化项目
  - mkdir my-project && cd my-project && npm init -y
- 安装Webpack
  - npm install -D webpack webpack-cli
- 创建入口文件
  - my-project/src/index.js
- 执行打包（必须指定mode）
  - webpack ./src/index.js --output-path ./dist --mode=development
- Webpack版本
  - Webpack4 于2018年2月发布
  - Webpack5 于2020年10月发布
- 安装命令需要调整（默认安装5）
  - npm install webpack -D  # webpack5
  - npm install webpack@4 -D    # webpack4

### Webpack配置文件
- 配置文件是用来简化命令行选项
  - 配置前：webpack ./src/index.js --output-path=./dist --mode=development
  - 配置后：webpack
- 默认的配置文件名称是webpack.config.js
  - webpack.config.js是以CommonJS规范进行组织的
  - 在使用webpack的过程中，大部分就是跟配置文件打交道  
- 配置详情
  - https://www.webpackjs.com/configuration
  
### 常用配置
- mode
- entry
- output
- module（模块配置，不同类型文件的配置不同-loader配置）
- plugins
- devServer（开发服务器的配置）

## Webpack基础用法
- 打包CSS
- 打包HTML
- 打包JS
- 打包图片
- 打包字体
- 资源模块（Asset Modules）：Webpack5中新增的打包图片和字体的新的解决方案
- 开发服务器（Dev Server）

### 打包CSS
1. 打包逻辑
2. 打包Less
3. 打包成独立的CSS文件
4. 添加样式前缀
5. 添加格式校验
6. 压缩CSS

- 非JS文件打包，需要对应的loader
  - css-loader：将CSS转换为JS（将CSS输出到打包后的JS文件中）
  - style-loader：把包含CSS内容的JS代码[被包含在bundle.js中 ]挂载到页面的<style>标签中
- 引入CSS（import "./css/main.css"）
- 安装（npm install css-loader style-loader -D）
- 配置
  - 匹配后缀名：`test: \/.css$\i,`
  - 指定加载器：`use: ['style-loader', 'css-loader']`
    - Loader执行顺序：先声明的后执行，即use数组中声明的loader是从右往左加载的

#### 打包Sass
安装sass-loader和node-sass
```
npm install sass-loader node-sass -D
```
添加rule
``` js
rules: [{
    test: /\.scss$/,
    use: [{
        loader: "style-loader" // 将 JS 字符串生成为 style 节点
    }, {
        loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
    }, {
        loader: "sass-loader" // 将 Sass 编译成 CSS
    }]
}]
```

#### 打包less
安装loader及依赖
```
npm install less less-loader -D
```
添加rule
```js
{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader']
}
```

#### 将CSS打包成独立的文件
1. 安装插件
   - npm install mini-css-extract-plugin -D
2. 引入插件
   - const MiniCssExtractPlugin = require('mini-css-extract-plugin');
3. 替换`style-loader` (use: ['MiniCssExtractPlugin.loader', 'css-loader'])
   - style-loader: 将CSS打包到<style>标签中
   - MiniCssExtractPlugin.loader: 将CSS打包到独立文件中
4. 配置插件(new MiniCssExtractPlugin({filename: 'css/[name].css'}))
   - 通过给MiniCssExtractPlugin构造函数指定`filename`属性来设置打包的css文件名称

#### 添加样式前缀
针对不同的浏览器给存在兼容性的CSS属性添加前缀
1. 安装
   - npm install postcss-loader autoprefixer -D
2. 配置webpack.config.js
   - use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
3. 新建 postcss.config.js
   - plugins: [require('autoprefixer')]
4. 配置需要兼容的浏览器
   1. 在`package.json`文件中指定`browserslist`属性，值形如：(推荐)
    ```
    "browserslist": [
      "last 1 version", // 代表最后一个版本
      "> 1%"  // 代表全球超过1%使用的浏览器 
    ]
    ```
   2. 在项目根目录下新建`.browserslistrc`文件，内容如下：
    ``` .browserslistrc
    # Browsers that we supprot
    last 1 version
    > 1%
    ```
   - 详情参照: https://www.npmjs.com/package/browserslist

给样式添加浏览器前缀前的代码：
``` css
.code {
    width: 30px;
    height: 30px;
    // 存在浏览器兼容性问题
    user-select: none;
}
```
使用`postcss-loader`和`autoprefixer`给样式添加浏览器前缀后的代码：
``` css
.code {
  width: 30px;
  height: 30px;
  /* Chrome和Safari浏览器前缀 */
  -webkit-user-select: none;
    /* 火狐浏览器前缀 */
     -moz-user-select: none;
     /* IE浏览器前缀 */
      -ms-user-select: none;
          /* 没有前缀 */
          user-select: none; }
```

#### CSS格式校验
1. 安装
   - npm install stylelint stylelint-config-standard stylelint-webpack-plugin -D
      - stylelint: https://stylelint.io
        - 校验规则(number-leading-zero)
          - line-height: .5; // 错误
          - line-height: 0.5;  // 正确
      - stylelint-config-standard
        - https://github.com/stylelint/stylelint-config-standard
      - stylelint-webpack-plugin
        - https://webpack.docschina.org/plugins/stylelint-webpack-plugin/
2. 引入
   - const StylelintPlugin = require('stylelint-webpack-plugin');
3. 配置
   - new StylelintPlugin({})
4. 指定代码的校验规则(在package.json中指定stylelint)
   - "stylelint": {"extends": "stylelint-config-standard"}
5. 指定规则集的三种方式
   - 在package.json中指定"stylelint"
   - 创建.stylelintrc文件，并在其中指定规则集
   - 创建stylelint.config.js文件，并在其中指定规则集
6. 规则集继承自`stylelint-config-standard`，可以使用"extends"修改继承规则集，使用"rules"指定其他自定义规则

#### 压缩CSS
使用OptimizeCssAssetsWebpackPlugin插件
1. 安装
   - npm install optimize-css-assets-webpack-plugin -D
2. 引入
   - const OptimizeCssAssetsPlugin =require('optimize-css-assets-webpack-plugin')
3. 配置
   - new OptimizeCssAssetsPlugin()

使用CssMinimizerWebpackPlugin插件

### 打包HTML
1. html-webpack-plugin插件
   - 生成HTML文件(用于服务器访问)，并在HTML中加载所有的打包资源
   - 指定HTML模板、设置HTML变量、压缩HTML
2. 安装
   - npm install html-webpack-plugin -D
3. 配置
   - https://www.npmjs.com/package/html-webpack-plugin
4. HtmlWebpackPlugin插件默认使用的是[EJS模板引擎](https://ejs.bootcss.com/)

5. 使用HtmlWebpackPlugin插件的option.minify配置对HTML进行压缩打包，如果webpack的mode配置为"production"，html-webpack-plugin插件的minify配置项默认打开
``` js
new HtmlWebpackPlugin({
    filename: 'about.html',
    template: 'src/index.html',
    // 页面标题
    title: 'About Webpack',
    h1: 'About Webpack',
    // 对"about.html"文件进行压缩打包
    minify: {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    }
})
```

### 打包JS

#### 常规配置

- 目的
  - 将ES6+转换为ES5，从而保证JS在低版本浏览器中的兼容性
- 安装
  - npm install babel-loader @babel/core @babel/preset-env -D
- 配置
  - https://www.npmjs.com/package/babel-loader
``` js
module: {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: "defaults" }]
          ]
        }
      }
    }
  ]
}
```

- @babel/preset：ES转换规则集，包括babel-preset-es2015、babel-preset-es2016、babel-preset-es2017、babel-preset-es2018等等
- @babel/preset-env: 包含所有ES的最新转换规则（只能转义基础语法，不能转换Promise这一类高级特性）
- @babel/polyfill (转义所有ES新语法)
  - npm i @babel/polyfill -D
  - import '@babel/polyfill';(入口文件中引入)
  - 转义后的文件暴增，例如bundle.js转义前大小为 `4.91KiB`,经过@babel/polyfill转义后，大小变为 `451KiB`，引入没有使用的新语法转义，该转义对当前项目可能是垃圾代码
- core-js: 按需转义JS新语法，解决@babel/polyfill的暴力转义的问题
  - 安装：npm install core-js -D
  - 配置
    - 按需加载useBuiltIns: 'usage'
    - 指定版本corejs: 3
  - 使用core-js按需编译，出包大小减小至 `113KiB`

> `@babel/preset-env` 只能对简单的ES6+语法进行转换，例如箭头函数转function函数，但是对于Promise这一类高级特性，babel无法完成转换，需要借助 `babel/polyfill`(转义所有的ES新语法)

> 注意：一定要在babel-loader的loader的option中使用exclude将node_modules(此时不能使用exclude: 'node_modules'，应该使用exclude: /node_modules/)下的三方包中js排除在core-js编译的目标之外，否则会报错。


#### 校验JS代码格式
1. 安装
   - npm install eslint eslint-config-airbnb-base eslint-webpack-plugin eslint-plugin-import -D
   - eslint(校验JS代码格式的工具): 发现和解决JS代码的问题
     - https://eslint.org/
   - eslint-config-airbnb-base(最流行的JS代码格式规范)
     - https://www.npmjs.com/package/eslint-config-airbnb-base
     - https://github.com/airbnb/javascript
   - eslint-webpack-plugin
     - https://www.npmjs.com/eslint-webpack-plugin
   - eslint-plugin-import
     - 入股eslint的配置项写在了package.json文件中，那么就需要借助eslint-plugin-import插件从package.json文件中读取`eslintConfig`配置项
<!-- 2. 初始化生成.eslintrc文件 -->
2. 配置
   - eslint-webpack-plugin
     - const ESLintWebpackPlugin = require('eslint-webpack-plugin');
     - plugins: [new ESLintWebpackPlugin(options)],
   - eslintConfig(package.json)
     - "eslintConfig": { "extends": "airbnb-base" }
