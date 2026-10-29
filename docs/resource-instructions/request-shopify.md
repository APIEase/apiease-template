# Shopify Admin GraphQL representation

Apply the shared Shopify Admin API request contract supplied in the Apex envelope, including its centrally configured default version, authenticated shop authority, automatic authentication, permission uncertainty, and knowledge limits. For non-Apex adapters without this context, do not assume a shop or default version.

- Construct an HTTP source with `resourceType: "request"`, `type: "http"`, `method: "POST"`, and `address: "https://<myshopifyDomain>/admin/api/<apiVersion>/graphql.json"`. Replace both placeholders using trusted shop context and the explicit or centrally configured version before returning source. Preserve an existing explicit version unless an upgrade is requested.
- Set a non-sensitive header parameter `{ "type": "header", "name": "Content-Type", "sensitive": false, "value": "application/json" }`.
- Use one unnamed body parameter: `{ "type": "body", "sensitive": false, "value": "<JSON string>" }`. Its value is serialized JSON containing a GraphQL `query` string and an optional `variables` object. Escape quotes and newlines correctly. GraphQL variables belong inside that body object, not in URL query parameters. Omit `variables` when unnecessary.
- Do not use top-level `url`, `headers`, `body`, `query`, or `variables` fields, an object-valued body parameter, a named body parameter, or a separate GraphQL request type. Preserve assigned identity, required version fields, and established triggers/dependencies; do not invent a trigger or authentication variable.
- Rely on automatic shop authentication by default; omit `X-Shopify-Access-Token` entirely. Never emit token values, empty token headers, or token placeholders for newly constructed requests.
