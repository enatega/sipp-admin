const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Execute the actual TS schemas/helpers without adding a test-framework dependency.
function load(relativePath) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(compiled, filename);
  return mod.exports;
}
const { editStoreFormSchema } = load('schemas/enatega-deliveries/stores/store-form.ts');
const { updateProfileValidationSchema } = load('schemas/store/deliveries/update-profile.schema.ts');
const { pruneUnchangedStoreFields, STORE_EDIT_PAYLOAD_FIELDS } = load('lib/store-update-payload.ts');
const { normalizePreviewSource } = load('lib/document-preview.ts');
const { mapStoreApiToForm } = load('components/super-admin/enatega-deliveries/stores/edit-store/mapStoreData.ts');
const { mapVendorStoreData } = load('components/vendor/deliveries/stores/edit-store/mapVendorStoreData.ts');
const t = (key) => key;
const missing = {
  name: 'Migrated restaurant', email: '', phone: '', zoneId: '',
  address: 'Existing restaurant address', shopType: 'restaurant',
  bankName: '', accountHolderName: '', accountNumber: '', branchCode: '',
  businessLicenseFront: null, businessLicenseBack: null, identityCardFront: null,
  identityCardBack: null, storeRegistrationDoc: null, taxCertificate: null,
  location: { type: 'circle', center: { lat: 10, lng: -85 }, radius: 5000 },
  storeTimings: { monday: { is_active: true, slots: [{ open: '12:00:00', close: '16:00:00' }] } },
  description: 'Existing description', productTaxMode: 'store_rate', taxRateId: 'existing-rate',
};

test('legacy edit permits missing contact, zone, KYC and bank details', async () => {
  await editStoreFormSchema(t, true).validate(missing);
});
test('ordinary edit still requires missing onboarding fields', async () => {
  await assert.rejects(editStoreFormSchema(t).validate(missing));
});
test('all seven optional legacy text fields accept actual API nulls', async () => {
  const values = { ...missing };
  for (const field of ['phone', 'email', 'zoneId', 'bankName', 'accountHolderName', 'accountNumber', 'branchCode']) values[field] = null;
  await editStoreFormSchema(t, true).validate(values, { abortEarly: false });
  await assert.rejects(editStoreFormSchema(t, false).validate(values));
});
for (const [name, map] of [['admin', mapStoreApiToForm], ['vendor', mapVendorStoreData]]) {
  test(`${name} maps real nullable legacy API data into a valid edit form`, async () => {
    const api = {
      id: 'legacy-store', storename: missing.name, address: missing.address,
      shoptypeid: missing.shopType, minimumorder: '8000',
      storephone: null, storeemail: null, zoneid: null,
      bankname: null, accountholdername: null, accountnumber: null, branchcode: null,
      latitude: 10, longitude: -85, storetimings: missing.storeTimings,
      addresszoneshape: 'Circle', addresscircledata: {
        type: 'Circle', center: { lat: 10, lng: -85 }, radius: 5000,
      },
      businesslicencefront: null, businesslicenceback: null, nationalidfront: null,
      nationalidback: null, registereddocs: null, taxidcertificate: null,
    };
    const form = map(api);
    for (const field of ['phone', 'email', 'zoneId', 'bankName', 'accountHolderName', 'accountNumber', 'branchCode']) assert.equal(form[field], '');
    await editStoreFormSchema(t, true).validate(form, { abortEarly: false });
  });
}
for (const [field, value] of [['email', 'not-an-email'], ['phone', '123'], ['accountNumber', 'invalid']]) {
  test(`legacy edit rejects invalid supplied ${field}`, async () => {
    await assert.rejects(editStoreFormSchema(t, true).validate({ ...missing, [field]: value }));
  });
}
test('legacy edit still requires operational name/address/location', async () => {
  for (const field of ['name', 'address', 'location']) {
    await assert.rejects(editStoreFormSchema(t, true).validate({ ...missing, [field]: field === 'location' ? null : '' }));
  }
});
test('legacy KYC uploads remain type and size validated', async () => {
  for (const file of [new File(['bad'], 'bad.txt', { type: 'text/plain' }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' })]) {
    await assert.rejects(editStoreFormSchema(t, true).validate({ ...missing, businessLicenseFront: file }));
  }
  await editStoreFormSchema(t, true).validate({ ...missing, businessLicenseFront: new File(['image'], 'doc.jpg', { type: 'image/jpeg' }) });
});
test('legacy profile update permits missing contact, zone and tagline; ordinary update does not', async () => {
  const profile = { storeName: 'Migrated restaurant', vendorId: 'owner', email: '', supportPhone: '', zoneId: '', tagLine: '', minimumOrderValue: '8000' };
  await updateProfileValidationSchema(t, true).validate(profile);
  await assert.rejects(updateProfileValidationSchema(t).validate(profile));
});
test('description-only save omits untouched timings, area, tax and missing fields', () => {
  const values = { ...missing, description: 'Updated description' };
  const payload = new FormData();
  for (const keys of Object.values(STORE_EDIT_PAYLOAD_FIELDS)) {
    for (const key of Array.isArray(keys) ? keys : [keys]) payload.set(key, 'test');
  }
  pruneUnchangedStoreFields(payload, values, missing, STORE_EDIT_PAYLOAD_FIELDS);
  assert.deepEqual([...payload.keys()], ['description']);
});
test('blank values do not clear previously stored bank/zone data', () => {
  const initial = { bankName: 'Bank', zoneId: 'zone' };
  const payload = new FormData();
  payload.set('bank_name', ''); payload.set('zoneId', '');
  pruneUnchangedStoreFields(payload, { bankName: '', zoneId: '' }, initial, { bankName: 'bank_name', zoneId: 'zoneId' });
  assert.equal([...payload.keys()].length, 0);
});
test('new file remains in payload; zero/false changes are not discarded', () => {
  const payload = new FormData();
  payload.set('nationalIdFront', new File(['image'], 'doc.jpg', { type: 'image/jpeg' }));
  payload.set('base_fee', '0'); payload.set('pickup_allow', 'false');
  pruneUnchangedStoreFields(payload, { baseFee: 0, pickupAllowed: false }, { baseFee: 100, pickupAllowed: true }, { baseFee: 'base_fee', pickupAllowed: 'pickup_allow' });
  assert.equal([...payload.keys()].length, 3);
});
test('missing document values never produce an image URL; valid sources retain their URLs', () => {
  for (const value of [undefined, null, '', ' ', 'N/A', 'null', 'undefined']) assert.equal(normalizePreviewSource(value), null);
  assert.equal(normalizePreviewSource('https://bucket.example/doc.jpg'), 'https://bucket.example/doc.jpg');
  assert.equal(normalizePreviewSource('/uploads/doc.jpg'), '/uploads/doc.jpg');
});
