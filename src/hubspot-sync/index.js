/* eslint-disable no-console, no-underscore-dangle, no-new */

import FTPS from 'ftps';
import getconfig from './getconfig';
import makeDir from './utils/make-dir';
import tree from './utils/tree';
import outputLine from './utils/output-line';
import buildLocalFileTree from './utils/local-file-tree';
import colors from 'colors'; // eslint-disable-line

const glob = require('glob-fs')({ gitignore: true });
const identity = () => null;

const relative = str =>
  str.replace(/^\//, '');

const HubspotSync = (cfgPath = './config.yml') => {
  const opts = getconfig(cfgPath);
  const ftps = new FTPS(opts);

  const log = {
    verbose: opts.verbose || false,
    write: opts.log || console.log,
    info: opts.info || console.info,
    error: opts.error || console.error,
    warn: opts.warn || console.warn,
  };

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
    deploy() {
      throw new Error('in process');
      // new Promise((resolve) => {
      //   const { remoteDir, localDir } = opts;
      //   ftps
      //     .cd(opts.remoteDir)
      //     .mirror({ remoteDir, localDir, options: opts.mirrorOptions })
      //     .exec((err, resp) => {
      //       if (err) {
      //         throw new Error(err);
      //       }
      //       if (resp.data) {
      //         resolve(resp.data);
      //       }
      //     });
      // });
    },
    put() {
      throw new Error('in process');
      // new Promise((resolve) => {
      //   const { remoteDir, localDir } = opts;
      //   ftps
      //     .cd(opts.remoteDir)
      //     .mirror({ localDir, remoteDir, options: opts.mirrorOptions })
      //     .exec((err, resp) => {
      //       if (err) {
      //         throw new Error(err);
      //       }
      //       if (resp.data) {
      //         resolve(resp.data);
      //       }
      //     });
      // });
    },
    pull() {
      return new Promise((resolve) => {
        const { remoteDir, localDir } = opts;
        ftps
          .cd(opts.remoteDir)
          .mirror({ remoteDir, localDir, options: opts.mirrorOptions })
          .exec((err, resp) => {
            if (err) {
              throw new Error(err);
            }
            if (resp.data) {
              resolve(resp.data);
            }
          });
      });
    },
    pullSafe() {
      const process = (dir, data) => {
        const localDir = `${opts.localDir}${dir}`;
        const printInfo = () => {
          log.write('>> dir:'.magenta, relative(dir));
        };

        return new Promise((resolve, reject) => {
          const onFileSuccess = () => {
            printInfo();
            return resolve();
          };

          makeDir(localDir, true).then(() => {
            if (data.files.length) {
              const list = data.files.filter(file => file.length);

              return Promise.all(list.map((file) => {
                const localFile = `${opts.localDir}${file}`;
                const remoteFile = `${opts.remoteDir}${file}`;

                return this.getFile(remoteFile, localFile).then(
                  () => {
                    log.write('>> file: '.green, relative(file));
                    return true;
                  },
                  (err) => {
                    log.write(err.trim().red);
                    reject(err.trim());
                  },
                );
              })).then(() => onFileSuccess());
            }
            return onFileSuccess();
          });
        });
      };

      return this.find(opts.remoteDir).then((data) => {
        const p = Object.keys(data).map(dir => process(dir, data[dir]));
        return Promise.all(p);
      });

    },

    /*
     * Hubspot only allows uploading certain filetypes into specific directories
     * for instance css can only be uploaded to the custom/page/css directory
     * files must be uploaded as a flat structure as custom/page/${custom-name}/*.html
     */
    pushSafe() {
      const self = this;
      const promises = [];
      const showSuccessResponse = file => outputLine({ str: file, type: 'file', color: 'green' });
      const showFailedResponse = file => outputLine({ str: `${file}, failed to upload`, type: 'file', color: 'red' });
      const filePaths = [
        { local: opts.localDir, remote: opts.remoteDir },
        { local: opts.localCSS, remote: opts.remoteCSS },
      ];

      return buildLocalFileTree(filePaths, this.findLocal).then(files =>
        new Promise(() => {
          const list = [];
          Object.keys(files).forEach((hash) => {
            const obj = files[hash];
            obj.files.forEach((file) => {
              list.push({
                file,
                local: hash,
                remote: obj.remote,
              });
            });
          });
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
