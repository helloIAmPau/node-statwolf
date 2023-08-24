import page from './index.html';
import { window, Uri } from 'vscode';
import { compiler } from '@statwolf/handlebars';

class ViewProvider {
    constructor({ log, context }) {
        this._log = log;
        this._context = context;
    }

    setRetult(data) {
        this._data = data;

        if(this._panel == null) {
            return;
        }

        const { webview } = this._panel;
        webview.postMessage({
            type: 'result',
            data
        });
    }

    setSpin(spin) {
        this._spin = spin;

        if(this._panel == null) {
            return;
        }

        const { webview } = this._panel;
        webview.postMessage({
            type: 'spin',
            spin
        });
    }

    setError(error) {
        this._error = error;

        if(this._panel == null) {
            return;
        }

        const { webview } = this._panel;
        webview.postMessage({
            type: 'error',
            error
        });
    }

    resolveWebviewView(panel) {
        this._panel = panel;
        const { webview } = panel;

        webview.options = {
            enableScripts: true,
            enableFindWidget: true
        };

        webview.html = compiler(page, {
            app_js: webview.asWebviewUri(Uri.joinPath(this._context.extensionUri, 'media', 'assets', 'app.js')),
            styles_css: webview.asWebviewUri(Uri.joinPath(this._context.extensionUri, 'media', 'assets', 'styles.css')),
            hljs_js: webview.asWebviewUri(Uri.joinPath(this._context.extensionUri, 'media', 'assets', 'hljs', 'highlight.min.js')),
            hljs_css: webview.asWebviewUri(Uri.joinPath(this._context.extensionUri, 'media', 'assets', 'hljs', 'default.min.css')),
            hljs_javascript_js: webview.asWebviewUri(Uri.joinPath(this._context.extensionUri, 'media', 'assets', 'hljs', 'javascript.min.js'))
        });

        panel.onDidChangeVisibility(() => {
            if(panel.visible === false) {
                return;
            }

            if(this._data != null) {
                webview.postMessage({
                    type: 'result',
                    data: this._data
                });
            }

            if(this._spin != null) {
                webview.postMessage({
                    type: 'spin',
                    spin: this._spin
                });
            }

            if(this._error != null) {
                webview.postMessage({
                    type: 'error',
                    error: this._error
                });
            }
        });
    }
}

export default function({ log, context }) {
    const viewProvider = new ViewProvider({ log, context });
	const webview = window.registerWebviewViewProvider('statwolf-execute-panel', viewProvider);
    context.subscriptions.push(webview);

    return viewProvider;
};