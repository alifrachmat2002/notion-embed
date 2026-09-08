import { defineConfig } from "vitest/config";

export default defineConfig({
    // Resolves the `@/*` alias from tsconfig.json. Vite supports this natively,
    // so the vite-tsconfig-paths plugin is not needed.
    resolve: { tsconfigPaths: true },
    test: {
        // Node, not jsdom: the tested seam is pure functions over workout
        // records. Components hold no logic once the view model is built.
        environment: "node",
        // `types/` is mostly declarations, but the parsers that guard a shape
        // live beside it (see types/calendar.ts), and those are testable.
        include: ["lib/**/*.test.ts", "types/**/*.test.ts"],
    },
});
