import { Worker } from 'bullmq';
import { Mail, sendPasswordChangedEmail, sendPasswordResetEmail } from '../MailValidation/Mail';
import { createRedisConnection, EMAIL_QUEUE_NAME, EmailJob } from '../Queues/emailQueue';

export function startEmailWorker(): Worker<EmailJob> {
	const worker = new Worker<EmailJob>(
		EMAIL_QUEUE_NAME,
		async (job) => {
			switch (job.data.type) {
				case 'verification':
					await Mail(job.data.email, job.data.verificationToken, job.data.name);
					break;
				case 'password-reset':
					await sendPasswordResetEmail(job.data.email, job.data.resetToken, job.data.name);
					break;
				case 'password-changed':
					await sendPasswordChangedEmail(job.data.email, job.data.name);
					break;
			}
		},
		{
			connection: createRedisConnection(null),
			concurrency: 5,
		},
	);

	worker.on('completed', (job) => {
		console.log(`Email job ${job.id} completed.`);
	});

	worker.on('failed', (job, error) => {
		console.error(`Email job ${job?.id ?? 'unknown'} failed:`, error);
	});

	worker.on('error', (error) => {
		console.error('Email worker error:', error);
	});

	console.log('Email worker is running.');
	return worker;
}

if (require.main === module) {
	const worker = startEmailWorker();
	const shutdown = async (): Promise<void> => {
		await worker.close();
		process.exit(0);
	};

	process.once('SIGINT', () => void shutdown());
	process.once('SIGTERM', () => void shutdown());
}