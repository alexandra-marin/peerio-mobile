import { when } from 'mobx';

function promiseWhen(functor, timeout) {
    return new Promise(resolve => {
        when(functor, () => resolve(functor()));
        if (timeout) setTimeout(resolve, timeout);
    });
}

export default { promiseWhen };
export { promiseWhen };
