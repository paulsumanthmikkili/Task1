import { Op } from 'sequelize';
import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../Models/Model';

const normalizeEmailInput = (value: string): string => {
    return value.trim().toLowerCase().replace(/(\.com)+$/i, '.com');
};

const handleValidationErrors: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(403).json({ status:"failed",success: false, errors: errors.array().map((val)=>{
            return {msg:val.msg}
        }) });
        return;
    }
    next();
};

export const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ max: 100 })
        .withMessage('Name must be 100 characters or fewer.'),
    body('email')
        .trim()
        .customSanitizer((value) => normalizeEmailInput(value))
        .isEmail()
        .withMessage('A valid email is required.')
        .custom(async (email) => {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email is already registered.');
            }
            return true;
        }),
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters.')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Username may contain letters, numbers.')
        .custom(async (username) => {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                throw new Error('Username is already registered.');
            }
            return true;
        }),
    body('password')
        .isString()
        .withMessage('Password is required.')
        .isLength({ min: 8, max: 20 })
        .withMessage('Password must be between 8 and 20 characters.')
        .matches(/[a-z]/)
        .withMessage('Password must include a lowercase letter.')
        .matches(/[A-Z]/)
        .withMessage('Password must include an uppercase letter.')
        .matches(/\d/)
        .withMessage('Password must include a digit.')
        .matches(/[^A-Za-z\d]/)
        .withMessage('Password must include a special character.'),
    handleValidationErrors,
];
