import page from './index.html';
import { window } from 'vscode';

export default class ViewProvider {
    constructor({ log, context }) {
        this._log = log;
        this._context = context;
    }

    setRetult(data) {
        this._data = data;

        if(this._panel == null) {
            return;
        }

        this._panel.show();
        const { webview } = this._panel;
        webview.postMessage({
            type: 'result',
            data
        });
    }

    resolveWebviewView(panel) {
        this._panel = panel;
        const { webview } = panel;

        webview.options = {
            enableScripts: true
        };

        webview.html = page;

        panel.onDidChangeVisibility(() => {
            if(panel.visible === false) {
                return;
            }

            if(this._data == null) {
                return;
            }

            webview.postMessage({
                type: 'result',
                data: this._data
            });
        });
    }
}