/* eslint-disable no-console, no-underscore-dangle, no-new */

import FTPS from 'ftps';
import getconfig from './getconfig';

const HubspotSync = (cfgPath = './config.yml') => {
  const opts = getconfig(cfgPath);
  const ftps = new FTPS(opts);

  const log = {
    verbose: opts.verbose || false,
    write: opts.log || console.log,
    info: opts.info || console.info,
    error: opts.error || console.error,
    warn: opts.warn || console.warn
  };

  return {
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
              return resolve(
                resp.data.split('\n').map(file => ftps.escapeshell(`${path}/${file}`)),
              );
            }
            return reject(null);
          });
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
  };
};

export default HubspotSync;
