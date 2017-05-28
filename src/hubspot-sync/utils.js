/* eslint-disable global-require */

export default {
  isDir: require('./utils/is-dir').default,
  makeDir: require('./utils/make-dir').default,
  tree: require('./utils/tree').default,
  outputLine: require('./utils/output-line').default,
  buildLocalFileTree: require('./utils/local-file-tree').default,
  flattenLocalFileTree: require('./utils/flatten-local-file-tree').default,
  parentFolder: require('./utils/parent-folder').default,
};
