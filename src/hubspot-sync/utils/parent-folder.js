export default (path) => {
  const delim = '/';
  const a = path.split(delim);
  a.pop();
  return a.join(delim);
};
