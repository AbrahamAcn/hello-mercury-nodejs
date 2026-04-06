# hello-world-nodejs

A minimal Mercury Composable application that exposes the same hello-world in **two
styles**, mirroring the sibling `hello-world-java` project so the two language
implementations can be compared 1:1.

| Style  | Endpoint                          | Wiring                                                                |
| ------ | --------------------------------- | --------------------------------------------------------------------- |
| Direct | `GET /api/hello/direct/{name}`    | REST automation routes straight to the `hello.direct` function        |
| Flow   | `GET /api/hello/flow/{user}`      | REST → `http.flow.adapter` → `flows/greetings.yml` → `greeting.demo`  |

## Layout

```
src/
├── main.ts                  # entry point
├── composable-loader.ts     # hand-written equivalent of the generated ComposableLoader
├── services/
│   ├── hello-direct.ts      # @preload('hello.direct') — Style 1
│   └── greeting-demo.ts     # @preload('greeting.demo') — Style 2
└── resources/
    ├── application.yml
    ├── rest.yaml
    ├── flows.yaml
    └── flows/
        └── greetings.yml
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
curl -s http://127.0.0.1:8084/api/hello/direct/abe
# {"message":"Hello, abe!","style":"direct"}

curl -s http://127.0.0.1:8084/api/hello/flow/abe
# {"user":"abe","message":"Welcome","style":"flow","time":"..."}
```

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
