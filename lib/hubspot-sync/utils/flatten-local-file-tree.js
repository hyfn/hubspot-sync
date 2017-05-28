"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (files) {
  var list = [];

  Object.keys(files).forEach(function (hash) {
    var obj = files[hash];
    obj.files.forEach(function (file) {
      list.push({
        file: file,
        local: hash,
        remote: obj.remote
      });
    });
  });

  return list;
};