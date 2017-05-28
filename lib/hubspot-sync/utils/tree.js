'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isDir = require('./is-dir');

var _isDir2 = _interopRequireDefault(_isDir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (originalPath, data) {
  var len = originalPath.length;
  var obj = {};
  var prev = obj;

  data.forEach(function (p) {
    var path = p.substring(len, p.length);
    if ((0, _isDir2.default)(path)) {
      obj[path] = { files: [] };
      prev = obj[path];
    } else {
      prev.files.push(path);
    }
  });

  return obj;
};