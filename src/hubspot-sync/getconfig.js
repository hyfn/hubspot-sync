/* eslint-disable no-console, no-undef */

import fs from 'fs';
import yaml from 'js-yaml';

const additional = [
  'set ftp:prefer-epsv off',
  'set ftp:passive-mode on',
  'set file:charset UTF-8',
  'set ftp:use-utf8 yes',
  'set ftp:ssl-protect-data on',
  'set ftp:ssl-allow on',
  'set ftp:ssl-protect-list no',
  'set ftp:ssl-force yes',
  'set ssl:verify-certificate no',
  'set cmd:fail-exit yes',
  'set ftp:list-options -la',
  'set net:max-retries 0',
];

const defaults = {
  remoteDir: './',
  localDir: './',
  host: 'ftp.hubapi.com',
  protocol: 'ftp',
  addProtocol: false,
  mirrorOptions: '-vvv --transfer-all --parallel=10',
  additionalLftpCommands: additional.join(';'),
  port: 3200,
  ignore: [
    '.htaccess',
    'node_modules/',
  ],
};

export default function(configPath = './config.yml') {
  let opts = {};
  try {
    opts = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
    if (opts.additional) {
      defaults.additionalLftpCommands = additional.concat(opts.additional).join(';');
    }
  } catch (e) {
    throw new Error('Unable to load config file, ensure config.yml is found');
  }
  return { ...defaults, ...opts };
}
