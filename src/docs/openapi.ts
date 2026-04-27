import { JOURNEY_STEPS, JOURNEY_STATUSES } from '../model/journey';

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Student Journey API',
    version: '1.0.0',
    description: 'EDA-based adaptive learning platform built on the Diplomat Architecture.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        operationId: 'getHealth',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Service health status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['ok', 'degraded'] },
                    dependencies: {
                      type: 'object',
                      properties: {
                        database: { type: 'boolean' },
                        kafka: { type: 'boolean' },
                      },
                    },
                  },
                },
                example: { status: 'ok', dependencies: { database: true, kafka: true } },
              },
            },
          },
        },
      },
    },
    '/journeys': {
      post: {
        summary: 'Start a new student journey',
        operationId: 'startJourney',
        tags: ['Journeys'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'Alice' },
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Journey created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    studentId: { type: 'string', format: 'uuid' },
                    currentStep: { type: 'string', enum: [...JOURNEY_STEPS] },
                    status: { type: 'string', enum: [...JOURNEY_STATUSES] },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/journeys/republish': {
      post: {
        summary: 'Republish stuck journeys',
        operationId: 'republishStuckJourneys',
        tags: ['Journeys'],
        description:
          'Detects journeys with no events (stuck at JOURNEY_INITIATED), inserts the missing journey_initiated record if needed, and re-publishes the journeyInitiated Kafka event. The saga propagates automatically from there. Idempotent — safe to call multiple times.',
        responses: {
          '200': {
            description: 'Number of journeys reactivated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    republished: { type: 'integer', example: 5 },
                  },
                },
                example: { republished: 5 },
              },
            },
          },
        },
      },
    },
    '/timeline': {
      get: {
        summary: 'Full event timeline',
        operationId: 'getTimeline',
        tags: ['Timeline'],
        description:
          "Returns all students with their journeys and each journey's events ordered by date. Fetches all 10 event tables in parallel (Promise.all) and groups in memory — O(S+J+E) with no N+1 queries.",
        responses: {
          '200': {
            description: 'Timeline for all students',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                      email: { type: 'string', format: 'email' },
                      createdAt: { type: 'string', format: 'date-time' },
                      journeys: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            currentStep: { type: 'string', enum: [...JOURNEY_STEPS] },
                            status: { type: 'string', enum: [...JOURNEY_STATUSES] },
                            createdAt: { type: 'string', format: 'date-time' },
                            events: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  name: { type: 'string', enum: [...JOURNEY_STEPS] },
                                  id: { type: 'string', format: 'uuid' },
                                  createdAt: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
