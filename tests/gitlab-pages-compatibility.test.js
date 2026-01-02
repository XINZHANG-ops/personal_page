import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * GitLab Pages Compatibility Tests
 * 
 * These tests verify that the portfolio site meets GitLab Pages requirements:
 * - Only static files are used (HTML, CSS, JS, images)
 * - index.html exists and is properly structured
 * - File organization matches GitLab Pages requirements
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

describe('GitLab Pages Compatibility', () => {
  let projectRoot;

  beforeEach(() => {
    projectRoot = path.resolve('./');
  });

  describe('Static Files Only', () => {
    it('should use only static file types supported by GitLab Pages', () => {
      // Test that only static files are used
      // GitLab Pages supports: HTML, CSS, JS, images, fonts, and other static assets
      const allowedExtensions = [
        '.html', '.htm',
        '.css', '.scss', '.sass',
        '.js', '.mjs',
        '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
        '.woff', '.woff2', '.ttf', '.otf', '.eot',
        '.json', '.xml', '.txt', '.md',
        '.pdf', '.zip',
        '.yml', '.yaml' // For GitLab CI configuration
      ];

      const disallowedExtensions = [
        '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.go', '.java',
        '.exe', '.dll', '.so', '.dylib',
        '.sql', '.db', '.sqlite'
      ];

      function checkDirectory(dirPath, relativePath = '') {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const relativeItemPath = path.join(relativePath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            // Skip hidden directories and node_modules
            if (!item.startsWith('.') || item === '.kiro') {
              checkDirectory(itemPath, relativeItemPath);
            }
          } else {
            const ext = path.extname(item).toLowerCase();
            
            // Check for disallowed extensions
            if (ext && disallowedExtensions.includes(ext)) {
              throw new Error(`Disallowed file type found: ${relativeItemPath} (${ext})`);
            }

            // For files without extensions or with unknown extensions, 
            // they should be in allowed list or be configuration files
            if (ext && !allowedExtensions.includes(ext)) {
              const allowedConfigFiles = [
                '.gitignore', '.gitlab-ci.yml', 'package.json', 'package-lock.json',
                'vitest.config.js', 'README.md', 'LICENSE'
              ];
              
              if (!allowedConfigFiles.includes(item)) {
                console.warn(`Unknown file type: ${relativeItemPath} (${ext})`);
              }
            }
          }
        });
      }

      expect(() => checkDirectory(projectRoot)).not.toThrow();
    });

    it('should not contain server-side processing files', () => {
      // Test that no server-side processing files exist
      const serverSidePatterns = [
        /\.php$/i,
        /\.asp$/i,
        /\.aspx$/i,
        /\.jsp$/i,
        /\.py$/i,
        /\.rb$/i,
        /\.go$/i,
        /\.java$/i,
        /web\.config$/i,
        /\.htaccess$/i
      ];

      function checkForServerSideFiles(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            // Skip hidden directories except .kiro
            if (!item.startsWith('.') || item === '.kiro') {
              checkForServerSideFiles(itemPath);
            }
          } else {
            serverSidePatterns.forEach(pattern => {
              if (pattern.test(item)) {
                throw new Error(`Server-side file found: ${item}`);
              }
            });
          }
        });
      }

      expect(() => checkForServerSideFiles(projectRoot)).not.toThrow();
    });
  });

  describe('Index.html Structure', () => {
    it('should have index.html as the main entry point', () => {
      // Test that index.html exists
      const indexPath = path.join(projectRoot, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should have properly structured HTML document', () => {
      // Test that index.html has proper HTML structure
      const indexPath = path.join(projectRoot, 'index.html');
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // Check for DOCTYPE declaration
      expect(htmlContent).toMatch(/<!DOCTYPE html>/i);

      // Check for html tag with lang attribute
      expect(htmlContent).toMatch(/<html[^>]+lang=["'][^"']+["'][^>]*>/i);

      // Check for head section
      expect(htmlContent).toMatch(/<head>/i);
      expect(htmlContent).toMatch(/<\/head>/i);

      // Check for body section
      expect(htmlContent).toMatch(/<body>/i);
      expect(htmlContent).toMatch(/<\/body>/i);

      // Check for meta charset
      expect(htmlContent).toMatch(/<meta[^>]+charset=["']utf-8["'][^>]*>/i);

      // Check for viewport meta tag (required for responsive design)
      expect(htmlContent).toMatch(/<meta[^>]+name=["']viewport["'][^>]*>/i);
    });

    it('should have proper meta tags for GitLab Pages', () => {
      // Test that index.html has proper meta tags
      const indexPath = path.join(projectRoot, 'index.html');
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // Check for title tag
      expect(htmlContent).toMatch(/<title>[^<]+<\/title>/i);

      // Check for description meta tag
      expect(htmlContent).toMatch(/<meta[^>]+name=["']description["'][^>]*>/i);

      // Check for author meta tag (optional but good practice)
      const hasAuthor = /<meta[^>]+name=["']author["'][^>]*>/i.test(htmlContent);
      if (!hasAuthor) {
        console.warn('Consider adding author meta tag for better SEO');
      }
    });

    it('should reference only relative paths for assets', () => {
      // Test that all asset references use relative paths (GitLab Pages requirement)
      const indexPath = path.join(projectRoot, 'index.html');
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // Check CSS links
      const cssLinks = htmlContent.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
      cssLinks.forEach(link => {
        const hrefMatch = link.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          // Should not start with http:// or https:// or //
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            // Allow external CDN links for fonts, etc.
            if (!href.includes('fonts.googleapis.com') && !href.includes('cdnjs.cloudflare.com')) {
              console.warn(`External CSS link found: ${href}`);
            }
          }
        }
      });

      // Check script sources
      const scriptTags = htmlContent.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
      scriptTags.forEach(script => {
        const srcMatch = script.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          const src = srcMatch[1];
          // Should not start with http:// or https:// or //
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            console.warn(`External script source found: ${src}`);
          }
        }
      });

      // Check image sources
      const imgTags = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
      imgTags.forEach(img => {
        const srcMatch = img.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          const src = srcMatch[1];
          // Should not start with http:// or https:// or //
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            console.warn(`External image source found: ${src}`);
          }
        }
      });
    });
  });

  describe('File Organization', () => {
    it('should have GitLab Pages compatible directory structure', () => {
      // Test that file organization matches GitLab Pages requirements
      const requiredFiles = ['index.html'];
      const recommendedDirectories = ['css', 'js', 'assets'];

      // Check required files
      requiredFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });

      // Check recommended directories (warn if missing)
      recommendedDirectories.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        if (!fs.existsSync(dirPath)) {
          console.warn(`Recommended directory missing: ${dir}`);
        }
      });
    });

    it('should have .gitlab-ci.yml for automated deployment', () => {
      // Test that GitLab CI configuration exists
      const gitlabCiPath = path.join(projectRoot, '.gitlab-ci.yml');
      expect(fs.existsSync(gitlabCiPath)).toBe(true);
    });

    it('should have proper GitLab CI configuration', () => {
      // Test that .gitlab-ci.yml has proper GitLab Pages configuration
      const gitlabCiPath = path.join(projectRoot, '.gitlab-ci.yml');
      
      if (fs.existsSync(gitlabCiPath)) {
        const ciContent = fs.readFileSync(gitlabCiPath, 'utf-8');

        // Check for pages job
        expect(ciContent).toMatch(/pages:/);

        // Check for public directory creation
        expect(ciContent).toMatch(/public/);

        // Check for artifacts configuration
        expect(ciContent).toMatch(/artifacts:/);
        expect(ciContent).toMatch(/paths:/);
      }
    });

    it('should not have files that would conflict with GitLab Pages', () => {
      // Test that no conflicting files exist
      const conflictingFiles = [
        'public/index.html', // Should not have pre-existing public directory
        '_config.yml', // Jekyll configuration (GitLab Pages uses different approach)
        'CNAME', // GitHub Pages specific
        '.nojekyll' // GitHub Pages specific
      ];

      conflictingFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          console.warn(`Potentially conflicting file found: ${file}`);
        }
      });
    });

    it('should have assets organized in appropriate directories', () => {
      // Test that assets are properly organized
      const assetDirectories = ['css', 'js', 'assets'];
      
      assetDirectories.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        if (fs.existsSync(dirPath)) {
          const stat = fs.statSync(dirPath);
          expect(stat.isDirectory()).toBe(true);
        }
      });

      // Check that CSS files are in css directory
      const cssDir = path.join(projectRoot, 'css');
      if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
        expect(cssFiles.length).toBeGreaterThan(0);
      }

      // Check that JS files are in js directory
      const jsDir = path.join(projectRoot, 'js');
      if (fs.existsSync(jsDir)) {
        const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
        expect(jsFiles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('GitLab Pages Deployment Readiness', () => {
    it('should be ready for GitLab Pages deployment', () => {
      // Comprehensive test that the site is ready for GitLab Pages
      const checks = {
        hasIndexHtml: fs.existsSync(path.join(projectRoot, 'index.html')),
        hasGitlabCI: fs.existsSync(path.join(projectRoot, '.gitlab-ci.yml')),
        hasCSS: fs.existsSync(path.join(projectRoot, 'css')),
        hasJS: fs.existsSync(path.join(projectRoot, 'js')),
        hasAssets: fs.existsSync(path.join(projectRoot, 'assets'))
      };

      // All critical checks should pass
      expect(checks.hasIndexHtml).toBe(true);
      expect(checks.hasGitlabCI).toBe(true);

      // Log status of optional checks
      if (!checks.hasCSS) console.warn('CSS directory not found');
      if (!checks.hasJS) console.warn('JS directory not found');
      if (!checks.hasAssets) console.warn('Assets directory not found');

      // Overall readiness check
      const criticalChecks = [checks.hasIndexHtml, checks.hasGitlabCI];
      const allCriticalPass = criticalChecks.every(check => check === true);
      
      expect(allCriticalPass).toBe(true);
    });
  });
});