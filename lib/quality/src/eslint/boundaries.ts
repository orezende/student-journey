import type { Linter } from 'eslint';
import boundaries from 'eslint-plugin-boundaries';

export interface Layer {
  name: string;
  pattern: string[];
  allow: string[];
}

export function makeBoundaries(layers: Layer[]): Linter.Config[] {
  return [
    {
      files: ['src/**/*.ts'],
      plugins: { boundaries },
      settings: {
        'boundaries/elements': layers.map(({ name, pattern }) => ({ type: name, pattern })),
      },
      rules: {
        'boundaries/element-types': [
          'error',
          {
            default: 'disallow',
            rules: layers.map(({ name, allow }) => ({ from: name, allow })),
          },
        ],
      },
    },
  ];
}
