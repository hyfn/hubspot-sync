'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ftps = require('ftps');

var _ftps2 = _interopRequireDefault(_ftps);

var _getconfig = require('./getconfig');

var _getconfig2 = _interopRequireDefault(_getconfig);

var _tree = require('./utils/tree');

var _tree2 = _interopRequireDefault(_tree);

var _outputLine = require('./utils/output-line');

var _outputLine2 = _interopRequireDefault(_outputLine);

var _localFileTree = require('./utils/local-file-tree');

var _localFileTree2 = _interopRequireDefault(_localFileTree);

var _flattenLocalFileTree = require('./utils/flatten-local-file-tree');

var _flattenLocalFileTree2 = _interopRequireDefault(_flattenLocalFileTree);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var glob = require('glob-fs')({ gitignore: true });

var identity = function identity() {
  return null;
};
var showSuccessResponse = function showSuccessResponse(file) {
  return (0, _outputLine2.default)({ str: file, type: 'file', color: 'green' });
};
var showFailedResponse = function showFailedResponse(file) {
  return (0, _outputLine2.default)({ str: file + ', failed to upload', type: 'file', color: 'red' });
};

var HubspotSync = function HubspotSync() {
  var cfgPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './config.yml';

  var opts = (0, _getconfig2.default)(cfgPath);
  var ftps = new _ftps2.default(opts);

  return {
    mkRemoteDir: function mkRemoteDir(path) {
      return new Promise(function (resolve) {
        ftps.raw('mkdir -p ' + path).exec(function (err) {
          if (err) {
            throw new Error(err);
          }
          return resolve(null);
        });
      });
    },
    find: function find(path) {
      return new Promise(function (resolve, reject) {
        ftps.cd(path).raw('find ' + path).exec(function (err, resp) {
          if (err) {
            throw new Error(err);
          }
          if (resp.data) {
            var d = resp.data.split('\n').map(function (file) {
              return ftps.escapeshell('' + file);
            });
            return resolve((0, _tree2.default)(path, d));
          }
          return reject(null);
        });
      });
    },
    findLocal: function findLocal(path) {
      var processStream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;

      return new Promise(function (resolve) {
        process.chdir(path);
        glob.readdirStream('**/*').on('data', function (file) {
          return processStream(file);
        }).on('end', function () {
          resolve(this.files);
        });
      });
    },
    ls: function ls(path) {
      return new Promise(function (resolve, reject) {
        ftps.cd(path).raw('ls -alR').exec(function (err, resp) {
          if (err) {
            throw new Error(err);
          }
          if (resp.data) {
            return resolve(resp.data.split(' ').map(function (file) {
              return ftps.escapeshell(path + '/' + file);
            }));
          }
          return reject(null);
        });
      });
    },
    lsdir: function lsdir(path) {
      return new Promise(function (resolve, reject) {
        ftps.cd(path).raw('glob -d echo *').exec(function (err, resp) {
          if (err) {
            throw new Error(err);
          }
          if (resp.data) {
            return resolve(resp.data.split(' ').filter(function (file) {
              return file.trim().replace(/\\n/, '').length;
            }).map(function (file) {
              return ftps.escapeshell(path + '/' + file);
            }));
          }
          return reject(null);
        });
      });
    },
    getFile: function getFile(remoteFile, localFile) {
      return new Promise(function (resolve, reject) {
        ftps.raw('get ' + remoteFile + ' -o ' + localFile).exec(function (err, resp) {
          if (err) {
            reject(err);
          }
          if (resp.error) {
            reject(resp.error);
          }
          resolve(resp);
        });
      });
    },
    getFilePath: function getFilePath() {},
    putFile: function putFile(_ref) {
      var file = _ref.file,
          local = _ref.local,
          remote = _ref.remote;

      return new Promise(function (resolve, reject) {
        ftps.raw('lcd ' + local).raw('cd ' + remote).raw('mput ' + file).exec(function (err, resp) {
          if (err) {
            reject(err);
          }
          if (resp.error) {
            reject(resp.error);
          }
          resolve(resp);
        });
      });
    },
    deploy: function deploy() {
      return new Promise(function (resolve, reject) {
        var remoteFileDir = opts.remoteFileDir,
            localFileDir = opts.localFileDir;

        ftps.raw('lcd ' + localFileDir).raw('cd ' + remoteFileDir).mirror({
          remoteDir: remoteFileDir,
          localDir: localFileDir,
          options: opts.mirrorOptions,
          upload: true
        }).exec(function (err, resp) {
          if (err) {
            reject(err);
          } else if (resp.error) {
            reject(resp.error);
          } else if (resp.data) {
            resp.data.split('\n').forEach(function (item) {
              if (item) {
                showSuccessResponse(item);
              }
            });
            resolve(resp.data);
          }
        });
      });
    },
    deploySafe: function deploySafe() {
      var self = this;
      var promises = [];
      var filePaths = [{ local: opts.localFileDir, remote: opts.remoteFileDir }];

      return (0, _localFileTree2.default)(filePaths, this.findLocal).then(function (files) {
        return new Promise(function () {
          var list = (0, _flattenLocalFileTree2.default)(files);

          promises.push(list.map(function (data) {
            return self.putFile(data).then(function () {
              return showSuccessResponse(data.file);
            }, function () {
              return showFailedResponse(data.file);
            });
          }));
          return Promise.all(promises);
        }, function (err) {
          return err;
        });
      });
    }
  };
};

exports.default = HubspotSync;