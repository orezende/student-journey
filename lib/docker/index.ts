import { request } from 'http';

function dockerRequest(method: string, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = request(
      { socketPath: '/var/run/docker.sock', method, path },
      (res) => {
        res.resume();
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Docker API error ${res.statusCode} on ${method} ${path}`));
          } else {
            resolve();
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

export async function startContainer(name: string): Promise<void> {
  await dockerRequest('POST', `/containers/${encodeURIComponent(name)}/start`);
}

export async function stopContainer(name: string): Promise<void> {
  await dockerRequest('POST', `/containers/${encodeURIComponent(name)}/stop`);
}
