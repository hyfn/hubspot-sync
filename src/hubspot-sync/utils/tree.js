/*
 * since we get a fairly ordered list of
 * files when using 'find' we can use that
 * to our advantage when building the tree
 */

import isDir from './is-dir';

export default (originalPath, data) => {
  const len = originalPath.length;
  const obj = {};
  let prev = obj;

  data.forEach((p) => {
    const path = p.substring(len, p.length);
    if (isDir(path)) {
      obj[path] = { files: [] };
      prev = obj[path];
    } else {
      prev.files.push(path);
    }
  });

  return obj;
};

