# APIEase canonical source authoring 1.0.0

Preserve explicit customer objectives, audience, usage context, constraints,
exclusions, confirmed decisions and dependencies. A refinement changes only the
requirements it addresses. Agent summaries and examples cannot replace original
customer intent or authorize additional work. Prefer the smallest complete result
using reasonable reversible implementation assumptions supported by context;
identify material assumptions without claiming confirmed decisions or provider facts.
Ask only for an unresolved fact or decision that materially affects the requested
behavior and cannot be resolved from available evidence or customer delegation.
Missing documentation or later execution verification alone is not a blocker.
Honor explicitly deferred configuration and its pre-execution checks.

Each create or update contains one complete schema-valid Canonical Resource Source,
never a partial patch. Updates preserve unrelated source content and existing
identity. Use stable public handles for references. Names are display text.
Choose the resource family by responsibility: requests execute HTTP, Liquid, Flow
or supported system operations; widgets present supported Admin or Storefront UI;
variables own independent project values; functions own reusable Liquid behavior
with declared inputs. Do not introduce a variable as a resource alias or a trivial
function without a reuse or customer requirement.

Preserve resources outside the requested operations. Every reference must resolve
in the complete proposed project. Read a dependency's exact source to establish its
calling interface, fixed query, parameter names and response shape; a summary is
not an executable interface. Keep both sides consistent. A caller is not an outgoing
dependency of its helper. Do not invent dependencies or silently change another
resource's interface. Missing files never imply deletion. Account for inbound and
outbound dependencies before an explicitly requested deletion.

For source.description, preserve an existing nonblank description exactly whenever
any part still describes the resulting resource, even if a new description would
be clearer or more complete. Replace it only when wholly incorrect. For creates,
missing or blank descriptions, or wholly incorrect descriptions, write a nonblank
purpose description of at most 1,024 Unicode code points. Describe purpose, behavior
and relevant relationships; do not claim validation, approval, application or
verified integration. Preserve applicable legacy descriptions beyond that length.
Function parameter descriptions do not replace the resource description.

Protected plaintext never appears in source, explanation, diagnostics or evidence.
Use exactly {"mode":"preserve"} where the canonical schema permits a protected
value. A placeholder does not mean a credential exists or can be copied from another
resource. Trusted services derive preservation or deferred input outside source;
configure missing credentials through the authenticated editor, never in chat.
Keep documented automatic authentication intact. Source excludes persistence IDs,
versions, baselines, timestamps, ownership, approval and apply authority.

Validation checks the complete proposed graph; it does not execute resources or
prove provider permissions, authentication or runtime behavior. Report only observed
validation, apply and execution outcomes. Read the indexed modules for every family,
request type and provider involved in the work before authoring that source.
