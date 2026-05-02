import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

import { db } from './client';
import { accounts, categories } from './schema';

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

  // Insert categories
  const existingCategories = await db.select({ id: categories.id }).from(categories);
  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      { name: 'Ăn uống', kind: 'EXPENSE' },
      { name: 'Lương', kind: 'INCOME' },
      { name: 'Mua sắm', kind: 'EXPENSE' },
      { name: 'Đầu tư / Mua Vàng', kind: 'EXPENSE' },
      { name: 'Thu nhập thụ động', kind: 'INCOME' },
    ]);
    console.log('  ✅ Categories seeded: Ăn uống, Lương, Mua sắm, Đầu tư / Mua Vàng, Thu nhập thụ động');
  } else {
    console.log('  ⏭️  Categories already exist, skipping');
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
