import { bundle } from '@statwolf/statwolf';
import { Spinner } from 'cli-spinner';

const spinner = new Spinner('%s bundling..');

const command = function(info) {
  spinner.start();

  return bundle(info).then(function(data) {
    spinner.stop();
  });
};

export default function(app) {
  const builder = function(yargs) {
    yargs.option('input', {
      alias: 'i',
      type: 'array',
      describe: 'A list of input to bundle',
      demandOption: true
    });

    yargs.option('project', {
      alias: 'p',
      type: 'string',
      describe: 'The statwolf project folder',
      demandOption: true
    });

    yargs.option('host', {
      alias: 'h',
      type: 'string',
      describe: 'A host in https://user:pass@stack.statwolf.com format',
      demandOption: true
    });

    yargs.option('drop', {
      alias: 'd',
      type: 'boolean',
      describe: 'Drop changeset',
      demandOption: true,
      default: false
    });
  };

  app.command('bundle', 'create a code bundle and push on a statwolf instance', builder, command);
};
