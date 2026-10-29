const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {pullResourceInstructions} = require('../../../scripts/instructions/pullResourceInstructions.js');

const templateRoot = path.resolve(__dirname, '../../..');
const sourceDirectory = process.env.APIEASE_SOURCE_DIRECTORY || path.resolve(templateRoot, '../apiease');

async function fixture(context) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'apiease-instructions-test-'));
  context.after(() => fs.rm(directory, {recursive: true, force: true}));
  return {sourceDirectory, targetDirectory: path.join(directory, 'instructions')};
}

test('copies only the manifest-selected local instructions and preserves the selective reading guide', async context => {
  const options = await fixture(context);
  await pullResourceInstructions(options);
  const sourceManifest = JSON.parse(await fs.readFile(path.join(sourceDirectory, 'contracts/project-design/v1/manifest.json')));
  const manifest = JSON.parse(await fs.readFile(path.join(options.targetDirectory, 'manifest.json')));
  assert.deepEqual(manifest.readingGuide.map(entry => entry.id), sourceManifest.moduleSets.codex.modules);
  for (const entry of manifest.readingGuide) {
    assert.equal(await fs.readFile(path.join(options.targetDirectory, entry.path), 'utf8'),
      await fs.readFile(path.join(sourceDirectory, 'contracts/project-design/v1', sourceManifest.instructionModules[entry.id]), 'utf8'));
  }
  assert.equal(manifest.readingGuide.filter(entry => entry.required).length, 2);
  assert.equal((await fs.readdir(options.targetDirectory)).some(name => name.includes('apex') || name.includes('planning')), false);
  await pullResourceInstructions({...options, check: true});
});

for (const mutation of ['missing', 'changed', 'metadata', 'obsolete']) {
  test(`check rejects ${mutation} output without writing`, async context => {
    const options = await fixture(context);
    await pullResourceInstructions(options);
    const manifestPath = path.join(options.targetDirectory, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath));
    const modulePath = path.join(options.targetDirectory, manifest.readingGuide[0].path);
    if (mutation === 'missing') await fs.unlink(modulePath);
    if (mutation === 'changed') await fs.appendFile(modulePath, '\nLocal change\n');
    if (mutation === 'metadata') {
      manifest.readingGuide[0].when = 'Different applicability';
      await fs.writeFile(manifestPath, JSON.stringify(manifest));
    }
    if (mutation === 'obsolete') {
      manifest.files.push('retired.md');
      await fs.writeFile(manifestPath, JSON.stringify(manifest));
      await fs.writeFile(path.join(options.targetDirectory, 'retired.md'), 'old instructions');
    }
    const before = await fs.readFile(manifestPath);
    await assert.rejects(pullResourceInstructions({...options, check: true}), /out of date/i);
    assert.deepEqual(await fs.readFile(manifestPath), before);
  });
}

test('synchronizes obsolete owned files and preserves unrelated files', async context => {
  const options = await fixture(context);
  await pullResourceInstructions(options);
  const manifestPath = path.join(options.targetDirectory, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  manifest.files.push('retired.md');
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  await fs.writeFile(path.join(options.targetDirectory, 'retired.md'), 'old instructions');
  await fs.writeFile(path.join(options.targetDirectory, 'personal-notes.md'), 'Keep these notes');
  await pullResourceInstructions(options);
  await assert.rejects(fs.access(path.join(options.targetDirectory, 'retired.md')), {code: 'ENOENT'});
  assert.equal(await fs.readFile(path.join(options.targetDirectory, 'personal-notes.md'), 'utf8'), 'Keep these notes');
  await pullResourceInstructions({...options, check: true});
});

test('fails when the authoritative source is unavailable without changing output', async context => {
  const options = await fixture(context);
  await assert.rejects(pullResourceInstructions({...options, sourceDirectory: path.join(options.targetDirectory, 'missing')}));
  await assert.rejects(fs.access(options.targetDirectory), {code: 'ENOENT'});
});

test('runs from any working directory with an explicit source checkout', async context => {
  const options = await fixture(context);
  const result = spawnSync(process.execPath, [path.join(templateRoot, 'scripts/instructions/pullResourceInstructions.js'),
    '--source', sourceDirectory, '--target', options.targetDirectory], {cwd: os.tmpdir(), encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  await pullResourceInstructions({...options, check: true});
});
