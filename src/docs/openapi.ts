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
  },
};
