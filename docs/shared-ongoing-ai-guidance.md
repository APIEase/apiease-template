# Local APIEase Project Workflow

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

Use `apiease design-context` for current inventory or a baseline check when needed.
Select current server source with `--resource-path`. It does not install instructions
or write operational state. Reconcile changed baselines deliberately before apply.
Use supported rename and explicit deletion workflows in `README.md`; never infer
deletion from a missing file or hand-edit operational bindings and baselines.

Use `--on-conflict ignore` to preserve conflicting template instructions or
`--on-conflict overwrite` to replace the set after reviewing the upgrade preview.
Never edit copied resource instructions or generated product knowledge directly.
Search the product knowledge by topic when needed. Preserve CUSTOM_* guidance and
existing resource edits; report observed results and outstanding configuration.
