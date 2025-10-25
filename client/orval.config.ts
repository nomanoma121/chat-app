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
      afterAllFilesWrite: "pnpm exec biome format --write ./app/api/gen",
    },
  },
};
