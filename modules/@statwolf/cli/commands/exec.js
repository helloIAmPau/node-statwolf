import { exec } from '@statwolf/statwolf';
import { Spinner } from 'cli-spinner';

const spinner = new Spinner('%s executing..');

const command = function(info) {
  spinner.start();

  return exec(info).then(function(data) {
    spinner.stop(true);

    console.log(data);
  });
};

export default function(app) {
  const builder = function(yargs) {
    yargs.option('code', {
      alias: 'c',
      type: 'string',
      describe: 'ES6 javascript code to execute',
      demandOption: true
    });

    yargs.option('host', {
      alias: 'h',
      type: 'string',
      describe: 'A host in https://user:pass@stack.statwolf.com format',
      demandOption: true
    });
  };

  app.command('exec', 'execute some code on selected statwolf server', builder, command);
};
