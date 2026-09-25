import { Router } from 'express';
import { authenticate } from '../Authentication/Auth';
import { dashboardController, loginController, registerController, verifyEmail } from '../Controller/Controller';
import { loginValidation } from '../Validation/loginValidation';
import { registerValidation } from '../Validation/registerValidation';

const router = Router();

router.post('/register', registerValidation, registerController);
router.post('/login', loginValidation, loginController);
router.get('/verify-email', verifyEmail);
router.get('/dashboard', authenticate, dashboardController);

export default router;