import { resolve } from 'path';
import { readdir } from 'fs/promises';

export default function({ project }) {
  const basePath = resolve(project, 'Templates');

  return readdir(basePath).then(function(items) {
    return items.map(function(item) {
      return {
        name: item.match(/[A-Za-z0-9][a-z0-9]*/g).join(' ').toLowerCase(),
        location: resolve(project, 'Templates', item)
      };
    });
  });
};
