# APIEase Template

This repository is the minimal starter template used by general `apiease` users for new APIEase projects.

Most users should consume this template through the CLI with `apiease init` instead of cloning the repository directly.

Install the CLI globally with:

```bash
npm install -g apiease
```

The goal of this template is to provide a small, neutral starting point with a simple configuration file and a `resources/` directory that mirrors the core APIEase resource model:

- `resources/requests`
- `resources/widgets`
- `resources/variables`
- `resources/functions`

The included example files are intentionally lightweight, but they now use the strict public API field shapes so they can serve as valid starting points instead of loose placeholders.

Current examples:

- `docs/examples/resources/requests/example-request.json`: HTTP request example covering its resource purpose, common top-level fields, all HTTP parameter types, and all trigger types.
- `docs/examples/resources/requests/example-liquid-request.json`: Liquid request example showing its resource purpose and the `liquid` field.
- `docs/examples/resources/requests/example-system-request.json`: System request example showing its resource purpose and required `system` parameters.
- `docs/examples/resources/widgets/example-widget.json`: Widget example with a resource-purpose description, `handle` as its stable identifier, and `name` as display text.
- `docs/examples/resources/variables/example-variable.json`: Variable example with a resource-purpose description, stored value, and `sensitive` field.
- `docs/examples/resources/functions/example-function.json`: Function example with a resource-purpose description, handle-first saved Function shape, and separately described Liquid parameters.

## Managing Resources With apiease

This template supports both direct resource CRUD and the complete `apiease` project workflow. Use direct commands for individual resources and the project workflow for repository-scale changes.

Supported resource types:

- `request`
- `widget`
- `variable`
- `function`

### Direct resource CRUD

Common direct commands:

```bash
apiease create request --file docs/examples/resources/requests/example-request.json
apiease create widget --file docs/examples/resources/widgets/example-widget.json
apiease create variable --file docs/examples/resources/variables/example-variable.json
apiease create function --file docs/examples/resources/functions/example-function.json

apiease read request --request-handle <request-handle>
apiease read widget --widget-handle <widget-handle>
apiease read variable --variable-handle <variable-handle>
apiease read function --function-handle <function-handle>

apiease update request --request-handle <request-handle> --file docs/examples/resources/requests/example-request.json
apiease update widget --widget-handle <widget-handle> --file docs/examples/resources/widgets/example-widget.json
apiease update variable --variable-handle <variable-handle> --file docs/examples/resources/variables/example-variable.json
apiease update function --function-handle <function-handle> --file docs/examples/resources/functions/example-function.json

apiease delete request --request-handle <request-handle>
apiease delete widget --widget-handle <widget-handle>
apiease delete variable --variable-handle <variable-handle>
apiease delete function --function-handle <function-handle>
```

Requests, widgets, variables, and functions should use `handle` as the stable public identifier. Use `name` only as display text. Server-owned `id` values are APIEase metadata and should not be stored in template resource source files or examples.

The top-level `description` explains the resource's purpose, behavior, and relevant relationships. It round-trips through canonical project files and may be an empty string. It is required for functions and optional for requests, widgets, and variables. Existing request, widget, and variable files without `description` remain valid, so do not add a default while reading or rewriting them. Include a description when it helps a reviewer understand the resource, and preserve an omitted description unless the intended edit adds one.

Function parameter `description` fields explain individual inputs and remain separate from the function's top-level resource description. Keep parameter descriptions focused on the value a caller supplies; use the top-level description for what the Function does and how it relates to other resources.

Create commands read the resource handle from the JSON file. Widget source files use `handle` as the stable source identifier and `name` as display text. Older widget files that use `widgetHandle` or `widgetName` should be migrated before new CLI-driven work.

Function source files include `handle` as the target stable identifier. The current Liquid Function tag supports `functionName` or `functionId`, but not a handle-named field yet. Until that Liquid invocation contract lands, Liquid examples use `functionName` as the compatibility fallback and avoid server-owned `functionId` values.

Prefer the handle-named `--request-handle`, `--widget-handle`, `--variable-handle`, and `--function-handle` options for read, update, and delete flows. The older `--request-id`, `--widget-id`, `--variable-name`, and `--function-id` option names remain compatibility aliases; pass resource handles through those aliases only when maintaining older scripts.

`apiease create` is idempotent by `handle` for request, widget, variable, and function source files. When a source file has a valid `handle`, the CLI looks up the remote resource by handle, updates it when found, and creates it when missing.

Lookup failures other than not found stop the command instead of falling back to create. Human output reports either `<Resource> created successfully.` or `<Resource> updated successfully.`, and JSON output includes `operation` as `created` or `updated`.

For older request files that still contain `id` or no `handle`, run `apiease create request --file <path> --auto-update-source-identifier` to migrate only the local identifier metadata.

### Complete project workflow

Initialize a new project or a checkout from resources already stored in APIEase:

```bash
apiease init my-project
apiease init my-project --from-existing-resources
cd my-project
```

Initialization uses the fixed public `APIEase/apiease-template` checkout. The `--from-existing-resources` mode retrieves and verifies a stable canonical snapshot from Mongo, the live resource authority, then overlays its canonical files. Run `apiease pull` later to retrieve the latest stable Mongo snapshot. A normal pull refuses to overwrite direct managed-file edits; use `apiease pull --force` only when you deliberately intend to discard those edits. Pull never merges local and server source automatically.

Before designing or editing a complete project, obtain the authenticated design context:

```bash
apiease design-context
```

