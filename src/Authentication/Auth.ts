import jwt, { SignOptions } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { User } from '../Models/Model';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;

export function validatePassword(password: unknown): string | null {
	if (typeof password !== 'string' || !passwordPattern.test(password)) {
		return 'Password must be 8 to 20 characters and include uppercase, lowercase, digit, and special character.';
	}
	return null;
}

export function signToken(user: User): string {
	const secret = process.env.JWT_SECRET ?? 'change-this-development-secret';
	return jwt.sign({ userId: user.id, username: user.username, adminNo: user.adminNo, isAdmin: user.isAdmin, sessionId: user.currentSessionId }, secret, {
		expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
	});
}

export function RefreshToken(user: User): string {
	const secret = process.env.Refresh_Secret ?? 'change-this-development-secret';
	return jwt.sign({ userId: user.id, username: user.username, adminNo: user.adminNo, isAdmin: user.isAdmin, sessionId: user.currentSessionId }, secret, {
		expiresIn: (process.env.JWTRefresh_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
	});
}

export interface ActiveSession {
	userId: number;
	username: string;
	adminNo: string;
	isAdmin: boolean;
	sessionId: string;
}

export async function verifyActiveSession(token: string): Promise<ActiveSession | null> {
	let decoded: string | jwt.JwtPayload;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'change-this-development-secret');
	} catch {
		return null;
	}

	if (typeof decoded === 'string' ||
		typeof decoded.userId !== 'number' ||
		typeof decoded.username !== 'string' ||
		typeof decoded.adminNo !== 'string' ||
		typeof decoded.isAdmin !== 'boolean' ||
		typeof decoded.sessionId !== 'string') {
		return null;
	}

	const user = await User.findByPk(decoded.userId, { attributes: ['id', 'currentSessionId'] });
	if (!user || user.currentSessionId !== decoded.sessionId) {
		return null;
	}

	return {
		userId: decoded.userId,
		username: decoded.username,
		adminNo: decoded.adminNo,
		isAdmin: decoded.isAdmin,
		sessionId: decoded.sessionId,
	};
}

export interface AuthenticatedRequest extends Request {
	user?: ActiveSession;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
	const authorization = req.headers.authorization;
	const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

	if (!token) {
		res.status(401).json({ success: false, message: 'Bearer access token is required.' });
		return;
	}

	const session = await verifyActiveSession(token);
	if (!session) {
		res.status(401).json({ success: false, message: 'Session is no longer active. Please sign in again.' });
		return;
	}

	req.user = session;
	next();
}
