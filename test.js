'use strict';

var _hubspotSync = require('./lib/hubspot-sync');

var _hubspotSync2 = _interopRequireDefault(_hubspotSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _hubspotSync2.default('./config.yml').pull().then(function (data) {
  console.log(data); // list of files and directories synced
}, function (err) {
  return console.error('Pull failed', err);
});
