import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Using FlatCompat to bridge legacy configs can introduce circular
// plugin references (e.g., react) during Next.js build linting.
// To avoid that, prefer the more basic Next configs without core-web-vitals.
const eslintConfig = [
  ...compat.extends("next", "next/typescript"),
];

export default eslintConfig;
