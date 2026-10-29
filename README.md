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

Function source files include `handle` as the target stable identifier. Pass that handle in the JSON Liquid Function tag's `functionId` field. Existing `functionName` calls remain supported; examples using them require the matching function name. Do not copy server-owned IDs into repository-managed examples.

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

Resource instructions are developer-written Markdown explaining how to create and
edit requests, widgets, variables, and functions. `apiease init` installs a checked
copy in `docs/resource-instructions/`; `apiease upgrade` maintains it. A script
copies content from APIEase's authoritative instruction bundle; it does not author
the instructions. Resource JSON under `resources/*` is the project source you edit.

Project instructions in `AGENTS.md`, `README.md`, and
`docs/shared-ongoing-ai-guidance.md` explain project structure and the CLI workflow.
Start with `AGENTS.md` and `docs/resource-instructions/README.md`. Read the index's
small required core and adapter envelope, then modules for the resource family,
request type, and provider involved. Reading instructions requires neither store
authentication nor a sibling APIEase checkout. Keep customer intent in the
conversation and durable project decisions in `CUSTOM_*` files.

1. Initialize with `apiease init my-project --from-existing-resources` and enter it.
   Plain `apiease init my-project` installs the template without authentication;
   use `git init` if needed and `apiease pull` to establish synchronization before
   project validation or apply.
2. Read installed project instructions and applicable resource instructions.
3. Inspect relevant resource JSON and dependencies, then edit canonical files.
4. Run `apiease validate` for the complete project without executing resources.
5. Run `apiease apply` when authorized, or `apiease apply --require-approval` for
   deferred review. Git diffs present edits; they grant no mutation authority.
6. When notified, preview `apiease upgrade --dry-run` and upgrade template files.

Use `apiease design-context` for current **project status**: resource inventory,
dependencies, local changes, and a **baseline check**. It requires authentication
and an initialized checkout, but is optional for reading instructions.

```bash
apiease design-context
apiease design-context --resource-path resources/requests/read-product-page.json
```

The **synchronization baseline** is the server state recorded after successful
synchronization or apply. A baseline check compares that recorded state with
current server state to detect intervening changes. It is separate from detecting
local edits and does not use Git commits as authority.

The command returns one JSON result on stdout. `result.inventory`, `dependencies`,
and `dependencyDiagnostics` cover the whole project. `localEdits.hasManagedEdits`
compares local content with the synchronization baseline; `differencesFromServer`
contains creates and updates relative to current server resources.
`baselineCheck.status` is `current` or `changed`, with details in `conflicts`.
A successful status read returns exit code 0 even when the baseline changed.
Reconcile deliberately before apply; validation and apply still enforce server
concurrency checks. Status does not synchronize or authorize changes.

`canonicalBodies` contains only sources selected with repeated `--resource-path`;
it is empty by default. Selection does not narrow inventory, dependencies,
validation, or apply. The command writes no instruction cache or context files.
Authentication and transport failures have no stale-state fallback.

Migration: instruction downloads, `--inline`, `--output-dir`, and
`--project-requirements` are retired. Read installed instructions after `init` or
`upgrade`; keep requirements in the conversation or `CUSTOM_*` files. Scripts must
consume the status fields above instead of `protocol`, `readFirst`, `files`, or
`cache`. CLI and server require design-context contract version 3; deploy them
together. Versions 1 and 2 fail explicitly. Other Project API and CLI JSON envelope
versions are unchanged. Invalid options exit 2; authentication/authorization,
contract, checkout-integrity, and service errors retain their existing exit codes.

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

It also includes shared agent guidance at `docs/shared-ongoing-ai-guidance.md` for project workflow navigation. Resource rules live in `docs/resource-instructions/`.

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

## Template upgrades

`apiease upgrade` updates project instructions, installed resource instructions,
and other template-managed files. It preserves `CUSTOM_*` guidance, resource JSON,
and operational bindings and synchronization state.

```bash
apiease upgrade --check
apiease upgrade --dry-run
apiease upgrade
apiease upgrade --on-conflict ignore
apiease upgrade --on-conflict overwrite
```

`--check` and `--dry-run` compare actual files and manifests as well as the recorded
template version; neither writes files. Exit code 0 means current; 1 means changes,
conflicts, or a failed check. `--dry-run --on-conflict overwrite` previews which
conflicting files would be replaced.

Unchanged managed files update normally. Differing local content is a conflict.
If the installed instruction manifest declares a higher protocol version, the CLI
reports it as newer; differing hashes and modification times do not establish age.
Interactive upgrades offer **Overwrite** or **Ignore**, defaulting to Ignore.
Scripts and agents use `--on-conflict overwrite|ignore`. Without an explicit
overwrite choice, noninteractive upgrades preserve and report conflicts without
prompting. Overwrite applies only to template-managed paths.

Resource instructions and their project entry points resolve as one set, so
ignoring a conflict preserves a coherent instruction set. Ignored paths remain
pending in template metadata and are not marked updated. An upgrade with unresolved
conflicts exits 1. Move custom guidance to `CUSTOM_*` before choosing overwrite.
Unrelated files remain untouched. The bundled product knowledge file retains its
existing always-refresh policy.

Template provenance lives in `.apiease/template.json` for operational checkouts,
and in `.apiease/project.json` before first synchronization. Older operational
checkouts without provenance treat differing existing files as conflicts; they do
not silently adopt those bytes as an unmodified template baseline.

`pull`, `validate`, `apply`, and `design-context` perform a shared, inexpensive
update check. Public templates use a commit feed without downloading the full
template; local development also compares template content. Available updates and
unavailable checks are reported on stderr, leaving JSON stdout unchanged. An
unavailable check does not mean current and does not block the requested command.
Checks never install updates. Use `upgrade --check` for a full file comparison.

## Maintaining the template

Maintainers synchronize instruction copies with:

```bash
npm run instructions:pull-local
npm run instructions:pull-local -- --check
npm run validate
```

Paths resolve from this repository, independently of the invocation directory.
By default the source is `../apiease`; use `APIEASE_SOURCE_DIRECTORY` or
`--source /absolute/path/to/apiease` elsewhere. The script verifies the static
manifest and copies only local-agent modules, the envelope, and a reading index.
Normal runs remove obsolete owned copies and preserve unrelated files. `--check`
writes nothing and fails for missing, changed, or obsolete owned files and selection
metadata. Missing source is an error. These are template-maintenance commands;
customers use `apiease validate` and need no sibling source checkout.

CI verifies source changes in APIEase and template changes here against explicit
checkouts. The template repository needs `APIEASE_SOURCE_READ_TOKEN` with read
access to private APIEase source. Manual workflows accept `source_ref` or
`template_ref` for coordinated changes. Land source and copied instruction updates
together; checks against `main` detect remaining mismatches. The maintenance workflow
is disabled in customer repositories created from this template.
