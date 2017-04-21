import fs from 'fs';

export default (path, trueOnExists) =>
  new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) {
        if (err.code === 'EEXIST') {
          if (trueOnExists) {
            return resolve(true);
          }
          return reject(null);
        }
        return reject(null);
      }
      return resolve(true);
    });
  });
