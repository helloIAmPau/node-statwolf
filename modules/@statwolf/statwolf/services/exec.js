import http, { createController } from '../http';
import babel from '@statwolf/babel';

export const abortController = function() {
  return createController();
};

export default function({ code, host, abortController }) {
  const client = http(host, { controller: abortController });

  return babel(code).then(function({ code }) {
    return client('InvokeConsole', {
      command: code
    });
  });
};
