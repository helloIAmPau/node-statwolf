import { commands, window, ThemeColor } from 'vscode';
import { exec } from '@statwolf/statwolf';

import ViewProvider from './view-provider';

export default function({ state, context, log }) {
    let host = null;
    let isExecuting = false;
    
    const subscription = state.subscribe(function({ config: { hosts }, state: { currentEnv } }) {
        host = hosts[currentEnv];
    });
    context.subscriptions.push(subscription);

    const viewProvider = new ViewProvider({ log, context });
	const execProvider = window.registerWebviewViewProvider('statwolf-execute-panel', viewProvider, {
        retainContextWhenHidden: true
    });
    context.subscriptions.push(execProvider);

    const execCommand = commands.registerTextEditorCommand('statwolf.execute', function({ document }) {
        if(isExecuting === true) {
            log('Already executing. Skipping...');

            return;
        }

        if(host == null) {
            log('Invalid host. Check configuration');

            return;
        }

        isExecuting = true;

        const code = document.getText();

        exec({
            code,
            host
        }).then(function(result) {
            viewProvider.setRetult(result);
        }).catch(function(error) {
            log(error);
        }).finally(function() {
            isExecuting = false;
        });
    });
    context.subscriptions.push(execCommand);
}