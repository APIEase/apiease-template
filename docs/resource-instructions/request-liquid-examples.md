# APIEase Liquid examples

### Standalone calls across source parts

A `call` is one complete instruction. It never opens a block, so never emit
`endcall` or put a call on the stack of blocks awaiting closure. Source parts
continue the same program: do not repeat the initial reader call at a part
boundary. Close only the actual `if`, `for`, `while`, `capture` or other block
that is open. The two parts below demonstrate only call/block structure; a real
workflow must retain its agreed status, shape, error and accounting checks.

Part one calls the reader once and leaves only the row loop open:

```liquid
{%- call {"requestId":"reader"} as reader -%}
{%- assign processed = 0 -%}
{%- for row in reader.data.rows -%}
  {%- call {"requestId":"helper","bodyEmbedded":{"id":{{ row.id | json }}}} as helper -%}
```

Part two continues after the standalone helper call and closes the row loop:

```liquid
  {%- assign processed = processed | plus: 1 -%}
{%- endfor -%}
{"processed":{{ processed | json }}}
```

### Guarded nested collection

This example validates only the nested collection at `response.data.data.items.nodes`; a complete helper stage must also enforce its HTTP status, GraphQL errors and other agreed checks. Each property is read only after checking its parent. An absent or null intermediate parent fails safely, while an empty array remains valid. The sequential guards avoid a deep tree of success/failure branches.

```liquid
{%- assign nodes = nil -%}
{%- assign valid = response | has_key: 'data' -%}
{%- if valid -%}
  {%- assign envelope = response.data -%}
  {%- assign valid = envelope | has_key: 'data' -%}
{%- endif -%}
{%- if valid -%}
  {%- assign data = envelope.data -%}
  {%- assign valid = data | has_key: 'items' -%}
{%- endif -%}
{%- if valid -%}
  {%- assign connection = data.items -%}
  {%- assign valid = connection | has_key: 'nodes' -%}
{%- endif -%}
{%- if valid -%}
  {%- assign nodes = connection.nodes -%}
  {%- assign valid = nodes | is_type: 'array' -%}
{%- endif -%}
{"valid":{{ valid | json }},"nodes":{{ nodes | json }}}
```

### Collection accumulation and page arithmetic

Use the runtime's actual collection and arithmetic semantics. `'' | split: ','`
produces `[""]`, not an empty array; it adds a phantom row to an accumulator.
Use `'' | split: ''` for an empty array, or initialize from the first validated
page's actual rows. `divided_by` returns a fraction even for integer operands:
compute a page ceiling with `count | divided_by: pageSize | ceil`. Do not rely on
integer truncation in `(count + pageSize - 1) / pageSize`. Keep all collection
status, shape, count and page-coverage checks; fix arithmetic rather than relaxing
those checks. Here `rows` is an already validated array and `count` is a validated
nonnegative integer; 300 is only this example's contracted page size.

```liquid
{%- assign accumulated = '' | split: '' -%}
{%- assign accumulated = accumulated | concat: rows -%}
{%- assign pages = count | divided_by: 300 | ceil -%}
{"rows":{{ accumulated | json }},"pages":{{ pages | json }}}
```

### Guarded branch locals

Liquid evaluates both operands of `and` and `or`; they do not protect an absent
property or an unassigned local. `if pageValid and pageHasMore` throws when an
earlier failure prevented assignment of `pageHasMore`, even if `pageValid` is
false. Initialize every later-read local before its conditional assignments,
inside each row/page iteration so a previous iteration cannot supply stale state.
Use nested guards for property reads. Do not relax strict variables or turn an
invalid response into an empty successful page. Here `pageValid` is the result of
earlier HTTP/envelope/candidate checks and `connection` is the bound connection:

```liquid
{%- assign pageHasMore = false -%}
{%- assign nextCursor = '' -%}
{%- if pageValid -%}
  {%- assign pageValid = connection | has_key: 'pageInfo' -%}
{%- endif -%}
{%- if pageValid -%}
  {%- assign pageInfo = connection.pageInfo -%}
  {%- assign pageValid = pageInfo | has_key: 'hasNextPage' -%}
{%- endif -%}
{%- if pageValid -%}
  {%- assign pageValid = pageInfo.hasNextPage | is_type: 'boolean' -%}
{%- endif -%}
{%- if pageValid -%}
  {%- assign pageHasMore = pageInfo.hasNextPage -%}
  {%- if pageHasMore -%}
    {%- assign pageValid = pageInfo | has_key: 'endCursor' -%}
    {%- if pageValid -%}
      {%- assign pageValid = pageInfo.endCursor | is_type: 'string' -%}
    {%- endif -%}
    {%- if pageValid -%}
      {%- assign nextCursor = pageInfo.endCursor -%}
      {%- if nextCursor == blank -%}{%- assign pageValid = false -%}{%- endif -%}
    {%- endif -%}
  {%- endif -%}
{%- endif -%}
{"valid":{{ pageValid | json }},"more":{{ pageHasMore | json }},"cursor":{{ nextCursor | json }}}
```

