import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Tailwind classes live only in src/components. Features and routes compose
  // those components through props and never style DOM elements themselves.
  {
    files: ["src/features/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      "react/forbid-dom-props": [
        "error",
        {
          forbid: [
            { propName: "className", message: "Style with a component from @/components/ui or @/components/layout." },
            { propName: "style", message: "Style with a component from @/components/ui or @/components/layout." },
          ],
        },
      ],
    },
  },
  // Dependencies point one way: app → features → components.
  {
    files: ["src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/features/*", "@/app/*"], message: "Components don't know about features or routes." }] },
      ],
    },
  },
  {
    files: ["src/features/**"],
    // Tests wire the real Server Action into the flow, as the page does.
    ignores: ["**/*.test.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/app/*"], message: "Features receive route code, such as Server Actions, as props." }] },
      ],
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
