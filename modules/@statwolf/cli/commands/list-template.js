import { listTemplate } from '@statwolf/statwolf';

const command = function(info) {
  return listTemplate(info).then(function(result) {
    return result.map(function(item) {
      return item.name;
    });
  }).then(function(result) {
    console.log(result.join('\n'));
  });
};

export default function(app) {
  const builder = function(yargs) {
    yargs.option('project', {
      alias: 'p',
      type: 'string',
      describe: 'The statwolf project folder',
      demandOption: true
    });
  };

  app.command('list-template', 'show available templates for current workspace', builder, command);
}
