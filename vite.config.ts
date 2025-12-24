import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import UnoCSS from "unocss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    UnoCSS(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 React 相关库单独打包
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          // 将 Ant Design 单独打包
          if (id.includes('antd')) {
            return 'antd-vendor'
          }
          // 将 AntV Infographic 单独打包
          if (id.includes('@antv/infographic')) {
            return 'antv-vendor'
          }
          // 将图标库单独打包
          if (id.includes('@iconify')) {
            return 'iconify-vendor'
          }
          // 将 node_modules 中的其他依赖打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // 调整 chunk 大小警告限制（因为我们已经做了代码分割）
    chunkSizeWarningLimit: 1000,
  },
})
