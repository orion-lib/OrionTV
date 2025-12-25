const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const hermesParserDistDir = path.join(
  projectRoot,
  'node_modules',
  'hermes-parser',
  'dist',
);
const fallbackDir = path.join(projectRoot, 'scripts', 'hermes-parser');
const requiredEntries = [
  {
    dest: path.join(hermesParserDistDir, 'generated', 'ParserVisitorKeys.js'),
    src: path.join(fallbackDir, 'ParserVisitorKeys.js'),
  },
  {
    dest: path.join(hermesParserDistDir, 'generated', 'ESTreeVisitorKeys.js'),
    src: path.join(fallbackDir, 'ESTreeVisitorKeys.js'),
  },
  {
    dest: path.join(hermesParserDistDir, 'transform', 'SimpleTransform.js'),
    src: path.join(fallbackDir, 'transform', 'SimpleTransform.js'),
  },
];

const missingEntries = requiredEntries.filter(
  (entry) => !fs.existsSync(entry.dest),
);

if (missingEntries.length === 0) {
  process.exit(0);
}

missingEntries.forEach((entry) => {
  if (!fs.existsSync(entry.src)) {
    throw new Error(
      `Hermes parser fallback file missing at ${entry.src}. ` +
        'Please restore scripts/hermes-parser files.',
    );
  }
});

missingEntries.forEach((entry) => {
  fs.mkdirSync(path.dirname(entry.dest), {recursive: true});
  fs.copyFileSync(entry.src, entry.dest);
});
console.log(
  `Added missing hermes-parser files: ${missingEntries
    .map((entry) => path.relative(projectRoot, entry.dest))
    .join(', ')}`,
);
