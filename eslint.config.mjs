import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Tame lint: Notion/OpenClaw API parsing is inherently dynamic.
  // Keep strict rules elsewhere.
  {
    files: [
      "src/lib/notion/**/*.ts",
      "src/lib/openclaw/**/*.ts",
      "src/app/api/**/*.ts",
      "src/components/**/*.tsx",
      "src/app/**/*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // The app uses deterministic effects for data refresh + UI toggles.
      // These rules are too noisy for our current architecture.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
