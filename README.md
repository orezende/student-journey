# Student Journey — Diplomat Architecture

Implementation of **MindStream**, an EDA-based adaptive learning platform built on the **Diplomat Architecture** — a pattern for organizing backend applications with strict layer boundaries.

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
│   ├── errors/                 # Generic error classes
│   ├── http-server/            # Encapsulates the HTTP server (Fastify)
│   ├── consumer/               # Encapsulates message consumption (Kafka)
│   ├── producer/               # Encapsulates message publishing
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

---

## Layers

### `lib/` — Technical Infrastructure

The only layer that knows and imports external frameworks (Fastify, Kafka). Everything else in the application is completely agnostic about which technology is being used.

**Direct benefit:** swapping Fastify for another framework, or Kafka for another broker, means changing only files inside `lib/` — not a single line in `src/` changes.

| Module | Responsibility | Exposed interface |
|---|---|---|
| `lib/errors` | Generic error classes | `NotFoundError`, `ConflictError`, `ValidationError` |
| `lib/http-server` | HTTP server | `get`, `post`, `listen`, `inject` |
| `lib/consumer` | Message consumption | `subscribe(name, handler)` |
| `lib/producer` | Message publishing | `publish(name, message)` |
| `lib/types/schema` | Runtime validation | `createSchema`, `field.*` |
| `lib/types/fn` | Validated function wrappers | `fn`, `asyncFn` |
| `lib/types/uuid` | Branded UUID | `toUUID`, `asUUID` |

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

## How to Run

### Prerequisites

- Node.js 22+
- Yarn
- Docker

### Start with Docker

```bash
docker compose up -d
```

### Available Services

| Service | URL | Description |
|---|---|---|
| **API** | http://localhost:3000 | Main application |
| **Kafka UI** | http://localhost:8080 | Kafka web interface — topics, messages, consumer groups |
| **Grafana** | http://localhost:4000 | Observability dashboards — logs via Loki |
| **PostgreSQL** | localhost:5432 | Database — user `postgres`, password `postgres`, db `poc` |

### Local Setup

```bash
yarn install
yarn dev          # development with hot reload
yarn build        # compile to dist/
yarn start        # run compiled build
```

### Endpoints

```
GET  /health
→ { status: 'ok' }

POST /journeys
Body: { "name": "Alice", "email": "alice@example.com" }
→ 201: { "id": "...", "studentId": "...", "currentStep": "JOURNEY_INITIATED", "status": "active", "createdAt": "..." }
```

```bash
curl -s -X POST http://localhost:3000/journeys \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}' | jq
```

---

## Testing

```bash
yarn unit          # unit tests only
yarn integration   # integration tests only
yarn test          # all tests
```

### Unit tests

Cover every `logic/` and `adapters/` function in isolation. No mocks, no infrastructure.

```
tests/unit/
├── event/             # buildEvent, toModel
├── eventRecord/       # buildEventRecord
├── journey/           # buildJourney, buildJourneyStepUpdate, buildJourneyStatusUpdate
├── journeyInitiated/  # buildJourneyInitiated
├── student/           # buildStudent
├── diagnosticTriggered/adapters.test.ts
├── diagnosticCompleted/adapters.test.ts
├── analysisStarted/adapters.test.ts
├── analysisFinished/adapters.test.ts
├── curriculumGenerated/adapters.test.ts
├── contentDispatched/adapters.test.ts
├── studentEngagementReceived/adapters.test.ts
├── progressMilestoneReached/adapters.test.ts
└── journeyCompleted/adapters.test.ts
```

### Integration tests

Cover the full lifecycle end-to-end with no external dependencies:
- Real HTTP injection via Fastify `inject` (no server needed)
- SQLite in-memory database (no Postgres needed)
- Kafka producer mocked — verifies topic and payload correctness

**HTTP entry point:**
```
POST /journeys
  → validate input
  → insert Student, Journey, JourneyInitiated in DB
  → publish('journeyInitiated', { journeyId, eventId })
  → return Journey (201)
```

**One test file per saga step** — each verifies all four guarantees of its consumer:

```
tests/integration/
├── journey.test.ts                    # POST /journeys HTTP flow
├── journey-initiated.test.ts          # journeyStarted consumer
├── diagnostic-triggered.test.ts       # diagnosticTriggered consumer
├── diagnostic-completed.test.ts       # diagnosticCompleted consumer
├── analysis-started.test.ts           # analysisStarted consumer
├── analysis-finished.test.ts          # analysisFinished consumer
├── curriculum-generated.test.ts       # curriculumGenerated consumer
├── content-dispatched.test.ts         # contentDispatched consumer
├── student-engagement-received.test.ts
└── progress-milestone-reached.test.ts
```

Each integration test file verifies:
1. The new event record is inserted with `id = previous.id`
2. `journey.current_step` is advanced to the correct step
3. The correct Kafka topic is published with the right payload
4. A second identical call is idempotent — no duplicate record, publish is re-issued

---

## Core Principle

> Each layer speaks only the language that belongs to it. `model` is the internal language. `wire` is the external world's language. `adapters` are the interpreters. `lib` is the only layer that knows the frameworks. No data crosses a boundary without going through the correct interpreter, and no framework leaks into the application.
