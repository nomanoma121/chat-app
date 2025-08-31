import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import indigo from "@park-ui/panda-preset/colors/indigo";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({ accentColor: indigo, grayColor: slate, radius: "md" }),
  ],
  include: ["./app/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react", // or 'solid' or 'vue'
  outdir: "styled-system",
});
