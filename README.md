# Student Journey — Diplomat Architecture

Implementation of **MindStream**, an EDA-based adaptive learning platform built on the **Diplomat Architecture** — a pattern for organizing backend applications with strict layer boundaries.

---

## How to Run

### Prerequisites

- Node.js 24+
- Docker

### Start with Docker

```bash
docker compose up -d
```

### Available Services

| Service | URL | Description |
|---|---|---|
| **Dashboard** | http://localhost:3000 | Service overview with start/stop controls |
| **Architecture Overview** | http://localhost:3000/overview | Visual diagrams: state machine, data flow, layers, infrastructure |
| **API Reference** | http://localhost:3000/docs | Scalar UI — interactive docs for all endpoints |
| **Kafka UI** | http://localhost:8080 | Topics, messages, consumer groups |
| **Grafana** | http://localhost:4000 | Logs via Loki |
| **PostgreSQL** | localhost:5432 | user `postgres`, password `postgres`, db `student_journey` |

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service dashboard — status and start/stop controls for all containers |
| `GET` | `/overview` | Architecture overview — visual diagrams of state machine, data flow and infrastructure |
| `GET` | `/docs` | Scalar API Reference — interactive documentation |
| `GET` | `/health` | Health check — returns JSON with DB and Kafka status |
| `POST` | `/journeys` | Start a new student journey |
| `POST` | `/services/start` | Start a Docker container by name (dashboard internal) |
| `POST` | `/services/stop` | Stop a Docker container by name (dashboard internal) |

```bash
# Health check
curl -s http://localhost:3000/health

# Start a journey
curl -s -X POST http://localhost:3000/journeys \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}' | jq
```

### Local Setup

```bash
npm install
npm run dev          # development with hot reload
npm run build        # lint + compile to dist/
npm start            # run compiled build
```

### Migrations

```bash
npm run migration:generate -- <name>   # generate a new migration
npm run migration:run                  # apply pending migrations
npm run migration:revert               # revert the last migration
```

---

## The Problem This Architecture Solves

In conventional applications, business logic, database access, HTTP calls, and framework code are often mixed together. This creates systems that are hard to test, hard to evolve, and where a change in one place breaks another unexpectedly.

The Diplomat Architecture solves this by defining **rigid boundaries** between each responsibility. Every layer has a clear contract: what it receives, what it does, and what it returns.

---

## Type System

This project uses a runtime validation system built in `lib/types/` that replaces traditional TypeScript interfaces with self-validating schemas.

### `createSchema` — Schema as the single source of truth

```typescript
// src/model/journey.ts
export const Journey = createSchema({
  id: field.uuid(),
  studentId: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
  status: field.literal(...JOURNEY_STATUSES),
  createdAt: field.date(),
});
```

The schema serves as both the **runtime validator** and the **TypeScript type**. No `interface`, no `type`, no `Infer<typeof X>` — the schema is the contract.

### `fn` and `asyncFn` — Type-safe function wrappers

Every function that crosses a layer boundary is wrapped with `fn` (sync) or `asyncFn` (async). Both validate input and output against schemas automatically:

```typescript
// Validates: Journey.parse(raw) → impl → JourneyWireOut.parse(result)
export const toWireOut = fn(Journey, JourneyWireOut, (journey) => ({
  id: journey.id,
  studentId: journey.studentId,
  currentStep: journey.currentStep,
  status: journey.status,
  createdAt: journey.createdAt.toISOString(),
}));

// async with output validation
export const startJourney = asyncFn(StudentInput, Journey, async (input) => { ... });

// async void — validates input only
export const journeyStarted = asyncFn(Event, async (event) => { ... });
```

Any invalid data — wrong UUID format, missing field, wrong enum value — throws a `TypeError` at the boundary, never inside domain logic.

### Branded UUID

```typescript
// UUID is a branded string — not assignable from plain string
export type UUID = string & { readonly [_uuidBrand]: typeof _uuidBrand };

toUUID('not-a-uuid');  // throws TypeError
asUUID(row.id);        // trusted cast for DB values
```

---

## Folder Structure

