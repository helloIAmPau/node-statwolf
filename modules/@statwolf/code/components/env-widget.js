import { window, StatusBarAlignment, commands } from 'vscode';

export default function({ state, context }) {
    let list = [];

    const widget = window.createStatusBarItem(StatusBarAlignment.Right, 1000);
    context.subscriptions.push(widget);
    widget.text = '$(account) Loading...';

    const command = commands.registerCommand('statwolf.selectEnv', function() {
        window.showQuickPick(list).then(function(selected) {
            const index = list.indexOf(selected);

            state.setState(function(current) {
                return {
                    ...current,
                    currentEnv: index
                };
            });
        });
    });
    context.subscriptions.push(command);
    widget.command = 'statwolf.selectEnv';

    const subscription = state.subscribe(function({ config: { hosts }, state: { currentEnv } }) {
        widget.text = `$(account) ${ hosts[currentEnv] || 'Invalid host. Check configuration' }`;
        list = hosts;
    });
    context.subscriptions.push(subscription);

    widget.show();
}