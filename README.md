# Hello Mercury Composable

A minimal [Mercury Composable](https://github.com/Accenture/mercury-nodejs) application written in TypeScript
that demostrates the framework's **two wiring styles**, direct (REST function) and flow (REST `http.flow.adapter` YAML flow function)
side by side.

| Style          | Endpoint                          | Wiring                                                                    |
| -------------- | --------------------------------- | ------------------------------------------------------------------------- |
| Direct         | `GET /api/hello/direct/{name}`    | REST automation routes straight to the `hello.direct` function            |
| Flow           | `GET /api/hello/flow/{user}`      | REST → `http.flow.adapter` → `flows/greetings.yml` → `greeting.demo`      |
| Direct (quote) | `GET /api/quote/direct/{id}`      | REST → `quote.direct` function, which fetches `dummyjson.com/quotes/{id}` |
| Flow (quote)   | `GET /api/quote/flow/{id}`        | REST → `http.flow.adapter` → `flows/quotes.yml` → `quote.flow`            |

## Layout

```
src/
├── main.ts                  # entry point
├── composable-loader.ts     # hand-written equivalent of the generated ComposableLoader
├── services/
│   ├── hello-direct.ts      # @preload('hello.direct')  — hello, direct style
│   ├── greeting-demo.ts     # @preload('greeting.demo') — hello, flow task
│   ├── quote-direct.ts      # @preload('quote.direct')  — dummyjson proxy, direct style
│   └── quote-flow.ts        # @preload('quote.flow')    — dummyjson proxy, flow task
└── resources/
    ├── application.yml
    ├── rest.yaml
    ├── flows.yaml
    ├── flows/
    │   ├── greetings.yml
    │   └── quotes.yml
    └── public/
        ├── index.html       # landing page with links to every route
        └── quote.html       # dynamic quote viewer (consumes /api/quote/flow/{id})
```

`composable-loader.ts` is hand-written on purpose so the wiring (config loading,
function registration, flow engine, REST automation) is visible. A real app would
generate this file with a class scanner driven by the
`src/resources/templates/preload.template` shipped with the library.

## Build & run

This project depends on the local `mercury-composable` library via
`file:../mercury-nodejs`, so the library must be built first.

```bash
# 1. Build the library so dist/ exists
cd ../mercury-nodejs
npm install
npm run build

# 2. Build and start the hello-world app
cd ../hello-world-nodejs
npm install
npm run build
npm start
```

You should see log lines like:

```
PRIVATE hello.direct registered with 10 instances
PRIVATE greeting.demo registered with 10 instances
Loaded greetings
REST automation service started on port 8084
```

## Try it

```bash
curl -s http://localhost:8084/api/hello/direct/world
# {"message":"Hello, world!","style":"direct"}

curl -s http://localhost:8084/api/hello/flow/world
# {"user":"world","message":"Welcome","style":"flow","time":"..."}

curl -s http://localhost:8084/api/quote/direct/1
# {"id":1,"quote":"...","author":"..."}

curl -s http://localhost:8084/api/quote/flow/1
# same shape — both quote endpoints return identical JSON for a given id
```

Open `http://localhost:8084/quote.html` in a browser for a dynamic viewer that
consumes `/api/quote/flow/{id}`. It's a plain static page under
`src/resources/public/`, served by Mercury's built-in `express.static`.

## Tests

```bash
npm test   # spawns the server, hits both quote endpoints,
           # asserts the dummyjson schema and that direct == flow per id
```

The tests hit live `dummyjson.com`, so they require network access.

## Common issues

- **`Cannot find module 'mercury-composable'`** — `mercury-nodejs` was not built
  first; the `file:` dependency has no `dist/index.js` to resolve.
- **`Missing resources folder`** at startup — `npm run build` did not run
  `copy-resource-files.js`; rebuild.
- **404 on `/api/hello/flow/...`** — `flows.yaml` (or `flows/greetings.yml`) is
  not in `dist/resources/`, or `yaml.flow.automation` is missing from
  `application.yml`.
- **`Unable to preload - root path required`** — `RestAutomation` calls
  `express.static('classpath:/public')` and Express throws when the folder is
  missing. Keep `src/resources/public/` (even with a single `index.html`) or
  override `static.html.folder` in `application.yml`.
