/* eslint-disable no-console, no-underscore-dangle, no-new */

import program from 'commander';
import colors from 'colors'; // eslint-disable-line
import pkg from '../package.json';
import HubspotSync from './hubspot-sync/index';

program.version(`Hubspot-Sync.js Version ${pkg.version}`);

program
  .usage([
    '[COMMAND] [OPTIONS]',
    program._version,
    'Sync local files with Hubspot (Hubapi)',
  ].join('\n\n  '))
  .option('-c, --config <path>', 'Specify path to config.yml')
  .arguments('<cmd>')
  .action((cmd) => {
    switch (cmd) {
      case 'deploy': {
        console.log('Start deploy');
        new HubspotSync(program.config || './config.yml').deploy().then(
          () => {
            console.log('Deploy complete'.green);
          },
          (err) => {
            console.error(`deploy failed ${err}`.red);
          },
        );
        break;
      }
      case 'sync': {
        console.log('Start syncing');
        new HubspotSync(program.config || './config.yml').sync().then(
          () => {
            console.log('Sync complete'.green);
          },
          (err) => {
            console.error(`Sync failed ${err}`.red);
          },
        );
        break;
      }
      default:
        console.error('no command given!');
    }
  })
  .parse(process.argv);

export default HubspotSync;
