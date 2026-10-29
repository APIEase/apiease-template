#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function readProjectJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath));
}

function assertNoServerId(value, jsonPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, itemIndex) => assertNoServerId(item, `${jsonPath}[${itemIndex}]`));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    assert.notEqual(key, "id", `Expected ${jsonPath} not to store a server-owned id field.`);
    assertNoServerId(nestedValue, `${jsonPath}.${key}`);
  });
}

function assertLowercaseSlug(identifier, message) {
  assert.match(identifier, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message);
}

const exampleResourcePaths = [
  "docs/examples/resources/requests/example-request.json",
  "docs/examples/resources/requests/example-liquid-request.json",
  "docs/examples/resources/requests/example-system-request.json",
  "docs/examples/resources/variables/example-variable.json",
  "docs/examples/resources/functions/example-function.json",
  "docs/examples/resources/widgets/example-widget.json",
];

const handleFieldsByResourcePath = new Map([
  ["docs/examples/resources/requests/example-request.json", "handle"],
  ["docs/examples/resources/requests/example-liquid-request.json", "handle"],
  ["docs/examples/resources/requests/example-system-request.json", "handle"],
  ["docs/examples/resources/variables/example-variable.json", "handle"],
  ["docs/examples/resources/functions/example-function.json", "handle"],
  ["docs/examples/resources/widgets/example-widget.json", "handle"],
]);

exampleResourcePaths.forEach((relativePath) => {
  const exampleResource = readProjectJson(relativePath);
  const handleField = handleFieldsByResourcePath.get(relativePath);

  assertNoServerId(exampleResource, relativePath);
  assert.equal(
    typeof exampleResource[handleField],
    "string",
    `Expected ${relativePath} to include ${handleField} as its public handle field.`,
  );
  assertLowercaseSlug(
    exampleResource[handleField],
    `Expected ${relativePath} to use a lowercase slug handle.`,
  );
});

const variableExample = readProjectJson("docs/examples/resources/variables/example-variable.json");
assert.notEqual(
  variableExample.name,
  variableExample.handle,
  "Expected the variable example name to remain display text rather than the stable identifier.",
);

const functionExample = readProjectJson("docs/examples/resources/functions/example-function.json");
assert.notEqual(
  functionExample.name,
  functionExample.handle,
  "Expected the function example name to remain display text rather than the stable identifier.",
);

const systemRequestExample = readProjectJson(
  "docs/examples/resources/requests/example-system-request.json",
);
const systemArgumentsParameter = systemRequestExample.parameters.find(
  (parameter) => parameter.name === "arguments",
);
const systemArguments = JSON.parse(systemArgumentsParameter.value);

systemArguments.forEach((systemArgument, systemArgumentIndex) => {
  assert.deepEqual(
    Object.keys(systemArgument).filter((key) => key === "handle" || key === "name"),
    ["handle", "name"],
    `Expected System Request variable argument ${systemArgumentIndex + 1} to include handle and display name.`,
  );
  assertLowercaseSlug(
    systemArgument.handle,
    `Expected System Request variable argument ${systemArgumentIndex + 1} to use a handle slug.`,
  );
  assert.notEqual(
    systemArgument.name,
    systemArgument.handle,
    `Expected System Request variable argument ${systemArgumentIndex + 1} name to be display text.`,
  );
});

console.log("unified-handle-contract.test.js: passed");
