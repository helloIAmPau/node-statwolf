import { readFile } from 'fs/promises';

export default function({ meta, folder, servicePath, name, deps, resolvePath }) {
  const { ScriptLanguage } = meta;

  return Promise.resolve().then(function() {
    if(ScriptLanguage === 'Python') {
      return '.py';
    }
  
    if(ScriptLanguage === 'Node') {
      return '.js';
    }
  
    if(ScriptLanguage === 'C#') {
      return '.csx';
    }

    if(ScriptLanguage === 'R') {
      return '.r';
    }

    throw new Error(`Invalid language ${ ScriptLanguage }`);
  }).then(function(extension) {
    const codePath = resolvePath({ folder, name, extension });

    return readFile(codePath, 'utf-8');
  }).then(function(code) {
     const data = {
       Body: code,
       Language: ScriptLanguage
     };

     return deps({ data, folder, name });
  });
};
