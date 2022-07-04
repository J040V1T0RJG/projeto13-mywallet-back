import { addDataToWallet, returnWalletData } from "../controllers/walletController.js";
import { Router } from "express";

const router = Router();

router.post('/new-entryorexit', addDataToWallet);
router.get('/wallet', returnWalletData);

export default router;