'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
  var configPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './config.yml';

  var opts = {};
  try {
    opts = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(configPath, 'utf8'));
    if (opts.additional) {
      defaults.additionalLftpCommands = additional.concat(opts.additional).join(';');
    }
  } catch (e) {
    throw new Error('Unable to load config file, ensure config.yml is found');
  }
  return _extends({}, defaults, opts);
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var additional = ['set ftp:prefer-epsv off', 'set ftp:passive-mode on', 'set file:charset UTF-8', 'set ftp:use-utf8 yes', 'set ftp:ssl-protect-data on', 'set ftp:ssl-allow on', 'set ftp:ssl-protect-list no', 'set ftp:ssl-force yes', 'set ssl:verify-certificate no', 'set cmd:fail-exit yes', 'set ftp:list-options -la', 'set net:max-retries 0'];

var defaults = {
  remoteDir: './',
  localDir: './',
  host: 'ftp.hubapi.com',
  protocol: 'ftp',
  addProtocol: false,
  mirrorOptions: '-vv -p --transfer-all --parallel=10 --exclude \.DS_Store',
  additionalLftpCommands: additional.join(';'),
  port: 3200,
  ignore: ['.htaccess', 'node_modules/']
};