const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

module.exports = {
    // 打包模式
    mode: 'development',
    // 入口文件
    entry: './src/index.js',
    // 出口配置
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },

    // 模块配置
    module: {
        rules: [
            {
                test: /\.m?js$/,
                // 排除node_modules目录中安装的三方包中的js文件
                exclude: /node_modules/,
                use:
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    // 按需加载
                                    useBuiltIns: 'usage',
                                    // // 指定corejs的版本
                                    corejs: 3,
                                    // 指定编译后的ES是运行在浏览器环境还是NodeJS环境下
                                    // targets: 'defaults'
                                    // 手动指定兼容浏览器的版本
                                    targets: {
                                        chrome: '58',
                                        ie: '9',
                                        firefox: '60',
                                        safari: '10',
                                        edge: '17'
                                    }
                                }
                            ]
                        ]
                    }
                },
            },
            {
                test: /\.less$/,
                use: [{
                    // loader: "style-loader" // creates style nodes from JS strings
                    loader: MiniCssExtractPlugin.loader,
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        // loader: "style-loader" // 将 JS 字符串生成为 style 节点
                        loader: MiniCssExtractPlugin.loader,
                    }, {
                        loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                    }, {
                        loader: 'postcss-loader'
                    }, {
                        loader: "sass-loader" // 将 Sass 编译成 CSS
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    // 通过postcss-loader给样式添加浏览器前缀
                    'postcss-loader'
                ]
            }
        ]
    },

    // 插件配置
    plugins: [
        // 实例化插件
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            insert: 'head'
        }),
        new StylelintWebpackPlugin({
            // 指定需要进行格式校验的文件
            files: ['src/css/*.{css,less,sass,scss}']
        }),
        // new OptimizeCssAssetsWebpackPlugin(),
        new CssMinimizerPlugin(),
        new HtmlWebpackPlugin({
            // 指定打包后的文件名称
            filename: 'index.html',
            // 用来指定生成HTML的模板
            template: 'src/index.html',
            // 指定HTML中的变量
            title: "Webpack Demo",
            h1: 'Hello Webpack ^_-'
        }),

        // 打包多个html文件
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
        }),
        new ESLintWebpackPlugin({
            // eslint自行解决格式报错
            fix: true
        })
    ],

    // 开发服务器配置
    devServer: {

    }
}