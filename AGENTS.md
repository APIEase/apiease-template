# Agent Guidance

## Purpose
This repository is the public starter template used by general `apiease-cli` users for new APIEase projects.

Agents working in this repository should optimize for clarity, minimalism, and template suitability. This is not an application repository with an established runtime, test suite, or framework stack.

## Instruction Order
Before making changes, read these files in this order:

1. `AGENTS.md`
2. `docs/shared-ongoing-ai-guidance.md`
3. `docs/knowledgebase/apiEaseDocsConsolidated.md`
4. `CUSTOM_AGENT_GUIDANCE.md`
5. `CUSTOM_README.md`
6. `README.md`

`AGENTS.md`, `README.md`, and `docs/shared-ongoing-ai-guidance.md` are template-owned defaults. `CUSTOM_AGENT_GUIDANCE.md` and `CUSTOM_README.md` are the intended places for project-specific customization.

`docs/knowledgebase/apiEaseDocsConsolidated.md` is a generated, consolidated snapshot of the public APIEase docs at `https://docs.apiease.com`. When maintaining this template repository, that snapshot is imported from `../apiease-docs/knowledgebase/apiEaseDocsConsolidated.md`, but public template users should understand the source as `https://docs.apiease.com`. Use it for broad APIEase product context, but do not manually add template-specific guidance there because it will be overwritten by the next documentation import.

If the custom files contain project-specific instructions, treat them as the user-editable guidance layer for this project. If they conflict with this file, follow the more specific instruction unless it would break the template's core structure.

## What To Do
- Help users create or modify APIEase resource files and configuration.
- For repository-scale Project Design, start with `apiease init` or `apiease init --from-existing-resources`, refresh from the stable Mongo snapshot with `apiease pull`, then run `apiease design-context`. Follow the returned versioned APIEase Project Design Protocol instructions, verified common-instruction digest, authenticated project context, and Codex execution envelope.
- Treat files under the configured resource directories as deterministic encodings of Canonical Resource Source objects. Mongo is live authority; local files are the Codex Project Designer's editing surface, not a separate resource authority.
- After editing, run `apiease validate`. Use `apiease apply` for an explicit personal immediate apply, or `apiease apply --require-approval` to submit the exact change set for deferred review as a Project Proposal.
- Use `apiease rename <resource-type> <old-handle> <new-handle>` for a bound resource rename. Express deletion only with the resource-family `delete/<handle>.json` workflow described in `README.md`; never infer deletion from an absent file.
- Use `docs/knowledgebase/apiEaseDocsConsolidated.md` as the primary product reference for how APIEase works and how requests, widgets, variables, functions, and triggers should be configured.
- Keep reusable agent implementation lessons in `docs/shared-ongoing-ai-guidance.md`, not in the generated knowledge base snapshot.
- Treat `apiease.config.js` as the source of truth for resource directory names.
- Treat requests, widgets, functions, and variables as first-class APIEase resources with a server-owned immutable `id`, a merchant-controlled `handle`, and a human-readable `name`.
- Use `handle` as the preferred stable public identifier for requests, widgets, functions, and variables in source files, examples, CLI usage, Liquid references, System Request arguments, and documentation.
- Do not store server-owned `id` values in template resource source files or examples. Use `name` only as display text, not as the preferred resource identifier.
- Use the top-level `description` for a resource's purpose, behavior, and relevant relationships. It is required for functions and optional for requests, widgets, and variables. Preserve omission in legacy optional-description files instead of inventing defaults. Function parameter descriptions explain individual inputs and do not replace the Function's top-level resource description.
- Keep canonical source free of `resourceVersion`, `liveRevision`, persistence versions, credentials, raw protected values, and other operational metadata. A protected field uses the canonical secret-free preserve placeholder; it is never a secret value. The CLI derives `preserve` or `defer` secure-input intent outside canonical source.
- Let the CLI create and maintain `.apiease/project.json`, ignored checkout state, resource bindings, baselines, versions, deletion archives, and other generated operational state. Do not hand-author or copy those values into resource files.
- Use Git diff only to present local edits to a human. It is not the project baseline, mutation authority, or deferred-review artifact.
- Keep the repository minimal unless the user explicitly asks for more structure.
- Prefer examples that teach the APIEase resource model over abstract scaffolding.

## Project Structure
- `apiease.config.js` defines the resource root and subdirectories.
- `resources/requests` contains request resources.
- `resources/widgets` contains widget resources.
- `resources/variables` contains variable resources.
- `resources/functions` contains function resources.
- `docs/knowledgebase/apiEaseDocsConsolidated.md` contains the bundled APIEase knowledge base generated from the public docs; treat it as generated product reference material.
- `docs/shared-ongoing-ai-guidance.md` contains shared implementation lessons and agent guidance that apply across projects.

## Guardrails
- Do not add unrelated frameworks, build tooling, or app scaffolding by default.
- Do not assume a package manager, runtime entrypoint, or deployment target unless the user adds one.
- Do not guess at APIEase behavior when the knowledge base answers it; consult `docs/knowledgebase/apiEaseDocsConsolidated.md` first.
- Do not manually edit `docs/knowledgebase/apiEaseDocsConsolidated.md` for local guidance. Update the public docs source and re-import for product documentation changes, or update `docs/shared-ongoing-ai-guidance.md` for reusable agent lessons. In this maintainer workspace, the local docs source is usually `../apiease-docs`.
- Apply shared implementation constraints from `docs/shared-ongoing-ai-guidance.md` when they are relevant, especially for APIEase Liquid behavior not covered in the main knowledge base.
- Keep sample resources lightweight and easy to replace.
- Preserve compatibility between `apiease.config.js` and the directory structure.
- Treat `apiease validate` as non-executing validation. It does not mutate APIEase or prove external-provider runtime behavior.
- Do not resolve baseline, version, idempotency, projection, or already-exists conflicts automatically. Preserve intended source and deletion intent, perform a verified pull, reconcile deliberately, then validate and apply again.
- Prefer project-specific documentation updates in `CUSTOM_README.md`.
- Update `README.md` only when the template-wide defaults or usage guidance change.

## Definition Of Done
A good change in this repository:

- keeps the template simple for new users,
- leaves the directory layout and config consistent,
- makes the next agent or human more likely to understand what to do,
- and avoids introducing unnecessary project-specific assumptions.

## Commit & Pull Request Guidelines
- Write imperative commit subjects under about 72 characters (for example `Add upgrade conflict reporting`).
- Every implementation handoff must include a proposed commit message ending with a period, even if the user did not ask for one. Put it in the final completion summary as a dedicated line starting with "Commit message:".
