const express= require("express");
const {Router}= express;
const authController = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.post("/register",authController.register);

authRouter.post("/login",authController.login)

authRouter.get("/get-me",authController.getme);

authRouter.get("/refresh-token",authController.refreshToken)

authRouter.get("/logout",authController.logout);

authRouter.get("/logout-all",authController.logoutAll)

authRouter.get("/verify-email",authController.verifyEmail);
module.exports = authRouter;
