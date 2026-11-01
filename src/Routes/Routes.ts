import { Router } from 'express';
import { authenticate } from '../Authentication/Auth';
import {
	changePasswordController,
	dashboardController,
	forgotPasswordController,
	loginController,
	loginDecisionController,
	loginStatusController,
	registerController,
	resetPasswordController,
	updateUserDetailsController,
	verifyEmail,
	getData,
	getuserwithid,
} from '../Controller/Controller';
import { loginValidation } from '../Validation/loginValidation';
import { registerValidation } from '../Validation/registerValidation';
import { micro } from '../microServices/micro';
import { MicroserviceRegisterController } from '../Controller/Controller';

const router = Router();

router.post('/register', registerValidation, registerController);
router.post('/login', loginValidation, loginController);
router.post('/login/decision', authenticate, loginDecisionController);
router.get('/login/status/:requestId', loginStatusController);
router.get('/dashboard', authenticate, dashboardController);
router.get('/alldata',getData)
router.get('/userdata/:id',getuserwithid)
router.post('/change-password', authenticate, changePasswordController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.put('/profile', authenticate, updateUserDetailsController);
router.get('/verify-email', verifyEmail);
router.post('/micro',micro)
router.get('/MicroserviceRegisterController',MicroserviceRegisterController);


export default router;