import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import sequelize from '../Config/db';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare email: string;
	declare email_verified: boolean;
	declare verfication_token: string | null;
	declare verfication_token_expiress: Date | null;
	declare resetPasswordTokenHash: string | null;
	declare resetPasswordTokenExpires: Date | null;
	declare username: string;
	declare adminNo: string;
	declare passwordHash: string;
	declare isAdmin: boolean;
	declare currentSessionId: string | null;
	declare userType:CreationOptional<string>
}

export class PendingLogin extends Model<InferAttributes<PendingLogin>, InferCreationAttributes<PendingLogin>> {
	declare id: string;
	declare userId: number;
	declare activeSessionId: string;
	declare requestedSessionId: string;
	declare status: 'pending' | 'approved' | 'denied' | 'expired';
	declare expiresAt: Date;
}

User.init(
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING(100), allowNull: false },
		email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
		email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		verfication_token: { type: DataTypes.TEXT, allowNull: true, unique: true },
		verfication_token_expiress: { type: DataTypes.DATE, allowNull: true },
		resetPasswordTokenHash: { type: DataTypes.STRING(64), allowNull: true, unique: true },
		resetPasswordTokenExpires: { type: DataTypes.DATE, allowNull: true },
		username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
		adminNo: { type: DataTypes.STRING(4), allowNull: false, unique: true },
		passwordHash: { type: DataTypes.STRING(255), allowNull: false },
		isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		currentSessionId: { type: DataTypes.STRING(64), allowNull: true },
		userType:{type:DataTypes.STRING}
	},
	{ sequelize, tableName: 'users', underscored: true, timestamps: true },
);

PendingLogin.init(
	{
		id: { type: DataTypes.UUID, primaryKey: true },
		userId: { type: DataTypes.INTEGER, allowNull: false },
		activeSessionId: { type: DataTypes.STRING(64), allowNull: false },
		requestedSessionId: { type: DataTypes.STRING(64), allowNull: false },
		status: {
			type: DataTypes.ENUM('pending', 'approved', 'denied', 'expired'),
			allowNull: false,
			defaultValue: 'pending',
		},
		expiresAt: { type: DataTypes.DATE, allowNull: false },
	},
	{ sequelize, tableName: 'pending_logins', underscored: true, timestamps: true },
);
