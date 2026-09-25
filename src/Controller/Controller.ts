import argon2 from 'argon2';
import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { RefreshToken,signToken, AuthenticatedRequest } from '../Authentication/Auth';
import { User } from '../Models/Model';
import crypto from 'crypto';
import { Mail } from '../MailValidation/Mail';

export function verificationToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

async function generateUniqueAdminNo(): Promise<string> {
	for (let attempt = 0; attempt < 20; attempt += 1) {
		const adminNo = String(Math.floor(1000 + Math.random() * 9000));
		const existingUser = await User.findOne({ where: { adminNo }, attributes: ['id'] });
		if (!existingUser) {
			return adminNo;
		}
	}
	throw new Error('Unable to generate a unique admin number.');
}

const normalizeEmailInput = (value: string): string => {
	return value.trim().toLowerCase().replace(/(\.com)+$/i, '.com');
};

export async function registerController(req: Request, res: Response): Promise<void> {
	const { name, email, username, password } = req.body as {
		name?: string;
		email?: string;
		username?: string;
		password?: string;
	};

	if (typeof password !== 'string') {
		res.status(400).json({ success: false, message: 'Password is required.' });
		return;
	}

	const normalizedEmail = typeof email === 'string' ? normalizeEmailInput(email) : '';
	if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		res.status(400).json({ success: false, message: 'A valid email is required.' });
		return;
	}

	const verificationTokenValue = verificationToken();
	const user = await User.create({
		name: name ?? '',
		email: normalizedEmail,
		username: username ?? '',
		adminNo: await generateUniqueAdminNo(),
		passwordHash: await argon2.hash(password),
		isAdmin: false,
		email_verified: false,
		verfication_token: verificationTokenValue,
		verfication_token_expiress: new Date(Date.now() + 15 * 60 * 1000),
	});

	let emailSent = false;
	try {
		await Mail(user.email, verificationTokenValue, user.name);
		emailSent = true;
	} catch (error: unknown) {
		console.error('Email verification send failed:', error);
		await user.destroy();
		res.status(502).json({
			success: false,
			message: 'Registration could not be completed because the verification email could not be sent.',
		});
		return;
	}

	res.status(201).json({
		status: 'success',
		success: true,
		message: 'Registration successful. Please verify your email before logging in.',
		emailSent,
	});
}

export async function loginController(req: Request, res: Response): Promise<void> {
	const body = req.body as Record<string, unknown>;
	const identifier = body.identifier ?? body.email ?? body.username ?? body.userId;
	const password = body.password;
	if ((typeof identifier !== 'string' && typeof identifier !== 'number') || typeof password !== 'string' || !String(identifier).trim() || !password) {
		res.status(400).json({ success: false, message: 'Provide identifier, email, username, or userId together with password.' });
		return;
	}
	const trimmedIdentifier = String(identifier).trim();
	const identifierConditions: Array<{ email?: string; username?: string; id?: number }> = [
		{ email: trimmedIdentifier.toLowerCase() },
		{ username: trimmedIdentifier },
	];
	if (/^\d+$/.test(trimmedIdentifier)) {
		identifierConditions.push({ id: Number(trimmedIdentifier) });
	}
	const user = await User.findOne({ where: { [Op.or]: identifierConditions } });
	if (!user || !(await argon2.verify(user.passwordHash, password))) {
		res.status(401).json({status:"failed", success: false, message: 'Invalid username/email or password.' });
		return;
	}
	if (!user.email_verified) {
		const newVerificationToken = verificationToken();
		user.verfication_token = newVerificationToken;
		user.verfication_token_expiress = new Date(Date.now() + 15 * 60 * 1000);
		await user.save();

		try {
			await Mail(user.email, newVerificationToken, user.name);
		} catch (error: unknown) {
			console.error('Email verification resend failed:', error);
			res.status(502).json({
				status: 'failed',
				success: false,
				message: 'Your email is not verified, and the verification email could not be sent.',
			});
			return;
		}

		res.status(403).json({
			status: 'failed',
			success: false,
			message: 'Your email is not verified. A new verification email has been sent.',
			emailSent: true,
		});
		return;
	}
	res.json({
		status:"success",
		success: true,
		message: 'Login successful.',
		data: { Acesstoken: signToken(user),RefreshToken:RefreshToken(user) ,user: { id: user.id, adminNo: user.adminNo, name: user.name, email: user.email, username: user.username, isAdmin: user.isAdmin } },
	});
}

export async function dashboardController(req: AuthenticatedRequest, res: Response): Promise<void> {
	const user = await User.findByPk(req.user!.userId, { attributes: [ 'name' ] });
	res.json({ success: true, message: 'Dashboard data loaded.', data: { user } });
}


export async function verifyEmail(req: Request, res: Response): Promise<void> {
	const token = typeof req.query?.token === 'string' ? req.query.token : '';

	if (!token) {
		res.status(400).json({ success: false, message: 'Verification token is required.' });
		return;
	}

	const user = await User.findOne({ where: { verfication_token: token } });
	if (!user) {
		res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
		return;
	}

	if (user.email_verified) {
		res.status(200).json({ success: true, message: 'Email is already verified.' });
		return;
	}

	const expiresAt = user.verfication_token_expiress ? new Date(user.verfication_token_expiress).getTime() : null;
	if (expiresAt !== null && expiresAt < Date.now()) {
		res.status(400).json({ success: false, message: 'Verification token has expired.' });
		return;
	}

	user.email_verified = true;
	user.verfication_token = null;
	user.verfication_token_expiress = null;
	await user.save();

	res.status(200).json({ success: true, message: 'Email verified successfully.' });
}



