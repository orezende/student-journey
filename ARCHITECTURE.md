# Diplomat Architecture — Developer Reference

This document is the authoritative reference for the Diplomat Architecture as implemented in this project. It covers layer responsibilities, data flow, and step-by-step guides for extending the codebase.

---

## Overview

The **Diplomat Architecture** enforces strict layer boundaries between every responsibility in the application. No layer knows more than it needs to. No data crosses a boundary without going through the correct interpreter.

The codebase is split into two top-level blocks:

- **`lib/`** — technical infrastructure. The only place that imports external frameworks and brokers.
- **`src/`** — application logic, organized in internal layers.

---

## Layers

### `lib/` — Technical Infrastructure

Encapsulates all frameworks and communication technologies. Nothing in `src/` imports Fastify, Kafka, or any external library directly.

| Module | Encapsulates | Exposes |
|---|---|---|
| `lib/http-server` | Fastify | `get`, `post`, `listen`, `inject` |
| `lib/consumer` | KafkaJS | `subscribe(name, handler)` |
| `lib/producer` | KafkaJS | `publish(name, message)`, `publishRaw(topic, message)` |
| `lib/types/schema` | — | `createSchema`, `field.*` |
| `lib/types/fn` | — | `fn`, `asyncFn` |
| `lib/types/uuid` | — | `toUUID`, `asUUID` |
| `lib/errors` | — | `NotFoundError`, `ConflictError`, `ValidationError` |
| `lib/logger` | pino | `logger` |
| `lib/kafka` | KafkaJS `Kafka` | `kafka` client instance |

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

---

## Data Flow

### HTTP entry point

```
HTTP request
  → lib/http-server       (Fastify — receives and routes)
  → diplomat/http-server  (receives wire/in body)
  → adapters.fromWireIn   (wire/in → model)
  → controllers           (model → model)
  → adapters.toWireOut    (model → wire/out)
  → lib/http-server       (Fastify — responds)
```

### Kafka consumer

```
Kafka message
  → lib/consumer          (KafkaJS — receives, retries, DLQ)
  → diplomat/consumer     (receives wire/in)
  → adapters.toModel      (wire/in → model)
  → controllers           (model → void)
```

### Kafka producer

```
controllers
  → lib/producer.publish  (model → topic)
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

```
src/db/migrations/<timestamp>_create_<entity>.ts
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
