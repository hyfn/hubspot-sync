/* eslint-disable no-console, no-underscore-dangle, no-new */

import FTPS from 'ftps';
import getconfig from './getconfig';
import tree from './utils/tree';
import outputLine from './utils/output-line';
import buildLocalFileTree from './utils/local-file-tree';
import flattenLocalFileTree from './utils/flatten-local-file-tree';
import colors from 'colors'; // eslint-disable-line

const glob = require('glob-fs')({ gitignore: true });

const identity = () => null;
const showSuccessResponse = file => outputLine({ str: file, type: 'file', color: 'green' });
const showFailedResponse = file => outputLine({ str: `${file}, failed to upload`, type: 'file', color: 'red' });

const HubspotSync = (cfgPath = './config.yml') => {
  const opts = getconfig(cfgPath);
  const ftps = new FTPS(opts);

  return {
    mkRemoteDir(path) {
      return new Promise((resolve) => {
        ftps
          .raw(`mkdir -p ${path}`)
          .exec((err) => {
            if (err) {
              throw new Error(err);
            }
            return resolve(null);
          });
      });
    },
    find(path) {
      return new Promise((resolve, reject) => {
        ftps
          .cd(path)
          .raw(`find ${path}`)
          .exec((err, resp) => {
            if (err) {
              throw new Error(err);
            }
            if (resp.data) {
              const d = resp.data.split('\n')
                          .map(file => ftps.escapeshell(`${file}`));
              return resolve(
                tree(path, d),
              );
            }
            return reject(null);
          });
      });
    },
    findLocal(path, processStream = identity) {
      return new Promise((resolve) => {
        process.chdir(path);
        glob.readdirStream('**/*') // make this work as a stream
          .on('data', file => processStream(file))
          .on('end', function() { resolve(this.files); });
      });
    },
    ls(path) {
      return new Promise((resolve, reject) => {
        ftps
          .cd(path)
          .raw('ls -alR')
          .exec((err, resp) => {
            if (err) {
              throw new Error(err);
            }
            if (resp.data) {
              return resolve(
                resp.data.split(' ').map(file =>
                  ftps.escapeshell(`${path}/${file}`),
                ),
              );
            }
            return reject(null);
          });
      });
    },
    lsdir(path) {
      return new Promise((resolve, reject) => {
        ftps
          .cd(path)
          .raw('glob -d echo *')
          .exec((err, resp) => {
            if (err) {
              throw new Error(err);
            }
            if (resp.data) {
              return resolve(resp.data.split(' ')
                .filter(file => file.trim().replace(/\\n/, '').length)
                .map(file => ftps.escapeshell(`${path}/${file}`)));
            }
            return reject(null);
          });
      });
    },
    getFile(remoteFile, localFile) {
      return new Promise((resolve, reject) => {
        ftps
          .raw(`get ${remoteFile} -o ${localFile}`)
          .exec((err, resp) => {
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
    getFilePath() {
      //
    },
    putFile({ file, local, remote }) {
      return new Promise((resolve, reject) => {
        ftps
          .raw(`lcd ${local}`)
          .raw(`cd ${remote}`)
          .raw(`mput ${file}`)
          .exec((err, resp) => {
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
    sync() {
      return new Promise((resolve, reject) => {
        const { remoteFileDir, localFileDir } = opts;
        ftps
          .raw(`lcd ${localFileDir}`)
          .raw(`cd ${remoteFileDir}`)
          .mirror({
            remoteDir: remoteFileDir,
            localDir: localFileDir,
            options: opts.mirrorOptions,
          })
          .exec((err, resp) => {
            if (err) {
              reject(err);
            } else
            if (resp.error) {
              reject(resp.error);
            } else
            if (resp.data) {
              resp.data.split('\n').forEach(
                (item) => {
                  if (item) {
                    showSuccessResponse(item);
                  }
                },
              );
              resolve(resp.data);
            }
          });
      });
    },
    deploy() {
      return new Promise((resolve, reject) => {
        const { remoteFileDir, localFileDir } = opts;
        ftps
          .raw(`lcd ${localFileDir}`)
          .raw(`cd ${remoteFileDir}`)
          .mirror({
            remoteDir: remoteFileDir,
            localDir: localFileDir,
            options: opts.mirrorOptions,
            upload: true,
          })
          .exec((err, resp) => {
            if (err) {
              reject(err);
            } else
            if (resp.error) {
              reject(resp.error);
            } else
            if (resp.data) {
              resp.data.split('\n').forEach(
                (item) => {
                  if (item) {
                    showSuccessResponse(item);
                  }
                },
              );
              resolve(resp.data);
            }
          });
      });
    },
    deploySafe() {
      const self = this;
      const promises = [];
      const filePaths = [
        { local: opts.localFileDir, remote: opts.remoteFileDir },
      ];

      return buildLocalFileTree(filePaths, this.findLocal).then(files =>
        new Promise(() => {
          const list = flattenLocalFileTree(files);

          promises.push(list.map(data =>
            self.putFile(data).then(
              () => showSuccessResponse(data.file),
              () => showFailedResponse(data.file),
            ),
          ));
          return Promise.all(promises);
        },
        err => err,
        ),
      );
    },
  };
};

export default HubspotSync;
