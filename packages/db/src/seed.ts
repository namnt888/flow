import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

import { db } from './client';
import { accounts, categories } from './schema';

const allCategories = [
  { name: 'Ăn uống', kind: 'EXPENSE' as const },
  { name: 'Lương', kind: 'INCOME' as const },
  { name: 'Mua sắm', kind: 'EXPENSE' as const },
  { name: 'Đầu tư / Mua Vàng', kind: 'EXPENSE' as const },
  { name: 'Thu nhập thụ động', kind: 'INCOME' as const },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Insert accounts
  const existingAccounts = await db.select({ id: accounts.id }).from(accounts);
  if (existingAccounts.length === 0) {
    await db.insert(accounts).values([
      { name: 'Tiền mặt', type: 'CASH', balance: BigInt(0) },
      { name: 'Thẻ tín dụng VIB', type: 'CREDIT_CARD', balance: BigInt(0) },
    ]);
    console.log('  ✅ Accounts seeded: Tiền mặt, Thẻ tín dụng VIB');
  } else {
    console.log('  ⏭️  Accounts already exist, skipping');
  }

  // Insert categories (idempotent — skip existing names)
  const existingCategoryNames = new Set(
    (await db.select({ name: categories.name }).from(categories)).map((r) => r.name),
  );

  const newCategories = allCategories.filter((c) => !existingCategoryNames.has(c.name));
  if (newCategories.length > 0) {
    await db.insert(categories).values(newCategories);
    console.log(`  ✅ Categories seeded (${newCategories.length} new): ${newCategories.map((c) => c.name).join(', ')}`);
  } else {
    console.log('  ⏭️  All categories already exist, skipping');
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