An invalid page must follow the row-failure/accounting path. For a valid continuing
page, also reject a repeated cursor before issuing the next call. Audit the first
iteration's HTTP/GraphQL failure and malformed-page branches, then a failed page
after a successful page; no path may read an unassigned or stale flag.

### Pagination loop continuation

`pageHasMore` describes a response; it does not change the flag in the enclosing
`while hasMore and rowFailed == false`. Reset that controlling flag on every
iteration and enable it only after a valid continuing page supplies a progressing
cursor. Updating only `pageHasMore` leaves the loop repeating a terminal page.
Apply this transition separately to every paginated lookup, including duplicate
and SKU searches. Initialize `rowFailed = false` and `cursor = nil` before the
loop. Here `pageValid`, `pageHasMore` and `nextCursor` are defined by the preceding
HTTP/envelope/candidate/page checks; those checks must also reject any previously
seen cursor. A terminal page stops normally, while an invalid page fails the row:

```liquid
{%- assign hasMore = false -%}
{%- if pageValid -%}
  {%- if pageHasMore -%}
    {%- if nextCursor == cursor -%}
      {%- assign rowFailed = true -%}
    {%- else -%}
      {%- assign cursor = nextCursor -%}
      {%- assign hasMore = true -%}
    {%- endif -%}
  {%- endif -%}
{%- else -%}
  {%- assign rowFailed = true -%}
{%- endif -%}
{"more":{{ hasMore | json }},"failed":{{ rowFailed | json }},"cursor":{{ cursor | json }}}
```

Audit a first-page terminal response, a continuing page followed by a terminal
page, and a continuing page followed by failure. On failure, finish row accounting
and suppress dependent writes; on success, decide absence/uniqueness only after
the complete traversal. Do not treat a loop-budget exception as normal completion.

### Inventory state branches

Apply the branch-local rule to every helper, including inventory lookups. Reset
`levelAbsent` and `levelIsActive` before each row's lookup: HTTP/GraphQL failure
may skip both assignments, and a null level skips the active-state assignment.
Do not use `and` or `or` to guard an unassigned flag. This example classifies a
level after the HTTP/GraphQL envelope checks have set `levelOk` and `levelItem`.
Before an actual set operation, also validate the required observed quantity;
classification alone does not authorize a write. Failure reaches row accounting.

```liquid
{%- assign levelAbsent = false -%}
{%- assign levelIsActive = false -%}
{%- assign action = 'fail' -%}
{%- if levelOk -%}
  {%- assign levelOk = levelItem | has_key: 'inventoryLevel' -%}
{%- endif -%}
{%- if levelOk -%}
  {%- assign inventoryLevel = levelItem.inventoryLevel -%}
  {%- if inventoryLevel == nil -%}
    {%- assign levelAbsent = true -%}
  {%- else -%}
    {%- assign levelOk = inventoryLevel | has_key: 'isActive' -%}
    {%- if levelOk -%}
      {%- assign levelOk = inventoryLevel.isActive | is_type: 'boolean' -%}
    {%- endif -%}
    {%- if levelOk -%}{%- assign levelIsActive = inventoryLevel.isActive -%}{%- endif -%}
  {%- endif -%}
{%- endif -%}
{%- if levelOk -%}
  {%- if levelAbsent or levelIsActive == false -%}
    {%- assign action = 'activate' -%}
  {%- else -%}
    {%- assign action = 'set' -%}
  {%- endif -%}
{%- endif -%}
{"valid":{{ levelOk | json }},"absent":{{ levelAbsent | json }},"active":{{ levelIsActive | json }},"action":{{ action | json }}}
```

### Mutation intent keys

APIEase's `uuid` filter generates a fresh random UUID on each evaluation. Assign
`'' | uuid` once when a new mutation intent is created, before its call/retry
loop, and reuse that assigned value only for retries of that exact intent.
Generate another key for a later intent, even if SKU, location, observed quantity
and target quantity repeat. A timestamp or deterministic payload-derived key is
not a fresh intent identity. A different mutation stage also gets its own key.
For resuming the same intent across separate invocations, explicitly carry its
original key as a declared input; generating a new UUID is not retry recovery.

The three calls below illustrate one intent and its retry, then a distinct
intent with the same quantity. A real workflow retries only when its agreed
error policy permits it, and retains all response checks before dependent work.

