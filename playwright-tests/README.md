# Frontend Playwright tests

These tests live independently from the application packages and use a mocked API, so test
runs do not create or change production accounts, products, or orders.

## Run locally

```bash
cd playwright-tests
npm ci
npm run install:browsers
npm test
```

The test config starts the Vite frontend automatically. To run against an already deployed
storefront instead, set `PLAYWRIGHT_BASE_URL` to its origin before running `npm test`.
API calls remain mocked in that mode.
