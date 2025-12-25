const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const generatedDir = path.join(
  projectRoot,
  'node_modules',
  'hermes-parser',
  'dist',
  'generated',
);
const fallbackDir = path.join(projectRoot, 'scripts', 'hermes-parser');
const requiredFiles = ['ParserVisitorKeys.js', 'ESTreeVisitorKeys.js'];

const missingFiles = requiredFiles.filter(
  (file) => !fs.existsSync(path.join(generatedDir, file)),
);

if (missingFiles.length === 0) {
  process.exit(0);
}

missingFiles.forEach((file) => {
  const fallbackPath = path.join(fallbackDir, file);
  if (!fs.existsSync(fallbackPath)) {
    throw new Error(
      `Hermes parser fallback file missing at ${fallbackPath}. ` +
        'Please restore scripts/hermes-parser files.',
    );
  }
});

fs.mkdirSync(generatedDir, {recursive: true});
missingFiles.forEach((file) => {
  fs.copyFileSync(path.join(fallbackDir, file), path.join(generatedDir, file));
});
console.log(
  `Added missing hermes-parser generated files: ${missingFiles.join(', ')}`,
);
