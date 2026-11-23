# Module Boundary Policy

## Goal

The admin should support deployment branding changes and module removability without hidden cross-module dependencies.

## Rules

`shared -> module` imports are forbidden.

`module A -> module B` imports are forbidden unless the imported file is a neutral shared abstraction.

`app -> module/shared` imports are allowed.

Role-specific screens should not import `super-admin` UI or super-admin-only hook paths for the same feature.

If a component, schema, hook, or type is reused across modules, it must live in a neutral shared location and accept module-specific copy via props.

## Current Neutral Shared Entrypoints

`components/shared/documents/*`

`components/shared/forms/*`

`components/shared/maps/*`

`shared/contracts/*`

`hooks/api/common/*`

`hooks/api/deliveries/*`

`hooks/api/general-bookings/*`

`hooks/api/home-services/*`

## Canonical Admin Routes

`/drive`

`/deliveries`

`/home-services`

`/general-bookings`

Legacy `enatega-*` and `fixright-bookings` admin slugs should only remain in compatibility mappings such as [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts) and [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts).
