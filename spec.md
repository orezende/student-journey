# Projeto: MindStream - Especificações Técnicas Completas

## 1. Visão Geral
O **MindStream** é uma aplicação de estudos baseada em eventos (**EDA**), focada em uma jornada de aprendizado linear e adaptativa. A arquitetura central utiliza um **Loop de Feedback Interno (Self-Looping Saga)**, onde um único serviço de domínio (`StudentJourneyService`) gerencia o fluxo de estados, produzindo e consumindo seus próprios eventos.

## 2. A Máquina de Estados (State Machine)
O serviço opera como uma máquina de estados persistente. O estado do aluno (`current_step`) dita como o sistema deve reagir a cada evento.

### Fluxo Detalhado (10 Eventos)
| Sequência | Evento (Trigger) | Ação do Serviço | Próximo Evento Emitido |
| :--- | :--- | :--- | :--- |
| 01 | `JOURNEY_INITIATED` | Valida credenciais e cria o registro no DB. | `DIAGNOSTIC_TRIGGERED` |
| 02 | `DIAGNOSTIC_TRIGGERED` | Dispara o motor de geração de testes. | `DIAGNOSTIC_COMPLETED` |
| 03 | `DIAGNOSTIC_COMPLETED` | Registra as respostas do aluno. | `ANALYSIS_STARTED` |
| 04 | `ANALYSIS_STARTED` | Aciona motor de IA/Regras para avaliação. | `ANALYSIS_FINISHED` |
| 05 | `ANALYSIS_FINISHED` | Analisa erros e acertos do teste. | `CURRICULUM_GENERATED` |
| 06 | `CURRICULUM_GENERATED` | Define trilha linear de aprendizado. | `CONTENT_DISPATCHED` |
| 07 | `CONTENT_DISPATCHED` | Disponibiliza material na interface. | `STUDENT_ENGAGEMENT_RECEIVED` |
| 08 | `STUDENT_ENGAGEMENT_RECEIVED` | Processa interações (tempo, pausas). | `PROGRESS_MILESTONE_REACHED` |
| 09 | `PROGRESS_MILESTONE_REACHED` | Valida se o aluno atingiu o objetivo. | `JOURNEY_COMPLETED` |
| 10 | `JOURNEY_COMPLETED` | Finaliza sessão, emite certificados. | - |

## 3. Especificações Técnicas

### 3.1 Contrato de Mensagem (JSON Schema)
Cada evento deve seguir este formato para garantir rastreabilidade em todo o fluxo:
```json
{
  "eventId": "UUID",
  "correlationId": "SESSION_ID_UNIQUE",
  "eventType": "NOME_DO_EVENTO",
  "payload": {
    "userId": "ID_USUARIO",
    "data": "DADOS_ESPECIFICOS_DA_ETAPA",
    "metadata": { "timestamp": "ISO-8601", "version": "1.0" }
  }
}