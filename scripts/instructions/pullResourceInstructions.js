const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {calculateSnapshotIdentity, requireOwnedPath} = require('./checkResourceInstructions.js');

const TEMPLATE_DIRECTORY = path.resolve(__dirname, '../..');
const TARGET_DIRECTORY = path.join(TEMPLATE_DIRECTORY, 'docs/resource-instructions');
const SOURCE_DIRECTORY = path.resolve(TEMPLATE_DIRECTORY, '../apiease');

async function pullResourceInstructions({sourceDirectory = process.env.APIEASE_SOURCE_DIRECTORY || SOURCE_DIRECTORY,
  targetDirectory = TARGET_DIRECTORY, check = false} = {}) {
  const output = await buildInstructionFiles(path.resolve(sourceDirectory));
  const previous = await readPreviousManifest(targetDirectory);
  const obsolete = (previous?.files ?? []).filter(name => !output.has(name));
  const changed = [];
  for (const [name, content] of output) {
    if (await readOptionalFile(targetDirectory, name) !== content) changed.push(name);
  }
  if (check && (changed.length || obsolete.length)) {
    throw new Error(`Resource instructions are out of date: ${[...changed, ...obsolete].join(', ')}. Run npm run instructions:pull-local.`);
  }
  if (check) return;
  await fs.mkdir(targetDirectory, {recursive: true});
  for (const name of [...output.keys(), ...obsolete]) await requireOwnedPath(targetDirectory, name);
  for (const [name, content] of output) await fs.writeFile(path.join(targetDirectory, name), content);
  for (const name of obsolete) await fs.rm(path.join(targetDirectory, name), {force: true});
}

async function buildInstructionFiles(sourceDirectory) {
  const verifierPath = path.join(sourceDirectory, 'backend/service/projects/ProjectDesignProtocolService.js');
  const {default: ProjectDesignProtocolService} = await import(pathToFileURL(verifierPath).href);
  const bundlePath = path.join(sourceDirectory, 'contracts/project-design/v1');
  const protocol = new ProjectDesignProtocolService({bundlePath}).loadProtocol('codex');
  const sourceManifest = JSON.parse(await fs.readFile(path.join(bundlePath, 'manifest.json'), 'utf8'));
  const readingGuide = protocol.readingGuide.map(entry => ({...entry,
    path: path.posix.basename(sourceManifest.instructionModules[entry.id])}));
  const output = new Map(protocol.instructionModules.map(module => [
    readingGuide.find(entry => entry.id === module.id).path, module.content,
  ]));
  if (output.size !== readingGuide.length) throw new Error('Instruction filenames must be unique.');
  output.set('codex-envelope.md', protocol.adapterEnvelope);
  output.set('README.md', buildReadingIndex(readingGuide));
  const manifest = {
    formatVersion: 1, protocolVersion: protocol.protocolVersion,
    sourceManifestIdentity: protocol.manifestIdentity, moduleSetIdentity: protocol.moduleSetIdentity,
    readingGuide, envelope: 'codex-envelope.md', files: [...output.keys(), 'manifest.json'].sort(),
  };
  output.set('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  manifest.snapshotIdentity = calculateSnapshotIdentity(output);
  output.set('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  return output;
}

function buildReadingIndex(readingGuide) {
  const rows = readingGuide.map(entry => `| [${entry.path}](${entry.path}) | ${entry.required ? 'Required' : 'Selective'} | ${entry.when} |`);
  return ['# Resource instructions', '',
    'These instructions are written by APIEase developers. A script copies the verified local-agent selection from APIEase into the template; init and upgrade install it in store projects.', '',
    'Read the required files and [Codex adapter envelope](codex-envelope.md), then only the modules applicable to the resources you are editing. Resource instructions explain how to edit; actual resource JSON lives under resources/.', '',
    '| File | Reading | When |', '| --- | --- | --- |', ...rows, '',
    'Use apiease upgrade to update installed instructions. Keep project-specific decisions in CUSTOM_AGENT_GUIDANCE.md and CUSTOM_README.md.', '',
  ].join('\n');
}

async function readPreviousManifest(targetDirectory) {
  const content = await readOptionalFile(targetDirectory, 'manifest.json');
  if (content === null) return null;
  const manifest = JSON.parse(content);
  if (!Array.isArray(manifest.files)) throw new Error('Invalid installed instruction manifest.');
  for (const name of manifest.files) await requireOwnedPath(targetDirectory, name);
  return manifest;
}

async function readOptionalFile(targetDirectory, name) {
  await requireOwnedPath(targetDirectory, name);
  try { return await fs.readFile(path.join(targetDirectory, name), 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--check') options.check = true;
    else if (['--source', '--target'].includes(argument) && argumentsList[index + 1]) {
      options[argument === '--source' ? 'sourceDirectory' : 'targetDirectory'] = path.resolve(argumentsList[++index]);
    } else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }
  return options;
}

if (require.main === module) {
  Promise.resolve().then(() => pullResourceInstructions(parseArguments(process.argv.slice(2))))
    .then(() => console.log('Resource instructions verified.'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = {pullResourceInstructions};
