import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(403).json({ status:"failed", success: false, errors: errors.array().map((val)=>{
            return {msg:val.msg}
        })  });
        return;
    }
    next();
};

export const loginValidation = [
    body().custom((requestBody: Record<string, unknown>) => {
        const identifier = requestBody.identifier ?? requestBody.email ?? requestBody.username ?? requestBody.userId;
        if ((typeof identifier !== 'string' && typeof identifier !== 'number') || !String(identifier).trim()) {
            throw new Error('Provide identifier, email, username, or userId.');
        }
        return true;
    }),
    body('password')
        .isString()
        .withMessage('Password is required.')
        .notEmpty()
        .withMessage('Password is required.'),
    handleValidationErrors,
];