export default ({ str, type, color = 'green' }) =>
  console.log(`${'>>'[color]} ${type[color]}: ${str}`);