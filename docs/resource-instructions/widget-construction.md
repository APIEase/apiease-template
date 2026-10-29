# APIEase widget construction instructions 1.0.0

Construct only a widget Canonical Resource Source.

- Choose `type: "storefront"` for a theme widget or `type: "admin"` for an admin block, detail-page action, or bulk-selection action. Use the optional `adminTarget` field with an exact target from the widget schema to assign a surface and location. Omit it or use an empty string for the manual picker. Each location can have one assigned widget per shop. Blocks use Shopify add/pin controls; actions open from the appropriate More actions menu. Omitted type on existing widgets means storefront.
- Match the requested rendering behavior to the active renderer. HTML markup or Liquid rendering belongs in a Storefront widget's `liquid` field; when no Admin surface is requested, a request to render HTML uses `type: "storefront"`. Admin `adminText` displays plain text literally, including any HTML tags; it does not render markup. Admin widgets do not execute `liquid`, and Storefront delivery does not serve Admin widgets. For an explicitly requested Admin surface, use its supported components and preserve that surface. During construction and acceptance, inspect the source consumed by the selected renderer; matching text in another field or a description does not establish the requested output.
- For new source-based Admin widgets, set `adminUi` to a JSON string containing `{"version":2,"targets":[{"type":"block","variables":"...","render":"..."}]}`. Exactly one reusable content Block is supported; APIEase adapts its root to `s-admin-action` for action locations, so keep the authored `s-admin-block` root. Variables contains named `const` declarations; Render contains one `<s-admin-block heading="...">` root. APIEase supplies imports and mounting. Read a single current ID from `shopify.data.selected?.[0]?.id`, the full selected objects from `shopify.data.selected`, or all selected IDs from `apiease.selectedResourceIds` and the target from `shopify.extension.target`. These are display/input context, not server-authorized resource identity. Inputs are local state under `inputs`; latest request state is `apiease.response`, `apiease.loading`, and `apiease.error`.
- Supported source components: s-admin-block, s-stack, s-box, s-section, s-heading, s-paragraph, s-text, s-badge, s-banner, s-divider, s-text-field, s-text-area, s-select, s-option, s-button. Use `<s-text-field label="Reference" value={inputs.reference ?? ""} onInput={event => apiease.setInput("reference", event.currentTarget.value)} />` and `<s-button onClick={() => apiease.runRequest("saved-request-handle", {liquidParamsEmbedded: {reference: inputs.reference ?? ""}})}>Run</s-button>`. Show response text with `<s-text-area label="Response" readOnly value={JSON.stringify(apiease.response, null, 2) ?? ""} />`. Request handles and parameter group names must be literal. Supply existing embedded parameter groups with JSON values, including nested objects and arrays. Pass `apiease.selectedResourceIds` in `liquidParamsEmbedded` for bulk work; do not reduce a bulk selection to its first resource or stringify it into a bounded text field. One click executes one saved request with the entire array; the saved request owns per-resource processing. Allowed expressions include property reads with literal keys/indexes, optional chaining, templates, arrays/objects, arithmetic/comparison/logical operators, ternaries, unary operators, and JSON.stringify. No imports, hooks, arbitrary functions, loops, assignments, fetch, HTML, CSS, spread props, or prototype access. Backend validation rejects unsupported component properties. Source limit is 65,536 characters, 1,500 compiler nodes, and 40 nesting levels.
- Existing Admin widgets can use `adminUi` as a JSON string containing `{"version":1,"components":[...]}`. Supported components are `{"type":"text","text":"..."}`, `{"type":"input","name":"reference","label":"Reference","required":true,"defaultValue":""}`, and `{"type":"button","id":"lookup","label":"Look up","requestHandle":"saved-request-handle"}`. Input `required` and `defaultValue` are optional. Components display in array order; buttons run the exact saved request handle and show its response as text. Input names and button IDs must be unique within their type, start with a letter, and contain only letters, digits, and underscores. Unknown properties are rejected. Limits: 50 components, 65,536 JSON source characters, 10,000 text characters, 1,024 label/handle characters, 64 identifier characters, and 4,000 characters per input value.
- Admin and Storefront `apiease.runRequest` calls use explicit existing groups: `headersEmbedded`, `queryParamsEmbedded`, `liquidParamsEmbedded`, `flowParamsEmbedded`, `pathParamsEmbedded`, `bodyEmbedded`, and `systemParamsEmbedded`. Callers can supply undeclared parameters without changing the saved request. A Liquid request can substitute the `{reference}` parameter placeholder from `liquidParamsEmbedded.reference`. Use documented parameter placeholders and JSON-safe output for the supplied value type. Do not introduce an `inputs` execution namespace or configure `{inputs.reference}` mappings. Version 1 form fields are sent in `liquidParamsEmbedded` with their existing defaults and text validation. A nonempty `adminUi` replaces `adminText`; for a text-only Admin widget, omit `adminUi` and set a nonempty `adminText` instead. Set `liquid: ""`, `javascript: ""`, `externalJavascriptUrls: []`, and `disableJavascript: false` on new Admin widgets. Existing version 1 definitions below remain supported; preserve their format when making small edits unless asked to replace them.
A bulk-action source example (replace the request handle with the actual saved dependency):

