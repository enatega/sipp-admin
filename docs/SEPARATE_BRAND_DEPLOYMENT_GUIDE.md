# Separate Brand Deployment Guide

## Purpose

Use this guide when you want to deploy this admin panel for another company or customer with their own brand, logo, colors, favicon, and enabled modules.

This project now supports:

- API-driven branding overrides
- local deployment branding fallback
- module enable/disable from config
- neutral admin module routes
- safe code removal per module

## Branding Priority

Branding is resolved in this order:

1. API branding
2. cached branding in browser local storage
3. local fallback config

Current implementation:

- API source: [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx)
- local fallback: [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)

## What Comes From API

The branding provider currently reads these values from the settings APIs:

- `global_logo`
- `primary_color`
- `secondary_color`
- `tertiary_color`
- `site_title`
- `site_description`
- `favicon`

These values override the local config when the API returns them.

## What Still Comes From Local Config

These values still come from local config by default:

- `companyName`
- `shortName`
- module labels
- enabled modules
- role-specific title fallbacks
- `appNameClassName`

Note:

`appNameClassName` is not currently provided by the API, so it is still a local fallback in [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx).

## Files You Will Usually Touch

For a new separate brand deployment, these are the main files:

- [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)
- [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)
- [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts)
- [docs/module-boundary-policy.md](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/docs/module-boundary-policy.md)

## Step 1: Set Local Fallback Branding

Update [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts).

Change:

- `companyName`
- `appName`
- `shortName`
- `description`
- `logo`
- `favicon`
- `colors.primary`
- `colors.secondary`
- `colors.tertiary`
- `titles.admin`
- `titles.auth`
- `titles.vendor`
- `titles.store`
- `titles.serviceCenter`
- `moduleLabels`

Example:

```ts
export const deployment: DeploymentConfig = {
  brand: {
    companyName: 'Acme',
    appName: 'Acme Admin',
    shortName: 'Acme',
    description: 'Acme multi-module administration portal',
    logo: '/images/acme-logo.png',
    favicon: '/acme-favicon.ico',
    colors: {
      primary: '#0f766e',
      secondary: '#111827',
      tertiary: '#e5e7eb',
    },
    titles: {
      admin: 'Acme Admin',
      auth: 'Acme Admin',
      vendor: 'Acme Vendor',
      store: 'Acme Store',
      serviceCenter: 'Acme Service Center',
    },
  },
  enabledModules: {
    drive: true,
    deliveries: true,
    homeServices: false,
    generalBookings: false,
  },
  moduleLabels: {
    drive: 'Acme Drive',
    deliveries: 'Acme Deliveries',
    homeServices: 'Home Services',
    generalBookings: 'General Bookings',
  },
};
```

This ensures the correct brand is shown even before the settings API responds.

## Step 2: Configure API Branding

If the customer has backend-managed branding, make sure the relevant settings endpoints return the correct values.

Current branding provider reads:

- admin settings from `apps/deliveries/admin-settings`
- web settings from `apps/deliveries/web-settings`

If the backend returns:

- `global_logo`
- `primary_color`
- `secondary_color`
- `tertiary_color`
- `site_title`
- `site_description`
- `favicon`

then those values will override the local config automatically.

## Step 2A: If Backend Returns Branding But You Do Not Want Override

If the backend returns:

- `global_logo`
- `primary_color`
- `secondary_color`
- `tertiary_color`
- `site_title`
- `site_description`
- `favicon`

and you do not want those values to overwrite local deployment branding, use one of these approaches:

1. safest option:
   Make the backend return empty or null values for those branding fields for that deployment.

2. backend-controlled option:
   Add a backend flag such as `use_custom_branding: false` and update the frontend provider to ignore branding fields unless that flag is enabled.

3. frontend-controlled option:
   Add a local deployment flag in [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts), for example `allowApiBrandingOverride: false`, and update [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx) so API branding is skipped when that flag is false.

Recommended rule:

- if each customer manages branding from backend settings, keep API override enabled
- if each deployment should have fixed local branding, disable API override and use only `config/deployment.ts`

Current behavior:

- API branding overrides local config automatically
- there is no built-in `disable API override` switch yet

So if you need this behavior now, the cleanest implementation is:

1. add `allowApiBrandingOverride` to [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)
2. check that flag in [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx)
3. when the flag is `false`, ignore:
   - `global_logo`
   - `primary_color`
   - `secondary_color`
   - `tertiary_color`
   - `site_title`
   - `site_description`
   - `favicon`
4. use only local values from deployment config

## Step 3: Clear Cached Branding When Testing

Branding is cached in browser local storage under:

- `adminBranding`

If you change branding and do not see the update immediately:

1. clear local storage
2. refresh the page
3. confirm the API is returning the new branding values

## Step 4: Enable Only Required Modules

In [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts), update:

```ts
enabledModules: {
  drive: true,
  deliveries: true,
  homeServices: false,
  generalBookings: false,
}
```

If a customer only needs some modules:

- keep needed modules `true`
- set unwanted modules to `false`

This removes them from navigation and route selection logic.

## Step 5: Use Canonical Admin Routes

