#!/usr/bin/env node

var program = require('commander');
var config = require('../package.json');
var required = require('require-dir');
var fs = require('fs');

var modules = required('../lib');

var exitCallback = function() {
  program.outputHelp();
  process.exit(1);
};

var commandWatchdog = false;

var commandCallback = function(cmd) {
  if(modules[cmd] === undefined) exitCallback();
  commandWatchdog = true;
  program.dir ? program.dir = program.dir + '/' : program.dir = '';
  try {
    var result = modules[cmd](program);
    program.output = program.output || 'output-compress.json'
    fs.writeFileSync(program.output, JSON.stringify(result, null, 2));
  } catch(e) {
    if(e.name === 'ParamsError') return exitCallback();
    throw e;
  }
};

program.version(config.version)
        .usage('examples:\ncconverter compress -d <base_dir> -c <changeset_json> -o <output_json_bundle>\ncconverter expand -d <base_dir> -b <input_json_bundle>')
        .arguments('<cmd>')
        .action(commandCallback)
        .option('-b --bundle <statwolf_bundle>', 'the bundle to expand')
        .option('-c --changeset <changeset_json>', 'a json array containing a list of modified files')
        .option('-d --dir <base_dir>', 'the base directory')
        .option('-o --output <output_file>', 'the output filename')
        .parse(process.argv);

if(!commandWatchdog) exitCallback();
