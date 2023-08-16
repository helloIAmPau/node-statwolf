import { resolve } from 'path';
import http from '../http';
import compile from '../compile';

export default function({ input, project, host, drop }) {
  const basePath = resolve(project);

  return compile({ input, basePath }).then(function(changes) {
    const client = http(host, { zip: true });

    return client('Publish', {
      delete_all: drop,
      changes
    });
  });
};
