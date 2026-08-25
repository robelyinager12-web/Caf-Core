import { createApp } from '../../src/app';
import { prisma } from '../../src/config/db';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

export const app = createApp();

/**
 * Creates a real user in the test database and returns a valid login,
 * rather than mocking auth — integration tests should exercise the actual
 * auth middleware and role checks, not bypass them.
 */
export async function createTestUser(role: Role, emailSuffix = Date.now().toString()) {
  const passwordHash = await bcrypt.hash('TestPass123', 10);
  const user = await prisma.user.create({
    data: {
      fullName: `Test ${role}`,
      email: `test-${role.toLowerCase()}-${emailSuffix}@test.local`,
      passwordHash,
      role,
    },
  });
  return { user, password: 'TestPass123' };
}

export async function cleanupTestUser(userId: string) {
  await prisma.staffShift.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {
    // already deleted or has protected relations — safe to ignore in cleanup
  });
}