import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    dts: true,
    entryPoints: ["src/index.ts"],
    outDir: "dist",
    format: ["esm", "cjs"],
    minify: false,
    skipNodeModulesBundle: true,
    sourcemap: false,
    target: "ES2015"
});