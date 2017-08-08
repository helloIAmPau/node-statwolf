var _ = require('lodash');
var fs = require('fs');
var babel = require('statwolf-babel-preset');
var path = require('safe-win-path');
var config = require('./config.json');
var md5 = require('md5');

/**
 * compress.js
 *
 * This module implements the compress functionality for the code converter.
 * It is fed with an options object containing all the required keys:
 *
 * - changeset: a list of all the components that have to be compressed
 * - deletedset: a list of all the components that have to be deleted
 * - dir: the base directory containing the project to compress
 *
 * Before the actual compress operation starts, an ignore list is created,
 * so that every file that is not relevant with the Statwolf project will just
 * be ignored during the compression process.
 *
 * @param {object} options is the container for:
 *                 - changeset: an array of strings containing all the
 *                   components that have to be compressed
 *                 - deletedset: an array of strings containing all the
 *                   components that have to be deleted
 *                 - dir: a string representing the base directory of the
 *                   project to compress
 * @returns {object} an object that contains an array of compressed components
 **/
module.exports = function(options) {
  if (!options.changeset) {
    throw {
      name: 'ParamsError'
    };
  }

  if (!options.deletedset) {
    options.deletedset = [];
  }

  if (_.isString(options.changeset)) {
    options.changeset = JSON.parse(fs.readFileSync(options.changeset));
  }

  var bundle = {
    Items: []
  };

  var ignoreArray;

  try {
    const ignoreFile = path.join(options.dir, '.swignore');
    ignoreArray = fs.readFileSync(ignoreFile, 'utf8').split('\n').filter(function(e) {
      return e !== '' && e.indexOf('#') === -1;
    }).map(function(e) {
      e = e.trim();

      if (e.endsWith('/')) {
        e = '/' + e;
      } else {
        e = '^' + e.replace('*', '[0-9A-Za-z\\.\\-\\_]*') + '$';
      }

      var cacheDir = [path.sanitize(process.env.HOME || process.env.USERPROFILE), '.cconverter_cache'].join(path.sep);
      return e;
    });
  } catch (e) {
    ignoreArray = [];
  }

  ignoreArray.push('.swignore');

  Object.keys(config.base).forEach(function(key) {
    if ((typeof config.base[key]) !== 'string') {
      return;
    }

    ignoreArray.push('^[0-9A-Za-z\\.\\-\\_]*' + config.base[key] + '$');
  });

  console.log(ignoreArray);

  var toBeIgnored = function(element) {
    element = element.replace(new RegExp('\\' + path.sep, 'g'), '/');

    return ignoreArray.some(function(ignore) {
      if (ignore.endsWith('/')) {
        return element.startsWith(ignore);
      }
      return element.split('/').some(function(token, index, array) {
        if (index < array.length - 1) {
          token += path.sep;
        }

        return token.match(ignore) !== null;
      });
    });
  };

  var cacheDir = [path.sanitize(process.env.HOME || process.env.USERPROFILE), '.cconverter_cache'].join(path.sep);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  var cachedBabel = function(code) {
    var key = path.join(cacheDir, md5(code));

    if(!fs.existsSync(key)) {
      fs.writeFileSync(key, babel(code));
    }

    return fs.readFileSync(key);
  };

  var loadFile = function(elementPath) {
    var code = fs.readFileSync(elementPath, 'utf8');

    try {
      if (elementPath.endsWith('.js')) {
        code = '/* */\n' + cachedBabel(code);
      }
    } catch (e) {
      e.filename = elementPath;
      throw e;
    }

    return code;
  }

  options.changeset.forEach(function(element) {
    if (toBeIgnored(element)) {
      return;
    }

    console.log('ADDED: ' + element);

    var node = {
      Serialized: {}
    };

    var elementPath = element.split('.')[0];
    element = options.dir + element;
    var pathArray = elementPath.split(path.sep);
    elementPath = options.dir + elementPath;

    node.Workspace = pathArray.slice(0, pathArray.length - 2).filter(function(i) {
      return i != null && i !== '';
    }).join('.');

    node.Name = pathArray[pathArray.length - 1];

    var meta = JSON.parse(fs.readFileSync(elementPath + config.base.metaExtension));
    node.ComponentType = meta.ComponentType;

    var nodeCfg = config[node.ComponentType];

    if (nodeCfg.coreFetcher) {
      node.Serialized[nodeCfg.coreFetcher] = loadFile(element);
    } else {
      node.Serialized = loadFile(element);
    }

    if (nodeCfg.hasBindings) {
      var bindings = JSON.parse(fs.readFileSync(elementPath + config.base.bindExtension));
      Object.keys(bindings).forEach(function(key) {
        var pathArray = bindings[key].split('.');
        node.Serialized[key] = {
          Name: pathArray[pathArray.length - 1],
          Workspace: pathArray.slice(0, -1).join('.')
        };
      });
    }

    if (nodeCfg.hasDependencies) {
      node.Serialized.Dependencies = {};
      var deps = JSON.parse(fs.readFileSync(elementPath + config.base.depsExtension));
      _.forIn(deps, function(value, key) {
        var workspace = value.split('.');
        var name = workspace.pop();
        node.Serialized.Dependencies[key] = {
          Workspace: workspace.join('.'),
          Name: name
        };
      });
    }

    if (!nodeCfg.extension) {
      node.Serialized.Language = meta.ScriptLanguage;
    }

    if (nodeCfg.hasTemplate) {
      try {
        node.Serialized.Template =
          loadFile(elementPath + config.base.templateExtension);
      } catch (e) {
        console.log(elementPath + ': template not found!');
      }
    }

    if (nodeCfg.coreFetcher === 'Directive') {
      node.Serialized.Tag = node.Name;
    }

    if (node.ComponentType === 'DashboardModel') {
      node.Serialized = JSON.parse(node.Serialized);
      var spAsString = node.Serialized.ServicePointer.split('.');
      node.Serialized.ServicePointer = {
        Name: spAsString[spAsString.length - 1],
        Workspace: spAsString.slice(0, -1).join('.')
      };
    }

    if (_.isObject(node.Serialized)) {
      node.Serialized = JSON.stringify(node.Serialized);
    }

    bundle.Items.push(node);
  });

  options.deletedset.forEach(function(element) {
    if (toBeIgnored(element)) {
      return;
    }

    var node = {
      delete: true
    };

    var elementPath = element.split('.')[0];
    element = options.dir + element;
    var pathArray = elementPath.split(path.sep);
    elementPath = options.dir + elementPath;

    node.Workspace = pathArray.slice(0, pathArray.length - 2).filter(function(i) {
      return i != null && i !== '';
    }).join('.');
    node.Name = pathArray[pathArray.length - 1];

    bundle.Items.push(node);
  });

  return bundle;
};
