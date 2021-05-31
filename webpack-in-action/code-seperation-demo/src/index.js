// import _ from 'lodash';

// function component() {
//     const element = document.createElement('div');
//     element.innerHTML = _.join(['Hello', 'webpack!'], ' ');
//     element.classList.add('hello');

//     return element;
// }

// document.body.appendChild(component());

async function getComponent() {
    const { default: _ } = await import('lodash');
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack!'], ' ');
    return element;
}

getComponent().then(element => {
    document.body.appendChild(element);
});