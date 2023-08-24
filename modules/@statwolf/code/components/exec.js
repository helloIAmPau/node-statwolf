import { commands } from 'vscode';
import { exec, abortController } from '@statwolf/statwolf';

export default function({ state, context, log, viewProvider, notify }) {
    let host = null;
    let isExecuting = false;
    let controller = null;
    
    const execute =  function(code) {
        if(isExecuting === true) {
            log('Already executing. Aborting previous command');
            controller.abort();
        }

        if(host == null) {
            log('Invalid host. Check configuration');

            return;
        }

        isExecuting = true;
        controller = abortController();
        viewProvider.setRetult({
            Success: true,
            Data: {
                result: 'Loading...',
                logs: [ { msg: 'Loading...' } ]
            }
        });

        const p = exec({
            code,
            host,
            abortController: controller
        }).then(function(result) {
            viewProvider.setRetult(result);
            isExecuting = false;
        }).catch(function({ message, stack, name }) {
            if(name === 'AbortError') {
                return;
            }

            log(message);
            viewProvider.setRetult({
                Success: true,
                Data: {
                    Exceptions: [ { message, stack } ]
                }
            });
            isExecuting = false;
        });

        notify('Executing code...', null, p);
    };

    const subscription = state.subscribe(function({ config: { hosts }, state: { currentEnv } }) {
        host = hosts[currentEnv];
    });
    context.subscriptions.push(subscription);

    const execCommandTab = commands.registerTextEditorCommand('statwolf.executeTab', function({ document }) {
        const code = `
        var result = (function() {
          ${ document.getText() }
        })();
      
        if(_.isPlainObject(result)) {
          result = [ result ];
        }
        if(_.isArray(result) && _.every(result, (i) => _.isPlainObject(i)))
          var parser = $compiler.service('Statwolf.Utils.CSVParser');
          result = parser.jsonToCsv(result, '\t');
      
      
        return result;
        `;

        execute(code);
    });
    context.subscriptions.push(execCommandTab);

    const execCommand = commands.registerTextEditorCommand('statwolf.execute', function({ document }) {
        const code = document.getText();

        execute(code);
    });
    context.subscriptions.push(execCommand);
}