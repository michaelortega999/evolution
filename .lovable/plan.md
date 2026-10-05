# Investing layout collision repair

## Scope
- Confirm the verified revision and apply only the supplied class-name changes in `src/routes/investing.tsx`.
- Leave data, authentication, banking, shared panels, content, and all other layouts unchanged.

## Validation
- Run the existing full test suite, type check, and production build once.
- Reuse an isolated fictional guest browser with backend requests blocked.
- At 1440×1000, check that Investing titles and controls do not overlap and sidebar fields remain readable and scrollable.
- At 390×844, check the actual phone Investing experience without forcing the desktop screen.
- Save only the two requested PNG captures, matching base64 sidecars, and `public/showcase/layout-checks.json` with dimensions, checksums, and capture context.

## Delivery
- Do not publish or change plans, credentials, schemas, security, data, or existing promo captures.
- Report the resulting commit, actual checks, available cost information, and any unverified limits.
