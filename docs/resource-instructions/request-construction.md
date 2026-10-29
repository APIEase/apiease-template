# APIEase request construction instructions 1.0.0

Construct only a request Canonical Resource Source.

- Describe the request's API purpose, execution behavior, and relevant trigger or next-request relationships.

- Keep request type, method, address or Liquid, parameters, triggers, and next-request relationship mutually consistent.
- For an HTTP request, include its method and address. For a Liquid request, include its Liquid source. Flow requests omit HTTP and Liquid fields. System requests use only supported system parameters. Do not leave fields from another request type in the source.
- Use a `storefrontAppProxy` trigger for storefront execution through Shopify app proxy; do not substitute a `proxyEndpoint` trigger.
- For Shopify Admin REST or GraphQL requests, use the authenticated shop's myshopify domain rather than a public storefront or marketing domain. REST addresses use `https://<shop-domain>/admin/api/<version>/<resource-path>.json`; GraphQL uses `https://<shop-domain>/admin/api/<version>/graphql.json`. Never invent, duplicate, or concatenate shop-domain placeholders.
- Use protected placeholders for sensitive parameter values. Use stable variable handles for Liquid references and supported system-request variable arguments.
- Reference another request by handle in `nextRequestHandle` and in supported Liquid call syntax.

## Constructing before execution verification

For a basic read-only HTTP retrieval request, use the supplied endpoint, established authentication configuration, and intended operation to construct the request without requiring a complete provider contract. When no contrary evidence or provider-specific rule applies, GET can be a reasonable reversible method assumption for an explicitly read-only retrieval at a supplied endpoint. Identify an inferred method as an assumption in the resource-purpose summary; an endpoint alone without an intended operation is not enough to choose behavior.

Keep a basic retrieval request free of speculative response mappings, optional filters, pagination parameters, or processing logic. Those details can wait for response inspection unless the current assignment requires them, such as retrieving every page or transforming specified fields. Preserve such requirements when they are explicit. Do not invent provider endpoints, required payload fields, authentication formats, or response schemas. If a missing fact genuinely prevents valid construction, ask for that specific fact. Constructing the request does not execute it or prove compatibility, permissions, authentication, or successful retrieval. Mandatory provider-specific lookup and validation rules still apply.

## Manual credential entry

The canonical authoring workflow cannot copy a protected credential from another request. When a new request must use the same credential, construct the complete request using the established endpoint and authentication configuration and a known or reasonably inferred method under the rules above, with manual credential entry as the normal fallback. Do not return a blocker merely because no cross-request credential binding is available, even when the handoff or planned dependency assumes unspecified secure reuse. A request handle, dependency relationship, or preserve placeholder is not a credential-copy mechanism. Never invent a binding, reference field, authentication prefix, or extra resource to simulate reuse.

For a known sensitive parameter such as an Authorization header, retain the parameter with `sensitive: true` and `value: {"mode":"preserve"}`. On a new protected field, the backend derives deferred input and leaves the credential unset for the customer to enter manually; this placeholder does not claim that a credential already exists or was copied. Do not omit the required authentication parameter, use an empty or masked string as its value, or request plaintext in a blocker. Preserve existing protected fields on updates to the same request. Keep documented automatic authentication intact, including omission of Shopify Admin token headers.

When credential entry is deferred, identify in the resource-purpose summary that the request requires manual entry of the same credential into its named secure field before use. Keep this as a configuration requirement, without claiming creation, automatic credential reuse, execution readiness, or successful authentication. The customer enters the credential in the request editor, never in chat.
