/*
 * we always have a trailing slash on directory
 * for now use this.
 */
export default str => /\/$/.test(str);
