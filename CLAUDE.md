# Proposta de Arquitetura: Diplomat Architecture

## Visão Geral

Esta proposta descreve a arquitetura **Diplomat**, utilizada em larga escala no Nubank, como padrão de organização de código para nossas aplicações backend. O objetivo central é garantir **separação clara de responsabilidades**, **isolamento entre camadas** e **facilidade de evolução** sem quebrar contratos existentes.

A aplicação é dividida em camadas com responsabilidades bem definidas. Nenhuma camada conhece mais do que precisa. Cada dado trafega em um formato específico para cada contexto.

A estrutura de pastas é dividida em dois blocos principais:
- **`lib/`** — abstração de toda comunicação com o mundo externo (frameworks, brokers, clientes HTTP)
- **`src/`** — lógica da aplicação, organizada em camadas internas

---

## Camadas

### `lib` _(fora de `src/`)_

**O que é:** A camada de infraestrutura técnica. Abstrai todos os frameworks e tecnologias de comunicação usados pela aplicação.

**Responsabilidade:** Encapsular completamente o framework HTTP, o cliente HTTP e o broker de mensagens. Nenhuma outra camada da aplicação importa Fastify, RabbitMQ, Kafka, axios ou qualquer biblioteca de comunicação diretamente — tudo passa pela `lib`.

**Módulos:**
| Módulo | Tecnologia encapsulada | O que expõe |
|---|---|---|
| `lib/http-server` | Fastify | `get(path, handler)`, `post(path, handler)`, `listen(port, host)` |
| `lib/http-client` | fetch / axios | `get(url)`, `post(url, body)` |
| `lib/consumer` | RabbitMQ / Kafka / SQS | `subscribe(queue, handler)` |
| `lib/producer` | RabbitMQ / Kafka / SQS | `publish(queue, message)` |

**Regras:**
- É o único lugar onde Fastify, Kafka, RabbitMQ, etc. são importados.
- Expõe interfaces genéricas e tipadas — sem vazamento de tipos do framework.
- Trocar o framework HTTP ou o broker de mensagens significa alterar apenas a `lib`, sem tocar em nenhuma outra camada.

---

### `model`

**O que é:** A representação interna de uma entidade do domínio.

**Responsabilidade:** Definir a estrutura de dados que a aplicação enxerga internamente. É o "idioma" da aplicação — todos os dados processados internamente respeitam esse formato.

**Regras:**
- É a única representação que circula entre controller, logic e db.
- Nunca carrega detalhes de banco de dados (snake_case, colunas técnicas) nem detalhes de contrato externo (campos de API, campos de fila).
- Cada entidade tem seu próprio arquivo: `model/event.ts`, `model/customer.ts`.

**Exemplo:** O campo `entityId` no model nunca vira `entity_id` — essa conversão é responsabilidade do adapter.

---

### `wire`

**O que é:** Os contratos de comunicação externa da aplicação.

**Responsabilidade:** Definir exatamente o formato que sistemas externos enviam e esperam receber. Dividido em dois subtipos:

- **`wire/in`** — formato de entrada. Usado por `http-server` (requisições HTTP recebidas) e `consumer` (mensagens recebidas de filas).
- **`wire/out`** — formato de saída. Usado por `http-client` (requisições HTTP enviadas) e `producer` (mensagens publicadas em filas).

**Regras:**
- Apenas os adapters conhecem o wire. Nenhuma outra camada importa tipos de wire.
- Reflete o contrato com o mundo externo — se a API parceira mudar, só o wire e o adapter mudam.

---

### `adapters`

**O que é:** A camada de tradução entre o mundo externo e o mundo interno.

**Responsabilidade:** Converter dados entre formatos wire e o model interno. É a única camada que conhece simultaneamente o wire e o model.

**Funções presentes:**
| Função | Entrada | Saída | Usado por |
|---|---|---|---|
| `fromWireIn` | `wire/in` | `model` | http-server, consumer |
| `toWireOut` | `model` | `wire/out` | http-server, http-client, producer |
| `fromDbWire` | `db/wire` | `model` | db |
| `toDbWire` | `model` | `db/wire` | db |

**Regras:**
- Sem lógica de negócio. Apenas mapeamento de campos.
- Nunca chama banco, nunca chama serviços externos.

---

### `logic`

**O que é:** Funções puras de domínio.

**Responsabilidade:** Conter toda lógica computacional da aplicação que não depende de infraestrutura: cálculos, derivações, construção de entidades, geração de chaves.

**Regras:**
- Apenas funções puras — mesma entrada sempre produz mesma saída.
- Zero dependências externas. Apenas módulos nativos do Node.js (ex: `node:crypto`).
- Nunca acessa banco, nunca faz chamadas HTTP, nunca importa de outras camadas exceto `model`.
- É a camada mais fácil de testar — sem mocks, sem setup.