```
.
├── lib/                        # Technical infrastructure (frameworks and brokers)
│   ├── db/                     # Encapsulates TypeORM (DataSource, migrations, CLI, createTestDataSource)
│   ├── http/                   # Encapsulates Fastify (get, post, listen, inject)
│   ├── messaging/              # Encapsulates KafkaJS (producer, consumer, ensureTopics)
│   ├── observability/          # Encapsulates pino (logger)
│   ├── testing/                # Encapsulates vitest (test object, createTestDataSource re-export)
│   ├── quality/                # ESLint + Prettier config + git hooks (tooling-only)
│   └── types/
│       ├── schema.ts           # createSchema, field.*
│       ├── fn.ts               # fn, asyncFn
│       └── uuid.ts             # Branded UUID type
│
└── src/
    ├── model/
    │   ├── journey.ts          # Journey domain schema + step/status enums
    │   ├── event-record.ts     # Shared schema for all 9 saga event tables
    │   └── ...                 # Student, JourneyInitiated, Event schemas
    ├── wire/
    │   ├── in/                 # Inbound contracts (HTTP body, received message)
    │   └── out/                # Outbound contracts (HTTP response, published message)
    ├── adapters/               # Translation between wire and model
    ├── logic/
    │   ├── event-record.ts     # buildEventRecord — converts Kafka Event → EventRecordInput
    │   ├── journey.ts          # buildJourney, buildJourneyStepUpdate, buildJourneyStatusUpdate
    │   └── ...                 # Other pure domain functions
    ├── controllers/            # Business rule orchestration (one file per saga step)
    ├── db/
    │   ├── wire/               # TypeORM entities (database format)
    │   ├── migrations/         # Database migrations
    │   └── data-source.ts      # TypeORM configuration
    └── diplomat/               # Bridge between lib and application
        ├── http-server/        # Inbound HTTP routes
        └── consumer/           # Registers all 9 Kafka consumers
```

Each `lib/*` directory is an npm workspace package with its own `package.json` declaring only its direct dependencies. No external framework is ever imported directly in `src/`.

---

## Layers

### `lib/` — Technical Infrastructure

The only layer that knows and imports external frameworks (Fastify, Kafka, TypeORM, pino). Everything else in the application is completely agnostic about which technology is being used.

**Direct benefit:** swapping Fastify for another framework, or Kafka for another broker, means changing only files inside `lib/` — not a single line in `src/` changes.

| Module | Responsibility | Exposed interface |
|---|---|---|
| `lib/types` | Runtime validation + branded types | `createSchema`, `field.*`, `fn`, `asyncFn`, `UUID` |
| `lib/db` | Database (TypeORM) | `AppDataSource`, `createTestDataSource`, migration CLI |
| `lib/http` | HTTP server (Fastify) | `get`, `post`, `listen`, `inject` |
| `lib/messaging` | Message broker (KafkaJS) | `publish`, `subscribe`, `ensureTopics` |
| `lib/observability` | Logging (pino) | `logger` |
| `lib/testing` | Test utilities (vitest) | `test`, `describe`, `it`, `expect`, `createTestDataSource` |
| `lib/docker` | Docker socket API | `startContainer`, `stopContainer` |
| `lib/quality` | Linting, formatting, git hooks | `base()`, `boundaries()`, `setup.ts` |

---

### `model/` — Internal Domain

Defines the schemas that circulate inside the application. This is the internal "language" — all data processed by `controller`, `logic`, and `db` layers respects this format.

**Rule:** no database fields (snake_case, technical columns) and no external contract fields enter the model. That is the adapter's job.

---

### `wire/` — External Contracts

Defines the exact format that external systems send and expect to receive. Completely separate from the internal model.

- **`wire/in/`** — inbound format. Used by `http-server` (HTTP requests) and `consumer` (queue messages).
- **`wire/out/`** — outbound format. Used by HTTP responses and `producer` (published messages).

---

### `adapters/` — Translation Between Worlds

The only layer that simultaneously knows both `wire` and `model`. Responsible exclusively for mapping fields — no business logic. Every adapter function is wrapped in `fn` or `asyncFn`, guaranteeing that data is validated on both entry and exit.

---

### `logic/` — Pure Functions

Contains all computational logic that does not depend on infrastructure. Pure functions: same input always produces the same output.

**Strict rules:**
- Zero external dependencies
- Never accesses the database, never makes HTTP calls
- Never imports from layers other than `model/`
- Consequence: testable with no mocks whatsoever

---

### `controllers/` — Business Rules

Orchestrates the flow of an operation. This is the application's core: makes decisions, coordinates calls to `logic` and `db`, guarantees consistency.

**Rules:**
- Always receives `model`, always returns `model`
- Never imports `wire` or `db/wire` types
- The only place where business decisions exist

---

### `db/` — Database Access

Executes queries and persists data. Always receives and returns `model` — the conversion to the database format happens internally via adapters.

---

### `diplomat/` — Bridge Between Lib and Application

Connects `lib` modules to application logic. This is the point where external data is received, validated via adapter, and delivered to the controller.

**Never imports Fastify, Kafka, or any framework directly.**

