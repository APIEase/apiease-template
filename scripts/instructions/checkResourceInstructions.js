const {createHash} = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const TARGET_DIRECTORY = path.resolve(__dirname, '../../docs/resource-instructions');

// Include filenames, content, and manifest metadata, excluding the fingerprint itself.
function calculateSnapshotIdentity(files) {
  const entries = [...files].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  return `sha256:${createHash('sha256').update(JSON.stringify(entries)).digest('hex')}`;
}

async function checkResourceInstructions({targetDirectory = TARGET_DIRECTORY} = {}) {
  await requireOwnedPath(targetDirectory, 'manifest.json');
  const {snapshotIdentity, ...manifest} = JSON.parse(await fs.readFile(path.join(targetDirectory, 'manifest.json'), 'utf8'));
  if (manifest.formatVersion !== 1 || !/^sha256:[a-f0-9]{64}$/.test(snapshotIdentity)
    || !Array.isArray(manifest.files) || !manifest.files.includes('manifest.json')
    || new Set(manifest.files).size !== manifest.files.length) {
    throw new Error('Invalid instruction snapshot manifest. Run npm run instructions:pull-local.');
  }
  const files = new Map();
  for (const name of manifest.files) {
    await requireOwnedPath(targetDirectory, name);
    files.set(name, name === 'manifest.json'
      ? `${JSON.stringify(manifest, null, 2)}\n`
      : await fs.readFile(path.join(targetDirectory, name), 'utf8'));
  }
  if (calculateSnapshotIdentity(files) !== snapshotIdentity) {
    throw new Error('Resource instructions do not match the recorded snapshot. Run npm run instructions:pull-local.');
  }
  return snapshotIdentity;
}

async function requireOwnedPath(targetDirectory, name) {
  if (typeof name !== 'string' || (name !== 'README.md' && !/^[a-z][a-z0-9-]*\.(md|json)$/.test(name))) {
    throw new Error(`Invalid owned instruction path: ${name}`);
  }
  for (const filePath of [targetDirectory, path.join(targetDirectory, name)]) {
    const stats = await fs.lstat(filePath).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (stats?.isSymbolicLink()) throw new Error(`Instruction path is a symlink: ${filePath}`);
  }
}

if (require.main === module) {
  checkResourceInstructions()
    .then(() => console.log('Committed resource instruction snapshot verified (source freshness is checked locally).'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = {calculateSnapshotIdentity, checkResourceInstructions, requireOwnedPath};
