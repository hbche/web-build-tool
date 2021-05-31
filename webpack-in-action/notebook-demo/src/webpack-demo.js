
// 导入CSS样式
import './index.css';

// 导入图片资源
import LogoData from './logo.png';
import WebpackIcon from './webpack.png';

import printMe from './print';

function component() {
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'Webpack'], ' ');
    element.classList.add('hello');

    const img = new Image();
    // img.src = LogoData
    img.src = WebpackIcon;
    element.appendChild(img);

    const btn = document.createElement('button');
    btn.innerHTML = 'Click me and check the console!';
    btn.addEventListener('click', printMe);
    element.appendChild(btn);

    return element;
}

// document.body.appendChild(component());
let element = component();
document.body.appendChild(element);

// 修改index.js，便于在print.js文件发生更新时告诉webpack接收更新的模块
if (module.hot) {
    module.hot.accept('./print.js', function() {
        console.log('Accepting the updated printMe module!');
        // printMe();
        // 移除旧的element数据
        document.body.removeChild(element);
        // 重新生成element，重新绑定printMe监听处理函数
        element = component();
        document.body.appendChild(element);
    });
}