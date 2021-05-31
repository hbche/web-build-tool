const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // entry: {
    //     app: './src/index.js',
    //     another: './src/another-module.js'
    // },
    // entry: {
    // app: {
    //     import: './src/index.js',
    //     dependOn: 'shared-lodash',
    // },
    // another: {
    //     import: './src/another-module.js',
    //     dependOn: 'shared-lodash',
    // },
    // 'shared-lodash': 'lodash',
    // }
    // entry: [
    //     './src/index.js',
    //     './src/another-module.js'
    // ],
    entry: {
        app: './src/index.js',
        // another: './src/another-module.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        // 每次编译时，清空dist目录
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Code Splitting'
        }),
    ],
    // 生成独立的runtime.bundle.js
    // optimization: {
    //     // runtimeChunk: 'single',
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
    mode: 'development'
}