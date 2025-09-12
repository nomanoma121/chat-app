import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import indigo from "@park-ui/panda-preset/colors/indigo";
import ruby from "@park-ui/panda-preset/colors/ruby";
import teal from "@park-ui/panda-preset/colors/teal";
import tomato from "@park-ui/panda-preset/colors/tomato";
import purple from "@park-ui/panda-preset/colors/purple";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({ accentColor: ruby, grayColor: slate, radius: "md" }),
  ],
  include: ["./app/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  theme: {
    extend: {
      tokens: {
        colors: {
          // Midnight Honey Theme - ミッドナイトハニー系
          bg: {
            primary: { value: "#1a1a1a" },      // 深い真夜中
            secondary: { value: "#242424" },    // 夜の影
            tertiary: { value: "#2f2f2f" },     // 黒蜜の色
            quaternary: { value: "#3a3a3a" },   // 濃いハニー
            emphasized: { value: "#454545" },   // 夜のゴールド
          },
          accent: {
            default: { value: "#e54666" },      // ruby.9 - メインのルビー色
            emphasized: { value: "#ec5a72" },   // ruby.10 - 強調されたルビー  
            subtle: { value: "#ff949d" },       // ruby.11 - 薄いルビー
          },
          border: {
            soft: { value: "#333333" },         // 薄いグレーの境界
            subtle: { value: "#404040" },       // ニュートラルグレーの縁
            default: { value: "#4a4a4a" },      // グレーの輝き
          },
          text: {
            soft: { value: "#6b7280" },         // ベーステーマに近い薄いグレー
            medium: { value: "#9ca3af" },       // ベーステーマに近い中間グレー
            bright: { value: "#d1d5db" },       // ベーステーマに近い明るいグレー
          },
        }
      }
    }
  }
});
