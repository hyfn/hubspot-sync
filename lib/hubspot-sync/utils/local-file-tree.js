"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (paths, finder) {
  return new Promise(function (resolve) {
    var files = {};
    var promises = [];

    paths.forEach(function (dir) {
      if (!files[dir.local]) {
        files[dir.local] = { files: [], remote: dir.remote };
      }
      var p = finder(dir.local, function (file) {
        files[dir.local].files.push(file.segment);
        return true;
      });
      promises.push(p);
    });

    Promise.all(promises).then(function () {
      resolve(files);
    });
  });
};