import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = process.env.API_URL ?? env.API_URL ?? "/api/v1";
  const googleClientId = process.env.GOOGLE_CLIENT_ID ?? env.GOOGLE_CLIENT_ID ?? "";
  const backendTarget = process.env.VITE_BACKEND_PROXY_TARGET ?? env.VITE_BACKEND_PROXY_TARGET ?? "http://127.0.0.1:8000";

  return {
    define: {
      "import.meta.env.API_URL": JSON.stringify(apiUrl),
      "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(googleClientId),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@website": path.resolve(__dirname, "./forgame-website/src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
