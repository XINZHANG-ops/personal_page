// Test setup file
import { beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load the HTML file for testing
beforeEach(() => {
  const htmlPath = path.resolve('./index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = htmlContent;
});