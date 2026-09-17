#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {test} = require("node:test");
const {pathToFileURL} = require("node:url");

const templateRoot = path.resolve(__dirname, "..");
const apieaseRoot = path.resolve(templateRoot, "..", "apiease");
let sharedCanonicalCodecPromise;

const exampleResourceDefinitions = [
  ["request", "docs/examples/resources/requests/example-request.json"],
  ["request", "docs/examples/resources/requests/example-liquid-request.json"],
  ["request", "docs/examples/resources/requests/example-system-request.json"],
  ["widget", "docs/examples/resources/widgets/example-widget.json"],
  ["variable", "docs/examples/resources/variables/example-variable.json"],
  ["function", "docs/examples/resources/functions/example-function.json"],
];

test("examples with descriptions satisfy the shared version 1 canonical contract", async () => {
  const codec = await getSharedCanonicalCodec();

  exampleResourceDefinitions.forEach(([resourceType, relativePath]) => {
    const resource = readTemplateJson(relativePath);
    const canonicalSource = codec.normalize({resourceType, resource});

    assert.equal(canonicalSource.contractVersion, 1);
    assert.equal(canonicalSource.formatVersion, 1);
    assert.equal(canonicalSource.description, resource.description);
  });
});

test("legacy request, widget, and variable resources remain valid without descriptions", async () => {
  const codec = await getSharedCanonicalCodec();

  exampleResourceDefinitions
    .filter(([resourceType]) => resourceType !== "function")
    .forEach(([resourceType, relativePath]) => {
      const resource = readTemplateJson(relativePath);
      delete resource.description;
      const canonicalSource = codec.normalize({resourceType, resource});

      assert.equal(Object.hasOwn(canonicalSource, "description"), false);
    });
});

function getSharedCanonicalCodec() {
  sharedCanonicalCodecPromise ??= buildSharedCanonicalCodec();
  return sharedCanonicalCodecPromise;
}

async function buildSharedCanonicalCodec() {
  const originalWorkingDirectory = process.cwd();
  process.chdir(apieaseRoot);
  const [{default: CanonicalResourceSourceCodec}, {default: CanonicalResourceDigestService}] =
    await Promise.all([
      import(pathToFileUrl("backend/service/projects/CanonicalResourceSourceCodec.js")),
      import(pathToFileUrl("backend/service/projects/CanonicalResourceDigestService.js")),
    ]).finally(() => process.chdir(originalWorkingDirectory));
  return new CanonicalResourceSourceCodec({
    canonicalJsonService: new CanonicalResourceDigestService(),
  });
}

function pathToFileUrl(relativePath) {
  return pathToFileURL(path.join(apieaseRoot, relativePath)).href;
}

function readTemplateJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(templateRoot, relativePath), "utf8"));
}
