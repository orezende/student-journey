export function renderOverview(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Architecture Overview · Student Journey</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 48px 24px 80px;
    }
    header {
      max-width: 960px;
      margin: 0 auto 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    header h1 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }
    header p { margin-top: 6px; font-size: 0.875rem; color: #64748b; }
    .nav-links { display: flex; gap: 8px; }
    .nav-link {
      font-size: 0.8rem;
      color: #4f5b93;
      text-decoration: none;
      border: 1px solid #2d3148;
      border-radius: 6px;
      padding: 6px 12px;
      transition: border-color 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .nav-link:hover { border-color: #4f5b93; color: #818cf8; }
    .sections {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #818cf8;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }
    .section-subtitle {
      font-size: 0.8rem;
      color: #475569;
      margin-bottom: 20px;
    }
    .diagram-card {
      background: #1a1d27;
      border: 1px solid #2d3148;
      border-radius: 12px;
      padding: 32px 24px;
      overflow-x: auto;
    }
    .diagram-card .mermaid {
      display: flex;
      justify-content: center;
    }
    .mermaid svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Architecture Overview</h1>
      <p>How Student Journey works</p>
    </div>
    <div class="nav-links">
      <a class="nav-link" href="/">← Dashboard</a>
      <a class="nav-link" href="/docs">API Reference →</a>
    </div>
  </header>

  <div class="sections">

    <div>
      <div class="section-title">State Machine</div>
      <div class="section-subtitle">The 10 saga steps every student journey traverses, in order</div>
      <div class="diagram-card">
        <div class="mermaid">
stateDiagram-v2
  direction LR
  [*] --> JOURNEY_INITIATED
  JOURNEY_INITIATED --> DIAGNOSTIC_TRIGGERED
  DIAGNOSTIC_TRIGGERED --> DIAGNOSTIC_COMPLETED
  DIAGNOSTIC_COMPLETED --> ANALYSIS_STARTED
  ANALYSIS_STARTED --> ANALYSIS_FINISHED
  ANALYSIS_FINISHED --> CURRICULUM_GENERATED
  CURRICULUM_GENERATED --> CONTENT_DISPATCHED
  CONTENT_DISPATCHED --> STUDENT_ENGAGEMENT_RECEIVED
  STUDENT_ENGAGEMENT_RECEIVED --> PROGRESS_MILESTONE_REACHED
  PROGRESS_MILESTONE_REACHED --> JOURNEY_COMPLETED
  JOURNEY_COMPLETED --> [*]
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">Data Flow</div>
      <div class="section-subtitle">Request lifecycle: from HTTP call to event-driven saga propagation</div>
      <div class="diagram-card">
        <div class="mermaid">
sequenceDiagram
  participant Client
  participant HTTP API
  participant Controller
  participant PostgreSQL
  participant Kafka

  Client->>HTTP API: POST /journeys
  HTTP API->>Controller: startJourney(input)
  Controller->>PostgreSQL: insert journey + JourneyInitiated event
  Controller->>Kafka: publish JourneyInitiated
  HTTP API-->>Client: 201 { id, currentStep, status }

  Note over Kafka,Controller: Saga propagation (async)
  Kafka->>Controller: consume JourneyInitiated
  Controller->>PostgreSQL: insert DiagnosticTriggered event
  Controller->>PostgreSQL: update journey step
  Controller->>Kafka: publish DiagnosticTriggered
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">Architecture Layers</div>
      <div class="section-subtitle">Diplomat Architecture: strict separation between transport, domain, and infrastructure</div>
      <div class="diagram-card">
        <div class="mermaid">
graph TD
  subgraph HTTP["HTTP Layer"]
    A[diplomat/http-server] --> B[adapters]
  end
  subgraph Domain["Domain Layer"]
    C[controllers] --> D[logic]
    D --> E[model]
  end
  subgraph Infra["Infrastructure Layer"]
    F[(PostgreSQL)]
    G[Kafka broker]
    H[Loki / Grafana]
  end
  subgraph Libs["Shared Libraries"]
    L1[lib/http]
    L2[lib/db]
    L3[lib/messaging]
    L4[lib/observability]
    L5[lib/types]
    L6[lib/quality]
    L7[lib/testing]
  end

  B --> C
  C --> F
  C --> G
  C --> H
  A --> L1
  C --> L2
  C --> L3
  C --> L4
  E --> L5
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">Infrastructure</div>
      <div class="section-subtitle">Docker containers and how they communicate</div>
      <div class="diagram-card">
        <div class="mermaid">
graph LR
  App["App\nNode 24 :3000"]
  PG["PostgreSQL\n:5432"]
  Kafka["Kafka\n:29092"]
  KafkaUI["Kafka UI\n:8080"]
  Grafana["Grafana\n:4000"]
  Loki["Loki\n:3100"]

  App -->|SQL queries| PG
  App -->|produce / consume| Kafka
  App -->|push logs| Loki
  KafkaUI -->|inspect topics| Kafka
  Grafana -->|query logs| Loki
        </div>
      </div>
    </div>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        background: '#1a1d27',
        primaryColor: '#4f5b93',
        primaryTextColor: '#e2e8f0',
        secondaryColor: '#2d3148',
        tertiaryColor: '#0f1117',
        lineColor: '#4f5b93',
        edgeLabelBackground: '#1a1d27',
        nodeBorder: '#4f5b93',
        clusterBkg: '#0f1117',
        clusterBorder: '#2d3148',
        titleColor: '#e2e8f0',
        attributeBackgroundColorOdd: '#1a1d27',
        attributeBackgroundColorEven: '#0f1117',
      },
    });
  </script>
</body>
</html>`;
}
