var fs            = require('fs');
var _             = require('lodash');
var config        = require('./config.json');
var mkdirp        = require('mkdirp');
var beautify_html = require('js-beautify').html;

/**
  * expand.js
  *
  * The expand module can be used to expand a statwolf bundle into a proper
  * filesystem representation. In the passed options object, a bundle location
  * is required to exist, along with a base directory where the expansion will
  * take place.
  *
  * @param {object} options is the container for the bundle location and the
  *                 expansion folder
  * @returns {array} an array of strings containing the paths of all expanded
  *                  components
  **/
module.exports = function(options) {

  if (!options.bundle) {
    throw { name: 'ParamsError' }
  }

  if (_.isString(options.bundle)) {
    options.bundle = JSON.parse(fs.readFileSync(options.bundle));
  }

  var pathArray = [];

  options.bundle.Items.forEach(function(element) {
    var componentName = element.Name;
    var path = element.Workspace.replace(/\./g, '/') + '/' + componentName;
    var type = element.ComponentType;

    var baseUri = path + '/' + componentName;

    var extension;
    var core;
    var deps;
    var html;
    var bind;

    var meta = {
      ComponentType: element.ComponentType,
      Version: element.Version,
      Name: componentName
    };

    if (config[type]) {
      var serialized = JSON.parse(element.Serialized);
      var coreFetcher = config[type].coreFetcher;

      if (type === 'DashboardModel') {
        serialized.ServicePointer = serialized.ServicePointer.Workspace + '.' + serialized.ServicePointer.Name;
      }

      if (config[type].extension) {
        extension = config[type].extension;
      } else {
        var ext = serialized.Language;
        meta.ScriptLanguage = ext;
        extension = (config.base.languageExtension[ext]);
      }

      meta = JSON.stringify(meta, null, 2);

      core = coreFetcher
        ? serialized[coreFetcher]
        : JSON.stringify(serialized, null, 2);

      deps = config[type].hasDependencies
        ? serialized.Dependencies
        : null;

      if (config[type].hasBindings) {
        bind = JSON.stringify({
          Model: serialized.Model.Workspace + '.' + serialized.Model.Name,
          View: serialized.View.Workspace + '.' + serialized.View.Name,
          Controller: serialized.Controller.Workspace + '.' + serialized.Controller.Name
        }, null, 2);
      }

      var depsToWrite = {};
      _.forIn(deps, function(value, key) {
        depsToWrite[key] = value.Workspace
          ? value.Workspace + '.' + value.Name
          : value.Name;
      });

      html = config[type].hasTemplate
        ? beautify_html(serialized.Template)
        : null;

      depsToWrite = JSON.stringify(depsToWrite, null, 2);

      mkdirp(options.dir + path, function(error) {
        if (error) {
          console.log('Unable to create directory ' + path);
          throw error;
        }

        fs.writeFileSync(options.dir + baseUri + extension, core);
        fs.writeFileSync(options.dir + baseUri + config.base.metaExtension, meta);

        if (deps) {
          fs.writeFileSync(options.dir + baseUri + config.base.depsExtension, depsToWrite);
        }

        if (html) {
          fs.writeFileSync(options.dir + baseUri + config.base.templateExtension, html);
        }

        if (bind) {
          fs.writeFileSync(options.dir + baseUri + config.base.bindExtension, bind);
        }

      });
    }

    pathArray.push(baseUri + extension);

  });

  return pathArray;
};
