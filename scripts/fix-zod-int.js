#!/usr/bin/env node
/**
 * Simple post-generation fixer to replace `zod.int()` (Orval may emit this)
 * with `zod.number().int()` which is compatible with Zod v3 setups that
 * don't expose zod.int() helper.
 *
 * Usage: node scripts/fix-zod-int.js
 * Add to package.json scripts: "fix:zod-int": "node scripts/fix-zod-int.js"
 */

const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');

const searchGlobs = [
  'lib/**/generated/**/*.ts',
  'lib/**/api-zod/**/*.ts',
  'artifacts/**/src/**/generated/**/*.ts',
  'artifacts/**/src/**/api-zod/**/*.ts',
];

(async () => {
  let total = 0;
  for (const pattern of searchGlobs) {
    const files = glob.sync(pattern, { nodir: true });
    for (const file of files) {
      try {
        const abs = path.resolve(file);
        let content = await fs.readFile(abs, 'utf8');
        // Replace patterns like: zod.int()  OR Zod.int()  OR z.int()  (defensive)
        const replaced = content.replace(/\b([Zz]od|z)\.int\(\)/g, '$1.number().int()');
        if (replaced !== content) {
          await fs.writeFile(abs, replaced, 'utf8');
          console.log('Patched', file);
          total++;
        }
      } catch (e) {
        console.error('Failed to patch', file, e);
      }
    }
  }
  console.log(`Done. Patched ${total} files (if any).`);
})();
