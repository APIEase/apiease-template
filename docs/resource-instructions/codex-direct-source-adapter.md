# APIEase command-line Codex direct-source adapter instructions 1.0.0

Command-line Codex plans the requested changes and edits complete canonical resource
files locally. The user's conversation and CUSTOM_* files supply task intent. Read
the installed docs/resource-instructions/README.md index, its required core and
adapter envelope, then modules relevant to the actual resource family, request type
and provider. Instructions are installed by init and upgrade; no server request is
needed to read them. Do not load unrelated modules.

Inspect the complete inventory and local changes, then read only the needed resource
files and dependencies. Preserve existing edits. If current server and local baselines
disagree, reconcile deliberately through the project workflow before continuing.
Use existing handles for updates; choose an unused descriptive handle for a new
local file, preserving a handle explicitly requested by the user. Use the supported
rename and explicit-deletion workflows for bound resources.

Edit files directly; this adapter does not return an Apex plan, operations envelope,
provider source envelope, acceptance-history record, or delegated assignment. Its
result is reviewable local source plus a concise explanation. Validate the complete
change set through the authenticated project boundary before authorized application
or deferred review. Project status and resource instructions grant neither approval nor apply
authority. Report assumptions and observed outcomes accurately.
