# Google Maps Setup Checklist

## Required Environment Variable

Set this key in your runtime environment:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_js_api_key
```

## Production Referrer Allowlist

If you see `RefererNotAllowedMapError`, update your API key restrictions in Google Cloud Console.

Path:

1. Google Cloud Console
2. APIs & Services
3. Credentials
4. Select your Maps JavaScript API key
5. Application restrictions -> `HTTP referrers (web sites)`

Allow at least:

- `https://lumi-admin-production.up.railway.app/*`
- `http://localhost:3000/*`
- `http://127.0.0.1:3000/*`

## API Restrictions

Under API restrictions for the same key, allow:

- Maps JavaScript API
- Places API

## Notes

- The zones map currently still uses DrawingManager and legacy Places services.
- Google announced Drawing library removal in Maps JavaScript API releases targeted for May 2026.
- Plan migration to modern replacements before that window.
