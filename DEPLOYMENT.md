# Vercel deployment

`vercel.json` sets `buildCommand` to `yarn vercel-build`. The command checks TypeScript without emitting files, then runs `yarn migrate:deploy` through tsx. Vercel packages the existing `api/serverless.ts` function afterward. The rewrite remains unchanged.

## Required configuration

Set `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in Vercel for each deployment environment. The build environment must reach the database, and the database account needs the DDL privileges required by pending migrations. Preview deployments must use their own database credentials; both Preview and Production run migrations against their configured database. Keep other existing runtime variables (BAS, Facturapi, etc.) configured as before.

The runner uses the production Knex configuration and the repository's TypeScript `migrations/` files only. It does not run seeds, rollbacks, or start the server. Already applied migrations are tracked by Knex and skipped. Knex's migration lock protects against concurrent runners; a lock failure blocks that deployment instead of forcibly unlocking an active runner.

Typecheck or migration failure returns a nonzero exit status, blocking the build. A later packaging/deployment failure does not roll back migrations already applied: schema changes must remain compatible with the currently deployed version. MySQL DDL is not guaranteed to roll back as a batch; investigate a partial failure before retrying. Do not enable a build-cache workflow that bypasses this command.

The public-order UUID migration was reported applied locally by the user on 2026-10-06. Local migration state does not apply it to the deployed database. No remote migration or deployment was performed while implementing this build process.

Commands:

- `yarn typecheck`: check application, migration and deployment TypeScript without generated output.
- `yarn test --runInBand`: mocked tests, including deployment-runner success/failure behavior; no real database migration.
- `yarn migrate:deploy`: **applies pending migrations** to the database configured by the production Knex profile. Intended for the deployment build; inspect target configuration before running manually.
- `yarn vercel-build`: typecheck, then apply pending migrations. This is not a database-free local validation command.

References: [Vercel buildCommand](https://vercel.com/docs/project-configuration/vercel-json), [environment variables](https://vercel.com/docs/environment-variables).
