import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Basic rules for development
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "warn",
      "no-unused-vars": "warn",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      "dist/",
      "*.config.js",
      "*.config.ts",
    ],
  },
];

export default eslintConfig;
