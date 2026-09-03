import { defineConfig } from "vitest/config";

export default defineConfig({
    // Resolves the `@/*` alias from tsconfig.json. Vite supports this natively,
    // so the vite-tsconfig-paths plugin is not needed.
    resolve: { tsconfigPaths: true },
    test: {
        // Node, not jsdom: the tested seam is pure functions over workout
        // records. Components hold no logic once the view model is built.
        environment: "node",
        include: ["lib/**/*.test.ts"],
    },
});
