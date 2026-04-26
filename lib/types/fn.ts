import type { Schema } from './schema';

export function fn<I, O>(
  inputSchema: Schema<I>,
  outputSchema: Schema<O>,
  impl: (input: I) => O,
): (raw: unknown) => O {
  return (raw: unknown): O => {
    const input = inputSchema.parse(raw);
    const output = impl(input);
    return outputSchema.parse(output);
  };
}

export function asyncFn<I, O>(
  inputSchema: Schema<I>,
  outputSchema: Schema<O>,
  impl: (input: I) => Promise<O>,
): (raw: unknown) => Promise<O>;

export function asyncFn<I>(
  inputSchema: Schema<I>,
  impl: (input: I) => Promise<void>,
): (raw: unknown) => Promise<void>;

export function asyncFn<I, O>(
  inputSchema: Schema<I>,
  outputSchemaOrImpl: Schema<O> | ((input: I) => Promise<void>),
  impl?: (input: I) => Promise<O>,
): (raw: unknown) => Promise<O | void> {
  return async (raw: unknown): Promise<O | void> => {
    const input = inputSchema.parse(raw);
    if (typeof outputSchemaOrImpl === 'function') {
      return outputSchemaOrImpl(input);
    }
    const output = await impl!(input);
    return outputSchemaOrImpl.parse(output);
  };
}
