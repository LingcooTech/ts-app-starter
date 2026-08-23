#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: pnpm generate:module <module-name>');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const directory = join(root, 'server/src/modules', name);
const className = name
  .split('-')
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join('');
const files = {
  [`${name}.module.ts`]: `import { Module } from '@nestjs/common';\n\nimport { ${className}Controller } from './${name}.controller';\nimport { ${className}Service } from './${name}.service';\n\n@Module({\n  controllers: [${className}Controller],\n  providers: [${className}Service],\n})\nexport class ${className}Module {}\n`,
  [`${name}.controller.ts`]: `import { Controller, Get } from '@nestjs/common';\n\nimport { ${className}Service } from './${name}.service';\n\n@Controller('${name}')\nexport class ${className}Controller {\n  constructor(private readonly service: ${className}Service) {}\n\n  @Get('status')\n  status() {\n    return this.service.status();\n  }\n}\n`,
  [`${name}.service.ts`]: `import { Injectable } from '@nestjs/common';\n\n@Injectable()\nexport class ${className}Service {\n  status() {\n    return { module: '${name}', status: 'ok' as const };\n  }\n}\n`,
  [`${name}.schema.ts`]: `// Add Drizzle tables owned by the ${name} module here.\nexport {};\n`,
};

await mkdir(directory, { recursive: false });
for (const [file, content] of Object.entries(files))
  await writeFile(join(directory, file), content);
console.log(`created server/src/modules/${name}`);
console.log(`register ${className}Module in server/src/app.module.ts when ready`);
