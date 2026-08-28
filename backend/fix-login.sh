#!/bin/bash
set -e

echo "=== Step 1: Verifying .env DATABASE_URL is loaded ==="
grep DATABASE_URL .env || { echo "No DATABASE_URL found in .env — aborting"; exit 1; }

echo ""
echo "=== Step 2: Resetting and reseeding the database ==="
npx prisma migrate reset --force --skip-generate

echo ""
echo "=== Step 3: Regenerating Prisma client (safety net) ==="
npx prisma generate

echo ""
echo "=== Step 4: Confirming the admin user exists directly via Prisma ==="
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findUnique({ where: { email: 'admin@cafeteria.local' } });
  if (!user) {
    console.error('NO admin user found after seed - seed script did not run correctly.');
    process.exit(1);
  }
  console.log('Admin user found:', { id: user.id, email: user.email, isActive: user.isActive, role: user.role });

  const matches = await bcrypt.compare('Admin@12345', user.passwordHash);
  console.log(matches ? 'Password Admin@12345 MATCHES the stored hash.' : 'Password does NOT match stored hash.');

  await prisma.\$disconnect();
})();
"

echo ""
echo "=== Step 5: Testing the actual login API endpoint directly ==="
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cafeteria.local","password":"Admin@12345"}'

echo ""
echo "=== Done ==="