```typescript
// diplomat/http-server/journey.ts
post('/journeys', async (body) => {
  const studentInput = fromWireIn(body);            // wire/in → model
  const journey = await startJourney(studentInput); // controller
  return toWireOut(journey);                        // model → wire/out
});

// diplomat/consumer/index.ts
const handleJourneyInitiated = asyncFn(EventWireIn, async (wire) => {
  await journeyStarted(toModel(wire)); // explicit external → internal boundary
});
```

---

## Event-Driven Architecture (EDA)

MindStream is built on a **Self-Looping Saga** — a single service that produces and consumes its own events, advancing the student's journey state asynchronously and resiliently.

### State Machine

```
POST /journeys (HTTP)
       │
       ▼
JOURNEY_INITIATED ──► DIAGNOSTIC_TRIGGERED ──► DIAGNOSTIC_COMPLETED
                                                        │
                  CURRICULUM_GENERATED ◄── ANALYSIS_FINISHED ◄── ANALYSIS_STARTED
                          │
                          ▼
                  CONTENT_DISPATCHED ──► STUDENT_ENGAGEMENT_RECEIVED
                                                        │
                                          JOURNEY_COMPLETED ◄── PROGRESS_MILESTONE_REACHED
```

### Kafka Message Contract

Each message carries only two fields. The consumer uses them to look up everything it needs from the database — the message is minimal, the database is the source of truth.

```json
{ "eventId": "<previous-event-id>", "journeyId": "<journey-id>" }
```

`eventId` always refers to the `id` of the record inserted in the **previous step**. When the next consumer inserts its own record, it reuses that same `id` as its primary key — creating an immutable chain without any foreign key column.

### Virtual Reference — Scalable Event Chain

Each saga event table has only three columns: `id`, `journey_id`, `created_at`. There is no `previous_event_id` column and no FK constraint. Instead, the `id` of each record is set to the `id` of the record from the previous step.

```
journey_initiated.id  ──set as──►  diagnostic_triggered.id
diagnostic_triggered.id  ──set as──►  diagnostic_completed.id
...and so on through all 9 steps
```

This means a new step can be inserted anywhere in the chain without modifying existing tables or records.

### Controller Pattern

Every consumer controller follows the same four-step pattern:

```typescript
export const diagnosticTriggered = asyncFn(Event, async (event) => {
  // 1. Validate the previous event exists
  const previous = await diagnosticTriggeredDb.findById(event.eventId);
  if (!previous) throw new NotFoundError('...');

  // 2. Idempotency check — already processed?
  const existing = await diagnosticCompletedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  // 3. Insert current event record + advance journey step
  const current = await diagnosticCompletedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'DIAGNOSTIC_COMPLETED' }));

  // 4. Publish next event
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
```

| Step | Purpose |
|---|---|
| `findById(event.eventId)` on **previous** table | Validates the incoming event refers to a real record |
| `findById(event.eventId)` on **current** table | Idempotency — if already processed, re-publishes and exits |
| `insert(buildEventRecord(event))` + `updateStep` | Persists the new step and advances the journey state |
| `publish` via `sideEffect` | Triggers the next step in the saga |

The last step (`progressMilestoneReached`) has no `sideEffect` — it closes the saga by setting `status: 'completed'`.

### Registered Consumers

```typescript
subscribe('journeyInitiated',          handle(journeyStarted));
subscribe('diagnosticTriggered',       handle(diagnosticTriggered));
subscribe('diagnosticCompleted',       handle(diagnosticCompleted));
subscribe('analysisStarted',           handle(analysisStarted));
subscribe('analysisFinished',          handle(analysisFinished));
subscribe('curriculumGenerated',       handle(curriculumGenerated));
subscribe('contentDispatched',         handle(contentDispatched));
subscribe('studentEngagementReceived', handle(studentEngagementReceived));
subscribe('progressMilestoneReached',  handle(progressMilestoneReached));
```

---

## Resilience

### Consumer error handling

Every message processed by `lib/messaging` is wrapped in a try/catch. An error thrown by the handler — whether a `NotFoundError`, a transient DB failure, or a validation error — never crashes the consumer. The Kafka `eachMessage` loop keeps running regardless.

### Retry with exponential backoff

Before giving up, the consumer retries the handler up to **3 times** with exponential backoff:

```
attempt 1 → wait 500ms → attempt 2 → wait 1s → attempt 3 → wait 2s → give up
```

### Dead Letter Queue (DLQ)

If all retries are exhausted, the original message is published to the `student-journey-dlq` Kafka topic with full context for debugging:

