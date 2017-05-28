'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var str = _ref.str,
      type = _ref.type,
      _ref$color = _ref.color,
      color = _ref$color === undefined ? 'green' : _ref$color;
  return console.log('>>'[color] + ' ' + type[color] + ': ' + str);
};