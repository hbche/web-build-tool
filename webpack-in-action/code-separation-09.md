# Webpack指南

## 代码分离

代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。

有三种常见的代码分离方法：
- 入口起点：使用 `entry` 配置手动地分离代码。
- 防止重复：使用 `CommonChunkPlugin` 去重和分离chunk。
- 动态导入：通过模块的内联函数调用分离代码。

### 入口起点

这是迄今为止最简单、最直观的分离代码的方式。不过，这种方式手动配置较多，并有一些陷阱，我们将会解决这些问题。先来看看如何从 main bundle 中分离另一个模块：

project:
```
webpack-demo
|- package.json
|- webpack.config.js
|- /dist
|- /src
  |- index.js
+ |- another-module.js
|- /node_modules
```

another-module.js
``` js
import _ from 'lodash';

console.log(
  _.join(['Another', 'module', 'loaded!'], ' ')
);
```

webpack.config.js
``` js
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    another: './src/another-module.js'
  },
  plugins: [
    new HTMLWebpackPlugin({
      title: 'Code Splitting'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```
这将生成如下构建结果：
``` 
Hash: 309402710a14167f42a8
Version: webpack 2.6.1
Time: 570ms
            Asset    Size  Chunks                    Chunk Names
  index.bundle.js  544 kB       0  [emitted]  [big]  index
another.bundle.js  544 kB       1  [emitted]  [big]  another
   [0] ./~/lodash/lodash.js 540 kB {0} {1} [built]
   [1] (webpack)/buildin/global.js 509 bytes {0} {1} [built]
   [2] (webpack)/buildin/module.js 517 bytes {0} {1} [built]
   [3] ./src/another-module.js 87 bytes {1} [built]
   [4] ./src/index.js 216 bytes {0} [built]
```
正如前面提到的，这种方法存在一些问题:

- 如果入口 chunks 之间包含重复的模块，那些重复模块都会被引入到各个 bundle 中。
- 这种方法不够灵活，并且不能将核心应用程序逻辑进行动态拆分代码。

以上两点中，第一点对我们的示例来说无疑是个问题，因为之前我们在 ./src/index.js 中也引入过 lodash，这样就在两个 bundle 中造成重复引用。接着，我们通过使用 CommonsChunkPlugin 来移除重复的模块。

### 防止重复

#### 入口依赖

配置 `dependOn` `option` 选项，这样可以在多个 chunk 之间共享模块：

