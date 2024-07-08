import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

/** @type {import("vite").UserConfig} */
export default {
    plugins: [react(), dts({ rollupTypes: true })],
    build: {
        lib: {
            entry: "./src/index.ts",
            name: "react-client-logger",
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
};