Canonical admin routes are defined in [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts):

- `/drive`
- `/deliveries`
- `/home-services`
- `/general-bookings`

Do not create new brand-coupled admin slugs like:

- `/customername-drive`
- `/customername-deliveries`

Brand should change through branding config and API, not through route names.

## Step 6: Add Brand Assets

If the new brand has custom local assets:

1. place logo and favicon in `public/`
2. update paths in [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)

Examples:

- `public/images/acme-logo.png`
- `public/acme-favicon.ico`

## Step 7: Disable a Module First

Always disable a module before deleting its code.

Do this first:

1. set the module to `false` in [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)
2. remove or rename the module label in the same file if it is no longer needed
3. run the checks below

Run:

```bash
node scripts/audit-module-boundaries.mjs
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

If these pass while the module is disabled, then it is safe to start deleting code.

## Step 8: Shared Files You Must Update For Any Module Removal

No matter which module you remove, always update these files after deletion:

- [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)
- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)
- [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts)
- [messages/en.json](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/messages/en.json)
- [messages/de.json](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/messages/de.json)

What to change in each file:

- `config/deployment.ts`
  Remove or disable the module in `enabledModules`.
  Remove or rename its label in `moduleLabels`.
- `config/sidebar.ts`
  Remove the full sidebar group for the deleted module.
  Remove child menu items that point to the deleted module.
- `lib/routes.ts`
  Remove that module from `adminModuleBasePaths` if you want the module gone completely.
  Remove the module section from `adminRoutes`.
  Remove its legacy compatibility entry from `legacyAdminModuleBasePaths` if you no longer want old paths to resolve.
- `lib/user.ts`
  Remove permission-to-route mappings for that module.
  Remove redirect logic that sends users to that module.
  Remove app-type resolution branches for that module if the app type will never exist in this deployment.
- `next.config.ts`
  Remove rewrite rules for the deleted module if they still exist there.
- `messages/en.json` and `messages/de.json`
  Remove unused translation namespaces for the deleted module only after all references are gone.

## Step 9: Exact Folder Removal Map Per Module

Use the lists below when you want to physically delete code for one module.

### 9.1 Remove Drive Module

Use this when the customer does not need the ride-hailing module.

Set this first:

```ts
enabledModules: {
  drive: false,
}
```

Delete these route wrappers:

- `app/(super-admin)/enatega-drive`

Delete these components:

- `components/super-admin/enatega-drive`

Delete these hooks:

- `hooks/api/super-admin/enatega-drive`

Delete these schemas:

- `schemas/enatega-drive`

Delete these contexts:

- `contexts/super-admin/enatega-drive`

Delete these types:

- `types/api/super-admin/enatega-drive`
- `types/entities/super-admin/enatega-drive`

Then update these shared files:

- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)
- [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts)

Then search for leftovers:

```bash
rg -n "enatega-drive|/drive|lumi_drive|driverManagement" app components hooks contexts schemas types lib config messages
```

### 9.2 Remove Deliveries Module

Use this when the customer does not need the food or delivery-commerce module.

Set this first:

```ts
enabledModules: {
  deliveries: false,
}
```

Delete these route wrappers:

- `app/(super-admin)/enatega-deliveries`
- `app/vendor/deliveries`
- `app/store/deliveries`

Delete these components:

- `components/super-admin/enatega-deliveries`
- `components/vendor/deliveries`
- `components/store/deliveries`
- `components/shared/enatega-deliveries`

Delete these hooks:

- `hooks/api/super-admin/enatega-deliveries`
- `hooks/api/vendor/deliveries`
- `hooks/api/store/deliveries`
- review `hooks/api/deliveries`

Delete these schemas:

- `schemas/enatega-deliveries`

Delete these contexts:

- `contexts/super-admin/enatega-deliveries`

Delete these types:

- `types/api/super-admin/enatega-deliveries`
- `types/api/vendor/deliveries`
- `types/api/store/deliveries`
- `types/entities/super-admin/enatega-deliveries`
- `types/entities/vendor/deliveries`
- `types/entities/store/deliveries`

Then update these shared files:

- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)
- [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts)

Then search for leftovers:

```bash
rg -n "enatega-deliveries|/deliveries|general-delivery|driverManagement|subscription-plans|shop-types|refund-and-responsibilities" app components hooks contexts schemas types lib config messages
```

Important:

Deliveries still has older shared and asset references such as `components/shared/enatega-deliveries` and image paths like `/images/enatega-deliveries/...`.
Do not skip the final `rg` search.

### 9.3 Remove Home Services Module

This is the module currently stored under `fixright-bookings` and `service-center` paths.

Set this first:

```ts
enabledModules: {
  homeServices: false,
}
```

Delete these route wrappers:

- `app/(super-admin)/fixright-bookings`
- `app/vendor/fixright-bookings`
- `app/service-center`

Delete these components:

- `components/super-admin/fixright-bookings`
- `components/vendor/fixright-bookings`
- `components/service-center`
- `components/layouts/vendor/fixright-bookings`

Delete these hooks:

- `hooks/api/super-admin/fixright-bookings`
- `hooks/api/vendor/fixright-bookings`
- `hooks/api/service-center/fixright-bookings`
- review `hooks/api/home-services`
- review `hooks/api/service-center/service-management`

Delete these schemas:

- `schemas/fixright-bookings`
- `schemas/vendor/fixright-bookings`

Delete these contexts:

- `contexts/super-admin/fixright-bookings`

Delete these types:

- `types/api/super-admin/fixright-bookings`
- `types/api/vendor/fixright-bookings`
- `types/api/service-center/fixright-bookings`
- `types/entities/super-admin/fixright-bookings`
- `types/entities/vendor/fixright-bookings`
- review `types/entities/service-center`

Then update these shared files:

- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)
- [next.config.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/next.config.ts)

Then search for leftovers:

```bash
rg -n "fixright-bookings|/home-services|service-center|homeServices|fixrightWorkers|fixrightServiceCenters|fixrightVendors" app components hooks contexts schemas types lib config messages
```

Important:

This module owns both vendor and service-center experiences.
If you remove home services, you usually remove the full `app/service-center` area too.

### 9.4 Remove General Bookings Module

Use this when the customer does not need the service-business marketplace module.

Set this first:

```ts
enabledModules: {
  generalBookings: false,
}
```

Delete these route wrappers:

- `app/(super-admin)/general-bookings`
- `app/vendor/general-bookings`
- `app/store/general-bookings`

Delete these components:

- `components/super-admin/general-bookings`
- `components/vendor/general-bookings`
- `components/store/general-bookings`
- `components/layouts/vendor/general-bookings`
- `components/layouts/store/general-bookings`

Delete these hooks:

- `hooks/api/super-admin/general-bookings`
- `hooks/api/vendor/general-bookings`
- `hooks/api/store/general-bookings`
- review `hooks/api/general-bookings`

Delete these schemas:

- `schemas/general-bookings`
- `schemas/vendor/general-bookings`
- `schemas/store/general-bookings`

Delete these contexts:

- `contexts/super-admin/general-bookings`
- `contexts/vendor/general-bookings`
- `contexts/store/general-bookings`

Delete these types:

- `types/api/super-admin/general-bookings`
- `types/api/vendor/general-bookings`
- `types/api/store/general-bookings`
- `types/entities/super-admin/general-bookings`
- `types/entities/vendor/general-bookings`

Then update these shared files:

- [config/sidebar.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/sidebar.ts)
- [lib/routes.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/routes.ts)
- [lib/user.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/lib/user.ts)

Then search for leftovers:

```bash
rg -n "general-bookings|generalBookings|business-type|service-type|generalBookingsPages" app components hooks contexts schemas types lib config messages
```

## Step 10: Exact Order To Remove One Module Safely

Follow this order exactly:

1. disable the module in [config/deployment.ts](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/config/deployment.ts)
2. run `npm run build` and confirm the disabled deployment still works
3. delete the module folders from the list above
4. clean `config/sidebar.ts`
5. clean `lib/routes.ts`
6. clean `lib/user.ts`
7. clean `next.config.ts` if that module still has rewrites
8. run module-specific `rg` search for leftovers
9. remove leftover translations from `messages/en.json` and `messages/de.json`
10. run the full checks again

Run:

```bash
node scripts/audit-module-boundaries.mjs
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

