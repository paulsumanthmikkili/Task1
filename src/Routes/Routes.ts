import { Router } from 'express';
import { authenticate } from '../Authentication/Auth';
import {
	changePasswordController,
	dashboardController,
	forgotPasswordController,
	loginController,
	registerController,
	resetPasswordController,
	updateUserDetailsController,
	verifyEmail,
	getData,
	getuserwithid,
} from '../Controller/Controller';
import { loginValidation } from '../Validation/loginValidation';
import { registerValidation } from '../Validation/registerValidation';


const router = Router();

router.post('/register', registerValidation, registerController);
router.post('/login', loginValidation, loginController);
router.get('/dashboard', authenticate, dashboardController);
router.get('/alldata',getData)
router.get('/userdata/:id',getuserwithid)
router.post('/change-password', authenticate, changePasswordController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.put('/profile', authenticate, updateUserDetailsController);
router.get('/verify-email', verifyEmail);


export default router;