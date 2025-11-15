import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const repoName = "/umb-frontend-react2/";

// https://vitejs.dev/config/
export default defineConfig({
  base: repoName,
  plugins: [react()],
});
