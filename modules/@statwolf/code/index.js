import envWidget from "./components/env-widget";
import push from './components/push';
import exec from './components/exec';
import view from "./components/view";
import notification from "./components/notification";
import template from './components/template';

import { setDefaultLogger } from "@statwolf/statwolf";

import fetch from 'node-fetch';

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

import State from './state';
import Logger from './logger';

const activate = function(context) {
    const { log } = Logger();
    setDefaultLogger(log);

    const state = State({ context, log });
    const viewProvider = view({ context, log });
    const notify = notification();
    
    const input = {
        state,
        context,
        log,
        viewProvider,
        notify
    };

    template(input);
    push(input);
    exec(input);
    envWidget(input);
};

const deactivate = function() {};

module.exports = {
    activate,
    deactivate
}