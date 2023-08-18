import body from './body';
import script from './script';
import resolver from './resolver';
import model from './model';
import directive from './directive';

import { sep } from 'path';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';

import babel from '@statwolf/babel';

import { log } from '../logger';

const resolvePath = function({ folder, name, extension }) {
  return resolve(folder, `${ name }${ extension }`);

};

const code = function({ folder, name }) {
  const codePath = resolvePath({ folder, name, extension: '.js' });

  return readFile(codePath).then(function(buffer) {
    return babel(buffer);
  }).then(function({ code }) {
    return code;
  });
};

const json = function(path) {
  return readFile(path).then(function(buffer) {
    return JSON.parse(buffer);
  });
};

const split = function(statwolfPath) {
  const Workspace = statwolfPath.split('.');
  const Name = Workspace.pop();

  return {
    Workspace: Workspace.join('.'),
    Name
  };
};

const deps = function({ data, folder, name }) {
  const depsPath = resolvePath({ folder, name, extension: '.deps.json' });

  return json(depsPath).then(function(deps) {
    data.Dependencies = {};

    Object.keys(deps).forEach(function(key) {
      data.Dependencies[key] = split(deps[key]);
    });

    return data;
  });
};

export default function({ meta, folder, servicePath, name }) {
  const { ComponentType } = meta;

  const input = {
    name,
    meta,
    folder,
    code,
    json,
    deps,
    split,
    resolvePath,
    servicePath
  };

  return Promise.resolve().then(function() {
    if(ComponentType === 'DashboardService' || ComponentType === 'DashboardController' || ComponentType === 'DashboardView') {
      return body(input).catch(function(error) {
        log(error.message);
      });
    }

    if(ComponentType === 'DashboardScript') {
      return script(input).catch(function(error) {
        log(error.message);
      });
    }

    if(ComponentType === 'DashboardForm') {
      return resolver(input).catch(function(error) {
        log(error.message);
      });
    }

    if(ComponentType === 'DashboardModel') {
      return model(input).catch(function(error) {
        log(error.message);
      });
    }

    if(ComponentType === 'DashboardControlTemplate') {
      return directive(input).catch(function(error) {
        log(error.message);
      });
    }

    throw new Error(`Invalid component type ${ ComponentType }`);
  });
};
