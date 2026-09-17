#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const exampleFunctionPath = path.join(
  projectRoot,
  "docs",
  "examples",
  "resources",
  "functions",
  "example-function.json",
);

assert.ok(
  fs.existsSync(exampleFunctionPath),
  "Expected a bundled function example at docs/examples/resources/functions/example-function.json.",
);

const exampleFunction = JSON.parse(fs.readFileSync(exampleFunctionPath, "utf8"));

assert.deepEqual(
  Object.keys(exampleFunction),
  ["handle", "name", "description", "type", "parameters", "liquid"],
  "Expected the function example to use the handle-first Function source fields.",
);

assert.doesNotMatch(
  JSON.stringify(exampleFunction),
  /"id"\s*:/,
  "Expected the function example not to store server-owned id metadata.",
);
assert.equal(exampleFunction.type, "liquid", "Expected the example function type to be 'liquid'.");
assert.equal(typeof exampleFunction.handle, "string", "Expected the example function to include a handle.");
assert.match(
  exampleFunction.handle,
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Expected the example function handle to be a lowercase slug identifier.",
);
assert.equal(typeof exampleFunction.name, "string", "Expected the example function to include a name.");
assert.notEqual(
  exampleFunction.name,
  exampleFunction.handle,
  "Expected the function name to remain display text instead of the stable identifier.",
);
assert.equal(
  typeof exampleFunction.description,
  "string",
  "Expected the example function to include a resource-purpose description.",
);
assert.ok(
  Array.isArray(exampleFunction.parameters),
  "Expected the example function to include a parameters array.",
);
assert.equal(
  typeof exampleFunction.liquid,
  "string",
  "Expected the example function to include Liquid source.",
);

const supportedParameterTypes = new Set(["string", "number", "boolean", "object", "array"]);

exampleFunction.parameters.forEach((parameterDefinition, parameterIndex) => {
  assert.deepEqual(
    Object.keys(parameterDefinition),
    ["name", "description", "type"],
    `Expected parameter ${parameterIndex + 1} to use only documented parameter fields.`,
  );
  assert.equal(
    typeof parameterDefinition.name,
    "string",
    `Expected parameter ${parameterIndex + 1} to include a name.`,
  );
  assert.equal(
    typeof parameterDefinition.description,
    "string",
    `Expected parameter ${parameterIndex + 1} to include a description.`,
  );
  assert.ok(
    supportedParameterTypes.has(parameterDefinition.type),
    `Expected parameter ${parameterIndex + 1} to use a documented parameter type.`,
  );
});

assert.ok(
  exampleFunction.parameters.every(parameter => parameter.description !== exampleFunction.description),
  "Expected parameter descriptions to explain inputs instead of repeating the function purpose.",
);

assert.match(
  exampleFunction.liquid,
  /{{\s*normalized_/,
  "Expected the example function Liquid to render reusable output from assigned values.",
);

console.log("function-example-resource.test.js: passed");
