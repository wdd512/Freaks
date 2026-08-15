import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypeScript,
  { ignores: [".next/**", "node_modules/**", "coverage/**", "data/**", "playwright-report/**", "test-results/**", "next-env.d.ts", "generation-report.json"] },
];

export default config;
