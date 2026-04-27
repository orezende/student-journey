import Fastify, { type LightMyRequestResponse } from 'fastify';
import { logger } from '../../observability/logger';
import { AppError } from '../../types/errors/index';
import { newCid, nextCid } from '../../observability/cid';

const app = Fastify({ logger: false });

app.decorateRequest('cid', '');

app.addHook('onRequest', (request, reply, done) => {
  const incoming = request.headers['x-cid'] as string | undefined;
  const cid = incoming ? nextCid(incoming) : newCid();
  request.cid = cid;
  reply.header('x-cid', cid);
  logger.info({ cid, method: request.method, url: request.url }, 'http-server: request received');
  done();
});

app.addHook('onResponse', (request, reply, done) => {
  logger.info({ cid: request.cid, method: request.method, url: request.url, status: reply.statusCode }, 'http-server: response sent');
  done();
});

const HTTP_STATUS: Record<string, number> = {
  NotFoundError: 404,
  ConflictError: 409,
  ValidationError: 400,
  UnprocessableError: 422,
};

app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    const statusCode = HTTP_STATUS[error.name] ?? 500;
    logger.warn({ cid: request.cid, method: request.method, url: request.url, statusCode, error: error.name, message: error.message }, 'http-server: request error');
    reply.status(statusCode).send({ error: error.name, message: error.message });
    return;
  }
  if (error instanceof TypeError) {
    logger.warn({ cid: request.cid, method: request.method, url: request.url, message: error.message }, 'http-server: validation error');
    reply.status(400).send({ error: 'ValidationError', message: error.message });
    return;
  }
  logger.error({ cid: request.cid, method: request.method, url: request.url, error: error instanceof Error ? error.message : String(error) }, 'http-server: unexpected error');
  reply.status(500).send({ error: 'InternalServerError', message: 'Internal server error' });
});

type Handler<TBody = unknown> = (body: TBody) => Promise<unknown>;

export function get(path: string, handler: () => Promise<unknown>): void {
  app.get(path, async () => handler());
}

export function html(path: string, handler: () => Promise<string>): void {
  app.get(path, async (_request, reply) => {
    reply.type('text/html; charset=utf-8').send(await handler());
  });
}

export function post<TBody>(path: string, handler: Handler<TBody>): void {
  app.post<{ Body: TBody }>(path, async (request, reply) => {
    reply.status(201).send(await handler(request.body as TBody));
  });
}

export function put<TBody>(path: string, handler: Handler<TBody>): void {
  app.put<{ Body: TBody }>(path, async (request, reply) => {
    reply.status(200).send(await handler(request.body as TBody));
  });
}

export function patch<TBody>(path: string, handler: Handler<TBody>): void {
  app.patch<{ Body: TBody }>(path, async (request, reply) => {
    reply.status(200).send(await handler(request.body as TBody));
  });
}

export function del(path: string, handler: () => Promise<unknown>): void {
  app.delete(path, async (_request, reply) => {
    reply.status(204).send(await handler());
  });
}

export async function listen(port: number, host: string): Promise<void> {
  await app.listen({ port, host });
}

export async function close(): Promise<void> {
  await app.close();
}

export async function inject(options: {
  method: string;
  url: string;
  body?: unknown;
}): Promise<LightMyRequestResponse> {
  return app.inject({
    method: options.method as 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE',
    url: options.url,
    payload: options.body as string | object | undefined,
  }) as Promise<LightMyRequestResponse>;
}