webpack.config.js
``` js
 module.exports = {
   mode: 'development',
   entry: {
-    index: './src/index.js',
-    another: './src/another-module.js',
+    index: {
+      import: './src/index.js',
+      dependOn: 'shared',
+    },
+    another: {
+      import: './src/another-module.js',
+      dependOn: 'shared',
+    },
+    shared: 'lodash',
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
 };
```
如果我们要在一个 HTML 页面上使用多个入口时，还需设置 optimization.runtimeChunk: 'single'，否则还会遇到[这里](https://bundlers.tooling.report/code-splitting/multi-entry/)所述的麻烦。

输出结果如下：
```
> code-seperation-demo@1.0.0 build E:\web-code\frontend\vue-in-action\code-seperation-demo
> webpack --config webpack.config.js

asset shared.bundle.js 539 KiB [emitted] (name: shared) 1 related asset
asset app.bundle.js 1.23 KiB [emitted] (name: app) 1 related asset
asset another.bundle.js 1.1 KiB [emitted] (name: another) 1 related asset
asset index.html 333 bytes [emitted]
runtime modules 3.57 KiB 8 modules
cacheable modules 532 KiB
  ./node_modules/lodash/lodash.js 531 KiB [built] [code generated]
  ./src/another-module.js 86 bytes [built] [code generated]
  ./src/index.js 268 bytes [built] [code generated]
webpack 5.38.1 compiled successfully in 676 ms 
```
由上可知，除了生成 `shared.bundle.js`，`index.bundle.js` 和 `another.bundle.js` 之外，还生成了一个 `runtime.bundle.js` 文件。

尽管可以在 webpack 中允许每个页面使用多入口，应尽可能避免使用多入口的入口：`entry: { page: ['./analytics', './app'] }`。如此，在使用 `async` 脚本标签时，会有更好的优化以及一致的执行顺序。

### SplitChunks

`[SplitChunkd](https://webpack.docschina.org/plugins/split-chunks-plugin/)`插件可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。让我们使用这个插件，将之前的示例中重复的 `lodash` 模块去除：

webpack.config.js:
``` js
  const path = require('path');

  module.exports = {
    mode: 'development',
    entry: {
      index: './src/index.js',
      another: './src/another-module.js',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
+   optimization: {
+     splitChunks: {
+       chunks: 'all',
+     },
+   },
  };
```
使用 `optimization.splitChunks` 配置选项之后，现在应该可以看出，`index.bundle.js` 和 `another.bundle.js` 中已经移除了重复的依赖模块。需要注意的是，插件将 `lodash` 分离到单独的 `chunk`，并且将其从 main bundle 中移除，减轻了大小。执行 npm run build 查看效果：

```
...
[webpack-cli] Compilation finished
asset vendors-node_modules_lodash_lodash_js.bundle.js 549 KiB [compared for emit] (id hint: vendors)
asset index.bundle.js 8.92 KiB [compared for emit] (name: index)
asset another.bundle.js 8.8 KiB [compared for emit] (name: another)
Entrypoint index 558 KiB = vendors-node_modules_lodash_lodash_js.bundle.js 549 KiB index.bundle.js 8.92 KiB
Entrypoint another 558 KiB = vendors-node_modules_lodash_lodash_js.bundle.js 549 KiB another.bundle.js 8.8 KiB
runtime modules 7.64 KiB 14 modules
cacheable modules 530 KiB
  ./src/index.js 257 bytes [built] [code generated]
  ./src/another-module.js 84 bytes [built] [code generated]
  ./node_modules/lodash/lodash.js 530 KiB [built] [code generated]
webpack 5.4.0 compiled successfully in 241 ms
```

以下是由社区提供，一些对于代码分离很有帮助的 plugin 和 loader：
- [mini-css-extract-plugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin/#root): 用于将 CSS 从主应用程序中分离。


### 动态导入(dynamic import) 

当涉及到动态代码拆分时，webpack 提供了两个类似的技术。第一种，也是推荐选择的方式是，使用符合 [ECMAScript 提案](https://github.com/tc39/proposal-dynamic-import) 的 [import()](https://webpack.docschina.org/api/module-methods/#import-1) 语法 来实现动态导入。第二种，则是 webpack 的遗留功能，使用 webpack 特定的 [require.ensure](https://webpack.docschina.org/api/module-methods/#requireensure)。让我们先尝试使用第一种……

>Warning
import() 调用会在内部用到 promises。如果在旧版本浏览器中（例如，IE 11）使用 import()，记得使用一个 polyfill 库（例如 [es6-promise](https://github.com/stefanpenner/es6-promise) 或 [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)），来 shim Promise。

在我们开始之前，先从上述示例的配置中移除掉多余的 `entry` 和 `optimization.splitChunks`，因为接下来的演示中并不需要它们：

webpack.config.js:
``` js
 const path = require('path');

 module.exports = {
   mode: 'development',
   entry: {
     index: './src/index.js',
-    another: './src/another-module.js',
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
-  optimization: {
-    splitChunks: {
-      chunks: 'all',
-    },
-  },
 };
```

我们将更新我们的项目，移除现在未使用的文件：

project
```
webpack-demo
|- package.json
|- webpack.config.js
|- /dist
|- /src
  |- index.js
- |- another-module.js
|- /node_modules
```
现在，我们不再使用 statically import(静态导入) lodash，而是通过 dynamic import(动态导入) 来分离出一个 chunk：

src/index.js:
``` js
-import _ from 'lodash';
-
-function component() {
+function getComponent() {
   const element = document.createElement('div');

-  // Lodash, now imported by this script
-  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
+  return import('lodash')
+    .then(({ default: _ }) => {
+      const element = document.createElement('div');

+      element.innerHTML = _.join(['Hello', 'webpack'], ' ');

-  return element;
+      return element;
+    })
+    .catch((error) => 'An error occurred while loading the component');
 }

-document.body.appendChild(component());
+getComponent().then((component) => {
+  document.body.appendChild(component);
+});
```
我们之所以需要 `default`，是因为 webpack 4 在导入 CommonJS 模块时，将不再解析为 `module.exports` 的值，而是为 CommonJS 模块创建一个 artificial namespace 对象，更多有关背后原因的信息，请阅读 [webpack 4: import() and CommonJs](https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655)。

让我们执行 webpack，查看 lodash 是否会分离到一个单独的 bundle：
```
...
[webpack-cli] Compilation finished
asset vendors-node_modules_lodash_lodash_js.bundle.js 549 KiB [compared for emit] (id hint: vendors)
asset index.bundle.js 13.5 KiB [compared for emit] (name: index)
runtime modules 7.37 KiB 11 modules
cacheable modules 530 KiB
  ./src/index.js 434 bytes [built] [code generated]
  ./node_modules/lodash/lodash.js 530 KiB [built] [code generated]
webpack 5.4.0 compiled successfully in 268 ms
```

由于 import() 会返回一个 promise，因此它可以和 [async 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)一起使用。下面是如何通过 async 函数简化代码：

src/index.js:
``` js
-function getComponent() {
+async function getComponent() {
+   const element = document.createElement('div');
+  const { default: _ } = await import('lodash');

_  return import('lodash')
_    .then(({ default: _ }) => {
      const element = document.createElement('div');
+  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

-      element.innerHTML = _.join(['Hello', 'webpack'], ' ');

-      return element;
-    })
-    .catch((error) => 'An error occurred while loading the component');
+  return element;
 }

 getComponent().then((component) => {
   document.body.appendChild(component);
 });
```
> Tip
> 
>在稍后示例中，可能会根据计算后的变量(computed variable)导入特定模块时，可以通过向 import() 传入一个 动态表达式。

### 预获取/预加载(prefetch/preload module)
webpack v4.6.0+ 增加了对预获取和预加载的支持。

在声明 import 时，使用下面这些内置指令，可以让 webpack 输出 "resource hint(资源提示)"，来告知浏览器：
- **prefetch(预获取)**：将来某些导航下可能需要的资源
- **preload(预加载)**：当前导航下可能需要资源

下面这个 prefetch 的简单示例中，有一个 `HomePage` 组件，其内部渲染一个 `LoginButton` 组件，然后在点击后按需加载 `LoginModal` 组件。

LoginButton.js
``` js
import(/*webpackPrefetch: true*/ './path/to/LoginModal.js');
```
这会生成 `<link rel="prefetch" href="login-modal-chunk.js">` 并追加到页面头部，指示着浏览器在闲置时间预取 `login-modal-chunk.js` 文件。

> Tip
>
> 只要父 chunk 完成加载，webpack 就会添加 prefetch hint(预取提示)。

与 prefetch 指令相比，preload 指令有许多不同之处：
- preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。
- preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
- preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。
- 浏览器支持程度不同。

下面这个简单的 preload 示例中，有一个 `Component`，依赖于一个较大的 library，所以应该将其分离到一个独立的 chunk 中。

我们假想这里的图表组件 `ChartComponent` 组件需要依赖一个体积巨大的 `ChartingLibrary` 库。它会在渲染时显示一个 `LoadingIndicator(加载进度条)` 组件，然后立即按需导入 `ChartingLibrary`：

ChartComponent.js:
``` js
import(/*webpackPreload: true*/ 'ChartingLibrary');
```

在页面中使用 `ChartComponent` 时，在请求 ChartComponent.js 的同时，还会通过 `<link rel="preload">` 请求 charting-library-chunk。假定 page-chunk 体积很小，很快就被加载好，页面此时就会显示 `LoadingIndicator(加载进度条)` ，等到 `charting-library-chunk` 请求完成，LoadingIndicator 组件才消失。启动仅需要很少的加载时间，因为只进行单次往返，而不是两次往返。尤其是在高延迟环境下。

> Tip
>
> 不正确地使用 webpackPreload 会有损性能，请谨慎使用。

### bundle分析(bundle analyze)
一旦开始分离代码，一件很有帮助的事情是，分析输出结果来检查模块在何处结束。 [官方分析工具](https://github.com/webpack/analyse) 是一个不错的开始。还有一些其他社区支持的可选项：
- [webpack-chart](https://alexkuz.github.io/webpack-chart/): webpack stats 可交互饼图。
- [webpack-visualizer](https://chrisbateman.github.io/webpack-visualizer/): 可视化并分析你的 bundle，检查哪些模块占用空间，哪些可能是重复使用的。
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)：一个 plugin 和 CLI 工具，它将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式。
- [webpack bundle optimize helper](https://webpack.jakoblind.no/optimize)：这个工具会分析你的 bundle，并提供可操作的改进措施，以减少 bundle 的大小。
- [bundle-stats](https://github.com/relative-ci/bundle-stats)：生成一个 bundle 报告（bundle 大小、资源、模块），并比较不同构建之间的结果。