**Exemplos do que vive aqui:**
- `buildEvent(input, retryCount)` — constrói a entidade com id e idempotencyKey gerados
- `computeIdempotencyKey(...)` — deriva a chave de idempotência via SHA-256
- `calculateRetryCount(...)` — calcula o número de tentativas

---

### `db`

**O que é:** A camada de acesso ao banco de dados.

**Responsabilidade:** Executar queries e persistir dados. Fala com o banco usando `db/wire` (entidades TypeORM), mas sempre recebe e retorna o `model` interno — a conversão é feita internamente via adapters.

**Estrutura interna:**
- **`db/wire/`** — entidades TypeORM que mapeiam as tabelas do banco. Usam snake_case e decorators (`@Entity`, `@Column`, etc.).
- **`db/migrations/`** — arquivos de migração que evoluem o schema do banco.
- **`db/data-source.ts`** — configuração da conexão (TypeORM DataSource).
- **`db/<entidade>.ts`** — funções de query por contexto: `find`, `insert`, `count`, etc.

**Regras:**
- As funções de query sempre recebem `model` e sempre retornam `model`.
- A conversão `model ↔ db/wire` é feita pelos adapters, chamados internamente.
- Sem lógica de negócio. Sem decisões sobre o que fazer com os dados.

---

### `controllers`

**O que é:** A camada de orquestração da regra de negócio.

**Responsabilidade:** Coordenar o fluxo de uma operação — chamar a logic, consultar o banco, tomar decisões e retornar o resultado. É o núcleo da aplicação.

**Regras:**
- Sempre recebe `model` e sempre retorna `model`.
- Nunca importa tipos de `wire/in`, `wire/out` ou `db/wire`.
- Chama `logic` para computações puras.
- Chama `db` para persistência e consulta.
- É o único lugar onde decisões de negócio existem (ex: idempotência, tratamento de race condition).

**Exemplo de fluxo no controller:**
```
countProcessingEvents → calculateRetryCount → buildEvent → findByIdempotencyKey → insert
```

---

### `diplomat`

**O que é:** A camada de infraestrutura de comunicação.

**Responsabilidade:** Conectar a aplicação ao mundo externo. É o ponto de entrada e saída de todos os dados. Dividida em quatro subtipos:

| Subtipo | Direção | Como funciona |
|---|---|---|
| `http-server` | Entrada síncrona | Recebe requisição HTTP → chama adapter → chama controller → retorna resposta |
| `consumer` | Entrada assíncrona | Recebe mensagem de fila → chama adapter → chama controller (fire-and-forget) |
| `http-client` | Saída síncrona | Recebe model do controller → chama adapter → dispara requisição HTTP |
| `producer` | Saída assíncrona | Recebe model do controller → chama adapter → publica mensagem em fila |

**Regras:**
- Nunca contém lógica de negócio.
- Nunca acessa o banco diretamente.
- **Nunca importa Fastify, RabbitMQ, Kafka ou qualquer framework diretamente** — toda comunicação técnica passa pela `lib`.
- Sempre usa adapters para converter entre wire e model antes de chamar o controller.
- Cada subtipo tem um `index.ts` que agrega os handlers e os conecta à `lib` (ex: `subscribe`, `registerRoutes`).

---

## Fluxo Completo

### Entrada síncrona (HTTP)
```
Requisição externa
  → lib/http-server        (Fastify — recebe e roteia)
  → diplomat/http-server   (recebe wire/in)
  → adapters.fromWireIn    (wire/in → model)
  → controllers            (model → model)
  → adapters.toWireOut     (model → wire/out)
  → lib/http-server        (Fastify — responde)
```

### Entrada assíncrona (fila)
```
Mensagem externa
  → lib/consumer           (RabbitMQ/Kafka — recebe e roteia)
  → diplomat/consumer      (recebe wire/in, fire-and-forget)
  → adapters.fromWireIn    (wire/in → model)
  → controllers            (model → model)
```

### Saída via HTTP
```
controllers
  → diplomat/http-client   (model → adapter → wire/out)
  → lib/http-client        (dispara a requisição HTTP)
```

### Saída via fila
```
controllers
  → diplomat/producer      (model → adapter → wire/out)
  → lib/producer           (publica a mensagem no broker)
```

### Saída para banco
```
controllers
  → db.insert(model)
  → adapters.toDbWire      (model → db/wire)
  → TypeORM Repository     (persiste no banco)
  → adapters.fromDbWire    (db/wire → model)
  → controllers            (recebe model de volta)
```

---

## Guia de Implementação

### Como adicionar um novo campo a uma entidade existente

Seguir esta ordem garante que o TypeScript aponte exatamente os arquivos que precisam de atenção a cada passo.

