const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targetPath = path.join(
  projectRoot,
  'node_modules',
  'hermes-parser',
  'dist',
  'generated',
  'ParserVisitorKeys.js',
);
const fallbackPath = path.join(
  projectRoot,
  'scripts',
  'hermes-parser',
  'ParserVisitorKeys.js',
);

if (fs.existsSync(targetPath)) {
  process.exit(0);
}

if (!fs.existsSync(fallbackPath)) {
  throw new Error(
    `Hermes parser fallback file missing at ${fallbackPath}. ` +
      'Please restore scripts/hermes-parser/ParserVisitorKeys.js.',
  );
}

fs.mkdirSync(path.dirname(targetPath), {recursive: true});
fs.copyFileSync(fallbackPath, targetPath);
console.log('Added missing hermes-parser generated ParserVisitorKeys.js');
