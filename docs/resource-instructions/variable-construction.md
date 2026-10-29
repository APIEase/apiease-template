# APIEase variable construction instructions 1.0.0

Construct only a variable Canonical Resource Source.

- Describe the variable's project purpose, value behavior, and relevant consumers without exposing protected values.

- Preserve the assigned independent project-value meaning; do not turn the variable into an alias for another resource.
- Mark the variable sensitive when its value is secret, credential-like, or otherwise protected.
- A sensitive variable source value is exactly `{"mode":"preserve"}`; never emit its raw, encoded, transformed, or reversible value.
- When the customer explicitly defers a non-secret value until before execution, construct the variable with `value: ""` and `sensitive: false`. Explain in its description that it is unconfigured and must be filled before use. The consuming coordinator checks for a nonblank value before making calls; that check belongs to the consumer, not this scalar variable. Do not invent a location, ID, or other operational default, add unsupported `required` fields, or ask the customer for a value they explicitly deferred.
