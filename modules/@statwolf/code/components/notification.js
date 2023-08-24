import { window } from 'vscode';

export default function() {
    return function(message, type, close) {        
        if(type === 'error') {
            window.showErrorMessage(message);
    
            return;
        }
    
        window.setStatusBarMessage(message, close);
    };
}