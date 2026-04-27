import type { UUID } from './uuid';
import { UUID_REGEX } from './uuid';

export type FieldParser<T> = (value: unknown, field: string) => T;

type InferFields<F extends Record<string, FieldParser<unknown>>> = {
  [K in keyof F]: F[K] extends FieldParser<infer T> ? T : never;
};

export type Schema<T> = {
  parse(data: unknown): T;
};

export function createSchema<F extends Record<string, FieldParser<unknown>>>(
  fields: F,
): Schema<InferFields<F>> {
  return {
    parse(data: unknown): InferFields<F> {
      if (typeof data !== 'object' || data === null) {
        throw new TypeError(`Expected object, got ${typeof data}`);
      }
      const obj = data as Record<string, unknown>;
      const result = {} as InferFields<F>;
      for (const key of Object.keys(fields) as (keyof F)[]) {
        (result as Record<string, unknown>)[key as string] = fields[key](
          obj[key as string],
          key as string,
        );
      }
      return result;
    },
  };
}

export const field = {
  uuid(): FieldParser<UUID> {
    return (value, name) => {
      if (typeof value !== 'string') {
        throw new TypeError(`Field "${name}" must be a UUID string, got ${typeof value}`);
      }
      if (!UUID_REGEX.test(value)) {
        throw new TypeError(`Field "${name}" is not a valid UUID: "${value}"`);
      }
      return value as UUID;
    };
  },

  string(): FieldParser<string> {
    return (value, name) => {
      if (typeof value !== 'string') {
        throw new TypeError(`Field "${name}" must be a string, got ${typeof value}`);
      }
      return value;
    };
  },

  date(): FieldParser<Date> {
    return (value, name) => {
      if (value instanceof Date) return value;
      if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
      }
      throw new TypeError(`Field "${name}" must be a Date or ISO string`);
    };
  },

  literal<T extends string>(...allowed: T[]): FieldParser<T> {
    return (value, name) => {
      if (!allowed.includes(value as T)) {
        throw new TypeError(
          `Field "${name}" must be one of [${allowed.join(', ')}], got "${value}"`,
        );
      }
      return value as T;
    };
  },

  number(): FieldParser<number> {
    return (value, name) => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`Field "${name}" must be a number, got ${typeof value}`);
      }
      return value;
    };
  },
};
