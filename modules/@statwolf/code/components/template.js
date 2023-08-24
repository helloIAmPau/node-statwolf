import { listTemplate, template } from "@statwolf/statwolf";
import { window, commands } from 'vscode';
import path from '../path';

export default function({ state, context, log }) {
    let project = null;

    const subscription = state.subscribe(function({ config: { project: projectPath } }) {
        project = path(projectPath);
    });
    context.subscriptions.push(subscription);

    const createTemplateCommand = commands.registerCommand('statwolf.createTemplate', function(context) {
        if(context == null) {
            log('Command runs only from project explorer');

            return;
        }

        const { fsPath } = context;

        listTemplate({ project }).then(function(list) {
            window.showQuickPick(list.map(function({ name }) {
                return name;
            }), {
                title: 'Select Template',
                step: 1,
                totalSteps: 2
            }).then(function(type) {
                return window.showInputBox({
                    title: 'Insert Name',
                    step: 2,
                    totalSteps: 2
                }).then(function(name) {
                    const input = {
                        project,
                        folder: fsPath.replace(project, 'Statwolf'),
                        type,
                        name
                    };
                    
                    return template(input);
                });
            });
        });
    });
    context.subscriptions.push(createTemplateCommand);
}