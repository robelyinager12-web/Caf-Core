import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';
import { LoginInput, RegisterInput, ChangePasswordInput } from './auth.validation';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

// A pre-computed hash of a value nobody will ever actually enter, used to
// burn the same bcrypt.compare() time when a user doesn't exist — otherwise
// "unknown email" responds faster than "wrong password", leaking which
// emails are registered via a timing side-channel.
const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8Rri8ByfSA0AhVvTAyOJb0dxfmDcXW';

interface TokenPayload {
  userId: string;
  role: Role;
}

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(input.password, hashToCompare);

  if (!user || !user.isActive || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload: TokenPayload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret) as TokenPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.isActive) {
    throw new AppError('User no longer active', 401);
  }

  const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
  return { accessToken: newAccessToken };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const currentPasswordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!currentPasswordMatches) {
    throw new AppError('Current password is incorrect', 401);
  }

  const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}