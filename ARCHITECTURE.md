# Diplomat Architecture — Developer Reference

This document is the authoritative reference for the Diplomat Architecture as implemented in this project. It covers layer responsibilities, data flow, step-by-step guides for extending the codebase, and the quality enforcement system.

---

## Overview

The **Diplomat Architecture** enforces strict layer boundaries between every responsibility in the application. No layer knows more than it needs to. No data crosses a boundary without going through the correct interpreter.

The codebase is split into two top-level blocks:

- **`lib/`** — technical infrastructure. The only place that imports external frameworks and brokers.
- **`src/`** — application logic, organized in internal layers.

---

## Layers

### `lib/` — Technical Infrastructure

Each `lib/*` directory is a standalone npm workspace package with its own `package.json`. No external framework is ever imported in `src/` — ESLint enforces this at compile time.

| Module | Encapsulates | Exposes |
|---|---|---|
| `lib/db` | TypeORM | `AppDataSource`, `createTestDataSource`, migration CLI |
| `lib/http` | Fastify | `get`, `post`, `listen`, `inject` |
| `lib/messaging` | KafkaJS | `publish`, `subscribe`, `connect`, `disconnect`, `ensureTopics` |
| `lib/observability` | pino | `logger` |
| `lib/testing` | vitest | `test`, `describe`, `it`, `expect`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, `createTestDataSource` |
| `lib/types` | — | `createSchema`, `field.*`, `fn`, `asyncFn`, `UUID`, error classes |
| `lib/quality` | ESLint, Prettier, git hooks | `base()`, `boundaries()`, hook setup |

`lib/quality` is tooling-only — it is excluded from TypeScript compilation (`tsconfig.json`) because its ESLint dependencies require a different module resolution than the application. It is loaded at lint time by `jiti`.

**Rule:** swapping Fastify for another HTTP framework, or Kafka for another broker, means changing only files inside `lib/` — zero changes in `src/`.

---

### `model/` — Internal Domain

Defines the schemas that circulate inside the application. This is the internal language — all data processed by `controller`, `logic`, and `db` layers respects this format.

Schemas are defined with `createSchema` from `lib/types/schema`, which serves as both the **runtime validator** and the **TypeScript type**:

```typescript
export const Journey = createSchema({
  id: field.uuid(),
  studentId: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
  status: field.literal(...JOURNEY_STATUSES),
  createdAt: field.date(),
});
```

**Rule:** no database fields (snake_case, technical columns) and no external contract fields enter the model. That is the adapter's job.

---

### `wire/` — External Contracts

Defines the exact format that external systems send and expect to receive.

- **`wire/in/`** — inbound format. Used by `http-server` (HTTP requests) and `consumer` (Kafka messages).
- **`wire/out/`** — outbound format. Used by HTTP responses and `producer` (published messages).

**Rule:** only adapters import from `wire/`. No other layer knows these types.

---

### `adapters/` — Translation Between Worlds

The only layer that simultaneously knows both `wire` and `model`. Responsible exclusively for field mapping — no business logic.

Every adapter function is wrapped in `fn` or `asyncFn`, which validates input and output against their schemas automatically:

```typescript
export const fromDbWire = fn(JourneyDbWire, Journey, (wire) => ({
  id: asUUID(wire.id),
  studentId: asUUID(wire.student_id),
  currentStep: wire.current_step,
  status: wire.status,
  createdAt: wire.created_at,
}));
```

| Function | Input | Output |
|---|---|---|
| `fromWireIn` | `wire/in` | `model` |
| `toWireOut` | `model` | `wire/out` |
| `fromDbWire` | `db/wire` | `model` |
| `toDbWire` | `model input` | `db/wire` |

---

### `logic/` — Pure Functions

Contains all computational logic that does not depend on infrastructure. Pure functions — same input always produces the same output.

**Rules:**
- Zero external dependencies
- Never accesses the database, never makes HTTP calls
- Never imports from layers other than `model/`
- Consequence: testable with no mocks whatsoever

All logic functions are wrapped in `fn` for input/output validation:

```typescript
export const buildEventRecord = fn(Event, EventRecordInput, (event) => ({
  id: event.eventId,
  journeyId: event.journeyId,
}));
```

---

### `controllers/` — Business Rules

Orchestrates the flow of an operation. Makes decisions, coordinates calls to `logic` and `db`, guarantees consistency.

**Rules:**
- Always receives `model`, always returns `model`
- Never imports `wire` or `db/wire` types
- The only place where business decisions exist (idempotency, state transitions, side effects)

