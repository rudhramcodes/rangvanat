import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  updateCustomerProfile,
} from './customer.controller.js';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', getCustomerMe);
router.put('/profile', updateCustomerProfile);

export default router;
