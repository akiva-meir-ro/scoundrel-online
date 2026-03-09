#!/usr/bin/env node

import { spawn } from 'child_process';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

console.log('🚀 Starting Scoundrel Game Dev Server...\n');

// Start npm run dev
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

// Wait for server to start, then open browser
setTimeout(() => {
  console.log('\n🌐 Opening browser to http://localhost:5173...\n');
  open('http://localhost:5173').catch(err => {
    console.log('Could not automatically open browser. Please visit: http://localhost:5173');
  });
}, 3000);

// Handle process termination
devServer.on('close', (code) => {
  console.log(`\nDev server stopped with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  devServer.kill();
  process.exit(0);
});
