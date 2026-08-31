import { Request, Response, NextFunction } from 'express';
import {
  loginSchema,
  registerSchema,
  publicSignupSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.validation';
import {
  registerUser,
  publicSignup,
  loginUser,
  refreshAccessToken,
  changePassword,
} from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from './auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);

    await logAudit({
      userId: (req as AuthenticatedRequest).user?.userId ?? null,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { createdEmail: user.email, createdRole: user.role },
    });

    sendSuccess(res, 201, { message: 'User registered successfully', data: user });
  } catch (error) {
    next(error);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const input = publicSignupSchema.parse(req.body);
    const user = await publicSignup(input);

    await logAudit({
      userId: null,
      action: 'USER_SELF_SIGNUP',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email },
    });

    sendSuccess(res, 201, { message: 'Account created successfully', data: user });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    await logAudit({
      userId: result.user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: result.user.id,
    });

    sendSuccess(res, 200, { message: 'Login successful', data: result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await refreshAccessToken(refreshToken);
    sendSuccess(res, 200, { message: 'Token refreshed', data: result });
  } catch (error) {
    next(error);
  }
}

export async function postChangePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.user.userId, input);

    await logAudit({
      userId: req.user.userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: req.user.userId,
    });

    sendSuccess(res, 200, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}