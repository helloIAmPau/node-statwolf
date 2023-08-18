import { hideBin } from 'yargs/helpers';
import  yargs from 'yargs';
import commands from './commands';

const app = commands(yargs(hideBin(process.argv)))
  .scriptName('statwolf')
  .help()
  .parse()
