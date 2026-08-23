#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const modulesRoot = resolve(import.meta.dirname, '../server/src/modules');
const infrastructureRoot = resolve(import.meta.dirname, '../server/src/infrastructure');
const failures = [];

function isWithin(parent, target) {
  const path = relative(parent, target);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (entry.name.endsWith('.ts')) files.push(path);
  }
  return files;
}

for (const entry of await readdir(modulesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
  const directory = join(modulesRoot, entry.name);
  for (const path of await sourceFiles(directory)) {
    const content = await readFile(path, 'utf8');
    for (const match of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const specifier = match[1];
      if (!specifier.startsWith('.')) continue;
      const importedPath = resolve(dirname(path), specifier);
      if (isWithin(infrastructureRoot, importedPath)) {
        failures.push(
          `${path}: module must depend on infrastructure through exported providers, not relative infrastructure imports`,
        );
      }
      if (isWithin(modulesRoot, importedPath) && !isWithin(directory, importedPath)) {
        failures.push(
          `${path}: module-to-module relative imports are not allowed; use explicit public contracts`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('module boundary check passed');
}
