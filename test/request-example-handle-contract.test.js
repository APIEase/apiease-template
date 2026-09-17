#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const requestExamplesDirectory = path.join(
  projectRoot,
  "docs",
  "examples",
  "resources",
  "requests",
);

function readJsonFile(fileName) {
  return JSON.parse(fs.readFileSync(path.join(requestExamplesDirectory, fileName), "utf8"));
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

function findParameter(parameters, parameterName) {
  return parameters.find((parameter) => parameter.name === parameterName);
}

const httpRequestExample = readJsonFile("example-request.json");
const liquidRequestExample = readJsonFile("example-liquid-request.json");
const systemRequestExample = readJsonFile("example-system-request.json");

[httpRequestExample, liquidRequestExample, systemRequestExample].forEach((requestExample) => {
  assert.equal(
    typeof requestExample.handle,
    "string",
    "Expected each request example to include a merchant-controlled handle.",
  );
  assert.equal(
    typeof requestExample.name,
    "string",
    "Expected each request example to retain name only as display text.",
  );
  assertNoServerId(requestExample);
  assert.equal(
    typeof requestExample.description,
    "string",
    "Expected each request example to describe the request's resource purpose.",
  );
});

const systemArgumentsParameter = findParameter(systemRequestExample.parameters, "arguments");
const systemArguments = JSON.parse(systemArgumentsParameter.value);

systemArguments.forEach((systemArgument, systemArgumentIndex) => {
  assert.equal(
    typeof systemArgument.handle,
    "string",
    `Expected System Request variable argument ${systemArgumentIndex + 1} to use handle as the stable identifier.`,
  );
  assert.equal(
    typeof systemArgument.name,
    "string",
    `Expected System Request variable argument ${systemArgumentIndex + 1} to keep name as display text.`,
  );
});

assert.doesNotMatch(
  systemArgumentsParameter.value,
  /appVariables/i,
  "Expected the System Request example not to describe appVariables as user-managed variable storage.",
);

assert.doesNotMatch(
  liquidRequestExample.liquid,
  /functionId/,
  "Expected the Liquid request example not to store or reference a server-owned Function id.",
);

console.log("request-example-handle-contract.test.js: passed");
