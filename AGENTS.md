# APIEase Agent Entry Point

This public template provides project structure and workflow navigation. The
server's verified design references own current resource-authoring rules.

## Start here

1. Read `CUSTOM_AGENT_GUIDANCE.md` and `CUSTOM_README.md` for customer intent.
2. Read the project workflow in `docs/shared-ongoing-ai-guidance.md`.
3. Run `apiease design-context` in an initialized checkout. Read its `readFirst`
   files, then the applicable modules in `files.instructionIndex`. Select by actual
   resource family, request type and provider; do not load unrelated modules.
4. Inspect inventory and local changes. Read the relevant canonical files and
   dependency sources. Search `docs/knowledgebase/apiEaseDocsConsolidated.md` only
   for additional product topics needed by the task; do not read it all at startup.

The user's conversation normally supplies the task. Do not invent or restate
requirements just to call `design-context`; `--project-requirements` is optional.
If this CLI does not list `--inline` in `apiease --help`, update it for the compact
reference workflow. An older server can be used explicitly with `--inline`.

## Ownership

- Edit resource source under the configured directories in `apiease.config.js`.
  The server owns live resources; the CLI owns bindings, baselines and cache files.
- `AGENTS.md`, `README.md`, and shared workflow guidance are template-owned.
  `apiease upgrade` maintains them independently of protocol refresh.
- The `CUSTOM_*` files are customer-owned. Preserve them and existing local edits.
- `design-context` refreshes CLI-owned references after authenticating to the
  current server. Never edit, commit, or copy those references into custom guidance.
- Do not hand-edit operational metadata or infer deletion from missing files.
  Follow the rename, explicit deletion, validation and apply workflow in `README.md`.
- Keep this template small. Do not add frameworks or unrelated scaffolding.

## Maintaining this template

Keep shared resource semantics in the server protocol, product documentation in
`../apiease-docs`, and project-specific decisions in `CUSTOM_*`. Do not add another
copy of protocol instructions or Liquid runtime examples here.

Never edit `apiEaseDocsConsolidated.md` directly. After public source changes,
run `knowledge:build` and `knowledge:check` in `../apiease-docs/docs`, then
`knowledge:pull-local` and `knowledge:pull-local -- --check` in `apiease`,
`apiease-cli`, and this repository. Report failed or unavailable refreshes.

Every implementation handoff includes a proposed imperative commit message under
about 72 characters, ending with a period, on a `Commit message:` line.
