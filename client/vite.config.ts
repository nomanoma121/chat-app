import { reactRouter } from "@react-router/dev/vite";
import pandacss from "@pandacss/dev/postcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import autoprefixer from "autoprefixer";

export default defineConfig({
  css: {
    postcss: {
      plugins: [pandacss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths({ root: "./" })],
});
