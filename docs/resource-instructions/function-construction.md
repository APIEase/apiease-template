# APIEase function construction instructions 1.0.0

Construct only a function Canonical Resource Source.

- Describe the function's reusable purpose, transformation behavior, and relevant parameter or resource relationships.

- Keep parameters, description, and Liquid implementation aligned with the assigned behavior.
- Preserve explicit input names and types from the assignment.
- Functions receive declared named `args` as direct Liquid variables, not under `bodyEmbedded`. A caller uses the `function` tag rather than the saved-request `call` tag. Return the transformation's JSON directly; do not invent HTTP response or `bodyEmbedded.response` wrappers.
- Do not introduce unrelated behavior or a trivial implementation that contradicts the assigned reusable purpose.
