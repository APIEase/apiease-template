# Shared Ongoing AI Guidance

Use this file for shared implementation lessons that should apply across APIEase projects.

Add concise, reusable guidance here when real-world implementation work reveals behavior that agents should not re-learn project by project.

## APIEase Resource Identifier Guidance

Use these directives when creating or reviewing repository-managed APIEase resources, examples, Liquid, CLI commands, and docs.

- Treat requests, widgets, variables, and functions as first-class APIEase resources with a server-owned immutable `id`, a merchant-controlled `handle`, and a human-readable `name`.
- Prefer `handle` as the stable public identifier for resources. Do not store server-owned `id` values in template resource source files or examples. Use `name` only as display text.
- For resource source files, `handle` is the stable repository identifier. Handles should be lowercase slugs using letters, numbers, and hyphens, for example `product-details-proxy`.
- For CLI read, update, and delete flows, prefer the resource-specific handle flags: `--request-handle`, `--widget-handle`, `--variable-handle`, and `--function-handle`. Legacy flags such as `--request-id`, `--widget-id`, `--variable-name`, and `--function-id` remain compatibility aliases; pass handles through them only when maintaining older scripts.
- When a request, widget, variable, or function source file has a valid `handle`, `apiease create <resource> --file <path>` is idempotent: it creates the resource when the handle does not exist and updates the existing resource when it does. Lookup failures other than not found stop the command instead of falling back to create.
- For older request source files that still contain `id` metadata or no `handle`, use `apiease create request --file <path> --auto-update-source-identifier` to migrate only the local identifier metadata.
- APIEase request invocation surfaces may still use the parameter name `requestId`. In Liquid `call` tags, storefront calls, remote calls, and Flow conditions, provide or compare the request handle as the `requestId` value whenever possible.
- For chained request references, prefer the request handle when the APIEase surface supports it. Use names only as compatibility fallback display identifiers.

## Unified Project Workflow

Use this thin CLI workflow when the Codex Project Designer manages a complete APIEase project. The CLI supplies the authoritative shared design policy; do not recreate that policy in this repository.

1. Create a checkout with `apiease init <project-name>` or `apiease init <project-name> --from-existing-resources`. In an existing checkout, run `apiease pull`. Existing-resource initialization and pull return a stable canonical snapshot from Mongo authority and preserve local-edit protection.
2. Run `apiease design-context`; requirements already in the conversation need no CLI arguments. For local file delivery, check that `apiease --help` lists `--output-dir`, then use `apiease design-context --output-dir <new-directory>` as described in `README.md`. Read the returned instructions and Codex envelope, inspect inventory and local changes, and retrieve relevant server resource entries as needed. The full result remains available in `context.json`. Both delivery modes retain protocol verification and baseline conflict checks, and neither applies changes or rewrites canonical resources. Never manufacture requirements to retrieve context.
3. Edit the deterministic Canonical Resource Source encodings under `resources/requests`, `resources/widgets`, `resources/variables`, and `resources/functions`. These files are a local design surface; Mongo remains live resource authority.
4. Rename a bound resource with `apiease rename <request|widget|variable|function> <old-handle> <new-handle>`. A manual file move is not a valid rename.
5. Express deletion explicitly by moving the still-canonical bound file to `resources/<family>/delete/<handle>.json`. Missing files do not mean delete. The CLI moves receipt-proven committed deletions to `resources/<family>/archive/<handle>.json`; validation, conflicts, and transport failures do not archive them.
6. Run `apiease validate`. Validation checks the complete change set without executing resources, calling providers, mutating live state, changing checkout state, or archiving deletion intent.
7. Run `apiease apply` for explicit personal immediate apply, or `apiease apply --require-approval` to store the exact immutable Project Change Artifact and create a Project Proposal for deferred review. Both modes use the same canonical change-set validation and planning path.

Use Git diff only as a local human-readable presentation of edits. It is not resource authority, a baseline, a submitted artifact, or approval evidence.

Use `apiease upgrade` to maintain template-owned files. Context export only writes
the explicitly requested new directory; it does not refresh the template or create
an automatically reusable protocol cache. Retrieve fresh context for new work.
Search the consolidated product reference for the relevant topic instead of
reading the whole bundle at startup. This does not make the returned authoring
instructions optional.

Never resolve a baseline, resource-version, idempotency, already-exists, or projection conflict automatically. Preserve the intended canonical source and deletion files, run a verified `apiease pull`, reconcile the difference deliberately, then validate and apply again.

## Canonical Source And Protected Values

- Canonical source contains project intent only. Do not add server IDs, `resourceVersion`, `liveRevision`, persistence versions, timestamps, ciphertext, credentials, provider responses, or other generated operational state.
- Do not hand-author `.apiease/project.json`, ignored checkout metadata, baselines, resource bindings, apply receipts, or deletion archive transitions. The CLI owns them.
- Never write a raw protected value to canonical source, logs, output, delete/archive files, or checkout metadata.
- A protected request parameter or sensitive variable uses exactly the canonical secret-free preserve placeholder, `{ "mode": "preserve" }`, in its value field. This marker is source syntax, not a secret and not proof that a value exists.
- The CLI derives secure-input intent outside canonical files: `preserve` for an already bound protected target and `defer` for a new protected target. `defer` creates an explicit unset value; it is not an empty string and does not persist the placeholder as a secret.
- Required deferred values are reported only by safe resource type, handle, and field path. Configure them later in the authenticated APIEase UI. Runtime use fails safely before provider execution until each required value is configured, while Git remains secret-free.

## APIEase Liquid Runtime Constraints

Use these directives when generating or reviewing Liquid for APIEase.

These directives come from real runtime failures observed during client validation. Treat them as stricter-than-standard Liquid constraints for APIEase.

## Required Directives

- Do not place filtered expressions directly in `if` conditions in APIEase Liquid. Compute filtered values with `assign` first, then compare plain variables.
- Do not assume nested response properties are null-safe in APIEase Liquid. Check key presence before dereferencing paths like `response.data.errors` or `result.userErrors`.

## Known Failure Modes

### 1. Filters Inside `if` Conditions Can Fail To Parse

Observed error:

```text
Error during liquid call dispatch: expected ":" after filter name, line:55, col:51
```

Problem pattern:

```liquid
{% if header_columns[0] | remove: '"' | strip != 'EXPECTED_PRODUCT_CODE' %}
```

Safe pattern:

```liquid
{% assign first_header = header_columns[0] | remove: '"' | strip %}
{% if first_header != 'EXPECTED_PRODUCT_CODE' %}
```

### 2. Nested Property Access Is Not Null-Safe

Observed error:

```text
Error during liquid call dispatch: undefined variable: batch_response.data.errors, line:253, col:21
```

Problem pattern:

```liquid
{% assign errors = batch_response.data.errors %}
{% assign user_errors = mutation_result.userErrors %}
```

Safe pattern:

```liquid
{% assign batch_response_json = batch_response | json %}
{% if batch_response_json contains '"errors"' %}
  {% assign errors = batch_response.data.errors %}
{% endif %}
```

Apply the same pattern to any nested path. Confirm the parent payload contains the key before dereferencing the nested property.
