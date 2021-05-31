import _ from 'lodash';

function getComponent() {
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack!'], ' ');

    const br = document.createElement('br');
    const button = document.createElement('button');
    element.appendChild(br);
    element.appendChild(button);

    button.innerHTML = 'Click me and look at the console!';
    // 请注意，由于涉及网络请求，因此需要在生产级站点/应用程序中显示一些加载指示。
    button.onclick = (e) => {
        import('./print').then(module => {
            let print = module.print;
            print();
        });
    }

    return element;
}

document.body.appendChild(getComponent());