```liquid
{%- assign intentKey = '' | uuid -%}
{%- call {"requestId":"quantity-helper","bodyEmbedded":{"variables":{"quantity":{{ quantity | json }},"idempotencyKey":{{ intentKey | json }}}}} as firstResult -%}
{%- call {"requestId":"quantity-helper","bodyEmbedded":{"variables":{"quantity":{{ quantity | json }},"idempotencyKey":{{ intentKey | json }}}}} as retryResult -%}
{%- assign intentKey = '' | uuid -%}
{%- call {"requestId":"quantity-helper","bodyEmbedded":{"variables":{"quantity":{{ quantity | json }},"idempotencyKey":{{ intentKey | json }}}}} as laterResult -%}
{}
```

### Bounded failure details

A generic stage/reason alone does not preserve returned diagnostics. At the
common failure exit, retain selected documented non-sensitive fields from the
actual response, such as HTTP status, source Status/Details or GraphQL and
mutation error codes/paths, alongside row and stage identity. Bound diagnostic
text; omit headers, credentials and protected values rather than copying an
entire response. The example projects the documented source diagnostic fields;
apply equivalent guarded projection to the relevant helper error shape.

```liquid
{%- assign httpStatus = nil -%}
{%- assign sourceStatus = '' -%}
{%- assign details = '' -%}
{%- assign present = response | has_key: 'status' -%}
{%- if present -%}
  {%- assign valid = response.status | is_type: 'integer' -%}
  {%- if valid -%}{%- assign httpStatus = response.status -%}{%- endif -%}
{%- endif -%}
{%- assign present = response | has_key: 'data' -%}
{%- if present -%}
  {%- assign body = response.data -%}
  {%- assign present = body | has_key: 'Status' -%}
  {%- if present -%}
    {%- assign valid = body.Status | is_type: 'string' -%}
    {%- if valid -%}{%- assign sourceStatus = body.Status | truncate: 64, '' -%}{%- endif -%}
  {%- endif -%}
  {%- assign present = body | has_key: 'Details' -%}
  {%- if present -%}
    {%- assign valid = body.Details | is_type: 'string' -%}
    {%- if valid -%}{%- assign details = body.Details | truncate: 512, '' -%}{%- endif -%}
  {%- endif -%}
{%- endif -%}
{"httpStatus":{{ httpStatus | json }},"sourceStatus":{{ sourceStatus | json }},"details":{{ details | json }}}
```

### Search value reuse and escaping

Compute the complete identifier tag once. Escape a copy for the search expression,
and pass the original tag to the mutation. URL decoding the fixed character codes
produces one backslash (U+005C) and one quote without an ambiguous source literal.
Define these escape characters once; do not redefine them in a
later workflow stage. Apply `json` only after building each search expression.

```liquid
{%- assign backslash = '%5C' | url_decode -%}
{%- assign quote = '%22' | url_decode -%}
{%- assign doubledBackslash = backslash | append: backslash -%}
{%- assign escapedQuote = backslash | append: quote -%}
{%- assign tag = 'external-id:' | append: sourceId -%}
{%- assign searchTag = tag | replace: backslash, doubledBackslash | replace: quote, escapedQuote -%}
{%- assign searchSku = sourceSku | replace: backslash, doubledBackslash | replace: quote, escapedQuote -%}
{%- assign duplicateSearch = 'tag:' | append: quote | append: searchTag | append: quote -%}
{%- assign skuSearch = 'sku:' | append: quote | append: searchSku | append: quote -%}
{"tag":{{ tag | json }},"duplicateSearch":{{ duplicateSearch | json }},"skuSearch":{{ skuSearch | json }}}
```

### Required top-level string

Validate the declared row-field types before helper calls. Presence alone is insufficient. Never detect a field by searching serialized row JSON for a key: a nested field can match while the required top-level field is absent. This example accepts a top-level string note including the empty string and rejects a missing/nested-only note. The same pattern applies to any field whose agreed type is string, including source IDs, source SKUs and returned candidate SKUs; add a nonempty check only when that field's agreement requires one. Record invalid rows through the common accounting path.

```liquid
{%- assign notePresent = row | has_key: 'note' -%}
{%- assign valid = false -%}
{%- assign note = '' -%}
{%- if notePresent -%}
  {%- assign valid = row.note | is_type: 'string' -%}
  {%- assign note = row.note | default: '' -%}
{%- endif -%}
{"valid":{{ valid | json }},"note":{{ note | json }}}
```

### Required integer

This example preserves zero and negative integers. Numeric-looking strings, booleans, null and fractional values fail the integer check. It adds no positivity/range rule; any such restriction must be explicit in the field's agreed contract.

```liquid
{%- assign quantityPresent = row | has_key: 'quantity' -%}
{%- assign valid = false -%}
{%- assign quantity = nil -%}
{%- if quantityPresent -%}
  {%- assign quantity = row.quantity -%}
  {%- assign valid = quantity | is_type: 'integer' -%}
{%- endif -%}
{"valid":{{ valid | json }},"quantity":{{ quantity | json }}}
```

