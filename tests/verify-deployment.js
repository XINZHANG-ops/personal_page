#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the site is ready for GitLab Pages deployment
 * by checking file structure, content, and basic functionality.
 */

import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = ['index.html'];
const REQUIRED_DIRECTORIES = ['css', 'js', 'assets'];
const DEPLOYMENT_DIRECTORY = 'public';

class DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = 0;
    this.passed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  check(description, testFn) {
    this.checks++;
    this.log(`Checking: ${description}`);
    
    try {
      const result = testFn();
      if (result !== false) {
        this.passed++;
        this.log(`✓ ${description}`, 'success');
        return true;
      } else {
        this.errors.push(description);
        this.log(`✗ ${description}`, 'error');
        return false;
      }
    } catch (error) {
      this.errors.push(`${description}: ${error.message}`);
      this.log(`✗ ${description}: ${error.message}`, 'error');
      return false;
    }
  }

  warn(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  verifyFileStructure() {
    this.log('=== File Structure Verification ===');

    // Check required files
    REQUIRED_FILES.forEach(file => {
      this.check(`Required file exists: ${file}`, () => {
        return fs.existsSync(file);
      });
    });

    // Check required directories
    REQUIRED_DIRECTORIES.forEach(dir => {
      this.check(`Required directory exists: ${dir}`, () => {
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
      });
    });

    // Check GitLab CI configuration
    this.check('GitLab CI configuration exists', () => {
      return fs.existsSync('.gitlab-ci.yml');
    });
  }

  verifyIndexHtml() {
    this.log('=== Index.html Verification ===');

    if (!fs.existsSync('index.html')) {
      this.errors.push('index.html not found');
      return;
    }

    const htmlContent = fs.readFileSync('index.html', 'utf-8');

    this.check('HTML has DOCTYPE declaration', () => {
      return /<!DOCTYPE html>/i.test(htmlContent);
    });

    this.check('HTML has lang attribute', () => {
      return /<html[^>]+lang=/i.test(htmlContent);
    });

    this.check('HTML has charset meta tag', () => {
      return /<meta[^>]+charset=["']utf-8["']/i.test(htmlContent);
    });

    this.check('HTML has viewport meta tag', () => {
      return /<meta[^>]+name=["']viewport["']/i.test(htmlContent);
    });

    this.check('HTML has title tag', () => {
      return /<title>[^<]+<\/title>/i.test(htmlContent);
    });

    // Check for external dependencies
    const externalLinks = htmlContent.match(/https?:\/\/[^"'\s>]+/g) || [];
    if (externalLinks.length > 0) {
      this.warn(`Found ${externalLinks.length} external links - ensure they're necessary for GitLab Pages`);
    }
  }

  verifyAssets() {
    this.log('=== Asset Verification ===');

    // Check CSS files
    if (fs.existsSync('css')) {
      const cssFiles = fs.readdirSync('css').filter(f => f.endsWith('.css'));
      this.check('CSS files exist', () => cssFiles.length > 0);
      
      cssFiles.forEach(file => {
        const filePath = path.join('css', file);
        const size = fs.statSync(filePath).size;
        if (size > 500 * 1024) { // 500KB
          this.warn(`Large CSS file: ${file} (${Math.round(size/1024)}KB)`);
        }
      });
    }

    // Check JS files
    if (fs.existsSync('js')) {
      const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
      this.check('JavaScript files exist', () => jsFiles.length > 0);
      
      jsFiles.forEach(file => {
        const filePath = path.join('js', file);
        const size = fs.statSync(filePath).size;
        if (size > 1024 * 1024) { // 1MB
          this.warn(`Large JS file: ${file} (${Math.round(size/1024)}KB)`);
        }
      });
    }

    // Check image assets
    if (fs.existsSync('assets/images')) {
      const imageFiles = fs.readdirSync('assets/images')
        .filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f));
      
      if (imageFiles.length > 0) {
        this.log(`Found ${imageFiles.length} image files`);
        
        imageFiles.forEach(file => {
          const filePath = path.join('assets/images', file);
          const size = fs.statSync(filePath).size;
          if (size > 2 * 1024 * 1024) { // 2MB
            this.warn(`Large image file: ${file} (${Math.round(size/(1024*1024))}MB)`);
          }
        });
      }
    }
  }

  verifyDeploymentDirectory() {
    this.log('=== Deployment Directory Verification ===');

    if (!fs.existsSync(DEPLOYMENT_DIRECTORY)) {
      this.warn(`Deployment directory '${DEPLOYMENT_DIRECTORY}' not found - will be created during build`);
      return;
    }

    this.check(`Deployment directory exists: ${DEPLOYMENT_DIRECTORY}`, () => {
      return fs.existsSync(DEPLOYMENT_DIRECTORY) && fs.statSync(DEPLOYMENT_DIRECTORY).isDirectory();
    });

    this.check(`Deployment has index.html`, () => {
      return fs.existsSync(path.join(DEPLOYMENT_DIRECTORY, 'index.html'));
    });

    // Check that development files are not in deployment directory
    const devFiles = [
      'package.json', 'package-lock.json', 'vitest.config.js',
      'tests', 'node_modules', '.git', '.gitlab-ci.yml'
    ];

    devFiles.forEach(file => {
      const filePath = path.join(DEPLOYMENT_DIRECTORY, file);
      if (fs.existsSync(filePath)) {
        this.warn(`Development file found in deployment directory: ${file}`);
      }
    });
  }

  verifyGitLabPagesCompatibility() {
    this.log('=== GitLab Pages Compatibility ===');

    // Check for server-side files that won't work on GitLab Pages
    const serverSideFiles = ['.php', '.asp', '.aspx', '.jsp', '.py', '.rb'];
    let foundServerSideFiles = false;

    function checkDirectory(dirPath) {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          checkDirectory(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (serverSideFiles.includes(ext)) {
            foundServerSideFiles = true;
          }
        }
      });
    }

    try {
      checkDirectory('.');
      this.check('No server-side files found', () => !foundServerSideFiles);
    } catch (error) {
      this.warn('Could not fully scan for server-side files');
    }

    // Check GitLab CI configuration
    if (fs.existsSync('.gitlab-ci.yml')) {
      const ciContent = fs.readFileSync('.gitlab-ci.yml', 'utf-8');
      
      this.check('GitLab CI has pages job', () => {
        return /pages:/m.test(ciContent);
      });

      this.check('GitLab CI creates public directory', () => {
        return /public/.test(ciContent);
      });

      this.check('GitLab CI has artifacts configuration', () => {
        return /artifacts:/.test(ciContent) && /paths:/.test(ciContent);
      });
    }
  }

  generateReport() {
    this.log('=== Deployment Verification Report ===');
    
    const successRate = Math.round((this.passed / this.checks) * 100);
    
    this.log(`Total Checks: ${this.checks}`);
    this.log(`Passed: ${this.passed}`);
    this.log(`Failed: ${this.errors.length}`);
    this.log(`Warnings: ${this.warnings.length}`);
    this.log(`Success Rate: ${successRate}%`);

    if (this.errors.length > 0) {
      this.log('=== ERRORS ===', 'error');
      this.errors.forEach(error => this.log(`• ${error}`, 'error'));
    }

    if (this.warnings.length > 0) {
      this.log('=== WARNINGS ===', 'warning');
      this.warnings.forEach(warning => this.log(`• ${warning}`, 'warning'));
    }

    if (this.errors.length === 0) {
      this.log('🎉 Site is ready for GitLab Pages deployment!', 'success');
      return true;
    } else {
      this.log('❌ Site has issues that need to be resolved before deployment', 'error');
      return false;
    }
  }

  run() {
    this.log('Starting GitLab Pages deployment verification...');
    
    this.verifyFileStructure();
    this.verifyIndexHtml();
    this.verifyAssets();
    this.verifyDeploymentDirectory();
    this.verifyGitLabPagesCompatibility();
    
    const success = this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// Run verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new DeploymentVerifier();
  verifier.run();
}

export default DeploymentVerifier;