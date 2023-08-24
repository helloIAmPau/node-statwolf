import { readFile, writeFile } from 'fs/promises';
import handlebars from 'handlebars';
import { sep } from 'path';

export const compiler = function(code, data) {
  return handlebars.compile(code)(data);
};

handlebars.registerHelper('swPath', function(path) {
  return path.split(sep).join('.');
});

export default function(path, destination, data) {
  return readFile(path, 'utf-8').then(function(code) {
    return compiler(code, data);
  }).then(function(compiled) {
    return writeFile(destination, compiled, 'utf-8');
  });
};
