import _ from 'lodash';
import Print from './print';

function component() {
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack!'], ' ');
    element.classList.add('hello');

    const button = document.createElement('button');
    button.innerHTML = 'Click me and watch console!';
    button.onclick = Print.bind(null, 'Hello webpack!');
    element.appendChild(button);

    return element;
}

document.body.appendChild(component());