## Step 11: How To Decide Between Delete and Keep

Delete the file if:

- it only serves the removed module
- its name or imports still mention that module
- no remaining module imports it

Move the file to `shared` if:

- two or more remaining modules still need it
- it can be made neutral
- it no longer imports module-specific hooks, schemas, or translations

Keep the file and rewrite it if:

- it is used by a remaining module
- but it still imports the removed module internally

## Step 12: Verification Checklist After Removal

After deleting a module, confirm all of these:

- `config/deployment.ts` no longer enables the module
- sidebar no longer shows the module
- users are not redirected into removed routes
- removed route rewrites are gone
- no imports remain from deleted folders
- translations for the removed module are either gone or unused
- build passes
- lint passes
- typecheck passes
- module boundary audit passes

Run:

```bash
node scripts/audit-module-boundaries.mjs
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

## Important Rule For Shared Code

If multiple brands or modules reuse something:

- move it to `shared`

If it is specific to one module:

- keep it inside that module

Do not let one module import another module’s internal UI, schemas, hooks, or types.

See:

- [docs/module-boundary-policy.md](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/docs/module-boundary-policy.md)

## Recommended Process For A New Customer Deployment

For each new customer deployment:

1. update `config/deployment.ts`
2. configure backend settings for logo, colors, title, and favicon
3. disable unused modules
4. if needed, delete the unused module code using the removal map above
5. test login, sidebar, favicon, page title, and loader
6. run audit, lint, typecheck, and build
7. deploy

## Current Limitation

The current provider does not get `appNameClassName` from the API.

If you need typography or class-based brand styling to come from the backend too, that will need a backend field plus a safe mapping layer in [contexts/branding/branding-context.tsx](/Users/ninjascode/Documents/NinjasCode/lumi-admin-main/contexts/branding/branding-context.tsx).
