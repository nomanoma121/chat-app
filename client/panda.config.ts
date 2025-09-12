import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import indigo from "@park-ui/panda-preset/colors/indigo";
import ruby from "@park-ui/panda-preset/colors/ruby";
import teal from "@park-ui/panda-preset/colors/teal";
import tomato from "@park-ui/panda-preset/colors/tomato";
import purple from "@park-ui/panda-preset/colors/purple";
import sky from "@park-ui/panda-preset/colors/sky";
import violet from "@park-ui/panda-preset/colors/violet";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({ accentColor: violet, grayColor: slate, radius: "md" }),
  ],
  include: ["./app/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  theme: {
    extend: {
      tokens: {
        colors: {
          // Midnight Violet Theme - ミッドナイトバイオレット系
          bg: {
            primary: { value: "#1a1a20" },      // 深い紫の夜
            secondary: { value: "#202027" },    // 夜のラベンダー
            tertiary: { value: "#27273a" },     // 濃い紫の影
            quaternary: { value: "#2e2e44" },   // ダークバイオレット
            emphasized: { value: "#3a3a50" },   // 夜のアメジスト
          },
          accent: {
            default: { value: "#8b5cf6" },      // violet.9 - メインのバイオレット色
            emphasized: { value: "#a855f7" },   // violet.10 - 強調されたバイオレット
            subtle: { value: "#c4b5fd" },       // violet.11 - 薄いバイオレット
          },
          border: {
            soft: { value: "#373745" },         // 薄い紫グレーの境界
            subtle: { value: "#44444f" },       // 紫がかったグレーの縁
            default: { value: "#525266" },      // バイオレットグレーの輝き
          },
          text: {
            soft: { value: "#737391" },         // 薄い紫グレー
            medium: { value: "#9c9cb8" },       // 中間の紫グレー
            bright: { value: "#d4d4e8" },       // 明るい紫グレー
          },
        }
      }
    }
  }
});
