export default (paths, finder) =>
  new Promise((resolve) => {
    const files = {};
    const promises = [];

    paths.forEach((dir) => {
      if (!files[dir.local]) {
        files[dir.local] = { files: [], remote: dir.remote };
      }
      const p = finder(dir.local, (file) => {
        files[dir.local].files.push(file.segment);
        return true;
      });
      promises.push(p);
    });

    Promise.all(promises).then(() => {
      resolve(files);
    });
  });
