import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                client: "src/index.ts", // main entry point with manifests
                api: "src/api.ts", // public API for extensions
            },
            formats: ["es"],
        },
        outDir: "./wwwroot/App_Plugins/UmbNav/dist", // all compiled files will be placed here
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        },
    },
    base: "/App_Plugins/UmbNav/", // the base path of the app in the browser (used for assets)
});