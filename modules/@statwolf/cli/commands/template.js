import { template } from '@statwolf/statwolf';

const command = function(info) {
  return template(info);
};

export default function(app) {
  const builder = function(yargs) {
    yargs.option('folder', {
      alias: 'f',
      type: 'string',
      describe: 'The project folder where create the service',
      demandOption: true
    });

    yargs.option('name', {
      alias: 'n',
      type: 'string',
      describe: 'The service name',
      demandOption: true
    });

    yargs.option('type', {
      alias: 't',
      type: 'string',
      describe: 'The template type',
      demandOption: true
    });

    yargs.option('project', {
      alias: 'p',
      type: 'string',
      describe: 'The statwolf project folder',
      demandOption: true
    });
  };

  app.command('template', 'create a statwolf service from template', builder, command);
}
