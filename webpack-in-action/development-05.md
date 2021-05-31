# Webpack

## 开发
在我们继续之前，先来看看如何建立一个开发环境，使我们的开发变得更容易一些。

### 使用SourceMap

当 webpack 打包源代码时，可能会很难追踪到错误和警告在源代码中的原始位置。例如，如果将三个源文件（`a.js`, `b.js` 和 `c.js`）打包到一个 bundle（`bundle.js`）中，而其中一个源文件包含一个错误，那么堆栈跟踪就会简单地指向到 `bundle.js`。这并通常没有太多帮助，因为你可能需要准确地知道错误来自于哪个源文件。

为了更容易地追踪错误和警告，JavaScript 提供了 source map 功能，将编译后的代码映射回原始源代码。如果一个错误来自于 `b.js`，source map 就会明确的告诉你。

source map 有很多[不同的选项](https://www.webpackjs.com/configuration/devtool/)可用，请务必仔细阅读它们，以便可以根据需要进行配置。

| **devtool**                    | **构建速度** | **重新构建速度** | **生产环境** | **品质(quality)**      |
|--------------------------------|--------------|------------------|--------------|------------------------|
| (none)                         | +++          | +++              | yes          | 打包后的代码           |
| eval                           | +++          | +++              | no           | 生成后的代码           |
| cheap-eval-source-map          | +            | ++               | no           | 转换过的代码（仅限行   |
| cheap-module-eval-source-map   | 0            | ++               | no           | 原始源代码（仅限行）   |
| eval-source-map                | --           | +                | no           | 原始源代码             |
| cheap-source-map               | +            | 0                | no           | 转换过的代码（仅限行） |
| cheap-module-source-map        | 0            | -                | no           | 原始源代码（仅限行）   |
| inline-cheap-source-map        | +            | 0                | no           | 转换过的代码（仅限行） |
| inline-cheap-module-source-map | 0            | -                | no           | 原始源代码（仅限行）   |
| source-map                     | --           | --               | yes          | 原始源代码             |
| inline-source-map              | --           | --               | no           | 原始源代码             |
| hidden-source-map              | --           | --               | yes          | 原始源代码             |
| nosources-source-map           | --           | --               | yes          | 无原始源代码           |

对于本指南，我们使用 inline-source-map 选项，这有助于解释说明我们的目的（仅解释说明，不要用于生产环境）：

修改webpack.config.js配置文件中的devTool字段
``` js
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const CleanWebpackPlugin = require('clean-webpack-plugin');

  module.exports = {
    entry: {
      app: './src/index.js',
      print: './src/print.js'
    },
+   devtool: 'inline-source-map',
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        title: 'Development'
      })
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
  };
```

修改src/print.js，使之产生一行错误。
``` js
  export default function printMe() {
-   console.log('I get called from print.js!');
+   cosnole.error('I get called from print.js!');
  }
```

### 选择一个开发工具

每次要编译代码时，手动运行 npm run build 就会变得很麻烦。

webpack 中有几个不同的选项，可以帮助你在代码发生变化后自动编译代码：

1. watch mode
2. dev-server
3. dev-middleware

多数场景中，你可能需要使用 webpack-dev-server，但是不妨探讨一下以上的所有选项。

### 使用观察模式
你可以指示 webpack "watch" 依赖图中的所有文件以进行更改。如果其中一个文件被更新，代码将被重新编译，所以你不必手动运行整个构建。

我们添加一个用于启动 webpack 的观察模式的 npm script 脚本：

package.json
``` json
  {
    "name": "development",
    "version": "1.0.0",
    "description": "",
    "main": "webpack.config.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
+     "watch": "webpack --watch",
      "build": "webpack"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
      "clean-webpack-plugin": "^0.1.16",
      "css-loader": "^0.28.4",
      "csv-loader": "^2.1.1",
      "file-loader": "^0.11.2",
      "html-webpack-plugin": "^2.29.0",
      "style-loader": "^0.18.2",
      "webpack": "^3.0.0",
      "xml-loader": "^1.2.1"
    }
  }
```
现在，你可以在命令行中运行 npm run watch，就会看到 webpack 编译代码，然而却不会退出命令行。这是因为 script 脚本还在观察文件。

现在，webpack 观察文件的同时，我们先移除我们之前引入的错误：

src/print.js

``` js
  export default function printMe() {
-   cosnole.log('I get called from print.js!');
+   console.log('I get called from print.js!');
  }
```
现在,保存文件并检查终端窗口。应该可以看到 webpack 自动重新编译修改后的模块！

唯一的缺点是，为了看到修改后的实际效果，你需要刷新浏览器。如果能够自动刷新浏览器就更好了，可以尝试使用 webpack-dev-server，恰好可以实现我们想要的功能。

### 使用webpack-dev-server

 `webpack-dev-server` 是一个简单的web服务器，并且能够实时重新加载，首先需要安装这个服务器依赖：
 ```
 npm install webpack-dev-server --save-dev
 ```

 修改配置文件，告诉开发服务器，在哪里查找文件：

 webpack.config.js
 ``` js
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const CleanWebpackPlugin = require('clean-webpack-plugin');

  module.exports = {
    entry: {
      app: './src/index.js',
      print: './src/print.js'
    },
    devtool: 'inline-source-map',
+   devServer: {
+     contentBase: './dist'
+   },
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        title: 'Development'
      })
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
  };
 ```
以上配置告知 webpack-dev-server，在 localhost:8080 下建立服务，将 dist 目录下的文件，作为可访问文件。

让我们添加一个 script 脚本，可以直接运行开发服务器(dev server)：

package.json
``` json
  {
    "name": "development",
    "version": "1.0.0",
    "description": "",
    "main": "webpack.config.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "watch": "webpack --watch",
+     "start": "webpack-dev-server --open",
      "build": "webpack"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
      "clean-webpack-plugin": "^0.1.16",
      "css-loader": "^0.28.4",
      "csv-loader": "^2.1.1",
      "file-loader": "^0.11.2",
      "html-webpack-plugin": "^2.29.0",
      "style-loader": "^0.18.2",
      "xml-loader": "^1.2.1",
      "webpack": "^5.4.0",
      "webpack-cli": "^3.3.12",
      "webpack-dev-server": "^3.11.0"
    }
  }
```
现在，我们可以在命令行中运行 npm start，就会看到浏览器自动加载页面。如果现在修改和保存任意源文件，web 服务器就会自动重新加载编译后的代码。试一下！

`webpack-dev-server` 带有许多可配置的选项。转到[相关文档](https://www.webpackjs.com/configuration/dev-server/)以了解更多。

> *现在，服务器正在运行，你可能需要尝试[模块热替换](https://www.webpackjs.com/guides/hot-module-replacement/)(Hot Module Replacement)！*