// import * as _ from 'lodash';
import { cube } from './math';

// import './index.css';

function component() {
    // const element = document.createElement('div');

    // element.innerHTML = _.join(['Hello', 'Webpack'], ' ');
    // element.classList.add('color');

    const element = document.createElement('pre');
    element.innerHTML = [
        'Hello webpack!',
        '5 cube is equal to ' + cube(5)
    ].join('\n\n');
    element.classList.add('color');

    return element;
}
document.body.appendChild(component());

// export { cube };