export default {
  api: {
    input: '../docs/openapi.swagger.json',
    output: {
      mode: 'tags-split',
      target: './app/api/gen',
      client: 'react-query',
      validation: true,
      override: {
        mutator: {
          path: './app/api/client.ts',
          name: 'customClient',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "pnpm biome:check",
    },
  },
  zod: {
    input: {
      target: '../docs/openapi.swagger.json',
    },
    output: {
      mode: 'tags-split',
      client: 'zod',
      target: 'app/schema/gen',
    },
    hooks: {
      afterAllFilesWrite: "pnpm biome:check",
    }
  },
};
