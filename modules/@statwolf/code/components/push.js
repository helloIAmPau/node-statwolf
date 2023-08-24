import { bundle } from '@statwolf/statwolf';
import { commands, workspace } from 'vscode';
import { dirname } from 'path';
import debounce from 'debounce';
import path from '../path';
import { lstat } from 'fs/promises';

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
        project = path(projectPath);
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
        fileName = path(fileName);

        if(fileName.startsWith(project) === false) {
            return;
        }

        return lstat(fileName).then(function(info) {
            if(info.isDirectory() === false) {
                fileName = dirname(fileName);
            }
            
            const file = fileName.replace(project, 'Statwolf');

            log(`Pushing ${ file }...`);
    
            return push({
                input: [ file ],
                drop: false
            });
        });
    };

    const pushFolderCommand = commands.registerCommand('statwolf.pushFolder', function(context) {
        if(context == null) {
            log('Command runs only from project explorer');

            return;
        }
       
        const { fsPath } = context;
        pushFolder(fsPath);
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