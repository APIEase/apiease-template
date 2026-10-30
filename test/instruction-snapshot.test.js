const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {checkResourceInstructions} = require('../scripts/instructions/checkResourceInstructions.js');

const committedDirectory = path.resolve(__dirname, '../docs/resource-instructions');

async function fixture(context) {
  const targetDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-snapshot-test-'));
  context.after(() => fs.rm(targetDirectory, {recursive: true, force: true}));
  await fs.cp(committedDirectory, targetDirectory, {recursive: true});
  return {targetDirectory};
}

test('verifies the committed snapshot without an APIEase source checkout', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(committedDirectory, 'manifest.json'), 'utf8'));
  assert.equal(await checkResourceInstructions(), manifest.snapshotIdentity);
});

for (const file of ['source-authoring.md', 'codex-envelope.md', 'README.md']) {
  test(`rejects an edited ${file} with an unchanged version stamp`, async context => {
    const options = await fixture(context);
    const filePath = path.join(options.targetDirectory, file);
    await fs.appendFile(filePath, '\nUnrecorded change\n');
    const before = await fs.readFile(filePath);
    await assert.rejects(checkResourceInstructions(options), /do not match the recorded snapshot/);
    assert.deepEqual(await fs.readFile(filePath), before);
  });
}

for (const change of ['metadata', 'inventory', 'missing fingerprint', 'unsafe path']) {
  test(`rejects snapshot ${change} changes`, async context => {
    const options = await fixture(context);
    const manifestPath = path.join(options.targetDirectory, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (change === 'metadata') manifest.readingGuide[0].when = 'Changed applicability';
    if (change === 'inventory') manifest.files = manifest.files.filter(name => name !== 'source-authoring.md');
    if (change === 'missing fingerprint') delete manifest.snapshotIdentity;
    if (change === 'unsafe path') manifest.files.push('../outside.md');
    await fs.writeFile(manifestPath, JSON.stringify(manifest));
    await assert.rejects(checkResourceInstructions(options), /snapshot|instruction path/);
  });
}

test('rejects a missing instruction file', async context => {
  const options = await fixture(context);
  await fs.unlink(path.join(options.targetDirectory, 'source-authoring.md'));
  await assert.rejects(checkResourceInstructions(options), {code: 'ENOENT'});
});