1. **`src/model/<entidade>.ts`** — declare o novo campo na interface do model
2. **`src/wire/in/<entidade>.ts`** — adicione o campo no contrato de entrada (se vier de fora)
3. **`src/wire/out/<entidade>.ts`** — adicione o campo no contrato de saída (se for exposto)
4. **`src/adapters/<entidade>.ts`** — mapeie o campo em todas as funções afetadas:
   - `fromWireIn` — wire/in → model
   - `toWireOut` — model → wire/out
   - `toDbWire` — model → db/wire
   - `fromDbWire` — db/wire → model
5. **`src/db/wire/<entidade>.ts`** — adicione a coluna na entidade TypeORM com o decorator correto (`@Column`, `@CreateDateColumn`, etc.)
6. **`src/db/migrations/`** — crie uma migration para adicionar a coluna no banco

**O que nunca precisa mudar:** `logic/`, `controllers/`, `diplomat/`, `lib/`. A mudança fica contida nas fronteiras da entidade.

---

### Como criar uma nova entidade

Criar uma entidade do zero significa criar um arquivo em cada camada. Siga a ordem abaixo — o compilador guiará os erros de tipo até tudo estar conectado.

#### 1. Model — defina o domínio interno

```
src/model/<entidade>.ts
```

- Interface principal com todos os campos internos
- Type `<Entidade>Input` usando `Omit` para os campos gerados automaticamente (`id`, `createdAt`, campos derivados)

#### 2. Wire — defina os contratos externos

```
src/wire/in/<entidade>.ts    ← formato que o mundo externo envia
src/wire/out/<entidade>.ts   ← formato que a aplicação responde/publica
```

#### 3. DB Wire — defina a entidade do banco

```
src/db/wire/<entidade>.ts
```

- Classe TypeORM com `@Entity`, `@PrimaryColumn`, `@Column`, `@CreateDateColumn`
- Campos em snake_case, espelhando as colunas reais do banco
- Registrar a entidade no array `entities` do `AppDataSource` em `src/db/data-source.ts`

#### 4. Adapters — conecte os mundos

```
src/adapters/<entidade>.ts
```

Implementar obrigatoriamente as quatro funções:

| Função | Entrada | Saída |
|---|---|---|
| `fromWireIn` | `wire/in` | `model input` |
| `toWireOut` | `model` | `wire/out` |
| `fromDbWire` | `db/wire` | `model` |
| `toDbWire` | `model` | `db/wire` |

#### 5. Logic — funções puras de domínio

```
src/logic/<entidade>.ts
```

- `build<Entidade>(input, ...args): <Entidade>` — constrói a entidade completa com `id`, `createdAt` e quaisquer campos derivados (ex: `idempotencyKey`)
- Demais funções de cálculo ou derivação pura que a entidade precisar

#### 6. DB — queries

```
src/db/<entidade>.ts
```

- Funções: `find`, `findBy<Campo>`, `insert`, `update`, `count` — conforme a necessidade
- Sempre recebe `model`, sempre retorna `model`
- Usa `toDbWire` e `fromDbWire` internamente

#### 7. Controller — regra de negócio

```
src/controllers/<entidade>.ts
```

- Orquestra o fluxo: chama `logic` para construir, `db` para persistir, toma decisões de negócio
- Sempre recebe `model`, sempre retorna `model`
- Nunca importa `wire` ou `db/wire`

#### 8. Diplomat — expõe a entidade ao mundo

Criar os arquivos necessários de acordo com como a entidade é acessada:

```
src/diplomat/http-server/<entidade>.ts   ← se tiver endpoint HTTP de entrada
src/diplomat/consumer/<entidade>.ts      ← se tiver consumo de fila
src/diplomat/http-client/<entidade>.ts   ← se fizer chamadas HTTP de saída
src/diplomat/producer/<entidade>.ts      ← se publicar mensagens
```

Registrar nos respectivos `index.ts` de cada subtipo do diplomat.

#### Checklist de arquivos por nova entidade

```
src/model/<entidade>.ts
src/wire/in/<entidade>.ts
src/wire/out/<entidade>.ts
src/db/wire/<entidade>.ts
src/db/<entidade>.ts
src/db/migrations/<timestamp>_create_<entidade>.ts
src/adapters/<entidade>.ts
src/logic/<entidade>.ts
src/controllers/<entidade>.ts
src/diplomat/http-server/<entidade>.ts   (se aplicável)
src/diplomat/consumer/<entidade>.ts      (se aplicável)
src/diplomat/http-client/<entidade>.ts   (se aplicável)
src/diplomat/producer/<entidade>.ts      (se aplicável)
```

---

## Princípio Central

> Cada camada fala apenas o idioma que lhe cabe. O `model` é o idioma interno. O `wire` é o idioma do mundo externo. Os `adapters` são os intérpretes. A `lib` é a única que conhece os frameworks. Nenhum dado cruza uma fronteira sem passar pelo intérprete correto, e nenhum framework vaza para dentro da aplicação.
