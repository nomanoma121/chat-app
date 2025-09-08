export default {
  api: {
    input: '../docs/openapi.swagger.json',
    output: {
      mode: 'tags-split',
      target: './app/api/gen',
      client: 'react-query',
      validation: true,
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
      fileExtension: '.zod.ts',
    },
  },
};
