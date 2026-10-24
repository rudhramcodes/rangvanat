# Rangvanaat

The active frontend is the original React/Vite design in `src/`, served at http://localhost:5173. This is the design selected for future polishing.

## Run

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview
```

The Vite app proxies `/api` to the Express backend on port 5001. With the backend environment configured, `npm run dev:full` starts both services; `npm run dev:server` starts just the backend.

## Preserved work

The Next.js implementation in `storefront/` is inactive and is no longer started or built by the default commands. Its backend/admin integration work is retained for reuse when connecting the selected design. Previous implementation notes are in [the archive](docs/implementation/ARCHIVED_NEXT_STOREFRONT.md); those feature claims apply to that implementation, not automatically to the Vite frontend.

Payment integration remains deferred.
