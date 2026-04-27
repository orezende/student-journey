import { randomUUID } from 'node:crypto';

export function newCid(): string {
  return `${randomUUID().split('-')[0]}:0`;
}

export function nextCid(cid: string): string {
  const sep = cid.lastIndexOf(':');
  if (sep === -1) return `${cid}:1`;
  const base = cid.slice(0, sep);
  const counter = Number(cid.slice(sep + 1));
  return `${base}:${counter + 1}`;
}
