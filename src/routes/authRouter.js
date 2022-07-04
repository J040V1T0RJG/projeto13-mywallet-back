import { loginUser, createUser } from "../controllers/authController.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post('/login', loginUser);
authRouter.post('/sign-up', createUser);

export default authRouter;