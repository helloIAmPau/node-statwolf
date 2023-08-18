import { readFile, readdir, lstat } from 'fs/promises';
import { sep, join, dirname } from 'path';
import loader from './loaders';

export default function({ input, basePath }) {
  const bundle = [];

  const traverse = function(input, basePath) {
    const promises = input.map(function(path) {
      const fullPath = path.replace('Statwolf', basePath);
  
      return lstat(fullPath).then(function(info) {
        if(info.isDirectory() === true) {
          return readdir(fullPath).then(function(content) {
            const newInput = content.map(function(item) {
              return join(path, item);
            });
  
            return traverse(newInput, basePath);
          });
        }

        if(fullPath.endsWith('.meta.json') === false) {
          return;
        }

        const servicePath = dirname(path);

        if(servicePath.startsWith(join('Statwolf', 'Templates', sep)) === true) {
          return;
        }

        if(servicePath.startsWith(join('Statwolf', 'Temp', sep)) === true) {
          return;
        }

        return readFile(fullPath).then(function(buffer) {
          const meta = JSON.parse(buffer);
          const folder = dirname(fullPath);

          const statwolfPath = servicePath.split(sep);
          const name = statwolfPath[statwolfPath.length - 1];
          
          return loader({
            meta,
            folder,
            servicePath,
            name
          }).then(function(data) {
            bundle.push({
              data: JSON.stringify(data),
              path: statwolfPath.join('.'),
              type: meta.ComponentType
            });
          });
        });
      });
    });

    return Promise.all(promises);
  };

  return traverse(input, basePath).then(function() {
    return bundle;
  });
};
