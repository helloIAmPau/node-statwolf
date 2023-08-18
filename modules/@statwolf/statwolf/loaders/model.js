import { resolve } from 'path';

export default function({ split, json, folder, name, servicePath, resolvePath }) {
  const modelPath = resolvePath({ folder, name, extension: '.json' });

  return json(modelPath).then(function(model) {
    return {
      ...model,
      ServicePointer: split(model.ServicePointer)
    };
  });
};
