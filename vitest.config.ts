import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true
        }
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.spec.ts']
  }
})
