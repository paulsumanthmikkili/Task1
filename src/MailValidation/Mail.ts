
import nodemailer from 'nodemailer';

export const Mail = async (userEmail: string, verificationToken: string, name: string): Promise<void> => {
	const emailUser = process.env.Email_User;
	const emailPassword = process.env.EmailPassword;

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


