const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relativePath) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => id === '@/lib/nutrition-facts'
    ? load('lib/nutrition-facts.ts') : originalRequire(id);
  mod._compile(compiled, filename);
  return mod.exports;
}

const { cleanAllergens, allergensSchema } = load('lib/allergens.ts');

test('add/edit payload cleaning preserves translated notes and legacy rows', () => {
  const rows = [
    { allergen: ' Gluten ', note: ' Contains wheat ', noteTranslations: { es: ' Contiene trigo ', fr: ' ', de: null } },
    { allergen: 'milk', note: '' },
    { allergen: '', note: '' },
  ];
  assert.deepEqual(cleanAllergens(rows), [
    { allergen: 'gluten', note: 'Contains wheat', noteTranslations: { es: 'Contiene trigo' } },
    { allergen: 'milk', note: '' },
  ]);
  assert.equal(rows[0].note, ' Contains wheat ');
  assert.deepEqual(cleanAllergens([{ allergen: 'eggs', note: null, noteTranslations: [] }]), [
    { allergen: 'eggs', note: '' },
  ]);
});

test('Formik validation preserves note maps while keeping existing allergen guards', async () => {
  const schema = allergensSchema((key) => key);
  const rows = [{ allergen: 'gluten', note: 'Contains wheat', noteTranslations: { es: 'Contiene trigo' } }];
  assert.deepEqual(await schema.validate(rows), rows);
  await assert.rejects(schema.validate([...rows, ...rows]));
  await assert.rejects(schema.validate([{ allergen: '', note: 'Contains wheat' }]));
});