### GraphQL Int input

When the agreed outbound input is GraphQL `Int`, a general integer check alone
is insufficient: its signed 32-bit range is -2147483648 through 2147483647,
inclusive. Carry that interface bound into the input guard before the mutation
call; reject an out-of-range row through failure accounting, without coercing,
clamping or sending it. This is a type constraint, not an invented positivity
rule. Preserve zero and negative integers inside the range unless another
explicit field restriction applies. Keep this bound specific to GraphQL `Int`;
do not apply it to every field described merely as an integer.

```liquid
{%- assign valid = row | has_key: 'quantity' -%}
{%- assign quantity = nil -%}
{%- if valid -%}
  {%- assign quantity = row.quantity -%}
  {%- assign valid = quantity | is_type: 'integer' -%}
{%- endif -%}
{%- if valid -%}
  {%- if quantity < -2147483648 -%}{%- assign valid = false -%}{%- endif -%}
  {%- if quantity > 2147483647 -%}{%- assign valid = false -%}{%- endif -%}
{%- endif -%}
{"valid":{{ valid | json }},"quantity":{{ quantity | json }}}
```

### Serialized Liquid source

The provider response is JSON, but `source.liquid` is the literal Liquid program after one JSON decode. Encode its quotes and newlines exactly once in the response. Do not pre-serialize the program or copy the additional escapes from a JSON-encoded context/evidence string. In decoded Liquid, a call starts with `{% call {"requestId":...}`, not a backslash before each quote, and line breaks are actual newlines. A `call` is a standalone tag and never has an `endcall`.

This source-field fragment illustrates the provider encoding boundary. The surrounding resource still requires its assigned identity, parameters, triggers and complete result envelope. `note` is an already bound runtime value; the helper contract in this example accepts `bodyEmbedded.variables.note`. The `json` filter encodes that value at execution time, separately from encoding the source in the provider response:

```json
{"liquid":"{% call {\"requestId\":\"json-helper\",\"bodyEmbedded\":{\"variables\":{\"note\":{{ note | json }}}}} as result %}\n{{ result | json }}"}
```

### Checked response and JSON output

This example checks a response with optional GraphQL errors and a required operation identifier before reporting success. An empty array is truthy in Liquid, so test its size rather than its truthiness.

An empty string is also truthy. For a mutation-success contract requiring a nonempty returned identifier, safely extract it with `map`, `first`, and `default: false` before a boolean check, or explicitly compare it with blank. Do not use `default: ''` followed by `if identifier`: that reports success for a missing identifier. This nonempty result-ID rule does not strengthen unrelated source string fields. Missing mutation result objects or required identifiers must follow the failure path even when HTTP status is successful and error arrays are empty.

```liquid
{% assign succeeded = false %}
{% if response.status >= 200 and response.status < 300 %}
  {% assign errorCount = response.data | map: 'errors' | first | default: '' | size %}
  {% assign operationId = response.data | map: 'data' | first | map: 'operation' | first | map: 'id' | first | default: false %}
  {% if errorCount == 0 %}
    {% if operationId %}{% assign succeeded = true %}{% endif %}
  {% endif %}
{% endif %}
{"success":{{ succeeded | json }}}
```

### Complete body

The `graphql-body` HTTP helper uses the Shopify GraphQL HTTP configuration above and stores `{"query":"query ShopName($includeName: Boolean!) { shop { name @include(if: $includeName) } }"}` as its unnamed body parameter string. Apex Shopify construction requires this concrete query for artifact validation; an empty or dynamic stored query cannot pass that validation even though generic runtime body merging accepts caller fields. Keep the GraphQL query text static, including when filtering by a SKU, tag, or other caller value: declare GraphQL variables and bind runtime data under `bodyEmbedded.variables`. Do not embed Liquid placeholders inside the query text; Apex cannot verify such an artifact as a concrete GraphQL operation. Match variable names and response paths to the assignment and dependency calling contracts. The Liquid request receives the boolean `includeName` in its runtime context:

```liquid
{% assign query = 'query ShopName($includeName: Boolean!) { shop { name @include(if: $includeName) } }' %}
{% call {"requestId":"graphql-body","bodyEmbedded":{"query":{{ query | json }},"variables":{"includeName":{{ includeName | json }}}}} as result %}
{{ result | json }}
```

### Variables only

The `graphql-variables` HTTP helper stores the query from the preceding example inside its serialized unnamed body parameter. The Liquid request supplies just the variables object:

```liquid
{% call {"requestId":"graphql-variables","bodyEmbedded":{"variables":{"includeName":{{ includeName | json }}}}} as result %}
{{ result | json }}
```
