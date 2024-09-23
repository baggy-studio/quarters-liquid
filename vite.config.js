import { defineConfig } from 'vite'  
import shopify from "vite-plugin-shopify"; 

export default defineConfig({
  resolve: {
    alias: {
      "@": "/frontend",
    },
  },
  plugins: [shopify()],
  build: {
    emptyOutDir: false,
  },
})