```json
{
  "contractVersion": 1,
  "formatVersion": 1,
  "resourceType": "widget",
  "handle": "bulk-product-lookup",
  "name": "Bulk product lookup",
  "type": "admin",
  "adminTarget": "admin.product-index.selection-action.render",
  "adminUi": "{\"version\":2,\"targets\":[{\"type\":\"block\",\"variables\":\"const resourceIds = apiease.selectedResourceIds;\",\"render\":\"<s-admin-block heading=\\\"Product lookup\\\"><s-button onClick={() => apiease.runRequest(\\\"lookup-products\\\", {liquidParamsEmbedded: {resourceIds}})}>Look up selected products</s-button></s-admin-block>\"}]}",
  "liquid": "",
  "javascript": "",
  "externalJavascriptUrls": [],
  "disableJavascript": false
}
```

The remaining Liquid and browser guidance applies to Storefront widgets.

- Describe what the widget presents or enables and the relevant request, script, or browser-behavior relationships.

- Keep markup usable when optional JavaScript is disabled.
- Reference requests and other supported resources by stable handle rather than operational identity.
- When a planned dependency is a saved request, invoke it from `liquid` with the exact static APIEase tag `{% call {"requestId":"saved-request-handle"} as response %}`, replacing `saved-request-handle` with the dependency's exact handle. Read the payload from `response.data` and status from `response.status`. Do not call the external API URL directly from widget Liquid or JavaScript.
- Widget Liquid uses strict variables and filters. A missing property throws even inside an `if` or before `default`. Safely extract optional payload fields with the object-aware `map` filter, then `first` and `default: false`, before testing or displaying them. Check the HTTP status before consuming success data. Do not assume response.error or response.state exists; use the documented response wrapper and a clear empty/error message when the expected payload value is unavailable. Escape response-derived text for HTML output.
- For browser-triggered requests, use `const response = await apiease.runRequest("saved-request-handle", {liquidParamsEmbedded: {code}})` inside an async event handler. The theme extension loads this helper before stored widget scripts. The response has `status`, `data`, and `errorMessage`; endpoint or network failures reject. The saved request must allow the Storefront App Proxy trigger. No saved parameter mappings or additional library are required.
- Add external scripts only when the customer requirement makes them necessary.
- Keep `liquid`, `javascript`, `externalJavascriptUrls`, and `disableJavascript` coherent with requested browser behavior. Do not add request-only fields or legacy widget execution fields.

The `call` tag is a standalone assignment tag, not a block. It has no body and no
`{% endcall %}` closing tag. Put rendering markup after the call, for example:

```liquid
{% call {"requestId":"saved-request-handle"} as response %}
<pre>{{ response.data | json }}</pre>
```

Adapt the markup to the required response shape; keep the standalone call syntax.
