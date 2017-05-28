'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, trueOnExists) {
  return new Promise(function (resolve, reject) {
    _fs2.default.mkdir(path, function (err) {
      if (err) {
        if (err.code === 'EEXIST') {
          if (trueOnExists) {
            return resolve(true);
          }
          return reject(null);
        }
        return reject(null);
      }
      return resolve(true);
    });
  });
};