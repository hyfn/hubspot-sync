/* eslint-disable no-console, no-underscore-dangle, no-new */

import program from 'commander';
// import { Spinner } from 'cli-spinner';
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
      case 'pull': {
        console.log('Start Pull (Mirror Remote to Local)');
        new HubspotSync(program.config || './config.yml').pull().then(
          (data) => {
            console.log(data.green);
            console.log('Pull complete');
          },
          err => console.error('Pull failed', err),
        );
        break;
      }
      case 'pullSafe': {
        console.log('Start PullSafe (Mirror Remote to Local)');
        new HubspotSync(program.config || './config.yml').pullSafe().then(
          () => {
            console.log('PullSafe complete'.green);
          },
          (err) => {
            console.log('=========');
            console.error(`PullSafe failed ${err}`.red);
          },
        );
        break;
      }
      case 'pushSafe': {
        console.log('Start pushSafe (Mirror Local to Remote)');
        new HubspotSync(program.config || './config.yml').pushSafe().then(
          () => {
            console.log('PushSafe complete'.green);
          },
          (err) => {
            console.log('=========');
            console.error(`PushSafe failed ${err}`.red);
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
