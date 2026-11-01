import dotenv from 'dotenv';
import path from 'path';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const EMAIL_QUEUE_NAME = 'email';

export interface VerificationEmailJob {
	type: 'verification';
	email: string;
	verificationToken: string;
	name: string;
}

export interface PasswordResetEmailJob {
	type: 'password-reset';
	email: string;
	resetToken: string;
	name: string;
}

export interface PasswordChangedEmailJob {
	type: 'password-changed';
	email: string;
	name: string;
}

export type EmailJob = VerificationEmailJob | PasswordResetEmailJob | PasswordChangedEmailJob;

export function createRedisConnection(maxRetriesPerRequest: number | null = 1): IORedis {
	return new IORedis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
		maxRetriesPerRequest,
	});
}

let emailQueue: Queue<EmailJob> | undefined;

function enqueueEmail(data: EmailJob): Promise<unknown> {
	emailQueue ??= new Queue<EmailJob>(EMAIL_QUEUE_NAME, {
		connection: createRedisConnection(),
	});
	return emailQueue.add(data.type, data, {
		attempts: 5,
		backoff: { type: 'exponential', delay: 5000 },
		removeOnComplete: 1000,
		removeOnFail: 1000,
	});
}

export function enqueueVerificationEmail(data: Omit<VerificationEmailJob, 'type'>): Promise<unknown> {
	return enqueueEmail({ ...data, type: 'verification' });
	
}

export function enqueuePasswordResetEmail(data: Omit<PasswordResetEmailJob, 'type'>): Promise<unknown> {
	return enqueueEmail({ ...data, type: 'password-reset' });
}

export function enqueuePasswordChangedEmail(data: Omit<PasswordChangedEmailJob, 'type'>): Promise<unknown> {
	return enqueueEmail({ ...data, type: 'password-changed' });
}