import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}", // 2. EXCLUDE all test files
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  // Automatically collect coverage when running tests
  collectCoverage: true,

  // Specify report formats (html, text, lcov, etc.)
  coverageReporters: ["text", "html", "lcov"],

  // Set the output folder for the reports
  coverageDirectory: "./coverage",
  reporters: ["default", ["jest-html-reporter", { pageTitle: "Test Report" }]],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
