/**
 * Webpack 打包入口文件
 */
// console.log('Hello Webpack');
// import data from './data.json';
// console.log(data);

// 引入样式文件
import './css/main.css';

// 引入scss
import './css/main.scss';

// 引入less
import './css/main.less';

// 引入@babel/polyfill对多有ES新语法进行转义
// polyfill会转义所有的ES新语法，引入了大量的垃圾转义，导致JS打包体积大，一般采用corejs对ES新语法进行按需转义
// import '@babel/polyfill'

const showMsg = () => {
  // eslint-disable-next-line
  alert('Hello');
};

// eslint-disable-next-line
window.showMsg = showMsg;

const p = new Promise((resolve) => {
  console.log('Promise is init');
  setTimeout(() => {
    resolve();
    console.log('Promise is working');
  }, 3000);
});
p.then(() => {
  console.log('Promise is resolved');
});
