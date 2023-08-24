import { window, StatusBarAlignment, commands } from 'vscode';

export default function({ state, context, log }) {
    let list = [];

    const subscription = state.subscribe(function({ config: { hosts }, state: { currentEnv } }) {
        widget.text = `$(account) ${ (hosts[currentEnv] || 'Invalid host. Check configuration').replace(/\:[a-z0-9].+\@/i, ':***@') }`;
        list = hosts;
    });
    context.subscriptions.push(subscription);

    const widget = window.createStatusBarItem(StatusBarAlignment.Right, 1000);
    context.subscriptions.push(widget);
    widget.text = '$(account) Loading...';

    const command = commands.registerCommand('statwolf.selectEnv', function() {
        window.showQuickPick(list, {
            title: 'Select environment'
        }).then(function(selected) {
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

    widget.show();
}