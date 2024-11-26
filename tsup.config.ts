// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"], // CommonJS pour Node.js
  platform: "node", // Spécifie que c'est pour Node.js
  dts: true, // Génère les fichiers de types
  clean: true, // Nettoie le dossier dist avant chaque build
  outDir: "dist", // Spécifie le dossier de sortie
  bundle: true,
  minify: !options.watch,
  external: ["graphql"],
  noExternal: [],
}));
