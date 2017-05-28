'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _index = require('./hubspot-sync/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version('Hubspot-Sync.js Version ' + _package2.default.version);

_commander2.default.usage(['[COMMAND] [OPTIONS]', _commander2.default._version, 'Sync local files with Hubspot (Hubapi)'].join('\n\n  ')).option('-c, --config <path>', 'Specify path to config.yml').arguments('<cmd>').action(function (cmd) {
  switch (cmd) {
    case 'deploy':
      {
        console.log('Start deploy');
        new _index2.default(_commander2.default.config || './config.yml').deploy().then(function () {
          console.log('Deploy complete'.green);
        }, function (err) {
          console.error(('deploy failed ' + err).red);
        });
        break;
      }
    default:
      console.error('no command given!');
  }
}).parse(process.argv);

exports.default = _index2.default;