export default (files) => {
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

  return list;
};

