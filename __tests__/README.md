# Endpoint tests

Run the suite with `yarn test --runInBand`. Jest generates reports in `coverage/`.

The suite uses real Fastify route plugins and `app.inject()` to exercise HTTP
parsing, schema validation, defaults, handlers, response serialization, and error
statuses without opening a listening socket. Each test closes its Fastify app.

`integrations/endpoints.test.ts` covers the main order, product, customer,
payment, inventory, billing, and authentication endpoints. Tests include create,
read, update, delete/cancel, invalid inputs, missing resources, service failures,
invoice ZIP responses, notification calls, and payment complements.
`integrations/health.test.ts` checks the health response.

Service modules and notification helpers use explicit Jest factories. This keeps
database, SMTP, BAS, and Facturapi implementations out of the test process. No
`.env`, running database, API credentials, seed data, or Docker setup is needed.
Global Jest setup does not truncate or seed any database.

These are route contract tests, not full system integration tests. The fixture
supplies an authenticated user directly; it does not exercise the authorization
hooks in `src/server.ts` or `api/serverless.ts`, filesystem autoloading, cron jobs,
service business logic, or persistence. Coverage describes imported code only,
not the entire backend. Future database tests should use a separately configured,
disposable database and explicit setup rather than a global reset hook.

To extend coverage, register the relevant route plugin with its production prefix,
mock its service dependencies using explicit factories, and assert both the HTTP
result and meaningful effects. For invalid input, assert the service was not
called. Reset service mocks between tests and always close the test app.
