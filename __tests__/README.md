# Endpoint and service tests

Run the suite with `yarn test --runInBand`. Jest generates reports in `coverage/`.

The suite uses real Fastify route plugins and `app.inject()` to exercise HTTP
parsing, schema validation, defaults, handlers, response serialization, and error
statuses without opening a listening socket. Each test closes its Fastify app.

Each controller has its own file in `integrations/`: `orders.test.ts`,
`order-payments.test.ts`, `products.test.ts`, `clients.test.ts`,
`payments.test.ts`, `inventory.test.ts`, `billing.test.ts`, `invoice.test.ts`,
and `auth.test.ts`. Each suite registers only its controller and owns its service
mocks. `helpers/controller.ts` shares the app lifecycle setup, user fixture,
and mock creation/reset utilities. Tests include create,
read, update, delete/cancel, invalid inputs, missing resources, service failures,
invoice ZIP responses, notification calls, and payment complements.
`integrations/health.test.ts` checks the health response.

`services/billing.test.ts` tests the real billing service with mocked customer,
database model, and invoice provider dependencies. Payment complements use
`folio_number: C_ORD_42` for one order (including a single-element array), or
`C_bulk-1-23-55` for multiple orders in the supplied order. Tests verify the
provider payload, the folio saved for every linked order, and failure handling.

Service modules and notification helpers use explicit Jest factories. This keeps
database, SMTP, BAS, and Facturapi implementations out of the test process. No
`.env`, running database, API credentials, seed data, or Docker setup is needed.
Global Jest setup does not truncate or seed any database.

The controller suites are route contract tests, not full system integration tests. The fixture
supplies an authenticated user directly; it does not exercise the authorization
hooks in `src/server.ts` or `api/serverless.ts`, filesystem autoloading, cron jobs,
service business logic, or persistence. Coverage describes imported code only,
not the entire backend. Future database tests should use a separately configured,
disposable database and explicit setup rather than a global reset hook.

To run one controller, use `yarn test --runInBand products.test.ts`.

To extend coverage, add tests to the matching controller file (or create a new
one), register the relevant route plugin with its production prefix,
mock its service dependencies using explicit factories, and assert both the HTTP
result and meaningful effects. For invalid input, assert the service was not
called. Reset service mocks between tests and always close the test app.
