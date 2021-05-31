const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // filename: '[name].bundle.js',
        filename: '[name].[contenthash].js',
        clean: true,
    },
    module: {
        rules: [],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '缓存',
        }),
    ],
    devServer: {
        contentBase: './dist',
        hot: true,
    },
    devtool: 'inline-source-map',
    optimization: {
        // splitChunks: {
        //     chunks: 'all',
        // },
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                }
            }
        }
    },
    mode: 'development',
};