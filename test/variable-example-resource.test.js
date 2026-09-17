#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const exampleVariablePath = path.join(
  projectRoot,
  "docs",
  "examples",
  "resources",
  "variables",
  "example-variable.json",
);

assert.ok(
  fs.existsSync(exampleVariablePath),
  "Expected a bundled variable example at docs/examples/resources/variables/example-variable.json.",
);

const exampleVariable = JSON.parse(fs.readFileSync(exampleVariablePath, "utf8"));

assert.deepEqual(
  Object.keys(exampleVariable),
  ["handle", "name", "description", "value", "sensitive"],
  "Expected the variable example to include the optional resource description.",
);

assert.equal(
  typeof exampleVariable.handle,
  "string",
  "Expected the variable example to include a merchant-controlled handle.",
);

assert.match(
  exampleVariable.handle,
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Expected the variable handle to be a lowercase slug identifier.",
);

assert.equal(
  typeof exampleVariable.name,
  "string",
  "Expected the variable example to include a human-readable display name.",
);

assert.notEqual(
  exampleVariable.name,
  exampleVariable.handle,
  "Expected the variable name to be display text rather than the stable identifier.",
);

assert.equal(
  typeof exampleVariable.description,
  "string",
  "Expected the variable example to describe the variable's resource purpose.",
);

assert.deepEqual(
  exampleVariable.value,
  {mode: "preserve"},
  "Expected the sensitive variable example to use the protected preserve placeholder.",
);

assert.equal(
  typeof exampleVariable.sensitive,
  "boolean",
  "Expected the variable example to include the sensitive flag.",
);

assert.ok(
  !Object.hasOwn(exampleVariable, "id"),
  "Expected the variable example not to store a server-owned id.",
);

console.log("variable-example-resource.test.js: passed");
