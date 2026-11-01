
import nodemailer from 'nodemailer';

export const Mail = async (userEmail: string, verificationToken: string, name: string): Promise<void> => {
	const emailUser = process.env.Email_User;
	const emailPassword = process.env.EmailPassword?.replace(/\s+/g, '');

	if (!emailUser || !emailPassword) {
		throw new Error('Missing Gmail SMTP credentials. Set Email_User and EmailPassword in the .env file.');
	}

	const transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: emailUser,
			pass: emailPassword,
		},
	});
	const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
	const verificationUrl = `${appUrl.endsWith('/api') ? appUrl : `${appUrl}/api`}/verify-email?token=${encodeURIComponent(verificationToken)}`;

	const option = {
		from: emailUser,
		to: userEmail,
		subject: 'Email authentication',
		html: `
			<h2>Welcome ${name}</h2>
			<p>Please click the button below to verify your email.</p>
			<a href="${verificationUrl}">
				Verify Email
			</a>
			<p>This link expires in 15 minutes.</p>
		`,
	};

	await transport.sendMail(option);
};

async function sendSecurityEmail(userEmail: string, subject: string, html: string): Promise<void> {
	const emailUser = process.env.Email_User;
	const emailPassword = process.env.EmailPassword?.replace(/\s+/g, '');

	if (!emailUser || !emailPassword) {
		throw new Error('Missing Gmail SMTP credentials. Set Email_User and EmailPassword in the .env file.');
	}

	const transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: { user: emailUser, pass: emailPassword },
	});

	await transport.sendMail({ from: emailUser, to: userEmail, subject, html });
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string, name: string): Promise<void> {
	await sendSecurityEmail(
		userEmail,
		'Password reset request',
		`<h2>Hello ${name}</h2><p>Use this one-time password reset token within 15 minutes:</p><p>${resetToken}</p><p>Submit it with your new password to POST /api/reset-password. If you did not request this, you can ignore this email.</p>`,
	);
}

export async function sendPasswordChangedEmail(userEmail: string, name: string): Promise<void> {
	await sendSecurityEmail(
		userEmail,
		'Password changed',
		`<h2>Hello ${name}</h2><p>Your password was changed successfully. If you did not make this change, contact support immediately.</p>`,
	);
}

