import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// Performance-focused configuration for production builds
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Enable React Fast Refresh optimizations
      plugins: [
        ["@swc/plugin-styled-components", {}]
      ],
    }),
    
    // Bundle analyzer for production builds
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Aggressive performance optimizations
  build: {
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    
    // Target modern browsers for better optimization
    target: 'es2020',
    
    // Optimize chunk splitting with size-based strategy
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical vendor chunks (loaded immediately)
          if (id.includes('react') && !id.includes('react-router')) {
            return 'react-core';
          }
          
          // Router chunk (loaded on navigation)
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // Query client (loaded with data fetching)
          if (id.includes('@tanstack/react-query')) {
            return 'query-client';
          }
          
          // UI framework (loaded with components)
          if (id.includes('@radix-ui')) {
            return 'ui-framework';
          }
          
          // Form handling (loaded with forms)
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'form-libs';
          }
          
          // Internationalization (loaded with language switching)
          if (id.includes('i18next')) {
            return 'i18n';
          }
          
          // Charts (loaded on demand)
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Utilities (shared across app)
          if (id.includes('lucide-react') || id.includes('clsx') || id.includes('date-fns')) {
            return 'utils';
          }
          
          // API utilities
          if (id.includes('axios') || id.includes('jwt-decode')) {
            return 'api-utils';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/dashboard/')) {
            return 'dashboard';
          }
          
          if (id.includes('/pages/auth/')) {
            return 'auth';
          }
          
          if (id.includes('/components/admin/')) {
            return 'admin-features';
          }
          
          if (id.includes('/components/teacher/')) {
            return 'teacher-features';
          }
          
          if (id.includes('/components/student/')) {
            return 'student-features';
          }
          
          // Services
          if (id.includes('/services/')) {
            return 'api-services';
          }
          
          // Default vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Optimize file naming for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/img/[name]-[hash][extname]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          if (/css/i.test(ext || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // External dependencies for CDN loading (optional)
      external: mode === 'production' ? [] : [],
    },
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // Multiple passes for maximum compression
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        toplevel: true, // Mangle top-level names
      },
      mangle: {
        safari10: true,
        toplevel: true,
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
      format: {
        comments: false,
        ascii_only: true, // Ensure ASCII output for better compatibility
      },
    },
    
    // Optimize asset handling
    assetsInlineLimit: 2048, // Smaller inline limit for production
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize CSS minification
    cssMinify: 'lightningcss',
  },
  
  // Optimize dependencies for production
  optimizeDeps: {
    include: [
      // Critical dependencies that should be pre-bundled
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      // Large dependencies that should be code-split
      '@tanstack/react-query',
      'recharts',
      'i18next',
      'react-i18next',
    ],
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: mode === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
    },
  },
  
  // Enable experimental optimizations
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Use relative URLs for better CDN compatibility
      return { relative: true };
    },
  },
  
  // Define environment variables for optimization
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));