import { prettierConfig } from './src/prettier';
import { base } from './src/eslint/base';
import { makeBoundaries } from './src/eslint/boundaries';

export type { Layer } from './src/eslint/boundaries';

export const prettier = prettierConfig;
export { base, makeBoundaries as boundaries };
