import envWidget from "./components/env-widget";
import push from './components/push';
import exec from './components/exec';

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
    
    const input = {
        state,
        context,
        log
    };

    push(input);
    exec(input);
    envWidget(input);
};

const deactivate = function() {};

module.exports = {
    activate,
    deactivate
}