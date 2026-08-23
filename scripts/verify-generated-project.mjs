#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const cli = resolve(root, 'create-ts-app-starter/cli.mjs');
const projectName = 'generated-smoke-app';
const target = await mkdtemp(join(tmpdir(), 'ts-app-starter-generated-'));
const project = join(target, projectName);

try {
  execFileSync(
    process.execPath,
    [cli, project, '--skip-install', '--no-git', '--template-path', root],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );

  const starterVersion = (await readFile(resolve(root, '.starter-version'), 'utf8')).trim();
  const generatedVersion = (await readFile(join(project, '.starter-version'), 'utf8')).trim();
  if (generatedVersion !== starterVersion) {
    throw new Error(
      `generated .starter-version is ${generatedVersion}, expected ${starterVersion}`,
    );
  }

  const packageJson = JSON.parse(await readFile(join(project, 'package.json'), 'utf8'));
  if (packageJson.name !== projectName) {
    throw new Error(`generated package name is ${packageJson.name}, expected ${projectName}`);
  }
  for (const script of ['check:starter-version', 'smoke:generated']) {
    if (script in packageJson.scripts) {
      throw new Error(`generated project contains maintainer-only script ${script}`);
    }
  }
  if (packageJson.scripts.check.includes('check:starter-version')) {
    throw new Error('generated project check script still invokes check:starter-version');
  }
  for (const path of [
    'scripts/check-starter-version.mjs',
    'scripts/verify-generated-project.mjs',
  ]) {
    try {
      await access(join(project, path));
      throw new Error(`generated project contains maintainer-only file ${path}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const textExtensions = new Set([
    '.md',
    '.json',
    '.ts',
    '.tsx',
    '.js',
    '.mjs',
    '.mts',
    '.css',
    '.yml',
    '.yaml',
    '.html',
    '.env',
    '.example',
    '.sql',
    '.toml',
  ]);
  const forbidden = ['ts-app-starter', '@ts-app-starter/'];
  const failures = [];
  async function scan(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (['.git', 'node_modules', 'dist', 'coverage'].includes(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await scan(path);
        continue;
      }
      const extension = entry.name.includes('.') ? `.${entry.name.split('.').pop()}` : '';
      if (!textExtensions.has(extension) && !entry.name.startsWith('.env')) continue;
      const content = (await readFile(path, 'utf8')).replaceAll('create-ts-app-starter', '');
      for (const marker of forbidden) {
        if (content.includes(marker)) failures.push(`${path}: found ${marker}`);
      }
    }
  }
  await scan(project);
  if (failures.length > 0)
    throw new Error(`generated project contains starter markers:\n${failures.join('\n')}`);

  console.log('generated project smoke test passed');
} finally {
  await rm(target, { recursive: true, force: true });
}
