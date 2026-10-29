# Resource instructions

These instructions are written by APIEase developers. A script copies the verified local-agent selection from APIEase into the template; init and upgrade install it in store projects.

Read the required files and [Codex adapter envelope](codex-envelope.md), then only the modules applicable to the resources you are editing. Resource instructions explain how to edit; actual resource JSON lives under resources/.

| File | Reading | When |
| --- | --- | --- |
| [codex-direct-source-adapter.md](codex-direct-source-adapter.md) | Required | Always: local authoring workflow. |
| [source-authoring.md](source-authoring.md) | Required | Always: shared canonical source rules. |
| [request-construction.md](request-construction.md) | Selective | When creating or updating any request. |
| [request-invocation.md](request-invocation.md) | Selective | When authoring HTTP helpers or any saved-request caller. |
| [request-shopify.md](request-shopify.md) | Selective | When a request uses Shopify Admin GraphQL. |
| [request-liquid.md](request-liquid.md) | Selective | When authoring Liquid request workflows. |
| [request-liquid-examples.md](request-liquid-examples.md) | Selective | Reference examples for the Liquid syntax or behavior being authored; read the relevant section. |
| [widget-construction.md](widget-construction.md) | Selective | When creating or updating a widget. |
| [variable-construction.md](variable-construction.md) | Selective | When creating or updating a variable. |
| [function-construction.md](function-construction.md) | Selective | When creating or updating a function. |

Use apiease upgrade to update installed instructions. Keep project-specific decisions in CUSTOM_AGENT_GUIDANCE.md and CUSTOM_README.md.
