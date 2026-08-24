import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';
import { LoginInput, RegisterInput } from './auth.validation';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 10;

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

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
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