---

### `db/` — Database Access

Executes queries and persists data. Always receives and returns `model` — the conversion to the database format happens internally via adapters.

**Internal structure:**
- `db/wire/` — TypeORM entities (snake_case, `@Entity`, `@Column` decorators)
- `db/migrations/` — schema migrations
- `db/data-source.ts` — TypeORM DataSource configuration
- `db/<entity>.ts` — query functions (`findById`, `insert`, `updateStep`, etc.)

The `const repo = () => AppDataSource.getRepository(X)` lazy getter pattern is standard here and is intentionally excluded from the function declaration lint rule (infrastructure code, not domain logic).

---

### `diplomat/` — Bridge Between Lib and Application

Connects `lib` modules to application logic. This is the entry and exit point for all external data.

**Never imports Fastify, Kafka, or any framework directly.**

```typescript
// diplomat/http-server/journey.ts
post('/journeys', async (body) => {
  const studentInput = fromWireIn(body);
  const journey = await startJourney(studentInput);
  return toWireOut(journey);
});

// diplomat/consumer/index.ts
subscribe('journeyInitiated', handle(journeyStarted));
```

Bootstrap and wiring functions in `diplomat/` (`setupConsumers`, `setupRoutes`) are excluded from the function declaration lint rule — they are initialization code, not domain logic.

---

## Data Flow

### HTTP entry point

```
HTTP request
  → lib/http              (Fastify — receives and routes)
  → diplomat/http-server  (receives wire/in body)
  → adapters.fromWireIn   (wire/in → model)
  → controllers           (model → model)
  → adapters.toWireOut    (model → wire/out)
  → lib/http              (Fastify — responds)
```

### Kafka consumer

```
Kafka message
  → lib/messaging         (KafkaJS — receives, retries, DLQ)
  → diplomat/consumer     (receives wire/in)
  → adapters.toModel      (wire/in → model)
  → controllers           (model → void)
```

### Kafka producer

```
controllers
  → lib/messaging.publish (model → topic)
  → KafkaJS               (publishes message)
```

### Database write

```
controllers
  → db.insert(model)
  → adapters.toDbWire     (model → db/wire)
  → TypeORM Repository    (persists)
  → adapters.fromDbWire   (db/wire → model)
  → controllers           (receives model back)
```

---

## Quality System

### Layer boundaries (ESLint)

Configured in `eslint.config.ts` using `boundaries()` from `lib/quality`. The default policy is `disallow` — any import not explicitly listed is a compile-time error.

```
diplomat    → can import from: controllers, wire
controllers → can import from: logic, model
logic       → can import from: model
adapters    → can import from: model, db-wire, wire
db          → can import from: db-wire, model, adapters
db-wire     → cannot import from any src layer
model       → cannot import from any src layer
wire        → cannot import from any src layer
```

### Framework import restrictions (ESLint)

Direct imports of `typeorm`, `kafkajs`, `fastify`, `pino`, and `vitest` anywhere inside `src/` are a lint error. All access goes through the corresponding `lib/*` package.

### Function declaration rule (ESLint)

In domain layers (`src/adapters`, `src/controllers`, `src/logic`, `src/model`, `src/wire`), the following patterns are banned:

```typescript
// banned
function foo() {}
const foo = () => {}
const foo = function() {}

// required
export const foo = fn(Input, Output, (input) => { ... });
export const foo = asyncFn(Input, Output, async (input) => { ... });
```

This guarantees that every domain function is type-validated at its boundaries. Infrastructure layers (`src/db`, `src/diplomat`) are exempt — they contain wiring and repository patterns where plain functions are appropriate.

### Prettier (auto-format)

```bash
npm run lint-fix   # formats src/ and fixes ESLint violations
```

Config: 2-space indent, 100 char line width, single quotes, semicolons, trailing commas.

### Git hooks

```bash
npm run quality:setup   # install hooks into .git/hooks/
```

| Hook | Runs |
|---|---|
| `pre-commit` | `npm run test` |
| `pre-push` | `npm run build` (lint + tsc) |

### Build gate

`npm run build` runs `npm run lint` first. If Prettier or ESLint finds violations, the TypeScript compilation never runs.

---

## Testing Architecture

### lib/testing

Tests import from `lib/testing` only — never from `vitest` directly:

```typescript
import { test, describe, it, expect, beforeAll, afterAll } from '../../lib/testing';
```

The `test` object maps to `vi.*`:

