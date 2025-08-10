import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "subgraph/**",
      "contracts/**",
      "scripts/**",
      "artifacts/**",
      "cache/**",
      "node_modules/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: false }],
    },
  },
];

export default eslintConfig;
