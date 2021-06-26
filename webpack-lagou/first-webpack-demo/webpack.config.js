const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
        new CssMinimizerPlugin()
    ],

    // 开发服务器配置
    devServer: {

    }
}