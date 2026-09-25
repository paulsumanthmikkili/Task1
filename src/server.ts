import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './Config/db';
import routes from './Routes/Routes';

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
        .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
        .catch((error: unknown) => {
            console.error('Unable to start API:', error);
            process.exitCode = 1;
        });
}

export default app;