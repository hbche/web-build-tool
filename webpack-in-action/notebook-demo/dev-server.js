const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

const config = require('./webpack.config');
const options = {
    // 告诉webpack资源的根目录
    contentBase: './dist',
    // 开启热更新
    hot: true,
    host: 'localhost'
}

// 设置入口和devServer相关配置
webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(5000, 'localhost', () => {
    console.log('dev server listening on port 5000');
});
