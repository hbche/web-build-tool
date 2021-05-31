const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    // entry: './src/index.js',
    // output: {
    //     path: path.resolve(__dirname, 'dist'),
    //     filename: 'main.js'
    // },
    // 多入口文件
    // entry: ['./src/index.js', './src/a.js'],
    entry: {
        // print: './src/print.js',
        app: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // filename: '[name].[hash].js'
        filename: '[name].bundle.js'
    },
    devtool: 'source-map',
    // 告诉webpack-dev-server在哪查找文件
    devServer: {
        contentBase: './dist',
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            }
        ]
    },
    resolve: {
        fallback: {
            util: require.resolve('util/')
        },
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: '管理输出',
        }),
        new CleanWebpackPlugin(),
        // new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    // optimization: {
    //     namedModules: true,
    // },
    mode: 'development'
}