```json
{
  "originalTopic": "DIAGNOSTIC_TRIGGERED",
  "name": "diagnosticTriggered",
  "payload": { "eventId": "...", "journeyId": "..." },
  "error": "DiagnosticTriggered not found for eventId: ...",
  "failedAt": "2024-01-01T00:00:00.000Z"
}
```

### Summary

| Failure scenario | Behavior |
|---|---|
| Handler throws (any error) | Consumer stays alive, retries up to 3× |
| Transient DB failure | Resolved by retry backoff |
| Persistent failure after retries | Message routed to `student-journey-dlq` |
| Broker unavailable at startup | Kafka client retries 10× before failing |
| Graceful shutdown (`SIGTERM`) | HTTP, producer, and DB closed orderly |

---

## Observability

### Log pipeline

```
app container (stdout)
       │
       ▼
Promtail  ← scrapes Docker socket every 5s
       │
       ▼
Loki  ← stores and indexes log streams
       │
       ▼
Grafana  ← queries Loki via LogQL
```

### Correlation ID (`cid`)

Each Kafka message carries a `cid` field that propagates through the entire saga. The format is `<uuid-prefix>:<hop-count>`:

```
a3f2b1c0:0  →  a3f2b1c0:1  →  a3f2b1c0:2  →  ...  →  a3f2b1c0:8
```

Filtering by the UUID prefix in Grafana shows the entire lifecycle of one journey.

### Querying logs in Grafana

Navigate to `http://localhost:4000` → **Explore** → datasource **Loki**.

```logql
{container="student-journey-app-1"} | json | cid =~ "a3f2b1c0:.*"
{container="student-journey-app-1"} |= "sending to DLQ"
{container="student-journey-app-1"} | json | topic = "DIAGNOSTIC_TRIGGERED"
```

---

## Quality

Code quality is enforced at every stage of the development workflow.

### Lint + Format

```bash
npm run lint       # prettier --check + eslint (fails build if broken)
npm run lint-fix   # prettier --write + eslint --fix (auto-fixes formatting)
```

ESLint enforces:
- **No framework imports in `src/`** — `typeorm`, `kafkajs`, `fastify`, `pino`, `vitest` are banned. All access goes through the corresponding `lib/*`.
- **Layer boundaries** — a controller cannot import from another controller; logic cannot import from db; diplomat can only import from controllers and wire. Violations are compile-time errors.
- **No plain function declarations in domain layers** — `function foo() {}`, `const foo = () => {}`, and `const foo = function() {}` are banned in `src/adapters`, `src/controllers`, `src/logic`, `src/model`, and `src/wire`. All functions must use `fn()` or `asyncFn()` from `lib/types`.

### Git hooks

Install once with:

```bash
npm run quality:setup
```

After that, hooks run automatically:

| Hook | Trigger | Command |
|---|---|---|
| `pre-commit` | `git commit` | `npm run test` |
| `pre-push` | `git push` | `npm run build` |

There is no `--no-verify` bypass documented here intentionally.

---

## Testing

```bash
npm run unit          # unit tests only
npm run integration   # integration tests only
npm run test          # all tests
```

Tests import exclusively from `lib/testing` — never from `vitest` directly:

```typescript
import { test, describe, it, expect, beforeAll, afterAll } from '../../lib/testing';

test.mock('../../src/db/data-source', () => ({ AppDataSource: TestDataSource }));
test.mock('../../lib/messaging/producer/index', () => ({
  publish: test.fn(),
}));
```

### Unit tests

Cover every `logic/` and `adapters/` function in isolation. No mocks, no infrastructure.

### Integration tests

Cover the full lifecycle end-to-end with no external dependencies:
- Real HTTP injection via Fastify `inject` (no running server needed)
- SQLite in-memory database via `createTestDataSource` (no Postgres needed)
- Kafka producer mocked — verifies topic and payload correctness

**One test file per saga step**, each verifying:
1. The new event record is inserted with `id = previous.id`
2. `journey.current_step` is advanced to the correct step
3. The correct Kafka topic is published with the right payload
4. A second identical call is idempotent — no duplicate record

```
tests/integration/
├── journey.test.ts                    # POST /journeys HTTP flow
├── journey-initiated.test.ts
├── diagnostic-triggered.test.ts
├── diagnostic-completed.test.ts
├── analysis-started.test.ts
├── analysis-finished.test.ts
├── curriculum-generated.test.ts
├── content-dispatched.test.ts
├── student-engagement-received.test.ts
└── progress-milestone-reached.test.ts
```

---

## Core Principle

> Each layer speaks only the language that belongs to it. `model` is the internal language. `wire` is the external world's language. `adapters` are the interpreters. `lib` is the only layer that knows the frameworks. No data crosses a boundary without going through the correct interpreter, and no framework leaks into the application.
