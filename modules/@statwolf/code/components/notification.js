import { window } from 'vscode';

export default function({ state, context, log }) {
    let show = true;

    const subscription = state.subscribe(function({ config: { showNotifications } }) {
        show = showNotifications;
        log(`Notification status: ${ show }`);
    });
    context.subscriptions.push(subscription);   

    return function(message, type) {
        if(show === false) {
            return;
        }
        
        if(type === 'error') {
            window.showErrorMessage(message);
    
            return;
        }
    
        window.showInformationMessage(message);
    };
}