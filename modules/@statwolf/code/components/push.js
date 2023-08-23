import { bundle } from '@statwolf/statwolf';
import { commands, workspace } from 'vscode';
import { dirname, sep, join } from 'path';
import debounce from 'debounce';

export default function({ state, context, log, viewProvider, notify }) {
    let host = null;
    let project = null;
    let isPushing = false;

    const push = function({ input, drop }) {
        if(isPushing === true) {
            log('Already pushing. Skipping...');

            return;
        }

        if(host == null) {
            log('Invalid host. Check configuration');

            return;
        }

        isPushing = true;
        viewProvider.setSpin(isPushing);

        bundle({
            input,
            drop,
            host,
            project
        }).then(function(result) {
            const message = `${ Object.keys(result.Data).length } file pushed`;
            
            log(message);
            notify(message);
            viewProvider.setError(undefined);
        }).catch(function({ message }) {
            log(message);
            notify(message, 'error');
            viewProvider.setError(message);
        }).finally(function() {
            isPushing = false;
            viewProvider.setSpin(isPushing);
        });
    };

    const subscription = state.subscribe(function({ config: { hosts, project: projectPath }, state: { currentEnv } }) {
        host = hosts[currentEnv];
        project = projectPath;
    });
    context.subscriptions.push(subscription);

    const fullPushCommand = commands.registerCommand('statwolf.fullPush', function() {
        log('Pushing full codebase...');

        push({
            input: [ 'Statwolf' ],
            drop: true
        });
    });
    context.subscriptions.push(fullPushCommand);

    const pushFolder = function(fileName) {
        if(fileName.startsWith(project) === false) {
            return;
        }

        const file = dirname(fileName.replace(project, 'Statwolf'));

        log(`Pushing ${ file }...`);

        push({
            input: [ file ],
            drop: false
        });
    };

    const pushFolderCommand = commands.registerCommand('statwolf.pushFolder', function(context) {
        if(context == null) {
            log('Command runs only from project explorer');

            return;
        }
       
        const { path } = context;
        pushFolder(path);
    });
    context.subscriptions.push(pushFolderCommand);

    const filePush = workspace.onDidSaveTextDocument(debounce(function({ fileName, uri }) {
        if(uri.scheme !== 'file') {
            return;
        }

        pushFolder(fileName);
    }, 500));
    context.subscriptions.push(filePush);
    
}