import { resolve } from 'path';
import http from '../http';
import compile from '../compile';
import exec from './exec';

export default function({ input, project, host, drop }) {
  const basePath = resolve(project);

  return compile({ input, basePath }).then(function(changes) {
    const client = http(host, { zip: true });

    return client('Publish', {
      delete_all: drop,
      changes
    });
  }).then(function(result) {
    const code = 'var key = `lastResourceUpdate_${$user.changesetName()}`; var res = $environment().set({ [key]: new Date() }); console.log(`Updated: ${ res }`); return res;';
 
    return exec({
      code,
      host
    }).then(function() {
      return result;
    });
  });
};
