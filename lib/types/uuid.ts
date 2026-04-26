declare const _uuidBrand: unique symbol;

export type UUID = string & { readonly [_uuidBrand]: typeof _uuidBrand };

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): value is UUID {
  return UUID_REGEX.test(value);
}

export function toUUID(value: string): UUID {
  if (!isUUID(value)) {
    throw new Error(`Invalid UUID: "${value}"`);
  }
  return value as UUID;
}

export function asUUID(value: string): UUID {
  return value as UUID;
}
