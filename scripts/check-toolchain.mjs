#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const [manager, expectedVersion] = packageJson.packageManager.split('@');
const actualNode = process.versions.node;
const actualManager = process.env.npm_config_user_agent?.split('/')[0] ?? 'unknown';
const failures = [];

if (!/^24\./.test(actualNode)) {
  failures.push(`Node.js ${actualNode} is unsupported; use ${packageJson.engines.node}`);
}
if (actualManager !== 'pnpm' && process.env.npm_execpath !== undefined) {
  failures.push(
    `package manager ${actualManager} is unsupported; use ${packageJson.packageManager}`,
  );
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`toolchain check passed: Node.js ${actualNode}, ${manager} ${expectedVersion}`);
}
