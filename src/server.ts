import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './Config/db';
import routes from './Routes/Routes';
import { startEmailWorker } from './Workers/emailWorker';

// dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is running.' }));
// console.log(process.env.PORT)
const port = Number(process.env.PORT ?? 3000);

if (require.main === module) {
    sequelize.authenticate()
        .then(() => sequelize.sync({ alter: true }))
        .then(() => {
            const emailWorker = startEmailWorker();
            const server = app.listen(port, () => console.log(`API listening on port ${port}`));

            const shutdown = async (): Promise<void> => {
                await emailWorker.close();
                await new Promise<void>((resolve, reject) => {
                    server.close((error) => error ? reject(error) : resolve());
                });
                await sequelize.close();
            };
            const handleShutdown = (): void => {
                void shutdown().catch((error: unknown) => {
                    console.error('Unable to shut down cleanly:', error);
                    process.exitCode = 1;
                });
            };

            process.once('SIGINT', handleShutdown);
            process.once('SIGTERM', handleShutdown);
        })
        .catch((error: unknown) => {
            console.error('Unable to start API:', error);
            process.exitCode = 1;
        });
}

export default app;