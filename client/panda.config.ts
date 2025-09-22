import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import green from "@park-ui/panda-preset/colors/green";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({ accentColor: green, grayColor: slate, radius: "md" }),
  ],
  include: ["./app/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  theme: {
    extend: {
      tokens: {
        colors: {
          // Midnight Green Theme - 深夜の森（ニュートラル背景版）
          bg: {
            primary: { value: "#0d1117" },      // ニュートラルダークグレー
            secondary: { value: "#161b22" },    // 濃いスレートグレー
            tertiary: { value: "#21262d" },     // ダークグレー
            quaternary: { value: "#30363d" },   // ミディアムグレー
            emphasized: { value: "#484f58" },   // ライトグレー
          },
          accent: {
            default: { value: "#22c55e" },      // 鮮やかなグリーン（green.500）
            emphasized: { value: "#16a34a" },   // 深いグリーン（green.600）
            subtle: { value: "#bbf7d0" },       // 薄いグリーン（green.200）
          },
          danger: {
            default: { value: "#ef4444" },      // red.500 - メインの警告色
            emphasized: { value: "#dc2626" },   // red.600 - 強調された警告色
            subtle: { value: "#fca5a5" },       // red.300 - 薄い警告色
          },
          border: {
            soft: { value: "#30363d" },         // ニュートラル境界
            subtle: { value: "#484f58" },       // グレーの縁
            strong: { value: "#6e7681" },       // 明るいグレー境界
          },
          text: {
            soft: { value: "#7d8590" },         // 薄いグレー
            medium: { value: "#c9d1d9" },       // 中間のグレー
            bright: { value: "#f0f6fc" },       // 明るいホワイト
          },
        }
      }
    }
  }
});
