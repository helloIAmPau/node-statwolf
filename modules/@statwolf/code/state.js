import { EventEmitter } from 'events';
import { workspace } from 'vscode';

const STATWOLF_GLOBAL_STATE_KEY = 'fewljbfeklwnfi23hyriofn238904ni1uerj9123jr9023j1q302jrm2390jrt';

export default function({ context, log }) {
    const _ee = new EventEmitter();

    let _state = null;

    const reload = function() {
        const config = workspace.getConfiguration('statwolf');
        const state = context.globalState.get(STATWOLF_GLOBAL_STATE_KEY, {
            currentEnv: 0
        });

        _state = {
            config,
            state
        }

        log(_state);

        _ee.emit('change', _state);
    };

    const handler = workspace.onDidChangeConfiguration(function(evt) {
        if(evt.affectsConfiguration('statwolf') === false) {
            return;
        }

        reload();
    });
    context.subscriptions.push(handler);

    const subscribe = function(handler) {
        _ee.on('change', handler);
    
        return function() {
            _ee.removeListener('change', handler);
        };
    };

    const setState = function(factory) {
        const newState = factory(_state.state);

        if(_state.state === newState) {
            return;
        }

        context.globalState.update(STATWOLF_GLOBAL_STATE_KEY, newState);
        reload();
    };

    setTimeout(function() {
        reload();
    });
    
    return {
        setState,
        subscribe
    };
};