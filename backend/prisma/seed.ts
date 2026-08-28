import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cafeteria.local' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@cafeteria.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const categories = await Promise.all(
    ['Breakfast', 'Lunch', 'Beverages', 'Snacks', 'Desserts'].map((name, index) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, displayOrder: index },
      })
    )
  );

  const beverageCategory = categories.find((c) => c.name === 'Beverages')!;

  const coffeeBeans = await prisma.ingredient.upsert({
    where: { name: 'Coffee Beans' },
    update: {},
    create: { name: 'Coffee Beans', unit: 'g' },
  });

  const milk = await prisma.ingredient.upsert({
    where: { name: 'Milk' },
    update: {},
    create: { name: 'Milk', unit: 'ml' },
  });

  await prisma.inventory.upsert({
    where: { ingredientId: coffeeBeans.id },
    update: {},
    create: { ingredientId: coffeeBeans.id, quantityInStock: 5000, lowStockThreshold: 500 },
  });

  await prisma.inventory.upsert({
    where: { ingredientId: milk.id },
    update: {},
    create: { ingredientId: milk.id, quantityInStock: 10000, lowStockThreshold: 1000 },
  });

  // Previously this hardcoded id: 'seed-latte-item', which produced a
  // non-UUID primary key — the real order-creation endpoint validates
  // menuItemId as a UUID (Phase 6 Step 7 / Phase 10), so any order placed
  // for that seeded item was rejected with a 422. Letting Prisma generate
  // a proper UUID here (its @default(uuid()) on the model) fixes that.
  // Since there's no natural unique field to upsert on other than id/name,
  // and name isn't unique on MenuItem, we look it up first and only create
  // if it doesn't already exist — safe to re-run without duplicating.
  let latte = await prisma.menuItem.findFirst({
    where: { name: 'Cafe Latte', categoryId: beverageCategory.id },
  });

  if (!latte) {
    latte = await prisma.menuItem.create({
      data: {
        categoryId: beverageCategory.id,
        name: 'Cafe Latte',
        description: 'Espresso with steamed milk',
        price: 3.5,
        isAvailable: true,
      },
    });
  }

  await prisma.recipe.upsert({
    where: { uq_recipe_item_ingredient: { menuItemId: latte.id, ingredientId: coffeeBeans.id } },
    update: {},
    create: { menuItemId: latte.id, ingredientId: coffeeBeans.id, quantityRequired: 18 },
  });

  await prisma.recipe.upsert({
    where: { uq_recipe_item_ingredient: { menuItemId: latte.id, ingredientId: milk.id } },
    update: {},
    create: { menuItemId: latte.id, ingredientId: milk.id, quantityRequired: 150 },
  });

  console.log('Seed complete. Admin login: admin@cafeteria.local / Admin@12345');
  console.log(`Created admin user id: ${admin.id}`);
  console.log(`Latte menu item id: ${latte.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });