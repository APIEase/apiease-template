# APIEase Agent Entry Point

## Start here

1. Read `CUSTOM_AGENT_GUIDANCE.md` and `CUSTOM_README.md` for customer intent.
2. Read `docs/shared-ongoing-ai-guidance.md` for the project workflow.
3. Read the installed `docs/resource-instructions/README.md` reading index, its
   required core and adapter envelope, then applicable resource-specific modules.
4. Inspect relevant resource JSON and dependencies. Search
   `docs/knowledgebase/apiEaseDocsConsolidated.md` by topic when needed; do not load
   the whole product reference at startup.

Resource instructions are developer-written Markdown copied by a script from
APIEase's authoritative bundle. `init` and `upgrade` install them locally.
No live service is needed to read them. `design-context` optionally reports current
project status; it is not an instruction-download step.

## Ownership and workflow

- Edit canonical resource JSON in the configured `resources/*` directories.
  Run `apiease validate`, then apply only when authorized by the customer.
- Keep customer requirements in the conversation and project decisions in
  `CUSTOM_*` files. Preserve customer guidance and existing resource edits.
- Project instructions and `docs/resource-instructions/` are template-managed.
  Preview `apiease upgrade --dry-run` when notified. Conflicts offer overwrite or
  ignore; use `--on-conflict overwrite|ignore` explicitly in noninteractive work.
  Ignore preserves the instruction set and leaves the upgrade pending.
- The server owns live resources; the CLI owns operational bindings and the
  synchronization baseline. A baseline check detects intervening server changes,
  separately from local edits. Git history grants no mutation authority.
- Do not hand-edit operational metadata or infer deletion from missing files.
  Follow `README.md` for rename, explicit deletion, validation, and apply.
- Keep this template small; do not add unrelated frameworks or scaffolding.

## Maintaining this template

Change resource instructions in `../apiease/contracts/project-design/v1/`, then
run `npm run instructions:pull-local` here. `npm run validate` runs tests and a
read-only freshness check. Set `APIEASE_SOURCE_DIRECTORY` or pass `--source` to
select an authoritative source checkout. Missing source fails validation.
These are template-maintenance commands; store projects use `apiease validate`
and need no sibling source checkout.

For the single-developer workflow, refresh from the current local source and run
`npm run validate` before pushing. Refreshing copies files; it does not fetch Git
updates. CI runs `npm run validate:ci` using only this repository: standalone tests
and a generated instruction snapshot fingerprint. CI checks the committed copy's
integrity; local validation checks freshness against source. Source-dependent tests
live in `test/source/` and remain part of local validation. No cross-repository
Actions secret is required.

Never edit `apiEaseDocsConsolidated.md` directly. After public article changes,
run `knowledge:build` and `knowledge:check` in `../apiease-docs/docs`, then
`knowledge:pull-local` and `knowledge:pull-local -- --check` in `apiease`,
`apiease-cli`, and this repository. Report failed or unavailable refreshes.

Every implementation handoff includes a proposed imperative commit message under
about 72 characters, ending with a period, on a `Commit message:` line.
