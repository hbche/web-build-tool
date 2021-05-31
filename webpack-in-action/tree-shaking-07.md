## Tree Shaking

*tree shaking* 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码(dead-code)。它依赖于 ES2015 模块系统中的静态结构特性，例如 import 和 export。这个术语和概念实际上是兴起于 ES2015 模块打包工具 [rollup](https://rollupjs.org/guide/en/)。

新的 webpack 4 正式版本，扩展了这个检测能力，通过 package.json 的 "sideEffects" 属性作为标记，向 compiler 提供提示，表明项目中的哪些文件是 "pure(纯的 ES2015 模块)"，由此可以安全地删除文件中未使用的部分。

### 添加一个通用模块

在我们的项目中添加一个新的通用模块文件 src/math.js，此文件导出两个函数：

project:
```
webpack-demo
|- package.json
|- webpack.config.js
|- /dist
  |- bundle.js
  |- index.html
|- /src
  |- index.js
+ |- math.js
|- /node_modules
```

src/math.js
``` js
export function square(x) {
  return x * x;
}

export function cube(x) {
  return x * x * x;
}
```
需要将`mode`设置成`development`，以确定bundle不会被压缩：

webpack.config.js:
``` js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
 mode: 'development',
+ optimization: {
+   usedExports: true,
+ },
};
```

配置完这些后，更新入口脚本，使用其中一个新方法，并且为了简单，将 `lodash` 删除：

src/index.js:
``` js
- import _ from 'lodash';
+ import { cube } from './math.js';

  function component() {
-   var element = document.createElement('div');
+   var element = document.createElement('pre');

-   // lodash 是由当前 script 脚本 import 导入进来的
-   element.innerHTML = _.join(['Hello', 'webpack'], ' ');
+   element.innerHTML = [
+     'Hello webpack!',
+     '5 cubed is equal to ' + cube(5)
+   ].join('\n\n');

    return element;
  }

  document.body.appendChild(component());
```

注意，我们**并未从 `src/math.js` 模块中 `import` 导入 `square` 方法**。这个功能是所谓的“未引用代码(dead code)”，也就是说，应该删除掉未被引用的 export。现在让我们运行我们的npm 脚本 npm run build，并检查输出的 bundle：

dist/bundle.js (around lines 90 - 100)
``` js
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export square */
/* harmony export (immutable) */ __webpack_exports__["a"] = cube;
function square(x) {
  return x * x;
}

function cube(x) {
  return x * x * x;
}
```

注意，上面的 `unused harmony export square` 注释。如果你看下面的代码，你会注意到 `square` 没有被导入，但是，它仍然被包含在 bundle 中。我们将在下一节中解决这个问题。

### 将文件标记为无副作用 [side-effect-tree]

在一个纯粹的 ESM 模块世界中，识别出哪些文件有副作用很简单。然而，我们的项目无法达到这种纯度，所以，此时有必要向 webpack 的 compiler 提供提示哪些代码是“纯粹部分”。

这种方式是通过 package.json 的 `"sideEffects"` 属性来实现的。

``` json
{
  "name": "your-project",
  "sideEffects": false
}
```

如同上面提到的，如果所有代码都不包含副作用，我们就可以简单地将该属性标记为 `false`，来告知 webpack，它可以安全地删除未用到的 export 导出。

> *「副作用」的定义是，在导入时会执行特殊行为的代码，而不是仅仅暴露一个 export 或多个 export。举例说明，例如 polyfill，它影响全局作用域，并且通常不提供 export。*

如果你的代码确实有一些副作用，那么可以改为提供一个数组：
``` package.json
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js"
  ]
}
```

数组方式支持相关文件的相对路径、绝对路径和 glob 模式。它在内部使用  [glob-to-regexp](https://github.com/fitzgen/glob-to-regexp)（支持：*，**，{a,b}，[a-z]）。如果匹配模式为 *.css，且不包含 /，将被视为 **/*.css。
> *注意，任何导入的文件都会受到 tree shaking 的影响。这意味着，如果在项目中使用类似 css-loader 并导入 CSS 文件，则需要将其添加到 side effect 列表中，以免在生产模式中无意中将它删除：*
``` js
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js",
    "*.css"
  ]
}
```
最后还可以在 [module.rules](https://webpack.docschina.org/configuration/module/#module-rules) 配置选项 中设置 "sideEffects"。

### 解释 tree shaking 和 sideEffects
[sideEffects](https://webpack.docschina.org/configuration/optimization/#optimizationsideeffects) 和 [usedExports](https://webpack.docschina.org/configuration/optimization/#optimizationusedexports)（更多被认为是 tree shaking）是两种不同的优化方式。

`sideEffects` 更为有效 是因为它允许跳过整个模块/文件和整个文件子树。

`usedExports` 依赖于 `terser` 去检测语句中的副作用。它是一个 JavaScript 任务而且没有像 `sideEffects` 一样简单直接。而且它不能跳转子树/依赖由于细则中说副作用需要被评估。尽管导出函数能运作如常，但 `React` 框架的高阶函数（HOC）在这种情况下是会出问题的。

让我们来看一个例子：
``` js
import { Button } from '@shopify/polaris';
```

### 将函数标记为无副作用

是可以告诉 webpack 一个函数调用是无副作用的，只要通过 `/*#__PURE__*/` 注释。它可以被放到函数调用之前，用来标记它们是无副作用的(pure)。传到函数中的入参是无法被刚才的注释所标记，需要单独每一个标记才可以。如果一个没被使用的变量定义的初始值被认为是无副作用的（pure），它会被标记为死代码，不会被执行且会被压缩工具清除掉。这个行为被会开启当 `optimization.innerGraph` 被设置成 `true`。

file.js
``` js
/*#__PURE__*/ double(55);
```

### 压缩输出

通过如上方式，我们已经可以通过 `import` 和 `export` 语法，找出那些需要删除的“未使用代码(dead code)”，然而，我们不只是要找出，还需要在 bundle 中删除它们。为此，我们将使用 -p(production) 这个 webpack 编译标记，来启用 uglifyjs 压缩插件。

> *注意，--optimize-minimize 标记也会在 webpack 内部调用 UglifyJsPlugin。*

从 webpack 4 开始，也可以通过 `"mode"` 配置选项轻松切换到压缩输出，只需设置为 `"production"`。

webpack.config.js
``` js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
- }
+ },
+ mode: "production"
};
```

> *注意，也可以在命令行接口中使用 --optimize-minimize 标记，来使用 UglifyJSPlugin。*

准备就绪后，然后运行另一个命令 `npm run build`，看看输出结果有没有发生改变。

你发现 `dist/bundle.js` 中的差异了吗？显然，现在整个 bundle 都已经被精简过，但是如果仔细观察，则不会看到 `square` 函数被引入，但会看到 `cube` 函数的修改版本`（function r(e){return e*e*e}n.a=r）`。现在，随着 tree shaking 和代码压缩，我们的 bundle 减小几个字节！虽然，在这个特定示例中，可能看起来没有减少很多，但是，在具有复杂的依赖树的大型应用程序上运行时，tree shaking 或许会对 bundle 产生显著的体积优化。

> Tip
>
> 在使用 tree shaking 时必须有 [ModuleConcatenationPlugin](https://webpack.docschina.org/plugins/module-concatenation-plugin/) 的支持，您可以通过设置配置项 mode: "production" 以启用它。如果您没有如此做，请记得手动引入 ModuleConcatenationPlugin。

### 结论

你可以将应用程序想象成一棵树。绿色表示实际用到的源码和 library，是树上活的树叶。灰色表示无用的代码，是秋天树上枯萎的树叶。为了除去死去的树叶，你必须摇动这棵树，使它们落下。学会使用 tree shaking，你必须
- 使用 ES2015 模块语法（即 `import` 和 `export`）。
- 确保没有编译器将您的 ES2015 模块语法转换为 CommonJS 的（顺带一提，这是现在常用的 @babel/preset-env 的默认行为，详细信息请参阅文档）。
- 在项目 `package.json` 文件中，添加一个 "sideEffects" 入口。
- 引入一个能够删除未引用代码(dead code)的压缩工具(minifier)（例如 `UglifyJSPlugin`）。