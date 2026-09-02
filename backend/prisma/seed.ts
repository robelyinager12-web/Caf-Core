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

  // Categories matching the requested reference layout (Breakfast, Soups,
  // Pasta, Main Course, Burgers, Drinks, BBQ) — upsert on name means this
  // is safe to re-run without creating duplicates or touching any
  // categories you've already added manually via the Items page.
  const categories = await Promise.all(
    ['Breakfast', 'Soups', 'Pasta', 'Main Course', 'Burgers', 'Drinks', 'BBQ'].map(
      (name, index) =>
        prisma.category.upsert({
          where: { name },
          update: {},
          create: { name, displayOrder: index },
        })
    )
  );

  const drinksCategory = categories.find((c) => c.name === 'Drinks')!;

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

  let latte = await prisma.menuItem.findFirst({
    where: { name: 'Cafe Latte', categoryId: drinksCategory.id },
  });

  if (!latte) {
    latte = await prisma.menuItem.create({
      data: {
        categoryId: drinksCategory.id,
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
  console.log(`Categories: ${categories.map((c) => c.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });