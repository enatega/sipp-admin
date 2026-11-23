import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const checks = [
  {
    name: 'neutral-shared-imports',
    targets: [
      'components/shared/documents',
      'components/shared/forms',
      'shared/contracts',
    ],
    forbidden: [
      '@/components/super-admin/',
      '@/hooks/api/super-admin/',
      '@/types/entities/super-admin/',
    ],
  },
  {
    name: 'persona-edit-store-imports',
    targets: [
      'components/vendor/deliveries/stores/edit-store',
      'components/store/deliveries/store/profile',
      'components/store/deliveries/store/location',
      'components/store/deliveries/subscription-plans',
      'components/store/general-bookings/business-type/profile',
      'components/store/general-bookings/business-type/location',
      'components/service-center/profile',
      'components/service-center/location',
    ],
    forbidden: [
      '@/components/super-admin/',
      '@/hooks/api/super-admin/',
    ],
  },
  {
    name: 'legacy-admin-route-literals',
    targets: ['config', 'lib'],
    forbidden: ['/enatega-drive', '/enatega-deliveries'],
    allowIn: new Set(['lib/routes.ts', 'next.config.ts']),
  },
];

const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
]);

function walk(targetPath, files = []) {
  if (!fs.existsSync(targetPath)) return files;

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (textExtensions.has(path.extname(targetPath))) {
      files.push(targetPath);
    }
    return files;
  }

  for (const entry of fs.readdirSync(targetPath)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'backup') {
      continue;
    }
    walk(path.join(targetPath, entry), files);
  }

  return files;
}

const failures = [];

for (const check of checks) {
  for (const target of check.targets) {
    const files = walk(path.join(root, target));

    for (const file of files) {
      const relativeFile = path.relative(root, file);

      if (check.allowIn?.has(relativeFile)) {
        continue;
      }

      const source = fs.readFileSync(file, 'utf8');
      const lines = source.split('\n');

      lines.forEach((line, index) => {
        for (const forbidden of check.forbidden) {
          if (line.includes(forbidden)) {
            failures.push(
              `${check.name}: ${relativeFile}:${index + 1} contains "${forbidden}"`,
            );
          }
        }
      });
    }
  }
}

if (failures.length > 0) {
  console.error('Module boundary audit failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Module boundary audit passed.');
