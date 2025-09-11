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
  jsxFramework: "react",
  outdir: "styled-system",
  theme: {
    extend: {
      tokens: {
        colors: {
          bg: {
            primary: { value: "#36393f" },
            secondary: { value: "#2f3136" }, 
            tertiary: { value: "#202225" },
            quaternary: { value: "#40444b" },
            quinary: { value: "#4f545c" },
          },
          accent: {
            normal: { value: "#3E63DD" },
            hover: { value: "#2E4AB8" },
            dark: { value: "#474E98" }
          },
        }
      }
    }
  }
});
