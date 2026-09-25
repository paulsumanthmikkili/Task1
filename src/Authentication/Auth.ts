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
	return jwt.sign({ userId: user.id, username: user.username, adminNo: user.adminNo, isAdmin: user.isAdmin }, secret, {
		expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
	});
	
	
}

export function RefreshToken(user: User): string {
	const secret = process.env.Refresh_Secret ?? 'change-this-development-secret';
	return jwt.sign({ userId: user.id, username: user.username, adminNo: user.adminNo, isAdmin: user.isAdmin }, secret, {
		expiresIn: (process.env.JWTRefresh_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
	});
	
	
}
export interface AuthenticatedRequest extends Request {
	user?: { userId: number; username: string; adminNo: string; isAdmin: boolean };
}


export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
	const authorization = req.headers.authorization;
	const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

	if (!token) {
		res.status(401).json({ success: false, message: 'Bearer token is required.' });
		return;
	}

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET ?? 'change-this-development-secret') as AuthenticatedRequest['user'];
		next();
	} catch {
		res.status(401).json({ success: false, message: 'Invalid or expired token.' });
	}
}

