import { window } from 'vscode';

export default function() {
    const channel = window.createOutputChannel("Statwolf");

    const log = function(message) {
        if(typeof(message) !== 'string') {
            message = JSON.stringify(message);
        }

        channel.appendLine(message);
    };

    return { log };
}