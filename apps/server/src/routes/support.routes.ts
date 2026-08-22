import { Router } from 'express';
import { handleContactSupport } from '../modules/support/support.controller.js';

const router = Router();

router.post('/contact', handleContactSupport);

export default router;
