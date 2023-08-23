import { commands, window, ThemeColor } from 'vscode';
import { exec } from '@statwolf/statwolf';

export default function({ state, context, log, viewProvider, notify }) {
    let host = null;
    let isExecuting = false;
    
    const subscription = state.subscribe(function({ config: { hosts }, state: { currentEnv } }) {
        host = hosts[currentEnv];
    });
    context.subscriptions.push(subscription);

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
        }).catch(function({ message, stack }) {
            log(message);
            viewProvider.setRetult({
                Success: true,
                Data: {
                    Exceptions: [ { message, stack } ]
                }
            });
        }).finally(function() {
            isExecuting = false;
        });
    });
    context.subscriptions.push(execCommand);
}