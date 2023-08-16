export default function({ code, json, meta, folder, servicePath, name, deps, resolvePath }) {
  return code({ folder, name }).then(function(code) {
    const data = {
      Resolver: code
    };

    const bindingsPath = resolvePath({ folder, name, extension: '.bindings.json' });

    return json(bindingsPath).then(function(bindings) {
      Object.keys(bindings).forEach(function(key) {
        const workspace = bindings[key].split('.');

        data[key] = {
          Name: workspace.pop(),
          Workspace: workspace.join('.')
        };
      });

      return data;
    });
  });
};
