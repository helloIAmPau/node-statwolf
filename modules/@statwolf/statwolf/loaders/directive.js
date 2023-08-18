import { readFile } from 'fs/promises';
import { log } from '../logger';

export default function({ deps, folder, name, code, resolvePath }) {
  return code({ folder, name }).then(function(Directive) {
    const data = {
      Directive,
      Tag: name
    };

    const templatePath = resolvePath({ folder, name, extension: '.template.html' });

    return readFile(templatePath, 'utf-8').catch(function(error) {
      if(error.code !== 'ENOENT') {
        throw error;
      }

      log(`${ templatePath } not found`);

      return undefined;
    }).then(function(Template) {
      data.Template = Template;

      return deps({ data, folder, name });
    });
  });
};
