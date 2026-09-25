import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseOptions = {
    dialect: 'postgres' as const,
    host: process.env.DB_HOST ?? process.env.db_host ?? 'localhost',
    port: Number(process.env.DB_PORT ?? process.env.db_port ?? 5432),
    username: process.env.DB_USER ?? process.env.db_user,
    password: process.env.DB_PASSWORD ?? process.env.db_password,
    database: process.env.DB_NAME ?? process.env.db_database,
    logging: false,
};

const sequelize = process.env.DATABASE_URL? new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false }): new Sequelize(databaseOptions);

export default sequelize;