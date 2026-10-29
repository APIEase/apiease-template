# Local APIEase Project Workflow

This file owns workflow navigation. Resource-authoring semantics come from the
verified modules returned by `apiease design-context`; do not duplicate them here.

1. Initialize a new project with `apiease init --from-existing-resources`, or use
   `apiease pull` to establish a recognized existing checkout. Refresh an existing
   baseline deliberately; preserve local edits and reconcile conflicts first.
2. Run `apiease design-context`. It authenticates, checks the current baseline,
   verifies protocol modules and refreshes local references. Read `readFirst`, then
   the indexed modules for the actual resource families, request types and providers.
   Requirements already in the conversation need no argument.
3. Inspect the complete inventory and local changes. Read only relevant resource
   files and dependencies. `--resource-path resources/requests/<handle>.json`
   retrieves a selected current server source; repeat it for additional paths.
4. Edit complete canonical files in the configured `resources/*` directories.
   Use `apiease rename` for bound renames. Express an authorized deletion through
   the family `delete/<handle>.json` workflow described in `README.md`.
5. Run `apiease validate` for the complete change set. It does not execute resources.
6. Use `apiease apply` when immediate application is authorized, or
   `apiease apply --require-approval` for deferred review. Follow the customer's
   review requirements. Report observed results and outstanding configuration.

`apiease upgrade --dry-run` previews template changes; `apiease upgrade` applies
safe template updates. It does not refresh live resources or protocol authority.
`design-context` does not upgrade template files or edit `CUSTOM_*` guidance.
Git diff is a presentation of edits, never the operational baseline or approval.

The compact default reuses verified static module bytes only after a fresh server
request. References live beside checkout-local Git state, outside versioned source.
They are not an offline baseline or permission to apply. Authentication failures,
conflicts, invalid protocol content and unavailable servers still stop the command.
Use `--inline` for full JSON or `--output-dir <new-directory>` for a standalone
capture. See `README.md` for those delivery modes and compatibility.

Record durable project decisions in `CUSTOM_AGENT_GUIDANCE.md` or `CUSTOM_README.md`.
Search the generated product reference by topic when additional documentation is
needed. Do not modify generated knowledge, protocol references or operational state.
