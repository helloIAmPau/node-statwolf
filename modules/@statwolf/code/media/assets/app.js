(function() {
    const vscode = acquireVsCodeApi();

    const wrapper = document.querySelector('.wrapper');
    const rotateButton = document.querySelector('#rotate-button');
    const resultBox = document.querySelector('#result-box');
    const logBox = document.querySelector('#log-box');
    const resultPre = document.querySelector('#result-pre');
    const logPre = document.querySelector('#log-pre');
    const resultCopyButton = document.querySelector('#result-copy-button');
    const logCopyButton = document.querySelector('#log-copy-button');
    const resultFullscreenButton = document.querySelector('#result-fullscreen-button');
    const logFullscreenButton = document.querySelector('#log-fullscreen-button');
    const errorIcon = document.querySelector('#error');
    const spinner = document.querySelector('#spinner');

    const fullscreen = function(box, toHide) {
        if(toHide.classList.contains('hide') === true) {
            toHide.classList.remove('hide');
            box.classList.remove('full');
        } else {
            toHide.classList.add('hide');
            box.classList.add('full');
        }
    };

    logFullscreenButton.onclick = function() {
        fullscreen(logBox, resultBox);
    };

    resultFullscreenButton.onclick = function() {
        fullscreen(resultBox, logBox);
    };

    const copy = function(pre) {
        navigator.clipboard.writeText(pre.textContent);
    };

    logCopyButton.onclick = function() {
        copy(logPre);
    };

    resultCopyButton.onclick = function() {
        copy(resultPre);
    };

    rotateButton.onclick = function() {
        const previousState = vscode.getState() || {};
        const newState = { ...previousState, rotate: !previousState.rotate };
        vscode.setState(newState);
        render(newState);
    };

    const render = function({ data, rotate, spin, error }) {
        console.log({
            data,
            rotate,
            spin,
            error
        });
        if(data != null) {
            if(data.Data.Exceptions != null) {
                resultPre.textContent = data.Data.Exceptions.map(function({ message, stack }) {
                    return stack;
                }).join('\n');
                logPre.textContent = '';
            } else {
                
                resultPre.innerHTML = typeof(data.Data.result) === 'string' ? data.Data.result : hljs.highlight(JSON.stringify(data.Data.result, null, 2), {
                    language: 'javascript'
                }).value;
                logPre.textContent = data.Data.logs.map(function({ msg }) {
                    return msg;
                }).join('\n');
            }
        }

        if(rotate === true) {
            wrapper.classList.add('row-direction');
            resultBox.classList.add('rotate-box');
            logBox.classList.add('rotate-box');
        } else {
            wrapper.classList.remove('row-direction');
            resultBox.classList.remove('rotate-box');
            logBox.classList.remove('rotate-box');
        }

        if(spin === true) {
            spinner.classList.remove('hide');
        } else {
            spinner.classList.add('hide');
        }

        if(error != null && spin !== true) {
            errorIcon.classList.remove('hide');
            errorIcon.title = error;
        } else {
            errorIcon.classList.add('hide');
        }
    }

    window.addEventListener('message', function({ data: { type, data, spin, error } }) {
        const previousState = vscode.getState() || {};

        if(type === 'result') {
            const newState = { ...previousState, data };
            vscode.setState(newState);
            render(newState);
            
            return;
        }

        if(type === 'spin') {
            const newState = { ...previousState, spin };
            vscode.setState(newState);
            render(newState);
            
            return;
        }

        if(type === 'error') {
            const newState = { ...previousState, error };
            vscode.setState(newState);
            render(newState);
            
            return;
        }
    });

    const previousState = vscode.getState() || {};
    render(previousState);
})();