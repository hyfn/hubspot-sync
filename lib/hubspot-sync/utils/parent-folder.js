'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path) {
  var delim = '/';
  var a = path.split(delim);
  a.pop();
  return a.join(delim);
};