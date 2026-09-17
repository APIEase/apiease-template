#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const exampleWidgetPath = path.join(
  projectRoot,
  "docs",
  "examples",
  "resources",
  "widgets",
  "example-widget.json",
);

assert.ok(
  fs.existsSync(exampleWidgetPath),
  "Expected a bundled widget example at docs/examples/resources/widgets/example-widget.json.",
);

const exampleWidget = JSON.parse(fs.readFileSync(exampleWidgetPath, "utf8"));
const templateReadme = fs.readFileSync(path.join(projectRoot, "README.md"), "utf8");

assert.deepEqual(
  Object.keys(exampleWidget),
  [
    "handle",
    "name",
    "description",
    "liquid",
    "javascript",
    "externalJavascriptUrls",
    "disableJavascript",
  ],
  "Expected the widget example to use the canonical public widget source fields.",
);

assert.equal(
  typeof exampleWidget.description,
  "string",
  "Expected the widget example to describe the widget's resource purpose.",
);

assert.doesNotMatch(
  JSON.stringify(exampleWidget),
  /"(?:id|widgetId|widgetHandle|widgetName)"\s*:/,
  "Expected the widget example not to store server-owned id metadata or legacy widget fields.",
);

assert.equal(
  typeof exampleWidget.handle,
  "string",
  "Expected the widget example to include handle as the public handle field.",
);
assert.match(
  exampleWidget.handle,
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Expected handle to be a lowercase slug identifier.",
);
assert.equal(
  typeof exampleWidget.name,
  "string",
  "Expected the widget example to include name as display text.",
);
assert.notEqual(
  exampleWidget.name,
  exampleWidget.handle,
  "Expected name to remain display text instead of the stable identifier.",
);

assert.match(
  templateReadme,
  /Widget source files use `handle` as the stable source identifier and `name` as display text\./,
  "Expected README.md to align widget field language with the unified handle contract.",
);

console.log("widget-example-resource.test.js: passed");