This command provides the effective APIEase Project Design Protocol version and common-instruction digest, the common instructions, authenticated project context, local baseline and edits, and the Codex execution envelope. Follow that returned protocol instead of treating this template as an independently maintained design policy.

Edit canonical source only in the four configured directories:

- `resources/requests`
- `resources/widgets`
- `resources/variables`
- `resources/functions`

Each direct resource file is a deterministic encoding of a Canonical Resource Source object, its filename matches its lowercase handle, and `name` is display text. Files are the local design surface, not a separate authority domain; Mongo remains live resource authority. Do not put server-owned IDs, resource or live versions, persistence metadata, credentials, raw protected values, or generated checkout state in these files. The CLI owns `.apiease/project.json`, ignored resource bindings and baselines, apply receipts, and generated operational transitions; do not hand-author them.

Validate the complete candidate before submission:

```bash
apiease validate
```

Validation is non-executing. It checks schema, canonical bytes, paths, bounds, digests, references, bindings, deletion intent, and secure-input authorization without mutating APIEase, executing resources, calling external providers, changing ignored local state, or archiving deletion files.

### Renames and explicit deletions

Rename a bound resource with the CLI so its immutable binding remains intact:

```bash
apiease rename request old-handle new-handle
```

The command supports `request`, `widget`, `variable`, and `function`. It updates the canonical filename, handle, and ignored binding locally. Manually renaming or removing a bound direct file is a local-integrity error, not a rename or deletion.

Express deletion by moving the still-canonical bound file to its family delete directory:

```text
resources/functions/delete/<handle>.json
resources/requests/delete/<handle>.json
resources/variables/delete/<handle>.json
resources/widgets/delete/<handle>.json
```

An absent file never implies deletion. The live direct file and its delete intent cannot coexist. Only after a committed or replayed receipt proves the deletion does the CLI move it to the matching `archive/<handle>.json` path. Validation, conflicts, and transport failures leave deletion intent unarchived.

### Apply and conflicts

Personal terminal use applies immediately and noninteractively:

```bash
apiease apply
```

The CLI builds one Canonical Resource Change Set, validates it, obtains an exact plan, and conditionally commits that same plan. Immediate apply does not create a pending proposal. A committed or replayed outcome updates ignored local state and archives only receipt-proven deletions.

When review must happen before any live mutation, submit the same exact change set for deferred approval:

```bash
apiease apply --require-approval
```

Deferred submission stores an immutable Project Change Artifact and creates a Project Proposal. It does not mutate live resources before approval. Review and approved apply remain bound to that artifact and recheck the Mongo baseline.

The CLI never resolves baseline, resource-version, already-exists, idempotency, or projection conflicts automatically. Preserve the intended source and deletion files, run a verified `apiease pull`, reconcile deliberately, then validate and apply again.

### Deferred protected values

Canonical source never contains raw protected values. A sensitive request parameter or variable uses the canonical secret-free value marker:

```json
{"mode":"preserve"}
```

The marker is source syntax, not a secret value. The CLI derives `preserve` outside canonical source for an existing bound target and `defer` for a new protected target. Deferred means explicitly unset; it is not an empty string and the placeholder is never stored as the secret. CLI results expose only safe resource-type, handle, and field-path selectors. Configure every deferred value later in the authenticated APIEase UI; runtime use fails safely before provider execution until it is configured, while canonical Git source remains secret-free.

The lightweight files under `docs/examples/resources` remain reference examples for the four resource families. Copy their resource concepts into the canonical checkout shape produced by `init --from-existing-resources` or `pull` rather than treating examples as generated operational metadata.

Git diff may help a human review local edits, but it is only a presentation. It is not live resource authority, the Mongo baseline, a submitted Project Change Artifact, or approval evidence.

The template also includes a bundled snapshot of the public APIEase docs from `https://docs.apiease.com` at `docs/knowledgebase/apiEaseDocsConsolidated.md` so coding agents can understand the platform and configure project resources correctly.

It also includes shared agent guidance at `docs/shared-ongoing-ai-guidance.md` for implementation lessons that apply across APIEase projects, such as stricter runtime constraints discovered during real-world Liquid request work.

## Customization Files

This template keeps the default template guidance separate from project-specific customization.

- `README.md` and `AGENTS.md` are the template-owned defaults.
- `docs/shared-ongoing-ai-guidance.md` is template-owned shared implementation guidance for agents.
- `docs/knowledgebase/apiEaseDocsConsolidated.md` is the template-owned APIEase product reference generated from `https://docs.apiease.com`.
- `CUSTOM_README.md` is the intended place for user-specific project documentation.
- `CUSTOM_AGENT_GUIDANCE.md` is the intended place for user-specific agent instructions.

## Agent Guidance

This template is designed to work well with coding agents such as Codex, Claude, and GitHub Copilot.

- `AGENTS.md` contains the template-owned default guidance for agents.
- `docs/shared-ongoing-ai-guidance.md` contains template-owned ongoing implementation guidance that applies across projects.
- `docs/knowledgebase/apiEaseDocsConsolidated.md` contains the APIEase product knowledge from `https://docs.apiease.com` that agents should use when configuring resources.
- `CUSTOM_README.md` contains project-specific documentation for humans and agents.
- `CUSTOM_AGENT_GUIDANCE.md` is the intended place for users to add project-specific agent instructions.
- `CLAUDE.md` and `.github/copilot-instructions.md` provide compatibility entry points for tools that look for those filenames.

When extending this template into a real project, keep project-specific documentation in `CUSTOM_README.md` and project-specific agent instructions in `CUSTOM_AGENT_GUIDANCE.md` so those customizations stay separate from the template defaults and shared guidance.
