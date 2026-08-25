import { prisma } from '../src/config/db';

// Ensures every test suite starts from a known state and the Prisma
// connection is cleanly released afterward — prevents Jest from hanging
// on an open database handle after the suite finishes.
afterAll(async () => {
  await prisma.$disconnect();
});