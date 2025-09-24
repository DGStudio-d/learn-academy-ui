import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Performance optimizations
  build: {
    // Enable source maps for debugging in development
    sourcemap: mode === 'development',
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            
            // Query client
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            
            // UI components
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul')) {
              return 'ui-vendor';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            
            // Internationalization
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            
            // Charts and visualization
            if (id.includes('recharts') || id.includes('date-fns')) {
              return 'charts-vendor';
            }
            
            // Icons and utilities
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils-vendor';
            }
            
            // Other large vendors
            if (id.includes('axios') || id.includes('jwt-decode')) {
              return 'api-vendor';
            }
            
            // Default vendor chunk for remaining node_modules
            return 'vendor';
          }
          
          // App chunks
          if (id.includes('/pages/dashboard/')) {
            return 'dashboard-pages';
          }
          
          if (id.includes('/pages/auth/')) {
            return 'auth-pages';
          }
          
          if (id.includes('/components/admin/')) {
            return 'admin-components';
          }
          
          if (id.includes('/components/teacher/')) {
            return 'teacher-components';
          }
          
          if (id.includes('/components/student/')) {
            return 'student-components';
          }
          
          if (id.includes('/services/')) {
            return 'services';
          }
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    
    // Enable minification with optimized settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'lucide-react',
      'clsx',
      'date-fns',
      'i18next',
      'react-i18next',
      'jwt-decode',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
      'recharts',
    ],
  },
  
  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
    postcss: {
      plugins: [
        // Add autoprefixer and other PostCSS plugins if needed
      ],
    },
  },
  
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
}));
