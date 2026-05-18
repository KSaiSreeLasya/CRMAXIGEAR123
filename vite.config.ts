import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();

      return () => {
        // Forward API routes to Express server
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url?.split("?")[0] ?? "") as string;
          if (pathname.startsWith("/api")) {
            app(req as any, res as any, next);
          } else {
            next();
          }
        });

        // SPA fallback: serve index.html for non-file requests
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url?.split("?")[0] ?? "") as string;
          // Check if this looks like a file (has an extension)
          if (pathname.includes(".")) {
            next();
          } else if (!pathname.startsWith("/api")) {
            // For non-API, non-file paths, let Vite serve index.html for React routing
            req.url = "/index.html";
            next();
          } else {
            next();
          }
        });
      };
    },
  };
}
