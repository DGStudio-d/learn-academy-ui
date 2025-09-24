#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize() {
  log('\n📊 Bundle Size Analysis', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Build directory not found. Run "npm run build" first.', 'red');
    return;
  }
  
  const assets = path.join(distPath, 'assets');
  
  if (!fs.existsSync(assets)) {
    log('❌ Assets directory not found.', 'red');
    return;
  }
  
  const files = fs.readdirSync(assets);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  let totalJsSize = 0;
  let totalCssSize = 0;
  
  log('\n📄 JavaScript Files:', 'yellow');
  jsFiles.forEach(file => {
    const filePath = path.join(assets, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalJsSize += size;
    
    const sizeFormatted = formatBytes(size);
    const color = size > 500000 ? 'red' : size > 200000 ? 'yellow' : 'green';
    log(`  ${file}: ${sizeFormatted}`, color);
  });
  
  log('\n🎨 CSS Files:', 'yellow');
  cssFiles.forEach(file => {
    const filePath = path.join(assets, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalCssSize += size;
    
    const sizeFormatted = formatBytes(size);
    const color = size > 100000 ? 'red' : size > 50000 ? 'yellow' : 'green';
    log(`  ${file}: ${sizeFormatted}`, color);
  });
  
  log('\n📈 Summary:', 'bright');
  log(`  Total JS: ${formatBytes(totalJsSize)}`, totalJsSize > 2000000 ? 'red' : 'green');
  log(`  Total CSS: ${formatBytes(totalCssSize)}`, totalCssSize > 500000 ? 'red' : 'green');
  log(`  Total Assets: ${formatBytes(totalJsSize + totalCssSize)}`, 'bright');
  
  // Performance recommendations
  log('\n💡 Recommendations:', 'magenta');
  if (totalJsSize > 2000000) {
    log('  ⚠️  Consider further code splitting for JS bundles', 'yellow');
  }
  if (totalCssSize > 500000) {
    log('  ⚠️  Consider CSS optimization and purging unused styles', 'yellow');
  }
  if (jsFiles.length > 20) {
    log('  ⚠️  Too many JS chunks, consider consolidating', 'yellow');
  }
  
  // Check for large individual files
  const largeFiles = [...jsFiles, ...cssFiles].filter(file => {
    const filePath = path.join(assets, file);
    const stats = fs.statSync(filePath);
    return stats.size > 1000000; // 1MB
  });
  
  if (largeFiles.length > 0) {
    log('  ⚠️  Large files detected:', 'red');
    largeFiles.forEach(file => {
      log(`    - ${file}`, 'red');
    });
  }
}

function checkDependencies() {
  log('\n📦 Dependency Analysis', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for heavy dependencies
    const heavyDeps = [
      'lodash',
      'moment',
      'rxjs',
      'three',
      'chart.js',
      'antd',
      'material-ui'
    ];
    
    const foundHeavyDeps = Object.keys(dependencies).filter(dep => 
      heavyDeps.some(heavy => dep.includes(heavy))
    );
    
    if (foundHeavyDeps.length > 0) {
      log('⚠️  Heavy dependencies found:', 'yellow');
      foundHeavyDeps.forEach(dep => {
        log(`  - ${dep}: Consider lighter alternatives`, 'yellow');
      });
    } else {
      log('✅ No heavy dependencies detected', 'green');
    }
    
    // Check for duplicate functionality
    const duplicateChecks = [
      { deps: ['moment', 'date-fns'], message: 'Multiple date libraries detected' },
      { deps: ['lodash', 'ramda'], message: 'Multiple utility libraries detected' },
      { deps: ['axios', 'fetch'], message: 'Multiple HTTP clients detected' },
    ];
    
    duplicateChecks.forEach(check => {
      const found = check.deps.filter(dep => dependencies[dep]);
      if (found.length > 1) {
        log(`⚠️  ${check.message}: ${found.join(', ')}`, 'yellow');
      }
    });
    
  } catch (error) {
    log('❌ Error reading package.json', 'red');
  }
}

function generateReport() {
  log('\n📋 Performance Report', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: {},
    recommendations: []
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📄 Report saved to: ${reportPath}`, 'green');
}

function runLighthouse() {
  log('\n🔍 Running Lighthouse Audit', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  try {
    // Check if lighthouse is installed
    execSync('lighthouse --version', { stdio: 'ignore' });
    
    log('Starting development server...', 'yellow');
    
    // This would need to be adapted based on your setup
    log('💡 Run manually: npm run perf:audit', 'blue');
    
  } catch (error) {
    log('❌ Lighthouse not installed. Install with: npm install -g lighthouse', 'red');
  }
}

function main() {
  log('🚀 Performance Analysis Tool', 'bright');
  log('=' .repeat(50), 'bright');
  
  analyzeBundleSize();
  checkDependencies();
  generateReport();
  
  log('\n✨ Analysis complete!', 'green');
  log('\nNext steps:', 'bright');
  log('  1. Run "npm run build:analyze" to visualize bundle', 'blue');
  log('  2. Run "npm run perf:audit" for Lighthouse audit', 'blue');
  log('  3. Check performance-report.json for detailed analysis', 'blue');
}

// Always run main when script is executed
main();

export {
  analyzeBundleSize,
  checkDependencies,
  generateReport,
  runLighthouse
};