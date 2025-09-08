import { defineConfig } from "orval";

/**
 * Orval Configuration
 * @see https://orval.dev/reference/configuration/overview
 */
export default defineConfig({
  petstore: {
    input: {
      target: "../docs/openapi.swagger.json",
    },
    output: {
      mode: "split",
      target: "./app/generated/api.ts",
      schemas: "./app/generated/model",
      client: "axios-functions",
      mock: true,
      clean: true,
    },
  },
});
