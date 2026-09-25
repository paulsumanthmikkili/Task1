import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import sequelize from '../Config/db';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare email: string;
	declare email_verified: boolean;
	declare verfication_token: string | null;
	declare verfication_token_expiress: Date | null;
	declare username: string;
	declare adminNo: string;
	declare passwordHash: string;
	declare isAdmin: boolean;
}

User.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING(100), allowNull: false },
		email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
		email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		verfication_token: { type: DataTypes.TEXT, allowNull: true, unique: true },
		verfication_token_expiress: { type: DataTypes.DATE, allowNull: true },
		username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
		adminNo: { type: DataTypes.STRING(4), allowNull: false, unique: true },
		passwordHash: { type: DataTypes.STRING(255), allowNull: false },
		isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
	},
	{ sequelize, tableName: 'users', underscored: true, timestamps: true },
);