```typescript
test.fn()         // vi.fn()
test.mock(...)    // vi.mock(...)  — correctly hoisted by vitest
test.spy(...)     // vi.spyOn(...)
test.clearAll()   // vi.clearAllMocks()
```

`test.mock` hoisting works because:
1. `globals: true` in `vitest.config.ts` makes `vi` a global — no import needed
2. A `testAliasPlugin` (Vite transform, `enforce: 'pre'`) rewrites `test.mock(` → `vi.mock(` before vitest processes the file, so the static hoisting analysis finds the expected pattern

The plugin is defined inside each project config (unit, integration), not at the root — vitest isolates each project's Vite instance.

### createTestDataSource

Integration tests use an in-memory SQLite database, never Postgres:

```typescript
// tests/integration/helpers/data-source.ts
import { createTestDataSource } from '../../../lib/testing';
export const TestDataSource = createTestDataSource([...schemas]);

// in each test file
test.mock('../../src/db/data-source', () => ({ AppDataSource: TestDataSource }));
```

`createTestDataSource` creates a TypeORM DataSource with `better-sqlite3`, `database: ':memory:'`, and `synchronize: true` — no migrations needed.

---

## How to Add a Field to an Existing Entity

Follow this order — TypeScript will point to exactly which files need attention at each step.

1. `src/model/<entity>.ts` — add the field to the schema
2. `src/wire/in/<entity>.ts` — add to inbound contract (if it comes from outside)
3. `src/wire/out/<entity>.ts` — add to outbound contract (if it is exposed)
4. `src/adapters/<entity>.ts` — map the field in all affected functions
5. `src/db/wire/<entity>.ts` — add the column with the correct TypeORM decorator
6. `src/db/migrations/` — create a migration to add the column

**What never needs to change:** `logic/`, `controllers/`, `diplomat/`, `lib/`. The change stays contained within the entity's boundary.

---

## How to Create a New Entity

#### 1. Model

```
src/model/<entity>.ts
```

Define the schema with `createSchema`. Add an `Input` variant (without `id`, `createdAt`) if the entity is created by the application:

```typescript
export const MyEntity = createSchema({
  id: field.uuid(),
  journeyId: field.uuid(),
  createdAt: field.date(),
});
export const MyEntityInput = createSchema({
  id: field.uuid(),
  journeyId: field.uuid(),
});
```

#### 2. Wire

```
src/wire/in/<entity>.ts    ← format received from outside
src/wire/out/<entity>.ts   ← format sent to outside
```

#### 3. DB Wire

```
src/db/wire/<entity>.ts
```

TypeORM entity with snake_case columns. Register it in `AppDataSource.entities`.

```typescript
@Entity('<table_name>')
export class MyEntityDbWire {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;
  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;
  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
```

#### 4. Migration

```bash
npm run migration:generate -- create_<entity>
```

#### 5. Adapters

```
src/adapters/<entity>.ts
```

Implement `fromDbWire` and `toDbWire` (minimum). Add `fromWireIn`/`toWireOut` if the entity crosses HTTP or Kafka boundaries.

#### 6. Logic

```
src/logic/<entity>.ts
```

Pure functions that build or derive values for this entity. Wrap with `fn` or `asyncFn`.

#### 7. DB

```
src/db/<entity>.ts
```

Query functions (`findById`, `insert`, etc.) that receive and return `model`. Use adapters internally.

#### 8. Controller

```
src/controllers/<entity>.ts
```

Orchestrates the flow. Calls `logic` and `db`. Never imports `wire` or `db/wire`.

#### 9. Diplomat

```
src/diplomat/http-server/<entity>.ts   ← if it has an HTTP endpoint
src/diplomat/consumer/<entity>.ts      ← if it is triggered by a Kafka message
```

Register in the respective `index.ts`.

#### New entity file checklist

```
src/model/<entity>.ts
src/wire/in/<entity>.ts
src/wire/out/<entity>.ts
src/db/wire/<entity>.ts
src/db/<entity>.ts
src/db/migrations/<timestamp>_create_<entity>.ts
src/adapters/<entity>.ts
src/logic/<entity>.ts
src/controllers/<entity>.ts
src/diplomat/http-server/<entity>.ts   (if applicable)
src/diplomat/consumer/<entity>.ts      (if applicable)
```

---

## Core Principle

> Each layer speaks only the language that belongs to it. `model` is the internal language. `wire` is the external world's language. `adapters` are the interpreters. `lib` is the only layer that knows the frameworks. No data crosses a boundary without going through the correct interpreter, and no framework leaks into the application.
