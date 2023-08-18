import http from '../http';
import babel from '@statwolf/babel';

export default function({ code, host }) {
  const client = http(host);

  return babel(code).then(function({ code }) {
    return client('InvokeConsole', {
      command: code
    });
  });
};
