import listTemplate from './list-template';
import { resolve, join } from 'path';
import { readdir, lstat, mkdir } from  'fs/promises';
import handlebars from '@statwolf/handlebars';

export default function({ folder, name, type, project }) {
  const basePath = resolve(project);

  return listTemplate({ project }).then(function(templates) {
    const info = templates.find(function({ name }) {
      return name === type;
    });

    if(info == null) {
      throw new Error(`Invalid template type ${ type }`);
    }

    const { location } = info;
    const destination = folder.replace('Statwolf', basePath);

    const traverse = function({ location, destination, projectPath }) {
      return readdir(location).then(function(list) {
        const promises = list.map(function(item) {
          const currentPath = resolve(location, item);
          const destinationPath = resolve(destination, item.replace(/\{\{\s*name\s*\}\}/g, name));

          return lstat(currentPath).then(function(info) {
            if(info.isDirectory() === true) {
              return mkdir(destinationPath, {
                recursive: true
              }).then(function() {
                return traverse({
                  location: currentPath,
                  destination: destinationPath,
                  projectPath: join(projectPath, item.replace(/\{\{\s*name\s*\}\}/g, name))
                });
              });
            }

            return handlebars(currentPath, destinationPath, {
              name,
              basePath: projectPath
            });
          });          
        });

        return Promise.all(promises);
      });
    };

    return traverse({ location, destination, projectPath: folder });
  });
};
